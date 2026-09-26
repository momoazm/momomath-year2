import type { Question } from './types'
import { hashString, mulberry32, type Rand } from './rng'

export type Gen = (rand: Rand) => Question

/** Payload-only identity of a question: two serves are the SAME question when
 *  they ask the same thing with the same answer, regardless of choice/pair
 *  shuffle order. Used to keep one lesson queue (and one unit-activity run)
 *  free of repeats — PLAN 119. */
export function questionKey(q: Question): string {
  switch (q.kind) {
    case 'mcq':
      return `mcq:${q.prompt}|${visualKeyOf(q.visual)}|${q.choices[q.answerIndex] ?? ''}`
    case 'type-number':
      return `num:${q.prompt}|${String(q.answer)}|${visualKeyOf(q.visual)}`
    case 'match':
      return `match:${q.prompt}|${[...q.pairs]
        .map((p) => `${p.left}=${p.right}`)
        .sort()
        .join(',')}`
    case 'order':
      return `order:${q.prompt}|${q.items.join('>')}`
    case 'tap-count':
      return `tap:${q.prompt}|${visualKeyOf(q.visual)}`
    case 'letter-tiles':
      return `tiles:${q.prompt}|${q.targetWord}`
    case 'truefalse':
      return `tf:${q.statement}|${q.answer}`
    case 'speak':
      return `speak:${q.prompt}|${q.targetText}`
  }
}

function visualKeyOf(v: Question['visual']): string {
  if (!v) return 'none'
  switch (v.type) {
    case 'emoji-group':
      return `eg:${v.emojis.join(',')}`
    case 'ten-frames':
      return `tf10:${v.count}`
    case 'number-line':
      return `nl:${v.from}-${v.to}@${v.mark}`
    case 'shapes':
      return `sh:${v.shape}x${v.count}`
    case 'fraction':
      return `fr:${v.filled}/${v.slices}`
    case 'clock':
      return `cl:${v.hour}:${v.minute}`
  }
}

/** Materialization budget per generator: stop after this many draws total... */
const MAT_CAP = 400
/** ...or after this many consecutive draws with a repeated key (pool saturated). */
const MAT_PLATEAU = 100

/** Deterministic per (lessonId, seed) question queue with in-queue dedupe.
 *  Each generator's reachable distinct pool is materialized ONCE (up to
 *  MAT_CAP draws / MAT_PLATEAU saturation, then shuffled) and slots consume
 *  unseen entries — preferred generator first (slot i prefers
 *  `gens[i % gens.length]`, last slot prefers `challenge`), then the others.
 *  Because one materialized rare key serves ANY slot, skewed generators can
 *  no longer gamble a slot away to retries: a repeat is accepted only when
 *  every pool is genuinely exhausted (tiny pools) — zero-duplicate queues are
 *  structural whenever the pools hold ≥ n distinct questions. Exactly `n`
 *  questions; throws only if every generator throws. (PLAN 119/126/129.) */
export function buildLessonQueue(
  lessonId: string,
  seed: number,
  n: number,
  gens: Gen[],
  challenge?: Gen,
  exclude?: ReadonlySet<string>,
): Question[] {
  if (!gens.length) throw new Error(`lesson ${lessonId}: no generators`)
  if (n <= 0) return []
  const rand = mulberry32(hashString(lessonId) ^ (seed * 2654435761))

  const materialize = (gen: Gen): { q: Question; k: string }[] => {
    const pool: { q: Question; k: string }[] = []
    const keys = new Set<string>()
    let sinceNew = 0
    for (let i = 0; i < MAT_CAP && sinceNew < MAT_PLATEAU; i++) {
      let q: Question
      try {
        q = gen(rand)
      } catch {
        sinceNew++ // a throwing draw never empties the budget (MAT_CAP bounds it)
        continue
      }
      const k = questionKey(q)
      if (keys.has(k)) {
        sinceNew++
        continue
      }
      keys.add(k)
      pool.push({ q, k })
      sinceNew = 0
    }
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }
    return pool
  }

  type Pool = { items: { q: Question; k: string }[]; cur: number }
  const pools: Pool[] = gens.map((g) => ({ items: materialize(g), cur: 0 }))
  const chPool: Pool | null = challenge ? { items: materialize(challenge), cur: 0 } : null

  const seen = new Set<string>(exclude) // cross-batch dedupe (battle refills — PLAN 127)
  const takeUnseen = (p: Pool): { q: Question; k: string } | null => {
    while (p.cur < p.items.length) {
      const it = p.items[p.cur++]
      if (!seen.has(it.k)) return it
    }
    return null
  }

  const out: Question[] = []
  for (let i = 0; i < n; i++) {
    const isLast = i === n - 1
    const intendedGen = isLast ? (challenge ?? gens[(n - 1) % gens.length]) : gens[i % gens.length]
    const intended: Pool = isLast && chPool ? chPool : pools[i % pools.length]
    const order: Pool[] = [intended]
    for (let k = 0; k < pools.length; k++) {
      const p = pools[(i + k) % pools.length]
      if (p !== intended) order.push(p)
    }
    let chosen: { q: Question; k: string } | null = null
    for (const p of order) {
      chosen = takeUnseen(p)
      if (chosen) break
    }
    if (chosen) {
      seen.add(chosen.k)
      out.push(chosen.q)
    } else {
      out.push(intendedGen(rand)) // every pool exhausted — accept a repeat
    }
  }
  return out
}
