/** Tiny Web Speech API wrapper for audio exercises (English + German + Arabic).
 *  Never throws - if TTS is unavailable every call is a silent no-op. PLAN 153
 *  adds bilingual runs: one utterance per detected script, chained in order,
 *  each with the best-ranked voice for that script. Pure helpers stay
 *  unit-testable (PLAN 155); utterance plumbing guards against stale chains. */

import type { Subject } from '../content/types'

let voiceCache: Record<string, SpeechSynthesisVoice | null> = {}
let speakChain = 0

export function ttsAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export type ScriptRun = 'latin' | 'arabic' | 'other'

function scriptOf(char: string): ScriptRun {
  const code = char.codePointAt(0) ?? 0
  // Arabic + presentation forms/indic digits live on the kid-facing side.
  if (
    (code >= 0x0600 && code <= 0x06ff) ||
    (code >= 0x0750 && code <= 0x077f) ||
    (code >= 0x08a0 && code <= 0x08ff) ||
    (code >= 0xfb50 && code <= 0xfdff) ||
    (code >= 0xfe70 && code <= 0xfeff) ||
    (code >= 0x0660 && code <= 0x0669) ||
    (code >= 0x06f0 && code <= 0x06f9)
  ) return 'arabic'
  if (
    (code >= 0x0041 && code <= 0x005a) ||
    (code >= 0x0061 && code <= 0x007a) ||
    (code >= 0x00c0 && code <= 0x00ff) ||
    (code >= 0x0100 && code <= 0x017f) ||
    (code >= 0x1e00 && code <= 0x1eff)
  ) return 'latin'
  return 'other'
}

/** Pure script segmentation (PLAN 153/155): Latin + Arabic runs; runs of only
 *  digits/emoji/punctuation/whitespace ("other") inherit the neighboring text
 *  run, defaulting to Latin when the whole string is neutral. Pure
 *  whitespace-only segments and EMPTY punctuation fragments never emit. */
export interface SpeechSegment { text: string; script: 'latin' | 'arabic' }
export function segmentByScript(text: string): SpeechSegment[] {
  const trimmed = text.trim()
  if (!trimmed) return []
  const runs: { text: string; script: ScriptRun }[] = []
  let current = ''
  let currentScript: ScriptRun = 'other'
  const push = () => {
    if (current) runs.push({ text: current, script: currentScript })
    current = ''
    currentScript = 'other'
  }
  for (const char of trimmed) {
    const s = scriptOf(char)
    if (s === currentScript || (current === '' && s === 'other')) {
      current += char
      currentScript = s === 'other' ? currentScript : s
    } else if (s === 'other') {
      current += char
    } else if (currentScript === 'other') {
      current += char
      currentScript = s
    } else {
      push()
      current = char
      currentScript = s
    }
  }
  push()
  // Merge neutral runs into the previous text run (inherit neighbors). A
  // neutral-only string survives as Latin only when it carries something
  // speakable (digit/emoji) — pure punctuation/whitespace emits nothing.
  const speakable = (s: string) =>
    /[0-9\u0660-\u0669\u06f0-\u06f9\u00bc-\u00be]/.test(s) ||
    /[\u2190-\u21ff\u2300-\u27bf\u2b00-\u2bff\u20e3\ufe0f]|[\ud83c-\udbff][\udc00-\udfff]/.test(s)
  const merged: { text: string; script: ScriptRun }[] = []
  for (const run of runs) {
    if (run.script === 'other') {
      if (merged.length > 0 && merged[merged.length - 1].script !== 'other') {
        merged[merged.length - 1].text += run.text
      } else if (speakable(run.text)) {
        merged.push({ text: run.text, script: 'latin' })
      }
    } else {
      merged.push(run)
    }
  }
  return merged
    .map((run): SpeechSegment => ({ text: run.text.trim(), script: run.script === 'arabic' ? 'arabic' : 'latin' }))
    .filter((run) => run.text.length > 0)
}

export interface RankedVoice { voice: SpeechSynthesisVoice | null; reason: string }

function voiceScore(name: string, lang: string, local: boolean, wantLang: string): number {
  let score = 0
  const lowerName = name.toLowerCase()
  if (lang === wantLang) score += 40
  else if (lang.startsWith(wantLang.slice(0, 2))) score += 20
  if (local) score += 10
  if (/(kid|child|junior|female|woman|girl|natural|neural|premium)/.test(lowerName)) score += 6
  if (/(robot|espeak|spd|festival|microsoft david|compact)/.test(lowerName)) score -= 12
  if (/google/i.test(lowerName)) score += 3
  return score
}

/** Pure voice ranking used by the bilingual chain (PLAN 153/155). Exact lang >
 *  prefix > default; local beats network; kid/female/natural names up;
 *  robot/eSpeak/compact names down. Returns null with empty voices. */
export function rankVoices(
  voices: readonly { name: string; lang: string; localService?: boolean; default?: boolean }[],
  wantLang: string,
): RankedVoice {
  let best: { name: string; lang: string; localService?: boolean; default?: boolean } | null = null
  let bestScore = -Infinity
  for (const v of voices) {
    const score = voiceScore(v.name, v.lang, v.localService !== false, wantLang) + (v.default ? 2 : 0)
    if (score > bestScore) {
      bestScore = score
      best = v
    }
  }
  return { voice: (best ?? null) as SpeechSynthesisVoice | null, reason: best ? `${best.name}/${best.lang}` : 'none' }
}

function bestVoice(lang: string = 'en-GB'): SpeechSynthesisVoice | null {
  if (!ttsAvailable()) return null
  if (voiceCache[lang]) return voiceCache[lang]
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null
  voiceCache[lang] = rankVoices(voices, lang).voice
  return voiceCache[lang]
}

if (ttsAvailable()) {
  // voices load asynchronously in some browsers
  window.speechSynthesis.onvoiceschanged = () => {
    voiceCache = {}
    bestVoice()
  }
}

/** Preferred TTS locale per subject. German uses de-DE, Arabic-content extras use ar-EG. */
export function ttsLangFor(subject: Subject): string {
  if (subject === 'german') return 'de-DE'
  if (subject === 'arabic' || subject === 'religion' || subject === 'social') return 'ar-EG'
  return 'en-GB'
}

export function speak(text: string, rate = 0.92, lang = 'en-GB'): void {
  if (!ttsAvailable() || !text) return
  try {
    const chain = ++speakChain
    window.speechSynthesis.cancel()
    const segments = segmentByScript(text)
    const runs = segments.length > 0 ? segments : [{ text, script: 'latin' as const }]
    runs.forEach((run, i) => {
      const runLang = run.script === 'arabic' ? 'ar-EG' : lang
      const u = new SpeechSynthesisUtterance(run.text)
      const v = bestVoice(runLang)
      if (v) u.voice = v
      u.lang = v?.lang ?? runLang
      u.rate = i === 0 ? rate : Math.max(0.6, rate - 0.05)
      u.pitch = 1.05
      u.onstart = () => {
        if (chain !== speakChain) window.speechSynthesis.cancel()
      }
      window.speechSynthesis.speak(u)
    })
  } catch {
    /* ignore */
  }
}

/** Subject-aware speak (picks de-DE for the German extra, ar-EG for Arabic-content extras). */
export function speakFor(subject: Subject, text: string, rate = 0.92): void {
  speak(text, rate, ttsLangFor(subject))
}

/** Turtle mode: slow replay for dictation / listening exercises. */
export function speakSlow(text: string, lang = 'en-GB'): void {
  speak(text, 0.55, lang)
}

/** Subject-aware turtle replay. */
export function speakSlowFor(subject: Subject, text: string): void {
  speak(text, 0.55, ttsLangFor(subject))
}

/** Sonic's teaching voice: faster and brighter than the default narration so
 *  the slideshow sounds like Sonic talking (PLAN 92). Pass `lang` for subject
 *  lessons (PLAN 124: german -> de-DE, arabic/religion/social -> ar-EG via
 *  `ttsLangFor`) so the narrator speaks the lesson's language, not English.
 *  Silent no-op without TTS. */
export function speakAsSonic(text: string, lang = 'en-GB'): void {
  if (!ttsAvailable() || !text) return
  try {
    const chain = ++speakChain
    window.speechSynthesis.cancel()
    const segments = segmentByScript(text)
    const runs = segments.length > 0 ? segments : [{ text, script: 'latin' as const }]
    runs.forEach((run) => {
      const runLang = run.script === 'arabic' ? 'ar-EG' : lang
      const u = new SpeechSynthesisUtterance(run.text)
      const v = bestVoice(runLang)
      if (v) u.voice = v
      u.lang = v?.lang ?? runLang
      u.rate = 1.05
      u.pitch = 1.4
      u.onstart = () => {
        if (chain !== speakChain) window.speechSynthesis.cancel()
      }
      window.speechSynthesis.speak(u)
    })
  } catch {
    /* ignore */
  }
}

export function stopSpeaking(): void {
  if (ttsAvailable()) {
    try {
      window.speechSynthesis.cancel()
    } catch {
      /* ignore */
    }
  }
}
