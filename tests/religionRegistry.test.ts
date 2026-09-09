import { describe, expect, it } from 'vitest'
import { ALL_LESSONS as MATH_ALL } from '../src/content/curriculum'
import { getCurriculum } from '../src/content/registry'
import { RELIGION_UNITS } from '../src/content/religion'

describe('religion optional extra registry', () => {
  it('exposes six units in roadmap order without touching other subjects', () => {
    const religion = getCurriculum('religion')
    expect(religion.units.length).toBe(6)
    expect(religion.units.map((u) => u.order)).toEqual([1, 2, 3, 4, 5, 6])
    expect(religion.units).toBe(RELIGION_UNITS)
  })

  it('keeps religion lesson ids disjoint from every other subject', () => {
    const taken = new Set<string>()
    for (const s of ['math', 'english', 'science', 'german', 'arabic'] as const) {
      for (const id of Object.keys(getCurriculum(s).allLessons)) taken.add(id)
    }
    void MATH_ALL
    for (const id of Object.keys(getCurriculum('religion').allLessons)) {
      expect(id.startsWith('r'), `religion id should start with r: ${id}`).toBe(true)
      expect(taken.has(id), `duplicate id ${id}`).toBe(false)
    }
  })

  it('marks every unit with a consistent trailing boss lesson', () => {
    for (const u of getCurriculum('religion').units) {
      expect(u.bossLessonIds).toEqual([`${u.id}boss`])
      expect(u.lessons.at(-1)?.id).toBe(`${u.id}boss`)
    }
  })

  it('covers every EG-Rl strand code family used by the extra', () => {
    const codes = getCurriculum('religion')
      .units.flatMap((u) => u.lessons)
      .flatMap((l) => l.objectiveCodes)
    for (const fam of ['EG-Rl-2Q', 'EG-Rl-2A', 'EG-Rl-2F', 'EG-Rl-2S', 'EG-Rl-2E']) {
      expect(codes.some((c) => c.startsWith(fam)), `missing ${fam}`).toBe(true)
    }
  })

  it('follows the Egyptian religion progression', () => {
    const titles = getCurriculum('religion').units.map((u) => u.title)
    expect(titles[0]).toContain('الله')
    expect(titles[1]).toContain('كتاب الله')
    expect(titles[2]).toContain('صلاتي')
    expect(titles[3]).toContain('سيرة')
    expect(titles[4]).toContain('الأنبياء')
    expect(titles[5]).toContain('أخلاق')
  })
})
