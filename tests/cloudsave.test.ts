import { describe, expect, it } from 'vitest'
import { mergeAdaptive, mergeCloudSave, snapshotFromPlayer, type CloudSave } from '../src/engine/cloudsave'
import { buildAttemptEntry } from '../src/engine/adaptive/model'
import { initialAdaptive } from '../src/engine/store'
import type { AdaptiveStore } from '../src/engine/adaptive/types'

function save(overrides: Partial<CloudSave> = {}): CloudSave {
  return {
    name: 'Champion',
    mascot: 'sonic',
    subject: 'math',
    xpTotal: 100,
    gems: 50,
    streakCurrent: 3,
    streakLongest: 5,
    lastActiveDay: '2026-08-24',
    dailyGoal: 30,
    weeklyXpWeek: '2026-08-24',
    weeklyXp: 40,
    currentLeague: 'Bronze',
    leagueHistory: [],
    lessonProgress: {},
    achievements: [],
    cardStars: {},
    shopInventory: {},
    streakSavers: 0,
    doubleXpLessons: 0,
    luckyTickets: 0,
    chestBoost: false,
    megaChest: false,
    adaptive: null,
    updatedAt: 1000,
    ...overrides,
  }
}

describe('cloud snapshot', () => {
  it('carries the whitelisted progress fields with a timestamp', () => {
    const snap = snapshotFromPlayer({
      ...(save() as unknown as Parameters<typeof snapshotFromPlayer>[0]),
      leagueHistory: [],
    })
    expect(snap.xpTotal).toBe(100)
    expect(snap.lessonProgress).toEqual({})
    expect(snap.updatedAt).toBeGreaterThan(0)
  })

  it('never includes per-day counters (each device rolls its own day)', () => {
    const snap = snapshotFromPlayer(save() as unknown as Parameters<typeof snapshotFromPlayer>[0])
    expect('todayXp' in snap).toBe(false)
    expect('lessonsToday' in snap).toBe(false)
    expect('correctToday' in snap).toBe(false)
  })
})

describe('cloud merge (same Google account, two devices)', () => {
  it('keeps the max of every counter so no device loses progress', () => {
    const merged = mergeCloudSave(
      save({ xpTotal: 200, gems: 10, streakLongest: 7 }),
      save({ xpTotal: 150, gems: 99, streakLongest: 4, updatedAt: 2000 }),
    )!
    expect(merged.xpTotal).toBe(200)
    expect(merged.gems).toBe(99)
    expect(merged.streakLongest).toBe(7)
  })

  it('unions achievements, maxes card stars, maxes shop stacks', () => {
    const merged = mergeCloudSave(
      save({ achievements: ['a1'], cardStars: { c1: 2 }, shopInventory: { saver: 1 } }),
      save({ achievements: ['a2', 'a1'], cardStars: { c2: 0, c1: 4 }, shopInventory: { saver: 3 }, updatedAt: 2000 }),
    )!
    expect(merged.achievements.sort()).toEqual(['a1', 'a2'])
    expect(merged.cardStars).toEqual({ c1: 4, c2: 0 })
    expect(merged.shopInventory).toEqual({ saver: 3 })
  })

  it('takes per-lesson bests from either device', () => {
    const merged = mergeCloudSave(
      save({ lessonProgress: { l1: { crown: 3, bestAccuracy: 60, completions: 1 } } }),
      save({
        lessonProgress: { l1: { crown: 1, bestAccuracy: 100, completions: 4 }, l2: { crown: 2, bestAccuracy: 80, completions: 1 } },
        updatedAt: 2000,
      }),
    )!
    expect(merged.lessonProgress.l1).toEqual({ crown: 3, bestAccuracy: 100, completions: 4 })
    expect(merged.lessonProgress.l2).toEqual({ crown: 2, bestAccuracy: 80, completions: 1 })
  })

  it('newest writer wins display fields; higher league wins', () => {
    const merged = mergeCloudSave(
      save({ name: 'Old', currentLeague: 'Gold', updatedAt: 1000 }),
      save({ name: 'New', currentLeague: 'Silver', updatedAt: 2000 }),
    )!
    expect(merged.name).toBe('New')
    expect(merged.currentLeague).toBe('Gold')
  })

  it('maxes weekly XP within the same week, follows the newest week otherwise', () => {
    const sameWeek = mergeCloudSave(
      save({ weeklyXpWeek: '2026-08-24', weeklyXp: 10 }),
      save({ weeklyXpWeek: '2026-08-24', weeklyXp: 30, updatedAt: 2000 }),
    )!
    expect(sameWeek.weeklyXp).toBe(30)
    const newWeek = mergeCloudSave(
      save({ weeklyXpWeek: '2026-08-24', weeklyXp: 90 }),
      save({ weeklyXpWeek: '2026-08-31', weeklyXp: 5, updatedAt: 2000 }),
    )!
    expect(newWeek.weeklyXpWeek).toBe('2026-08-31')
    expect(newWeek.weeklyXp).toBe(5)
  })

  it('returns the other side when one is missing (first run)', () => {
    const only = save()
    expect(mergeCloudSave(null, only)).toBe(only)
    expect(mergeCloudSave(only, null)).toBe(only)
  })

  it('carries chest flags in snapshots; newest writer wins them in merges', () => {
    const snap = snapshotFromPlayer({
      ...(save({ chestBoost: true, megaChest: true }) as unknown as Parameters<typeof snapshotFromPlayer>[0]),
      leagueHistory: [],
    })
    expect(snap.chestBoost).toBe(true)
    expect(snap.megaChest).toBe(true)
    const merged = mergeCloudSave(
      save({ chestBoost: true, megaChest: false, updatedAt: 1000 }),
      save({ chestBoost: false, megaChest: true, updatedAt: 2000 }),
    )!
    expect(merged.chestBoost).toBe(false)
    expect(merged.megaChest).toBe(true)
  })
})

function adaptiveWith(attempts: number, pL: number, ts: number): AdaptiveStore {
  const base = initialAdaptive()
  return {
    ...base,
    snapshot: {
      skills: {
        '2Nc.01': {
          pL, attempts, correct: attempts, incorrect: 0, recent: [],
          trend: pL, lastPracticedAt: ts, avgResponseMs: 3000,
          difficulty: 1, streakCorrect: 0, streakWrong: 0, firstSeenAt: ts,
        },
      },
      seenCodes: ['2Nc.01'],
      recentPicks: ['2Nc.01'],
      lastRecommendation: null,
    },
    attempts: [
      buildAttemptEntry({
        lessonId: 'u1l1', objectiveCode: '2Nc.01', kind: 'type-number',
        difficulty: 1, answer: '5', correct: true, responseTimeMs: 3000,
        masteryBefore: 0.1, masteryAfter: pL, reason: 'in-lesson', ts,
      }),
    ],
    masteryHistory: { '2Nc.01': [{ ts, pL }] },
  }
}

describe('adaptive cloud merge', () => {
  it('passes null through and keeps one-sided slices', () => {
    expect(mergeAdaptive(null, null)).toBeNull()
    const one = adaptiveWith(3, 0.5, 100)
    expect(mergeAdaptive(one, null)).toBe(one)
    expect(mergeAdaptive(null, one)).toBe(one)
  })

  it('more evidence wins per skill; logs interleave by time', () => {
    const merged = mergeAdaptive(adaptiveWith(2, 0.3, 100), adaptiveWith(9, 0.8, 200))!
    expect(merged.snapshot.skills['2Nc.01']!.attempts).toBe(9)
    expect(merged.snapshot.skills['2Nc.01']!.pL).toBe(0.8)
    expect(merged.attempts.map((e) => e.ts)).toEqual([100, 200])
    expect(merged.masteryHistory['2Nc.01']!.length).toBe(2)
  })

  it('merges through mergeCloudSave end to end', () => {
    const merged = mergeCloudSave(
      save({ adaptive: adaptiveWith(2, 0.3, 100) }),
      save({ adaptive: adaptiveWith(9, 0.8, 200), updatedAt: 2000 }),
    )!
    expect(merged.adaptive!.snapshot.skills['2Nc.01']!.attempts).toBe(9)
    expect(merged.adaptive!.attempts.length).toBe(2)
  })
})
