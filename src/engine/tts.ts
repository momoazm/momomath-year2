/** Tiny Web Speech API wrapper for English audio exercises.
 *  Never throws - if TTS is unavailable every call is a silent no-op. */

let cachedVoice: SpeechSynthesisVoice | null = null

export function ttsAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

function bestVoice(): SpeechSynthesisVoice | null {
  if (!ttsAvailable()) return null
  if (cachedVoice) return cachedVoice
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null
  cachedVoice =
    voices.find((v) => v.lang === 'en-GB') ??
    voices.find((v) => v.lang.startsWith('en')) ??
    voices[0]
  return cachedVoice
}

if (ttsAvailable()) {
  // voices load asynchronously in some browsers
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = null
    bestVoice()
  }
}

export function speak(text: string, rate = 0.92): void {
  if (!ttsAvailable() || !text) return
  try {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    const v = bestVoice()
    if (v) u.voice = v
    u.lang = v?.lang ?? 'en-GB'
    u.rate = rate
    u.pitch = 1.05
    window.speechSynthesis.speak(u)
  } catch {
    /* ignore */
  }
}

/** Turtle mode: slow replay for dictation / listening exercises. */
export function speakSlow(text: string): void {
  speak(text, 0.55)
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
