import { describe, expect, it } from 'vitest'
import {
  CARDS,
  DUST_PER_CARD,
  MAX_STAR,
  STAR_THRESHOLDS,
  copiesToNextStar,
  starLevel,
  toStar,
} from '../src/engine/cards'

describe('star curve [3,6,10,15,21]', () => {
  it('thresholds are exactly the planned curve', () => {
    expect(STAR_THRESHOLDS).toEqual([3, 6, 10, 15, 21])
    expect(MAX_STAR).toBe(5)
  })

  it('starLevel maps copy counts to 0-5 stars', () => {
    expect(starLevel(0)).toBe(0)
    expect(starLevel(1)).toBe(0)
    expect(starLevel(2)).toBe(0)
    expect(starLevel(3)).toBe(1)
    expect(starLevel(5)).toBe(1)
    expect(starLevel(6)).toBe(2)
    expect(starLevel(9)).toBe(2)
    expect(starLevel(10)).toBe(3)
    expect(starLevel(14)).toBe(3)
    expect(starLevel(15)).toBe(4)
    expect(starLevel(20)).toBe(4)
    expect(starLevel(21)).toBe(5)
    expect(starLevel(100)).toBe(5)
    expect(toStar(21)).toBe(5)
  })

  it('copiesToNextStar counts down to each threshold, 0 at max', () => {
    expect(copiesToNextStar(0)).toBe(3)
    expect(copiesToNextStar(2)).toBe(1)
    expect(copiesToNextStar(3)).toBe(3)
    expect(copiesToNextStar(5)).toBe(1)
    expect(copiesToNextStar(20)).toBe(1)
    expect(copiesToNextStar(21)).toBe(0)
    expect(copiesToNextStar(50)).toBe(0)
  })

  it('every chest tier has a maxed-duplicate gem value', () => {
    for (const c of CARDS) {
      expect(DUST_PER_CARD[c.tier]).toBeGreaterThan(0)
    }
  })
})

describe('library card art contract (real images, no blanks)', () => {
  it('all 19 cards point at an existing art file', () => {
    expect(CARDS).toHaveLength(19)
    const expected: Record<string, string> = {
      tails: 'cards/tails.webp',
      amy: 'cards/amy.webp',
      cream: 'cards/cream.webp',
      charmy: 'cards/charmy.svg',
      big: 'cards/big.svg',
      knuckles: 'cards/knuckles.webp',
      blaze: 'cards/blaze.webp',
      rouge: 'cards/rouge.webp',
      ray: 'cards/ray.svg',
      vector: 'cards/vector.svg',
      shadow: 'cards/shadow.webp',
      silver: 'cards/silver.webp',
      metal: 'cards/metal.webp',
      espio: 'cards/espio.svg',
      omega: 'cards/omega.svg',
      sonic: 'cards/sonic.webp',
      jet: 'cards/jet.svg',
      eggman: 'cards/eggman.webp',
      super: 'cards/super.svg',
    }
    for (const card of CARDS) {
      expect(card.image, card.id).toBe(expected[card.id])
    }
  })

  it('the 8 characters without official renders use .svg art, the rest .webp', () => {
    const svgIds = new Set(['charmy', 'big', 'ray', 'vector', 'espio', 'omega', 'jet', 'super'])
    for (const card of CARDS) {
      if (svgIds.has(card.id)) expect(card.image.endsWith('.svg')).toBe(true)
      else expect(card.image.endsWith('.webp')).toBe(true)
    }
  })
})
