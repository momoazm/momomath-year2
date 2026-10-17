/** Premium TTS layer (Phase 36): pre-generated Fish Audio mp3 clips served as
 *  static assets from `<base>tts/<key>.mp3`. Pure, synchronous helpers shared
 *  by the runtime player (tts.ts) and the offline generator
 *  (scripts/generate-tts.mts) so a clip's key is computed identically in both
 *  places. Additive by design: every miss falls back to the existing
 *  Web Speech path — no store, progress or gameplay code is involved. */

export type TtsProfile = 'narrator' | 'sonic'

/** Bump to invalidate every key (old clips stay on disk, new keys win).
 *  Keys also embed the voice id, so swapping a voice regenerates its clips
 *  automatically; the version is for changing the speech text pipeline. */
export const TTS_VERSION = 'fa1'

/** Fish Audio voice ids per locale x profile (public ids, not secrets).
 *  User-picked cast (2026-10-17): Sonic everywhere in English, Tails reads
 *  Arabic, Knuckles reads German. Same model for both profiles per locale —
 *  questions, books and the slideshow all speak with the character voice. */
export const PREMIUM_VOICES: Record<string, Partial<Record<TtsProfile, string>>> = {
  // English: Roger Craig Smith — official modern Sonic (Twitter Takeover).
  'en-GB': { narrator: '48484faae07e4cfdb8064da770ee461e', sonic: '48484faae07e4cfdb8064da770ee461e' },
  // Arabic: Tails (movie voice, Colleen O'Shaughnessey) — cross-lingual Arabic.
  'ar-EG': { narrator: '2c72e0fbea364f41bc09f4f41b6b875f', sonic: '2c72e0fbea364f41bc09f4f41b6b875f' },
  // German: Knuckles (movie voice) — cross-lingual German.
  'de-DE': { narrator: '967a7dc361d84a75a233183aa592cac0', sonic: '967a7dc361d84a75a233183aa592cac0' },
}

export function premiumVoiceFor(lang: string, profile: TtsProfile): string | null {
  const id = PREMIUM_VOICES[lang]?.[profile]
  return id ? id : null
}

/** Canonical spoken form used for hashing: NFC + whitespace collapse. It never
 *  changes what is spoken (case, punctuation and emoji are kept) — only
 *  invisible characters and space runs are normalized, so the runtime and the
 *  generator always hash the exact same string. */
export function normalizeSpeechText(text: string): string {
  return text
    .normalize('NFC')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u200b-\u200f\u2028\u2029\ufeff]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function fnv32(s: string, seed: number): number {
  let h = seed >>> 0
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Stable clip key for one spoken run: two independent 32-bit FNV-1a hashes
 *  (~64 bits) over version|voice|lang|profile|text. Returns null when the
 *  locale/profile has no premium voice configured or the text is empty. */
export function premiumKey(text: string, lang: string, profile: TtsProfile): string | null {
  const voice = premiumVoiceFor(lang, profile)
  if (!voice) return null
  const norm = normalizeSpeechText(text)
  if (!norm) return null
  const payload = `${TTS_VERSION}|${voice}|${lang}|${profile}|${norm}`
  const a = fnv32(payload, 2166136261).toString(36).padStart(7, '0')
  const b = fnv32(payload, 0x811c9dc5 ^ 0x9e3779b9).toString(36).padStart(7, '0')
  return a + b
}

export function premiumBaseUrl(): string {
  const env = (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env
  const base = env?.BASE_URL ?? '/'
  return base.endsWith('/') ? base : `${base}/`
}

export function premiumUrl(key: string): string {
  return `${premiumBaseUrl()}tts/${key}.mp3`
}

/** Short fingerprint of the configured voice table, appended to the manifest
 *  cache-bust URL: a voice swap changes every key, so the runtime must never
 *  be served a stale manifest the service worker cached for an older pick. */
export function premiumFingerprint(): string {
  const payload = Object.keys(PREMIUM_VOICES)
    .sort()
    .map((l) => `${l}:${PREMIUM_VOICES[l]?.narrator ?? ''}:${PREMIUM_VOICES[l]?.sonic ?? ''}`)
    .join('|')
  return fnv32(payload, 2166136261).toString(36)
}

export interface PremiumPlan {
  keys: string[]
  srcs: string[]
}

/** Decide premium playback for a whole utterance: every script run must have a
 *  generated clip, otherwise the caller falls back to Web Speech for the
 *  entire string (mixing engines mid-sentence sounds broken). Pure — `has`
 *  is the loaded manifest lookup, so the decision is unit-testable. */
export function premiumPlan(
  runs: readonly { text: string; lang: string }[],
  profile: TtsProfile,
  has: (key: string) => boolean,
): PremiumPlan | null {
  if (!runs.length) return null
  const keys: string[] = []
  for (const run of runs) {
    const key = premiumKey(run.text, run.lang, profile)
    if (!key || !has(key)) return null
    keys.push(key)
  }
  return { keys, srcs: keys.map(premiumUrl) }
}
