import { describe, expect, it } from 'vitest'
import { botsForPlayerCount, dedupSelf, weeklyXpOf, type SharedPlayer } from '../src/engine/leaderboard'
import { LEAGUE_RIVALS } from '../src/engine/gamification'

function player(overrides: Partial<SharedPlayer> = {}): SharedPlayer {
  return {
    id: 'p1',
    name: 'Fares',
    xp: 42,
    league: 'Bronze',
    mascot: 'sonic',
    week: '2026-08-24',
    ...overrides,
  }
}

describe('shared leaderboard', () => {
  it('removes one bot per real player', () => {
    expect(botsForPlayerCount(0)).toHaveLength(LEAGUE_RIVALS.length)
    expect(botsForPlayerCount(1)).toHaveLength(LEAGUE_RIVALS.length - 1)
    expect(botsForPlayerCount(3)).toHaveLength(LEAGUE_RIVALS.length - 3)
  })

  it('never returns negative bots once real players exceed the roster', () => {
    expect(botsForPlayerCount(LEAGUE_RIVALS.length)).toHaveLength(0)
    expect(botsForPlayerCount(LEAGUE_RIVALS.length + 5)).toHaveLength(0)
  })

  it('keeps the strongest rivals when trimming', () => {
    const bots = botsForPlayerCount(3)
    expect(bots[0].id).toBe(LEAGUE_RIVALS[0].id)
    expect(bots.map((b) => b.id)).toEqual(LEAGUE_RIVALS.slice(0, 7).map((r) => r.id))
  })

  it('counts XP only for the current week', () => {
    expect(weeklyXpOf(player(), '2026-08-24')).toBe(42)
    expect(weeklyXpOf(player(), '2026-08-31')).toBe(0)
  })

  it('rounds and clamps XP', () => {
    expect(weeklyXpOf(player({ xp: 7.6 }), '2026-08-24')).toBe(8)
    expect(weeklyXpOf(player({ xp: -5 }), '2026-08-24')).toBe(0)
  })
})

describe('dedupSelf (cross-id dup of the local player)', () => {
  const local = player({ id: 'name:fares', name: 'Fares', xp: 0, league: 'Bronze' })
  const googleDup = player({
    id: 'g:114787896146518087443',
    name: 'Fares',
    xp: 30,
    league: 'Silver',
    week: '2026-08-31',
  })
  const differentName = player({ id: 'p99', name: 'Layla', xp: 25, week: '2026-08-31' })

  it('removes both id-dup and same-name dup for the local player', () => {
    const rows = [local, googleDup, differentName]
    const out = dedupSelf(rows, 'name:fares', 'Fares')
    expect(out).toHaveLength(1)
    expect(out[0].id).toBe('p99')
    expect(out[0].name).toBe('Layla')
  })

  it('is case-insensitive on the name match', () => {
    const upper = player({ id: 'pX', name: 'FARES', xp: 10 })
    const trimmed = player({ id: 'name:fares', name: 'Fares', xp: 0 })
    const out = dedupSelf([upper, trimmed], 'name:fares', 'Fares')
    expect(out).toHaveLength(0)
  })

  it('keeps players with similar-but-different names', () => {
    // local name is "Fares" — these other two are similar but NOT equal to it.
    const faresA = player({ id: 'pA', name: 'Layla' })
    const faresB = player({ id: 'pB', name: 'Layla Junior' })
    const out = dedupSelf([faresA, faresB], 'someone-else', 'Fares')
    expect(out).toHaveLength(2)
  })

  it('returns id-deduped rows unchanged when myName is empty (safety)', () => {
    // Empty local name -> only id-based dedup runs; any googleDup is kept
    // (we have no name to cross-check against, and the test id doesn't match).
    const rows = [googleDup, differentName]
    const out = dedupSelf(rows, 'name:fares', '')
    expect(out.map((p) => p.id)).toEqual(['g:114787896146518087443', 'p99'])
  })

  it('filters to requested week when provided', () => {
    // Same player appears in multiple weeks with different IDs
    const faresWeek1 = player({ id: 'fares-123', name: 'Fares', xp: 72, week: '2026-08-24' })
    const faresWeek2 = player({ id: 'g:114787896146518087443', name: 'Fares', xp: 30, week: '2026-08-31' })
    const otherPlayer = player({ id: 'p99', name: 'Layla', xp: 25, week: '2026-08-31' })
    const rows = [faresWeek1, faresWeek2, otherPlayer]

    // When viewing week 2026-08-31 with a different local player (Someone),
    // only that week's entries should remain (faresWeek1 is filtered out by week)
    const out = dedupSelf(rows, 'name:someone', 'Someone', '2026-08-31')
    expect(out).toHaveLength(2) // Both faresWeek2 and otherPlayer from week 2026-08-31
    expect(out.map(p => p.id)).toEqual(['g:114787896146518087443', 'p99'])
  })

  it('removes local player by ID within the requested week', () => {
    const localWeek1 = player({ id: 'name:fares', name: 'Fares', xp: 50, week: '2026-08-24' })
    const localWeek2 = player({ id: 'name:fares', name: 'Fares', xp: 30, week: '2026-08-31' })
    const otherPlayer = player({ id: 'p99', name: 'Layla', xp: 25, week: '2026-08-31' })
    const rows = [localWeek1, localWeek2, otherPlayer]

    // When viewing week 2026-08-31, local player (ID match) should be removed
    // localWeek1 is from a different week so it's filtered out first
    const out = dedupSelf(rows, 'name:fares', 'Fares', '2026-08-31')
    expect(out).toHaveLength(1)
    expect(out[0].id).toBe('p99')
  })
})
