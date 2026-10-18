/**
 * WS19 — Covered-content question selector (PURE, additive). Builds the
 * covered-lesson question pool that battles draw from (PLAN.md §13.5):
 *
 *  - pool = COMPLETED lessons (`completions > 0`) of the CURRENT subject ONLY
 *  - fresh save (no completions) falls back to always-unlocked opening lessons
 *  - higher gyms PREFER later-unit generators (harder content) via a
 *    deterministic bias, so difficulty scales with progress
 *  - questions are deterministic (seeded) and deduped by prompt
 *
 * Mirrors sprint.ts collectUnitMcqs (the battle uses MCQ-only harvest) but is
 * generic across every subject and gated by real lessonProgress. Screens pass
 * in plain lessonProgress + subject; the store stays authoritative for XP.
 */
import { getCurriculum } from '../../content/registry'
import { mulberry32 } from '../../content/rng'
import type { LessonDef, Question, Subject, UnitDef } from '../../content/types'
import type { LessonProgress } from '../store'

/** One harvested, battle-ready MCQ. */
export interface BattleQuestion {
  prompt: string
  choices: string[]
  answerIndex: number
  lessonId: string
  unitId: string
  unitTitle: string
}

/** How many questions to generate per lesson when harvesting (bank diversity). */
export const BATTLE_GENERATE_PER_LESSON = 16
/** Deterministic seeds used to widen thin banks (kept small: battles are quick). */
export const BATTLE_BANK_SEEDS = [1, 2] as const
/** Target deck size handed to a duel (cycle if the battle outlasts it). */
export const BATTLE_DECK_SIZE = 40

/** lessonProgress slice shape consumed here (subset of the store's record). */
export type ProgressMap = Record<string, LessonProgress | undefined>

function isCompleted(p: LessonProgress | undefined): boolean {
  return !!p && (p.completions ?? 0) > 0
}

/** Audio-only prompts are excluded for a silent, fully-visual battle round —
 *  same rule as sprint.ts. Covers the English listen generators ("tap the
 *  word you hear") AND the Arabic listening generators (religion / arabic /
 *  social: "استمع واضغط على … الذي سمعته/سمعتها") which the original
 *  English-only filter missed — those questions are unanswerable without
 *  TTS, and duels deliberately have no audio (WS26 fix, found during the
 *  2026-10-18 replay). */
export const LISTEN_ONLY_PROMPT_RE =
  /\b(hear|heard|listen|listening|sound|audio|voice)\b|سمعت|استمع\s+واضغط/i

/** Sound-only prompts ("tap the word you hear") are excluded. */
function cardFrom(q: Question, lessonId: string, unit: UnitDef): BattleQuestion | null {
  if (q.kind !== 'mcq') return null
  if (typeof q.prompt !== 'string' || !q.prompt.trim()) return null
  if (LISTEN_ONLY_PROMPT_RE.test(q.prompt)) return null
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

/** Harvest every well-formed MCQ of one lesson (deduped, seeded). */
function collectLessonMcqs(
  lesson: LessonDef,
  unit: UnitDef,
  seeds: readonly number[] = BATTLE_BANK_SEEDS,
): BattleQuestion[] {
  const out: BattleQuestion[] = []
  const seen = new Set<string>()
  for (const seed of seeds) {
    let qs: Question[] = []
    try {
      qs = lesson.generate(BATTLE_GENERATE_PER_LESSON, seed)
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
  return out
}

/**
 * Completed-lesson IDs for a subject, in curriculum order. An empty result
 * means a fresh save on this subject — the caller should use
 * `openingLessonIds` instead.
 */
export function completedLessonIds(subject: Subject, progress: ProgressMap): string[] {
  const c = getCurriculum(subject)
  const out: string[] = []
  for (const unit of c.units) {
    for (const lesson of unit.lessons) {
      if (isCompleted(progress[lesson.id])) out.push(lesson.id)
    }
  }
  return out
}

/**
 * Always-unlocked opening lessons (fresh-save fallback): the first lesson of
 * each of the first two units. Guarantees a non-empty pool with zero progress.
 */
export function openingLessonIds(subject: Subject): string[] {
  const c = getCurriculum(subject)
  const out: string[] = []
  for (const unit of c.units.slice(0, 2)) {
    const first = unit.lessons[0]
    if (first) out.push(first.id)
  }
  return out.length ? out : (c.units[0]?.lessons.slice(0, 1).map((l) => l.id) ?? [])
}

/** Deterministic later-unit bias for higher gyms: returns the pool restricted
 *  to a prefer-window of later units (still including every completed lesson
 *  so nothing is ever unreachable). `gym` is 1-based. */
function preferLaterUnits<T extends { unitId: string }>(pool: T[], unitOrder: string[], gym: number): T[] {
  if (gym <= 1 || pool.length === 0) return pool
  // gym 1 → no bias; each gym after that keeps the LAST n units, n shrinking
  // toward 2. Keeps deterministic + never-empty (falls back to the full pool).
  const keep = Math.max(2, Math.ceil(unitOrder.length / 2) - Math.floor(gym / 2))
  const allowed = new Set(unitOrder.slice(-keep))
  const filtered = pool.filter((q) => allowed.has(q.unitId))
  return filtered.length >= 8 ? filtered : pool
}

/**
 * Build the battle deck for one duel: completed lessons of the CURRENT
 * subject (or the opening-lesson fallback), biased toward later units on
 * higher gyms, deduped by prompt, deterministically shuffled, capped at
 * `size` (the duel cycles the deck if it outlasts it).
 *
 * PURE: reads only the passed-in `progress`; never touches the store.
 */
export function buildBattleDeck(args: {
  subject: Subject
  progress: ProgressMap
  gym: number
  seed: number
  size?: number
}): BattleQuestion[] {
  const { subject, progress, gym, seed } = args
  const size = args.size ?? BATTLE_DECK_SIZE
  const c = getCurriculum(subject)

  // Which lesson IDs feed the pool?
  let ids = completedLessonIds(subject, progress)
  let usingFallback = false
  if (ids.length === 0) {
    ids = openingLessonIds(subject)
    usingFallback = true
  }
  const idSet = new Set(ids)

  // unitOrder (for the later-unit bias) + harvest
  const unitOrder = c.units.map((u) => u.id)
  const pool: BattleQuestion[] = []
  const seen = new Set<string>()
  for (const unit of c.units) {
    for (const lesson of unit.lessons) {
      if (!idSet.has(lesson.id)) continue
      for (const card of collectLessonMcqs(lesson, unit)) {
        const key = card.prompt.trim()
        if (seen.has(key)) continue
        seen.add(key)
        pool.push(card)
      }
    }
  }

  // Higher gyms prefer later-unit generators (skip on the fresh-save fallback,
  // where the opening lessons are the whole pool anyway).
  const biased = usingFallback ? pool : preferLaterUnits(pool, unitOrder, gym)

  // Deterministic Fisher-Yates (mulberry32) — same seed ⇒ same deck.
  const rand = mulberry32(Math.abs(Math.floor(seed)) || 1)
  const deck = [...biased]
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    const tmp = deck[i]!
    deck[i] = deck[j]!
    deck[j] = tmp
  }
  return deck.slice(0, size)
}
