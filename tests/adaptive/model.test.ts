import { describe, expect, it } from 'vitest'
import { ADAPTIVE_CONFIG } from '../../src/engine/adaptive/config'
import {
  bktPosterior,
  bktTransition,
  buildAttemptEntry,
  ensureSkill,
  newSkillState,
  overallAccuracy,
  recentAccuracy,
  recordAttempt,
  trendLabel,
  updateSkill,
} from '../../src/engine/adaptive/model'
import type { AdaptiveSnapshot } from '../../src/engine/adaptive/types'

function emptySnap(): AdaptiveSnapshot {
  return { skills: {}, seenCodes: [], recentPicks: [], lastRecommendation: null }
}

describe('BKT posterior', () => {
  it('correct on already-known skill moves mastery up sharply', () => {
    const p = bktPosterior(0.9, true, 0.12, 0.25)
    expect(p).toBeGreaterThan(0.9)
  })

  it('correct on cold-start skill moves mastery up modestly', () => {
    const p = bktPosterior(0.15, true, 0.12, 0.25)
    // formula: 0.15 * 0.88 / (0.15*0.88 + 0.85*0.25) ≈ 0.38
    expect(p).toBeGreaterThan(0.3)
    expect(p).toBeLessThan(0.5)
  })

  it('wrong on already-known skill lowers the posterior below prior', () => {
    // pL=0.9, slip=0.12, guess=0.25 → posterior ≈ 0.59 — the right answer to the
    // "did they slip?" question is "less sure than before", which is exactly what
    // BKT encodes: high prior + wrong = ~0.6.
    const p = bktPosterior(0.9, false, 0.12, 0.25)
    expect(p).toBeLessThan(0.9)
    expect(p).toBeGreaterThan(0.5)
  })

  it('wrong on cold-start skill barely moves mastery (guess explanation)', () => {
    const p = bktPosterior(0.15, false, 0.12, 0.25)
    // 0.15 * 0.12 / (0.15*0.12 + 0.85*0.75) ≈ 0.027
    expect(p).toBeLessThan(0.15)
  })

  it('posterior is bounded in [0, 1]', () => {
    for (let i = 0; i < 20; i++) {
      const p = bktPosterior(Math.random(), Math.random() < 0.5, 0.12, 0.25)
      expect(p).toBeGreaterThanOrEqual(0)
      expect(p).toBeLessThanOrEqual(1)
    }
  })
})

describe('BKT transition', () => {
  it('moves P(L) toward 1 by P(T) of the remaining gap', () => {
    const p = bktTransition(0.5, 0.12)
    expect(p).toBeCloseTo(0.5 + 0.5 * 0.12, 6)
  })
  it('is monotone in pLGivenOutcome', () => {
    const lo = bktTransition(0.3, 0.12)
    const hi = bktTransition(0.7, 0.12)
    expect(hi).toBeGreaterThan(lo)
  })
})

describe('updateSkill / recordAttempt (5/5 correct scenario)', () => {
  it('drives mastery to high after 5 corrects on type-number', () => {
    let s = newSkillState(0)
    for (let i = 0; i < 5; i++) {
      s = updateSkill(s, true, 'type-number', 4000, i + 1)
    }
    expect(s.attempts).toBe(5)
    expect(s.correct).toBe(5)
    expect(s.pL).toBeGreaterThan(0.8)
    expect(s.streakCorrect).toBe(5)
    expect(s.streakWrong).toBe(0)
  })
})

describe('updateSkill (2/6 correct scenario)', () => {
  it('mastery stays low after 4 wrongs', () => {
    let s = newSkillState(0)
    // C, W, C, W, W, W
    const seq = [true, false, true, false, false, false]
    for (let i = 0; i < seq.length; i++) {
      s = updateSkill(s, seq[i]!, 'type-number', 5000, i + 1)
    }
    expect(s.attempts).toBe(6)
    expect(s.correct).toBe(2)
    expect(s.incorrect).toBe(4)
    // 2/6 is below target; mastery should stay modest
    expect(s.pL).toBeLessThan(0.4)
  })
})

describe('recordAttempt', () => {
  it('returns before/after and updates snapshot', () => {
    const snap = emptySnap()
    const r1 = recordAttempt(snap, '2Nc.01', true, 'type-number', 3000, 1)
    expect(r1.before).toBe(ADAPTIVE_CONFIG.P_L0)
    expect(r1.after).toBeGreaterThan(r1.before)
    expect(r1.snap.seenCodes).toEqual(['2Nc.01'])
    expect(r1.snap.skills['2Nc.01']?.attempts).toBe(1)

    // follow-up wrong — mastery should drop (or at least not rise as much)
    const r2 = recordAttempt(r1.snap, '2Nc.01', false, 'type-number', 3000, 2)
    expect(r2.after).toBeLessThan(r2.before)
  })
})

describe('ensureSkill', () => {
  it('creates a fresh skill if missing', () => {
    const { snap, skill } = ensureSkill(emptySnap(), '2Nc.01', 100)
    expect(snap.skills['2Nc.01']).toBeDefined()
    expect(skill.pL).toBe(ADAPTIVE_CONFIG.P_L0)
    expect(skill.firstSeenAt).toBe(100)
  })
  it('returns existing skill if present (no mutation)', () => {
    const first = ensureSkill(emptySnap(), '2Nc.01', 100)
    const second = ensureSkill(first.snap, '2Nc.01', 999)
    expect(second.snap).toBe(first.snap)
    expect(second.skill.firstSeenAt).toBe(100)
  })
})

describe('recentAccuracy & trendLabel', () => {
  it('recentAccuracy uses the rolling window', () => {
    let s = newSkillState(0)
    for (let i = 0; i < 12; i++) {
      s = updateSkill(s, i < 2, 'type-number', 1000, i + 1)
    }
    // 2 corrects in the first 10, then more wrongs. recent window is 10.
    expect(recentAccuracy(s)).toBeLessThan(0.3)
  })
  it('trendLabel says cold before 3 attempts', () => {
    const s = newSkillState(0)
    expect(trendLabel(s)).toBe('cold')
  })
  it('trendLabel distinguishes improving vs flat', () => {
    let s = newSkillState(0)
    // first wrong, then right, then right — recent>trend => improving
    s = updateSkill(s, false, 'type-number', 1000, 1)
    s = updateSkill(s, true, 'type-number', 1000, 2)
    s = updateSkill(s, true, 'type-number', 1000, 3)
    expect(trendLabel(s)).toBe('improving')
  })
})

describe('overallAccuracy', () => {
  it('returns 0 when no attempts', () => {
    expect(overallAccuracy(newSkillState())).toBe(0)
  })
})

describe('buildAttemptEntry', () => {
  it('produces a complete log entry', () => {
    const e = buildAttemptEntry({
      lessonId: 'u1l1',
      objectiveCode: '2Nc.01',
      kind: 'type-number',
      difficulty: 1,
      answer: '5',
      correct: true,
      responseTimeMs: 2000,
      masteryBefore: 0.2,
      masteryAfter: 0.4,
      reason: 'in-lesson',
    })
    expect(e.lessonId).toBe('u1l1')
    expect(e.objectiveCode).toBe('2Nc.01')
    expect(e.masteryBefore).toBe(0.2)
    expect(e.masteryAfter).toBe(0.4)
    expect(typeof e.ts).toBe('number')
  })
})
