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
