import { describe, expect, it } from 'vitest'
import { crownsEarned, isLessonRedo, type ProgressMap } from '../src/engine/path'

describe('lesson redos earn XP but never stars or chests', () => {
  it('a never-completed lesson is not a redo', () => {
    expect(isLessonRedo({}, 'u1l1')).toBe(false)
    const progress: ProgressMap = { u1l1: { completions: 0, bestAccuracy: 0 } }
    expect(isLessonRedo(progress, 'u1l1')).toBe(false)
  })

  it('a completed lesson (any accuracy) is a redo', () => {
    const progress: ProgressMap = {
      u1l1: { completions: 1, bestAccuracy: 100 },
      u1l2: { completions: 3, bestAccuracy: 40 },
    }
    expect(isLessonRedo(progress, 'u1l1')).toBe(true)
    expect(isLessonRedo(progress, 'u1l2')).toBe(true)
    expect(isLessonRedo(progress, 'u1l3')).toBe(false)
  })

  it('first clear with zero first-try mistakes earns 1 crown', () => {
    expect(crownsEarned(false, 0)).toBe(1)
  })

  it('first clear with any mistake earns 0 crowns', () => {
    expect(crownsEarned(false, 1)).toBe(0)
    expect(crownsEarned(false, 5)).toBe(0)
  })

  it('redos earn 0 crowns even when flawless', () => {
    expect(crownsEarned(true, 0)).toBe(0)
    expect(crownsEarned(true, 2)).toBe(0)
  })
})
