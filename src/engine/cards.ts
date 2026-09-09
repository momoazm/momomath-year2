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
 *  - 4 "kick" taps can each upgrade the tier chain (Common->Rare->Epic->Legendary).
 *     EXCLUSIVE/MYTHIC/ULTIMATE/HYPER are only ever a start roll - they can never be upgraded into.
 *  - Gems scale by FINAL tier and stay far below shop item prices.
 *  - Each chest has 1-3 CARD SLOTS (more slots on higher tiers). Every slot
 *    independently rolls a per-tier CARD CHANCE that SHRINKS as rarity rises,
 *    so the joint odds (chest rarity x card drop) get strictly rarer together:
 *    a top-tier card from a top-tier chest is the rarest event in the game.
 *  - Duplicates are allowed and wanted: a repeat card STARs UP that card
 *    (max 5 stars) and pays a gem star bonus instead of album progress.
 *  - A brand-new card is always celebrated as NEW.
 *   - Hidden card pity: PITY_LIMIT cardless chests in a row -> next chest is
 *     guaranteed at least one card.
 * ========================================================================== */

export type ChestTier = 'common' | 'rare' | 'epic' | 'legendary' | 'exclusive' | 'mythic' | 'ultimate' | 'hyper'

/** Display order = ascending value. Mythic/Ultimate/Hyper are start-roll only. */
export const TIER_ORDER: ChestTier[] = ['common', 'rare', 'epic', 'legendary', 'exclusive', 'mythic', 'ultimate', 'hyper']

export interface CardDef {
  /** unique card id (base characters keep their plain id) */
  id: string
  /** the character shown on the card */
  character: MascotId
  /** artwork file stem in public/cards/ (defaults to character) */
  art: string
  tier: ChestTier
  name: string
  flavor: string
}

/** The full 22-card collection - the 11 base heroes plus 11 variant versions
 *  (Movie, Classic, Super, Hyper and Werehog forms). One card per chest at most, and
 *  a card is only ever granted while it is still unowned. */
export const CARDS: CardDef[] = [
  // Common
  { id: 'tails', character: 'tails', art: 'tails', tier: 'common', name: 'Tails', flavor: 'Two tails are faster than one!' },
  { id: 'amy', character: 'amy', art: 'amy', tier: 'common', name: 'Amy', flavor: 'A friend with a big heart!' },
  { id: 'cream', character: 'cream', art: 'cream', tier: 'common', name: 'Cream', flavor: 'Sweet as honey and cakes!' },
  // Rare
  { id: 'knuckles', character: 'knuckles', art: 'knuckles', tier: 'rare', name: 'Knuckles', flavor: 'The master of the fist!' },
  { id: 'blaze', character: 'blaze', art: 'blaze', tier: 'rare', name: 'Blaze', flavor: 'Faster than the fire!' },
  { id: 'rouge', character: 'rouge', art: 'rouge', tier: 'rare', name: 'Rouge', flavor: 'A jewel thief with style!' },
  { id: 'classic-sonic', character: 'sonic', art: 'classic-sonic', tier: 'rare', name: 'Classic Sonic', flavor: 'The original 90s speedster!' },
  // Epic
  { id: 'shadow', character: 'shadow', art: 'shadow', tier: 'epic', name: 'Shadow', flavor: 'The ultimate lifeform!' },
  { id: 'silver', character: 'silver', art: 'silver', tier: 'epic', name: 'Silver', flavor: 'Psychic power of the future!' },
  { id: 'metal', character: 'metal', art: 'metal', tier: 'epic', name: 'Metal Sonic', flavor: 'A copy built to win!' },
  { id: 'movie-tails', character: 'tails', art: 'movie-tails', tier: 'epic', name: 'Movie Tails', flavor: 'Big-screen buddy with gadgets!' },
  { id: 'movie-knuckles', character: 'knuckles', art: 'movie-knuckles', tier: 'epic', name: 'Movie Knuckles', flavor: 'Warrior of the big screen!' },
  { id: 'werehog-sonic', character: 'sonic', art: 'werehog-sonic', tier: 'epic', name: 'Werehog Sonic', flavor: 'Unleashed when night falls!' },
  // Legendary
  { id: 'sonic', character: 'sonic', art: 'sonic', tier: 'legendary', name: 'Sonic', flavor: 'The fastest thing alive!' },
  { id: 'neo-metal', character: 'metal', art: 'neo-metal', tier: 'legendary', name: 'Neo Metal Sonic', flavor: 'Upgraded to overthrow empires!' },
  // Exclusive
  { id: 'eggman', character: 'eggman', art: 'eggman', tier: 'exclusive', name: 'Dr. Eggman', flavor: 'The mad scientist of mayhem!' },
  // Mythic (start-roll only, rarer than Exclusive)
  { id: 'movie-sonic', character: 'sonic', art: 'movie-sonic', tier: 'mythic', name: 'Movie Sonic', flavor: 'Hollywood speed, furry and fast!' },
  { id: 'movie-shadow', character: 'shadow', art: 'movie-shadow', tier: 'mythic', name: 'Movie Shadow', flavor: 'The big-screen ultimate lifeform!' },
  // Ultimate (start-roll only, rarer than Mythic)
  { id: 'super-sonic', character: 'sonic', art: 'super-sonic', tier: 'ultimate', name: 'Super Sonic', flavor: 'Chaos Emeralds at full power!' },
  { id: 'super-shadow', character: 'shadow', art: 'super-shadow', tier: 'ultimate', name: 'Super Shadow', flavor: 'Emerald power beyond limits!' },
  // Hyper (start-roll only, the rarest of all — smallest odds in the game)
  { id: 'hyper-sonic', character: 'sonic', art: 'hyper-sonic', tier: 'hyper', name: 'Hyper Sonic', flavor: 'Super Emeralds at maximum power!' },
  { id: 'hyper-shadow', character: 'shadow', art: 'hyper-shadow', tier: 'hyper', name: 'Hyper Shadow', flavor: 'Dark power beyond Super!' },
]

export const CARD_BY_ID: Record<string, CardDef> = Object.fromEntries(CARDS.map((c) => [c.id, c]))

/** Real character renders bundled with the app (`public/cards/*.webp`).
 *  Base-aware so the same build works on localhost and GitHub Pages
 *  (`/momomath-year2/`). Card UI falls back to the SVG mascot if an image
 *  ever fails to load. */
const CARD_BASE: string =
  (import.meta.env?.BASE_URL as string | undefined) ?? '/'

export const CARD_IMAGE: Record<string, string> = Object.fromEntries(
  CARDS.map((c) => [c.id, `${CARD_BASE}cards/${c.art}.webp`]),
)

export const tierIndex = (t: ChestTier) => TIER_ORDER.indexOf(t)

/** Gems rewarded per FINAL tier - deliberately humble vs shop prices (75-200). */
const GEM_RANGE: Record<ChestTier, [number, number]> = {
  common: [3, 6],
  rare: [8, 14],
  epic: [15, 25],
  legendary: [30, 45],
  exclusive: [51, 80],
  mythic: [60, 100],
  ultimate: [90, 150],
  hyper: [120, 200],
}

/** Starting-tier probability tables (weights sum to 100 for easy %). */
export type ChestContext = 'normal' | 'boss' | 'lucky'
export const START_TABLES: Record<ChestContext, [ChestTier, number][]> = {
  normal: [
    ['common', 92.98],
    ['rare', 4],
    ['epic', 2],
    ['legendary', 0.7],
    ['exclusive', 0.15],
    ['mythic', 0.1],
    ['ultimate', 0.05],
    ['hyper', 0.02],
  ],
  boss: [
    ['rare', 57.8],
    ['epic', 26],
    ['legendary', 11],
    ['exclusive', 3],
    ['mythic', 1.4],
    ['ultimate', 0.6],
    ['hyper', 0.2],
  ],
  lucky: [
    ['common', 51.9],
    ['rare', 28],
    ['epic', 13],
    ['legendary', 5],
    ['exclusive', 1.2],
    ['mythic', 0.5],
    ['ultimate', 0.3],
    ['hyper', 0.1],
  ],
}

function randInt(rand: () => number, min: number, max: number): number {
  return min + Math.floor(rand() * (max - min + 1))
}

/** All card ids of a given tier, preserving catalog order. */
function idsInTier(tier: ChestTier): string[] {
  return CARDS.filter((c) => c.tier === tier).map((c) => c.id)
}

/** Draw a card of the chest's tier, UNIFORM with replacement: duplicates are
 *  allowed on purpose (they STAR UP the card, see resolveChest). */
function drawCardId(rand: () => number, tier: ChestTier): string {
  const pool = idsInTier(tier)
  return pool[Math.floor(rand() * pool.length)]
}

/** Rarity metadata used by both the chest reveal and the profile album. */
export const TIER_META: Record<ChestTier, { label: string; color: string; glow: string; icon: string }> = {
  common: { label: 'Common', color: '#94a3b8', glow: 'rgba(148,163,184,0.35)', icon: '⚪' },
  rare: { label: 'Rare', color: '#3b82f6', glow: 'rgba(59,130,246,0.45)', icon: '🔵' },
  epic: { label: 'Epic', color: '#a855f7', glow: 'rgba(168,85,247,0.5)', icon: '🟣' },
  legendary: { label: 'Legendary', color: '#f59e0b', glow: 'rgba(245,158,11,0.55)', icon: '🟡' },
  exclusive: { label: 'EXCLUSIVE', color: '#c026d3', glow: 'rgba(192,38,211,0.6)', icon: '💠' },
  mythic: { label: 'MYTHIC', color: '#ec4899', glow: 'rgba(236,72,153,0.6)', icon: '💖' },
  ultimate: { label: 'ULTIMATE', color: '#14b8a6', glow: 'rgba(20,184,166,0.65)', icon: '💎' },
  hyper: { label: 'HYPER', color: '#facc15', glow: 'rgba(250,204,21,0.7)', icon: '🌟' },
}

/** 4-kick ritual - each kick's chance to upgrade to the NEXT tier (capped at Legendary).
 *  Exclusive/Mythic/Ultimate/Hyper are start-roll ONLY and can never be upgraded into. */
export const KICKS = 4
export const KICK_UPGRADE: Record<ChestTier, number> = {
  common: 0.12,
  rare: 0.18,
  epic: 0.25,
  legendary: 0,
  exclusive: 0,
  mythic: 0,
  ultimate: 0,
  hyper: 0,
}

/** Card slots per FINAL tier: better chests hold more cards (1-3 total). */
export const CARD_SLOTS: Record<ChestTier, [number, number]> = {
  common: [1, 1],
  rare: [1, 2],
  epic: [1, 2],
  legendary: [2, 2],
  exclusive: [2, 2],
  mythic: [2, 2],
  ultimate: [2, 3],
  hyper: [3, 3],
}

/** Per-slot card-drop chance by FINAL tier. Decoupled from the chest roll and
 *  strictly decreasing with rarity: rarer chest x rarer card = rarest event. */
export const CARD_CHANCE: Record<ChestTier, number> = {
  common: 0.35,
  rare: 0.28,
  epic: 0.22,
  legendary: 0.18,
  exclusive: 0.14,
  mythic: 0.11,
  ultimate: 0.09,
  hyper: 0.07,
}

/** Duplicate cap per card: repeats STAR UP the card to at most this many. */
export const MAX_STARS = 5

/** Gem bonus base per tier for a duplicate: bonus = base x stars after star-up. */
export const STAR_GEMS: Record<ChestTier, number> = {
  common: 5,
  rare: 10,
  epic: 20,
  legendary: 35,
  exclusive: 50,
  mythic: 70,
  ultimate: 100,
  hyper: 140,
}

/** Hidden mercy: this many consecutive cardless tries forces a card. */
export const PITY_LIMIT = 15

/** Whole collection complete - a chest pays a big gem jackpot instead. */
export const COLLECTION_JACKPOT = 300

export interface CardEvent {
  id: string
  /** true the very first time this card is pulled */
  isNew: boolean
  /** star count on this card AFTER this event (0 for a fresh NEW card) */
  starAfter: number
  /** gem bonus paid for a duplicate (0 for NEW cards) */
  starBonus: number
}

export interface ChestResult {
  /** how it started (what the player sees first) */
  startTier: ChestTier
  /** after the 4 kick taps */
  finalTier: ChestTier
  /** kick indices (0-based) at which the tier upgraded */
  upgradesAt: number[]
  gems: number
  /** gem bonus from duplicate star-ups (already included in NOTHING else -
   *  the store adds gems + starBonus together) */
  starBonus: number
  /** 0-3 card events; duplicates STAR UP instead of album progress */
  cards: CardEvent[]
  /** every card fully maxed: this chest pays a gem jackpot instead */
  jackpot: boolean
}

/**
 * Roll a full chest for one lesson.
 *  - `ctx`      : 'normal' | 'boss' | 'lucky' (buying a Lucky Ticket toggles)
 *  - `stars`    : the player's card stars (id -> 0..MAX_STARS; missing = unowned)
 *  - `cardPity` : consecutive cardless chests; >= PITY_LIMIT forces a card
 */
export function rollChest(
  rand: () => number,
  ctx: ChestContext,
  stars: Readonly<Record<string, number>>,
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

  return resolveChest(rand, stars, cardPity, startTier, tier, upgradesAt, 1)
}

/**
 * Finish an INTERACTIVE chest: the UI already rolled the start tier and played
 * the 4 kick taps itself (see LessonScreen), then calls this to resolve gems +
 * cards with the EXACT same rules as the tail of rollChest — one shared economy.
 * `gemMult` applies shop boosts (Chest Boost / Mega Chest ×2).
 */
export function resolveChest(
  rand: () => number,
  stars: Readonly<Record<string, number>>,
  cardPity: number,
  startTier: ChestTier,
  finalTier: ChestTier,
  upgradesAt: number[],
  gemMult = 1,
): ChestResult {
  const [gMin, gMax] = GEM_RANGE[finalTier]
  const gems = randInt(rand, gMin, gMax) * gemMult

  // Endgame: every card maxed -> gem jackpot instead of more star-ups.
  const mastered = CARDS.every((c) => (stars[c.id] ?? -1) >= MAX_STARS)
  if (mastered) {
    const jackpotBase = randInt(rand, GEM_RANGE.exclusive[0], GEM_RANGE.exclusive[1])
    return {
      startTier,
      finalTier,
      upgradesAt,
      gems: jackpotBase + COLLECTION_JACKPOT,
      starBonus: 0,
      cards: [],
      jackpot: true,
    }
  }

  const [sMin, sMax] = CARD_SLOTS[finalTier]
  const slots = randInt(rand, sMin, sMax)
  const forced = cardPity >= PITY_LIMIT
  const cards: CardEvent[] = []
  let starBonus = 0
  // Local ownership INCLUDES cards dropped earlier in this same chest, so a
  // repeat inside one chest STARs UP instead of vanishing (Sonic x2 counts!).
  const local: Record<string, number> = { ...stars }

  for (let s = 0; s < slots; s++) {
    const drops = (forced && s === 0) || rand() < CARD_CHANCE[finalTier]
    if (!drops) continue
    const id = drawCardId(rand, finalTier)
    const owned = id in local
    if (!owned) {
      cards.push({ id, isNew: true, starAfter: 0, starBonus: 0 })
      local[id] = 0
    } else {
      const starAfter = Math.min(MAX_STARS, local[id] + 1)
      const bonus = STAR_GEMS[finalTier] * Math.max(1, starAfter)
      starBonus += bonus
      cards.push({ id, isNew: false, starAfter, starBonus: bonus })
      local[id] = starAfter
    }
  }

  return { startTier, finalTier, upgradesAt, gems, starBonus, cards, jackpot: false }
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