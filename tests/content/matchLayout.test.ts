import { describe, expect, it } from 'vitest'
import { layoutMatchColumns } from '../../src/content/matchLayout'

const PAIRS4 = [
  { left: 'A', right: 'a' },
  { left: 'B', right: 'b' },
  { left: 'C', right: 'c' },
  { left: 'D', right: 'd' },
]

const PAIRS6 = [
  { left: 'big', right: 'small' },
  { left: 'hot', right: 'cold' },
  { left: 'happy', right: 'sad' },
  { left: 'fast', right: 'slow' },
  { left: 'tall', right: 'short' },
  { left: 'loud', right: 'quiet' },
]

/** No displayed row may hold a left beside its own partner right. */
function expectNoAlignedRow(pairs: readonly { left: string; right: string }[], key: string) {
  const { lefts, rights } = layoutMatchColumns(pairs, key)
  const partnerOf = new Map(pairs.map((p) => [p.left, p.right]))
  for (let i = 0; i < lefts.length; i++) {
    expect(rights[i], `row ${i} for key=${key}`).not.toBe(partnerOf.get(lefts[i]))
  }
}

describe('layoutMatchColumns', () => {
  it('never places a pair side by side, even for pre-aligned input', () => {
    for (let k = 0; k < 40; k++) expectNoAlignedRow(PAIRS4, `k${k}`)
    for (let k = 0; k < 40; k++) expectNoAlignedRow(PAIRS6, `k${k}`)
  })

  it('handles reverse-ordered input (worst case other than identity)', () => {
    const reversed = [...PAIRS4].reverse()
    for (let k = 0; k < 20; k++) expectNoAlignedRow(reversed, `rev${k}`)
  })

  it('keeps exactly the same values in each column', () => {
    const { lefts, rights } = layoutMatchColumns(PAIRS6, 'any')
    expect([...lefts].sort()).toEqual([...new Set(PAIRS6.map((p) => p.left))].sort())
    expect([...rights].sort()).toEqual([...new Set(PAIRS6.map((p) => p.right))].sort())
  })

  it('is deterministic for a given question content key', () => {
    const a = layoutMatchColumns(PAIRS4, 'seed-key')
    const b = layoutMatchColumns(PAIRS4, 'seed-key')
    expect(a).toEqual(b)
  })

  it('produces fresh arrangements across different questions/keys', () => {
    const layouts = new Set(
      Array.from({ length: 12 }, (_, k) =>
        JSON.stringify(layoutMatchColumns(PAIRS6, `question-${k}`)),
      ),
    )
    expect(layouts.size).toBeGreaterThanOrEqual(2)
  })

  it('still deranges the smallest allowed board (2 pairs)', () => {
    const two = [
      { left: 'L1', right: 'R1' },
      { left: 'L2', right: 'R2' },
    ]
    const { lefts, rights } = layoutMatchColumns(two, 'tiny')
    expect(lefts).toEqual(['L1', 'L2'])
    expect(rights[0]).not.toBe('R1')
    expect(rights[1]).not.toBe('R2')
  })
})
