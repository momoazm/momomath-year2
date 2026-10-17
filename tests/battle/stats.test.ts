import { describe, expect, it } from 'vitest'
import { TIER_ORDER, type ChestTier } from '../../src/engine/cards'
import {
  BATTLE_LEVEL_XP,
  MAX_BATTLE_LEVEL,
  TIER_BASE,
  battleLevelForXp,
  battleXpForLevel,
  deriveStats,
  ownedCardStats,
} from '../../src/engine/battle/stats'

const STARS = [0, 1, 2, 3, 4, 5]
const LEVELS = [1, 3, 5, 7, 10]

describe('battle stats — tier base table', () => {
  it('covers every chest tier with positive hp/atk/def', () => {
    for (const t of TIER_ORDER) {
      const b = TIER_BASE[t]
      expect(b, `missing tier base ${t}`).toBeDefined()
      expect(b.hp).toBeGreaterThan(0)
      expect(b.atk).toBeGreaterThan(0)
      expect(b.def).toBeGreaterThan(0)
    }
  })

  it('tier bases strictly escalate common → rare → epic → legendary → exclusive', () => {
    for (let i = 1; i < TIER_ORDER.length; i++) {
      const prev = TIER_BASE[TIER_ORDER[i - 1] as ChestTier]
      const cur = TIER_BASE[TIER_ORDER[i] as ChestTier]
      expect(cur.hp).toBeGreaterThan(prev.hp)
      expect(cur.atk).toBeGreaterThan(prev.atk)
      expect(cur.def).toBeGreaterThan(prev.def)
    }
  })
})

describe('deriveStats — monotonicity (PLAN.md WS17 gate)', () => {
  it('higher tier ⇒ strictly higher stats at any star/level', () => {
    for (const star of STARS) {
      for (const lvl of LEVELS) {
        for (let i = 1; i < TIER_ORDER.length; i++) {
          const prev = deriveStats(TIER_ORDER[i - 1] as ChestTier, star, lvl)
          const cur = deriveStats(TIER_ORDER[i] as ChestTier, star, lvl)
          expect(cur.hp).toBeGreaterThan(prev.hp)
          expect(cur.atk).toBeGreaterThan(prev.atk)
          expect(cur.def).toBeGreaterThan(prev.def)
        }
      }
    }
  })

  it('higher star ⇒ strictly higher stats at any tier/level', () => {
    for (const t of TIER_ORDER) {
      for (const lvl of LEVELS) {
        for (let s = 1; s <= 5; s++) {
          const prev = deriveStats(t, s - 1, lvl)
          const cur = deriveStats(t, s, lvl)
          expect(cur.hp).toBeGreaterThan(prev.hp)
          expect(cur.atk).toBeGreaterThan(prev.atk)
          expect(cur.def).toBeGreaterThan(prev.def)
        }
      }
    }
  })

  it('higher battle level ⇒ strictly higher stats at any tier/star', () => {
    for (const t of TIER_ORDER) {
      for (const star of STARS) {
        for (let lvl = 2; lvl <= MAX_BATTLE_LEVEL; lvl++) {
          const prev = deriveStats(t, star, lvl - 1)
          const cur = deriveStats(t, star, lvl)
          expect(cur.hp).toBeGreaterThan(prev.hp)
          expect(cur.atk).toBeGreaterThan(prev.atk)
          expect(cur.def).toBeGreaterThan(prev.def)
        }
      }
    }
  })

  it('battle-level growth is ~+2%/level and stays under ~25% over the base', () => {
    const base = deriveStats('rare', 0, 1)
    const maxed = deriveStats('rare', 0, MAX_BATTLE_LEVEL)
    const ratio = maxed.hp / base.hp
    expect(ratio).toBeGreaterThan(1.15)
    expect(ratio).toBeLessThan(1.25)
  })

  it('clamps out-of-range star/level instead of exploding', () => {
    const over = deriveStats('common', 99, 99)
    const max = deriveStats('common', 5, MAX_BATTLE_LEVEL)
    expect(over).toEqual(max)
    const under = deriveStats('common', -5, 0)
    const zero = deriveStats('common', 0, 1)
    expect(under).toEqual(zero)
  })
})

describe('battle XP → level curve', () => {
  it('is strictly increasing with 10 levels', () => {
    expect(BATTLE_LEVEL_XP.length).toBe(MAX_BATTLE_LEVEL)
    for (let i = 1; i < BATTLE_LEVEL_XP.length; i++) {
      expect(BATTLE_LEVEL_XP[i]!).toBeGreaterThan(BATTLE_LEVEL_XP[i - 1]!)
    }
  })

  it('maps XP thresholds to levels (0 xp ⇒ level 1, last threshold ⇒ 10)', () => {
    expect(battleLevelForXp(0)).toBe(1)
    expect(battleLevelForXp(BATTLE_LEVEL_XP[1]! - 1)).toBe(1)
    expect(battleLevelForXp(BATTLE_LEVEL_XP[1]!)).toBe(2)
    expect(battleLevelForXp(BATTLE_LEVEL_XP[BATTLE_LEVEL_XP.length - 1]!)).toBe(MAX_BATTLE_LEVEL)
    expect(battleLevelForXp(999999)).toBe(MAX_BATTLE_LEVEL)
  })

  it('is monotone and safe on garbage input', () => {
    let prev = 1
    for (let xp = 0; xp <= 400; xp += 7) {
      const lvl = battleLevelForXp(xp)
      expect(lvl).toBeGreaterThanOrEqual(prev)
      prev = lvl
    }
    expect(battleLevelForXp(Number.NaN)).toBe(1)
    expect(battleLevelForXp(-50)).toBe(1)
  })

  it('battleXpForLevel inverts the threshold table (clamped)', () => {
    expect(battleXpForLevel(1)).toBe(0)
    expect(battleXpForLevel(MAX_BATTLE_LEVEL)).toBe(BATTLE_LEVEL_XP[BATTLE_LEVEL_XP.length - 1])
    expect(battleXpForLevel(0)).toBe(0)
    expect(battleXpForLevel(99)).toBe(BATTLE_LEVEL_XP[BATTLE_LEVEL_XP.length - 1])
  })
})

describe('ownedCardStats — star count + battle xp compose', () => {
  it('derives star level via thresholds and battle level via xp', () => {
    const s = ownedCardStats('epic', 10, BATTLE_LEVEL_XP[4]!)
    expect(s.star).toBe(3) // STAR_THRESHOLDS [3,6,10,15,21]
    expect(s.level).toBe(5)
    expect(s.hp).toBe(deriveStats('epic', 3, 5).hp)
  })

  it('unowned cards (0 copies) still produce valid stats for the picker preview', () => {
    const s = ownedCardStats('common', 0, 0)
    expect(s.star).toBe(0)
    expect(s.level).toBe(1)
    expect(s.hp).toBe(TIER_BASE.common.hp)
  })
})

describe('purity — deriveStats never mutates the tier table', () => {
  it('TIER_BASE deep-equals a fresh snapshot after mass derivation', () => {
    const snapshot = JSON.parse(JSON.stringify(TIER_BASE))
    for (const t of TIER_ORDER) {
      for (const star of STARS) {
        for (let lvl = 1; lvl <= MAX_BATTLE_LEVEL; lvl++) deriveStats(t, star, lvl)
      }
    }
    expect(TIER_BASE).toEqual(snapshot)
  })
})
