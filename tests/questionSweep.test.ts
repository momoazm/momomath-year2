import { describe, expect, it } from 'vitest'
import { getCurriculum } from '../src/content/registry'
import { QUESTIONS_PER_LESSON } from '../src/content/curriculum'
import { questionKey } from '../src/content/lessonQueue'
import { expectValidQuestion } from './questionChecks'
import type { Subject } from '../src/content/types'

const SUBJECTS: Subject[] = ['math', 'english', 'science', 'german', 'arabic', 'religion', 'social']
const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]

/** PLAN 119/126/129: every lesson must serve a full, structurally valid queue
 *  with ZERO duplicate questions on every seed — the content pools were
 *  expanded (step 129) until this sweep came back completely clean, so the
 *  threshold is 0, not "few". */
describe('question sweep', () => {
  it('every subject x lesson x seed serves a full valid queue with zero duplicate questions', () => {
    const fails: string[] = []
    for (const subject of SUBJECTS) {
      const cur = getCurriculum(subject)
      for (const [lessonId, { lesson }] of Object.entries(cur.allLessons)) {
        for (const seed of SEEDS) {
          let qs
          try {
            qs = lesson.generate(QUESTIONS_PER_LESSON, seed)
          } catch (e) {
            fails.push(`THREW ${subject}/${lessonId} seed${seed}: ${(e as Error).message}`)
            continue
          }
          if (qs.length !== QUESTIONS_PER_LESSON) {
            fails.push(`LENGTH ${subject}/${lessonId} seed${seed}: served ${qs.length}`)
          }
          qs.forEach((q, i) => {
            try {
              expectValidQuestion(q)
            } catch (e) {
              fails.push(`INVALID ${subject}/${lessonId} seed${seed} q${i}: ${(e as Error).message.split('\n')[0]}`)
            }
          })
          const keys = qs.map(questionKey)
          const dupes = keys.length - new Set(keys).size
          if (dupes > 0) fails.push(`DUP ${subject}/${lessonId} seed${seed}: ${dupes} duplicate question(s)`)
        }
      }
    }
    expect(fails.length, fails.length ? `TOTAL ${fails.length}\n${fails.slice(0, 60).join('\n')}` : 'clean').toBe(0)
  }, 120_000)

  it('the exclude set pre-seeds dedupe — a refilled batch never repeats served questions (PLAN 127)', () => {
    const lesson = getCurriculum('math').allLessons['u1l1'].lesson
    const first = lesson.generate(QUESTIONS_PER_LESSON, 42)
    const exclude = new Set(first.map(questionKey))
    const refill = lesson.generate(5, 7, exclude)
    expect(refill).toHaveLength(5)
    for (const q of refill) {
      expect(exclude.has(questionKey(q)), `refill repeated: ${q.prompt}`).toBe(false)
    }
  })
})
