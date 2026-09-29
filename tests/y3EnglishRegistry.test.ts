import { describe, expect, it } from 'vitest'
import { CURRICULA } from '../src/content/registry'
import { YEAR_SYLLABUS, YEAR_TOLERANCE } from '../src/content/syllabus'
import { ENGLISH_Y3_SYLLABUS, ENGLISH_Y3_TOLERANCE } from '../src/content/syllabus/y3/english'
import { buildMatcher } from '../src/content/syllabus/match'
import { ENGLISH_Y3_UNITS, ENGLISH_Y3_ALL_LESSONS } from '../src/content/years/y3/english'

/** PLAN 169d — structural guard for the Year-3 english rollout: unit/lesson
 *  counts, the y3e id namespace, boss coverage per unit, objective-code
 *  shape, no lesson-id collision with any other year or subject (lesson
 *  progress is keyed by lesson id), and the year-3 english syllabus
 *  override wiring. */
describe('PLAN 169d — Year-3 english registry', () => {
  const y3e = CURRICULA[3].english!

  it('Y3 english has 10 units and 50 lessons (40 lessons + 10 bosses)', () => {
    expect(y3e.units).toHaveLength(10)
    expect(y3e.units.map((u) => u.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    const ids = Object.keys(y3e.allLessons)
    expect(ids).toHaveLength(50)
    const bosses = ids.filter((id) => id.endsWith('boss'))
    expect(bosses).toHaveLength(10)
    expect(ids.filter((id) => /l\d+$/.test(id))).toHaveLength(40)
  })

  it('every lesson id uses the y3e namespace and is listed exactly once', () => {
    const seen = new Set<string>()
    for (const u of y3e.units) {
      for (const l of u.lessons) {
        expect(l.id).toMatch(/^y3e\d+(l\d+|boss)$/)
        expect(seen.has(l.id), `duplicate lesson id ${l.id}`).toBe(false)
        seen.add(l.id)
        expect(l.objectiveCodes.length).toBeGreaterThan(0)
        for (const code of l.objectiveCodes) expect(code).toMatch(/^3[A-Za-z]+\.\d{2}$/)
        expect(l.generate(10, 7)).toHaveLength(10)
      }
    }
    expect(seen.size).toBe(50)
    expect([...seen].sort()).toEqual(Object.keys(y3e.allLessons).sort())
  })

  it('every Y3 english unit ends with exactly one boss lesson it actually contains', () => {
    for (const u of y3e.units) {
      expect(u.bossLessonIds, `${u.id} bossLessonIds`).toHaveLength(1)
      const bossId = u.bossLessonIds[0]
      expect(bossId).toMatch(/boss$/)
      expect(u.lessons.some((l) => l.id === bossId), `${u.id} contains ${bossId}`).toBe(true)
      expect(y3e.allLessons[bossId]?.unit.id).toBe(u.id)
      expect(u.lessons.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('no cross-year lesson id collision (Y3 english vs every other curriculum)', () => {
    const ids = new Set(Object.keys(y3e.allLessons))
    let compared = 0
    for (const [yearStr, curr] of Object.entries(CURRICULA)) {
      for (const [subject, cur] of Object.entries(curr)) {
        if (Number(yearStr) === 3 && subject === 'english') continue
        for (const id of Object.keys(cur.allLessons)) {
          compared++
          expect(ids.has(id), `y3eng vs y${yearStr}/${subject} id ${id}`).toBe(false)
        }
      }
    }
    expect(compared).toBeGreaterThan(100)
  })

  it('Y3 english matches against its own syllabus override', () => {
    expect(YEAR_SYLLABUS[3]?.english).toBe(ENGLISH_Y3_SYLLABUS)
    expect(YEAR_TOLERANCE[3]?.english).toBe(ENGLISH_Y3_TOLERANCE)
    const y3 = buildMatcher('english', 3)
    const y2 = buildMatcher('english', 2)
    expect(y3.year).toBe(3)
    expect(y2.year).toBe(2)
    expect(ENGLISH_Y3_SYLLABUS.length).toBeGreaterThan(1000)
    expect(ENGLISH_Y3_TOLERANCE.length).toBeGreaterThan(0)
    // The Year-3 extraction is its own list, not the Year-2 one.
    expect(y3.syllabusSize).not.toBe(y2.syllabusSize)
    // DfE years-3-and-4 words are accepted by the year-3 matcher.
    expect(y3.check('library')).toBe('ok')
    expect(y3.check('although')).toBe('ok')
    expect(y3.check('disappear')).toBe('ok')
    expect(y3.check('seperate')).toBe('ok') // tolerance: the drill's wrong pick
    expect(y3.check('sonic')).toBe('ok') // mascot, always tolerated
    // A word outside the Y3/Y1/Y2 extraction stays hard (guard: the year-3
    // matcher really is reading its own lists, not the whole dictionary).
    expect(y3.check('photosynthesis')).toBe('hard')
    // The registry serves the same objects the module exports.
    expect(ENGLISH_Y3_ALL_LESSONS).toBe(y3e.allLessons)
    expect(ENGLISH_Y3_UNITS).toBe(y3e.units)
  })
})
