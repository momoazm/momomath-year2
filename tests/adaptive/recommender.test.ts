import { describe, expect, it } from 'vitest'
import { newSkillState, recordAttempt, updateSkill } from '../../src/engine/adaptive/model'
import {
  adaptLessonLength,
  formatReason,
  isDueForReview,
  recommend,
  recordPick,
  reviewIntervalDays,
  type CurriculumEntry,
} from '../../src/engine/adaptive/recommender'
import type { AdaptiveSnapshot } from '../../src/engine/adaptive/types'

function emptySnap(): AdaptiveSnapshot {
  return { skills: {}, seenCodes: [], recentPicks: [], lastRecommendation: null }
}

const CATALOG: CurriculumEntry[] = [
  { code: '2Nc.01', unitOrder: 1, lessonOrder: 1, lessonId: 'u1l1', title: 'Count' },
  { code: '2Nc.04', unitOrder: 1, lessonOrder: 2, lessonId: 'u1l2', title: 'One more' },
  { code: '2Np.01', unitOrder: 2, lessonOrder: 7, lessonId: 'u2l1', title: 'Tens & ones' },
]

describe('reviewIntervalDays', () => {
  it('returns short interval for low mastery, long for high', () => {
    expect(reviewIntervalDays(newSkillState())).toBe(1)
    expect(reviewIntervalDays({ ...newSkillState(), pL: 0.96 })).toBe(30)
  })
})

describe('isDueForReview', () => {
  it('cold skill is never due', () => {
    expect(isDueForReview(newSkillState(), 1_000_000)).toBe(false)
  })
})

describe('recommend — cold start', () => {
  it('returns the first catalog entry with reason cold-start', () => {
    const r = recommend({ snap: emptySnap(), catalog: CATALOG, now: 1000 })
    expect(r.objectiveCode).toBe('2Nc.01')
    expect(r.lessonId).toBe('u1l1')
    expect(r.reasonCode).toBe('cold-start')
    expect(r.difficulty).toBe(1)
  })
})

describe('recommend — pick weakest skill', () => {
  it('prefers the skill with the largest mastery deficit', () => {
    let snap = emptySnap()
    // Master 2Nc.01 to 95%
    for (let i = 0; i < 20; i++) {
      snap = recordAttempt(snap, '2Nc.01', true, 'type-number', 1000, i + 1).snap
    }
    // Touch 2Nc.04 and 2Np.01 a little, leave one weak
    snap = recordAttempt(snap, '2Nc.04', true, 'type-number', 1000, 21).snap
    snap = recordAttempt(snap, '2Np.01', false, 'type-number', 1000, 22).snap
    snap = recordAttempt(snap, '2Np.01', false, 'type-number', 1000, 23).snap

    const r = recommend({ snap, catalog: CATALOG, now: 1000 })
    expect(r.objectiveCode).toBe('2Np.01') // weakest
  })
})

describe('recommend — prerequisite gating', () => {
  it('skips a never-seen later skill if an earlier skill is below gate', () => {
    let snap = emptySnap()
    // 2Nc.01 cold (mastery 0.15) — below gate 0.5
    // 2Np.01 never seen — should be gated behind 2Nc.01
    const r = recommend({ snap, catalog: CATALOG, now: 1000 })
    expect(r.objectiveCode).not.toBe('2Np.01')
  })
})

describe('recommend — no immediate repeat', () => {
  it('does not return the previous pick (heavy repeat penalty)', () => {
    // Pre-condition: we've *seen* the earlier skills so we are past cold-start,
    // and the immediate previous pick should be penalised enough to lose.
    const snap: AdaptiveSnapshot = {
      skills: {},
      seenCodes: ['2Nc.01', '2Nc.04', '2Np.01'],
      recentPicks: ['2Nc.01', '2Nc.04', '2Np.01'],
      lastRecommendation: null,
    }
    const r = recommend({ snap, catalog: CATALOG, now: 1000 })
    expect(r.objectiveCode).not.toBe('2Nc.01')
    // All three codes have identical mastery (0.15) so the test is meaningful.
  })

  it('tie-breaks to the next-in-catalog when recency is symmetric', () => {
    // If recentPicks has a code but it's the *only* one (so all three are equally
    // recent in the penalty window), the previous pick should still be pushed back
    // by at least the repeat penalty. We assert it's not the last pick.
    const snap: AdaptiveSnapshot = {
      skills: {},
      seenCodes: ['2Nc.01'],
      recentPicks: ['2Nc.01'],
      lastRecommendation: null,
    }
    const r = recommend({ snap, catalog: CATALOG, now: 1000 })
    expect(r.objectiveCode).not.toBe('2Nc.01')
  })
})

describe('recordPick', () => {
  it('moves a code to the front and dedupes', () => {
    let s = emptySnap()
    s = recordPick(s, '2Nc.01')
    s = recordPick(s, '2Np.01')
    s = recordPick(s, '2Nc.01')
    expect(s.recentPicks[0]).toBe('2Nc.01')
    expect(s.recentPicks[1]).toBe('2Np.01')
    expect(s.recentPicks.length).toBe(2)
  })
})

describe('adaptLessonLength', () => {
  it('bosses always return defaultLength', () => {
    const snap = emptySnap()
    expect(adaptLessonLength(snap, '2Nc.01', true, 10)).toBe(10)
  })
  it('cold skill returns defaultLength', () => {
    const snap = emptySnap()
    expect(adaptLessonLength(snap, '2Nc.01', false, 10)).toBe(10)
  })
  it('highly-mastered skill returns the MIN', () => {
    let snap = emptySnap()
    for (let i = 0; i < 25; i++) {
      snap = recordAttempt(snap, '2Nc.01', true, 'type-number', 1000, i + 1).snap
    }
    expect(adaptLessonLength(snap, '2Nc.01', false, 10)).toBe(6)
  })
})

describe('formatReason', () => {
  it('produces a kid-friendly sentence for every code', () => {
    const s = newSkillState()
    for (const code of ['mastery-deficit', 'spaced-review-due', 'curriculum-default', 'cold-start', 'in-lesson', 'recommendation-accepted', 'unknown'] as const) {
      const out = formatReason(code, s)
      expect(out.length).toBeGreaterThan(0)
    }
  })
})
