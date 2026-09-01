import { describe, expect, it } from 'vitest'
import { classifyMistake } from '../../src/engine/adaptive/mistakes'
import type { Question } from '../../src/content/types'

const Q_TYPE: Question = {
  kind: 'type-number',
  prompt: 'What is 5 + 3?',
  answer: 8,
}

const Q_MCQ: Question = {
  kind: 'mcq',
  prompt: 'Which is bigger?',
  choices: ['3', '5', '7', '9'],
  answerIndex: 3,
}

describe('classifyMistake (type-number)', () => {
  it('off-by-one is identified', () => {
    const r = classifyMistake(Q_TYPE, '7', '8')
    expect(r.kind).toBe('off-by-one')
    expect(r.identified).toBe(true)
  })
  it('place-value swap (32 vs 23) is identified', () => {
    const q: Question = { kind: 'type-number', prompt: 'Tens & ones', answer: 32 }
    const r = classifyMistake(q, '23', '32')
    expect(r.kind).toBe('place-value-swap')
  })
  it('random wrong returns unknown and never claims a misconception', () => {
    const r = classifyMistake(Q_TYPE, '47', '8')
    expect(r.kind).toBe('unknown')
    expect(r.identified).toBe(false)
  })
})

describe('classifyMistake (mcq)', () => {
  it('returns distractor-lock-in for any wrong MCQ pick', () => {
    const r = classifyMistake(Q_MCQ, '0', '3') // 0 means picked '3' which is wrong (correct = index 3 = '9')
    expect(r.kind).toBe('distractor-lock-in')
    expect(r.identified).toBe(true)
  })
})

describe('template always non-empty', () => {
  it('every classification returns a non-empty template', () => {
    const r1 = classifyMistake(Q_TYPE, '7', '8')
    const r2 = classifyMistake(Q_TYPE, '47', '8')
    const r3 = classifyMistake(Q_MCQ, '0', '3')
    expect(r1.template.length).toBeGreaterThan(0)
    expect(r2.template.length).toBeGreaterThan(0)
    expect(r3.template.length).toBeGreaterThan(0)
  })
})
