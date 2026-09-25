/**
 * WS16 — Flashcard Sprint: 60-second rapid-fire over the EXISTING English
 * MCQ banks (no new content). Pure rules + bank extraction + deterministic
 * deck shuffle — the screen owns the clock and the UI, the store owns the
 * persistence (sprintBest / sprintRuns) and pays XP via recordPractice.
 */
import { getCurriculum } from '../content/registry'
import { mulberry32 } from '../content/rng'
import type { Question, UnitDef } from '../content/types'

/** Round length in milliseconds. */
export const SPRINT_SECONDS = 60
export const SPRINT_MS = SPRINT_SECONDS * 1000
/** How long the right/wrong flash shows before the next card (ms). */
export const SPRINT_FEEDBACK_MS = 450
/** Questions generated per lesson when harvesting MCQs (bank diversity). */
export const SPRINT_GENERATE_PER_LESSON = 16
/** Extra deterministic seeds used to widen thin unit banks. */
export const SPRINT_BANK_SEEDS = [1, 2, 3] as const
/** XP paid per correct answer (XP-only payout — no gems beyond recordPractice). */
export const SPRINT_XP_PER_CORRECT = 1

export interface SprintCard {
  prompt: string
  choices: string[]
  answerIndex: number
  lessonId: string
  unitId: string
  unitTitle: string
}

function cardFrom(q: Question, lessonId: string, unit: UnitDef): SprintCard | null {
  if (q.kind !== 'mcq') return null
  if (typeof q.prompt !== 'string' || !q.prompt.trim()) return null
  // The sprint is a fully VISUAL speed round (no audio playback), so prompts
  // that only make sense with sound ("tap the word you hear") are excluded.
  if (/\b(hear|listen|sound)\b/i.test(q.prompt)) return null
  if (!Array.isArray(q.choices) || q.choices.length < 2 || q.choices.length > 4) return null
  if (q.choices.some((c) => typeof c !== 'string' || !c.trim())) return null
  if (!Number.isInteger(q.answerIndex) || q.answerIndex < 0 || q.answerIndex >= q.choices.length) return null
  return {
    prompt: q.prompt,
    choices: [...q.choices],
    answerIndex: q.answerIndex,
    lessonId,
    unitId: unit.id,
    unitTitle: unit.title,
  }
}

/** Every well-formed MCQ of one english unit (deduped by prompt, seeded). */
export function collectUnitMcqs(unit: UnitDef, seeds: readonly number[] = SPRINT_BANK_SEEDS): SprintCard[] {
  const out: SprintCard[] = []
  const seen = new Set<string>()
  for (const seed of seeds) {
    for (const lesson of unit.lessons) {
      let qs: Question[] = []
      try {
        qs = lesson.generate(SPRINT_GENERATE_PER_LESSON, seed)
      } catch {
        continue
      }
      for (const q of qs) {
        const card = cardFrom(q, lesson.id, unit)
        if (!card) continue
        const key = card.prompt.trim()
        if (seen.has(key)) continue
        seen.add(key)
        out.push(card)
      }
    }
  }
  return out
}

/** Full english sprint bank — every unit's MCQs, globally deduped. */
export function buildSprintBank(seeds: readonly number[] = SPRINT_BANK_SEEDS): SprintCard[] {
  const c = getCurriculum('english')
  const out: SprintCard[] = []
  const seen = new Set<string>()
  for (const unit of c.units) {
    for (const card of collectUnitMcqs(unit, seeds)) {
      const key = card.prompt.trim()
      if (seen.has(key)) continue
      seen.add(key)
      out.push(card)
    }
  }
  return out
}

/** Deterministic Fisher-Yates shuffle (mulberry32) — same seed ⇒ same order. */
export function sprintDeck(bank: readonly SprintCard[], seed: number): SprintCard[] {
  const rand = mulberry32(Math.abs(Math.floor(seed)) || 1)
  const deck = [...bank]
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    const tmp = deck[i]!
    deck[i] = deck[j]!
    deck[j] = tmp
  }
  return deck
}

export interface SprintRunState {
  /** correct answers (the score) */
  score: number
  /** consecutive correct answers right now (resets on a wrong tap) */
  streak: number
  /** best streak reached in this run */
  bestStreak: number
  /** every tap (correct + wrong) */
  answered: number
}

export const initialSprintRun = (): SprintRunState => ({
  score: 0,
  streak: 0,
  bestStreak: 0,
  answered: 0,
})

/** Apply one answer: correct scores +1 and extends the streak; wrong resets it. */
export function applySprintAnswer(state: SprintRunState, correct: boolean): SprintRunState {
  if (correct) {
    const streak = state.streak + 1
    return {
      score: state.score + 1,
      streak,
      bestStreak: Math.max(state.bestStreak, streak),
      answered: state.answered + 1,
    }
  }
  return { ...state, streak: 0, answered: state.answered + 1 }
}

/** XP-only payout: 1 XP per correct answer (never negative). */
export function sprintXpFor(score: number): number {
  return Math.max(0, Math.round(Number(score) || 0) * SPRINT_XP_PER_CORRECT)
}

/** True only for a STRICTLY higher score than the stored best (0 never "wins"). */
export function isNewSprintBest(score: number, prevBest: number): boolean {
  return score > 0 && score > prevBest
}

/** Remaining round time, clamped to [0, SPRINT_MS] (clock skew safe). */
export function sprintRemainingMs(startedAt: number, now: number): number {
  return Math.min(SPRINT_MS, Math.max(0, SPRINT_MS - (now - startedAt)))
}

export function isSprintTimeUp(startedAt: number, now: number): boolean {
  return sprintRemainingMs(startedAt, now) <= 0
}

/** Rounded accuracy % of the run, or null when nothing was answered. */
export function sprintAccuracy(run: SprintRunState): number | null {
  if (run.answered <= 0) return null
  return Math.round((run.score / run.answered) * 100)
}
