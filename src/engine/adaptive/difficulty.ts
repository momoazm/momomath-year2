import { ADAPTIVE_CONFIG } from './config'
import type { Difficulty, SkillState } from './types'
import { recentAccuracy } from './model'

/** Map a skill's mastery + recent accuracy to a *target* level (no hysteresis). */
export function targetLevel(skill: SkillState): Difficulty {
  const cfg = ADAPTIVE_CONFIG.DIFFICULTY
  const acc = recentAccuracy(skill)
  if (skill.pL >= cfg.LVL3_MIN_MASTERY && acc >= cfg.LVL3_MIN_ACCURACY) return 3
  if (skill.pL >= cfg.LVL2_MIN_MASTERY && acc >= cfg.LVL2_MIN_ACCURACY) return 2
  return 1
}

/** Apply hysteresis to the *current* level. The child has to be consistently correct
 *  to move up, or consistently wrong to move down. Returns the new level, equal to
 *  the current one most of the time. */
export function applyHysteresis(skill: SkillState): Difficulty {
  const cfg = ADAPTIVE_CONFIG.DIFFICULTY
  const target = targetLevel(skill)
  if (target > skill.difficulty) {
    return skill.streakCorrect >= cfg.PROMOTE_AFTER ? (skill.difficulty + 1) as Difficulty : skill.difficulty
  }
  if (target < skill.difficulty) {
    return skill.streakWrong >= cfg.DEMOTE_AFTER ? (skill.difficulty - 1) as Difficulty : skill.difficulty
  }
  return skill.difficulty
}

/** Convenience: update skill difficulty in-place-style on a copy. */
export function withUpdatedDifficulty(skill: SkillState): SkillState {
  const next = applyHysteresis(skill)
  if (next === skill.difficulty) return skill
  // reset streaks on level change so we re-evaluate against the new level
  return { ...skill, difficulty: next, streakCorrect: 0, streakWrong: 0 }
}
