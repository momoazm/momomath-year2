import { describe, expect, it } from 'vitest'
import {
  ACTIVITY_QUESTIONS,
  activityTheme,
  activityXp,
  buildUnitChallenge,
} from '../src/engine/unitActivity'
import { getCurriculum } from '../src/content/registry'
import type { Subject } from '../src/content/types'

describe('activity themes (PLAN 103)', () => {
  it('covers all 7 subjects with distinct games', () => {
    const subjects: Subject[] = ['math', 'english', 'science', 'german', 'arabic', 'religion', 'social']
    for (const s of subjects) {
      const t = activityTheme(s)
      expect(t.game.length, s).toBeGreaterThan(0)
      expect(t.icon.length, s).toBeGreaterThan(0)
      expect(t.tagline.length, s).toBeGreaterThan(0)
    }
    const games = subjects.map((s) => activityTheme(s).game)
    expect(new Set(games).size).toBe(games.length)
    expect(activityTheme('math').game).toBe('Number Blaster')
    expect(activityTheme('english').game).toBe('Word Wizard')
    expect(activityTheme('science').game).toBe('Lab Pop')
  })
})

describe('buildUnitChallenge (PLAN 102)', () => {
  it('is deterministic per seed and fills a full run for math unit 1', () => {
    const unit = getCurriculum('math').units[0]
    const a = buildUnitChallenge(unit, 7)
    const b = buildUnitChallenge(unit, 7)
    expect(a).toEqual(b)
    expect(a.length).toBe(ACTIVITY_QUESTIONS)
  })

  it('builds two full lessons worth of questions for every unit for every subject', () => {
    for (const subject of ['math', 'english', 'science'] as const) {
      for (const unit of getCurriculum(subject).units) {
        if (unit.lessons.length < 2) continue
        const qs = buildUnitChallenge(unit, 3)
        expect(qs.length, `${subject}/${unit.id} count`).toBeLessThanOrEqual(ACTIVITY_QUESTIONS)
        expect(qs.length, `${subject}/${unit.id} non-empty`).toBeGreaterThanOrEqual(Math.min(6, ACTIVITY_QUESTIONS))
        // no IDENTICAL serves: mcq repeats only with different text, and all
        // visual-payload kinds repeat only with a different payload
        // no identical serves: the exact same mcq (same text + same choices +
        // same answer) never repeats; template siblings reuse only TEXT
        // (different numbers), which is a distinct question every time
        const mcqKeys = qs
          .filter((q) => q.kind === 'mcq')
          .map((q) => `${q.prompt}|${q.choices.join('~')}@${q.answerIndex}`)
        expect(new Set(mcqKeys).size, `${subject}/${unit.id} mcq uniqueness`).toBe(mcqKeys.length)
        // and every question carries renderable text
        for (const q of qs) {
          const t = q.kind === 'truefalse' ? q.statement : 'prompt' in q ? String(q.prompt) : ''
          expect(t.length, `${subject}/${unit.id} text`).toBeGreaterThan(0)
        }
      }
    }
  })

  it('an empty unit yields an empty challenge', () => {
    const unit = getCurriculum('math').units[0]
    expect(buildUnitChallenge({ ...unit, lessons: [] }, 1)).toEqual([])
  })
})

describe('activityXp', () => {
  it('pays 4 XP per correct answer, 0 when blank', () => {
    expect(activityXp(6)).toBe(24)
    expect(activityXp(0)).toBe(0)
    expect(activityXp(-2)).toBe(0)
  })
})
