import { describe, expect, it } from 'vitest'
import { ALL_CARDS } from '../../src/engine/cards'
import {
  ARCHETYPES,
  ARCHETYPE_META,
  BEATS_RING,
  CARD_ARCHETYPE,
  TYPE_MULT_NEUTRAL,
  TYPE_MULT_RESIST,
  TYPE_MULT_SUPER,
  archetypeOf,
  missingArchetypes,
  typeEffect,
  typeMult,
} from '../../src/engine/battle/archetypes'

describe('archetype coverage — every roster card', () => {
  it('has an archetype (no fallbacks; missing = bug)', () => {
    expect(missingArchetypes()).toEqual([])
  })

  it('maps to one of the six archetypes only', () => {
    for (const [id, a] of Object.entries(CARD_ARCHETYPE)) {
      expect(ARCHETYPES, `bad archetype for ${id}`).toContain(a)
    }
  })

  it('archetypeOf returns the mapping and throws on unknown ids', () => {
    expect(archetypeOf('sonic')).toBe('speed')
    expect(() => archetypeOf('definitely-not-a-card')).toThrow()
  })

  it('every archetype has kid-readable icon + label metadata', () => {
    for (const a of ARCHETYPES) {
      expect(ARCHETYPE_META[a].icon.length).toBeGreaterThan(0)
      expect(ARCHETYPE_META[a].label.length).toBeGreaterThan(0)
    }
  })
})

describe('effectiveness ring — single cycle, symmetric', () => {
  it('each archetype beats exactly one and loses to exactly one', () => {
    for (const a of ARCHETYPES) {
      const wins = ARCHETYPES.filter((b) => BEATS_RING[a] === b)
      const losses = ARCHETYPES.filter((b) => BEATS_RING[b] === a)
      expect(wins.length, `${a} should beat exactly one`).toBe(1)
      expect(losses.length, `${a} should lose to exactly one`).toBe(1)
      expect(wins[0]).not.toBe(a)
    }
  })

  it('forms one 6-long cycle covering every archetype', () => {
    let cur = ARCHETYPES[0]!
    const seen = new Set<string>([cur])
    for (let i = 0; i < ARCHETYPES.length; i++) {
      cur = BEATS_RING[cur]!
      seen.add(cur)
    }
    expect(seen.size).toBe(ARCHETYPES.length)
    expect(cur).toBe(ARCHETYPES[0]) // closed loop
  })

  it('A super-effective vs B ⇔ B not-very vs A (mirror symmetry)', () => {
    for (const a of ARCHETYPES) {
      for (const b of ARCHETYPES) {
        const ab = typeMult(a, b)
        const ba = typeMult(b, a)
        if (ab === TYPE_MULT_SUPER) expect(ba).toBe(TYPE_MULT_RESIST)
        else if (ab === TYPE_MULT_RESIST) expect(ba).toBe(TYPE_MULT_SUPER)
        else expect(ba).toBe(TYPE_MULT_NEUTRAL)
      }
    }
  })

  it('same-archetype matchups are neutral', () => {
    for (const a of ARCHETYPES) expect(typeMult(a, a)).toBe(1)
  })

  it('typeEffect labels match the multiplier', () => {
    expect(typeEffect('speed', 'power')).toBe('super') // speed beats power
    expect(typeEffect('power', 'speed')).toBe('weak')
    expect(typeEffect('chaos', 'speed')).toBe('super') // chaos beats speed
    expect(typeEffect('speed', 'flight')).toBe('neutral') // not adjacent in the ring
  })
})
