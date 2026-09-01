import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MascotId, Subject } from '../content/types'
import {
  ACHIEVEMENTS,
  DAILY_QUESTS,
  advanceLeague,
  leagueOutcomeByXp,
  leagueWeekElapsed,
  streakMilestoneFor,
  todayISO,
  yesterdayISO,
  type LeagueName,
} from './gamification'
import { SHOP_ITEMS } from './shop'
import { setMuted, sfx } from './sfx'
import type { ChestResult } from './cards'

export interface LessonProgress {
  crown: number
  bestAccuracy: number
  completions: number
}

export interface LeagueHistoryEntry {
  weekKey: string
  league: LeagueName
  outcome: 'promoted' | 'demoted' | 'stayed'
  xp: number
}

/** Energy is UNLIMITED for everyone - kept as an explicit constant so the UI
 *  can proudly show ∞ and future features can still reference it. */
export const ENERGY_IS_UNLIMITED = true

interface PlayerState {
  name: string
  mascot: MascotId
  subject: Subject
  xpTotal: number
  gems: number
  streakCurrent: number
  streakLongest: number
  lastActiveDay: string | null
  dailyGoal: number
  todayXpDay: string
  todayXp: number
  lessonsTodayDay: string
  lessonsToday: number
  correctTodayDay: string
  correctToday: number
  weeklyXpWeek: string
  weeklyXp: number
  lessonProgress: Record<string, LessonProgress>
  claimedQuests: { day: string; questIds: string[] }
  achievements: string[]
  currentLeague: LeagueName
  leagueHistory: LeagueHistoryEntry[]
  /** most recent promotion/demotion — shown as a banner until dismissed */
  lastLeagueSettle: LeagueHistoryEntry | null
  soundOn: boolean
  onboarded: boolean
  shopInventory: Record<string, number>
  streakSavers: number
  /** streak value at which the last milestone chest was granted (7, 14, …) */
  lastStreakReward: number
  /** milestone (7/14/21…) whose HIGH-RARITY bonus chest is waiting to be shown */
  pendingStreakMilestone: number | null
  doubleXpLessons: number
  chestBoost: boolean
  megaChest: boolean
  /** collected card ids (unique) */
  cardCollection: string[]
  /** consecutive chests without a card - drives hidden card pity (see cards.ts) */
  cardPity: number
  /** shop Lucky Ticket stack; consumed on the next chest */
  luckyTickets: number
  /** timestamp (ms) of last successful cloud sync */
  lastSyncedAt: number | null

  // actions
  completeLesson: (args: {
    lessonId: string
    xp: number
    correct: number
    totalQuestions: number
    crownsGained: number
    accuracy: number
  }) => void
  setDailyGoal: (g: number) => void
  setName: (n: string) => void
  setMascot: (m: MascotId) => void
  setSubject: (s: Subject) => void
  setOnboarded: () => void
  addGems: (n: number) => void
  toggleSound: () => void
  claimQuest: (questId: string, reward: number) => void
  spendGems: (amount: number) => boolean
  buyItem: (itemId: string) => { success: boolean; message: string }
  useStreakSaver: () => boolean
  addDoubleXpLessons: (n: number) => void
  useDoubleXp: () => void
  setChestBoost: (v: boolean) => void
  useChestBoost: () => void
  setMegaChest: (v: boolean) => void
  useMegaChest: () => void
  grantChest: (chest: ChestResult) => void
  /** Consume a pending streak milestone; returns the milestone (7/14/21…) or null. */
  consumeStreakChest: () => number | null
  addLuckyTickets: (n: number) => void
  /** consume one Lucky Ticket if available; returns true if it was active */
  consumeLuckyTicket: () => boolean
  applySyncedSnapshot: (snap: Partial<PlayerState>) => void
  setLastSyncedAt: (t: number | null) => void
  /** settle last week's league (promote/demote) if the 7-day week has elapsed */
  syncLeagueWeek: () => void
  /** promote the league leader into the next league when the week ends */
  promoteLeader: () => void
  dismissLeagueSettle: () => void
}

function rollDay(s: PlayerState) {
  const today = todayISO()
  if (s.todayXpDay !== today) {
    s.todayXpDay = today
    s.todayXp = 0
  }
  if (s.lessonsTodayDay !== today) {
    s.lessonsTodayDay = today
    s.lessonsToday = 0
  }
  if (s.correctTodayDay !== today) {
    s.correctTodayDay = today
    s.correctToday = 0
  }
}

/** Fields of PlayerState that weekly league settlement reads/writes. */
export interface LeagueWeekFields {
  weeklyXpWeek: string
  weeklyXp: number
  currentLeague: LeagueName
  leagueHistory: LeagueHistoryEntry[]
  lastLeagueSettle: LeagueHistoryEntry | null
}

/** Valid "YYYY-MM-DD" league-week anchor? Rejects impossible dates (e.g. 2026-02-30). */
export function isValidAnchor(a: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(a)) return false
  const d = new Date(`${a}T00:00:00`)
  if (Number.isNaN(d.getTime())) return false
  // Engines roll impossible dates over (2026-02-30 -> Mar 2), so round-trip.
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
  return iso === a
}

/**
 * Weekly league settlement (standard XP rules).
 *
 * A league week runs from 12:00 AM of its anchor day (`weeklyXpWeek`) for
 * exactly 7 days. When that window elapses: settle last week by XP earned —
 * promote / demote / stay — record history, reset the XP counter, and anchor
 * the fresh week at TODAY's 12:00 AM (so the timer reads ~7 days again).
 * Returns TRUE whenever the league-week state changed (a settlement OR a
 * fresh-start repair of a missing/corrupt anchor), so store actions persist
 * the mutated copy. Pure: mutates only league fields of `s`.
 */
export function settleLeagueWeek<T extends LeagueWeekFields>(
  s: T,
  now: Date = new Date(),
): boolean {
  const anchor = s.weeklyXpWeek
  if (!isValidAnchor(anchor)) {
    // Legacy/corrupt state without a playable week: start fresh at 12 AM today.
    s.weeklyXpWeek = todayISO(now)
    s.weeklyXp = 0
    return true
  }
  if (!leagueWeekElapsed(anchor, now)) return false
  const prevWeek = anchor
  const prevLeague = s.currentLeague
  const history = Array.isArray(s.leagueHistory) ? s.leagueHistory : []
  // Legacy persisted states can carry undefined/NaN XP — never let that
  // poison the outcome (treat as 0, which means demote unless Bronze).
  const earned = Number.isFinite(s.weeklyXp) ? s.weeklyXp : 0
  // Only the league leader may be promoted (handled separately by
  // promoteLeaderWeek). Everyone else settles by XP but can never move UP —
  // a non-leader who hits the goal stays instead of promoting.
  const raw = leagueOutcomeByXp(prevLeague, earned)
  const outcome = raw === 'promoted' ? 'stayed' : raw
  s.currentLeague = advanceLeague(prevLeague, outcome)
  s.leagueHistory = [
    ...history.slice(-9),
    { weekKey: prevWeek, league: prevLeague, outcome, xp: earned },
  ]
  s.weeklyXpWeek = todayISO(now) // new week starts 12:00 AM today
  s.weeklyXp = 0
  s.lastLeagueSettle =
    outcome === 'stayed' ? null : s.leagueHistory[s.leagueHistory.length - 1]
  return true
}

/**
 * The league leader's promotion: same 7-day anchor, but the #1 player always
 * moves UP into the next league when the week ends (regardless of XP), with
 * XP and the weekly timer restarted at today's 12:00 AM. Returns true when
 * the league-week state changed (promotion or fresh-start repair).
 */
export function promoteLeaderWeek<T extends LeagueWeekFields>(
  s: T,
  now: Date = new Date(),
): boolean {
  const anchor = s.weeklyXpWeek
  if (!isValidAnchor(anchor)) {
    s.weeklyXpWeek = todayISO(now)
    s.weeklyXp = 0
    return true
  }
  if (!leagueWeekElapsed(anchor, now)) return false
  const prevWeek = anchor
  const prevLeague = s.currentLeague
  const history = Array.isArray(s.leagueHistory) ? s.leagueHistory : []
  const earned = Number.isFinite(s.weeklyXp) ? s.weeklyXp : 0
  s.currentLeague = advanceLeague(prevLeague, 'promoted')
  s.leagueHistory = [
    ...history.slice(-9),
    { weekKey: prevWeek, league: prevLeague, outcome: 'promoted', xp: earned },
  ]
  s.weeklyXpWeek = todayISO(now) // new week starts 12:00 AM today
  s.weeklyXp = 0
  s.lastLeagueSettle = s.leagueHistory[s.leagueHistory.length - 1]
  return true
}

/** Weekly league rollover used by the live store (delegates to settleLeagueWeek). */
function rollWeek(s: PlayerState) {
  settleLeagueWeek(s)
}

export function updateStreak(
  s: Pick<PlayerState, 'streakCurrent' | 'streakLongest' | 'lastActiveDay' | 'streakSavers'>,
  today: string = todayISO(),
  yesterday: string = yesterdayISO(),
) {
  if (s.lastActiveDay === today) return
  if (s.lastActiveDay === yesterday) {
    s.streakCurrent += 1
  } else if (s.streakSavers > 0) {
    // A day was missed, but a Streak Saver absorbs the gap: the streak
    // CONTINUES instead of resetting to 1 (saver is consumed automatically).
    s.streakSavers -= 1
    s.streakCurrent += 1
  } else {
    s.streakCurrent = 1
  }
  s.streakLongest = Math.max(s.streakLongest, s.streakCurrent)
  s.lastActiveDay = today
}

function checkAchievements(s: PlayerState) {
  const lessonsCompleted = Object.values(s.lessonProgress).reduce(
    (a, p) => a + p.completions,
    0,
  )
  const crowns = Object.values(s.lessonProgress).reduce((a, p) => a + p.crown, 0)
  const snap = {
    xpTotal: s.xpTotal,
    streakCurrent: s.streakCurrent,
    lessonsCompleted,
    crowns,
  }
  let gained = false
  for (const a of ACHIEVEMENTS) {
    if (!s.achievements.includes(a.id) && a.test(snap)) {
      s.achievements.push(a.id)
      s.gems += 20
      gained = true
    }
  }
  if (gained) sfx.leagueUp()
}

const firstDay = todayISO()

export const usePlayer = create<PlayerState>()(
  persist(
    (set) => ({
      name: 'Champion',
      mascot: 'sonic' as MascotId,
      subject:
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('subject') === 'english'
          ? ('english' as Subject)
          : ('math' as Subject),
      xpTotal: 0,
      gems: 50,
      streakCurrent: 0,
      streakLongest: 0,
      lastActiveDay: null,
      dailyGoal: 30,
      todayXpDay: firstDay,
      todayXp: 0,
      lessonsTodayDay: firstDay,
      lessonsToday: 0,
      correctTodayDay: firstDay,
      correctToday: 0,
      weeklyXpWeek: todayISO(), // league week anchored at 12:00 AM today
      weeklyXp: 0,
      lessonProgress: {},
      claimedQuests: { day: firstDay, questIds: [] },
      achievements: [],
      currentLeague: 'Bronze',
      leagueHistory: [],
      lastLeagueSettle: null,
      soundOn: true,
      onboarded: false,
      shopInventory: {},
      streakSavers: 0,
      lastStreakReward: 0,
      pendingStreakMilestone: null,
      doubleXpLessons: 0,
      chestBoost: false,
      megaChest: false,
      cardCollection: [],
      cardPity: 0,
      luckyTickets: 0,
      lastSyncedAt: null,

      completeLesson: ({ lessonId, xp, correct, totalQuestions, crownsGained, accuracy }) =>
        set((state) => {
          const s: PlayerState = {
            ...state,
            lessonProgress: { ...state.lessonProgress },
          }
          rollDay(s)
          rollWeek(s)

          const prev = s.lessonProgress[lessonId] ?? {
            crown: 0,
            bestAccuracy: 0,
            completions: 0,
          }
          s.lessonProgress[lessonId] = {
            crown: Math.min(prev.crown + crownsGained, 3),
            bestAccuracy: Math.max(prev.bestAccuracy, accuracy),
            completions: prev.completions + 1,
          }

          s.xpTotal += xp
          s.gems += 2 + Math.round(xp / 10)
          s.todayXp += xp
          s.lessonsToday += 1
          s.correctToday += correct
          s.weeklyXp += xp

          const wasStreakActive = state.lastActiveDay === todayISO()
          updateStreak(s)

          // Streak milestone bonus: every 7 consecutive active days grants a
          // HIGH-RARITY bonus chest (guaranteed Legendary/Exclusive), awarded
          // once per milestone and shown on the next chest reveal.
          const milestone = streakMilestoneFor(s.streakCurrent, s.lastStreakReward)
          if (milestone !== null) {
            s.lastStreakReward = milestone
            s.pendingStreakMilestone = milestone
          }

          checkAchievements(s)

          if (!wasStreakActive && s.streakCurrent > 1) sfx.streak()

          return s
        }),

      setDailyGoal: (g) => set({ dailyGoal: g }),
      setName: (n) => set({ name: n.trim() || 'Champion' }),
      setMascot: (m) => set({ mascot: m }),
      setSubject: (s) => {
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href)
          if (s === 'english') url.searchParams.set('subject', 'english')
          else url.searchParams.delete('subject')
          window.history.replaceState(null, '', url)
        }
        set({ subject: s })
      },
      setOnboarded: () => set({ onboarded: true }),
      addGems: (n) => set((state) => ({ gems: state.gems + n })),
      toggleSound: () =>
        set((state) => {
          const on = !state.soundOn
          setMuted(!on)
          return { soundOn: on }
        }),
      claimQuest: (questId, reward) =>
        set((state) => {
          const today = todayISO()
          const base =
            state.claimedQuests.day === today ? state.claimedQuests.questIds : []
          if (base.includes(questId)) return state
          return {
            gems: state.gems + reward,
            claimedQuests: { day: today, questIds: [...base, questId] },
          }
        }),
      spendGems: (amount) => {
        let success = false
        set((state) => {
          if (state.gems < amount) return state
          success = true
          return { gems: state.gems - amount }
        })
        return success
      },
      buyItem: (itemId) => {
        let result: { success: boolean; message: string } = { success: false, message: '' }
        set((state) => {
          const item = SHOP_ITEMS.find((i) => i.id === itemId)
          if (!item) {
            result = { success: false, message: 'Item not found' }
            return state
          }
          if (state.gems < item.price) {
            result = { success: false, message: 'Not enough gems!' }
            return state
          }
          const current = state.shopInventory[itemId] || 0
          if (item.maxStack && current >= item.maxStack) {
            result = { success: false, message: `Max ${item.maxStack} per item!` }
            return state
          }
          result = { success: true, message: 'Purchase successful!' }
          // Activate the item's effect on the engine state in the SAME set
          // callback so the inventory + the effect are committed atomically.
          const next: Partial<PlayerState> = {
            gems: state.gems - item.price,
            shopInventory: { ...state.shopInventory, [itemId]: current + 1 },
          }
          if (itemId === 'streak-saver') {
            next.streakSavers = state.streakSavers + 1
          } else if (itemId === 'chest-boost') {
            next.chestBoost = true
          } else if (itemId === 'mega-chest') {
            next.megaChest = true
          } else if (itemId === 'double-xp') {
            next.doubleXpLessons = state.doubleXpLessons + 3
          } else if (itemId === 'lucky-ticket') {
            next.luckyTickets = state.luckyTickets + 1
          }
          return next
        })
        return result
      },
      useStreakSaver: () => {
        let success = false
        set((state) => {
          if (state.streakSavers <= 0) {
            success = false
            return state
          }
          success = true
          return { streakSavers: state.streakSavers - 1 }
        })
        return success
      },
      addDoubleXpLessons: (n) =>
        set((state) => ({ doubleXpLessons: state.doubleXpLessons + n })),
      useDoubleXp: () =>
        set((state) => {
          if (state.doubleXpLessons <= 0) return state
          return { doubleXpLessons: state.doubleXpLessons - 1 }
        }),
      setChestBoost: (v) => set({ chestBoost: v }),
      useChestBoost: () => set({ chestBoost: false }),
      setMegaChest: (v) => set({ megaChest: v }),
      useMegaChest: () => set({ megaChest: false }),
      grantChest: (chest) =>
        set((state) => {
          let cardCollection = state.cardCollection
          let cardPity = state.cardPity
          if (chest.card) {
            if (!cardCollection.includes(chest.card.id)) {
              cardCollection = [...cardCollection, chest.card.id]
            }
            cardPity = 0
          } else {
            cardPity = state.cardPity + 1
          }
          return { gems: state.gems + chest.gems, cardCollection, cardPity }
        }),
      addLuckyTickets: (n) => set((state) => ({ luckyTickets: state.luckyTickets + n })),
      consumeStreakChest: () => {
        let milestone: number | null = null
        set((state) => {
          if (state.pendingStreakMilestone == null) return state
          milestone = state.pendingStreakMilestone
          return { pendingStreakMilestone: null }
        })
        return milestone
      },
      consumeLuckyTicket: () => {
        let active = false
        set((state) => {
          if (state.luckyTickets <= 0) return state
          active = true
          return { luckyTickets: state.luckyTickets - 1 }
        })
        return active
      },
      applySyncedSnapshot: (snap) =>
        set((state) => {
          // Conservative field-by-field merge (see sync.ts mergeStates for the
          // authoritative union/max rules). Only touches fields present in snap.
          const next: Partial<PlayerState> = {}
          if (typeof snap.name === 'string') next.name = snap.name
          if (snap.mascot) next.mascot = snap.mascot
          if (typeof snap.xpTotal === 'number') next.xpTotal = Math.max(state.xpTotal, snap.xpTotal)
          if (typeof snap.gems === 'number') next.gems = Math.max(state.gems, snap.gems)
          if (typeof snap.streakLongest === 'number')
            next.streakLongest = Math.max(state.streakLongest, snap.streakLongest)
          if (typeof snap.streakCurrent === 'number')
            next.streakCurrent = Math.max(state.streakCurrent, snap.streakCurrent)
          if (snap.achievements?.length)
            next.achievements = [...new Set([...state.achievements, ...snap.achievements])]
          if (snap.cardCollection?.length)
            next.cardCollection = [...new Set([...state.cardCollection, ...snap.cardCollection])]
          if (snap.lessonProgress)
            next.lessonProgress = { ...state.lessonProgress, ...snap.lessonProgress }
          if (snap.shopInventory) next.shopInventory = { ...state.shopInventory, ...snap.shopInventory }
          return next
        }),
      setLastSyncedAt: (t) => set({ lastSyncedAt: t }),
      syncLeagueWeek: () =>
        set((state) => {
          const s: PlayerState = { ...state }
          // no settlement → return the same state (no re-render/persist write)
          return settleLeagueWeek(s) ? s : state
        }),
      promoteLeader: () =>
        set((state) => {
          const s: PlayerState = { ...state }
          // no promotion → return the same state (no re-render/persist write)
          return promoteLeaderWeek(s) ? s : state
        }),
      dismissLeagueSettle: () => set({ lastLeagueSettle: null }),
    }),
    {
      name: 'momomath-year2-player-v2',
      version: 5,
      migrate: (persisted, version) => {
        const p = { ...(persisted as PlayerState) }
        if (version < 4) {
          // Backfill any fields added after v3 (streak milestone rewards).
          p.lastStreakReward = typeof p.lastStreakReward === 'number' ? p.lastStreakReward : 0
          p.pendingStreakMilestone = p.pendingStreakMilestone === undefined ? null : p.pendingStreakMilestone
        }
        if (version < 5) {
          // League settlement: backfill the banner field and normalise the
          // week key / XP so a stale or missing week always triggers a proper
          // settlement (promote/demote) on next launch instead of silently
          // carrying last week's XP into the new week.
          p.lastLeagueSettle = p.lastLeagueSettle ?? null
          if (typeof p.weeklyXpWeek !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(p.weeklyXpWeek)) {
            p.weeklyXpWeek = ''
          }
          if (!Number.isFinite(p.weeklyXp)) p.weeklyXp = 0
        }
        return p
      },
    },
  ),
)

export function questProgressSnapshot(s: PlayerState) {
  return {
    xpToday: s.todayXp,
    lessonsToday: s.lessonsToday,
    correctToday: s.correctToday,
  }
}

export function questsDone(s: PlayerState) {
  const snap = questProgressSnapshot(s)
  return DAILY_QUESTS.filter((q) => q.progress(snap) >= q.goal).map((q) => q.id)
}

export function isQuestClaimed(s: PlayerState, questId: string) {
  if (s.claimedQuests.day !== todayISO()) return false
  return s.claimedQuests.questIds.includes(questId)
}
