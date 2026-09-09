import { describe, expect, it } from 'vitest'
import { mulberry32 } from '../src/content/rng'
import {
  CARDS,
  CARD_CHANCE,
  CARD_SLOTS,
  COLLECTION_JACKPOT,
  MAX_STARS,
  PITY_LIMIT,
  START_TABLES,
  STAR_GEMS,
  TIER_ORDER,
  resolveChest,
  rollChest,
  rollStartTier,
  tierIndex,
  type ChestTier,
} from '../src/engine/cards'

function rng(seed: number) {
  return mulberry32(seed)
}

/** Deterministic rand from a fixed sequence (repeats the last value). */
function seqRand(values: number[]) {
  let i = 0
  return () => values[Math.min(i++, values.length - 1)]
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
})

describe('rollChest gems', () => {
  const BOUNDS: Record<string, [number, number]> = {
    common: [3, 6],
    rare: [8, 14],
    epic: [15, 25],
    legendary: [30, 45],
    exclusive: [51, 80],
    mythic: [60, 100],
    ultimate: [90, 150],
    hyper: [120, 200],
  }

  it('gems scale by rarity and respect each tier band', () => {
    const seen: Record<string, number> = {}
    for (let i = 0; i < 20000; i++) {
      const r = rollChest(rng(i), 'normal', {}, 0)
      if (r.jackpot) continue
      const maxSoFar = seen[r.finalTier] ?? -Infinity
      seen[r.finalTier] = Math.max(maxSoFar, r.gems)
    }
    // No tier pays above its own band top (common..exclusive stay well below
    // shop prices; mythic/ultimate/hyper are the jackpot-tier reward).
    for (const [tier, max] of Object.entries(seen)) {
      expect(max, `tier ${tier}`).toBeLessThanOrEqual(BOUNDS[tier][1])
    }
  })

  it('never-gem ranges match the table bounds', () => {
    for (let i = 0; i < 5000; i++) {
      const r = rollChest(rng(i), 'normal', {}, 0)
      const [lo, hi] = BOUNDS[r.finalTier]
      expect(r.gems).toBeGreaterThanOrEqual(lo)
      expect(r.gems).toBeLessThanOrEqual(hi + (r.jackpot ? COLLECTION_JACKPOT : 0))
    }
  })
})

describe('rollChest cards (slots x per-tier chance)', () => {
  it('per-tier card chance is honored: common slots drop ~35%', () => {
    let drops = 0
    const N = 20000
    for (let i = 0; i < N; i++) {
      const r = resolveChest(rng(i), {}, 0, 'common', 'common', [], 1)
      drops += r.cards.length
    }
    // common = exactly 1 slot x 0.35
    const rate = drops / N
    expect(rate).toBeGreaterThan(0.28)
    expect(rate).toBeLessThan(0.42)
  })

  it('card chance strictly decreases as rarity rises', () => {
    const chances = TIER_ORDER.map((t) => CARD_CHANCE[t])
    for (let i = 1; i < chances.length; i++) {
      expect(chances[i]).toBeLessThan(chances[i - 1])
    }
  })

  it('joint odds (chest rarity x card drop) strictly decrease in every context', () => {
    // The product owner rule: rarer chest + rarer card = strictly rarer event.
    for (const ctx of ['normal', 'boss', 'lucky'] as const) {
      const weights = new Map(START_TABLES[ctx])
      const joints = TIER_ORDER.filter((t) => (weights.get(t) ?? 0) > 0).map((t) => {
        const [sMin, sMax] = CARD_SLOTS[t]
        const avgSlots = (sMin + sMax) / 2
        return (weights.get(t) ?? 0) * avgSlots * CARD_CHANCE[t]
      })
      for (let i = 1; i < joints.length; i++) {
        expect(joints[i], `${ctx} tier ${i}`).toBeLessThan(joints[i - 1])
      }
    }
  })

  it('card count never exceeds the tier slot max (1-3)', () => {
    for (const tier of TIER_ORDER) {
      const [, sMax] = CARD_SLOTS[tier]
      for (let i = 0; i < 2000; i++) {
        const r = resolveChest(rng(i * 31 + tier.length), {}, 0, tier, tier, [], 1)
        expect(r.cards.length, `tier ${tier}`).toBeLessThanOrEqual(sMax)
      }
    }
  })

  it('higher tiers can drop 2-3 cards in one chest', () => {
    let multi = 0
    for (let i = 0; i < 20000; i++) {
      const r = resolveChest(rng(i + 424242), {}, 0, 'hyper', 'hyper', [], 1)
      if (r.cards.length >= 2) multi++
    }
    expect(multi).toBeGreaterThan(0) // 3 slots x 7% -> multi-card chests happen
  })

  it('legendary+ chests NO LONGER guarantee a card (odds are decoupled)', () => {
    // Rigged rand: every chance roll misses.
    const r = resolveChest(seqRand([0.5, 0.99, 0.99, 0.99]), {}, 0, 'legendary', 'legendary', [], 1)
    expect(r.cards).toHaveLength(0)
    expect(r.jackpot).toBe(false)
  })

  it('duplicates STAR UP the card and pay a gem bonus', () => {
    // Common = 1 slot: force a drop of the first common card, three times.
    const force = () => seqRand([0.5, 0.0, 0.0, 0.0])
    const first = resolveChest(force(), {}, 0, 'common', 'common', [], 1)
    expect(first.cards).toHaveLength(1)
    expect(first.cards[0].isNew).toBe(true)
    expect(first.cards[0].starAfter).toBe(0)
    expect(first.cards[0].starBonus).toBe(0)

    const stars = { [first.cards[0].id]: 0 }
    const second = resolveChest(force(), stars, 0, 'common', 'common', [], 1)
    expect(second.cards[0].isNew).toBe(false)
    expect(second.cards[0].starAfter).toBe(1)
    expect(second.cards[0].starBonus).toBe(STAR_GEMS.common * 1)

    const third = resolveChest(force(), { [first.cards[0].id]: 1 }, 0, 'common', 'common', [], 1)
    expect(third.cards[0].starAfter).toBe(2)
    expect(third.cards[0].starBonus).toBe(STAR_GEMS.common * 2)
  })

  it('stars cap at MAX_STARS and the same chest can repeat a card', () => {
    // Hyper = 3 slots, pool of 2: force all drops onto the first pool card.
    const r = resolveChest(seqRand([0.5, 0.0, 0, 0, 0, 0, 0, 0]), {}, 0, 'hyper', 'hyper', [], 1)
    expect(r.cards).toHaveLength(3)
    expect(r.cards[0].isNew).toBe(true)
    expect(r.cards[1].isNew).toBe(false)
    expect(r.cards[1].id).toBe(r.cards[0].id)

    const capped = resolveChest(seqRand([0.5, 0.0, 0.0]), { tails: MAX_STARS }, 0, 'common', 'common', [], 1)
    expect(capped.cards[0].starAfter).toBe(MAX_STARS)
  })

  it('hidden card pity guarantees at least one card once PITY_LIMIT passes', () => {
    for (let i = 0; i < 500; i++) {
      const r = rollChest(rng(i + 100000), 'normal', {}, PITY_LIMIT)
      expect(r.cards.length, `i=${i}`).toBeGreaterThan(0)
    }
  })

  it('jackpot pays out when every card is fully maxed', () => {
    const maxed: Record<string, number> = Object.fromEntries(CARDS.map((c) => [c.id, MAX_STARS]))
    for (let i = 0; i < 200; i++) {
      const r = resolveChest(rng(i + 4242), maxed, PITY_LIMIT, 'common', 'rare', [], 1)
      expect(r.cards).toHaveLength(0)
      expect(r.jackpot).toBe(true)
      expect(r.gems).toBeGreaterThanOrEqual(51 + COLLECTION_JACKPOT)
    }
  })

  it('Mythic/Ultimate/Hyper can only ever be a start roll, never a kick upgrade', () => {
    for (let i = 0; i < 100000; i++) {
      const r = rollChest(rng(i + 31337), 'normal', {}, 0)
      if (r.finalTier === 'mythic' || r.finalTier === 'ultimate' || r.finalTier === 'hyper') {
        expect(r.startTier).toBe(r.finalTier)
        expect(r.upgradesAt).toHaveLength(0)
      }
    }
  })

  it('Hyper is the rarest start roll in every context', () => {
    for (const ctx of ['normal', 'boss', 'lucky'] as const) {
      const table = new Map(START_TABLES[ctx])
      expect(table.get('hyper')).toBeGreaterThan(0)
      expect(table.get('hyper')!).toBeLessThan(table.get('ultimate')!)
      expect(table.get('hyper')!).toBeLessThan(table.get('mythic')!)
    }
  })

  it('Dr. Eggman only ever arrives from an EXCLUSIVE chest', () => {
    for (let i = 0; i < 300000; i++) {
      const r = rollChest(rng(i), 'normal', {}, 0)
      for (const c of r.cards) {
        if (c.id === 'eggman') expect(r.finalTier).toBe('exclusive')
      }
    }
  })

  it('variant cards only arrive from their own tier chest', () => {
    const origin: Record<string, ChestTier> = {
      'classic-sonic': 'rare',
      'movie-tails': 'epic',
      'movie-knuckles': 'epic',
      'werehog-sonic': 'epic',
      'neo-metal': 'legendary',
      'movie-sonic': 'mythic',
      'movie-shadow': 'mythic',
      'super-sonic': 'ultimate',
      'super-shadow': 'ultimate',
      'hyper-sonic': 'hyper',
      'hyper-shadow': 'hyper',
    }
    const hits = new Set<string>()
    for (let i = 0; i < 300000; i++) {
      const r = rollChest(rng(i + 777000), 'boss', {}, 0)
      for (const c of r.cards) {
        if (c.id in origin) {
          hits.add(c.id)
          expect(r.finalTier).toBe(origin[c.id])
        }
      }
    }
    for (const id of Object.keys(origin)) {
      expect(hits.has(id), `${id} never dropped`).toBe(true)
    }
  })

  it('every dropped card matches the chest final tier', () => {
    const tierOf = new Map<string, ChestTier>(CARDS.map((c) => [c.id, c.tier]))
    for (let i = 0; i < 20000; i++) {
      const r = rollChest(rng(i), 'normal', {}, 0)
      for (const c of r.cards) {
        expect(tierOf.get(c.id)).toBe(r.finalTier)
      }
    }
  })
})

describe('resolveChest (interactive 4-kick ritual)', () => {
  const BOUNDS: Record<string, [number, number]> = {
    common: [3, 6],
    rare: [8, 14],
    epic: [15, 25],
    legendary: [30, 45],
    exclusive: [51, 80],
    mythic: [60, 100],
    ultimate: [90, 150],
    hyper: [120, 200],
  }

  it('pays the final-tier gem band times gemMult', () => {
    for (let i = 0; i < 2000; i++) {
      const r = resolveChest(rng(i), {}, 0, 'common', 'epic', [1], 1)
      expect(r.startTier).toBe('common')
      expect(r.finalTier).toBe('epic')
      expect(r.upgradesAt).toEqual([1])
      const [lo, hi] = BOUNDS.epic
      expect(r.gems).toBeGreaterThanOrEqual(lo)
      expect(r.gems).toBeLessThanOrEqual(hi)
      const doubled = resolveChest(rng(i), {}, 0, 'common', 'epic', [1], 2)
      expect(doubled.gems).toBe(r.gems * 2)
    }
  })

  it('card events carry tier-correct ids and star economics', () => {
    for (const tier of ['legendary', 'exclusive', 'mythic', 'ultimate', 'hyper'] as const) {
      let sawCard = false
      for (let i = 0; i < 2000; i++) {
        const r = resolveChest(rng(i + tier.length * 7919), {}, 0, tier, tier, [], 1)
        if (r.cards.length === 0) continue
        sawCard = true
        // First card of a fresh chest is always NEW; later slots may star up.
        expect(r.cards[0].isNew).toBe(true)
        for (const c of r.cards) {
          const def = CARDS.find((d) => d.id === c.id)
          expect(def?.tier).toBe(tier)
          if (c.isNew) {
            expect(c.starAfter).toBe(0)
            expect(c.starBonus).toBe(0)
          } else {
            expect(c.starAfter).toBeGreaterThanOrEqual(1)
            expect(c.starBonus).toBe(STAR_GEMS[tier] * c.starAfter)
          }
        }
      }
      expect(sawCard, `tier ${tier} never dropped`).toBe(true)
    }
  })

  it('jackpots when the collection is fully maxed', () => {
    const maxed: Record<string, number> = Object.fromEntries(CARDS.map((c) => [c.id, MAX_STARS]))
    for (let i = 0; i < 200; i++) {
      const r = resolveChest(rng(i + 4242), maxed, PITY_LIMIT, 'common', 'rare', [], 1)
      expect(r.cards).toHaveLength(0)
      expect(r.jackpot).toBe(true)
      expect(r.gems).toBeGreaterThanOrEqual(51 + COLLECTION_JACKPOT)
    }
  })

  it('matches rollChest drop rates on the same kick path', () => {
    let resolved = 0
    let auto = 0
    const N = 20000
    for (let i = 0; i < N; i++) {
      resolved += resolveChest(rng(i), {}, 0, 'common', 'common', [], 1).cards.length
      const r = rollChest(rng(i + 999999), 'normal', {}, 0)
      if (r.finalTier === 'common') auto += r.cards.length
    }
    // Common = 1 slot x 0.35 on an empty album; allow wide bands.
    expect(resolved / N).toBeGreaterThan(0.28)
    expect(resolved / N).toBeLessThan(0.42)
    expect(auto / N).toBeGreaterThan(0.15)
  })
})
