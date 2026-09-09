import { describe, expect, it } from 'vitest'
import { ALL_LESSONS as MATH_ALL } from '../src/content/curriculum'
import { getCurriculum } from '../src/content/registry'
import { SOCIAL_UNITS } from '../src/content/social'

describe('social optional extra registry', () => {
  it('exposes six units in roadmap order without touching other subjects', () => {
    const social = getCurriculum('social')
    expect(social.units.length).toBe(6)
    expect(social.units.map((u) => u.order)).toEqual([1, 2, 3, 4, 5, 6])
    expect(social.units).toBe(SOCIAL_UNITS)
  })

  it('keeps social lesson ids disjoint from every other subject', () => {
    const taken = new Set<string>()
    for (const s of ['math', 'english', 'science', 'german', 'arabic', 'religion'] as const) {
      for (const id of Object.keys(getCurriculum(s).allLessons)) taken.add(id)
    }
    void MATH_ALL
    for (const id of Object.keys(getCurriculum('social').allLessons)) {
      expect(id.startsWith('d'), `social id should start with d: ${id}`).toBe(true)
      expect(taken.has(id), `duplicate id ${id}`).toBe(false)
    }
  })

  it('marks every unit with a consistent trailing boss lesson', () => {
    for (const u of getCurriculum('social').units) {
      expect(u.bossLessonIds).toEqual([`${u.id}boss`])
      expect(u.lessons.at(-1)?.id).toBe(`${u.id}boss`)
    }
  })

  it('covers every EG-So strand code family used by the extra', () => {
    const codes = getCurriculum('social')
      .units.flatMap((u) => u.lessons)
      .flatMap((l) => l.objectiveCodes)
    for (const fam of ['EG-So-2G', 'EG-So-2H', 'EG-So-2E', 'EG-So-2C', 'EG-So-2W']) {
      expect(codes.some((c) => c.startsWith(fam)), `missing ${fam}`).toBe(true)
    }
  })

  it('follows the Discover-based progression', () => {
    const titles = getCurriculum('social').units.map((u) => u.title)
    expect(titles[0]).toContain('مصر')
    expect(titles[1]).toContain('النيل')
    expect(titles[2]).toContain('المهن')
    expect(titles[3]).toContain('الخريطة')
    expect(titles[4]).toContain('آثار')
    expect(titles[5]).toContain('مجتمعي')
  })
})
