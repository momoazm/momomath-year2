/** Grown-ups-only AI review client. Posts aggregate practice stats to
 *  /api/year2/review and renders the STRICT JSON coach reply in the Profile
 *  "For grown-ups" section. The child never sees this.
 *
 *  Like fetchExplanation: in-memory cache, hard caps on server text, and a
 *  deterministic templateReview() fallback so offline parents still get
 *  something useful (labelled "Offline summary", never as AI output).
 *  Unlike fetchExplanation it THROWS on 400/401 (bad key / bad payload) so
 *  the UI can tell the grown-up to fix their key instead of silently
 *  degrading. */

import { ADAPTIVE_CONFIG } from './config'
import { byokHeaders } from './byok'

export interface ReviewSkill {
  code: string
  masteryPct: number
}

export interface ReviewStats {
  attempted: number
  accuracyPct: number | null
  avgSeconds: number | null
  streakDays: number
  weakSkills: ReviewSkill[]
  strongSkills: ReviewSkill[]
}

export interface ReviewFocus {
  area: string
  action: string
}

export interface ReviewResult {
  summary: string
  strengths: string[]
  focus: ReviewFocus[]
  nextStep: string
  motivation: string
}

export interface ReviewResponse {
  review: ReviewResult
  source: 'llm' | 'template'
  provider?: string
}

export interface ReviewClientOptions {
  route?: string
  fetcher?: typeof fetch
  timeoutMs?: number
}

const cache = new Map<string, ReviewResponse>()

function shortHash(s: string): string {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i)
  return (h >>> 0).toString(36)
}

export function buildReviewCacheKey(stats: ReviewStats): string {
  return shortHash(JSON.stringify(stats))
}

/** Deterministic, numbers-grounded fallback. Never invents skills. */
export function templateReview(stats: ReviewStats): ReviewResponse {
  const weak = stats.weakSkills.slice(0, 3)
  const strong = stats.strongSkills.slice(0, 3)
  const acc =
    stats.accuracyPct == null ? 'no answers yet' : `${stats.accuracyPct}% accuracy`
  const summary =
    stats.attempted === 0
      ? 'No practice recorded yet — play a lesson to start tracking.'
      : `${stats.attempted} questions attempted (${acc})` +
        (weak.length ? `; trickiest: ${weak.map((w) => w.code).join(', ')}.` : '.')
  return {
    review: {
      summary,
      strengths: strong.map((s) => `${s.code} at ${s.masteryPct}% mastery`),
      focus: weak.map((w) => ({
        area: w.code,
        action: `Replay one short ${w.code} lesson together and talk through each step.`,
      })),
      nextStep:
        weak.length > 0
          ? `Practice ${weak[0].code} for 10 minutes today.`
          : 'Keep the daily streak going with one short lesson.',
      motivation: 'Small steps every day add up.',
    },
    source: 'template',
  }
}

function isReviewResult(v: unknown): v is ReviewResult {
  if (!v || typeof v !== 'object') return false
  const r = v as Record<string, unknown>
  return (
    typeof r.summary === 'string' &&
    !!r.summary.trim() &&
    Array.isArray(r.focus) &&
    r.focus.length > 0 &&
    typeof r.nextStep === 'string'
  )
}

export async function fetchReview(
  stats: ReviewStats,
  opts: ReviewClientOptions = {},
): Promise<ReviewResponse> {
  const key = buildReviewCacheKey(stats)
  const cached = cache.get(key)
  if (cached) return cached

  const route = opts.route ?? ADAPTIVE_CONFIG.REVIEW_ROUTE
  const fetcher = opts.fetcher ?? fetch
  const timeoutMs = opts.timeoutMs ?? ADAPTIVE_CONFIG.REVIEW_TIMEOUT_MS

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetcher(route, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...byokHeaders() },
      body: JSON.stringify({ stats }),
      signal: ctrl.signal,
    })
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean
      review?: unknown
      provider?: unknown
      error?: unknown
    }
    if (res.status === 400 || res.status === 401) {
      throw new Error(typeof data.error === 'string' ? data.error : `HTTP ${res.status}`)
    }
    if (!res.ok || !data.ok || !isReviewResult(data.review)) {
      return templateReview(stats)
    }
    const out: ReviewResponse = {
      review: {
        summary: String(data.review.summary).slice(0, 400),
        strengths: Array.isArray(data.review.strengths)
          ? data.review.strengths
              .filter((x): x is string => typeof x === 'string')
              .slice(0, 3)
              .map((s) => s.slice(0, 120))
          : [],
        focus: (data.review.focus as ReviewFocus[]).slice(0, 3).map((f) => ({
          area: String(f.area).slice(0, 80),
          action: String(f.action).slice(0, 160),
        })),
        nextStep: String(data.review.nextStep).slice(0, 200),
        motivation:
          typeof data.review.motivation === 'string'
            ? data.review.motivation.slice(0, 120)
            : '',
      },
      source: 'llm',
      provider: typeof data.provider === 'string' ? data.provider : undefined,
    }
    if (cache.size >= ADAPTIVE_CONFIG.REVIEW_CACHE_SIZE) {
      const first = cache.keys().next().value
      if (first !== undefined) cache.delete(first)
    }
    cache.set(key, out)
    return out
  } catch (e) {
    // Auth/payload errors must surface so the grown-up fixes the key.
    if (e instanceof Error && /HTTP 40[01]|unknown provider|invalid key/i.test(e.message)) {
      throw e
    }
    if (e instanceof Error && e.name === 'AbortError') return templateReview(stats)
    if (e instanceof TypeError) return templateReview(stats)
    throw e
  } finally {
    clearTimeout(timer)
  }
}

export function clearReviewCache(): void {
  cache.clear()
}
