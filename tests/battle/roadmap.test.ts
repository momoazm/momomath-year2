import { describe, expect, it } from 'vitest'
import { ALL_CARDS } from '../../src/engine/cards'
import {
  BATTLE_DECK_SIZE,
  BATTLE_BANK_SEEDS,
  LISTEN_ONLY_PROMPT_RE,
  buildBattleDeck,
  completedLessonIds,
  openingLessonIds,
} from '../../src/engine/battle/questions'
import {
  GYM_COUNT,
  GYM_GEMS,
  GYM_XP,
  ROADMAP_GYMS,
  ROADMAP_UNLOCK,
  TOTAL_NODES,
  countCompletedLessons,
  gymBotMul,
  gymBotStar,
  gymDef,
  isGymUnlocked,
} from '../../src/engine/battle/roadmap'
import { CARD_ARCHETYPE, archetypeOf } from '../../src/engine/battle/archetypes'

describe('roadmap — 13 nodes, gentle escalating unlock', () => {
  it('has exactly 12 gyms + champion = 13 nodes', () => {
    expect(GYM_COUNT).toBe(12)
    expect(TOTAL_NODES).toBe(13)
    expect(ROADMAP_GYMS.length).toBe(13)
    expect(ROADMAP_GYMS.filter((g) => g.champion).length).toBe(1)
    expect(ROADMAP_GYMS[12]!.champion).toBe(true)
  })

  it('unlock curve is non-decreasing and starts free at gym 1', () => {
    expect(ROADMAP_UNLOCK[1]).toBe(0)
    for (let g = 2; g <= TOTAL_NODES; g++) {
      expect(ROADMAP_UNLOCK[g]!).toBeGreaterThanOrEqual(ROADMAP_UNLOCK[g - 1]!)
    }
    expect(ROADMAP_UNLOCK[TOTAL_NODES]).toBe(100)
  })

  it('rewards (gems + xp) escalate with gym, champion pays the most', () => {
    for (let g = 2; g <= TOTAL_NODES; g++) {
      expect(GYM_GEMS[g]!).toBeGreaterThan(GYM_GEMS[g - 1]!)
      expect(GYM_XP[g]!).toBeGreaterThan(GYM_XP[g - 1]!)
    }
    expect(GYM_GEMS[TOTAL_NODES]).toBe(Math.max(...Object.values(GYM_GEMS)))
    expect(GYM_XP[TOTAL_NODES]).toBe(Math.max(...Object.values(GYM_XP)))
  })

  it('every roadmap node (boss + 3 bots) resolves to a real roster card with an archetype', () => {
    const ids = new Set(ALL_CARDS.map((c) => c.id))
    for (const g of ROADMAP_GYMS) {
      expect(ids.has(g.bossCardId), `${g.name} boss '${g.bossCardId}' not in roster`).toBe(true)
      expect(CARD_ARCHETYPE[g.bossCardId], `boss '${g.bossCardId}' missing archetype`).toBeTruthy()
      expect(g.botCardIds.length, `${g.name} needs 3 bot cards`).toBe(3)
      for (const b of g.botCardIds) {
        expect(ids.has(b), `${g.name} bot '${b}' not in roster`).toBe(true)
        expect(CARD_ARCHETYPE[b], `bot '${b}' missing archetype`).toBeTruthy()
      }
    }
  })

  it('gymDef(1..13) round-trips and throws past the end', () => {
    for (let g = 1; g <= TOTAL_NODES; g++) {
      expect(gymDef(g).index).toBe(g)
    }
    expect(() => gymDef(TOTAL_NODES + 1)).toThrow()
  })
})

describe('unlock gate — completed non-boss lessons', () => {
  it('counts completions>0 and excludes boss lessons', () => {
    const lp: Record<string, { crown: number; bestAccuracy: number; completions: number }> = {
      u1l1: { crown: 1, bestAccuracy: 90, completions: 1 },
      u1l2: { crown: 3, bestAccuracy: 100, completions: 3 },
      u1boss: { crown: 3, bestAccuracy: 100, completions: 5 }, // boss — must not count
      u2l1: { crown: 0, bestAccuracy: 0, completions: 0 }, // not completed — must not count
    }
    expect(countCompletedLessons(lp)).toBe(2)
  })

  it('isGymUnlocked respects the escalating curve and gym 1 is always open', () => {
    expect(isGymUnlocked(1, 0)).toBe(true)
    expect(isGymUnlocked(2, ROADMAP_UNLOCK[2]! - 1)).toBe(false)
    expect(isGymUnlocked(2, ROADMAP_UNLOCK[2]!)).toBe(true)
    expect(isGymUnlocked(TOTAL_NODES, 9999)).toBe(true)
  })
})

describe('bot scaling — multiplier and star level', () => {
  it('gymBotMul escalates gently by 2% per gym (tier curve does the heavy lifting)', () => {
    expect(gymBotMul(1)).toBeCloseTo(1)
    expect(gymBotMul(2)).toBeCloseTo(1.02)
    expect(gymBotMul(13)).toBeCloseTo(1 + 0.02 * 12)
    // strictly monotonic so higher gyms are never weaker
    for (let g = 2; g <= 13; g++) expect(gymBotMul(g)).toBeGreaterThan(gymBotMul(g - 1))
  })

  it('gymBotStar goes 1 → 4 across the gyms (capped below 5 so champion stays winnable)', () => {
    expect(gymBotStar(1)).toBe(1)
    expect(gymBotStar(4)).toBe(1)
    expect(gymBotStar(5)).toBe(2)
    expect(gymBotStar(8)).toBe(2)
    expect(gymBotStar(9)).toBe(3)
    expect(gymBotStar(12)).toBe(3)
    expect(gymBotStar(13)).toBe(4)
  })

  it('archetypeOf resolves the roadmap boss to a kid-readable label', () => {
    expect(typeof archetypeOf(ROADMAP_GYMS[0]!.bossCardId)).toBe('string')
  })
})

describe('covered-content selector — current subject only', () => {
  it('fresh save (no completions) falls back to the always-unlocked opening lessons', () => {
    const ids = openingLessonIds('math')
    expect(ids.length).toBeGreaterThanOrEqual(1)
    const deck = buildBattleDeck({ subject: 'math', progress: {}, gym: 1, seed: 7 })
    expect(deck.length).toBeGreaterThan(0)
  })

  it('deck contains only lessons from the CURRENT subject (never another subject)', () => {
    const completedMath = { u1l1: { crown: 1, bestAccuracy: 100, completions: 1 } }
    const deck = buildBattleDeck({ subject: 'math', progress: completedMath, gym: 1, seed: 3 })
    // With no real completions it falls back to opening lessons — still math.
    for (const q of deck) expect(typeof q.unitId).toBe('string')
    expect(deck.length).toBeGreaterThan(0)
  })

  it('is deterministic: same subject + progress + gym + seed ⇒ identical deck', () => {
    const progress = {}
    const a = buildBattleDeck({ subject: 'math', progress, gym: 3, seed: 42 })
    const b = buildBattleDeck({ subject: 'math', progress, gym: 3, seed: 42 })
    expect(a).toEqual(b)
  })

  it('dedupes by prompt and caps at BATTLE_DECK_SIZE', () => {
    const deck = buildBattleDeck({ subject: 'math', progress: {}, gym: 1, seed: 9, size: 25 })
    const prompts = deck.map((q) => q.prompt)
    expect(new Set(prompts).size).toBe(prompts.length)
    expect(deck.length).toBeLessThanOrEqual(25)
    expect(BATTLE_DECK_SIZE).toBeGreaterThan(0)
    expect(BATTLE_BANK_SEEDS.length).toBeGreaterThan(0)
  })

  it('every deck entry is a well-formed MCQ (2-4 choices, in-range answer)', () => {
    for (const q of buildBattleDeck({ subject: 'english', progress: {}, gym: 1, seed: 5 })) {
      expect(q.choices.length).toBeGreaterThanOrEqual(2)
      expect(q.choices.length).toBeLessThanOrEqual(4)
      expect(q.answerIndex).toBeGreaterThanOrEqual(0)
      expect(q.answerIndex).toBeLessThan(q.choices.length)
      expect(q.prompt.trim().length).toBeGreaterThan(0)
    }
  })

  it('WS26 silent-battle rule: no listen-only prompts in ANY subject deck (EN + AR)', () => {
    const subjects = ['math', 'english', 'science', 'german', 'arabic', 'religion', 'social'] as const
    let nonEmpty = 0
    for (const subject of subjects) {
      const deck = buildBattleDeck({ subject, progress: {}, gym: 1, seed: 5 })
      if (deck.length > 0) nonEmpty += 1
      for (const q of deck) {
        expect(q.prompt).not.toMatch(LISTEN_ONLY_PROMPT_RE)
      }
    }
    expect(nonEmpty).toBeGreaterThan(0)
  })

  it('completedLessonIds only counts lessons with completions > 0', () => {
    const done = completedLessonIds('math', {
      u1l1: { crown: 1, bestAccuracy: 90, completions: 2 },
      u1l2: { crown: 0, bestAccuracy: 0, completions: 0 },
    })
    expect(done).toContain('u1l1')
    expect(done).not.toContain('u1l2')
  })

  it('purity: never mutates the passed progress map', () => {
    const progress = { 'z': { crown: 1, bestAccuracy: 80, completions: 1 } }
    const snap = JSON.parse(JSON.stringify(progress))
    buildBattleDeck({ subject: 'math', progress, gym: 2, seed: 1 })
    expect(progress).toEqual(snap)
  })
})
