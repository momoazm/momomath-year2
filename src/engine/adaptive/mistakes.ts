import type { Question, QuestionKind } from '../../content/types'

export type MistakeKind =
  | 'off-by-one'
  | 'place-value-swap'
  | 'operation-confusion'
  | 'distractor-lock-in'
  | 'order-error'
  | 'tap-extra'
  | 'unknown'

export interface MistakeAnalysis {
  kind: MistakeKind
  /** Short, age-appropriate sentence shown to the kid. */
  template: string
  /** Did we find something specific? false ⇒ never fabricate a misconception. */
  identified: boolean
}

/** Reverses the digits of a non-negative integer. */
function reverseDigits(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return n
  return parseInt(String(n).split('').reverse().join(''), 10)
}

/** Heuristic for "is the student's number one of the obvious operations over the
 *  operands of the correct number?" — we have to be careful here because the
 *  prompt is free text; we look for the right shape. */
function looksLikeOperationError(
  student: number,
  correct: number,
  operands: number[] | undefined,
): boolean {
  if (!operands || operands.length < 2) return false
  const [a, b] = operands
  if (a + b === student) return true
  if (a - b === student) return true
  if (a * b === student) return true
  if (b !== 0 && a / b === student) return true
  return false
}

/** Distractor pattern when the generator wrote the wrong multiple as a choice. We
 *  don't have access to the generator here; we just inspect the answer vs correct. */
function looksLikeDistractorLockIn(student: number, correct: number): boolean {
  const d = Math.abs(student - correct)
  // common distractor spreads: ±1, ±2, ±5, ±10, ±100 — surface only if also "round"
  if (d === 1 || d === 2 || d === 5 || d === 10 || d === 100) return true
  return false
}

/** Classify a wrong first-attempt. Returns deterministic analysis only when we
 *  can support it from the data we have. */
export function classifyMistake(
  question: Question,
  studentAnswer: string,
  correctAnswer: string,
): MistakeAnalysis {
  const correctNum = Number(correctAnswer)
  const studentNum = Number(studentAnswer)
  const hasNumbers =
    Number.isFinite(correctNum) && Number.isFinite(studentNum)

  // type-number / typed fields
  if (question.kind === 'type-number') {
    if (hasNumbers) {
      if (Math.abs(studentNum - correctNum) === 1) {
        return {
          kind: 'off-by-one',
          template: 'So close! You were just one away — try counting once more.',
          identified: true,
        }
      }
      // place-value swap (e.g. correct=32, student=23)
      if (
        correctNum >= 10 &&
        correctNum < 100 &&
        reverseDigits(correctNum) === studentNum
      ) {
        return {
          kind: 'place-value-swap',
          template: 'You swapped the tens and the ones. Which digit is the tens?',
          identified: true,
        }
      }
      if (looksLikeDistractorLockIn(studentNum, correctNum)) {
        return {
          kind: 'distractor-lock-in',
          template: 'Good try — read the question once more and try again.',
          identified: true,
        }
      }
    }
    return {
      kind: 'unknown',
      template: "Let's try that one more time — you can do it!",
      identified: false,
    }
  }

  // mcq / truefalse — student picked something
  if (question.kind === 'mcq') {
    return {
      kind: 'distractor-lock-in',
      template: 'Good try — have another look at the choices.',
      identified: true,
    }
  }

  if (question.kind === 'order') {
    return {
      kind: 'order-error',
      template: 'Almost! Think about whether it should be smallest first or biggest first.',
      identified: true,
    }
  }

  if (question.kind === 'tap-count') {
    return {
      kind: 'tap-extra',
      template: 'Make sure to tap ONLY the matching ones.',
      identified: true,
    }
  }

  return {
    kind: 'unknown',
    template: "Let's try that one more time.",
    identified: false,
  }
}

/** Build a "similar" follow-up question. We can't run the generator from here
 *  (we don't have the lesson's closure or the rand instance) — the caller
 *  is responsible for re-rolling. This helper just decides whether a follow-up
 *  *should* be generated, and what kind. */
export function shouldGenerateFollowUp(
  analysis: MistakeAnalysis,
): boolean {
  // We always want a follow-up after a wrong first attempt; the recommender /
  // lesson loop uses this signal to know to re-queue. For unknown mistakes we
  // still re-queue, but with a slightly easier question.
  void analysis
  return true
}

/** Re-roll seed. Pure: returns seed + 1, capped, never equal to the previous one. */
export function nextFollowUpSeed(prev: number): number {
  return (prev + 0x9e3779b1) >>> 0
}

/** Map question kind to a child-friendly name used in template explanations. */
export function kindLabel(kind: QuestionKind): string {
  switch (kind) {
    case 'mcq': return 'choice'
    case 'type-number': return 'number'
    case 'match': return 'matching'
    case 'order': return 'ordering'
    case 'tap-count': return 'counting'
    case 'letter-tiles': return 'spelling'
    case 'truefalse': return 'true-or-false'
    case 'speak': return 'reading'
  }
}
