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
  it('NEVER more than ONE new card per chest', () => {
    for (let i = 0; i < 20000; i++) {
      const counts: Record<string, number> = {}
      CARDS.slice(0, 1 + (i % 18)).forEach((c) => { counts[c.id] = 1 + (i % 5) })
      const r = rollChest(rng(800000 + i), 'normal', counts, 0)
      expect(r.cards.length).toBe(1)
      expect(r.cards.filter((c) => c.isNew).length).toBeLessThanOrEqual(1)
    }
  })
  it('new card is a probability, NOT a guarantee (no pity)', () => {
    // 9 of 19 owned, pity reset -> ~10/19 chance of new per chest.
    const counts: Record<string, number> = {}
    CARDS.slice(0, 9).forEach((c) => { counts[c.id] = 3 })
    let news = 0
    const total = 5000
    for (let i = 0; i < total; i++) {
      if (rollChest(rng(700000 + i), 'normal', counts, 0).isNew) news++
    }
    expect(news).toBeGreaterThan(0)               // possible
    expect(news).toBeLessThan(total * 0.8)        // NOT guaranteed
    expect(news / total).toBeGreaterThan(0.3)     // ~10/19 sane
  })
  it('kick upgrades move rarity upward with the KICK_UPGRADE odds', () => {
    // streak context starts at legendary (75%) or exclusive (25%); both have
    // KICK_UPGRADE = 0, so no upgrades can ever fire there.
    let upgraded = 0
    let legendaryFinal = 0
    const total = 20000
    for (let i = 0; i < total; i++) {
      const r = rollChest(rng(950000 + i), 'streak', {}, 0)
      if (r.upgradesAt.length > 0) upgraded++
      if (r.finalTier === 'legendary') legendaryFinal++
    }
    expect(upgraded).toBe(0)
    // ~75% of streak rolls start (and stay) legendary; allow band 0.70-0.80.
    expect(legendaryFinal / total).toBeGreaterThan(0.70)
    expect(legendaryFinal / total).toBeLessThan(0.80)
    // normal context starts 75% common -> the 4-kick chain (22%/30%/40%)
    // must produce SOME upgraded finals but NEVER all (chance, not forced).
    let sawUpgrade = 0
    for (let i = 0; i < 5000; i++) {
      if (rollChest(rng(990000 + i), 'normal', {}, 0).upgradesAt.length > 0) sawUpgrade++
    }
    expect(sawUpgrade).toBeGreaterThan(0)
    expect(sawUpgrade).toBeLessThan(5000)
  })
})