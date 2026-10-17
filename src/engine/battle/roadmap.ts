/**
 * WS19 — Momo Battle roadmap content (PURE, additive). The separate battle
 * road-map: 12 themed villain gyms + a champion (PLAN.md §13.3). Nothing here
 * touches the subject lesson paths — this is a standalone track that unlocks
 * on a gentle escalating completed-lesson count.
 *
 * Unlock rule: gym N unlocks once the player has completed
 * `ROADMAP_UNLOCK[gym]` COMPLETED non-boss lessons across all subjects.
 * Rewards scale with gym (gems + XP), and the champion pays the biggest prize.
 */
import { CARD_ARCHETYPE, type Archetype } from './archetypes'
import type { LessonProgress } from '../store'

/** Boss-lesson convention used across the app: unit boss lessons end in 'boss'. */
export const isBossLessonId = (lessonId: string): boolean => lessonId.endsWith('boss')

/** Count COMPLETED non-boss lessons across every subject (the roadmap's
 *  unlock currency). Boss lessons are excluded so a single boss clear can't
 *  inflate the battle unlock counter. */
export function countCompletedLessons(
  lessonProgress: Record<string, LessonProgress | undefined>,
): number {
  let n = 0
  for (const key of Object.keys(lessonProgress)) {
    const p = lessonProgress[key]
    if (!p || (p.completions ?? 0) <= 0) continue
    if (isBossLessonId(key)) continue
    n += 1
  }
  return n
}

/** Is gym `index` unlocked given the completed-lesson count? Gym 1 is always
 *  open (entry point). */
export function isGymUnlocked(index: number, completedLessons: number): boolean {
  const need = ROADMAP_UNLOCK[index]
  if (need === undefined) return false
  return completedLessons >= need
}

/** One villain boss on the battle roadmap. */
export interface GymDef {
  /** 1-based gym number (1..12 gyms, 13 = champion). */
  index: number
  /** display name, e.g. "Eggman's Workshop" */
  name: string
  /** villain theming line shown on the map node */
  villain: string
  /** boss card roster id (must exist in CARD_ARCHETYPE / cards.ts) */
  bossCardId: string
  /** the three bot card roster ids the boss leads */
  botCardIds: string[]
  /** gems granted on first clear */
  gems: number
  /** battle XP granted on first clear */
  xp: number
  /** true when this node is the champion (hardest scaling, biggest prize) */
  champion: boolean
}

/** Roadmap length: 12 gyms + champion = 13 nodes. */
export const GYM_COUNT = 12
export const TOTAL_NODES = GYM_COUNT + 1 // + champion

/**
 * Completed-lesson unlock curve (PLAN.md §13.3): gentle + escalating, NOT
 * "every five". Counted over COMPLETED non-boss lessons across all subjects.
 * Index = gym number (1-based), value = lessons required. Champion (13) at 100.
 */
export const ROADMAP_UNLOCK: Record<number, number> = {
  1: 0,
  2: 3,
  3: 7,
  4: 12,
  5: 18,
  6: 25,
  7: 33,
  8: 42,
  9: 52,
  10: 63,
  11: 75,
  12: 88,
  13: 100,
}

/** Bot stat multiplier per gym (scaling knob from PLAN.md §13.4).
 *  GENTLE on purpose: the roadmap's card tiers (common→exclusive) already
 *  escalate difficulty, so this only adds a small monotonic nudge. Tuned via
 *  a balance probe (tmp/_balance): with same-tier cards a maxed perfect
 *  player (star5/level10 = ×2.655) must still beat every gym — so the total
 *  bot multiplier (star × mul) stays under ~2.5 even at the champion. */
export function gymBotMul(gym: number): number {
  return 1 + 0.02 * (Math.max(1, gym) - 1)
}

/** Bot star level per gym: 1 at gyms 1-4, +1 every 4 gyms, capped at 4.
 *  (Deliberately NOT 5 — the exclusive-tier champion bodies carry the late
 *  game; max-starred bots would make gym 13 mathematically unwinnable.) */
export function gymBotStar(gym: number): number {
  return Math.min(4, 1 + Math.floor((Math.max(1, gym) - 1) / 4))
}

/** Gems for first clear of gym N. */
export const GYM_GEMS: Record<number, number> = {
  1: 14, 2: 20, 3: 26, 4: 32, 5: 38, 6: 44, 7: 50,
  8: 56, 9: 62, 10: 68, 11: 74, 12: 80, 13: 90,
}

/** Battle XP for first clear of gym N. */
export const GYM_XP: Record<number, number> = {
  1: 30, 2: 40, 3: 50, 4: 60, 5: 70, 6: 80, 7: 90,
  8: 100, 9: 110, 10: 120, 11: 130, 12: 140, 13: 160,
}

/**
 * The 13 villain gyms (drafted villain line from PLAN.md §13.4). Boss/bot
 * roster IDs are referenced here so they resolve at deck-build time; the 3
 * battle-exclusive cards are added to cards.ts in WS23.
 */
export const ROADMAP_GYMS: GymDef[] = [
  { index: 1, name: 'Eggman\'s Factory', villain: 'Eggman', bossCardId: 'egg-robo', botCardIds: ['motobug', 'crabmeat', 'egg-pawn'], gems: GYM_GEMS[1]!, xp: GYM_XP[1]!, champion: false },
  { index: 2, name: 'Zeti Outpost', villain: 'The Zeti', bossCardId: 'zazz', botCardIds: ['zomom', 'zor', 'zeena'], gems: GYM_GEMS[2]!, xp: GYM_XP[2]!, champion: false },
  { index: 3, name: 'Metal Workshop', villain: 'Metal Sonic', bossCardId: 'metal', botCardIds: ['metal-knuckles', 'tails-doll', 'egg-robo'], gems: GYM_GEMS[3]!, xp: GYM_XP[3]!, champion: false },
  { index: 4, name: 'Time Rift', villain: 'Mephiles', bossCardId: 'mephiles', botCardIds: ['shadow', 'silver', 'infinite'], gems: GYM_GEMS[4]!, xp: GYM_XP[4]!, champion: false },
  { index: 5, name: 'Phantom Circuit', villain: 'Infinite', bossCardId: 'infinite', botCardIds: ['whisper', 'omega', 'gamma'], gems: GYM_GEMS[5]!, xp: GYM_XP[5]!, champion: false },
  { index: 6, name: 'Chaos Lagoon', villain: 'Chaos', bossCardId: 'chaos', botCardIds: ['perfect-chaos', 'tikal', 'cream'], gems: GYM_GEMS[6]!, xp: GYM_XP[6]!, champion: false },
  { index: 7, name: 'Black Arms Ship', villain: 'Black Doom', bossCardId: 'black-doom', botCardIds: ['shadow', 'super-shadow', 'infinite'], gems: GYM_GEMS[7]!, xp: GYM_XP[7]!, champion: false },
  { index: 8, name: 'Devil\'s Doom', villain: 'Devil Doom', bossCardId: 'devil-doom', botCardIds: ['black-doom', 'shadow', 'super-shadow'], gems: GYM_GEMS[8]!, xp: GYM_XP[8]!, champion: false },
  { index: 9, name: 'Perfect Chaos Core', villain: 'Perfect Chaos', bossCardId: 'perfect-chaos', botCardIds: ['chaos', 'silver', 'tikal'], gems: GYM_GEMS[9]!, xp: GYM_XP[9]!, champion: false },
  { index: 10, name: 'Time Eater Rift', villain: 'Time Eater', bossCardId: 'time-eater', botCardIds: ['super', 'hyper-sonic', 'super-shadow'], gems: GYM_GEMS[10]!, xp: GYM_XP[10]!, champion: false },
  { index: 11, name: 'Dark Gaia\'s Maw', villain: 'Dark Gaia', bossCardId: 'dark-gaia', botCardIds: ['devil-doom', 'time-eater', 'perfect-chaos'], gems: GYM_GEMS[11]!, xp: GYM_XP[11]!, champion: false },
  { index: 12, name: 'Eggman-Nega\'s Fleet', villain: 'Eggman-Nega', bossCardId: 'eggman-nega', botCardIds: ['metal', 'metal-overlord', 'eggman'], gems: GYM_GEMS[12]!, xp: GYM_XP[12]!, champion: false },
  { index: 13, name: 'Champion\'s Throne', villain: 'Metal Overlord', bossCardId: 'metal-overlord', botCardIds: ['perfect-chaos', 'dark-gaia', 'time-eater'], gems: GYM_GEMS[13]!, xp: GYM_XP[13]!, champion: true },
]

/** Gym by 1-based index (1..13). */
export function gymDef(index: number): GymDef {
  const g = ROADMAP_GYMS.find((x) => x.index === index)
  if (!g) throw new Error(`battle: no gym at index ${index}`)
  return g
}

/** The 13 boss archetypes (for the roadmap's type-preview strip). */
export function bossArchetypes(): { index: number; archetype: Archetype }[] {
  return ROADMAP_GYMS.map((g) => ({ index: g.index, archetype: archetypeOfSafe(g.bossCardId) }))
}

/** Safe archetype lookup for roadmap content (bosses are pre-vetted). */
function archetypeOfSafe(id: string): Archetype {
  const a = CARD_ARCHETYPE[id]
  if (!a) throw new Error(`battle: roadmap references unknown card '${id}'`)
  return a
}
