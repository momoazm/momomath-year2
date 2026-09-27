import { ADAPTIVE_CONFIG } from './config'
import type { AttemptLogEntry } from './types'

/** Add a log entry, dropping the oldest if the cap is exceeded. */
export function appendAttempt(
  log: AttemptLogEntry[],
  entry: AttemptLogEntry,
): AttemptLogEntry[] {
  const next = [...log, entry]
  if (next.length > ADAPTIVE_CONFIG.ATTEMPT_LOG_CAP) {
    return next.slice(next.length - ADAPTIVE_CONFIG.ATTEMPT_LOG_CAP)
  }
  return next
}

/** Keep full question snapshots only on the newest `keep` wrong attempts.
 *  Older misses keep their prompt/answer/kind stats but drop the bulky
 *  question object — this bounds localStorage and cloud payloads while the
 *  retry list always has fresh material. Log is oldest-first. */
export function capSnapshots(
  log: AttemptLogEntry[],
  keep = 50,
): AttemptLogEntry[] {
  let seen = 0
  const out = new Array<AttemptLogEntry>(log.length)
  for (let i = log.length - 1; i >= 0; i--) {
    const e = log[i]!
    if (!e.correct && e.q) {
      seen += 1
      out[i] = seen > keep ? { ...e, q: null } : e
    } else {
      out[i] = e
    }
  }
  return out
}

/** Append a mastery snapshot for trend visualisation. */
export function appendMasterySnapshot(
  history: Record<string, { ts: number; pL: number }[]>,
  code: string,
  pL: number,
  now: number = Date.now(),
  cap: number = 200,
): Record<string, { ts: number; pL: number }[]> {
  const series = history[code] ?? []
  const next = [...series, { ts: now, pL }].slice(-cap)
  return { ...history, [code]: next }
}

/** Compute a per-skill summary used by the parent insights panel. */
export interface SkillSummary {
  code: string
  attempts: number
  correct: number
  accuracy: number
  mastery: number
  recentAccuracy: number
  trend: 'cold' | 'improving' | 'flat' | 'declining'
  difficulty: 1 | 2 | 3
  lastPracticedAt: number
  isDueForReview: boolean
}

import { ensureSkill, recentAccuracy, trendLabel } from './model'
import { isDueForReview } from './recommender'

export function summariseSkill(code: string, snap: import('./types').AdaptiveSnapshot, now: number = Date.now()): SkillSummary | null {
  const ensured = ensureSkill(snap, code, now)
  if (ensured.skill.attempts === 0) return null
  const s = ensured.skill
  return {
    code,
    attempts: s.attempts,
    correct: s.correct,
    accuracy: s.correct / s.attempts,
    mastery: s.pL,
    recentAccuracy: recentAccuracy(s),
    trend: trendLabel(s),
    difficulty: s.difficulty,
    lastPracticedAt: s.lastPracticedAt,
    isDueForReview: isDueForReview(s, now),
  }
}
