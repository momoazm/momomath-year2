import { describe, expect, it } from 'vitest'
import { gPatternNext } from '../src/content/generators'
import { mulberry32, hashString } from '../src/content/rng'
import type { Question } from '../src/content/types'

/** Smallest repeating period of the shown pattern, or 0 if none fits. */
function smallestPeriod(seq: string[]): number {
  for (let p = 1; p <= seq.length; p++) {
    if (seq.every((s, i) => s === seq[i % p])) return p
  }
  return 0
}

function symbolsIn(prompt: string): string[] {
  // every non-space token that is not the trailing "…" or words
  return prompt.split(/\s+/).filter((t) => /\p{Extended_Pictographic}/u.test(t) && t !== '…')
}

describe('gPatternNext regression (shown sequence must match the marked answer)', () => {
  it('marked answer continues the displayed repeating pattern, for many seeds', () => {
    for (let seed = 1; seed <= 80; seed++) {
      const q: Question = gPatternNext(mulberry32(hashString(`u1l5`) ^ (seed * 2654435761)))
      expect(q.kind).toBe('mcq')
      if (q.kind !== 'mcq') continue
      const seq = symbolsIn(q.prompt)
      expect(seq.length).toBeGreaterThanOrEqual(3)
      const p = smallestPeriod(seq)
      expect(p).toBeGreaterThan(0)
      const expected = seq[seq.length % p]
      const marked = q.choices[q.answerIndex]
      expect(marked, `seed ${seed}: prompt "${q.prompt}" → expected ${expected}, marked ${marked}`).toBe(
        expected,
      )
      // the correct answer must appear exactly once among the choices
      expect(q.choices.filter((c) => c === marked)).toHaveLength(1)
    }
  })
})
