import { create } from 'zustand'
import { useAuth } from './auth'
import { usePlayer, type LessonProgress, type LeagueHistoryEntry, type YearLevel, type YearPath } from './store'
import { LEAGUES, type LeagueName } from './gamification'
import type { MascotId, Subject } from '../content/types'
import type { AdaptiveStore, AdaptiveTelemetry, SkillState, AttemptLogEntry } from './adaptive/types'
import { capSnapshots } from './adaptive/attempts'
import { mergeActivityDays, normaliseActivityDays } from './recap'

// Cross-device sync for the same Google account — the momolearn.space model.
//
// The browser proves who it is with its Google ID token; the server verifies
// that token and keys the save by the Google account id (`sub`). Sign in with
// the same Google account on any device and the pull below loads the same
// progress. Local state stays the source of truth while offline — sync only
// ever merges (max/union/newest-wins), never deletes.

export const CLOUDSAVE_API = 'https://momolearn-ai.vercel.app/api/year2/cloudsave'

export interface CloudSave {
  name: string
  mascot: MascotId
  subject: Subject
  xpTotal: number
  gems: number
  streakCurrent: number
  streakLongest: number
  lastActiveDay: string | null
  dailyGoal: number
  weeklyXpWeek: string
  weeklyXp: number
  currentLeague: LeagueName
  leagueHistory: LeagueHistoryEntry[]
  pendingLeagueSettle: { weekKey: string; xp: number } | null
  lessonProgress: Record<string, LessonProgress>
  achievements: string[]
  cardStars: Record<string, number>
  cardPity: number
  shopInventory: Record<string, number>
  streakSavers: number
  lastStreakReward: number
  pendingStreakMilestone: number | null
  doubleXpLessons: number
  chestBoost: boolean
  megaChest: boolean
  luckyTickets: number
  dust: number
  claimedQuests: { day: string; questIds: string[] }
  dailyLoginStreak: number
  lastLoginDay: string | null
  loginRewardClaimedDay: string | null
  arcadeScores: Record<string, number>
  booksRead: Record<string, boolean>
  onboarded: boolean
  soundOn: boolean
  /** Practice calendar days (WS15); optional — old saves pre-date it and the
   *  deployed server whitelist may drop it (client merge still unions). */
  activityDays?: string[]
  /** Learning tracker; `null` on old saves — pass through, never crash. */
  adaptive: AdaptiveStore | null
  /** PLAN 165 — multi-year fields (client-first): the active year (remote
   *  wins), the grand-unlock switch (sticky-OR) and the per-year buckets
   *  (unioned per year). The deployed server whitelist may drop them until
   *  the server handoff (PLAN 171) lands — old saves pre-date them and the
   *  client merge treats every side as optional, so cross-device year sync
   *  degrades to local-only, never to a crash. */
  yearLevel?: YearLevel
  extrasUnlocked?: boolean
  paths?: Partial<Record<YearLevel, YearPath>>
  updatedAt: number
}

export type SyncStatus = 'signed-out' | 'syncing' | 'synced' | 'expired' | 'error'

interface SyncUi {
  status: SyncStatus
  detail: string
  /** True once the initial pull for the current session returned a remote save. */
  remoteSeen: boolean
  setStatus: (s: SyncStatus, detail?: string) => void
  setRemoteSeen: (v: boolean) => void
}

export const useSyncStatus = create<SyncUi>()((set) => ({
  status: 'signed-out',
  detail: '',
  remoteSeen: false,
  setStatus: (status, detail = '') => set({ status, detail }),
  setRemoteSeen: (remoteSeen) => set({ remoteSeen }),
}))

export class CloudAuthError extends Error {
  constructor() {
    super('google-session-expired')
  }
}

async function authed(method: 'GET' | 'PUT', credential: string, save?: CloudSave): Promise<CloudSave | null> {
  const token = String(credential ?? '').trim()
  if (!token) throw new CloudAuthError()
  const res = await fetch(CLOUDSAVE_API, {
    method,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: method === 'PUT' ? JSON.stringify({ save }) : undefined,
  })
  if (res.status === 401) throw new CloudAuthError()
  if (!res.ok) throw new Error(`sync-http-${res.status}`)
  const data = (await res.json()) as { ok?: boolean; save?: CloudSave | null }
  return data?.save ?? null
}

export const pullCloudsave = (credential: string) => authed('GET', credential)

export const pushCloudsave = (credential: string, save: CloudSave) =>
  authed('PUT', credential, save)

/** Whitelisted snapshot of local state — day counters stay per-device. */
export function snapshotFromPlayer(p: {
  name: string
  mascot: MascotId
  subject: Subject
  xpTotal: number
  gems: number
  streakCurrent: number
  streakLongest: number
  lastActiveDay: string | null
  dailyGoal: number
  weeklyXpWeek: string
  weeklyXp: number
  currentLeague: LeagueName
  leagueHistory: LeagueHistoryEntry[]
  pendingLeagueSettle: { weekKey: string; xp: number } | null
  lessonProgress: Record<string, LessonProgress>
  achievements: string[]
  cardStars: Record<string, number>
  cardPity: number
  shopInventory: Record<string, number>
  streakSavers: number
  lastStreakReward: number
  pendingStreakMilestone: number | null
  doubleXpLessons: number
  chestBoost: boolean
  megaChest: boolean
  luckyTickets: number
  dust: number
  claimedQuests: { day: string; questIds: string[] }
  dailyLoginStreak: number
  lastLoginDay: string | null
  loginRewardClaimedDay: string | null
  arcadeScores: Record<string, number>
  booksRead: Record<string, boolean>
  onboarded: boolean
  soundOn: boolean
  activityDays: string[]
  adaptive: AdaptiveStore
  yearLevel: YearLevel
  extrasUnlocked: boolean
  paths: Partial<Record<YearLevel, YearPath>>
}): CloudSave {
  // Trim the per-skill curves for the wire (local keeps 200 points).
  // Old saves carry adaptive: null — pass that through, don't crash.
  const masteryHistory: AdaptiveStore['masteryHistory'] = {}
  if (p.adaptive) {
    for (const [code, series] of Object.entries(p.adaptive.masteryHistory)) {
      masteryHistory[code] = series.slice(-50)
    }
  }
  // PLAN 165 — deep-copy the year buckets so the wire payload can never alias
  // live store objects (merges / JSON serialisation mutate what they hold).
  const paths: Partial<Record<YearLevel, YearPath>> = {}
  for (const [k, v] of Object.entries(p.paths ?? {})) {
    const y = Number(k) as YearLevel
    if (!v || typeof v !== 'object') continue
    paths[y] = {
      // deep-copy entries too — the wire payload must never alias live store
      // objects (a merge that later mutates an entry would corrupt state)
      lessonProgress: Object.fromEntries(
        Object.entries(v.lessonProgress ?? {}).map(([id, e]) => [id, { ...e }]),
      ),
      subject: v.subject,
      arcadeScores: { ...(v.arcadeScores ?? {}) },
      sprintBest: v.sprintBest,
    }
  }
  return {
    name: String(p.name ?? 'Champion').slice(0, 24) || 'Champion',
    mascot: p.mascot,
    subject: p.subject,
    xpTotal: p.xpTotal,
    gems: p.gems,
    streakCurrent: p.streakCurrent,
    streakLongest: p.streakLongest,
    lastActiveDay: p.lastActiveDay,
    dailyGoal: p.dailyGoal,
    weeklyXpWeek: p.weeklyXpWeek,
    weeklyXp: p.weeklyXp,
    currentLeague: p.currentLeague,
    leagueHistory: p.leagueHistory,
    pendingLeagueSettle: p.pendingLeagueSettle,
    lessonProgress: p.lessonProgress,
    achievements: p.achievements.map(String),
    cardStars: p.cardStars,
    cardPity: p.cardPity,
    shopInventory: p.shopInventory,
    streakSavers: p.streakSavers,
    lastStreakReward: p.lastStreakReward,
    pendingStreakMilestone: p.pendingStreakMilestone,
    doubleXpLessons: p.doubleXpLessons,
    chestBoost: p.chestBoost,
    megaChest: p.megaChest,
    luckyTickets: p.luckyTickets,
    dust: p.dust,
    claimedQuests: p.claimedQuests,
    dailyLoginStreak: p.dailyLoginStreak,
    lastLoginDay: p.lastLoginDay,
    loginRewardClaimedDay: p.loginRewardClaimedDay,
    arcadeScores: p.arcadeScores,
    booksRead: p.booksRead,
    onboarded: p.onboarded,
    soundOn: p.soundOn,
    activityDays: normaliseActivityDays(p.activityDays),
    adaptive: p.adaptive ? { ...p.adaptive, masteryHistory } : null,
    yearLevel: p.yearLevel,
    extrasUnlocked: p.extrasUnlocked,
    paths,
    updatedAt: Date.now(),
  }
}

/** Star levels from either device survive: union of cards, max stars each. */
export function mergeStars(
  a: Record<string, number>,
  b: Record<string, number>,
): Record<string, number> {
  const merged: Record<string, number> = { ...a }
  for (const [k, v] of Object.entries(b)) merged[k] = Math.max(merged[k] ?? -1, v)
  return merged
}

/**
 * Learning-tracker union (client twin of the server merge): skills keep the
 * side with more attempts (tie → newer lastPracticedAt), attempt log dedupes
 * by payload and stays time-ordered, mastery curves union + sort + cap, and
 * telemetry takes componentwise maxima. `null` on either side passes through —
 * old saves without an adaptive slice keep loading.
 */
export function mergeAdaptive(
  a: AdaptiveStore | null,
  b: AdaptiveStore | null,
): AdaptiveStore | null {
  if (!a) return b
  if (!b) return a
  const skills: Record<string, SkillState> = { ...a.snapshot.skills }
  for (const [code, sb] of Object.entries(b.snapshot.skills)) {
    const sa = skills[code]
    if (!sa) {
      skills[code] = sb
    } else if (
      sb.attempts > sa.attempts ||
      (sb.attempts === sa.attempts && sb.lastPracticedAt > sa.lastPracticedAt)
    ) {
      skills[code] = sb
    }
  }
  const seen = new Set<string>()
  const attempts: AttemptLogEntry[] = []
  for (const e of [...a.attempts, ...b.attempts]) {
    const key = `${e.ts}|${e.objectiveCode}|${e.answer}|${e.correct ? 1 : 0}`
    if (seen.has(key)) continue
    seen.add(key)
    attempts.push(e)
  }
  attempts.sort((x, y) => x.ts - y.ts)
  const masteryHistory: AdaptiveStore['masteryHistory'] = {}
  const codes = new Set([...Object.keys(a.masteryHistory), ...Object.keys(b.masteryHistory)])
  for (const code of codes) {
    const pts = [...(a.masteryHistory[code] ?? []), ...(b.masteryHistory[code] ?? [])]
    const deduped = pts.filter(
      (p, i, arr) => arr.findIndex((q) => q.ts === p.ts && q.pL === p.pL) === i,
    )
    deduped.sort((x, y) => x.ts - y.ts)
    masteryHistory[code] = deduped.slice(-50)
  }
  const ta = a.telemetry
  const tb = b.telemetry
  const useB = tb.llmRequests >= ta.llmRequests
  const telemetry: AdaptiveTelemetry = {
    llmRequests: Math.max(ta.llmRequests, tb.llmRequests),
    llmHits: Math.max(ta.llmHits, tb.llmHits),
    llmFallbacks: Math.max(ta.llmFallbacks, tb.llmFallbacks),
    lastLlmProvider: useB ? tb.lastLlmProvider : ta.lastLlmProvider,
    lastLlmLatencyMs: useB ? tb.lastLlmLatencyMs : ta.lastLlmLatencyMs,
    recommended: Math.max(ta.recommended, tb.recommended),
    recommendedAccepted: Math.max(ta.recommendedAccepted, tb.recommendedAccepted),
  }
  return {
    snapshot: {
      skills,
      seenCodes: [...a.snapshot.seenCodes, ...b.snapshot.seenCodes.filter((c) => !a.snapshot.seenCodes.includes(c))],
      recentPicks: [...a.snapshot.recentPicks, ...b.snapshot.recentPicks.filter((c) => !a.snapshot.recentPicks.includes(c))].slice(0, 8),
      lastRecommendation: a.snapshot.lastRecommendation ?? b.snapshot.lastRecommendation,
    },
    attempts: capSnapshots(attempts.slice(-500)),
    masteryHistory,
    telemetry,
  }
}

/**
 * Client-side twin of the server merge: progress from either device survives.
 *
 * Call sites always pass `(local, remote)`. Identity fields follow **remote**
 * when it exists — `snapshotFromPlayer` stamps `updatedAt=Date.now()`, so a
 * fresh device's local defaults would otherwise always win "newest" and get
 * pushed back over the account name/mascot. `onboarded` is sticky-OR so a
 * half-finished local onboarding never un-onboards an account. Counters stay
 * max/union.
 *
 * PLAN 165 — multi-year union (local-only until the server whitelist lands):
 * the active year follows remote (identity, like `subject`); `extrasUnlocked`
 * is sticky-OR (an unlock anywhere unlocks everywhere); every year bucket is
 * unioned independently, exactly like the shared top-level fields (lesson
 * progress unions per lesson id, subjects follow remote, scores stay max).
 */
export function mergeCloudSave(local: CloudSave | null, remote: CloudSave | null): CloudSave | null {
  if (!local) return remote
  if (!remote) return local
  const newest = (remote.updatedAt || 0) >= (local.updatedAt || 0) ? remote : local
  const lessonProgress: Record<string, LessonProgress> = { ...local.lessonProgress }
  for (const [k, v] of Object.entries(remote.lessonProgress)) {
    const prev = lessonProgress[k]
    lessonProgress[k] = prev
      ? {
          crown: Math.max(prev.crown, v.crown),
          bestAccuracy: Math.max(prev.bestAccuracy, v.bestAccuracy),
          completions: Math.max(prev.completions, v.completions),
        }
      : v
  }
  const maxInventory = (x: Record<string, number>, y: Record<string, number>) => {
    const out: Record<string, number> = { ...x }
    for (const [k, v] of Object.entries(y)) out[k] = Math.max(out[k] ?? 0, v)
    return out
  }
  /** Coerce a wire bucket into a valid YearPath; undefined when corrupt. */
  const yearBucketOf = (v: unknown): YearPath | undefined => {
    if (!v || typeof v !== 'object') return undefined
    const o = v as Partial<YearPath>
    if (typeof o.subject !== 'string') return undefined
    if (!o.lessonProgress || typeof o.lessonProgress !== 'object') return undefined
    if (!o.arcadeScores || typeof o.arcadeScores !== 'object') return undefined
    return {
      lessonProgress: o.lessonProgress,
      subject: o.subject as Subject,
      arcadeScores: o.arcadeScores,
      sprintBest: typeof o.sprintBest === 'number' && Number.isFinite(o.sprintBest) ? o.sprintBest : 0,
    }
  }
  /** Union two VALID YearPath buckets: progress per lesson, remote subject, max scores. */
  const unionPath = (a: YearPath | undefined, b: YearPath | undefined): YearPath | undefined => {
    if (!a) return b ? { ...b, lessonProgress: { ...b.lessonProgress }, arcadeScores: { ...b.arcadeScores } } : undefined
    if (!b) return { ...a, lessonProgress: { ...a.lessonProgress }, arcadeScores: { ...a.arcadeScores } }
    const lp: Record<string, LessonProgress> = { ...a.lessonProgress }
    for (const [k, v] of Object.entries(b.lessonProgress)) {
      if (!v || typeof v !== 'object') continue // entry-level corruption guard
      const prev = lp[k]
      lp[k] = prev
        ? {
            crown: Math.max(prev.crown, v.crown),
            bestAccuracy: Math.max(prev.bestAccuracy, v.bestAccuracy),
            completions: Math.max(prev.completions, v.completions),
          }
        : v
    }
    return {
      lessonProgress: lp,
      subject: b.subject, // mirrors the top-level rule: remote's roadmap wins
      arcadeScores: maxInventory(a.arcadeScores, b.arcadeScores),
      sprintBest: Math.max(a.sprintBest, b.sprintBest),
    }
  }
  // The merged active year (identity, like `subject`: remote wins). Computed
  // first so the bucket loop below always travels it, even when both sides
  // predate `paths`.
  const mergedYear = remote.yearLevel ?? local.yearLevel ?? 2
  const paths: Partial<Record<YearLevel, YearPath>> = {}
  const pathYears = new Set<YearLevel>([
    ...Object.keys(local.paths ?? {}).map(Number),
    ...Object.keys(remote.paths ?? {}).map(Number),
    mergedYear, // the active year always travels, even when both sides predate paths
  ] as YearLevel[])
  for (const y of pathYears) {
    if (y === mergedYear) continue // folded below (yearPath)
    const la = yearBucketOf(local.paths?.[y])
    const lb = yearBucketOf(remote.paths?.[y])
    if (!la && !lb) continue
    paths[y] = unionPath(la, lb)!
  }
  // Fold legacy top-level progress AND scores into the merged year's bucket
  // (old clients and old saves sync only the flat view): the flat lessons
  // union together with both buckets, and the legacy scores max in. The wire
  // never carried a flat sprint best (it lives per-year in `paths`), so a
  // missing bucket starts at 0. A flat view is folded ONLY when that device
  // is actually IN the merged year AND has no bucket for it — the flat view
  // is a mirror of one of its own buckets, so folding an OUT-OF-YEAR flat
  // view would leak (e.g.) Year-2 lessons into the merged Year-1 roadmap
  // when their ids overlap.
  const flatAsPath = (s: CloudSave) => {
    return {
      lessonProgress: s.lessonProgress ?? {},
      subject: s.subject,
      arcadeScores: s.arcadeScores ?? {},
      sprintBest: 0,
    }
  }
  const foldOf = (s: CloudSave): YearPath | undefined => {
    if ((s.yearLevel ?? 2) !== mergedYear) return undefined
    return yearBucketOf(s.paths?.[mergedYear as YearLevel]) ? undefined : flatAsPath(s)
  }
  // Subject precedence for the merged year: a real same-year bucket is
  // authoritative (local first, then remote). With no valid bucket anywhere,
  // only a device that is ALONE in claiming that year gets a say through its
  // flat `subject` (e.g. a Year-1 remote vs a Year-2 local decides the merged
  // Year-1 view); when both claim the year — or a legacy save carries no year
  // at all — the long-standing identity rule stands: remote wins.
  const subjectForYear = (y: number): Subject => {
    const localInYear = (local.yearLevel ?? 2) === y
    const remoteInYear = (remote.yearLevel ?? 2) === y
    const flat = localInYear && !remoteInYear ? local.subject : remote.subject
    return (
      yearBucketOf(local.paths?.[y as YearLevel])?.subject ??
      yearBucketOf(remote.paths?.[y as YearLevel])?.subject ??
      flat
    )
  }
  paths[mergedYear] =
    unionPath(
      unionPath(yearBucketOf(local.paths?.[mergedYear]), foldOf(local)),
      unionPath(yearBucketOf(remote.paths?.[mergedYear]), foldOf(remote)),
    ) ?? {
      lessonProgress: {} as Record<string, LessonProgress>,
      subject: remote.subject,
      arcadeScores: {},
      sprintBest: 0,
    }
  paths[mergedYear]!.subject = subjectForYear(mergedYear)
  // The merged active year drives the top-level per-year view (the store's
  // mirror treats the top-level copies as the live view of paths[year]).
  const yearPath = paths[mergedYear]!
  return {
    name: remote.name,
    mascot: remote.mascot,
    subject: yearPath.subject, // the ACTIVE year's roadmap (was: remote.subject)
    dailyGoal: remote.dailyGoal,
    onboarded: local.onboarded || remote.onboarded,
    soundOn: remote.soundOn,
    lastActiveDay: newest.lastActiveDay,
    lastLoginDay: newest.lastLoginDay,
    loginRewardClaimedDay: newest.loginRewardClaimedDay,
    dailyLoginStreak: Math.max(local.dailyLoginStreak, remote.dailyLoginStreak),
    weeklyXpWeek: newest.weeklyXpWeek,
    currentLeague:
      LEAGUES.indexOf(remote.currentLeague) >= LEAGUES.indexOf(local.currentLeague)
        ? remote.currentLeague
        : local.currentLeague,
    xpTotal: Math.max(local.xpTotal, remote.xpTotal),
    gems: Math.max(local.gems, remote.gems),
    dust: Math.max(local.dust, remote.dust),
    streakCurrent: Math.max(local.streakCurrent, remote.streakCurrent),
    streakLongest: Math.max(local.streakLongest, remote.streakLongest),
    weeklyXp:
      newest.weeklyXpWeek && local.weeklyXpWeek === remote.weeklyXpWeek
        ? Math.max(local.weeklyXp, remote.weeklyXp)
        : (newest.weeklyXp ?? 0),
    leagueHistory: [...local.leagueHistory, ...remote.leagueHistory]
      .filter((h, i, arr) => arr.findIndex((x) => x.weekKey === h.weekKey) === i)
      .sort((x, y) => (x.weekKey < y.weekKey ? -1 : 1))
      .slice(-10),
    pendingLeagueSettle:
      (remote.pendingLeagueSettle &&
      (!local.pendingLeagueSettle || local.pendingLeagueSettle.weekKey <= remote.pendingLeagueSettle.weekKey)
        ? remote.pendingLeagueSettle
        : local.pendingLeagueSettle) ?? null,
    achievements: [...new Set([...local.achievements, ...remote.achievements])],
    cardStars: mergeStars(local.cardStars, remote.cardStars),
    cardPity: Math.min(local.cardPity, remote.cardPity),
    shopInventory: maxInventory(local.shopInventory, remote.shopInventory),
    streakSavers: Math.max(local.streakSavers, remote.streakSavers),
    lastStreakReward: Math.max(local.lastStreakReward, remote.lastStreakReward),
    pendingStreakMilestone: local.pendingStreakMilestone ?? remote.pendingStreakMilestone,
    doubleXpLessons: Math.max(local.doubleXpLessons, remote.doubleXpLessons),
    chestBoost: local.chestBoost || remote.chestBoost,
    megaChest: local.megaChest || remote.megaChest,
    luckyTickets: Math.max(local.luckyTickets, remote.luckyTickets),
    claimedQuests:
      newest.claimedQuests?.questIds?.length ? newest.claimedQuests : local.claimedQuests,
    arcadeScores: yearPath.arcadeScores, // ACTIVE year's (unioned with the legacy top-level same way)
    booksRead: { ...local.booksRead, ...remote.booksRead }, // union: read anywhere = read
    activityDays: mergeActivityDays(local.activityDays, remote.activityDays),
    adaptive: mergeAdaptive(local.adaptive, remote.adaptive),
    lessonProgress: yearPath.lessonProgress, // ACTIVE year's (unioned buckets; legacy top-level folded in below)
    // PLAN 165 — year view: remote's active year wins (identity); the local
    // unioned buckets of every OTHER year travel in `paths` untouched.
    yearLevel: mergedYear,
    extrasUnlocked: (local.extrasUnlocked ?? false) || (remote.extrasUnlocked ?? false),
    paths,
    updatedAt: Math.max(local.updatedAt || 0, remote.updatedAt || 0, Date.now()),
  }
}

const PUSH_DEBOUNCE_MS = 2500

let started = false

/** Pull on sign-in, push (debounced) on every change. Call once from App. */
export function startCloudSync() {
  if (started || typeof window === 'undefined') return
  started = true
  const setStatus = useSyncStatus.getState().setStatus
  const setRemoteSeen = useSyncStatus.getState().setRemoteSeen

  let initialPullDoneFor: string | null = null
  let pushTimer: ReturnType<typeof setTimeout> | null = null
  let lastPushedJson = ''
  let applyingRemote = false

  function pullKey(sub: string, credential: string) {
    return `${sub}:${String(credential).slice(-12)}`
  }

  async function initialPull(userSub: string, credential: string) {
    const key = pullKey(userSub, credential)
    if (initialPullDoneFor === key) return
    initialPullDoneFor = key
    setRemoteSeen(false)
    setStatus('syncing', 'Loading your progress…')
    try {
      const remote = await pullCloudsave(credential)
      setRemoteSeen(!!remote)
      const local = snapshotFromPlayer(usePlayer.getState())
      const merged = mergeCloudSave(local, remote)
      if (merged && remote) {
        applyingRemote = true
        try {
          usePlayer.getState().applySyncedSnapshot(merged)
        } finally {
          applyingRemote = false
        }
      }
      // Push the converged state back so a fresh device that only read
      // (or an older device that only wrote) heals to the same union.
      const converged = snapshotFromPlayer(usePlayer.getState())
      lastPushedJson = JSON.stringify({ ...converged, updatedAt: 0 })
      await pushCloudsave(credential, converged)
      usePlayer.getState().setLastSyncedAt(Date.now())
      setStatus('synced', 'Progress syncs across your devices')
    } catch (e) {
      if (e instanceof CloudAuthError) setStatus('expired', 'Tap sign-in again to keep syncing')
      else setStatus('error', 'Offline — progress is safe on this device')
    }
  }

  function schedulePush() {
    if (pushTimer) clearTimeout(pushTimer)
    pushTimer = setTimeout(async () => {
      const { user, credential } = useAuth.getState()
      if (!user?.sub || !credential || applyingRemote) return
      if (initialPullDoneFor !== pullKey(user.sub, credential)) {
        await initialPull(user.sub, credential)
        return
      }
      const snap = snapshotFromPlayer(usePlayer.getState())
      const json = JSON.stringify({ ...snap, updatedAt: 0 })
      if (json === lastPushedJson) return
      setStatus('syncing', 'Syncing…')
      try {
        await pushCloudsave(credential, snap)
        lastPushedJson = json
        usePlayer.getState().setLastSyncedAt(Date.now())
        setStatus('synced', 'Progress syncs across your devices')
      } catch (e) {
        if (e instanceof CloudAuthError) setStatus('expired', 'Tap sign-in again to keep syncing')
        else setStatus('error', 'Offline — progress is safe on this device')
      }
    }, PUSH_DEBOUNCE_MS)
  }

  useAuth.subscribe((s) => {
    if (s.user?.sub && s.credential) {
      void initialPull(s.user.sub, s.credential)
    } else {
      initialPullDoneFor = null
      lastPushedJson = ''
      if (pushTimer) clearTimeout(pushTimer)
      setRemoteSeen(false)
      setStatus('signed-out', '')
    }
  })

  usePlayer.subscribe(() => {
    const { user, credential } = useAuth.getState()
    if (!user?.sub || !credential || applyingRemote) return
    schedulePush()
  })

  // Signed-in persisted session (returning device): pull immediately.
  const { user, credential } = useAuth.getState()
  if (user?.sub && credential) void initialPull(user.sub, credential)
}

/** Manual "Sync now" for the Profile screen. */
export async function syncNow(): Promise<void> {
  const { user, credential } = useAuth.getState()
  const setStatus = useSyncStatus.getState().setStatus
  if (!user?.sub || !credential) {
    setStatus('signed-out', '')
    return
  }
  setStatus('syncing', 'Syncing…')
  try {
    const remote = await pullCloudsave(credential)
    const local = snapshotFromPlayer(usePlayer.getState())
    const merged = mergeCloudSave(local, remote)
    if (merged && remote) usePlayer.getState().applySyncedSnapshot(merged)
    const converged = snapshotFromPlayer(usePlayer.getState())
    await pushCloudsave(credential, converged)
    usePlayer.getState().setLastSyncedAt(Date.now())
    setStatus('synced', 'Progress syncs across your devices')
  } catch (e) {
    if (e instanceof CloudAuthError) setStatus('expired', 'Tap sign-in again to keep syncing')
    else setStatus('error', 'Offline — progress is safe on this device')
    throw e
  }
}
