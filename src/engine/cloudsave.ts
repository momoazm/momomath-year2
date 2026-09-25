import { create } from 'zustand'
import { useAuth } from './auth'
import { usePlayer, type LessonProgress, type LeagueHistoryEntry } from './store'
import { LEAGUES, type LeagueName } from './gamification'
import type { MascotId, Subject } from '../content/types'

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
}): CloudSave {
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
 * Client-side twin of the server merge: progress from either device survives.
 *
 * Call sites always pass `(local, remote)`. Identity fields follow **remote**
 * when it exists — `snapshotFromPlayer` stamps `updatedAt=Date.now()`, so a
 * fresh device's local defaults would otherwise always win "newest" and get
 * pushed back over the account name/mascot. `onboarded` is sticky-OR so a
 * half-finished local onboarding never un-onboards an account. Counters stay
 * max/union.
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
  return {
    name: remote.name,
    mascot: remote.mascot,
    subject: remote.subject,
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
    lessonProgress,
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
    arcadeScores: maxInventory(local.arcadeScores, remote.arcadeScores),
    booksRead: { ...local.booksRead, ...remote.booksRead }, // union: read anywhere = read
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
