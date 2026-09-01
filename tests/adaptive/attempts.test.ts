import { describe, expect, it } from 'vitest'
import { ADAPTIVE_CONFIG } from '../../src/engine/adaptive/config'
import {
  appendAttempt,
  appendMasterySnapshot,
  summariseSkill,
} from '../../src/engine/adaptive/attempts'
import { recordAttempt } from '../../src/engine/adaptive/model'
import { buildAttemptEntry } from '../../src/engine/adaptive/model'
import type { AdaptiveSnapshot } from '../../src/engine/adaptive/types'

function emptySnap(): AdaptiveSnapshot {
  return { skills: {}, seenCodes: [], recentPicks: [], lastRecommendation: null }
}

describe('appendAttempt', () => {
  it('respects the cap and drops oldest first', () => {
    let log: ReturnType<typeof buildAttemptEntry>[] = []
    for (let i = 0; i < ADAPTIVE_CONFIG.ATTEMPT_LOG_CAP + 50; i++) {
      log = appendAttempt(log, buildAttemptEntry({
        lessonId: 'u1l1',
        objectiveCode: '2Nc.01',
        kind: 'type-number',
        difficulty: 1,
        answer: '5',
        correct: i % 2 === 0,
        responseTimeMs: 2000,
        masteryBefore: 0.1,
        masteryAfter: 0.2,
        reason: 'in-lesson',
        ts: i,
      }))
    }
    expect(log.length).toBe(ADAPTIVE_CONFIG.ATTEMPT_LOG_CAP)
    expect(log[0]!.ts).toBe(50)
  })
})

describe('appendMasterySnapshot', () => {
  it('caps per-skill history', () => {
    let h: Record<string, { ts: number; pL: number }[]> = {}
    for (let i = 0; i < 250; i++) {
      h = appendMasterySnapshot(h, '2Nc.01', Math.min(1, i / 250), i, 200)
    }
    expect(h['2Nc.01']!.length).toBe(200)
  })
})

describe('summariseSkill', () => {
  it('returns null when no attempts', () => {
    expect(summariseSkill('2Nc.01', emptySnap())).toBeNull()
  })
  it('returns a populated summary when there are attempts', () => {
    let snap = emptySnap()
    for (let i = 0; i < 5; i++) {
      snap = recordAttempt(snap, '2Nc.01', i % 2 === 0, 'type-number', 1500, i + 1).snap
    }
    const s = summariseSkill('2Nc.01', snap, 100)
    expect(s).not.toBeNull()
    expect(s!.attempts).toBe(5)
    expect(s!.mastery).toBeGreaterThan(0)
    expect(s!.accuracy).toBeGreaterThan(0)
  })
})
