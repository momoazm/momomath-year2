import { describe, expect, it } from 'vitest'
import { CURRICULA } from '../src/content/registry'
import { YEAR_SYLLABUS, YEAR_TOLERANCE } from '../src/content/syllabus'
import { SCIENCE_Y3_SYLLABUS, SCIENCE_Y3_TOLERANCE } from '../src/content/syllabus/y3/science'
import { buildMatcher } from '../src/content/syllabus/match'
import { SCIENCE_Y3_UNITS, SCIENCE_Y3_ALL_LESSONS } from '../src/content/years/y3/science'

/** PLAN 169e — structural guard for the Year-3 science rollout: unit/lesson
 *  counts, the y3s id namespace, objective-code format, boss coverage per
 *  unit, no lesson-id collision with any other year or subject (lesson
 *  progress is keyed by lesson id), the year-3 science syllabus override
 *  wiring, and the registry actually serving the Year-3 science curriculum. */
describe('PLAN 169e — Year-3 science registry', () => {
  const y3 = CURRICULA[3].science!

  it('Y3 science has 8 units and 41 lessons (33 lessons + 8 bosses)', () => {
    expect(y3.units).toHaveLength(8)
    expect(y3.units.map((u) => u.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    const ids = Object.keys(y3.allLessons)
    expect(ids).toHaveLength(41)
    const bosses = ids.filter((id) => id.endsWith('boss'))
    expect(bosses).toHaveLength(8)
    expect(ids.filter((id) => /l\d+$/.test(id))).toHaveLength(33)
  })

  it('every Y3 science lesson id uses the y3s namespace and is listed exactly once', () => {
    const seen = new Set<string>()
    for (const u of y3.units) {
      for (const l of u.lessons) {
        expect(l.id).toMatch(/^y3s\d+(l\d+|boss)$/)
        expect(seen.has(l.id), `duplicate lesson id ${l.id}`).toBe(false)
        seen.add(l.id)
        expect(l.objectiveCodes.length).toBeGreaterThan(0)
        for (const code of l.objectiveCodes) expect(code).toMatch(/^3TW(Sc|Sp)\.\d{2}$/)
        expect(l.generate(10, 7)).toHaveLength(10)
      }
    }
    expect(seen.size).toBe(41)
    expect([...seen].sort()).toEqual(Object.keys(y3.allLessons).sort())
  })

  it('every Y3 science unit ends with exactly one boss lesson it actually contains', () => {
    for (const u of y3.units) {
      expect(u.bossLessonIds, `${u.id} bossLessonIds`).toHaveLength(1)
      const bossId = u.bossLessonIds[0]
      expect(bossId).toMatch(/boss$/)
      expect(u.lessons.some((l) => l.id === bossId), `${u.id} contains ${bossId}`).toBe(true)
      expect(y3.allLessons[bossId]?.unit.id).toBe(u.id)
      expect(u.lessons.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('no cross-year lesson id collision (Y3 science vs every other curriculum)', () => {
    const y3Ids = new Set(Object.keys(y3.allLessons))
    let compared = 0
    for (const [yearStr, curr] of Object.entries(CURRICULA)) {
      for (const [subject, cur] of Object.entries(curr)) {
        if (Number(yearStr) === 3 && subject === 'science') continue
        for (const id of Object.keys(cur.allLessons)) {
          compared++
          expect(y3Ids.has(id), `y3sci vs y${yearStr}/${subject} id ${id}`).toBe(false)
        }
      }
    }
    expect(compared).toBeGreaterThan(100)
  })

  it('Y3 science matches against its own syllabus override', () => {
    expect(YEAR_SYLLABUS[3]?.science).toBe(SCIENCE_Y3_SYLLABUS)
    expect(YEAR_TOLERANCE[3]?.science).toBe(SCIENCE_Y3_TOLERANCE)
    const y3s = buildMatcher('science', 3)
    const y2s = buildMatcher('science', 2)
    expect(y3s.year).toBe(3)
    expect(y2s.year).toBe(2)
    expect(SCIENCE_Y3_SYLLABUS.length).toBeGreaterThan(300)
    expect(SCIENCE_Y3_TOLERANCE.length).toBeGreaterThan(0)
    // The Year-3 extraction is its own list, not the Year-2 one.
    expect(y3s.syllabusSize).not.toBe(y2s.syllabusSize)
    // DfE Year-3 statutory words are accepted by the year-3 matcher.
    expect(y3s.check('pollination')).toBe('ok')
    expect(y3s.check('horseshoe')).toBe('ok')
    expect(y3s.check('sedimentary')).toBe('ok')
    expect(y3s.check('opaque')).toBe('ok')
    expect(y3s.check('dandelion')).toBe('ok')
    expect(y3s.check('sonic')).toBe('ok')
    // Photosynthesis is Year-5 vocabulary, absent from every science list.
    expect(y3s.check('photosynthesis')).toBe('hard')
    // The registry serves the same objects the module exports.
    expect(SCIENCE_Y3_ALL_LESSONS).toBe(y3.allLessons)
    expect(SCIENCE_Y3_UNITS).toBe(y3.units)
  })
})
