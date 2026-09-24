import type { LessonDef, UnitDef } from '../types'
import { UNIT_A1 } from './a01'
import { UNIT_A2 } from './a02'
import { UNIT_A3 } from './a03'
import { UNIT_A4 } from './a04'
import { UNIT_A5 } from './a05'
import { UNIT_A6 } from './a06'
import { UNIT_A7 } from './a07'
import { UNIT_A8 } from './a08'
import { UNIT_A9 } from './a09'
import { UNIT_A10 } from './a10'

export {
  UNIT_A1, UNIT_A2, UNIT_A3, UNIT_A4, UNIT_A5,
  UNIT_A6, UNIT_A7, UNIT_A8, UNIT_A9, UNIT_A10,
}

/** Optional Arabic extra (Egyptian Grade 2, تانية ابتدائي).
 *  Scope follows Selah El Telmeez (سلاح التلميذ) Arabic G2, which tracks the
 *  MOE curriculum: Term 1 (تمهيد + المعاملة الطيبة + عادات صحية +
 *  الرياضة والتكنولوجيا) + Term 2 (أحب من حولي + في مدرستي + أماكن جميلة).
 *  Objective codes are EG-Ar-2 families (R reading / W writing / G grammar /
 *  E expression / L listening). See docs/arabic-roadmap.md. */
export const ARABIC_UNITS: UnitDef[] = [
  UNIT_A1, UNIT_A2, UNIT_A3, UNIT_A4, UNIT_A5,
  UNIT_A6, UNIT_A7, UNIT_A8, UNIT_A9, UNIT_A10,
]

export const ARABIC_ALL_LESSONS: Record<string, { unit: UnitDef; lesson: LessonDef }> = {}
for (const u of ARABIC_UNITS) for (const l of u.lessons) ARABIC_ALL_LESSONS[l.id] = { unit: u, lesson: l }
