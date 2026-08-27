import { UNITS } from '../content/curriculum'
import type { UnitDef } from '../content/types'

export interface LessonProgressInfo {
  completions: number
  bestAccuracy: number
}

export type ProgressMap = Record<string, LessonProgressInfo | undefined>

/** A lesson unlocks only when the previous lesson (flat order, bosses included)
 *  was finished PERFECTLY (100% accuracy). Pass `units` for a non-math subject;
 *  defaults to the maths curriculum. */
export function isLessonUnlocked(
  unitIdx: number,
  lessonIdx: number,
  progress: ProgressMap,
  units: UnitDef[] = UNITS,
): boolean {
  if (unitIdx === 0 && lessonIdx === 0) return true
  const flat = units.flatMap((u) => u.lessons.map((l) => l.id))
  const idx = flat.indexOf(units[unitIdx].lessons[lessonIdx].id)
  if (idx <= 0) return true
  return (progress[flat[idx - 1]]?.completions ?? 0) > 0
}

/**
 * The node the path should pulse "START" on: the first lesson that is both
 * unlocked and not yet perfected. A lesson finished below 100% stays active
 * for replay, so the badge never lands on a locked node (e.g. the boss after
 * lesson 6).
 */
export function nextActiveLesson(
  progress: ProgressMap,
  units: UnitDef[] = UNITS,
): { unitIdx: number; lessonIdx: number } | null {
  for (let unitIdx = 0; unitIdx < units.length; unitIdx++) {
    for (let lessonIdx = 0; lessonIdx < units[unitIdx].lessons.length; lessonIdx++) {
      const lesson = units[unitIdx].lessons[lessonIdx]
      if ((progress[lesson.id]?.bestAccuracy ?? 0) >= 100) continue
      if (isLessonUnlocked(unitIdx, lessonIdx, progress, units)) return { unitIdx, lessonIdx }
    }
  }
  return null
}
