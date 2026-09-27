import { ADAPTIVE_CONFIG } from './config'
import type {
  AdaptiveRecommendation,
  AdaptiveSnapshot,
  SkillState,
} from './types'
import { ensureSkill, recentAccuracy, trendLabel } from './model'
import { withUpdatedDifficulty } from './difficulty'

/** Curriculum list — a single ordered list of objective codes. The recommender
 *  doesn't know the curriculum directly; the screen passes it in so this module
 *  stays curriculum-agnostic. */
export interface CurriculumEntry {
  code: string
  unitOrder: number
  lessonOrder: number
  lessonId: string
  title: string
}

export interface RecommenderInput {
  snap: AdaptiveSnapshot
  catalog: CurriculumEntry[]
  now?: number
  /** If we're inside an active lesson, force the current skill as the candidate. */
  inLessonCode?: string
}

/** Spaced-review interval (days) for a given mastery. */
export function reviewIntervalDays(skill: SkillState): number {
  const bands = ADAPTIVE_CONFIG.SPACED_INTERVALS_DAYS
  if (skill.pL < 0.5) return bands[0]!
  if (skill.pL < 0.7) return bands[1]!
  if (skill.pL < 0.85) return bands[2]!
  if (skill.pL < 0.95) return bands[3]!
  return bands[4]!
}

/** Is the skill "due" for a spaced review today? */

/** Pick the single best next skill. Always returns a recommendation. */
export function recommend(input: RecommenderInput): AdaptiveRecommendation {
  const cfg = ADAPTIVE_CONFIG.RECOMMENDER
  const now = input.now ?? Date.now()

  if (input.inLessonCode) {
    const lesson = input.catalog.find((c) => c.code === input.inLessonCode)
    const ensured = ensureSkill(input.snap, input.inLessonCode, now)
    const skill = ensured.skill
    return {
      objectiveCode: input.inLessonCode,
      lessonId: lesson?.lessonId ?? null,
      difficulty: skill.difficulty,
      reasonCode: 'in-lesson',
      reasonText: 'Continuing this lesson.',
      mastery: skill.pL,
      trend: skill.trend,
    }
  }

  if (input.snap.seenCodes.length === 0 && input.catalog.length > 0) {
    const first = input.catalog[0]!
    return {
      objectiveCode: first.code,
      lessonId: first.lessonId,
      difficulty: 1,
      reasonCode: 'cold-start',
      reasonText: "Let's start at the beginning.",
      mastery: ADAPTIVE_CONFIG.P_L0,
      trend: ADAPTIVE_CONFIG.P_L0,
    }
  }

  const recentSet = new Set(input.snap.recentPicks.slice(0, cfg.RECENT_WINDOW + 1))

  let bestCode: string | null = null
  let bestScore = -Infinity
  let bestReason: AdaptiveRecommendation['reasonCode'] = 'mastery-deficit'
  let bestReasonText = ''
  let bestMastery = 0
  let bestTrend = 0
  let bestDifficulty: 1 | 2 | 3 = 1
  let bestLessonId: string | null = null

  for (const entry of input.catalog) {
    const ensured = ensureSkill(input.snap, entry.code, now)
    const skill = ensured.skill
    const deficit = Math.max(0, ADAPTIVE_CONFIG.MASTERY_TARGET - skill.pL)
    if (skill.attempts === 0) {
      const earlierUnmastered = input.catalog
        .filter((e) => e.lessonOrder < entry.lessonOrder && e.code !== entry.code)
        .some(
          (e) =>
            (input.snap.skills[e.code]?.pL ?? ADAPTIVE_CONFIG.P_L0) < cfg.PREREQ_GATE_MASTERY,
        )
      if (earlierUnmastered) continue
    }
    const due = isDueForReview(skill, now) ? cfg.SPACED_DUE_BONUS : 0
    let recencyPenalty = 0
    if (recentSet.has(entry.code)) {
      const idx = input.snap.recentPicks.indexOf(entry.code)
      if (idx === 0) recencyPenalty = cfg.REPEAT_PENALTY
      else
        recencyPenalty =
          (cfg.RECENCY_PENALTY * (cfg.RECENT_WINDOW - idx + 1)) / cfg.RECENT_WINDOW
    }
    const score = deficit + due - recencyPenalty
    if (score > bestScore) {
      bestScore = score
      bestCode = entry.code
      bestMastery = skill.pL
      bestTrend = skill.trend
      bestDifficulty = withUpdatedDifficulty(skill).difficulty
      bestLessonId = entry.lessonId
      if (due > 0 && skill.pL >= ADAPTIVE_CONFIG.MASTERY_TARGET - 0.1) {
        bestReason = 'spaced-review-due'
        bestReasonText = 'This skill is strong but due for a quick check-up.'
      } else if (skill.attempts === 0) {
        bestReason = 'curriculum-default'
        bestReasonText = 'New skill in your path — let’s try it.'
      } else if (recentAccuracy(skill) < 0.6) {
        bestReason = 'mastery-deficit'
        bestReasonText = 'Recently struggled here — let’s practice again.'
      } else {
        bestReason = 'mastery-deficit'
        bestReasonText = 'Keep building this skill.'
      }
    }
  }

  if (bestCode === null) return buildFallback(input)

  // Never return the same code as the previous pick if any other code ties or
  // beats it. We only do this when the catalog has a strictly alternative — we
  // don't want to invent a recommendation that wasn't in the running.
  const lastPick = input.snap.recentPicks[0]
  if (lastPick && bestCode === lastPick) {
    // Find the best non-lastPick code by re-scoring. We already computed it
    // implicitly via the loop, but the simplest fix is to re-score just the
    // candidates that aren't the last pick.
    let altCode: string | null = null
    let altScore = -Infinity
    for (const entry of input.catalog) {
      if (entry.code === lastPick) continue
      const ensured = ensureSkill(input.snap, entry.code, now)
      const skill = ensured.skill
      const deficit = Math.max(0, ADAPTIVE_CONFIG.MASTERY_TARGET - skill.pL)
      const due = isDueForReview(skill, now) ? cfg.SPACED_DUE_BONUS : 0
      // Non-last picks only get the recency penalty (not the heavy repeat one)
      const idx = input.snap.recentPicks.indexOf(entry.code)
      const pen = idx >= 0
        ? (cfg.RECENCY_PENALTY * (cfg.RECENT_WINDOW - idx + 1)) / cfg.RECENT_WINDOW
        : 0
      const score = deficit + due - pen
      if (score > altScore) {
        altScore = score
        altCode = entry.code
      }
    }
    if (altCode && altScore >= bestScore - 1e-9) {
      const altEntry = input.catalog.find((e) => e.code === altCode)!
      const ensured = ensureSkill(input.snap, altCode, now)
      return {
        objectiveCode: altCode,
        lessonId: altEntry.lessonId,
        difficulty: withUpdatedDifficulty(ensured.skill).difficulty,
        reasonCode: 'mastery-deficit',
        reasonText: 'Different skill — keep it fresh.',
        mastery: ensured.skill.pL,
        trend: ensured.skill.trend,
      }
    }
  }

  return {
    objectiveCode: bestCode,
    lessonId: bestLessonId,
    difficulty: bestDifficulty,
    reasonCode: bestReason,
    reasonText: bestReasonText,
    mastery: bestMastery,
    trend: bestTrend,
  }
}

/** Used by recommend() if the loop did not find anything. */
function buildFallback(input: RecommenderInput): AdaptiveRecommendation {
  const now = input.now ?? Date.now()
  const fallback =
    input.catalog.find(
      (e) => (input.snap.skills[e.code]?.pL ?? 0) < ADAPTIVE_CONFIG.MASTERY_TARGET,
    ) ?? input.catalog[0]!
  return {
    objectiveCode: fallback.code,
    lessonId: fallback.lessonId,
    difficulty: 1,
    reasonCode: 'curriculum-default',
    reasonText: 'Up next on your path.',
    mastery: input.snap.skills[fallback.code]?.pL ?? ADAPTIVE_CONFIG.P_L0,
    trend: input.snap.skills[fallback.code]?.trend ?? ADAPTIVE_CONFIG.P_L0,
  }
}

export function isDueForReview(skill: SkillState, now: number): boolean {
  if (skill.lastPracticedAt === 0) return false
  const days = (now - skill.lastPracticedAt) / (1000 * 60 * 60 * 24)
  return days >= reviewIntervalDays(skill)
}

/** Decide the lesson question count. */
export function adaptLessonLength(
  snap: AdaptiveSnapshot,
  code: string,
  isBoss: boolean,
  defaultLength: number,
  now: number = Date.now(),
): number {
  if (isBoss) return defaultLength
  const cfg = ADAPTIVE_CONFIG.ADAPTIVE_LESSON
  const ensured = ensureSkill(snap, code, now)
  const skill = ensured.skill
  if (skill.attempts === 0) return defaultLength
  if (skill.pL >= cfg.EARLY_STOP_MASTERY) return cfg.MIN
  if (skill.streakCorrect >= cfg.EARLY_STOP_STREAK) return cfg.MIN
  return Math.min(defaultLength, cfg.MAX)
}

/** Format a recommendation reason for the UI. */
export function formatReason(
  code: AdaptiveRecommendation['reasonCode'],
  skill: SkillState,
): string {
  const pct = Math.round(skill.pL * 100)
  const t = trendLabel(skill)
  switch (code) {
    case 'spaced-review-due':
      return `Review — mastery is strong (${pct}%) and it’s time for a check-up.`
    case 'mastery-deficit':
      return `Practice — estimated mastery ${pct}%${
        t === 'improving' ? ', improving' : t === 'declining' ? ', needs work' : ''
      }.`
    case 'curriculum-default':
      return 'New — let’s try this next skill.'
    case 'cold-start':
      return 'Starting fresh — let’s begin.'
    case 'in-lesson':
      return 'Continuing this lesson.'
    case 'recommendation-accepted':
      return 'Following your recommendation.'
    case 'unknown':
      return 'Up next.'
  }
}

/** Update a snapshot to record a fresh pick (for recency tracking). */
export function recordPick(
  snap: AdaptiveSnapshot,
  code: string,
  cap: number = ADAPTIVE_CONFIG.RECOMMENDER.RECENT_WINDOW + 1,
): AdaptiveSnapshot {
  return {
    ...snap,
    recentPicks: [code, ...snap.recentPicks.filter((c) => c !== code)].slice(0, cap),
  }
}

