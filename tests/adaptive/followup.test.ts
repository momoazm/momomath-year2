import { afterEach, describe, expect, it } from 'vitest'
import {
  buildFollowupCacheKey,
  clearFollowupCache,
  fetchFollowup,
  parseLlmMcq,
  siblingFollowup,
} from '../../src/engine/adaptive/followup'
import { buildCatalog } from '../../src/engine/adaptive/catalog'
import { questionPrompt } from '../../src/engine/adaptive/questions'
import type { FollowupRequest } from '../../src/engine/adaptive/followup'

const entry = buildCatalog('math')[0]!
const base: Omit<FollowupRequest, 'cacheKey'> = {
  prompt: 'What is 7 + 5?',
  studentAnswer: '11',
  correctAnswer: '12',
  objectiveCode: entry.code,
  lessonId: entry.lessonId,
}

afterEach(() => {
  clearFollowupCache()
})

describe('parseLlmMcq', () => {
  it('accepts a plain MCQ payload', () => {
    const q = parseLlmMcq({ prompt: 'Which is 6?', choices: ['5', '6', '7'], answerIndex: 1 })
    expect(q).not.toBeNull()
    expect(q!.kind).toBe('mcq')
    expect(q!.choices[q!.answerIndex]).toBe('6')
  })

  it('extracts JSON out of a fenced model reply', () => {
    const raw = 'Sure!\n```json\n{"prompt":"2+2?","choices":["3","4"],"answer":1}\n```'
    const q = parseLlmMcq(raw)
    expect(q).not.toBeNull()
    expect(q!.answerIndex).toBe(1)
  })

  it('rejects duplicate choices, bad indices, and missing prompts', () => {
    expect(parseLlmMcq({ prompt: 'x', choices: ['a', 'a'], answerIndex: 0 })).toBeNull()
    expect(parseLlmMcq({ prompt: 'x', choices: ['a', 'b'], answerIndex: 5 })).toBeNull()
    expect(parseLlmMcq({ prompt: '', choices: ['a', 'b'], answerIndex: 0 })).toBeNull()
    expect(parseLlmMcq({ choices: ['a', 'b'], answerIndex: 0 })).toBeNull()
    expect(parseLlmMcq('not json at all')).toBeNull()
  })
})

describe('siblingFollowup (offline generator, PLAN 135)', () => {
  it('returns a DIFFERENT question from the same lesson', () => {
    const out = siblingFollowup(base)
    expect(out).not.toBeNull()
    expect(out!.source).toBe('sibling')
    expect(questionPrompt(out!.question)).not.toBe(base.prompt)
  })

  it('is deterministic: the same miss always maps to the same sibling', () => {
    const a = siblingFollowup(base)
    const b = siblingFollowup(base)
    expect(a).not.toBeNull()
    expect(questionPrompt(a!.question)).toBe(questionPrompt(b!.question))
  })

  it('returns null for an unknown lesson (curriculum changed)', () => {
    expect(siblingFollowup({ ...base, lessonId: 'no-such-lesson' })).toBeNull()
  })
})

describe('fetchFollowup (network first, sibling fallback)', () => {
  it('falls back to the sibling re-roll when the network is dead', async () => {
    const out = await fetchFollowup(base, {
      route: 'https://example.invalid/api/year2/followup',
      fetcher: async () => {
        throw new Error('offline')
      },
      timeoutMs: 50,
    })
    expect(out).not.toBeNull()
    expect(out!.source).toBe('sibling')
    expect(questionPrompt(out!.question)).not.toBe(base.prompt)
  })

  it('falls back when the route 404s (static hosts have no /api)', async () => {
    const out = await fetchFollowup(base, {
      route: 'https://example.invalid/api/year2/followup',
      fetcher: async () => new Response('not found', { status: 404 }),
      timeoutMs: 50,
    })
    expect(out).not.toBeNull()
    expect(out!.source).toBe('sibling')
  })

  it('uses a valid LLM payload when the server answers', async () => {
    let calls = 0
    const fetcher = async () => {
      calls += 1
      return new Response(
        JSON.stringify({
          question: { prompt: 'Which number is 8?', choices: ['7', '8', '9'], answerIndex: 1 },
          source: 'llm',
          provider: 'test',
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      )
    }
    const out = await fetchFollowup(base, { route: 'https://x.test/f', fetcher, timeoutMs: 50 })
    expect(out!.source).toBe('llm')
    expect(out!.provider).toBe('test')
    expect(out!.question.kind).toBe('mcq')
    // cached: the second identical miss never hits the network again
    const again = await fetchFollowup(base, { route: 'https://x.test/f', fetcher, timeoutMs: 50 })
    expect(again!.source).toBe('llm')
    expect(calls).toBe(1)
  })

  it('discards a junk LLM payload and serves the sibling instead', async () => {
    const out = await fetchFollowup(base, {
      route: 'https://x.test/f',
      fetcher: async () =>
        new Response(JSON.stringify({ question: { choices: ['only-one'] }, source: 'llm' }), {
          status: 200,
        }),
      timeoutMs: 50,
    })
    expect(out).not.toBeNull()
    expect(out!.source).toBe('sibling')
  })

  it('never throws on a broken route (always resolves a question or null)', async () => {
    const out = await fetchFollowup(base, {
      route: '::not a url::',
      fetcher: async () => {
        throw new TypeError('bad url')
      },
      timeoutMs: 10,
    })
    expect(out === null || typeof out.question === 'object').toBe(true)
  })
})

describe('buildFollowupCacheKey', () => {
  it('is stable for the same miss and changes when the answer changes', () => {
    expect(buildFollowupCacheKey(base)).toBe(buildFollowupCacheKey({ ...base }))
    expect(buildFollowupCacheKey(base)).not.toBe(
      buildFollowupCacheKey({ ...base, studentAnswer: '13' }),
    )
  })
})
