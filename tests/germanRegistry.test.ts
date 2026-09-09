import { describe, expect, it } from 'vitest'
import { ALL_LESSONS as MATH_ALL } from '../src/content/curriculum'
import { getCurriculum } from '../src/content/registry'
import { GERMAN_UNITS } from '../src/content/german'

describe('german optional extra registry', () => {
  it('exposes ten units in roadmap order without touching math/english', () => {
    const german = getCurriculum('german')
    expect(german.units.length).toBe(10)
    expect(german.units.map((u) => u.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(german.units).toBe(GERMAN_UNITS)
  })

  it('keeps german lesson ids disjoint from math and english', () => {
    const mathIds = new Set(Object.keys(MATH_ALL))
    const englishIds = new Set(Object.keys(getCurriculum('english').allLessons))
    for (const id of Object.keys(getCurriculum('german').allLessons)) {
      expect(id.startsWith('g'), `german id should start with g: ${id}`).toBe(true)
      expect(mathIds.has(id), `duplicate math id ${id}`).toBe(false)
      expect(englishIds.has(id), `duplicate english id ${id}`).toBe(false)
    }
  })

  it('marks every german unit with a consistent trailing boss lesson', () => {
    for (const u of getCurriculum('german').units) {
      expect(u.bossLessonIds).toEqual([`${u.id}boss`])
      expect(u.lessons.at(-1)?.id).toBe(`${u.id}boss`)
    }
  })

  it('covers every MFL strand code family used by the extra', () => {
    const codes = getCurriculum('german')
      .units.flatMap((u) => u.lessons)
      .flatMap((l) => l.objectiveCodes)
    for (const fam of ['4Lm', '4Rm', '4Sc', '4Wc', '4Vl', '4Gr', '4Cu']) {
      expect(codes.some((c) => c.startsWith(fam)), `missing ${fam}`).toBe(true)
    }
  })
})
