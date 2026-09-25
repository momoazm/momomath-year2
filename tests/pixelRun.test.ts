import { describe, expect, it } from 'vitest'
import { ARCADE_GAMES } from '../src/engine/arcade'
import { RUN, GATE_COUNT, gateX, computeRunScore, planFeatures, GATE_CLEAR, COIN_GAP_AFTER, SPIKE_W, COIN_SIZE, COIN_SPACING } from '../src/components/arcade/PixelRun'
import { makeMathQuestion } from '../src/content/arcadeMath'
import { usePlayer } from '../src/engine/store'
import { STAR_THRESHOLDS } from '../src/engine/cards'

describe('Pixel Run registration', () => {
  it('is the 4th arcade game with subject math', () => {
    expect(ARCADE_GAMES).toHaveLength(4)
    const g = ARCADE_GAMES.find((x) => x.id === 'pixel-run')
    expect(g).toBeDefined()
    expect(g!.subject).toBe('math')
    expect(g!.title).toBe('Pixel Run')
  })
})

describe('gate layout', () => {
  it('places gates every GATE_EVERY px, all before the finish', () => {
    expect(GATE_COUNT).toBeGreaterThanOrEqual(5)
    for (let i = 0; i < GATE_COUNT; i++) {
      expect(gateX(i)).toBe(RUN.GATE_EVERY * (i + 1))
      expect(gateX(i)).toBeLessThan(RUN.FINISH_X - 200)
    }
    expect(gateX(GATE_COUNT)).toBeGreaterThanOrEqual(RUN.FINISH_X - 200)
  })
})

describe('computeRunScore', () => {
  it('is distance/10 + coins×10 + gates×50', () => {
    expect(computeRunScore(0, 0, 0, false)).toBe(0)
    expect(computeRunScore(100, 0, 0, false)).toBe(10)
    expect(computeRunScore(100, 3, 2, false)).toBe(10 + 30 + 100)
    expect(computeRunScore(-50, 0, 0, false)).toBe(0)
  })
  it('adds the finish bonus only when finished', () => {
    const base = computeRunScore(6400, 5, 7, false)
    const done = computeRunScore(6400, 5, 7, true)
    expect(done - base).toBe(RUN.FINISH_BONUS)
  })
  it('subtracts 30 per wrong gate answer and never goes below 0', () => {
    expect(computeRunScore(100, 0, 0, false, 1)).toBe(0) // 10 - 30 → clamp
    expect(computeRunScore(1000, 0, 1, false, 1)).toBe(100 + 50 - 30)
    expect(computeRunScore(1000, 0, 0, false, 5)).toBe(0)
  })
  it('is monotonic in every positive input', () => {
    expect(computeRunScore(200, 0, 0, false)).toBeGreaterThan(computeRunScore(100, 0, 0, false))
    expect(computeRunScore(100, 1, 0, false)).toBeGreaterThan(computeRunScore(100, 0, 0, false))
    expect(computeRunScore(100, 0, 1, false)).toBeGreaterThan(computeRunScore(100, 0, 0, false))
    expect(computeRunScore(100, 0, 0, true)).toBeGreaterThan(computeRunScore(100, 0, 0, false))
    expect(computeRunScore(100, 0, 0, false, 1)).toBeLessThan(computeRunScore(100, 0, 0, false, 0))
  })
})

describe('planFeatures layout', () => {
  const bounds = (e: ReturnType<typeof planFeatures>['ents'][number]) =>
    e.kind === 'spike' ? ([e.x, e.x + SPIKE_W] as const) : ([e.x, e.x + COIN_SIZE] as const)

  it('never places features inside a gate clearance zone', () => {
    const { ents } = planFeatures(Math.random, 0, RUN.FINISH_X - 200)
    expect(ents.length).toBeGreaterThan(0)
    for (const e of ents) {
      const [x0, x1] = bounds(e)
      for (let i = 0; i < GATE_COUNT; i++) {
        const g = gateX(i)
        const overlaps = x0 < g + GATE_CLEAR && x1 > g - GATE_CLEAR
        expect(overlaps).toBe(false)
      }
    }
  })
  it('keeps at least 100px clearance between a coin arc and any spike', () => {
    const { ents } = planFeatures(Math.random, 0, RUN.FINISH_X - 200)
    const spikes = ents.filter((e) => e.kind === 'spike')
    const arcs = ents.filter((e) => e.kind === 'coin')
    expect(spikes.length).toBeGreaterThan(0)
    expect(arcs.length).toBeGreaterThan(0)
    // group coin x per arc (contiguous runs within COIN_SPACING*2)
    const arcSpans: Array<[number, number]> = []
    let s: number | null = null
    let prev = -Infinity
    for (const c of arcs) {
      if (s === null || c.x - prev > COIN_SPACING * 2) {
        if (s !== null) arcSpans.push([s, prev + COIN_SIZE])
        s = c.x
      }
      prev = c.x
    }
    if (s !== null) arcSpans.push([s, prev + COIN_SIZE])
    expect(arcSpans.length).toBeGreaterThan(0)
    for (const [a0, a1] of arcSpans) {
      for (const sp of spikes) {
        const gap = sp.x >= a1 ? sp.x - a1 : a0 - (sp.x + SPIKE_W)
        expect(gap).toBeGreaterThanOrEqual(100)
      }
    }
  })
  it('returns a cursor at/after untilX (or gated by finish)', () => {
    const until = 2000
    const { nextX } = planFeatures(Math.random, 700, until)
    expect(nextX).toBeGreaterThanOrEqual(until - 200)
    expect(nextX).toBeLessThanOrEqual(RUN.FINISH_X)
    expect(COIN_GAP_AFTER).toBeGreaterThanOrEqual(100)
  })
  it('never spawns past the finish-140 cutoff', () => {
    const { ents } = planFeatures(Math.random, RUN.FINISH_X - 300, RUN.FINISH_X)
    for (const e of ents) {
      expect(e.x).toBeLessThan(RUN.FINISH_X - 140)
    }
  })
})

describe('gate questions', () => {
  it('makeMathQuestion always yields 4 unique options incl. the answer', () => {
    for (let s = 0; s < 50; s++) {
      let seed = s + 1
      const rand = () => {
        seed = (seed * 16807) % 2147483647
        return seed / 2147483647
      }
      const q = makeMathQuestion(rand)
      expect(q.options).toHaveLength(4)
      expect(new Set(q.options).size).toBe(4)
      expect(q.options).toContain(q.answer)
      expect(q.text).toMatch(/^\d+ [+\-×] \d+$/)
    }
  })
})

describe('Bean unlock still needs all 3 subjects', () => {
  it('scoring only in Pixel Run (math) does not grant Bean', () => {
    usePlayer.setState({
      cardStars: { ...usePlayer.getState().cardStars, bean: 0 },
      arcadeScores: { 'pixel-run': 500 },
    })
    expect(usePlayer.getState().checkArcadeCards()).toEqual([])
    expect(usePlayer.getState().cardStars.bean ?? 0).toBe(0)
  })
  it('scoring in one game per subject grants Bean', () => {
    usePlayer.setState({
      cardStars: { ...usePlayer.getState().cardStars, bean: 0 },
      // boss-rush + pixel-run are both maths, lab-blitz supplies science
      arcadeScores: { 'boss-rush': 100, 'word-rescue': 100, 'lab-blitz': 100, 'pixel-run': 400 },
    })
    const granted = usePlayer.getState().checkArcadeCards()
    expect(granted).toContain('bean')
    expect(usePlayer.getState().cardStars.bean).toBe(STAR_THRESHOLDS[0])
  })
})
