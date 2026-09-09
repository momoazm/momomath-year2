// POST /api/year2/explain
//
// Kid-friendly one-sentence nudge for a wrong first attempt. Ranked fallback
// chain over free LLM providers (try → on failure cool down → try next),
// mirroring momolearn-ai's lib/router.js + server.js design:
//
//   - every provider speaks OpenAI-compatible /chat/completions (Gemini goes
//     through its OpenAI endpoint, so there is exactly one call path)
//   - per-model timeout (3 s) + overall deadline (9 s, fits Vercel hobby)
//   - 60 s cooldown per failing label (429 / 5xx / timeout / network)
//   - server keys from env; an optional parent BYOK key (x-ai-provider +
//     x-ai-key headers) jumps the queue so your own keys are spent first
//   - total failure still returns 200 with a deterministic template —
//     the child never sees an error
//
// PII firewall: this route accepts ONLY { prompt, studentAnswer,
// correctAnswer, objectiveCode, recentAccuracyPct, ageBand, cacheKey }.
// No names, ids, history, or anything else. All strings are truncated.

import type { VercelRequest, VercelResponse } from '@vercel/node'

interface ExplainBody {
  prompt?: string
  studentAnswer?: string
  correctAnswer?: string
  objectiveCode?: string
  recentAccuracyPct?: number
  ageBand?: string
  cacheKey?: string
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

/** Free-first, fast-first. Paid OpenAI is last resort and only runs when its
 *  key is actually configured. */
const CHAIN: ChainEntry[] = [
  { label: 'groq/gpt-oss-120b', provider: 'groq', model: 'openai/gpt-oss-120b' },
  { label: 'cerebras/gpt-oss-120b', provider: 'cerebras', model: 'gpt-oss-120b' },
  { label: 'gemini/gemini-2.0-flash', provider: 'gemini', model: 'gemini-2.0-flash' },
  { label: 'zen/mimo-v2.5-free', provider: 'zen', model: 'mimo-v2.5-free' },
  { label: 'openrouter/glm-5.2', provider: 'openrouter', model: 'z-ai/glm-5.2:free' },
  {
    label: 'openrouter/nemotron-3-super',
    provider: 'openrouter',
    model: 'nvidia/nemotron-3-super-120b-a12b:free',
  },
  { label: 'mistral/mistral-small', provider: 'mistral', model: 'mistral-small-latest' },
  { label: 'github/gpt-4o-mini', provider: 'github-models', model: 'openai/gpt-4o-mini' },
  { label: 'zen/big-pickle', provider: 'zen', model: 'big-pickle' },
  { label: 'openai/gpt-4o-mini (paid)', provider: 'openai', model: 'gpt-4o-mini' },
]

/** Default model per provider when a parent brings their own key. */
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
  'You help a 6-7 year old child with math. ' +
  'Reply with ONE short sentence (max 18 words) that gently nudges them to try again. ' +
  'No step-by-step solution. No emojis. No praise theatre. ' +
  'Speak warmly, like a kind teacher.'

const TEMPLATE = (acc: number) =>
  acc < 50
    ? 'That one was tricky — read it once more and try again. You can do it!'
    : acc < 80
      ? 'Almost! Have a look at the question again and try once more.'
      : 'Great work! Just a small slip — try it again.'

const COOLDOWN_MS = 60_000
const PER_MODEL_TIMEOUT_MS = 3_000
const OVERALL_DEADLINE_MS = 9_000
const MAX_CACHE = 500

const cooldowns = new Map<string, number>()
const cache = new Map<string, { text: string; provider: string }>()

function isCoolingDown(label: string): boolean {
  return (cooldowns.get(label) ?? 0) > Date.now()
}

function markCooldown(label: string): void {
  cooldowns.set(label, Date.now() + COOLDOWN_MS)
}

function cacheSet(key: string, value: { text: string; provider: string }): void {
  if (cache.size >= MAX_CACHE) {
    const first = cache.keys().next().value
    if (first !== undefined) cache.delete(first)
  }
  cache.set(key, value)
}

async function callChat(
  entry: ChainEntry,
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
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
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 80,
        temperature: 0.4,
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

function readBody(req: VercelRequest): ExplainBody {
  const raw = req.body as unknown
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as ExplainBody
    } catch {
      return {}
    }
  }
  return (raw ?? {}) as ExplainBody
}

const clamp = (v: string, n: number) => v.slice(0, n)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('allow', 'POST')
    return res.status(405).json({ error: 'method-not-allowed' })
  }

  const body = readBody(req)
  const prompt = clamp(typeof body.prompt === 'string' ? body.prompt : '', 300)
  const studentAnswer = clamp(typeof body.studentAnswer === 'string' ? body.studentAnswer : '', 100)
  const correctAnswer = clamp(typeof body.correctAnswer === 'string' ? body.correctAnswer : '', 100)
  const objectiveCode = clamp(typeof body.objectiveCode === 'string' ? body.objectiveCode : '', 32)
  const ageBand =
    clamp(typeof body.ageBand === 'string' ? body.ageBand : '', 32) || 'Year 2 (age 6-7)'
  const recentAccuracyPct =
    typeof body.recentAccuracyPct === 'number' && Number.isFinite(body.recentAccuracyPct)
      ? body.recentAccuracyPct
      : 50
  const cacheKey = typeof body.cacheKey === 'string' ? body.cacheKey.slice(0, 64) : ''

  if (!prompt || !correctAnswer) {
    return res.status(400).json({ error: 'prompt-and-correct-required' })
  }

  if (cacheKey) {
    const hit = cache.get(cacheKey)
    if (hit) {
      return res.status(200).json({ text: hit.text, source: 'llm', provider: hit.provider })
    }
  }

  // Optional parent BYOK key jumps the queue (same header shape as
  // momolearn-ai's x-ai-key flow). Never logged.
  const byokProvider = String(req.headers['x-ai-provider'] ?? '').trim().toLowerCase()
  const byokKey = String(req.headers['x-ai-key'] ?? '').trim()
  let byok: { entry: ChainEntry; key: string } | null = null
  if (byokKey) {
    if (!PROVIDERS[byokProvider]) {
      return res.status(400).json({ error: `unknown provider "${byokProvider}"` })
    }
    if (byokKey.length < 16 || byokKey.length > 400) {
      return res.status(400).json({ error: 'invalid key (length)' })
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

  const userPrompt =
    `The question was: "${prompt}"\n` +
    `The child answered: "${studentAnswer}"\n` +
    `The correct answer is: "${correctAnswer}"\n` +
    `Skill: ${objectiveCode}. Recent accuracy: ${Math.round(recentAccuracyPct)}%.\n` +
    `Reply with ONE short, kind, age-appropriate sentence for a ${ageBand}.`

  const chain: { entry: ChainEntry; key: string }[] = []
  if (byok && !isCoolingDown(byok.entry.label)) chain.push(byok)
  for (const entry of CHAIN) {
    const key = PROVIDERS[entry.provider]?.key()
    if (!key) continue
    chain.push({ entry, key })
  }

  const deadline = Date.now() + OVERALL_DEADLINE_MS
  for (const { entry, key } of chain.slice(0, 7)) {
    if (Date.now() > deadline) break
    if (isCoolingDown(entry.label)) continue
    try {
      const text = await callChat(entry, key, SYSTEM_PROMPT, userPrompt, PER_MODEL_TIMEOUT_MS)
      if (text) {
        const out = text.slice(0, 240)
        if (cacheKey) cacheSet(cacheKey, { text: out, provider: entry.label })
        return res.status(200).json({ text: out, source: 'llm', provider: entry.label })
      }
    } catch (e) {
      const status =
        (e as { status?: number })?.status ?? ((e as Error)?.name === 'AbortError' ? 408 : 0)
      if (status === 429 || status >= 500 || status === 408 || status === 0) {
        markCooldown(entry.label)
      }
      // try next provider
    }
  }

  return res.status(200).json({ text: TEMPLATE(recentAccuracyPct), source: 'template' })
}
