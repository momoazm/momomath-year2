import { describe, expect, it } from 'vitest'
import { CURRICULA } from '../src/content/registry'
import { YEAR_SYLLABUS, YEAR_TOLERANCE } from '../src/content/syllabus'
import { MATH_Y3_SYLLABUS, MATH_Y3_TOLERANCE } from '../src/content/syllabus/y3/math'
import { buildMatcher } from '../src/content/syllabus/match'

/** PLAN 169c — structural guard for the Year-3 maths rollout: unit/lesson
 *  counts, the y3 id namespace, boss coverage per unit, no lesson-id
 *  collision with any other year or subject (lesson progress is keyed by
 *  lesson id), objective-code shape, and the year-3 syllabus override
 *  wiring. */
describe('PLAN 169c — Year-3 maths registry', () => {
  const y3 = CURRICULA[3].math

  it('Y3 maths has 12 units and 60 lessons (48 lessons + 12 bosses)', () => {
    expect(y3.units).toHaveLength(12)
    expect(y3.units.map((u) => u.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    const ids = Object.keys(y3.allLessons)
    expect(ids).toHaveLength(60)
    const bosses = ids.filter((id) => id.endsWith('boss'))
    expect(bosses).toHaveLength(12)
    expect(ids.filter((id) => /l\d+$/.test(id))).toHaveLength(48)
  })

  it('every Y3 lesson id uses the y3 namespace and is listed exactly once', () => {
    const seen = new Set<string>()
    for (const u of y3.units) {
      for (const l of u.lessons) {
        expect(l.id).toMatch(/^y3u\d+(l\d+|boss)$/)
        expect(seen.has(l.id), `duplicate lesson id ${l.id}`).toBe(false)
        seen.add(l.id)
        expect(l.objectiveCodes.length).toBeGreaterThan(0)
        for (const code of l.objectiveCodes) expect(code).toMatch(/^3[A-Z][a-z]\.\d{2}$/)
        expect(l.generate(10, 7)).toHaveLength(10)
      }
    }
    expect(seen.size).toBe(60)
    expect([...seen].sort()).toEqual(Object.keys(y3.allLessons).sort())
  })

  it('every Y3 unit ends with exactly one boss lesson it actually contains', () => {
    for (const u of y3.units) {
      expect(u.bossLessonIds, `${u.id} bossLessonIds`).toHaveLength(1)
      const bossId = u.bossLessonIds[0]
      expect(bossId).toMatch(/boss$/)
      expect(u.lessons.some((l) => l.id === bossId), `${u.id} contains ${bossId}`).toBe(true)
      expect(y3.allLessons[bossId]?.unit.id).toBe(u.id)
      expect(u.lessons.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('no cross-year lesson id collision (Y3 maths vs every other curriculum)', () => {
    const y3Ids = new Set(Object.keys(y3.allLessons))
    let compared = 0
    for (const [yearStr, curr] of Object.entries(CURRICULA)) {
      if (Number(yearStr) === 3) continue
      for (const [subject, cur] of Object.entries(curr)) {
        for (const id of Object.keys(cur.allLessons)) {
          compared++
          expect(y3Ids.has(id), `y3 vs y${yearStr}/${subject} id ${id}`).toBe(false)
        }
      }
    }
    expect(compared).toBeGreaterThan(100)
  })

  it('Y3 maths matches against its own syllabus override', () => {
    expect(YEAR_SYLLABUS[3]?.math).toBe(MATH_Y3_SYLLABUS)
    expect(YEAR_TOLERANCE[3]?.math).toBe(MATH_Y3_TOLERANCE)
    const y3m = buildMatcher('math', 3)
    const y2m = buildMatcher('math', 2)
    expect(y3m.year).toBe(3)
    expect(y2m.year).toBe(2)
    expect(MATH_Y3_SYLLABUS.length).toBeGreaterThan(600)
    expect(MATH_Y3_TOLERANCE.length).toBeGreaterThan(0)
    // The Year-3 extraction is its own list, not the Year-2 one.
    expect(y3m.syllabusSize).not.toBe(y2m.syllabusSize)
    // DfE Year-3 words and tolerance words are accepted by year-3 matching.
    expect(y3m.check('perimeter')).toBe('ok')
    expect(y3m.check('numeral')).toBe('ok')
    expect(y3m.check('hundredths')).toBe('ok')
    expect(y3m.check('sonic')).toBe('ok')
    // The shared Year-4 curriculum must not have picked up Y3 maths.
    expect(CURRICULA[4].math.units).not.toBe(y3.units)
  })
})
