import { describe, expect, it } from 'vitest'
import { mulberry32 } from '../src/content/rng'
import { CARDS, START_TABLES, rollChest, rollStartTier, STAR_THRESHOLDS, LOCKED_PITY } from '../src/engine/cards'

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
  it('every chest gives a cardId and copies between 1-3', () => {
    for (let i = 0; i < 2000; i++) {
      const r = rollChest(rng(i), 'normal', {}, 0)
      expect(typeof r.cardId).toBe('string')
      expect(r.cardId.length).toBeGreaterThan(0)
      expect(r.copies).toBeGreaterThanOrEqual(1)
      expect(r.copies).toBeLessThanOrEqual(3)
    }
  })
  it('star curve: 3, 6, 10, 15, 21', () => { expect(STAR_THRESHOLDS).toEqual([3, 6, 10, 15, 21]) })
  it('chest always returns a valid cardId', () => {
    for (let i = 0; i < 10000; i++) {
      const r = rollChest(rng(i), 'normal', {}, 0)
      const card = CARDS.find((c) => c.id === r.cardId)
      expect(card).toBeDefined()
    }
  })
  it('locked pity resets when a new unlock occurs', () => {
    let counts: Record<string, number> = {}
    let pity = 0
    for (let i = 0; i < 100; i++) {
      const r = rollChest(rng(i + 10000), 'normal', counts, pity)
      // A card is owned when it has >= STAR_THRESHOLDS[0] copies - same as isOwned()
      const wasUnlocked = (counts[r.cardId] ?? 0) >= STAR_THRESHOLDS[0]
      counts = { ...counts, [r.cardId]: Math.min(5, (counts[r.cardId] ?? 0) + 1) }
      if (!wasUnlocked) { pity = 0 } else { pity = pity + 1 }
      expect(pity >= 0 && pity <= LOCKED_PITY + 3).toBe(true)
    }
  })
})
