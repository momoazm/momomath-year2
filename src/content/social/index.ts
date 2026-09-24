import type { LessonDef, UnitDef } from '../types'
import { UNIT_D1 } from './d01'
import { UNIT_D2 } from './d02'
import { UNIT_D3 } from './d03'
import { UNIT_D4 } from './d04'
import { UNIT_D5 } from './d05'
import { UNIT_D6 } from './d06'

export {
  UNIT_D1, UNIT_D2, UNIT_D3, UNIT_D4, UNIT_D5, UNIT_D6,
}

/** Optional Social studies extra (Egypt Grade 2, تانية ابتدائي).
 *  NOTE: Egypt Grade 2 has no standalone social-studies subject — its themes
 *  live inside Discover (اكتشف). This extra honestly collects those themes:
 *  belonging, Nile, jobs, map, monuments, community. Objective codes are
 *  EG-So-2 families (G geography / H history / E economy-jobs / C civics /
 *  W writing). See docs/social-roadmap.md. */
export const SOCIAL_UNITS: UnitDef[] = [
  UNIT_D1, UNIT_D2, UNIT_D3, UNIT_D4, UNIT_D5, UNIT_D6,
]

export const SOCIAL_ALL_LESSONS: Record<string, { unit: UnitDef; lesson: LessonDef }> = {}
for (const u of SOCIAL_UNITS) for (const l of u.lessons) SOCIAL_ALL_LESSONS[l.id] = { unit: u, lesson: l }
