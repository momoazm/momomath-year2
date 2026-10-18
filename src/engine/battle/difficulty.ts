/**
 * WS26/WS27 — Momo Battle difficulty tiers (PURE, additive; user directive
 * 2026-10-18: "difficulty level for each lesson … from easy to impossible …
 * opponent hit harder and has larger health", amended same day: "adjust the
 * health and strength and special abilities so games are not that easy so in
 * harder level the player must have a high level of the card to be able to
 * win").
 *
 * Chosen per gym on the squad-picker; scales the RIVAL only:
 *   hp × hpMul, atk × atkMul (def untouched) + per-turn answer accuracy +
 *   specialMul on the rival's Special/Ultimate damage only (WS27 "special
 *   abilities" knob: 1 = off).
 *
 * WS27 balance pass: the whole ladder was pushed up so fights are not
 * trivial and harder tiers genuinely demand stronger cards —
 *   Easy       ≈ starter commons (0★) still win with steady answers
 *   Medium     ≈ upgraded commons / rare-2★ cards (the default tier)
 *   Hard       ≈ rare-3★ / epic-4★ cards with a healthy card level
 *   Impossible ≈ legendary-5★ Lv8~10 squads, near-perfect answers
 * Exact win-rate targets are locked in tests/battle/balance.test.ts — rerun
 * that file (it prints the full table) before touching these numbers.
 */
export type BattleDifficulty = 'easy' | 'medium' | 'hard' | 'impossible'

export interface BattleDifficultyDef {
  key: BattleDifficulty
  label: string
  emoji: string
  /** kid-facing one-liner for the picker */
  tagline: string
  /** rival HP multiplier (1 = the pre-WS27 shipped balance) */
  hpMul: number
  /** rival ATK multiplier (1 = the pre-WS27 shipped balance) */
  atkMul: number
  /** chance the rival answers its per-turn question correctly */
  accuracy: number
  /** extra multiplier on the rival's SPECIAL/ULTIMATE damage only (1 = off) */
  specialMul: number
}

export const BATTLE_DIFFICULTIES: readonly BattleDifficultyDef[] = [
  {
    key: 'easy',
    label: 'Easy',
    emoji: '🌱',
    tagline: 'A gentle warm-up — the rival tires fast and fumbles a lot.',
    hpMul: 0.6,
    atkMul: 0.6,
    accuracy: 0.35,
    specialMul: 1,
  },
  {
    key: 'medium',
    label: 'Medium',
    emoji: '⚔️',
    tagline: 'A real fight — the classic gym challenge. Upgrade cards if you lose.',
    hpMul: 1.15,
    atkMul: 1.1,
    accuracy: 0.62,
    specialMul: 1.05,
  },
  {
    key: 'hard',
    label: 'Hard',
    emoji: '🔥',
    tagline: 'Tough rival — bring high-star, upgraded cards or it flattens you!',
    hpMul: 1.85,
    atkMul: 1.5,
    accuracy: 0.75,
    specialMul: 1.2,
  },
  {
    key: 'impossible',
    label: 'Impossible',
    emoji: '💀',
    tagline: 'Only maxed-out cards survive — the rival hits like a truck!',
    hpMul: 2.7,
    atkMul: 1.9,
    accuracy: 0.88,
    specialMul: 1.35,
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

/**
 * WS27 — the tier handicap TAPERS at late gyms. There the BASE rival is
 * already elite (the champion squad ≈ a maxed exclusive-tier squad), so a
 * full extra multiplier would make Hard/Impossible literally unwinnable —
 * dead content. Early/mid gyms keep the full ladder (taper 1); beyond that
 * only the ABOVE-1 part of a multiplier is compressed toward 1.
 * Sub-1 handicaps (Easy) are never tapered — Easy must stay easy.
 */
export const GYM_DIFFICULTY_TAPER: readonly { maxGym: number; taper: number }[] = [
  { maxGym: 4, taper: 1 },
  { maxGym: 8, taper: 1 },
  { maxGym: 12, taper: 0.65 },
  { maxGym: Number.POSITIVE_INFINITY, taper: 0.15 },
] as const

/** Compression factor for a gym (1 = the tier numbers apply as written). */
export function gymDifficultyTaper(gym: number): number {
  for (const band of GYM_DIFFICULTY_TAPER) if (gym <= band.maxGym) return band.taper
  return 1
}

/** The tier actually applied at a gym: hp/atk/special extras compressed by
 *  the gym taper above; accuracy stays tier-only (it never stacks with the
 *  gym's base stats). `medium` stays the default experience at early gyms. */
export function effectiveBattleDifficulty(
  key: BattleDifficulty | string | undefined,
  gym: number,
): BattleDifficultyDef {
  const def = battleDifficultyDef(key)
  const k = gymDifficultyTaper(gym)
  if (k >= 1) return def
  const compress = (mul: number): number => (mul <= 1 ? mul : 1 + (mul - 1) * k)
  return {
    ...def,
    hpMul: compress(def.hpMul),
    atkMul: compress(def.atkMul),
    specialMul: compress(def.specialMul),
  }
}
