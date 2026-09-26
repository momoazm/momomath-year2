import { UNITS } from '../content/curriculum'
import type { UnitDef } from '../content/types'

export interface LessonProgressInfo {
  completions: number
  bestAccuracy: number
}

export type ProgressMap = Record<string, LessonProgressInfo | undefined>

/** A lesson unlocks only when the previous lesson (flat order, bosses included)
 *  was finished AT LEAST ONCE (any accuracy). Pass `units` for a non-math
 *  subject; defaults to the maths curriculum. */
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
 * The node the path should pulse "START" on - the NEXT LESSON TO BE DONE.
 * Priority 1: the first unlocked lesson never tried (completions 0), i.e. the
 * next NEW lesson in curriculum order - the badge moves forward as soon as a
 * lesson is started, even if an earlier one is only part-cleared. (Because the
 * unlock chain breaks exactly at the first untried lesson, such a lesson always
 * exists unless every lesson has been tried.) Priority 2 (all tried): the first
 * unlocked lesson not yet perfected - replay for a better score. null only when
 * every lesson is perfected. Never lands on a locked node. (PLAN 121.)
 */
export function nextActiveLesson(
  progress: ProgressMap,
  units: UnitDef[] = UNITS,
): { unitIdx: number; lessonIdx: number } | null {
  let replay: { unitIdx: number; lessonIdx: number } | null = null
  for (let unitIdx = 0; unitIdx < units.length; unitIdx++) {
    for (let lessonIdx = 0; lessonIdx < units[unitIdx].lessons.length; lessonIdx++) {
      const lesson = units[unitIdx].lessons[lessonIdx]
      if (!isLessonUnlocked(unitIdx, lessonIdx, progress, units)) continue
      const info = progress[lesson.id]
      if ((info?.completions ?? 0) === 0) return { unitIdx, lessonIdx }
      if (!replay && (info?.bestAccuracy ?? 0) < 100) replay = { unitIdx, lessonIdx }
    }
  }
  return replay
}

/** True when this lesson was completed before — a replay ("redo").
 *  Redos still earn XP but never stars/crowns or chests. */
export function isLessonRedo(progress: ProgressMap, lessonId: string): boolean {
  return (progress[lessonId]?.completions ?? 0) > 0
}

/** A unit's fun-activity (🎯) — and practice (🔁) — unlock only once EVERY
 *  lesson in the unit has been tried at least once (any accuracy), so the node
 *  sits locked until the child has actually reached the bottom of the unit.
 *  (PLAN 122.) */
export function isUnitActivityUnlocked(unit: UnitDef, progress: ProgressMap): boolean {
  return unit.lessons.every((l) => (progress[l.id]?.completions ?? 0) > 0)
}

/** Crowns earned for finishing a lesson: a first clear with zero
 *  first-try mistakes earns 1 (capped at 3 in the store); redos earn 0. */
export function crownsEarned(isRedo: boolean, firstAttemptMistakes: number): number {
  if (isRedo) return 0
  return firstAttemptMistakes === 0 ? 1 : 0
}
