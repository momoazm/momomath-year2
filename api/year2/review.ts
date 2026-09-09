// POST /api/year2/review
//
// Grown-ups-only AI review of a child's practice stats. Same fallback-chain
// shape as ./explain.ts (and momolearn-ai's POST /api/mbzuai/coach), but the
// contract mirrors the coach: STRICT JSON
//   { summary, strengths[0-3], focus[{area,action}] 1-3, nextStep, motivation }
// Grounded in the provided numbers; never invents skills; never sees PII.
// The client renders it in the Profile "For grown-ups" section only —
// the child never sees it.
//
// Body: { stats: {
//   attempted: number, accuracyPct: number|null, avgSeconds: number|null,
//   streakDays: number,
//   weakSkills: [{code, masteryPct}] (max 8), strongSkills: [{code, masteryPct}] (max 8)
// } }
// Success: { ok: true, review, provider }. Failure: { ok: false, error }.

import type { VercelRequest, VercelResponse } from '@vercel/node'

interface SkillStat {
  code?: string
  masteryPct?: number
}

interface ReviewStats {
  attempted?: number
  accuracyPct?: number | null
  avgSeconds?: number | null
  streakDays?: number
  weakSkills?: SkillStat[]
  strongSkills?: SkillStat[]
}

export interface ReviewResult {
  summary: string
  strengths: string[]
  focus: { area: string; action: string }[]
  nextStep: string
  motivation: string
}

interface ProviderDef {
  baseUrl: string
  key: () => string | undefined
}

const PROVIDERS: Record<string, ProviderDef> = {
  groq: { baseUrl: 'https://api.groq.com/openai/v1', key: () => process.env.GROQ_API_KEY },
  cerebras: { baseUrl: 'https://api.cerebras.ai/v1', key: () => process.env.CEREBRAS_API_KEY },
  gemini: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    key: () => process.env.GEMINI_API_KEY,
  },
  openrouter: { baseUrl: 'https://openrouter.ai/api/v1', key: () => process.env.OPENROUTER_API_KEY },
  mistral: { baseUrl: 'https://api.mistral.ai/v1', key: () => process.env.MISTRAL_API_KEY },
  zen: { baseUrl: 'https://opencode.ai/zen/v1', key: () => process.env.ZEN_API_KEY },
  'github-models': {
    baseUrl: 'https://models.github.ai/inference',
    key: () => process.env.GITHUB_TOKEN,
  },
  openai: { baseUrl: 'https://api.openai.com/v1', key: () => process.env.OPENAI_API_KEY },
}

interface ChainEntry {
  label: string
  provider: string
  model: string
}

/** Cheaper instruction-following models first; paid OpenAI last resort. */
const CHAIN: ChainEntry[] = [
  { label: 'gemini/gemini-2.0-flash', provider: 'gemini', model: 'gemini-2.0-flash' },
  { label: 'groq/gpt-oss-120b', provider: 'groq', model: 'openai/gpt-oss-120b' },
  { label: 'cerebras/gpt-oss-120b', provider: 'cerebras', model: 'gpt-oss-120b' },
  { label: 'openrouter/glm-5.2', provider: 'openrouter', model: 'z-ai/glm-5.2:free' },
  { label: 'zen/mimo-v2.5-free', provider: 'zen', model: 'mimo-v2.5-free' },
  { label: 'mistral/mistral-small', provider: 'mistral', model: 'mistral-small-latest' },
  { label: 'github/gpt-4o-mini', provider: 'github-models', model: 'openai/gpt-4o-mini' },
  { label: 'openai/gpt-4o-mini (paid)', provider: 'openai', model: 'gpt-4o-mini' },
]

const DEFAULT_MODEL_BY_PROVIDER: Record<string, string> = {
  groq: 'openai/gpt-oss-120b',
  cerebras: 'gpt-oss-120b',
  gemini: 'gemini-2.0-flash',
  openrouter: 'z-ai/glm-5.2:free',
  mistral: 'mistral-small-latest',
  zen: 'mimo-v2.5-free',
  'github-models': 'openai/gpt-4o-mini',
  openai: 'gpt-4o-mini',
}

const SYSTEM_PROMPT =
  'You are MomoMath Year 2\'s coach for parents of a 6-7 year old. ' +
  'You receive the child\'s real practice statistics and reply with STRICT JSON only: ' +
  '{"summary": string (max 40 words, direct and specific), ' +
  '"strengths": string[] (0-3 short items), ' +
  '"focus": [{"area": string, "action": string}] (1-3 items, actions concrete and Year-2 appropriate), ' +
  '"nextStep": string (one immediate action), ' +
  '"motivation": string (max 15 words)}. ' +
  'Ground every statement in the provided numbers; never invent skills that are not listed.'

const COOLDOWN_MS = 60_000
const PER_MODEL_TIMEOUT_MS = 4_000
const OVERALL_DEADLINE_MS = 9_000
const MAX_MODELS = 4
const MAX_CACHE = 200

const cooldowns = new Map<string, number>()
const cache = new Map<string, { review: ReviewResult; provider: string }>()

function isCoolingDown(label: string): boolean {
  return (cooldowns.get(label) ?? 0) > Date.now()
}

function markCooldown(label: string): void {
  cooldowns.set(label, Date.now() + COOLDOWN_MS)
}

function shortHash(s: string): string {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i)
  return (h >>> 0).toString(36)
}

function readBody(req: VercelRequest): { stats?: ReviewStats } {
  const raw = req.body as unknown
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as { stats?: ReviewStats }
    } catch {
      return {}
    }
  }
  return (raw ?? {}) as { stats?: ReviewStats }
}

function cleanSkills(list: unknown): { code: string; masteryPct: number }[] {
  if (!Array.isArray(list)) return []
  const out: { code: string; masteryPct: number }[] = []
  for (const s of list.slice(0, 8)) {
    const r = s as SkillStat
    if (typeof r?.code !== 'string' || !r.code) continue
    const pct = Number(r.masteryPct)
    out.push({
      code: r.code.slice(0, 16),
      masteryPct: Number.isFinite(pct) ? Math.max(0, Math.min(100, Math.round(pct))) : 0,
    })
  }
  return out
}

async function callChat(
  entry: ChainEntry,
  apiKey: string,
  messages: { role: string; content: string }[],
  timeoutMs: number,
): Promise<string> {
  const def = PROVIDERS[entry.provider]
  if (!def) throw new Error(`unknown provider ${entry.provider}`)
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(`${def.baseUrl}/chat/completions`, {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
        ...(entry.provider === 'openrouter'
          ? {
              'HTTP-Referer': process.env.SITE_URL || 'https://momoazm.github.io/momomath-year2/',
              'X-Title': 'MomoMath-Year2',
            }
          : {}),
      },
      body: JSON.stringify({
        model: entry.model,
        messages,
        temperature: 0.4,
        max_tokens: 500,
      }),
    })
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}`) as Error & { status?: number }
      err.status = res.status
      throw err
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
    return data.choices?.[0]?.message?.content?.trim() ?? ''
  } finally {
    clearTimeout(timer)
  }
}

function extractJsonObject(text: string): Record<string, unknown> | null {
  const t = String(text || '')
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/, '')
    .trim()
  const start = t.indexOf('{')
  if (start === -1) return null
  const end = t.lastIndexOf('}')
  if (end <= start) return null
  try {
    const v = JSON.parse(t.slice(start, end + 1)) as unknown
    return v && typeof v === 'object' ? (v as Record<string, unknown>) : null
  } catch {
    return null
  }
}

/** Coerce one model reply into a ReviewResult; null when unusable. */
function coerceReview(raw: Record<string, unknown> | null): ReviewResult | null {
  if (!raw || typeof raw.summary !== 'string' || !raw.summary.trim()) return null
  const strengths = Array.isArray(raw.strengths)
    ? raw.strengths.filter((x): x is string => typeof x === 'string' && !!x.trim()).slice(0, 3)
    : []
  const focusRaw = Array.isArray(raw.focus) ? raw.focus : []
  const focus = focusRaw
    .filter(
      (f): f is { area: string; action: string } =>
        !!f &&
        typeof f === 'object' &&
        typeof (f as { area?: unknown }).area === 'string' &&
        typeof (f as { action?: unknown }).action === 'string',
    )
    .slice(0, 3)
    .map((f) => ({ area: f.area.slice(0, 80), action: f.action.slice(0, 160) }))
  if (focus.length === 0) return null
  if (typeof raw.nextStep !== 'string' || !raw.nextStep.trim()) return null
  return {
    summary: raw.summary.slice(0, 400),
    strengths: strengths.map((s) => s.slice(0, 120)),
    focus,
    nextStep: raw.nextStep.slice(0, 200),
    motivation:
      typeof raw.motivation === 'string' ? raw.motivation.slice(0, 120) : 'Keep going!',
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('allow', 'POST')
    return res.status(405).json({ ok: false, error: 'method-not-allowed' })
  }
  const stats = readBody(req).stats
  if (!stats || typeof stats !== 'object') {
    return res.status(400).json({ ok: false, error: 'stats object required' })
  }

  const clean = {
    attempted: Math.max(0, Math.floor(Number(stats.attempted) || 0)),
    accuracyPct:
      stats.accuracyPct == null
        ? null
        : Math.max(0, Math.min(100, Math.round(Number(stats.accuracyPct)))),
    avgSeconds:
      stats.avgSeconds == null
        ? null
        : Math.max(0, Math.round(Number(stats.avgSeconds) || 0)),
    streakDays: Math.max(0, Math.floor(Number(stats.streakDays) || 0)),
    weakSkills: cleanSkills(stats.weakSkills),
    strongSkills: cleanSkills(stats.strongSkills),
  }
  const cacheKey = shortHash(JSON.stringify(clean))
  const cached = cache.get(cacheKey)
  if (cached) {
    return res.status(200).json({ ok: true, review: cached.review, provider: cached.provider })
  }

  const byokProvider = String(req.headers['x-ai-provider'] ?? '').trim().toLowerCase()
  const byokKey = String(req.headers['x-ai-key'] ?? '').trim()
  let byok: { entry: ChainEntry; key: string } | null = null
  if (byokKey) {
    if (!PROVIDERS[byokProvider]) {
      return res.status(400).json({ ok: false, error: `unknown provider "${byokProvider}"` })
    }
    if (byokKey.length < 16 || byokKey.length > 400) {
      return res.status(400).json({ ok: false, error: 'invalid key (length)' })
    }
    byok = {
      entry: {
        label: `byok/${byokProvider}`,
        provider: byokProvider,
        model: DEFAULT_MODEL_BY_PROVIDER[byokProvider],
      },
      key: byokKey,
    }
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: 'Practice stats: ' + JSON.stringify(clean).slice(0, 2000) },
  ]

  const chain: { entry: ChainEntry; key: string }[] = []
  if (byok && !isCoolingDown(byok.entry.label)) chain.push(byok)
  for (const entry of CHAIN) {
    const key = PROVIDERS[entry.provider]?.key()
    if (!key) continue
    chain.push({ entry, key })
  }
  if (chain.length === 0) {
    return res.status(502).json({ ok: false, error: 'no API keys configured' })
  }

  const deadline = Date.now() + OVERALL_DEADLINE_MS
  let lastErr = 'no model available'
  for (const { entry, key } of chain.slice(0, MAX_MODELS)) {
    if (Date.now() > deadline) break
    if (isCoolingDown(entry.label)) continue
    try {
      const text = await callChat(entry, key, messages, PER_MODEL_TIMEOUT_MS)
      const review = coerceReview(extractJsonObject(text))
      if (!review) {
        lastErr = `${entry.label}: unusable response`
        continue
      }
      if (cache.size >= MAX_CACHE) {
        const first = cache.keys().next().value
        if (first !== undefined) cache.delete(first)
      }
      cache.set(cacheKey, { review, provider: entry.label })
      return res.status(200).json({ ok: true, review, provider: entry.label })
    } catch (e) {
      const status =
        (e as { status?: number })?.status ?? ((e as Error)?.name === 'AbortError' ? 408 : 0)
      if (status === 429 || status >= 500 || status === 408 || status === 0) {
        markCooldown(entry.label)
      }
      lastErr = `${entry.label}: ${(e as Error).message}`
    }
  }
  return res.status(502).json({ ok: false, error: String(lastErr).slice(0, 140) })
}
