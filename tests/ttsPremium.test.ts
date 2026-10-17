import { describe, expect, it } from 'vitest'
import {
  PREMIUM_VOICES,
  TTS_VERSION,
  normalizeSpeechText,
  premiumFingerprint,
  premiumKey,
  premiumPlan,
  premiumUrl,
  premiumVoiceFor,
} from '../src/engine/ttsPremium'

describe('normalizeSpeechText (Phase 36)', () => {
  it('collapses whitespace runs and trims', () => {
    expect(normalizeSpeechText('  Hello \n\t world  ')).toBe('Hello world')
  })

  it('strips control + zero-width characters without touching speech content', () => {
    expect(normalizeSpeechText('a\u200b\u200eb')).toBe('ab')
    expect(normalizeSpeechText('Say مرحبا now')).toBe('Say مرحبا now')
  })

  it('keeps case, punctuation, digits and emoji', () => {
    expect(normalizeSpeechText('Tap 3 🍎 now!')).toBe('Tap 3 🍎 now!')
  })

  it('normalizes to NFC', () => {
    expect(normalizeSpeechText('e\u0301')).toBe('\u00e9')
  })

  it('is idempotent', () => {
    const once = normalizeSpeechText(' a   b ')
    expect(normalizeSpeechText(once)).toBe(once)
  })
})

describe('premiumKey (Phase 36)', () => {
  it('is null for locales without a configured voice or empty text', () => {
    expect(premiumKey('Hello', 'fr-FR', 'narrator')).toBeNull()
    expect(premiumKey('', 'en-GB', 'narrator')).toBeNull()
    expect(premiumKey('   ', 'en-GB', 'narrator')).toBeNull()
  })

  it('is stable across whitespace noise and differs by text, lang and profile', () => {
    const key = premiumKey('Hello  there', 'en-GB', 'narrator')
    expect(key).not.toBeNull()
    expect(premiumKey(' Hello there ', 'en-GB', 'narrator')).toBe(key)
    expect(premiumKey('Hello there', 'en-GB', 'sonic')).not.toBe(key)
    expect(premiumKey('Hello there!', 'en-GB', 'narrator')).not.toBe(key)
    expect(premiumKey('Hello there', 'ar-EG', 'narrator')).not.toBe(key)
  })

  it('is a fixed-width base36 string (filesystem-safe filename)', () => {
    const key = premiumKey('Hello', 'en-GB', 'narrator')!
    expect(key).toMatch(/^[0-9a-z]{14}$/)
  })
})

describe('premiumUrl (Phase 36)', () => {
  it('serves clips under the app base path', () => {
    expect(premiumUrl('abc123def456gh')).toContain('tts/abc123def456gh.mp3')
  })
})

describe('premiumPlan (all-or-nothing per utterance)', () => {
  const runs = [
    { text: 'Hello', lang: 'en-GB' },
    { text: 'مرحبا', lang: 'ar-EG' },
  ]

  it('returns a plan only when EVERY run has a clip', () => {
    const keys = runs.map((r) => premiumKey(r.text, r.lang, 'narrator')!) as string[]
    expect(keys.every(Boolean)).toBe(true)
    const plan = premiumPlan(runs, 'narrator', (k) => keys.includes(k))
    expect(plan).not.toBeNull()
    expect(plan!.srcs.length).toBe(2)
    expect(plan!.srcs[0]).toContain(`${keys[0]}.mp3`)
    expect(plan!.srcs[1]).toContain(`${keys[1]}.mp3`)
  })

  it('falls back (null) when a single run is missing', () => {
    const first = premiumKey(runs[0].text, runs[0].lang, 'narrator')!
    expect(premiumPlan(runs, 'narrator', (k) => k === first)).toBeNull()
  })

  it('is null for empty input', () => {
    expect(premiumPlan([], 'narrator', () => true)).toBeNull()
  })
})

describe('voice table + manifest fingerprint (Phase 36)', () => {
  it('has narrator and sonic voices for en-GB, ar-EG and de-DE', () => {
    for (const lang of ['en-GB', 'ar-EG', 'de-DE']) {
      expect(premiumVoiceFor(lang, 'narrator'), `${lang} narrator`).toBeTruthy()
      expect(premiumVoiceFor(lang, 'sonic'), `${lang} sonic`).toBeTruthy()
    }
  })

  it('exposes a stable fingerprint and a non-empty version', () => {
    expect(TTS_VERSION.length).toBeGreaterThan(0)
    expect(premiumFingerprint()).toMatch(/^[0-9a-z]{5,8}$/)
    expect(PREMIUM_VOICES['en-GB'].narrator).toBeTruthy()
  })
})
