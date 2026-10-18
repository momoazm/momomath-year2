import { describe, expect, it } from 'vitest'
import {
  BATTLE_DIFFICULTIES,
  DEFAULT_BATTLE_DIFFICULTY,
  battleDifficultyDef,
  effectiveBattleDifficulty,
  gymDifficultyTaper,
  isBattleDifficulty,
  type BattleDifficulty,
} from '../../src/engine/battle/difficulty'
import { DEFAULT_BOT_ACCURACY } from '../../src/engine/battle/duel'
import { gymBotDuelCards } from '../../src/engine/battle/squad'

describe('difficulty tiers — easy → impossible (WS26 user directive, tuned WS27)', () => {
  it('exposes the four ordered tiers with sane numbers', () => {
    expect(BATTLE_DIFFICULTIES.map((d) => d.key)).toEqual(['easy', 'medium', 'hard', 'impossible'])
    for (const d of BATTLE_DIFFICULTIES) {
      expect(d.label.trim().length).toBeGreaterThan(0)
      expect(d.emoji.trim().length).toBeGreaterThan(0)
      expect(d.tagline.trim().length).toBeGreaterThan(0)
      expect(d.hpMul).toBeGreaterThan(0)
      expect(d.atkMul).toBeGreaterThan(0)
      expect(d.specialMul).toBeGreaterThan(0)
      expect(d.accuracy).toBeGreaterThan(0)
      expect(d.accuracy).toBeLessThanOrEqual(1)
    }
  })

  it('rival HP, ATK, special power and answer accuracy escalate strictly', () => {
    for (let i = 1; i < BATTLE_DIFFICULTIES.length; i++) {
      const a = BATTLE_DIFFICULTIES[i - 1]!
      const b = BATTLE_DIFFICULTIES[i]!
      expect(b.hpMul).toBeGreaterThan(a.hpMul)
      expect(b.atkMul).toBeGreaterThan(a.atkMul)
      expect(b.accuracy).toBeGreaterThan(a.accuracy)
      expect(b.specialMul).toBeGreaterThan(a.specialMul)
    }
  })

  it('WS27: medium is the default tier and harder than the raw shipped numbers', () => {
    const m = battleDifficultyDef('medium')
    expect(m.hpMul).toBeGreaterThan(1)
    expect(m.atkMul).toBeGreaterThan(1)
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

describe('WS27 late-gym taper — tier extras compress where the base rival is elite', () => {
  it('keeps full tier numbers through gym 8 and tapers at gyms 12 / 13', () => {
    expect(gymDifficultyTaper(1)).toBe(1)
    expect(gymDifficultyTaper(8)).toBe(1)
    expect(gymDifficultyTaper(12)).toBeLessThan(1)
    expect(gymDifficultyTaper(13)).toBeLessThan(gymDifficultyTaper(12))
  })

  it('early gyms apply the tier numbers exactly', () => {
    for (const d of BATTLE_DIFFICULTIES) {
      const eff = effectiveBattleDifficulty(d.key, 1)
      expect(eff.hpMul).toBe(d.hpMul)
      expect(eff.atkMul).toBe(d.atkMul)
      expect(eff.specialMul).toBe(d.specialMul)
      expect(eff.accuracy).toBe(d.accuracy)
    }
  })

  it('champion gym compresses only the above-1 extras; accuracy and sub-1 handicaps stay', () => {
    const rawHard = battleDifficultyDef('hard')
    const effHard = effectiveBattleDifficulty('hard', 13)
    expect(effHard.hpMul).toBeGreaterThan(1)
    expect(effHard.hpMul).toBeLessThan(rawHard.hpMul)
    expect(effHard.atkMul).toBeLessThan(rawHard.atkMul)
    expect(effHard.specialMul).toBeLessThan(rawHard.specialMul)
    expect(effHard.accuracy).toBe(rawHard.accuracy)
    // Easy's sub-1 handicap is never tapered — Easy must stay easy.
    expect(effectiveBattleDifficulty('easy', 13).hpMul).toBe(battleDifficultyDef('easy').hpMul)
    expect(effectiveBattleDifficulty('easy', 13).atkMul).toBe(battleDifficultyDef('easy').atkMul)
  })
})

describe('gymBotDuelCards difficulty scaling (WS26/WS27)', () => {
  const ratio = (a: number, b: number) => a / b

  it('scales rival HP/ATK by the tier multipliers (full at early gyms), leaving def alone', () => {
    const gym = 3 // taper = 1 here
    const med = gymBotDuelCards(gym)
    const imp = gymBotDuelCards(gym, 'impossible')
    const easy = gymBotDuelCards(gym, 'easy')
    const medDef = battleDifficultyDef('medium')
    const impDef = battleDifficultyDef('impossible')
    const easyDef = battleDifficultyDef('easy')
    expect(med.length).toBe(3)
    for (let i = 0; i < med.length; i++) {
      expect(imp[i]!.stats.hp).toBeCloseTo(med[i]!.stats.hp * ratio(impDef.hpMul, medDef.hpMul), 1)
      expect(imp[i]!.stats.atk).toBeCloseTo(med[i]!.stats.atk * ratio(impDef.atkMul, medDef.atkMul), 1)
      expect(easy[i]!.stats.hp).toBeCloseTo(med[i]!.stats.hp * ratio(easyDef.hpMul, medDef.hpMul), 1)
      expect(easy[i]!.stats.atk).toBeCloseTo(med[i]!.stats.atk * ratio(easyDef.atkMul, medDef.atkMul), 1)
      expect(imp[i]!.stats.def).toBeCloseTo(med[i]!.stats.def, 5)
    }
  })

  it('compresses the tier gap at the champion gym while staying above medium', () => {
    const med = gymBotDuelCards(13, 'medium')
    const imp = gymBotDuelCards(13, 'impossible')
    const effImp = effectiveBattleDifficulty('impossible', 13)
    const effMed = effectiveBattleDifficulty('medium', 13)
    const rawRatio = ratio(battleDifficultyDef('impossible').hpMul, battleDifficultyDef('medium').hpMul)
    for (let i = 0; i < med.length; i++) {
      const scaled = ratio(imp[i]!.stats.hp, med[i]!.stats.hp)
      expect(scaled).toBeGreaterThan(1)
      expect(scaled).toBeLessThan(rawRatio)
      expect(imp[i]!.stats.hp).toBeCloseTo(med[i]!.stats.hp * ratio(effImp.hpMul, effMed.hpMul), 1)
    }
  })

  it('the default difficulty IS medium — zero change for existing callers', () => {
    expect(gymBotDuelCards(5)).toEqual(gymBotDuelCards(5, 'medium'))
  })
})
