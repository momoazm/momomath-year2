/**
 * Central config for the adaptive engine. All tunables live here so they can be
 * adjusted without touching the math. The numbers below are deliberately conservative
 * for a 6-7 year old: small learning step, generous mistake tolerance, easy promotion
 * gates.
 *
 * Everything is exported as a const object so a future admin UI can deep-merge
 * overrides (e.g. from localStorage) over these defaults.
 */

import type { QuestionKind } from '../../content/types'

/** BKT priors. The standard Corbett & Anderson (1994) ranges for early-elementary
 *  math are roughly P(T) ~ 0.05-0.20, P(S) ~ 0.05-0.20, P(G) ~ 0.05-0.30. We sit
 *  near the conservative middle: learning is real, slip/guess are possible. */
export const ADAPTIVE_CONFIG = {
  /** Prior probability the child has learned the skill before the first attempt. */
  P_L0: 0.15,

  /** Probability of learning per *opportunity* (a single attempt). One transition per
   *  attempt is generous — Corbett & Anderson use one transition per *opportunity*
   *  which is the same thing here. */
  P_T: 0.12,

  /** Slip — answered wrong despite knowing. We keep this low because a Year-2 child
   *  genuinely often doesn't know yet, which is already captured by P(L). */
  P_S: 0.12,

  /** Per-question-kind guess probabilities. Multiple-choice and true/false have a
   *  decent chance of a lucky guess; typed numbers and ordering are essentially
   *  guess-proof, so we use 0.02 for those. */
  P_G_BY_KIND: {
    mcq: 0.25,
    'truefalse': 0.5,
    match: 0.1,
    order: 0.05,
    'tap-count': 0.1,
    'letter-tiles': 0.05,
    'type-number': 0.02,
    speak: 0.15,
  } as Record<QuestionKind, number>,

  /** Target mastery for the recommender (skill is "done" once P(L) ≥ this). */
  MASTERY_TARGET: 0.85,

  /** Difficulty thresholds. */
  DIFFICULTY: {
    PROMOTE_AFTER: 3, // consecutive first-attempt corrects to go up
    DEMOTE_AFTER: 2, // consecutive first-attempt wrongs to go down
    // recent-accuracy bands
    LVL1_MAX_ACCURACY: 0.6,
    LVL2_MIN_ACCURACY: 0.6,
    LVL2_MIN_MASTERY: 0.5,
    LVL3_MIN_ACCURACY: 0.8,
    LVL3_MIN_MASTERY: 0.8,
  },

  /** Recent-window size for accuracy and trend. */
  RECENT_WINDOW: 10,
  /** EWMA smoothing for trend. */
  EWMA_ALPHA: 0.3,

  /** Spaced review intervals (days) by mastery band. */
  SPACED_INTERVALS_DAYS: [1, 3, 7, 14, 30] as const,

  /** Recommender weights. */
  RECOMMENDER: {
    /** penalty applied to the skill the previous question was on */
    REPEAT_PENALTY: 0.5,
    /** penalty applied to each of the last 3 picks (besides the immediate repeat) */
    RECENCY_PENALTY: 0.15,
    /** mastery-below which a skill is "gated" by its prerequisites */
    PREREQ_GATE_MASTERY: 0.5,
    /** bonus when a skill is due for spaced review */
    SPACED_DUE_BONUS: 0.3,
    /** how far back we count recent picks (exclusive of immediate repeat) */
    RECENT_WINDOW: 3,
  },

  /** Attempt log ring buffer. Older entries dropped when full. */
  ATTEMPT_LOG_CAP: 500,

  /** Lesson length (non-boss) bounds. */
  ADAPTIVE_LESSON: {
    MIN: 6,
    MAX: 12,
    /** how confident we have to be that the skill is mastered before stopping early */
    EARLY_STOP_MASTERY: 0.9,
    /** once this many in a row are correct, we can stop early */
    EARLY_STOP_STREAK: 4,
  },

  /** LLM explanations. The route name only — provider chain lives in
   *  api/year2/explain.ts. */
  EXPLAIN_ROUTE: '/api/year2/explain',
  /** Client-side cache size for explanations. */
  EXPLAIN_CACHE_SIZE: 100,
  /** Per-request timeout. */
  EXPLAIN_TIMEOUT_MS: 3000,

  /** Student-facing age band. Used only for tone in LLM fallback prompts; the model
   *  is never told names or ids. */
  AGE_BAND: 'Year 2 (age 6-7)',
} as const

export type AdaptiveConfig = typeof ADAPTIVE_CONFIG
