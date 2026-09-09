import { describe, expect, it } from 'vitest'
import { buildAttemptEntry } from '../../src/engine/adaptive/model'
import {
  hardestByCode,
  lessonsToRepeat,
  recentWrong,
  retryItemsFrom,
} from '../../src/engine/adaptive/lessons'
import {
  correctAnswerText,
  questionPrompt,
  snapshotQuestion,
} from '../../src/engine/adaptive/questions'
import type {
  AdaptiveSnapshot,
  AttemptLogEntry,
} from '../../src/engine/adaptive/types'
import type { Question } from '../../src/content/types'

function emptySnap(): AdaptiveSnapshot {
  return { skills: {}, seenCodes: [], recentPicks: [], lastRecommendation: null }
}

let ts = 1000
function entry(over: Partial<AttemptLogEntry>): AttemptLogEntry {
  return buildAttemptEntry({
    lessonId: 'u1l1',
    objectiveCode: '2Nc.01',
    kind: 'type-number',
    difficulty: 1,
    answer: '5',
    correct: true,
    responseTimeMs: 2000,
    masteryBefore: 0.1,
    masteryAfter: 0.2,
    reason: 'in-lesson',
    ts: ts++,
    ...over,
  })
}

const mcq: Question = {
  kind: 'mcq',
  prompt: 'Which is 7?',
  choices: ['5', '7', '9'],
  answerIndex: 1,
}

describe('buildAttemptEntry snapshots', () => {
  it('defaults prompt/correctAnswer/q for old-style calls', () => {
    const e = entry({})
    expect(e.prompt).toBe('')
    expect(e.correctAnswer).toBe('')
    expect(e.q).toBeNull()
  })
  it('stores the snapshot when provided', () => {
    const e = entry({ correct: false, prompt: 'Which is 7?', correctAnswer: '7', q: mcq })
    expect(e.prompt).toBe('Which is 7?')
    expect(e.correctAnswer).toBe('7')
    expect(e.q).toEqual(mcq)
  })
})

describe('questionPrompt / correctAnswerText', () => {
  it('prompts never empty across kinds', () => {
    const qs: Question[] = [
      mcq,
      { kind: 'type-number', prompt: '3 + 4?', answer: 7 },
      { kind: 'match', prompt: 'Match them', pairs: [{ left: 'a', right: 'b' }] },
      { kind: 'order', prompt: 'Order them', items: ['1', '2'] },
      { kind: 'tap-count', prompt: 'Tap the stars', target: 2, targetEmoji: '⭐', cells: ['⭐', '🍎', '⭐'] },
      { kind: 'letter-tiles', prompt: 'Spell it', targetWord: 'cat' },
      { kind: 'truefalse', prompt: 'Is it so?', statement: '2+2=4', answer: true },
      { kind: 'speak', prompt: 'Read it', targetText: 'hello' },
    ]
    for (const q of qs) {
      expect(questionPrompt(q).length).toBeGreaterThan(0)
      expect(String(correctAnswerText(q)).length).toBeGreaterThan(0)
    }
  })
  it('mcq correct answer resolves the choice', () => {
    expect(correctAnswerText(mcq)).toBe('7')
  })
  it('snapshot is a deep copy', () => {
    const snap = snapshotQuestion(mcq)
    expect(snap).toEqual(mcq)
    expect(snap).not.toBe(mcq)
  })
})

describe('recentWrong', () => {
  it('returns only misses, newest first, capped', () => {
    const log = [
      entry({ correct: true, ts: 1 }),
      entry({ correct: false, ts: 2 }),
      entry({ correct: false, ts: 3 }),
      entry({ correct: true, ts: 4 }),
      entry({ correct: false, ts: 5 }),
    ]
    const w = recentWrong(log, 2)
    expect(w.map((e) => e.ts)).toEqual([5, 3])
  })
})

describe('retryItemsFrom', () => {
  it('keeps only entries with a stored question', () => {
    const withQ = entry({ correct: false, q: mcq })
    const withoutQ = entry({ correct: false, q: null })
    const items = retryItemsFrom([withQ, withoutQ])
    expect(items.length).toBe(1)
    expect(items[0]!.question).toEqual(mcq)
    expect(items[0]!.lessonId).toBe('u1l1')
    expect(items[0]!.objectiveCode).toBe('2Nc.01')
  })
})

describe('hardestByCode', () => {
  it('counts only difficulty-3 attempts', () => {
    const log = [
      entry({ objectiveCode: 'A', difficulty: 3, correct: true }),
      entry({ objectiveCode: 'A', difficulty: 3, correct: false }),
      entry({ objectiveCode: 'A', difficulty: 1, correct: false }),
      entry({ objectiveCode: 'B', difficulty: 2, correct: false }),
    ]
    const m = hardestByCode(log)
    expect(m.get('A')).toEqual({ total: 2, correct: 1 })
    expect(m.has('B')).toBe(false)
  })
})

describe('lessonsToRepeat', () => {
  it('flags a lesson flopping its hardest questions', () => {
    const log = [
      entry({ lessonId: 'u1l1', objectiveCode: 'X', difficulty: 3, correct: false, ts: 1 }),
      entry({ lessonId: 'u1l1', objectiveCode: 'X', difficulty: 3, correct: false, ts: 2 }),
      entry({ lessonId: 'u1l1', objectiveCode: 'X', difficulty: 3, correct: true, ts: 3 }),
      entry({ lessonId: 'u1l1', objectiveCode: 'X', difficulty: 1, correct: true, ts: 4 }),
    ]
    const out = lessonsToRepeat({ attempts: log, snapshot: emptySnap() })
    expect(out.length).toBe(1)
    expect(out[0]!.lessonId).toBe('u1l1')
    expect(out[0]!.hardestAccuracy).toBeCloseTo(1 / 3)
    expect(out[0]!.reasons.some((r) => r.includes('Hardest'))).toBe(true)
  })
  it('returns empty when every lesson is solid', () => {
    const log = [
      entry({ lessonId: 'u1l1', objectiveCode: 'X', difficulty: 1, correct: true, ts: 1 }),
      entry({ lessonId: 'u1l1', objectiveCode: 'X', difficulty: 1, correct: true, ts: 2 }),
      entry({ lessonId: 'u1l1', objectiveCode: 'X', difficulty: 1, correct: true, ts: 3 }),
    ]
    expect(lessonsToRepeat({ attempts: log, snapshot: emptySnap() })).toEqual([])
  })
  it('worst lesson sorts first', () => {
    const log = [
      entry({ lessonId: 'bad', objectiveCode: 'X', difficulty: 1, correct: false, ts: 1 }),
      entry({ lessonId: 'bad', objectiveCode: 'X', difficulty: 1, correct: false, ts: 2 }),
      entry({ lessonId: 'bad', objectiveCode: 'X', difficulty: 1, correct: false, ts: 3 }),
      entry({ lessonId: 'meh', objectiveCode: 'Y', difficulty: 1, correct: true, ts: 4 }),
      entry({ lessonId: 'meh', objectiveCode: 'Y', difficulty: 1, correct: false, ts: 5 }),
      entry({ lessonId: 'meh', objectiveCode: 'Y', difficulty: 1, correct: true, ts: 6 }),
    ]
    const out = lessonsToRepeat({ attempts: log, snapshot: emptySnap() })
    expect(out[0]!.lessonId).toBe('bad')
  })
})
