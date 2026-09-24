import { describe, expect, it } from 'vitest'
import { ttsLangFor } from '../src/engine/tts'

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
