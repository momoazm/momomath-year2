import type { LessonDef, Subject, UnitDef } from './types'
import { ALL_LESSONS as MATH_LESSONS, UNITS as MATH_UNITS } from './curriculum'
import { ENGLISH_ALL_LESSONS, ENGLISH_UNITS } from './english'
import { GERMAN_ALL_LESSONS, GERMAN_UNITS } from './german'
import { SCIENCE_ALL_LESSONS, SCIENCE_UNITS } from './science'

export interface Curriculum {
  units: UnitDef[]
  allLessons: Record<string, { unit: UnitDef; lesson: LessonDef }>
}

export const CURRICULA: Record<Subject, Curriculum> = {
  math: { units: MATH_UNITS, allLessons: MATH_LESSONS },
  english: { units: ENGLISH_UNITS, allLessons: ENGLISH_ALL_LESSONS },
  // Optional DLC-style extra: only reachable when the player opts in
  // (store.germanEnabled). Core flows never depend on it.
  german: { units: GERMAN_UNITS, allLessons: GERMAN_ALL_LESSONS },
  science: { units: SCIENCE_UNITS, allLessons: SCIENCE_ALL_LESSONS },
}

export function getCurriculum(subject: Subject): Curriculum {
  // Belt & braces: never crash the boot path on a corrupt/partial save —
  // fall back to Maths so the player always sees a working path.
  return CURRICULA[subject] ?? CURRICULA.math
}

export function lessonEntry(subject: Subject, lessonId: string) {
  return CURRICULA[subject].allLessons[lessonId]
}
