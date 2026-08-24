import { describe, expect, it } from 'vitest'
import {
  advanceLeague,
  botBoard,
  buildLeaderboard,
  leagueOutcome,
  nextWeekKey,
  weekKey,
} from '../src/engine/gamification'
import { updateStreak } from '../src/engine/store'

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

  it('bot board is deterministic per week and reacts to user XP', () => {
    const a = botBoard('2026-08-17', 100)
    const b = botBoard('2026-08-17', 100)
    const c = botBoard('2026-08-24', 100)
    expect(a).toEqual(b)
    expect(a.map((r) => r.name)).not.toEqual(c.map((r) => r.name))
  })

  it('leaderboard ranks user among bots with unique ranks', () => {
    const rows = buildLeaderboard('2026-08-17', 55, 'Tester')
    expect(rows.filter((r) => r.isYou)).toHaveLength(1)
    const ranks = rows.map((r) => (r as { rank: number }).rank)
    expect(new Set(ranks).size).toBe(rows.length)
  })

  it('promotion/demotion boundaries are correct', () => {
    expect(leagueOutcome(1)).toBe('promoted')
    expect(leagueOutcome(3)).toBe('promoted')
    expect(leagueOutcome(4)).toBe('stayed')
    expect(leagueOutcome(8)).toBe('stayed')
    expect(leagueOutcome(9)).toBe('demoted')
    expect(advanceLeague('Bronze', 'demoted')).toBe('Bronze')
    expect(advanceLeague('Diamond', 'promoted')).toBe('Diamond')
    expect(advanceLeague('Gold', 'promoted')).toBe('Sapphire')
  })
})
