import { describe, expect, it } from 'vitest'
import type { Question } from '../src/content/types'

export function expectValidQuestion(q: Question) {
  expect(typeof q.prompt).toBe('string')
  expect(q.prompt.length).toBeGreaterThan(0)
  switch (q.kind) {
    case 'mcq': {
      expect(q.choices.length).toBeGreaterThanOrEqual(2)
      expect(new Set(q.choices).size).toBe(q.choices.length)
      expect(q.answerIndex).toBeGreaterThanOrEqual(0)
      expect(q.answerIndex).toBeLessThan(q.choices.length)
      break
    }
    case 'type-number':
      expect(Number.isFinite(q.answer)).toBe(true)
      break
    case 'tap-count': {
      const matches = q.cells.filter((c) => c === q.targetEmoji).length
      expect(q.target).toBeGreaterThan(0)
      expect(matches).toBe(q.target)
      expect(q.cells.length).toBeGreaterThanOrEqual(q.target)
      break
    }
    case 'order': {
      expect(q.items.length).toBeGreaterThanOrEqual(2)
      expect(new Set(q.items).size).toBe(q.items.length)
      for (const item of q.items) expect(item.length).toBeGreaterThan(0)
      break
    }
    case 'match': {
      expect(q.pairs.length).toBeGreaterThan(0)
      for (const p of q.pairs) {
        expect(p.left.length).toBeGreaterThan(0)
        expect(p.right.length).toBeGreaterThan(0)
      }
      break
    }
  }
}
