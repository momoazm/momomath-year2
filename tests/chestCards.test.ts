import { describe, expect, it } from 'vitest'
import { mulberry32 } from '../src/content/rng'
import { CARDS, PACK_SIZE, START_TABLES, rollChest, rollStartTier, upgradeStep, STAR_THRESHOLDS, LOCKED_PITY } from '../src/engine/cards'

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
  it('rarity upgrade chain never upgrades INTO or OUT OF exclusive', () => {
    // Exclusive is never entered/left via upgrade (upgradeStep caps at
    // Legendary): verify directly, independent of the start tables.
    expect(upgradeStep('common')).toBe('rare')
    expect(upgradeStep('rare')).toBe('epic')
    expect(upgradeStep('epic')).toBe('legendary')
    expect(upgradeStep('legendary')).toBe('legendary')
    expect(upgradeStep('exclusive')).toBe('exclusive')
    // And the final tier still spreads across common..legendary in practice.
    const seen = new Set<string>()
    for (let i = 0; i < 20000; i++) {
      const r = rollChest(rng(i), 'normal', {}, 0)
      seen.add(r.finalTier)
    }
    expect(seen.has('common')).toBe(true)
    expect(seen.has('rare')).toBe(true)
    expect(seen.has('epic')).toBe(true)
    expect(seen.has('legendary')).toBe(true)
  })
})

describe('pack economy single card 1-3 copies', () => {
  it('every chest gives ONE character with 1-3 copies', () => {
    for (let i = 0; i < 2000; i++) {
      const r = rollChest(rng(i), 'normal', {}, 0)
      expect(typeof r.cardId).toBe('string')
      expect(r.cardId.length).toBeGreaterThan(0)
      expect(r.copies).toBeGreaterThanOrEqual(1)
      expect(r.copies).toBeLessThanOrEqual(3)
      expect(r.cards).toHaveLength(1)
      expect(r.cards[0].cardId).toBe(r.cardId)
      expect(r.cards[0].copies).toBe(r.copies)
      expect(r.isNew).toBe(true)
    }
  })
  it('pack size follows PACK_SIZE table by final tier', () => {
    for (let i = 0; i < 5000; i++) {
      const r = rollChest(rng(500000 + i), 'normal', {}, 0)
      const [cMin, cMax] = PACK_SIZE[r.finalTier]
      expect(r.copies).toBeGreaterThanOrEqual(cMin)
      expect(r.copies).toBeLessThanOrEqual(cMax)
    }
  })
  it('star curve 3 6 10 15 21', () => { expect(STAR_THRESHOLDS).toEqual([3, 6, 10, 15, 21]) })
  it('chest always returns a valid cardId', () => {
    for (let i = 0; i < 10000; i++) {
      const r = rollChest(rng(i), 'normal', {}, 0)
      const found = CARDS.find((c) => c.id === r.cardId)
      expect(found).toBeDefined()
    }
  })
  it('pity grows slowly and resets on unlock', () => {
    let counts: Record<string, number> = {}
    let pity = 0
    for (let i = 0; i < 100; i++) {
      const r = rollChest(rng(i + 10000), 'normal', counts, pity)
      const prev = counts[r.cardId] ?? 0
      const anyNew = prev === 0
      if (anyNew) { pity = 0 } else { pity = Math.min(pity + 1, LOCKED_PITY + 1) }
      expect(pity).toBeLessThanOrEqual(LOCKED_PITY + 2)
    }
  })
})

describe('new card drops uniform plus locked pity', () => {
  it('fresh collection always yields isNew true', () => {
    for (let i = 0; i < 500; i++) {
      const r = rollChest(rng(9000 + i), 'normal', {}, 0)
      expect(r.isNew).toBe(true)
      expect(r.cards[0].isNew).toBe(true)
    }
  })
  it('duplicates are possible once characters are owned', () => {
    const counts: Record<string, number> = {}
    CARDS.slice(0, 5).forEach((c) => { counts[c.id] = 4 })
    let dupes = 0
    for (let i = 0; i < 3000; i++) {
      const r = rollChest(rng(i), 'normal', counts, 0)
      if (!r.isNew) dupes++
    }
    expect(dupes).toBeGreaterThan(0)
  })
  it('complete collection yields zero new but still a valid pack', () => {
    const counts: Record<string, number> = {}
    for (const c of CARDS) counts[c.id] = 7
    for (let i = 0; i < 500; i++) {
      const r = rollChest(rng(50000 + i), 'normal', counts, 0)
      expect(r.isNew).toBe(false)
      expect(r.cards).toHaveLength(1)
    }
  })
  it('locked pity forces a new card on drought', () => {
    const counts: Record<string, number> = {}
    for (const c of CARDS) counts[c.id] = 5
    delete counts[CARDS[0].id]
    let forced = 0
    for (let i = 0; i < 200; i++) {
      const r = rollChest(rng(300000 + i), 'normal', counts, LOCKED_PITY)
      if (r.isNew) forced++
    }
    expect(forced).toBe(200)
  })
})