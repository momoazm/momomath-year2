import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import { mulberry32 } from '../src/content/rng'
import {
  ALL_CARDS,
  ARCADE_CARDS,
  ARCADE_CARD_BY_ID,
  CARDS,
  CARD_BY_ID,
  CARD_CHANCE,
  COLLECTION_JACKPOT,
  DUST_PER_CARD,
  KICKS,
  PACK_SIZE,
  PITY_LIMIT,
  START_TABLES,
  STAR_THRESHOLDS,
  TIER_META,
  TIER_ORDER,
  chestCopyVariant,
  chestPayout,
  chestTileCount,
  kickTierSequence,
  rollChest,
  rollStartTier,
  starLevel,
  type ChestCard,
  type ChestResult,
  type ChestTier,
} from '../src/engine/cards'
import { usePlayer } from '../src/engine/store'

function rng(s: number) {
  return mulberry32(s)
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

  it('boss rolls can NEVER land on Common', () => {
    for (let i = 0; i < 50000; i++) {
      expect(rollStartTier(rng(i), 'boss')).not.toBe('common')
    }
  })

  it('normal rolls are dominated by Common', () => {
    let common = 0
    const N = 50000
    for (let i = 0; i < N; i++) {
      if (rollStartTier(rng(i), 'normal') === 'common') common++
    }
    expect(common / N).toBeGreaterThan(0.9)
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

describe('pack odds (slots x per-tier chance)', () => {
  const BOUNDS: Record<ChestTier, [number, number]> = {
    common: [3, 6],
    rare: [8, 14],
    epic: [15, 25],
    legendary: [30, 45],
    exclusive: [51, 80],
  }

  it('gems respect each final-tier band', () => {
    for (let i = 0; i < 5000; i++) {
      const r = rollChest(rng(i), 'normal', {}, 0)
      const [lo, hi] = BOUNDS[r.finalTier]
      expect(r.gems).toBeGreaterThanOrEqual(lo)
      expect(r.gems).toBeLessThanOrEqual(hi + (r.jackpot ? COLLECTION_JACKPOT : 0))
    }
  })

  it('per-tier card chance strictly decreases as rarity rises', () => {
    const order: ChestTier[] = ['common', 'rare', 'epic', 'legendary', 'exclusive']
    for (let i = 1; i < order.length; i++) {
      expect(CARD_CHANCE[order[i]]).toBeLessThan(CARD_CHANCE[order[i - 1]])
    }
  })

  it('joint odds (chest rarity x card drop) strictly decrease in every context', () => {
    for (const ctx of Object.keys(START_TABLES) as (keyof typeof START_TABLES)[]) {
      const weights = new Map(START_TABLES[ctx])
      const tiers = (['common', 'rare', 'epic', 'legendary', 'exclusive'] as ChestTier[]).filter(
        (t) => (weights.get(t) ?? 0) > 0,
      )
      const joints = tiers.map((t) => {
        const [sMin, sMax] = PACK_SIZE[t]
        return (weights.get(t) ?? 0) * ((sMin + sMax) / 2) * CARD_CHANCE[t]
      })
      for (let i = 1; i < joints.length; i++) {
        expect(joints[i], `${ctx} tier ${tiers[i]}`).toBeLessThan(joints[i - 1])
      }
    }
  })

  it('card count stays within the tier slot band (1-3)', () => {
    for (const tier of ['common', 'rare', 'epic', 'legendary', 'exclusive'] as ChestTier[]) {
      const [, sMax] = PACK_SIZE[tier]
      for (let i = 0; i < 2000; i++) {
        const r = rollChest(rng(i * 31 + tier.length), 'normal', {}, 0)
        if (r.finalTier !== tier) continue
        expect(r.cards.length, `tier ${tier}`).toBeLessThanOrEqual(sMax)
      }
    }
  })

  it('common-final chests drop ~35% of a card (1 slot)', () => {
    let drops = 0
    let finals = 0
    for (let i = 0; i < 40000; i++) {
      const r = rollChest(rng(i), 'normal', {}, 0)
      if (r.finalTier !== 'common') continue
      finals++
      drops += r.cards.length
    }
    expect(finals).toBeGreaterThan(10000)
    const rate = drops / finals
    expect(rate).toBeGreaterThan(0.28)
    expect(rate).toBeLessThan(0.42)
  })

  it('higher tiers can drop 2-3 cards in one chest', () => {
    let multi = 0
    let finals = 0
    for (let i = 0; i < 40000; i++) {
      const r = rollChest(rng(i + 424242), 'boss', {}, 0)
      if (r.finalTier !== 'exclusive') continue
      finals++
      if (r.cards.length >= 2) multi++
    }
    expect(finals).toBeGreaterThan(100)
    expect(multi).toBeGreaterThan(0) // 3 slots x 10% -> multi-card packs happen
  })

  it('top tiers NO LONGER guarantee a card (odds are decoupled)', () => {
    // Across many boss chests, at least one legendary-final chest drops nothing.
    let emptyLegendary = 0
    let legendaryFinals = 0
    for (let i = 0; i < 60000; i++) {
      const x = rollChest(rng(i + 777000), 'boss', {}, 0)
      if (x.finalTier !== 'legendary') continue
      legendaryFinals++
      if (x.cards.length === 0) emptyLegendary++
    }
    expect(legendaryFinals).toBeGreaterThan(1000)
    expect(emptyLegendary).toBeGreaterThan(0)
  })

  it('every dropped card matches the chest final tier', () => {
    for (let i = 0; i < 20000; i++) {
      const r = rollChest(rng(i), 'normal', {}, 0)
      for (const c of r.cards) {
        expect(c.tier).toBe(r.finalTier)
        expect(CARD_BY_ID[c.cardId]?.tier).toBe(r.finalTier)
      }
    }
  })

  it('Dr. Eggman only ever arrives from an EXCLUSIVE chest', () => {
    for (let i = 0; i < 200000; i++) {
      const r = rollChest(rng(i), 'normal', {}, 0)
      for (const c of r.cards) {
        if (c.cardId === 'eggman') expect(r.finalTier).toBe('exclusive')
      }
    }
  })

  it('exclusive is never upgraded into (start-roll only ceiling)', () => {
    for (let i = 0; i < 50000; i++) {
      const r = rollChest(rng(i + 31337), 'normal', {}, 0)
      if (r.finalTier === 'exclusive') {
        // exclusive can only start exclusive (upgrade chain caps at legendary)
        expect(r.startTier).toBe('exclusive')
      }
    }
  })
})

describe('duplicates climb the escalating star curve', () => {
  // Rigged common-final chest dropping tails (first common pool card).
  const forceCommonTails = () => seqRand([0.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.0, 0.0, 0.0])

  it('first copy is NEW and unlocks immediately', () => {
    const r = rollChest(forceCommonTails(), 'normal', {}, 0)
    expect(r.finalTier).toBe('common')
    expect(r.cards).toHaveLength(1)
    expect(r.cards[0].cardId).toBe('tails')
    expect(r.cards[0].isNew).toBe(true)
    expect(r.cards[0].copiesAfter).toBe(1)
    expect(r.cards[0].leveledUp).toBe(false)
    expect(r.cards[0].starBonus).toBe(0)
  })

  it('repeats bank copies; crossing 3/6/10/15/21 stars up with a gem bonus', () => {
    const second = rollChest(forceCommonTails(), 'normal', { tails: 1 }, 0)
    expect(second.cards[0].isNew).toBe(false)
    expect(second.cards[0].copiesAfter).toBe(2)
    expect(second.cards[0].leveledUp).toBe(false) // 2 copies: still 0 stars
    expect(second.cards[0].starBonus).toBe(DUST_PER_CARD.common * 1)

    const third = rollChest(forceCommonTails(), 'normal', { tails: 2 }, 0)
    expect(third.cards[0].copiesAfter).toBe(3)
    expect(third.cards[0].leveledUp).toBe(true) // 3 copies -> 1 star!
    expect(third.cards[0].starBonus).toBe(DUST_PER_CARD.common * 1)
    expect(starLevel(3)).toBe(1)

    const sixth = rollChest(forceCommonTails(), 'normal', { tails: 5 }, 0)
    expect(sixth.cards[0].leveledUp).toBe(true) // 6 copies -> 2 stars
    expect(sixth.cards[0].starBonus).toBe(DUST_PER_CARD.common * 2)
  })

  it('same-chest repeats star up against each other (Sonic x2 counts)', () => {
    // Exclusive = 3 slots over a 2-card pool; force all drops onto eggman.
    const r = rollChest(seqRand([0.99999, 0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]), 'normal', {}, 0)
    expect(r.finalTier).toBe('exclusive')
    expect(r.cards).toHaveLength(3)
    expect(r.cards[0].isNew).toBe(true)
    expect(r.cards[1].isNew).toBe(false)
    expect(r.cards[1].cardId).toBe(r.cards[0].cardId)
    expect(r.cards[1].copiesAfter).toBe(2)
  })

  it('cardless pity (>= PITY_LIMIT) forces at least one card', () => {
    for (let i = 0; i < 500; i++) {
      const r = rollChest(rng(i + 100000), 'normal', {}, PITY_LIMIT)
      expect(r.cards.length, `i=${i}`).toBeGreaterThan(0)
    }
  })

  it('jackpot pays out when every card is fully maxed', () => {
    const maxed: Record<string, number> = Object.fromEntries(
      CARDS.map((c) => [c.id, STAR_THRESHOLDS[STAR_THRESHOLDS.length - 1]]),
    )
    for (let i = 0; i < 200; i++) {
      const r = rollChest(rng(i + 4242), 'normal', maxed, PITY_LIMIT)
      expect(r.cards).toHaveLength(0)
      expect(r.jackpot).toBe(true)
      expect(r.gems).toBeGreaterThanOrEqual(51 + COLLECTION_JACKPOT)
    }
  })
})

describe('grantChest (store wiring)', () => {
  it('banks +1 copy per card, pays gems + dust, resets pity on any drop', () => {
    usePlayer.setState({ gems: 0, cardStars: { tails: 2 }, cardPity: 9 })
    usePlayer.getState().grantChest({
      startTier: 'common',
      finalTier: 'common',
      upgradesAt: [],
      gems: 5,
      dust: 4,
      cards: [
        { cardId: 'tails', tier: 'common', isNew: false, copiesAfter: 3, leveledUp: true, starBonus: 2 },
        { cardId: 'amy', tier: 'common', isNew: true, copiesAfter: 1, leveledUp: false, starBonus: 0 },
      ],
      jackpot: false,
    })
    const s = usePlayer.getState()
    expect(s.cardStars).toEqual({ tails: 3, amy: 1 })
    expect(s.gems).toBe(9) // 5 gems + 4 dust
    expect(s.cardPity).toBe(0)
  })

  it('a cardless chest grows pity and pays gems only', () => {
    usePlayer.setState({ gems: 100, cardStars: {}, cardPity: 3 })
    usePlayer.getState().grantChest({
      startTier: 'common',
      finalTier: 'common',
      upgradesAt: [],
      gems: 4,
      dust: 0,
      cards: [],
      jackpot: false,
    })
    const s = usePlayer.getState()
    expect(s.gems).toBe(104)
    expect(s.cardPity).toBe(4)
  })
})

describe('WS2 invariant B/C — ChestResult → {copyVariant, tileCount, tierBadge} pure mapping', () => {
  const mkCard = (over: Partial<ChestCard> = {}): ChestCard => ({
    cardId: 'tails',
    tier: 'common',
    isNew: false,
    copiesAfter: 1,
    leveledUp: false,
    starBonus: 0,
    ...over,
  })
  const mkResult = (over: Partial<ChestResult> = {}): ChestResult => ({
    startTier: 'common',
    finalTier: 'common',
    upgradesAt: [],
    gems: 5,
    dust: 0,
    cards: [],
    jackpot: false,
    ...over,
  })

  it('copyVariant priority: jackpot > pity(0 cards) > any NEW > any STAR UP > duplicates', () => {
    expect(chestCopyVariant(mkResult({ jackpot: true }))).toBe('jackpot')
    expect(chestCopyVariant(mkResult())).toBe('pity')
    expect(chestCopyVariant(mkResult({ cards: [mkCard({ isNew: true, copiesAfter: 1 })] }))).toBe('new')
    expect(chestCopyVariant(mkResult({ cards: [mkCard({ copiesAfter: 3, leveledUp: true })] }))).toBe('starUp')
    expect(
      chestCopyVariant(
        mkResult({ cards: [mkCard({ isNew: true }), mkCard({ cardId: 'amy', copiesAfter: 3, leveledUp: true })] }),
      ),
    ).toBe('new')
    expect(chestCopyVariant(mkResult({ cards: [mkCard({ copiesAfter: 2 })] }))).toBe('duplicates')
  })

  it('tileCount === cards.length; 0 means no grid (jackpot/pity)', () => {
    expect(chestTileCount(mkResult({ jackpot: true }))).toBe(0)
    expect(chestTileCount(mkResult())).toBe(0)
    expect(chestTileCount(mkResult({ cards: [mkCard()] }))).toBe(1)
    expect(
      chestTileCount(mkResult({ cards: [mkCard(), mkCard({ cardId: 'amy' }), mkCard({ cardId: 'cream' })] })),
    ).toBe(3)
  })

  it('tierBadge: pre-kick = startTier, upgraded only on exact upgrade kicks, reveal = finalTier', () => {
    const r = mkResult({ startTier: 'common', finalTier: 'epic', upgradesAt: [0, 2] })
    const seq = kickTierSequence(r)
    expect(seq).toHaveLength(KICKS + 1)
    expect(seq[0]).toBe(r.startTier)              // badge before any kick
    expect(seq[1]).toBe('rare')                   // upgrade on exact kick 0
    expect(seq[2]).toBe('rare')                   // kick 1: no upgrade, badge unchanged
    expect(seq[3]).toBe('epic')                   // upgrade on exact kick 2
    expect(seq[seq.length - 1]).toBe(r.finalTier)  // badge at reveal
  })

  it('every rolled chest maps consistently (all contexts, stubbed rand)', () => {
    const ctxs = Object.keys(START_TABLES) as (keyof typeof START_TABLES)[]
    for (let i = 0; i < 4000; i++) {
      const r = rollChest(rng(i * 7919 + 13), ctxs[i % ctxs.length], {}, i % 4 === 0 ? PITY_LIMIT : 0)
      expect(chestTileCount(r), `i=${i}`).toBe(r.cards.length)
      const seq = kickTierSequence(r)
      expect(seq[0], `i=${i}`).toBe(r.startTier)
      expect(seq[seq.length - 1], `i=${i}`).toBe(r.finalTier)
      const variant = chestCopyVariant(r)
      if (r.jackpot) expect(variant, `i=${i}`).toBe('jackpot')
      else if (r.cards.length === 0) expect(variant, `i=${i}`).toBe('pity')
      else if (r.cards.some((c) => c.isNew)) expect(variant, `i=${i}`).toBe('new')
      else if (r.cards.some((c) => c.leveledUp)) expect(variant, `i=${i}`).toBe('starUp')
      else expect(variant, `i=${i}`).toBe('duplicates')
    }
  })
})

describe('WS2 invariant A — kick tier sequence == [start, ...upgradesAt chain]', () => {
  const referenceChain = (r: ChestResult): ChestTier[] => {
    const out: ChestTier[] = [r.startTier]
    let tier = r.startTier
    for (let k = 0; k < KICKS; k++) {
      if (r.upgradesAt.includes(k)) tier = TIER_ORDER[TIER_ORDER.indexOf(tier) + 1]
      out.push(tier)
    }
    return out
  }

  it('derived sequence equals [startTier, ...upgradesAt chain] for every roll', () => {
    const ctxs = Object.keys(START_TABLES) as (keyof typeof START_TABLES)[]
    for (let i = 0; i < 4000; i++) {
      const r = rollChest(rng(i * 104729 + 7), ctxs[i % ctxs.length], {}, i % 5 === 0 ? PITY_LIMIT : 0)
      expect(kickTierSequence(r), `i=${i}`).toEqual(referenceChain(r))
    }
  })

  it('tier changes on EXACTLY the kicks in upgradesAt, never decreases, ends on finalTier', () => {
    const ctxs = Object.keys(START_TABLES) as (keyof typeof START_TABLES)[]
    for (let i = 0; i < 4000; i++) {
      const r = rollChest(rng(i * 15485863 + 11), ctxs[i % ctxs.length], {}, i % 3 === 0 ? PITY_LIMIT : 0)
      const seq = kickTierSequence(r)
      expect(seq).toHaveLength(KICKS + 1)
      const changedAt: number[] = []
      for (let k = 1; k < seq.length; k++) {
        if (seq[k] !== seq[k - 1]) changedAt.push(k - 1)
        expect(TIER_ORDER.indexOf(seq[k]), `i=${i} kick=${k}`).toBeGreaterThanOrEqual(
          TIER_ORDER.indexOf(seq[k - 1]),
        )
      }
      expect(changedAt, `i=${i}`).toEqual(r.upgradesAt)
      expect(r.upgradesAt.length, `i=${i}`).toBeLessThanOrEqual(KICKS)
      expect(seq[0], `i=${i}`).toBe(r.startTier)
      expect(seq[seq.length - 1], `i=${i}`).toBe(r.finalTier)
    }
  })

  it('edge sequences are fixed-length and never leave the ladder', () => {
    expect(kickTierSequence({ startTier: 'common', upgradesAt: [] })).toEqual([
      'common', 'common', 'common', 'common', 'common',
    ])
    expect(kickTierSequence({ startTier: 'common', upgradesAt: [0, 1, 2] })).toEqual([
      'common', 'rare', 'epic', 'legendary', 'legendary',
    ])
    expect(kickTierSequence({ startTier: 'epic', upgradesAt: [1] })).toEqual([
      'epic', 'epic', 'legendary', 'legendary', 'legendary',
    ])
    expect(kickTierSequence({ startTier: 'legendary', upgradesAt: [] })).toEqual([
      'legendary', 'legendary', 'legendary', 'legendary', 'legendary',
    ])
    expect(kickTierSequence({ startTier: 'exclusive', upgradesAt: [0] })).toEqual([
      'exclusive', 'exclusive', 'exclusive', 'exclusive', 'exclusive',
    ])
  })
})

describe('WS2 — economy monotonicity guards', () => {
  it('CARD_CHANCE strictly decreases across the exported TIER_ORDER', () => {
    for (let i = 1; i < TIER_ORDER.length; i++) {
      expect(CARD_CHANCE[TIER_ORDER[i]], TIER_ORDER[i]).toBeLessThan(CARD_CHANCE[TIER_ORDER[i - 1]])
    }
  })

  it('PACK_SIZE ranges are valid (1 ≤ min ≤ max ≤ 3, maxes non-decreasing up the ladder)', () => {
    let prevMax = 0
    for (const t of TIER_ORDER) {
      const [min, max] = PACK_SIZE[t]
      expect(min, `${t} min`).toBeGreaterThanOrEqual(1)
      expect(max, `${t} max >= min`).toBeGreaterThanOrEqual(min)
      expect(max, `${t} max`).toBeLessThanOrEqual(3)
      expect(max, `${t} max >= previous tier max`).toBeGreaterThanOrEqual(prevMax)
      prevMax = max
    }
  })

  it("every roll's card count fits inside PACK_SIZE[finalTier] (slots are a ceiling)", () => {
    const ctxs = Object.keys(START_TABLES) as (keyof typeof START_TABLES)[]
    for (let i = 0; i < 4000; i++) {
      const r = rollChest(rng(i * 31 + 5), ctxs[i % ctxs.length], {}, i % 3 === 0 ? PITY_LIMIT : 0)
      const [, sMax] = PACK_SIZE[r.finalTier]
      expect(r.cards.length, `i=${i}`).toBeLessThanOrEqual(sMax)
      if (r.jackpot) expect(r.cards.length, `i=${i}`).toBe(0)
    }
  })

  it('TIER_META covers every tier in TIER_ORDER (single color source, hex color + label)', () => {
    for (const t of TIER_ORDER) {
      expect(TIER_META[t], t).toBeDefined()
      expect(TIER_META[t].color, t).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(TIER_META[t].label.length, t).toBeGreaterThan(0)
    }
  })
})

describe('WS2 invariant D — reveal totals == grantChest payout', () => {
  it('chestPayout equals the gem delta grantChest persists (×1 normal, ×2 all-maxed)', () => {
    usePlayer.setState({ gems: 0, cardStars: {}, cardPity: 0 })
    const normal: ChestResult = {
      startTier: 'common',
      finalTier: 'common',
      upgradesAt: [],
      gems: 6,
      dust: 4,
      cards: [{ cardId: 'amy', tier: 'common', isNew: true, copiesAfter: 1, leveledUp: false, starBonus: 0 }],
      jackpot: false,
    }
    usePlayer.getState().grantChest(normal)
    const afterNormal = usePlayer.getState()
    const paidNormal = chestPayout(normal, afterNormal.cardStars)
    expect(paidNormal).toEqual({ gems: 6, dust: 4 })
    expect(afterNormal.gems).toBe(paidNormal.gems + paidNormal.dust)

    usePlayer.setState({ gems: 10, cardStars: { tails: 21 }, cardPity: 0 })
    const maxed: ChestResult = {
      startTier: 'common',
      finalTier: 'common',
      upgradesAt: [1],
      gems: 6,
      dust: 10,
      cards: [{ cardId: 'tails', tier: 'common', isNew: false, copiesAfter: 22, leveledUp: false, starBonus: 10 }],
      jackpot: false,
    }
    usePlayer.getState().grantChest(maxed)
    const afterMaxed = usePlayer.getState()
    const paidMaxed = chestPayout(maxed, afterMaxed.cardStars)
    expect(paidMaxed).toEqual({ gems: 12, dust: 20 })
    expect(afterMaxed.gems).toBe(10 + paidMaxed.gems + paidMaxed.dust)
  })

  it('jackpot (no cards) never doubles — payout is exactly the rolled gems', () => {
    const jackpot: ChestResult = {
      startTier: 'exclusive',
      finalTier: 'exclusive',
      upgradesAt: [],
      gems: 305,
      dust: 0,
      cards: [],
      jackpot: true,
    }
    expect(chestPayout(jackpot, {})).toEqual({ gems: 305, dust: 0 })
  })
})

describe('WS4c roster (full 100-card collection, PLAN.md §7 + §10)', () => {
  /** Exact PLAN §7 chest band after moving fang/bean/bark to ARCADE_CARDS:
   *  39/25/18/10/5 = 97 chest cards; ALL_CARDS = 97 + 3 arcade = 100. */
  const PLAN_BAND: Record<ChestTier, [number, number]> = {
    common: [39, 39],
    rare: [25, 25],
    epic: [18, 18],
    legendary: [10, 10],
    exclusive: [5, 5],
  }

  it('chest roster count is exactly the plan total (97)', () => {
    expect(CARDS.length).toBe(97)
  })

  it('ALL_CARDS is exactly 100 (97 chest + 3 arcade exclusives)', () => {
    expect(ALL_CARDS).toHaveLength(100)
    expect(ARCADE_CARDS).toHaveLength(3)
    expect(CARDS.length + ARCADE_CARDS.length).toBe(ALL_CARDS.length)
  })

  it('arcade exclusives are exclusive-tier, source arcade, and disjoint from CARDS', () => {
    const chestIds = new Set(CARDS.map((c) => c.id))
    for (const c of ARCADE_CARDS) {
      expect(c.tier, c.id).toBe('exclusive')
      expect(c.source, c.id).toBe('arcade')
      expect(chestIds.has(c.id), c.id).toBe(false)
      expect(ARCADE_CARD_BY_ID[c.id], c.id).toBe(c)
      expect(ALL_CARDS).toContain(c)
    }
    expect(new Set(ARCADE_CARDS.map((c) => c.id)).size).toBe(3)
  })

  it('rollChest never drops an arcade exclusive id', () => {
    const arcadeIds = new Set(ARCADE_CARDS.map((c) => c.id))
    for (let i = 0; i < 5000; i++) {
      const r = rollChest(rng(i * 17 + 3), 'normal', {}, i % 3 === 0 ? PITY_LIMIT : 0)
      for (const card of r.cards) {
        expect(arcadeIds.has(card.cardId), card.cardId).toBe(false)
      }
    }
    // pool subset: every tier pool is built from CARDS only
    for (const tier of TIER_ORDER) {
      const pool = CARDS.filter((c) => c.tier === tier).map((c) => c.id)
      for (const id of pool) expect(arcadeIds.has(id), id).toBe(false)
    }
  })

  it('every arcade exclusive image exists on disk under public/', () => {
    for (const c of ARCADE_CARDS) {
      const file = new URL(`../public/${c.image}`, import.meta.url)
      expect(existsSync(file), `${c.id} -> ${c.image}`).toBe(true)
    }
  })

  it('tier distribution stays within the plan ranges', () => {
    for (const tier of TIER_ORDER) {
      const count = CARDS.filter((c) => c.tier === tier).length
      const [lo, hi] = PLAN_BAND[tier]
      expect(count, `${tier} count`).toBeGreaterThanOrEqual(lo)
      expect(count, `${tier} count`).toBeLessThanOrEqual(hi)
    }
  })

  it('every tier has a non-empty pool (drawCardId never returns null)', () => {
    for (const tier of TIER_ORDER) {
      expect(CARDS.some((c) => c.tier === tier), tier).toBe(true)
    }
  })

  it('ids are unique, non-empty strings and look up via CARD_BY_ID', () => {
    const ids = CARDS.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const c of CARDS) {
      expect(c.id.length, JSON.stringify(c.id)).toBeGreaterThan(0)
      expect(CARD_BY_ID[c.id], c.id).toBe(c)
      expect(c.name.length).toBeGreaterThan(0)
      expect(c.flavor.length).toBeGreaterThan(0)
    }
  })

  it('every CARDS[].image file exists on disk under public/', () => {
    for (const c of CARDS) {
      const file = new URL(`../public/${c.image}`, import.meta.url)
      expect(existsSync(file), `${c.id} -> ${c.image}`).toBe(true)
    }
  })
})

describe('drop-economy monotonicity + pack size validity (WS4b)', () => {
  it('CARD_CHANCE strictly decreases common→exclusive', () => {
    for (let i = 1; i < TIER_ORDER.length; i++) {
      expect(CARD_CHANCE[TIER_ORDER[i]], TIER_ORDER[i]).toBeLessThan(
        CARD_CHANCE[TIER_ORDER[i - 1]],
      )
    }
  })

  it('PACK_SIZE has valid min/max (1 ≤ min ≤ max ≤ 3) for every tier', () => {
    for (const tier of TIER_ORDER) {
      const [min, max] = PACK_SIZE[tier]
      expect(Number.isInteger(min), tier).toBe(true)
      expect(Number.isInteger(max), tier).toBe(true)
      expect(min, tier).toBeGreaterThanOrEqual(1)
      expect(max, tier).toBeGreaterThanOrEqual(min)
      expect(max, tier).toBeLessThanOrEqual(3)
    }
  })
})
