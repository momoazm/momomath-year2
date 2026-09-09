import { describe, expect, it, beforeEach, vi } from 'vitest'
import {
  buildReviewCacheKey,
  clearReviewCache,
  fetchReview,
  templateReview,
  type ReviewStats,
} from '../../src/engine/adaptive/review'

function stats(): ReviewStats {
  return {
    attempted: 20,
    accuracyPct: 65,
    avgSeconds: 25,
    streakDays: 3,
    weakSkills: [{ code: '2Md.01', masteryPct: 30 }],
    strongSkills: [{ code: '2Ni.04', masteryPct: 90 }],
  }
}

describe('templateReview', () => {
  it('grounds focus in the weakest skills, never invents any', () => {
    const out = templateReview(stats())
    expect(out.source).toBe('template')
    expect(out.review.focus[0].area).toBe('2Md.01')
    expect(out.review.summary).toContain('20')
  })

  it('handles the no-data case', () => {
    const out = templateReview({
      attempted: 0,
      accuracyPct: null,
      avgSeconds: null,
      streakDays: 0,
      weakSkills: [],
      strongSkills: [],
    })
    expect(out.review.summary).toContain('No practice')
  })
})

describe('buildReviewCacheKey', () => {
  it('is stable for identical stats and differs when they change', () => {
    expect(buildReviewCacheKey(stats())).toBe(buildReviewCacheKey(stats()))
    expect(buildReviewCacheKey(stats())).not.toBe(
      buildReviewCacheKey({ ...stats(), attempted: 21 }),
    )
  })
})

describe('fetchReview', () => {
  beforeEach(() => clearReviewCache())

  it('returns the LLM review and caches it', async () => {
    const review = {
      summary: 'Solid progress.',
      strengths: ['2Ni.04'],
      focus: [{ area: '2Md.01', action: 'Replay one short lesson.' }],
      nextStep: 'Practice 2Md.01 today.',
      motivation: 'Keep going!',
    }
    const fetcher = vi.fn(async () =>
      new Response(JSON.stringify({ ok: true, review, provider: 'gemini/x' }), {
        status: 200,
      }),
    ) as unknown as typeof fetch
    const a = await fetchReview(stats(), { fetcher })
    const b = await fetchReview(stats(), { fetcher })
    expect(a.source).toBe('llm')
    expect(a.review.summary).toBe('Solid progress.')
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(b.review).toEqual(a.review)
  })

  it('falls back to a labelled template when the server is down', async () => {
    const fetcher = vi.fn(async () => new Response('boom', { status: 502 }))
    const out = await fetchReview(stats(), {
      fetcher: fetcher as unknown as typeof fetch,
    })
    expect(out.source).toBe('template')
    expect(out.review.focus[0].area).toBe('2Md.01')
  })

  it('throws on 401 so the grown-up fixes their key', async () => {
    const fetcher = vi.fn(
      async () =>
        new Response(JSON.stringify({ ok: false, error: 'bad key' }), { status: 401 }),
    ) as unknown as typeof fetch
    await expect(fetchReview(stats(), { fetcher })).rejects.toThrow('bad key')
  })

  it('caps review server text length', async () => {
    const review = {
      summary: 'x'.repeat(5000),
      strengths: [],
      focus: [{ area: '2Md.01', action: 'y'.repeat(5000) }],
      nextStep: 'z'.repeat(5000),
      motivation: '',
    }
    const fetcher = vi.fn(async () =>
      new Response(JSON.stringify({ ok: true, review }), { status: 200 }),
    ) as unknown as typeof fetch
    const out = await fetchReview(stats(), { fetcher })
    expect(out.review.summary.length).toBeLessThanOrEqual(400)
    expect(out.review.nextStep.length).toBeLessThanOrEqual(200)
  })
})
