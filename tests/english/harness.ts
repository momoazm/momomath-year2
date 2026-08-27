import { describe, expect, it } from 'vitest'
import type { LessonDef, Question, UnitDef } from '../../src/content/types'
import { Q_PER_LESSON } from '../../src/content/english/helpers'

/** Structural validation for any question the English curriculum can emit. */
export function expectValidEnglishQuestion(q: Question) {
  expect(typeof q.prompt).toBe('string')
  expect(q.prompt.length).toBeGreaterThan(0)
  if ('story' in q && q.story) {
    expect(q.story.title.length).toBeGreaterThan(0)
    expect(q.story.lines.length).toBeGreaterThan(0)
    for (const line of q.story.lines) expect(line.length).toBeGreaterThan(0)
  }
  switch (q.kind) {
    case 'mcq': {
      expect(q.choices.length).toBeGreaterThanOrEqual(3)
      expect(q.choices.length).toBeLessThanOrEqual(4)
      expect(new Set(q.choices).size).toBe(q.choices.length)
      expect(q.answerIndex).toBeGreaterThanOrEqual(0)
      expect(q.answerIndex).toBeLessThan(q.choices.length)
      break
    }
    case 'letter-tiles': {
      expect(q.targetWord).toMatch(/^[a-z]{3,12}$/)
      break
    }
    case 'truefalse': {
      expect(typeof q.statement).toBe('string')
      expect(q.statement.length).toBeGreaterThan(0)
      expect(typeof q.answer).toBe('boolean')
      break
    }
    case 'speak': {
      expect(q.targetText.length).toBeGreaterThan(0)
      expect(q.targetText.length).toBeLessThanOrEqual(120)
      break
    }
    case 'order': {
      expect(q.items.length).toBeGreaterThanOrEqual(2)
      expect(q.items.length).toBeLessThanOrEqual(8)
      expect(new Set(q.items).size).toBe(q.items.length)
      break
    }
    case 'match': {
      expect(q.pairs.length).toBeGreaterThanOrEqual(3)
      expect(q.pairs.length).toBeLessThanOrEqual(6)
      expect(new Set(q.pairs.map((p) => p.left)).size).toBe(q.pairs.length)
      expect(new Set(q.pairs.map((p) => p.right)).size).toBe(q.pairs.length)
      break
    }
    case 'tap-count': {
      const matches = q.cells.filter((c) => c === q.targetEmoji).length
      expect(matches).toBe(q.target)
      break
    }
  }
}

function checkLesson(id: string, lesson: LessonDef) {
  describe(`english lesson ${id}`, () => {
    it('generates exactly Q_PER_LESSON valid questions', () => {
      const qs = lesson.generate(Q_PER_LESSON, 1)
      expect(qs.length).toBe(Q_PER_LESSON)
      for (const q of qs) expectValidEnglishQuestion(q)
    })

    it('is valid across many seeds', () => {
      for (let seed = 2; seed <= 12; seed++) {
        const qs = lesson.generate(Q_PER_LESSON, seed)
        for (const q of qs) expectValidEnglishQuestion(q)
      }
    })

    it('is deterministic per (lessonId, seed) and varies with seed', () => {
      const a = lesson.generate(Q_PER_LESSON, 7)
      const b = lesson.generate(Q_PER_LESSON, 7)
      expect(a).toEqual(b)
      const variants = new Set(
        Array.from({ length: 5 }, (_, s) =>
          JSON.stringify(lesson.generate(Q_PER_LESSON, s + 50)),
        ),
      )
      expect(variants.size).toBeGreaterThan(1)
    })
  })
}

/** Run the full generic check-suite over one English unit. */
export function describeUnit(unit: UnitDef) {
  describe(`english unit ${unit.id} · ${unit.title}`, () => {
    it('ends with its boss lesson and declares it', () => {
      expect(unit.bossLessonIds).toEqual([`${unit.id}boss`])
      expect(unit.lessons.at(-1)?.id).toBe(`${unit.id}boss`)
    })

    it('has unique lesson ids and non-empty metadata', () => {
      const ids = unit.lessons.map((l) => l.id)
      expect(new Set(ids).size).toBe(ids.length)
      for (const l of unit.lessons) {
        expect(l.title.length).toBeGreaterThan(0)
        expect(l.objectiveCodes.length).toBeGreaterThan(0)
        expect(l.intro.title.length).toBeGreaterThan(0)
        expect(l.intro.body.length).toBeGreaterThan(0)
      }
    })
  })
  for (const l of unit.lessons) checkLesson(l.id, l)
}
