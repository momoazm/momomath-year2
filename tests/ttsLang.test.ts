import { describe, expect, it } from 'vitest'
import { rankVoices, segmentByScript, speakAsSonic, speakFor, ttsLangFor } from '../src/engine/tts'

describe('ttsLangFor subject locale map', () => {
  it('maps core subjects to en-GB', () => {
    expect(ttsLangFor('math')).toBe('en-GB')
    expect(ttsLangFor('english')).toBe('en-GB')
    expect(ttsLangFor('science')).toBe('en-GB')
  })

  it('maps the German extra to de-DE', () => {
    expect(ttsLangFor('german')).toBe('de-DE')
  })

  it('maps Arabic-content extras (arabic/religion/social) to ar-EG', () => {
    expect(ttsLangFor('arabic')).toBe('ar-EG')
    expect(ttsLangFor('religion')).toBe('ar-EG')
    expect(ttsLangFor('social')).toBe('ar-EG')
  })
})

describe('speakAsSonic lang argument (PLAN 124)', () => {
  it('uses the passed lang, defaulting to en-GB', () => {
    const g = globalThis as Record<string, unknown>
    const hadWindow = 'window' in g
    const prevWindow = g.window
    const spoken: string[] = []
    const scope = (g.window ?? g) as Record<string, unknown>
    if (!hadWindow) g.window = scope
    const prevSynth = scope['speechSynthesis']
    const prevUtter = g['SpeechSynthesisUtterance']
    scope['speechSynthesis'] = {
      cancel: () => {},
      getVoices: () => [],
      speak: (u: { lang: string }) => spoken.push(String(u.lang)),
    }
    g['SpeechSynthesisUtterance'] = class {
      lang = ''
      rate = 1
      pitch = 1
      voice: unknown = null
      constructor(public text: string) {}
    }
    try {
      speakAsSonic('hello') // default en-GB
      speakAsSonic('hallo', 'de-DE')
    } finally {
      if (prevSynth === undefined) delete scope['speechSynthesis']
      else scope['speechSynthesis'] = prevSynth
      if (prevUtter === undefined) delete g['SpeechSynthesisUtterance']
      else g['SpeechSynthesisUtterance'] = prevUtter
      if (!hadWindow) delete g['window']
      else g.window = prevWindow
    }
    expect(spoken).toEqual(['en-GB', 'de-DE'])
  })
})

describe('segmentByScript bilingual runs (PLAN 153)', () => {
  it('keeps pure English as one Latin run', () => {
    expect(segmentByScript('Count the apples')).toEqual([{ text: 'Count the apples', script: 'latin' }])
  })

  it('keeps pure Arabic as one Arabic run', () => {
    expect(segmentByScript('صل الكلمة بالصورة')).toEqual([{ text: 'صل الكلمة بالصورة', script: 'arabic' }])
  })

  it('splits mixed English and Arabic into ordered runs', () => {
    expect(segmentByScript('Say مرحبا now')).toEqual([
      { text: 'Say', script: 'latin' },
      { text: 'مرحبا', script: 'arabic' },
      { text: 'now', script: 'latin' },
    ])
  })

  it('attaches digits and emoji to the surrounding text run', () => {
    expect(segmentByScript('Tap 3 🍎 now')).toEqual([{ text: 'Tap 3 🍎 now', script: 'latin' }])
    expect(segmentByScript('عد ٣ 🍎 الآن')).toEqual([{ text: 'عد ٣ 🍎 الآن', script: 'arabic' }])
  })

  it('never emits whitespace-only or empty punctuation runs', () => {
    expect(segmentByScript('   ')).toEqual([])
    expect(segmentByScript('...')).toEqual([])
    expect(segmentByScript('Hi ... there')).toEqual([{ text: 'Hi ... there', script: 'latin' }])
  })

  it('speaks one utterance per run with the run language', () => {
    const g = globalThis as Record<string, unknown>
    const scope = (g.window ?? g) as Record<string, unknown>
    const hadWindow = 'window' in g
    const prevWindow = g.window
    const utterances: { text: string; lang: string }[] = []
    if (!hadWindow) g.window = scope
    const prevSynth = scope['speechSynthesis']
    const prevUtter = g['SpeechSynthesisUtterance']
    scope['speechSynthesis'] = {
      cancel: () => {},
      getVoices: () => [],
      speak: (u: { text: string; lang: string }) => utterances.push({ text: String(u.text), lang: String(u.lang) }),
    }
    g['SpeechSynthesisUtterance'] = class {
      lang = ''
      rate = 1
      pitch = 1
      voice: unknown = null
      onstart: (() => void) | null = null
      constructor(public text: string) {}
    }
    try {
      speakAsSonic('Say مرحبا now')
    } finally {
      if (prevSynth === undefined) delete scope['speechSynthesis']
      else scope['speechSynthesis'] = prevSynth
      if (prevUtter === undefined) delete g['SpeechSynthesisUtterance']
      else g['SpeechSynthesisUtterance'] = prevUtter
      if (!hadWindow) delete g['window']
      else g.window = prevWindow
    }
    expect(utterances.map((u) => u.lang)).toEqual(['en-GB', 'ar-EG', 'en-GB'])
    expect(utterances.map((u) => u.text)).toEqual(['Say', 'مرحبا', 'now'])
  })
})

describe('rankVoices preferences (PLAN 153)', () => {
  const voices = [
    { name: 'English Default', lang: 'en-US', localService: true, default: true },
    { name: 'Google US English', lang: 'en-US', localService: false },
    { name: 'Google Deutsch', lang: 'de-DE', localService: false },
    { name: 'Microsoft Lina - Arabic (Egypt)', lang: 'ar-EG', localService: false },
    { name: 'eSpeak Robot', lang: 'ar-EG', localService: true },
  ]

  it('prefers an exact Arabic voice over the English default', () => {
    const picked = rankVoices(voices, 'ar-EG')
    expect(picked.voice).not.toBeNull()
    expect((picked.voice as unknown as { lang: string }).lang).toBe('ar-EG')
    expect((picked.voice as unknown as { name: string }).name).toContain('Microsoft Lina')
  })

  it('prefers local over remote when the language matches', () => {
    const picked = rankVoices(
      [
        { name: 'Google Deutsch', lang: 'de-DE', localService: false },
        { name: 'Deutsch Kind', lang: 'de-DE', localService: true },
      ],
      'de-DE',
    )
    expect((picked.voice as unknown as { name: string }).name).toBe('Deutsch Kind')
  })

  it('returns null with an empty voice list instead of throwing', () => {
    expect(rankVoices([], 'ar-EG').voice).toBeNull()
  })

  it('lets german lessons mix German and English across queued utterances', () => {
    const g = globalThis as Record<string, unknown>
    const scope = (g.window ?? g) as Record<string, unknown>
    const hadWindow = 'window' in g
    const prevWindow = g.window
    const utterances: { text: string; lang: string; rate: number; pitch: number }[] = []
    if (!hadWindow) g.window = scope
    const prevSynth = scope['speechSynthesis']
    const prevUtter = g['SpeechSynthesisUtterance']
    scope['speechSynthesis'] = {
      cancel: () => {},
      getVoices: () => [{ name: 'Deutsch', lang: 'de-DE', localService: true }],
      speak: (u: { text: string; lang: string; rate: number; pitch: number }) =>
        utterances.push({ text: String(u.text), lang: String(u.lang), rate: Number(u.rate), pitch: Number(u.pitch) }),
    }
    g['SpeechSynthesisUtterance'] = class {
      lang = ''
      rate = 1
      pitch = 1
      voice: unknown = null
      onstart: (() => void) | null = null
      constructor(public text: string) {}
    }
    try {
      speakFor('german', 'Apfel apple Apfel')
    } finally {
      if (prevSynth === undefined) delete scope['speechSynthesis']
      else scope['speechSynthesis'] = prevSynth
      if (prevUtter === undefined) delete g['SpeechSynthesisUtterance']
      else g['SpeechSynthesisUtterance'] = prevUtter
      if (!hadWindow) delete g['window']
      else g.window = prevWindow
    }
    expect(utterances.length).toBeGreaterThan(0)
    expect(utterances.every((u) => u.lang === 'de-DE')).toBe(true)
    expect(utterances.map((u) => u.text).join(' ')).toContain('Apfel')
  })
})
