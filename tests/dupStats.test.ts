import { describe, expect, it } from 'vitest'
import { CURRICULA } from '../src/content/registry'
import { questionFingerprint } from '../src/content/makeLesson'

describe('dup stats', () => {
  it('dump', () => {
    const rows: string[] = []
    for (const [subject, curriculum] of Object.entries(CURRICULA)) {
      for (const [lessonId, entry] of Object.entries(curriculum.allLessons)) {
        const worst: number[] = []
        for (const seed of [0, 1, 42, 7]) {
          const fps = entry.lesson.generate(10, seed).map(questionFingerprint)
          worst.push(new Set(fps).size)
        }
        const min = Math.min(...worst)
        if (min < 10) rows.push(`${subject}/${lessonId} min=${min} all=${worst.join(',')}`)
      }
    }
    console.log('FAILING_LESSONS_BEGIN')
    console.log(rows.join('\n'))
    console.log('FAILING_LESSONS_END count=' + rows.length)
    expect(true).toBe(true)
  })
})
