import { describe, expect, it, beforeEach, vi } from 'vitest'
import {
  buildExplainCacheKey,
  clearExplainCache,
  fetchExplanation,
  templateExplain,
  type ExplainRequest,
} from '../../src/engine/adaptive/explanations'

function req(acc: number): ExplainRequest {
  return {
    prompt: '5 + 3',
    studentAnswer: '7',
    correctAnswer: '8',
    objectiveCode: '2Ni.04',
    recentAccuracyPct: acc,
    ageBand: 'Year 2 (age 6-7)',
    cacheKey: buildExplainCacheKey({
      prompt: '5 + 3',
      studentAnswer: '7',
      correctAnswer: '8',
      objectiveCode: '2Ni.04',
      recentAccuracyPct: acc,
      ageBand: 'Year 2 (age 6-7)',
    }),
  }
}

describe('templateExplain', () => {
  it('uses a different tone for high vs low accuracy', () => {
    const low = templateExplain(req(20))
    const high = templateExplain(req(90))
    expect(low.text).not.toBe(high.text)
    expect(low.source).toBe('template')
  })
})

describe('buildExplainCacheKey', () => {
  it('is stable for identical inputs', () => {
    const k1 = buildExplainCacheKey({ prompt: 'a', studentAnswer: 'b', correctAnswer: 'c', objectiveCode: 'x', recentAccuracyPct: 50, ageBand: 'y' })
    const k2 = buildExplainCacheKey({ prompt: 'a', studentAnswer: 'b', correctAnswer: 'c', objectiveCode: 'x', recentAccuracyPct: 50, ageBand: 'y' })
    expect(k1).toBe(k2)
  })
  it('changes with the answer', () => {
    const k1 = buildExplainCacheKey({ prompt: 'a', studentAnswer: 'b', correctAnswer: 'c', objectiveCode: 'x', recentAccuracyPct: 50, ageBand: 'y' })
    const k2 = buildExplainCacheKey({ prompt: 'a', studentAnswer: 'X', correctAnswer: 'c', objectiveCode: 'x', recentAccuracyPct: 50, ageBand: 'y' })
    expect(k1).not.toBe(k2)
  })
})

describe('fetchExplanation', () => {
  beforeEach(() => clearExplainCache())

  it('returns a template when the route is unreachable', async () => {
    const fetcher = vi.fn(async () => {
      throw new Error('offline')
    })
    const out = await fetchExplanation(
      {
        prompt: '5 + 3',
        studentAnswer: '7',
        correctAnswer: '8',
        objectiveCode: '2Ni.04',
        recentAccuracyPct: 50,
        ageBand: 'Year 2',
      },
      { fetcher, timeoutMs: 100 },
    )
    expect(out.source).toBe('template')
    expect(out.text.length).toBeGreaterThan(0)
  })

  it('returns a template when the server returns junk', async () => {
    const fetcher = vi.fn(async () =>
      new Response(JSON.stringify({ text: '' }), { status: 200 }),
    ) as unknown as typeof fetch
    const out = await fetchExplanation(
      {
        prompt: '5 + 3',
        studentAnswer: '7',
        correctAnswer: '8',
        objectiveCode: '2Ni.04',
        recentAccuracyPct: 50,
        ageBand: 'Year 2',
      },
      { fetcher },
    )
    expect(out.source).toBe('template')
  })

  it('caps server text length', async () => {
    const long = 'x'.repeat(10_000)
    const fetcher = vi.fn(async () =>
      new Response(JSON.stringify({ text: long, source: 'llm' }), { status: 200 }),
    ) as unknown as typeof fetch
    const out = await fetchExplanation(
      {
        prompt: '5 + 3',
        studentAnswer: '7',
        correctAnswer: '8',
        objectiveCode: '2Ni.04',
        recentAccuracyPct: 50,
        ageBand: 'Year 2',
      },
      { fetcher },
    )
    expect(out.text.length).toBeLessThanOrEqual(240)
  })

  it('caches identical explanations', async () => {
    const fetcher = vi.fn(async () =>
      new Response(JSON.stringify({ text: 'cached text', source: 'llm' }), { status: 200 }),
    ) as unknown as typeof fetch
    const args = {
      prompt: 'p',
      studentAnswer: 'a',
      correctAnswer: 'c',
      objectiveCode: 'o',
      recentAccuracyPct: 50,
      ageBand: 'y',
    }
    const a = await fetchExplanation(args, { fetcher })
    const b = await fetchExplanation(args, { fetcher })
    expect(a.text).toBe(b.text)
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
})
