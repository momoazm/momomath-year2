/** Tiny Web Speech API wrapper for audio exercises (English + German + Arabic).
 *  Never throws - if TTS is unavailable every call is a silent no-op. */

import type { Subject } from '../content/types'

let cachedVoice: SpeechSynthesisVoice | null = null
let cachedLang = ''

export function ttsAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

function bestVoice(lang: string = 'en-GB'): SpeechSynthesisVoice | null {
  if (!ttsAvailable()) return null
  if (cachedVoice && cachedLang === lang) return cachedVoice
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null
  cachedLang = lang
  cachedVoice =
    voices.find((v) => v.lang === lang) ??
    voices.find((v) => v.lang.startsWith(lang.slice(0, 2))) ??
    voices[0] ??
    null
  return cachedVoice
}

if (ttsAvailable()) {
  // voices load asynchronously in some browsers
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = null
    cachedLang = ''
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
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    const v = bestVoice(lang)
    if (v) u.voice = v
    u.lang = v?.lang ?? lang
    u.rate = rate
    u.pitch = 1.05
    window.speechSynthesis.speak(u)
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
 *  the slideshow sounds like Sonic talking (PLAN 92). Silent no-op without TTS. */
export function speakAsSonic(text: string): void {
  if (!ttsAvailable() || !text) return
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    const v = bestVoice('en-GB')
    if (v) u.voice = v
    u.lang = v?.lang ?? 'en-GB'
    u.rate = 1.05
    u.pitch = 1.4
    window.speechSynthesis.speak(u)
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
