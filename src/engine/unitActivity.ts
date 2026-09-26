import type { Question, Subject, UnitDef } from '../content/types'
import { hashString, mulberry32, shuffle } from '../content/rng'
import { questionKey } from '../content/lessonQueue'

/** Duolingo-style per-unit fun activities (PLAN 102-104). Everything here is
 *  pure + deterministic so the mini-game and its tests share one source. */

/** Questions per activity run (PLAN 102). */
export const ACTIVITY_QUESTIONS = 8
/** Seconds per question before it counts as wrong and moves on. */
export const ACTIVITY_SECONDS_PER_QUESTION = 12

export interface ActivityTheme {
  /** arcade-style name of the subject's game */
  game: string
  icon: string
  /** tailwind gradient classes for the game header */
  gradient: string
  tagline: string
}

/** One theme per subject (PLAN 103) — each subject feels like its own game. */
export const ACTIVITY_THEMES: Record<Subject, ActivityTheme> = {
  math: { game: 'Number Blaster', icon: '🎯', gradient: 'from-indigo-400 to-sky-500', tagline: 'Blast the right answer!' },
  english: { game: 'Word Wizard', icon: '📚', gradient: 'from-fuchsia-400 to-purple-500', tagline: 'Zap the right word!' },
  science: { game: 'Lab Pop', icon: '🔬', gradient: 'from-emerald-400 to-teal-500', tagline: 'Pop the right result!' },
  german: { game: 'Wort Sprint', icon: '🌀', gradient: 'from-amber-400 to-orange-500', tagline: 'Schnell — pick the right word!' },
  arabic: { game: 'كلمات سريعة', icon: '✨', gradient: 'from-rose-400 to-pink-500', tagline: 'اختر الإجابة الصحيحة!' },
  religion: { game: 'قيمنا', icon: '🌙', gradient: 'from-sky-400 to-indigo-500', tagline: 'ثبّت معلوماتك!' },
  social: { game: 'مجتمعنا', icon: '🏛️', gradient: 'from-lime-400 to-green-500', tagline: 'اكتشف الإجابة الصحيحة!' },
}

export function activityTheme(subject: Subject): ActivityTheme {
  return ACTIVITY_THEMES[subject] ?? ACTIVITY_THEMES.math
}

/** Build one run's question list from THAT unit's own lessons only.
 *  Deterministic in (unit.id, seed); spreads across lessons so the activity
 *  rehearses the whole unit, not one lesson. */
export function buildUnitChallenge(unit: UnitDef, seed: number): Question[] {
  if (!unit.lessons.length) return []
  const rng = mulberry32(hashString(`${unit.id}:${seed}`))
  const picked: Question[] = []
  const seen = new Set<string>()
  const order = shuffle(rng, [...unit.lessons])
  for (let round = 0; picked.length < ACTIVITY_QUESTIONS; round++) {
    let addedThisRound = false
    for (const lesson of order) {
      if (picked.length >= ACTIVITY_QUESTIONS) break
      let bank: Question[] = []
      try {
        bank = lesson.generate(4, hashString(`${unit.id}:${seed}:${lesson.id}:${round}`))
      } catch {
        continue
      }
      for (const q of shuffle(rng, [...bank])) {
        const key = `${lesson.id}|${questionKey(q)}`
        if (seen.has(key)) continue
        seen.add(key)
        picked.push(q)
        addedThisRound = true
        break
      }
    }
    if (!addedThisRound || round > 64) break // banks are dry — ship a short run
  }
  return picked.slice(0, ACTIVITY_QUESTIONS)
}

/** Compact grade summary used by the results screen (PLAN 102).
 *  NOTE: only the store's recordUnitActivity pays gems, so the reward card
 *  does not double-count — this computes XP only for the integer display. */
export function activityXp(correct: number): number {
  return Math.max(0, correct) * 4
}
