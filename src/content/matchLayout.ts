import { hashString, mulberry32, shuffle, type Rand } from './rng'

export interface MatchColumnLayout {
  /** unique left labels, in data order */
  lefts: string[]
  /** unique right labels, rearranged so none shares a row with its partner */
  rights: string[]
}

/**
 * Two-column layout for a `match` question.
 *
 * The right column is Fisher–Yates shuffled (deterministically seeded by `key`)
 * and repaired into a full derangement, so a correct pair is NEVER displayed
 * side by side on the same row. Left order keeps data order; only the right
 * column moves, keeping the exercise fair and fresh for every question.
 */
export function layoutMatchColumns(
  pairs: readonly { left: string; right: string }[],
  key: string,
): MatchColumnLayout {
  const lefts = [...new Set(pairs.map((p) => p.left))]
  const rights = [...new Set(pairs.map((p) => p.right))]
  if (lefts.length < 2 || rights.length < 2) return { lefts, rights }

  const rand: Rand = mulberry32(hashString(key))
  /** the right value that actually belongs to lefts[i] */
  const partnerOf = new Map(pairs.map((p) => [p.left, p.right]))
  const aligned = (cols: string[], i: number) => cols[i] === partnerOf.get(lefts[i])

  // A plain shuffle leaves ~37% of items aligned on average; retry a few times,
  // then fall back to a cyclic shift, which can never align for offset >= 1.
  let arranged = shuffle(rand, rights)
  for (let tries = 0; tries < 64 && arranged.some((_, i) => aligned(arranged, i)); tries++) {
    arranged = shuffle(rand, rights)
  }
  if (arranged.some((_, i) => aligned(arranged, i))) {
    const off = 1 + Math.floor(rand() * (rights.length - 1))
    arranged = rights.map((_, i) => rights[(i + off) % rights.length])
  }
  return { lefts, rights: arranged }
}
