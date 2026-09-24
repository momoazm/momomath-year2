import { describe, expect, it } from 'vitest'
import { ALL_LESSONS as MATH_ALL } from '../src/content/curriculum'
import { getCurriculum } from '../src/content/registry'
import { ARABIC_UNITS } from '../src/content/arabic'

describe('arabic optional extra registry', () => {
  it('exposes ten units in roadmap order without touching math/english/science/german', () => {
    const arabic = getCurriculum('arabic')
    expect(arabic.units.length).toBe(10)
    expect(arabic.units.map((u) => u.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(arabic.units).toBe(ARABIC_UNITS)
  })

  it('keeps arabic lesson ids disjoint from every other subject', () => {
    const mathIds = new Set(Object.keys(MATH_ALL))
    const englishIds = new Set(Object.keys(getCurriculum('english').allLessons))
    const germanIds = new Set(Object.keys(getCurriculum('german').allLessons))
    const scienceIds = new Set(Object.keys(getCurriculum('science').allLessons))
    for (const id of Object.keys(getCurriculum('arabic').allLessons)) {
      expect(id.startsWith('a'), `arabic id should start with a: ${id}`).toBe(true)
      expect(mathIds.has(id), `duplicate math id ${id}`).toBe(false)
      expect(englishIds.has(id), `duplicate english id ${id}`).toBe(false)
      expect(germanIds.has(id), `duplicate german id ${id}`).toBe(false)
      expect(scienceIds.has(id), `duplicate science id ${id}`).toBe(false)
    }
  })

  it('marks every unit with a consistent trailing boss lesson', () => {
    for (const u of getCurriculum('arabic').units) {
      expect(u.bossLessonIds).toEqual([`${u.id}boss`])
      expect(u.lessons.at(-1)?.id).toBe(`${u.id}boss`)
    }
  })

  it('covers every EG-Ar strand code family used by the extra', () => {
    const codes = getCurriculum('arabic')
      .units.flatMap((u) => u.lessons)
      .flatMap((l) => l.objectiveCodes)
    for (const fam of ['EG-Ar-2R', 'EG-Ar-2W', 'EG-Ar-2G', 'EG-Ar-2E', 'EG-Ar-2L']) {
      expect(codes.some((c) => c.startsWith(fam)), `missing ${fam}`).toBe(true)
    }
  })

  it('follows the Selah El Telmeez unit progression', () => {
    const titles = getCurriculum('arabic').units.map((u) => u.title)
    expect(titles[0]).toContain('تأسيسية')
    expect(titles[1]).toContain('المعاملة')
    expect(titles[3]).toContain('عادات')
    expect(titles[5]).toContain('الرياضة')
    expect(titles[7]).toContain('من حولي')
    expect(titles[8]).toContain('مدرستي')
    expect(titles[9]).toContain('أماكن')
  })
})
