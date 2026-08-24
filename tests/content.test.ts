import { describe, expect, it } from 'vitest'
import { UNITS, ALL_LESSONS } from '../src/content/curriculum'
import type { MatchQuestion, McqQuestion, OrderQuestion, Question, TapCountQuestion, TypeNumberQuestion } from '../src/content/types'
import { mulberry32 } from '../src/content/rng'

/** Structural correctness sweep over EVERY lesson × several attempts. */
describe('curriculum generators', () => {
  it('every unit has lessons with unique ids and objective codes', () => {
    const ids = new Set<string>()
    for (const u of UNITS) {
      expect(u.lessons.length).toBeGreaterThanOrEqual(3)
      for (const l of u.lessons) {
        expect(ids.has(l.id)).toBe(false)
        ids.add(l.id)
        if (!l.id.endsWith('boss')) expect(l.objectiveCodes.length).toBeGreaterThan(0)
      }
    }
    expect(Object.keys(ALL_LESSONS).length).toBe(ids.size)
  })

  const attempts = 5
  for (const { lesson, unit } of Object.values(ALL_LESSONS)) {
    it(`${lesson.id} (${unit.title} / ${lesson.title}) generates valid questions`, () => {
      for (let seed = 1; seed <= attempts; seed++) {
        const qs = lesson.generate(10, seed)
        expect(qs).toHaveLength(10)
        qs.forEach(validateQuestion)
      }
    })
    it(`${lesson.id} is deterministic for a given attempt`, () => {
      const a = lesson.generate(10, 7)
      const b = lesson.generate(10, 7)
      expect(a.map(qKey)).toEqual(b.map(qKey))
    })
  }

  it('tap-count cells contain exactly `target` target emojis', () => {
    let seen = 0
    for (let seed = 0; seed < 200; seed++) {
      const rand = mulberry32(seed)
      // reach into u1l1 which uses gCountObjects
      const qs = ALL_LESSONS['u1l1'].lesson.generate(10, seed)
      for (const q of qs) {
        if (q.kind === 'tap-count') {
          const hits = q.cells.filter((c) => c === q.targetEmoji).length
          expect(hits).toBe(q.target)
          expect(q.cells.length).toBeGreaterThan(q.target) // decoys present
          seen++
        }
      }
    }
    expect(seen).toBeGreaterThan(50)
  })

  it('type-number answers stay within Year-2 bounds', () => {
    for (const { lesson } of Object.values(ALL_LESSONS)) {
      for (let seed = 1; seed <= attempts * 2; seed++) {
        for (const q of lesson.generate(10, seed)) {
          if (q.kind === 'type-number') {
            expect(Number.isFinite(q.answer)).toBe(true)
            expect(q.answer).toBeGreaterThanOrEqual(0)
            expect(q.answer).toBeLessThanOrEqual(100)
          }
        }
      }
    }
  })
})

function validateQuestion(q: Question) {
  switch (q.kind) {
    case 'mcq': {
      const m = q as McqQuestion
      expect(m.choices.length).toBeGreaterThanOrEqual(2)
      expect(new Set(m.choices).size).toBe(m.choices.length)
      expect(m.answerIndex).toBeGreaterThanOrEqual(0)
      expect(m.answerIndex).toBeLessThan(m.choices.length)
      break
    }
    case 'type-number':
      expect(typeof (q as TypeNumberQuestion).answer).toBe('number')
      break
    case 'order': {
      const o = q as OrderQuestion
      expect(o.items.length).toBeGreaterThan(2)
      expect(new Set(o.items).size).toBe(o.items.length)
      break
    }
    case 'match': {
      const m = q as MatchQuestion
      expect(m.pairs.length).toBeGreaterThan(0)
      for (const p of m.pairs) {
        expect(p.left).toBeTruthy()
        expect(p.right).toBeTruthy()
      }
      break
    }
    case 'tap-count': {
      const t = q as TapCountQuestion
      expect(t.target).toBeGreaterThanOrEqual(3)
      expect(t.cells.length).toBeGreaterThanOrEqual(t.target)
      break
    }
  }
}

function qKey(q: Question): string {
  return JSON.stringify(q)
}
