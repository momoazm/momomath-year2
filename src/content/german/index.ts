import type { LessonDef, UnitDef } from '../types'
import { UNIT_G1 } from './g01'
import { UNIT_G2 } from './g02'
import { UNIT_G3 } from './g03'
import { UNIT_G4 } from './g04'
import { UNIT_G5 } from './g05'
import { UNIT_G6 } from './g06'
import { UNIT_G7 } from './g07'
import { UNIT_G8 } from './g08'
import { UNIT_G9 } from './g09'
import { UNIT_G10 } from './g10'

export {
  UNIT_G1, UNIT_G2, UNIT_G3, UNIT_G4, UNIT_G5,
  UNIT_G6, UNIT_G7, UNIT_G8, UNIT_G9, UNIT_G10,
}

/** Optional Deutsch extra (beginner DaF, Felix & Franzi Year 1 + Vol.2 ch.1-3).
 *  Objective codes are Cambridge Primary MFL 0064 Stage-4 families downscaled
 *  for Year 2 (pre-A1): 4Lm / 4Rm / 4Sc / 4Wc / 4Vl / 4Gr / 4Cu.
 *  There is NO official Cambridge Stage 2 German — this mapping is honest
 *  about that (see docs/german-roadmap.md). */
export const GERMAN_UNITS: UnitDef[] = [
  UNIT_G1, UNIT_G2, UNIT_G3, UNIT_G4, UNIT_G5,
  UNIT_G6, UNIT_G7, UNIT_G8, UNIT_G9, UNIT_G10,
]

export const GERMAN_ALL_LESSONS: Record<string, { unit: UnitDef; lesson: LessonDef }> = {}
for (const u of GERMAN_UNITS) for (const l of u.lessons) GERMAN_ALL_LESSONS[l.id] = { unit: u, lesson: l }
