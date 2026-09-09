import { describe, expect, it } from 'vitest'
import { ALL_LESSONS as MATH_ALL, UNITS as MATH_UNITS } from '../src/content/curriculum'
import { CURRICULA, getCurriculum } from '../src/content/registry'
import type { Subject } from '../src/content/types'

const subjects: Subject[] = ['math', 'english']

describe('subject registry', () => {
  it('exposes both curricula', () => {
    for (const s of subjects) {
      expect(getCurriculum(s).units.length).toBeGreaterThan(0)
    }
    expect(getCurriculum('math')).toBe(CURRICULA.math)
  })

  it('keeps lesson id namespaces disjoint across subjects', () => {
    const mathIds = new Set(Object.keys(MATH_ALL))
    for (const id of Object.keys(getCurriculum('english').allLessons)) {
      expect(mathIds.has(id), `duplicate lesson id ${id}`).toBe(false)
    }
  })
})

describe('english curriculum structure', () => {
  const english = getCurriculum('english')

  it('has thirteen units in roadmap order', () => {
    expect(english.units.length).toBe(13)
    expect(english.units.map((u) => u.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
  })

  it('gives every lesson a globally unique id and indexes it', () => {
    const ids = english.units.flatMap((u) => u.lessons.map((l) => l.id))
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(english.allLessons[id]).toBeDefined()
  })

  it('english: marks every unit with a consistent trailing boss lesson', () => {
    for (const u of english.units) {
      expect(u.bossLessonIds).toEqual([`${u.id}boss`])
      expect(u.lessons.at(-1)?.id).toBe(`${u.id}boss`)
    }
  })

  it('covers every Stage 2 English sub-strand code family', () => {
    const codes = english.units
      .flatMap((u) => u.lessons)
      .flatMap((l) => l.objectiveCodes)
    for (const fam of [
      '2Rw', '2Rv', '2Rg', '2Rs', '2Ri', '2Ra',
      '2Ww', '2Wv', '2Wg', '2Ws', '2Wc',
      '2SLs', '2SLp',
    ]) {
      expect(codes.some((c) => c.startsWith(fam)), `missing ${fam}`).toBe(true)
    }
  })

  it('math curriculum is untouched by the registry refactor', () => {
    expect(MATH_UNITS.length).toBe(13)
    expect(Object.keys(MATH_ALL).length).toBeGreaterThan(60)
  })
})
