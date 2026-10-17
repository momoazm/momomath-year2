/**
 * WS17 — Momo Battle stats (PURE, additive). Two growth layers per PLAN.md
 * §13.2: a star-derived base (tier base × star multiplier via the existing
 * toStar(cardStars[...])) ON TOP of battle levels 1-10 (~+2%/level from the
 * local-only cardBattleXp). Never reads/writes the store — screens compose
 * cardStars + cardBattleXp into these functions.
 */
import type { ChestTier } from '../cards'
import { toStar } from '../cards'

export interface BattleStats {
  hp: number
  atk: number
  def: number
}

/** Tier base stats at star 0 / battle level 1. Strictly increasing per tier
 *  so rarity always matters (locked monotonicity test in tests/battle). */
export const TIER_BASE: Record<ChestTier, BattleStats> = {
  common: { hp: 40, atk: 8, def: 2 },
  rare: { hp: 54, atk: 11, def: 3 },
  epic: { hp: 70, atk: 14, def: 5 },
  legendary: { hp: 90, atk: 18, def: 6 },
  exclusive: { hp: 112, atk: 22, def: 8 },
}

/** Star multipliers: hp/atk +25% per star (5★ = ×2.25), def +20% per star. */
export const STAR_MULT = { hp: 0.25, atk: 0.25, def: 0.2 } as const

/** Battle levels run 1..10, each ≈ +2% on the star base (cap ≈ +18~20%). */
export const MAX_BATTLE_LEVEL = 10
export const BATTLE_LEVEL_STEP = 0.02

/** Cumulative battle-XP needed to REACH level 1..10 (level 1 = 0 XP).
 *  Gentle curve: ~18 wins from scratch, losses still inch you forward. */
export const BATTLE_LEVEL_XP: readonly number[] = [
  0, 10, 25, 45, 70, 100, 135, 175, 220, 270,
] as const

/** Battle XP awarded to every participating card (local-only cardBattleXp). */
export const BATTLE_XP_WIN = 15
export const BATTLE_XP_LOSS = 5
/** Daily Rival rematch pays double battle XP (gems handled by roadmap). */
export const BATTLE_XP_DAILY_RIVAL = 30

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n))

const r2 = (n: number) => Math.round(n * 100) / 100

/** Battle level 1..MAX_BATTLE_LEVEL for a battle-XP total (monotone, clamped). */
export function battleLevelForXp(xp: number): number {
  const x = Math.max(0, Number(xp) || 0)
  let level = 1
  for (let i = 1; i < BATTLE_LEVEL_XP.length; i++) {
    if (x >= BATTLE_LEVEL_XP[i]!) level = i + 1
  }
  return level
}

/** Battle-XP floor for a level (clamped 1..10). */
export function battleXpForLevel(level: number): number {
  const lvl = clamp(Math.round(level), 1, MAX_BATTLE_LEVEL)
  return BATTLE_LEVEL_XP[lvl - 1]!
}

/**
 * Derived battle stats for (tier, star, battle level).
 * Floats rounded to 2 decimals so display can round again without breaking
 * strict monotonicity (integer rounding would collapse +2% steps on commons).
 */
export function deriveStats(tier: ChestTier, star: number, battleLevel = 1): BattleStats {
  const base = TIER_BASE[tier] ?? TIER_BASE.common
  const s = clamp(Math.round(star), 0, 5)
  const lvl = clamp(Math.round(battleLevel), 1, MAX_BATTLE_LEVEL)
  const starHpAtk = 1 + STAR_MULT.hp * s
  const starDef = 1 + STAR_MULT.def * s
  const lvlMult = 1 + BATTLE_LEVEL_STEP * (lvl - 1)
  return {
    hp: r2(base.hp * starHpAtk * lvlMult),
    atk: r2(base.atk * starHpAtk * lvlMult),
    def: r2(base.def * starDef * lvlMult),
  }
}

/** Convenience for screens/tests: everything about one owned card's battle
 *  stats from its two save fields (star count + battle XP). Pure. */
export function ownedCardStats(
  tier: ChestTier,
  starCount: number,
  battleXp: number,
): BattleStats & { star: number; level: number } {
  const level = battleLevelForXp(battleXp)
  const star = toStar(Math.max(0, Math.round(starCount || 0)))
  return { star, level, ...deriveStats(tier, star, level) }
}
