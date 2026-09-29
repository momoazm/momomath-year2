import { describe, expect, it } from 'vitest'
import { CURRICULA } from '../src/content/registry'
import type { Subject } from '../src/content/types'
import { SYLLABUS, TOLERANCE, SUBJECT_LANG } from '../src/content/syllabus'
import { buildMatcher } from '../src/content/syllabus/match'
import { AUDIT_SEEDS, bucketQuestion, eachGeneratedQuestion } from '../src/content/syllabus/walk'

const TOKENS = /\p{L}[\p{L}\p{M}'’-]*/gu

const YEARS = Object.keys(CURRICULA).map(Number).sort((a, b) => a - b)

/** PLAN 146/168 — every learner-facing bank word (mcq choices, match pairs,
 *  order items, letter-tiles targets) must pass the year's own syllabus
 *  (Year-1 maths has its own override, shared content falls back to Year-2):
 *  verdict 'hard' is a failure. Uses the same seeds + bucketing as
 *  scripts/audit-syllabus.mjs. */
describe('PLAN 146/168 — syllabus registry regression guard', () => {
  it('every curriculum subject has syllabus + tolerance entries', () => {
    const subjects = Object.keys(CURRICULA[2]).sort()
    expect(subjects).toEqual(Object.keys(SYLLABUS).sort())
    for (const s of subjects as Subject[]) {
      expect(SYLLABUS[s].length).toBeGreaterThan(40)
      expect(TOLERANCE[s].length).toBeGreaterThan(0)
      expect(SUBJECT_LANG[s]).toBeTruthy()
    }
  })

  it('every year in the registry carries maths (the never-crash fallback)', () => {
    expect(YEARS.length).toBeGreaterThanOrEqual(4)
    for (const year of YEARS) {
      expect(CURRICULA[year].math.units.length).toBeGreaterThan(0)
      expect(CURRICULA[year].math.allLessons).toBeTruthy()
    }
  })

  // PLAN 168 — iterate every year x subject present, matching each year
  // against its own syllabus overrides (default = Year-2 lists).
  for (const year of YEARS) {
    for (const subject of Object.keys(CURRICULA[year]).sort() as Subject[]) {
      it(`y${year}/${subject}: every bank word passes the year-${year} syllabus (no HARD flags)`, () => {
        const matcher = buildMatcher(subject, year)
        const hard: string[] = []
        const lessons = eachGeneratedQuestion(CURRICULA[year], subject, (lesson, q) => {
          const { bank } = bucketQuestion(q)
          for (const phrase of bank) {
            for (const tok of String(phrase).match(TOKENS) ?? []) {
              if (matcher.check(tok) === 'hard') hard.push(`${lesson.id}/${q.kind}: ${tok}`)
            }
          }
        })
        expect(matcher.year).toBe(year)
        expect(lessons).toBeGreaterThan(0)
        expect(hard.slice(0, 25)).toEqual([])
      })
    }
  }

  it('audit seeds stay fixed (audit script and this test must agree)', () => {
    expect([...AUDIT_SEEDS]).toEqual([20260927, 7])
  })
})
