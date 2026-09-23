import { describe, expect, it } from 'vitest'
import { ENGLISH_ALL_LESSONS, ENGLISH_UNITS } from '../../src/content/english'
import {
  TERM_LESSON_IDS,
  TERM_QUESTIONS,
  questionsForLesson,
  termMedal,
} from '../../src/content/english/terms'
import { questionFingerprint } from '../../src/content/makeLesson'
import { expectValidEnglishQuestion } from './harness'

const TERM_UNITS: { unitId: string; lessonId: string; beforeBoss: boolean }[] = [
  { unitId: 'e5', lessonId: 'e5term', beforeBoss: true },
  { unitId: 'e10', lessonId: 'e10term', beforeBoss: true },
  { unitId: 'e13', lessonId: 'e13term', beforeBoss: true },
]

describe('term challenges (roadmap §3)', () => {
  it('exactly three term lesson ids exist in the curriculum', () => {
    const found = Object.keys(ENGLISH_ALL_LESSONS).filter((id) => id.endsWith('term'))
    expect(found.sort()).toEqual([...TERM_LESSON_IDS].sort())
    expect(TERM_LESSON_IDS).toEqual(['e5term', 'e10term', 'e13term'])
  })

  for (const t of TERM_UNITS) {
    it(`${t.lessonId} sits immediately before ${t.unitId}boss inside unit ${t.unitId}`, () => {
      const unit = ENGLISH_UNITS.find((u) => u.id === t.unitId)!
      expect(unit).toBeDefined()
      const ids = unit.lessons.map((l) => l.id)
      expect(ids).toContain(t.lessonId)
      expect(ids.at(-1)).toBe(`${t.unitId}boss`)
      expect(ids.indexOf(t.lessonId)).toBe(ids.length - 2)
      expect(unit.bossLessonIds).toEqual([`${t.unitId}boss`])
    })
  }

  for (const id of TERM_LESSON_IDS) {
    it(`${id}: exam-flavoured items, no hints, TERM_QUESTIONS long, deterministic`, () => {
      const lesson = ENGLISH_ALL_LESSONS[id].lesson
      expect(lesson.generate(TERM_QUESTIONS, 1)).toHaveLength(TERM_QUESTIONS)

      const qs = lesson.generate(TERM_QUESTIONS, 1)
      for (const q of qs) {
        expectValidEnglishQuestion(q)
        expect(q.hint, `${id} must not carry hints`).toBeUndefined()
      }

      // Exam formats only: tick-box MCQ / order events / match heading / find-and-copy
      const allowed = new Set(['mcq', 'order', 'match', 'truefalse'])
      for (const q of qs) expect(allowed.has(q.kind), `${id} unexpected kind ${q.kind}`).toBe(true)

      // No duplicate fingerprints across the full 30
      const fps = qs.map(questionFingerprint)
      expect(new Set(fps).size).toBe(TERM_QUESTIONS)

      // Deterministic per seed; varies across seeds
      expect(lesson.generate(TERM_QUESTIONS, 7)).toEqual(lesson.generate(TERM_QUESTIONS, 7))
      const a = lesson.generate(TERM_QUESTIONS, 42).map(questionFingerprint)
      const b = lesson.generate(TERM_QUESTIONS, 7).map(questionFingerprint)
      expect(a).not.toEqual(b)
    })
  }

  it('questionsForLesson routes term ids to 30 and others to the default', () => {
    expect(questionsForLesson('e5term', 10)).toBe(30)
    expect(questionsForLesson('e10term', 10)).toBe(30)
    expect(questionsForLesson('e13term', 10)).toBe(30)
    expect(questionsForLesson('e5l1', 10)).toBe(10)
    expect(questionsForLesson('e13boss', 10)).toBe(10)
  })

  it('termMedal maps accuracy bands and ignores non-term lessons', () => {
    expect(termMedal('e5term', 100)).toBe('gold')
    expect(termMedal('e10term', 90)).toBe('gold')
    expect(termMedal('e10term', 89)).toBe('silver')
    expect(termMedal('e13term', 75)).toBe('silver')
    expect(termMedal('e13term', 74)).toBe('bronze')
    expect(termMedal('e13term', 0)).toBe('bronze')
    expect(termMedal('e13boss', 100)).toBeNull()
    expect(termMedal('e5l1', 100)).toBeNull()
  })
})
