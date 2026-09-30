/** PLAN 169f — Year-4 maths generators. Ranges follow the DfE national
 *  curriculum Year-4 programme of study (see curriculum.ts for provenance):
 *  counting in multiples of 6, 7, 9, 25 and 1,000 with 1,000 more or less,
 *  four-digit place value, comparing, ordering and rounding to 10/100/1,000,
 *  Roman numerals to 100 and negative numbers in context, mental and
 *  columnar addition and subtraction to 4 digits with estimating and
 *  inverse checks, the multiplication tables to 12 × 12 with factor pairs,
 *  commutativity, mental ×0/×1/÷1 and three-number products, short
 *  multiplication and short division with 2-digit divisors, the
 *  distributive law, scaling and correspondence problems, families of
 *  equivalent fractions, hundredths, adding/subtracting fractions with the
 *  same denominator (including beyond one whole), fractions of quantities
 *  with whole-number answers, decimal equivalents of tenths/hundredths and
 *  1/4, 1/2, 3/4, dividing by 10 and 100, comparing and rounding decimals
 *  and 2-dp money problems, money problems in £ and p, converting time
 *  units (hours/minutes, minutes/seconds, years/months, weeks/days), the
 *  24-hour clock, durations and timetables, converting km/m/cm/mm and
 *  kg/g, l/ml, the perimeter of rectangles and rectilinear figures and
 *  area by counting squares, classifying triangles (isosceles, equilateral,
 *  scalene) and quadrilaterals (square, rectangle, rhombus, trapezium,
 *  parallelogram), acute/obtuse/right angles and ordering angles up to
 *  2 right angles, lines of symmetry, first-quadrant coordinates,
 *  translations and completing rectangles on a grid, and statistics with
 *  discrete/continuous data, bar charts, time graphs, pictograms and
 *  tables.
 *
 *  Vocabulary stays inside the Year-4 syllabus
 *  (src/content/syllabus/y4/math.ts): number words are written with SPACES
 *  ("four thousand three hundred", never hyphenated — the matcher keeps
 *  hyphens inside a single token), bank-tier choices stay inside the list,
 *  and digit-only answers/choices ("£2.30", "3/4", "19:40", "(3, 5)",
 *  "120°", "VIII") are safe because the tokenizer never matches pure
 *  digits and the Roman numeral letters are in the DfE addendum. Decimal
 *  and negative answers use mcq (the type-number input strips "."), and
 *  every type-number answer is a non-negative integer. */

import type { MatchQuestion, OrderQuestion, Question } from '../../../types'
import { pick, randInt, shuffle, type Rand } from '../../../rng'
import { mcq } from '../../../generators'

/** Numeric distractors around an answer (clamped to 0..max). */
function distract(rand: Rand, answer: number, spread = 1, max = 100000): string[] {
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

/** Thousands-separated integer for prompts (deterministic, locale-free). */
function fmt(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const pad2 = (n: number): string => String(n).padStart(2, '0')

/** Pence integer -> "£4.35" (exact: pence are whole). */
const money = (p: number): string => `£${(p / 100).toFixed(2)}`

/** Dedupe a choice list, drop the correct answer, take 3. */
function wrongsFrom(cands: string[], answer: string): string[] {
  const out: string[] = []
  for (const c of cands) {
    if (c === answer || out.includes(c)) continue
    out.push(c)
    if (out.length === 3) break
  }
  return out
}

/* ======================= Unit 1 · Counting ======================== */

function countIn(rand: Rand, steps: number[]): Question {
  const step = pick(rand, steps)
  const start = step * randInt(rand, 0, step >= 100 ? 3 : 8)
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

/** Count in 6s and 7s. */
export function gY4CountIn(rand: Rand): Question {
  return countIn(rand, [6, 7])
}

/** Count in 9s and 25s. */
export function gY4CountIn9x25(rand: Rand): Question {
  return countIn(rand, [9, 25])
}

/** 1,000 more or less than a four-digit number. */
export function gY4MoreLess1000(rand: Rand): Question {
  const more = rand() < 0.5
  const n = randInt(rand, 2000, 8999)
  return {
    kind: 'type-number',
    prompt: more ? `What is 1,000 MORE than ${fmt(n)}?` : `What is 1,000 LESS than ${fmt(n)}?`,
    answer: more ? n + 1000 : n - 1000,
    hint: 'Only the thousands digit changes.',
  }
}

/** Which rule makes the pattern? */
export function gY4CountInRule(rand: Rand): Question {
  const steps = [6, 7, 9, 25, 1000]
  const step = pick(rand, steps)
  const start = step * randInt(rand, 0, 4)
  const seq = [start, start + step, start + 2 * step, start + 3 * step]
  const wrongs = shuffle(rand, steps.filter((s) => s !== step))
    .slice(0, 3)
    .map((s) => `Counting in ${s}s`)
  return mcq(rand, `What is the rule?  ${seq.join(', ')}`, `Counting in ${step}s`, wrongs, {
    hint: `The gap between each number is ${step}.`,
  })
}

/** Missing term in a count-in sequence. */
export function gY4SequenceMissing(rand: Rand): Question {
  const step = pick(rand, [6, 7, 9, 25, 1000])
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

/* ================ Unit 2 · Place value to 10,000 ================ */

const PLACE_NAMES: Record<number, string> = { 1000: 'thousands', 100: 'hundreds', 10: 'tens', 1: 'ones' }

/** What is a named digit worth in a four-digit number? */
export function gY4PlaceValue(rand: Rand): Question {
  const place = pick(rand, [1000, 100, 10, 1])
  let n = 0
  let digit = 0
  for (let i = 0; i < 50 && digit === 0; i++) {
    n = randInt(rand, 1000, 9999)
    digit = Math.floor(n / place) % 10
  }
  return {
    kind: 'type-number',
    prompt: `In ${fmt(n)}, what is the ${PLACE_NAMES[place]} digit worth?`,
    answer: digit * place,
    hint: `The ${PLACE_NAMES[place]} digit is ${digit}.`,
  }
}

/** Compare two numbers to 10,000. */
export function gY4ComparePV(rand: Rand): Question {
  const a = randInt(rand, 1000, 9999)
  const b = randInt(rand, 1000, 9999)
  const cmp = a > b ? 'greater than' : a < b ? 'less than' : 'equal to'
  return mcq(rand, `Compare ${fmt(a)} with ${fmt(b)}:`, cmp, wrongsFrom(['greater than', 'less than', 'equal to'], cmp), {
    hint: 'Line the numbers up and compare digit by digit.',
  })
}

/** Order four numbers to 10,000. */
export function gY4OrderNums(rand: Rand): OrderQuestion {
  const nums = new Set<number>()
  while (nums.size < 4) nums.add(randInt(rand, 1000, 9999))
  const asc = rand() < 0.5
  const sorted = [...nums].sort((x, y) => (asc ? x - y : y - x))
  return {
    kind: 'order',
    prompt: asc ? 'Order these numbers from smallest:' : 'Order these numbers from largest:',
    items: sorted.map(String),
    hint: 'Compare the thousands first, then hundreds, tens and ones.',
  }
}

/** Round to the nearest 10, 100 or 1,000. */
export function gY4Round(rand: Rand): Question {
  const target = pick(rand, [10, 100, 1000])
  let n = randInt(rand, target, 9999)
  for (let i = 0; i < 40 && n % target === 0; i++) n = randInt(rand, target, 9999)
  return {
    kind: 'type-number',
    prompt: `Round ${fmt(n)} to the nearest ${target}.`,
    answer: Math.round(n / target) * target,
    hint: `Look at the digit after the ${target === 10 ? 'tens' : target === 100 ? 'hundreds' : 'thousands'} place.`,
  }
}

const ROMAN: readonly (readonly [string, number])[] = [
  ['I', 1], ['IV', 4], ['V', 5], ['VI', 6], ['VII', 7], ['VIII', 8],
  ['IX', 9], ['X', 10], ['XI', 11], ['XII', 12], ['XIII', 13], ['XIV', 14],
  ['XV', 15], ['XVI', 16], ['XVII', 17], ['XVIII', 18], ['XIX', 19],
  ['XX', 20], ['XXIV', 24], ['XXX', 30], ['XL', 40], ['L', 50], ['LX', 60],
  ['LXX', 70], ['LXXX', 80], ['XC', 90], ['XCV', 95], ['C', 100],
]

/** Roman numerals to 100 (I to C), both directions. */
export function gY4Roman100(rand: Rand): Question {
  const [r, n] = pick(rand, ROMAN)
  if (rand() < 0.5) {
    return mcq(rand, `Which number is the Roman numeral ${r}?`, String(n), distract(rand, n, 1, 100), {
      hint: 'Build the number from its parts: X is 10, L is 50, C is 100.',
    })
  }
  const wrongs = shuffle(rand, ROMAN.map((x) => x[0]).filter((x) => x !== r)).slice(0, 3)
  return mcq(rand, `Which Roman numeral means ${n}?`, r, wrongs, {
    hint: 'Write the biggest value first, then add the rest.',
  })
}

/** Negative numbers in context (mcq: the number input cannot be trusted on mobile). */
export function gY4Negatives(rand: Rand): Question {
  const form = randInt(rand, 0, 2)
  if (form === 0) {
    const k = randInt(rand, 1, 9)
    const answer = String(-k)
    return mcq(rand, `What is ${k} less than 0?`, answer, wrongsFrom([String(k), String(-(k + 1)), String(k + 2)], answer), {
      hint: 'Count down below zero.',
    })
  }
  if (form === 1) {
    const k = randInt(rand, 3, 9)
    const next = k - 3
    const answer = String(next)
    return mcq(
      rand,
      `Counting down through zero: ${k}, ${k - 1}, ${k - 2}, … what comes next?`,
      answer,
      wrongsFrom([String(next + 2), String(-next - 1), String(next + 1)], answer),
      { hint: 'The count carries on below zero.' },
    )
  }
  const below = randInt(rand, 4, 9)
  const rise = randInt(rand, 1, 12)
  const answer = String(rise - below)
  const wrongs = [
    String(-below - rise),
    String(below + rise),
    String(-rise),
    String(-below),
    String(rise),
  ]
  return mcq(
    rand,
    `The temperature is ${-below} degrees. It rises by ${rise} degrees. What is the temperature now?`,
    answer,
    wrongsFrom(wrongs, answer),
    { hint: 'Starting below zero, count up past zero.' },
  )
}

/* =================== Unit 3 · Mental add & subtract ============== */

/** Add and subtract 10, 100 or 1,000 mentally. */
export function gY4MentalStep(rand: Rand): Question {
  const step = pick(rand, [10, 100, 1000])
  const add = rand() < 0.5
  const n = step === 1000 ? randInt(rand, 1500, 8999) : randInt(rand, 200, 9999)
  const answer = add ? n + step : n - step
  const verbal = rand() < 0.5
  return {
    kind: 'type-number',
    prompt: verbal
      ? `What is ${step} ${add ? 'MORE' : 'LESS'} than ${fmt(n)}?`
      : `${fmt(n)} ${add ? '+' : '−'} ${step} = ?`,
    answer,
    hint: add ? 'Only one part of the number grows.' : 'Only one part of the number shrinks.',
  }
}

/** Missing numbers in add/sub facts and inverse checks. */
export function gY4MissingFact(rand: Rand): Question {
  const a = randInt(rand, 1200, 7000)
  const b = randInt(rand, 1100, 1999)
  const c = a + b
  const form = randInt(rand, 0, 2)
  const prompts = [
    `? + ${fmt(b)} = ${fmt(c)}`,
    `${fmt(a)} + ? = ${fmt(c)}`,
    `${fmt(c)} − ${fmt(a)} = ?`,
  ]
  const answers = [a, b, b]
  return {
    kind: 'type-number',
    prompt: prompts[form],
    answer: answers[form],
    hint: 'Part + part = whole — use the missing part.',
  }
}

/** Estimate by rounding to 100, then calculate. */
export function gY4Estimate(rand: Rand): Question {
  const subtract = rand() < 0.5
  let a: number
  let b: number
  if (subtract) {
    a = randInt(rand, 3000, 9500)
    b = randInt(rand, 1100, Math.max(1200, a - 1100))
  } else {
    a = randInt(rand, 1100, 7800)
    b = randInt(rand, 1100, 2000)
  }
  const ra = Math.round(a / 100) * 100
  const rb = Math.round(b / 100) * 100
  return {
    kind: 'type-number',
    prompt: `Estimate: ${fmt(a)} ${subtract ? '−' : '+'} ${fmt(b)} ≈ ?`,
    answer: subtract ? ra - rb : ra + rb,
    hint: 'Round both numbers to the nearest 100 first.',
  }
}

/** Two-step mental story (add then take away). */
export function gY4TwoStep(rand: Rand): Question {
  const start = randInt(rand, 1200, 6000)
  const add = randInt(rand, 300, 1800)
  const sub = randInt(rand, 100, 900)
  return {
    kind: 'type-number',
    prompt: `Start at ${fmt(start)}. Add ${fmt(add)}. Then take away ${fmt(sub)}. What number do you finish on?`,
    answer: start + add - sub,
    hint: 'Do the first move, then the second move.',
  }
}

/* =============== Unit 4 · Column add & subtract ================= */

/** Column addition to 4 digits. */
export function gY4ColumnAdd(rand: Rand): Question {
  const a = randInt(rand, 1111, 8899)
  const b = randInt(rand, 102, 1999)
  return {
    kind: 'type-number',
    prompt: `${fmt(a)} + ${fmt(b)} = ?`,
    answer: a + b,
    hint: 'Line up ones under ones, then add each column.',
  }
}

/** Column subtraction to 4 digits. */
export function gY4ColumnSub(rand: Rand): Question {
  const a = randInt(rand, 3000, 9999)
  const b = randInt(rand, 101, a - 101)
  return {
    kind: 'type-number',
    prompt: `${fmt(a)} − ${fmt(b)} = ?`,
    answer: a - b,
    hint: 'Line up the columns and exchange when you need to.',
  }
}

/** Which calculation checks the sum (inverse operations)? */
export function gY4Inverse(rand: Rand): Question {
  let a = randInt(rand, 1200, 7000)
  let b = randInt(rand, 300, 2500)
  if (a === b) b += 1
  const c = a + b
  const answer = `${fmt(c)} − ${fmt(b)} = ${fmt(a)}`
  const wrongs = [
    `${fmt(c)} + ${fmt(b)} = ${fmt(a)}`,
    `${fmt(c)} − ${fmt(b)} = ${fmt(b)}`,
    `${fmt(a)} − ${fmt(b)} = ${fmt(c)}`,
  ]
  return mcq(rand, `Which calculation CHECKS ${fmt(a)} + ${fmt(b)} = ${fmt(c)}?`, answer, wrongs, {
    hint: 'Addition is undone by subtraction.',
  })
}

/** Two-step written story (add then take away). */
export function gY4TwoStepWord(rand: Rand): Question {
  const form = rand() < 0.5
  const a = randInt(rand, 2400, 6800)
  const b = randInt(rand, 300, 1500)
  const c = randInt(rand, 200, 900)
  if (form) {
    return {
      kind: 'type-number',
      prompt: `A factory made ${fmt(a)} toys. It made ${fmt(b)} more. Then ${fmt(c)} were shipped away. How many toys are left?`,
      answer: a + b - c,
      hint: 'Add first, then take away.',
    }
  }
  return {
    kind: 'type-number',
    prompt: `A car park had ${fmt(a)} cars. ${fmt(b)} left. Then ${fmt(c)} arrived. How many cars are there now?`,
    answer: a - b + c,
    hint: 'Take away first, then add.',
  }
}

/* ================== Unit 5 · Times tables to 12 × 12 ============ */

/** A table fact to 12 × 12. */
export function gY4Table(rand: Rand): Question {
  const m = randInt(rand, 2, 12)
  const n = randInt(rand, 2, 12)
  return {
    kind: 'type-number',
    prompt: `${m} × ${n} = ?`,
    answer: m * n,
    hint: 'Count in the table or recall the fact.',
  }
}

/** Division facts from the tables. */
export function gY4DivFact(rand: Rand): Question {
  const n = randInt(rand, 2, 12)
  const q = randInt(rand, 2, 12)
  return {
    kind: 'type-number',
    prompt: `${n * q} ÷ ${n} = ?`,
    answer: q,
    hint: 'Division runs the times table backwards.',
  }
}

/** Missing numbers in table facts. */
export function gY4TableMissing(rand: Rand): Question {
  const m = randInt(rand, 2, 12)
  const n = randInt(rand, 2, 12)
  const prod = m * n
  const form = randInt(rand, 0, 2)
  const prompts = [`? × ${n} = ${prod}`, `${m} × ? = ${prod}`, `${prod} ÷ ? = ${n}`]
  const answers = [m, n, m]
  return {
    kind: 'type-number',
    prompt: prompts[form],
    answer: answers[form],
    hint: 'Work out the missing factor.',
  }
}

/** Factor pairs: which pair multiplies to the number? */
export function gY4FactorPairs(rand: Rand): Question {
  const pool = [12, 16, 18, 20, 24, 28, 30, 32, 36, 40, 42, 45, 48, 56, 60, 64, 72, 81, 84, 90, 96, 100, 104, 112, 120]
  const n = pick(rand, pool)
  const divs: number[] = []
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) {
      divs.push(d)
      if (d !== n / d) divs.push(n / d)
    }
  }
  const a = pick(rand, divs)
  const b = n / a
  const answer = `${a} and ${b}`
  const wrongs = [`${a} and ${b + 1}`, `${a + 1} and ${b}`, `${a + 2} and ${b}`]
  return mcq(rand, `Which of these is a factor pair of ${n}?`, answer, wrongs, {
    hint: `Two numbers that multiply to make ${n}.`,
  })
}

/** Commutativity as matched pairs (4 × 7 ↔ 7 × 4). */
export function gY4Commutative(rand: Rand): MatchQuestion {
  const facts: readonly (readonly [number, number])[] = [
    [2, 3], [2, 5], [3, 4], [3, 7], [4, 5], [4, 6], [4, 7], [5, 6], [6, 8], [6, 9], [7, 9], [8, 9],
  ]
  const chosen = shuffle(rand, facts).slice(0, 4)
  return {
    kind: 'match',
    prompt: 'Match each multiplication with the same numbers swapped.',
    pairs: chosen.map(([x, y]) => ({ left: `${x} × ${y}`, right: `${y} × ${x}` })),
    hint: 'You can swap the numbers — the product stays the same.',
  }
}

/** Mental ×0/×1/÷1, three-number products and derived facts. */
export function gY4MentalMultDiv(rand: Rand): Question {
  const form = randInt(rand, 0, 3)
  if (form === 0) {
    const a = randInt(rand, 2, 9)
    const b = randInt(rand, 2, 9)
    const c = randInt(rand, 2, 9)
    return { kind: 'type-number', prompt: `${a} × ${b} × ${c} = ?`, answer: a * b * c, hint: 'Multiply two numbers first, then the third.' }
  }
  if (form === 1) {
    const n = randInt(rand, 3, 99)
    const op = pick(rand, ['× 0', '× 1', '÷ 1'])
    const answer = op === '× 0' ? 0 : n
    return { kind: 'type-number', prompt: `${n} ${op} = ?`, answer, hint: 'Multiplying by 0 makes 0; multiplying or dividing by 1 keeps the number.' }
  }
  if (form === 2) {
    const b = randInt(rand, 2, 9)
    const m = randInt(rand, 2, 9)
    const n = b * m * 100
    return { kind: 'type-number', prompt: `${fmt(n)} ÷ ${b} = ?`, answer: m * 100, hint: `Use ${b} × ${m} = ${b * m}, then × 100.` }
  }
  const n = randInt(rand, 3, 89)
  const mult = pick(rand, [10, 100])
  return { kind: 'type-number', prompt: `${n} × ${mult} = ?`, answer: n * mult, hint: 'Shift the digits, then place the zeros.' }
}

/* ================== Unit 6 · Multiply & divide ================== */

/** Short multiplication: 2- or 3-digit by 1-digit. */
export function gY4ShortMult(rand: Rand): Question {
  const three = rand() < 0.5
  const a = three ? randInt(rand, 101, 499) : randInt(rand, 12, 99)
  const d = randInt(rand, 2, 9)
  return { kind: 'type-number', prompt: `${a} × ${d} = ?`, answer: a * d, hint: 'Multiply the ones, then the tens, then the hundreds.' }
}

/** Short division with a 2-digit divisor, exact answers. */
export function gY4ShortDiv(rand: Rand): Question {
  const d = randInt(rand, 12, 25)
  const q = randInt(rand, 6, 399)
  return { kind: 'type-number', prompt: `${fmt(q * d)} ÷ ${d} = ?`, answer: q, hint: `Think: how many ${d}s fit exactly?` }
}

/** Distributive law: split the multiplication. */
export function gY4Distributive(rand: Rand): Question {
  const tens = randInt(rand, 1, 9)
  const ones = randInt(rand, 1, 9)
  const d = randInt(rand, 2, 9)
  const a = tens * 10 + ones
  const answer = `${tens * 10} × ${d} + ${ones} × ${d}`
  const wrongs = [
    `${tens * 10} × ${d} + ${ones} × ${d + 1}`,
    `${tens * 10} × ${d} + ${ones + 1} × ${d}`,
    `${(tens + 1) * 10} × ${d} + ${ones} × ${d}`,
  ]
  return mcq(rand, `Split ${a} × ${d} with the distributive law: which is correct?`, answer, wrongs, {
    hint: `${a} × ${d} = ${tens * 10} × ${d} + ${ones} × ${d}.`,
  })
}

/** Scaling and correspondence problems. */
export function gY4ScalingCorresp(rand: Rand): Question {
  const form = randInt(rand, 0, 2)
  if (form === 0) {
    const t = randInt(rand, 2, 9)
    const n = randInt(rand, 3, 15)
    return { kind: 'type-number', prompt: `What is ${t} times as many as ${n}?`, answer: t * n, hint: `Multiply ${n} by ${t}.` }
  }
  if (form === 1) {
    const bags = randInt(rand, 3, 12)
    const each = randInt(rand, 4, 15)
    return { kind: 'type-number', prompt: `${fmt(bags * each)} sweets are shared equally into ${bags} bags. How many in each bag?`, answer: each, hint: 'Divide the total by the number of groups.' }
  }
  const plates = randInt(rand, 3, 12)
  const each = randInt(rand, 4, 15)
  return { kind: 'type-number', prompt: `${plates} plates each hold ${each} cakes. How many cakes altogether?`, answer: plates * each, hint: 'Groups × in each = total.' }
}

/* ======================= Unit 7 · Fractions ===================== */

const EQUIV_ROWS: readonly (readonly [string, string])[] = [
  ['1/2', '2/4'], ['1/2', '3/6'], ['1/2', '4/8'], ['1/2', '5/10'],
  ['1/3', '2/6'], ['1/3', '3/9'], ['1/4', '2/8'], ['1/4', '3/12'],
  ['3/4', '6/8'], ['3/4', '9/12'], ['2/5', '4/10'], ['2/6', '4/12'],
  ['5/10', '1/2'], ['6/8', '3/4'], ['4/8', '2/4'], ['3/9', '1/3'],
]

function fracValue(s: string): number {
  const [n, d] = s.split('/').map(Number)
  return n / d
}

/** Which fraction is equivalent? (digit-only choices — audit safe). */
export function gY4Equivalent(rand: Rand): Question {
  const [base, answer] = pick(rand, EQUIV_ROWS)
  const av = fracValue(answer)
  const pool = [...new Set(EQUIV_ROWS.flat())].filter(
    (s) => s !== answer && Math.abs(fracValue(s) - av) > 1e-9,
  )
  const wrongs = shuffle(rand, pool).slice(0, 3)
  return mcq(rand, `Which fraction is the SAME as ${base}?`, answer, wrongs, {
    hint: 'Multiply the top and bottom by the same number.',
  })
}

/** Hundredths: whole numbers to hundredths and decimal forms. */
export function gY4Hundredths(rand: Rand): Question {
  const form = randInt(rand, 0, 2)
  if (form === 0) {
    const k = randInt(rand, 1, 9)
    return {
      kind: 'type-number',
      prompt: `How many hundredths make ${k} whole${k > 1 ? 's' : ''}?`,
      answer: k * 100,
      hint: 'One whole = 100 hundredths.',
    }
  }
  if (form === 1) {
    const h = randInt(rand, 1, 99)
    const answer = (h / 100).toFixed(2)
    const wrongs = [h - 1, h + 1, h - 2, h + 2, h - 3, h + 3]
      .filter((v) => v >= 1 && v <= 99 && v !== h)
      .slice(0, 3)
      .map((v) => (v / 100).toFixed(2))
    return mcq(rand, `Which decimal is the same as ${h} hundredths?`, answer, wrongs, {
      hint: 'Two digits after the point: tenths then hundredths.',
    })
  }
  const start = randInt(rand, 10, 80)
  const answer = ((start + 3) / 100).toFixed(2)
  return mcq(
    rand,
    `Counting in hundredths: ${(start / 100).toFixed(2)}, ${((start + 1) / 100).toFixed(2)}, ${((start + 2) / 100).toFixed(2)}, … what comes next?`,
    answer,
    wrongsFrom([((start + 4) / 100).toFixed(2), ((start + 2) / 100).toFixed(2), ((start + 5) / 100).toFixed(2)], answer),
    { hint: 'The last digit grows by one hundredth.' },
  )
}

/** Add and subtract fractions with the same denominator. */
export function gY4AddSubFrac(rand: Rand): Question {
  const den = pick(rand, [4, 5, 6, 8, 10, 12])
  const add = rand() < 0.5
  let a: number
  let b: number
  if (add) {
    a = randInt(rand, 1, den - 1)
    b = randInt(rand, 1, den - 1)
  } else {
    a = randInt(rand, 2, den)
    b = randInt(rand, 1, a - 1)
  }
  const num = add ? a + b : a - b
  const answer = `${num}/${den}`
  const wrongNums: number[] = []
  for (const nn of [num + 1, num + 2, num - 1, den - num, den]) {
    if (wrongNums.length === 3) break
    if (nn === num || nn < 0 || wrongNums.includes(nn)) continue
    wrongNums.push(nn)
  }
  return mcq(rand, `${a}/${den} ${add ? '+' : '−'} ${b}/${den} = ?`, answer, wrongNums.map((nn) => `${nn}/${den}`), {
    hint: 'The bottom number stays the same — add or take the tops.',
  })
}

/** Fractions of quantities with whole-number answers. */
export function gY4FractionOf(rand: Rand): Question {
  const den = pick(rand, [2, 3, 4, 5, 6, 8, 10])
  const k = randInt(rand, 1, 14)
  const n = den * k
  const num = randInt(rand, 1, den)
  return {
    kind: 'type-number',
    prompt: `What is ${num}/${den} of ${n}?`,
    answer: num * k,
    hint: `${n} ÷ ${den} = ${k}, then × ${num}.`,
  }
}

/* ======================= Unit 8 · Decimals ====================== */

const DEC_ROWS: readonly (readonly [string, string])[] = [
  ['1/4', '0.25'], ['1/2', '0.5'], ['3/4', '0.75'], ['1/10', '0.1'],
  ['7/10', '0.7'], ['15/100', '0.15'], ['1/5', '0.2'], ['4/10', '0.4'],
  ['9/10', '0.9'], ['5/100', '0.05'], ['35/100', '0.35'], ['85/100', '0.85'],
  ['2/10', '0.2'], ['6/10', '0.6'],
]

/** Decimal equivalents of tenths, hundredths, 1/4, 1/2 and 3/4. */
export function gY4DecEquiv(rand: Rand): Question {
  const [frac, dec] = pick(rand, DEC_ROWS)
  const av = Number(dec)
  const pool = [...new Set(DEC_ROWS.map((r) => r[1]))].filter(
    (s) => s !== dec && Math.abs(Number(s) - av) > 1e-9,
  )
  const wrongs = shuffle(rand, pool).slice(0, 3)
  return mcq(rand, `Which decimal is the same as ${frac}?`, dec, wrongs, {
    hint: 'Tenths go after the point; hundredths come second.',
  })
}

/** Dividing by 10 and 100 (digit values) — mcq because "." cannot be typed. */
export function gY4Div10100(rand: Rand): Question {
  const by100 = rand() < 0.5
  const n = by100 ? randInt(rand, 100, 990) : randInt(rand, 10, 999)
  const answer = String(by100 ? n / 100 : n / 10)
  const wrongs = by100
    ? [String(n / 1000), String(n), String(n / 10)]
    : [String(n / 100), String(n), String(n * 10)]
  return mcq(rand, `What is ${n} ÷ ${by100 ? 100 : 10}?`, answer, wrongs, {
    hint: 'Each digit moves one place to the right.',
  })
}

/** Compare decimals (same number of decimal places). */
export function gY4CompareDec(rand: Rand): Question {
  const dp = pick(rand, [1, 2])
  const scale = dp === 1 ? 10 : 100
  const vals = new Set<number>()
  while (vals.size < 4) vals.add(randInt(rand, dp === 1 ? 15 : 105, 999) / scale)
  const arr = [...vals]
  const wantMax = rand() < 0.5
  const best = wantMax ? Math.max(...arr) : Math.min(...arr)
  const show = (v: number) => v.toFixed(dp)
  const answer = show(best)
  const listed = shuffle(rand, arr).map(show).join(', ')
  return mcq(rand, `Which number is the ${wantMax ? 'largest' : 'smallest'}?  ${listed}`, answer, wrongsFrom(arr.filter((v) => v !== best).map(show), answer), {
    hint: 'Line the decimal points up and compare digit by digit.',
  })
}

/** Round decimals with 1 decimal place to the nearest whole number. */
export function gY4RoundDec(rand: Rand): Question {
  const x = randInt(rand, 11, 98) / 10
  const r = Math.round(x)
  const answer = String(r)
  const wrongs = [r + 1, r - 1, r + 2, r - 2]
    .filter((v) => v >= 0 && v !== r)
    .slice(0, 3)
    .map(String)
  return mcq(rand, `Round ${x.toFixed(1)} to the nearest whole number.`, answer, wrongs, {
    hint: '5 or more rounds the units digit up.',
  })
}

/** 2-dp measure and money problems. */
export function gY4DecProblems(rand: Rand): Question {
  const form = rand() < 0.5
  if (form) {
    const cost = randInt(rand, 150, 800)
    const paid = cost + randInt(rand, 50, 600)
    const change = paid - cost
    const answer = money(change)
    const cands = [money(change + 100), money(change - 50), money(cost), money(change + 50)]
    return mcq(rand, `A drink costs ${money(cost)}. You pay ${money(paid)}. What change do you get?`, answer, wrongsFrom(cands, answer), {
      hint: 'Change = paid − cost.',
    })
  }
  const pa = randInt(rand, 100, 700)
  const pb = randInt(rand, 100, 700)
  const total = pa + pb
  const answer = money(total)
  const cands = [money(total + 100), money(total - 100), money(Math.abs(pa - pb)), money(total + 50)]
  return mcq(rand, `${money(pa)} + ${money(pb)} = ?`, answer, wrongsFrom(cands.filter((c) => c !== answer), answer), {
    hint: 'Add the pence first.',
  })
}

/* ========================= Unit 9 · Money ======================= */

/** Money totals and £ to pence. */
export function gY4MoneyAdd(rand: Rand): Question {
  if (rand() < 0.5) {
    const pa = randInt(rand, 150, 900)
    const pb = randInt(rand, 150, 900)
    const total = pa + pb
    const answer = money(total)
    const cands = [money(total + 100), money(Math.abs(pa - pb)), money(total - 100), money(total + 50)]
    return mcq(rand, `${money(pa)} + ${money(pb)} = ?`, answer, wrongsFrom(cands.filter((c) => c !== answer), answer), {
      hint: 'Add the pence, then the pounds.',
    })
  }
  const pounds = randInt(rand, 1, 20)
  const pence = randInt(rand, 1, 99)
  return {
    kind: 'type-number',
    prompt: `How many pence is ${money(pounds * 100 + pence)}?`,
    answer: pounds * 100 + pence,
    hint: 'The pounds are whole hundreds of pence.',
  }
}

/** Compare money: differences and which costs the most. */
export function gY4MoneyCompare(rand: Rand): Question {
  if (rand() < 0.5) {
    const pa = randInt(rand, 300, 999)
    const pb = randInt(rand, 100, pa - 101)
    return {
      kind: 'type-number',
      prompt: `How many pence more is ${money(pa)} than ${money(pb)}?`,
      answer: pa - pb,
      hint: `Work in pence: ${pa} − ${pb}.`,
    }
  }
  const vals = new Set<number>()
  while (vals.size < 3) vals.add(randInt(rand, 50, 1500))
  const arr = [...vals]
  const best = Math.max(...arr)
  const answer = money(best)
  const listed = shuffle(rand, arr).map(money).join(', ')
  return mcq(rand, `Which costs the most?  ${listed}`, answer, wrongsFrom(arr.filter((v) => v !== best).map(money), answer), {
    hint: 'Compare pounds first, then pence.',
  })
}

/** Giving change. */
export function gY4MoneyChange(rand: Rand): Question {
  const cost = randInt(rand, 200, 1500)
  const paid = cost + randInt(rand, 50, 1500)
  const change = paid - cost
  const answer = money(change)
  const cands = [money(change + 100), money(change + 50), money(change - 50), money(cost)]
  return mcq(rand, `You buy an item for ${money(cost)} and pay with ${money(paid)}. How many pence change do you get?`, answer, wrongsFrom(cands.filter((c) => c !== answer), answer), {
    hint: 'Change = paid − cost.',
  })
}

/** Multi-step money stories and coin counts. */
export function gY4MoneyStory(rand: Rand): Question {
  if (rand() < 0.6) {
    const start = randInt(rand, 200, 900)
    const earn = randInt(rand, 100, 600)
    const spend = randInt(rand, 50, start + earn - 50)
    const left = start + earn - spend
    const answer = money(left)
    const cands = [money(left + 100), money(left - 50), money(start), money(left + 50)]
    return mcq(rand, `You had ${money(start)}. You earned ${money(earn)}. Then you spent ${money(spend)}. How much do you have left?`, answer, wrongsFrom(cands.filter((c) => c !== answer), answer), {
      hint: 'Add first, then take away.',
    })
  }
  const n = randInt(rand, 2, 15)
  return {
    kind: 'type-number',
    prompt: `How many 20p coins make ${money(n * 200)}?`,
    answer: n * 10,
    hint: `${money(n * 200)} is ${n * 200} pence.`,
  }
}

/* ========================== Unit 10 · Time ====================== */

const TIME_PAIRS: readonly { from: string; to: string; k: number; v: (rand: Rand) => number }[] = [
  { from: 'hours', to: 'minutes', k: 60, v: (rand: Rand) => randInt(rand, 1, 12) },
  { from: 'minutes', to: 'seconds', k: 60, v: (rand: Rand) => randInt(rand, 2, 15) },
  { from: 'years', to: 'months', k: 12, v: (rand: Rand) => randInt(rand, 1, 8) },
  { from: 'weeks', to: 'days', k: 7, v: (rand: Rand) => randInt(rand, 2, 10) },
]

/** Convert time units both directions. */
export function gY4TimeConvert(rand: Rand): Question {
  const pair = pick(rand, TIME_PAIRS)
  const v = pair.v(rand)
  if (rand() < 0.5) {
    return {
      kind: 'type-number',
      prompt: `How many ${pair.to} in ${v} ${pair.from}?`,
      answer: v * pair.k,
      hint: `${v} ${pair.from} × ${pair.k} = ?`,
    }
  }
  const answer = String(v)
  const wrongs = [v - 1, v + 1, v + 2].map(String)
  return mcq(rand, `How many ${pair.from} in ${v * pair.k} ${pair.to}?`, answer, wrongsFrom(wrongs, answer), {
    hint: `Divide by ${pair.k}.`,
  })
}

/** 12-hour and 24-hour clocks, both directions. */
export function gY4Time24(rand: Rand): Question {
  const form = randInt(rand, 0, 2)
  const m = randInt(rand, 0, 11) * 5
  if (form === 0) {
    const h24 = randInt(rand, 13, 23)
    const h12 = h24 - 12
    const answer = `${h12}:${pad2(m)} pm`
    const wrongs = [
      `${h12}:${pad2(m)} am`,
      `${h12 + 1}:${pad2(m)} pm`,
      `${h12 - 1 < 1 ? 12 : h12 - 1}:${pad2(m)} pm`,
    ]
    return mcq(rand, `The clock shows ${h24}:${pad2(m)}. What is this time on a 12-hour clock?`, answer, wrongs, {
      hint: 'After midday, take 12 away and write pm.',
    })
  }
  if (form === 1) {
    const h12 = randInt(rand, 6, 11)
    const answer = `${pad2(h12)}:${pad2(m)}`
    const wrongs = [
      `${h12 + 12}:${pad2(m)}`,
      `${pad2(h12 - 1)}:${pad2(m)}`,
      `${pad2(h12 + 1)}:${pad2(m)}`,
    ]
    return mcq(rand, `It is ${h12}:${pad2(m)} am. What is that time on the 24-hour clock?`, answer, wrongs, {
      hint: 'Morning times keep their digits — pad with a zero.',
    })
  }
  const h12 = randInt(rand, 1, 10)
  const answer = `${h12 + 12}:${pad2(m)}`
  const wrongs = [`${pad2(h12)}:${pad2(m)}`, `${h12 + 11}:${pad2(m)}`, `${h12 + 13}:${pad2(m)}`]
  return mcq(rand, `It is ${h12}:${pad2(m)} pm. What is that time on the 24-hour clock?`, answer, wrongs, {
    hint: 'Afternoon times add 12.',
  })
}

/** Durations in minutes. */
export function gY4Duration(rand: Rand): Question {
  const startH = randInt(rand, 6, 17)
  const startM = randInt(rand, 0, 3) * 15
  const dur = randInt(rand, 1, 8) * 15
  const endTotal = startH * 60 + startM + dur
  const endH = Math.floor(endTotal / 60)
  const endM = endTotal % 60
  return {
    kind: 'type-number',
    prompt: `A film starts at ${pad2(startH)}:${pad2(startM)} and ends at ${pad2(endH)}:${pad2(endM)}. How many minutes long is it?`,
    answer: dur,
    hint: 'Count on from the start time to the end time.',
  }
}

const ORDINALS = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth']

/** Timetables: nth departure and departures in a span. */
export function gY4Timetable(rand: Rand): Question {
  const every = pick(rand, [10, 15, 20, 30])
  const start = randInt(rand, 6, 19) * 60 + randInt(rand, 0, 3) * 15
  const show = (t: number): string => `${pad2(Math.floor(t / 60))}:${pad2(t % 60)}`
  if (rand() < 0.5) {
    const nth = randInt(rand, 2, 6)
    const when = start + (nth - 1) * every
    const answer = show(when)
    const wrongs = [show(when + every), show(when - every), show(when + 2 * every)]
    return mcq(
      rand,
      `Buses leave at ${show(start)}, then every ${every} minutes. What time is the ${ORDINALS[nth]} bus?`,
      answer,
      wrongs,
      { hint: `Add ${every} minutes for each bus after the first.` },
    )
  }
  const span = every * randInt(rand, 2, 6)
  const end = start + span
  return {
    kind: 'type-number',
    prompt: `Buses run from ${show(start)} to ${show(end)}, leaving every ${every} minutes. How many buses leave in total, counting the first one?`,
    answer: span / every + 1,
    hint: 'Count the first bus, then add one for each extra slot.',
  }
}

/* ======================= Unit 11 · Measures ===================== */

/** Convert length units (km/m/cm/mm). */
export function gY4ConvertLength(rand: Rand): Question {
  const pairs = [
    { a: 'km', b: 'm', k: 1000, v: () => randInt(rand, 2, 12) },
    { a: 'm', b: 'cm', k: 100, v: () => randInt(rand, 2, 15) },
    { a: 'cm', b: 'mm', k: 10, v: () => randInt(rand, 3, 25) },
  ]
  const pair = pick(rand, pairs)
  const v = pair.v()
  if (rand() < 0.5) {
    return { kind: 'type-number', prompt: `${v} ${pair.a} = ? ${pair.b}`, answer: v * pair.k, hint: `1 ${pair.a} = ${pair.k} ${pair.b}.` }
  }
  const answer = String(v)
  const wrongs = [String(v - 1), String(v + 1), String(v * 10)]
  return mcq(rand, `${v * pair.k} ${pair.b} = ? ${pair.a}`, answer, wrongsFrom(wrongs, answer), {
    hint: `Divide by ${pair.k}.`,
  })
}

/** Convert mass and capacity units (kg/g, l/ml). */
export function gY4ConvertMass(rand: Rand): Question {
  const pairs = [
    { a: 'kg', b: 'g', k: 1000, v: () => randInt(rand, 1, 15) },
    { a: 'l', b: 'ml', k: 1000, v: () => randInt(rand, 1, 8) },
  ]
  const pair = pick(rand, pairs)
  const v = pair.v()
  if (rand() < 0.5) {
    return { kind: 'type-number', prompt: `${v} ${pair.a} = ? ${pair.b}`, answer: v * pair.k, hint: `1 ${pair.a} = ${pair.k} ${pair.b}.` }
  }
  const answer = String(v)
  const wrongs = [v - 1, v + 1, v + 2].map(String)
  return mcq(rand, `${v * pair.k} ${pair.b} = ? ${pair.a}`, answer, wrongsFrom(wrongs, answer), {
    hint: `Divide by ${pair.k}.`,
  })
}

/** Perimeter of rectangles and rectilinear figures. */
export function gY4Perimeter4(rand: Rand): Question {
  if (rand() < 0.5) {
    const w = randInt(rand, 3, 25)
    const h = randInt(rand, 3, 18)
    return {
      kind: 'type-number',
      prompt: `A rectangle measures ${w} cm by ${h} cm. What is its perimeter in cm?`,
      answer: 2 * (w + h),
      hint: 'Add all four sides.',
    }
  }
  const W = randInt(rand, 6, 20)
  const H = randInt(rand, 6, 16)
  const n = randInt(rand, 2, W - 3)
  const m = randInt(rand, 2, H - 3)
  const sides = [H, W - n, m, n, H - m, W]
  return {
    kind: 'type-number',
    prompt: `A rectilinear shape has sides ${sides.join(', ')} cm. What is its perimeter in cm?`,
    answer: 2 * (W + H),
    hint: 'Add every side once — a corner cut does not change the perimeter.',
  }
}

/** Area by counting squares (rectangles and cut-out shapes). */
export function gY4Area(rand: Rand): Question {
  if (rand() < 0.5) {
    const rows = randInt(rand, 3, 12)
    const cols = randInt(rand, 3, 14)
    return {
      kind: 'type-number',
      prompt: `A rectangle on a square grid is ${rows} squares tall and ${cols} squares wide. How many squares inside?`,
      answer: rows * cols,
      hint: 'Rows × columns.',
    }
  }
  const W = randInt(rand, 6, 14)
  const H = randInt(rand, 6, 12)
  let n = randInt(rand, 2, Math.min(5, W - 2))
  let m = randInt(rand, 2, Math.min(5, H - 2))
  if (W * H - n * m < 10) { n = 2; m = 2 }
  return {
    kind: 'type-number',
    prompt: `A shape on a square grid is ${W} by ${H} squares with an ${n} by ${m} square cut out of one corner. How many squares inside the shape?`,
    answer: W * H - n * m,
    hint: 'Count the whole rectangle, then take away the cut.',
  }
}

/* ==================== Unit 12 · Shapes & angles ================= */

const TRI_KINDS = ['isosceles triangle', 'equilateral triangle', 'scalene triangle', 'right-angled triangle']

function scaleneTriple(rand: Rand): [number, number, number] {
  for (let i = 0; i < 80; i++) {
    const a = randInt(rand, 3, 14)
    let b = randInt(rand, 3, 14)
    if (b === a) b = b === 14 ? 3 : b + 1
    const c = randInt(rand, 3, 17)
    if (c === a || c === b) continue
    const s = [a, b, c].sort((x, y) => x - y)
    if (s[0] + s[1] <= s[2]) continue
    if (s[0] * s[0] + s[1] * s[1] === s[2] * s[2]) continue
    return [a, b, c]
  }
  return [4, 6, 7]
}

/** Classify triangles from their sides. */
export function gY4Triangles(rand: Rand): Question {
  if (rand() < 0.7) {
    const kind = randInt(rand, 0, 2)
    let sides: number[]
    if (kind === 0) {
      const a = randInt(rand, 3, 15)
      let b = randInt(rand, 3, 15)
      if (b === a) b = a === 15 ? 3 : a + 1
      sides = [a, a, b]
    } else if (kind === 1) {
      const a = randInt(rand, 3, 15)
      sides = [a, a, a]
    } else {
      sides = scaleneTriple(rand)
    }
    const display = shuffle(rand, sides).join(' cm, ') + ' cm'
    return mcq(rand, `A triangle has sides ${display}. Which type of triangle is it?`, TRI_KINDS[kind], shuffle(rand, TRI_KINDS.filter((_, i) => i !== kind)).slice(0, 3), {
      hint: 'Compare the side lengths.',
    })
  }
  const rows = [
    ['Which triangle has exactly 2 equal sides?', 'isosceles triangle'],
    ['Which triangle has all 3 sides equal?', 'equilateral triangle'],
    ['Which triangle has NO equal sides?', 'scalene triangle'],
  ]
  const [prompt, answer] = pick(rand, rows)
  return mcq(rand, prompt, answer, shuffle(rand, TRI_KINDS.filter((k) => k !== answer)).slice(0, 3), {
    hint: 'Name the triangle by its sides.',
  })
}

const QUAD_KINDS = ['square', 'rectangle', 'rhombus', 'trapezium', 'parallelogram']

/** Classify quadrilaterals from their properties. */
export function gY4Quads(rand: Rand): Question {
  const type = randInt(rand, 0, 4)
  let prompt: string
  let answer: string
  if (type === 0) {
    const a = randInt(rand, 3, 15)
    prompt = `A quadrilateral has 4 equal sides of ${a} cm and 4 right angles. Which shape is it?`
    answer = 'square'
  } else if (type === 1) {
    const a = randInt(rand, 3, 15)
    let b = randInt(rand, 3, 15)
    if (b === a) b = a === 15 ? 3 : a + 1
    prompt = `A quadrilateral has sides ${a} cm, ${b} cm, ${a} cm, ${b} cm and 4 right angles. Which shape is it?`
    answer = 'rectangle'
  } else if (type === 2) {
    const a = randInt(rand, 3, 15)
    prompt = `A quadrilateral has 4 equal sides of ${a} cm but NO right angles. Which shape is it?`
    answer = 'rhombus'
  } else if (type === 3) {
    const p = randInt(rand, 4, 16)
    let q = randInt(rand, 4, 16)
    if (q === p) q = p === 16 ? 4 : p + 1
    prompt = `A quadrilateral has EXACTLY one pair of parallel sides (${p} cm and ${q} cm). Which shape is it?`
    answer = 'trapezium'
  } else {
    const a = randInt(rand, 4, 15)
    let b = randInt(rand, 4, 15)
    if (b === a) b = a === 15 ? 4 : a + 1
    prompt = `A quadrilateral has 2 pairs of parallel sides (${a} cm and ${b} cm), opposite sides equal, and NO right angles. Which shape is it?`
    answer = 'parallelogram'
  }
  return mcq(rand, prompt, answer, shuffle(rand, QUAD_KINDS.filter((k) => k !== answer)).slice(0, 3), {
    hint: 'Use the properties: sides, parallel pairs and right angles.',
  })
}

/** Order four angles from smallest to largest (or back). */
export function gY4Angles(rand: Rand): OrderQuestion {
  const pool = [10, 20, 30, 45, 55, 70, 85, 90, 105, 120, 135, 150, 165, 170, 25, 40, 60, 75, 95, 110, 125, 140, 155]
  const chosen = shuffle(rand, pool).slice(0, 4)
  const asc = rand() < 0.5
  const sorted = [...chosen].sort((x, y) => (asc ? x - y : y - x))
  return {
    kind: 'order',
    prompt: asc ? 'Order these angles from smallest to largest:' : 'Order these angles from largest to smallest:',
    items: sorted.map((a) => `${a}°`),
    hint: 'Compare each angle with a right angle (90°).',
  }
}

/** Spot acute, obtuse and right angles. */
export function gY4AngleType(rand: Rand): Question {
  const type = pick(rand, ['acute', 'obtuse', 'right'])
  const acute = randInt(rand, 5, 44)
  const acute2 = randInt(rand, 45, 85)
  const obtuse = randInt(rand, 91, 130)
  const obtuse2 = randInt(rand, 131, 175)
  let answer: string
  let wrongs: string[]
  if (type === 'acute') {
    answer = `${acute}°`
    wrongs = [`${obtuse}°`, '90°', `${obtuse2}°`]
  } else if (type === 'obtuse') {
    answer = `${obtuse}°`
    wrongs = [`${acute}°`, '90°', `${acute2}°`]
  } else {
    answer = '90°'
    wrongs = [`${acute}°`, `${obtuse}°`, `${acute2}°`]
  }
  const label = type === 'acute' ? 'an ACUTE' : type === 'obtuse' ? 'an OBTUSE' : 'a RIGHT'
  return mcq(rand, `Which of these is ${label} angle?`, answer, wrongs, {
    hint: type === 'acute' ? 'Smaller than a right angle.' : type === 'obtuse' ? 'Bigger than a right angle but less than 180°.' : 'A quarter turn: 90°.',
  })
}

/** Lines of symmetry of common shapes. */
export function gY4Symmetry4(rand: Rand): Question {
  const shapes: readonly (readonly [string, number])[] = [
    ['square', 4], ['rectangle', 2], ['equilateral triangle', 3], ['isosceles triangle', 1],
    ['scalene triangle', 0], ['parallelogram', 0], ['rhombus', 2], ['regular pentagon', 5],
    ['regular hexagon', 6], ['regular octagon', 8],
  ]
  const [name, n] = pick(rand, shapes)
  return {
    kind: 'type-number',
    prompt: `How many lines of symmetry does a ${name} have?`,
    answer: n,
    hint: 'Fold the shape along a line — the two halves must match exactly.',
  }
}

/* ================ Unit 13 · Position & direction ================ */

function corner(x: number, y: number): string {
  return `(${x}, ${y})`
}

/** Read and write first-quadrant coordinates. */
export function gY4Coordinates(rand: Rand): Question {
  const x = randInt(rand, 0, 9)
  const y = randInt(rand, 0, 9)
  if (rand() < 0.5) {
    const answer = corner(x, y)
    const ny = y > 0 ? y - 1 : y + 1
    const nx = x > 0 ? x - 1 : x + 1
    const cands = [corner(y, x), corner(x, ny), corner(nx, y), corner(x < 9 ? x + 1 : x - 1, y)]
    return mcq(rand, `A point is ${x} across and ${y} up from the corner. What are its coordinates?`, answer, wrongsFrom(cands, answer), {
      hint: 'Coordinates are written as (across, up).',
    })
  }
  const answer = `${x} across, ${y} up`
  const ny = y > 0 ? y - 1 : y + 1
  const nx = x > 0 ? x - 1 : x + 1
  const cands = [`${y} across, ${x} up`, `${nx} across, ${y} up`, `${x} across, ${ny} up`, `${x + 1 > 9 ? x - 1 : x + 1} across, ${y} up`]
  return mcq(rand, `How far across and up is the point ${corner(x, y)}?`, answer, wrongsFrom(cands, answer), {
    hint: 'First number = across, second = up.',
  })
}

/** Translations: move left/right and up/down. */
export function gY4Translation(rand: Rand): Question {
  const dx = randInt(rand, 1, 3)
  const dy = randInt(rand, 1, 3)
  const dirX = rand() < 0.5 ? 'left' : 'right'
  const dirY = rand() < 0.5 ? 'up' : 'down'
  const sx = dirX === 'left' ? randInt(rand, dx, 9) : randInt(rand, 1, 9 - dx)
  const sy = dirY === 'down' ? randInt(rand, dy, 9) : randInt(rand, 1, 9 - dy)
  const nx = sx + (dirX === 'right' ? dx : -dx)
  const ny = sy + (dirY === 'up' ? dy : -dy)
  const answer = corner(nx, ny)
  const cands = [
    corner(ny, nx),
    corner(nx < 9 ? nx + 1 : nx - 1, ny),
    corner(nx, ny > 0 ? ny - 1 : ny + 1),
    corner(nx > 0 ? nx - 1 : nx + 1, ny),
  ]
  return mcq(
    rand,
    `Start at ${corner(sx, sy)}. Move ${dx} ${dirX} and ${dy} ${dirY}. Where does the point end?`,
    answer,
    wrongsFrom(cands, answer),
    { hint: 'Change the across number first, then the up number.' },
  )
}

/** Complete a rectangle when three corners are given. */
export function gY4CompleteShape(rand: Rand): Question {
  const w = randInt(rand, 2, 4)
  const h = randInt(rand, 2, 4)
  const x1 = randInt(rand, 1, 9 - w)
  const y1 = randInt(rand, 1, 9 - h)
  const x2 = x1 + w
  const y2 = y1 + h
  const all = [corner(x1, y1), corner(x1, y2), corner(x2, y1), corner(x2, y2)]
  const missIdx = randInt(rand, 0, 3)
  const answer = all[missIdx]
  const shown = all.filter((_, i) => i !== missIdx)
  return mcq(
    rand,
    `Three corners of a rectangle are at ${shown.join(', ')}. What are the coordinates of the missing corner?`,
    answer,
    wrongsFrom(all.filter((c) => c !== answer), answer),
    { hint: 'The corners share their across and up numbers in pairs.' },
  )
}

/** Describe a move between two positions. */
export function gY4DescribeMove(rand: Rand): Question {
  if (rand() < 0.6) {
    const horizontal = rand() < 0.5
    const dist = randInt(rand, 1, 4)
    const pos = randInt(rand, 1, 8 - dist)
    const dir = rand() < 0.5
    let from: string
    let to: string
    let answer: string
    let wrongs: string[]
    if (horizontal) {
      const fx = dir ? pos : pos + dist
      const tx = dir ? pos + dist : pos
      from = corner(fx, pos)
      to = corner(tx, pos)
      answer = dir ? `${dist} right` : `${dist} left`
      wrongs = [dir ? `${dist} left` : `${dist} right`, `${dist} up`, `${dist} down`]
    } else {
      const fy = dir ? pos : pos + dist
      const ty = dir ? pos + dist : pos
      from = corner(pos, fy)
      to = corner(pos, ty)
      answer = dir ? `${dist} up` : `${dist} down`
      wrongs = [dir ? `${dist} down` : `${dist} up`, `${dist} left`, `${dist} right`]
    }
    return mcq(rand, `A point moves from ${from} to ${to}. Which move did it make?`, answer, wrongs, {
      hint: 'Only one of the two numbers changes.',
    })
  }
  const dx = randInt(rand, 1, 4)
  const dy = randInt(rand, 1, 4)
  const dirX = rand() < 0.5 ? 'left' : 'right'
  const dirY = rand() < 0.5 ? 'up' : 'down'
  const sx = dirX === 'left' ? randInt(rand, dx, 9) : randInt(rand, 1, 9 - dx)
  const sy = dirY === 'down' ? randInt(rand, dy, 9) : randInt(rand, 1, 9 - dy)
  const tx = sx + (dirX === 'right' ? dx : -dx)
  const ty = sy + (dirY === 'up' ? dy : -dy)
  const oppX = dirX === 'right' ? 'left' : 'right'
  const oppY = dirY === 'up' ? 'down' : 'up'
  const answer = `${dx} ${dirX} and ${dy} ${dirY}`
  const cands = [
    `${dx} ${dirX} and ${dy} ${oppY}`,
    `${dx} ${oppX} and ${dy} ${dirY}`,
    `${dy} ${dirX} and ${dx} ${dirY}`,
    `${dx + 1} ${dirX} and ${dy} ${dirY}`,
  ]
  return mcq(
    rand,
    `A point moves from ${corner(sx, sy)} to ${corner(tx, ty)}. Which move did it make?`,
    answer,
    wrongsFrom(cands, answer),
    { hint: 'Read the across change, then the up change.' },
  )
}

/* ======================= Unit 14 · Statistics ==================== */

const DATA_CONTEXTS: readonly (readonly [string, 'discrete' | 'continuous'])[] = [
  ['The temperature outside, recorded every hour', 'continuous'],
  ['The number of books on each shelf', 'discrete'],
  ['A child’s height, measured every month', 'continuous'],
  ['The eye colours of pupils in a class', 'discrete'],
  ['The time taken to finish a race', 'continuous'],
  ['The favourite flavours chosen by a class', 'discrete'],
  ['The distance run each day for a month', 'continuous'],
  ['The number of siblings each child has', 'discrete'],
  ['The volume of water in a tank over a day', 'continuous'],
  ['The types of birds seen in a garden', 'discrete'],
  ['A plant’s height, measured each week', 'continuous'],
  ['The number of children in each class', 'discrete'],
]

/** Discrete or continuous data — true/false keeps the statements out of bank tier. */
export function gY4DataKind(rand: Rand): Question {
  const [ctx, kind] = pick(rand, DATA_CONTEXTS)
  const truth = rand() < 0.5
  const shown = truth ? kind : kind === 'discrete' ? 'continuous' : 'discrete'
  return {
    kind: 'truefalse',
    prompt: 'Discrete or continuous? Decide if the statement is true.',
    statement: `${ctx} is ${shown} data.`,
    answer: truth,
    hint: 'Countable whole values are discrete; measured values that vary smoothly are continuous.',
  }
}

const BAR_CATS = ['Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple']

/** Bar charts: totals, differences and the biggest bar. */
export function gY4BarChart4(rand: Rand): Question {
  const form = randInt(rand, 0, 2)
  const [c1, c2, c3, c4] = shuffle(rand, BAR_CATS)
  if (form === 0) {
    const a = randInt(rand, 20, 60)
    const b = randInt(rand, 5, a - 1)
    return {
      kind: 'type-number',
      prompt: `A bar chart shows ${c1}: ${a} and ${c2}: ${b}. How many more ${c1} than ${c2}?`,
      answer: a - b,
      hint: 'Find both bars, then take away.',
    }
  }
  if (form === 1) {
    const a = randInt(rand, 8, 40)
    const b = randInt(rand, 8, 40)
    const c = randInt(rand, 8, 40)
    return {
      kind: 'type-number',
      prompt: `A bar chart shows ${c1}: ${a}, ${c2}: ${b} and ${c3}: ${c}. How many in total?`,
      answer: a + b + c,
      hint: 'Read all three bars and add them up.',
    }
  }
  const cats = [c1, c2, c3, c4]
  const vals: Record<string, number> = {}
  for (const c of cats) vals[c] = randInt(rand, 8, 40)
  const best = cats.reduce((x, y) => (vals[x] >= vals[y] ? x : y))
  const listed = cats.map((c) => `${c}: ${vals[c]}`).join(', ')
  return mcq(rand, `A bar chart shows ${listed}. Which category has the tallest bar?`, best, cats.filter((c) => c !== best), {
    hint: 'The tallest bar shows the biggest number.',
  })
}

/** Time graphs: change over time. */
export function gY4TimeGraph4(rand: Rand): Question {
  const t1 = `${pad2(randInt(rand, 7, 18))}:00`
  const t2 = `${pad2(Number(t1.slice(0, 2)) + 1)}:00`
  const v1 = randInt(rand, 5, 30)
  const v2 = v1 + randInt(rand, 2, 25)
  if (rand() < 0.5) {
    return {
      kind: 'type-number',
      prompt: `A time graph shows ${v1} cars at ${t1} and ${v2} cars at ${t2}. How many MORE at ${t2}?`,
      answer: v2 - v1,
      hint: 'Read both points, then take away.',
    }
  }
  return {
    kind: 'type-number',
    prompt: `A time graph shows ${v1} cars at ${t1} and ${v2} cars at ${t2}. How many cars at both times altogether?`,
    answer: v1 + v2,
    hint: 'Add the two points together.',
  }
}

/** Pictograms: what one picture is worth. */
export function gY4Pictogram4(rand: Rand): Question {
  const key = pick(rand, [2, 5, 10])
  const n = randInt(rand, 3, 9)
  return {
    kind: 'type-number',
    prompt: `On a pictogram, 1 picture stands for ${key} books. There are ${n} pictures. How many books?`,
    answer: key * n,
    hint: `Count in ${key}s, ${n} times.`,
  }
}

/** Data tables: read rows and compare. */
export function gY4TableRead4(rand: Rand): Question {
  const days = shuffle(rand, ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']).slice(0, 3)
  if (rand() < 0.5) {
    const v1 = randInt(rand, 15, 50)
    const v2 = randInt(rand, 5, v1 - 1)
    const v3 = randInt(rand, 5, 45)
    return {
      kind: 'type-number',
      prompt: `A table shows ${days[0]}: ${v1}, ${days[1]}: ${v2}, ${days[2]}: ${v3}. How many more on ${days[0]} than ${days[1]}?`,
      answer: v1 - v2,
      hint: 'Find the two rows you need, then take away.',
    }
  }
  const v1 = randInt(rand, 6, 40)
  const v2 = randInt(rand, 6, 40)
  const v3 = randInt(rand, 6, 40)
  return {
    kind: 'type-number',
    prompt: `A table shows ${days[0]}: ${v1}, ${days[1]}: ${v2}, ${days[2]}: ${v3}. How many on ${days[0]} and ${days[1]} together?`,
    answer: v1 + v2,
    hint: 'Read the two rows and add them.',
  }
}
