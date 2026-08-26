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

/** local-date "YYYY-MM-DD" (never uses UTC, so +04:00-style timezones stay correct) */
function localISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

/** Monday-based ISO week key, e.g. "2026-08-17" */
export function weekKey(d = new Date()): string {
  const date = new Date(d)
  const day = (date.getDay() + 6) % 7 // Mon=0..Sun=6
  date.setDate(date.getDate() - day)
  return localISO(date)
}

export function nextWeekKey(k: string): string {
  const d = new Date(k + 'T00:00:00')
  d.setDate(d.getDate() + 7)
  return localISO(d)
}

export function todayISO(): string {
  return localISO(new Date())
}

export function yesterdayISO(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return localISO(d)
}

export function advanceLeague(current: LeagueName, outcome: 'promoted' | 'demoted' | 'stayed'): LeagueName {
  const idx = LEAGUES.indexOf(current)
  if (outcome === 'promoted') return LEAGUES[Math.min(idx + 1, LEAGUES.length - 1)]
  if (outcome === 'demoted') return LEAGUES[Math.max(idx - 1, 0)]
  return current
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
  // ── COMMON (weight 55): small gem amounts ──
  { weight: 30, roll: (r) => ({ rarity: 'common', type: 'gems', amount: 5 + Math.floor(r() * 6), label: `${5 + Math.floor(r() * 6)} gems`, icon: '💎' }) },
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
  lessonsCompleted: number
  crowns: number
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-lesson', title: 'First Win!', desc: 'Finish your first lesson', icon: '🎉', test: (s) => s.lessonsCompleted >= 1 },
  { id: 'streak-3', title: 'On Fire', desc: 'Keep a 3-day streak', icon: '🔥', test: (s) => s.streakCurrent >= 3 },
  { id: 'streak-7', title: 'Week Warrior', desc: 'Keep a 7-day streak', icon: '⚡', test: (s) => s.streakCurrent >= 7 },
  { id: 'xp-250', title: 'XP Collector', desc: 'Earn 250 XP total', icon: '🌟', test: (s) => s.xpTotal >= 250 },
  { id: 'lessons-10', title: 'Marathon Mind', desc: 'Complete 10 lessons', icon: '🏃', test: (s) => s.lessonsCompleted >= 10 },
  { id: 'crowns-5', title: 'Crown Club', desc: 'Win 5 crown levels', icon: '👑', test: (s) => s.crowns >= 5 },
]
