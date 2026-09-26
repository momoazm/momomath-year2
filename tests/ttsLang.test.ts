import { describe, expect, it } from 'vitest'
import { speakAsSonic, ttsLangFor } from '../src/engine/tts'

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
