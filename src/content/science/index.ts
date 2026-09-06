import type { LessonDef, UnitDef } from '../types'
import { UNIT_S1 } from './s01'
import { UNIT_S2 } from './s02'
import { UNIT_S3 } from './s03'
import { UNIT_S4 } from './s04'
import { UNIT_S5 } from './s05'
import { UNIT_S6 } from './s06'

export { UNIT_S1, UNIT_S2, UNIT_S3, UNIT_S4, UNIT_S5, UNIT_S6 }

/**
 * Science (Cambridge Primary 0097, Stage 2) - 6 units covering all five strands:
 *   Thinking & Working Scientifically (2TWS) + Science in Context (2SIC),
 *   Biology (2Bp / 2Bs / 2Be), Chemistry (2Cm / 2Cp / 2Cc),
 *   Physics (2Pf / 2Ps / 2Pe) and Earth & Space (2ESp / 2ESs).
 *
 * Every lesson references the official Stage 2 objective codes so the
 * path-screen badges and any future scheme-of-work export stay accurate.
 */
export const SCIENCE_UNITS: UnitDef[] = [
  UNIT_S1, UNIT_S2, UNIT_S3, UNIT_S4, UNIT_S5, UNIT_S6,
]

export const SCIENCE_ALL_LESSONS: Record<string, { unit: UnitDef; lesson: LessonDef }> = {}
for (const u of SCIENCE_UNITS) for (const l of u.lessons) SCIENCE_ALL_LESSONS[l.id] = { unit: u, lesson: l }
