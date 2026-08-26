import { describe, expect, it } from 'vitest'
import { botsForPlayerCount, weeklyXpOf, type SharedPlayer } from '../src/engine/leaderboard'
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
