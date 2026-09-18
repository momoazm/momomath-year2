import { create } from 'zustand'
import { getSession, useAuth } from './auth'
import { usePlayer } from './store'
import { LEAGUES, type LeagueName } from './gamification'
import type { MascotId, Subject } from '../content/types'
import { capSnapshots } from './adaptive/attempts'
import type {
  AdaptiveStore,
  AdaptiveTelemetry,
  AttemptLogEntry,
  SkillState,
} from './adaptive/types'

// Cross-device sync for the same Google account — the momolearn.space model.
//
// The browser signs in once (see auth.ts signInWithGoogle) and keeps a
// first-party session (~90 days). Sync calls prove who it is with that
// session; the server verifies it and keys the save by the Google account
// id (`sub`). Sign in with the same Google account on any device and the
// pull below loads the same progress. Local state stays the source of truth
// while offline — sync only ever merges (max/union/newest-wins), never deletes.

export const CLOUDSAVE_API = 'https://momolearn-ai.vercel.app/api/year2/cloudsave'

export interface CloudLesson {
  crown: number
  bestAccuracy: number
  completions: number
}

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
  leagueHistory: { weekKey: string; league: LeagueName; outcome: 'promoted' | 'demoted' | 'stayed'; xp: number }[]
  lessonProgress: Record<string, CloudLesson>
  achievements: string[]
  cardStars: Record<string, number>
  shopInventory: Record<string, number>
  streakSavers: number
  doubleXpLessons: number
  luckyTickets: number
  chestBoost: boolean
  megaChest: boolean
  /** Learning-tracker slice (BKT skills + attempt log). Null on old saves. */
  adaptive: AdaptiveStore | null
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

async function authed(method: 'GET' | 'PUT', session: string, save?: CloudSave): Promise<CloudSave | null> {
  const res = await fetch(CLOUDSAVE_API, {
    method,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session}`,
    },
    body: method === 'PUT' ? JSON.stringify({ save }) : undefined,
  })
  if (res.status === 401) throw new CloudAuthError()
  if (!res.ok) throw new Error(`sync-http-${res.status}`)
  const data = (await res.json()) as { ok?: boolean; save?: CloudSave | null }
  return data?.save ?? null
}

export const pullCloudsave = (session: string) => authed('GET', session)

export const pushCloudsave = (session: string, save: CloudSave) =>
  authed('PUT', session, save)

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
  leagueHistory: CloudSave['leagueHistory']
  lessonProgress: Record<string, CloudLesson>
  achievements: string[]
  cardStars: Record<string, number>
  shopInventory: Record<string, number>
  streakSavers: number
  doubleXpLessons: number
  luckyTickets: number
  chestBoost: boolean
  megaChest: boolean
  adaptive: AdaptiveStore
}): CloudSave {
  // Trim the per-skill curves for the wire (local keeps 200 points).
  // Old saves carry adaptive: null — pass that through, don't crash.
  const masteryHistory: AdaptiveStore['masteryHistory'] = {}
  if (p.adaptive) {
    for (const [code, series] of Object.entries(p.adaptive.masteryHistory)) {
      masteryHistory[code] = series.slice(-50)
    }
  }
  return {
    name: p.name,
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
    lessonProgress: p.lessonProgress,
    achievements: p.achievements,
    cardStars: p.cardStars,
    shopInventory: p.shopInventory,
    streakSavers: p.streakSavers,
    doubleXpLessons: p.doubleXpLessons,
    luckyTickets: p.luckyTickets,
    chestBoost: p.chestBoost,
    megaChest: p.megaChest,
    adaptive: p.adaptive ? { ...p.adaptive, masteryHistory } : null,
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

/** Learning-tracker merge: more evidence wins per skill, logs interleave by
 *  time. Never deletes — a question answered on ANY device survives. */
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

/** Client-side twin of the server merge: progress from either device survives. */
export function mergeCloudSave(a: CloudSave | null, b: CloudSave | null): CloudSave | null {  if (!a) return b
  if (!b) return a
  const newest = (b.updatedAt || 0) >= (a.updatedAt || 0) ? b : a
  const lessonProgress: Record<string, CloudLesson> = { ...a.lessonProgress }
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
  const shopInventory: Record<string, number> = { ...a.shopInventory }
  for (const [k, v] of Object.entries(b.shopInventory)) shopInventory[k] = Math.max(shopInventory[k] ?? 0, v)
  return {
    name: newest.name,
    mascot: newest.mascot,
    subject: newest.subject,
    dailyGoal: newest.dailyGoal,
    lastActiveDay: newest.lastActiveDay,
    weeklyXpWeek: newest.weeklyXpWeek,
    currentLeague:
      LEAGUES.indexOf(b.currentLeague) >= LEAGUES.indexOf(a.currentLeague) ? b.currentLeague : a.currentLeague,
    xpTotal: Math.max(a.xpTotal, b.xpTotal),
    gems: Math.max(a.gems, b.gems),
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
    lessonProgress,
    achievements: [...new Set([...a.achievements, ...b.achievements])],
    cardStars: mergeStars(a.cardStars, b.cardStars),
    shopInventory,
    streakSavers: Math.max(a.streakSavers, b.streakSavers),
    doubleXpLessons: Math.max(a.doubleXpLessons, b.doubleXpLessons),
    luckyTickets: Math.max(a.luckyTickets, b.luckyTickets),
    chestBoost: newest.chestBoost === true,
    megaChest: newest.megaChest === true,
    adaptive: mergeAdaptive(a.adaptive, b.adaptive),
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

  async function initialPull(userSub: string, session: string) {
    if (initialPullDoneFor === `${userSub}:${session.slice(-12)}`) return
    initialPullDoneFor = `${userSub}:${session.slice(-12)}`
    setStatus('syncing', 'Loading your progress…')
    try {
      const remote = await pullCloudsave(session)
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
      lastPushedJson = JSON.stringify(converged)
      await pushCloudsave(session, converged)
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
      const { user } = useAuth.getState()
      const session = getSession()
      if (!user || !session || applyingRemote) return
      if (initialPullDoneFor !== `${user.sub}:${session.slice(-12)}`) {
        await initialPull(user.sub, session)
        return
      }
      const snap = snapshotFromPlayer(usePlayer.getState())
      const json = JSON.stringify({ ...snap, updatedAt: 0 })
      if (json === lastPushedJson) return
      setStatus('syncing', 'Syncing…')
      try {
        await pushCloudsave(session, snap)
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
    const session = getSession()
    if (s.user && session) {
      void initialPull(s.user.sub, session)
    } else if (s.user && !session) {
      // Signed in but the session is gone or past expiry — one re-tap heals.
      initialPullDoneFor = null
      lastPushedJson = ''
      if (pushTimer) clearTimeout(pushTimer)
      setStatus('expired', 'Tap sign-in again to keep syncing')
    } else {
      initialPullDoneFor = null
      lastPushedJson = ''
      if (pushTimer) clearTimeout(pushTimer)
      setStatus('signed-out', '')
    }
  })

  usePlayer.subscribe(() => {
    const { user } = useAuth.getState()
    if (!user || !getSession() || applyingRemote) return
    schedulePush()
  })

  // Signed-in persisted session (returning device): pull immediately.
  {
    const { user } = useAuth.getState()
    const session = getSession()
    if (user && session) void initialPull(user.sub, session)
    else if (user && !session) setStatus('expired', 'Tap sign-in again to keep syncing')
  }
}

/** Manual "Sync now" for the Profile screen. */
export async function syncNow(): Promise<void> {
  const { user } = useAuth.getState()
  const session = getSession()
  const setStatus = useSyncStatus.getState().setStatus
  if (!user || !session) {
    setStatus(user ? 'expired' : 'signed-out', user ? 'Tap sign-in again to keep syncing' : '')
    return
  }
  setStatus('syncing', 'Syncing…')
  try {
    const remote = await pullCloudsave(session)
    const local = snapshotFromPlayer(usePlayer.getState())
    const merged = mergeCloudSave(local, remote)
    if (merged && remote) usePlayer.getState().applySyncedSnapshot(merged)
    const converged = snapshotFromPlayer(usePlayer.getState())
    await pushCloudsave(session, converged)
    usePlayer.getState().setLastSyncedAt(Date.now())
    setStatus('synced', 'Progress syncs across your devices')
  } catch (e) {
    if (e instanceof CloudAuthError) setStatus('expired', 'Tap sign-in again to keep syncing')
    else setStatus('error', 'Offline — progress is safe on this device')
    throw e
  }
}
