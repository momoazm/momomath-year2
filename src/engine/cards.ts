import type { MascotId } from '../content/types'

/* ============================================================================
 * Collectible Sonic card + chest loot economy.
 *
 * Everything here is a PURE, seeded function so the game is deterministic per
 * (seed, inputs) and can be unit-tested / Monte-Carlo simulated before deploy.
 *
 * Design rules (agreed with the product owner):
 *   - Starting tier is a random weighted roll. Common is intentionally dominant
 *     ("common way more common") so the gem/card economy stays humble.
 *   - Boss lessons draw from an upgraded, no-common-heavy table.
 *   - A shop "Lucky Ticket" swaps to a lucky table while active.
 *   - 4 "kick" taps can each upgrade the tier chain (Common->Rare->Epic->Legendary).
 *     EXCLUSIVE is only ever a start roll - it can never be upgraded into.
 *   - Gems scale by FINAL tier and stay far below shop item prices.
 *   - Cards appear ~10% of the time, rarity matches the final tier exactly,
 *     EXCEPT Legendary/Exclusive chests always give their card.
 *   - Hard no-duplicates: a card is always chosen from cards you do not own.
 *   - Hidden card pity: PITY_LIMIT cardless chests in a row -> next is guaranteed.
 * ========================================================================== */

export type ChestTier = 'common' | 'rare' | 'epic' | 'legendary' | 'exclusive'

/** Display order = ascending value. */
export const TIER_ORDER: ChestTier[] = ['common', 'rare', 'epic', 'legendary', 'exclusive']

export interface CardDef {
  id: MascotId
  tier: ChestTier
  name: string
  flavor: string
}

/** The full 11-card collection - one card per playable character. */
export const CARDS: CardDef[] = [
  // Common
  { id: 'tails', tier: 'common', name: 'Tails', flavor: 'Two tails are faster than one!' },
  { id: 'amy', tier: 'common', name: 'Amy', flavor: 'A friend with a big heart!' },
  { id: 'cream', tier: 'common', name: 'Cream', flavor: 'Sweet as honey and cakes!' },
  // Rare
  { id: 'knuckles', tier: 'rare', name: 'Knuckles', flavor: 'The master of the fist!' },
  { id: 'blaze', tier: 'rare', name: 'Blaze', flavor: 'Faster than the fire!' },
  { id: 'rouge', tier: 'rare', name: 'Rouge', flavor: 'A jewel thief with style!' },
  // Epic
  { id: 'shadow', tier: 'epic', name: 'Shadow', flavor: 'The ultimate lifeform!' },
  { id: 'silver', tier: 'epic', name: 'Silver', flavor: 'Psychic power of the future!' },
  { id: 'metal', tier: 'epic', name: 'Metal Sonic', flavor: 'A copy built to win!' },
  // Legendary
  { id: 'sonic', tier: 'legendary', name: 'Sonic', flavor: 'The fastest thing alive!' },
  // Exclusive
  { id: 'eggman', tier: 'exclusive', name: 'Dr. Eggman', flavor: 'The mad scientist of mayhem!' },
]

export const CARD_BY_ID: Record<string, CardDef> = Object.fromEntries(CARDS.map((c) => [c.id, c]))

export const tierIndex = (t: ChestTier) => TIER_ORDER.indexOf(t)

/** Gems rewarded per FINAL tier - deliberately humble vs shop prices (75-200). */
const GEM_RANGE: Record<ChestTier, [number, number]> = {
  common: [3, 6],
  rare: [8, 14],
  epic: [15, 25],
  legendary: [30, 45],
  exclusive: [51, 80],
}

/** Starting-tier probability tables (weights sum to 100 for easy %). */
export type ChestContext = 'normal' | 'boss' | 'lucky'
export const START_TABLES: Record<ChestContext, [ChestTier, number][]> = {
  normal: [
    ['common', 95],
    ['rare', 3.5],
    ['epic', 1],
    ['legendary', 0.4],
    ['exclusive', 0.1],
  ],
  boss: [
    ['rare', 62],
    ['epic', 26],
    ['legendary', 10],
    ['exclusive', 2],
  ],
  lucky: [
    ['common', 55],
    ['rare', 27],
    ['epic', 12],
    ['legendary', 5],
    ['exclusive', 1],
  ],
}

function randInt(rand: () => number, min: number, max: number): number {
  return min + Math.floor(rand() * (max - min + 1))
}

/** Unowned card ids of a given tier, preserving catalog order. */
function unownedInTier(owned: ReadonlySet<string>, tier: ChestTier): string[] {
  return CARDS.filter((c) => c.tier === tier && !owned.has(c.id)).map((c) => c.id)
}

/** Pick a brand-new (never-duplicated) card.
 *  Prefer-matches the final tier; if that rarity is fully owned, "bump up" to
 *  the rarest still-incomplete rarity (so a card never becomes a duplicate and
 *  a completed Common set lets low chests start unlocking higher cards).
 *  Returns null only when the whole collection is complete. */
function pickCard(rand: () => number, owned: ReadonlySet<string>, tier: ChestTier): string | null {
  // 1) exact tier, among unowned
  {
    const pool = unownedInTier(owned, tier)
    if (pool.length > 0) return pool[Math.floor(rand() * pool.length)]
  }
  // 2) rarest incomplete rarity (descending value order)
  for (let i = TIER_ORDER.length - 1; i >= 0; i--) {
    const pool = unownedInTier(owned, TIER_ORDER[i])
    if (pool.length > 0) return pool[Math.floor(rand() * pool.length)]
  }
  return null
}

/** Rarity metadata used by both the chest reveal and the profile album. */
export const TIER_META: Record<ChestTier, { label: string; color: string; glow: string; icon: string }> = {
  common: { label: 'Common', color: '#94a3b8', glow: 'rgba(148,163,184,0.35)', icon: '⚪' },
  rare: { label: 'Rare', color: '#3b82f6', glow: 'rgba(59,130,246,0.45)', icon: '🔵' },
  epic: { label: 'Epic', color: '#a855f7', glow: 'rgba(168,85,247,0.5)', icon: '🟣' },
  legendary: { label: 'Legendary', color: '#f59e0b', glow: 'rgba(245,158,11,0.55)', icon: '🟡' },
  exclusive: { label: 'EXCLUSIVE', color: '#e0b3ff', glow: 'rgba(255,215,140,0.65)', icon: '💠' },
}

/** 4-kick ritual - each kick's chance to upgrade to the NEXT tier (capped at Legendary). */
export const KICKS = 4
export const KICK_UPGRADE: Record<ChestTier, number> = {
  common: 0.12,
  rare: 0.18,
  epic: 0.25,
  legendary: 0,
  exclusive: 0,
}

/** Cards drop ~10% of the time; Legendary/Exclusive always carry their card. */
export const CARD_CHANCE = 0.1

/** Hidden mercy: this many consecutive cardless tries forces a card. */
export const PITY_LIMIT = 15

/** Whole collection complete - a chest pays a big gem jackpot instead. */
export const COLLECTION_JACKPOT = 300

export interface ChestResult {
  /** how it started (what the player sees first) */
  startTier: ChestTier
  /** after the 4 kick taps */
  finalTier: ChestTier
  /** kick indices (0-based) at which the tier upgraded */
  upgradesAt: number[]
  gems: number
  card: { id: string; isNew: boolean } | null
  /** all cards already owned and this chest wanted a card -> jackpot */
  jackpot: boolean
}

/**
 * Roll a full chest for one lesson.
 *  - `ctx`      : 'normal' | 'boss' | 'lucky' (buying a Lucky Ticket toggles)
 *  - `owned`    : the player's card set (ids)
 *  - `cardPity` : consecutive cardless chests; >= PITY_LIMIT forces a card
 */
export function rollChest(
  rand: () => number,
  ctx: ChestContext,
  owned: ReadonlySet<string>,
  cardPity: number,
): ChestResult {
  const startTier = rollStartTier(rand, ctx)
  let tier = startTier
  const upgradesAt: number[] = []

  for (let k = 0; k < KICKS; k++) {
    const next = upgradeStep(tier)
    if (next !== tier && rand() < KICK_UPGRADE[tier]) {
      tier = next
      upgradesAt.push(k)
    }
  }

  const [gMin, gMax] = GEM_RANGE[tier]
  const gems = randInt(rand, gMin, gMax)

  const alwaysCard = tier === 'legendary' || tier === 'exclusive'
  const forced = cardPity >= PITY_LIMIT
  const dropsCard = alwaysCard || forced || rand() < CARD_CHANCE

  if (!dropsCard) {
    return { startTier, finalTier: tier, upgradesAt, gems, card: null, jackpot: false }
  }

  const cardId = pickCard(rand, owned, tier)
  if (cardId === null) {
    // Collection complete -> jackpot: pay the top (exclusive) gem band plus the
    // big completion bonus, so a completed set is always richly rewarded no
    // matter what tier the chest happened to roll.
    const jackpotBase = randInt(rand, GEM_RANGE.exclusive[0], GEM_RANGE.exclusive[1])
    return {
      startTier,
      finalTier: tier,
      upgradesAt,
      gems: jackpotBase + COLLECTION_JACKPOT,
      card: null,
      jackpot: true,
    }
  }

  return {
    startTier,
    finalTier: tier,
    upgradesAt,
    gems,
    card: { id: cardId, isNew: !owned.has(cardId) },
    jackpot: false,
  }
}
function weightedPick<T>(rand: () => number, table: readonly [T, number][]): T {
  const total = table.reduce((s, [, w]) => s + w, 0)
  let r = rand() * total
  for (const [item, w] of table) {
    r -= w
    if (r <= 0) return item
  }
  return table[table.length - 1][0]
}

export function rollStartTier(rand: () => number, ctx: ChestContext): ChestTier {
  return weightedPick(rand, START_TABLES[ctx])
}

/** Next tier in the upgrade chain; Exclusive is never entered/left via upgrade. */
export function upgradeStep(t: ChestTier): ChestTier {
  if (t === 'common') return 'rare'
  if (t === 'rare') return 'epic'
  if (t === 'epic') return 'legendary'
  return t
}