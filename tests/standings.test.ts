import { describe, expect, it } from 'vitest'
import { buildStandings } from '../src/engine/standings'
import type { SharedPlayer } from '../src/engine/leaderboard'

const ANCHOR = '2026-08-24'
const WEEK = '2026-08-24'
const NOW = new Date('2026-08-27T12:00:00')

function baseArgs(overrides: Record<string, unknown> = {}) {
  return {
    shared: [] as SharedPlayer[],
    myId: 'name:champion',
    myName: 'champion',
    name: 'Champion',
    weeklyXp: 0,
    mascot: 'sonic',
    currentLeague: 'Bronze' as const,
    anchor: ANCHOR,
    boardWeek: WEEK,
    now: NOW,
    ...overrides,
  }
}

function sharedPlayer(overrides: Partial<SharedPlayer> = {}): SharedPlayer {
  return {
    id: 'p1',
    name: 'Fares',
    xp: 42,
    league: 'Bronze',
    mascot: 'sonic',
    week: WEEK,
    ...overrides,
  }
}

describe('buildStandings (shared by Leagues tab + auto-settler)', () => {
  it('pads a solo player to a 10-row board, sorted desc, with exactly one you-row', () => {
    const { standings, myRank, realCount } = buildStandings(baseArgs())
    expect(standings).toHaveLength(10)
    expect(realCount).toBe(1)
    expect(standings.filter((r) => r.isYou)).toHaveLength(1)
    for (let i = 1; i < standings.length; i++) {
      expect(standings[i - 1].xp).toBeGreaterThanOrEqual(standings[i].xp)
    }
    expect(myRank).toBe(standings.findIndex((r) => r.isYou) + 1)
  })

  it('dedups the local player across name-only + Google-signed rows', () => {
    const shared = [
      sharedPlayer({ id: 'name:fares', name: 'Fares', xp: 5 }),
      sharedPlayer({ id: 'g:123', name: 'Fares', xp: 30 }),
      sharedPlayer({ id: 'p99', name: 'Layla', xp: 25 }),
    ]
    const { standings, others, realCount } = buildStandings(
      baseArgs({ shared, myId: 'name:fares', myName: 'fares', name: 'Fares' }),
    )
    expect(others.map((p) => p.id)).toEqual(['p99'])
    expect(realCount).toBe(2)
    expect(standings.filter((r) => r.name === 'Fares' && !r.isYou)).toHaveLength(0)
    expect(standings.filter((r) => r.isYou)).toHaveLength(1)
  })

  it('ranks a high-XP player first', () => {
    const { myRank, standings } = buildStandings(baseArgs({ weeklyXp: 9999 }))
    expect(myRank).toBe(1)
    expect(standings[0].isYou).toBe(true)
  })

  it('counts only current-week real players', () => {
    const shared = [
      sharedPlayer({ id: 'p-old', name: 'Omar', xp: 500, week: '2026-08-17' }),
      sharedPlayer({ id: 'p-new', name: 'Sara', xp: 3, week: WEEK }),
    ]
    const { others, realCount } = buildStandings(baseArgs({ shared }))
    expect(others.map((p) => p.id)).toEqual(['p-new'])
    expect(realCount).toBe(2)
  })

  it('is deterministic for the same inputs', () => {
    const a = buildStandings(baseArgs({ weeklyXp: 37 }))
    const b = buildStandings(baseArgs({ weeklyXp: 37 }))
    expect(a).toEqual(b)
  })
})
