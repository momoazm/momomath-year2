import { describe, expect, it } from 'vitest'
import { UNITS } from '../src/content/curriculum'
import { isLessonUnlocked, isUnitActivityUnlocked, nextActiveLesson, type ProgressMap } from '../src/engine/path'

function perfectAll(ids: string[]): ProgressMap {
  const p: ProgressMap = {}
  for (const id of ids) p[id] = { completions: 1, bestAccuracy: 100 }
  return p
}

function completedAll(ids: string[]): ProgressMap {
  const p: ProgressMap = {}
  for (const id of ids) p[id] = { completions: 1, bestAccuracy: 50 }
  return p
}

function flatIds(): string[] {
  return UNITS.flatMap((u) => u.lessons.map((l) => l.id))
}

describe('path progression', () => {
  it('fresh player starts on unit 1 lesson 1', () => {
    expect(nextActiveLesson({})).toEqual({ unitIdx: 0, lessonIdx: 0 })
  })

  it('after completing the LAST regular lesson, the (untried, unlocked) boss becomes active — badge moves forward', () => {
    for (let ui = 0; ui < UNITS.length; ui++) {
      const lessons = UNITS[ui].lessons
      const lastRegular = lessons.length - 2 // boss is last
      const before = flatIds().slice(0, flatIds().indexOf(lessons[lastRegular].id))
      // mark all before as mastered (100%) so progress reaches the last regular
      const progress = perfectAll(before)
      // complete the last regular lesson with any accuracy
      progress[lessons[lastRegular].id] = { completions: 1, bestAccuracy: 50 }
      const active = nextActiveLesson(progress)
      // START moves to the boss (untried > replaying the part-cleared lesson)
      expect(active, `unit ${UNITS[ui].id}`).toEqual({ unitIdx: ui, lessonIdx: lessons.length - 1 })
      expect(isLessonUnlocked(ui, lessons.length - 1, progress)).toBe(true)
    }
  })

  it('a part-cleared lesson hands START to the next untried lesson (not a replay)', () => {
    const progress: ProgressMap = { [UNITS[0].lessons[0].id]: { completions: 1, bestAccuracy: 60 } }
    expect(nextActiveLesson(progress)).toEqual({ unitIdx: 0, lessonIdx: 1 })
  })

  it('cross-unit: once unit 1 is fully tried (imperfect), START jumps to unit 2 lesson 1', () => {
    expect(UNITS.length).toBeGreaterThan(1)
    const progress = completedAll(UNITS[0].lessons.map((l) => l.id))
    expect(nextActiveLesson(progress)).toEqual({ unitIdx: 1, lessonIdx: 0 })
  })

  it('when every lesson has been tried, START falls back to the first imperfect lesson (replay)', () => {
    expect(nextActiveLesson(completedAll(flatIds()))).toEqual({ unitIdx: 0, lessonIdx: 0 })
  })

  it('null when every lesson is perfected', () => {
    expect(nextActiveLesson(perfectAll(flatIds()))).toBeNull()
  })

  it('after PERFECTING the last regular lesson, the boss becomes the active next level', () => {
    for (let ui = 0; ui < UNITS.length; ui++) {
      const lessons = UNITS[ui].lessons
      const progress = perfectAll(flatIds().slice(0, flatIds().indexOf(lessons[lessons.length - 1].id)))
      const active = nextActiveLesson(progress)
      expect(active, `unit ${UNITS[ui].id}`).toEqual({ unitIdx: ui, lessonIdx: lessons.length - 1 })
      expect(isLessonUnlocked(ui, lessons.length - 1, progress)).toBe(true)
    }
  })

  it('after perfecting a boss, the next unit lesson 1 becomes active (every unit boundary)', () => {
    for (let ui = 0; ui < UNITS.length - 1; ui++) {
      const progress = perfectAll(flatIds().slice(0, flatIds().indexOf(UNITS[ui + 1].lessons[0].id)))
      expect(nextActiveLesson(progress), `boundary ${UNITS[ui].id} -> ${UNITS[ui + 1].id}`).toEqual({
        unitIdx: ui + 1,
        lessonIdx: 0,
      })
    }
  })

  it('active lesson is always unlocked across a randomized progress sweep', () => {
    let seed = 12345
    const rand = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648
      return seed / 2147483648
    }
    for (let iter = 0; iter < 300; iter++) {
      const progress: ProgressMap = {}
      for (const id of flatIds()) {
        if (rand() < 0.5) continue
        progress[id] = { completions: 1, bestAccuracy: rand() < 0.7 ? 100 : 40 + Math.floor(rand() * 55) }
      }
      const active = nextActiveLesson(progress)
      if (!active) {
        // null only when every lesson is perfected
        expect(flatIds().every((id) => (progress[id]?.bestAccuracy ?? 0) >= 100)).toBe(true)
        continue
      }
      expect(isLessonUnlocked(active.unitIdx, active.lessonIdx, progress)).toBe(true)
      // START only rests on a TRIED lesson when nothing untried remains (PLAN 121)
      const activeId = UNITS[active.unitIdx].lessons[active.lessonIdx].id
      if ((progress[activeId]?.completions ?? 0) > 0) {
        expect(flatIds().every((id) => (progress[id]?.completions ?? 0) > 0)).toBe(true)
      }
    }
  })
})

describe('unit activity unlock (PLAN 122)', () => {
  it('🎯/🔁 gate: locked until EVERY lesson in the unit is tried at least once', () => {
    const unit = UNITS[0]
    const p: ProgressMap = {}
    expect(isUnitActivityUnlocked(unit, p)).toBe(false)
    for (let i = 0; i < unit.lessons.length - 1; i++) {
      p[unit.lessons[i].id] = { completions: 1, bestAccuracy: 60 }
      expect(isUnitActivityUnlocked(unit, p), `after ${i + 1} lessons`).toBe(false)
    }
    p[unit.lessons[unit.lessons.length - 1].id] = { completions: 1, bestAccuracy: 60 }
    expect(isUnitActivityUnlocked(unit, p)).toBe(true)
  })

  it('a perfect score is not required — any completion counts as tried', () => {
    const unit = UNITS[0]
    const p: ProgressMap = {}
    for (const l of unit.lessons) p[l.id] = { completions: 1, bestAccuracy: 40 }
    expect(isUnitActivityUnlocked(unit, p)).toBe(true)
  })
})
