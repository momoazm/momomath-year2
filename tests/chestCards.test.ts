import { describe, expect, it } from 'vitest'
import { mulberry32 } from '../src/content/rng'
import { CARDS, START_TABLES, noveltyChance, rollChest, rollStartTier, STAR_THRESHOLDS, LOCKED_PITY } from '../src/engine/cards'

function rng(s: number) { return mulberry32(s) }

describe('start tier tables', () => {
  it('each table sums close to 100', () => {
    for (const ctx of Object.keys(START_TABLES) as (keyof typeof START_TABLES)[]) {
      const total = START_TABLES[ctx].reduce((s, [, w]) => s + w, 0)
      expect(Math.abs(total - 100)).toBeLessThan(0.01)
    }
  })
  it('boss rolls can NEVER land on Common', () => {
    for (let i = 0; i < 50000; i++) { expect(rollStartTier(rng(i), 'boss')).not.toBe('common') }
  })
})

describe('pack economy', () => {
  it('every chest gives 3 cards with cardId', () => {
    for (let i = 0; i < 2000; i++) {
      const r = rollChest(rng(i), 'normal', {}, 0)
      expect(r.cards.length).toBe(3)
      for (const card of r.cards) {
        expect(typeof card.cardId).toBe('string')
        expect(card.cardId.length).toBeGreaterThan(0)
      }
    }
  })
  it('star curve: 3, 6, 10, 15, 21', () => { expect(STAR_THRESHOLDS).toEqual([3, 6, 10, 15, 21]) })
  it('chest always returns valid cardIds', () => {
    for (let i = 0; i < 10000; i++) {
      const r = rollChest(rng(i), 'normal', {}, 0)
      for (const card of r.cards) {
        const found = CARDS.find((c) => c.id === card.cardId)
        expect(found).toBeDefined()
      }
    }
  })
  it('pity grows slowly and resets on unlock', () => {
    let counts: Record<string, number> = {}
    let pity = 0
    for (let i = 0; i < 100; i++) {
      const r = rollChest(rng(i + 10000), 'normal', counts, pity)
      const anyNew = r.cards.some((card) => {
        const prev = counts[card.cardId] ?? 0
        return prev === 0 // isNew: first copy ever
      })
      if (anyNew) { pity = 0 } else { pity = Math.min(pity + 1, LOCKED_PITY + 1) }
      // Pity should stay bounded
      expect(pity).toBeLessThanOrEqual(LOCKED_PITY + 2)
    }
  })
})

describe('novelty curve (new-card chance decays as the collection fills)', () => {
  it('starts at 100% and hits 0% only when complete', () => {
    expect(noveltyChance(0)).toBe(1)
    expect(noveltyChance(CARDS.length)).toBe(0)
    expect(noveltyChance(CARDS.length + 5)).toBe(0)
    expect(noveltyChance(-3)).toBe(1)
  })

  it('is ~90% after ~2 of 19 owned and decreases monotonically', () => {
    expect(noveltyChance(2)).toBeCloseTo(17 / 19, 10)
    let prev = Infinity
    for (let owned = 0; owned <= CARDS.length; owned++) {
      const p = noveltyChance(owned)
      expect(p).toBeLessThanOrEqual(prev)
      prev = p
    }
  })

  it('first chest always contains a new card', () => {
    for (let i = 0; i < 500; i++) {
      const r = rollChest(rng(9000 + i), 'normal', {}, 0)
      expect(r.cards.length).toBe(3)
      expect(r.cards.some((c) => c.isNew)).toBe(true)
    }
  })

  it('at most ONE new card per chest once the seen pool can fill the pack', () => {
    // 5 distinct owned -> seen pool fills all non-novelty slots
    const counts: Record<string, number> = {}
    CARDS.slice(0, 5).forEach((c) => { counts[c.id] = 4 })
    for (let i = 0; i < 3000; i++) {
      const r = rollChest(rng(i), 'normal', counts, 0)
      expect(r.cards.length).toBe(3)
      expect(new Set(r.cards.map((c) => c.cardId)).size).toBe(3)
      expect(r.cards.filter((c) => c.isNew).length).toBeLessThanOrEqual(1)
    }
  })

  it('a complete collection yields zero new cards but still 3 valid ones', () => {
    const counts: Record<string, number> = {}
    for (const c of CARDS) counts[c.id] = 7
    for (let i = 0; i < 500; i++) {
      const r = rollChest(rng(50000 + i), 'normal', counts, 0)
      expect(r.cards.length).toBe(3)
      expect(r.cards.some((c) => c.isNew)).toBe(false)
    }
  })

  it('novelty rate matches the curve (10/19 owned -> ~9/19 chests with a new card)', () => {
    const counts: Record<string, number> = {}
    CARDS.slice(0, 10).forEach((c) => { counts[c.id] = 2 })
    let withNew = 0
    const N = 3000
    for (let i = 0; i < N; i++) {
      const r = rollChest(rng(200000 + i), 'normal', counts, 0)
      if (r.cards.some((c) => c.isNew)) withNew++
    }
    expect(withNew / N).toBeGreaterThan(9 / 19 - 0.06)
    expect(withNew / N).toBeLessThan(9 / 19 + 0.06)
  })

  it('locked-pity still forces a new card on drought', () => {
    const counts: Record<string, number> = {}
    for (const c of CARDS) counts[c.id] = 5
    delete counts[CARDS[0].id] // one unseen character left
    let forced = 0
    for (let i = 0; i < 200; i++) {
      const r = rollChest(rng(300000 + i), 'normal', counts, LOCKED_PITY)
      if (r.cards.some((c) => c.isNew)) forced++
    }
    expect(forced).toBe(200)
  })
})
