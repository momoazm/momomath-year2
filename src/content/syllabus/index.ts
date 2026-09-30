/** Year-2 SYLLABUS — canonical vocabulary per subject, EXTRACTED FROM REAL
 *  BOOKS / official curricula (PLAN 143). Consumed by the audit
 *  (scripts/audit-syllabus.mjs) and the regression guard
 *  (tests/syllabusRegistry.test.ts). Do not hand-edit word lists here — see
 *  each subject file's header for its source book and URL. */

import type { Subject } from '../types'
import { MATH_SYLLABUS, MATH_TOLERANCE } from './math'
import { ENGLISH_SYLLABUS, ENGLISH_TOLERANCE } from './english'
import { SCIENCE_SYLLABUS, SCIENCE_TOLERANCE } from './science'
import { GERMAN_SYLLABUS, GERMAN_TOLERANCE } from './german'
import { ARABIC_SYLLABUS, ARABIC_TOLERANCE } from './arabic'
import { RELIGION_SYLLABUS, RELIGION_TOLERANCE } from './religion'
import { SOCIAL_SYLLABUS, SOCIAL_TOLERANCE } from './social'
import { MATH_Y1_SYLLABUS, MATH_Y1_TOLERANCE } from './y1/math'
import { ENGLISH_Y1_SYLLABUS, ENGLISH_Y1_TOLERANCE } from './y1/english'
import { SCIENCE_Y1_SYLLABUS, SCIENCE_Y1_TOLERANCE } from './y1/science'
import { MATH_Y3_SYLLABUS, MATH_Y3_TOLERANCE } from './y3/math'
import { ENGLISH_Y3_SYLLABUS, ENGLISH_Y3_TOLERANCE } from './y3/english'
import { SCIENCE_Y3_SYLLABUS, SCIENCE_Y3_TOLERANCE } from './y3/science'
import { MATH_Y4_SYLLABUS, MATH_Y4_TOLERANCE } from './y4/math'

export { MATH_SYLLABUS, ENGLISH_SYLLABUS, SCIENCE_SYLLABUS, GERMAN_SYLLABUS,
  ARABIC_SYLLABUS, RELIGION_SYLLABUS, SOCIAL_SYLLABUS }

/** Language family used for normalization + stopword choice. */
export const SUBJECT_LANG: Record<Subject, 'en' | 'de' | 'ar'> = {
  math: 'en', english: 'en', science: 'en',
  german: 'de',
  arabic: 'ar', religion: 'ar', social: 'ar',
}

export const SYLLABUS: Record<Subject, readonly string[]> = {
  math: MATH_SYLLABUS,
  english: ENGLISH_SYLLABUS,
  science: SCIENCE_SYLLABUS,
  german: GERMAN_SYLLABUS,
  arabic: ARABIC_SYLLABUS,
  religion: RELIGION_SYLLABUS,
  social: SOCIAL_SYLLABUS,
}

export const TOLERANCE: Record<Subject, readonly string[]> = {
  math: MATH_TOLERANCE,
  english: ENGLISH_TOLERANCE,
  science: SCIENCE_TOLERANCE,
  german: GERMAN_TOLERANCE,
  arabic: ARABIC_TOLERANCE,
  religion: RELIGION_TOLERANCE,
  social: SOCIAL_TOLERANCE,
}

/** PLAN 168 — per-year syllabus overrides. A year only appears here for the
 *  subjects whose content is its own (Year-1 maths, PLAN 167; Year-1
 *  english, PLAN 169a; Year-1 science, PLAN 169b; Year-3 maths, PLAN
 *  169c; Year-3 english, PLAN 169d; Year-3 science, PLAN 169e; Year-4
 *  maths, PLAN 169f); every other year/subject falls back to the Year-2
 *  lists above — the shared content those years still run (PLAN 169
 *  replaces them one subject at a time). */
type YearOverrides = Partial<Record<number, Partial<Record<Subject, readonly string[]>>>>

export const YEAR_SYLLABUS: YearOverrides = {
  1: { math: MATH_Y1_SYLLABUS, english: ENGLISH_Y1_SYLLABUS, science: SCIENCE_Y1_SYLLABUS },
  3: { math: MATH_Y3_SYLLABUS, english: ENGLISH_Y3_SYLLABUS, science: SCIENCE_Y3_SYLLABUS },
  4: { math: MATH_Y4_SYLLABUS },
}

export const YEAR_TOLERANCE: YearOverrides = {
  1: { math: MATH_Y1_TOLERANCE, english: ENGLISH_Y1_TOLERANCE, science: SCIENCE_Y1_TOLERANCE },
  3: { math: MATH_Y3_TOLERANCE, english: ENGLISH_Y3_TOLERANCE, science: SCIENCE_Y3_TOLERANCE },
  4: { math: MATH_Y4_TOLERANCE },
}
