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
  isRushedAttempt,
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
  capSnapshots,
  summariseSkill,
  type SkillSummary,
} from './attempts'

export {
  findLessonTitle,
  hardestByCode,
  lessonForCode,
  lessonsToRepeat,
  MISTAKE_HINTS,
  recentWrong,
  retryItemsFrom,
  topMistakeKind,
  type LessonRepeatInfo,
  type SummariseLessonsInput,
} from './lessons'

export {
  correctAnswerText,
  questionPrompt,
  snapshotQuestion,
  type RetryItem,
} from './questions'

export { buildCatalog, lessonCodes, primaryCode } from './catalog'

export {
  buildCheckup,
  CHECKUP_DUE_MAX,
  CHECKUP_SIZE,
  CHECKUP_WRONG_MAX,
  dueSkillCodes,
  type BuildCheckupInput,
  type CheckupSession,
} from './checkup'

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

export {
  buildFollowupCacheKey,
  clearFollowupCache,
  fetchFollowup,
  parseLlmMcq,
  siblingFollowup,
  type FollowupClientOptions,
  type FollowupRequest,
  type FollowupResult,
} from './followup'

export {
  BYOK_PROVIDERS,
  byokClear,
  byokGet,
  byokHeaders,
  byokMask,
  byokSet,
  type ByokProvider,
  type ByokValue,
} from './byok'

export {
  buildReviewCacheKey,
  clearReviewCache,
  fetchReview,
  templateReview,
  type ReviewClientOptions,
  type ReviewFocus,
  type ReviewResponse,
  type ReviewResult,
  type ReviewSkill,
  type ReviewStats,
} from './review'
