import { describe, expect, it } from 'vitest'
import {
  LEAGUES,
  STREAK_CHEST_EVERY,
  advanceLeague,
  leagueOutcomeByXp,
  leagueWeekElapsed,
  lessonChestPrize,
  msUntilWeekEnd,
  nextWeekKey,
  streakMilestoneFor,
  weekKey,
  weeklyGoal,
} from '../src/engine/gamification'
import { isValidAnchor, promoteLeaderWeek, settleLeagueWeek, updateStreak } from '../src/engine/store'
import type { LeagueHistoryEntry } from '../src/engine/store'

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
  const base = {
    streakCurrent: 0,
    streakLongest: 0,
    lastActiveDay: null as string | null,
    streakSavers: 0,
  }

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

  it('a Streak Saver absorbs a missed day so the streak continues', () => {
    const s = { ...base, streakCurrent: 9, streakLongest: 12, lastActiveDay: '2026-08-01', streakSavers: 2 }
    updateStreak(s, '2026-08-24', '2026-08-23')
    expect(s.streakCurrent).toBe(10) // continued, NOT reset
    expect(s.streakLongest).toBe(12)
    expect(s.streakSavers).toBe(1) // exactly one saver consumed
  })

  it('without a saver the streak still resets after a gap', () => {
    const s = { ...base, streakCurrent: 9, streakLongest: 12, lastActiveDay: '2026-08-01', streakSavers: 0 }
    updateStreak(s, '2026-08-24', '2026-08-23')
    expect(s.streakCurrent).toBe(1)
    expect(s.streakSavers).toBe(0)
  })
})

describe('streak milestone rewards', () => {
  it('reaches the first milestone at 7 days', () => {
    expect(STREAK_CHEST_EVERY).toBe(7)
    expect(streakMilestoneFor(6, 0)).toBeNull()
    expect(streakMilestoneFor(7, 0)).toBe(7)
    expect(streakMilestoneFor(8, 0)).toBe(7)
  })

  it('never double-rewards the same milestone', () => {
    expect(streakMilestoneFor(8, 7)).toBeNull()
    expect(streakMilestoneFor(13, 7)).toBeNull()
    expect(streakMilestoneFor(14, 7)).toBe(14)
    expect(streakMilestoneFor(20, 14)).toBeNull()
    expect(streakMilestoneFor(21, 14)).toBe(21)
  })

  it('ignores sub-milestone streaks', () => {
    expect(streakMilestoneFor(3, 0)).toBeNull()
    expect(streakMilestoneFor(0, 0)).toBeNull()
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

describe('weekly league settlement (7-day anchored weeks)', () => {
  const START = '2026-08-24' // league week begins 12:00 AM that day
  const END = new Date('2026-08-31T00:00:00') // exactly 7 days later
  const AFTER = new Date('2026-08-31T09:30:00')
  const MID = new Date('2026-08-27T12:00:00')
  const NEXT = '2026-08-31' // todayISO(=the settlement day)

  function leagueState(overrides: Partial<{
    weeklyXpWeek: string
    weeklyXp: number
    currentLeague: (typeof LEAGUES)[number]
    leagueHistory: LeagueHistoryEntry[]
    lastLeagueSettle: LeagueHistoryEntry | null
  }> = {}) {
    return {
      weeklyXpWeek: START,
      weeklyXp: 0,
      currentLeague: 'Bronze' as const,
      leagueHistory: [] as LeagueHistoryEntry[],
      lastLeagueSettle: null,
      ...overrides,
    }
  }

  it('does NOT settle while the 7-day window is still running', () => {
    const s = leagueState({ currentLeague: 'Gold', weeklyXp: 42 })
    expect(settleLeagueWeek(s, MID)).toBe(false)
    expect(s.weeklyXp).toBe(42)
    expect(s.currentLeague).toBe('Gold')
    expect(s.leagueHistory).toHaveLength(0)
  })

  it('settles exactly 7 days after the anchor, but a NON-leader who hits the goal STAYS (only the leader promotes)', () => {
    const s = leagueState({ currentLeague: 'Bronze', weeklyXp: weeklyGoal('Bronze') })
    expect(settleLeagueWeek(s, END)).toBe(true)
    expect(s.currentLeague).toBe('Bronze') // goal met, but non-leader stays
    expect(s.weeklyXp).toBe(0)
    expect(s.weeklyXpWeek).toBe(NEXT) // fresh week anchored at 12:00 AM today
    expect(s.lastLeagueSettle).toBeNull() // stayed -> no banner
    expect(s.leagueHistory).toHaveLength(1)
    expect(s.leagueHistory[0].outcome).toBe('stayed')
  })

  it('demotes when last week’s XP missed the stay threshold', () => {
    const s = leagueState({ currentLeague: 'Silver', weeklyXp: 5 })
    settleLeagueWeek(s, AFTER)
    expect(s.currentLeague).toBe('Bronze')
    expect(s.lastLeagueSettle?.outcome).toBe('demoted')
    expect(s.lastLeagueSettle?.league).toBe('Silver')
  })

  it('keeps the league between the stay threshold and the goal', () => {
    const s = leagueState({ currentLeague: 'Gold', weeklyXp: Math.round(weeklyGoal('Gold') * 0.5) })
    settleLeagueWeek(s, AFTER)
    expect(s.currentLeague).toBe('Gold')
    expect(s.lastLeagueSettle).toBeNull() // no banner for staying
    expect(s.leagueHistory[0].outcome).toBe('stayed')
  })

  it('never demotes below Bronze or promotes above Diamond (non-leader)', () => {
    const low = leagueState({ currentLeague: 'Bronze', weeklyXp: 0 })
    settleLeagueWeek(low, AFTER)
    expect(low.currentLeague).toBe('Bronze')

    // A Diamond non-leader who ran up huge XP used to "promote" to Diamond
    // (no-op clamp). Under the strict leader-only rule, they STAY at Diamond.
    const high = leagueState({ currentLeague: 'Diamond', weeklyXp: 9999 })
    settleLeagueWeek(high, AFTER)
    expect(high.currentLeague).toBe('Diamond')
    expect(high.lastLeagueSettle).toBeNull() // stayed -> no banner
    expect(high.leagueHistory[0].outcome).toBe('stayed')
  })

  it('restarts XP and the weekly timer for a fresh anchored week', () => {
    const s = leagueState({ currentLeague: 'Gold', weeklyXp: 55 })
    settleLeagueWeek(s, AFTER)
    expect(s.weeklyXpWeek).toBe(NEXT) // new week starts 12:00 AM of this day
    expect(s.weeklyXp).toBe(0)
    // the fresh timer runs from 12 AM today for exactly 7 days
    expect(leagueWeekElapsed(NEXT, new Date('2026-09-07T00:00:00'))).toBe(true)
    expect(leagueWeekElapsed(NEXT, new Date('2026-09-06T23:59:59'))).toBe(false)
  })

  it('caps league history at 10 entries', () => {
    const history: LeagueHistoryEntry[] = Array.from({ length: 12 }, (_, i) => ({
      weekKey: `2026-06-${String(1 + i).padStart(2, '0')}`,
      league: 'Bronze' as const,
      outcome: 'stayed' as const,
      xp: 0,
    }))
    const s = leagueState({ leagueHistory: history })
    settleLeagueWeek(s, AFTER)
    expect(s.leagueHistory).toHaveLength(10)
    expect(s.leagueHistory[0].weekKey).toBe('2026-06-04') // oldest two dropped
  })

  it('treats undefined/NaN weekly XP as 0 instead of promoting or crashing', () => {
    const bad = leagueState({ currentLeague: 'Gold' }) as unknown as {
      weeklyXpWeek: string
      weeklyXp: number
      currentLeague: 'Gold'
      leagueHistory: LeagueHistoryEntry[]
      lastLeagueSettle: LeagueHistoryEntry | null
    }
    ;(bad as { weeklyXp: number }).weeklyXp = undefined as unknown as number
    expect(settleLeagueWeek(bad, AFTER)).toBe(true)
    expect(bad.currentLeague).toBe('Silver') // demoted, not NaN-poisoned
    expect(bad.leagueHistory[0].xp).toBe(0)
    expect(bad.weeklyXp).toBe(0)
    expect(bad.weeklyXpWeek).toBe(NEXT)
  })

  it('repairs a missing/corrupt anchor into a fresh 7-day week', () => {
    const s = leagueState({ weeklyXpWeek: '' })
    expect(settleLeagueWeek(s, AFTER)).toBe(true) // state changed -> persists
    expect(s.weeklyXpWeek).toBe(NEXT)
    expect(s.weeklyXp).toBe(0)
    expect(s.leagueHistory).toHaveLength(0)
  })

  it('rejects impossible dates as anchors', () => {
    expect(isValidAnchor('2026-02-30')).toBe(false)
    expect(isValidAnchor('2026-13-01')).toBe(false)
    expect(isValidAnchor('2026-08-31')).toBe(true)
  })

  it('the week end stays at 12 AM local via calendar arithmetic', () => {
    // end of the 2026-08-24 week = 00:00 local on 2026-08-31
    expect(leagueWeekElapsed(START, new Date('2026-08-31T00:00:05'))).toBe(true)
    expect(msUntilWeekEnd(START, new Date('2026-08-30T12:00:00'))).toBe(12 * 3600000)
  })

  it('non-leader settlement never promotes: even well above the goal, only stay/demote', () => {
    // The leader's path is promoteLeaderWeek. settleLeagueWeek (the
    // non-leader path) must NEVER move a player up - regardless of XP.
    // This is the strict leader-only contract.
    const bronze = leagueState({ currentLeague: 'Bronze', weeklyXp: 9999 })
    expect(settleLeagueWeek(bronze, END)).toBe(true)
    expect(bronze.currentLeague).toBe('Bronze') // not Silver
    expect(bronze.lastLeagueSettle).toBeNull()  // stayed -> no banner
    expect(bronze.leagueHistory[0].outcome).toBe('stayed')

    const gold = leagueState({ currentLeague: 'Gold', weeklyXp: 9999 })
    expect(settleLeagueWeek(gold, END)).toBe(true)
    expect(gold.currentLeague).toBe('Gold') // not Sapphire
  })
})

describe('league leader promotion', () => {
  const START = '2026-08-24'
  const END = new Date('2026-08-31T00:00:00')
  const MID = new Date('2026-08-27T12:00:00')

  function leaderState(overrides: Partial<{
    weeklyXpWeek: string
    weeklyXp: number
    currentLeague: (typeof LEAGUES)[number]
    leagueHistory: LeagueHistoryEntry[]
    lastLeagueSettle: LeagueHistoryEntry | null
  }> = {}) {
    return {
      weeklyXpWeek: START,
      weeklyXp: 0,
      currentLeague: 'Gold' as const,
      leagueHistory: [] as LeagueHistoryEntry[],
      lastLeagueSettle: null,
      ...overrides,
    }
  }

  it('promotes the #1 player into the next league even below the XP goal', () => {
    const s = leaderState({ currentLeague: 'Gold', weeklyXp: 10 })
    expect(promoteLeaderWeek(s, END)).toBe(true)
    expect(s.currentLeague).toBe('Sapphire')
    expect(s.weeklyXp).toBe(0)
    expect(s.weeklyXpWeek).toBe('2026-08-31') // timer restarted at 12 AM today
    expect(s.lastLeagueSettle?.outcome).toBe('promoted')
    expect(s.leagueHistory[0].outcome).toBe('promoted')
    expect(s.leagueHistory[0].weekKey).toBe(START)
  })

  it('promotes the #1 player at Diamond stays at Diamond (clamped)', () => {
    const s = leaderState({ currentLeague: 'Diamond', weeklyXp: 0 })
    expect(promoteLeaderWeek(s, END)).toBe(true)
    expect(s.currentLeague).toBe('Diamond') // cannot go above Diamond
    expect(s.leagueHistory[0].outcome).toBe('promoted')
  })

  it('does not promote before the week ends', () => {
    const s = leaderState({ currentLeague: 'Gold', weeklyXp: 10 })
    expect(promoteLeaderWeek(s, MID)).toBe(false)
    expect(s.currentLeague).toBe('Gold')
    expect(s.leagueHistory).toHaveLength(0)
  })

  it('repairs a missing anchor for the leader too (no promotion on repair)', () => {
    const s = leaderState({ weeklyXpWeek: '' })
    expect(promoteLeaderWeek(s, END)).toBe(true) // state changed -> persists
    expect(s.weeklyXpWeek).toBe('2026-08-31')
    expect(s.weeklyXp).toBe(0)
    expect(s.leagueHistory).toHaveLength(0) // repair isn't a settlement
  })

  it('does not promote before the week ends', () => {
    const s = leaderState({ currentLeague: 'Gold', weeklyXp: 90 })
    expect(promoteLeaderWeek(s, MID)).toBe(false)
    expect(s.currentLeague).toBe('Gold')
    expect(s.weeklyXp).toBe(90)
  })

  it('never promotes above Diamond', () => {
    const s = leaderState({ currentLeague: 'Diamond', weeklyXp: 300 })
    promoteLeaderWeek(s, END)
    expect(s.currentLeague).toBe('Diamond')
    expect(s.lastLeagueSettle?.outcome).toBe('promoted')
  })

  it('repairs a missing anchor for the leader too (no promotion on repair)', () => {
    const s = leaderState({ weeklyXpWeek: '' })
    expect(promoteLeaderWeek(s, END)).toBe(true) // state changed -> persists
    expect(s.weeklyXpWeek).toBe('2026-08-31')
    expect(s.weeklyXp).toBe(0)
    expect(s.currentLeague).toBe('Gold') // fresh week, not a promotion
  })
})
