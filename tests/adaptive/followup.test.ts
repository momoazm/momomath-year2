/** WS14 — AI follow-up question ("Try a similar one").
 *
 *  Two layers, mirroring explanations: the serverless route (strict MCQ JSON,
 *  BYOK, deterministic sibling fallback) and the client (cache, timeout,
 *  sibling fallback, never throws). The route imports the client's
 *  parseLlmMcq/siblingFollowup, so both layers share one validator. */

import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import followupHandler from '../../api/year2/followup'
import {
  buildFollowupCacheKey,
  clearFollowupCache,
  fetchFollowup,
  parseLlmMcq,
  siblingFollowup,
} from '../../src/engine/adaptive/followup'
import { buildCatalog } from '../../src/engine/adaptive/catalog'
import { getCurriculum } from '../../src/content/registry'

/* ----------------------------- fixtures ----------------------------- */

const mathCat = buildCatalog('math')
const first = mathCat[0]!
const lessonId = first.lessonId
const objectiveCode = first.code

const lesson = getCurriculum('math').allLessons[lessonId]!.lesson
const slot = lesson.objectiveCodes.indexOf(objectiveCode)
const original = lesson.generate(slot + 2, 12345)[slot]!

function partial(overrides: Record<string, string> = {}) {
  return {
    prompt: original.prompt,
    studentAnswer: '3',
    correctAnswer: '4',
    objectiveCode,
    lessonId,
    ...overrides,
  }
}

const validMcq = {
  kind: 'mcq',
  prompt: 'Which number makes 4 + ? = 7?',
  choices: ['3', '5', '2'],
  answerIndex: 0,
}

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

beforeEach(() => {
  vi.unstubAllGlobals()
  clearFollowupCache()
})

afterEach(() => {
  vi.unstubAllGlobals()
  for (const [k, v] of Object.entries(savedEnv)) {
    if (v === undefined) delete process.env[k]
    else process.env[k] = v
  }
})

/* ------------------------------ route ------------------------------- */

describe('POST /api/year2/followup', () => {
  it('followup route rejects non-POST requests', async () => {
    const res = makeRes()
    await followupHandler(req({}, 'GET'), res as never)
    expect(res.code).toBe(405)
  })

  it('followup route requires prompt + lessonId + objectiveCode', async () => {
    setKeys({})
    const missingLesson = makeRes()
    await followupHandler(req({ prompt: '2+3', objectiveCode }), missingLesson as never)
    expect(missingLesson.code).toBe(400)
    const missingPrompt = makeRes()
    await followupHandler(req({ lessonId, objectiveCode }), missingPrompt as never)
    expect(missingPrompt.code).toBe(400)
    const missingSkill = makeRes()
    await followupHandler(req({ prompt: '2+3', lessonId }), missingSkill as never)
    expect(missingSkill.code).toBe(400)
  })

  it('followup route rejects unknown BYOK providers before any model call', async () => {
    setKeys({})
    const fetchMock = vi.fn(async () => okChat('hi'))
    vi.stubGlobal('fetch', fetchMock)
    const badProvider = makeRes()
    await followupHandler(
      req(partial(), 'POST', { 'x-ai-provider': 'nope', 'x-ai-key': 'k'.repeat(20) }),
      badProvider as never,
    )
    expect(badProvider.code).toBe(400)
    const shortKey = makeRes()
    await followupHandler(
      req(partial(), 'POST', { 'x-ai-provider': 'groq', 'x-ai-key': 'short' }),
      shortKey as never,
    )
    expect(shortKey.code).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('followup route answers with a deterministic sibling when no keys exist', async () => {
    setKeys({})
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('must not be called')
      }),
    )
    const firstRun = makeRes()
    await followupHandler(req(partial()), firstRun as never)
    expect(firstRun.code).toBe(200)
    const body = firstRun.body as {
      question?: { kind: string; prompt: string }
      source: string
    }
    expect(body.source).toBe('sibling')
    expect(body.question).toBeTruthy()
    expect(body.question!.kind.length).toBeGreaterThan(0)
    expect(body.question!.prompt.length).toBeGreaterThan(0)
    expect(body.question!.prompt).not.toBe(original.prompt)

    const secondRun = makeRes()
    await followupHandler(req(partial()), secondRun as never)
    expect(secondRun.body).toEqual(firstRun.body)
  })

  it('followup route serves strict MCQ JSON and caches it per cacheKey', async () => {
    setKeys({ GEMINI_API_KEY: 'test-key' })
    const fetchMock = vi.fn(async () =>
      okChat('```json\n' + JSON.stringify(validMcq) + '\n```'),
    )
    vi.stubGlobal('fetch', fetchMock)
    const payload = { ...partial(), cacheKey: 'api-test-followup-llm-1' }
    const firstRun = makeRes()
    await followupHandler(req(payload), firstRun as never)
    const body = firstRun.body as {
      question: { kind: string; prompt: string; choices: string[]; answerIndex: number }
      source: string
      provider: string
    }
    expect(firstRun.code).toBe(200)
    expect(body.source).toBe('llm')
    expect(body.provider).toBe('gemini/gemini-2.0-flash')
    expect(body.question).toEqual(validMcq)

    const secondRun = makeRes()
    await followupHandler(req(payload), secondRun as never)
    expect(secondRun.body).toEqual(firstRun.body)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('followup route honours a valid parent BYOK key first', async () => {
    setKeys({})
    const fetchMock = vi.fn(async () => okChat(JSON.stringify(validMcq)))
    vi.stubGlobal('fetch', fetchMock)
    const res = makeRes()
    await followupHandler(
      req(partial(), 'POST', {
        'x-ai-provider': 'gemini',
        'x-ai-key': 'parent-key'.padEnd(20, 'x'),
      }),
      res as never,
    )
    const body = res.body as { source: string; provider: string }
    expect(body.source).toBe('llm')
    expect(body.provider).toBe('byok/gemini')
  })

  it('followup route skips malformed model JSON and answers from the sibling', async () => {
    setKeys({ GROQ_API_KEY: 'k1' })
    const fetchMock = vi.fn(async () => okChat('not json at all'))
    vi.stubGlobal('fetch', fetchMock)
    const res = makeRes()
    await followupHandler(req({ ...partial(), cacheKey: 'api-test-followup-junk-1' }), res as never)
    const body = res.body as { question?: { prompt: string }; source: string }
    expect(res.code).toBe(200)
    expect(body.source).toBe('sibling')
    expect(body.question?.prompt).not.toBe(original.prompt)
  })

  it('followup route reports none only when the lesson no longer exists', async () => {
    setKeys({})
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('must not be called')
      }),
    )
    const res = makeRes()
    await followupHandler(
      req(partial({ lessonId: 'u0-does-not-exist' })),
      res as never,
    )
    expect(res.code).toBe(200)
    expect(res.body).toEqual({ source: 'none' })
  })
})

/* --------------------------- client layer --------------------------- */

describe('parseLlmMcq', () => {
  it('followup parser accepts fenced and prose-wrapped JSON', () => {
    const fenced = parseLlmMcq('```json\n' + JSON.stringify(validMcq) + '\n```')
    expect(fenced).toEqual(validMcq)
    const prose = parseLlmMcq('Sure! Here you go: ' + JSON.stringify(validMcq) + ' Good luck!')
    expect(prose).toEqual(validMcq)
  })

  it('followup parser resolves an answer given as choice text', () => {
    const q = parseLlmMcq({ prompt: 'Pick', choices: ['aa', 'bb'], answer: 'bb' })
    expect(q).toEqual({ kind: 'mcq', prompt: 'Pick', choices: ['aa', 'bb'], answerIndex: 1 })
  })

  it('followup parser enforces caps and rejects malformed shapes', () => {
    expect(parseLlmMcq('not json')).toBeNull()
    expect(parseLlmMcq(null)).toBeNull()
    expect(parseLlmMcq({ prompt: '', choices: ['a', 'b'], answerIndex: 0 })).toBeNull()
    expect(
      parseLlmMcq({ prompt: 'p', choices: ['a', 'b', 'c', 'd', 'e'], answerIndex: 0 }),
    ).toBeNull()
    expect(parseLlmMcq({ prompt: 'p', choices: ['a'], answerIndex: 0 })).toBeNull()
    expect(parseLlmMcq({ prompt: 'p', choices: ['a', 'a'], answerIndex: 0 })).toBeNull()
    expect(parseLlmMcq({ prompt: 'p', choices: ['a', 'b'], answerIndex: 5 })).toBeNull()
    expect(parseLlmMcq({ prompt: 'p', choices: ['a', 'b'], answerIndex: 1.5 })).toBeNull()
    expect(parseLlmMcq({ prompt: 'x'.repeat(400), choices: ['a', 'b'], answerIndex: 0 })!.prompt.length).toBe(300)
  })
})

describe('siblingFollowup', () => {
  it('followup sibling re-roll is deterministic and skips the original question', () => {
    const a = siblingFollowup(partial())
    const b = siblingFollowup(partial())
    expect(a).not.toBeNull()
    expect(a).toEqual(b)
    expect(a!.source).toBe('sibling')
    expect(a!.question.prompt).not.toBe(original.prompt)
  })

  it('followup sibling re-roll returns null for an unknown lesson', () => {
    expect(siblingFollowup(partial({ lessonId: 'nope-not-real' }))).toBeNull()
  })
})

describe('fetchFollowup', () => {
  it('followup client caches an LLM question per cache key', async () => {
    const fetcher = vi.fn(async () =>
      new Response(JSON.stringify({ question: validMcq, source: 'llm', provider: 'test/gemini' }), {
        status: 200,
      }),
    ) as unknown as typeof fetch
    const a = await fetchFollowup(partial(), { fetcher })
    const b = await fetchFollowup(partial(), { fetcher })
    expect(a!.source).toBe('llm')
    expect(a!.question).toEqual(validMcq)
    expect(b).toEqual(a)
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('followup client answers from the sibling when the route 404s (static hosts)', async () => {
    const fetcher = vi.fn(async () => new Response('not found', { status: 404 })) as unknown as typeof fetch
    const out = await fetchFollowup(partial(), { fetcher })
    expect(out).not.toBeNull()
    expect(out!.source).toBe('sibling')
    expect(out!.question.prompt).not.toBe(original.prompt)
    // fallback is cached too — one network attempt per mistake
    await fetchFollowup(partial(), { fetcher })
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('followup client never throws when the fetcher rejects', async () => {
    const fetcher = vi.fn(async () => {
      throw new Error('offline')
    }) as unknown as typeof fetch
    const out = await fetchFollowup(partial(), { fetcher })
    expect(out).not.toBeNull()
    expect(out!.source).toBe('sibling')
  })

  it('followup client rejects malformed LLM payloads and answers locally', async () => {
    const fetcher = vi.fn(async () =>
      new Response(JSON.stringify({ question: { prompt: 'x' }, source: 'llm' }), { status: 200 }),
    ) as unknown as typeof fetch
    const out = await fetchFollowup(partial(), { fetcher })
    expect(out).not.toBeNull()
    expect(out!.source).toBe('sibling')
  })

  it('followup client times out a hanging route and answers from the sibling', async () => {
    const hanging = ((_input: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(new DOMException('aborted', 'AbortError'))
        })
      })) as typeof fetch
    const started = Date.now()
    const out = await fetchFollowup(partial(), { fetcher: hanging, timeoutMs: 25 })
    expect(Date.now() - started).toBeLessThan(2000)
    expect(out).not.toBeNull()
    expect(out!.source).toBe('sibling')
  })

  it('followup client resolves null when no lesson produces any question', async () => {
    const fetcher = vi.fn(async () => new Response('not found', { status: 404 })) as unknown as typeof fetch
    const out = await fetchFollowup(partial({ lessonId: 'nope-not-real' }), { fetcher })
    expect(out).toBeNull()
  })
})

describe('buildFollowupCacheKey', () => {
  it('followup cache key is stable for identical inputs', () => {
    expect(buildFollowupCacheKey(partial())).toBe(buildFollowupCacheKey(partial()))
  })
  it('followup cache key changes with the student answer', () => {
    expect(buildFollowupCacheKey(partial())).not.toBe(
      buildFollowupCacheKey(partial({ studentAnswer: '9' })),
    )
  })
})
