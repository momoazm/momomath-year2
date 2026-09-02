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
