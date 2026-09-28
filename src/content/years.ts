import type { Subject } from './types'

/** PLAN Phase 31 step 163 — which subjects each school year teaches.
 *  Year 2 carries the full set (core three + optional extras); the new years
 *  carry maths / english / science only. Content per year is identified later
 *  (Y1 maths arrives in PLAN 167) — until then the core three share the
 *  Year-2 content objects. */
export const SUBJECTS_BY_YEAR: Record<number, readonly Subject[]> = {
  1: ['math', 'english', 'science'],
  2: ['math', 'english', 'science', 'german', 'arabic', 'religion', 'social'],
  3: ['math', 'english', 'science'],
  4: ['math', 'english', 'science'],
}

/** Subjects taught in `year` — unknown years fall back to the Year-2 set. */
export function subjectsForYear(year: number): readonly Subject[] {
  return SUBJECTS_BY_YEAR[year] ?? SUBJECTS_BY_YEAR[2]
}

/** True when `subject` exists in `year`. The UI hides subjects outside the
 *  active year (pills, Profile cards, arcade tiles) and the registry falls
 *  back to Maths instead of ever crashing. */
export function subjectInYear(subject: Subject, year: number): boolean {
  return subjectsForYear(year).includes(subject)
}
