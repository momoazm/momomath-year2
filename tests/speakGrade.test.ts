import { describe, expect, it } from 'vitest'
import { gradeSpeak, normWords, wordMatchScore, SPEAK_PASS_SCORE } from '../src/engine/speakGrade'

describe('speakGrade', () => {
  it('normWords keeps unicode letters (Arabic, umlauts) and drops punctuation', () => {
    expect(normWords('Hello, world!')).toEqual(['hello', 'world'])
    expect(normWords('Ich liebe Grüße.')).toEqual(['ich', 'liebe', 'grüße'])
    expect(normWords('مرحبا يا صديقي')).toEqual(['مرحبا', 'يا', 'صديقي'])
    expect(normWords('')).toEqual([])
  })

  it('wordMatchScore is order-free fraction of target hits', () => {
    expect(wordMatchScore(['the', 'cat', 'sat'], ['the', 'cat'])).toBe(1)
    expect(wordMatchScore(['sat', 'the'], ['the', 'cat'])).toBe(0.5)
    expect(wordMatchScore([], ['a'])).toBe(0)
    expect(wordMatchScore(['x'], [])).toBe(0)
  })

  it('gradeSpeak passes a close match and fails an unrelated transcript', () => {
    const ok = gradeSpeak('The cat sat on the mat.', 'the cat sat on the mat')
    expect(ok.ok).toBe(true)
    expect(ok.score).toBeGreaterThanOrEqual(SPEAK_PASS_SCORE)

    const bad = gradeSpeak('completely different words', 'the cat sat on the mat')
    expect(bad.ok).toBe(false)
    expect(bad.score).toBeLessThan(SPEAK_PASS_SCORE)
  })

  it('gradeSpeak tolerates partial ASR errors at the pass threshold', () => {
    // 3/5 unique target words present = 0.6 exactly
    const g = gradeSpeak('cat sat mat', 'the cat sat on mat')
    expect(g.score).toBeCloseTo(SPEAK_PASS_SCORE, 10)
    expect(g.ok).toBe(true)
  })
})
