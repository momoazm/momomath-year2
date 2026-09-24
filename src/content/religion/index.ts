import type { LessonDef, UnitDef } from '../types'
import { UNIT_R1 } from './r01'
import { UNIT_R2 } from './r02'
import { UNIT_R3 } from './r03'
import { UNIT_R4 } from './r04'
import { UNIT_R5 } from './r05'
import { UNIT_R6 } from './r06'

export {
  UNIT_R1, UNIT_R2, UNIT_R3, UNIT_R4, UNIT_R5, UNIT_R6,
}

/** Optional Islamic religion extra (Egyptian govt Grade 2, تانية ابتدائي).
 *  Follows the MOE Tarbiya Islamiya scope: aqeedah, Quran, worship, seerah,
 *  prophets' stories, ethics. Objective codes are EG-Rl-2 families
 *  (Q quran / A aqeedah / F fiqh / S seerah-stories / E ethics).
 *  See docs/religion-roadmap.md. */
export const RELIGION_UNITS: UnitDef[] = [
  UNIT_R1, UNIT_R2, UNIT_R3, UNIT_R4, UNIT_R5, UNIT_R6,
]

export const RELIGION_ALL_LESSONS: Record<string, { unit: UnitDef; lesson: LessonDef }> = {}
for (const u of RELIGION_UNITS) for (const l of u.lessons) RELIGION_ALL_LESSONS[l.id] = { unit: u, lesson: l }
