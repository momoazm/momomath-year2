/** PLAN 144/146 — shared lesson walk: the audit script (bundled via esbuild)
 *  and tests/syllabusRegistry.test.ts consume the SAME seeds + question
 *  bucketing, so the audit report and the regression guard can never drift.
 */
import type { LessonDef, Question, Subject, StoryPanel } from '../types'
import type { Curriculum } from '../registry'

export const AUDIT_SEEDS: readonly number[] = [20260927, 7]

interface Aux {
  hint?: string
  story?: StoryPanel
}

/** bank = words the child must READ/CHOOSE/MATCH; text = prompts/hints/teach. */
export function bucketQuestion(q: Question): { bank: string[]; text: string[] } {
  const bank: string[] = []
  const text: string[] = []
  const aux = q as unknown as Aux
  switch (q.kind) {
    case 'mcq':
      bank.push(...q.choices)
      text.push(q.prompt ?? '')
      break
    case 'match':
      for (const p of q.pairs) bank.push(p.left, p.right)
      text.push(q.prompt ?? '')
      break
    case 'order':
      bank.push(...q.items)
      text.push(q.prompt ?? '')
      break
    case 'letter-tiles':
      bank.push(q.targetWord)
      text.push(q.prompt ?? '')
      break
    case 'truefalse':
      text.push(q.statement ?? '', q.prompt ?? '')
      break
    case 'speak':
      text.push(q.targetText ?? '', q.prompt ?? '')
      break
    case 'tap-count':
    case 'type-number':
    default:
      text.push(q.prompt ?? '')
      break
  }
  if (aux.hint) text.push(aux.hint)
  if (aux.story) {
    text.push(aux.story.title ?? '')
    for (const line of aux.story.lines ?? []) text.push(line)
  }
  return { bank, text }
}

/** Walk every lesson of a subject and call cb for each generated question
 *  (AUDIT_SEEDS, 24 questions per seed — identical to the audit). Returns the
 *  lesson count. Generation failures are logged and skipped. */
export function eachGeneratedQuestion(
  curricula: Record<Subject, Curriculum>,
  subject: Subject,
  cb: (lesson: LessonDef, q: Question) => void,
): number {
  let lessons = 0
  for (const entry of Object.values(curricula[subject].allLessons)) {
    const lesson = entry.lesson
    lessons++
    for (const seed of AUDIT_SEEDS) {
      let qs: Question[]
      try {
        qs = lesson.generate(24, seed)
      } catch (err) {
        console.error(`[gen-fail] ${subject}/${lesson.id} seed=${seed}: ${(err as Error).message}`)
        continue
      }
      for (const q of qs) cb(lesson, q)
    }
  }
  return lessons
}
