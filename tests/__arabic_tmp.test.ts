import { describe, expect, it } from 'vitest'
import type { LessonDef, Question, UnitDef } from '../src/content/types'
import { UNIT_A4 } from '../src/content/arabic/a04'
import { UNIT_A5 } from '../src/content/arabic/a05'
import { UNIT_A6 } from '../src/content/arabic/a06'

const AR = /[\u0600-\u06FF]/
const TILES_RE = /^[ء-غف-ي]{2,12}$/
const MASCOTS = ['sonic', 'tails', 'knuckles', 'amy', 'shadow']

function expectValidArabicQuestion(q: Question) {
  expect(typeof q.prompt).toBe('string')
  expect(q.prompt.length).toBeGreaterThan(0)
  expect(q.prompt).toMatch(AR)
  if ('story' in q && q.story) {
    expect(q.story.title.length).toBeGreaterThan(0)
    expect(q.story.title).toMatch(AR)
    expect(q.story.lines.length).toBeGreaterThan(0)
  }
  switch (q.kind) {
    case 'mcq': {
      // Binary sorts (this/that, command/forbid) use 2 choices; others use 4.
      expect(q.choices.length).toBeGreaterThanOrEqual(2)
      expect(q.choices.length).toBeLessThanOrEqual(4)
      expect(new Set(q.choices).size).toBe(q.choices.length)
      expect(q.answerIndex).toBeGreaterThanOrEqual(0)
      expect(q.answerIndex).toBeLessThan(q.choices.length)
      break
    }
    case 'letter-tiles': {
      expect(q.targetWord).toMatch(TILES_RE)
      break
    }
    case 'truefalse': {
      expect(q.statement.length).toBeGreaterThan(0)
      expect(q.statement).toMatch(AR)
      expect(typeof q.answer).toBe('boolean')
      break
    }
    case 'speak': {
      expect(q.targetText.length).toBeGreaterThanOrEqual(1)
      expect(q.targetText.length).toBeLessThanOrEqual(120)
      expect(q.targetText).toMatch(AR)
      break
    }
    case 'order': {
      expect(q.items.length).toBeGreaterThanOrEqual(2)
      expect(q.items.length).toBeLessThanOrEqual(8)
      expect(new Set(q.items).size).toBe(q.items.length)
      break
    }
    case 'match': {
      expect(q.pairs.length).toBe(4)
      expect(new Set(q.pairs.map((p) => p.left)).size).toBe(4)
      expect(new Set(q.pairs.map((p) => p.right)).size).toBe(4)
      break
    }
    case 'tap-count': {
      const matches = q.cells.filter((c) => c === q.targetEmoji).length
      expect(matches).toBe(q.target)
      expect(q.cells.length).toBeGreaterThan(q.target)
      break
    }
  }
}

function checkLesson(id: string, lesson: LessonDef) {
  describe(`arabic lesson ${id}`, () => {
    it('has 2+ gens worth of variety and valid questions across seeds', () => {
      for (let seed = 1; seed <= 12; seed++) {
        const qs = lesson.generate(10, seed)
        expect(qs).toHaveLength(10)
        for (const q of qs) expectValidArabicQuestion(q)
      }
    })
    it('is deterministic per (lessonId, seed) and varies with seed', () => {
      const a = lesson.generate(10, 7)
      const b = lesson.generate(10, 7)
      expect(a).toEqual(b)
      const variants = new Set(
        Array.from({ length: 5 }, (_, s) => JSON.stringify(lesson.generate(10, s + 50))),
      )
      expect(variants.size).toBeGreaterThan(1)
    })
    it('has Arabic intro + valid mascot + objective codes', () => {
      expect(lesson.title).toMatch(AR)
      expect(lesson.intro.title).toMatch(AR)
      expect(lesson.intro.body).toMatch(AR)
      expect(lesson.objectiveCodes.length).toBeGreaterThan(0)
      for (const c of lesson.objectiveCodes) expect(c).toMatch(/^EG-Ar-2[RWGEL]$/)
      if (lesson.id.endsWith('boss')) expect(lesson.intro.mascotId).toBe('eggman')
      else expect(MASCOTS).toContain(lesson.intro.mascotId)
    })
  })
}

function describeUnit(unit: UnitDef, order: number) {
  describe(`arabic unit ${unit.id}`, () => {
    it('has right id/order, boss last + declared', () => {
      expect(unit.order).toBe(order)
      expect(unit.title).toMatch(AR)
      expect(unit.bossLessonIds).toEqual([`${unit.id}boss`])
      expect(unit.lessons.at(-1)?.id).toBe(`${unit.id}boss`)
      expect(unit.lessons).toHaveLength(4)
    })
  })
  for (const l of unit.lessons) checkLesson(l.id, l)
}

describeUnit(UNIT_A4, 4)
describeUnit(UNIT_A5, 5)
describeUnit(UNIT_A6, 6)

it('covers several objective families across the 3 units', () => {
  const fams = new Set<string>()
  for (const u of [UNIT_A4, UNIT_A5, UNIT_A6])
    for (const l of u.lessons) for (const c of l.objectiveCodes) fams.add(c)
  expect(fams.size).toBeGreaterThanOrEqual(4)
})

it('lesson ids are exactly a4l1..a4boss / a5.. / a6..', () => {
  expect(UNIT_A4.lessons.map((l) => l.id)).toEqual(['a4l1', 'a4l2', 'a4l3', 'a4boss'])
  expect(UNIT_A5.lessons.map((l) => l.id)).toEqual(['a5l1', 'a5l2', 'a5l3', 'a5boss'])
  expect(UNIT_A6.lessons.map((l) => l.id)).toEqual(['a6l1', 'a6l2', 'a6l3', 'a6boss'])
  expect([UNIT_A4.id, UNIT_A5.id, UNIT_A6.id]).toEqual(['a4', 'a5', 'a6'])
})

it('uses several question kinds across the units', () => {
  const kinds = new Set<string>()
  for (const u of [UNIT_A4, UNIT_A5, UNIT_A6])
    for (const l of u.lessons)
      for (const q of l.generate(10, 3)) kinds.add(q.kind)
  for (const k of ['mcq', 'match', 'order', 'tap-count', 'letter-tiles', 'truefalse', 'speak'])
    expect(kinds).toContain(k)
})
