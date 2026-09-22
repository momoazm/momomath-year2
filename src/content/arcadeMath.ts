/** Shared arithmetic question generator for the math arcade games
 *  (Boss Rush + Pixel Run gates). Year-2 level: +, -, × with 4 options. */
export type ArcadeQ = { text: string; answer: string; options: string[] }

/** Arithmetic question for Boss Rush / Pixel Run (year-2 level). */
export function makeMathQuestion(rand: () => number = Math.random): ArcadeQ {
  const ops = ['+', '-', '×'] as const
  const op = ops[Math.floor(rand() * ops.length)]
  let a: number, b: number, answer: number
  if (op === '+') {
    a = 1 + Math.floor(rand() * 40)
    b = 1 + Math.floor(rand() * 40)
    answer = a + b
  } else if (op === '-') {
    a = 10 + Math.floor(rand() * 40)
    b = 1 + Math.floor(rand() * Math.min(a - 1, 30))
    answer = a - b
  } else {
    a = 2 + Math.floor(rand() * 9)
    b = 2 + Math.floor(rand() * 9)
    answer = a * b
  }
  const opts = new Set<number>([answer])
  let guard = 0
  while (opts.size < 4 && guard++ < 40) {
    const delta = Math.floor(rand() * 11) - 5
    const candidate = answer + (delta === 0 ? 3 : delta)
    if (candidate >= 0) opts.add(candidate)
  }
  while (opts.size < 4) opts.add(answer + opts.size + 1)
  const shuffled = [...opts].sort(() => rand() - 0.5)
  return { text: `${a} ${op} ${b}`, answer: String(answer), options: shuffled.map(String) }
}
