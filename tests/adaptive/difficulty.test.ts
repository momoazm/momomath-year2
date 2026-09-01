import { describe, expect, it } from 'vitest'
import { newSkillState, updateSkill } from '../../src/engine/adaptive/model'
import {
  applyHysteresis,
  targetLevel,
  withUpdatedDifficulty,
} from '../../src/engine/adaptive/difficulty'

function skillAt(mastery: number, recent: boolean[], difficulty: 1 | 2 | 3 = 1): import('../../src/engine/adaptive/types').SkillState {
  const s = { ...newSkillState(0), pL: mastery, recent, difficulty }
  return s
}

describe('targetLevel', () => {
  it('cold mastery -> 1', () => {
    expect(targetLevel(skillAt(0.1, []))).toBe(1)
  })
  it('medium mastery and accuracy -> 2', () => {
    expect(targetLevel(skillAt(0.6, [true, true, true]))).toBe(2)
  })
  it('high mastery and accuracy -> 3', () => {
    expect(targetLevel(skillAt(0.85, [true, true, true, true]))).toBe(3)
  })
  it('high mastery but low recent accuracy -> not 3', () => {
    expect(targetLevel(skillAt(0.85, [false, false, false]))).toBe(1)
  })
})

describe('applyHysteresis', () => {
  it('needs 3 consecutive corrects to promote', () => {
    let s = skillAt(0.85, [true, true, true, true], 2)
    s = { ...s, streakCorrect: 2, streakWrong: 0 }
    expect(applyHysteresis(s)).toBe(2)
    s = { ...s, streakCorrect: 3 }
    expect(applyHysteresis(s)).toBe(3)
  })
  it('needs 2 consecutive wrongs to demote', () => {
    let s = skillAt(0.2, [false, false, false], 2)
    s = { ...s, streakCorrect: 0, streakWrong: 1 }
    expect(applyHysteresis(s)).toBe(2)
    s = { ...s, streakWrong: 2 }
    expect(applyHysteresis(s)).toBe(1)
  })
  it('stays put when target equals current', () => {
    const s = skillAt(0.85, [true, true, true], 3)
    expect(applyHysteresis(s)).toBe(3)
  })
})

describe('withUpdatedDifficulty', () => {
  it('does not mutate the input', () => {
    const s = skillAt(0.85, [true, true, true, true], 1)
    s.streakCorrect = 5
    const before = JSON.stringify(s)
    withUpdatedDifficulty(s)
    expect(JSON.stringify(s)).toBe(before)
  })
  it('resets streaks on level change', () => {
    const s = { ...skillAt(0.85, [true, true, true, true], 1), streakCorrect: 3, streakWrong: 0 }
    const out = withUpdatedDifficulty(s)
    expect(out.difficulty).toBe(2)
    expect(out.streakCorrect).toBe(0)
    expect(out.streakWrong).toBe(0)
  })
})
