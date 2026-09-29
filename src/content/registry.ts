import type { LessonDef, Subject, UnitDef } from './types'
import { ALL_LESSONS as MATH_LESSONS, UNITS as MATH_UNITS } from './curriculum'
import { ENGLISH_ALL_LESSONS, ENGLISH_UNITS } from './english'
import { SCIENCE_ALL_LESSONS, SCIENCE_UNITS } from './science'
import { GERMAN_ALL_LESSONS, GERMAN_UNITS } from './german'
import { ARABIC_ALL_LESSONS, ARABIC_UNITS } from './arabic'
import { RELIGION_ALL_LESSONS, RELIGION_UNITS } from './religion'
import { SOCIAL_ALL_LESSONS, SOCIAL_UNITS } from './social'
import { Y1_ALL_LESSONS, Y1_UNITS } from './years/y1/math'
import { ENGLISH_Y1_ALL_LESSONS, ENGLISH_Y1_UNITS } from './years/y1/english'
import { SCIENCE_Y1_ALL_LESSONS, SCIENCE_Y1_UNITS } from './years/y1/science'
import { Y3_ALL_LESSONS, Y3_UNITS } from './years/y3/math'
import { ENGLISH_Y3_ALL_LESSONS, ENGLISH_Y3_UNITS } from './years/y3/english'
import { SCIENCE_Y3_ALL_LESSONS, SCIENCE_Y3_UNITS } from './years/y3/science'

export interface Curriculum {
  units: UnitDef[]
  allLessons: Record<string, { unit: UnitDef; lesson: LessonDef }>
}

/** One year's subject map. Maths is mandatory (the never-crash fallback);
 *  every other subject exists only when that year teaches it. */
export type YearCurriculum = { math: Curriculum } & Partial<
  Record<Exclude<Subject, 'math'>, Curriculum>
>

const CORE: YearCurriculum = {
  math: { units: MATH_UNITS, allLessons: MATH_LESSONS },
  english: { units: ENGLISH_UNITS, allLessons: ENGLISH_ALL_LESSONS },
  science: { units: SCIENCE_UNITS, allLessons: SCIENCE_ALL_LESSONS },
}

/** Year 2 = the full set. Optional DLC-style extras: only reachable when the
 *  player opts in (store.germanEnabled / arabicEnabled / religionEnabled /
 *  socialEnabled) — and only in Year 2 (PLAN 163). Core flows never depend
 *  on them. */
const YEAR_2: YearCurriculum = {
  ...CORE,
  german: { units: GERMAN_UNITS, allLessons: GERMAN_ALL_LESSONS },
  arabic: { units: ARABIC_UNITS, allLessons: ARABIC_ALL_LESSONS },
  religion: { units: RELIGION_UNITS, allLessons: RELIGION_ALL_LESSONS },
  social: { units: SOCIAL_UNITS, allLessons: SOCIAL_ALL_LESSONS },
}

/** PLAN 163 — year-keyed registry. Year 2 carries every subject; Year 4
 *  still shares the Year-2 english/science objects until its own content
 *  lands. Year 1 maths (PLAN 167), english (169a) and science (169b) plus
 *  Year 3 maths (169c) are their own curricula. */
const YEAR_1: YearCurriculum = {
  math: { units: Y1_UNITS, allLessons: Y1_ALL_LESSONS },
  english: { units: ENGLISH_Y1_UNITS, allLessons: ENGLISH_Y1_ALL_LESSONS },
  science: { units: SCIENCE_Y1_UNITS, allLessons: SCIENCE_Y1_ALL_LESSONS },
}

/** PLAN 169e — Year 3 now owns maths (169c), english (169d) and science
 *  (169e); only Year 4 still shares the Year-2 english/science objects. */
const YEAR_3: YearCurriculum = {
  ...CORE,
  math: { units: Y3_UNITS, allLessons: Y3_ALL_LESSONS },
  english: { units: ENGLISH_Y3_UNITS, allLessons: ENGLISH_Y3_ALL_LESSONS },
  science: { units: SCIENCE_Y3_UNITS, allLessons: SCIENCE_Y3_ALL_LESSONS },
}

export const CURRICULA: Record<number, YearCurriculum> = {
  1: YEAR_1,
  2: YEAR_2,
  3: YEAR_3,
  4: CORE,
}

export function getCurriculum(subject: Subject, year: number = 2): Curriculum {
  const bySubject = CURRICULA[year] ?? CURRICULA[2]
  // Belt & braces: never crash the boot path on a corrupt/partial save or a
  // subject outside the active year — fall back to Maths (always present).
  return bySubject[subject] ?? bySubject.math
}

export function lessonEntry(subject: Subject, lessonId: string, year: number = 2) {
  return getCurriculum(subject, year).allLessons[lessonId]
}
