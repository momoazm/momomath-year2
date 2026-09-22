import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MascotId, Subject } from '../content/types'
import {
  ACHIEVEMENTS,
  advanceLeague,
  leagueOutcomeByRank,
  leagueOutcomeByXp,
  leagueWeekElapsed,
  LOGIN_REWARDS,
  questsForDay,
  streakMilestoneFor,
  todayISO,
  yesterdayISO,
  type LeagueName,
} from './gamification'
import { ALL_SHOP_ITEMS } from './shop'
import { setMuted, sfx } from './sfx'
import { STAR_THRESHOLDS, DUST_PER_CARD } from './cards'
import type { ChestResult } from './cards'
import { ARCADE_GAMES } from './arcade'

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
  bossesTodayDay: string
  bossesToday: number
  arcadeCorrectTodayDay: string
  arcadeCorrectToday: number
  weeklyXpWeek: string
  weeklyXp: number
  lessonProgress: Record<string, LessonProgress>
  claimedQuests: { day: string; questIds: string[] }
  achievements: string[]
  currentLeague: LeagueName
  leagueHistory: LeagueHistoryEntry[]
  /** most recent promotion/demotion — shown as a banner until dismissed */
  lastLeagueSettle: LeagueHistoryEntry | null
  /** finished week awaiting rank-based settlement (written by rollLeagueWeek
   *  at lesson time, consumed by syncLeagueWeekByRank on the Leagues tab).
   *  Lets the TOP-3/promote bands run on real ranks instead of being
   *  pre-empted by the lesson-time XP settle. */
  pendingLeagueSettle: { weekKey: string; xp: number } | null
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
  /** per-character star level (0-5); 0 = not yet earned, 1-5 = star progress. A card is owned if cardStars[id] > 0. */
  cardStars: Record<string, number>
  /** DEPRECATED - use cardStars instead. */
  cardCounts: Record<string, number>
  /** consecutive chests without a still-LOCKED character drop - drives the
   *  locked-pity guarantee (see cards.ts LOCKED_PITY) */
  cardPity: number
  /** shop Lucky Ticket stack; consumed on the next chest */
  luckyTickets: number
  /** dust earned from maxed 5★ duplicates (spendable in the shop) */
  dust: number
  /** 7-day login calendar streak (independent of lesson streak) */
  dailyLoginStreak: number
  /** last day a lesson-ish activity or calendar claim touched login streak */
  lastLoginDay: string | null
  /** last day the login calendar reward was claimed */
  loginRewardClaimedDay: string | null
  /** per-arcade-game personal bests (see ARCADE_GAMES ids) */
  arcadeScores: Record<string, number>
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
  /** Count a correct answer inside an Arcade game (feeds the arcade quest). */
  addArcadeCorrect: (n?: number) => void
  /** Award XP earned from an arcade round (xpTotal + today + league week). */
  addArcadeXp: (n: number) => void
  /** Count a completed boss lesson (feeds the daily boss quest). */
  addBossClear: () => void
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
  /** Spend `amount` dust; false if balance is short. */
  spendDust: (amount: number) => boolean
  /** Record an arcade score; returns true when a new personal best. */
  submitArcadeScore: (gameId: string, score: number) => boolean
  /** Claim today's login-calendar reward; returns the 1-7 day index or null. */
  claimDailyLogin: () => number | null
  /** settle last week's league (promote/demote) if the 7-day week has elapsed */
  syncLeagueWeek: () => void
  /** rank-based settle: top 3 promote, middle stay, bottom 3 demote (clamps
   *  at Bronze / Diamond). `totalRanks` is the primary board size (defaults
   *  to 10 if you don't know). */
  syncLeagueWeekByRank: (myRank: number, totalRanks?: number) => void
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
  if (s.bossesTodayDay !== today) {
    s.bossesTodayDay = today
    s.bossesToday = 0
  }
  if (s.arcadeCorrectTodayDay !== today) {
    s.arcadeCorrectTodayDay = today
    s.arcadeCorrectToday = 0
  }
}

/** Fields of PlayerState that weekly league settlement reads/writes. */
export interface LeagueWeekFields {
  weeklyXpWeek: string
  weeklyXp: number
  currentLeague: LeagueName
  leagueHistory: LeagueHistoryEntry[]
  lastLeagueSettle: LeagueHistoryEntry | null
  pendingLeagueSettle?: { weekKey: string; xp: number } | null
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
 * NOTE: retained + unit-tested, but the live store no longer settles through
 * this path — lesson time snapshots via rollLeagueWeek and the Leagues tab
 * settles by rank (settleLeagueWeekByRank), so the top-3 promotion bands
 * always run on real ranks.
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
 * Rank-based settlement for the shared board. The board is partitioned into
 * bands (see `leagueOutcomeByRank`):
 *   - top 3   -> promote (clamped to Diamond)
 *   - middle  -> stay
 *   - bottom  -> demote (clamped to Bronze)
 *
 * This is the ONLY production settlement path (s169+): lesson time only
 * snapshots the finished week into `pendingLeagueSettle` (see
 * rollLeagueWeek), and the Leagues tab settles it once the rank is known —
 * so an XP settle can never pre-empt the top-3 promotion again.
 *
 * The board is padded to 10 via `botsForPlayerCount` when fewer than 10 real
 * players are present. If more than 10 real players join, the "extras" appear
 * in a secondary leaderboard for their current league; this function only
 * settles the player's own rank in the **primary** board.
 *
 * Returns true on any state change (settlement or fresh-start repair).
 */
export function settleLeagueWeekByRank<T extends LeagueWeekFields>(
  s: T,
  myRank: number,
  totalRanks: number,
  now: Date = new Date(),
): boolean {
  const anchor = s.weeklyXpWeek
  if (!isValidAnchor(anchor)) {
    s.weeklyXpWeek = todayISO(now)
    s.weeklyXp = 0
    return true
  }
  const pending = s.pendingLeagueSettle ?? null
  if (!pending && !leagueWeekElapsed(anchor, now)) return false
  const prevLeague = s.currentLeague
  const history = Array.isArray(s.leagueHistory) ? s.leagueHistory : []
  // Prefer the snapshotted week (written at lesson time, before the counter
  // reset); fall back to the live counter when the tab is opened after the
  // week elapsed with no lesson played since.
  const srcWeek = pending?.weekKey ?? anchor
  const rawXp = pending?.xp ?? s.weeklyXp
  const earned = Number.isFinite(rawXp) ? (rawXp as number) : 0
  const outcome = leagueOutcomeByRank(myRank, totalRanks)
  s.currentLeague = advanceLeague(prevLeague, outcome)
  s.leagueHistory = [
    ...history.slice(-9),
    { weekKey: srcWeek, league: prevLeague, outcome, xp: earned },
  ]
  s.weeklyXpWeek = todayISO(now) // new week starts 12:00 AM today
  s.weeklyXp = 0
  s.pendingLeagueSettle = null
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

/** Weekly league rollover used by the live store.
 *
 * Lesson time NEVER settles promotion/demotion directly: when the 7-day week
 * has elapsed it snapshots the finished week into `pendingLeagueSettle`,
 * resets the counter + timer, and leaves the outcome to the rank-based
 * settle on the Leagues tab (so top-3 promotion can't be pre-empted).
 * Exported pure for tests; the store calls it via rollWeek. */
export function rollLeagueWeek<T extends LeagueWeekFields>(
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
  const rawXp = s.weeklyXp
  const earned = Number.isFinite(rawXp) ? (rawXp as number) : 0
  if (!s.pendingLeagueSettle) {
    s.pendingLeagueSettle = { weekKey: anchor, xp: earned }
  } else if (earned > 0) {
    // Another week elapsed before the Leagues tab settled the first one:
    // fold the newer XP into the pending snapshot so no earned XP is lost
    // (the outcome stays rank-based; XP is only recorded for display).
    s.pendingLeagueSettle = { ...s.pendingLeagueSettle, xp: s.pendingLeagueSettle.xp + earned }
  }
  s.weeklyXpWeek = todayISO(now) // new week starts 12:00 AM today
  s.weeklyXp = 0
  return true
}

/** Store-level wrapper (mutates only league fields of `s`). */
function rollWeek(s: PlayerState) {
  rollLeagueWeek(s)
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

  /** Achievements: fields are MAXED (highest value ever seen) so an unlock
   *  can never be lost by a later regression (spending gems, etc.). */
  function checkAchievements(s: PlayerState) {
    const lessonsCompleted = Object.values(s.lessonProgress).reduce(
      (a, p) => a + p.completions,
      0,
    )
    const crowns = Object.values(s.lessonProgress).reduce((a, p) => a + p.crown, 0)
    const units = new Set<string>()
    for (const id of Object.keys(s.lessonProgress)) {
      const m = id.match(/^([a-z]+\d+)/)
      if (m) units.add(m[1])
    }
    let bestAccuracy = 0
    for (const p of Object.values(s.lessonProgress)) {
      bestAccuracy = Math.max(bestAccuracy, p.bestAccuracy)
    }
    const cards = Object.values(s.cardStars)
    const cardsOwned = cards.filter((n) => n > 0).length
    const maxCopies = STAR_THRESHOLDS[STAR_THRESHOLDS.length - 1]
    const cardsFiveStar = cards.filter((n) => n >= maxCopies).length
    const subjects = new Set<string>()
    for (const id of Object.keys(s.lessonProgress)) {
      if (id.startsWith('e')) subjects.add('english')
      else if (id.startsWith('s') && !id.startsWith('sc')) subjects.add('science')
      else if (id.startsWith('u')) subjects.add('math')
    }
    const snap = {
      xpTotal: s.xpTotal,
      streakCurrent: s.streakCurrent,
      streakLongest: Math.max(s.streakLongest, s.streakCurrent),
      lessonsCompleted,
      crowns,
      crownsAll: 0,
      crownsTotal: Object.keys(s.lessonProgress).length,
      bestAccuracy,
      unitsTouched: units.size,
      cardsOwned,
      cardsFiveStar,
      cardDust: s.dust,
      gems: s.gems,
      perfectToday: false,
      league: s.currentLeague,
      leagueWeeks: s.leagueHistory.length,
      arcadeBests: Object.values(s.arcadeScores).filter((v) => v > 0).length,
      arcadeTop: Math.max(0, ...Object.values(s.arcadeScores)),
      subjectsPlayed: subjects.size,
      dailyLoginStreak: s.dailyLoginStreak,
    }
    let gained = false
    for (const a of ACHIEVEMENTS) {
      if (s.achievements.includes(a.id)) continue
      if (a.test(snap)) {
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
        ['english', 'science'].includes(
          new URLSearchParams(window.location.search).get('subject') ?? '',
        )
          ? (new URLSearchParams(window.location.search).get('subject') as Subject)
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
      bossesTodayDay: firstDay,
      bossesToday: 0,
      arcadeCorrectTodayDay: firstDay,
      arcadeCorrectToday: 0,
      weeklyXpWeek: todayISO(), // league week anchored at 12:00 AM today
      weeklyXp: 0,
      lessonProgress: {},
      claimedQuests: { day: firstDay, questIds: [] },
      achievements: [],
      currentLeague: 'Bronze',
      leagueHistory: [],
      lastLeagueSettle: null,
      pendingLeagueSettle: null,
      soundOn: true,
      onboarded: false,
      shopInventory: {},
      streakSavers: 0,
      lastStreakReward: 0,
      pendingStreakMilestone: null,
      doubleXpLessons: 0,
      chestBoost: false,
      megaChest: false,
      cardStars: {},
      cardCounts: {},
      cardPity: 0,
      luckyTickets: 0,
      dust: 0,
      dailyLoginStreak: 0,
      lastLoginDay: null,
      loginRewardClaimedDay: null,
      arcadeScores: {},
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
          if (s === 'english' || s === 'science') url.searchParams.set('subject', s)
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
      addArcadeCorrect: (n = 1) =>
        set((state) => {
          const s = { ...state }
          rollDay(s)
          s.arcadeCorrectToday += n
          return s
        }),
      addArcadeXp: (n) =>
        set((state) => {
          const amt = Math.max(0, Math.round(Number(n) || 0))
          if (amt === 0) return state
          const s: PlayerState = { ...state }
          rollDay(s)
          rollWeek(s)
          s.xpTotal += amt
          s.todayXp += amt
          s.weeklyXp += amt
          checkAchievements(s)
          return s
        }),
      addBossClear: () =>
        set((state) => {
          const s = { ...state }
          rollDay(s)
          s.bossesToday += 1
          return s
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
          const item = ALL_SHOP_ITEMS.find((i) => i.id === itemId)
          if (!item) {
            result = { success: false, message: 'Item not found' }
            return state
          }
          const isDust = item.currency === 'dust'
          const balance = isDust ? state.dust : state.gems
          if (balance < item.price) {
            result = { success: false, message: isDust ? 'Not enough dust!' : 'Not enough gems!' }
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
            shopInventory: { ...state.shopInventory, [itemId]: current + 1 },
          }
          if (isDust) next.dust = state.dust - item.price
          else next.gems = state.gems - item.price
          if (itemId === 'streak-saver' || itemId === 'dust-streak-saver') {
            next.streakSavers = state.streakSavers + 1
          } else if (itemId === 'chest-boost' || itemId === 'dust-chest-boost') {
            next.chestBoost = true
          } else if (itemId === 'mega-chest') {
            next.megaChest = true
          } else if (itemId === 'double-xp' || itemId === 'dust-double-xp') {
            next.doubleXpLessons = state.doubleXpLessons + 3
          } else if (itemId === 'lucky-ticket' || itemId === 'dust-lucky-ticket') {
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
          let cardStars = { ...state.cardStars }
          let pity = state.cardPity

          // Award the pack copies (1-3 of ONE character, uncapped — cardStars
          // tracks total copies received; star LEVEL is derived via toStar())
          const prev = cardStars[chest.cardId] ?? 0
          const anyNew = prev === 0
          cardStars[chest.cardId] = prev + chest.copies

          // Pity resets when a new character is unlocked
          if (anyNew) pity = 0
          else pity = pity + 1

          // Dust for duplicates: once the packed character is 5★, extra
          // copies convert into dust (shop currency) at DUST_PER_CARD each —
          // otherwise maxing a character dead-ends the gacha.
          const maxThreshold = STAR_THRESHOLDS[STAR_THRESHOLDS.length - 1]
          const prevCopies = cardStars[chest.cardId] - chest.copies
          const maxedCopies = Math.max(0, Math.min(chest.copies, cardStars[chest.cardId] - maxThreshold))
          const dustEarned = (chest.dust ?? 0) + maxedCopies * DUST_PER_CARD[chest.finalTier]
          const gemMultiplier = maxedCopies > 0 || prevCopies >= maxThreshold ? 2 : 1
          const bonusGems = (chest.gems ?? 0) * gemMultiplier

          return {
            gems: state.gems + bonusGems,
            dust: state.dust + dustEarned,
            cardStars,
            cardPity: pity,
          }
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
          // Conservative field-by-field merge. Local counters only ever move
          // UP (the server merges before responding, so remote values already
          // contain the union); identity/display fields follow the remote save.
          const next: Partial<PlayerState> = {}
          const maxNum = (a: number, b: unknown) =>
            typeof b === 'number' && Number.isFinite(b) ? Math.max(a, b) : undefined
          if (typeof snap.name === 'string' && snap.name) next.name = snap.name
          if (snap.mascot) next.mascot = snap.mascot
          if (snap.subject) next.subject = snap.subject
          if (typeof snap.dailyGoal === 'number') next.dailyGoal = snap.dailyGoal
          if (typeof snap.onboarded === 'boolean') next.onboarded = snap.onboarded
          if (typeof snap.soundOn === 'boolean') next.soundOn = snap.soundOn
          if (typeof snap.lastActiveDay === 'string' || snap.lastActiveDay === null)
            next.lastActiveDay = snap.lastActiveDay
          if (typeof snap.lastLoginDay === 'string' || snap.lastLoginDay === null)
            next.lastLoginDay = snap.lastLoginDay
          if (typeof snap.loginRewardClaimedDay === 'string' || snap.loginRewardClaimedDay === null)
            next.loginRewardClaimedDay = snap.loginRewardClaimedDay
          if (typeof snap.weeklyXpWeek === 'string') next.weeklyXpWeek = snap.weeklyXpWeek
          if (snap.pendingLeagueSettle !== undefined)
            next.pendingLeagueSettle = snap.pendingLeagueSettle
          const xp = maxNum(state.xpTotal, snap.xpTotal)
          if (xp !== undefined) next.xpTotal = xp
          const gems = maxNum(state.gems, snap.gems)
          if (gems !== undefined) next.gems = gems
          const dust = maxNum(state.dust, snap.dust)
          if (dust !== undefined) next.dust = dust
          const sc = maxNum(state.streakCurrent, snap.streakCurrent)
          if (sc !== undefined) next.streakCurrent = sc
          const sl = maxNum(state.streakLongest, snap.streakLongest)
          if (sl !== undefined) next.streakLongest = sl
          const dls = maxNum(state.dailyLoginStreak, snap.dailyLoginStreak)
          if (dls !== undefined) next.dailyLoginStreak = dls
          const ls = maxNum(state.lastStreakReward, snap.lastStreakReward)
          if (ls !== undefined) next.lastStreakReward = ls
          const lt = maxNum(state.luckyTickets, snap.luckyTickets)
          if (lt !== undefined) next.luckyTickets = lt
          const dx = maxNum(state.doubleXpLessons, snap.doubleXpLessons)
          if (dx !== undefined) next.doubleXpLessons = dx
          const ss = maxNum(state.streakSavers, snap.streakSavers)
          if (ss !== undefined) next.streakSavers = ss
          const pity = typeof snap.cardPity === 'number' ? Math.min(state.cardPity, snap.cardPity) : undefined
          if (pity !== undefined) next.cardPity = pity
          if (snap.pendingStreakMilestone !== undefined)
            next.pendingStreakMilestone = snap.pendingStreakMilestone
          if (typeof snap.chestBoost === 'boolean') next.chestBoost = snap.chestBoost
          if (typeof snap.megaChest === 'boolean') next.megaChest = snap.megaChest
          if (snap.achievements?.length)
            next.achievements = [...new Set([...state.achievements, ...snap.achievements])]
          if (snap.lessonProgress) {
            const merged: Record<string, LessonProgress> = { ...state.lessonProgress }
            for (const [k, v] of Object.entries(snap.lessonProgress)) {
              if (!v || typeof v !== 'object') continue
              const prev = merged[k]
              merged[k] = prev
                ? {
                    crown: Math.max(prev.crown, v.crown),
                    bestAccuracy: Math.max(prev.bestAccuracy, v.bestAccuracy),
                    completions: Math.max(prev.completions, v.completions),
                  }
                : { ...v }
            }
            next.lessonProgress = merged
          }
          if (snap.cardStars) {
            const merged: Record<string, number> = { ...state.cardStars }
            for (const [k, v] of Object.entries(snap.cardStars)) {
              if (typeof v === 'number' && Number.isFinite(v))
                merged[k] = Math.max(merged[k] ?? 0, v)
            }
            next.cardStars = merged
          }
          if (snap.shopInventory) {
            const merged: Record<string, number> = { ...state.shopInventory }
            for (const [k, v] of Object.entries(snap.shopInventory)) {
              if (typeof v === 'number' && Number.isFinite(v))
                merged[k] = Math.max(merged[k] ?? 0, v)
            }
            next.shopInventory = merged
          }
          if (snap.arcadeScores) {
            const merged: Record<string, number> = { ...state.arcadeScores }
            for (const [k, v] of Object.entries(snap.arcadeScores)) {
              if (typeof v === 'number' && Number.isFinite(v))
                merged[k] = Math.max(merged[k] ?? 0, v)
            }
            next.arcadeScores = merged
          }
          if (snap.claimedQuests?.day) next.claimedQuests = snap.claimedQuests
          return next
        }),
      setLastSyncedAt: (t) => set({ lastSyncedAt: t }),
      spendDust: (amount) => {
        let success = false
        set((state) => {
          if (amount < 0 || state.dust < amount) return state
          success = true
          return { dust: state.dust - amount }
        })
        return success
      },
      submitArcadeScore: (gameId, score) => {
        const key = String(gameId ?? '').slice(0, 32)
        if (!key) return false
        let pb = false
        set((state) => {
          const n = Math.max(0, Math.round(Number(score) || 0))
          const prev = state.arcadeScores[key] ?? 0
          if (n <= prev) return state
          pb = true
          return { arcadeScores: { ...state.arcadeScores, [key]: n } }
        })
        return pb
      },
      claimDailyLogin: () => {
        let dayIndex: number | null = null
        set((state) => {
          const today = todayISO()
          if (state.loginRewardClaimedDay === today) return state
          const yesterday = yesterdayISO()
          const streak =
            state.lastLoginDay === yesterday ? state.dailyLoginStreak + 1 : 1
          const idx = ((streak - 1) % 7) as number
          dayIndex = idx
          return {
            dailyLoginStreak: streak,
            lastLoginDay: today,
            loginRewardClaimedDay: today,
            gems: state.gems + LOGIN_REWARDS[idx],
          }
        })
        return dayIndex
      },
      syncLeagueWeek: () =>
        set((state) => {
          const s: PlayerState = { ...state }
          // no settlement → return the same state (no re-render/persist write)
          return settleLeagueWeek(s) ? s : state
        }),
      syncLeagueWeekByRank: (myRank, totalRanks = 10) =>
        set((state) => {
          const s: PlayerState = { ...state }
          // no settlement → return the same state (no re-render/persist write)
          return settleLeagueWeekByRank(s, myRank, totalRanks) ? s : state
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
      version: 9,
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
        if (version < 6) {
          // cardCollection (string[]) -> cardCounts (Record<string,number>)
          const oldCards: string[] = (p as any).cardCollection ?? []
          p.cardCounts = {}
          for (const id of oldCards) p.cardCounts[id] = 3
          if (typeof (p as any).cardPity !== 'number') (p as any).cardPity = 0
        }
        if (version < 7) {
          // cardCounts (copies) -> cardStars (total copies, uncapped)
          // Star LEVEL is derived via toStar() using STAR_THRESHOLDS
          const oldCounts: Record<string, number> = (p as any).cardCounts ?? {}
          p.cardStars = {}
          for (const [id, copies] of Object.entries(oldCounts)) {
            if ((copies as number) > 0) p.cardStars[id] = copies as number
          }
        }
        if (version < 8) {
          // Rank-based settlement: backfill the pending-week snapshot so
          // pre-v8 states settle cleanly on the Leagues tab.
          if (!p.pendingLeagueSettle) (p as any).pendingLeagueSettle = null
        }
        if (version < 9) {
          // v9: card dust, login calendar, arcade personal bests.
          p.dust = typeof p.dust === 'number' ? p.dust : 0
          p.dailyLoginStreak = typeof p.dailyLoginStreak === 'number' ? p.dailyLoginStreak : 0
          p.lastLoginDay = typeof p.lastLoginDay === 'string' ? p.lastLoginDay : null
          p.loginRewardClaimedDay =
            typeof p.loginRewardClaimedDay === 'string' ? p.loginRewardClaimedDay : null
          p.arcadeScores = p.arcadeScores && typeof p.arcadeScores === 'object' ? p.arcadeScores : {}
        }
        return p
      },
    },
  ),
)

export function questProgressSnapshot(s: PlayerState) {
  const today = todayISO()
  return {
    xpToday: s.todayXpDay === today ? s.todayXp : 0,
    lessonsToday: s.lessonsTodayDay === today ? s.lessonsToday : 0,
    correctToday: s.correctTodayDay === today ? s.correctToday : 0,
    bossesToday: s.bossesTodayDay === today ? s.bossesToday : 0,
    arcadeCorrectToday: s.arcadeCorrectTodayDay === today ? s.arcadeCorrectToday : 0,
  }
}

export function questsDone(s: PlayerState) {
  const snap = questProgressSnapshot(s)
  return questsForDay(todayISO())
    .filter((q) => q.progress(snap) >= q.goal)
    .map((q) => q.id)
}

export function isQuestClaimed(s: PlayerState, questId: string) {
  if (s.claimedQuests.day !== todayISO()) return false
  return s.claimedQuests.questIds.includes(questId)
}
