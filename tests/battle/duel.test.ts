import { describe, expect, it } from 'vitest'
import { mulberry32 } from '../../src/content/rng'
import { TIER_BASE } from '../../src/engine/battle/stats'
import { TYPE_MULT_RESIST, TYPE_MULT_SUPER } from '../../src/engine/battle/archetypes'
import {
  type DuelCard,
  type DuelEvent,
  type DuelQuestion,
  advance,
  chooseMove,
  computeDamage,
  createDuel,
  isOver,
  simulate,
  swapIn,
} from '../../src/engine/battle/duel'
import { botAnswer, botRand, chooseBotSwap } from '../../src/engine/battle/bot'

function card(id: string, star: number, hp: number, atk: number, def: number, archetype: DuelCard['archetype']): DuelCard {
  return {
    uid: id,
    cardId: id,
    name: id,
    tier: 'epic',
    archetype,
    stats: { hp, atk, def },
    star,
    bot: false,
  }
}

function squadA(): DuelCard[] {
  return [
    card('a1', 3, 120, 20, 6, 'speed'),
    card('a2', 3, 110, 18, 5, 'power'),
    card('a3', 3, 130, 16, 7, 'tech'),
  ]
}

function squadB(): DuelCard[] {
  return [
    card('b1', 2, 100, 16, 4, 'power'),
    card('b2', 2, 105, 15, 5, 'flight'),
    card('b3', 2, 95, 17, 4, 'chaos'),
  ]
}

const QUESTIONS: DuelQuestion[] = [
  { prompt: '2 + 2 = ?', choices: ['3', '4', '5'], answerIndex: 1 },
  { prompt: '5 × 3 = ?', choices: ['15', '20', '10'], answerIndex: 0 },
]

function baseArgs(seed = 42) {
  return {
    player: { cards: squadA() },
    bot: { cards: squadB() },
    seed,
    questions: QUESTIONS,
  }
}

describe('computeDamage — bounds + same formula both sides', () => {
  it('stays within [0.9, 1.1] × atk × power × typeMult (floored at 1)', () => {
    for (let i = 0; i < 50; i++) {
      const rand = mulberry32(i + 1)
      const { damage } = computeDamage(20, 5, 'quick', 3, 'speed', 'power', rand)
      const base = (20 / (1 + 5 / 50)) * 1.0 * TYPE_MULT_SUPER
      expect(damage).toBeGreaterThanOrEqual(Math.max(1, Math.round(base * 0.9)))
      expect(damage).toBeLessThanOrEqual(Math.round(base * 1.1))
    }
  })

  it('resisted matchups deal strictly less than neutral at identical stats', () => {
    const r = mulberry32(7)
    const superHit = computeDamage(20, 5, 'quick', 3, 'speed', 'power', r).damage
    const resistHit = computeDamage(20, 5, 'quick', 3, 'power', 'speed', r).damage
    expect(resistHit).toBeLessThan(superHit)
  })

  it('a 0★ card with no Special throws a charged Quick on POWER turns', () => {
    const r = mulberry32(3)
    const zero = computeDamage(20, 5, 'quick', 0, 'speed', 'power', r).damage
    const r2 = mulberry32(3)
    const three = computeDamage(20, 5, 'quick', 3, 'speed', 'power', r2).damage
    expect(zero).toBeGreaterThan(three)
  })

  it('never deals less than 1 damage', () => {
    const r = mulberry32(1)
    const { damage } = computeDamage(1, 50, 'quick', 0, 'speed', 'chaos', r)
    expect(damage).toBeGreaterThanOrEqual(1)
  })
})

describe('chooseMove — auto vs power', () => {
  const c = squadA()[0]!
  it('auto turns always throw Quick', () => {
    expect(chooseMove(c, 'auto', true)).toBe('quick')
    expect(chooseMove(c, 'auto', false)).toBe('quick')
  })
  it('power turns spend Ultimate at full meter (if unlocked), else Special', () => {
    expect(chooseMove(c, 'power', true)).toBe('ultimate')
    expect(chooseMove(c, 'power', false)).toBe('special')
  })
  it('WS26: a WRONG answer throws NOTHING (correct answers are the only damage)', () => {
    expect(chooseMove(c, 'power', false, false)).toBeNull()
    expect(chooseMove(c, 'power', true, false)).toBeNull() // no free damage, even at full meter
    expect(chooseMove(c, 'power', true, true)).toBe('ultimate') // correct + meter full
    expect(chooseMove(c, 'power', false, true)).toBe('special') // correct + not full
  })
})

describe('WS26 question-gating through advance()', () => {
  it('a WRONG opening answer deals NO damage (miss entry) and resets the meter', () => {
    const s0 = createDuel(baseArgs(5))
    expect(s0.turn).toBe(0) // turn 0 is a player turn
    const s1 = advance(s0, { chosen: 0, correct: false })
    expect(s1.log.some((e) => e.kind === 'hit' && e.side === 'player')).toBe(false)
    expect(s1.log.some((e) => e.kind === 'miss' && e.side === 'player')).toBe(true)
    expect(s1.botHp).toEqual(s0.botHp) // the rival takes zero damage
    expect(s1.charge).toBe(0)
  })

  it('a CORRECT answer on the opening POWER turn throws Special and banks +1', () => {
    const s0 = createDuel(baseArgs(5))
    const s1 = advance(s0, { chosen: 0, correct: true })
    const ev = s1.log.find((e): e is DuelEvent => e.kind === 'hit' && e.side === 'player')!
    expect(ev.move).toBe('special')
    expect(s1.charge).toBe(1)
  })

  it('correct + full meter fires the Team-Blast Ultimate and spends the charge', () => {
    const s0 = { ...createDuel(baseArgs(9)), charge: 3 }
    const s1 = advance(s0, { chosen: 0, correct: true })
    const ev = s1.log.find((e): e is DuelEvent => e.kind === 'hit' && e.side === 'player')!
    expect(ev.move).toBe('ultimate')
    expect(ev.teamBlast).toBe(true)
    expect(s1.charge).toBe(0)
  })
})

describe('duel determinism + terminal outcome', () => {
  it('same seed + same inputs + same answers ⇒ identical log', () => {
    const s1 = simulate(baseArgs(42))
    const s2 = simulate(baseArgs(42))
    expect(s1.log).toEqual(s2.log)
    expect(s1.phase).toBe(s2.phase)
  })

  it('a duel always reaches a terminal phase (won/lost)', () => {
    const s = simulate(baseArgs(7))
    expect(['won', 'lost']).toContain(s.phase)
    expect(isOver(s)).toBe(true)
  })

  it('hit entries carry damage + valid hp bookkeeping; miss entries deal none', () => {
    const s = simulate(baseArgs(11))
    for (const ev of s.log) {
      if (ev.kind === 'miss') continue
      expect(ev.damage).toBeGreaterThanOrEqual(1)
      expect(ev.targetHpAfter).toBeGreaterThanOrEqual(0)
      expect(ev.targetHpAfter).toBeLessThanOrEqual(ev.targetMaxHp)
    }
    // both sides fumble sometimes (default bot accuracy < 1)
    expect(s.log.some((e) => e.kind === 'miss')).toBe(true)
  })
})

describe('WS26 — both sides fight back through their own questions', () => {
  it('every player turn surfaces a question (not only POWER turns)', () => {
    let s = createDuel(baseArgs(21))
    const questionTurns: number[] = []
    let guard = 0
    while (!isOver(s) && guard++ < 60) {
      if (s.phase === 'power') {
        expect(s.turn % 2).toBe(0)
        expect(s.question).not.toBeNull()
        questionTurns.push(s.turn)
      }
      if (s.phase === 'intro' || s.phase === 'power') {
        s = advance(s, { chosen: 0, correct: true })
      } else if (s.phase === 'auto') {
        s = advance(s)
      } else {
        s = swapIn(s)
      }
    }
    expect(questionTurns.length).toBeGreaterThanOrEqual(3)
    // at least one NON-power player turn carried a question (turns 2, 6, ...)
    expect(questionTurns.some((t) => t % 4 !== 0)).toBe(true)
  })

  it('a bot with accuracy 0 never damages the player — only misses', () => {
    const s = simulate({ ...baseArgs(3), botAccuracy: 0 })
    expect(s.log.some((e) => e.kind === 'hit' && e.side === 'bot')).toBe(false)
    expect(s.log.some((e) => e.kind === 'miss' && e.side === 'bot')).toBe(true)
    expect(s.phase).toBe('won') // the player (all correct) cleans up
  })

  it('a bot with accuracy 1 answers every turn right and always damages', () => {
    const s = simulate({ ...baseArgs(3), botAccuracy: 1 })
    expect(s.log.some((e) => e.kind === 'miss' && e.side === 'bot')).toBe(false)
    expect(s.log.some((e) => e.kind === 'hit' && e.side === 'bot')).toBe(true)
  })

  it('stays deterministic per seed under the new rules', () => {
    const a = simulate({ ...baseArgs(77), botAccuracy: 0.75 })
    const b = simulate({ ...baseArgs(77), botAccuracy: 0.75 })
    expect(a.log).toEqual(b.log)
    expect(a.phase).toBe(b.phase)
  })
})

describe('WS27 — botSpecialMul scales the rival’s special moves only', () => {
  it('is 1 by default and clamps negatives to 0', () => {
    expect(createDuel(baseArgs(1)).botSpecialMul).toBe(1)
    expect(createDuel({ ...baseArgs(1), botSpecialMul: -3 }).botSpecialMul).toBe(0)
    expect(createDuel({ ...baseArgs(1), botSpecialMul: 1.5 }).botSpecialMul).toBe(1.5)
  })

  it('multiplies Special + Ultimate damage, never Quick, with the same seed', () => {
    // Turn 1 is a bot POWER turn; give the bot squadA (★3) so it owns both
    // Special and Ultimate. botAccuracy 1 ⇒ the turn always resolves a hit.
    const settle = (mul: number, turn: number, botCharge = 0): DuelEvent => {
      const d = createDuel({
        player: { cards: squadB() },
        bot: { cards: squadA() },
        seed: 5,
        questions: QUESTIONS,
        botAccuracy: 1,
        botSpecialMul: mul,
      })
      const s = advance({ ...d, turn, botCharge }, undefined)
      return s.log.find((e): e is DuelEvent => e.kind === 'hit' && e.side === 'bot')!
    }

    const special = settle(1, 1)
    const specialBuff = settle(1.5, 1)
    expect(special.move).toBe('special')
    expect(specialBuff.damage).toBeGreaterThan(special.damage)
    expect(specialBuff.damage).toBe(Math.max(1, Math.round(special.damage * 1.5)))

    const ult = settle(1, 1, 3)
    const ultBuff = settle(2, 1, 3)
    expect(ult.move).toBe('ultimate')
    expect(ultBuff.damage).toBe(Math.max(1, Math.round(ult.damage * 2)))

    const quick = settle(1, 3)
    const quickBuff = settle(1.5, 3)
    expect(quick.move).toBe('quick')
    expect(quickBuff.damage).toBe(quick.damage) // quicks are never scaled
  })
})

describe('purity — createDuel / advance never mutate their inputs', () => {
  it('input card arrays are untouched', () => {
    const p = squadA()
    const b = squadB()
    const snapshotP = JSON.parse(JSON.stringify(p))
    const snapshotB = JSON.parse(JSON.stringify(b))
    const s = createDuel({ player: { cards: p }, bot: { cards: b }, seed: 1, questions: QUESTIONS })
    advance(s, { chosen: 0, correct: true })
    expect(p).toEqual(snapshotP)
    expect(b).toEqual(snapshotB)
  })
})

describe('bot fairness — same formula, no cheating', () => {
  it('bot-vs-bot at equal stats (both banking) deals equal damage PER TURN', () => {
    let pDmg = 0
    let bDmg = 0
    let pHits = 0
    let bHits = 0
    for (let seed = 1; seed <= 20; seed++) {
      const equal = squadA()
      const s = simulate(
        {
          player: { cards: equal.map((c) => ({ ...c })) },
          bot: { cards: equal.map((c) => ({ ...c, uid: 'x' + c.uid })) },
          seed,
          questions: QUESTIONS,
        },
        undefined,
        { botAlwaysCorrect: true },
      )
      for (const e of s.log) {
        if (e.kind !== 'hit') continue
        if (e.side === 'player') { pDmg += e.damage; pHits++ }
        else { bDmg += e.damage; bHits++ }
      }
    }
    // First-strike advantage lets the player end each matchup a turn sooner,
    // so TOTAL damage differs structurally. The no-cheat invariant is that a
    // bot hit deals the same as a player hit when both use the same formula.
    expect(pHits).toBeGreaterThan(0)
    expect(bHits).toBeGreaterThan(0)
    const pPerTurn = pDmg / pHits
    const bPerTurn = bDmg / bHits
    expect(Math.abs(pPerTurn - bPerTurn) / Math.max(pPerTurn, bPerTurn)).toBeLessThan(0.15)
  })
})

describe('bot policy — deterministic + matchup-aware', () => {
  it('chooseBotSwap picks a living card with the best type matchup', () => {
    const bot = [
      card('b1', 1, 50, 10, 2, 'chaos'), // chaos loses to nothing here; speed beats power
      card('b2', 1, 50, 10, 2, 'power'), // power beats tech
      card('b3', 1, 50, 10, 2, 'flight'),
    ]
    const vs = card('player', 1, 50, 10, 2, 'tech')
    const hp = [50, 50, 50]
    expect(chooseBotSwap(bot, hp, vs)).toBe(1) // power is super vs tech
  })

  it('never swaps to a fainted card', () => {
    const bot = [card('b1', 1, 50, 10, 2, 'chaos'), card('b2', 1, 50, 10, 2, 'power')]
    const vs = card('player', 1, 50, 10, 2, 'tech')
    expect(chooseBotSwap(bot, [0, 50], vs)).toBe(1)
    expect(chooseBotSwap(bot, [0, 0], vs)).toBe(-1)
  })

  it('botAnswer is deterministic per seed and returns the right answer when correct', () => {
    const q = QUESTIONS[0]!
    const a1 = botAnswer(q, 5, botRand(1, 0))
    const a2 = botAnswer(q, 5, botRand(1, 0))
    expect(a1).toEqual(a2)
    if (a1.correct) expect(a1.chosen).toBe(q.answerIndex)
    else expect(a1.chosen).not.toBe(q.answerIndex)
  })
})

describe('swapIn — faints advance the fight', () => {
  it('playerFainted lets the player pick a living card; bot auto-swaps', () => {
    let s = createDuel(baseArgs(3))
    // grind until someone faints
    let guard = 0
    while (!isOver(s) && s.phase !== 'playerFainted' && s.phase !== 'botFainted' && guard++ < 200) {
      if (s.phase === 'intro' || s.phase === 'auto' || s.phase === 'power') s = advance(s, { chosen: 0, correct: true })
      else s = swapIn(s)
    }
    if (s.phase === 'playerFainted') {
      const next = swapIn(s, 1)
      expect(next.playerActive).toBe(1)
    } else if (s.phase === 'botFainted') {
      const next = swapIn(s)
      expect(next.botActive).toBeGreaterThan(0)
    }
  })
})

describe('tier base sanity (re-exported for the duel tests)', () => {
  it('epic base is stronger than common', () => {
    expect(TIER_BASE.epic.atk).toBeGreaterThan(TIER_BASE.common.atk)
  })
})
