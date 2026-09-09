/** Pure helpers for turning questions into replayable data.
 *
 *  The attempt log used to store only `{ answer }` — enough for stats, but
 *  not enough to *repeat* a question the child got wrong. These helpers let
 *  the lesson loop snapshot a wrong question (prompt + correct answer + the
 *  full question object) so the tracker can offer a "retry your tricky ones"
 *  mode later. No React, fully unit-tested. */

import type { Difficulty } from './types'
import type { Question } from '../../content/types'

/** One replayable question: the snapshot plus where it came from. */
export interface RetryItem {
  question: Question
  lessonId: string
  objectiveCode: string
  difficulty: Difficulty
}

/** Short human-readable prompt for any question kind. Never empty. */
export function questionPrompt(q: Question): string {
  switch (q.kind) {
    case 'mcq':
    case 'type-number':
    case 'match':
    case 'order':
    case 'tap-count':
    case 'letter-tiles':
      return q.prompt
    case 'truefalse':
      return `${q.prompt} — ${q.statement}`
    case 'speak':
      return `${q.prompt} — “${q.targetText}”`
  }
}

/** The correct answer as display text (mirrors the lesson "Not quite" line). */
export function correctAnswerText(q: Question): string {
  switch (q.kind) {
    case 'mcq':
      return q.choices[q.answerIndex] ?? ''
    case 'type-number':
      return String(q.answer)
    case 'tap-count':
      return String(q.target)
    case 'match':
      return 'all-matched'
    case 'order':
      return q.items.join(', ')
    case 'letter-tiles':
      return q.targetWord
    case 'truefalse':
      return q.answer ? 'true' : 'false'
    case 'speak':
      return q.targetText
  }
}

/** Deep-copy a question so later lesson state can't mutate the stored copy.
 *  Questions are plain JSON data; structuredClone with a JSON fallback. */
export function snapshotQuestion(q: Question): Question {
  try {
    return structuredClone(q)
  } catch {
    return JSON.parse(JSON.stringify(q)) as Question
  }
}
