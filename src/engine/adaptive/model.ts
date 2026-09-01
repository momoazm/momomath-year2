import { ADAPTIVE_CONFIG } from './config'
import type {
  AdaptiveSnapshot,
  AttemptLogEntry,
  Difficulty,
  SkillState,
} from './types'
import type { QuestionKind } from '../../content/types'

/** Build a fresh per-skill state from priors. Used for any objective code the student
 *  hasn't seen yet, including the very first one. */
export function newSkillState(now: number = Date.now()): SkillState {
  return {
    pL: ADAPTIVE_CONFIG.P_L0,
    attempts: 0,
    correct: 0,
    incorrect: 0,
    recent: [],
    trend: ADAPTIVE_CONFIG.P_L0,
    lastPracticedAt: 0,
    avgResponseMs: 0,
    difficulty: 1,
    streakCorrect: 0,
    streakWrong: 0,
    firstSeenAt: now,
  }
}

/** Ensure a snapshot has a slot for the given code. */
export function ensureSkill(
  snap: AdaptiveSnapshot,
  code: string,
  now: number = Date.now(),
): { snap: AdaptiveSnapshot; skill: SkillState } {
  const existing = snap.skills[code]
  if (existing) return { snap, skill: existing }
  const next: AdaptiveSnapshot = {
    ...snap,
    skills: { ...snap.skills, [code]: newSkillState(now) },
  }
  return { snap: next, skill: next.skills[code]! }
}

/* ------------------------------ BKT core ------------------------------ */

/** Posterior P(L | outcome) using Bayes' rule. Pure function, no side effects. */
export function bktPosterior(
  pL: number,
  correct: boolean,
  pS: number,
  pG: number,
): number {
  if (correct) {
    const num = pL * (1 - pS)
    const den = pL * (1 - pS) + (1 - pL) * pG
    return den === 0 ? pL : num / den
  }
  const num = pL * pS
  const den = pL * pS + (1 - pL) * (1 - pG)
  return den === 0 ? pL : num / den
}


/** Apply one first-attempt to a skill state. Returns a NEW skill state — no mutation. */
export function updateSkill(
  skill: SkillState,
  correct: boolean,
  kind: QuestionKind,
  responseTimeMs: number,
  now: number = Date.now(),
): SkillState {
  const pS = ADAPTIVE_CONFIG.P_S
  const pG = ADAPTIVE_CONFIG.P_G_BY_KIND[kind] ?? 0.2
  const pL_post = bktPosterior(skill.pL, correct, pS, pG)
  const pL_next = bktTransition(pL_post)

  const recent = [correct, ...skill.recent].slice(0, ADAPTIVE_CONFIG.RECENT_WINDOW)
  const trend =
    skill.attempts === 0
      ? correct ? 1 : 0
      : ADAPTIVE_CONFIG.EWMA_ALPHA * (correct ? 1 : 0) +
        (1 - ADAPTIVE_CONFIG.EWMA_ALPHA) * skill.trend

  const avgResponseMs =
    skill.attempts === 0
      ? responseTimeMs
      : (skill.avgResponseMs * skill.attempts + responseTimeMs) / (skill.attempts + 1)

  const streakCorrect = correct ? skill.streakCorrect + 1 : 0
  const streakWrong = correct ? 0 : skill.streakWrong + 1

  return {
    ...skill,
    pL: pL_next,
    attempts: skill.attempts + 1,
    correct: skill.correct + (correct ? 1 : 0),
    incorrect: skill.incorrect + (correct ? 0 : 1),
    recent,
    trend,
    lastPracticedAt: now,
    avgResponseMs,
    streakCorrect,
    streakWrong,
  }
}

/* ---------------------- snapshot-level helpers ---------------------- */

/** Update a snapshot in one call. Pure: returns a new snapshot. */
export function recordAttempt(
  snap: AdaptiveSnapshot,
  code: string,
  correct: boolean,
  kind: QuestionKind,
  responseTimeMs: number,
  now: number = Date.now(),
): { snap: AdaptiveSnapshot; before: number; after: number } {
  const ensured = ensureSkill(snap, code, now)
  const before = ensured.skill.pL
  const updated = updateSkill(ensured.skill, correct, kind, responseTimeMs, now)
  const skills = { ...ensured.snap.skills, [code]: updated }
  const seenCodes = ensured.snap.seenCodes.includes(code)
    ? ensured.snap.seenCodes
    : [...ensured.snap.seenCodes, code]
  return {
    snap: { ...ensured.snap, skills, seenCodes },
    before,
    after: updated.pL,
  }
}

/** Recent accuracy over the rolling window, in [0, 1]. Returns 0 if no data. */
export function recentAccuracy(skill: SkillState): number {
  if (skill.recent.length === 0) return 0
  const c = skill.recent.reduce((a, b) => a + (b ? 1 : 0), 0)
  return c / skill.recent.length
}

/** Total accuracy over all attempts, in [0, 1]. Returns 0 if no data. */
export function overallAccuracy(skill: SkillState): number {
  if (skill.attempts === 0) return 0
  return skill.correct / skill.attempts
}

/** Confidence proxy — how much evidence we have. 0 = cold start, 1 = saturated. */
export function confidence(skill: SkillState): number {
  return Math.min(1, skill.attempts / 20)
}

/** Light human-readable "trend" label — strictly a function of the data. */
export function trendLabel(
  skill: SkillState,
): 'cold' | 'improving' | 'flat' | 'declining' {
  if (skill.attempts < 3) return 'cold'
  const recent = recentAccuracy(skill)
  if (skill.trend - recent > 0.1) return 'declining'
  if (recent - skill.trend > 0.1) return 'improving'
  return 'flat'
}

/** Build an AttemptLogEntry given the current snapshot and the new mastery numbers. */
export function buildAttemptEntry(args: {
  lessonId: string
  objectiveCode: string
  kind: QuestionKind
  difficulty: Difficulty
  answer: string
  correct: boolean
  responseTimeMs: number
  masteryBefore: number
  masteryAfter: number
  reason: AttemptLogEntry['reason']
  ts?: number
}): AttemptLogEntry {
  return {
    ts: args.ts ?? Date.now(),
    lessonId: args.lessonId,
    objectiveCode: args.objectiveCode,
    kind: args.kind,
    difficulty: args.difficulty,
    answer: args.answer,
    correct: args.correct,
    responseTimeMs: args.responseTimeMs,
    masteryBefore: args.masteryBefore,
    masteryAfter: args.masteryAfter,
    reason: args.reason,
  }
}

/** Learning transition: P(L) moves toward 1 by P(T) of the remaining gap. */
export function bktTransition(
  pLGivenOutcome: number,
  pT: number = ADAPTIVE_CONFIG.P_T,
): number {
  return pLGivenOutcome + (1 - pLGivenOutcome) * pT
}
