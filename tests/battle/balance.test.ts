import { describe, expect, it } from 'vitest'
import { mulberry32 } from '../../src/content/rng'
import {
  BATTLE_DIFFICULTIES,
  battleDifficultyDef,
  effectiveBattleDifficulty,
  type BattleDifficulty,
} from '../../src/engine/battle/difficulty'
import { type DuelCard, type DuelQuestion, simulate } from '../../src/engine/battle/duel'
import { gymBotDuelCards } from '../../src/engine/battle/squad'
import { deriveStats } from '../../src/engine/battle/stats'

/**
 * WS27 balance probe — Monte-Carlo win rates for the difficulty ladder.
 *
 * This file is the tuning instrument for difficulty.ts: run
 *   npx vitest run balance
 * to print the full table (gym × tier × squad × player-accuracy).
 * Everything is seeded, so the table and the gates below are deterministic.
 *
 * Design targets (user directive 2026-10-18: "games are not that easy … in
 * harder level the player must have a high level of the card to be able to
 * win"):
 *   - Easy stays kid-beatable with STARTER commons.
 *   - Medium is won by upgraded commons / rare-2★+ squads (not starters).
 *   - Hard punishes starter cards and needs rare-3★/epic-4★ squads.
 *   - Impossible is a wall for mid squads; legendary/epic-5★ squads win it.
 *   - Late gyms taper the tier extras (see GYM_DIFFICULTY_TAPER) so even the
 *     champion gym keeps a winnable window on every tier.
 */

const BATTLE_COUNT = 64

/** Representative player-power steps: tier + star + battle level. */
const SQUADS = {
  starter: { tier: 'common', star: 0, level: 1 }, // 3× common 0★ Lv1 (40hp/8atk)
  early: { tier: 'common', star: 2, level: 4 }, // upgraded commons
  mid: { tier: 'rare', star: 3, level: 6 }, // rare-3★ Lv6
  late: { tier: 'epic', star: 4, level: 8 }, // epic-4★ Lv8
  maxed: { tier: 'legendary', star: 5, level: 10 }, // legendary-5★ Lv10
  ultra: { tier: 'exclusive', star: 5, level: 10 }, // end-game exclusives maxed
} as const
type SquadKey = keyof typeof SQUADS

const SQUAD_ORDER: SquadKey[] = ['starter', 'early', 'mid', 'late', 'maxed', 'ultra']
const GYMS = [1, 5, 8, 12, 13]
const PLAYER_ACCURACIES = [0.7, 0.9]

const DECK: DuelQuestion[] = Array.from({ length: 12 }, (_, i) => ({
  prompt: `probe q${i}`,
  choices: ['a', 'b', 'c'],
  answerIndex: i % 3,
}))

/** Player squad: three identical cards (neutral 'tech' archetype). */
function squadCards(key: SquadKey): DuelCard[] {
  const { tier, star, level } = SQUADS[key]
  return [0, 1, 2].map((i) => ({
    uid: `you:${key}${i}`,
    cardId: `${key}${i}`,
    name: `${key}${i}`,
    tier,
    archetype: 'tech' as const,
    stats: deriveStats(tier, star, level),
    star,
    bot: false,
  }))
}

/** Seeded player that answers `acc` of its questions right (wrong = shift). */
function answerer(acc: number, seed: number) {
  const rng = mulberry32((seed ^ 0x5eed) >>> 0)
  return (_turn: number, q: DuelQuestion | null) => {
    const correct = rng() < acc
    if (!q) return { chosen: 0, correct }
    const chosen = correct ? q.answerIndex : (q.answerIndex + 1) % q.choices.length
    return { chosen, correct }
  }
}

function winRate(gym: number, tier: BattleDifficulty, squad: SquadKey, acc: number): number {
  let wins = 0
  for (let i = 0; i < BATTLE_COUNT; i++) {
    const seed = 1000 + i
    const def = battleDifficultyDef(tier)
    const s = simulate(
      {
        player: { cards: squadCards(squad) },
        bot: { cards: gymBotDuelCards(gym, tier) },
        seed,
        questions: DECK,
        botAccuracy: def.accuracy,
        botSpecialMul: effectiveBattleDifficulty(tier, gym).specialMul,
      },
      answerer(acc, seed),
    )
    if (s.phase === 'won') wins++
  }
  return wins / BATTLE_COUNT
}

describe('WS27 balance — difficulty ladder gates on card power', () => {
  it('prints the rival totals + win-rate table (tuning instrument — run this file to re-tune)', () => {
    const lines: string[] = []
    for (const gym of GYMS) {
      const totals = BATTLE_DIFFICULTIES.map((d) => {
        const cards = gymBotDuelCards(gym, d.key)
        const hp = Math.round(cards.reduce((n, c) => n + c.stats.hp, 0))
        const atk = Math.round(cards.reduce((n, c) => n + c.stats.atk, 0))
        return `${d.key} ${hp}/${atk}`
      })
      lines.push(`gym ${String(gym).padStart(2)} rival totals (hp/atk): ${totals.join(' · ')}`)
      for (const tier of BATTLE_DIFFICULTIES) {
        const cells = SQUAD_ORDER.map((sq) => {
          const w = PLAYER_ACCURACIES.map(
            (acc) => `${Math.round(winRate(gym, tier.key, sq, acc) * 100)}%`,
          )
          return `${sq} ${w[0]}/${w[1]}`
        })
        lines.push(`gym ${String(gym).padStart(2)} · ${tier.key.padEnd(10)} │ ${cells.join(' │ ')}`)
      }
    }
    // eslint-disable-next-line no-console
    console.log(`\nwin rates (player 70%/90% answer accuracy):\n${lines.join('\n')}\n`)
    expect(lines.length).toBe(GYMS.length * (BATTLE_DIFFICULTIES.length + 1))
  })

  it('Easy: starter commons still win the early gyms; upgraded commons the mid gyms', () => {
    expect(winRate(1, 'easy', 'starter', 0.7)).toBeGreaterThanOrEqual(0.55)
    expect(winRate(8, 'easy', 'early', 0.7)).toBeGreaterThanOrEqual(0.4)
  })

  it('Medium: starter cards are not enough — upgrade to win', () => {
    expect(winRate(1, 'medium', 'starter', 0.7)).toBeLessThanOrEqual(0.35)
    expect(winRate(1, 'medium', 'early', 0.7)).toBeGreaterThanOrEqual(0.55)
    expect(winRate(8, 'medium', 'late', 0.9)).toBeGreaterThanOrEqual(0.6)
  })

  it('Hard: starter cards get flattened; rare/epic squads win', () => {
    expect(winRate(1, 'hard', 'starter', 0.9)).toBeLessThanOrEqual(0.15)
    expect(winRate(1, 'hard', 'mid', 0.7)).toBeGreaterThanOrEqual(0.5)
    expect(winRate(1, 'hard', 'late', 0.9)).toBeGreaterThanOrEqual(0.6)
  })

  it('Impossible: a mid squad cannot win; epic/legendary squads can', () => {
    expect(winRate(1, 'impossible', 'mid', 0.9)).toBeLessThanOrEqual(0.2)
    expect(winRate(1, 'impossible', 'late', 0.9)).toBeGreaterThanOrEqual(0.6)
    expect(winRate(8, 'impossible', 'ultra', 0.9)).toBeGreaterThanOrEqual(0.15)
  })

  it('late-gym taper keeps Hard/Impossible winnable by the top squad', () => {
    expect(winRate(12, 'hard', 'ultra', 0.9)).toBeGreaterThanOrEqual(0.15)
    expect(winRate(13, 'hard', 'ultra', 0.9)).toBeGreaterThanOrEqual(0.15)
    expect(winRate(13, 'impossible', 'ultra', 0.9)).toBeGreaterThanOrEqual(0.05)
  })

  it('the ladder is monotone: higher tiers never help the player', () => {
    for (const gym of GYMS) {
      for (const sq of SQUAD_ORDER) {
        const rates = BATTLE_DIFFICULTIES.map((d) => winRate(gym, d.key, sq, 0.9))
        for (let i = 1; i < rates.length; i++) {
          expect(rates[i]!).toBeLessThanOrEqual(rates[i - 1]! + 0.001)
        }
      }
    }
  })
})
