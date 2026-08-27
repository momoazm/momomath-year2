import type { LessonDef, UnitDef } from '../types'
import { UNIT_E1 } from './e01'
import { UNIT_E2 } from './e02'
import { UNIT_E3 } from './e03'
import { UNIT_E4 } from './e04'
import { UNIT_E5 } from './e05'
import { UNIT_E6 } from './e06'
import { UNIT_E7 } from './e07'
import { UNIT_E8 } from './e08'
import { UNIT_E9 } from './e09'
import { UNIT_E10 } from './e10'
import { UNIT_E11 } from './e11'
import { UNIT_E12 } from './e12'
import { UNIT_E13 } from './e13'

export {
  UNIT_E1, UNIT_E2, UNIT_E3, UNIT_E4, UNIT_E5, UNIT_E6,
  UNIT_E7, UNIT_E8, UNIT_E9, UNIT_E10, UNIT_E11, UNIT_E12, UNIT_E13,
}

/** Cambridge Primary English 0058 Stage 2 - full 13-unit skill path. */
export const ENGLISH_UNITS: UnitDef[] = [
  UNIT_E1, UNIT_E2, UNIT_E3, UNIT_E4, UNIT_E5, UNIT_E6,
  UNIT_E7, UNIT_E8, UNIT_E9, UNIT_E10, UNIT_E11, UNIT_E12, UNIT_E13,
]

export const ENGLISH_ALL_LESSONS: Record<string, { unit: UnitDef; lesson: LessonDef }> = {}
for (const u of ENGLISH_UNITS) for (const l of u.lessons) ENGLISH_ALL_LESSONS[l.id] = { unit: u, lesson: l }
