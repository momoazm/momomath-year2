import { ADAPTIVE_CONFIG } from './config'

/** Explanation request — what we ship to /api/year2/explain. The shape is
 *  deliberately small so we never accidentally leak PII. */
export interface ExplainRequest {
  prompt: string
  studentAnswer: string
  correctAnswer: string
  objectiveCode: string
  recentAccuracyPct: number
  ageBand: string
  /** A cache key derived locally — server doesn't trust it, but it lets us
   *  short-circuit without making a request. */
  cacheKey: string
}

export interface ExplainResponse {
  text: string
  source: 'llm' | 'template'
  provider?: string
}

export interface ExplainClientOptions {
  /** Override the route (for tests). */
  route?: string
  /** Inject a fetcher (for tests). */
  fetcher?: typeof fetch
  /** Per-request timeout. */
  timeoutMs?: number
}

const cache = new Map<string, ExplainResponse>()

function getCached(key: string): ExplainResponse | undefined {
  return cache.get(key)
}

function setCached(key: string, value: ExplainResponse) {
  if (cache.size >= ADAPTIVE_CONFIG.EXPLAIN_CACHE_SIZE) {
    const first = cache.keys().next().value
    if (first !== undefined) cache.delete(first)
  }
  cache.set(key, value)
}

/** Deterministic, age-appropriate fallback used when the network call fails
 *  or returns junk. We prefer a kind hint based on the request. */
export function templateExplain(req: ExplainRequest): ExplainResponse {
  const acc = req.recentAccuracyPct
  let text: string
  if (acc < 50) {
    text = 'That one was tricky — read it once more and try again. You can do it!'
  } else if (acc < 80) {
    text = 'Almost! Have a look at the question again and try once more.'
  } else {
    text = 'Great work! Just a small slip — try it again.'
  }
  return { text, source: 'template' }
}

/** Hash a small object into a short string. We don't need cryptographic strength —
 *  just something stable to dedupe identical mistakes. */
function shortHash(s: string): string {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i)
  return (h >>> 0).toString(36)
}

/** Build a cache key the client can use; the server ignores it. */
export function buildExplainCacheKey(req: Omit<ExplainRequest, 'cacheKey'>): string {
  return shortHash(
    `${req.objectiveCode}|${req.prompt}|${req.studentAnswer}|${req.correctAnswer}|${req.recentAccuracyPct}`,
  )
}

/** Fetch an explanation from the serverless route, with timeout + template
 *  fallback. Never throws. */
export async function fetchExplanation(
  partial: Omit<ExplainRequest, 'cacheKey'>,
  opts: ExplainClientOptions = {},
): Promise<ExplainResponse> {
  const req: ExplainRequest = { ...partial, cacheKey: buildExplainCacheKey(partial) }

  const cached = getCached(req.cacheKey)
  if (cached) return cached

  const route = opts.route ?? ADAPTIVE_CONFIG.EXPLAIN_ROUTE
  const fetcher = opts.fetcher ?? fetch
  const timeoutMs = opts.timeoutMs ?? ADAPTIVE_CONFIG.EXPLAIN_TIMEOUT_MS

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)

  try {
    const res = await fetcher(route, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(req),
      signal: ctrl.signal,
    })
    if (!res.ok) return templateExplain(req)
    const data = (await res.json()) as Partial<ExplainResponse>
    if (typeof data.text !== 'string' || data.text.length === 0) {
      return templateExplain(req)
    }
    const out: ExplainResponse = {
      text: data.text.slice(0, 240), // hard cap — never trust a server response to be sane
      source: data.source === 'llm' ? 'llm' : 'template',
      provider: typeof data.provider === 'string' ? data.provider : undefined,
    }
    setCached(req.cacheKey, out)
    return out
  } catch {
    return templateExplain(req)
  } finally {
    clearTimeout(timer)
  }
}

/** Clear the in-memory cache (used by tests). */
export function clearExplainCache() {
  cache.clear()
}
