/** Per-lesson rollups over the attempt log — the data behind
 *  "which lessons should we repeat?" in the tracker (Profile → Learning
 *  insights).
 *
 *  Two ideas drive it:
 *  1. Hardest-question accuracy — attempts logged at difficulty 3 are the
 *     stretch questions of a lesson. If a child cruises the easy ones but
 *     flops the hard ones, the lesson isn't locked in yet.
 *  2. Wrong-question recall — the most recent missed questions, newest first,
 *     each carrying its question snapshot so it can be retried exactly.
 *
 *  Pure functions, no React. The attempt log is the only input besides the
 *  mastery snapshot, so old saves (all difficulty 1, no snapshots) degrade
 *  gracefully: hardest stats show "—" and the wrong list shows prompts only. */

import { getCurriculum } from '../../content/registry'
import type { Subject } from '../../content/types'
import { buildCatalog } from './catalog'
import { isDueForReview } from './recommender'
import { ensureSkill } from './model'
import type { MistakeKind } from './mistakes'
import type {
  AdaptiveSnapshot,
  AttemptLogEntry,
  Difficulty,
} from './types'
import type { RetryItem } from './questions'

const ALL_SUBJECTS: Subject[] = [
  'math',
  'english',
  'science',
  'german',
  'arabic',
  'religion',
  'social',
]

/** Find a lesson's human title across every subject (attempts span subjects). */
export function findLessonTitle(lessonId: string): {
  title: string
  unitTitle: string
  subject: Subject
} | null {
  for (const subject of ALL_SUBJECTS) {
    const entry = getCurriculum(subject).allLessons[lessonId]
    if (entry) {
      return { title: entry.lesson.title, unitTitle: entry.unit.title, subject }
    }
  }
  return null
}

/** Map an objective code to its lesson (first catalog hit across subjects). */
export function lessonForCode(code: string): {
  lessonId: string
  title: string
} | null {
  for (const subject of ALL_SUBJECTS) {
    const hit = buildCatalog(subject).find((e) => e.code === code)
    if (hit) return { lessonId: hit.lessonId, title: hit.title }
  }
  return null
}

/** Hardest-question (difficulty 3) record per objective code from the log. */
export function hardestByCode(
  attempts: AttemptLogEntry[],
): Map<string, { total: number; correct: number }> {
  const out = new Map<string, { total: number; correct: number }>()
  for (const a of attempts) {
    if (a.difficulty !== 3) continue
    const cur = out.get(a.objectiveCode) ?? { total: 0, correct: 0 }
    cur.total += 1
    if (a.correct) cur.correct += 1
    out.set(a.objectiveCode, cur)
  }
  return out
}

/** Parent-friendly reading of a deterministic mistake kind. */
export const MISTAKE_HINTS: Record<Exclude<MistakeKind, 'unknown'>, string> = {
  'off-by-one': 'answers landing one away — count once more together',
  'place-value-swap': 'swapping tens and ones — name each digit\'s place',
  'operation-confusion': 'mixing up which operation to use',
  'distractor-lock-in': 'picking near-miss choices — re-read before tapping',
  'order-error': 'ordering slips — check smallest-first vs biggest-first',
  'tap-extra': 'tapping extra items — tap only the matching ones',
}

/** Dominant misconception in a set of attempts (needs 2+ identified to count). */
export function topMistakeKind(
  attempts: AttemptLogEntry[],
): { kind: Exclude<MistakeKind, 'unknown'>; count: number } | null {
  const counts = new Map<Exclude<MistakeKind, 'unknown'>, number>()
  for (const a of attempts) {
    if (a.correct || !a.mistakeKind || a.mistakeKind === 'unknown') continue
    counts.set(a.mistakeKind, (counts.get(a.mistakeKind) ?? 0) + 1)
  }
  let best: { kind: Exclude<MistakeKind, 'unknown'>; count: number } | null = null
  for (const [kind, count] of counts) {
    if (count >= 2 && (!best || count > best.count)) best = { kind, count }
  }
  return best
}

export interface LessonRepeatInfo {
  lessonId: string
  title: string
  unitTitle: string
  attempts: number
  accuracy: number
  /** difficulty-3 attempts (the stretch/hardest questions) */
  hardestAttempts: number
  hardestAccuracy: number | null
  /** mean BKT mastery across the lesson's objective codes (0-1) */
  avgMastery: number
  /** how many of the lesson's skills are due for spaced review */
  dueCount: number
  /** dominant misconception pattern (2+ identified misses), if any */
  topMistake: { kind: Exclude<MistakeKind, 'unknown'>; count: number } | null
  /** rushed guesses (fast wrong answers) in this lesson */
  rushedCount: number
  /** why this lesson is flagged (empty when it's fine) */
  reasons: string[]
  needsRepeat: boolean
  /** sort key — lower means "repeat me first" */
  score: number
}

export interface SummariseLessonsInput {
  attempts: AttemptLogEntry[]
  snapshot: AdaptiveSnapshot
  now?: number
  /** max lessons returned (default 4) */
  limit?: number
}

function pct(x: number): string {
  return `${Math.round(x * 100)}%`
}

/** Roll the attempt log up per lesson and flag the ones worth repeating.
 *  Only lessons needing a repeat are returned, worst first. */
export function lessonsToRepeat(input: SummariseLessonsInput): LessonRepeatInfo[] {
  const now = input.now ?? Date.now()
  const byLesson = new Map<string, AttemptLogEntry[]>()
  for (const a of input.attempts) {
    const list = byLesson.get(a.lessonId) ?? []
    list.push(a)
    byLesson.set(a.lessonId, list)
  }

  const out: LessonRepeatInfo[] = []
  for (const [lessonId, list] of byLesson) {
    // Attempts on this lesson's objective codes (a lesson can share codes,
    // so gather codes from the log, not the curriculum).
    const codes = [...new Set(list.map((a) => a.objectiveCode))]
    const correct = list.filter((a) => a.correct).length
    const accuracy = list.length ? correct / list.length : 0

    const hardest = list.filter((a) => a.difficulty === 3)
    const hardestCorrect = hardest.filter((a) => a.correct).length
    const hardestAccuracy = hardest.length ? hardestCorrect / hardest.length : null

    let masterySum = 0
    let dueCount = 0
    for (const code of codes) {
      const { skill } = ensureSkill(input.snapshot, code, now)
      if (skill.attempts === 0) continue
      masterySum += skill.pL
      if (isDueForReview(skill, now)) dueCount += 1
    }
    const avgMastery = codes.length ? masterySum / codes.length : 0

    const reasons: string[] = []
    if (hardestAccuracy !== null && hardest.length >= 2 && hardestAccuracy < 0.6) {
      reasons.push(`Hardest questions only ${pct(hardestAccuracy)} — replay to lock it in`)
    }
    if (list.length >= 3 && accuracy < 0.7) {
      reasons.push(`Overall ${pct(accuracy)} on this lesson — needs practice`)
    }
    if (avgMastery > 0 && avgMastery < 0.5) {
      reasons.push(`Mastery ${pct(avgMastery)} — still learning`)
    }
    const topMistake = topMistakeKind(list)
    if (topMistake) {
      reasons.push(`Often ${MISTAKE_HINTS[topMistake.kind]} (${topMistake.count}×)`)
    }
    const rushedCount = list.filter((a) => !a.correct && a.rushed).length
    if (rushedCount >= 2) {
      reasons.push(`${rushedCount} rushed guesses — slow down and read each question`)
    }
    if (dueCount > 0) {
      reasons.push(`Due for a check-up 🔔`)
    }
    if (reasons.length === 0) continue

    const found = findLessonTitle(lessonId)
    // Worst first: hardest accuracy, then overall accuracy, then mastery.
    const score =
      (hardestAccuracy ?? accuracy) * 0.5 + accuracy * 0.3 + avgMastery * 0.2
    out.push({
      lessonId,
      title: found?.title ?? lessonId,
      unitTitle: found?.unitTitle ?? '',
      attempts: list.length,
      accuracy,
      hardestAttempts: hardest.length,
      hardestAccuracy,
      avgMastery,
      dueCount,
      topMistake,
      rushedCount,
      reasons,
      needsRepeat: true,
      score,
    })
  }

  out.sort((a, b) => a.score - b.score)
  return out.slice(0, input.limit ?? 4)
}

/** Most recent wrong first-attempts that carry a replayable snapshot,
 *  newest first, capped. Falls back to prompt-only entries when no snapshot
 *  exists (old saves) — callers check `q` before offering exact retry. */
export function recentWrong(
  attempts: AttemptLogEntry[],
  limit = 5,
): AttemptLogEntry[] {
  return attempts
    .filter((a) => !a.correct)
    .sort((a, b) => b.ts - a.ts)
    .slice(0, limit)
}

/** Turn wrong log entries into replayable items (skips entries without a
 *  stored question — e.g. from before snapshots existed). */
export function retryItemsFrom(
  entries: AttemptLogEntry[],
): RetryItem[] {
  const out: RetryItem[] = []
  for (const e of entries) {
    if (!e.q) continue
    out.push({
      question: e.q,
      lessonId: e.lessonId,
      objectiveCode: e.objectiveCode,
      difficulty: (e.difficulty ?? 1) as Difficulty,
    })
  }
  return out
}
