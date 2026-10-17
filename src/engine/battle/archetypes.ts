/**
 * WS17 — Battle archetypes (PURE, additive). Every roster card maps to one
 * of six kid-readable archetypes with a single-ring effectiveness cycle
 * (each beats exactly one, loses to exactly one, neutral vs four):
 *
 *   Speed → Power → Tech → Flight → Trickster → Chaos → Speed
 *
 * super-effective = ×1.25, not-very = ×0.8, else ×1. Complementary pairs:
 * if A→B is 1.25 then B→A is exactly 0.8 (symmetry test in tests/battle).
 */
import { ALL_CARDS } from '../cards'

export type Archetype = 'speed' | 'power' | 'tech' | 'flight' | 'trickster' | 'chaos'

export const ARCHETYPES: Archetype[] = ['speed', 'power', 'tech', 'flight', 'trickster', 'chaos']

export const ARCHETYPE_META: Record<Archetype, { icon: string; label: string }> = {
  speed: { icon: '🌀', label: 'Speed' },
  power: { icon: '💪', label: 'Power' },
  tech: { icon: '🤖', label: 'Tech' },
  flight: { icon: '🪽', label: 'Flight' },
  trickster: { icon: '🎭', label: 'Trickster' },
  chaos: { icon: '🔮', label: 'Chaos' },
}

/** The effectiveness ring: index i beats index i+1 (wraps). */
export const BEATS_RING: Record<Archetype, Archetype> = {
  speed: 'power',
  power: 'tech',
  tech: 'flight',
  flight: 'trickster',
  trickster: 'chaos',
  chaos: 'speed',
}

export const TYPE_MULT_SUPER = 1.25
export const TYPE_MULT_RESIST = 0.8
export const TYPE_MULT_NEUTRAL = 1

/** atk archetype vs def archetype damage multiplier. */
export function typeMult(atk: Archetype, def: Archetype): number {
  if (BEATS_RING[atk] === def) return TYPE_MULT_SUPER
  if (BEATS_RING[def] === atk) return TYPE_MULT_RESIST
  return TYPE_MULT_NEUTRAL
}

/** 'super' | 'weak' | 'neutral' — for the duel UI labels. */
export function typeEffect(atk: Archetype, def: Archetype): 'super' | 'weak' | 'neutral' {
  const m = typeMult(atk, def)
  return m > 1 ? 'super' : m < 1 ? 'weak' : 'neutral'
}

/**
 * Static per-card archetype table (PLAN.md §13.2). Covers ALL 103 roster
 * cards incl. the +3 battle exclusives (added to cards.ts in WS23).
 * Missing id ⇒ test failure — no fallback on purpose.
 */
export const CARD_ARCHETYPE: Record<string, Archetype> = {
  // ---- Common (39) ----
  tails: 'tech', amy: 'power', cream: 'flight', charmy: 'flight', big: 'power',
  'movie-tails': 'tech', cheese: 'flight', vanilla: 'trickster', froggy: 'trickster',
  omochao: 'tech', marine: 'power', sticks: 'trickster', tangle: 'power',
  jewel: 'trickster', trip: 'tech', 'movie-stone': 'power', 'classic-tails': 'tech',
  'classic-knuckles': 'power', 'classic-amy': 'power', 'classic-eggman': 'tech',
  'boom-sonic': 'speed', 'boom-tails': 'tech', 'boom-knuckles': 'power',
  'boom-amy': 'power', 'boom-eggman': 'tech', orbot: 'tech', cubot: 'tech',
  'egg-robo': 'tech', motobug: 'tech', crabmeat: 'tech', 'buzz-bomber': 'tech',
  chopper: 'tech', 'egg-pawn': 'tech', zazz: 'speed', zomom: 'power', zor: 'trickster',
  zeena: 'trickster', 'master-zik': 'power', maria: 'chaos',
  // ---- Rare (25) ----
  knuckles: 'power', blaze: 'speed', rouge: 'trickster', ray: 'flight', vector: 'power',
  'classic-sonic': 'speed', 'werehog-sonic': 'power', 'movie-knuckles': 'power',
  wave: 'tech', storm: 'flight', mighty: 'power', faker: 'trickster',
  'metal-knuckles': 'tech', 'tails-doll': 'tech', tikal: 'chaos', whisper: 'tech',
  surge: 'speed', kit: 'chaos', sally: 'power', 'movie-amy': 'power',
  'movie-eggman': 'tech', gamma: 'tech', 'heavy-king': 'power',
  'heavy-magician': 'trickster', chao: 'flight',
  // ---- Epic (18) ----
  shadow: 'chaos', silver: 'chaos', metal: 'tech', espio: 'trickster', omega: 'tech',
  'movie-sonic': 'speed', 'movie-shadow': 'chaos', 'neo-metal': 'tech',
  'dark-sonic': 'speed', mephiles: 'chaos', infinite: 'chaos', zavok: 'chaos',
  sage: 'tech', chaos: 'chaos', 'eggman-nega': 'tech', 'black-doom': 'chaos',
  'erazor-djinn': 'chaos', 'king-arthur': 'power',
  // ---- Legendary (10) ----
  sonic: 'speed', jet: 'flight', 'super-shadow': 'chaos', 'hyper-sonic': 'speed',
  'hyper-shadow': 'chaos', 'excalibur-sonic': 'speed', 'super-knuckles': 'power',
  'super-blaze': 'speed', 'devil-doom': 'chaos', 'time-eater': 'chaos',
  // ---- Exclusive (5) ----
  eggman: 'tech', super: 'speed', 'metal-overlord': 'tech', 'perfect-chaos': 'chaos',
  'dark-gaia': 'chaos',
  // ---- Arcade exclusives (3) ----
  fang: 'trickster', bean: 'trickster', bark: 'power',
  // ---- Battle exclusives (3; cards.ts gains these in WS23) ----
  'mecha-sonic': 'tech', 'egg-dragon': 'power', solaris: 'chaos',
}

/** Archetype for a card id. Throws on unknown id (roster drift is a bug). */
export function archetypeOf(cardId: string): Archetype {
  const a = CARD_ARCHETYPE[cardId]
  if (!a) throw new Error(`battle: no archetype for card '${cardId}'`)
  return a
}

/** Every CURRENT roster card (ALL_CARDS) has an archetype — used by tests. */
export function missingArchetypes(): string[] {
  return ALL_CARDS.filter((c) => !CARD_ARCHETYPE[c.id]).map((c) => c.id)
}
