import { describe, expect, it } from 'vitest'
import { buildSlideDeck, exampleFromQuestion, slideMinSeconds } from '../src/engine/slideshow'
import { getCurriculum } from '../src/content/registry'
import type { McqQuestion, TrueFalseQuestion, TypeNumberQuestion } from '../src/content/types'

describe('slideMinSeconds (anti-skip timer)', () => {
  it('floors every slide at 4 seconds', () => {
    expect(slideMinSeconds('')).toBe(4)
    expect(slideMinSeconds('Hi!')).toBe(4)
    expect(slideMinSeconds('One two three four.')).toBe(4)
  })

  it('scales ~0.45s per word for mid-length slides', () => {
    const ten = Array.from({ length: 10 }, (_, i) => `w${i}`).join(' ')
    expect(slideMinSeconds(ten)).toBe(5) // ceil(10 * 0.45) = 5
    const sixteen = Array.from({ length: 16 }, (_, i) => `w${i}`).join(' ')
    expect(slideMinSeconds(sixteen)).toBe(8) // ceil(7.2) = 8
  })

  it('clamps long slides at 9 seconds', () => {
    const forty = Array.from({ length: 40 }, (_, i) => `word${i}`).join(' ')
    expect(slideMinSeconds(forty)).toBe(9)
  })
})

describe('exampleFromQuestion', () => {
  const mcq: McqQuestion = { kind: 'mcq', prompt: 'What is 2 + 2?', choices: ['3', '4'], answerIndex: 1 }
  const tf: TrueFalseQuestion = { kind: 'truefalse', prompt: 'True or false?', statement: '5 > 3', answer: true }
  const num: TypeNumberQuestion = { kind: 'type-number', prompt: 'How many?', answer: 7 }

  it('extracts prompt + answer for mcq / truefalse / type-number', () => {
    expect(exampleFromQuestion(mcq)).toEqual({ prompt: 'What is 2 + 2?', answer: '4' })
    expect(exampleFromQuestion(tf)).toEqual({ prompt: '5 > 3', answer: 'True ✅' })
    expect(exampleFromQuestion(num)).toEqual({ prompt: 'How many?', answer: '7' })
  })

  it('never returns an empty answer', () => {
    const ex = exampleFromQuestion(mcq)
    expect(ex?.answer.length).toBeGreaterThan(0)
  })
})

describe('buildSlideDeck', () => {
  const lesson = getCurriculum('math').units[0].lessons[0]

  it('is welcome → teach lines → examples → mission, deterministic per seed', () => {
    const deck = buildSlideDeck(lesson, 42, lesson.intro.title)
    const deck2 = buildSlideDeck(lesson, 42, lesson.intro.title)
    expect(deck).toEqual(deck2)
    expect(deck[0].kind).toBe('welcome')
    expect(deck[deck.length - 1].kind).toBe('mission')
    const teachCount = deck.filter((s) => s.kind === 'teach').length
    expect(teachCount).toBe((lesson.teach?.length ?? 0) || 1)
    const examples = deck.filter((s) => s.kind === 'example')
    expect(examples.length).toBeGreaterThan(0)
    expect(examples.length).toBeLessThanOrEqual(2)
    for (const ex of examples) {
      if (ex.kind !== 'example') throw new Error('unreachable')
      expect(ex.prompt.length).toBeGreaterThan(0)
      expect(ex.answer.length).toBeGreaterThan(0)
    }
  })

  it('every slide speaks non-empty text', () => {
    for (const s of buildSlideDeck(lesson, 7, lesson.intro.title)) {
      expect(s.text.length).toBeGreaterThan(0)
    }
  })
})
