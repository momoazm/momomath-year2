import { describe, expect, it } from 'vitest'
import { CURRICULA } from '../src/content/registry'
import { YEAR_SYLLABUS, YEAR_TOLERANCE } from '../src/content/syllabus'
import { MATH_Y4_SYLLABUS, MATH_Y4_TOLERANCE } from '../src/content/syllabus/y4/math'
import { Y4_ALL_LESSONS, Y4_UNITS } from '../src/content/years/y4/math'
import { buildMatcher } from '../src/content/syllabus/match'

/** PLAN 169f — structural guard for the Year-4 maths rollout: unit/lesson
 *  counts, the y4 id namespace, boss coverage per unit, no lesson-id
 *  collision with any other year or subject (lesson progress is keyed by
 *  lesson id), objective-code shape, and the year-4 syllabus override
 *  wiring. */
describe('PLAN 169f — Year-4 maths registry', () => {
  const y4 = CURRICULA[4].math

  it('Y4 maths has 14 units and 71 lessons (57 lessons + 14 bosses)', () => {
    expect(y4.units).toHaveLength(14)
    expect(y4.units.map((u) => u.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])
    const ids = Object.keys(y4.allLessons)
    expect(ids).toHaveLength(71)
    const bosses = ids.filter((id) => id.endsWith('boss'))
    expect(bosses).toHaveLength(14)
    expect(ids.filter((id) => /l\d+$/.test(id))).toHaveLength(57)
  })

  it('every Y4 lesson id uses the y4 namespace and is listed exactly once', () => {
    const seen = new Set<string>()
    for (const u of y4.units) {
      for (const l of u.lessons) {
        expect(l.id).toMatch(/^y4u\d+(l\d+|boss)$/)
        expect(seen.has(l.id), `duplicate lesson id ${l.id}`).toBe(false)
        seen.add(l.id)
        expect(l.objectiveCodes.length).toBeGreaterThan(0)
        for (const code of l.objectiveCodes) expect(code).toMatch(/^4[A-Z][a-z]\.\d{2}$/)
        expect(l.generate(10, 7)).toHaveLength(10)
      }
    }
    expect(seen.size).toBe(71)
    expect([...seen].sort()).toEqual(Object.keys(y4.allLessons).sort())
  })

  it('every Y4 unit ends with exactly one boss lesson it actually contains', () => {
    for (const u of y4.units) {
      expect(u.bossLessonIds, `${u.id} bossLessonIds`).toHaveLength(1)
      const bossId = u.bossLessonIds[0]
      expect(bossId).toMatch(/boss$/)
      expect(u.lessons.some((l) => l.id === bossId), `${u.id} contains ${bossId}`).toBe(true)
      expect(y4.allLessons[bossId]?.unit.id).toBe(u.id)
      expect(u.lessons.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('no cross-year lesson id collision (Y4 maths vs every other curriculum)', () => {
    const y4Ids = new Set(Object.keys(y4.allLessons))
    let compared = 0
    for (const [yearStr, curr] of Object.entries(CURRICULA)) {
      if (Number(yearStr) === 4) continue
      for (const [subject, cur] of Object.entries(curr)) {
        for (const id of Object.keys(cur.allLessons)) {
          compared++
          expect(y4Ids.has(id), `y4 vs y${yearStr}/${subject} id ${id}`).toBe(false)
        }
      }
    }
    expect(compared).toBeGreaterThan(100)
  })

  it('Y4 maths matches against its own syllabus override', () => {
    expect(YEAR_SYLLABUS[4]?.math).toBe(MATH_Y4_SYLLABUS)
    expect(YEAR_TOLERANCE[4]?.math).toBe(MATH_Y4_TOLERANCE)
    const y4m = buildMatcher('math', 4)
    const y3m = buildMatcher('math', 3)
    expect(y4m.year).toBe(4)
    expect(y3m.year).toBe(3)
    expect(MATH_Y4_SYLLABUS.length).toBeGreaterThan(700)
    expect(MATH_Y4_TOLERANCE.length).toBeGreaterThan(0)
    // The Year-4 extraction is its own list, not the Year-3 one.
    expect(y4m.syllabusSize).not.toBe(y3m.syllabusSize)
    // DfE Year-4 words and tolerance words are accepted by year-4 matching.
    expect(y4m.check('scalene')).toBe('ok')
    expect(y4m.check('trapezium')).toBe('ok')
    expect(y4m.check('rectilinear')).toBe('ok')
    expect(y4m.check('discrete')).toBe('ok')
    expect(y4m.check('commutativity')).toBe('ok')
    expect(y4m.check('coordinate')).toBe('ok')
    expect(y4m.check('sonic')).toBe('ok')
    // The registry now carries the Year-4 maths objects themselves.
    expect(CURRICULA[4].math.units).toBe(Y4_UNITS)
    expect(CURRICULA[4].math.allLessons).toBe(Y4_ALL_LESSONS)
    expect(CURRICULA[4].math.units).not.toBe(CURRICULA[2].math.units)
    expect(CURRICULA[4].math.units).not.toBe(CURRICULA[3].math.units)
  })
})
