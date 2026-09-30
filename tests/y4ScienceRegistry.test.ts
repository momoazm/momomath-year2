import { describe, expect, it } from 'vitest'
import { CURRICULA } from '../src/content/registry'
import { YEAR_SYLLABUS, YEAR_TOLERANCE } from '../src/content/syllabus'
import { SCIENCE_Y4_SYLLABUS, SCIENCE_Y4_TOLERANCE } from '../src/content/syllabus/y4/science'
import { buildMatcher } from '../src/content/syllabus/match'
import { SCIENCE_Y4_UNITS, SCIENCE_Y4_ALL_LESSONS } from '../src/content/years/y4/science'

/** PLAN 169h — structural guard for the Year-4 science rollout: unit/lesson
 *  counts, the y4s id namespace, objective-code format, boss coverage per
 *  unit, no lesson-id collision with any other year or subject (lesson
 *  progress is keyed by lesson id), the year-4 science syllabus override
 *  wiring, and the registry actually serving the Year-4 science curriculum. */
describe('PLAN 169h — Year-4 science registry', () => {
  const y4 = CURRICULA[4].science!

  it('Y4 science has 8 units and 41 lessons (33 lessons + 8 bosses)', () => {
    expect(y4.units).toHaveLength(8)
    expect(y4.units.map((u) => u.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    const ids = Object.keys(y4.allLessons)
    expect(ids).toHaveLength(41)
    const bosses = ids.filter((id) => id.endsWith('boss'))
    expect(bosses).toHaveLength(8)
    expect(ids.filter((id) => /l\d+$/.test(id))).toHaveLength(33)
  })

  it('every Y4 science lesson id uses the y4s namespace and is listed exactly once', () => {
    const seen = new Set<string>()
    for (const u of y4.units) {
      for (const l of u.lessons) {
        expect(l.id).toMatch(/^y4s\d+(l\d+|boss)$/)
        expect(seen.has(l.id), `duplicate lesson id ${l.id}`).toBe(false)
        seen.add(l.id)
        expect(l.objectiveCodes.length).toBeGreaterThan(0)
        for (const code of l.objectiveCodes) expect(code).toMatch(/^4TW(Sc|Sp)\.\d{2}$/)
        expect(l.generate(10, 7)).toHaveLength(10)
      }
    }
    expect(seen.size).toBe(41)
    expect([...seen].sort()).toEqual(Object.keys(y4.allLessons).sort())
  })

  it('every Y4 science unit ends with exactly one boss lesson it actually contains', () => {
    for (const u of y4.units) {
      expect(u.bossLessonIds, `${u.id} bossLessonIds`).toHaveLength(1)
      const bossId = u.bossLessonIds[0]
      expect(bossId).toMatch(/boss$/)
      expect(u.lessons.some((l) => l.id === bossId), `${u.id} contains ${bossId}`).toBe(true)
      expect(y4.allLessons[bossId]?.unit.id).toBe(u.id)
      expect(u.lessons.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('no cross-year lesson id collision (Y4 science vs every other curriculum)', () => {
    const y4Ids = new Set(Object.keys(y4.allLessons))
    let compared = 0
    for (const [yearStr, curr] of Object.entries(CURRICULA)) {
      for (const [subject, cur] of Object.entries(curr)) {
        if (Number(yearStr) === 4 && subject === 'science') continue
        for (const id of Object.keys(cur.allLessons)) {
          compared++
          expect(y4Ids.has(id), `y4sci vs y${yearStr}/${subject} id ${id}`).toBe(false)
        }
      }
    }
    expect(compared).toBeGreaterThan(100)
  })

  it('Y4 science matches against its own syllabus override', () => {
    expect(YEAR_SYLLABUS[4]?.science).toBe(SCIENCE_Y4_SYLLABUS)
    expect(YEAR_TOLERANCE[4]?.science).toBe(SCIENCE_Y4_TOLERANCE)
    const y4s = buildMatcher('science', 4)
    const y2s = buildMatcher('science', 2)
    expect(y4s.year).toBe(4)
    expect(y2s.year).toBe(2)
    expect(SCIENCE_Y4_SYLLABUS.length).toBeGreaterThan(300)
    expect(SCIENCE_Y4_TOLERANCE.length).toBeGreaterThan(0)
    // The Year-4 extraction is its own list, not the Year-2 one.
    expect(y4s.syllabusSize).not.toBe(y2s.syllabusSize)
    // DfE Year-4 statutory words are accepted by the year-4 matcher.
    expect(y4s.check('oesophagus')).toBe('ok')
    expect(y4s.check('classification')).toBe('ok')
    expect(y4s.check('celsius')).toBe('ok')
    expect(y4s.check('conductors')).toBe('ok')
    expect(y4s.check('premolars')).toBe('ok')
    expect(y4s.check('vibration')).toBe('ok')
    expect(y4s.check('sonic')).toBe('ok')
    // Photosynthesis is Year-5 vocabulary, absent from every science list.
    expect(y4s.check('photosynthesis')).toBe('hard')
    // The registry serves the same objects the module exports.
    expect(SCIENCE_Y4_ALL_LESSONS).toBe(y4.allLessons)
    expect(SCIENCE_Y4_UNITS).toBe(y4.units)
  })
})
