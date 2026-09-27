import { describe, expect, it } from 'vitest'
import {
  mergeAdaptive,
  mergeCloudSave,
  snapshotFromPlayer,
  type CloudSave,
} from '../src/engine/cloudsave'
import type {
  AdaptiveStore,
  AdaptiveTelemetry,
  AttemptLogEntry,
  SkillState,
} from '../src/engine/adaptive/types'

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
    adaptive: null, // old saves pre-date the learning tracker
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

  it('unions the adaptive tracker and passes null through', () => {
    const local = freshLocal({ adaptive: makeStore(['2Nc.01']) })
    const remote = remoteSave({ adaptive: makeStore(['2Np.03']) })
    const merged = mergeCloudSave(local, remote)!
    expect(merged.adaptive).not.toBeNull()
    expect(Object.keys(merged.adaptive!.snapshot.skills).sort()).toEqual(['2Nc.01', '2Np.03'])
    // an old save without the tracker keeps loading (null passthrough)
    expect(mergeCloudSave(freshLocal(), remoteSave())!.adaptive).toBeNull()
    expect(mergeCloudSave(freshLocal(), remoteSave({ adaptive: makeStore() }))!.adaptive).not.toBeNull()
  })
})

function skill(partial: Partial<SkillState> = {}): SkillState {
  return {
    pL: 0.5,
    attempts: 1,
    correct: 1,
    incorrect: 0,
    recent: [true],
    trend: 1,
    lastPracticedAt: 1000,
    avgResponseMs: 5000,
    difficulty: 1,
    streakCorrect: 1,
    streakWrong: 0,
    firstSeenAt: 500,
    ...partial,
  }
}

function attempt(partial: Partial<AttemptLogEntry> = {}): AttemptLogEntry {
  return {
    ts: 1000,
    lessonId: 'u1-l1',
    objectiveCode: '2Nc.01',
    kind: 'type-number',
    difficulty: 1,
    answer: '7',
    correct: true,
    responseTimeMs: 4000,
    masteryBefore: 0.4,
    masteryAfter: 0.55,
    reason: 'in-lesson',
    prompt: '3 + 4 = ?',
    correctAnswer: '7',
    ...partial,
  }
}

function telemetry(partial: Partial<AdaptiveTelemetry> = {}): AdaptiveTelemetry {
  return {
    llmRequests: 0,
    llmHits: 0,
    llmFallbacks: 0,
    lastLlmProvider: null,
    lastLlmLatencyMs: null,
    recommended: 0,
    recommendedAccepted: 0,
    ...partial,
  }
}

/** Minimal valid adaptive store with skills for each given code. */
function makeStore(codes: string[] = [], overrides: Partial<AdaptiveStore> = {}): AdaptiveStore {
  const skills: Record<string, SkillState> = {}
  for (const c of codes) skills[c] = skill({ pL: 0.6 })
  return {
    snapshot: { skills, seenCodes: [...codes], recentPicks: [...codes], lastRecommendation: null },
    attempts: [attempt()],
    masteryHistory: {},
    telemetry: telemetry(),
    ...overrides,
  }
}

describe('mergeAdaptive', () => {
  it('passes null through in both directions', () => {
    const s = makeStore(['2Nc.01'])
    expect(mergeAdaptive(null, s)).toBe(s)
    expect(mergeAdaptive(s, null)).toBe(s)
    expect(mergeAdaptive(null, null)).toBeNull()
  })

  it('keeps the side with more attempts per skill (tie → newer)', () => {
    const a = makeStore(['2Nc.01'], {
      snapshot: {
        skills: { '2Nc.01': skill({ attempts: 2, pL: 0.7, lastPracticedAt: 900 }) },
        seenCodes: ['2Nc.01'],
        recentPicks: [],
        lastRecommendation: null,
      },
    })
    const b = makeStore(['2Nc.01'], {
      snapshot: {
        skills: { '2Nc.01': skill({ attempts: 3, pL: 0.2, lastPracticedAt: 800 }) },
        seenCodes: ['2Nc.01'],
        recentPicks: [],
        lastRecommendation: null,
      },
    })
    const merged = mergeAdaptive(a, b)!
    // more attempts wins even though pL is lower (device B practised more)
    expect(merged.snapshot.skills['2Nc.01'].attempts).toBe(3)
    expect(merged.snapshot.skills['2Nc.01'].pL).toBe(0.2)
    // equal attempts → the newer lastPracticedAt wins
    const tie = mergeAdaptive(
      { ...a, snapshot: { ...a.snapshot, skills: { '2Nc.01': skill({ attempts: 3, lastPracticedAt: 1200 }) } } },
      { ...b, snapshot: { ...b.snapshot, skills: { '2Nc.01': skill({ attempts: 3, lastPracticedAt: 1100 }) } } },
    )!
    expect(tie.snapshot.skills['2Nc.01'].lastPracticedAt).toBe(1200)
  })

  it('dedupes the attempt log by payload and stays time-ordered', () => {
    const a = makeStore([], { attempts: [attempt({ ts: 5, answer: '7' })] })
    const b = makeStore([], {
      attempts: [
        attempt({ ts: 9, answer: '9' }),
        attempt({ ts: 5, answer: '7' }), // identical payload → dropped
        attempt({ ts: 7, answer: '8' }),
      ],
    })
    const merged = mergeAdaptive(a, b)!
    expect(merged.attempts.map((e) => e.ts)).toEqual([5, 7, 9])
  })

  it('takes componentwise maxima for telemetry', () => {
    const a = makeStore([], { telemetry: telemetry({ llmRequests: 4, llmHits: 2, recommended: 1, lastLlmProvider: 'gemini' }) })
    const b = makeStore([], { telemetry: telemetry({ llmRequests: 3, llmHits: 5, recommended: 6, lastLlmProvider: 'openai' }) })
    const merged = mergeAdaptive(a, b)!
    expect(merged.telemetry.llmRequests).toBe(4)
    expect(merged.telemetry.llmHits).toBe(5)
    expect(merged.telemetry.recommended).toBe(6)
    expect(merged.telemetry.lastLlmProvider).toBe('gemini') // tied requests → local (a) stays
  })

  it('unions seenCodes and recentPicks without duplicates', () => {
    const a = makeStore(['2Nc.01', '2Np.03'])
    const b = makeStore(['2Np.03', '2No.02'])
    const merged = mergeAdaptive(a, b)!
    expect(merged.snapshot.seenCodes).toEqual(['2Nc.01', '2Np.03', '2No.02'])
    expect(merged.snapshot.recentPicks).toEqual(['2Nc.01', '2Np.03', '2No.02'])
  })
})

describe('snapshotFromPlayer wire trim', () => {
  it('caps mastery curves at 50 points per code and passes null through', () => {
    const longSeries = Array.from({ length: 200 }, (_, i) => ({ ts: i, pL: i / 200 }))
    const base = {
      name: 'Champion',
      mascot: 'sonic' as const,
      subject: 'math' as const,
      xpTotal: 0,
      gems: 0,
      streakCurrent: 0,
      streakLongest: 0,
      lastActiveDay: null,
      dailyGoal: 30,
      weeklyXpWeek: '2026-01-05',
      weeklyXp: 0,
      currentLeague: 'Bronze' as const,
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
      activityDays: [],
    }
    const trimmed = snapshotFromPlayer({
      ...base,
      adaptive: makeStore(['2Nc.01'], { masteryHistory: { '2Nc.01': longSeries } }),
    })
    expect(trimmed.adaptive!.masteryHistory['2Nc.01']).toHaveLength(50)
    expect(trimmed.adaptive!.masteryHistory['2Nc.01'][0].ts).toBe(150) // keeps the newest tail
    const nulled = snapshotFromPlayer({ ...base, adaptive: null as unknown as AdaptiveStore })
    expect(nulled.adaptive).toBeNull()
  })
})
