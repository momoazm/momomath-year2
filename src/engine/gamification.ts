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
  { id: 'zara', name: 'Zara', icon: '🦊', drive: 1.45 },
  { id: 'max', name: 'Max', icon: '🐯', drive: 1.2 },
  { id: 'layla', name: 'Layla', icon: '🐰', drive: 1.05 },
  { id: 'omar', name: 'Omar', icon: '🐻', drive: 0.9 },
  { id: 'sara', name: 'Sara', icon: '🐨', drive: 0.75 },
  { id: 'yusuf', name: 'Yusuf', icon: '🦁', drive: 0.6 },
  { id: 'mia', name: 'Mia', icon: '🐼', drive: 0.5 },
  { id: 'ali', name: 'Ali', icon: '🐸', drive: 0.38 },
  { id: 'nora', name: 'Nora', icon: '🐧', drive: 0.28 },
  { id: 'adam', name: 'Adam', icon: '🐷', drive: 0.18 },
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
  const jitter = 0.75 + rand() * 0.5 // some weeks a rival over/under-performs
  const paceExp = 0.7 + rand() * 0.9 // sprinters front-load, grinders finish strong
  const target = LEAGUE_GOALS[league] * Math.min(rival.drive * jitter, 1.7)

  const startMs = new Date(wk + 'T00:00:00').getTime()
  const frac = Math.min(1, Math.max(0, (now.getTime() - startMs) / (7 * 86400000)))
  return Math.round(target * Math.pow(frac, paceExp))
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

export type ChestRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

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
  bossesToday: number
  arcadeCorrectToday: number
}

/** Rotating pool — questsForDay picks 3 for a given day. */
export const DAILY_QUESTS: QuestDef[] = [
  { id: 'xp20', label: (g) => `Earn ${g} XP`, goal: 20, reward: 10, progress: (s) => s.xpToday },
  { id: 'lessons2', label: () => 'Complete 2 lessons', goal: 2, reward: 15, progress: (s) => s.lessonsToday },
  { id: 'correct10', label: (g) => `Answer ${g} questions correctly`, goal: 10, reward: 15, progress: (s) => s.correctToday },
  { id: 'xp50', label: (g) => `Earn ${g} XP`, goal: 50, reward: 20, progress: (s) => s.xpToday },
  { id: 'lessons5', label: () => 'Complete 5 lessons', goal: 5, reward: 25, progress: (s) => s.lessonsToday },
  { id: 'correct25', label: (g) => `Answer ${g} questions correctly`, goal: 25, reward: 25, progress: (s) => s.correctToday },
  { id: 'boss1', label: () => 'Clear 1 boss level', goal: 1, reward: 30, progress: (s) => s.bossesToday },
  { id: 'arcade10', label: (g) => `Score ${g} points in the arcade`, goal: 10, reward: 20, progress: (s) => s.arcadeCorrectToday },
  { id: 'xp100', label: (g) => `Earn ${g} XP`, goal: 100, reward: 40, progress: (s) => s.xpToday },
]

/** Deterministic pick of 3 quests for a given calendar day. */
function seededIndex(seed: number, len: number): number {
  return Math.abs(Math.imul(seed, 2654435761) >>> 0) % len
}

export function questsForDay(day: string): QuestDef[] {
  let hash = 2166136261
  for (let i = 0; i < day.length; i++) {
    hash ^= day.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  const picks: number[] = []
  let h = hash >>> 0
  while (picks.length < Math.min(3, DAILY_QUESTS.length)) {
    const idx = seededIndex(h, DAILY_QUESTS.length)
    if (!picks.includes(idx)) picks.push(idx)
    h = (h + 0x9e3779b9) >>> 0
  }
  return picks.map((i) => DAILY_QUESTS[i])
}

/** Alias for arcade.ts compatibility. */
export function rollQuestSet(day: string): QuestDef[] {
  return questsForDay(day)
}

/** 7-day login calendar rewards (gems), indexed by (streak - 1) % 7. */
export const LOGIN_REWARDS = [5, 10, 15, 20, 25, 30, 50]

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
  streakLongest: number
  lessonsCompleted: number
  crowns: number
  crownsAll: number
  crownsTotal: number
  bestAccuracy: number
  unitsTouched: number
  cardsOwned: number
  cardsFiveStar: number
  cardDust: number
  gems: number
  perfectToday: boolean
  league: string
  leagueWeeks: number
  arcadeBests: number
  arcadeTop: number
  subjectsPlayed: number
  dailyLoginStreak: number
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
  { id: 'streak-14', title: 'Unstoppable', desc: 'Keep a 14-day streak', icon: '🌋', test: (s) => s.streakCurrent >= 14 },
  { id: 'streak-30', title: 'Monthly Master', desc: 'Keep a 30-day streak', icon: '🏆', test: (s) => s.streakCurrent >= 30 },
  { id: 'streak-longest-21', title: 'Iron Will', desc: 'Reach a 21-day best streak', icon: '🛡️', test: (s) => s.streakLongest >= 21 },
  { id: 'xp-250', title: 'XP Collector', desc: 'Earn 250 XP total', icon: '🌟', test: (s) => s.xpTotal >= 250 },
  { id: 'xp-1000', title: 'XP Machine', desc: 'Earn 1,000 XP total', icon: '💫', test: (s) => s.xpTotal >= 1000 },
  { id: 'xp-5000', title: 'XP Legend', desc: 'Earn 5,000 XP total', icon: '🌈', test: (s) => s.xpTotal >= 5000 },
  { id: 'lessons-10', title: 'Marathon Mind', desc: 'Complete 10 lessons', icon: '🏃', test: (s) => s.lessonsCompleted >= 10 },
  { id: 'lessons-50', title: 'Learning Machine', desc: 'Complete 50 lessons', icon: '🤖', test: (s) => s.lessonsCompleted >= 50 },
  { id: 'lessons-100', title: 'Century Club', desc: 'Complete 100 lessons', icon: '💯', test: (s) => s.lessonsCompleted >= 100 },
  { id: 'crowns-5', title: 'Crown Club', desc: 'Win 5 crown levels', icon: '👑', test: (s) => s.crowns >= 5 },
  { id: 'crowns-25', title: 'Crown Royalty', desc: 'Collect 25 crowns', icon: '🤴', test: (s) => s.crowns >= 25 },
  { id: 'crowns-75', title: 'Crown Empire', desc: 'Collect 75 crowns', icon: '🏰', test: (s) => s.crowns >= 75 },
  { id: 'lessons-touched-10', title: 'Explorer', desc: 'Try 10 different lessons', icon: '🧭', test: (s) => s.crownsTotal >= 10 },
  { id: 'units-3', title: 'Well Rounded', desc: 'Play lessons in 3 units', icon: '🎨', test: (s) => s.unitsTouched >= 3 },
  { id: 'units-5', title: 'Topic Traveler', desc: 'Play lessons in 5 units', icon: '✈️', test: (s) => s.unitsTouched >= 5 },
  { id: 'accuracy-90', title: 'Eagle Eye', desc: 'Score 90%+ best accuracy', icon: '🦅', test: (s) => s.bestAccuracy >= 90 },
  { id: 'accuracy-100', title: 'Sharpshooter', desc: 'Score 100% in a lesson', icon: '🎯', test: (s) => s.bestAccuracy >= 100 },
  { id: 'cards-5', title: 'Collector', desc: 'Own 5 character cards', icon: '🃏', test: (s) => s.cardsOwned >= 5 },
  { id: 'cards-10', title: 'Card Master', desc: 'Own 10 character cards', icon: '🎴', test: (s) => s.cardsOwned >= 10 },
  { id: 'cards-5star-1', title: 'First 5-Star', desc: 'Max a card to 5 stars', icon: '⭐', test: (s) => s.cardsFiveStar >= 1 },
  { id: 'cards-5star-3', title: 'Star Crusher', desc: 'Max 3 cards to 5 stars', icon: '🌟', test: (s) => s.cardsFiveStar >= 3 },
  { id: 'gems-500', title: 'Gem Hoarder', desc: 'Hold 500 gems at once', icon: '💎', test: (s) => s.gems >= 500 },
  { id: 'dust-100', title: 'Dust Grinder', desc: 'Hold 100 dust at once', icon: '🌪️', test: (s) => s.cardDust >= 100 },
  { id: 'league-gold', title: 'Gold League', desc: 'Reach the Gold league', icon: '🥇', test: (s) => LEAGUES.indexOf(s.league as LeagueName) >= LEAGUES.indexOf('Gold') },
  { id: 'league-sapphire', title: 'Sapphire League', desc: 'Reach the Sapphire league', icon: '🔹', test: (s) => LEAGUES.indexOf(s.league as LeagueName) >= LEAGUES.indexOf('Sapphire') },
  { id: 'league-diamond', title: 'Diamond League', desc: 'Reach the Diamond league', icon: '💎', test: (s) => LEAGUES.indexOf(s.league as LeagueName) >= LEAGUES.indexOf('Diamond') },
  { id: 'league-weeks-4', title: 'League Veteran', desc: 'Finish 4 league weeks', icon: '📅', test: (s) => s.leagueWeeks >= 4 },
  { id: 'arcade-debut', title: 'Arcade Debut', desc: 'Set a score in any arcade game', icon: '🕹️', test: (s) => s.arcadeBests >= 1 },
  { id: 'arcade-3', title: 'Arcade Ace', desc: 'Set scores in 3 arcade games', icon: '👾', test: (s) => s.arcadeBests >= 3 },
  { id: 'arcade-100', title: 'High Scorer', desc: 'Score 100+ in an arcade game', icon: '🚀', test: (s) => s.arcadeTop >= 100 },
  { id: 'subjects-3', title: 'Triple Threat', desc: 'Play all 3 subjects', icon: '🎓', test: (s) => s.subjectsPlayed >= 3 },
  { id: 'login-7', title: 'Loyal Player', desc: 'Claim 7 login rewards in a row', icon: '🎁', test: (s) => s.dailyLoginStreak >= 7 },
]
