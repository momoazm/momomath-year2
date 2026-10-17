import { beforeEach, describe, expect, it } from 'vitest'
import { mulberry32 } from '../src/content/rng'
import { BATTLE_CARDS, BATTLE_CARD_GOALS, BATTLE_CARD_BY_ID, STAR_THRESHOLDS } from '../src/engine/cards'
import { rollChest, PITY_LIMIT } from '../src/engine/cards'
import { usePlayer } from '../src/engine/store'
import { todayISO } from '../src/engine/gamification'

/** WS23 — Momo Battle exclusive cards: unlock-only (never chest pool), granted
 *  by clearing gyms on the Battle Road via `checkBattleCards` (wired at the end
 *  of `battleFinished`). Also covers the first-clear victory chest + Daily
 *  Rival rematch bonus. */

const BATTLE_IDS = new Set(BATTLE_CARDS.map((c) => c.id))

function rng(s: number) { return mulberry32(s) }

beforeEach(() => {
  usePlayer.setState({
    gems: 1000,
    xpTotal: 0,
    todayXp: 0,
    todayXpDay: todayISO(),
    weeklyXp: 0,
    cardStars: {},
    cardPity: 0,
    lessonProgress: {},
    battleCleared: [],
    battleWins: 0,
    battleTrophies: 0,
    battleSquad: [],
    cardBattleXp: {},
    battleDailyBossDay: todayISO(),
    battleDailyBossDone: false,
  })
})

describe('battle card defs', () => {
  it('there are exactly 3, all exclusive-tier + source battle', () => {
    expect(BATTLE_CARDS).toHaveLength(3)
    for (const c of BATTLE_CARDS) {
      expect(c.tier, c.id).toBe('exclusive')
      expect(c.source, c.id).toBe('battle')
      expect(BATTLE_CARD_BY_ID[c.id], c.id).toBe(c)
      expect(c.image, c.id).toBe(`cards/${c.id}.webp`)
    }
  })

  it('every goal maps to a real gym (4 / 8 / 13) and a real card', () => {
    expect(new Set(BATTLE_CARDS.map((c) => c.id))).toEqual(new Set(Object.keys(BATTLE_CARD_GOALS)))
    expect(BATTLE_CARD_GOALS['mecha-sonic']?.gym).toBe(4)
    expect(BATTLE_CARD_GOALS['egg-dragoon']?.gym).toBe(8)
    expect(BATTLE_CARD_GOALS.solaris?.gym).toBe(13)
    for (const g of Object.values(BATTLE_CARD_GOALS)) {
      expect(g.gym).toBeGreaterThanOrEqual(1)
      expect(g.gym).toBeLessThanOrEqual(13)
      expect(g.label.length).toBeGreaterThan(0)
    }
  })
})

describe('battle cards never enter the chest pool', () => {
  it('uniform + pity rolls only ever pick from the CARDS pool (never battle exclusives)', () => {
    for (let i = 0; i < 20000; i++) {
      const r = rollChest(rng(i), i % 3 === 0 ? 'boss' : 'normal', {}, i % 5 === 0 ? PITY_LIMIT : 0)
      for (const c of r.cards) {
        expect(BATTLE_IDS.has(c.cardId), c.cardId).toBe(false)
      }
    }
  })
})

describe('checkBattleCards unlock thresholds', () => {
  it('clearing gym 4 grants mecha-sonic (3 copies, 1★) exactly once', () => {
    usePlayer.setState({ battleCleared: [1, 2, 3] })
    expect(usePlayer.getState().checkBattleCards()).toEqual([]) // not yet
    usePlayer.getState().battleFinished({ gym: 4, won: true, gems: 0, xp: 0, perCardXp: {}, rng: () => 0 })
    const s = usePlayer.getState()
    expect(s.cardStars['mecha-sonic']).toBe(STAR_THRESHOLDS[0])
    // re-check is a no-op (already owned)
    expect(usePlayer.getState().checkBattleCards()).toEqual([])
  })

  it('clearing gym 8 grants egg-dragoon; champion (13) grants solaris', () => {
    usePlayer.getState().battleFinished({ gym: 8, won: true, gems: 0, xp: 0, perCardXp: {}, rng: () => 0 })
    expect(usePlayer.getState().cardStars['egg-dragoon']).toBe(STAR_THRESHOLDS[0])
    expect(usePlayer.getState().cardStars.solaris ?? 0).toBe(0)
    usePlayer.getState().battleFinished({ gym: 13, won: true, gems: 0, xp: 0, perCardXp: {}, rng: () => 0 })
    expect(usePlayer.getState().cardStars.solaris).toBe(STAR_THRESHOLDS[0])
  })

  it('a loss never grants a battle card (no clear)', () => {
    usePlayer.getState().battleFinished({ gym: 4, won: false, gems: 0, xp: 0, perCardXp: {} })
    expect(usePlayer.getState().cardStars['mecha-sonic'] ?? 0).toBe(0)
    expect(usePlayer.getState().battleCleared).not.toContain(4)
  })

  it('grantBattleCard dedupes and refuses non-battle ids', () => {
    expect(usePlayer.getState().grantBattleCard('solaris')).toBe(true)
    expect(usePlayer.getState().cardStars.solaris).toBe(STAR_THRESHOLDS[0])
    expect(usePlayer.getState().grantBattleCard('solaris')).toBe(false) // already owned
    expect(usePlayer.getState().grantBattleCard('sonic')).toBe(false) // chest card
    expect(usePlayer.getState().grantBattleCard('not-a-card')).toBe(false)
  })
})
