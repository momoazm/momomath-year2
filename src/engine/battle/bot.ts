/**
 * WS18 — Bot squad policy (PURE, additive). The bot uses the exact same
 * damage formula and move set as the player (never cheats) — the policy only
 * decides WHICH card is active and WHEN to spend its charge. Difficulty comes
 * from the gym's stat scaling (roadmap.ts), not from extra dice.
 *
 * Design goals: deterministic (seeded), kid-beatable at gym 1, and it never
 * takes a obviously bad line (a full Team-Blast meter is always spent).
 */
import { mulberry32 } from '../../content/rng'
import { typeMult as typeMultFor } from './archetypes'
import { TEAM_BLAST_CHARGE, hasUltimate } from './moves'
import type { DuelCard, DuelQuestion, DuelState } from './duel'

/** Bot difficulty knob per gym tier (0..1). Higher = greedier specials. */
export function botAggression(gymIndex: number): number {
  return Math.min(0.85, 0.3 + gymIndex * 0.05)
}

/**
 * Which card the bot sends out after a faint: the one with the best
 * type-matchup against the player's current active, ties broken by remaining
 * HP fraction then raw atk (deterministic).
 */
export function chooseBotSwap(
  bot: DuelCard[],
  botHp: number[],
  vs: DuelCard,
): number {
  let best = -1
  let bestScore = -Infinity
  for (let i = 0; i < bot.length; i++) {
    if (botHp[i]! <= 0) continue
    const c = bot[i]!
    const mult = typeMultFor(c.archetype, vs.archetype)
    const hpFrac = botHp[i]! / Math.max(1, Math.round(c.stats.hp))
    const score = mult * 10 + hpFrac * 3 + c.stats.atk * 0.01
    if (score > bestScore) {
      bestScore = score
      best = i
    }
  }
  return best
}

/** The bot answers covered questions with a gym-scaled accuracy (seeded). */
export function botAnswer(
  q: DuelQuestion | null,
  gymIndex: number,
  rand: () => number,
): { chosen: number; correct: boolean } {
  if (!q) return { chosen: 0, correct: false }
  // gym 0 ≈ 45% correct, rising to ~80% at the champion.
  const accuracy = Math.min(0.8, 0.45 + gymIndex * 0.03)
  const correct = rand() < accuracy
  if (correct) return { chosen: q.answerIndex, correct: true }
  // pick a deliberate wrong choice (deterministic).
  const wrongs = q.choices.map((_, i) => i).filter((i) => i !== q.answerIndex)
  const chosen = wrongs[Math.floor(rand() * wrongs.length)] ?? q.answerIndex
  return { chosen, correct: false }
}

/** Does the bot spend its Team-Blast charge now? (auto-yes at full meter). */
export function botSpendsCharge(state: DuelState): boolean {
  return state.charge >= TEAM_BLAST_CHARGE
}

/** Seeded rand stream for a bot action (isolated per turn index). */
export function botRand(seed: number, turn: number): () => number {
  return mulberry32((seed ^ Math.imul(turn + 1, 0x85ebca6b)) >>> 0)
}

/** Guard so a card with no Ultimate can never "spend" a charge. */
export function canUltimate(card: DuelCard): boolean {
  return hasUltimate(card.star)
}
