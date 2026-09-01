/** Barrel — public surface of the adaptive engine. UI code should import from
 *  here rather than from the individual files. */

export { ADAPTIVE_CONFIG } from './config'
export type { AdaptiveConfig } from './config'

export type {
  AdaptiveSnapshot,
  AdaptiveRecommendation,
  AdaptiveReasonCode,
  AdaptiveStore,
  AdaptiveTelemetry,
  AttemptLogEntry,
  Difficulty,
  SkillState,
} from './types'

export {
  bktPosterior,
  bktTransition,
  buildAttemptEntry,
  confidence,
  ensureSkill,
  newSkillState,
  overallAccuracy,
  recentAccuracy,
  recordAttempt,
  trendLabel,
  updateSkill,
} from './model'

export { applyHysteresis, targetLevel, withUpdatedDifficulty } from './difficulty'

export {
  adaptLessonLength,
  formatReason,
  isDueForReview,
  recommend,
  recordPick,
  reviewIntervalDays,
  type CurriculumEntry,
  type RecommenderInput,
} from './recommender'

export {
  classifyMistake,
  kindLabel,
  nextFollowUpSeed,
  shouldGenerateFollowUp,
  type MistakeAnalysis,
  type MistakeKind,
} from './mistakes'

export {
  appendAttempt,
  appendMasterySnapshot,
  summariseSkill,
  type SkillSummary,
} from './attempts'

export { buildCatalog, lessonCodes, primaryCode } from './catalog'

export { useAdaptiveLesson, type AdaptiveLessonResult, type UseAdaptiveLessonArgs } from './useAdaptiveLesson'

export {
  buildExplainCacheKey,
  clearExplainCache,
  fetchExplanation,
  templateExplain,
  type ExplainClientOptions,
  type ExplainRequest,
  type ExplainResponse,
} from './explanations'
