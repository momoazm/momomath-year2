import { hashString, mulberry32, shuffle, type Rand } from './rng'

export interface MatchColumnLayout {
  /** unique left labels, in data order */
  lefts: string[]
  /** unique right labels, rearranged so none shares a row with its partner */
  rights: string[]
}

/** Pure match re-pick helpers shared by LessonScreen + QuestionView (PLAN 154/155).
 *  Keys are opaque row ids (`left|right` in LessonScreen, numeric pair index in
 *  battle); the map stays a plain object so React state shape is unchanged. */

export interface MatchMove {
  /** assignment after the tap (undefined = no-op, e.g. tapped without pending) */
  next: Record<string, string> | null
  /** whether pending clears after this tap */
  clearPending: boolean
  /** sfx intent: 'tap' acknowledge, 'correct' new pairing formed */
  sfx: 'tap' | 'correct'
}

/** Tap handling for a LEFT row. Matched rows reopen; re-tapping pending clears. */
export function matchPickLeft(
  matched: Readonly<Record<string, string>>,
  pending: string | null,
  key: string,
): MatchMove {
  if (pending === key) return { next: { ...matched }, clearPending: true, sfx: 'tap' }
  if (matched[key] !== undefined) {
    const next = { ...matched }
    delete next[key]
    return { next, clearPending: false, sfx: 'tap' }
  }
  return { next: { ...matched }, clearPending: false, sfx: 'tap' }
}

/** Tap handling for a RIGHT row. Taken rows steal: old holder releases first. */
export function matchPickRight(
  matched: Readonly<Record<string, string>>,
  pending: string | null,
  key: string,
): MatchMove {
  const holder = Object.keys(matched).find((left) => matched[left] === key)
  if (holder !== undefined) {
    if (pending !== null && holder !== pending) {
      const next = { ...matched }
      delete next[holder]
      next[pending] = key
      return { next, clearPending: true, sfx: 'correct' }
    }
    const next = { ...matched }
    delete next[holder]
    return { next, clearPending: false, sfx: 'tap' }
  }
  if (pending === null) return { next: null, clearPending: false, sfx: 'tap' }
  return { next: { ...matched, [pending]: key }, clearPending: true, sfx: 'correct' }
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
