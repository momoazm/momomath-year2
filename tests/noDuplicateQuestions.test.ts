import { describe, expect, it } from 'vitest'
import { CURRICULA } from '../src/content/registry'
import { questionFingerprint } from '../src/content/makeLesson'

const SEEDS = [0, 1, 42, 7]

describe('no duplicate questions within a lesson', () => {
  for (const [subject, curriculum] of Object.entries(CURRICULA)) {
    for (const [lessonId, entry] of Object.entries(curriculum.allLessons)) {
      it(`${subject}/${lessonId}: generate(10, seed) has unique fingerprints`, () => {
        for (const seed of SEEDS) {
          const qs = entry.lesson.generate(10, seed)
          const prints = qs.map(questionFingerprint)
          const unique = new Set(prints)
          const dupes = prints.filter((p, i) => prints.indexOf(p) !== i)
          expect(
            unique.size,
            `${lessonId} seed=${seed} duplicates: ${JSON.stringify([...new Set(dupes)])}`,
          ).toBe(qs.length)
        }
      })

      it(`${subject}/${lessonId}: seed 42 differs from seed 7`, () => {
        const a = entry.lesson.generate(10, 42).map(questionFingerprint)
        const b = entry.lesson.generate(10, 7).map(questionFingerprint)
        expect(a).not.toEqual(b)
      })
    }
  }
})
