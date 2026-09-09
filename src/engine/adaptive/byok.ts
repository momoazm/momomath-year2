/** Parent BYOK key store — same shape as momolearn-ai's public/byok.js.
 *
 *  The key lives ONLY in this browser (localStorage) and is forwarded as
 *  `x-ai-provider` + `x-ai-key` headers to /api/year2/* so a grown-up's own
 *  free key is spent before any server key. Never logged, never persisted
 *  to the cloud save. Kids never need this — the server keys cover them. */

export const BYOK_PROVIDERS = [
  'gemini',
  'groq',
  'openrouter',
  'cerebras',
  'mistral',
  'zen',
  'github-models',
  'openai',
] as const

export type ByokProvider = (typeof BYOK_PROVIDERS)[number]

export interface ByokValue {
  provider: string
  key: string
  at: number
}

const LS = 'momomath-year2.byok.v1'

export function byokGet(): ByokValue | null {
  try {
    const v = JSON.parse(localStorage.getItem(LS) || 'null') as Partial<ByokValue> | null
    if (
      v &&
      typeof v.provider === 'string' &&
      typeof v.key === 'string' &&
      v.key.length >= 16
    ) {
      return { provider: v.provider, key: v.key, at: typeof v.at === 'number' ? v.at : 0 }
    }
  } catch {
    /* ignore */
  }
  return null
}

export function byokSet(provider: string, key: string): void {
  localStorage.setItem(LS, JSON.stringify({ provider, key: key.trim(), at: Date.now() }))
}

export function byokClear(): void {
  localStorage.removeItem(LS)
}

/** Headers to merge into /api/year2/* POSTs. Empty when no key is saved. */
export function byokHeaders(): Record<string, string> {
  const v = byokGet()
  if (!v) return {}
  return { 'x-ai-provider': v.provider, 'x-ai-key': v.key }
}

export function byokMask(): string {
  const v = byokGet()
  if (!v) return ''
  return `${v.key.slice(0, 4)}…${v.key.slice(-4)}`
}
