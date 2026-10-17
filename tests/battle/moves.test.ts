import { describe, expect, it } from 'vitest'
import { ALL_CARDS } from '../../src/engine/cards'
import {
  CHARGED_QUICK_MULT,
  MASTER_POWER_BONUS,
  MASTER_STAR,
  MOVE_POWER,
  MOVE_UNLOCK_STAR,
  TEAM_BLAST_CHARGE,
  hasSpecial,
  hasUltimate,
  movePower,
  movesFor,
  unlockedMoves,
} from '../../src/engine/battle/moves'

describe('moves — 3-move kit per card with star unlocks', () => {
  it('every roster card has exactly 3 moves: quick/special/ultimate', () => {
    for (const c of ALL_CARDS) {
      const kit = movesFor(c.id)
      expect(kit.length, c.id).toBe(3)
      expect(kit.map((m) => m.kind)).toEqual(['quick', 'special', 'ultimate'])
      for (const m of kit) expect(m.name.length).toBeGreaterThan(0)
    }
  })

  it('unlock curve is quick 0★ / special 1★ / ultimate 3★', () => {
    expect(MOVE_UNLOCK_STAR.quick).toBe(0)
    expect(MOVE_UNLOCK_STAR.special).toBe(1)
    expect(MOVE_UNLOCK_STAR.ultimate).toBe(3)
  })

  it('power ordering: quick < special < ultimate', () => {
    expect(MOVE_POWER.quick).toBeLessThan(MOVE_POWER.special)
    expect(MOVE_POWER.special).toBeLessThan(MOVE_POWER.ultimate)
  })

  it('unlockedMoves grows with star level (1 / 2 / 2 / 3 / 3 / 3)', () => {
    expect(unlockedMoves(0).length).toBe(1)
    expect(unlockedMoves(1).length).toBe(2)
    expect(unlockedMoves(2).length).toBe(2)
    expect(unlockedMoves(3).length).toBe(3)
    expect(unlockedMoves(4).length).toBe(3)
    expect(unlockedMoves(5).length).toBe(3)
  })

  it('hasSpecial/hasUltimate gate on the right stars', () => {
    expect(hasSpecial(0)).toBe(false)
    expect(hasSpecial(1)).toBe(true)
    expect(hasUltimate(2)).toBe(false)
    expect(hasUltimate(3)).toBe(true)
  })

  it('5★ mastered bonus applies to every move kind', () => {
    expect(movePower('quick', MASTER_STAR)).toBeCloseTo(MOVE_POWER.quick * (1 + MASTER_POWER_BONUS))
    expect(movePower('special', MASTER_STAR)).toBeCloseTo(MOVE_POWER.special * (1 + MASTER_POWER_BONUS))
    expect(movePower('ultimate', MASTER_STAR)).toBeCloseTo(MOVE_POWER.ultimate * (1 + MASTER_POWER_BONUS))
    expect(movePower('ultimate', MASTER_STAR - 1)).toBe(MOVE_POWER.ultimate)
  })

  it('Team-Blast needs 3 correct answers; charged-quick fallback keeps 0★ cards relevant', () => {
    expect(TEAM_BLAST_CHARGE).toBe(3)
    expect(CHARGED_QUICK_MULT).toBeGreaterThan(1)
  })
})
