/* ---------------- Streak milestone rewards ---------------- */

/** Every N consecutive active days the player earns a HIGH-RARITY bonus chest. */
export const STREAK_CHEST_EVERY = 7

/**
 * Returns the streak milestone (7, 14, 21 …) the player just reached, or null.
 * `lastReward` is the streak value at which the previous milestone chest was
 * granted, so replaying lessons on the same day never double-rewards.
 */
export function streakMilestoneFor(streak: number, lastReward: number): number | null {
  const milestone = Math.floor(streak / STREAK_CHEST_EVERY) * STREAK_CHEST_EVERY
  return milestone >= STREAK_CHEST_EVERY && milestone > lastReward ? milestone : null
}

export const LEAGUES = [
  'Bronze',
  'Silver',
  'Gold',
  'Sapphire',
  'Ruby',
  'Emerald',
  'Amethyst',
  'Diamond',
] as const

export type LeagueName = (typeof LEAGUES)[number]

export const LEAGUE_META: Record<LeagueName, { icon: string; color: string }> = {
  Bronze: { icon: '🥉', color: '#cd7f32' },
  Silver: { icon: '🥈', color: '#9ca3af' },
  Gold: { icon: '🥇', color: '#f59e0b' },
  Sapphire: { icon: '🔹', color: '#2563eb' },
  Ruby: { icon: '🔺', color: '#dc2626' },
  Emerald: { icon: '💚', color: '#059669' },
  Amethyst: { icon: '🟣', color: '#7c3aed' },
  Diamond: { icon: '💎', color: '#06b6d4' },
}

export const PROMOTION_GOAL_FACTOR = 1 // hit the weekly goal -> promoted
export const STAY_FACTOR = 0.34 // at least this fraction of the goal keeps your league

/** Weekly XP needed to be promoted, per league - rises as you climb. */
export const LEAGUE_GOALS: Record<LeagueName, number> = {
  Bronze: 60,
  Silver: 100,
  Gold: 150,
  Sapphire: 210,
  Ruby: 280,
  Emerald: 360,
  Amethyst: 450,
  Diamond: 550,
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function weeklyGoal(league: LeagueName): number {
  return LEAGUE_GOALS[league]
}

export function leagueOutcomeByXp(
  league: LeagueName,
  weeklyXp: number,
): 'promoted' | 'demoted' | 'stayed' {
  const goal = LEAGUE_GOALS[league]
  if (weeklyXp >= goal) return 'promoted'
  if (weeklyXp >= Math.round(goal * STAY_FACTOR)) return 'stayed'
  return 'demoted'
}

/**
 * Rank-based league outcome (used for the shared board, where XP varies per
 * league and rank is what matters). Bands are tuned for the target 10-player
 * board, but scale down naturally for smaller boards:
 *   - total >= 10: top 3 promote, middle 4-7 stay, bottom 3 demote
 *   - total 5-9:   top ceil(30%) promote, middle stays, bottom ceil(30%) demote
 *   - total <= 4:  rank 1 promotes, rank 2 stays, ranks 3-4 demote
 *
 * 1-based `rank`. `total` is the number of ranked players.
 */
export function leagueOutcomeByRank(
  rank: number,
  total: number,
): 'promoted' | 'demoted' | 'stayed' {
  if (total <= 0) return 'stayed'
  // 1-based: clamp rank into [1, total]
  const r = Math.max(1, Math.min(rank, total))
  if (total >= 10) {
    if (r <= 3) return 'promoted'
    if (r <= 7) return 'stayed'
    return 'demoted'
  }
  if (total >= 5) {
    const promoteCutoff = Math.max(1, Math.ceil(total * 0.3))
    const demoteCutoff = total - Math.max(1, Math.ceil(total * 0.3)) + 1
    if (r <= promoteCutoff) return 'promoted'
    if (r >= demoteCutoff) return 'demoted'
    return 'stayed'
  }
  // total 1-4: rank 1 promotes, 2 stays, 3+ demote
  if (r === 1) return 'promoted'
  if (r === 2) return 'stayed'
  return 'demoted'
}

/** local-date "YYYY-MM-DD" (never uses UTC, so +04:00-style timezones stay correct) */
function localISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

/** Monday-based ISO week key, e.g. "2026-08-17".
 *  Used as the SHARED identity across all players on the leaderboard so
 *  everyone's entry is comparable for the same calendar week. */
export function weekKey(d = new Date()): string {
  const date = new Date(d)
  const day = (date.getDay() + 6) % 7 // Mon=0..Sun=6
  date.setDate(date.getDate() - day)
  return localISO(date)
}

/** The date 7 days after `k` (used to roll shared-board week identity). */
export function nextWeekKey(k: string): string {
  const d = new Date(k + 'T00:00:00')
  d.setDate(d.getDate() + 7)
  return localISO(d)
}

/** Local-date "YYYY-MM-DD" for the given moment (defaults to now). */
export function todayISO(now: Date = new Date()): string {
  return localISO(now)
}

export function yesterdayISO(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return localISO(d)
}

/* -------- League weekly timer: anchored 7-day windows -------- */

/** One league week = exactly 7 days (in ms). */
export const LEAGUE_WEEK_MS = 7 * 86400000

/**
 * A league week runs from 12:00 AM of its anchor day and ends EXACTLY a week
 * later. `weeklyXpWeek` stores that anchor, so the live countdown restarts at
 * "12 AM of the day the week began" and reaches zero one week later.
 * Calendar arithmetic (setDate + 7) keeps the end at local 12:00 AM even
 * across daylight-saving transitions.
 */
export function leagueWeekEndsAt(anchor: string): number {
  const d = new Date(`${anchor}T00:00:00`)
  d.setDate(d.getDate() + 7)
  return d.getTime()
}

/** True once the 7-day league week anchored at `anchor` has fully elapsed. */
export function leagueWeekElapsed(anchor: string, now: Date = new Date()): boolean {
  return now.getTime() >= leagueWeekEndsAt(anchor)
}

/** Live countdown helper: ms until the anchored league week ends (0 once elapsed). */
export function msUntilWeekEnd(anchor: string, now: Date = new Date()): number {
  return Math.max(0, leagueWeekEndsAt(anchor) - now.getTime())
}

export function advanceLeague(current: LeagueName, outcome: 'promoted' | 'demoted' | 'stayed'): LeagueName {
  const idx = LEAGUES.indexOf(current)
  if (outcome === 'promoted') return LEAGUES[Math.min(idx + 1, LEAGUES.length - 1)]
  if (outcome === 'demoted') return LEAGUES[Math.max(idx - 1, 0)]
  return current
}

/* ---------------- League standings: practice rivals (bots for now) ---------------- */

export interface LeagueRival {
  id: string
  name: string
  icon: string
  /** fraction of the league goal this rival tends to reach by the end of a week */
  drive: number
}

export const LEAGUE_RIVALS: LeagueRival[] = [
  { id: 'zara', name: 'Zara', icon: '🦊', drive: 1.55 },
  { id: 'max', name: 'Max', icon: '🐯', drive: 1.3 },
  { id: 'layla', name: 'Layla', icon: '🐰', drive: 1.12 },
  { id: 'omar', name: 'Omar', icon: '🐻', drive: 0.98 },
  { id: 'sara', name: 'Sara', icon: '🐨', drive: 0.85 },
  { id: 'yusuf', name: 'Yusuf', icon: '🦁', drive: 0.7 },
  { id: 'mia', name: 'Mia', icon: '🐼', drive: 0.58 },
  { id: 'ali', name: 'Ali', icon: '🐸', drive: 0.45 },
  { id: 'nora', name: 'Nora', icon: '🐧', drive: 0.35 },
  { id: 'adam', name: 'Adam', icon: '🐷', drive: 0.24 },
]

function hashStr(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Deterministic rival XP for a given week: grows through the week at a
 *  personality-specific pace, so standings shuffle daily but stay stable
 *  across reloads. Scales with the league goal, so higher leagues feel harder. */
export function rivalXp(
  rival: LeagueRival,
  league: LeagueName,
  wk: string,
  now: Date = new Date(),
): number {
  const rand = mulberry32(hashStr(`${wk}:${rival.id}`))
  const jitter = 0.85 + rand() * 0.4 // some weeks a rival over/under-performs (never too lazy)
  const paceExp = 0.7 + rand() * 0.9 // sprinters front-load, grinders finish strong
  const target = LEAGUE_GOALS[league] * Math.min(rival.drive * jitter, 1.7)

  const startMs = new Date(wk + 'T00:00:00').getTime()
  const frac = Math.min(1, Math.max(0, (now.getTime() - startMs) / (7 * 86400000)))
  return Math.round(target * Math.pow(frac, paceExp))
}

/* ---------------- Rank zones: 3 promote, 4 safe, 3 demote ---------------- */
/* The weekly board is 10 racers (you + 9 practice bots; real friends swap bots
 * out one-for-one). Zones are RANK-based, Duolingo-style:
 *   ranks 1-3  -> promoted ⬆️
 *   ranks 4-7  -> safe, stay ➖
 *   ranks 8-10 -> demoted ⬇️ */

export const PROMO_SPOTS = 3
export const SAFE_SPOTS = 4
export const DEMOTE_SPOTS = 3

export type BoardZone = 'promo' | 'stay' | 'danger'

/** Rank-based zone for a 1-based rank. Top 3 promote, bottom 3 demote. */
export function zoneOfRank(rank: number, boardSize = PROMO_SPOTS + SAFE_SPOTS + DEMOTE_SPOTS): BoardZone {
  if (rank <= PROMO_SPOTS) return 'promo'
  if (rank > boardSize - DEMOTE_SPOTS) return 'danger'
  return 'stay'
}

/** A rival's FINAL XP for week `wk` (growth saturates at week end). */
export function finalRivalXp(rival: LeagueRival, league: LeagueName, wk: string): number {
  const endMs = new Date(wk + 'T00:00:00').getTime() + 7 * 86400000
  return rivalXp(rival, league, wk, new Date(endMs))
}

/** Weekly outcome vs the 10-racer practice board (you + strongest 9
 *  bots — the same board a solo player sees all week). Deterministic for
 *  (league, week, xp): rank 1-3 promoted, 4-7 stayed, 8-10 demoted.
 *  (The shared-board production path uses leagueOutcomeByRank instead.) */
export function leagueOutcomeVsBots(
  league: LeagueName,
  weeklyXp: number,
  wk: string,
): 'promoted' | 'demoted' | 'stayed' {
  const botFinals = LEAGUE_RIVALS.slice(0, 9).map((r) => finalRivalXp(r, league, wk))
  const rank = 1 + botFinals.filter((x) => x > weeklyXp).length
  const zone = zoneOfRank(rank, botFinals.length + 1)
  return zone === 'promo' ? 'promoted' : zone === 'danger' ? 'demoted' : 'stayed'
}

/** Gems inside the end-of-lesson chest. Perfect lessons give bigger loot. */
export function lessonChestPrize(isBoss: boolean, mistakes: number, rand: () => number = Math.random): number {
  const base = isBoss ? 15 : 8
  const roll = Math.floor(rand() * 13)
  const perfectBonus = mistakes === 0 ? 10 : 0
  return base + roll + perfectBonus
}

/* ==================== Weighted chest loot system ==================== */
/* Rarity tiers with decreasing probability:
   common (60%) → uncommon (25%) → rare (10%) → epic (4%) → legendary (1%)

   Lower probability = bigger prize. Legendary drops are extremely rare but
   give streak freezes or exclusive wallpapers. */

export type ChestRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'ultimate' | 'hyper'

export interface ChestLoot {
  rarity: ChestRarity
  type: 'gems' | 'streak-saver' | 'double-xp' | 'chest-boost' | 'wallpaper' | 'xp-potion'
  amount?: number
  label: string
  icon: string
}

/** Weighted loot table - weights sum to 100 for easy percentage math */
const LOOT_TABLE: { weight: number; roll: (rand: () => number) => ChestLoot }[] = [
  // ── COMMON (weight 60): small gem amounts ──
  { weight: 35, roll: (r) => ({ rarity: 'common', type: 'gems', amount: 5 + Math.floor(r() * 6), label: `${5 + Math.floor(r() * 6)} gems`, icon: '💎' }) },
  { weight: 25, roll: (r) => ({ rarity: 'common', type: 'gems', amount: 10 + Math.floor(r() * 6), label: `${10 + Math.floor(r() * 6)} gems`, icon: '💎' }) },

  // ── UNCOMMON (weight 25): medium gems or small XP potion ──
  { weight: 15, roll: (r) => ({ rarity: 'uncommon', type: 'gems', amount: 15 + Math.floor(r() * 11), label: `${15 + Math.floor(r() * 11)} gems`, icon: '💎' }) },
  { weight: 10, roll: () => ({ rarity: 'uncommon', type: 'xp-potion', amount: 20, label: '+20 bonus XP', icon: '⚡' }) },

  // ── RARE (weight 10): large gems or double-xp boost item ──
  { weight: 6, roll: (r) => ({ rarity: 'rare', type: 'gems', amount: 30 + Math.floor(r() * 16), label: `${30 + Math.floor(r() * 16)} gems`, icon: '💎💎' }) },
  { weight: 4, roll: () => ({ rarity: 'rare', type: 'double-xp', amount: 3, label: 'Double XP × 3 lessons!', icon: '⚡⚡' }) },

  // ── EPIC (weight 4): chest boost item or big gem pile ──
  { weight: 2, roll: () => ({ rarity: 'epic', type: 'chest-boost', amount: 1, label: 'Chest Boost earned!', icon: '🍀' }) },
  { weight: 1, roll: (r) => ({ rarity: 'epic', type: 'gems', amount: 75 + Math.floor(r() * 26), label: `${75 + Math.floor(r() * 26)} MEGA gems!`, icon: '💎💎💎' }) },
  { weight: 1, roll: () => ({ rarity: 'epic', type: 'xp-potion', amount: 50, label: '+50 bonus XP!', icon: '⚡⚡⚡' }) },

  // ── LEGENDARY (weight 1): ultra-rare streak saver or wallpaper ──
  { weight: 0.7, roll: () => ({ rarity: 'legendary', type: 'streak-saver', amount: 1, label: 'FREE Streak Saver!', icon: '🧊✨' }) },
  { weight: 0.2, roll: () => ({ rarity: 'legendary', type: 'wallpaper', amount: 1, label: 'EXCLUSIVE Wallpaper unlocked!', icon: '🖼️✨' }) },
  { weight: 0.1, roll: (r) => ({ rarity: 'legendary', type: 'gems', amount: 150 + Math.floor(r() * 51), label: `JACKPOT! ${150 + Math.floor(r() * 51)} gems!!`, icon: '🎰💎' }) },
]

const TOTAL_WEIGHT = LOOT_TABLE.reduce((sum, entry) => sum + entry.weight, 0)

export function rollChest(rand: () => number = Math.random): ChestLoot {
  let rollValue = rand() * TOTAL_WEIGHT
  for (const entry of LOOT_TABLE) {
    rollValue -= entry.weight
    if (rollValue <= 0) return entry.roll(rand)
  }
  // Fallback (should never reach here)
  return { rarity: 'common', type: 'gems', amount: 5, label: '5 gems', icon: '💎' }
}

export const RARITY_META: Record<ChestRarity, { color: string; glowColor: string; label: string }> = {
  common: { color: '#94a3b8', glowColor: 'rgba(148, 163, 184, 0.3)', label: 'Common' },
  uncommon: { color: '#22c55e', glowColor: 'rgba(34, 197, 94, 0.35)', label: 'Uncommon!' },
  rare: { color: '#3b82f6', glowColor: 'rgba(59, 130, 246, 0.4)', label: 'RARE!' },
  epic: { color: '#a855f7', glowColor: 'rgba(168, 85, 247, 0.45)', label: 'EPIC!!' },
  legendary: { color: '#f59e0b', glowColor: 'rgba(245, 158, 11, 0.5)', label: '⭐ LEGENDARY!!! ⭐' },
  mythic: { color: '#ec4899', glowColor: 'rgba(236, 72, 153, 0.5)', label: '💖 MYTHIC' },
  ultimate: { color: '#14b8a6', glowColor: 'rgba(20, 184, 166, 0.55)', label: '💎 ULTIMATE' },
  hyper: { color: '#facc15', glowColor: 'rgba(250, 204, 21, 0.6)', label: '🌟 HYPER' },
}

/* ---------------- Daily quests ---------------- */
export interface QuestDef {
  id: string
  label: (goal: number) => string
  goal: number
  reward: number
  progress: (s: QuestSnapshot) => number
}

export interface QuestSnapshot {
  xpToday: number
  lessonsToday: number
  correctToday: number
  /** Distinct subjects finished today (lesson prefixes resolved to Subject). */
  subjectsToday: string[]
  /** Correct answers scored inside Arcade games today (day-rolled). */
  arcadeCorrectToday: number
  /** Flashcard Sprints finished today (day-rolled, WS16). */
  sprintsToday: number
}

export const DAILY_QUESTS: QuestDef[] = [
  {
    id: 'xp20',
    label: (g) => `Earn ${g} XP`,
    goal: 20,
    reward: 10,
    progress: (s) => s.xpToday,
  },
  {
    id: 'lessons2',
    label: () => 'Complete 2 lessons',
    goal: 2,
    reward: 15,
    progress: (s) => s.lessonsToday,
  },
  {
    id: 'correct10',
    label: (g) => `Answer ${g} questions correctly`,
    goal: 10,
    reward: 15,
    progress: (s) => s.correctToday,
  },
  {
    id: 'arcade10',
    label: (g) => `Score ${g} points in the arcade`,
    goal: 10,
    reward: 20,
    progress: (s) => s.arcadeCorrectToday,
  },
  {
    id: 'subjects2',
    label: (g) => `Play ${g} different subjects`,
    goal: 2,
    reward: 20,
    progress: (s) => s.subjectsToday.length,
  },
  {
    id: 'subjects3',
    label: (g) => `Explore ${g} subjects today`,
    goal: 3,
    reward: 30,
    progress: (s) => s.subjectsToday.length,
  },
  {
    id: 'sprint1',
    label: () => 'Play a Flashcard Sprint',
    goal: 1,
    reward: 15,
    progress: (s) => s.sprintsToday,
  },
]

/* ---------------- Arcade game defs ---------------- */
export interface ArcadeGameDef {
  id: string
  title: string
  desc: string
  icon: string
  /** which subject this game exercises (shows a badge on the arcade list) */
  subject: 'math' | 'english' | 'science'
}

export const ARCADE_GAMES: ArcadeGameDef[] = [
  { id: 'boss-rush', title: 'Boss Rush', desc: 'Take down pixel bosses with perfect answers', icon: '⚔️', subject: 'math' },
  { id: 'word-rescue', title: 'Word Rescue', desc: 'Pick the right spelling before time runs out', icon: '📚', subject: 'english' },
  { id: 'lab-blitz', title: 'Lab Blitz', desc: 'Answer fast science questions to power the lab', icon: '🔬', subject: 'science' },
  { id: 'pixel-run', title: 'Pixel Run', desc: 'Jump the spikes and clear math gates to the finish', icon: '🏃', subject: 'math' },
]

/** Alias for arcade.ts compatibility (docs lineage shows the full DAILY_QUESTS list). */
export function rollQuestSet(_day: string): QuestDef[] {
  return DAILY_QUESTS
}

/* ---------------- Achievements ---------------- */
export interface AchievementDef {
  id: string
  title: string
  desc: string
  icon: string
  test: (s: AchievementSnapshot) => boolean
}

export interface AchievementSnapshot {
  xpTotal: number
  streakCurrent: number
  lessonsCompleted: number
  crowns: number
  /** Distinct subjects ever finished (from lessonProgress ids). */
  subjectCount: number
  /** Card album size (owned count) — for album achievements. */
  cardsOwned: number
  /** Number of arcade games with a personal best (>0). */
  arcadeBests: number
  /** Highest arcade personal best score. */
  arcadeTop: number
  /** Lifetime Flashcard Sprints finished (WS16). */
  sprintRuns: number
}

/**
 * What the streak UI should show RIGHT NOW, given the player's state.
 *   - If the player has already completed a lesson today, show `streakCurrent`.
 *   - Otherwise (new day, no lesson yet), show 0 so the indicator doesn't
 *     carry yesterday's count over until the next `completeLesson`.
 *
 * Pure display helper. The underlying `streakCurrent` is only mutated by
 * `updateStreak` (called from `completeLesson`).
 */
export function displayStreak(
  s: { streakCurrent: number; lastActiveDay: string | null },
  today: string = todayISO(),
): number {
  return s.lastActiveDay === today ? s.streakCurrent : 0
}

/** True when the streak indicator should "light up" (a lesson was completed
 *  today). Use this to switch the UI between active/greyed states. */
export function isStreakActive(
  s: { lastActiveDay: string | null },
  today: string = todayISO(),
): boolean {
  return s.lastActiveDay === today
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-lesson', title: 'First Win!', desc: 'Finish your first lesson', icon: '🎉', test: (s) => s.lessonsCompleted >= 1 },
  { id: 'streak-3', title: 'On Fire', desc: 'Keep a 3-day streak', icon: '🔥', test: (s) => s.streakCurrent >= 3 },
  { id: 'streak-7', title: 'Week Warrior', desc: 'Keep a 7-day streak', icon: '⚡', test: (s) => s.streakCurrent >= 7 },
  { id: 'xp-250', title: 'XP Collector', desc: 'Earn 250 XP total', icon: '🌟', test: (s) => s.xpTotal >= 250 },
  { id: 'lessons-10', title: 'Marathon Mind', desc: 'Complete 10 lessons', icon: '🏃', test: (s) => s.lessonsCompleted >= 10 },
  { id: 'crowns-5', title: 'Crown Club', desc: 'Win 5 crown levels', icon: '👑', test: (s) => s.crowns >= 5 },
  { id: 'subjects-3', title: 'World Explorer', desc: 'Finish lessons in 3 subjects', icon: '🌍', test: (s) => s.subjectCount >= 3 },
  { id: 'subjects-5', title: 'Curriculum Tourist', desc: 'Finish lessons in 5 subjects', icon: '🧭', test: (s) => s.subjectCount >= 5 },
  { id: 'cards-10', title: 'Album Starter', desc: 'Collect 10 cards', icon: '🃏', test: (s) => s.cardsOwned >= 10 },
  { id: 'cards-40', title: 'Album Keeper', desc: 'Collect 40 cards', icon: '📚', test: (s) => s.cardsOwned >= 40 },
  { id: 'arcade-debut', title: 'Arcade Debut', desc: 'Set a score in any arcade game', icon: '🕹️', test: (s) => s.arcadeBests >= 1 },
  { id: 'arcade-3', title: 'Arcade Ace', desc: 'Set scores in 3 arcade games', icon: '🏆', test: (s) => s.arcadeBests >= 3 },
  { id: 'arcade-100', title: 'High Scorer', desc: 'Score 100+ in an arcade game', icon: '🌟', test: (s) => s.arcadeTop >= 100 },
  { id: 'sprint-debut', title: 'Word Sprinter', desc: 'Finish a Flashcard Sprint', icon: '💨', test: (s) => s.sprintRuns >= 1 },
]
