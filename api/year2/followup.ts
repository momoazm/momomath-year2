// POST /api/year2/followup
//
// "Try a similar one" — one fresh MCQ on the same skill after a wrong first
// attempt. Same ranked free-provider chain as /explain (BYOK first, 3 s per
// model, 9 s deadline, 60 s cooldowns), but the model must return strict MCQ
// JSON: {prompt, choices, answerIndex}. Malformed replies skip to the next
// provider; total failure falls back to the deterministic sibling-generator
// re-roll from the content layer, so the child always gets a question (or
// {source:'none'} when the lesson no longer exists — the client then simply
// hides the offer).
//
// PII firewall: this route accepts ONLY { prompt, studentAnswer,
// correctAnswer, objectiveCode, lessonId, cacheKey }. No names, ids,
// history, or anything else. All strings are truncated.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { parseLlmMcq, siblingFollowup } from '../../src/engine/adaptive/followup'
import type { McqQuestion } from '../../src/content/types'

interface FollowupBody {
  prompt?: string
  studentAnswer?: string
  correctAnswer?: string
  objectiveCode?: string
  lessonId?: string
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
 *  key is actually configured. Mirrors api/year2/explain.ts. */
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
  'You write ONE multiple-choice question for a 6-7 year old child (Year 2). ' +
  'Reply with ONLY raw JSON — no markdown fences, no commentary — in exactly this shape: ' +
  '{"prompt": "...", "choices": ["...", "..."], "answerIndex": 0} ' +
  'Rules: 2 to 4 short choices; exactly one correct; same skill as the original ' +
  'question but different wording or numbers; plain English a 6-year-old reads; ' +
  'max 45 words in the prompt; no emojis; never reveal which choice is correct outside answerIndex.'

const COOLDOWN_MS = 60_000
const PER_MODEL_TIMEOUT_MS = 3_000
const OVERALL_DEADLINE_MS = 9_000
const MAX_CACHE = 500

const cooldowns = new Map<string, number>()
const cache = new Map<string, { question: McqQuestion; provider: string }>()

function isCoolingDown(label: string): boolean {
  return (cooldowns.get(label) ?? 0) > Date.now()
}

function markCooldown(label: string): void {
  cooldowns.set(label, Date.now() + COOLDOWN_MS)
}

function cacheSet(key: string, value: { question: McqQuestion; provider: string }): void {
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
        max_tokens: 400,
        temperature: 0.6,
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

function readBody(req: VercelRequest): FollowupBody {
  const raw = req.body as unknown
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as FollowupBody
    } catch {
      return {}
    }
  }
  return (raw ?? {}) as FollowupBody
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
  const lessonId = clamp(typeof body.lessonId === 'string' ? body.lessonId : '', 64)
  const cacheKey = typeof body.cacheKey === 'string' ? body.cacheKey.slice(0, 64) : ''

  if (!prompt || !lessonId || !objectiveCode) {
    return res.status(400).json({ error: 'prompt-lesson-skill-required' })
  }

  if (cacheKey) {
    const hit = cache.get(cacheKey)
    if (hit) {
      return res
        .status(200)
        .json({ question: hit.question, source: 'llm', provider: hit.provider })
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
    `Original question: "${prompt}"\n` +
    `The child answered: "${studentAnswer}"\n` +
    `The correct answer is: "${correctAnswer}"\n` +
    `Skill: ${objectiveCode}.\n` +
    `Write ONE new multiple-choice question on the SAME skill — different wording ` +
    `or numbers, same difficulty. Only JSON.`

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
      const raw = await callChat(entry, key, SYSTEM_PROMPT, userPrompt, PER_MODEL_TIMEOUT_MS)
      const mcq = parseLlmMcq(raw)
      if (mcq) {
        if (cacheKey) cacheSet(cacheKey, { question: mcq, provider: entry.label })
        return res.status(200).json({ question: mcq, source: 'llm', provider: entry.label })
      }
      // Malformed JSON / bad shape: try the next provider (no cooldown —
      // the model answered, it just wasn't usable).
    } catch (e) {
      const status =
        (e as { status?: number })?.status ?? ((e as Error)?.name === 'AbortError' ? 408 : 0)
      if (status === 429 || status >= 500 || status === 408 || status === 0) {
        markCooldown(entry.label)
      }
      // try next provider
    }
  }

  // Deterministic sibling re-roll — same lesson, different seed. The child
  // always gets a question even with no keys at all.
  const sibling = siblingFollowup({
    prompt,
    studentAnswer,
    correctAnswer,
    objectiveCode,
    lessonId,
  })
  if (sibling) {
    return res.status(200).json({ question: sibling.question, source: 'sibling' })
  }

  return res.status(200).json({ source: 'none' })
}
