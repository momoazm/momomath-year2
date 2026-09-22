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
  onboarded: boolean
  soundOn: boolean
  updatedAt: number
}

export type SyncStatus = 'signed-out' | 'syncing' | 'synced' | 'expired' | 'error'

interface SyncUi {
  status: SyncStatus
  detail: string
  setStatus: (s: SyncStatus, detail?: string) => void
}

export const useSyncStatus = create<SyncUi>()((set) => ({
  status: 'signed-out',
  detail: '',
  setStatus: (status, detail = '') => set({ status, detail }),
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

/** Client-side twin of the server merge: progress from either device survives. */
export function mergeCloudSave(a: CloudSave | null, b: CloudSave | null): CloudSave | null {
  if (!a) return b
  if (!b) return a
  const newest = (b.updatedAt || 0) >= (a.updatedAt || 0) ? b : a
  const lessonProgress: Record<string, LessonProgress> = { ...a.lessonProgress }
  for (const [k, v] of Object.entries(b.lessonProgress)) {
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
    name: newest.name,
    mascot: newest.mascot,
    subject: newest.subject,
    dailyGoal: newest.dailyGoal,
    onboarded: newest.onboarded,
    soundOn: newest.soundOn,
    lastActiveDay: newest.lastActiveDay,
    lastLoginDay: newest.lastLoginDay,
    loginRewardClaimedDay: newest.loginRewardClaimedDay,
    dailyLoginStreak: Math.max(a.dailyLoginStreak, b.dailyLoginStreak),
    weeklyXpWeek: newest.weeklyXpWeek,
    currentLeague:
      LEAGUES.indexOf(b.currentLeague) >= LEAGUES.indexOf(a.currentLeague) ? b.currentLeague : a.currentLeague,
    xpTotal: Math.max(a.xpTotal, b.xpTotal),
    gems: Math.max(a.gems, b.gems),
    dust: Math.max(a.dust, b.dust),
    streakCurrent: Math.max(a.streakCurrent, b.streakCurrent),
    streakLongest: Math.max(a.streakLongest, b.streakLongest),
    weeklyXp:
      newest.weeklyXpWeek && a.weeklyXpWeek === b.weeklyXpWeek
        ? Math.max(a.weeklyXp, b.weeklyXp)
        : (newest.weeklyXp ?? 0),
    leagueHistory: [...a.leagueHistory, ...b.leagueHistory]
      .filter((h, i, arr) => arr.findIndex((x) => x.weekKey === h.weekKey) === i)
      .sort((x, y) => (x.weekKey < y.weekKey ? -1 : 1))
      .slice(-10),
    pendingLeagueSettle:
      (b.pendingLeagueSettle && (!a.pendingLeagueSettle || a.pendingLeagueSettle.weekKey <= b.pendingLeagueSettle.weekKey)
        ? b.pendingLeagueSettle
        : a.pendingLeagueSettle) ?? null,
    lessonProgress,
    achievements: [...new Set([...a.achievements, ...b.achievements])],
    cardStars: mergeStars(a.cardStars, b.cardStars),
    cardPity: Math.min(a.cardPity, b.cardPity),
    shopInventory: maxInventory(a.shopInventory, b.shopInventory),
    streakSavers: Math.max(a.streakSavers, b.streakSavers),
    lastStreakReward: Math.max(a.lastStreakReward, b.lastStreakReward),
    pendingStreakMilestone: a.pendingStreakMilestone ?? b.pendingStreakMilestone,
    doubleXpLessons: Math.max(a.doubleXpLessons, b.doubleXpLessons),
    chestBoost: a.chestBoost || b.chestBoost,
    megaChest: a.megaChest || b.megaChest,
    luckyTickets: Math.max(a.luckyTickets, b.luckyTickets),
    claimedQuests: newest.claimedQuests?.questIds?.length ? newest.claimedQuests : a.claimedQuests,
    arcadeScores: maxInventory(a.arcadeScores, b.arcadeScores),
    updatedAt: Math.max(a.updatedAt || 0, b.updatedAt || 0, Date.now()),
  }
}

const PUSH_DEBOUNCE_MS = 2500

let started = false

/** Pull on sign-in, push (debounced) on every change. Call once from App. */
export function startCloudSync() {
  if (started || typeof window === 'undefined') return
  started = true
  const setStatus = useSyncStatus.getState().setStatus

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
    setStatus('syncing', 'Loading your progress…')
    try {
      const remote = await pullCloudsave(credential)
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
