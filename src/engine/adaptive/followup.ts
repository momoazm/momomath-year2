/** AI follow-up question after a wrong first attempt — the "Try a similar
 *  one" offer in the lesson footer.
 *
 *  Modeled on explanations.ts: a small PII-free request shape, an in-memory
 *  cache, a short timeout, and a deterministic local fallback so the child
 *  never sees an error — the offer also works offline and on static hosts
 *  (gh-pages) where /api/year2/* doesn't exist.
 *
 *  The fallback is the sibling-generator re-roll: the SAME lesson re-rolled
 *  with a different seed until it yields a different question (the existing
 *  makeLesson sibling-walk). The seed derives from the original prompt, so
 *  one mistake always maps to one stable follow-up question.
 *
 *  Never throws: every failure path answers with the sibling re-roll, or
 *  null when even that can't produce a question (unknown lesson). */

import { getCurriculum } from '../../content/registry'
import { hashString } from '../../content/rng'
import type { LessonDef, McqQuestion, Question } from '../../content/types'
import { ADAPTIVE_CONFIG } from './config'
import { byokHeaders } from './byok'
import { ALL_SUBJECTS } from './lessons'
import { questionPrompt } from './questions'

/** Follow-up request — deliberately small so nothing personal can leak. */
export interface FollowupRequest {
  prompt: string
  studentAnswer: string
  correctAnswer: string
  objectiveCode: string
  lessonId: string
  /** Derived locally — the server only uses it to cache. */
  cacheKey: string
}

export interface FollowupResult {
  question: Question
  source: 'llm' | 'sibling'
  provider?: string
}

export interface FollowupClientOptions {
  /** Override the route (for tests). */
  route?: string
  /** Inject a fetcher (for tests). */
  fetcher?: typeof fetch
  /** Per-request timeout. */
  timeoutMs?: number
}

const cache = new Map<string, FollowupResult>()

function setCached(key: string, value: FollowupResult): void {
  if (cache.size >= ADAPTIVE_CONFIG.FOLLOWUP_CACHE_SIZE) {
    const first = cache.keys().next().value
    if (first !== undefined) cache.delete(first)
  }
  cache.set(key, value)
}

/** Hash a string into a short stable key. Not cryptographic — just stable
 *  enough to dedupe the same mistake. */
function shortHash(s: string): string {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i)
  return (h >>> 0).toString(36)
}

/** Build a cache key the client uses locally; the server ignores it. */
export function buildFollowupCacheKey(req: Omit<FollowupRequest, 'cacheKey'>): string {
  return shortHash(
    `${req.lessonId}|${req.objectiveCode}|${req.prompt}|${req.studentAnswer}|${req.correctAnswer}`,
  )
}

/** Pull the first JSON object out of a model reply (handles ```json fences
 *  and chatty prose around the payload). */
function extractJson(raw: string): string {
  const fenced = raw.replace(/^\s*```(?:json)?/i, '').replace(/```\s*$/, '')
  const start = fenced.indexOf('{')
  const end = fenced.lastIndexOf('}')
  if (start >= 0 && end > start) return fenced.slice(start, end + 1)
  return fenced
}

/** Strict validation of the LLM's MCQ JSON: {prompt, choices, answerIndex}
 *  (or {answer} — index or choice text). Caps: prompt ≤300 chars, 2-4 unique
 *  choices ≤80 chars. Returns a normalised question or null, so the caller
 *  can skip a bad model response without ever showing it to the child. */
export function parseLlmMcq(raw: unknown): McqQuestion | null {
  let obj: unknown = raw
  if (typeof raw === 'string') {
    try {
      obj = JSON.parse(extractJson(raw))
    } catch {
      return null
    }
  }
  if (!obj || typeof obj !== 'object') return null
  const o = obj as { prompt?: unknown; choices?: unknown; answerIndex?: unknown; answer?: unknown }

  const prompt = typeof o.prompt === 'string' ? o.prompt.trim().slice(0, 300) : ''
  if (!prompt) return null
  if (!Array.isArray(o.choices) || o.choices.length < 2 || o.choices.length > 4) return null
  const choices: string[] = []
  for (const c of o.choices) {
    if (typeof c !== 'string') return null
    const t = c.trim().slice(0, 80)
    if (!t) return null
    choices.push(t)
  }
  if (new Set(choices).size !== choices.length) return null

  let answerIndex: unknown = o.answerIndex
  if (typeof answerIndex !== 'number' && 'answer' in o) {
    if (typeof o.answer === 'number') {
      answerIndex = o.answer
    } else if (typeof o.answer === 'string') {
      answerIndex = choices.indexOf(o.answer.trim())
      if (answerIndex === -1) return null
    }
  }
  if (typeof answerIndex !== 'number' || !Number.isInteger(answerIndex)) return null
  if (answerIndex < 0 || answerIndex >= choices.length) return null

  return { kind: 'mcq', prompt, choices, answerIndex }
}

const KNOWN_KINDS = new Set(Object.keys(ADAPTIVE_CONFIG.P_G_BY_KIND))

/** Question kinds the renderer supports — the whitelist for anything that
 *  crosses the wire. */
function isKnownKind(v: unknown): v is Question['kind'] {
  return typeof v === 'string' && KNOWN_KINDS.has(v)
}

/** Validate a server response's `question` payload. LLM answers get the full
 *  strict MCQ parse; sibling answers come from our own generator, so we only
 *  check the kind whitelist + object shape. */
function sanitizeServerQuestion(raw: unknown, source: unknown): Question | null {
  if (source === 'llm') return parseLlmMcq(raw)
  if (!raw || typeof raw !== 'object') return null
  const q = raw as { kind?: unknown }
  if (isKnownKind(q.kind)) return raw as Question
  return null
}

/** Deterministic local fallback: re-roll the SAME lesson with different
 *  seeds until it yields a different question (sibling-walk). Returns null
 *  when the lesson can't be found (curriculum changed between saves). */
export function siblingFollowup(
  partial: Omit<FollowupRequest, 'cacheKey'>,
): FollowupResult | null {
  let lesson: LessonDef | null = null
  for (const subject of ALL_SUBJECTS) {
    const entry = getCurriculum(subject).allLessons[partial.lessonId]
    if (entry) {
      lesson = entry.lesson
      break
    }
  }
  if (!lesson) return null

  const idx = Math.max(0, lesson.objectiveCodes.indexOf(partial.objectiveCode))
  const base = hashString(`${partial.lessonId}|${partial.objectiveCode}|${partial.prompt}`)
  for (let attempt = 0; attempt < 8; attempt++) {
    const qs = lesson.generate(idx + 2, (base + attempt * 7919) >>> 0)
    const q = qs[idx]
    if (!q) continue
    // Same question we just missed — walk to the next sibling.
    if (q.prompt === partial.prompt || questionPrompt(q) === partial.prompt) continue
    return { question: q, source: 'sibling' }
  }
  return null
}

/** Fetch a follow-up from the serverless route, with timeout + sibling
 *  fallback. Never throws; resolves null only when no question exists. */
export async function fetchFollowup(
  partial: Omit<FollowupRequest, 'cacheKey'>,
  opts: FollowupClientOptions = {},
): Promise<FollowupResult | null> {
  try {
    const req: FollowupRequest = { ...partial, cacheKey: buildFollowupCacheKey(partial) }

    const cached = cache.get(req.cacheKey)
    if (cached) return cached

    // Network first (same as explanations): the LLM answer is the better
    // one. The button stays hidden until we resolve either way, so the
    // 3 s timeout only delays the offer — offline it falls straight to the
    // local sibling re-roll.
    const route = opts.route ?? ADAPTIVE_CONFIG.FOLLOWUP_ROUTE
    const fetcher = opts.fetcher ?? fetch
    const timeoutMs = opts.timeoutMs ?? ADAPTIVE_CONFIG.FOLLOWUP_TIMEOUT_MS

    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    try {
      const res = await fetcher(route, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...byokHeaders() },
        body: JSON.stringify(req),
        signal: ctrl.signal,
      })
      if (res.ok) {
        const data = (await res.json()) as {
          question?: unknown
          source?: unknown
          provider?: unknown
        }
        const question = sanitizeServerQuestion(data.question, data.source)
        if (question) {
          const out: FollowupResult = {
            question,
            source: data.source === 'llm' ? 'llm' : 'sibling',
            provider: typeof data.provider === 'string' ? data.provider : undefined,
          }
          setCached(req.cacheKey, out)
          return out
        }
      }
    } catch {
      /* offline / 404 / junk / timeout — fall through to the sibling */
    } finally {
      clearTimeout(timer)
    }

    const fallback = siblingFollowup(partial)
    if (fallback) setCached(req.cacheKey, fallback)
    return fallback
  } catch {
    return null
  }
}

/** Clear the in-memory cache (used by tests). */
export function clearFollowupCache(): void {
  cache.clear()
}
