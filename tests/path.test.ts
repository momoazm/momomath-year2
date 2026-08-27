import { describe, expect, it } from 'vitest'
import { UNITS } from '../src/content/curriculum'
import { isLessonUnlocked, nextActiveLesson, type ProgressMap } from '../src/engine/path'

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

  it('after completing the LAST regular lesson (any accuracy), the boss unlocks but last regular stays active until mastered', () => {
    for (let ui = 0; ui < UNITS.length; ui++) {
      const lessons = UNITS[ui].lessons
      const lastRegular = lessons.length - 2 // boss is last
      const before = flatIds().slice(0, flatIds().indexOf(lessons[lastRegular].id))
      // mark all before as mastered (100%) so nextActiveLesson reaches the last regular
      const progress = perfectAll(before)
      // complete the last regular lesson with any accuracy
      progress[lessons[lastRegular].id] = { completions: 1, bestAccuracy: 50 }
      const active = nextActiveLesson(progress)
      // active stays on the last regular (not yet mastered)
      expect(active, `unit ${UNITS[ui].id}`).toEqual({ unitIdx: ui, lessonIdx: lastRegular })
      // but the boss should now be unlocked
      expect(isLessonUnlocked(ui, lessons.length - 1, progress)).toBe(true)
    }
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
    }
  })
})
