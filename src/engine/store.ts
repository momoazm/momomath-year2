import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MascotId, Subject } from '../content/types'
import {
  ACHIEVEMENTS,
  DAILY_QUESTS,
  advanceLeague,
  leagueOutcomeByRank,
  LEAGUES,
  nextWeekKey,
  todayISO,
  weekKey,
  yesterdayISO,
  type LeagueName,
} from './gamification'
import { SHOP_ITEMS } from './shop'
import { setMuted, sfx } from './sfx'
import type { ChestResult } from './cards'
import type { AdaptiveStore } from './adaptive/types'
import { ADAPTIVE_CONFIG } from './adaptive/config'

const initialAdaptive = (): AdaptiveStore => ({
  snapshot: { skills: {}, seenCodes: [], recentPicks: [], lastRecommendation: null },
  attempts: [],
  masteryHistory: {},
  telemetry: {
    llmRequests: 0,
    llmHits: 0,
    llmFallbacks: 0,
    lastLlmProvider: null,
    lastLlmLatencyMs: null,
    recommended: 0,
    recommendedAccepted: 0,
  },
})

export { ADAPTIVE_CONFIG, initialAdaptive }

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
  /** Optional DLC-style extras. German / Arabic / Religion / Social never appear
   *  unless the player opts in (Profile → Extra adventures) or opens
   *  ?subject=. Core Math ⇄ English ⇄ Science loop is unaffected when false. */
  germanEnabled: boolean
  arabicEnabled: boolean
  religionEnabled: boolean
  socialEnabled: boolean
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
  soundOn: boolean
  onboarded: boolean
  shopInventory: Record<string, number>
  streakSavers: number
  doubleXpLessons: number
  chestBoost: boolean
  megaChest: boolean
  /** card stars by id (missing = unowned; 0 = new, up to MAX_STARS via duplicates) */
  cardStars: Record<string, number>
  /** consecutive chests without any card - drives hidden card pity (see cards.ts) */
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
  /** XP-only practice (wrong-question retry): moves XP/gems/dailies/streak but
   *  never touches lessonProgress crowns or chests — loot stays on fresh clears. */
  recordPractice: (args: { xp: number; correct: number; totalQuestions: number }) => void
  setDailyGoal: (g: number) => void
  setName: (n: string) => void
  setMascot: (m: MascotId) => void
  setSubject: (s: Subject) => void
  setGermanEnabled: (v: boolean) => void
  setArabicEnabled: (v: boolean) => void
  setReligionEnabled: (v: boolean) => void
  setSocialEnabled: (v: boolean) => void
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
  addLuckyTickets: (n: number) => void
  /** consume one Lucky Ticket if available; returns true if it was active */
  consumeLuckyTicket: () => boolean
  applySyncedSnapshot: (snap: Partial<PlayerState>) => void
  setLastSyncedAt: (t: number | null) => void

  // --- adaptive learning ---
  adaptive: AdaptiveStore
  recordAdaptiveAttempt: (entry: import('./adaptive/types').AttemptLogEntry) => void
  setLastAdaptiveRecommendation: (rec: import('./adaptive/types').AdaptiveRecommendation | null) => void
  bumpLlm: (args: { hit: boolean; provider: string | null; latencyMs: number | null }) => void
  bumpRecommendationShown: (accepted: boolean) => void
  resetAdaptive: () => void
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

/** Weekly league rollover (auto every Monday): settle last week by RANK on the
 *  10-racer practice board (ranks 1-3 promote, 4-7 stay, 8-10 demote),
 *  then reset the weekly XP counter for the fresh league. */
function rollWeek(s: PlayerState) {
  const wk = weekKey()
  if (s.weeklyXpWeek === wk) return
  const prevWeek = s.weeklyXpWeek || wk
  const prevLeague = s.currentLeague
  const outcome = leagueOutcomeByRank(prevLeague, s.weeklyXp, prevWeek)
  s.currentLeague = advanceLeague(prevLeague, outcome)
  s.leagueHistory = [
    ...s.leagueHistory.slice(-9),
    { weekKey: prevWeek, league: prevLeague, outcome, xp: s.weeklyXp },
  ]
  s.weeklyXpWeek = wk
  s.weeklyXp = 0
}

export function updateStreak(
  s: Pick<PlayerState, 'streakCurrent' | 'streakLongest' | 'lastActiveDay'>,
  today: string = todayISO(),
  yesterday: string = yesterdayISO(),
) {
  if (s.lastActiveDay === today) return
  if (s.lastActiveDay === yesterday) {
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

function initialSubjectFromUrl(): Subject {
  if (typeof window === 'undefined') return 'math'
  const q = new URLSearchParams(window.location.search).get('subject')
  if (q === 'english' || q === 'science' || q === 'german' || q === 'arabic' || q === 'religion' || q === 'social') return q
  return 'math'
}

function initialExtraEnabled(key: 'germanEnabled' | 'arabicEnabled' | 'religionEnabled' | 'socialEnabled', subject: 'german' | 'arabic' | 'religion' | 'social'): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = window.localStorage.getItem('momomath-year2-player-v2')
    if (raw) {
      const parsed = JSON.parse(raw) as { state?: Record<string, unknown> }
      if (typeof parsed?.state?.[key] === 'boolean') return parsed.state[key] as boolean
    }
  } catch {
    /* fall through to URL check */
  }
  return new URLSearchParams(window.location.search).get('subject') === subject
}

function initialGermanEnabled(): boolean {
  return initialExtraEnabled('germanEnabled', 'german')
}

function initialArabicEnabled(): boolean {
  return initialExtraEnabled('arabicEnabled', 'arabic')
}

function initialReligionEnabled(): boolean {
  return initialExtraEnabled('religionEnabled', 'religion')
}

function initialSocialEnabled(): boolean {
  return initialExtraEnabled('socialEnabled', 'social')
}

export const usePlayer = create<PlayerState>()(
  persist(
    (set) => ({
      name: 'Champion',
      mascot: 'sonic' as MascotId,
      subject: initialSubjectFromUrl(),
      germanEnabled: initialGermanEnabled(),
      arabicEnabled: initialArabicEnabled(),
      religionEnabled: initialReligionEnabled(),
      socialEnabled: initialSocialEnabled(),
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
      weeklyXpWeek: weekKey(),
      weeklyXp: 0,
      lessonProgress: {},
      claimedQuests: { day: firstDay, questIds: [] },
      achievements: [],
      currentLeague: 'Bronze',
      leagueHistory: [],
      soundOn: true,
      onboarded: false,
      shopInventory: {},
      streakSavers: 0,
      doubleXpLessons: 0,
      chestBoost: false,
      megaChest: false,
      cardStars: {},
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
          // Streak Saver: bridge a missed day instead of resetting to 1.
          // updateStreak looks at lastActiveDay, so move it to yesterday and
          // spend one saver — the streak then continues (+1) as promised.
          if (
            s.streakSavers > 0 &&
            s.lastActiveDay != null &&
            s.lastActiveDay !== todayISO() &&
            s.lastActiveDay !== yesterdayISO()
          ) {
            s.streakSavers -= 1
            s.lastActiveDay = yesterdayISO()
          }
          updateStreak(s)

          checkAchievements(s)

          if (!wasStreakActive && s.streakCurrent > 1) sfx.streak()

          return s
        }),

      recordPractice: ({ xp, correct, totalQuestions }) =>
        set((state) => {
          void totalQuestions
          const s: PlayerState = { ...state }
          rollDay(s)
          rollWeek(s)

          s.xpTotal += xp
          s.gems += Math.round(xp / 10)
          s.todayXp += xp
          s.correctToday += correct
          s.weeklyXp += xp

          const wasStreakActive = state.lastActiveDay === todayISO()
          updateStreak(s)

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
          if (s === 'english' || s === 'science' || s === 'german' || s === 'arabic' || s === 'religion' || s === 'social') url.searchParams.set('subject', s)
          else url.searchParams.delete('subject')
          window.history.replaceState(null, '', url)
        }
        // Deep-linking / picking an extra auto-enables it so a
        // refresh keeps it visible. Disabling happens only via setXEnabled.
        if (s === 'german') {
          set({ subject: s, germanEnabled: true })
        } else if (s === 'arabic') {
          set({ subject: s, arabicEnabled: true })
        } else if (s === 'religion') {
          set({ subject: s, religionEnabled: true })
        } else if (s === 'social') {
          set({ subject: s, socialEnabled: true })
        } else {
          set({ subject: s })
        }
      },
      setGermanEnabled: (v) =>
        set((state) => {
          // Turning the extra off while viewing it falls back to Maths so the
          // player is never stranded on a hidden subject.
          if (!v && state.subject === 'german') {
            if (typeof window !== 'undefined') {
              const url = new URL(window.location.href)
              url.searchParams.delete('subject')
              window.history.replaceState(null, '', url)
            }
            return { germanEnabled: false, subject: 'math' as Subject }
          }
          return { germanEnabled: v }
        }),
      setArabicEnabled: (v) =>
        set((state) => {
          if (!v && state.subject === 'arabic') {
            if (typeof window !== 'undefined') {
              const url = new URL(window.location.href)
              url.searchParams.delete('subject')
              window.history.replaceState(null, '', url)
            }
            return { arabicEnabled: false, subject: 'math' as Subject }
          }
          return { arabicEnabled: v }
        }),
      setReligionEnabled: (v) =>
        set((state) => {
          if (!v && state.subject === 'religion') {
            if (typeof window !== 'undefined') {
              const url = new URL(window.location.href)
              url.searchParams.delete('subject')
              window.history.replaceState(null, '', url)
            }
            return { religionEnabled: false, subject: 'math' as Subject }
          }
          return { religionEnabled: v }
        }),
      setSocialEnabled: (v) =>
        set((state) => {
          if (!v && state.subject === 'social') {
            if (typeof window !== 'undefined') {
              const url = new URL(window.location.href)
              url.searchParams.delete('subject')
              window.history.replaceState(null, '', url)
            }
            return { socialEnabled: false, subject: 'math' as Subject }
          }
          return { socialEnabled: v }
        }),
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
          // Boolean boosts have a single active flag — rebuying while active
          // would burn gems for zero effect.
          if (itemId === 'chest-boost' && state.chestBoost) {
            result = { success: false, message: 'Chest Boost already active — finish a lesson first!' }
            return state
          }
          if (itemId === 'mega-chest' && state.megaChest) {
            result = { success: false, message: 'Mega Chest already active — finish a lesson first!' }
            return state
          }
          result = { success: true, message: 'Purchase successful!' }
          return {
            gems: state.gems - item.price,
            shopInventory: { ...state.shopInventory, [itemId]: current + 1 },
          }
        })
        // A purchase must actually switch the boost on — inventory counts
        // alone never reached the lesson loop, so gems burned for nothing.
        if (result.success) {
          set((state) => {
            switch (itemId) {
              case 'double-xp':
                return { doubleXpLessons: state.doubleXpLessons + 1 }
              case 'chest-boost':
                return state.chestBoost ? state : { chestBoost: true }
              case 'mega-chest':
                return state.megaChest ? state : { megaChest: true }
              case 'lucky-ticket':
                return { luckyTickets: state.luckyTickets + 1 }
              case 'streak-saver':
                return { streakSavers: state.streakSavers + 1 }
              default:
                return state
            }
          })
        }
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
          const cardStars = { ...state.cardStars }
          for (const c of chest.cards) {
            if (c.isNew) {
              if (!(c.id in cardStars)) cardStars[c.id] = 0
            } else {
              cardStars[c.id] = Math.max(cardStars[c.id] ?? 0, c.starAfter)
            }
          }
          return {
            gems: state.gems + chest.gems + chest.starBonus,
            cardStars,
            cardPity: chest.cards.length > 0 ? 0 : state.cardPity + 1,
          }
        }),
      addLuckyTickets: (n) => set((state) => ({ luckyTickets: state.luckyTickets + n })),
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
          // Field-by-field cloud merge: progress earned on ANY device signed
          // into the same Google account survives. Counters take the max,
          // collections union, per-lesson progress takes per-field max, and
          // display fields (name/mascot/subject/goal/…) arrive pre-resolved
          // (newest writer wins) from the cloud merge — apply them as given.
          const next: Partial<PlayerState> = {}
          if (typeof snap.name === 'string') next.name = snap.name
          if (snap.mascot) next.mascot = snap.mascot
          if (snap.subject) next.subject = snap.subject
          if (typeof snap.dailyGoal === 'number') next.dailyGoal = snap.dailyGoal
          if (typeof snap.lastActiveDay !== 'undefined') next.lastActiveDay = snap.lastActiveDay
          if (typeof snap.xpTotal === 'number') next.xpTotal = Math.max(state.xpTotal, snap.xpTotal)
          if (typeof snap.gems === 'number') next.gems = Math.max(state.gems, snap.gems)
          if (typeof snap.streakLongest === 'number')
            next.streakLongest = Math.max(state.streakLongest, snap.streakLongest)
          if (typeof snap.streakCurrent === 'number')
            next.streakCurrent = Math.max(state.streakCurrent, snap.streakCurrent)
          if (typeof snap.streakSavers === 'number')
            next.streakSavers = Math.max(state.streakSavers, snap.streakSavers)
          if (typeof snap.doubleXpLessons === 'number')
            next.doubleXpLessons = Math.max(state.doubleXpLessons, snap.doubleXpLessons)
          if (typeof snap.luckyTickets === 'number')
            next.luckyTickets = Math.max(state.luckyTickets, snap.luckyTickets)
          if (snap.weeklyXpWeek) {
            if (state.weeklyXpWeek === snap.weeklyXpWeek && typeof snap.weeklyXp === 'number') {
              next.weeklyXp = Math.max(state.weeklyXp, snap.weeklyXp)
            } else if (snap.weeklyXpWeek > state.weeklyXpWeek) {
              next.weeklyXpWeek = snap.weeklyXpWeek
              next.weeklyXp = snap.weeklyXp ?? 0
            }
          }
          if (snap.currentLeague && LEAGUES.indexOf(snap.currentLeague) > LEAGUES.indexOf(state.currentLeague))
            next.currentLeague = snap.currentLeague
          if (snap.leagueHistory?.length) {
            const seen = new Set(state.leagueHistory.map((h) => h.weekKey))
            const extra = snap.leagueHistory.filter((h) => !seen.has(h.weekKey))
            if (extra.length)
              next.leagueHistory = [...state.leagueHistory, ...extra]
                .sort((x, y) => (x.weekKey < y.weekKey ? -1 : 1))
                .slice(-10)
          }
          if (snap.achievements?.length)
            next.achievements = [...new Set([...state.achievements, ...snap.achievements])]
          if (snap.cardStars) {
            const merged: Record<string, number> = { ...state.cardStars }
            for (const [k, v] of Object.entries(snap.cardStars)) {
              merged[k] = Math.max(merged[k] ?? -1, v)
            }
            next.cardStars = merged
          }
          if (snap.lessonProgress) {
            const merged: Record<string, LessonProgress> = { ...state.lessonProgress }
            for (const [k, v] of Object.entries(snap.lessonProgress)) {
              const prev = merged[k]
              merged[k] = prev
                ? {
                    crown: Math.max(prev.crown, v.crown),
                    bestAccuracy: Math.max(prev.bestAccuracy, v.bestAccuracy),
                    completions: Math.max(prev.completions, v.completions),
                  }
                : v
            }
            next.lessonProgress = merged
          }
          if (snap.shopInventory) {
            const mergedInv = { ...state.shopInventory }
            for (const [k, v] of Object.entries(snap.shopInventory))
              mergedInv[k] = Math.max(mergedInv[k] ?? 0, v)
            next.shopInventory = mergedInv
          }
        return next
        }),
      setLastSyncedAt: (t) => set({ lastSyncedAt: t }),

      // --- adaptive learning ---
      adaptive: initialAdaptive(),
      recordAdaptiveAttempt: (entry) =>
        set((state) => {
          const log = state.adaptive.attempts.length >= ADAPTIVE_CONFIG.ATTEMPT_LOG_CAP
            ? [...state.adaptive.attempts.slice(-(ADAPTIVE_CONFIG.ATTEMPT_LOG_CAP - 1)), entry]
            : [...state.adaptive.attempts, entry]
          const mh = state.adaptive.masteryHistory
          const series = mh[entry.objectiveCode] ?? []
          const nextSeries = [...series, { ts: entry.ts, pL: entry.masteryAfter }].slice(-200)
          return {
            adaptive: {
              ...state.adaptive,
              attempts: log,
              masteryHistory: { ...mh, [entry.objectiveCode]: nextSeries },
            },
          }
        }),
      setLastAdaptiveRecommendation: (rec) =>
        set((state) => ({
          adaptive: { ...state.adaptive, snapshot: { ...state.adaptive.snapshot, lastRecommendation: rec } },
        })),
      bumpLlm: ({ hit, provider, latencyMs }) =>
        set((state) => ({
          adaptive: {
            ...state.adaptive,
            telemetry: {
              ...state.adaptive.telemetry,
              llmRequests: state.adaptive.telemetry.llmRequests + 1,
              llmHits: state.adaptive.telemetry.llmHits + (hit ? 1 : 0),
              llmFallbacks: state.adaptive.telemetry.llmFallbacks + (hit ? 0 : 1),
              lastLlmProvider: provider,
              lastLlmLatencyMs: latencyMs,
            },
          },
        })),
      bumpRecommendationShown: (accepted) =>
        set((state) => ({
          adaptive: {
            ...state.adaptive,
            telemetry: {
              ...state.adaptive.telemetry,
              recommended: state.adaptive.telemetry.recommended + 1,
              recommendedAccepted: state.adaptive.telemetry.recommendedAccepted + (accepted ? 1 : 0),
            },
          },
        })),
      resetAdaptive: () => set({ adaptive: initialAdaptive() }),
    }),
    {
      name: 'momomath-year2-player-v2',
      version: 8,
      migrate: (persisted, version) => {
        const p = persisted as PlayerState
        let next: PlayerState = p
        if (version < 3) {
          // Backfill any fields added after v2.
          const legacy = (p as unknown as { cardCollection?: unknown }).cardCollection
          next = {
            ...p,
            cardStars: Array.isArray(legacy)
              ? Object.fromEntries(legacy.map((id) => [id, 0]))
              : {},
            cardPity: typeof p.cardPity === 'number' ? p.cardPity : 0,
            luckyTickets: typeof p.luckyTickets === 'number' ? p.luckyTickets : 0,
            lastSyncedAt: typeof p.lastSyncedAt === 'number' ? p.lastSyncedAt : null,
          }
        }
        if (version < 4) {
          // v4: introduce the adaptive learning slice. Always start fresh — the
          // engine has no signal from before this version.
          next = {
            ...next,
            adaptive: {
              snapshot: { skills: {}, seenCodes: [], recentPicks: [], lastRecommendation: null },
              attempts: [],
              masteryHistory: {},
              telemetry: {
                llmRequests: 0,
                llmHits: 0,
                llmFallbacks: 0,
                lastLlmProvider: null,
                lastLlmLatencyMs: null,
                recommended: 0,
                recommendedAccepted: 0,
              },
            },
          }
        }
        if (version < 5) {
          // v5: optional German extra. Default OFF so existing players keep the
          // exact Math ⇄ English experience. Deep-linkers keep German visible.
          // NOTE: old saves may lack `subject` entirely — never write it back
          // as undefined (shallow-merge would clobber the 'math' default and
          // crash getCurriculum().units on boot).
          const wantsGerman =
            typeof window !== 'undefined' &&
            new URLSearchParams(window.location.search).get('subject') === 'german'
          const stored = next as Partial<PlayerState>
          const storedSubject = stored.subject
          const validSubject: Subject =
            storedSubject === 'math' ||
            storedSubject === 'english' ||
            storedSubject === 'science' ||
            storedSubject === 'german' ||
            storedSubject === 'arabic'
              ? storedSubject
              : 'math'
          const enabled =
            typeof stored.germanEnabled === 'boolean' ? stored.germanEnabled : wantsGerman
          next = {
            ...next,
            germanEnabled: enabled,
            subject:
              validSubject === 'german' && !enabled && !wantsGerman ? 'math' : validSubject,
          }
        }
        if (version < 6) {
          // v6: optional Arabic extra (Egyptian Tawassol Grade 2). Default OFF
          // so existing players keep their exact experience. Deep-linkers keep
          // Arabic visible. Progress keys are `a*` so no collisions.
          const wantsArabic =
            typeof window !== 'undefined' &&
            new URLSearchParams(window.location.search).get('subject') === 'arabic'
          const stored = next as Partial<PlayerState>
          const storedSubject = stored.subject
          const validSubject: Subject =
            storedSubject === 'math' ||
            storedSubject === 'english' ||
            storedSubject === 'science' ||
            storedSubject === 'german' ||
            storedSubject === 'arabic'
              ? storedSubject
              : 'math'
          const enabled =
            typeof stored.arabicEnabled === 'boolean' ? stored.arabicEnabled : wantsArabic
          next = {
            ...next,
            arabicEnabled: enabled,
            subject:
              validSubject === 'arabic' && !enabled && !wantsArabic ? 'math' : validSubject,
          }
        }
        if (version < 7) {
          // v7: optional Religion + Social extras (Egyptian govt Grade 2).
          // Default OFF. Progress keys are `r*` / `d*` so no collisions.
          const params = typeof window !== 'undefined'
            ? new URLSearchParams(window.location.search).get('subject')
            : null
          const stored = next as Partial<PlayerState>
          const storedSubject = stored.subject
          const validSubject: Subject =
            storedSubject === 'math' ||
            storedSubject === 'english' ||
            storedSubject === 'science' ||
            storedSubject === 'german' ||
            storedSubject === 'arabic' ||
            storedSubject === 'religion' ||
            storedSubject === 'social'
              ? storedSubject
              : 'math'
          const relEnabled =
            typeof stored.religionEnabled === 'boolean' ? stored.religionEnabled : params === 'religion'
          const socEnabled =
            typeof stored.socialEnabled === 'boolean' ? stored.socialEnabled : params === 'social'
          next = {
            ...next,
            religionEnabled: relEnabled,
            socialEnabled: socEnabled,
            subject:
              validSubject === 'religion' && !relEnabled && params !== 'religion'
                ? 'math'
                : validSubject === 'social' && !socEnabled && params !== 'social'
                  ? 'math'
                  : validSubject,
          }
        }
        if (version < 8) {
          // v8: card collection becomes star levels (id -> 0..MAX_STARS).
          // Old saves kept a plain id array; every previously owned card
          // converts to 0 stars (owned, no star-ups yet).
          const stored = next as unknown as {
            cardCollection?: unknown
            cardStars?: unknown
          }
          if (!stored.cardStars || typeof stored.cardStars !== 'object') {
            const legacy = stored.cardCollection
            next = {
              ...next,
              cardStars: Array.isArray(legacy)
                ? Object.fromEntries(
                    (legacy as unknown[]).filter((id) => typeof id === 'string').map((id) => [id, 0]),
                  )
                : {},
            }
          }
        }
        return next
      },
      partialize: (state) => {
        // We persist the adaptive block explicitly so the schema stays stable
        // when other fields are added in future versions.
        const { adaptive, ...rest } = state
        void adaptive
        return rest
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
