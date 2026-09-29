import { describe, expect, it } from 'vitest'
import { CURRICULA } from '../src/content/registry'
import { YEAR_SYLLABUS, YEAR_TOLERANCE } from '../src/content/syllabus'
import { MATH_Y1_SYLLABUS, MATH_Y1_TOLERANCE } from '../src/content/syllabus/y1/math'
import { buildMatcher } from '../src/content/syllabus/match'

/** PLAN 168 — structural guard for the Year-1 maths pilot (PLAN 167): unit/
 *  lesson counts, the y1 id namespace, boss coverage per unit, no lesson-id
 *  collision with any other year or subject (lesson progress is keyed by
 *  lesson id), and the year-1 syllabus override wiring. */
describe('PLAN 168 — Year-1 maths registry', () => {
  const y1 = CURRICULA[1].math

  it('has 11 units and 59 lessons (48 lessons + 11 bosses)', () => {
    expect(y1.units).toHaveLength(11)
    expect(y1.units.map((u) => u.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    const ids = Object.keys(y1.allLessons)
    expect(ids).toHaveLength(59)
    const bosses = ids.filter((id) => id.endsWith('boss'))
    expect(bosses).toHaveLength(11)
    expect(ids.filter((id) => /l\d+$/.test(id))).toHaveLength(48)
  })

  it('every lesson id uses the y1 namespace and is listed exactly once', () => {
    const seen = new Set<string>()
    for (const u of y1.units) {
      for (const l of u.lessons) {
        expect(l.id).toMatch(/^y1u\d+(l\d+|boss)$/)
        expect(seen.has(l.id), `duplicate lesson id ${l.id}`).toBe(false)
        seen.add(l.id)
        expect(l.objectiveCodes.length).toBeGreaterThan(0)
        expect(l.generate(10, 7)).toHaveLength(10)
      }
    }
    expect(seen.size).toBe(59)
    expect([...seen].sort()).toEqual(Object.keys(y1.allLessons).sort())
  })

  it('every unit ends with exactly one boss lesson it actually contains', () => {
    for (const u of y1.units) {
      expect(u.bossLessonIds, `${u.id} bossLessonIds`).toHaveLength(1)
      const bossId = u.bossLessonIds[0]
      expect(bossId).toMatch(/boss$/)
      expect(u.lessons.some((l) => l.id === bossId), `${u.id} contains ${bossId}`).toBe(true)
      expect(y1.allLessons[bossId]?.unit.id).toBe(u.id)
      expect(u.lessons.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('no cross-year lesson id collision (Y1 maths vs every other curriculum)', () => {
    const y1Ids = new Set(Object.keys(y1.allLessons))
    let compared = 0
    for (const [yearStr, curr] of Object.entries(CURRICULA)) {
      if (Number(yearStr) === 1) continue
      for (const [subject, cur] of Object.entries(curr)) {
        for (const id of Object.keys(cur.allLessons)) {
          compared++
          expect(y1Ids.has(id), `y1 vs y${yearStr}/${subject} id ${id}`).toBe(false)
        }
      }
    }
    expect(compared).toBeGreaterThan(100)
  })

  it('Y1 maths matches against its own syllabus override', () => {
    expect(YEAR_SYLLABUS[1]?.math).toBe(MATH_Y1_SYLLABUS)
    expect(YEAR_TOLERANCE[1]?.math).toBe(MATH_Y1_TOLERANCE)
    const y1m = buildMatcher('math', 1)
    const y2m = buildMatcher('math', 2)
    expect(y1m.year).toBe(1)
    expect(y2m.year).toBe(2)
    expect(MATH_Y1_SYLLABUS.length).toBeGreaterThan(40)
    expect(MATH_Y1_TOLERANCE.length).toBeGreaterThan(0)
    // The Year-1 extraction is its own list, not the Year-2 one.
    expect(y1m.syllabusSize).not.toBe(y2m.syllabusSize)
    // A Year-1 checklist word is accepted by the year-1 matcher.
    expect(y1m.check('nineteen')).toBe('ok')
    expect(y1m.check('sonic')).toBe('ok')
  })
})
