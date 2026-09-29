import { describe, expect, it } from 'vitest'
import {
  mergeAdaptive,
  mergeCloudSave,
  snapshotFromPlayer,
  type CloudSave,
} from '../src/engine/cloudsave'
import { usePlayer } from '../src/engine/store'
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
    yearLevel: 2, // PLAN 165: new clients sync these; old saves omit them
    extrasUnlocked: false,
    paths: {},
    updatedAt: Date.now(), // the bug: local always looks newest
    ...overrides,
  }
}

/** A per-year bucket for merge fixtures. */
function bucket(subject: 'math' | 'english' | 'science' = 'math', extra: Record<string, unknown> = {}) {
  return {
    lessonProgress: {},
    subject,
    arcadeScores: {},
    sprintBest: 0,
    ...extra,
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
      yearLevel: 2 as const,
      extrasUnlocked: false,
      paths: {},
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

/** PLAN 165 — snapshot carries the year view; merge unions it device to device. */
describe('PLAN 165 — cloudsave year fields', () => {
  it('snapshotFromPlayer carries yearLevel, extrasUnlocked and deep-copied paths', () => {
    const p = {
      ...usePlayer.getState(),
      yearLevel: 1 as const,
      extrasUnlocked: true,
      paths: { 1: bucket('english'), 2: bucket('math') },
    }
    const snap = snapshotFromPlayer(p)
    expect(snap.yearLevel).toBe(1)
    expect(snap.extrasUnlocked).toBe(true)
    expect(snap.paths![1]?.subject).toBe('english')
    expect(snap.paths![2]?.subject).toBe('math')
    // deep copy: mutating the wire payload must not touch live store objects
    snap.paths![1]!.subject = 'science'
    expect(usePlayer.getState().paths[1]?.subject ?? 'english').toBe('english')
  })

  it('yearLevel follows remote; the top-level view is the merged active year', () => {
    const local = freshLocal({
      yearLevel: 2,
      subject: 'math',
      paths: { 2: bucket('math', { lessonProgress: { 'u1l1': { crown: 1, bestAccuracy: 70, completions: 1 } } }) },
    })
    const remote = remoteSave({ yearLevel: 1, subject: 'science' })
    const merged = mergeCloudSave(local, remote)!
    // remote device lives in Year 1: the account year becomes 1 and the
    // mirrored top-level roadmap follows the merged Year-1 view (with no
    // Year-1 bucket anywhere, the alone-in-year remote's flat subject decides).
    expect(merged.yearLevel).toBe(1)
    expect(merged.subject).toBe('science')
    // our own Year-2 view survived inside paths[2] for the trip home
    expect(merged.paths![2]?.subject).toBe('math')
    expect(merged.paths![2]?.lessonProgress['u1l1']).toEqual({ crown: 1, bestAccuracy: 70, completions: 1 })
  })

  it('extrasUnlocked is sticky-OR in either direction', () => {
    const a = mergeCloudSave(freshLocal({ extrasUnlocked: false }), remoteSave({ extrasUnlocked: true }))!
    expect(a.extrasUnlocked).toBe(true)
    const b = mergeCloudSave(freshLocal({ extrasUnlocked: true }), remoteSave({ extrasUnlocked: false }))!
    expect(b.extrasUnlocked).toBe(true)
    const c = mergeCloudSave(freshLocal({ extrasUnlocked: false }), remoteSave({ extrasUnlocked: false }))!
    expect(c.extrasUnlocked).toBe(false)
    // old saves that pre-date the switch heal to unlocked only from `true`
    const d = mergeCloudSave(freshLocal(), remoteSave())!
    expect(d.extrasUnlocked).toBe(false)
  })

  it('sibling-year buckets union independently (progress unions, scores max)', () => {
    const local = freshLocal({
      yearLevel: 2,
      paths: {
        1: bucket('english', {
          lessonProgress: { 'e1l1': { crown: 1, bestAccuracy: 60, completions: 1 } },
          arcadeScores: { 'word-rescue': 100 },
          sprintBest: 40,
        }),
        2: bucket('math'),
      },
    })
    const remote = remoteSave({
      yearLevel: 2,
      paths: {
        1: bucket('science', {
          lessonProgress: { 'e1l1': { crown: 3, bestAccuracy: 90, completions: 2 }, 's1l1': { crown: 1, bestAccuracy: 50, completions: 1 } },
          arcadeScores: { 'word-rescue': 150, 'lab-blitz': 80 },
          sprintBest: 55,
        }),
      },
    })
    const merged = mergeCloudSave(local, remote)!
    // active year stays 2; the Year-1 bucket unions both devices' work
    expect(merged.yearLevel).toBe(2)
    const y1 = merged.paths![1]!
    expect(y1.lessonProgress['e1l1']).toEqual({ crown: 3, bestAccuracy: 90, completions: 2 })
    expect(y1.lessonProgress['s1l1']).toEqual({ crown: 1, bestAccuracy: 50, completions: 1 })
    expect(y1.subject).toBe('science') // remote roadmap wins inside the bucket
    expect(y1.arcadeScores).toEqual({ 'word-rescue': 150, 'lab-blitz': 80 })
    expect(y1.sprintBest).toBe(55)
    // our Year-2 bucket untouched by the other device (it had none)
    expect(merged.paths![2]?.subject).toBe('math')
  })

  it('round-trips each side through empty buckets without wiping anything', () => {
    const local = freshLocal({
      yearLevel: 2,
      paths: { 2: bucket('math', { lessonProgress: { 'u1l1': { crown: 2, bestAccuracy: 80, completions: 1 } } }) },
    })
    const remote = remoteSave({
      yearLevel: 2,
      paths: { 1: bucket('english', { lessonProgress: { 'e1l1': { crown: 1, bestAccuracy: 70, completions: 1 } } }) },
    })
    const merged = mergeCloudSave(local, remote)!
    expect(merged.paths![2]?.lessonProgress['u1l1']).toEqual({ crown: 2, bestAccuracy: 80, completions: 1 })
    expect(merged.paths![1]?.lessonProgress['e1l1']).toEqual({ crown: 1, bestAccuracy: 70, completions: 1 })
    // active-year top-level still mirrors Year 2
    expect(merged.yearLevel).toBe(2)
    expect(merged.subject).toBe('math')
  })

  it('a whitelist-stripped save degrades to local-only (never unwipes, never crashes)', () => {
    // Server (pre-171) drops the 3 fields: remote arrives as a legacy save.
    const local = freshLocal({
      yearLevel: 1,
      subject: 'english',
      paths: {
        1: bucket('english', { lessonProgress: { 'e1l1': { crown: 2, bestAccuracy: 80, completions: 1 } } }),
        2: bucket('math'),
      },
    })
    const legacyRemote = remoteSave({ subject: 'math', lessonProgress: {} })
    delete (legacyRemote as Partial<CloudSave>).yearLevel
    delete (legacyRemote as Partial<CloudSave>).extrasUnlocked
    delete (legacyRemote as Partial<CloudSave>).paths
    const merged = mergeCloudSave(local, legacyRemote)!
    // no year info anywhere remote-side = merged year stays local (1) and
    // every local year bucket is kept; the local Year-1 bucket is
    // authoritative, so remote's stale flat subject ('math') cannot hijack
    // the roadmap this device already pinned (it was simply last synced
    // before this device moved to English).
    expect(merged.yearLevel).toBe(1)
    expect(merged.paths![1]?.lessonProgress['e1l1']).toEqual({ crown: 2, bestAccuracy: 80, completions: 1 })
    expect(merged.paths![2]?.subject).toBe('math')
    expect(merged.subject).toBe('english')
  })

  it('corrupt path entries fall back to empty buckets, never throw', () => {
    const local = freshLocal({ yearLevel: 1 })
    const remote = remoteSave({
      yearLevel: 1,
      paths: { 1: 'nope' as unknown as never, 2: null as unknown as never },
    })
    let merged: CloudSave | null = null
    expect(() => {
      merged = mergeCloudSave(local, remote)
    }).not.toThrow()
    // corrupt buckets are ignored entirely: Year 1 falls back to the flat
    // view union (remote identity wins — both devices claim the year) and the
    // junk Year-2 entry never materialises as a bucket
    expect(merged!.paths![1]?.subject).toBe('english')
    expect(Object.keys(merged!.paths![1]!.lessonProgress)).toEqual(['u1-l1'])
    expect(merged!.paths![2]).toBeUndefined()
  })
})

/** PLAN 165 — the store-side apply path for synced year fields. */
describe('PLAN 165 — applySyncedSnapshot year view', () => {
  const reset = () =>
    usePlayer.setState({
      yearLevel: 2,
      subject: 'math',
      extrasUnlocked: false,
      lessonProgress: {},
      arcadeScores: {},
      sprintBest: 0,
      paths: { 2: bucket('math') },
    })

  it('applies a remote year switch atomically: our bucket is saved, theirs loads', () => {
    reset()
    // our Year-2 work
    usePlayer.setState({
      lessonProgress: { 'u1l1': { crown: 2, bestAccuracy: 80, completions: 1 } },
      paths: { 2: bucket('math', { lessonProgress: { 'u1l1': { crown: 2, bestAccuracy: 80, completions: 1 } } }) },
    })
    usePlayer.getState().applySyncedSnapshot({
      yearLevel: 1,
      paths: {
        1: bucket('english', { lessonProgress: { 'e1l1': { crown: 1, bestAccuracy: 70, completions: 1 } } }),
      },
    })
    const st = usePlayer.getState()
    expect(st.yearLevel).toBe(1)
    expect(st.subject).toBe('english')
    expect(st.lessonProgress['e1l1']).toEqual({ crown: 1, bestAccuracy: 70, completions: 1 })
    // our old Year-2 view was parked in paths[2], the incoming Year-1 in paths[1]
    expect(st.paths[2]?.lessonProgress['u1l1']).toEqual({ crown: 2, bestAccuracy: 80, completions: 1 })
    expect(st.paths[1]?.lessonProgress['e1l1']).toBeDefined()
    reset()
  })

  it('same-year snapshots union per-year buckets without touching siblings', () => {
    reset()
    usePlayer.getState().applySyncedSnapshot({
      yearLevel: 2,
      paths: {
        2: bucket('math', { lessonProgress: { 'u1l1': { crown: 1, bestAccuracy: 60, completions: 1 } } }),
        3: bucket('english', { lessonProgress: { 'e1l1': { crown: 2, bestAccuracy: 90, completions: 3 } } }),
      },
    })
    const st = usePlayer.getState()
    expect(st.yearLevel).toBe(2) // same year: no switch
    expect(st.paths[2]?.lessonProgress['u1l1']).toEqual({ crown: 1, bestAccuracy: 60, completions: 1 })
    expect(st.paths[3]?.lessonProgress['e1l1']).toEqual({ crown: 2, bestAccuracy: 90, completions: 3 })
    reset()
  })

  it('extrasUnlocked is sticky (true applies, false never un-unlocks)', () => {
    reset()
    usePlayer.getState().applySyncedSnapshot({ extrasUnlocked: true })
    expect(usePlayer.getState().extrasUnlocked).toBe(true)
    usePlayer.getState().applySyncedSnapshot({ extrasUnlocked: false })
    expect(usePlayer.getState().extrasUnlocked).toBe(true)
    reset()
  })

  it('a legacy snapshot without year fields leaves the year view untouched', () => {
    reset()
    usePlayer.getState().applySyncedSnapshot({ xpTotal: 999 })
    const st = usePlayer.getState()
    expect(st.yearLevel).toBe(2)
    expect(st.paths[2]?.subject).toBe('math')
    expect(st.xpTotal).toBe(999)
    reset()
  })

  it('a remote year switch never loads an out-of-year subject (PLAN 163 guard)', () => {
    reset()
    usePlayer.getState().applySyncedSnapshot({
      yearLevel: 1,
      paths: { 1: bucket('english', { subject: 'german' as never }) },
    })
    const st = usePlayer.getState()
    expect(st.yearLevel).toBe(1)
    expect(st.subject).toBe('math') // german is hidden in Year 1 → fallback
    reset()
  })

  it('yearLevel without paths switches into a FRESH bucket (no old-view leak)', () => {
    reset()
    usePlayer.setState({
      lessonProgress: { 'u1l1': { crown: 3, bestAccuracy: 90, completions: 2 } },
      paths: { 2: bucket('math', { lessonProgress: { 'u1l1': { crown: 3, bestAccuracy: 90, completions: 2 } } }) },
    })
    usePlayer.getState().applySyncedSnapshot({ yearLevel: 1 })
    const st = usePlayer.getState()
    expect(st.yearLevel).toBe(1)
    // fresh Year-1 view: empty, NOT our Year-2 flat view leaked under the key
    expect(st.lessonProgress).toEqual({})
    expect(st.paths[1]?.lessonProgress).toEqual({})
    // our Year-2 work parked untouched
    expect(st.paths[2]?.lessonProgress['u1l1']).toEqual({ crown: 3, bestAccuracy: 90, completions: 2 })
    reset()
  })

  it('a raw (un-merged) snap unions buckets instead of wiping ours', () => {
    reset()
    usePlayer.getState().applySyncedSnapshot({
      yearLevel: 2,
      paths: {
        2: bucket('math', { lessonProgress: { 'u2l9': { crown: 1, bestAccuracy: 50, completions: 1 } } }),
        3: bucket('english', { lessonProgress: { 'e1l1': { crown: 2, bestAccuracy: 80, completions: 1 } } }),
      },
    })
    // simulate a second RAW snap that only knows about part of the world
    usePlayer.getState().applySyncedSnapshot({
      yearLevel: 2,
      paths: { 3: bucket('english', { lessonProgress: { 'e1l5': { crown: 1, bestAccuracy: 60, completions: 1 } } }) },
    })
    const st = usePlayer.getState()
    // our Year-2 bucket survives the raw snap (never wiped)
    expect(st.paths[2]?.lessonProgress['u2l9']).toBeDefined()
    // Year-3 bucket UNIONS both snaps rather than being replaced
    expect(st.paths[3]?.lessonProgress['e1l1']).toBeDefined()
    expect(st.paths[3]?.lessonProgress['e1l5']).toBeDefined()
    reset()
  })
})
