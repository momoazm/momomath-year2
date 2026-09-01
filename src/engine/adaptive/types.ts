import type { QuestionKind } from '../../content/types'

/** Difficulty level 1/2/3 — small, easy, harder. */
export type Difficulty = 1 | 2 | 3

/** Per-skill state kept by the BKT model. One entry per Cambridge objective code
 *  (e.g. "2Nc.01", "2Np.03"). */
export interface SkillState {
  /** BKT mastery probability, in [0, 1]. */
  pL: number
  /** total first attempts (any outcome) on this skill */
  attempts: number
  /** number of first-attempt correct answers */
  correct: number
  /** number of first-attempt wrong answers */
  incorrect: number
  /** recent first-attempt correctness, most-recent first; capped at RECENT_WINDOW */
  recent: boolean[]
  /** exponentially-weighted moving accuracy in [0, 1] */
  trend: number
  /** last-practiced epoch ms */
  lastPracticedAt: number
  /** average response time over the recent window (ms) */
  avgResponseMs: number
  /** current difficulty level (with hysteresis) */
  difficulty: Difficulty
  /** consecutive corrects at current difficulty (for promote gate) */
  streakCorrect: number
  /** consecutive wrongs at current difficulty (for demote gate) */
  streakWrong: number
  /** first attempt ever on this skill, epoch ms */
  firstSeenAt: number
}

export interface AdaptiveSnapshot {
  /** mastery state per objective code */
  skills: Record<string, SkillState>
  /** ordered list of objective codes seen so far — used to build the candidate set
   *  for the recommender without re-walking the curriculum every time */
  seenCodes: string[]
  /** ordered list of the last few picks (objective codes), most recent first */
  recentPicks: string[]
  /** last recommendation that was shown to the student */
  lastRecommendation: AdaptiveRecommendation | null
}

export interface AttemptLogEntry {
  ts: number
  lessonId: string
  objectiveCode: string
  kind: QuestionKind
  difficulty: Difficulty
  answer: string
  correct: boolean
  responseTimeMs: number
  masteryBefore: number
  masteryAfter: number
  reason: AdaptiveReasonCode
}

export type AdaptiveReasonCode =
  | 'mastery-deficit'
  | 'spaced-review-due'
  | 'recommendation-accepted'
  | 'cold-start'
  | 'curriculum-default'
  | 'in-lesson'
  | 'unknown'

export interface AdaptiveRecommendation {
  objectiveCode: string
  lessonId: string | null
  difficulty: Difficulty
  reasonCode: AdaptiveReasonCode
  reasonText: string
  mastery: number
  trend: number
}

export interface AdaptiveTelemetry {
  /** monotonic counters for the parent/teacher dashboard */
  llmRequests: number
  llmHits: number
  llmFallbacks: number
  lastLlmProvider: string | null
  lastLlmLatencyMs: number | null
  recommended: number
  recommendedAccepted: number
}

/** The full adaptive block stored in the zustand persist. */
export interface AdaptiveStore {
  snapshot: AdaptiveSnapshot
  attempts: AttemptLogEntry[]
  /** per-skill mastery snapshots, taken once per "session" (kid opened the app).
   *  Used for the trend sparkline on the parent insights panel. */
  masteryHistory: Record<string, { ts: number; pL: number }[]>
  telemetry: AdaptiveTelemetry
}
