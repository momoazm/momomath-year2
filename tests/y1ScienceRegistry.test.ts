import { describe, expect, it } from 'vitest'
import { CURRICULA } from '../src/content/registry'
import { YEAR_SYLLABUS, YEAR_TOLERANCE } from '../src/content/syllabus'
import { SCIENCE_Y1_SYLLABUS, SCIENCE_Y1_TOLERANCE } from '../src/content/syllabus/y1/science'
import { buildMatcher } from '../src/content/syllabus/match'
import { SCIENCE_Y1_UNITS, SCIENCE_Y1_ALL_LESSONS } from '../src/content/years/y1/science'

/** PLAN 169b — structural guard for the Year-1 science rollout: unit/lesson
 *  counts, the y1s id namespace, boss coverage per unit, no lesson-id
 *  collision with any other year or subject (lesson progress is keyed by
 *  lesson id), the year-1 science syllabus override wiring, and the
 *  registry actually serving the Year-1 science curriculum. */
describe('PLAN 169b — Year-1 science registry', () => {
  const y1 = CURRICULA[1].science!

  it('has 8 units and 46 lessons (38 lessons + 8 bosses)', () => {
    expect(y1.units).toHaveLength(8)
    expect(y1.units.map((u) => u.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    const ids = Object.keys(y1.allLessons)
    expect(ids).toHaveLength(46)
    const bosses = ids.filter((id) => id.endsWith('boss'))
    expect(bosses).toHaveLength(8)
    expect(ids.filter((id) => /l\d+$/.test(id))).toHaveLength(38)
  })

  it('every lesson id uses the y1s namespace and is listed exactly once', () => {
    const seen = new Set<string>()
    for (const u of y1.units) {
      for (const l of u.lessons) {
        expect(l.id).toMatch(/^y1s\d+(l\d+|boss)$/)
        expect(seen.has(l.id), `duplicate lesson id ${l.id}`).toBe(false)
        seen.add(l.id)
        expect(l.objectiveCodes.length).toBeGreaterThan(0)
        expect(l.generate(10, 7)).toHaveLength(10)
      }
    }
    expect(seen.size).toBe(46)
    expect([...seen].sort()).toEqual(Object.keys(y1.allLessons).sort())
  })

  it('every science unit ends with exactly one boss lesson it actually contains', () => {
    for (const u of y1.units) {
      expect(u.bossLessonIds, `${u.id} bossLessonIds`).toHaveLength(1)
      const bossId = u.bossLessonIds[0]
      expect(bossId).toMatch(/boss$/)
      expect(u.lessons.some((l) => l.id === bossId), `${u.id} contains ${bossId}`).toBe(true)
      expect(y1.allLessons[bossId]?.unit.id).toBe(u.id)
      expect(u.lessons.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('no cross-year lesson id collision (Y1 science vs every other curriculum)', () => {
    const y1Ids = new Set(Object.keys(y1.allLessons))
    let compared = 0
    for (const [yearStr, curr] of Object.entries(CURRICULA)) {
      if (Number(yearStr) === 1) continue
      for (const [subject, cur] of Object.entries(curr)) {
        for (const id of Object.keys(cur.allLessons)) {
          compared++
          expect(y1Ids.has(id), `y1sci vs y${yearStr}/${subject} id ${id}`).toBe(false)
        }
      }
    }
    expect(compared).toBeGreaterThan(100)
  })

  it('Y1 science matches against its own syllabus override', () => {
    expect(YEAR_SYLLABUS[1]?.science).toBe(SCIENCE_Y1_SYLLABUS)
    expect(YEAR_TOLERANCE[1]?.science).toBe(SCIENCE_Y1_TOLERANCE)
    const y1s = buildMatcher('science', 1)
    const y2s = buildMatcher('science', 2)
    expect(y1s.year).toBe(1)
    expect(y2s.year).toBe(2)
    expect(SCIENCE_Y1_SYLLABUS.length).toBeGreaterThan(300)
    expect(SCIENCE_Y1_TOLERANCE.length).toBeGreaterThan(0)
    // The Year-1 extraction is its own list, not the Year-2 one.
    expect(y1s.syllabusSize).not.toBe(y2s.syllabusSize)
    // DfE Year-1 statutory words are accepted by the year-1 matcher.
    expect(y1s.check('dandelion')).toBe('ok')
    expect(y1s.check('carnivore')).toBe('ok')
    expect(y1s.check('deciduous')).toBe('ok')
    expect(y1s.check('sonic')).toBe('ok')
    // The registry serves the same objects the module exports.
    expect(SCIENCE_Y1_ALL_LESSONS).toBe(y1.allLessons)
    expect(SCIENCE_Y1_UNITS).toBe(y1.units)
  })
})
