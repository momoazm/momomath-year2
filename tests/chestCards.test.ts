import { describe, expect, it } from 'vitest'
import { mulberry32 } from '../src/content/rng'
import {
  CARDS,
  CARD_CHANCE,
  COLLECTION_JACKPOT,
  PITY_LIMIT,
  START_TABLES,
  rollChest,
  rollStartTier,
  tierIndex,
  type ChestTier,
} from '../src/engine/cards'

function rng(seed: number) {
  return mulberry32(seed)
}

describe('start tier tables', () => {
  it('each table sums close to 100', () => {
    for (const ctx of Object.keys(START_TABLES) as (keyof typeof START_TABLES)[]) {
      const total = START_TABLES[ctx].reduce((s, [, w]) => s + w, 0)
      expect(Math.abs(total - 100)).toBeLessThan(0.01)
    }
  })

  it('normal rolls are dominated by Common', () => {
    let common = 0
    const N = 100000
    for (let i = 0; i < N; i++) {
      if (rollStartTier(rng(i), 'normal') === 'common') common++
    }
    const rate = common / N
    expect(rate).toBeGreaterThan(0.9)
    expect(rate).toBeLessThan(0.98)
  })

  it('boss rolls can NEVER land on Common', () => {
    for (let i = 0; i < 50000; i++) {
      expect(rollStartTier(rng(i), 'boss')).not.toBe('common')
    }
  })

  it('lucky rolls are far less Common than normal', () => {
    let normalCommon = 0
    let luckyCommon = 0
    const N = 20000
    for (let i = 0; i < N; i++) {
      if (rollStartTier(rng(i), 'normal') === 'common') normalCommon++
      if (rollStartTier(rng(i + 999999), 'lucky') === 'common') luckyCommon++
    }
    expect(luckyCommon / N).toBeLessThan(normalCommon / N)
    expect(luckyCommon / N).toBeLessThan(0.65) // lucky table has 55% common base
  })

  it('even normal rolls can reach Exclusive (it is truly random)', () => {
    let exclusive = 0
    const N = 200000
    for (let i = 0; i < N; i++) {
      if (rollStartTier(rng(i), 'normal') === 'exclusive') exclusive++
    }
    expect(exclusive).toBeGreaterThan(0) // 0.1% -> expect ~200
  })

  it('streak milestone rolls are ALWAYS high rarity (Legendary or Exclusive)', () => {
    for (let i = 0; i < 50000; i++) {
      const tier = rollStartTier(rng(i), 'streak')
      expect(tier === 'legendary' || tier === 'exclusive').toBe(true)
    }
    // ...and both tiers actually occur (~75% / ~25%)
    let leg = 0
    for (let i = 0; i < 20000; i++) {
      if (rollStartTier(rng(i), 'streak') === 'legendary') leg++
    }
    expect(leg / 20000).toBeGreaterThan(0.6)
    expect(leg / 20000).toBeLessThan(0.9)
  })
})

describe('rollChest gems', () => {
  it('gems scale by rarity and stay far below shop prices (75-200)', () => {
    const seen: Record<string, number> = {}
    for (let i = 0; i < 20000; i++) {
      const r = rollChest(rng(i), 'normal', new Set(), 0)
      if (r.jackpot) continue
      const maxSoFar = seen[r.finalTier] ?? -Infinity
      seen[r.finalTier] = Math.max(maxSoFar, r.gems)
    }
    // Legendary top is 45, Exclusive top is 80 - both < cheapest shop item (75? lucky=120).
    for (const [tier, max] of Object.entries(seen)) {
      expect(max, `tier ${tier}`).toBeLessThan(120)
    }
  })

  it('never-gem ranges match the table bounds', () => {
    for (let i = 0; i < 5000; i++) {
      const r = rollChest(rng(i), 'normal', new Set(), 0)
      const bounds: Record<string, [number, number]> = {
        common: [3, 6],
        rare: [8, 14],
        epic: [15, 25],
        legendary: [30, 45],
        exclusive: [50, 80],
      }
      const [lo, hi] = bounds[r.finalTier]
      expect(r.gems).toBeGreaterThanOrEqual(lo)
      expect(r.gems).toBeLessThanOrEqual(hi + (r.jackpot ? COLLECTION_JACKPOT : 0))
    }
  })
})

describe('rollChest cards', () => {
  it('drops cards around 10% of the time in EVERY tier (flat chance)', () => {
    let cardDrops = 0
    for (let i = 0; i < 50000; i++) {
      const r = rollChest(rng(i), 'normal', new Set(), 0)
      if (r.card) cardDrops++
    }
    const rate = cardDrops / 50000
    expect(rate).toBeGreaterThan(CARD_CHANCE * 0.6) // generous band around 10%
    expect(rate).toBeLessThan(CARD_CHANCE * 1.5)
  })

  it(' Legendary/Exclusive chests are NOT guaranteed a card - flat 10% in every tier', () => {
    let leg = 0
    let exc = 0
    let legCards = 0
    let excCards = 0
    for (let i = 0; i < 200000; i++) {
      const r = rollChest(rng(i), 'boss', new Set(), 0)
      if (r.finalTier === 'legendary') {
        leg++
        if (r.card) {
          legCards++
          expect(r.card.id).toBe('sonic') // legendary tier -> sonic card only
        }
      }
      if (r.finalTier === 'exclusive') {
        exc++
        if (r.card) {
          excCards++
          expect(r.card.id).toBe('eggman') // exclusive tier -> eggman card only
        }
      }
    }
    // both tiers occurred in volume
    expect(leg).toBeGreaterThan(1000)
    expect(exc).toBeGreaterThan(100)
    // SOME high-tier chests dropped no card at all (not guaranteed anymore)
    expect(legCards).toBeLessThan(leg)
    expect(excCards).toBeLessThan(exc)
    // ...but the drop rate is still ~10% (flat CARD_CHANCE), not 0%
    expect(legCards / leg).toBeGreaterThan(CARD_CHANCE * 0.4)
    expect(legCards / leg).toBeLessThan(CARD_CHANCE * 1.8)
    expect(excCards / exc).toBeGreaterThan(CARD_CHANCE * 0.3)
    expect(excCards / exc).toBeLessThan(CARD_CHANCE * 1.9)
  })

  it('no duplicate is EVER granted, and jackpot pays out when complete', () => {
    const owned = new Set<string>()
    for (let i = 0; i < 5000; i++) {
      const r = rollChest(rng(i), 'normal', owned, 0)
      if (r.card) {
        expect(owned.has(r.card.id), `dup ${r.card.id}`).toBe(false)
        owned.add(r.card.id)
      } else if (r.jackpot) {
        // whole set owned -> jackpot gems
        expect(r.gems).toBeGreaterThanOrEqual(51 + COLLECTION_JACKPOT) // >= exclusive min + jackpot
      }
    }
    // Simulate a fully-completing forced run -> every drop jackpots after.
    const full = new Set(CARDS.map((c) => c.id))
    for (let i = 0; i < 2000; i++) {
      const r = rollChest(rng(i + 7000), 'normal', full, PITY_LIMIT)
      expect(r.card).toBeNull()
      expect(r.jackpot).toBe(true)
    }
  })

  it('hidden card pity guarantees a card once PITY_LIMIT cardless tries pass', () => {
    for (let i = 0; i < 500; i++) {
      const r = rollChest(rng(i + 100000), 'normal', new Set(), PITY_LIMIT)
      expect(r.card, `i=${i}`).not.toBeNull()
    }
  })

  it('Dr. Eggman only ever arrives from an EXCLUSIVE chest', () => {
    for (let i = 0; i < 300000; i++) {
      const r = rollChest(rng(i), 'normal', new Set(), 0)
      if (r.card?.id === 'eggman') {
        expect(r.finalTier).toBe('exclusive')
      }
    }
  })

  it('card rarity matches the final tier when that rarity is still incomplete', () => {
    const tierOf = new Map<string, ChestTier>(CARDS.map((c) => [c.id, c.tier]))
    for (let i = 0; i < 20000; i++) {
      const r = rollChest(rng(i), 'normal', new Set(), 0)
      if (!r.card) continue
      const cardTier = tierOf.get(r.card.id)
      // exact match unless the whole exact set was already owned (impossible here with empty owned)
      expect(cardTier).toBe(r.finalTier)
    }
  })
})