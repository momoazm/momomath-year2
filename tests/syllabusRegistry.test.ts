import { describe, expect, it } from 'vitest'
import { CURRICULA } from '../src/content/registry'
import type { Subject } from '../src/content/types'
import { SYLLABUS, TOLERANCE, SUBJECT_LANG } from '../src/content/syllabus'
import { buildMatcher } from '../src/content/syllabus/match'
import { AUDIT_SEEDS, bucketQuestion, eachGeneratedQuestion } from '../src/content/syllabus/walk'

const TOKENS = /\p{L}[\p{L}\p{M}'’-]*/gu

/** PLAN 146 — every learner-facing bank word (mcq choices, match pairs, order
 *  items, letter-tiles targets) must be Year-2 level: verdict 'hard' is a
 *  failure. Uses the same seeds + bucketing as scripts/audit-syllabus.mjs. */
describe('PLAN 146 — syllabus registry regression guard', () => {
  it('every curriculum subject has syllabus + tolerance entries', () => {
    const subjects = Object.keys(CURRICULA[2]).sort()
    expect(subjects).toEqual(Object.keys(SYLLABUS).sort())
    for (const s of subjects as Subject[]) {
      expect(SYLLABUS[s].length).toBeGreaterThan(40)
      expect(TOLERANCE[s].length).toBeGreaterThan(0)
      expect(SUBJECT_LANG[s]).toBeTruthy()
    }
  })

  for (const subject of Object.keys(CURRICULA[2]).sort() as Subject[]) {
    it(`${subject}: every bank word is Year-2 level (no HARD flags)`, () => {
      const matcher = buildMatcher(subject)
      const hard: string[] = []
      const lessons = eachGeneratedQuestion(CURRICULA[2], subject, (lesson, q) => {
        const { bank } = bucketQuestion(q)
        for (const phrase of bank) {
          for (const tok of String(phrase).match(TOKENS) ?? []) {
            if (matcher.check(tok) === 'hard') hard.push(`${lesson.id}/${q.kind}: ${tok}`)
          }
        }
      })
      expect(lessons).toBeGreaterThan(0)
      expect(hard.slice(0, 25)).toEqual([])
    })
  }

  it('audit seeds stay fixed (audit script and this test must agree)', () => {
    expect([...AUDIT_SEEDS]).toEqual([20260927, 7])
  })
})
