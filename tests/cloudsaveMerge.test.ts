import { describe, expect, it } from 'vitest'
import { mergeCloudSave, type CloudSave } from '../src/engine/cloudsave'

/** Fresh-device local defaults: identity is placeholder, updatedAt is NOW. */
function freshLocal(overrides: Partial<CloudSave> = {}): CloudSave {
  return {
    name: 'Champion',
    mascot: 'sonic',
    subject: 'math',
    xpTotal: 0,
    gems: 0,
    streakCurrent: 0,
    streakLongest: 0,
    lastActiveDay: null,
    dailyGoal: 30,
    weeklyXpWeek: '2026-01-05',
    weeklyXp: 0,
    currentLeague: 'Bronze',
    leagueHistory: [],
    pendingLeagueSettle: null,
    lessonProgress: {},
    achievements: [],
    cardStars: {},
    cardPity: 0,
    shopInventory: {},
    streakSavers: 0,
    lastStreakReward: 0,
    pendingStreakMilestone: null,
    doubleXpLessons: 0,
    chestBoost: false,
    megaChest: false,
    luckyTickets: 0,
    dust: 0,
    claimedQuests: { day: '', questIds: [] },
    dailyLoginStreak: 0,
    lastLoginDay: null,
    loginRewardClaimedDay: null,
    arcadeScores: {},
    booksRead: {},
    onboarded: false,
    soundOn: true,
    updatedAt: Date.now(), // the bug: local always looks newest
    ...overrides,
  }
}

/** Account save from another device — older updatedAt, real identity. */
function remoteSave(overrides: Partial<CloudSave> = {}): CloudSave {
  return {
    ...freshLocal(),
    name: 'Momo',
    mascot: 'tails',
    subject: 'english',
    dailyGoal: 60,
    soundOn: false,
    onboarded: true,
    xpTotal: 120,
    gems: 40,
    lessonProgress: { 'u1-l1': { crown: 2, bestAccuracy: 90, completions: 3 } },
    achievements: ['first-lesson'],
    cardStars: { jet: 1 },
    updatedAt: Date.now() - 60_000, // older than local snapshot
    ...overrides,
  }
}

describe('mergeCloudSave identity (fresh-device pull)', () => {
  it('keeps remote name/mascot/subject/dailyGoal/soundOn', () => {
    const merged = mergeCloudSave(freshLocal(), remoteSave())
    expect(merged).not.toBeNull()
    expect(merged!.name).toBe('Momo')
    expect(merged!.mascot).toBe('tails')
    expect(merged!.subject).toBe('english')
    expect(merged!.dailyGoal).toBe(60)
    expect(merged!.soundOn).toBe(false)
  })

  it('sets onboarded when either side is onboarded', () => {
    expect(mergeCloudSave(freshLocal({ onboarded: false }), remoteSave({ onboarded: true }))!.onboarded).toBe(true)
    expect(mergeCloudSave(freshLocal({ onboarded: true }), remoteSave({ onboarded: false }))!.onboarded).toBe(true)
    expect(mergeCloudSave(freshLocal({ onboarded: false }), remoteSave({ onboarded: false }))!.onboarded).toBe(false)
  })

  it('unions progress counters (max)', () => {
    const merged = mergeCloudSave(
      freshLocal({ xpTotal: 50, gems: 10, lessonProgress: { 'u1-l1': { crown: 3, bestAccuracy: 70, completions: 1 } } }),
      remoteSave(),
    )!
    expect(merged.xpTotal).toBe(120)
    expect(merged.gems).toBe(40)
    expect(merged.lessonProgress['u1-l1']).toEqual({ crown: 3, bestAccuracy: 90, completions: 3 })
    expect(merged.achievements).toContain('first-lesson')
    expect(merged.cardStars.jet).toBe(1)
  })

  it('returns the other side when one is null', () => {
    const local = freshLocal()
    const remote = remoteSave()
    expect(mergeCloudSave(null, remote)).toBe(remote)
    expect(mergeCloudSave(local, null)).toBe(local)
    expect(mergeCloudSave(null, null)).toBeNull()
  })
})
