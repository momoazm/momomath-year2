// Chest opening engine: weighted rolls, pity timers, duplicate protection.
// All probability data lives in loot-tables.js (single source of truth, also used by the verifier).

import { PRIZES, CHEST_TIERS, PITY, WEIGHT_SUM } from './loot-tables.js'
import { usePlayer, addGems } from './store'

export type ChestTierId = 'wood' | 'silver' | 'gold'
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface PrizeDef {
  id: string
  label: string
  kind: 'currency' | 'item' | 'utility' | 'cosmetic'
  icon: string
  gemValue: number
  gemRange?: [number, number]
  shopPrice?: number
  dupeRefund?: number
  rarity: Rarity
}

export interface RollResult {
  tierId: ChestTierId
  prizeId: string
  prize: PrizeDef
  gemsAwarded?: number        // set when currency with a range
  pityRarePlus: boolean       // rare+ pity triggered on this roll
  pityLegendary: boolean      // jackpot pity triggered on this roll
  duplicateConverted: boolean // owned wallpaper converted to gems
}

const TIER_MAP = new Map(CHEST_TIERS.map((t) => [t.id, t]))

export function getTier(id: ChestTierId) {
  return TIER_MAP.get(id)!
}

export function getPrize(prizeId: string): PrizeDef {
  return (PRIZES as Record<string, PrizeDef>)[prizeId]
}

/** Normalized odds for the in-game transparency table. */
export function getOdds(tierId: ChestTierId): Array<{ prize: PrizeDef; percent: number }> {
  const tier = getTier(tierId)
  return Object.entries(tier.weights)
    .map(([key, weight]) => ({ prize: getPrize(key), percent: (weight / WEIGHT_SUM) * 100 }))
    .sort((a, b) => b.percent - a.percent)
}

/** Expected value in gem-equivalents. */
export function expectedValue(tierId: ChestTierId): number {
  const tier = getTier(tierId)
  return (
    Object.entries(tier.weights).reduce((sum, [key, w]) => sum + getPrize(key).gemValue * w, 0) /
    WEIGHT_SUM
  )
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const RARITY_ORDER: Record<Rarity, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
}

function pickWeighted(weights: Record<string, number>, rand: () => number): string {
  const entries = Object.entries(weights)
  const total = entries.reduce((s, [, w]) => s + w, 0)
  let roll = rand() * total
  for (const [key, w] of entries) {
    roll -= w
    if (roll < 0) return key
  }
  return entries[entries.length - 1][0]
}

function bandWeights(tierId: ChestTierId, minRarity: Rarity): Record<string, number> {
  const tier = getTier(tierId)
  const out: Record<string, number> = {}
  for (const [key, w] of Object.entries(tier.weights)) {
    if (RARITY_ORDER[getPrize(key).rarity] >= RARITY_ORDER[minRarity]) out[key] = w
  }
  return out
}

/**
 * Roll one chest. Pity logic:
 * - No rare+ in the last PITY.RARE_PLUS_WITHIN opens of this tier -> this roll is upgraded to rare+.
 * - No legendary in the last PITY.JACKPOT_WITHIN opens globally -> upgraded to legendary.
 */
export function rollChest(tierId: ChestTierId, rand: () => number = Math.random): RollResult {
  const tier = getTier(tierId)
  const stats = usePlayer.getState().chestStats

  const rarePlusGap = stats.sinceRarePlus?.[tierId] ?? 0
  const forceRarePlus = rarePlusGap >= PITY.RARE_PLUS_WITHIN - 1
  const forceLegendary = stats.sinceLegendary >= PITY.JACKPOT_WITHIN - 1

  let prizeKey: string
  if (forceLegendary) prizeKey = pickWeighted(bandWeights(tierId, 'legendary'), rand)
  else if (forceRarePlus) prizeKey = pickWeighted(bandWeights(tierId, 'rare'), rand)
  else prizeKey = pickWeighted(tier.weights, rand)

  // Duplicate protection: owned wallpaper converts to a gem refund.
  let duplicateConverted = false
  const prize = getPrize(prizeKey)
  let gemsAwarded: number | undefined
  if (prize.kind === 'cosmetic' && usePlayer.getState().wallpapers.includes(prize.id)) {
    duplicateConverted = true
    gemsAwarded = prize.dupeRefund ?? Math.floor(prize.gemValue / 2)
  } else if (prize.gemRange) {
    const [lo, hi] = prize.gemRange
    gemsAwarded = lo + Math.floor(rand() * (hi - lo + 1))
  }

  // Update pity counters.
  const rolledRarityRank = duplicateConverted ? 0 : RARITY_ORDER[prize.rarity]
  usePlayer.setState((s) => ({
    chestStats: {
      opened: s.chestStats.opened + 1,
      sinceLegendary: rolledRarityRank >= RARITY_ORDER.legendary ? 0 : s.chestStats.sinceLegendary + 1,
      sinceRarePlus: {
        ...s.chestStats.sinceRarePlus,
        [tierId]: rolledRarityRank >= RARITY_ORDER.rare ? 0 : (s.chestStats.sinceRarePlus?.[tierId] ?? 0) + 1,
      },
    },
  }))

  return {
    tierId,
    prizeId: prize.id,
    prize,
    gemsAwarded,
    pityRarePlus: forceRarePlus && rolledRarityRank >= RARITY_ORDER.rare && !forceLegendary,
    pityLegendary: forceLegendary,
    duplicateConverted,
  }
}

/** Open a chest and apply all rewards to the player store. Returns reveal info for UI. */
export function openChest(tierId: ChestTierId, rand: () => number = Math.random): RollResult {
  const result = rollChest(tierId, rand)
  const { prize, gemsAwarded, duplicateConverted } = result

  if (gemsAwarded !== undefined || prize.kind === 'currency') addGems(gemsAwarded ?? 0)

  if (prize.kind === 'utility') {
    usePlayer.setState((s) => ({ streakFreezes: s.streakFreezes + 1 }))
  }

  if (prize.kind === 'item') {
    usePlayer.setState((s) => {
      if (prize.id === 'double-xp') {
        return { activeEffects: { ...s.activeEffects, doubleXpLessons: s.activeEffects.doubleXpLessons + 3 } }
      }
      if (prize.id === 'chest-boost') {
        return { activeEffects: { ...s.activeEffects, chestBoosts: s.activeEffects.chestBoosts + 1 } }
      }
      return {}
    })
  }

  if (prize.kind === 'cosmetic' && !duplicateConverted) {
    usePlayer.setState((s) => ({
      wallpapers: [...s.wallpapers, prize.id],
      equippedWallpaper: s.equippedWallpaper ?? prize.id,
    }))
  }

  return result
}
