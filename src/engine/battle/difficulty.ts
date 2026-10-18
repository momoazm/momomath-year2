/**
 * WS26 — Momo Battle difficulty tiers (PURE, additive; user directive
 * 2026-10-18: "difficulty level for each lesson … from easy to impossible …
 * opponent hit harder and has larger health").
 *
 * Chosen per gym on the squad-picker; scales the RIVAL only:
 *   hp × hpMul, atk × atkMul (def untouched) + per-turn answer accuracy.
 *
 * `medium` is the IDENTITY tier (×1 / ×1 / 0.6 accuracy — the exact numbers
 * the battle shipped with), so the default experience is numerically the
 * same and every harder/easier tier is a deliberate opt-in (R0-safe).
 */
export type BattleDifficulty = 'easy' | 'medium' | 'hard' | 'impossible'

export interface BattleDifficultyDef {
  key: BattleDifficulty
  label: string
  emoji: string
  /** kid-facing one-liner for the picker */
  tagline: string
  /** rival HP multiplier (1 = the shipped balance) */
  hpMul: number
  /** rival ATK multiplier (1 = the shipped balance) */
  atkMul: number
  /** chance the rival answers its per-turn question correctly */
  accuracy: number
}

export const BATTLE_DIFFICULTIES: readonly BattleDifficultyDef[] = [
  {
    key: 'easy',
    label: 'Easy',
    emoji: '🌱',
    tagline: 'A gentle scrap — the rival tires fast and misses a lot.',
    hpMul: 0.7,
    atkMul: 0.7,
    accuracy: 0.4,
  },
  {
    key: 'medium',
    label: 'Medium',
    emoji: '⚔️',
    tagline: 'The classic fight — exactly how the gyms have always played.',
    hpMul: 1,
    atkMul: 1,
    accuracy: 0.6,
  },
  {
    key: 'hard',
    label: 'Hard',
    emoji: '🔥',
    tagline: 'Tougher rival: more health, harder hits, sharper answers.',
    hpMul: 1.4,
    atkMul: 1.35,
    accuracy: 0.75,
  },
  {
    key: 'impossible',
    label: 'Impossible',
    emoji: '💀',
    tagline: 'Huge health, brutal hits — the rival almost never misses!',
    hpMul: 1.9,
    atkMul: 1.75,
    accuracy: 0.9,
  },
] as const

export const DEFAULT_BATTLE_DIFFICULTY: BattleDifficulty = 'medium'

const BY_KEY: Record<BattleDifficulty, BattleDifficultyDef> = Object.fromEntries(
  BATTLE_DIFFICULTIES.map((d) => [d.key, d]),
) as Record<BattleDifficulty, BattleDifficultyDef>

/** Tier def for a key; unknown/absent values fall back to the default tier. */
export function battleDifficultyDef(
  key: BattleDifficulty | string | undefined,
): BattleDifficultyDef {
  return BY_KEY[key as BattleDifficulty] ?? BY_KEY[DEFAULT_BATTLE_DIFFICULTY]
}

/** Type guard for stored/untrusted values. */
export function isBattleDifficulty(v: unknown): v is BattleDifficulty {
  return typeof v === 'string' && Object.prototype.hasOwnProperty.call(BY_KEY, v)
}
