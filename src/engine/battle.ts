/* Prodigy-style battle loop ported from sonic-world (PLAN Phase 8).
 *   - Questions ARE combat. Correct answer → attack.
 *   - Every 3rd consecutive correct charges a SPECIAL move (2.5x).
 *   - Wrong answer → miss your turn (no damage) AND the enemy hits you;
 *     the UI shows q.hint from the question.
 *   - Player HP 0 → 'lost' = free retry (no penalty, no progress loss).
 *   - HP decides the battle: never ends on mistake count or accuracy — when
 *     the question batch runs out mid-battle a fresh batch is appended.
 *   - kinds: lesson | boss only (no zones/elements).
 */

import type { Question, Subject } from '../content/types'
import { getCurriculum } from '../content/registry'
import { QUESTIONS_PER_LESSON } from '../content/curriculum'

export type BattleKind = 'lesson' | 'boss'

export interface BuddyPassive {
  hp: number
  dmg: number
  healOnSpecial: number
}

/** Passives keyed by `player.mascot`; unknown ids fall back to `none`. */
export const BUDDY_PASSIVES: Record<string, BuddyPassive> = {
  none: { hp: 0, dmg: 0, healOnSpecial: 0 },
  tails: { hp: 12, dmg: 0, healOnSpecial: 0 },
  knuckles: { hp: 0, dmg: 3, healOnSpecial: 0 },
  amy: { hp: 6, dmg: 0, healOnSpecial: 6 },
  shadow: { hp: 4, dmg: 2, healOnSpecial: 0 },
  cream: { hp: 10, dmg: 0, healOnSpecial: 4 },
  blaze: { hp: 0, dmg: 4, healOnSpecial: 0 },
  rouge: { hp: 8, dmg: 1, healOnSpecial: 2 },
  silver: { hp: 14, dmg: 0, healOnSpecial: 0 },
  vector: { hp: 10, dmg: 1, healOnSpecial: 0 },
  omega: { hp: 6, dmg: 3, healOnSpecial: 0 },
  espio: { hp: 5, dmg: 2, healOnSpecial: 2 },
  // momomath roster extras (card-only ids fall back to none)
  sonic: { hp: 8, dmg: 1, healOnSpecial: 0 },
  metal: { hp: 6, dmg: 2, healOnSpecial: 0 },
  eggman: { hp: 10, dmg: 0, healOnSpecial: 4 },
  charmy: { hp: 4, dmg: 1, healOnSpecial: 2 },
  big: { hp: 14, dmg: 0, healOnSpecial: 0 },
  ray: { hp: 7, dmg: 2, healOnSpecial: 0 },
  jet: { hp: 5, dmg: 3, healOnSpecial: 0 },
  super: { hp: 6, dmg: 4, healOnSpecial: 2 },
}

export interface BattleConfig {
  kind: BattleKind
  subject: Subject
  lessonId: string
  enemyName: string
  /** player.mascot id — selects buddy passive */
  mascotId: string
}

export interface BattleFeedback {
  correct: boolean
  message: string
  damage: number
  taken: number
  special: boolean
}

export interface BattleState {
  cfg: BattleConfig
  questions: Question[]
  index: number
  playerHp: number
  playerHpMax: number
  enemyHp: number
  enemyHpMax: number
  charge: number
  streak: number
  bestStreak: number
  correct: number
  wrong: number
  status: 'active' | 'won' | 'lost'
  lastFeedback: BattleFeedback | null
}

const BASE_DMG = 10
const SPECIAL_MULT = 2.5
const CHARGE_NEEDED = 3
const PLAYER_BASE_HP = 60
const REFILL_BATCH = 5
const QUESTIONS_PER_BOSS = QUESTIONS_PER_LESSON

function findLesson(subject: Subject, lessonId: string) {
  return getCurriculum(subject).allLessons[lessonId]?.lesson ?? null
}

function enemyHpFor(kind: BattleKind, qCount: number): number {
  if (kind === 'boss') return 150
  return Math.round(qCount * 10)
}

function enemyHitFor(kind: BattleKind): number {
  if (kind === 'boss') return 11
  return 7
}

function questionCountFor(kind: BattleKind): number {
  return kind === 'boss' ? QUESTIONS_PER_BOSS : QUESTIONS_PER_LESSON
}

export function battleKindFor(lessonId: string): BattleKind {
  return lessonId.endsWith('boss') ? 'boss' : 'lesson'
}

/** Display name for the enemy at this node (boss art vs badnik cycle). */
export function enemyNameFor(kind: BattleKind, lessonId: string): string {
  let h = 0
  for (let i = 0; i < lessonId.length; i++) h = (h * 31 + lessonId.charCodeAt(i)) | 0
  const u = h >>> 0
  if (kind === 'boss') return u % 2 === 0 ? 'Dr. Eggman' : 'Metal Sonic'
  const badniks = [
    'Motobug',
    'Buzz Bomber',
    'Chopper',
    'Egg Pawn',
    'Driptooter',
    'Grabber',
    'Spiker',
    'Yadrin',
    'Bomber Hawk',
    'Buzzer',
    'Mantis',
    'Pengu-Bot',
    'Grounder',
    'Scratch',
    'Coconuts',
    'Aquis',
    "Jet Prop'n",
    'Krako',
    'Swat-Bot',
    'Pata-Bata',
    'Butterdroid',
    'Egg Robo',
  ]
  return badniks[u % badniks.length]
}

export function createBattle(
  cfg: BattleConfig,
  seed: number,
): BattleState | null {
  const found = findLesson(cfg.subject, cfg.lessonId)
  if (!found) return null
  const n = questionCountFor(cfg.kind)
  const questions = found.generate(n, seed)
  const passive = BUDDY_PASSIVES[cfg.mascotId] ?? BUDDY_PASSIVES.none
  const playerHpMax = PLAYER_BASE_HP + passive.hp
  const enemyHpMax = enemyHpFor(cfg.kind, questions.length)
  return {
    cfg,
    questions,
    index: 0,
    playerHp: playerHpMax,
    playerHpMax,
    enemyHp: enemyHpMax,
    enemyHpMax,
    charge: 0,
    streak: 0,
    bestStreak: 0,
    correct: 0,
    wrong: 0,
    status: 'active',
    lastFeedback: null,
  }
}

/** Pure reducer: apply the result of grading question `index`. */
export function answerBattle(state: BattleState, wasCorrect: boolean, teachLine = ''): BattleState {
  if (state.status !== 'active') return state
  const passive = BUDDY_PASSIVES[state.cfg.mascotId] ?? BUDDY_PASSIVES.none
  const enemyHit = enemyHitFor(state.cfg.kind)
  const playerMult = 1 + passive.dmg * 0.1

  let damage = 0
  let taken = 0
  let special = false
  let charge = state.charge
  let streak = state.streak
  let correct = state.correct
  let wrong = state.wrong

  if (wasCorrect) {
    charge += 1
    streak += 1
    correct += 1
    if (charge >= CHARGE_NEEDED) {
      charge = 0
      special = true
      damage = Math.round(BASE_DMG * SPECIAL_MULT * playerMult)
    } else {
      damage = Math.round((BASE_DMG + Math.min(6, streak)) * playerMult)
    }
  } else {
    charge = 0
    streak = 0
    wrong += 1
    taken = enemyHit
  }

  const enemyHp = Math.max(0, state.enemyHp - damage)
  let playerHp = Math.max(0, state.playerHp - taken)
  if (special && passive.healOnSpecial > 0) {
    playerHp = Math.min(state.playerHpMax, playerHp + passive.healOnSpecial)
  }

  let status: BattleState['status'] = 'active'
  let questions = state.questions
  if (enemyHp <= 0) status = 'won'
  else if (playerHp <= 0) status = 'lost'
  else if (state.index + 1 >= state.questions.length) {
    // HP decides: NEVER end on question count / accuracy — append a fresh batch.
    const found = findLesson(state.cfg.subject, state.cfg.lessonId)
    if (found) {
      const seed = ((state.index + 1) * 7919 + state.correct * 31 + state.wrong * 7 + 1) % 1_000_000_007
      questions = [...state.questions, ...found.generate(REFILL_BATCH, seed)]
    }
  }

  const message = wasCorrect
    ? special
      ? `⚡ SPECIAL MOVE! ${teachLine || 'Perfect streak!'}`
      : `Direct hit! ${teachLine || 'Keep it up!'}`
    : teachLine || 'Missed turn — the enemy strikes back. Read the tip and try the next one!'

  return {
    ...state,
    questions,
    index: state.index + 1,
    enemyHp,
    playerHp,
    charge,
    streak,
    bestStreak: Math.max(state.bestStreak, streak),
    correct,
    wrong,
    status,
    lastFeedback: { correct: wasCorrect, message, damage, taken, special },
  }
}

export function battleAccuracy(s: BattleState): number {
  const answered = s.correct + s.wrong
  return answered === 0 ? 0 : s.correct / answered
}
