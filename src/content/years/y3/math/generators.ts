/** PLAN 169c — Year-3 maths generators. Ranges follow the DfE national
 *  curriculum Year-3 programme of study (see curriculum.ts for provenance):
 *  numbers to 1,000 (counting in multiples of 4, 8, 50 and 100, place
 *  value, partitioning, comparing, ordering and number words), mental and
 *  columnar addition and subtraction with estimating and checking by the
 *  inverse operation, the 3, 4 and 8 times tables with short multiplication
 *  and short division, tenths, fractions of sets, equivalent fractions and
 *  adding/subtracting fractions with the same denominator, money to £1 with
 *  change, analogue time to the nearest minute with Roman numerals I-XII,
 *  the 12 and 24 hour clocks, durations and the calendar including leap
 *  years, measures in m/cm/mm, kg/g and l/ml with perimeter, 2-D and 3-D
 *  shape properties with right, acute and obtuse angles and parallel and
 *  perpendicular lines, and statistics (pictograms, bar charts, tables and
 *  scales marked in 2s, 5s and 10s).
 *
 *  Vocabulary stays inside the Year-3 syllabus
 *  (src/content/syllabus/y3/math.ts): number words are written with SPACES
 *  ("four hundred and thirty two", never hyphenated — the matcher keeps
 *  hyphens inside a single token, so "thirty-two" would never match the
 *  "thirty" and "two" entries), bank-tier choices stay inside the list, and
 *  digit-only answers/choices ("£2.30", "3/10", "15:00", "VIII") are safe
 *  because the tokenizer never matches pure digits and the Roman numeral
 *  letters are in the DfE addendum. */

import type { MatchQuestion, OrderQuestion, Question } from '../../../types'
import { pick, randInt, shuffle, type Rand } from '../../../rng'
import { mcq } from '../../../generators'

const MASCOTS = ['sonic', 'tails', 'knuckles', 'amy', 'shadow'] as const

/** Numeric distractors around an answer (clamped to 0..max). */
function distract(rand: Rand, answer: number, spread = 1, max = 1000): string[] {
  const deltas = [spread, -spread, spread * 2, -spread * 2, 1, -1]
  const set = new Set<number>()
  let i = 0
  while (set.size < 3 && i < deltas.length * 4) {
    const d = deltas[i % deltas.length]
    const cand = answer + d
    if (cand !== answer && cand >= 0 && cand <= max) set.add(cand)
    i++
  }
  for (let d = 1; set.size < 3 && d <= 60; d++) {
    for (const s of [d, -d]) {
      const cand = answer + s
      if (cand !== answer && cand >= 0 && cand <= max) set.add(cand)
      if (set.size === 3) break
    }
  }
  return [...set].map(String)
}

const SMALL_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
const TENS_WORDS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

/** Numeral to words for 0-999 (and 1,000), SPACED so every token matches. */
function words3(n: number): string {
  if (n === 1000) return 'one thousand'
  if (n < 20) return SMALL_WORDS[n]
  if (n < 100) {
    const t = TENS_WORDS[Math.floor(n / 10)]
    return n % 10 === 0 ? t : `${t} ${SMALL_WORDS[n % 10]}`
  }
  const h = Math.floor(n / 100)
  const rest = n % 100
  return rest === 0 ? `${SMALL_WORDS[h]} hundred` : `${SMALL_WORDS[h]} hundred and ${words3(rest)}`
}

/* ===================== Counting in multiples ===================== */

function countIn(rand: Rand, steps: number[]): Question {
  const step = pick(rand, steps)
  const start = step * randInt(rand, 0, step >= 50 ? 4 : 8)
  const terms = [start, start + step, start + 2 * step, start + 3 * step]
  const form = randInt(rand, 0, 1)
  if (form === 0) {
    return mcq(
      rand,
      `${terms.slice(0, 3).join(', ')}, … what comes next when counting in ${step}s?`,
      String(terms[3]),
      distract(rand, terms[3], step),
      { hint: `Add ${step} each time.` },
    )
  }
  const hole = randInt(rand, 0, 3)
  const shown = terms.map((v, i) => (i === hole ? '□' : String(v)))
  return mcq(
    rand,
    `Which number is missing?  ${shown.join(', ')}`,
    String(terms[hole]),
    distract(rand, terms[hole], step),
    { hint: `The step between each number is ${step}.` },
  )
}

/** Count in 4s and 8s. */
export function gY3CountIn(rand: Rand): Question {
  return countIn(rand, [4, 8])
}

/** Count in 50s and 100s. */
export function gY3CountInLarge(rand: Rand): Question {
  return countIn(rand, [50, 100])
}

/** Which rule makes the pattern? */
export function gY3CountInRule(rand: Rand): Question {
  const step = pick(rand, [4, 8, 50, 100])
  const start = step * randInt(rand, 0, 6)
  const seq = [start, start + step, start + 2 * step, start + 3 * step]
  const wrongs = shuffle(rand, [4, 8, 50, 100].filter((s) => s !== step))
    .slice(0, 2)
    .map((s) => `Counting in ${s}s`)
  return mcq(rand, `What is the rule?  ${seq.join(', ')}`, `Counting in ${step}s`, wrongs, {
    hint: `The gap between each number is ${step}.`,
  })
}

/** Missing term in a count-in sequence. */
export function gY3SequenceMissing(rand: Rand): Question {
  const step = pick(rand, [4, 8, 50, 100])
  const start = step * randInt(rand, 1, 8)
  const terms = Array.from({ length: 5 }, (_, i) => start + i * step)
  const hole = randInt(rand, 1, 4)
  const shown = terms.map((v, i) => (i === hole ? '□' : String(v)))
  return mcq(
    rand,
    `Which number is missing?  ${shown.join(', ')}`,
    String(terms[hole]),
    distract(rand, terms[hole], step),
    { hint: `Keep adding ${step}.` },
  )
}

/** 10 or 100 more / less than a number to 1,000. */
export function gY3MoreLess(rand: Rand): Question {
  const step = pick(rand, [10, 100])
  const more = rand() < 0.5
  const n = step === 10 ? randInt(rand, 120, 880) : randInt(rand, 250, 750)
  return {
    kind: 'type-number',
    prompt: more ? `What is ${step} MORE than ${n}?` : `What is ${step} LESS than ${n}?`,
    answer: more ? n + step : n - step,
    hint: `Only the ${step === 10 ? 'tens' : 'hundreds'} digit changes.`,
  }
}

/* ===================== Place value to 1,000 ===================== */

/** What is a named digit worth in a 3-digit number? */
export function gY3PlaceValue(rand: Rand): Question {
  const n = randInt(rand, 100, 999)
  const digits = String(n).split('')
  const pos = randInt(rand, 0, 2)
  const d = Number(digits[pos])
  const value = d * (pos === 0 ? 100 : pos === 1 ? 10 : 1)
  if (value === 0) return gY3PlaceValue(rand)
  const place = pos === 0 ? 'hundreds' : pos === 1 ? 'tens' : 'ones'
  return mcq(rand, `In the number ${n}, what is the ${place} digit worth?`, String(value), distract(rand, value, 10, 900), {
    hint: `The ${place} digit counts in ${place}.`,
  })
}

/** Partition a 3-digit number into hundreds, tens and ones. */
export function gY3Partition(rand: Rand): Question {
  const h = randInt(rand, 1, 9) * 100
  const t = randInt(rand, 1, 9) * 10
  const o = randInt(rand, 0, 9)
  const n = h + t + o
  const parts = `${h} + ${t} + ${o}`
  const wrongs = [
    `${h} + ${t} + ${((o + 1) % 10)}`,
    `${h + 100} + ${t} + ${o}`,
    `${h} + ${t + 10} + ${o}`,
  ].filter((w) => w !== parts)
  return mcq(rand, `Which shows ${n} partitioned correctly?`, parts, wrongs, {
    hint: 'Split it into hundreds, tens and ones.',
  })
}

/** Compare two 3-digit numbers (more / less). */
export function gY3ComparePV(rand: Rand): Question {
  const a = randInt(rand, 100, 999)
  let b = randInt(rand, 100, 999)
  while (b === a) b = randInt(rand, 100, 999)
  const wantMore = rand() < 0.5
  const ans = String(wantMore ? Math.max(a, b) : Math.min(a, b))
  return mcq(
    rand,
    wantMore ? `Which number is MORE?  ${a}  or  ${b}` : `Which number is LESS?  ${a}  or  ${b}`,
    ans,
    [ans === String(a) ? String(b) : String(a)],
    { hint: 'Compare the hundreds digit first.' },
  )
}

/** Order four numbers to 1,000, biggest or smallest first. */
export function gY3OrderNums(rand: Rand): OrderQuestion {
  const descending = rand() < 0.35
  const nums = new Set<number>()
  while (nums.size < 4) nums.add(randInt(rand, 100, 999))
  const items = [...nums].sort((x, y) => (descending ? y - x : x - y)).map(String)
  return {
    kind: 'order',
    prompt: descending
      ? 'Put these numbers in order, biggest first!'
      : 'Put these numbers in order, smallest first!',
    items,
    hint: descending ? 'Start with the biggest hundreds.' : 'Start with the smallest hundreds.',
  }
}

/** Numeral to word and word to numeral, to 1,000. */
export function gY3NumWords(rand: Rand): Question {
  const n = randInt(rand, 101, 999)
  const form = randInt(rand, 0, 1)
  if (form === 0) {
    const wrong = new Set<string>()
    while (wrong.size < 3) {
      const w = words3(randInt(rand, 101, 999))
      if (w !== words3(n)) wrong.add(w)
    }
    return mcq(rand, `Which word shows the number ${n}?`, words3(n), [...wrong], {
      hint: 'Read the hundreds, then the tens, then the ones.',
    })
  }
  const wrong = new Set<string>()
  while (wrong.size < 3) {
    const c = randInt(rand, 101, 999)
    if (c !== n) wrong.add(String(c))
  }
  return mcq(rand, `Which number is "${words3(n)}"?`, String(n), [...wrong], {
    hint: 'Count the hundreds first.',
  })
}

/** Match three numerals to their words. */
export function gY3MatchNumWords(rand: Rand): MatchQuestion {
  const chosen = new Set<number>()
  while (chosen.size < 3) chosen.add(randInt(rand, 101, 999))
  return {
    kind: 'match',
    prompt: 'Match each number to its word!',
    pairs: [...chosen].map((n) => ({ left: String(n), right: words3(n) })),
    hint: 'Say each word, then count the hundreds.',
  }
}

/* =================== Mental add & subtract =================== */

/** Add or subtract 1, 10 or 100 mentally, always inside 100-999. */
export function gY3MentalStep(rand: Rand): Question {
  const step = pick(rand, [1, 10, 100])
  const add = rand() < 0.5
  const base = step === 100 ? randInt(rand, 300, 799) : randInt(rand, 120, 880)
  return {
    kind: 'type-number',
    prompt: add ? `${base} + ${step} = ?` : `${base} − ${step} = ?`,
    answer: add ? base + step : base - step,
    hint: `Only the ${step === 1 ? 'ones' : step === 10 ? 'tens' : 'hundreds'} digit changes.`,
  }
}

/** Missing number in an add / subtract fact, to 1,000. */
export function gY3MissingFact(rand: Rand): Question {
  const a = randInt(rand, 120, 700)
  const b = randInt(rand, 50, 999 - a)
  const sum = a + b
  const form = randInt(rand, 0, 2)
  if (form === 0) return { kind: 'type-number', prompt: `${a} + ? = ${sum}`, answer: b, hint: 'Count on from the part you know.' }
  if (form === 1) return { kind: 'type-number', prompt: `? + ${b} = ${sum}`, answer: a, hint: 'The missing part makes the total.' }
  return { kind: 'type-number', prompt: `${sum} − ${a} = ?`, answer: b, hint: 'Take the part away from the total.' }
}

/** Number bonds to 1,000 (match each number to its partner). */
export function gY3Bonds1000(rand: Rand): MatchQuestion {
  const lefts = shuffle(rand, [250, 325, 460, 175, 540, 615, 125, 375, 280, 410, 190, 470]).slice(0, 3)
  return {
    kind: 'match',
    prompt: 'Match each number to the one that makes 1,000!',
    pairs: lefts.map((a) => ({ left: String(a), right: String(1000 - a) })),
    hint: 'The pair must total 1,000.',
  }
}

/** One-step addition story, totals to 1,000. */
export function gY3AddStory(rand: Rand): Question {
  const who = pick(rand, [...MASCOTS])
  const things = pick(rand, ['stickers', 'cards', 'shells', 'badges', 'stars'])
  const a = randInt(rand, 120, 600)
  const b = randInt(rand, 50, 999 - a)
  return {
    kind: 'type-number',
    prompt: `${who} had ${a} ${things}. A friend gave ${b} more. How many ${things} altogether?`,
    answer: a + b,
    hint: 'Altogether means ADD.',
  }
}

/* ================ Columnar addition & subtraction ================ */

/** Columnar addition: totals stay inside 1,000. */
export function gY3ColumnAdd(rand: Rand): Question {
  const a = randInt(rand, 115, 780)
  const b = randInt(rand, 25, 999 - a)
  return {
    kind: 'type-number',
    prompt: `${a} + ${b} = ?`,
    answer: a + b,
    hint: 'Add the ones, then the tens, then the hundreds.',
  }
}

/** Columnar subtraction: never below 0. */
export function gY3ColumnSub(rand: Rand): Question {
  const a = randInt(rand, 300, 999)
  const b = randInt(rand, 40, a - 50)
  return {
    kind: 'type-number',
    prompt: `${a} − ${b} = ?`,
    answer: a - b,
    hint: 'Subtract the ones, then the tens, then the hundreds.',
  }
}

/** Estimate a sum by rounding each number to 10 or 100. */
export function gY3Estimate(rand: Rand): Question {
  const round = pick(rand, [10, 100])
  const a = randInt(rand, round === 10 ? 45 : 160, round === 10 ? 96 : 940)
  const b = randInt(rand, round === 10 ? 12 : 35, round === 10 ? 78 : 340)
  const est = Math.round(a / round) * round + Math.round(b / round) * round
  return mcq(rand, `Estimate: ${a} + ${b} = ?  (round each number to the nearest ${round})`, String(est), distract(rand, est, round, 2000), {
    hint: `Round to the nearest ${round} first, then add.`,
  })
}

/** Check a sum with the inverse (subtraction) sentence. */
export function gY3Inverse(rand: Rand): Question {
  const a = randInt(rand, 100, 600)
  const b = randInt(rand, 50, 399)
  const sum = a + b
  const correct = `${sum} − ${b} = ${a}`
  const wrongs = [`${sum} − ${b} = ${a + 10}`, `${a} − ${b} = ${sum}`, `${sum} + ${b} = ${a}`]
  return mcq(rand, `Which number sentence UNDOES ${a} + ${b} = ${sum}?`, correct, wrongs, {
    hint: 'Undo addition by taking the second part away.',
  })
}

/** Two-step story: add, then take away. */
export function gY3TwoStep(rand: Rand): Question {
  const who = pick(rand, [...MASCOTS])
  const things = pick(rand, ['marbles', 'coupons', 'pebbles', 'tokens'])
  const a = randInt(rand, 150, 500)
  const b = randInt(rand, 40, 200)
  const c = randInt(rand, 30, Math.min(250, a + b - 20))
  if (rand() < 0.5) {
    return {
      kind: 'type-number',
      prompt: `${who} collected ${a} ${things}, then found ${b} more, then gave ${c} away. How many ${things} now?`,
      answer: a + b - c,
      hint: 'Add first, then take away.',
    }
  }
  return {
    kind: 'type-number',
    prompt: `${who} had ${a} ${things} and bought ${b} more. Then ${c} were lost. How many are left?`,
    answer: a + b - c,
    hint: 'Find the new total first.',
  }
}

/* ================ Times tables 3, 4 and 8 ================ */

/** Multiplication facts for the 3, 4 and 8 times tables (to 12). */
export function gY3Table(rand: Rand): Question {
  const t = pick(rand, [3, 4, 8])
  const m = randInt(rand, 2, 12)
  const swapped = rand() < 0.5
  return {
    kind: 'type-number',
    prompt: swapped ? `${m} × ${t} = ?` : `${t} × ${m} = ?`,
    answer: t * m,
    hint: `Count in ${t}s.`,
  }
}

/** Division facts for the 3, 4 and 8 times tables. */
export function gY3DivFact(rand: Rand): Question {
  const t = pick(rand, [3, 4, 8])
  const m = randInt(rand, 2, 12)
  const prod = t * m
  if (rand() < 0.5) {
    return { kind: 'type-number', prompt: `${prod} ÷ ${t} = ?`, answer: m, hint: `How many ${t}s make ${prod}?` }
  }
  return { kind: 'type-number', prompt: `${prod} ÷ ${m} = ?`, answer: t, hint: `Think ${t} × ${m} = ${prod}.` }
}

/** Commutativity: match each multiplication to itself turned around. */
export function gY3Commutative(rand: Rand): MatchQuestion {
  const chosen: { a: number; b: number }[] = []
  while (chosen.length < 3) {
    const a = pick(rand, [3, 4, 8])
    const b = randInt(rand, 2, 12)
    if (!chosen.some((c) => c.a === a && c.b === b)) chosen.push({ a, b })
  }
  return {
    kind: 'match',
    prompt: 'Match each sum to the SAME sum with its numbers turned around!',
    pairs: chosen.map(({ a, b }) => ({ left: `${a} × ${b}`, right: `${b} × ${a}` })),
    hint: 'Turn the numbers around — the answer stays the same.',
  }
}

/** Repeated addition / arrays building a multiplication. */
export function gY3ArrayFact(rand: Rand): Question {
  const t = pick(rand, [3, 4, 8])
  const m = randInt(rand, 2, 9)
  return {
    kind: 'type-number',
    prompt: `${Array.from({ length: m }, () => t).join(' + ')} = ?`,
    answer: t * m,
    hint: `${m} equal groups of ${t}.`,
  }
}

/** Missing number in a table fact: 3 × ? = 24. */
export function gY3TableMissing(rand: Rand): Question {
  const t = pick(rand, [3, 4, 8])
  const m = randInt(rand, 2, 12)
  const prod = t * m
  if (rand() < 0.5) {
    return { kind: 'type-number', prompt: `${t} × ? = ${prod}`, answer: m, hint: `How many ${t}s make ${prod}?` }
  }
  return { kind: 'type-number', prompt: `? × ${t} = ${prod}`, answer: m, hint: `Divide ${prod} by ${t}.` }
}

/* ================ Multiply & divide ================ */

/** Short multiplication: up to a 3-digit number × a 1-digit number. */
export function gY3ShortMult(rand: Rand): Question {
  const b = pick(rand, [3, 4, 5, 6, 8])
  const a = randInt(rand, 12, Math.floor(999 / b))
  return {
    kind: 'type-number',
    prompt: `${a} × ${b} = ?`,
    answer: a * b,
    hint: 'Multiply the ones, then the tens, then the hundreds.',
  }
}

/** Short division: exact shares of numbers up to 999. */
export function gY3ShortDiv(rand: Rand): Question {
  const b = pick(rand, [4, 5, 6, 8])
  const q = randInt(rand, 4, Math.floor(999 / b))
  const prod = b * q
  if (rand() < 0.5) {
    return { kind: 'type-number', prompt: `${prod} ÷ ${b} = ?`, answer: q, hint: `Think ${b} × ? = ${prod}.` }
  }
  return {
    kind: 'type-number',
    prompt: `Share ${prod} equally into ${b} groups. How many in each group?`,
    answer: q,
    hint: 'Use a times table you know.',
  }
}

/** Scaling: a number of objects × a factor (times as big). */
export function gY3Scaling(rand: Rand): Question {
  if (rand() < 0.5) {
    const t = pick(rand, [3, 4, 8])
    const m = randInt(rand, 2, 9)
    return {
      kind: 'type-number',
      prompt: `${t} × ${m} = ${t * m}. So ${t * 10} × ${m} = ?`,
      answer: t * m * 10,
      hint: 'Ten times as many is ten times as big.',
    }
  }
  const a = randInt(rand, 2, 9)
  const k = pick(rand, [2, 4, 5, 10])
  const noun = pick(rand, ['ribbon', 'rope', 'strip of paper', 'stick'])
  return {
    kind: 'type-number',
    prompt: `A ${noun} is ${a} cm long. Another is ${k} times as long. How long is the other one?`,
    answer: a * k,
    hint: `${k} × ${a} = ?`,
  }
}

/** Correspondence: groups × items in each group. */
export function gY3Correspondence(rand: Rand): Question {
  const items = [
    { each: 'wheels', per: 4 },
    { each: 'legs', per: 8 },
    { each: 'petals', per: 5 },
    { each: 'eggs', per: 6 },
    { each: 'cards', per: 4 },
    { each: 'apples', per: 3 },
  ]
  const it = pick(rand, items)
  const count = randInt(rand, 3, 12)
  return {
    kind: 'type-number',
    prompt: `${count} groups of ${it.per} ${it.each}. How many ${it.each} altogether?`,
    answer: count * it.per,
    hint: `${count} × ${it.per} = ?`,
  }
}

/* ===================== Fractions ===================== */

/** Tenths: name, count and shade a shape split into ten equal parts. */
export function gY3Tenths(rand: Rand): Question {
  const slices = 10
  const filled = randInt(rand, 1, 9)
  const form = randInt(rand, 0, 2)
  if (form === 0) {
    const wrongs = shuffle(
      rand,
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((x) => x !== filled && x !== 0),
    )
      .slice(0, 3)
      .map((x) => `${x}/10`)
    return mcq(rand, 'Which fraction of the shape is shaded?', `${filled}/10`, wrongs, {
      visual: { type: 'fraction', slices, filled },
      hint: 'Ten equal parts — count the shaded ones.',
    })
  }
  if (form === 1) {
    return {
      kind: 'type-number',
      prompt: 'How many tenths are shaded?',
      answer: filled,
      visual: { type: 'fraction', slices, filled },
      hint: 'Count the shaded parts.',
    }
  }
  return {
    kind: 'type-number',
    prompt: 'How many equal parts does the shape have?',
    answer: slices,
    visual: { type: 'fraction', slices, filled },
    hint: 'Count ALL the parts.',
  }
}

/** Fractions of a set (unit and non-unit, denominators 2, 4, 5, 10). */
export function gY3FractionOf(rand: Rand): Question {
  const f = pick(rand, [
    { n: 1, d: 2 }, { n: 1, d: 4 }, { n: 3, d: 4 }, { n: 1, d: 5 },
    { n: 2, d: 5 }, { n: 4, d: 5 }, { n: 1, d: 10 }, { n: 3, d: 10 }, { n: 7, d: 10 },
  ])
  const k = randInt(rand, 3, 30)
  const total = f.d * k
  return {
    kind: 'type-number',
    prompt: `What is ${f.n}/${f.d} of ${total}?`,
    answer: f.n * k,
    hint: `Share ${total} into ${f.d} equal groups.`,
  }
}

/** Equivalent fractions shown with a diagram. */
export function gY3Equivalent(rand: Rand): Question {
  const pairs = [
    { s: 2, f: 1, eq: '1/2', wrong: ['1/3', '1/4', '2/3'] },
    { s: 4, f: 2, eq: '1/2', wrong: ['1/3', '3/4', '1/4'] },
    { s: 10, f: 5, eq: '1/2', wrong: ['1/5', '2/5', '1/10'] },
    { s: 4, f: 1, eq: '1/4', wrong: ['1/2', '3/4', '1/5'] },
    { s: 5, f: 1, eq: '1/5', wrong: ['1/2', '2/5', '4/5'] },
    { s: 10, f: 2, eq: '1/5', wrong: ['1/2', '1/10', '2/5'] },
    { s: 4, f: 3, eq: '3/4', wrong: ['1/4', '1/2', '2/3'] },
    { s: 5, f: 2, eq: '2/5', wrong: ['1/5', '4/5', '1/2'] },
    { s: 10, f: 4, eq: '2/5', wrong: ['1/5', '4/5', '1/10'] },
    { s: 10, f: 7, eq: '7/10', wrong: ['3/10', '1/2', '4/5'] },
    { s: 5, f: 4, eq: '4/5', wrong: ['1/5', '2/5', '1/2'] },
    { s: 10, f: 3, eq: '3/10', wrong: ['7/10', '1/2', '3/5'] },
    { s: 10, f: 6, eq: '3/5', wrong: ['2/5', '1/5', '7/10'] },
    { s: 4, f: 2, eq: '2/4', wrong: ['1/3', '3/4', '1/4'] },
  ]
  const p = pick(rand, pairs)
  return mcq(rand, 'Which fraction is the SAME as the shaded part?', p.eq, p.wrong, {
    visual: { type: 'fraction', slices: p.s, filled: p.f },
    hint: 'Shaded parts over all the equal parts.',
  })
}

/** Add fractions with the same denominator (mcq answers like "7/10"). */
export function gY3AddFrac(rand: Rand): Question {
  const d = pick(rand, [4, 5, 10])
  const a = randInt(rand, 1, d - 1)
  const b = randInt(rand, 1, d - a)
  const answer = `${a + b}/${d}`
  const wrong = new Set<number>()
  while (wrong.size < 3) {
    const x = randInt(rand, 1, d)
    if (x !== a + b) wrong.add(x)
  }
  return mcq(rand, `${a}/${d} + ${b}/${d} = ?`, answer, [...wrong].map((x) => `${x}/${d}`), {
    hint: 'Add the top numbers — the bottom number stays.',
  })
}

/** Subtract fractions with the same denominator. */
export function gY3SubFrac(rand: Rand): Question {
  const d = pick(rand, [4, 5, 10])
  const a = randInt(rand, 2, d)
  const b = randInt(rand, 1, a - 1)
  const answer = `${a - b}/${d}`
  const wrong = new Set<number>()
  while (wrong.size < 3) {
    const x = randInt(rand, 1, d)
    if (x !== a - b) wrong.add(x)
  }
  return mcq(rand, `${a}/${d} − ${b}/${d} = ?`, answer, [...wrong].map((x) => `${x}/${d}`), {
    hint: 'Take away the top numbers — the bottom number stays.',
  })
}

/** Which fraction is more? */
export function gY3CompareFrac(rand: Rand): Question {
  const pairs: [string, string][] = [
    ['1/2', '3/10'], ['1/4', '1/5'], ['2/5', '1/2'], ['3/4', '7/10'],
    ['1/5', '1/10'], ['2/4', '3/5'], ['4/5', '7/10'], ['1/4', '3/10'],
    ['1/2', '4/10'], ['3/5', '3/10'], ['2/5', '1/10'], ['4/5', '3/10'],
  ]
  const [x, y] = pick(rand, pairs)
  const more = rand() < 0.5
  const answer = more ? x : y
  const other = more ? y : x
  return mcq(
    rand,
    more ? `Which is MORE?  ${x}  or  ${y}` : `Which is LESS?  ${x}  or  ${y}`,
    answer,
    [other],
    { hint: 'Draw both and compare the shaded parts.' },
  )
}

/* ===================== Money ===================== */

/** Add two prices (answers in pence). */
export function gY3MoneyAdd(rand: Rand): Question {
  const a = randInt(rand, 4, 90) * 5
  const b = randInt(rand, 3, 70) * 5
  if (rand() < 0.5) {
    return { kind: 'type-number', prompt: `${a}p + ${b}p = ?`, answer: a + b, hint: 'Add the pence first.' }
  }
  const thing = pick(rand, ['notebook', 'ruler', 'eraser', 'sticker sheet'])
  const other = pick(rand, ['pen', 'pencil', 'sharper', 'card'])
  return {
    kind: 'type-number',
    prompt: `A ${thing} costs ${a}p and a ${other} costs ${b}p. How many pence for both?`,
    answer: a + b,
    hint: 'Both prices in pence — add them.',
  }
}

/** Change from £1, £2 or £5 (answers in pence). */
export function gY3MoneyChange(rand: Rand): Question {
  const total = pick(rand, [100, 200, 500])
  const cost = randInt(rand, 5, Math.floor((total - 5) / 5)) * 5
  return {
    kind: 'type-number',
    prompt: `You pay ${total}p for something that costs ${cost}p. How much change in pence?`,
    answer: total - cost,
    hint: `Take the price away from ${total}p.`,
  }
}

/** How many coins make an amount? */
export function gY3MoneyCoins(rand: Rand): Question {
  const coin = pick(rand, [2, 5, 10, 20, 50])
  if (rand() < 0.5) {
    const count = randInt(rand, 2, 10)
    return {
      kind: 'type-number',
      prompt: `How many ${coin}p coins make ${coin * count}p?`,
      answer: count,
      hint: `Count in ${coin}s.`,
    }
  }
  const pounds = pick(rand, [1, 2, 5])
  return {
    kind: 'type-number',
    prompt: `How many ${coin}p coins make £${pounds}?`,
    answer: (100 * pounds) / coin,
    hint: `There are ${100 / coin} lots of ${coin}p in a pound.`,
  }
}

/** Money word problems (one and two step). */
export function gY3MoneyStory(rand: Rand): Question {
  const form = randInt(rand, 0, 1)
  if (form === 0) {
    const price = randInt(rand, 3, 40) * 25
    const qty = randInt(rand, 2, 4)
    return {
      kind: 'type-number',
      prompt: `A keyring costs ${price}p. How many pence for ${qty} keyrings?`,
      answer: price * qty,
      hint: `${qty} × ${price} = ?`,
    }
  }
  const item = pick(rand, ['keyring', 'comic', 'badge', 'postcard'])
  const price = randInt(rand, 2, 15)
  const paid = price + pick(rand, [1, 2, 3, 5])
  return {
    kind: 'type-number',
    prompt: `A ${item} costs £${price}. You pay £${paid}. How many pence change?`,
    answer: (paid - price) * 100,
    hint: 'Work out the change in pounds, then change to pence.',
  }
}

/* ===================== Time ===================== */

/** Read an analogue clock to any minute. */
export function gY3ClockMinutes(rand: Rand): Question {
  const hour = randInt(rand, 1, 12)
  const minute = randInt(rand, 0, 59)
  const label = `${hour}:${String(minute).padStart(2, '0')}`
  const wrong = new Set<string>()
  while (wrong.size < 3) {
    const h = randInt(rand, 1, 12)
    const m = rand() < 0.5 ? randInt(rand, 0, 59) : minute
    const w = `${h}:${String(m).padStart(2, '0')}`
    if (w !== label) wrong.add(w)
  }
  return mcq(rand, 'What time does the clock show?', label, [...wrong], {
    visual: { type: 'clock', hour, minute },
    hint: 'Read the hour hand first, then count the minutes.',
  })
}

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

/** Roman numerals I-XII on a clock face. */
export function gY3RomanClock(rand: Rand): Question {
  const i = randInt(rand, 0, 11)
  if (rand() < 0.5) {
    const wrong = new Set<string>()
    while (wrong.size < 3) {
      const j = randInt(rand, 0, 11)
      if (j !== i) wrong.add(String(j + 1))
    }
    return mcq(rand, `The hour hand points at ${ROMAN[i]}. What hour is that?`, String(i + 1), [...wrong], {
      hint: 'Count: I, II, III, IV, V…',
    })
  }
  const wrong = new Set<string>()
  while (wrong.size < 3) {
    const j = randInt(rand, 0, 11)
    if (j !== i) wrong.add(ROMAN[j])
  }
  return mcq(rand, `Which Roman numeral shows the hour ${i + 1}?`, ROMAN[i], [...wrong], {
    hint: 'V is 5, X is 10, I is 1.',
  })
}

/** 12 hour ↔ 24 hour clock (afternoon and evening times). */
export function gY3Time24(rand: Rand): Question {
  const h24 = pick(rand, [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23])
  const h12 = h24 === 12 ? 12 : h24 - 12
  if (rand() < 0.5) {
    const answer = `${h24}:00`
    const wrong = new Set<string>([`${h12}:00`, `${(h24 + 1) % 24}:00`, `${(h24 + 5) % 24}:00`, '0:00'])
    wrong.delete(answer)
    while (wrong.size < 3) wrong.add(`${randInt(rand, 0, 23)}:00`)
    return mcq(rand, `It is ${h12} pm. What time is that on the 24 hour clock?`, answer, [...wrong], {
      hint: 'Afternoon and evening times add 12.',
    })
  }
  const answer = `${h12} pm`
  const wrong = new Set<string>([
    `${h12} am`,
    `${h12 === 12 ? 1 : h12 + 1} pm`,
    `${h12 === 1 ? 12 : h12 - 1} pm`,
    `${h12}:00`,
  ])
  wrong.delete(answer)
  while (wrong.size < 3) wrong.add(`${randInt(rand, 1, 12)} am`)
  return mcq(rand, `The 24 hour clock shows ${h24}:00. What time is that on the 12 hour clock?`, answer, [...wrong], {
    hint: 'Times from 13 to 23 are past midday.',
  })
}

/** Durations: minutes in hours, seconds in minutes, end times. */
export function gY3Duration(rand: Rand): Question {
  const form = randInt(rand, 0, 2)
  if (form === 0) {
    const h = randInt(rand, 1, 5)
    return {
      kind: 'type-number',
      prompt: `How many minutes are there in ${h} hour${h > 1 ? 's' : ''}?`,
      answer: h * 60,
      hint: 'One hour is 60 minutes.',
    }
  }
  if (form === 1) {
    const m = randInt(rand, 2, 6)
    return {
      kind: 'type-number',
      prompt: `How many seconds are there in ${m} minutes?`,
      answer: m * 60,
      hint: 'One minute is 60 seconds.',
    }
  }
  const start = randInt(rand, 7, 15)
  const len = randInt(rand, 1, 4)
  return {
    kind: 'type-number',
    prompt: `A film starts at ${start}:00 and lasts ${len} hour${len > 1 ? 's' : ''}. What time does it end?`,
    answer: start + len,
    hint: `Count on ${len} hours.`,
  }
}

/** am or pm sense, and spotting morning times. */
export function gY3AmPm(rand: Rand): Question {
  const rows: { prompt: string; answer: string; wrong: string[]; hint: string }[] = [
    { prompt: 'The sun rises at 6:00. Is that am or pm?', answer: 'am', wrong: ['pm'], hint: 'Morning comes before midday.' },
    { prompt: 'Lunch is at 12:30. Is that am or pm?', answer: 'pm', wrong: ['am'], hint: 'Lunch is after midday.' },
    { prompt: 'The school day begins at 8:45. Is that am or pm?', answer: 'am', wrong: ['pm'], hint: 'School starts in the morning.' },
    { prompt: 'Bedtime stories start at 8:00. Is that am or pm?', answer: 'pm', wrong: ['am'], hint: 'Night time is pm.' },
    { prompt: 'Breakfast is at 7:30. Is that am or pm?', answer: 'am', wrong: ['pm'], hint: 'Breakfast is in the morning.' },
    { prompt: 'The 24 hour clock shows 09:00. Is that am or pm?', answer: 'am', wrong: ['pm'], hint: 'Nine in the morning.' },
    { prompt: 'Which time is in the MORNING?', answer: '8:00', wrong: ['20:00', '14:00'], hint: 'Morning times are small numbers.' },
    { prompt: 'Which time is in the EVENING?', answer: '19:00', wrong: ['9:00', '11:30'], hint: 'Evening times are past 12.' },
    { prompt: 'Which clock time is after lunch?', answer: '3:00', wrong: ['8:00', '7:30'], hint: 'Lunch is around midday.' },
    { prompt: 'Football practice at 17:30 — is that am or pm?', answer: 'pm', wrong: ['am'], hint: 'After school is the afternoon.' },
    { prompt: 'Which time is closest to midnight?', answer: '23:45', wrong: ['1:15', '12:00'], hint: 'Midnight is the end of the day.' },
    { prompt: 'The clock shows 00:30. Is that am or pm?', answer: 'am', wrong: ['pm'], hint: 'Just after midnight is am.' },
  ]
  const r = pick(rand, rows)
  return mcq(rand, r.prompt, r.answer, r.wrong, { hint: r.hint })
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

/** Days in each month, the calendar and leap years. */
export function gY3DaysMonths(rand: Rand): Question {
  const form = randInt(rand, 0, 3)
  if (form === 0) {
    const i = randInt(rand, 0, 11)
    return {
      kind: 'type-number',
      prompt: `How many days are there in ${MONTHS[i]}?`,
      answer: MONTH_DAYS[i],
      hint: 'Thirty days has September, April, June and November…',
    }
  }
  if (form === 1) {
    const leap = rand() < 0.5
    const year = leap ? pick(rand, [2024, 2028, 2032]) : pick(rand, [2023, 2025, 2026])
    const wrong = leap ? ['28', '30'] : ['29', '30']
    return mcq(rand, `How many days are there in February ${year}?`, leap ? '29' : '28', wrong, {
      hint: leap ? 'A leap year gives February one extra day.' : 'February has 28 days most years.',
    })
  }
  if (form === 2) {
    const leap = rand() < 0.5
    const year = leap ? pick(rand, [2024, 2028]) : pick(rand, [2023, 2025, 2026])
    return mcq(rand, `How many days were there in the year ${year}?`, leap ? '366' : '365', leap ? ['365', '364'] : ['366', '364'], {
      hint: leap ? 'A leap year has 366 days.' : 'A normal year has 365 days.',
    })
  }
  const start = randInt(rand, 0, 8)
  const items = MONTHS.slice(start, start + 4)
  return {
    kind: 'order',
    prompt: `Put these months in order, starting with ${MONTHS[start]}!`,
    items,
    hint: 'Say the months in your head.',
  }
}

/* ================ Shapes, angles & lines ================ */

const SHAPE_3D: { prompt: string; answer: string; wrong: string[] }[] = [
  { prompt: 'Which solid shape has 6 square faces?', answer: 'A cube', wrong: ['A sphere', 'A cylinder'] },
  { prompt: 'How many faces does a cube have?', answer: '6', wrong: ['4', '5'] },
  { prompt: 'Which solid shape rolls and has no flat faces?', answer: 'A sphere', wrong: ['A cube', 'A cuboid'] },
  { prompt: 'Which solid shape is shaped like a box?', answer: 'A cuboid', wrong: ['A cone', 'A sphere'] },
  { prompt: 'How many flat faces does a cylinder have?', answer: '2', wrong: ['1', '3'] },
  { prompt: 'Which solid has a flat circle and a point?', answer: 'A cone', wrong: ['A cube', 'A cuboid'] },
  { prompt: 'A square based pyramid has how many faces?', answer: '5', wrong: ['4', '6'] },
  { prompt: 'How many faces does a cuboid have?', answer: '6', wrong: ['4', '8'] },
  { prompt: 'Which solid has one square face and four triangles?', answer: 'A pyramid', wrong: ['A cube', 'A sphere'] },
  { prompt: 'A brick is shaped most like a…', answer: 'Cuboid', wrong: ['Sphere', 'Cone'] },
  { prompt: 'Which solid shape is shaped like a ball?', answer: 'Sphere', wrong: ['Cube', 'Cylinder'] },
  { prompt: 'A party hat is shaped most like a…', answer: 'Cone', wrong: ['Cuboid', 'Sphere'] },
]
export function gY3Shape3D(rand: Rand): Question {
  const f = pick(rand, SHAPE_3D)
  return mcq(rand, f.prompt, f.answer, shuffle(rand, f.wrong), { hint: 'Picture the solid in your hand.' })
}

const SHAPE_2D: { prompt: string; answer: string; wrong: string[] }[] = [
  { prompt: 'How many sides does a pentagon have?', answer: '5', wrong: ['4', '6'] },
  { prompt: 'How many sides does a hexagon have?', answer: '6', wrong: ['5', '7'] },
  { prompt: 'How many corners does a hexagon have?', answer: '6', wrong: ['5', '8'] },
  { prompt: 'Which shape has 3 sides?', answer: 'A triangle', wrong: ['A square', 'A pentagon'] },
  { prompt: 'How many sides does an octagon have?', answer: '8', wrong: ['6', '7'] },
  { prompt: 'Which shape has 8 sides?', answer: 'An octagon', wrong: ['A hexagon', 'A pentagon'] },
  { prompt: 'How many sides does a rectangle have?', answer: '4', wrong: ['3', '5'] },
  { prompt: 'A road sign shaped like a stop sign is an…', answer: 'Octagon', wrong: ['Hexagon', 'Pentagon'] },
  { prompt: 'How many straight sides does a circle have?', answer: '0', wrong: ['1', '4'] },
  { prompt: 'Which shape has 5 sides?', answer: 'A pentagon', wrong: ['A hexagon', 'A square'] },
  { prompt: 'How many corners does a triangle have?', answer: '3', wrong: ['4', '6'] },
  { prompt: 'Which shape has 6 sides?', answer: 'A hexagon', wrong: ['An octagon', 'A pentagon'] },
]
export function gY3Shape2D(rand: Rand): Question {
  const f = pick(rand, SHAPE_2D)
  return mcq(rand, f.prompt, f.answer, shuffle(rand, f.wrong), { hint: 'Count the sides and corners.' })
}

const RIGHT_ANGLE: { prompt: string; answer: string; wrong: string[] }[] = [
  { prompt: 'What is an angle of 90° called?', answer: 'A right angle', wrong: ['An acute angle', 'An obtuse angle'] },
  { prompt: 'How many right angles does a square have?', answer: '4', wrong: ['2', '3'] },
  { prompt: 'How many right angles does a rectangle have?', answer: '4', wrong: ['2', '6'] },
  { prompt: 'The corner of a sheet of paper makes…', answer: 'A right angle', wrong: ['An acute angle', 'A full turn'] },
  { prompt: "At 3 o'clock the clock hands make…", answer: 'A right angle', wrong: ['A straight line', 'An obtuse angle'] },
  { prompt: 'Which of these is a right angle?', answer: 'The corner of a book', wrong: ['The tip of a pencil', 'A straight line'] },
  { prompt: 'How many right angles are in a full turn?', answer: '4', wrong: ['2', '3'] },
  { prompt: 'A door usually meets its frame at…', answer: 'A right angle', wrong: ['A straight line', 'An acute angle'] },
  { prompt: 'A triangle with one 90° corner is a right angled triangle. Its corner is how many degrees?', answer: '90', wrong: ['45', '180'] },
  { prompt: 'How many right angles do 2 squares have altogether?', answer: '8', wrong: ['6', '10'] },
  { prompt: "At 6 o'clock the clock hands point opposite ways. That angle is a…", answer: 'Straight line', wrong: ['Right angle', 'Acute angle'] },
  { prompt: 'The edges where two walls of a room meet make…', answer: 'A right angle', wrong: ['A curved line', 'An obtuse angle'] },
]
export function gY3RightAngle(rand: Rand): Question {
  const f = pick(rand, RIGHT_ANGLE)
  return mcq(rand, f.prompt, f.answer, shuffle(rand, f.wrong), { hint: 'A right angle is a quarter turn.' })
}

/** Acute, obtuse and right angles — by degrees and by description. */
export function gY3AngleType(rand: Rand): Question {
  if (rand() < 0.7) {
    const kind = pick(rand, ['acute', 'obtuse', 'right'] as const)
    const deg =
      kind === 'acute' ? pick(rand, [30, 45, 60, 75])
      : kind === 'obtuse' ? pick(rand, [100, 120, 150, 170])
      : 90
    const answer = kind === 'acute' ? 'Acute' : kind === 'obtuse' ? 'Obtuse' : 'Right'
    return mcq(rand, `An angle of ${deg}° is called…`, answer, ['Acute', 'Obtuse', 'Right'].filter((w) => w !== answer), {
      hint: kind === 'acute' ? 'Smaller than a right angle.' : kind === 'obtuse' ? 'Bigger than a right angle.' : 'Exactly a quarter turn.',
    })
  }
  const rows: { prompt: string; answer: string; wrong: string[]; hint: string }[] = [
    { prompt: 'An angle SMALLER than a right angle is called…', answer: 'Acute', wrong: ['Obtuse', 'Right'], hint: 'Less than a quarter turn.' },
    { prompt: 'An angle BIGGER than a right angle but less than a straight line is…', answer: 'Obtuse', wrong: ['Acute', 'Right'], hint: 'More than a quarter turn.' },
    { prompt: 'A quarter turn is a…', answer: 'Right angle', wrong: ['Acute angle', 'Straight line'], hint: 'The corner of a square.' },
    { prompt: 'Which angle is the SMALLEST?', answer: 'An acute angle', wrong: ['A right angle', 'An obtuse angle'], hint: 'Sharpest point.' },
    { prompt: 'Which angle opens the WIDEST?', answer: 'An obtuse angle', wrong: ['An acute angle', 'A right angle'], hint: 'Wide open, more than a quarter turn.' },
    { prompt: 'The angle in the letter L is a…', answer: 'Right angle', wrong: ['Acute angle', 'Obtuse angle'], hint: 'Two straight edges meet squarely.' },
  ]
  const r = pick(rand, rows)
  return mcq(rand, r.prompt, r.answer, r.wrong, { hint: r.hint })
}

const LINE_ROWS: { prompt: string; answer: string; wrong: string[] }[] = [
  { prompt: 'Two lines that never meet, like railway tracks, are…', answer: 'Parallel', wrong: ['Perpendicular', 'Curved'] },
  { prompt: 'A line that goes straight across like a shelf edge is…', answer: 'Horizontal', wrong: ['Vertical', 'Parallel'] },
  { prompt: 'A line that goes straight up like a wall is…', answer: 'Vertical', wrong: ['Horizontal', 'Diagonal'] },
  { prompt: 'Two lines that make a right angle are…', answer: 'Perpendicular', wrong: ['Parallel', 'Horizontal'] },
  { prompt: 'The floor and the wall meet at a right angle — they are…', answer: 'Perpendicular', wrong: ['Parallel', 'Equal'] },
  { prompt: 'Opposite sides of a rectangle are…', answer: 'Parallel', wrong: ['Perpendicular', 'Crossing'] },
  { prompt: 'The line down the side of a page is…', answer: 'Vertical', wrong: ['Horizontal', 'Parallel'] },
  { prompt: 'Steps on a ladder are…', answer: 'Parallel', wrong: ['Vertical', 'Curved'] },
  { prompt: 'A line going at a slant is called…', answer: 'Diagonal', wrong: ['Horizontal', 'Vertical'] },
  { prompt: 'The ceiling and the floor are…', answer: 'Parallel', wrong: ['Perpendicular', 'Diagonal'] },
  { prompt: 'Two edges of a ruler held in an L shape are…', answer: 'Perpendicular', wrong: ['Parallel', 'Diagonal'] },
  { prompt: 'Standing up tall like the number 1 is a…', answer: 'Vertical line', wrong: ['Horizontal line', 'Slanted line'] },
  { prompt: 'Lying flat like a sleeping snake is a…', answer: 'Horizontal line', wrong: ['Vertical line', 'Parallel line'] },
  { prompt: 'Which lines stay the same distance apart forever?', answer: 'Parallel lines', wrong: ['Crossing lines', 'Perpendicular lines'] },
]
export function gY3Lines(rand: Rand): Question {
  const f = pick(rand, LINE_ROWS)
  return mcq(rand, f.prompt, f.answer, shuffle(rand, f.wrong), { hint: 'Picture the picture in your head.' })
}

const SYMMETRY_ROWS: { prompt: string; answer: string; wrong: string[] }[] = [
  { prompt: 'How many lines of symmetry does a square have?', answer: '4', wrong: ['2', '1'] },
  { prompt: 'How many lines of symmetry does a rectangle have?', answer: '2', wrong: ['4', '1'] },
  { prompt: 'How many lines of symmetry does a circle have?', answer: 'Lots', wrong: ['1', '0'] },
  { prompt: 'How many lines of symmetry does an equilateral triangle have?', answer: '3', wrong: ['1', '6'] },
  { prompt: 'Which shape can you fold into two matching halves?', answer: 'A square', wrong: ['A stair shape', 'A winding road'] },
  { prompt: 'A capital letter A has how many lines of symmetry?', answer: '1', wrong: ['2', '0'] },
  { prompt: 'A capital letter S has how many lines of symmetry?', answer: '0', wrong: ['1', '2'] },
  { prompt: 'How many lines of symmetry does a regular hexagon have?', answer: '6', wrong: ['3', '4'] },
  { prompt: 'A triangle with all sides the same has how many lines of symmetry?', answer: '3', wrong: ['1', '2'] },
  { prompt: 'Which capital letter has one line of symmetry down the middle?', answer: 'The letter M', wrong: ['The letter F', 'The letter J'] },
  { prompt: 'A shape with line symmetry folds to make…', answer: 'Two matching halves', wrong: ['Three parts', 'No match at all'] },
  { prompt: 'How many lines of symmetry does a regular octagon have?', answer: '8', wrong: ['4', '6'] },
]
export function gY3Symmetry(rand: Rand): Question {
  const f = pick(rand, SYMMETRY_ROWS)
  return mcq(rand, f.prompt, f.answer, shuffle(rand, f.wrong), { hint: 'Fold it in your mind — do the halves match?' })
}

/** Half, three-quarter and full turns. */
export function gY3Turns3(rand: Rand): Question {
  const facings = ['⬆️', '➡️', '⬇️', '⬅️']
  const start = randInt(rand, 0, 3)
  const kind = pick(rand, ['half', 'three quarter', 'full'] as const)
  const steps = kind === 'half' ? 2 : kind === 'three quarter' ? 3 : 4
  const ans = facings[(((start + steps) % 4) + 4) % 4]
  const wording = kind === 'half' ? 'a half turn' : kind === 'three quarter' ? 'a three quarter turn' : 'a full turn'
  return mcq(
    rand,
    `You face ${facings[start]}. You make ${wording} clockwise. Which way do you face now?`,
    ans,
    facings.filter((f) => f !== ans),
    { hint: kind === 'full' ? 'A full turn brings you back to the start.' : 'Picture turning, then stop.' },
  )
}

/* ================ Measures & perimeter ================ */

const UNIT_ROWS: { prompt: string; answer: string; wrong: string[] }[] = [
  { prompt: 'The length of a pencil is best measured in…', answer: 'Centimetres', wrong: ['Kilometres', 'Litres'] },
  { prompt: 'The distance from England to Scotland is best measured in…', answer: 'Kilometres', wrong: ['Centimetres', 'Millilitres'] },
  { prompt: 'The mass of a cat is best measured in…', answer: 'Kilograms', wrong: ['Grams', 'Millilitres'] },
  { prompt: 'The mass of a paperclip is best measured in…', answer: 'Grams', wrong: ['Kilograms', 'Metres'] },
  { prompt: 'The capacity of a swimming pool is best measured in…', answer: 'Litres', wrong: ['Millilitres', 'Grams'] },
  { prompt: 'The capacity of a spoon of medicine is best measured in…', answer: 'Millilitres', wrong: ['Litres', 'Kilograms'] },
  { prompt: 'The length of a football pitch is best measured in…', answer: 'Metres', wrong: ['Centimetres', 'Grams'] },
  { prompt: 'The width of your little finger is best measured in…', answer: 'Millimetres', wrong: ['Kilometres', 'Litres'] },
  { prompt: 'The mass of a piano is best measured in…', answer: 'Kilograms', wrong: ['Grams', 'Millilitres'] },
  { prompt: 'The length of your bedroom is best measured in…', answer: 'Metres', wrong: ['Kilometres', 'Grams'] },
  { prompt: 'The capacity of a bucket is best measured in…', answer: 'Litres', wrong: ['Grams', 'Millimetres'] },
  { prompt: 'The height of a door is best measured in…', answer: 'Metres', wrong: ['Kilometres', 'Grams'] },
]
export function gY3MeasureChoice(rand: Rand): Question {
  const f = pick(rand, UNIT_ROWS)
  return mcq(rand, f.prompt, f.answer, shuffle(rand, f.wrong), { hint: 'Pick the unit that fits the size.' })
}

/** Convert between m/cm/mm, kg/g and l/ml (whole numbers only). */
export function gY3Convert(rand: Rand): Question {
  const form = randInt(rand, 0, 7)
  const n = randInt(rand, 1, 9)
  if (form === 0) return { kind: 'type-number', prompt: `${n} m = ? cm`, answer: n * 100, hint: '1 m = 100 cm.' }
  if (form === 1) return { kind: 'type-number', prompt: `${n * 100} cm = ? m`, answer: n, hint: '100 cm make 1 m.' }
  if (form === 2) return { kind: 'type-number', prompt: `${n} cm = ? mm`, answer: n * 10, hint: '1 cm = 10 mm.' }
  if (form === 3) return { kind: 'type-number', prompt: `${n * 10} mm = ? cm`, answer: n, hint: '10 mm make 1 cm.' }
  if (form === 4) return { kind: 'type-number', prompt: `${n} kg = ? g`, answer: n * 1000, hint: '1 kg = 1,000 g.' }
  if (form === 5) return { kind: 'type-number', prompt: `${n * 1000} g = ? kg`, answer: n, hint: '1,000 g make 1 kg.' }
  if (form === 6) return { kind: 'type-number', prompt: `${n} l = ? ml`, answer: n * 1000, hint: '1 l = 1,000 ml.' }
  return { kind: 'type-number', prompt: `${n * 1000} ml = ? l`, answer: n, hint: '1,000 ml make 1 l.' }
}

/** Perimeter of rectangles and equal-sided shapes. */
export function gY3Perimeter(rand: Rand): Question {
  if (rand() < 0.6) {
    const a = randInt(rand, 2, 15)
    let b = randInt(rand, 2, 15)
    while (b === a) b = randInt(rand, 2, 15)
    return {
      kind: 'type-number',
      prompt: `A rectangle is ${a} cm long and ${b} cm wide. What is its perimeter in cm?`,
      answer: 2 * (a + b),
      hint: 'Add all four sides.',
    }
  }
  const sides = randInt(rand, 3, 8)
  const len = randInt(rand, 2, 9)
  return {
    kind: 'type-number',
    prompt: `A shape has ${sides} equal sides. Each side is ${len} cm. What is its perimeter in cm?`,
    answer: sides * len,
    hint: 'Equal sides — multiply, or add them all.',
  }
}

/** Compare two measures (definite inequalities only). */
export function gY3MeasureCompare(rand: Rand): Question {
  const rows: [string, string][] = [
    ['1 m', '90 cm'], ['2 kg', '1500 g'], ['500 ml', '1 l'], ['3 l', '2500 ml'],
    ['10 mm', '2 cm'], ['4 cm', '35 mm'], ['150 g', '1 kg'], ['75 cm', '1 m'],
    ['2500 ml', '2 l'], ['3000 g', '2 kg'], ['5 mm', '5 cm'], ['9 l', '900 ml'],
  ]
  const [x, y] = pick(rand, rows)
  const firstWins = rand() < 0.5
  const answer = firstWins ? x : y
  const other = firstWins ? y : x
  return mcq(rand, `Which is MORE?  ${x}  or  ${y}`, answer, [other], {
    hint: 'Change both to the same unit, then compare.',
  })
}

/** Measure word problems (length, mass and capacity). */
export function gY3MeasureWord(rand: Rand): Question {
  const who = pick(rand, [...MASCOTS])
  const form = randInt(rand, 0, 3)
  if (form === 0) {
    const a = randInt(rand, 150, 500)
    const b = randInt(rand, 30, a - 20)
    return {
      kind: 'type-number',
      prompt: `A rope is ${a} cm long. You cut off ${b} cm. How many cm are left?`,
      answer: a - b,
      hint: 'Take the piece away from the whole.',
    }
  }
  if (form === 1) {
    const a = randInt(rand, 120, 400)
    const b = randInt(rand, 50, 300)
    return {
      kind: 'type-number',
      prompt: `${who} has ${a} cm of ribbon and buys ${b} cm more. How many cm now?`,
      answer: a + b,
      hint: 'Altogether means ADD.',
    }
  }
  if (form === 2) {
    const a = randInt(rand, 200, 900)
    const b = randInt(rand, 50, a - 50)
    return {
      kind: 'type-number',
      prompt: `A bag holds ${a} g of flour. You use ${b} g. How many grams are left?`,
      answer: a - b,
      hint: 'Used means TAKE AWAY.',
    }
  }
  const a = randInt(rand, 500, 950)
  const b = randInt(rand, 100, a - 100)
  return {
    kind: 'type-number',
    prompt: `A jug holds ${a} ml. You pour out ${b} ml. How many millilitres are left?`,
    answer: a - b,
    hint: 'Poured out means SUBTRACT.',
  }
}

/* ===================== Statistics ===================== */

/** Pictogram: each picture stands for 2, 5 or 10. */
export function gY3Pictogram(rand: Rand): Question {
  const per = pick(rand, [2, 5, 10])
  const count = randInt(rand, 2, 9)
  const emoji = pick(rand, ['🍎', '⚽', '📘', '🌻'])
  if (rand() < 0.5) {
    return {
      kind: 'type-number',
      prompt: `On the pictogram each ${emoji} stands for ${per}. One row has ${count} of them. How many altogether?`,
      answer: per * count,
      hint: `${count} groups of ${per}.`,
    }
  }
  return {
    kind: 'type-number',
    prompt: `A row on the pictogram shows ${per * count} children. Each ${emoji} stands for ${per}. How many pictures are in the row?`,
    answer: count,
    hint: `Count up to ${per * count} in ${per}s.`,
  }
}

/** Bar chart questions (bars described in words — no chart visual exists). */
export function gY3BarChart(rand: Rand): Question {
  const a = randInt(rand, 2, 18) * 5
  let b = randInt(rand, 2, 18) * 5
  const form = randInt(rand, 0, 2)
  if (form === 0) {
    while (b === a) b = randInt(rand, 2, 18) * 5
    const days = ['Monday', 'Tuesday']
    const [d1, d2] = rand() < 0.5 ? days : [days[1], days[0]]
    const [v1, v2] = d1 === 'Monday' ? [a, b] : [b, a]
    return {
      kind: 'type-number',
      prompt: `On the bar chart ${d1} shows ${v1} and ${d2} shows ${v2}. What is the difference?`,
      answer: Math.abs(a - b),
      hint: 'Find how many more the bigger bar shows.',
    }
  }
  if (form === 1) {
    const c = randInt(rand, 2, 12) * 5
    return {
      kind: 'type-number',
      prompt: `Three bars show ${a}, ${b} and ${c}. What is the total?`,
      answer: a + b + c,
      hint: 'Add all three bars.',
    }
  }
  while (b === a) b = randInt(rand, 2, 18) * 5
  return {
    kind: 'type-number',
    prompt: `Two bars show ${a} and ${b}. How many more does the bigger bar show?`,
    answer: Math.abs(a - b),
    hint: 'Subtract the smaller from the bigger.',
  }
}

/** Table questions (rows described in words, scored by mascots). */
export function gY3TableRead(rand: Rand): Question {
  const form = randInt(rand, 0, 2)
  if (form === 0) {
    const a = randInt(rand, 25, 95)
    let b = randInt(rand, 15, a - 5)
    while (b === a) b = randInt(rand, 15, a - 5)
    return {
      kind: 'type-number',
      prompt: `In the table Sonic scored ${a} and Tails scored ${b}. How many MORE did Sonic score?`,
      answer: a - b,
      hint: 'Find the difference between the two rows.',
    }
  }
  if (form === 1) {
    const a = randInt(rand, 12, 60)
    const b = randInt(rand, 10, 55)
    const c = randInt(rand, 8, 50)
    return {
      kind: 'type-number',
      prompt: `The table shows: Amy ${a}, Knuckles ${b}, Shadow ${c}. What is the total?`,
      answer: a + b + c,
      hint: 'Add the three rows.',
    }
  }
  const a = randInt(rand, 20, 90)
  const b = randInt(rand, 15, 85)
  return {
    kind: 'type-number',
    prompt: `Votes in the table: Sonic ${a}, Amy ${b}. How many votes altogether?`,
    answer: a + b,
    hint: 'Add the two rows together.',
  }
}

/** Scales marked in 2s, 5s and 10s. */
export function gY3Scale(rand: Rand): Question {
  const step = pick(rand, [2, 5, 10])
  const start = step * randInt(rand, 1, 8)
  const form = randInt(rand, 0, 1)
  if (form === 0) {
    return {
      kind: 'type-number',
      prompt: `A scale is marked ${start}, ${start + step}, ${start + 2 * step}, … What number comes next?`,
      answer: start + 3 * step,
      hint: `The marks go up in ${step}s.`,
    }
  }
  const marks = randInt(rand, 2, 5)
  return {
    kind: 'type-number',
    prompt: `A scale starts at ${start} and goes up in ${step}s. What is the number ${marks} marks later?`,
    answer: start + marks * step,
    hint: `Count up in ${step}s, ${marks} times.`,
  }
}
