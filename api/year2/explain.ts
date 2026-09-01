// POST /api/year2/explain
//
// Minimal serverless route that wraps a ranked chain of free LLM providers for
// kid-friendly explanations. Mirrors the structure of the user's
// .opencode/plugins/ultimate-fallback.js (try → on failure cooldown → try next)
// but tuned for a 6-7 year old's math mistake.
//
// PII firewall: this route accepts ONLY { prompt, studentAnswer, correctAnswer,
// objectiveCode, recentAccuracyPct, ageBand, cacheKey }. No names, ids, full
// history, or anything else.

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

type Provider = {
  name: string
  base: string
  key: string | undefined
  model: string
  format: 'openai' | 'gemini'
}

function buildChain(): Provider[] {
  return [
    { name: 'groq-llama-3.3-70b', base: 'https://api.groq.com/openai/v1/chat/completions', key: process.env.GROQ_API_KEY, model: 'llama-3.3-70b-versatile', format: 'openai' },
    { name: 'groq-gpt-oss-120b', base: 'https://api.groq.com/openai/v1/chat/completions', key: process.env.GROQ_API_KEY, model: 'openai/gpt-oss-120b', format: 'openai' },
    { name: 'gemini-flash', base: 'https://generativelanguage.googleapis.com/v1beta/models', key: process.env.GEMINI_API_KEY, model: 'gemini-flash-latest', format: 'gemini' },
    { name: 'cerebras-gpt-oss-120b', base: 'https://api.cerebras.ai/v1/chat/completions', key: process.env.CEREBRAS_API_KEY, model: 'gpt-oss-120b', format: 'openai' },
    { name: 'gemini-flash-lite', base: 'https://generativelanguage.googleapis.com/v1beta/models', key: process.env.GEMINI_API_KEY, model: 'gemini-flash-lite-latest', format: 'gemini' },
    { name: 'mistral-small', base: 'https://api.mistral.ai/v1/chat/completions', key: process.env.MISTRAL_API_KEY, model: 'mistral-small-latest', format: 'openai' },
    { name: 'zhipu-glm-4.7-flash', base: 'https://open.bigmodel.cn/api/paas/v4/chat/completions', key: process.env.ZHIPU_API_KEY, model: 'glm-4.7-flash', format: 'openai' },
    { name: 'groq-llama-3.1-8b', base: 'https://api.groq.com/openai/v1/chat/completions', key: process.env.GROQ_API_KEY, model: 'llama-3.1-8b-instant', format: 'openai' },
  ]
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

async function callOpenAI(
  p: Provider,
  systemPrompt: string,
  userPrompt: string,
  timeoutMs: number,
): Promise<string> {
  if (!p.key) throw new Error('no key')
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const r = await fetch(p.base, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${p.key}`,
      },
      body: JSON.stringify({
        model: p.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 80,
        temperature: 0.4,
      }),
      signal: ctrl.signal,
    })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const j = (await r.json()) as { choices?: { message?: { content?: string } }[] }
    return j.choices?.[0]?.message?.content?.trim() ?? ''
  } finally {
    clearTimeout(t)
  }
}

async function callGemini(
  p: Provider,
  systemPrompt: string,
  userPrompt: string,
  timeoutMs: number,
): Promise<string> {
  if (!p.key) throw new Error('no key')
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const url = `${p.base}/${p.model}:generateContent?key=${p.key}`
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: { maxOutputTokens: 80, temperature: 0.4 },
      }),
      signal: ctrl.signal,
    })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const j = (await r.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[]

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('allow', 'POST')
    return res.status(405).json({ error: 'method-not-allowed' })
  }
  const body = (req.body ?? {}) as ExplainBody
  const prompt = typeof body.prompt === 'string' ? body.prompt : ''
  const studentAnswer = typeof body.studentAnswer === 'string' ? body.studentAnswer : ''
  const correctAnswer = typeof body.correctAnswer === 'string' ? body.correctAnswer : ''
  const objectiveCode = typeof body.objectiveCode === 'string' ? body.objectiveCode : ''
  const ageBand = typeof body.ageBand === 'string' ? body.ageBand : 'Year 2 (age 6-7)'
  const recentAccuracyPct =
    typeof body.recentAccuracyPct === 'number' && Number.isFinite(body.recentAccuracyPct)
      ? body.recentAccuracyPct
      : 50
  const cacheKey = typeof body.cacheKey === 'string' ? body.cacheKey : ''

  if (!prompt || !correctAnswer) {
    return res.status(400).json({ error: 'prompt-and-correct-required' })
  }

  if (cacheKey) {
    const hit = cache.get(cacheKey)
    if (hit) {
      return res.status(200).json({ text: hit.text, source: 'llm', provider: hit.provider })
    }
  }

  const userPrompt =
    `The question was: "${prompt}"\n` +
    `The child answered: "${studentAnswer}"\n` +
    `The correct answer is: "${correctAnswer}"\n` +
    `Skill: ${objectiveCode}. Recent accuracy: ${Math.round(recentAccuracyPct)}%.\n` +
    `Reply with ONE short, kind, age-appropriate sentence for a ${ageBand}.`

  const chain = buildChain()
  const timeoutMs = 3000

  for (const p of chain) {
    if (!p.key) continue
    try {
      const text =
        p.format === 'openai'
          ? await callOpenAI(p, SYSTEM_PROMPT, userPrompt, timeoutMs)
          : await callGemini(p, SYSTEM_PROMPT, userPrompt, timeoutMs)
      if (text && text.length > 0) {
        if (cacheKey) cache.set(cacheKey, { text, provider: p.name })
        return res.status(200).json({ text: text.slice(0, 240), source: 'llm', provider: p.name })
      }
    } catch {
      // try next provider
    }
  }

  return res.status(200).json({ text: TEMPLATE(recentAccuracyPct), source: 'template' })
}

    }
    return j.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
  } finally {
    clearTimeout(t)
  }
}

      ? 'Almost! Have a look at the question again and try once more.'
      : 'Great work! Just a small slip — try it again.'

const cache = new Map<string, { text: string; provider: string }>()
