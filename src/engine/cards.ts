import type { MascotId } from '../content/types'

/* ============================================================================
 * Collectible Sonic card + chest PACK economy (Asphalt 9-style duplication).
 * EVERY chest = a card pack (1-3 copies of ONE character + scaled gem band).
 * See PITFALLS.md / s167 for design history.
 * ========================================================================== */

export type ChestTier = 'common' | 'rare' | 'epic' | 'legendary' | 'exclusive'
export const TIER_ORDER: ChestTier[] = ['common', 'rare', 'epic', 'legendary', 'exclusive']

export interface CardDef {
  id: MascotId
  tier: ChestTier
  name: string
  flavor: string
  image: string
}


/** The full 19-card collection (one card per playable character). */
export const CARDS: CardDef[] = [
  // Common (5)
  { id: 'tails', tier: 'common', name: 'Tails', flavor: 'Two tails are faster than one!', image: 'cards/tails.webp' },
  { id: 'amy', tier: 'common', name: 'Amy', flavor: 'A friend with a big heart!', image: 'cards/amy.webp' },
  { id: 'cream', tier: 'common', name: 'Cream', flavor: 'Sweet as honey and cakes!', image: 'cards/cream.webp' },
  { id: 'charmy', tier: 'common', name: 'Charmy Bee', flavor: 'A tiny bee with a giant heart!', image: 'cards/charmy.webp' },
  { id: 'big', tier: 'common', name: 'Big the Cat', flavor: "Froggy's best buddy!", image: 'cards/big.webp' },
  // Rare (5)
  { id: 'knuckles', tier: 'rare', name: 'Knuckles', flavor: 'The master of the fist!', image: 'cards/knuckles.webp' },
  { id: 'blaze', tier: 'rare', name: 'Blaze', flavor: 'Faster than the fire!', image: 'cards/blaze.webp' },
  { id: 'rouge', tier: 'rare', name: 'Rouge', flavor: 'A jewel thief with style!', image: 'cards/rouge.webp' },
  { id: 'ray', tier: 'rare', name: 'Ray the Flying Squirrel', flavor: 'Glide through the sky!', image: 'cards/ray.webp' },
  { id: 'vector', tier: 'rare', name: 'Vector the Crocodile', flavor: 'A loud, loveable leader!', image: 'cards/vector.webp' },
  // Epic (5)
  { id: 'shadow', tier: 'epic', name: 'Shadow', flavor: 'The ultimate lifeform!', image: 'cards/shadow.webp' },
  { id: 'silver', tier: 'epic', name: 'Silver', flavor: 'Psychic power of the future!', image: 'cards/silver.webp' },
  { id: 'metal', tier: 'epic', name: 'Metal Sonic', flavor: 'A copy built to win!', image: 'cards/metal.webp' },
  { id: 'espio', tier: 'epic', name: 'Espio the Chameleon', flavor: 'Master of disguise!', image: 'cards/espio.webp' },
  { id: 'omega', tier: 'epic', name: 'Omega', flavor: 'The ultimate E-Series robot!', image: 'cards/omega.webp' },
  // Legendary (2)
  { id: 'sonic', tier: 'legendary', name: 'Sonic', flavor: 'The fastest thing alive!', image: 'cards/sonic.webp' },
  { id: 'jet', tier: 'legendary', name: 'Jet the Hawk', flavor: 'King of the Babylon Rogues!', image: 'cards/jet.webp' },
  // Exclusive (2)
  { id: 'eggman', tier: 'exclusive', name: 'Dr. Eggman', flavor: 'The mad scientist of mayhem!', image: 'cards/eggman.webp' },
  { id: 'super', tier: 'exclusive', name: 'Super Sonic', flavor: 'The legendary golden form!', image: 'cards/super.webp' },
]

export const CARD_BY_ID: Record<string, CardDef> = Object.fromEntries(CARDS.map((c) => [c.id, c]))

/** Resolves a card's character render to an absolute URL under the Vite base path. */
export function cardImageUrl(card: CardDef): string {
  return `${import.meta.env.BASE_URL}${card.image}`
}

export const tierIndex = (t: ChestTier) => TIER_ORDER.indexOf(t)



/* -------------------- star curve + dust conversion -------------------- */

/** Total cards needed to reach each star level. Stars are 0=locked, 1-5=unlocked.
 *  Curve is gentle-to-steeper: 3 / 6 / 10 / 15 / 21 (each next needs +3, +4, +5, +6).
 *  Designed for kids: unlocks within a few chests, 5★ is a long-term goal. */
export const STAR_THRESHOLDS: readonly number[] = [3, 6, 10, 15, 21] as const
export const MAX_STAR = STAR_THRESHOLDS.length // 5

/** Gems awarded when a copy of a MAXED (5★) character arrives - the "dust" reward. */
export const DUST_PER_CARD: Record<ChestTier, number> = {
  common: 2,
  rare: 5,
  epic: 10,
  legendary: 20,
  exclusive: 40,
}

/** Star level (0..MAX_STAR) for a given card copy count. */
export function starLevel(count: number): number {
  let s = 0
  for (const t of STAR_THRESHOLDS) if (count >= t) s++
  return Math.min(MAX_STAR, s)
}

/** How many more copies are needed to reach the NEXT star. 0 if already maxed. */
export function copiesToNextStar(count: number): number {
  for (const t of STAR_THRESHOLDS) if (count < t) return t - count
  return 0
}

/** True if this character is currently locked (count below STAR_THRESHOLDS[0]). */
export function isCardLocked(count: number): boolean {
  return count < STAR_THRESHOLDS[0]
}

/* -------------------- gem bands per FINAL chest tier -------------------- */

const GEM_RANGE: Record<ChestTier, [number, number]> = {
  common: [3, 6],
  rare: [8, 14],
  epic: [15, 25],
  legendary: [30, 45],
  exclusive: [51, 80],
}

/* -------------------- starting-tier probability tables -------------------- */

export type ChestContext = 'normal' | 'boss' | 'lucky' | 'streak'
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
  streak: [
    ['legendary', 75],
    ['exclusive', 25],
  ],
}

/* -------------------- tier->pool: what each chest tier CAN drop -------------------- */

/** For each CHEST tier, the weighted probability of each CARD tier in the pack.
 *  Common chests can still drop Rare cards (12%); Legendary has a small chance
 *  of Common to keep low tiers useful. */
export const CARD_POOL: Record<ChestTier, [ChestTier, number][]> = {
  common: [
    ['common', 88], ['rare', 12],
  ],
  rare: [
    ['common', 30], ['rare', 60], ['epic', 10],
  ],
  epic: [
    ['common', 10], ['rare', 30], ['epic', 55], ['legendary', 5],
  ],
  legendary: [
    ['rare', 15], ['epic', 30], ['legendary', 55],
  ],
  exclusive: [
    ['exclusive', 100],
  ],
}

/* -------------------- pack size (copies per chest) -------------------- */

/** Returns the min..max number of copies a chest of this tier can contain. */
export const PACK_SIZE: Record<ChestTier, [number, number]> = {
  common: [1, 1],
  rare: [1, 2],
  epic: [2, 2],
  legendary: [2, 3],
  exclusive: [3, 3],
}

/* -------------------- pity -------------------- */

/** Locked-pity: this many chests in a row without a still-locked character drop
 *  forces the next pack to include a still-locked character (if any remain). */
export const LOCKED_PITY = 12

/* -------------------- visual metadata + kick-upgrade table -------------------- */

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
  common: 0.22,
  rare: 0.30,
  epic: 0.40,
  legendary: 0,
  exclusive: 0,
}

/* -------------------- internal helpers -------------------- */

function randInt(rand: () => number, min: number, max: number): number {
  return min + Math.floor(rand() * (max - min + 1))
}

function weightedPick<T>(rand: () => number, table: readonly [T, number][]): T {
  const total = table.reduce((s, [, w]) => s + w, 0)
  let r = rand() * total
  for (const item of table) {
    const [v, w] = item
    r -= w
    if (r <= 0) return v
  }
  return table[table.length - 1][0]
}

/** A character is considered "owned" (unlocked) once it has at least STAR_THRESHOLDS[0] copies. */
function isOwned(counts: Readonly<Record<string, number>>, id: string): boolean {
  return (counts[id] ?? 0) >= STAR_THRESHOLDS[0]
}

/** Return ids of all still-LOCKED characters (count < 3). */
function lockedIds(counts: Readonly<Record<string, number>>): string[] {
  return CARDS.map((c) => c.id).filter((id) => !isOwned(counts, id))
}

/** Pick a card id from the given pool, preferring still-LOCKED characters when
 *  `forceLocked` is true. Falls back to any character of the right tier if the
 *  pool is exhausted. Returns null if NO card of that tier exists. */
function pickCardForTier(
  rand: () => number,
  counts: Readonly<Record<string, number>>,
  cardTier: ChestTier,
  forceLocked: boolean,
): string | null {
  const allOfTier = CARDS.filter((c) => c.tier === cardTier).map((c) => c.id)
  if (allOfTier.length === 0) return null
  // 1) if forcing-locked, prefer a still-locked character of THIS tier
  if (forceLocked) {
    const lockedInTier = allOfTier.filter((id) => !isOwned(counts, id))
    if (lockedInTier.length > 0) {
      return lockedInTier[Math.floor(rand() * lockedInTier.length)]
    }
    // 2) any still-locked character (any tier) - drop the tier filter so the
    //    pity guarantee always unlocks someone new if anyone remains
    const anyLocked = lockedIds(counts)
    if (anyLocked.length > 0) return anyLocked[Math.floor(rand() * anyLocked.length)]
  }
  // 3) normal pick - any character of the requested tier (locked or not)
  return allOfTier[Math.floor(rand() * allOfTier.length)]
}


/* -------------------- public ChestResult + rollChest -------------------- */

export interface ChestResult {
  /** how it started (what the player sees first) */
  startTier: ChestTier
  /** after the 4 kick taps */
  finalTier: ChestTier
  /** kick indices (0-based) at which the tier upgraded */
  upgradesAt: number[]
  /** gems awarded by the chest itself (NOT including duplicate dust) */
  gems: number
  /** dust awarded by duplicates of already-5★ characters (combined) */
  dust: number
  /** the single character contained in the pack (every copy is the same id) */
  cardId: string
  /** how many copies of cardId this pack contained (1, 2 or 3) */
  copies: number
  /** isNew = the player has not unlocked cardId yet (first-ever drop) */
  isNew: boolean
  /** true if the pack was forced to contain a still-LOCKED character (pity) */
  pity: boolean
}

/** Roll a full chest for one lesson.
 *  - `ctx`     : 'normal' | 'boss' | 'lucky' | 'streak'
 *  - `counts`  : the player's per-character copy counts
 *  - `pity`    : consecutive chests without a still-locked drop
 */
export function rollChest(
  rand: () => number,
  ctx: ChestContext,
  counts: Readonly<Record<string, number>>,
  pity: number,
): ChestResult {
  // 1) starting chest tier
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

  // 2) gem band from the FINAL tier
  const [gMin, gMax] = GEM_RANGE[tier]
  const gems = randInt(rand, gMin, gMax)

  // 3) pack size (copies) for this final tier
  const [cMin, cMax] = PACK_SIZE[tier]
  let copies = cMin === cMax ? cMin : randInt(rand, cMin, cMax)

  // 4) determine card tier from the chest's CARD_POOL, then pick a character
  const forceLocked = pity >= LOCKED_PITY
  const cardTier = weightedPick(rand, CARD_POOL[tier])
  let cardId = pickCardForTier(rand, counts, cardTier, forceLocked)
  let didPity = false
  // If the picked tier has no characters (shouldn't happen with current cards),
  // gracefully fall back to the lowest tier that does.
  if (cardId === null) {
    for (const t of TIER_ORDER) {
      const c = pickCardForTier(rand, counts, t, forceLocked)
      if (c !== null) { cardId = c; break }
    }
  }
  if (forceLocked && cardId !== null) {
    // Verify the pick really was a still-locked character. If not, no locked
    // characters remain - the pity quietly converts into a normal pack.
    if (!isOwned(counts, cardId)) didPity = true
  }
  // Final fallback: collection 100% maxed (very rare) - we still need to return
  // SOMETHING so the renderer doesn't crash. Drop a random maxed card.
  if (cardId === null) {
    const maxed = CARDS.map((c) => c.id)
    cardId = maxed[Math.floor(rand() * maxed.length)]
  }

  const isNew = !isOwned(counts, cardId)
  return {
    startTier,
    finalTier: tier,
    upgradesAt,
    gems,
    dust: 0, // computed in store.grantChest where the new count is known
    cardId,
    copies,
    isNew,
    pity: didPity,
  }
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


// Legacy compatibility exports (tests reference these constants)
export const CARD_CHANCE = 0.1
export const PITY_LIMIT = 15
export const COLLECTION_JACKPOT = 300
