import { writeFileSync } from 'node:fs'

const parts = []
parts.push(`import type { MascotId } from '../content/types'

/* ============================================================================
 * Collectible Sonic card + chest PACK economy (Asphalt 9-style duplication).
 *
 * EVERY chest is a card pack. You always get 1-3 copies of ONE character, plus a
 * small gem band that scales with chest rarity (so higher chests = more loot AND a
 * bigger / rarer character on average).
 *
 * Design rules (agreed with the product owner):
 *   - Cards-per-pack grows with chest tier (1, 1-2, 2, 2-3, 3).
 *   - The character in a pack is drawn from the chest-tier's rarity pool, NOT just
 *     that tier. So a Common chest can still drop a Rare card (10% chance) and a
 *     Legendary chest still has a small shot at Common. This is what keeps lower
 *     chests useful even after you have unlocked most of a rarity.
 *   - Every copy of a character counts toward its STAR level, so no duplicate is
 *     ever wasted until a character is 5 stars (maxed). At that point extras auto-
 *     convert to DUST (gems) by tier: common +2, rare +5, epic +10, legendary +20,
 *     exclusive +40.
 *   - Pity timer is now LOCKED-PITY: if you go N chests in a row without getting a
 *     single card for a still-LOCKED character, the next pack is guaranteed to
 *     unlock someone new. This replaces the old "force a card" rule and is what
 *     makes sure players never get stuck unable to unlock anything.
 *   - Hard no-duplicates WITHIN a pack: every copy in a single pack is the same
 *     character, so showing the count "+2!" is always meaningful.
 * ========================================================================== */

export type ChestTier = 'common' | 'rare' | 'epic' | 'legendary' | 'exclusive'

/** Display order = ascending value. */
export const TIER_ORDER: ChestTier[] = ['common', 'rare', 'epic', 'legendary', 'exclusive']

export interface CardDef {
  id: MascotId
  tier: ChestTier
  name: string
  flavor: string
  /** URL of this character's "real" render, served from the public folder. */
  image: string
}

/** The full card collection (one card per playable character). New characters
 *  are appended here in the same order as `MascotId`. Each character has a
 *  fixed tier in the pool - cards never change tier, packs just roll from the
 *  chest-tier's weighted table. */
export const CARDS: CardDef[] = [
  // Common
  { id: 'tails', tier: 'common', name: 'Tails', flavor: 'Two tails are faster than one!', image: 'cards/tails.webp' },
  { id: 'amy', tier: 'common', name: 'Amy', flavor: 'A friend with a big heart!', image: 'cards/amy.webp' },
  { id: 'cream', tier: 'common', name: 'Cream', flavor: 'Sweet as honey and cakes!', image: 'cards/cream.webp' },
  { id: 'charmy', tier: 'common', name: 'Charmy Bee', flavor: 'A tiny bee with a giant heart!', image: 'cards/charmy.webp' },
  { id: 'big', tier: 'common', name: 'Big the Cat', flavor: "Froggy's best buddy!", image: 'cards/big.webp' },
  // Rare
  { id: 'knuckles', tier: 'rare', name: 'Knuckles', flavor: 'The master of the fist!', image: 'cards/knuckles.webp' },
  { id: 'blaze', tier: 'rare', name: 'Blaze', flavor: 'Faster than the fire!', image: 'cards/blaze.webp' },
  { id: 'rouge', tier: 'rare', name: 'Rouge', flavor: 'A jewel thief with style!', image: 'cards/rouge.webp' },
  { id: 'ray', tier: 'rare', name: 'Ray the Flying Squirrel', flavor: 'Glide through the sky!', image: 'cards/ray.webp' },
  { id: 'vector', tier: 'rare', name: 'Vector the Crocodile', flavor: 'A loud, loveable leader!', image: 'cards/vector.webp' },
  // Epic
  { id: 'shadow', tier: 'epic', name: 'Shadow', flavor: 'The ultimate lifeform!', image: 'cards/shadow.webp' },
  { id: 'silver', tier: 'epic', name: 'Silver', flavor: 'Psychic power of the future!', image: 'cards/silver.webp' },
  { id: 'metal', tier: 'epic', name: 'Metal Sonic', flavor: 'A copy built to win!', image: 'cards/metal.webp' },
  { id: 'espio', tier: 'epic', name: 'Espio the Chameleon', flavor: 'Master of disguise!', image: 'cards/espio.webp' },
  { id: 'omega', tier: 'epic', name: 'Omega', flavor: 'The ultimate E-Series robot!', image: 'cards/omega.webp' },
  // Legendary
  { id: 'sonic', tier: 'legendary', name: 'Sonic', flavor: 'The fastest thing alive!', image: 'cards/sonic.webp' },
  { id: 'jet', tier: 'legendary', name: 'Jet the Hawk', flavor: 'King of the Babylon Rogues!', image: 'cards/jet.webp' },
  // Exclusive
  { id: 'eggman', tier: 'exclusive', name: 'Dr. Eggman', flavor: 'The mad scientist of mayhem!', image: 'cards/eggman.webp' },
  { id: 'super', tier: 'exclusive', name: 'Super Sonic', flavor: 'The legendary golden form!', image: 'cards/super.webp' },
]
`)

writeFileSync('C:/Users/momo/momomath-year2/src/engine/cards.ts', parts.join('\n'), 'utf8')
console.log('WROTE part 1')
