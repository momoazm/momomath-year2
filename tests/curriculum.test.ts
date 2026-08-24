import { describe, expect, it } from 'vitest'
import { ALL_LESSONS, QUESTIONS_PER_LESSON, UNITS } from '../src/content/curriculum'
import { expectValidQuestion } from './questionChecks'

describe('curriculum structure', () => {
  it('has thirteen units in Cambridge order', () => {
    expect(UNITS.length).toBe(13)
    expect(UNITS.map((u) => u.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
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

  it('marks every unit with a consistent trailing boss lesson', () => {
    for (const u of UNITS) {
      expect(u.bossLessonIds).toEqual([`${u.id}boss`])
      expect(u.lessons.at(-1)?.id).toBe(`${u.id}boss`)
      for (const id of u.bossLessonIds) {
        expect(id).toMatch(/^u\d+boss$/)
        expect(ALL_LESSONS[id]).toBeDefined()
      }
    }
  })

  it('covers every Cambridge Stage 2 sub-strand', () => {
    const codes = UNITS.flatMap((unit) => unit.lessons.flatMap((l) => l.objectiveCodes))
    for (const sub of ['2Nc', '2Ni', '2Nm', '2Np', '2Nf', '2Gg', '2Gp', '2Gt', '2Ss', '2Sp']) {
      expect(codes.some((c) => c.startsWith(sub + '.'))).toBe(true)
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
