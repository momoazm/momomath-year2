import { describe, expect, it } from 'vitest'
import { mulberry32 } from '../src/content/rng'
import { CARDS, ARCADE_CARDS, ALL_CARDS, rollChest, PITY_LIMIT, STAR_THRESHOLDS } from '../src/engine/cards'
import { ARCADE_GAMES } from '../src/engine/arcade'
import { usePlayer } from '../src/engine/store'

function rng(s: number) { return mulberry32(s) }
const ARCADE_IDS = new Set<string>(ARCADE_CARDS.map((c) => c.id))

describe('arcade exclusives never enter the chest pool', () => {
  it('uniform chest rolls only ever pick from the CARDS pool (never arcade exclusives)', () => {
    for (let i = 0; i < 20000; i++) {
      const r = rollChest(rng(i), 'normal', {}, 0)
      for (const c of r.cards) {
        expect(ARCADE_IDS.has(c.cardId)).toBe(false)
        expect(CARDS.some((card) => card.id === c.cardId)).toBe(true)
      }
    }
  })
  it('locked-pity drought rolls never force an arcade exclusive', () => {
    const counts: Record<string, number> = {}
    for (const c of CARDS) counts[c.id] = 5
    for (let i = 0; i < 5000; i++) {
      const r = rollChest(rng(400000 + i), 'normal', counts, PITY_LIMIT)
      for (const c of r.cards) {
        expect(ARCADE_IDS.has(c.cardId)).toBe(false)
      }
    }
  })
  it('ALL_CARDS is exactly CARDS plus the 3 exclusives with no overlap', () => {
    expect(ALL_CARDS).toHaveLength(CARDS.length + ARCADE_CARDS.length)
    expect(ALL_CARDS.filter((c) => ARCADE_IDS.has(c.id))).toHaveLength(3)
    expect(CARDS.filter((c) => ARCADE_IDS.has(c.id))).toHaveLength(0)
  })
})

describe('grantArcadeCard hands out 3 copies exactly once', () => {
  it('grants exactly one star threshold of copies on first grant', () => {
    const st = usePlayer.getState()
    usePlayer.setState({ cardStars: { ...st.cardStars, fang: 0 } })
    expect(usePlayer.getState().grantArcadeCard('fang')).toBe(true)
    expect(usePlayer.getState().cardStars.fang).toBe(STAR_THRESHOLDS[0])
  })
  it('dedupes: a second grant is refused and keeps the same count', () => {
    const st = usePlayer.getState()
    usePlayer.setState({ cardStars: { ...st.cardStars, bean: 0 } })
    expect(usePlayer.getState().grantArcadeCard('bean')).toBe(true)
    const after = usePlayer.getState().cardStars.bean
    expect(usePlayer.getState().grantArcadeCard('bean')).toBe(false)
    expect(usePlayer.getState().cardStars.bean).toBe(after)
  })
  it('refuses ids that are not arcade exclusives', () => {
    expect(usePlayer.getState().grantArcadeCard('sonic')).toBe(false)
    expect(usePlayer.getState().grantArcadeCard('not-a-card')).toBe(false)
  })
})

describe('checkArcadeCards unlock thresholds', () => {
  it('Fang unlocks on the 10th arcade round and not before', () => {
    const st = usePlayer.getState()
    usePlayer.setState({ cardStars: { ...st.cardStars, fang: 0 }, arcadeRounds: 8, arcadeBossesDown: 0, arcadeScores: {} })
    expect(usePlayer.getState().checkArcadeCards()).toEqual([])
    usePlayer.getState().recordArcadeRound('boss-rush', 0)
    usePlayer.getState().recordArcadeRound('word-rescue', 0)
    expect(usePlayer.getState().cardStars.fang).toBe(STAR_THRESHOLDS[0])
    expect(usePlayer.getState().arcadeRounds).toBe(10)
  })
  it('Bark unlocks on the 5th boss beaten in Boss Rush', () => {
    const st = usePlayer.getState()
    usePlayer.setState({ cardStars: { ...st.cardStars, bark: 0 }, arcadeRounds: 0, arcadeBossesDown: 0 })
    for (let i = 0; i < 4; i++) usePlayer.getState().recordArcadeRound('boss-rush', 1)
    expect(usePlayer.getState().cardStars.bark ?? 0).toBe(0)
    usePlayer.getState().recordArcadeRound('boss-rush', 1)
    expect(usePlayer.getState().cardStars.bark).toBe(STAR_THRESHOLDS[0])
  })
  it('Bean counts ONLY the current 3 subject games, never legacy ids', () => {
    const st = usePlayer.getState()
    usePlayer.setState({ cardStars: { ...st.cardStars, bean: 0 }, arcadeScores: { 'math-run': 999, 'number-blaster': 999 } })
    expect(usePlayer.getState().checkArcadeCards()).toEqual([])
    const scores = { ...usePlayer.getState().arcadeScores }
    for (const g of ARCADE_GAMES) scores[g.id] = 100
    usePlayer.setState({ arcadeScores: scores })
    const granted = usePlayer.getState().checkArcadeCards()
    expect(granted).toContain('bean')
    expect(usePlayer.getState().cardStars.bean).toBe(STAR_THRESHOLDS[0])
  })
  it('recordArcadeRound reports newly granted ids so the game can celebrate', () => {
    const st = usePlayer.getState()
    usePlayer.setState({ cardStars: { ...st.cardStars, fang: 0 }, arcadeRounds: 9, arcadeBossesDown: 0 })
    const granted = usePlayer.getState().recordArcadeRound('lab-blitz', 0)
    expect(granted).toEqual(['fang'])
    expect(usePlayer.getState().recordArcadeRound('lab-blitz', 0)).toEqual([])
  })
})
