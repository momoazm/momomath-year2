import { describe, expect, it } from 'vitest'
import { CURRICULA } from '../src/content/registry'
import { YEAR_SYLLABUS, YEAR_TOLERANCE } from '../src/content/syllabus'
import { ENGLISH_Y3_SYLLABUS } from '../src/content/syllabus/y3/english'
import { ENGLISH_Y4_SYLLABUS, ENGLISH_Y4_TOLERANCE } from '../src/content/syllabus/y4/english'
import { buildMatcher } from '../src/content/syllabus/match'
import { ENGLISH_Y4_UNITS, ENGLISH_Y4_ALL_LESSONS } from '../src/content/years/y4/english'

/** PLAN 169g — structural guard for the Year-4 english rollout: unit/lesson
 *  counts, the y4e id namespace, boss coverage per unit, objective-code
 *  shape, no lesson-id collision with any other year or subject (lesson
 *  progress is keyed by lesson id), and the year-4 english syllabus
 *  override wiring (union of the shared years-3-and-4 statute + Y4 extras). */
describe('PLAN 169g — Year-4 english registry', () => {
  const y4e = CURRICULA[4].english!

  it('Y4 english has 10 units and 50 lessons (40 lessons + 10 bosses)', () => {
    expect(y4e.units).toHaveLength(10)
    expect(y4e.units.map((u) => u.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    const ids = Object.keys(y4e.allLessons)
    expect(ids).toHaveLength(50)
    const bosses = ids.filter((id) => id.endsWith('boss'))
    expect(bosses).toHaveLength(10)
    expect(ids.filter((id) => /l\d+$/.test(id))).toHaveLength(40)
  })

  it('every lesson id uses the y4e namespace and is listed exactly once', () => {
    const seen = new Set<string>()
    for (const u of y4e.units) {
      for (const l of u.lessons) {
        expect(l.id).toMatch(/^y4e\d+(l\d+|boss)$/)
        expect(seen.has(l.id), `duplicate lesson id ${l.id}`).toBe(false)
        seen.add(l.id)
        expect(l.objectiveCodes.length).toBeGreaterThan(0)
        for (const code of l.objectiveCodes) expect(code).toMatch(/^4[A-Za-z]+\.\d{2}$/)
        expect(l.generate(10, 7)).toHaveLength(10)
      }
    }
    expect(seen.size).toBe(50)
    expect([...seen].sort()).toEqual(Object.keys(y4e.allLessons).sort())
  })

  it('every Y4 english unit ends with exactly one boss lesson it actually contains', () => {
    for (const u of y4e.units) {
      expect(u.bossLessonIds, `${u.id} bossLessonIds`).toHaveLength(1)
      const bossId = u.bossLessonIds[0]
      expect(bossId).toMatch(/boss$/)
      expect(u.lessons.some((l) => l.id === bossId), `${u.id} contains ${bossId}`).toBe(true)
      expect(y4e.allLessons[bossId]?.unit.id).toBe(u.id)
      expect(u.lessons.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('no cross-year lesson id collision (Y4 english vs every other curriculum)', () => {
    const ids = new Set(Object.keys(y4e.allLessons))
    let compared = 0
    for (const [yearStr, curr] of Object.entries(CURRICULA)) {
      for (const [subject, cur] of Object.entries(curr)) {
        if (Number(yearStr) === 4 && subject === 'english') continue
        for (const id of Object.keys(cur.allLessons)) {
          compared++
          expect(ids.has(id), `y4eng vs y${yearStr}/${subject} id ${id}`).toBe(false)
        }
      }
    }
    expect(compared).toBeGreaterThan(100)
  })

  it('Y4 english matches against its own syllabus override', () => {
    expect(YEAR_SYLLABUS[4]?.english).toBe(ENGLISH_Y4_SYLLABUS)
    expect(YEAR_TOLERANCE[4]?.english).toBe(ENGLISH_Y4_TOLERANCE)
    const y4 = buildMatcher('english', 4)
    const y2 = buildMatcher('english', 2)
    expect(y4.year).toBe(4)
    expect(y2.year).toBe(2)
    expect(ENGLISH_Y4_SYLLABUS.length).toBeGreaterThan(1000)
    // The Y4 extraction is a strict superset of the shared-statute Y3 one.
    expect(ENGLISH_Y4_SYLLABUS.length).toBeGreaterThan(ENGLISH_Y3_SYLLABUS.length)
    expect(ENGLISH_Y4_TOLERANCE.length).toBeGreaterThan(0)
    expect(y4.syllabusSize).not.toBe(y2.syllabusSize)
    // Shared years-3-and-4 statute words are still accepted.
    expect(y4.check('library')).toBe('ok')
    expect(y4.check('although')).toBe('ok')
    expect(y4.check('disappear')).toBe('ok')
    // Y4-lesson additions land in the year-4 list.
    expect(y4.check('alphabet')).toBe('ok')
    expect(y4.check('entries')).toBe('ok')
    expect(y4.check('dictation')).toBe('ok')
    expect(y4.check('legend')).toBe('ok')
    // Tolerance: the shared near-misses plus a Y4 drill wrong pick.
    expect(y4.check('seperate')).toBe('ok')
    expect(y4.check('adress')).toBe('ok')
    expect(y4.check('sonic')).toBe('ok') // mascot, always tolerated
    // Science vocabulary stays out of the english extraction.
    expect(y4.check('photosynthesis')).toBe('hard')
    // The registry serves the same objects the module exports.
    expect(ENGLISH_Y4_ALL_LESSONS).toBe(y4e.allLessons)
    expect(ENGLISH_Y4_UNITS).toBe(y4e.units)
  })
})
