import { describe, expect, it } from 'vitest'
import { CURRICULA } from '../src/content/registry'
import { QUESTIONS_PER_LESSON } from '../src/content/curriculum'
import { questionFingerprint } from '../src/content/makeLesson'
import { expectValidQuestion } from './questionChecks'
import type { Subject } from '../src/content/types'

const SEEDS = [1, 7, 42, 99, 123]
const SUBJECTS = Object.keys(CURRICULA) as Subject[]

describe('every lesson in every subject', () => {
  it('registry exposes all 7 subjects with lessons', () => {
    expect(SUBJECTS.sort()).toEqual(
      ['arabic', 'english', 'german', 'math', 'religion', 'science', 'social'].sort(),
    )
    for (const s of SUBJECTS) {
      expect(Object.keys(CURRICULA[s].allLessons).length).toBeGreaterThan(0)
    }
  })

  for (const subject of SUBJECTS) {
    const curriculum = CURRICULA[subject]
    const lessonIds = Object.keys(curriculum.allLessons)

    it(`${subject}: ${lessonIds.length} lessons all generate valid unique questions`, () => {
      for (const lessonId of lessonIds) {
        const entry = curriculum.allLessons[lessonId]
        for (const seed of SEEDS) {
          const qs = entry.lesson.generate(QUESTIONS_PER_LESSON, seed)
          expect(qs, `${subject}/${lessonId} seed=${seed} count`).toHaveLength(
            QUESTIONS_PER_LESSON,
          )
          for (const q of qs) expectValidQuestion(q)
          const prints = qs.map(questionFingerprint)
          expect(new Set(prints).size, `${subject}/${lessonId} seed=${seed} dupes`).toBe(
            qs.length,
          )
        }
        // deterministic per seed, varies across seeds
        const a = entry.lesson.generate(QUESTIONS_PER_LESSON, 7)
        const b = entry.lesson.generate(QUESTIONS_PER_LESSON, 7)
        expect(a.map(questionFingerprint)).toEqual(b.map(questionFingerprint))
        const c = entry.lesson.generate(QUESTIONS_PER_LESSON, 1007)
        expect(a.map(questionFingerprint)).not.toEqual(c.map(questionFingerprint))
      }
    })
  }
})
