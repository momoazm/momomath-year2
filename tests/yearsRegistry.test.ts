import { describe, expect, it } from 'vitest'
import { CURRICULA, getCurriculum, lessonEntry } from '../src/content/registry'
import { SUBJECTS_BY_YEAR, subjectInYear, subjectsForYear } from '../src/content/years'
import { usePlayer } from '../src/engine/store'
import type { Subject } from '../src/content/types'

/** PLAN Phase 31 step 163 — year-aware curriculum registry. */

const EXTRA_SUBJECTS: Subject[] = ['german', 'arabic', 'religion', 'social']
const CORE_SUBJECTS: Subject[] = ['math', 'english', 'science']
const OTHER_YEARS = [1, 3, 4]

describe('PLAN 163 — CURRICULA shape per year', () => {
  it('Year 2 carries the full subject set', () => {
    expect(Object.keys(CURRICULA[2]).sort()).toEqual(
      [...CORE_SUBJECTS, ...EXTRA_SUBJECTS].sort(),
    )
  })

  it('years 1 / 3 / 4 carry maths, english and science only', () => {
    for (const year of OTHER_YEARS) {
      expect(Object.keys(CURRICULA[year]).sort()).toEqual([...CORE_SUBJECTS].sort())
      for (const extra of EXTRA_SUBJECTS) {
        expect(CURRICULA[year][extra]).toBeUndefined()
      }
    }
  })

  it('every year has a maths curriculum (the never-crash fallback)', () => {
    for (const year of [1, 2, 3, 4]) {
      expect(CURRICULA[year].math).toBeDefined()
      expect(CURRICULA[year].math!.units.length).toBeGreaterThan(0)
    }
  })
})

describe('PLAN 163 — getCurriculum reads the active year', () => {
  it('defaults to Year 2 (existing one-arg callers stay Year-2)', () => {
    expect(getCurriculum('math')).toBe(CURRICULA[2].math)
    expect(getCurriculum('english')).toBe(CURRICULA[2].english)
    expect(getCurriculum('german')).toBe(CURRICULA[2].german)
    expect(getCurriculum('arabic', 2)).toBe(CURRICULA[2].arabic)
  })

  it('falls back to maths when a subject is not taught that year', () => {
    for (const year of OTHER_YEARS) {
      for (const extra of EXTRA_SUBJECTS) {
        expect(getCurriculum(extra, year)).toBe(CURRICULA[year].math)
      }
      for (const core of CORE_SUBJECTS) {
        expect(getCurriculum(core, year)).toBeDefined()
        expect(getCurriculum(core, year).units.length).toBeGreaterThan(0)
      }
    }
  })

  it('survives an unknown year number (treated as Year 2)', () => {
    expect(getCurriculum('math', 99)).toBe(CURRICULA[2].math)
    expect(getCurriculum('german', 99)).toBe(CURRICULA[2].german)
  })

  it('lessonEntry resolves inside the year too', () => {
    const someLesson = Object.keys(CURRICULA[2].english!.allLessons)[0]!
    expect(lessonEntry('english', someLesson)).toBeDefined()
    // PLAN 169d: Year-3 english now has its own curriculum, so Year-2
    // english lesson ids resolve only in Year 2 (ids are year-scoped)…
    expect(lessonEntry('english', someLesson, 3)).toBeUndefined()
    // …and a Year-3 id resolves in Year 3.
    const y3Lesson = Object.keys(CURRICULA[3].english!.allLessons)[0]!
    expect(lessonEntry('english', y3Lesson, 3)).toBeDefined()
    expect(lessonEntry('english', 'nope-not-a-lesson')).toBeUndefined()
  })
})

describe('PLAN 163 — subject visibility per year', () => {
  it('subjectsForYear lists the right subjects (unknown years = Year 2)', () => {
    expect(subjectsForYear(2)).toHaveLength(7)
    for (const year of OTHER_YEARS) {
      expect([...subjectsForYear(year)]).toEqual(CORE_SUBJECTS)
    }
    expect([...subjectsForYear(42)]).toEqual([...subjectsForYear(2)])
    expect(SUBJECTS_BY_YEAR[2]).toBe(subjectsForYear(2))
  })

  it('subjectInYear truth table', () => {
    for (const core of CORE_SUBJECTS) {
      for (const year of [1, 2, 3, 4]) expect(subjectInYear(core, year)).toBe(true)
    }
    for (const extra of EXTRA_SUBJECTS) {
      expect(subjectInYear(extra, 2)).toBe(true)
      for (const year of OTHER_YEARS) expect(subjectInYear(extra, year)).toBe(false)
    }
  })
})

describe('PLAN 163 — store setSubject guards the active year', () => {
  it('rejects an extra subject outside Year 2 (falls back to maths)', () => {
    usePlayer.setState({ yearLevel: 2, subject: 'math' })
    // Year 2: extras are reachable and auto-enable on pick.
    usePlayer.getState().setSubject('german')
    expect(usePlayer.getState().subject).toBe('german')
    expect(usePlayer.getState().germanEnabled).toBe(true)

    // Year 1: the same call falls back to maths instead of stranding the
    // roadmap on a subject the year does not teach.
    usePlayer.setState({ yearLevel: 1 })
    usePlayer.getState().setSubject('german')
    expect(usePlayer.getState().subject).toBe('math')
    usePlayer.getState().setSubject('social')
    expect(usePlayer.getState().subject).toBe('math')
    // core subjects still work in any year
    usePlayer.getState().setSubject('science')
    expect(usePlayer.getState().subject).toBe('science')

    // reset for other suites
    usePlayer.setState({ yearLevel: 2, subject: 'math' })
  })
})

describe('PLAN 163 — sync + year-switch never load an out-of-year subject', () => {
  it('applySyncedSnapshot ignores a remote subject the active year does not teach', () => {
    // The cloud snapshot has no year fields yet (PLAN 165), so a Year-1
    // device must keep its local subject when another device syncs German.
    usePlayer.setState({ yearLevel: 1, subject: 'math', germanEnabled: false })
    usePlayer.getState().applySyncedSnapshot({ subject: 'german' })
    expect(usePlayer.getState().subject).toBe('math')
    expect(usePlayer.getState().germanEnabled).toBe(false)

    // Year 2: the same remote subject applies and auto-enables its flag.
    usePlayer.setState({ yearLevel: 2, subject: 'math', germanEnabled: false })
    usePlayer.getState().applySyncedSnapshot({ subject: 'german' })
    expect(usePlayer.getState().subject).toBe('german')
    expect(usePlayer.getState().germanEnabled).toBe(true)

    // reset for other suites
    usePlayer.setState({ yearLevel: 2, subject: 'math', germanEnabled: false })
  })

  it('setYearLevel falls back to maths when the target bucket is poisoned', () => {
    const bucket = (subject: Subject) => ({
      lessonProgress: {},
      subject,
      arcadeScores: {},
      sprintBest: 0,
    })
    usePlayer.setState({
      yearLevel: 2,
      subject: 'math',
      paths: { 1: bucket('german'), 2: bucket('math') },
    })
    usePlayer.getState().setYearLevel(1)
    expect(usePlayer.getState().subject).toBe('math')
    usePlayer.getState().setYearLevel(2)
    expect(usePlayer.getState().subject).toBe('math')

    // a clean bucket still round-trips an in-year subject
    usePlayer.setState({ yearLevel: 2, subject: 'math', paths: { 1: bucket('english'), 2: bucket('math') } })
    usePlayer.getState().setYearLevel(1)
    expect(usePlayer.getState().subject).toBe('english')

    // reset for other suites
    usePlayer.setState({ yearLevel: 2, subject: 'math', paths: {} })
  })
})
