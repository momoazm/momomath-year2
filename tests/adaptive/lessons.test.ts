import { describe, expect, it } from 'vitest'
import { buildAttemptEntry, isRushedAttempt } from '../../src/engine/adaptive/model'
import { capSnapshots } from '../../src/engine/adaptive/attempts'
import {
  hardestByCode,
  lessonsToRepeat,
  MISTAKE_HINTS,
  recentWrong,
  retryItemsFrom,
  topMistakeKind,
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
    expect(e.mistakeKind).toBeNull()
    expect(e.rushed).toBe(false)
  })
  it('stores the snapshot when provided', () => {
    const e = entry({ correct: false, prompt: 'Which is 7?', correctAnswer: '7', q: mcq })
    expect(e.prompt).toBe('Which is 7?')
    expect(e.correctAnswer).toBe('7')
    expect(e.q).toEqual(mcq)
  })
  it('stores mistake kind + rushed flag for misses', () => {
    const e = entry({ correct: false, mistakeKind: 'off-by-one', rushed: true })
    expect(e.mistakeKind).toBe('off-by-one')
    expect(e.rushed).toBe(true)
  })
})

describe('isRushedAttempt', () => {
  it('flags impossibly fast answers on cold skills', () => {
    expect(isRushedAttempt(800, 0)).toBe(true)
    expect(isRushedAttempt(5000, 0)).toBe(false)
  })
  it('compares against the skill pace once known', () => {
    expect(isRushedAttempt(1500, 8000)).toBe(true)
    expect(isRushedAttempt(7000, 8000)).toBe(false)
  })
  it('never fires below the 1.2s absolute floor', () => {
    expect(isRushedAttempt(1500, 2000)).toBe(false)
  })
  it('rejects garbage input', () => {
    expect(isRushedAttempt(-5, 0)).toBe(false)
    expect(isRushedAttempt(NaN, 0)).toBe(false)
  })
})

describe('capSnapshots', () => {
  it('keeps snapshots on the newest wrong attempts only', () => {
    const log = Array.from({ length: 5 }, (_, i) =>
      entry({ correct: false, q: mcq, ts: 100 + i }),
    )
    const capped = capSnapshots(log, 2)
    expect(capped.slice(0, 3).every((e) => e.q === null)).toBe(true)
    expect(capped.slice(3).every((e) => e.q !== null)).toBe(true)
    // prompts survive the strip
    expect(capped[0]!.prompt).toBeDefined()
  })
  it('leaves correct attempts alone', () => {
    const log = [entry({ correct: true, q: mcq })]
    expect(capSnapshots(log, 0)[0]!.q).toEqual(mcq)
  })
})

describe('topMistakeKind', () => {
  it('needs 2+ identified misses to name a pattern', () => {
    expect(topMistakeKind([entry({ correct: false, mistakeKind: 'off-by-one' })])).toBeNull()
    const two = [
      entry({ correct: false, mistakeKind: 'off-by-one' }),
      entry({ correct: false, mistakeKind: 'off-by-one' }),
      entry({ correct: false, mistakeKind: 'tap-extra' }),
    ]
    expect(topMistakeKind(two)).toEqual({ kind: 'off-by-one', count: 2 })
  })
  it('ignores unknown kinds and correct attempts', () => {
    const log = [
      entry({ correct: false, mistakeKind: 'unknown' }),
      entry({ correct: false, mistakeKind: 'unknown' }),
      entry({ correct: true, mistakeKind: 'off-by-one' }),
    ]
    expect(topMistakeKind(log)).toBeNull()
  })
  it('every surfaced kind has a parent hint', () => {
    for (const k of ['off-by-one', 'place-value-swap', 'operation-confusion', 'distractor-lock-in', 'order-error', 'tap-extra'] as const) {
      expect(MISTAKE_HINTS[k].length).toBeGreaterThan(0)
    }
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
  it('surfaces misconception patterns and rushed guesses as reasons', () => {
    const log = [
      entry({ lessonId: 'u9l9', objectiveCode: 'Z', difficulty: 1, correct: false, mistakeKind: 'off-by-one', ts: 1 }),
      entry({ lessonId: 'u9l9', objectiveCode: 'Z', difficulty: 1, correct: false, mistakeKind: 'off-by-one', ts: 2 }),
      entry({ lessonId: 'u9l9', objectiveCode: 'Z', difficulty: 1, correct: false, rushed: true, ts: 3 }),
      entry({ lessonId: 'u9l9', objectiveCode: 'Z', difficulty: 1, correct: false, rushed: true, ts: 4 }),
    ]
    const out = lessonsToRepeat({ attempts: log, snapshot: emptySnap() })
    expect(out.length).toBe(1)
    expect(out[0]!.topMistake).toEqual({ kind: 'off-by-one', count: 2 })
    expect(out[0]!.rushedCount).toBe(2)
    expect(out[0]!.reasons.some((r) => r.includes('one away'))).toBe(true)
    expect(out[0]!.reasons.some((r) => r.includes('rushed'))).toBe(true)
  })
})

describe('recordAdaptiveAttempt writes back BKT state', () => {
  it('updates snapshot skills, recency, log, and history together', async () => {
    const { usePlayer } = await import('../../src/engine/store')
    usePlayer.setState({
      adaptive: {
        snapshot: { skills: {}, seenCodes: [], recentPicks: [], lastRecommendation: null },
        attempts: [],
        masteryHistory: {},
        telemetry: {
          llmRequests: 0, llmHits: 0, llmFallbacks: 0,
          lastLlmProvider: null, lastLlmLatencyMs: null,
          recommended: 0, recommendedAccepted: 0,
        },
      },
    })
    const { recordAttempt } = await import('../../src/engine/adaptive/model')
    const { withUpdatedDifficulty } = await import('../../src/engine/adaptive/difficulty')
    const snap0 = usePlayer.getState().adaptive.snapshot
    const r = recordAttempt(snap0, '2Nc.01', true, 'type-number', 3000, 9999)
    const skill = withUpdatedDifficulty(r.snap.skills['2Nc.01']!)
    const e = entry({ objectiveCode: '2Nc.01', correct: true, ts: 9999 })
    usePlayer.getState().recordAdaptiveAttempt(e, skill, '2Nc.01')
    const s = usePlayer.getState().adaptive
    // mastery actually moved (the old code froze it at the prior)
    expect(s.snapshot.skills['2Nc.01']!.attempts).toBe(1)
    expect(s.snapshot.skills['2Nc.01']!.pL).toBeGreaterThan(0.15)
    expect(s.snapshot.seenCodes).toContain('2Nc.01')
    expect(s.snapshot.recentPicks[0]).toBe('2Nc.01')
    expect(s.attempts.length).toBe(1)
    expect(s.masteryHistory['2Nc.01']!.length).toBe(1)
  })
})
