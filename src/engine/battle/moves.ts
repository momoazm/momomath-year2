/**
 * WS17 — Battle moves (PURE, additive). Every card has exactly 3 moves
 * (PLAN.md §13.2): Quick fires automatically every normal turn; Special is
 * powered by a correct Power-turn question; Ultimate fires when the
 * Team-Blast meter (3 correct answers) is full. Kit grows with stars:
 * Quick 0★, Special 1★, Ultimate 3★, and 5★ "Mastered" adds +15% power to
 * every move — upgrading a card visibly upgrades its kit.
 */
import type { Archetype } from './archetypes'

export type MoveKind = 'quick' | 'special' | 'ultimate'

export interface BattleMove {
  kind: MoveKind
  name: string
  /** base power multiplier on the card's atk */
  power: number
  /** star level needed to use it */
  unlockStar: number
}

/** Star level at which each move unlocks (PLAN.md §13.2). */
export const MOVE_UNLOCK_STAR: Record<MoveKind, number> = {
  quick: 0,
  special: 1,
  ultimate: 3,
}

/** Base power per move kind (damage = atk × power × typeMult × variance). */
export const MOVE_POWER: Record<MoveKind, number> = {
  quick: 1.0,
  special: 1.6,
  ultimate: 2.4,
}

/** 5★ "Mastered" bonus applied to every move's power. */
export const MASTER_STAR = 5
export const MASTER_POWER_BONUS = 0.15

/** Team-Blast meter: N correct Power-turn answers charge the Ultimate. */
export const TEAM_BLAST_CHARGE = 3

/** A 0★ card (no Special yet) still benefits from correct answers: its
 *  Quick fires "charged" at this multiplier, so Power turns always matter. */
export const CHARGED_QUICK_MULT = 1.5

const DEFAULT_NAMES: Record<MoveKind, string> = {
  quick: 'Quick Strike',
  special: 'Special Move',
  ultimate: 'Ultimate Blast',
}

/** Signature move names for marquee characters (flavor only, same numbers). */
const SIGNATURE_NAMES: Partial<Record<string, Record<MoveKind, string>>> = {
  sonic: { quick: 'Jab', special: 'Spin Dash', ultimate: 'Homing Attack' },
  shadow: { quick: 'Chaos Tap', special: 'Chaos Blast', ultimate: 'Chaos Spear' },
  knuckles: { quick: 'Jab', special: 'Straight Punch', ultimate: 'Meteor Punch' },
  eggman: { quick: 'Nut Zap', special: 'Egg Mobile Ram', ultimate: 'Death Egg Ray' },
  metal: { quick: 'V. Maximum Overdrive', special: 'Breath Attack', ultimate: 'Neo Metal Rush' },
  silver: { quick: 'Psychic Fling', special: 'Psycho Blast', ultimate: 'Psychic Smash' },
  blaze: { quick: 'Fire Kick', special: 'Fire Boost', ultimate: 'Burst Flare' },
  tails: { quick: 'Tail Swipe', special: 'Spin Dash', ultimate: 'Tornado Toss' },
}

/** Effective power of a move kind at a star level (5★ mastered bonus). */
export function movePower(kind: MoveKind, star: number): number {
  const base = MOVE_POWER[kind]
  return star >= MASTER_STAR ? base * (1 + MASTER_POWER_BONUS) : base
}

/** The full 3-move kit for a card (locked moves included, with unlockStar). */
export function movesFor(cardId: string): BattleMove[] {
  const names = SIGNATURE_NAMES[cardId]
  return (['quick', 'special', 'ultimate'] as MoveKind[]).map((kind) => ({
    kind,
    name: names?.[kind] ?? DEFAULT_NAMES[kind],
    power: MOVE_POWER[kind],
    unlockStar: MOVE_UNLOCK_STAR[kind],
  }))
}

/** Moves a card can actually USE at its star level (ascending power). */
export function unlockedMoves(star: number): BattleMove[] {
  const s = Math.max(0, Math.round(star || 0))
  return movesFor('_').filter((m) => s >= m.unlockStar)
}

/** True when this archetype's card has its Special at this star. */
export function hasSpecial(star: number): boolean {
  return star >= MOVE_UNLOCK_STAR.special
}

export function hasUltimate(star: number): boolean {
  return star >= MOVE_UNLOCK_STAR.ultimate
}

/** Archetype label helper kept here so duel UI can show "🌀 Speed Special". */
export type { Archetype }
