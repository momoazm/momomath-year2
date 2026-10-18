/**
 * WS18/WS26 — Momo Battle duel engine (PURE, additive). A deterministic 3v3
 * squad state machine over the question-turn cycle (PLAN.md §13.1 as amended
 * by the §13.10 user directive 2026-10-18):
 *
 *  - EVERY turn carries a question, and only a CORRECT answer deals damage —
 *    both ways. The player answers on their turns (tapped choice); the bot
 *    answers its own questions on its turns (seeded, difficulty-driven
 *    `botAccuracy`). A wrong answer = NO damage for that side this turn.
 *  - every 2nd player turn is a POWER turn: a correct answer fires the
 *    Special (or the Team-Blast Ultimate when the meter is full). The meter
 *    banks +1 on a correct POWER answer and resets on a wrong one.
 *  - on faint the player picks the next card; the bot swaps automatically
 *  - battle ends when one side is fully down (won/lost), no draws
 *
 * All randomness comes from a seeded mulberry32 stream, so the same seed +
 * same inputs + same answer sequence ⇒ identical log (unit-testable, and the
 * bot uses the exact same damage formula — it never cheats). The engine holds
 * NO store reference; screens pass plain data in and persist via battleFinished.
 */
import { mulberry32 } from '../../content/rng'
import type { ChestTier } from '../cards'
import { archetypeOf, type Archetype, typeEffect, typeMult } from './archetypes'
import {
  CHARGED_QUICK_MULT,
  MOVE_POWER,
  TEAM_BLAST_CHARGE,
  hasSpecial,
  hasUltimate,
  movePower,
  type MoveKind,
} from './moves'
import type { BattleStats } from './stats'

/** Default chance the bot answers its own per-turn questions correctly
 *  (the identity "medium" difficulty tier — see difficulty.ts). Keeps the
 *  bot symmetric with a solid human: it attacks only on correct answers,
 *  exactly like the player, and never on a fumble. */
export const DEFAULT_BOT_ACCURACY = 0.6

export type BattleSide = 'player' | 'bot'

/** One combatant as the duel sees it (built from stats + archetype). */
export interface DuelCard {
  /** stable key inside this battle (card id, or `gymN` bot alias) */
  uid: string
  /** roster id (for art/name lookup on the result screen) */
  cardId: string
  name: string
  tier: ChestTier
  archetype: Archetype
  stats: BattleStats
  /** star level 0-5 (drives Special/Ultimate unlock + mastered bonus) */
  star: number
  /** true when this side swaps in on its own (bots never pick) */
  bot: boolean
}

/** A question surfaced on a POWER turn. The engine only cares about the
 *  answer index — the screen builds these from covered lessons (WS19). */
export interface DuelQuestion {
  prompt: string
  choices: string[]
  answerIndex: number
}

export type DuelPhase =
  | 'intro' // pre-battle: both squads shown, awaiting first swap-in
  | 'auto' // normal turn: quick attack resolving
  | 'power' // power turn: waiting for the player's answer
  | 'playerFainted' // player active is down, pick the next card
  | 'botFainted' // bot active is down, bot swaps automatically
  | 'won'
  | 'lost'

/** One resolved hit, for the on-screen log + animations. */
export interface DuelEvent {
  kind: 'hit'
  side: BattleSide
  attackerUid: string
  targetUid: string
  move: MoveKind
  moveName: string
  damage: number
  /** type effect of this matchup, for the "SUPER EFFECTIVE!" flash */
  effect: 'super' | 'weak' | 'neutral'
  targetHpAfter: number
  targetMaxHp: number
  /** true when this hit knocked the target out */
  ko: boolean
  /** true when the Ultimate was fired off a full Team-Blast meter */
  teamBlast?: boolean
}

/** A turn that dealt NO damage because the acting side answered its question
 *  wrong (user directive 2026-10-18: wrong ⇒ no damage, both ways). */
export interface DuelMiss {
  kind: 'miss'
  side: BattleSide
  /** the side that fumbled its question this turn */
  actorUid: string
}

export type DuelLogEntry = DuelEvent | DuelMiss

export interface DuelState {
  phase: DuelPhase
  seed: number
  turn: number
  /** player's Team-Blast charge (0..TEAM_BLAST_CHARGE correct answers) */
  charge: number
  /** bot's own Team-Blast charge (banks on its power turns, mirrors player) */
  botCharge: number
  /** index into the question deck for the player's turns (cycles once exhausted) */
  qIndex: number
  /** chance the bot answers its own per-turn question correctly (difficulty) */
  botAccuracy: number
  player: DuelCard[]
  bot: DuelCard[]
  playerActive: number
  botActive: number
  /** live HP per card, index-aligned with player[] / bot[] */
  playerHp: number[]
  botHp: number[]
  log: DuelLogEntry[]
  /** the question to show while phase === 'power' */
  question: DuelQuestion | null
  /** covered-content deck, cycled deterministically once exhausted */
  questions: DuelQuestion[]
}

/** Roster/preview builder input for one side. */
export interface DuelSideInput {
  cards: DuelCard[]
}

export interface CreateDuelArgs {
  player: DuelSideInput
  bot: DuelSideInput
  seed: number
  /** covered-content questions, cycled deterministically */
  questions: DuelQuestion[]
  /** difficulty knob: chance the bot answers its per-turn question right
   *  (default = the identity `medium` tier, DEFAULT_BOT_ACCURACY). */
  botAccuracy?: number
}

/**
 * Damage for one hit (PLAN.md §13.2). SAME formula for player and bot:
 *   round(atk × movePower × typeMult × (0.9 + 0.2·rand))
 * floored at 1 so a weak hit always nibbles. `def` softens via the classic
 * atk/(1+def/50) curve so tanks feel tanky without ever zeroing damage.
 */
export function computeDamage(
  atk: number,
  def: number,
  moveKind: 'quick' | 'special' | 'ultimate',
  star: number,
  atkArch: Archetype,
  defArch: Archetype,
  rand: () => number,
): { damage: number; effect: 'super' | 'weak' | 'neutral' } {
  const effect = typeEffect(atkArch, defArch)
  const mult = typeMult(atkArch, defArch)
  const variance = 0.9 + 0.2 * rand()
  const power =
    moveKind === 'quick'
      ? // a 0★ card's Quick still spikes when it has no Special to throw
        MOVE_POWER.quick * (hasSpecial(star) ? 1 : CHARGED_QUICK_MULT)
      : movePower(moveKind, star)
  const mitigated = atk / (1 + def / 50)
  const damage = Math.max(1, Math.round(mitigated * power * mult * variance))
  return { damage, effect }
}

/** Which move a side throws this turn (uniform for both sides).
 *  WS26 (amends §13.1): on a POWER turn a WRONG answer throws NOTHING —
 *  damage requires a correct answer. `correct` defaults to true so
 *  preview/auto call-sites stay valid. Returns null when the question was
 *  answered wrong (no attack this turn). */
export function chooseMove(
  card: DuelCard,
  kind: 'auto' | 'power',
  chargeFull: boolean,
  correct = true,
): MoveKind | null {
  if (kind === 'auto') return 'quick'
  if (!correct) return null // wrong ⇒ no damage (WS26)
  if (chargeFull && hasUltimate(card.star)) return 'ultimate'
  if (hasSpecial(card.star)) return 'special'
  return 'quick'
}

function activeOf(side: DuelCard[], idx: number): DuelCard {
  return side[Math.max(0, Math.min(idx, side.length - 1))]!
}

/** First living index at/after `from`, else -1. */
function livingIndex(side: DuelCard[], hp: number[], from: number): number {
  for (let i = from; i < side.length; i++) if (hp[i]! > 0) return i
  for (let i = 0; i < from; i++) if (hp[i]! > 0) return i
  return -1
}

/** Live HP pools kept alongside the immutable card data. */
function initialHp(cards: DuelCard[]): number[] {
  return cards.map((c) => Math.max(1, Math.round(c.stats.hp)))
}

export function createDuel(args: CreateDuelArgs): DuelState {
  const player = args.player.cards.map((c) => ({ ...c, bot: false }))
  const bot = args.bot.cards.map((c) => ({ ...c, bot: true }))
  return {
    phase: 'intro',
    seed: args.seed,
    turn: 0,
    charge: 0,
    botCharge: 0,
    qIndex: 0,
    botAccuracy: Math.min(1, Math.max(0, args.botAccuracy ?? DEFAULT_BOT_ACCURACY)),
    player,
    bot,
    playerActive: 0,
    botActive: 0,
    playerHp: initialHp(player),
    botHp: initialHp(bot),
    log: [],
    question: null,
    questions: args.questions ?? [],
  }
}

/** The RNG stream for a turn: seeded from (seed, turn) so any single turn is
 *  reproducible in isolation — no ordering dependence across re-renders. */
function turnRand(state: DuelState, turn: number): () => number {
  return mulberry32((state.seed ^ Math.imul(turn + 1, 0x9e3779b1)) >>> 0)
}

function allDown(hp: number[]): boolean {
  return hp.every((h) => h <= 0)
}

/** Fire one hit from `atk` onto `def` and record the event. Mutates `hp`. */
function resolveHit(
  state: DuelState,
  side: BattleSide,
  attacker: DuelCard,
  target: DuelCard,
  moveKind: MoveKind,
  hp: number[],
  targetIdx: number,
  rand: () => number,
  teamBlast = false,
): DuelEvent {
  const { damage, effect } = computeDamage(
    attacker.stats.atk,
    target.stats.def,
    moveKind,
    attacker.star,
    attacker.archetype,
    target.archetype,
    rand,
  )
  const next = Math.max(0, hp[targetIdx]! - damage)
  hp[targetIdx] = next
  const ev: DuelEvent = {
    kind: 'hit',
    side,
    attackerUid: attacker.uid,
    targetUid: target.uid,
    move: moveKind,
    moveName: moveKind === 'ultimate' ? 'Ultimate Blast' : moveKind === 'special' ? 'Special Move' : 'Quick Strike',
    damage,
    effect,
    targetHpAfter: next,
    targetMaxHp: Math.max(1, Math.round(target.stats.hp)),
    ko: next <= 0,
    ...(teamBlast ? { teamBlast: true } : {}),
  }
  state.log.push(ev)
  return ev
}

/** Advance one turn. `answer` is the player's tapped choice — EVERY player
 *  turn now carries a question (WS26), so it is meaningful on all player
 *  turns. Bot turns resolve from the seeded stream + `botAccuracy` and take
 *  no answer. `opts.botAlwaysCorrect` is a test hook (force the bot's answer
 *  right) used by the determinism/fairness probes. */
export function advance(
  state: DuelState,
  answer?: { chosen: number; correct: boolean },
  opts?: { botAlwaysCorrect?: boolean },
): DuelState {
  const s: DuelState = {
    ...state,
    player: state.player.map((c) => ({ ...c })),
    bot: state.bot.map((c) => ({ ...c })),
    playerHp: [...state.playerHp],
    botHp: [...state.botHp],
    log: [...state.log],
  }

  // --- resolve the outcome of the current phase before starting the next turn
  if (s.phase === 'playerFainted' || s.phase === 'botFainted' || s.phase === 'won' || s.phase === 'lost') {
    return s
  }

  const turn = s.turn
  const rand = turnRand(s, turn)
  const pCard = activeOf(s.player, s.playerActive)
  const bCard = activeOf(s.bot, s.botActive)

  // alternate: even turns = player, odd turns = bot
  const playerTurn = turn % 2 === 0

  if (playerTurn) {
    const isPower = turn % 4 === 0 // every 2nd PLAYER turn is a POWER turn
    const correct = answer?.correct ?? false
    if (correct) {
      const full = s.charge >= TEAM_BLAST_CHARGE
      // WS26: a correct answer is the ONLY way to deal damage. POWER turn ⇒
      // Special (or the Team-Blast Ultimate when the meter is full); other
      // turns ⇒ Quick.
      const move = chooseMove(pCard, isPower ? 'power' : 'auto', full, true)!
      const teamBlast = move === 'ultimate'
      resolveHit(s, 'player', pCard, bCard, move, s.botHp, s.botActive, rand, teamBlast)
      if (isPower) s.charge = teamBlast ? 0 : Math.min(TEAM_BLAST_CHARGE, s.charge + 1)
    } else {
      // WS26: a wrong answer deals NO damage (only POWER turns touch the meter).
      s.log.push({ kind: 'miss', side: 'player', actorUid: pCard.uid })
      if (isPower) s.charge = 0
    }
    s.qIndex += 1
  } else {
    // The bot answers its own question every turn (seeded, difficulty-driven
    // accuracy) and — exactly like the player — only deals damage on a
    // correct answer. It mirrors the player's cadence: POWER moves on
    // turn % 4 === 1, Quick otherwise, and Team-Blast banking uses the SAME
    // correct→+1 / wrong→reset rule (on its power turns only). The roll runs
    // BEFORE resolveHit spends `rand` on damage variance (WS18 parity fix).
    const isPower = turn % 4 === 1
    const correct = opts?.botAlwaysCorrect ? true : rand() < s.botAccuracy
    if (correct) {
      const full = s.botCharge >= TEAM_BLAST_CHARGE
      const move = chooseMove(bCard, isPower ? 'power' : 'auto', full, true)!
      const teamBlast = move === 'ultimate'
      resolveHit(s, 'bot', bCard, pCard, move, s.playerHp, s.playerActive, rand, teamBlast)
      if (isPower) s.botCharge = teamBlast ? 0 : Math.min(TEAM_BLAST_CHARGE, s.botCharge + 1)
    } else {
      s.log.push({ kind: 'miss', side: 'bot', actorUid: bCard.uid })
      if (isPower) s.botCharge = 0
    }
  }

  s.turn = turn + 1

  // --- phase transitions after the hit
  if (allDown(s.botHp)) {
    s.phase = 'won'
    return s
  }
  if (allDown(s.playerHp)) {
    s.phase = 'lost'
    return s
  }
  if (s.botHp[s.botActive]! <= 0) {
    s.phase = 'botFainted'
    return s
  }
  if (s.playerHp[s.playerActive]! <= 0) {
    s.phase = 'playerFainted'
    return s
  }

  // next turn: EVERY player turn surfaces a question (WS26)
  const nextPlayerTurn = s.turn % 2 === 0
  if (nextPlayerTurn) {
    s.phase = 'power'
    s.question = pickQuestion(s)
  } else {
    s.phase = 'auto'
    s.question = null
  }
  return s
}

/** Deterministic covered-question picker: cycles the deck, wrapping. */
function pickQuestion(state: DuelState): DuelQuestion | null {
  const deck = state.questions
  if (!deck.length) return null
  const q = deck[state.qIndex % deck.length]!
  return q
}

/** Swap the player's fainted active to a living card. Bot auto-swaps to the
 *  next living index. Returns the advanced state (no turn consumed). */
export function swapIn(state: DuelState, index?: number): DuelState {
  const s: DuelState = { ...state, playerHp: [...state.playerHp], botHp: [...state.botHp] }
  if (s.phase === 'playerFainted') {
    const pick = index ?? livingIndex(s.player, s.playerHp, s.playerActive + 1)
    if (pick < 0 || s.playerHp[pick]! <= 0) return s
    s.playerActive = pick
  } else if (s.phase === 'botFainted') {
    const next = livingIndex(s.bot, s.botHp, s.botActive + 1)
    if (next >= 0) s.botActive = next
  }
  // re-enter the normal cycle: every player turn carries a question (WS26)
  const nextIsPlayerTurn = s.turn % 2 === 0
  s.phase = nextIsPlayerTurn ? 'power' : 'auto'
  s.question = nextIsPlayerTurn ? pickQuestion(s) : null
  return s
}

/** True when the battle has concluded. */
export function isOver(state: DuelState): boolean {
  return state.phase === 'won' || state.phase === 'lost'
}

/** Convenience: run a whole duel to completion (tests + fast sims). The
 *  player side answers every turn per `playerAnswers` (default: all
 *  correct) — used by the determinism + fairness tests. */
export function simulate(
  args: CreateDuelArgs,
  playerAnswers?: (turn: number, q: DuelQuestion | null) => { chosen: number; correct: boolean },
  opts?: { botAlwaysCorrect?: boolean },
): DuelState {
  let s = createDuel(args)
  let guard = 0
  while (!isOver(s) && guard++ < 400) {
    if (s.phase === 'intro' || s.phase === 'auto' || s.phase === 'power') {
      const answer =
        s.phase === 'power'
          ? playerAnswers
            ? playerAnswers(s.turn, s.question)
            : { chosen: s.question?.answerIndex ?? 0, correct: true }
          : undefined
      s = advance(s, answer, opts)
    } else if (s.phase === 'playerFainted') {
      s = swapIn(s)
    } else if (s.phase === 'botFainted') {
      s = swapIn(s)
    }
  }
  return s
}
