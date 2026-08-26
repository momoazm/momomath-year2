import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MascotId } from '../content/types'
import {
  ACHIEVEMENTS,
  DAILY_QUESTS,
  advanceLeague,
  leagueOutcomeByXp,
  nextWeekKey,
  todayISO,
  weekKey,
  yesterdayISO,
  type LeagueName,
} from './gamification'
import { SHOP_ITEMS } from './shop'
import { setMuted, sfx } from './sfx'

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

/** Weekly league rollover (auto every Monday): settle last week by XP earned,
 *  promote/demote, then reset the weekly XP counter for the fresh league. */
function rollWeek(s: PlayerState) {
  const wk = weekKey()
  if (s.weeklyXpWeek === wk) return
  const prevWeek = s.weeklyXpWeek || wk
  const prevLeague = s.currentLeague
  const outcome = leagueOutcomeByXp(prevLeague, s.weeklyXp)
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

export const usePlayer = create<PlayerState>()(
  persist(
    (set) => ({
      name: 'Champion',
      mascot: 'sonic' as MascotId,
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

          checkAchievements(s)

          if (!wasStreakActive && s.streakCurrent > 1) sfx.streak()

          return s
        }),

      setDailyGoal: (g) => set({ dailyGoal: g }),
      setName: (n) => set({ name: n.trim() || 'Champion' }),
      setMascot: (m) => set({ mascot: m }),
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
          return {
            gems: state.gems - item.price,
            shopInventory: { ...state.shopInventory, [itemId]: current + 1 },
          }
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
    }),
    { name: 'momomath-year2-player-v2' },
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
