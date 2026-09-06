import { describe, expect, it } from 'vitest'
import { SCIENCE_ALL_LESSONS, SCIENCE_UNITS } from '../src/content/science'
import { CURRICULA, getCurriculum } from '../src/content/registry'
import { ALL_LESSONS as MATH_LESSONS } from '../src/content/curriculum'

describe('science track registry (issue: science not visible)', () => {
  it('exports 6 full units in Cambridge order', () => {
    expect(SCIENCE_UNITS).toHaveLength(6)
    expect(SCIENCE_UNITS.map((u) => u.order)).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('indexes every science lesson in SCIENCE_ALL_LESSONS with its unit', () => {
    const ids = SCIENCE_UNITS.flatMap((u) => u.lessons.map((l) => l.id))
    expect(ids.length).toBeGreaterThanOrEqual(30)
    expect(new Set(ids).size).toBe(ids.length)
    for (const u of SCIENCE_UNITS) {
      for (const l of u.lessons) {
        const entry = SCIENCE_ALL_LESSONS[l.id]
        expect(entry).toBeDefined()
        expect(entry.unit).toBe(u)
        expect(entry.lesson).toBe(l)
      }
    }
    expect(Object.keys(SCIENCE_ALL_LESSONS)).toHaveLength(ids.length)
  })

  it('is wired into the registry so PathScreen/TopBar can route to it', () => {
    expect(CURRICULA.science.units).toBe(SCIENCE_UNITS)
    expect(CURRICULA.science.allLessons).toBe(SCIENCE_ALL_LESSONS)
    const c = getCurriculum('science')
    expect(c.units).toHaveLength(6)
    expect(Object.keys(c.allLessons).length).toBeGreaterThanOrEqual(30)
  })

  it('uses lesson ids that never collide with the maths track', () => {
    const mathIds = new Set(Object.keys(MATH_LESSONS))
    for (const id of Object.keys(SCIENCE_ALL_LESSONS)) {
      expect(mathIds.has(id)).toBe(false)
    }
  })

  it('every unit ends with its boss lesson', () => {
    for (const u of SCIENCE_UNITS) {
      expect(u.bossLessonIds).toEqual([`${u.id}boss`])
      expect(u.lessons.at(-1)?.id).toBe(`${u.id}boss`)
    }
  })

  it('every non-boss lesson carries Cambridge Stage 2 objective codes', () => {
    for (const u of SCIENCE_UNITS) {
      for (const l of u.lessons) {
        if (l.id.endsWith('boss')) continue
        expect(l.objectiveCodes.length).toBeGreaterThan(0)
        for (const code of l.objectiveCodes) {
          expect(code).toMatch(/^2(TWS|TW|Bp|Bs|Be|Cm|Cp|Cc|Pf|Ps|Pe|ES)/)
        }
      }
    }
  })
})

describe('science lessons generate varied on-syllabus questions', () => {
  for (const [id, { lesson }] of Object.entries(SCIENCE_ALL_LESSONS)) {
    it(`${id} generates 10 valid questions`, () => {
      const qs = lesson.generate(10, 1)
      expect(qs).toHaveLength(10)
      for (const q of qs) {
        expect(q.kind).toBeTruthy()
        expect(q.prompt.length).toBeGreaterThan(0)
      }
    })

    it(`${id} is deterministic per seed but varies across seeds`, () => {
      const a = lesson.generate(10, 7)
      const b = lesson.generate(10, 7)
      expect(a).toEqual(b)
      const variants = new Set(
        Array.from({ length: 6 }, (_, s) =>
          JSON.stringify(lesson.generate(10, s + 100)),
        ),
      )
      expect(variants.size).toBeGreaterThan(2)
    })
  }
})
