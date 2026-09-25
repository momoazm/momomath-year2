/** Daily check-up builder — one mixed review round assembled from (a) skills
 *  whose spaced-review interval has elapsed, across all 7 subjects, and
 *  (b) the most recent wrong-question snapshots. Pure functions: the UI just
 *  renders what comes back, and the session pays out XP only through the
 *  existing retry/practice flow (no crowns, no chests).
 *
 *  Determinism matters here — a child opening the app twice in one day gets
 *  the same check-up (seed defaults to the day number) and due-skill order
 *  never depends on object insertion order. */

import { questionFingerprint } from '../../content/makeLesson'
import { hashString } from '../../content/rng'
import { getCurriculum } from '../../content/registry'
import { isDueForReview } from './recommender'
import { ALL_SUBJECTS, lessonForCode, recentWrong, retryItemsFrom } from './lessons'
import type { AdaptiveSnapshot, AttemptLogEntry, SkillState } from './types'
import type { RetryItem } from './questions'

/** Questions in a full check-up round. */
export const CHECKUP_SIZE = 10
/** Cap on due-for-review items — the rest of the round is wrong-question review. */
export const CHECKUP_DUE_MAX = 7
/** Wrong-question snapshots pulled from the attempt log (newest first). */
export const CHECKUP_WRONG_MAX = 5

/** Objective codes whose spaced-review interval has elapsed, most overdue
 *  first (oldest lastPracticedAt). Cold skills (lastPracticedAt === 0) are
 *  never due. Deterministic: ties break on code so insertion order can't
 *  change the answer. */
export function dueSkillCodes(
  snap: AdaptiveSnapshot,
  now: number = Date.now(),
): string[] {
  const out: string[] = []
  for (const [code, skill] of Object.entries(snap.skills)) {
    if (isDueForReview(skill, now)) out.push(code)
  }
  out.sort((a, b) => {
    const delta = snap.skills[a]!.lastPracticedAt - snap.skills[b]!.lastPracticedAt
    if (delta !== 0) return delta
    return a < b ? -1 : a > b ? 1 : 0
  })
  return out
}

/** Generate one fresh question for an objective code from its own lesson's
 *  generator (slot = the code's index in the lesson). Returns null when the
 *  code no longer maps to a lesson (curriculum changed between saves). */
function questionForCode(
  code: string,
  skill: SkillState,
  seed: number,
): RetryItem | null {
  const found = lessonForCode(code)
  if (!found) return null
  for (const subject of ALL_SUBJECTS) {
    const entry = getCurriculum(subject).allLessons[found.lessonId]
    if (!entry) continue
    const lesson = entry.lesson
    const idx = lesson.objectiveCodes.indexOf(code)
    if (idx < 0) continue
    const qs = lesson.generate(idx + 2, seed ^ hashString(code))
    const q = qs[idx]
    if (!q) continue
    return {
      question: q,
      lessonId: lesson.id,
      objectiveCode: code,
      difficulty: skill.difficulty,
    }
  }
  return null
}

export interface BuildCheckupInput {
  snap: AdaptiveSnapshot
  attempts: AttemptLogEntry[]
  /** epoch ms — defaults to now (tests pin it) */
  now?: number
  /** generation seed — defaults to today's day number so the round is
   *  stable within a day and changes tomorrow */
  seed?: number
  /** round length — defaults to CHECKUP_SIZE */
  target?: number
}

export interface CheckupSession {
  /** The mixed round, due-skill and wrong-question items interleaved. */
  items: RetryItem[]
  /** due codes considered for this round (before lesson/generation misses) */
  dueCodes: string[]
  /** how many wrong-question snapshots made it into the round */
  wrongCount: number
}

/** Build the mixed review round. Empty result = nothing to check up on today
 *  (callers hide their entry points rather than showing a 0-question screen).
 *  Never mutates its inputs. */
export function buildCheckup(input: BuildCheckupInput): CheckupSession {
  const now = input.now ?? Date.now()
  const seed = input.seed ?? Math.floor(now / 86_400_000)
  const target = input.target ?? CHECKUP_SIZE

  const dueCodes = dueSkillCodes(input.snap, now).slice(0, CHECKUP_DUE_MAX)
  const dueItems: RetryItem[] = []
  for (const code of dueCodes) {
    const skill = input.snap.skills[code]
    if (!skill) continue
    const item = questionForCode(code, skill, seed)
    if (item) dueItems.push(item)
  }

  const wrongItems = retryItemsFrom(recentWrong(input.attempts, CHECKUP_WRONG_MAX))

  // Round-robin interleave (due skill first, then a wrong one, ...) so the
  // child alternates between "keep it fresh" and "fix my miss".
  const items: RetryItem[] = []
  const seen = new Set<string>()
  const add = (r: RetryItem): boolean => {
    const fp = questionFingerprint(r.question)
    if (seen.has(fp)) return false
    seen.add(fp)
    items.push(r)
    return true
  }
  let wrongCount = 0
  const rounds = Math.max(dueItems.length, wrongItems.length)
  for (let i = 0; i < rounds && items.length < target; i++) {
    const due = dueItems[i]
    if (due) add(due)
    if (items.length >= target) break
    const wrong = wrongItems[i]
    if (wrong && add(wrong)) wrongCount += 1
  }

  return { items, dueCodes, wrongCount }
}
