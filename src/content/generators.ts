import type {
  MatchQuestion,
  McqQuestion,
  OrderQuestion,
  Question,
  TapCountQuestion,
  TypeNumberQuestion,
} from './types'
import { pick, randInt, shuffle, type Rand } from './rng'
import { questionEmojiBank } from './types'

/* ============================ helpers ============================ */

const NUM_WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight',
  'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen',
  'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
]

export function numWord(n: number): string {
  if (n <= 20) return NUM_WORDS[n]
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
  if (n < 100 && n % 10 === 0) return tens[Math.floor(n / 10)]
  if (n < 100) return `${tens[Math.floor(n / 10)]}-${NUM_WORDS[n % 10]}`
  return String(n)
}

function numDistractors(rand: Rand, answer: number, spread = 1): string[] {
  const deltas = [spread, -spread, spread * 2, -spread * 2, 10, -10]
  const set = new Set<number>()
  let i = 0
  while (set.size < 3 && i < deltas.length * 3) {
    const d = deltas[i % deltas.length] + (i >= deltas.length ? randInt(rand, 1, 3) : 0)
    const cand = answer + d
    if (cand !== answer && cand >= 0) set.add(cand)
    i++
  }
  return [...set].map(String)
}

export function mcq(
  rand: Rand,
  prompt: string,
  answer: string,
  distractors: string[],
  extra?: Partial<McqQuestion>,
): McqQuestion {
  const choices = shuffle(rand, [answer, ...distractors.slice(0, 3)])
  return {
    kind: 'mcq',
    prompt,
    choices,
    answerIndex: choices.indexOf(answer),
    ...extra,
  }
}

const emojis = (rand: Rand, n: number) =>
  Array.from({ length: n }, () => pick(rand, questionEmojiBank))

/* ==================== Unit 1 · Numbers to 100 ==================== */

const COUNT_TARGETS = ['🍎', '⭐', '🎈', '🍪', '🐝'] as const
const COUNT_DECOYS = ['🚗', '🌻', '🐟', '🧩', '⚽'] as const

export function gCountObjects(rand: Rand): Question {
  const n = randInt(rand, 3, 12)
  const decoyN = randInt(rand, 2, Math.min(5, n))
  const targetEmoji = pick(rand, COUNT_TARGETS)
  const cells = shuffle(rand, [
    ...Array<string>(n).fill(targetEmoji),
    ...Array.from({ length: decoyN }, () => pick(rand, COUNT_DECOYS)),
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

export function gOneMoreLess(rand: Rand): Question {
  const n = randInt(rand, 5, 89)
  const more = rand() < 0.5
  const ans = more ? n + 1 : n - 1
  return mcq(
    rand,
    more ? `What is 1 more than ${n}?` : `What is 1 less than ${n}?`,
    String(ans),
    numDistractors(rand, ans),
  )
}

export function gTensOnes(rand: Rand): Question {
  const tens = randInt(rand, 1, 9)
  const ones = randInt(rand, 0, 9)
  const n = tens * 10 + ones
  return {
    kind: 'type-number',
    prompt: `${tens} ten${tens > 1 ? 's' : ''} and ${ones} one${ones === 1 ? '' : 's'} make which number?`,
    visual: { type: 'ten-frames', count: n },
    answer: n,
    hint: 'Tens first, then add the ones.',
  }
}

export function gCompare(rand: Rand): Question {
  let a = randInt(rand, 10, 99)
  let b = randInt(rand, 10, 99)
  if (a === b) b = b > 50 ? b - 7 : b + 7
  const sym = a > b ? '>' : a < b ? '<' : '='
  return mcq(
    rand,
    `Which sign is missing?   ${a} ☐ ${b}`,
    sym,
    ['>', '<', '='].filter((s) => s !== sym),
    { hint: 'The open mouth always eats the BIGGER number!' },
  )
}

export function gOrderNumbers(rand: Rand): Question {
  const descending = rand() < 0.35
  const start = randInt(rand, 5, 88)
  const step = pick(rand, [1, 2, 5, 10])
  const items = [0, 1, 2, 3].map((i) => start + i * step)
  if (new Set(items).size !== 4 || items[3] > 99) return gOrderNumbers(rand)
  const ordered = descending ? [...items].reverse() : items
  return {
    kind: 'order',
    prompt: descending ? 'Put these numbers in order, biggest first!' : 'Put these numbers in order, smallest first!',
    items: ordered.map(String),
    hint: descending ? 'Find the biggest, then count back.' : 'Find the smallest, then count on.',
  }
}

export function gNumWords(rand: Rand): Question {
  const n = randInt(rand, 3, 40)
  const wrong = numDistractors(rand, n, rand() < 0.5 ? 1 : 10).map((w) => numWord(Number(w)))
  return mcq(rand, `Which word shows the number ${n}?`, numWord(n), wrong)
}

/* ===================== Unit 2 · Addition ========================= */

export function gBonds10(rand: Rand): Question {
  const a = randInt(rand, 1, 9)
  const ans = 10 - a
  return {
    kind: 'type-number',
    prompt: `${a} + ? = 10`,
    answer: ans,
    hint: 'How many more fingers make a full pair of hands?',
  }
}

export function gAddWithin20(rand: Rand): Question {
  const a = randInt(rand, 2, 10)
  const b = randInt(rand, 2, Math.min(10, 20 - a))
  const ans = a + b
  return {
    kind: 'type-number',
    prompt: `${a} + ${b} = ?`,
    visual: { type: 'emoji-group', emojis: emojis(rand, Math.min(ans, 12)) },
    answer: ans,
  }
}

/** Doubles - a core Year-2 mental strategy (e.g. double 6 = 12). */
export function gDoubles(rand: Rand): Question {
  const n = randInt(rand, 2, 25)
  const isDouble = rand() < 0.65
  if (isDouble) {
    return {
      kind: 'type-number',
      prompt: `What is DOUBLE ${n}?`,
      answer: n * 2,
      hint: 'Doubling means adding the number to itself.',
    }
  }
  return {
    kind: 'type-number',
    prompt: `${n * 2} is double which number?`,
    answer: n,
    hint: 'Halve it - share into 2 equal groups.',
  }
}

export function gAddTwoDigitPlus1(rand: Rand): Question {
  const a = randInt(rand, 11, 88)
  const b = randInt(rand, 1, 9)
  if (a % 10 + b >= 10) return gAddTwoDigitPlus1(rand) // lesson promises: no crossing tens
  return { kind: 'type-number', prompt: `${a} + ${b} = ?`, answer: a + b }
}

export function gAddTwoDigitPairs(rand: Rand): Question {
  const a = randInt(rand, 12, 69)
  const b = randInt(rand, 12, 29)
  if (a + b > 99 || (a % 10) + (b % 10) >= 10) return gAddTwoDigitPairs(rand)
  return { kind: 'type-number', prompt: `${a} + ${b} = ?`, answer: a + b, hint: 'Add the tens first, then the ones.' }
}

/** Two-digit addition that MUST cross a ten (carry), sums up to 199. */
export function gAddTwoDigitCarry(rand: Rand): Question {
  const a = randInt(rand, 15, 89)
  const b = randInt(rand, 15, 99)
  if ((a % 10) + (b % 10) < 10 || a + b > 199) return gAddTwoDigitCarry(rand)
  return {
    kind: 'type-number',
    prompt: `${a} + ${b} = ?`,
    answer: a + b,
    hint: 'The ones make more than ten - carry to the tens!',
  }
}

/** Big friendly numbers: hundreds and tens, answers up to about 990. */
export function gAddBigNumbers(rand: Rand): Question {
  const v = randInt(rand, 0, 2)
  if (v === 0) {
    const a = randInt(rand, 1, 8) * 100
    const b = randInt(rand, 1, 9 - a / 100) * 100
    return { kind: 'type-number', prompt: `${a} + ${b} = ?`, answer: a + b, hint: 'Count in hundreds.' }
  }
  if (v === 1) {
    const a = randInt(rand, 1, 8) * 100 + randInt(rand, 1, 8) * 10
    const b = randInt(rand, 1, 8) * 10
    return { kind: 'type-number', prompt: `${a} + ${b} = ?`, answer: a + b, hint: 'Hundreds with hundreds, tens with tens.' }
  }
  const a = randInt(rand, 2, 7) * 100 + pick(rand, [20, 30, 40, 50])
  const b = randInt(rand, 11, 89)
  return { kind: 'type-number', prompt: `${a} + ${b} = ?`, answer: a + b, hint: 'Partition the small number into tens and ones.' }
}

export function gAddWordProblem(rand: Rand): Question {
  const e = pick(rand, ['🍎 apples', '🎈 balloons', '⚽ balls', '🍪 cookies'])
  const a = randInt(rand, 12, 68)
  const b = randInt(rand, 5, Math.min(30, 98 - a))
  const who = pick(rand, ['Sonic', 'Amy', 'Knuckles', 'Shadow'])
  return {
    kind: 'type-number',
    prompt: `${who} has ${a} ${e}. Tails gives ${who} ${b} more. How many ${e} now?`,
    answer: a + b,
    hint: 'Joining together means ADD.',
  }
}

/* ============== Missing numbers & inverses (harder reasoning) ====== */

/** a + ? = c with 2-digit numbers (find the missing part). */
export function gMissingAddend(rand: Rand): Question {
  const a = randInt(rand, 5, 78)
  const ans = randInt(rand, 5, Math.min(90 - a, 60))
  return {
    kind: 'type-number',
    prompt: `${a} + ? = ${a + ans}`,
    answer: ans,
    hint: 'How far is it from the first number up to the total?',
  }
}

/** Missing number in subtraction, both directions: c − ? = r and ? − b = r. */
export function gMissingPart(rand: Rand): Question {
  if (rand() < 0.5) {
    const r = randInt(rand, 4, 50)
    const b = randInt(rand, 5, 49)
    return { kind: 'type-number', prompt: `${r + b} − ? = ${r}`, answer: b, hint: 'What did we take away?' }
  }
  const b = randInt(rand, 12, 60)
  const r = randInt(rand, 4, 38)
  return { kind: 'type-number', prompt: `? − ${b} = ${r}`, answer: b + r, hint: 'Add back to find the start.' }
}

/** Which expression is MORE? Comparing two sums without computing exactly. */
export function gCompareSums(rand: Rand): Question {
  const s = () => [randInt(rand, 11, 58), randInt(rand, 11, 41)] as const
  let A = s(), B = s()
  while (A[0] + A[1] === B[0] + B[1]) B = s()
  const left = `${A[0]} + ${A[1]}`, right = `${B[0]} + ${B[1]}`
  const leftSum = A[0] + A[1], rightSum = B[0] + B[1]
  const answer = leftSum > rightSum ? left : right
  return mcq(
    rand,
    'Which one is MORE?',
    answer,
    leftSum > rightSum ? [right] : [left],
    { hint: 'Add the tens first to compare quickly!' },
  )
}

/** Inverse times tables: 5 × ? = 35 (uses tables 2, 5, 10). */
export function gInverseTimes(rand: Rand): Question {
  const table = pick(rand, [2, 5, 10])
  const b = randInt(rand, 2, 10)
  return {
    kind: 'type-number',
    prompt: `${table} × ? = ${table * b}`,
    answer: b,
    hint: `How many groups of ${table} make ${table * b}?`,
  }
}

/** Doubling two-digit numbers (double 34 = 68). */
export function gDoubleTwoDigit(rand: Rand): Question {
  const n = randInt(rand, 13, 99)
  if (rand() < 0.5) {
    return { kind: 'type-number', prompt: `What is DOUBLE ${n}?`, answer: n * 2, hint: `Double ${n - n % 10} first, then double the ones.` }
  }
  return { kind: 'type-number', prompt: `${n * 2} is double which number?`, answer: n, hint: 'Halve it - split into tens and ones.' }
}

/* ==================== Unit 3 · Subtraction ======================= */

export function gSubWithin20(rand: Rand): Question {
  const a = randInt(rand, 8, 20)
  const b = randInt(rand, 1, a - 2)
  return { kind: 'type-number', prompt: `${a} − ${b} = ?`, answer: a - b }
}

export function gSubFrom2Digit(rand: Rand): Question {
  const a = randInt(rand, 25, 99)
  const b = randInt(rand, 1, 9)
  if (a % 10 - b < 0) return gSubFrom2Digit(rand)
  return { kind: 'type-number', prompt: `${a} − ${b} = ?`, answer: a - b }
}

export function gSubTens(rand: Rand): Question {
  const a = randInt(rand, 4, 9) * 10
  const b = randInt(rand, 1, 3) * 10
  return { kind: 'type-number', prompt: `${a} − ${b} = ?`, answer: a - b, hint: 'Take away whole tens.' }
}

export function gDifferenceProblem(rand: Rand): Question {
  const who = pick(rand, ['Sonic', 'Tails', 'Amy'])
  const a = randInt(rand, 15, 60)
  const b = randInt(rand, 5, a - 5)
  return {
    kind: 'type-number',
    prompt: `${who} scored ${a} points. A rival racer scored ${b}. How many MORE points does ${who} have?`,
    answer: a - b,
    hint: '"How many more?" means find the DIFFERENCE (subtract).',
  }
}

/* ================== Unit 4 · Multiply & Divide =================== */

export function gSkipSequence(rand: Rand): Question {
  const step = pick(rand, [2, 5, 10])
  const start = step * randInt(rand, 1, Math.max(1, Math.floor(24 / step)))
  const seq = [start, start + step, start + 2 * step]
  const ans = start + 3 * step
  return mcq(
    rand,
    `${seq.join(', ')}, … what comes next when counting in ${step}s?`,
    String(ans),
    numDistractors(rand, ans, step),
  )
}

/** Ten more / ten less on 2-digit numbers (place value fluency). */
export function gTenMoreLess(rand: Rand): Question {
  const n = randInt(rand, 13, 88)
  const more = rand() < 0.5
  const ans = more ? n + 10 : n - 10
  return mcq(
    rand,
    more ? `What is 10 more than ${n}?` : `What is 10 less than ${n}?`,
    String(ans),
    numDistractors(rand, ans, 10),
    { hint: 'Only the tens digit changes!' },
  )
}

/** Number bonds to 20. */
export function gBondsTo20(rand: Rand): Question {
  const a = randInt(rand, 1, 19)
  return { kind: 'type-number', prompt: `${a} + ? = 20`, answer: 20 - a, hint: 'How many more make 20?' }
}

/** Two-digit + two-digit bonds to 100 (43 + ? = 100). */
export function gTensBond100(rand: Rand): Question {
  const a = randInt(rand, 11, 89)
  return { kind: 'type-number', prompt: `${a} + ? = 100`, answer: 100 - a, hint: 'Ones make 10, tens make 90.' }
}

/** Division as grouping: how many groups of b fit into the total? */
export function gGroupingDivision(rand: Rand): Question {
  const b = pick(rand, [2, 5, 10])
  const k = randInt(rand, 2, 10)
  return {
    kind: 'type-number',
    prompt: `How many groups of ${b} are there in ${b * k}?`,
    answer: k,
    hint: `Keep taking away ${b}s and count.`,
  }
}

/** Multiplication written as repeated addition: 3 + 3 + 3 = 9. */
export function gRepeatedAddition(rand: Rand): Question {
  const table = pick(rand, [2, 5, 10])
  const groups = randInt(rand, 2, 6)
  const parts = Array.from({ length: groups }, () => table)
  return {
    kind: 'type-number',
    prompt: `${parts.join(' + ')} = ?`,
    answer: table * groups,
    hint: `Same as ${table} × ${groups}.`,
  }
}

/* ================ Symmetry & sorting (Stage 2 geometry/data) ======= */

const SYMMETRY_MCQ: { prompt: string; answer: string; wrong: string[] }[] = [
  { prompt: 'Which letter has a line of symmetry?', answer: 'A', wrong: ['P', 'F', 'G'] },
  { prompt: 'Which letter has a line of symmetry?', answer: 'M', wrong: ['J', 'R', 'S'] },
  { prompt: 'Which letter has NO line of symmetry?', answer: 'F', wrong: ['A', 'O', 'W'] },
  { prompt: 'Which letter has NO line of symmetry?', answer: 'R', wrong: ['M', 'T', 'U'] },
  { prompt: 'How many lines of symmetry does a SQUARE have?', answer: '4', wrong: ['1', '2', '3'] },
  { prompt: 'How many lines of symmetry does a RECTANGLE have?', answer: '2', wrong: ['1', '4', '0'] },
  { prompt: 'How many lines of symmetry does an EQUILATERAL TRIANGLE have?', answer: '3', wrong: ['1', '2', '6'] },
]

export function gSymmetry(rand: Rand): Question {
  const f = pick(rand, SYMMETRY_MCQ)
  return mcq(rand, f.prompt, f.answer, shuffle(rand, f.wrong), { hint: 'Picture folding it - do both halves match exactly?' })
}

/** Carroll-diagram style sorting with computed answers. */
export function gSortingDiagrams(rand: Rand): Question {
  const n = randInt(rand, 11, 98)
  if (n === 50) return gSortingDiagrams(rand) // 50 is neither less nor greater than 50
  const even = n % 2 === 0
  const small = n < 50
  const parity = even ? 'even' : 'odd'
  const side = small ? 'less than 50' : 'greater than 50'
  const otherParity = even ? 'odd' : 'even'
  const otherSide = small ? 'greater than 50' : 'less than 50'
  return mcq(
    rand,
    `In our sorting diagram, where does the number ${n} go?`,
    `${parity} and ${side}`,
    [`${otherParity} and ${side}`, `${parity} and ${otherSide}`, `${otherParity} and ${otherSide}`],
    { hint: 'Check BOTH rules: odd/even, then compare with 50.' },
  )
}

/* ===================== Temperature (measure strand) ================ */

const TEMP_MCQ: { prompt: string; answer: string; wrong: string[] }[] = [
  { prompt: 'Water freezes at…', answer: '0°C', wrong: ['10°C', '100°C', '-50°C'] },
  { prompt: 'Water boils at…', answer: '100°C', wrong: ['0°C', '50°C', '10°C'] },
  { prompt: 'A hot sunny day is about…', answer: '30°C', wrong: ['0°C', '5°C', '60°C'] },
  { prompt: 'Your body temperature is about…', answer: '37°C', wrong: ['10°C', '80°C', '0°C'] },
  { prompt: 'We measure temperature with…', answer: 'A thermometer', wrong: ['A ruler', 'A scale', 'A clock'] },
]

export function gTemperature(rand: Rand): Question {
  if (rand() < 0.45) {
    const low = randInt(rand, 0, 3) * 10
    return {
      kind: 'type-number',
      prompt: `The thermometer is halfway between ${low}°C and ${low + 10}°C. What does it read?`,
      answer: low + 5,
      hint: 'Halfway between two marks.',
    }
  }
  const f = pick(rand, TEMP_MCQ)
  return mcq(rand, f.prompt, f.answer, shuffle(rand, f.wrong))
}

/* =================== Time to five minutes & durations ============== */

const MIN_WORDS: Record<number, string> = {
  5: 'five', 10: 'ten', 20: 'twenty', 25: 'twenty-five',
  35: 'twenty-five', 40: 'twenty', 50: 'ten', 55: 'five',
}

export function gTimeFiveMin(rand: Rand): Question {
  const hour = randInt(rand, 1, 12)
  const minute = pick(rand, [5, 10, 20, 25, 35, 40, 50, 55])
  const to = minute > 30
  const label = to
    ? `${MIN_WORDS[minute]} to ${(hour % 12) + 1}`
    : `${MIN_WORDS[minute]} past ${hour}`
  const candidates = [
    `five past ${(hour % 12) + 1}`,
    `quarter to ${hour === 12 ? 1 : hour}`,
    `half past ${hour}`,
    `twenty to ${(hour % 12) + 1}`,
    `ten past ${hour}`,
    `quarter past ${(hour % 12) + 1}`,
  ]
  const wrongLabels = shuffle(rand, candidates.filter((w) => w !== label))
  return mcq(rand, 'What time does the clock show?', label, wrongLabels.slice(0, 3), {
    visual: { type: 'clock', hour, minute },
    hint: to ? 'Past the half - count DOWN to the next hour.' : 'Before the half - count UP from the hour.',
  })
}

const DURATION_MCQ: { prompt: string; answer: string; wrong: string[] }[] = [
  { prompt: 'Brushing your teeth takes about…', answer: '2 minutes', wrong: ['2 seconds', '2 hours', '2 days'] },
  { prompt: 'A school day lasts about…', answer: '6 hours', wrong: ['6 minutes', '6 weeks', '60 hours'] },
  { prompt: 'A good night\'s sleep is about…', answer: '10 hours', wrong: ['10 minutes', '10 days', '10 weeks'] },
  { prompt: 'A football match lasts about…', answer: '90 minutes', wrong: ['90 hours', '9 days', '90 seconds'] },
  { prompt: 'One blink of your eyes takes about…', answer: '1 second', wrong: ['1 hour', '1 minute', '1 day'] },
  { prompt: 'A banana grows ripe after being picked in about…', answer: 'a few days', wrong: ['a few years', 'a few seconds', 'a few months'] },
]

export function gDurationUnits(rand: Rand): Question {
  const f = pick(rand, DURATION_MCQ)
  return mcq(rand, f.prompt, f.answer, shuffle(rand, f.wrong), { hint: 'Would you count it in seconds, minutes, hours or days?' })
}

/* ==================== Equivalent fraction facts ==================== */

const EQUIV_BANK: { prompt: string; answer: string; wrong: string[] }[] = [
  { prompt: 'Two quarters of a pizza is the same as…', answer: 'one half', wrong: ['one whole', 'one third', 'three quarters'] },
  { prompt: 'Four quarters of a pizza is the same as…', answer: 'one whole', wrong: ['one half', 'one third', 'two thirds'] },
  { prompt: 'How many HALVES make one whole?', answer: '2', wrong: ['3', '4', '1'] },
  { prompt: 'How many QUARTERS make one whole?', answer: '4', wrong: ['2', '3', '8'] },
  { prompt: 'How many QUARTERS make one HALF?', answer: '2', wrong: ['1', '3', '4'] },
  { prompt: 'One half of my cake is the same as…', answer: 'two quarters', wrong: ['one quarter', 'three quarters', 'one third'] },
]

export function gEquivFractions(rand: Rand): Question {
  const f = pick(rand, EQUIV_BANK)
  return mcq(rand, f.prompt, f.answer, shuffle(rand, f.wrong), { hint: 'Cut it smaller: more pieces, same amount!' })
}

export function gTimesTable(rand: Rand): Question {
  const table = pick(rand, [2, 5, 10])
  const b = randInt(rand, 1, 10)
  const ans = table * b
  return mcq(
    rand,
    `${table} × ${b} = ?`,
    String(ans),
    numDistractors(rand, ans, table === 10 ? 10 : table),
    { hint: `Count in ${table}s!` },
  )
}

export function gArrayVisual(rand: Rand): Question {
  const rows = randInt(rand, 2, 5)
  const cols = randInt(rand, 2, 5)
  return {
    kind: 'type-number',
    prompt: `${rows} rows of ${cols} stars. How many stars altogether?`,
    visual: { type: 'shapes', shape: '⭐', count: rows * cols },
    answer: rows * cols,
    hint: `${rows} × ${cols}, or count in ${cols}s.`,
  }
}

export function gSharing(rand: Rand): Question {
  const plates = randInt(rand, 2, 5)
  const each = randInt(rand, 1, 6)
  const total = plates * each
  return {
    kind: 'type-number',
    prompt: `${total} 🍪 shared equally between ${plates} plates. How many on each plate?`,
    answer: each,
    hint: 'Sharing equally means DIVIDE.',
  }
}

export function gOddEven(rand: Rand): Question {
  const n = randInt(rand, 1, 40)
  const isEven = n % 2 === 0
  return mcq(
    rand,
    `Is ${n} odd or even?`,
    isEven ? 'Even' : 'Odd',
    [isEven ? 'Odd' : 'Even'],
    { hint: 'Look at the last digit! Even numbers end in 0, 2, 4, 6, 8.' },
  )
}

export function gMatchNumWords(rand: Rand): MatchQuestion {
  const nums = shuffle(rand, [5, 8, 12, 15, 20, 30, 40, 50, 60]).slice(0, 3)
  return {
    kind: 'match',
    prompt: 'Match each numeral to its word!',
    pairs: nums.map((n) => ({ left: String(n), right: numWord(n) })),
    hint: 'Say each word slowly and listen for the tens.',
  }
}

/* ===================== Unit 5 · Fractions ======================== */

export function gShadedFractionName(rand: Rand): Question {
  const slices = pick(rand, [2, 3, 4])
  const filled = slices === 4 ? randInt(rand, 1, 3) : 1
  const names: Record<number, string> = { 2: 'one half', 3: 'one third', 4: filled === 2 ? 'two quarters' : filled === 3 ? 'three quarters' : 'one quarter' }
  const labels: Record<number, string[]> = {
    2: ['one third', 'one quarter'],
    3: ['one half', 'one quarter'],
    // 2/4 IS one half - never offer the equivalent fraction as a wrong choice
    4: filled === 2 ? ['one third', 'three quarters'] : ['one half', 'one third'],
  }
  return mcq(
    rand,
    `The pizza has ${slices} equal slices and ${filled} ${filled === 1 ? 'is' : 'are'} eaten. How much is eaten?`,
    names[slices],
    labels[slices],
    { visual: { type: 'fraction', slices, filled } },
  )
}

export function gHalfOfNumber(rand: Rand): Question {
  const half = randInt(rand, 2, 20)
  const n = half * 2
  return {
    kind: 'type-number',
    prompt: `What is HALF of ${n}?`,
    answer: half,
    hint: 'Share into 2 equal groups.',
  }
}

export function gQuarterOfNumber(rand: Rand): Question {
  const q = randInt(rand, 1, 8)
  const n = q * 4
  return {
    kind: 'type-number',
    prompt: `What is a QUARTER of ${n}?`,
    answer: q,
    hint: 'Share into 4 equal groups.',
  }
}

export function gFractionOfSet(rand: Rand): Question {
  const groups = pick(rand, [2, 3])
  const each = randInt(rand, 2, 5)
  const total = groups * each
  const fracName = groups === 2 ? 'half' : 'third'
  return {
    kind: 'type-number',
    prompt: `${total} ⭐ shared into ${groups} equal groups. What is ONE ${fracName} of ${total}?`,
    answer: each,
    hint: `One ${fracName} = one of the ${groups} equal groups.`,
  }
}

/* ================ Unit 6 · Shapes & Position ===================== */

const SHAPE_FACTS: { prompt: string; answer: string; wrong: string[] }[] = [
  { prompt: 'How many sides does a triangle have?', answer: '3', wrong: ['4', '5', '6'] },
  { prompt: 'How many sides does a square have?', answer: '4', wrong: ['3', '5', '6'] },
  { prompt: 'How many sides does a pentagon have?', answer: '5', wrong: ['4', '6', '7'] },
  { prompt: 'How many sides does a hexagon have?', answer: '6', wrong: ['5', '7', '8'] },
  { prompt: 'Which shape has 3 corners?', answer: 'Triangle', wrong: ['Square', 'Circle', 'Hexagon'] },
  { prompt: 'Which shape is round with no corners?', answer: 'Circle', wrong: ['Square', 'Triangle', 'Rectangle'] },
  { prompt: 'A ball is like which 3D shape?', answer: 'Sphere', wrong: ['Cube', 'Cylinder', 'Cone'] },
  { prompt: 'A dice is like which 3D shape?', answer: 'Cube', wrong: ['Sphere', 'Cone', 'Cylinder'] },
  { prompt: 'An ice-cream cone is like which 3D shape?', answer: 'Cone', wrong: ['Cube', 'Sphere', 'Cuboid'] },
  { prompt: 'A tin can is like which 3D shape?', answer: 'Cylinder', wrong: ['Sphere', 'Cone', 'Pyramid'] },
  { prompt: 'How many CORNERS does a circle have?', answer: '0', wrong: ['1', '3', '4'] },
  { prompt: 'Every point on a circle is the same distance from the…', answer: 'Centre', wrong: ['Edge', 'Corner', 'Side'] },
  { prompt: 'Which shape looks like a ball?', answer: 'Sphere', wrong: ['Cube', 'Cylinder', 'Circle'] },
]

export function gShapeFacts(rand: Rand): Question {
  const f = pick(rand, SHAPE_FACTS)
  return mcq(rand, f.prompt, f.answer, shuffle(rand, f.wrong))
}

export function gTurnsDirections(rand: Rand): Question {
  const facing = pick(rand, ['⬆️ North', '➡️ East', '⬇️ South', '⬅️ West'])
  const dirMap: Record<string, Record<string, string>> = {
    '⬆️ North': { right: '➡️ East', left: '⬅️ West' },
    '➡️ East': { right: '⬇️ South', left: '⬆️ North' },
    '⬇️ South': { right: '⬅️ West', left: '➡️ East' },
    '⬅️ West': { right: '⬆️ North', left: '⬇️ South' },
  }
  const turn = rand() < 0.5 ? 'right' : 'left'
  const ans = dirMap[facing][turn].split(' ')[0]
  return mcq(
    rand,
    `Tails races ${facing}. He turns ${turn}. Which way is he facing now?`,
    ans,
    shuffle(rand, ['⬆️', '➡️', '⬇️', '⬅️'].filter((e) => e !== ans)),
  )
}

const PATTERN_UNITS: { unit: string[]; wrong: string[] }[] = [
  { unit: ['🔺', '🔵'], wrong: ['🔺', '🟢', '🟡'] },
  { unit: ['🟧', '🟪'], wrong: ['🟧', '🟢', '🟡'] },
  { unit: ['🍎', '🍎', '🍌'], wrong: ['🍎', '🍇', '🍓'] },
  { unit: ['⭐', '🌙', '🌙'], wrong: ['⭐', '☁️', '☀️'] },
  { unit: ['🐶', '🐱'], wrong: ['🐶', '🐰', '🐔'] },
  { unit: ['🔴', '🔴', '🔴', '🟢'], wrong: ['🔴', '🔵', '🟡'] },
  { unit: ['🚗', '🚗', '🚙'], wrong: ['🚗', '🚕', '🚓'] },
]

export function gPatternNext(rand: Rand): Question {
  const p = pick(rand, PATTERN_UNITS)
  // Show one full cycle plus about half of the next, so the repeating unit is
  // unmistakable and the continuation is unique.
  const shownCount = p.unit.length + Math.max(1, Math.floor(p.unit.length / 2))
  const shown = Array.from({ length: shownCount }, (_, i) => p.unit[i % p.unit.length])
  const next = p.unit[shownCount % p.unit.length]
  const wrong = p.wrong.filter((w) => w !== next)
  return mcq(
    rand,
    `${shown.join(' ')} … what comes next?`,
    next,
    shuffle(rand, wrong),
    { hint: 'Say the pattern out loud and find the repeating part.' },
  )
}

/* ====================== Unit 7 · Measures ======================== */

const MEASURE_MCQ: { prompt: string; answer: string; wrong: string[]; hint?: string }[] = [
  { prompt: 'Which is LONGER than a pencil?', answer: 'A door', wrong: ['An eraser', 'A paperclip', 'A stamp'] },
  { prompt: 'Which animal is TALLER than Sonic?', answer: 'A giraffe', wrong: ['A mouse', 'A kitten', 'A frog'] },
  { prompt: 'What would you use to measure your book?', answer: 'Centimetres (cm)', wrong: ['Kilograms (kg)', 'Litres (L)', 'Hours'] },
  { prompt: 'What would you use to measure how heavy you are?', answer: 'Kilograms (kg)', wrong: ['Centimetres (cm)', 'Litres (L)', 'Minutes'] },
  { prompt: 'What would you use to fill a water bottle?', answer: 'Millilitres (ml)', wrong: ['Centimetres (cm)', 'Grams (g)', 'Seconds'] },
  { prompt: 'Which holds MORE water?', answer: 'A bathtub', wrong: ['A cup', 'A spoon', 'A small bowl'] },
  { prompt: 'Which is HEAVIER?', answer: 'A car', wrong: ['A feather', 'A leaf', 'A pencil'] },
  { prompt: 'Half a metre equals…', answer: '50 cm', wrong: ['10 cm', '100 cm', '5 cm'] },
]

export function gMeasureFacts(rand: Rand): Question {
  const f = pick(rand, MEASURE_MCQ)
  return mcq(rand, f.prompt, f.answer, shuffle(rand, f.wrong), f.hint ? { hint: f.hint } : {})
}

export function gMeasureWordProblem(rand: Rand): Question {
  const variant = randInt(rand, 0, 2)
  if (variant === 0) {
    const pencil = randInt(rand, 10, 18)
    const diff = randInt(rand, 2, 6)
    return {
      kind: 'type-number',
      prompt: `A pencil is ${pencil} cm long. An eraser is ${diff} cm shorter. How long is the eraser?`,
      answer: pencil - diff,
      hint: 'Shorter means take away.',
    }
  }
  if (variant === 1) {
    const a = randInt(rand, 20, 60)
    const b = randInt(rand, 10, a - 5)
    return {
      kind: 'type-number',
      prompt: `Sonic's ribbon is ${a} cm. Knuckles' ribbon is ${b} cm. How much LONGER is Sonic's ribbon?`,
      answer: a - b,
      hint: 'Find the difference.',
    }
  }
  const jar = randInt(rand, 3, 8)
  return {
    kind: 'type-number',
    prompt: `A jug holds ${jar} cups of juice. Amy pours in ${jar - 1} cups. How many more cups fit?`,
    answer: 1,
    hint: 'Full capacity minus what is already inside.',
  }
}

/* ===================== Unit 8 · Time & Money ===================== */

export function gClockRead(rand: Rand): Question {
  const hour = randInt(rand, 1, 12)
  const style = randInt(rand, 0, 3)
  const minute = [0, 15, 30, 45][style]
  const label =
    style === 0 ? `${hour} o'clock`
    : style === 1 ? `quarter past ${hour}`
    : style === 2 ? `half past ${hour}`
    : `quarter to ${(hour % 12) + 1}`
  const wrongLabels = shuffle(rand, [
    `${hour} o'clock`,
    `half past ${(hour % 12) + 1}`,
    `quarter past ${(hour % 12) + 1}`,
    `quarter to ${hour === 12 ? 1 : hour}`,
  ]).filter((w) => w !== label)
  return mcq(rand, 'What time does the clock show?', label, wrongLabels.slice(0, 3), {
    visual: { type: 'clock', hour, minute },
    hint:
      style === 0 ? 'The big hand points straight up.'
      : style === 1 ? 'The big hand points to the 3.'
      : style === 2 ? 'The big hand points straight down at 30 minutes.'
      : 'The big hand points to the 9 - it is almost the next hour!',
  })
}

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function gDayOrder(rand: Rand): OrderQuestion {
  const start = randInt(rand, 0, 4)
  return {
    kind: 'order',
    prompt: 'Put the days in order, starting here!',
    items: DAY_ORDER.slice(start, start + 3),
    hint: 'Sing the days-of-the-week song in your head!',
  }
}

export function gMonthsBetween(rand: Rand): Question {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const i = randInt(rand, 0, 9)
  return mcq(
    rand,
    `Which month comes right after ${months[i]}?`,
    months[i + 1],
    shuffle(rand, [months[(i + 2) % 12], months[(i + 11) % 12], months[i]]),
  )
}

export function gCoinsTotal(rand: Rand): Question {
  const coins = pick(rand, [[1, 1, 2], [2, 5], [5, 5, 2], [1, 2, 2], [10, 5], [2, 2, 1]])
  const total = coins.reduce((a, c) => a + c, 0)
  return {
    kind: 'type-number',
    prompt: `You have these coins: ${coins.map((c) => c + 'p').join(' + ')}. How much money altogether?`,
    answer: total,
    hint: 'Start with the biggest coin and count on.',
  }
}

export function gChangeFrom(rand: Rand): Question {
  const from = pick(rand, [20, 50, 100])
  const cost = randInt(rand, 5, from - 5)
  const paid = from === 100 ? '£1' : `${from}p`
  return {
    kind: 'type-number',
    prompt: `A toy costs ${cost}p. You pay with ${paid}. How much change do you get?`,
    answer: from - cost,
    hint: 'Change = money paid − price.',
  }
}

/** Extended tables for the challenge lessons: ×2 ×3 ×4 ×5 ×10 up to 12. */
export function gTimesTableExtended(rand: Rand): Question {
  const table = pick(rand, [2, 5, 10])
  const b = randInt(rand, 3, 12)
  const ans = table * b
  return mcq(
    rand,
    `${table} × ${b} = ?`,
    String(ans),
    numDistractors(rand, ans, table),
    { hint: `Count in ${table}s!` },
  )
}

/** Two-digit minus two-digit, no borrowing needed (Stage 2 mental method). */
export function gSubTwoDigit(rand: Rand): Question {
  const a = randInt(rand, 35, 99)
  const bTens = randInt(rand, 1, Math.floor(a / 10) - 1)
  const bOnes = randInt(rand, 0, a % 10)
  const b = bTens * 10 + bOnes
  if (b < 11) return gSubTwoDigit(rand)
  return { kind: 'type-number', prompt: `${a} − ${b} = ?`, answer: a - b, hint: 'Tens first, then the ones.' }
}

/* ====================== Unit 9 · Data ============================ */

export function gTallyRead(rand: Rand): Question {
  const n = randInt(rand, 3, 12)
  const symbol = '𝍸'.repeat(Math.floor(n / 5)) + '丨'.repeat(n % 5)
  return {
    kind: 'type-number',
    prompt: `The tally shows: ${symbol}\nHow many does it show?`,
    answer: n,
    hint: 'Every 𝍸 group means 5.',
  }
}

export function gPictogram(rand: Rand): Question {
  const perPic = pick(rand, [1, 2])
  const pics = randInt(rand, 2, 5)
  const other = randInt(rand, 1, pics)
  const emoji = pick(rand, ['🍎', '⚽', '⭐'])
  return {
    kind: 'type-number',
    prompt: `In the pictogram each picture = ${perPic}. Row A has ${pics} ${emoji}; row B has ${other}. How many does row B show?`,
    answer: other * perPic,
    hint: `Multiply the pictures by ${perPic}.`,
  }
}

export function gChartCompare(rand: Rand): Question {
  const a = randInt(rand, 2, 10)
  const b = randInt(rand, 2, 10)
  if (a === b) return gChartCompare(rand)
  const hi = Math.max(a, b)
  return {
    kind: 'type-number',
    prompt: `Class chart: Team Red scored ${a} points, Team Blue scored ${b}. How many MORE did the winning team score?`,
    answer: hi - Math.min(a, b),
    hint: 'Winner minus loser = difference.',
  }
}

/* ========== Cambridge 0096 Stage 2 coverage generators ============ */

/** 2Np.04 Ordinal numbers: first, second, third, fourth. */
const ORDINALS = ['first', 'second', 'third', 'fourth']
export function gOrdinals(rand: Rand): Question {
  const lineup = shuffle(rand, ['🦔', '🦊', '🐢', '🌸']).slice(0, 4)
  const k = randInt(rand, 1, 4)
  return mcq(
    rand,
    `${lineup.join(' ')} - which emoji finished ${ORDINALS[k - 1]}?`,
    lineup[k - 1],
    lineup.filter((_, i) => i !== k - 1),
    { hint: `${k}${['st', 'nd', 'rd', 'th'][k - 1]} place!` },
  )
}

/** 2Np.05 Round a 2-digit number to the nearest 10. */
export function gRoundTen(rand: Rand): Question {
  let n = randInt(rand, 11, 99)
  while (n % 10 === 0) n = randInt(rand, 11, 99)
  const ans = Math.round(n / 10) * 10
  const wrongs = [ans + 10, ans - 10].map(String).filter((w) => w !== String(ans) && Number(w) >= 0)
  return mcq(
    rand,
    `What is ${n} rounded to the nearest 10?`,
    String(ans),
    shuffle(rand, wrongs),
    { hint: 'Look at the ones digit: 5 or more rounds UP.' },
  )
}

/** 2Nc.03 Estimate how many objects (visual group). */
export function gEstimateCount(rand: Rand): Question {
  const buckets: [number, number[]][] = [
    [5, [6, 7]], [10, [8, 9, 11, 12]], [20, [17, 18]],
  ]
  const [bucket, options] = pick(rand, buckets)
  const n = pick(rand, options)
  const emoji = pick(rand, ['⭐', '🍎', '🎈'])
  const wrongLabels = ['about 5', 'about 10', 'about 20'].filter((l) => l !== `about ${bucket}`)
  return mcq(
    rand,
    'About how many can you see? Do not count exactly!',
    `about ${bucket}`,
    wrongLabels,
    { visual: { type: 'emoji-group', emojis: emojis(rand, n) }, hint: 'Group them into fives or tens to estimate!' },
  )
}

/** 2Gg.10 How many times does a shape look identical in one full turn? */
const ROTATION_MCQ: { prompt: string; answer: string; wrong: string[] }[] = [
  { prompt: 'A SQUARE looks identical how many times in one full turn?', answer: '4', wrong: ['1', '2', '3'] },
  { prompt: 'A RECTANGLE looks identical how many times in one full turn?', answer: '2', wrong: ['1', '4', '3'] },
  { prompt: 'An EQUILATERAL TRIANGLE looks identical how many times in a full turn?', answer: '3', wrong: ['1', '2', '6'] },
  { prompt: 'A REGULAR HEXAGON looks identical how many times in a full turn?', answer: '6', wrong: ['3', '4', '8'] },
]
export function gRotationalTurns(rand: Rand): Question {
  const f = pick(rand, ROTATION_MCQ)
  return mcq(rand, f.prompt, f.answer, shuffle(rand, f.wrong), { hint: 'Spin it slowly and count each perfect match!' })
}

/** 2Sp.01/.02 Random vs regular patterns and chance language. */
const CHANCE_MCQ: { prompt: string; answer: string; wrong: string[] }[] = [
  { prompt: 'Rolling a dice - which number will land face up?', answer: 'Random - you cannot know for sure!', wrong: ['Always 6', 'Always 1', 'The same number every time'] },
  { prompt: '🔴🔵🔴🔵🔴🔵 - what kind of pattern is this?', answer: 'A regular pattern', wrong: ['A random pattern', 'No pattern at all', 'A mistake'] },
  { prompt: 'Which event is CERTAIN to happen?', answer: 'The sun rises tomorrow', wrong: ['You roll a 6 next throw', 'It rains on your birthday', 'Your toy turns into gold'] },
  { prompt: 'Which event is IMPOSSIBLE?', answer: 'A cat barks like a dog tomorrow', wrong: ['You eat food today', 'The sun sets tonight', 'You blink soon'] },
  { prompt: 'Tossing a coin gives heads or tails. This outcome is…', answer: 'Random', wrong: ['Regular', 'Certain to be heads', 'Impossible'] },
]
export function gChanceLanguage(rand: Rand): Question {
  const f = pick(rand, CHANCE_MCQ)
  return mcq(rand, f.prompt, f.answer, shuffle(rand, f.wrong))
}

/** 2Gt.01 Order and compare units of time. */
const TIME_UNITS_MCQ: { prompt: string; answer: string; wrong: string[] }[] = [
  { prompt: 'How many MINUTES are in one hour?', answer: '60', wrong: ['24', '30', '100'] },
  { prompt: 'How many HOURS are in one day?', answer: '24', wrong: ['12', '60', '36'] },
  { prompt: 'How many DAYS are in one year?', answer: '365', wrong: ['360', '12', '52'] },
  { prompt: 'Which unit of time is LONGEST?', answer: 'One year', wrong: ['One day', 'One hour', 'One minute'] },
  { prompt: 'Which unit of time is SHORTEST?', answer: 'One second', wrong: ['One minute', 'One hour', 'One day'] },
]
export function gTimeUnitsFacts(rand: Rand): Question {
  const f = pick(rand, TIME_UNITS_MCQ)
  return mcq(rand, f.prompt, f.answer, shuffle(rand, f.wrong))
}

/** 2Nm.02 Compare values of different combinations of coins. */
export function gMoneyCompare(rand: Rand): Question {
  const coins = [1, 2, 5, 10, 20, 50]
  const big = pick(rand, [20, 50])
  let parts = [10, 10]
  let sum = 20
  while (sum === big || sum > 90) {
    parts = Array.from({ length: randInt(rand, 2, 3) }, () => pick(rand, coins.filter((c) => c < big)))
    sum = parts.reduce((a, c) => a + c, 0)
  }
  const labelA = `${big}p`
  const labelB = parts.map((p) => `${p}p`).join(' + ')
  const answerLabel = big > sum ? labelA : labelB
  const wrongLabel = big > sum ? labelB : labelA
  return mcq(
    rand,
    'Which pile of money has MORE?',
    answerLabel,
    [wrongLabel],
    { hint: 'Add up the small coins before you decide!' },
  )
}

/** 2Nf.06 Combine wholes, halves and quarters. */
const COMBINE_BANK: { prompt: string; answer: string; wrong: string[] }[] = [
  { prompt: 'One half + one quarter = ?', answer: 'three quarters', wrong: ['one half', 'one whole', 'two thirds'] },
  { prompt: 'One half + one half = ?', answer: 'one whole', wrong: ['one quarter', 'three quarters', 'one third'] },
  // 2/4 = 1/2, so "two halves" would also be correct - never offer equivalents
  { prompt: 'Two quarters + two quarters = ?', answer: 'one whole', wrong: ['one half', 'three quarters', 'two thirds'] },
  { prompt: 'One whole - one half = ?', answer: 'one half', wrong: ['one quarter', 'nothing at all', 'three quarters'] },
  { prompt: 'Three quarters - one quarter = ?', answer: 'one half', wrong: ['one whole', 'two thirds', 'nothing at all'] },
]
export function gCombineFractions(rand: Rand): Question {
  const f = pick(rand, COMBINE_BANK)
  return mcq(rand, f.prompt, f.answer, shuffle(rand, f.wrong), { hint: 'Picture a pizza cut into quarters!' })
}

/** 2Gp.01 Position and direction vocabulary. */
const POSITION_MCQ: { prompt: string; answer: string; wrong: string[] }[] = [
  { prompt: '🐕 🐈 🐕 - the cat is sitting ___ the dogs.', answer: 'between', wrong: ['on top of', 'inside', 'far from'] },
  { prompt: 'You walk towards the door. You are moving ___ the door.', answer: 'towards', wrong: ['away from', 'under', 'above'] },
  { prompt: 'The kite flies ___ the trees.', answer: 'above', wrong: ['below', 'between', 'behind'] },
  { prompt: 'The shoes are ___ the bed, on the floor under it.', answer: 'below', wrong: ['above', 'beside', 'around'] },
  { prompt: 'If you take two steps BACKWARDS you move…', answer: 'away from where you were facing', wrong: ['closer to where you were facing', 'in a circle only', 'upwards'] },
]
export function gPositionWords(rand: Rand): Question {
  const f = pick(rand, POSITION_MCQ)
  return mcq(rand, f.prompt, f.answer, shuffle(rand, f.wrong))
}

/** 2Gp.02 Mirror reflections swap left and right. */
const MIRROR_MCQ: { prompt: string; answer: string; wrong: string[] }[] = [
  { prompt: 'You wave your RIGHT hand at a mirror. Which hand does your reflection wave?', answer: 'Its left hand', wrong: ['Its right hand', 'Both hands', 'No hands'] },
  { prompt: 'In a mirror, a shape and its reflection are…', answer: 'The same size', wrong: ['Different sizes', 'Always upside down', 'Always spinning'] },
  { prompt: 'Hold the letter F up to a mirror. The reflection faces…', answer: 'The opposite way', wrong: ['Exactly the same way', 'Upside down only', 'It disappears'] },
]
export function gMirrorReflections(rand: Rand): Question {
  const f = pick(rand, MIRROR_MCQ)
  return mcq(rand, f.prompt, f.answer, shuffle(rand, f.wrong), { hint: 'Mirrors flip left and right - but never change size!' })
}
