import { describe, expect, it } from 'vitest'
import * as G from '../src/content/generators'
import { mulberry32 } from '../src/content/rng'
import type { Rand } from '../src/content/rng'
import type { Question } from '../src/content/types'
import { expectValidQuestion } from './questionChecks'

const GENERATORS = Object.entries(G).filter(([name]) => name.startsWith('g')) as [
  string,
  (rand: Rand) => Question,
][]

describe('generator inventory', () => {
  it('exposes the full generator set', () => {
    expect(GENERATORS.length).toBeGreaterThanOrEqual(39)
    expect(new Set(GENERATORS.map(([name]) => name)).size).toBe(GENERATORS.length)
  })
})

describe('numWord', () => {
  it('spells numbers up to twenty', () => {
    expect(G.numWord(0)).toBe('zero')
    expect(G.numWord(7)).toBe('seven')
    expect(G.numWord(20)).toBe('twenty')
  })

  it('spells round tens and hyphenated teens-of-tens', () => {
    expect(G.numWord(30)).toBe('thirty')
    expect(G.numWord(42)).toBe('forty-two')
    expect(G.numWord(99)).toBe('ninety-nine')
  })
})

describe('mcq helper', () => {
  it('shuffles the answer among the choices and records its index', () => {
    const foundPositions = new Set<number>()
    for (let seed = 0; seed < 30; seed++) {
      const q = G.mcq(mulberry32(seed), 'prompt', 'B', ['A', 'C', 'D'])
      expect(q.kind).toBe('mcq')
      expect(q.choices).toContain('B')
      expect(q.choices[q.answerIndex]).toBe('B')
      foundPositions.add(q.answerIndex)
    }
    expect(foundPositions.size).toBeGreaterThan(1)
  })
})

for (const [name, gen] of GENERATORS) {
  describe(name, () => {
    it('produces valid questions across many seeds', () => {
      for (let seed = 0; seed < 60; seed++) {
        expectValidQuestion(gen(mulberry32(seed)))
      }
    })

    it('is deterministic for a given rand stream', () => {
      for (let seed = 0; seed < 10; seed++) {
        expect(gen(mulberry32(seed))).toEqual(gen(mulberry32(seed)))
      }
    })
  })
}
