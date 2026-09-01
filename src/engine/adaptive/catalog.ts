/** Helpers for the UI: building the curriculum catalog the recommender needs,
 *  and answering "what was the first objective code of this lesson?" — both
 *  computed lazily from the existing curriculum. */

import { getCurriculum } from '../../content/registry'
import type { CurriculumEntry } from './recommender'
import type { Subject } from '../../content/types'

/** Build the flat ordered catalog of (objectiveCode, lessonId) pairs. */
export function buildCatalog(subject: Subject): CurriculumEntry[] {
  const c = getCurriculum(subject)
  const out: CurriculumEntry[] = []
  for (const u of c.units) {
    for (let i = 0; i < u.lessons.length; i++) {
      const l = u.lessons[i]!
      for (const code of l.objectiveCodes) {
        out.push({
          code,
          unitOrder: u.order,
          lessonOrder: i,
          lessonId: l.id,
          title: l.title,
        })
      }
    }
  }
  return out
}

/** A lesson's "primary" objective code — the first one in its list. */
export function primaryCode(lessonId: string, subject: Subject): string | null {
  const c = getCurriculum(subject)
  const entry = c.allLessons[lessonId]
  if (!entry) return null
  return entry.lesson.objectiveCodes[0] ?? null
}

/** All objective codes a lesson touches. */
export function lessonCodes(lessonId: string, subject: Subject): string[] {
  const c = getCurriculum(subject)
  const entry = c.allLessons[lessonId]
  return entry ? [...entry.lesson.objectiveCodes] : []
}
