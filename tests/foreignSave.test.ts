/**
 * Foreign-save bridge + hydration guard (same localStorage key, other app
 * line — store v13–v16 relocated progress into `paths[yearLevel]`).
 *
 * A foreign or corrupt save must be bridged losslessly (per-key MAX merge)
 * so a returning player keeps their progress, and must never white-screen
 * the UI (unknown enum values are coerced to safe defaults).
 */
import { describe, expect, it } from 'vitest'
import { bridgeForeignSave } from '../src/engine/store'

describe('bridgeForeignSave', () => {
  it('merges paths[yearLevel] lesson progress with the top-level map (per-key MAX)', () => {
    const p: any = {
      subject: 'math',
      lessonProgress: { u1l1: { crown: 3, bestAccuracy: 100, completions: 3 } },
      arcadeScores: { retro: 500 },
      sprintBest: 20,
      yearLevel: 2,
      paths: {
        2: {
          lessonProgress: {
            u1l1: { crown: 2, bestAccuracy: 90, completions: 2 },
            u1l2: { crown: 2, bestAccuracy: 92, completions: 2 },
          },
          arcadeScores: { retro: 900, boss: 300 },
          sprintBest: 42,
          subject: 'english',
        },
      },
    }
    bridgeForeignSave(p)
    // existing top-level crowns win when they are higher
    expect(p.lessonProgress.u1l1).toEqual({ crown: 3, bestAccuracy: 100, completions: 3 })
    // progress that only lives in paths[2] is carried over
    expect(p.lessonProgress.u1l2).toEqual({ crown: 2, bestAccuracy: 92, completions: 2 })
    expect(p.arcadeScores).toEqual({ retro: 900, boss: 300 })
    expect(p.sprintBest).toBe(42)
    // a valid top-level subject is never clobbered by the path subject
    expect(p.subject).toBe('math')
  })

  it('uses paths[2] when the save carries no yearLevel', () => {
    const p: any = {
      lessonProgress: {},
      paths: { 2: { lessonProgress: { u1l3: { crown: 1, bestAccuracy: 80, completions: 1 } } } },
    }
    bridgeForeignSave(p)
    expect(p.lessonProgress.u1l3).toEqual({ crown: 1, bestAccuracy: 80, completions: 1 })
  })

  it('coerces an unknown league and drops malformed history rows', () => {
    const p: any = {
      currentLeague: 'silver',
      leagueHistory: [
        { weekKey: '2026-10-06', league: 'Bronze', xp: 120, outcome: 'stayed' },
        { weekKey: '2026-10-13', league: 'Mythic', xp: 999, outcome: 'promoted' },
      ],
    }
    bridgeForeignSave(p)
    expect(p.currentLeague).toBe('Bronze')
    expect(p.leagueHistory).toEqual([
      { weekKey: '2026-10-06', league: 'Bronze', xp: 120, outcome: 'stayed' },
    ])
  })

  it('repairs an unknown subject and leaves valid values untouched', () => {
    const p: any = { currentLeague: 'Gold', subject: 'physics', leagueHistory: [] }
    bridgeForeignSave(p)
    expect(p.currentLeague).toBe('Gold')
    expect(p.subject).toBe('math')
  })
})
