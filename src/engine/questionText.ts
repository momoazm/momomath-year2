/** Short human-readable prompt / correct-answer text for any question kind. */
import type { Question } from '../content/types'

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
