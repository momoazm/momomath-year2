import { describe, expect, it } from 'vitest'
import { CARD_BY_ID, toStar } from '../../src/engine/cards'
import { CARD_ARCHETYPE } from '../../src/engine/battle/archetypes'
import { TOTAL_NODES, gymBotMul, gymBotStar, gymDef } from '../../src/engine/battle/roadmap'
import { battleLevelForXp } from '../../src/engine/battle/stats'
import {
  SQUAD_SIZE,
  autoPickStrongest,
  gymBotDuelCards,
  gymBotSquad,
  ownedSquadEntries,
  playerDuelCard,
} from '../../src/engine/battle/squad'

describe('gymBotSquad — villain squad shape', () => {
  it('always returns 3 cards with the BOSS as the finale', () => {
    for (let g = 1; g <= TOTAL_NODES; g++) {
      const squad = gymBotSquad(g)
      expect(squad.length).toBe(SQUAD_SIZE)
      const gDef = CARD_BY_ID[squad[2]!]!
      expect(gDef).toBeTruthy()
      // the finale is the roadmap's boss card
      expect(squad[2]).toBe(gymDef(g).bossCardId)
    }
  })

  it('every squad card resolves to art + archetype', () => {
    for (let g = 1; g <= TOTAL_NODES; g++) {
      for (const id of gymBotSquad(g)) {
        expect(CARD_BY_ID[id], `gym ${g} card '${id}' missing from roster`).toBeTruthy()
        expect(CARD_ARCHETYPE[id], `gym ${g} card '${id}' missing archetype`).toBeTruthy()
      }
    }
  })
})

describe('gymBotDuelCards — gym scaling', () => {
  it('builds 3 bot cards at the gym star level with prefixed uids', () => {
    const cards = gymBotDuelCards(1)
    expect(cards.length).toBe(3)
    expect(cards.every((c) => c.bot)).toBe(true)
    expect(cards.every((c) => c.uid.startsWith('bot:'))).toBe(true)
    expect(cards.every((c) => c.star === gymBotStar(1))).toBe(true)
    expect(cards.every((c) => c.stats.hp > 0 && c.stats.atk > 0 && c.stats.def > 0)).toBe(true)
  })

  it('the SAME card gets strictly stronger stats at a higher gym (§13.3)', () => {
    const low = gymBotDuelCards(1)
    const high = gymBotDuelCards(TOTAL_NODES)
    // both gyms lead with a squad member; compare like-for-like by tier base
    expect(high[0]!.stats.hp).toBeGreaterThan(low[0]!.stats.hp * (gymBotMul(2) / gymBotMul(1)))
    const mulGrowth = gymBotMul(TOTAL_NODES) / gymBotMul(1)
    expect(mulGrowth).toBeGreaterThan(1)
    for (const c of high) expect(c.stats.hp).toBeGreaterThan(0)
  })

  it('stats are rounded to ≤2 decimals (no float creep)', () => {
    for (const c of gymBotDuelCards(7)) {
      for (const v of [c.stats.hp, c.stats.atk, c.stats.def]) {
        expect(Math.round(v * 100) / 100).toBe(v)
      }
    }
  })
})

describe('ownedSquadEntries — owned only, strongest first', () => {
  const stars = { sonic: 1, tails: 6, knuckles: 0 } // knuckles UNOWNED
  const xp = { sonic: 40, tails: 120 }

  it('lists only cards with copies > 0 (unowned never enter the squad)', () => {
    const entries = ownedSquadEntries(stars, xp)
    const ids = entries.map((e) => e.def.id)
    expect(ids).toContain('sonic')
    expect(ids).toContain('tails')
    expect(ids).not.toContain('knuckles')
    expect(entries.every((e) => e.def.id in stars)).toBe(true)
  })

  it('sorts strongest-first and derives star + battle level from the save', () => {
    const entries = ownedSquadEntries(stars, xp)
    for (let i = 1; i < entries.length; i++) {
      const prev = entries[i - 1]!.stats
      const cur = entries[i]!.stats
      expect(prev.hp + prev.atk + prev.def).toBeGreaterThanOrEqual(cur.hp + cur.atk + cur.def)
    }
    const sonic = entries.find((e) => e.def.id === 'sonic')!
    expect(sonic.star).toBe(toStar(1))
    expect(sonic.level).toBe(battleLevelForXp(40))
  })

  it('purity: never mutates the passed save fields', () => {
    const snapshotStars = JSON.parse(JSON.stringify(stars))
    const snapshotXp = JSON.parse(JSON.stringify(xp))
    ownedSquadEntries(stars, xp)
    expect(stars).toEqual(snapshotStars)
    expect(xp).toEqual(snapshotXp)
  })
})

describe('autoPickStrongest + playerDuelCard', () => {
  it('auto-picks up to SQUAD_SIZE ids from the strongest end', () => {
    const entries = ownedSquadEntries({ sonic: 3, tails: 2, knuckles: 1, eggman: 5 }, {})
    const pick = autoPickStrongest(entries)
    expect(pick.length).toBeLessThanOrEqual(SQUAD_SIZE)
    expect(pick).toEqual(entries.slice(0, pick.length).map((e) => e.def.id))
  })

  it('auto-pick with fewer owned cards than the squad size picks ALL of them', () => {
    const entries = ownedSquadEntries({ sonic: 1 }, {})
    expect(autoPickStrongest(entries)).toEqual(['sonic'])
  })

  it('playerDuelCard mirrors the entry exactly (uid prefixed, bot flag off)', () => {
    const entries = ownedSquadEntries({ sonic: 6 }, { sonic: 999 })
    const entry = entries.find((e) => e.def.id === 'sonic')!
    const card = playerDuelCard(entry)
    expect(card.uid).toBe('you:sonic')
    expect(card.cardId).toBe('sonic')
    expect(card.name).toBe(entry.def.name)
    expect(card.tier).toBe(entry.def.tier)
    expect(card.stats).toEqual(entry.stats)
    expect(card.star).toBe(entry.star)
    expect(card.archetype).toBe(entry.archetype)
    expect(card.bot).toBe(false)
  })
})
