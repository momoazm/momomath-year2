/** Regression tests for the serverless LLM routes. These files are NOT covered
 *  by `tsc -b` (tsconfig only includes src + tests) and previously shipped
 *  syntactically broken — so they get their own suite with mocked Vercel
 *  req/res and a stubbed fetch. Module-level cooldown/cache maps persist
 *  per file: tests use distinct providers/cache keys to stay independent. */

import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import explainHandler from '../api/year2/explain'
import reviewHandler from '../api/year2/review'

function makeRes() {
  const res: {
    code: number
    body: unknown
    status: (c: number) => unknown
    json: (o: unknown) => unknown
    setHeader: () => void
  } = {
    code: 0,
    body: undefined,
    status: (c: number) => {
      res.code = c
      return res
    },
    json: (o: unknown) => {
      res.body = o
      return res
    },
    setHeader: () => {},
  }
  return res
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const req = (body: unknown, method = 'POST', headers: Record<string, string> = {}): any => ({
  method,
  headers,
  body,
})

function okChat(content: string) {
  return { ok: true, json: async () => ({ choices: [{ message: { content } }] }) }
}

const savedEnv: Record<string, string | undefined> = {}

function setKeys(keys: Record<string, string>) {
  for (const k of [
    'GROQ_API_KEY',
    'GEMINI_API_KEY',
    'CEREBRAS_API_KEY',
    'OPENROUTER_API_KEY',
    'MISTRAL_API_KEY',
    'ZEN_API_KEY',
    'GITHUB_TOKEN',
    'OPENAI_API_KEY',
  ]) {
    if (!(k in savedEnv)) savedEnv[k] = process.env[k]
    delete process.env[k]
  }
  Object.assign(process.env, keys)
}

beforeEach(() => vi.unstubAllGlobals())

afterEach(() => {
  vi.unstubAllGlobals()
  for (const [k, v] of Object.entries(savedEnv)) {
    if (v === undefined) delete process.env[k]
    else process.env[k] = v
  }
})

describe('POST /api/year2/explain', () => {
  it('rejects non-POST', async () => {
    const res = makeRes()
    await explainHandler(req({}, 'GET'), res as never)
    expect(res.code).toBe(405)
  })

  it('requires prompt + correctAnswer (PII firewall stays strict)', async () => {
    setKeys({})
    const res = makeRes()
    await explainHandler(req({ prompt: '', correctAnswer: '' }), res as never)
    expect(res.code).toBe(400)
  })

  it('rejects unknown BYOK providers and short keys without calling any model', async () => {
    setKeys({})
    const fetchMock = vi.fn(async () => okChat('hi'))
    vi.stubGlobal('fetch', fetchMock)
    const badProvider = makeRes()
    await explainHandler(
      req({ prompt: '2+3', correctAnswer: '5' }, 'POST', {
        'x-ai-provider': 'nope',
        'x-ai-key': 'k'.repeat(20),
      }),
      badProvider as never,
    )
    expect(badProvider.code).toBe(400)
    const shortKey = makeRes()
    await explainHandler(
      req({ prompt: '2+3', correctAnswer: '5' }, 'POST', {
        'x-ai-provider': 'groq',
        'x-ai-key': 'short',
      }),
      shortKey as never,
    )
    expect(shortKey.code).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns a deterministic template when no keys exist (kid never sees an error)', async () => {
    setKeys({})
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('must not be called')
      }),
    )
    const res = makeRes()
    await explainHandler(
      req({
        prompt: '2+3',
        studentAnswer: '4',
        correctAnswer: '5',
        objectiveCode: '2Ad.01',
        recentAccuracyPct: 20,
        cacheKey: 'api-test-template-1',
      }),
      res as never,
    )
    expect(res.code).toBe(200)
    const body = res.body as { text: string; source: string }
    expect(body.source).toBe('template')
    expect(body.text.length).toBeGreaterThan(0)
  })

  it('serves LLM text, caps length, and caches per cacheKey', async () => {
    setKeys({ GEMINI_API_KEY: 'test-key' })
    const fetchMock = vi.fn(async () => okChat('x'.repeat(5000)))
    vi.stubGlobal('fetch', fetchMock)
    const payload = {
      prompt: '2+3',
      studentAnswer: '4',
      correctAnswer: '5',
      objectiveCode: '2Ad.01',
      recentAccuracyPct: 70,
      cacheKey: 'api-test-llm-cache-1',
    }
    const first = makeRes()
    await explainHandler(req(payload), first as never)
    const firstBody = first.body as { text: string; source: string; provider: string }
    expect(firstBody.source).toBe('llm')
    expect(firstBody.provider).toBe('gemini/gemini-2.0-flash')
    expect(firstBody.text.length).toBeLessThanOrEqual(240)

    const second = makeRes()
    await explainHandler(req(payload), second as never)
    expect((second.body as { text: string }).text).toBe(firstBody.text)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('honours a valid parent BYOK key first', async () => {
    setKeys({})
    const fetchMock = vi.fn(async () => okChat('Try once more, slowly.'))
    vi.stubGlobal('fetch', fetchMock)
    const res = makeRes()
    await explainHandler(
      req({ prompt: '2+3', correctAnswer: '5', cacheKey: 'api-test-byok-1' }, 'POST', {
        'x-ai-provider': 'gemini',
        'x-ai-key': 'parent-key'.padEnd(20, 'x'),
      }),
      res as never,
    )
    const body = res.body as { source: string; provider: string }
    expect(body.source).toBe('llm')
    expect(body.provider).toBe('byok/gemini')
  })

  it('cools down a 500ing provider and tries the next one', async () => {
    setKeys({ GROQ_API_KEY: 'k1', CEREBRAS_API_KEY: 'k2' })
    const fetchMock = vi.fn(async (url: string) => {
      if (String(url).includes('groq')) return { ok: false, status: 500 }
      return okChat('Cerebras to the rescue.')
    })
    vi.stubGlobal('fetch', fetchMock)
    const res = makeRes()
    await explainHandler(
      req({ prompt: '2+3', correctAnswer: '5', cacheKey: 'api-test-failover-1' }),
      res as never,
    )
    const body = res.body as { source: string; provider: string; text: string }
    expect(body.source).toBe('llm')
    expect(body.provider).toBe('cerebras/gpt-oss-120b')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})

describe('POST /api/year2/review', () => {
  const goodStats = {
    attempted: 20,
    accuracyPct: 65,
    avgSeconds: 25,
    streakDays: 3,
    weakSkills: [{ code: '2Md.01', masteryPct: 30 }],
    strongSkills: [{ code: '2Ni.04', masteryPct: 90 }],
  }
  const goodReview = {
    summary: 'Solid progress.',
    strengths: ['2Ni.04'],
    focus: [{ area: '2Md.01', action: 'Replay one short lesson.' }],
    nextStep: 'Practice 2Md.01 today.',
    motivation: 'Keep going!',
  }

  it('rejects non-POST and missing stats', async () => {
    const get = makeRes()
    await reviewHandler(req({}, 'GET'), get as never)
    expect(get.code).toBe(405)
    const bad = makeRes()
    await reviewHandler(req({}), bad as never)
    expect(bad.code).toBe(400)
  })

  it('502s when no keys are configured', async () => {
    setKeys({})
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('must not be called')
      }),
    )
    const res = makeRes()
    await reviewHandler(req({ stats: goodStats }), res as never)
    expect(res.code).toBe(502)
    expect((res.body as { ok: boolean }).ok).toBe(false)
  })

  it('returns the coerced strict-JSON review and caches it', async () => {
    setKeys({ GEMINI_API_KEY: 'test-key' })
    const fetchMock = vi.fn(async () => okChat(JSON.stringify(goodReview)))
    vi.stubGlobal('fetch', fetchMock)
    const first = makeRes()
    await reviewHandler(req({ stats: goodStats }), first as never)
    expect(first.code).toBe(200)
    const body = first.body as {
      ok: boolean
      review: { summary: string }
      provider: string
    }
    expect(body.ok).toBe(true)
    expect(body.review.summary).toBe('Solid progress.')
    expect(body.provider).toBe('gemini/gemini-2.0-flash')

    const second = makeRes()
    await reviewHandler(req({ stats: goodStats }), second as never)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('skips unusable model JSON and tries the next provider', async () => {
    setKeys({ GEMINI_API_KEY: 'k1', GROQ_API_KEY: 'k2' })
    const fetchMock = vi.fn(async (url: string) => {
      if (String(url).includes('generativelanguage')) return okChat('not json at all')
      return okChat(JSON.stringify(goodReview))
    })
    vi.stubGlobal('fetch', fetchMock)
    const res = makeRes()
    await reviewHandler(
      req({
        stats: {
          ...goodStats,
          weakSkills: [{ code: '2Sh.03', masteryPct: 10 }],
        },
      }),
      res as never,
    )
    const body = res.body as { ok: boolean; provider: string }
    expect(body.ok).toBe(true)
    expect(body.provider).toBe('groq/gpt-oss-120b')
  })
})
