import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  CARDS,
  CARD_IMAGE,
  TIER_META,
  TIER_ORDER,
  tierIndex,
  type ChestTier,
} from '../src/engine/cards'

const ART_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'cards')

describe('card catalog (22 cards, 8 rarities)', () => {
  it('holds 22 unique cards with unique names', () => {
    expect(CARDS).toHaveLength(22)
    expect(new Set(CARDS.map((c) => c.id)).size).toBe(22)
    expect(new Set(CARDS.map((c) => c.name)).size).toBe(22)
  })

  it('covers every tier, hyper hardest and last', () => {
    const perTier = new Map<ChestTier, number>()
    for (const c of CARDS) perTier.set(c.tier, (perTier.get(c.tier) ?? 0) + 1)
    for (const t of TIER_ORDER) {
      expect(perTier.get(t) ?? 0, `tier ${t} empty`).toBeGreaterThan(0)
    }
    expect(tierIndex('mythic')).toBeGreaterThan(tierIndex('exclusive'))
    expect(tierIndex('ultimate')).toBeGreaterThan(tierIndex('mythic'))
    expect(tierIndex('hyper')).toBe(TIER_ORDER.length - 1)
    expect(TIER_META.mythic).toBeTruthy()
    expect(TIER_META.ultimate).toBeTruthy()
    expect(TIER_META.hyper).toBeTruthy()
  })

  it('every card resolves to a real bundled artwork file', () => {
    expect(Object.keys(CARD_IMAGE)).toHaveLength(22)
    for (const c of CARDS) {
      const src = CARD_IMAGE[c.id]
      expect(src, `${c.id} has no image`).toMatch(/\.webp$/)
      const file = join(ART_DIR, src.split('/').pop()!)
      expect(existsSync(file), `${c.id} -> ${file} missing`).toBe(true)
    }
  })

  it('variant cards point at their character (fallback chain stays intact)', () => {
    const variants = CARDS.filter((c) => c.id !== c.character)
    expect(variants.length).toBeGreaterThanOrEqual(11)
    for (const v of variants) {
      expect(CARDS.some((c) => c.id === v.character), `${v.id} base missing`).toBe(true)
    }
  })

  it('counts per tier match the designed spread', () => {
    const count = (t: ChestTier) => CARDS.filter((c) => c.tier === t).length
    expect(count('common')).toBe(3)
    expect(count('rare')).toBe(4)
    expect(count('epic')).toBe(6)
    expect(count('legendary')).toBe(2)
    expect(count('exclusive')).toBe(1)
    expect(count('mythic')).toBe(2)
    expect(count('ultimate')).toBe(2)
    expect(count('hyper')).toBe(2)
  })
})
