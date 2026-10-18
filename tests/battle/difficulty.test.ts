import { describe, expect, it } from 'vitest'
import {
  BATTLE_DIFFICULTIES,
  DEFAULT_BATTLE_DIFFICULTY,
  type BattleDifficulty,
  battleDifficultyDef,
  isBattleDifficulty,
} from '../../src/engine/battle/difficulty'
import { DEFAULT_BOT_ACCURACY } from '../../src/engine/battle/duel'
import { gymBotDuelCards } from '../../src/engine/battle/squad'

describe('difficulty tiers — easy → impossible (WS26 user directive)', () => {
  it('exposes the four ordered tiers', () => {
    expect(BATTLE_DIFFICULTIES.map((d) => d.key)).toEqual(['easy', 'medium', 'hard', 'impossible'])
    for (const d of BATTLE_DIFFICULTIES) {
      expect(d.label.trim().length).toBeGreaterThan(0)
      expect(d.emoji.trim().length).toBeGreaterThan(0)
      expect(d.hpMul).toBeGreaterThan(0)
      expect(d.atkMul).toBeGreaterThan(0)
      expect(d.accuracy).toBeGreaterThan(0)
      expect(d.accuracy).toBeLessThanOrEqual(1)
    }
  })

  it('rival HP, ATK and answer accuracy escalate strictly from easy to impossible', () => {
    for (let i = 1; i < BATTLE_DIFFICULTIES.length; i++) {
      const a = BATTLE_DIFFICULTIES[i - 1]!
      const b = BATTLE_DIFFICULTIES[i]!
      expect(b.hpMul).toBeGreaterThan(a.hpMul)
      expect(b.atkMul).toBeGreaterThan(a.atkMul)
      expect(b.accuracy).toBeGreaterThan(a.accuracy)
    }
  })

  it('medium is the identity tier = the numbers the battle shipped with (R0)', () => {
    const m = battleDifficultyDef('medium')
    expect(m.hpMul).toBe(1)
    expect(m.atkMul).toBe(1)
    expect(m.accuracy).toBe(DEFAULT_BOT_ACCURACY)
    expect(DEFAULT_BATTLE_DIFFICULTY).toBe('medium')
  })

  it('unknown / missing keys fall back to the default tier', () => {
    expect(battleDifficultyDef(undefined).key).toBe('medium')
    expect(battleDifficultyDef('nope' as BattleDifficulty).key).toBe('medium')
    expect(isBattleDifficulty('impossible')).toBe(true)
    expect(isBattleDifficulty('nope')).toBe(false)
    expect(isBattleDifficulty(42)).toBe(false)
  })
})

describe('gymBotDuelCards difficulty scaling (WS26)', () => {
  it('scales rival HP/ATK by the tier multipliers and leaves def alone', () => {
    const med = gymBotDuelCards(3)
    const imp = gymBotDuelCards(3, 'impossible')
    const easy = gymBotDuelCards(3, 'easy')
    expect(med.length).toBe(3)
    for (let i = 0; i < med.length; i++) {
      expect(imp[i]!.stats.hp).toBeCloseTo(med[i]!.stats.hp * 1.9, 1)
      expect(imp[i]!.stats.atk).toBeCloseTo(med[i]!.stats.atk * 1.75, 1)
      expect(easy[i]!.stats.hp).toBeCloseTo(med[i]!.stats.hp * 0.7, 1)
      expect(easy[i]!.stats.atk).toBeCloseTo(med[i]!.stats.atk * 0.7, 1)
      expect(imp[i]!.stats.def).toBeCloseTo(med[i]!.stats.def, 5)
    }
  })

  it('the default difficulty IS medium — zero change for existing callers', () => {
    expect(gymBotDuelCards(5)).toEqual(gymBotDuelCards(5, 'medium'))
  })
})
