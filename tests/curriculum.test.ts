import { describe, expect, it } from 'vitest'
import { ALL_LESSONS, QUESTIONS_PER_LESSON, UNITS } from '../src/content/curriculum'
import { expectValidQuestion } from './questionChecks'

describe('curriculum structure', () => {
  it('has nine units in order', () => {
    expect(UNITS.length).toBe(9)
    expect(UNITS.map((u) => u.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('gives every lesson a globally unique id', () => {
    const ids = UNITS.flatMap((u) => u.lessons.map((l) => l.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('indexes every lesson in ALL_LESSONS with its unit', () => {
    for (const u of UNITS) {
      for (const l of u.lessons) {
        const entry = ALL_LESSONS[l.id]
        expect(entry).toBeDefined()
        expect(entry.unit).toBe(u)
        expect(entry.lesson).toBe(l)
      }
    }
  })

  it('marks boss lessons consistently (units 1-8 have one each)', () => {
    for (const u of UNITS) {
      if (u.order <= 8) {
        expect(u.bossLessonIds).toEqual([`u${u.order}boss`])
        expect(u.lessons.at(-1)?.id).toBe(`u${u.order}boss`)
      } else {
        expect(u.bossLessonIds).toEqual([])
      }
      for (const id of u.bossLessonIds) {
        expect(id).toMatch(/^u\d+boss$/)
        expect(ALL_LESSONS[id]).toBeDefined()
      }
    }
  })
})

for (const [id, { lesson }] of Object.entries(ALL_LESSONS)) {
  describe(`lesson ${id}`, () => {
    it('generates exactly QUESTIONS_PER_LESSON valid questions', () => {
      const qs = lesson.generate(QUESTIONS_PER_LESSON, 1)
      expect(qs.length).toBe(QUESTIONS_PER_LESSON)
      for (const q of qs) expectValidQuestion(q)
    })

    it('is deterministic per (lessonId, seed) and varies with seed', () => {
      const a = lesson.generate(QUESTIONS_PER_LESSON, 7)
      const b = lesson.generate(QUESTIONS_PER_LESSON, 7)
      expect(a).toEqual(b)
    })

    it('produces different question sets for most seeds', () => {
      const variants = new Set(
        Array.from({ length: 6 }, (_, s) =>
          JSON.stringify(lesson.generate(QUESTIONS_PER_LESSON, s + 100)),
        ),
      )
      expect(variants.size).toBeGreaterThan(2)
    })
  })
}

describe('QUESTIONS_PER_LESSON', () => {
  it('is exported and matches the configured value', () => {
    expect(QUESTIONS_PER_LESSON).toBe(10)
  })
})
