import { UNITS } from '../content/curriculum'

export interface LessonProgressInfo {
  completions: number
  bestAccuracy: number
}

export type ProgressMap = Record<string, LessonProgressInfo | undefined>

/** A lesson unlocks only when the previous lesson (flat order, bosses included)
 *  was finished PERFECTLY (100% accuracy). */
export function isLessonUnlocked(
  unitIdx: number,
  lessonIdx: number,
  progress: ProgressMap,
): boolean {
  if (unitIdx === 0 && lessonIdx === 0) return true
  const flat = UNITS.flatMap((u) => u.lessons.map((l) => l.id))
  const idx = flat.indexOf(UNITS[unitIdx].lessons[lessonIdx].id)
  if (idx <= 0) return true
  return (progress[flat[idx - 1]]?.bestAccuracy ?? 0) >= 100
}

/**
 * The node the path should pulse "START" on: the first lesson that is both
 * unlocked and not yet perfected. A lesson finished below 100% stays active
 * for replay, so the badge never lands on a locked node (e.g. the boss after
 * lesson 6).
 */
export function nextActiveLesson(progress: ProgressMap): { unitIdx: number; lessonIdx: number } | null {
  for (let unitIdx = 0; unitIdx < UNITS.length; unitIdx++) {
    for (let lessonIdx = 0; lessonIdx < UNITS[unitIdx].lessons.length; lessonIdx++) {
      const lesson = UNITS[unitIdx].lessons[lessonIdx]
      if ((progress[lesson.id]?.bestAccuracy ?? 0) >= 100) continue
      if (isLessonUnlocked(unitIdx, lessonIdx, progress)) return { unitIdx, lessonIdx }
    }
  }
  return null
}
