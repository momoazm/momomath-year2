import { describe, expect, it } from 'vitest'
import {
  LEAGUES,
  advanceLeague,
  leagueOutcomeByXp,
  lessonChestPrize,
  nextWeekKey,
  weekKey,
  weeklyGoal,
} from '../src/engine/gamification'
import { updateStreak } from '../src/engine/store'

describe('lesson chest prizes', () => {
  it('always stays within expected ranges', () => {
    for (let i = 0; i < 500; i++) {
      const p = lessonChestPrize(false, 3)
      expect(p).toBeGreaterThanOrEqual(8)
      expect(p).toBeLessThanOrEqual(20)
    }
  })

  it('perfect lessons earn more than flawed ones on average', () => {
    const perfect = Array.from({ length: 200 }, () => lessonChestPrize(false, 0))
    const flawed = Array.from({ length: 200 }, () => lessonChestPrize(false, 2))
    const avg = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length
    expect(perfect.every((p) => p >= 18)).toBe(true)
    expect(avg(perfect)).toBeGreaterThan(avg(flawed))
  })

  it('boss chests are bigger', () => {
    expect(lessonChestPrize(true, 0)).toBeGreaterThanOrEqual(25)
    expect(lessonChestPrize(true, 5)).toBeGreaterThanOrEqual(15)
  })
})

describe('streaks', () => {
  const base = { streakCurrent: 0, streakLongest: 0, lastActiveDay: null as string | null }

  it('starts at 1 on first ever play', () => {
    const s = { ...base }
    updateStreak(s, '2026-08-24', '2026-08-23')
    expect(s.streakCurrent).toBe(1)
    expect(s.streakLongest).toBe(1)
  })

  it('increments when played yesterday', () => {
    const s = { ...base, streakCurrent: 4, streakLongest: 6, lastActiveDay: '2026-08-23' }
    updateStreak(s, '2026-08-24', '2026-08-23')
    expect(s.streakCurrent).toBe(5)
  })

  it('resets after a gap', () => {
    const s = { ...base, streakCurrent: 9, streakLongest: 12, lastActiveDay: '2026-08-01' }
    updateStreak(s, '2026-08-24', '2026-08-23')
    expect(s.streakCurrent).toBe(1)
    expect(s.streakLongest).toBe(12)
  })

  it('is idempotent within the same day', () => {
    const s = { ...base, streakCurrent: 3, lastActiveDay: '2026-08-24' }
    updateStreak(s, '2026-08-24', '2026-08-23')
    expect(s.streakCurrent).toBe(3)
  })
})

describe('leagues', () => {
  it('weekKey is Monday-based and stable', () => {
    expect(weekKey(new Date('2026-08-19T12:00:00'))).toMatch(/^\d{4}-\d{2}-\d{2}$/) // Wed → its Monday
    expect(weekKey(new Date('2026-08-17T00:00:00'))).toBe('2026-08-17') // a Monday
  })

  it('nextWeekKey advances exactly 7 days', () => {
    expect(nextWeekKey('2026-08-17')).toBe('2026-08-24')
  })

  it('weekly goals rise strictly across the ladder', () => {
    const goals = LEAGUES.map((l) => weeklyGoal(l))
    for (let i = 1; i < goals.length; i++) expect(goals[i]).toBeGreaterThan(goals[i - 1])
  })

  it('promotion/demotion boundaries are XP-based and exact', () => {
    expect(leagueOutcomeByXp('Bronze', weeklyGoal('Bronze'))).toBe('promoted')
    expect(leagueOutcomeByXp('Bronze', weeklyGoal('Bronze') - 1)).not.toBe('promoted')
    expect(leagueOutcomeByXp('Gold', Math.round(weeklyGoal('Gold') * 0.34))).toBe('stayed')
    expect(leagueOutcomeByXp('Gold', Math.round(weeklyGoal('Gold') * 0.34) - 1)).toBe('demoted')
    expect(leagueOutcomeByXp('Diamond', 0)).toBe('demoted')
    expect(advanceLeague('Bronze', 'demoted')).toBe('Bronze')
    expect(advanceLeague('Diamond', 'promoted')).toBe('Diamond')
    expect(advanceLeague('Gold', 'promoted')).toBe('Sapphire')
  })
})
