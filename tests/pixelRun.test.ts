import { describe, expect, it } from 'vitest'
import { ARCADE_GAMES } from '../src/engine/arcade'
import { RUN, GATE_COUNT, gateX, computeRunScore } from '../src/components/arcade/PixelRun'
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
  it('is distance/10 + coins×10 + gates×20', () => {
    expect(computeRunScore(0, 0, 0, false)).toBe(0)
    expect(computeRunScore(100, 0, 0, false)).toBe(10)
    expect(computeRunScore(100, 3, 2, false)).toBe(10 + 30 + 40)
    expect(computeRunScore(-50, 0, 0, false)).toBe(0)
  })
  it('adds the finish bonus only when finished', () => {
    const base = computeRunScore(6400, 5, 7, false)
    const done = computeRunScore(6400, 5, 7, true)
    expect(done - base).toBe(RUN.FINISH_BONUS)
  })
  it('is monotonic in every input', () => {
    expect(computeRunScore(200, 0, 0, false)).toBeGreaterThan(computeRunScore(100, 0, 0, false))
    expect(computeRunScore(100, 1, 0, false)).toBeGreaterThan(computeRunScore(100, 0, 0, false))
    expect(computeRunScore(100, 0, 1, false)).toBeGreaterThan(computeRunScore(100, 0, 0, false))
    expect(computeRunScore(100, 0, 0, true)).toBeGreaterThan(computeRunScore(100, 0, 0, false))
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
