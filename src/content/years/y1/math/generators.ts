/** PLAN 167 — Year-1 maths generators. Y1-appropriate ranges throughout:
 *  numbers to 20 (one more/less, compare, order, bonds, add/subtract, half
 *  and quarter of quantities), shapes, o'clock/half past, coin values and
 *  repeating/step patterns. Shared helpers (mcq/numWord/rng) come from the
 *  content root so both years shape questions identically.
 *
 *  Vocabulary stays inside the Year-1 NNS checklist (src/content/syllabus/
 *  y1/math.ts): no "exactly", "capacity", "vertices", hyphenated compounds
 *  ("three quarter", not "three-quarter" — the matcher is token-based), no
 *  "number bonds" (a Year-2 red word; Y1 copy says "friends of ten"). */

import type { MatchQuestion, OrderQuestion, Question } from '../../../types'
import { pick, randInt, shuffle, type Rand } from '../../../rng'
import { mcq, numWord } from '../../../generators'

const MASCOTS = ['sonic', 'tails', 'knuckles', 'amy', 'shadow'] as const

function distract(rand: Rand, answer: number, spread = 1): string[] {
  const deltas = [spread, -spread, spread * 2, -spread * 2, 1, -1]
  const set = new Set<number>()
  let i = 0
  while (set.size < 3 && i < deltas.length * 3) {
    const d = deltas[i % deltas.length]
    const cand = answer + d
    if (cand !== answer && cand >= 0 && cand <= 25) set.add(cand)
    i++
  }
  return [...set].map(String)
}

/* ========================= Counting to 20 ========================= */

/** Tap-count: count objects (3-16, always inside 20). */
export function gY1CountObjects(rand: Rand): Question {
  const n = randInt(rand, 3, 16)
  const decoyN = randInt(rand, 2, Math.min(5, n))
  const targets = ['🍎', '⭐', '🎈', '🍪', '🐝'] as const
  const decoys = ['🚗', '🌻', '🐟', '🧩', '⚽'] as const
  const targetEmoji = pick(rand, targets)
  const cells = shuffle(rand, [
    ...Array<string>(n).fill(targetEmoji),
    ...Array.from({ length: decoyN }, () => pick(rand, decoys)),
  ])
  return {
    kind: 'tap-count',
    prompt: `Tap ALL the ${targetEmoji}`,
    target: n,
    targetEmoji,
    cells,
    hint: 'Only tap the ones that match!',
  }
}

/** Fill the missing number in a count-on / count-back sequence to 20. */
export function gY1CountSequence(rand: Rand): Question {
  const back = rand() < 0.4
  const start = randInt(rand, back ? 4 : 0, 16)
  const seq = [0, 1, 2, 3].map((i) => (back ? start + 3 - i : start + i))
  const hole = randInt(rand, 0, 3)
  const ans = seq[hole]
  const shown = seq.map((v, i) => (i === hole ? '□' : String(v)))
  return mcq(
    rand,
    `Which number is missing?  ${shown.join(', ')}`,
    String(ans),
    distract(rand, ans),
    { hint: back ? 'Count back by one.' : 'Count on by one.' },
  )
}

/** One more / one less inside 20. */
export function gY1OneMoreLess(rand: Rand): Question {
  const n = randInt(rand, 1, 19)
  const more = rand() < 0.5
  const ans = more ? n + 1 : n - 1
  return mcq(
    rand,
    more ? `What is 1 more than ${n}?` : `What is 1 less than ${n}?`,
    String(ans),
    distract(rand, ans),
    { hint: 'Count on or back by one.' },
  )
}

/** Count in 2s, 5s and 10s from 0 — every answer stays inside 20. */
export function gY1CountInSteps(rand: Rand): Question {
  const step = pick(rand, [2, 5, 10])
  const shownCount = step === 2 ? 4 : step === 5 ? 4 : 2
  const seq = Array.from({ length: shownCount }, (_, i) => i * step)
  const ans = shownCount * step
  return mcq(
    rand,
    `${seq.join(', ')}, … what comes next when counting in ${step}s?`,
    String(ans),
    distract(rand, ans, step),
    { hint: `Keep adding ${step} each time.` },
  )
}

/** Odd or even, 1-20. */
export function gY1OddEven(rand: Rand): Question {
  const n = randInt(rand, 1, 20)
  const isEven = n % 2 === 0
  return mcq(
    rand,
    `Is ${n} odd or even?`,
    isEven ? 'Even' : 'Odd',
    [isEven ? 'Odd' : 'Even'],
    { hint: 'Even numbers pair up with nobody left over.' },
  )
}

/* ================ Number words, comparing & sorting ================ */

/** Numeral -> word, always 1-20. */
export function gY1NumWords(rand: Rand): Question {
  const n = randInt(rand, 1, 20)
  const word = numWord(n)
  const wrong: string[] = []
  for (const cand of distract(rand, n, rand() < 0.5 ? 1 : 5)) {
    const w = numWord(Math.min(20, Math.max(1, Number(cand))))
    if (w !== word && !wrong.includes(w)) wrong.push(w)
  }
  for (let cand = 1; wrong.length < 3 && cand <= 20; cand++) {
    const w = numWord(cand)
    if (w !== word && !wrong.includes(w)) wrong.push(w)
  }
  return mcq(rand, `Which word shows the number ${n}?`, word, wrong)
}

/** Match numerals to their words (pool inside 20). */
export function gY1MatchNumWords(rand: Rand): MatchQuestion {
  const nums = shuffle(rand, [4, 7, 10, 13, 15, 17, 20]).slice(0, 3)
  return {
    kind: 'match',
    prompt: 'Match each number to its word!',
    pairs: nums.map((n) => ({ left: String(n), right: numWord(n) })),
    hint: 'Say each word and count on.',
  }
}

/** More / fewer / equal language (no comparison signs at Year 1). */
export function gY1Compare(rand: Rand): Question {
  const kind = randInt(rand, 0, 2)
  if (kind === 2) {
    const n = randInt(rand, 0, 20)
    return mcq(
      rand,
      `${n} and ${n} — which is more?`,
      'They are equal',
      [`${n + 1} is more`, `${Math.max(0, n - 1)} is more`],
      { hint: 'Both sides have the same amount.' },
    )
  }
  const a = randInt(rand, 0, 20)
  let b = randInt(rand, 0, 20)
  while (b === a) b = randInt(rand, 0, 20)
  const wantMore = kind === 0
  const ans = wantMore ? Math.max(a, b) : Math.min(a, b)
  return mcq(
    rand,
    wantMore ? `Which number is MORE?  ${a}  or  ${b}` : `Which number is FEWER?  ${a}  or  ${b}`,
    String(ans),
    [String(ans === a ? b : a)],
    { hint: 'Count both and compare.' },
  )
}

/** Order four numbers inside 0-20, biggest first or smallest first. */
export function gY1Order(rand: Rand): Question {
  const descending = rand() < 0.35
  const pool = shuffle(rand, Array.from({ length: 21 }, (_, i) => i))
  const items = pool.slice(0, 4).sort((x, y) => (descending ? y - x : x - y))
  return {
    kind: 'order',
    prompt: descending
      ? 'Put these numbers in order, biggest first!'
      : 'Put these numbers in order, smallest first!',
    items: items.map(String),
    hint: descending ? 'Find the biggest, then count back.' : 'Find the smallest, then count on.',
  }
}

/** Missing number on a number line inside 20. */
export function gY1MissingLine(rand: Rand): Question {
  const start = randInt(rand, 0, 15)
  const hole = randInt(rand, 1, 3)
  const nums = [0, 1, 2, 3].map((i) => start + i)
  const ans = nums[hole]
  return mcq(
    rand,
    `Which number is missing from the line?  ${nums.map((v, i) => (i === hole ? '□' : v)).join(', ')}`,
    String(ans),
    distract(rand, ans),
    { hint: 'Count on from the number before it.' },
  )
}

/** Two-rule sort (sets and diagrams, Cambridge Stage 1 unit 8). */
export function gY1SortVenn(rand: Rand): Question {
  let n = randInt(rand, 1, 19)
  if (n === 10) n = randInt(rand, 1, 9)
  const even = n % 2 === 0
  const small = n < 10
  const parity = even ? 'even' : 'odd'
  const side = small ? 'less than 10' : 'more than 10'
  const otherParity = even ? 'odd' : 'even'
  const otherSide = small ? 'more than 10' : 'less than 10'
  return mcq(
    rand,
    `In our sorting diagram, where does the number ${n} go?`,
    `${parity} and ${side}`,
    [`${otherParity} and ${side}`, `${parity} and ${otherSide}`, `${otherParity} and ${otherSide}`],
    { hint: 'Check BOTH rules: odd or even, then compare with 10.' },
  )
}

/* ================= Friends of 10 & doubles ================== */

/** Match three numbers to their partner that makes 10 or 20. */
export function gY1BondMatch(rand: Rand): MatchQuestion {
  const target = pick(rand, [10, 20])
  const pool = Array.from({ length: target - 1 }, (_, i) => i + 1)
  const lefts = shuffle(rand, pool).filter((a) => a > 1 && target - a > 1).slice(0, 3)
  return {
    kind: 'match',
    prompt: `Match each number to the one that makes ${target}!`,
    pairs: lefts.map((a) => ({ left: String(a), right: String(target - a) })),
    hint: `Count on from each number up to ${target}.`,
  }
}

/** Doubles and halving doubles inside 20. */
export function gY1Doubles(rand: Rand): Question {
  const n = randInt(rand, 1, 10)
  const isDouble = rand() < 0.65
  if (isDouble) {
    return {
      kind: 'type-number',
      prompt: `What is DOUBLE ${n}?`,
      answer: n * 2,
      hint: 'Double means the same number twice.',
    }
  }
  return {
    kind: 'type-number',
    prompt: `${n * 2} is double which number?`,
    answer: n,
    hint: 'Share it into two equal groups.',
  }
}

/** Near doubles: 6 + 7 (double 6, then one more). */
export function gY1NearDouble(rand: Rand): Question {
  const n = randInt(rand, 2, 9)
  return {
    kind: 'type-number',
    prompt: `${n} + ${n + 1} = ?`,
    answer: n * 2 + 1,
    hint: `Double ${n} first, then add one more.`,
  }
}

/* ================== Adding & subtracting to 20 =================== */

/** Missing addend inside 20: 3 + □ = 15. */
export function gY1MissingAddend(rand: Rand): Question {
  const a = randInt(rand, 1, 9)
  const c = randInt(rand, a + 2, 20)
  const front = rand() < 0.5
  return {
    kind: 'type-number',
    prompt: front ? `? + ${a} = ${c}` : `${a} + ? = ${c}`,
    answer: c - a,
    hint: 'Count on from the part you know.',
  }
}

/** One-step addition story inside 20. */
export function gY1AddWord(rand: Rand): Question {
  const who = pick(rand, [...MASCOTS])
  const things = pick(rand, ['rings', 'stars', 'stickers', 'shells', 'cards'])
  const a = randInt(rand, 1, 9)
  const b = randInt(rand, 1, 20 - a)
  return {
    kind: 'type-number',
    prompt: `${who} found ${a} ${things}. A friend gave ${b} more. How many ${things} altogether?`,
    answer: a + b,
    hint: 'Altogether means ADD.',
  }
}

/** Compare two sums, each inside 20 (no need to finish both!). */
export function gY1CompareSums(rand: Rand): Question {
  const a = randInt(rand, 1, 9)
  const b = randInt(rand, 1, Math.min(9, 19 - a))
  const c = randInt(rand, 1, 9)
  let d = randInt(rand, 1, Math.min(9, 19 - c))
  if (a + b === c + d) d = d < 9 ? d + 1 : d - 1
  const left = `${a} + ${b}`
  const right = `${c} + ${d}`
  const leftWins = a + b > c + d
  const more = rand() < 0.7
  const answerStr = more ? (leftWins ? left : right) : leftWins ? right : left
  const distractor = answerStr === left ? right : left
  return mcq(
    rand,
    more ? `Which is MORE?  ${left}  or  ${right}` : `Which is FEWER?  ${left}  or  ${right}`,
    answerStr,
    [distractor],
    { hint: 'Count on from the first number on each side.' },
  )
}

/** Missing takeaway inside 20: 15 − □ = 9  /  □ − 4 = 6. */
export function gY1MissingSub(rand: Rand): Question {
  const form = randInt(rand, 0, 1)
  if (form === 0) {
    const a = randInt(rand, 4, 20)
    const c = randInt(rand, 1, a - 2)
    return { kind: 'type-number', prompt: `${a} − ? = ${c}`, answer: a - c, hint: 'Count up from the answer to the top number.' }
  }
  const b = randInt(rand, 1, 9)
  const c = randInt(rand, 1, 11)
  return { kind: 'type-number', prompt: `? − ${b} = ${c}`, answer: b + c, hint: 'Add the two parts together.' }
}

/** Difference story inside 20. */
export function gY1Difference(rand: Rand): Question {
  const who = pick(rand, [...MASCOTS])
  const other = pick(rand, [...MASCOTS].filter((m) => m !== who))
  const a = randInt(rand, 4, 20)
  const b = randInt(rand, 1, a - 1)
  return {
    kind: 'type-number',
    prompt: `${who} has ${a} stickers. ${other} has ${b}. How many MORE does ${who} have?`,
    answer: a - b,
    hint: '"How many more?" means find the difference.',
  }
}

/** Take-away story inside 20. */
export function gY1SubWord(rand: Rand): Question {
  const things = pick(rand, ['balloons', 'cookies', 'crayons', 'marbles'])
  const a = randInt(rand, 3, 20)
  const b = randInt(rand, 1, a - 1)
  return {
    kind: 'type-number',
    prompt: `There were ${a} ${things}. ${b} popped or broke. How many are left?`,
    answer: a - b,
    hint: 'Left after taking away means SUBTRACT.',
  }
}

/* =============== Sharing, groups & number patterns =============== */

/** Repeated addition of equal groups, total inside 20. */
export function gY1RepeatedAddition(rand: Rand): Question {
  const table = pick(rand, [2, 5, 10])
  const groups = table === 2 ? randInt(rand, 2, 9) : table === 5 ? randInt(rand, 2, 4) : 2
  const parts = Array.from({ length: groups }, () => table)
  return {
    kind: 'type-number',
    prompt: `${parts.join(' + ')} = ?`,
    answer: table * groups,
    hint: `${groups} equal groups of ${table}.`,
  }
}

/** Share equally, total inside 20. */
export function gY1Sharing(rand: Rand): Question {
  const plates = randInt(rand, 2, 4)
  const each = randInt(rand, 1, Math.floor(20 / plates))
  const total = plates * each
  const who = pick(rand, ['friends', 'siblings', 'twins'])
  return {
    kind: 'type-number',
    prompt: `${total} sweets shared equally between ${plates} ${who}. How many each?`,
    answer: each,
    hint: 'Deal one to each, again and again.',
  }
}

/** Extend a step / alternating number pattern, answer inside 20. */
export function gY1NumberPattern(rand: Rand): Question {
  const kind = randInt(rand, 0, 3)
  let start: number
  let step: number
  let back = false
  if (kind === 0) { start = randInt(rand, 1, 15); step = 1 }
  else if (kind === 1) { start = randInt(rand, 2, 14); step = 2 }
  else if (kind === 2) { start = pick(rand, [5, 10]); step = 5 }
  else { start = randInt(rand, 6, 20); step = -1; back = true }
  const seq = [start, start + step, start + 2 * step]
  const ans = start + 3 * step
  if (ans < 0 || ans > 20) return gY1NumberPattern(rand)
  return mcq(
    rand,
    `${seq.join(', ')}, … what comes next?`,
    String(ans),
    distract(rand, ans, Math.abs(step)),
    { hint: back ? 'Counting back each time.' : `The step is ${Math.abs(step)}.` },
  )
}

/* ==================== Halves & quarters ==================== */

/** Is the shape split into equal parts (halves and quarters)? */
export function gY1EqualParts(rand: Rand): Question {
  const kind = randInt(rand, 0, 1)
  if (kind === 0) {
    return mcq(
      rand,
      'Circle A is cut into 2 equal parts. Circle B is cut into 2 different size parts. Which circle has equal parts?',
      'Circle A',
      ['Circle B', 'Neither circle'],
      { hint: 'Equal parts are all the same size.' },
    )
  }
  return mcq(
    rand,
    'Sam cuts a sandwich into 4 EQUAL parts. What is one of those parts called?',
    'A quarter',
    ['A half', 'A third'],
    { hint: 'Four equal parts — each one is a quarter.' },
  )
}

/** Name the shaded part of a shape: halves lesson (2 slices only). */
function fractionShape(rand: Rand, quarters: boolean): Question {
  const slices = quarters ? 4 : 2
  const filled = slices === 4 ? randInt(rand, 1, 3) : 1
  const answer = quarters
    ? filled === 1 ? 'A quarter' : filled === 2 ? 'Two quarters' : 'Three quarters'
    : 'A half'
  const wrong = quarters
    ? ['A half', 'A third', 'One whole'].filter((w) => w !== answer)
    : ['A quarter', 'A third', 'One whole']
  return mcq(
    rand,
    `How much of the shape is shaded?  (${filled} of ${slices} equal parts)`,
    answer,
    wrong,
    { visual: { type: 'fraction', slices, filled }, hint: 'Count the equal parts, then the shaded ones.' },
  )
}
export const gY1HalfShape = (rand: Rand): Question => fractionShape(rand, false)
export const gY1QuarterShape = (rand: Rand): Question => fractionShape(rand, true)

/** Half of a number or a set, answer inside 20. */
export function gY1HalfNumber(rand: Rand): Question {
  const half = randInt(rand, 1, 10)
  const n = half * 2
  if (rand() < 0.5) {
    return {
      kind: 'type-number',
      prompt: `What is HALF of ${n}?`,
      answer: half,
      hint: 'Share into two equal groups.',
      visual: { type: 'emoji-group', emojis: Array.from({ length: n }, () => '⭐') },
    }
  }
  return {
    kind: 'type-number',
    prompt: `Half of ${n} stars are gold. How many are gold?`,
    answer: half,
    hint: 'Half means two equal groups.',
  }
}

/** Quarter of a number or a set, answer inside 20. */
export function gY1QuarterNumber(rand: Rand): Question {
  const q = randInt(rand, 1, 5)
  const n = q * 4
  if (rand() < 0.5) {
    return {
      kind: 'type-number',
      prompt: `What is a QUARTER of ${n}?`,
      answer: q,
      hint: 'Share into four equal groups.',
      visual: { type: 'emoji-group', emojis: Array.from({ length: n }, () => '🍬') },
    }
  }
  return {
    kind: 'type-number',
    prompt: `A quarter of ${n} balloons are red. How many are red?`,
    answer: q,
    hint: 'Four equal groups — count one group.',
  }
}

/* ===================== Measures ===================== */

const LENGTH_MCQ: { prompt: string; answer: string; wrong: string[] }[] = [
  { prompt: 'Which is LONGER?', answer: 'A road', wrong: ['A pencil', 'An eraser'] },
  { prompt: 'Which is SHORTER?', answer: 'A crayon', wrong: ['A door', 'A table'] },
  { prompt: 'Which is TALLER?', answer: 'A giraffe', wrong: ['A mouse', 'A kitten'] },
  { prompt: 'What would you use to measure your book?', answer: 'A ruler', wrong: ['A clock', 'A cup'] },
  { prompt: 'What would you use to measure a desk?', answer: 'A metre stick', wrong: ['A spoon', 'A cup'] },
  { prompt: 'Which is LONGER: a snake or a worm?', answer: 'A snake', wrong: ['A worm', 'A hair'] },
]
export function gY1LongerShorter(rand: Rand): Question {
  const f = pick(rand, LENGTH_MCQ)
  return mcq(rand, f.prompt, f.answer, shuffle(rand, f.wrong))
}

const MASS_MCQ: { prompt: string; answer: string; wrong: string[] }[] = [
  { prompt: 'Which is HEAVIER?', answer: 'A dog', wrong: ['A feather', 'A leaf'] },
  { prompt: 'Which is LIGHTER?', answer: 'A feather', wrong: ['A rock', 'A bag'] },
  { prompt: 'What tells you how heavy something is?', answer: 'Scales', wrong: ['A ruler', 'A clock'] },
  { prompt: 'Which would you use to weigh an apple?', answer: 'Scales', wrong: ['A ruler', 'A cup'] },
  { prompt: 'Which is HEAVIER: a bag of stones or a pillow?', answer: 'A bag of stones', wrong: ['A pillow', 'A cloud'] },
  { prompt: 'The balance tips down on the left. Which side is heavier?', answer: 'The left side', wrong: ['The right side', 'Neither side'] },
]
export function gY1HeavierLighter(rand: Rand): Question {
  const f = pick(rand, MASS_MCQ)
  return mcq(rand, f.prompt, f.answer, shuffle(rand, f.wrong))
}

const CAPACITY_MCQ: { prompt: string; answer: string; wrong: string[] }[] = [
  { prompt: 'Which holds MORE water?', answer: 'A bath', wrong: ['A cup', 'A spoon'] },
  { prompt: 'A jug filled to the top is…', answer: 'Full', wrong: ['Empty', 'Half full'] },
  { prompt: 'A jug with nothing inside is…', answer: 'Empty', wrong: ['Full', 'Half full'] },
  { prompt: 'A jug filled halfway is…', answer: 'Half full', wrong: ['Full', 'Empty'] },
  { prompt: 'Which holds LESS?', answer: 'A teaspoon', wrong: ['A bucket', 'A bottle'] },
  { prompt: 'You pour water halfway up the bottle. It is now…', answer: 'Half full', wrong: ['Full', 'Empty'] },
]
export function gY1FullEmpty(rand: Rand): Question {
  const f = pick(rand, CAPACITY_MCQ)
  return mcq(rand, f.prompt, f.answer, shuffle(rand, f.wrong))
}

const TOOL_MCQ: { prompt: string; answer: string; wrong: string[] }[] = [
  { prompt: 'How do you measure how TALL you are?', answer: 'Stand against a metre stick', wrong: ['Hold a clock', 'Put me on scales'] },
  { prompt: 'How do you find out which jug holds more?', answer: 'Fill both and compare', wrong: ['Weigh them', 'Count them'] },
  { prompt: 'You want to check if two ribbons are the SAME length. What do you do?', answer: 'Line them up at one end', wrong: ['Count them', 'Smell them'] },
  { prompt: 'A recipe says the bowl must be HALF full. You stop when…', answer: 'the water reaches halfway up', wrong: ['the bowl is empty', 'the water touches the top'] },
  { prompt: 'Which one goes with metres?', answer: 'The length of a bus', wrong: ['How heavy a cat is', 'How much juice fits in a cup'] },
]
export function gY1MeasureTools(rand: Rand): Question {
  const f = pick(rand, TOOL_MCQ)
  return mcq(rand, f.prompt, f.answer, shuffle(rand, f.wrong))
}

/* ===================== Money ===================== */

/** Which coin is worth the most / a named value (recognition). */
export function gY1CoinValue(rand: Rand): Question {
  const form = randInt(rand, 0, 1)
  if (form === 0) {
    const coins = shuffle(rand, ['5p', '10p', '2p']).slice(0, 3)
    const answer = [...coins].sort((a, b) => parseInt(a) - parseInt(b))[2]
    return mcq(
      rand,
      `You have these coins: ${coins.join(', ')}. Which coin is worth MOST?`,
      answer,
      coins.filter((c) => c !== answer),
      { hint: 'The biggest number in p is worth more.' },
    )
  }
  const pairs: { prompt: string; answer: string; wrong: string[] }[] = [
    { prompt: 'Which coin is worth ten pence?', answer: 'A 10p coin', wrong: ['A 5p coin', 'A 2p coin'] },
    { prompt: 'Which coin is worth five pence?', answer: 'A 5p coin', wrong: ['A 10p coin', 'A 1p coin'] },
    { prompt: 'Which coin is worth two pence?', answer: 'A 2p coin', wrong: ['A 20p coin', 'A 5p coin'] },
    { prompt: 'Which coin is worth twenty pence?', answer: 'A 20p coin', wrong: ['A 2p coin', 'A 10p coin'] },
  ]
  const f = pick(rand, pairs)
  return mcq(rand, f.prompt, f.answer, shuffle(rand, f.wrong))
}

/** Count a small pile of coins, total inside 20p. */
export function gY1CoinTotal(rand: Rand): Question {
  const piles = [[1, 2, 5], [2, 5], [10, 5], [1, 1, 2], [5, 5], [10, 10], [1, 2, 2], [2, 2, 5], [5, 5, 5], [10, 2, 5], [1, 5, 10], [1, 1, 5], [2, 10], [5, 2, 1]]
  const coins = pick(rand, piles)
  const total = coins.reduce((a, c) => a + c, 0)
  return {
    kind: 'type-number',
    prompt: `Coins: ${coins.map((c) => `${c}p`).join(' + ')}. How much altogether?`,
    answer: total,
    hint: 'Start with the biggest coin and count on.',
  }
}

/** Same value, different coins (within 20p). */
export function gY1CoinSame(rand: Rand): Question {
  const pairs: { prompt: string; answer: string; wrong: string[] }[] = [
    { prompt: 'What makes the same value as 10p?', answer: 'Two 5p coins', wrong: ['A 2p coin', 'A 1p coin'] },
    { prompt: 'What makes the same value as 5p?', answer: 'Five 1p coins', wrong: ['A 2p coin', 'Two 2p coins'] },
    { prompt: 'What makes the same value as 4p?', answer: 'Two 2p coins', wrong: ['A 5p coin', 'A 10p coin'] },
    { prompt: 'Sam has two 2p coins. That is the same as…', answer: 'Four pence altogether', wrong: ['One 5p coin', 'Ten pence'] },
  ]
  const f = pick(rand, pairs)
  return mcq(rand, f.prompt, f.answer, shuffle(rand, f.wrong))
}

/* ===================== Time ===================== */

/** Read a clock to the hour and half past the hour only. */
export function gY1Clock(rand: Rand): Question {
  const hour = randInt(rand, 1, 12)
  const half = rand() < 0.5
  const label = half ? `half past ${hour}` : `${hour} o'clock`
  const alt = (h: number) => (rand() < 0.5 ? `${h} o'clock` : `half past ${h}`)
  const wrongs = new Set<string>()
  while (wrongs.size < 3) {
    const h = randInt(rand, 1, 12)
    const w = alt(h)
    if (w !== label) wrongs.add(w)
  }
  return mcq(rand, 'What time does the clock show?', label, [...wrongs], {
    visual: { type: 'clock', hour, minute: half ? 30 : 0 },
    hint: half ? 'The minute hand points straight down.' : 'The minute hand points straight up.',
  })
}

/** Order the four seasons. */
export function gY1Seasons(rand: Rand): OrderQuestion {
  const seasons = ['Spring', 'Summer', 'Autumn', 'Winter']
  return {
    kind: 'order',
    prompt: 'Put the seasons in order, starting with spring!',
    items: seasons,
    hint: 'Spring, then summer, then autumn, then winter.',
  }
}

/** Yesterday / tomorrow / today inside the days of the week. */
export function gY1DayWhen(rand: Rand): Question {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const i = randInt(rand, 0, 6)
  const ask = pick(rand, ['yesterday', 'tomorrow'])
  const ans = days[ask === 'yesterday' ? (i + 6) % 7 : (i + 1) % 7]
  return mcq(
    rand,
    `Today is ${days[i]}. What day is ${ask}?`,
    ans,
    shuffle(rand, days.filter((d) => d !== ans)).slice(0, 3),
    { hint: ask === 'yesterday' ? 'The day before today.' : 'The day after today.' },
  )
}

/* ================ Shapes, position & turns ================= */

const SHAPE_2D: { prompt: string; answer: string; wrong: string[] }[] = [
  { prompt: 'How many sides does a triangle have?', answer: '3', wrong: ['4', '5', '6'] },
  { prompt: 'How many sides does a rectangle have?', answer: '4', wrong: ['3', '5', '6'] },
  { prompt: 'Which shape has 3 corners?', answer: 'A triangle', wrong: ['A square', 'A circle'] },
  { prompt: 'Which shape is round with no corners?', answer: 'A circle', wrong: ['A square', 'A triangle'] },
  { prompt: 'How many corners does a square have?', answer: '4', wrong: ['3', '5', '0'] },
  { prompt: 'Which shape has 4 sides and 4 corners?', answer: 'A square', wrong: ['A circle', 'A triangle'] },
  { prompt: 'A slice of pizza is shaped most like a…', answer: 'Triangle', wrong: ['Circle', 'Square'] },
  { prompt: 'Which shape is a ring shaped like?', answer: 'A circle', wrong: ['A square', 'A triangle'] },
]
export function gY1Shape2D(rand: Rand): Question {
  const f = pick(rand, SHAPE_2D)
  return mcq(rand, f.prompt, f.answer, shuffle(rand, f.wrong))
}

const SHAPE_3D: { prompt: string; answer: string; wrong: string[] }[] = [
  { prompt: 'A ball is shaped most like which solid shape?', answer: 'A sphere', wrong: ['A cube', 'A cone'] },
  { prompt: 'A dice is shaped most like which solid shape?', answer: 'A cube', wrong: ['A sphere', 'A cone'] },
  { prompt: 'A tissue box is shaped most like which solid shape?', answer: 'A cuboid', wrong: ['A sphere', 'A cone'] },
  { prompt: 'A party hat is shaped most like which solid shape?', answer: 'A cone', wrong: ['A cube', 'A cuboid'] },
  { prompt: 'A tin of beans is shaped most like which solid shape?', answer: 'A cylinder', wrong: ['A cube', 'A sphere'] },
  { prompt: 'Which solid shape rolls and never falls over?', answer: 'A sphere', wrong: ['A cube', 'A cuboid'] },
  { prompt: 'A pyramid has a pointy top. Which shape is it?', answer: 'A pyramid', wrong: ['A cube', 'A sphere'] },
  { prompt: 'You can stack a box of sugar like which shape?', answer: 'A cube', wrong: ['A sphere', 'A cone'] },
]
export function gY1Shape3D(rand: Rand): Question {
  const f = pick(rand, SHAPE_3D)
  return mcq(rand, f.prompt, f.answer, shuffle(rand, f.wrong))
}

/** Whole, half, quarter and three quarter turns. */
export function gY1Turns(rand: Rand): Question {
  const facings = ['⬆️', '➡️', '⬇️', '⬅️']
  const start = randInt(rand, 0, 3)
  const kind = pick(rand, ['quarter right', 'quarter left', 'half', 'whole', 'three quarter'])
  const steps = kind === 'quarter right' ? 1 : kind === 'quarter left' ? -1 : kind === 'half' ? 2 : kind === 'whole' ? 0 : 3
  const ansIdx = ((start + steps) % 4 + 4) % 4
  const ans = facings[ansIdx]
  const wording =
    kind === 'quarter right' ? 'a quarter turn to the right'
    : kind === 'quarter left' ? 'a quarter turn to the left'
    : kind === 'half' ? 'a half turn'
    : kind === 'whole' ? 'a whole turn'
    : 'a three quarter turn'
  return mcq(
    rand,
    `You face ${facings[start]}. You make ${wording}. Which way do you face now?`,
    ans,
    facings.filter((f) => f !== ans),
    { hint: kind === 'whole' ? 'A whole turn brings you back.' : 'Picture turning, then stop.' },
  )
}
