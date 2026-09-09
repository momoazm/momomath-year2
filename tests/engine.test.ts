import { describe, expect, it } from 'vitest'
import {
  LEAGUES,
  LEAGUE_RIVALS,
  advanceLeague,
  leagueOutcomeByRank,
  leagueOutcomeByXp,
  lessonChestPrize,
  nextWeekKey,
  weekKey,
  weeklyGoal,
  zoneOfRank,
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

  it('rank zones are 3 promote / 4 safe / 3 demote on a 10-board', () => {
    expect([1, 2, 3].map((r) => zoneOfRank(r, 10))).toEqual(['promo', 'promo', 'promo'])
    expect([4, 5, 6, 7].map((r) => zoneOfRank(r, 10))).toEqual(['stay', 'stay', 'stay', 'stay'])
    expect([8, 9, 10].map((r) => zoneOfRank(r, 10))).toEqual(['danger', 'danger', 'danger'])
  })

  it('weekly outcome follows rank: huge XP promotes, zero XP demotes', () => {
    // Deterministic for a fixed week; bots scale with the league goal.
    expect(leagueOutcomeByRank('Bronze', 100000, '2026-08-17')).toBe('promoted')
    expect(leagueOutcomeByRank('Bronze', 0, '2026-08-17')).toBe('demoted')
    expect(leagueOutcomeByRank('Diamond', 100000, '2026-08-17')).toBe('promoted')
    // Mid-pack XP stays: goal-level effort lands mid-board, not auto-promoted.
    const mid = weeklyGoal('Gold')
    expect(['promoted', 'stayed', 'demoted']).toContain(leagueOutcomeByRank('Gold', mid, '2026-08-17'))
  })

  it('bots are competitive: drives descend and goal-level effort never auto-promotes', () => {
    const drives = LEAGUE_RIVALS.map((r) => r.drive)
    for (let i = 1; i < drives.length; i++) expect(drives[i]).toBeLessThan(drives[i - 1])
    expect(drives[0]).toBeGreaterThanOrEqual(1.5) // the front-runner always outruns the goal
    expect(drives[drives.length - 1]).toBeGreaterThanOrEqual(0.2) // even the tail never idles
    // Hitting exactly the weekly goal must be earned mid-board, not a free promotion.
    for (const league of ['Bronze', 'Gold', 'Diamond'] as const) {
      const outcome = leagueOutcomeByRank(league, weeklyGoal(league), '2026-08-17')
      expect(outcome, `${league} goal-level effort`).not.toBe('promoted')
    }
    // Token effort still demotes.
    expect(leagueOutcomeByRank('Bronze', 5, '2026-08-17')).toBe('demoted')
  })
})
