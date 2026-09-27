import { describe, expect, it } from 'vitest'
import {
  CHECKUP_DUE_MAX,
  CHECKUP_SIZE,
  CHECKUP_WRONG_MAX,
  buildCheckup,
  dueSkillCodes,
} from '../../src/engine/adaptive'
import { buildCatalog } from '../../src/engine/adaptive/catalog'
import { questionKey } from '../../src/content/lessonQueue'
import type { Question } from '../../src/content/types'
import type {
  AdaptiveSnapshot,
  AttemptLogEntry,
  SkillState,
} from '../../src/engine/adaptive/types'

const NOW = 1_760_000_000_000 // pinned epoch so runs never drift
const DAY = 24 * 60 * 60 * 1000
const YEAR = 365 * DAY

function skill(partial: Partial<SkillState> = {}): SkillState {
  return {
    pL: 0.6,
    attempts: 3,
    correct: 2,
    incorrect: 1,
    recent: [true, false, true],
    trend: 0.66,
    lastPracticedAt: NOW - YEAR, // far enough past any spaced interval
    avgResponseMs: 5000,
    difficulty: 1,
    streakCorrect: 1,
    streakWrong: 0,
    firstSeenAt: NOW - YEAR,
    ...partial,
  }
}

function snapshot(skills: Record<string, SkillState>): AdaptiveSnapshot {
  return {
    skills,
    seenCodes: Object.keys(skills),
    recentPicks: [],
    lastRecommendation: null,
  }
}

function wrongAttempt(partial: Partial<AttemptLogEntry> = {}): AttemptLogEntry {
  const base: AttemptLogEntry = {
    ts: NOW - 1000,
    lessonId: 'u1-l1',
    objectiveCode: '2Nc.01',
    kind: 'type-number',
    difficulty: 1,
    answer: '3',
    correct: false,
    responseTimeMs: 4000,
    masteryBefore: 0.5,
    masteryAfter: 0.4,
    reason: 'in-lesson',
    prompt: 'What is 2 + 1?',
    correctAnswer: '3',
    ...partial,
  }
  if (!base.q) {
    base.q = {
      kind: 'type-number',
      prompt: base.prompt,
      answer: Number(base.answer),
    } as unknown as Question
  }
  return base
}

/** Real objective codes from the live math catalog (lessonForCode must
 *  resolve them, or questionForCode skips the item). Codes get decreasing
 *  lastPracticedAt so due order equals the slice order (oldest first). */
const MATH_CODES = [...new Set(buildCatalog('math').map((e) => e.code))]
function dueSkills(codes: string[]): Record<string, SkillState> {
  return Object.fromEntries(
    codes.map((c, i) => [c, skill({ lastPracticedAt: NOW - (400 - i) * DAY })]),
  )
}

describe('dueSkillCodes (due-selection determinism)', () => {
  it('returns most-overdue first and never cold skills', () => {
    const skills = {
      fresh: skill({ lastPracticedAt: NOW - 60_000 }), // practised minutes ago
      old: skill({ lastPracticedAt: NOW - 40 * DAY }),
      oldest: skill({ lastPracticedAt: NOW - 90 * DAY }),
      cold: skill({ lastPracticedAt: 0, attempts: 0 }),
    }
    const due = dueSkillCodes(snapshot(skills), NOW)
    expect(due).toEqual(['oldest', 'old'])
    expect(due).not.toContain('fresh')
    expect(due).not.toContain('cold')
  })

  it('breaks lastPracticedAt ties on code, not object insertion order', () => {
    const a = skill({ lastPracticedAt: NOW - 30 * DAY })
    const b = skill({ lastPracticedAt: NOW - 30 * DAY })
    const forward = dueSkillCodes(snapshot({ zeta: a, alpha: b }), NOW)
    const backward = dueSkillCodes(snapshot({ alpha: b, zeta: a }), NOW)
    expect(forward).toEqual(['alpha', 'zeta'])
    expect(backward).toEqual(forward)
  })

  it('is a pure function (same input twice, no mutation)', () => {
    const snap = snapshot({ '2Nc.01': skill(), '2Np.03': skill({ pL: 0.9 }) })
    const before = JSON.stringify(snap)
    const first = dueSkillCodes(snap, NOW)
    const second = dueSkillCodes(snap, NOW)
    expect(second).toEqual(first)
    expect(JSON.stringify(snap)).toBe(before)
  })
})

describe('buildCheckup (session composition)', () => {
  it('builds nothing when no skill is due and nothing was missed', () => {
    const session = buildCheckup({
      snap: snapshot({ '2Nc.01': skill({ lastPracticedAt: NOW - 60_000 }) }),
      attempts: [],
      now: NOW,
      seed: 7,
    })
    expect(session.items).toEqual([])
    expect(session.dueCodes).toEqual([])
    expect(session.wrongCount).toBe(0)
  })

  it('interleaves due-skill items with wrong-question snapshots (due first)', () => {
    const codes = MATH_CODES.slice(0, 3)
    const attempts = [
      wrongAttempt({ ts: NOW - 3000, objectiveCode: codes[0], prompt: 'miss A' }),
      wrongAttempt({ ts: NOW - 2000, objectiveCode: codes[1], prompt: 'miss B' }),
    ]
    const session = buildCheckup({
      snap: snapshot(dueSkills(codes)),
      attempts,
      now: NOW,
      seed: 11,
    })
    expect(session.dueCodes).toEqual(codes)
    expect(session.items.length).toBeGreaterThanOrEqual(5)
    expect(session.items[0].objectiveCode).toBe(codes[0]) // due first
    expect(session.items[1].objectiveCode).toBe(codes[1]) // then the newest miss
    expect(session.wrongCount).toBe(2)
    for (const item of session.items.slice(0, 3)) {
      expect(item.lessonId).toBeTruthy()
      expect(item.question).toBeTruthy()
    }
  })

  it('caps due items at CHECKUP_DUE_MAX and the round at CHECKUP_SIZE', () => {
    const codes = MATH_CODES.slice(0, CHECKUP_DUE_MAX + 3)
    const session = buildCheckup({
      snap: snapshot(dueSkills(codes)),
      attempts: [],
      now: NOW,
      seed: 3,
    })
    expect(session.dueCodes.length).toBe(CHECKUP_DUE_MAX)
    expect(session.dueCodes).toEqual(codes.slice(0, CHECKUP_DUE_MAX))
    expect(session.items.length).toBeLessThanOrEqual(CHECKUP_SIZE)
    expect(session.wrongCount).toBe(0)
  })

  it('caps wrong-question snapshots at CHECKUP_WRONG_MAX and dedupes repeats', () => {
    const code = MATH_CODES[0]
    const attempts = Array.from({ length: CHECKUP_WRONG_MAX + 3 }, (_, i) =>
      wrongAttempt({ ts: NOW - 1000 - i, objectiveCode: code }),
    )
    const session = buildCheckup({
      snap: snapshot(dueSkills([code])),
      attempts,
      now: NOW,
      seed: 5,
    })
    const fingerprints = new Set(session.items.map((i) => questionKey(i.question)))
    expect(fingerprints.size).toBe(session.items.length) // no duplicate questions
    // identical payloads collapse to one slot (same prompt + code + answer)
    expect(session.wrongCount).toBe(1)
    expect(session.wrongCount).toBeLessThanOrEqual(CHECKUP_WRONG_MAX)
  })

  it('is seed-stable: the same seed rebuilds the same round', () => {
    const codes = MATH_CODES.slice(0, 4)
    const attempts = [wrongAttempt({ objectiveCode: codes[2], prompt: 'seed miss' })]
    const input = {
      snap: snapshot(dueSkills(codes)),
      attempts,
      now: NOW,
      seed: 99,
    }
    const a = buildCheckup(input)
    const b = buildCheckup(input)
    expect(a.dueCodes).toEqual(b.dueCodes)
    expect(a.wrongCount).toBe(b.wrongCount)
    expect(a.items.map((i) => questionKey(i.question))).toEqual(b.items.map((i) => questionKey(i.question)))
    expect(a.items.length).toBeGreaterThan(0)
  })

  it('never mutates the input snapshot or attempt log', () => {
    const codes = MATH_CODES.slice(0, 2)
    const snap = snapshot(dueSkills(codes))
    const attempts = [wrongAttempt({ objectiveCode: codes[0] })]
    const snapBefore = JSON.stringify(snap)
    const attemptsBefore = JSON.stringify(attempts)
    buildCheckup({ snap, attempts, now: NOW, seed: 1 })
    expect(JSON.stringify(snap)).toBe(snapBefore)
    expect(JSON.stringify(attempts)).toBe(attemptsBefore)
  })
})
