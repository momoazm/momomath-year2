/**
 * WS22 — squad builders (PURE, additive). Bridge save data → `DuelCard`s for
 * BOTH sides of a duel:
 *
 *  - PLAYER side: owned cards only (star from `cardStars` copies, battle
 *    level from `cardBattleXp`, stats via `ownedCardStats`) — exactly what
 *    the squad picker shows.
 *  - BOT side: the gym's villain squad from `roadmap.ts`, scaled by
 *    `gymBotMul` (strictly escalating hp/atk, §13.3) at the gym's bot star
 *    level (`gymBotStar`). The bot never cheats — same `deriveStats` curve
 *    as the player, just a gym-scaled budget.
 *
 * The bot's 3 FIGHTING cards are two minions first and the BOSS last: a
 * faint walks indices in order, so the boss is the finale (gym-leader ace).
 */
import { ALL_CARDS, CARD_BY_ID, type CardDef } from '../cards'
import { CARD_ARCHETYPE, type Archetype } from './archetypes'
import { DEFAULT_BATTLE_DIFFICULTY, effectiveBattleDifficulty, type BattleDifficulty } from './difficulty'
import type { DuelCard } from './duel'
import { deriveStats, ownedCardStats, type BattleStats } from './stats'
import { gymBotMul, gymBotStar, gymDef } from './roadmap'

/** Max squad size (3v3, LOCKED §13.1). */
export const SQUAD_SIZE = 3

/** One owned card as the squad picker shows it. */
export interface SquadEntry {
  def: CardDef
  /** star level 0-5 derived from duplicate copies (`toStar`). */
  star: number
  /** battle level 1-10 derived from `cardBattleXp`. */
  level: number
  stats: BattleStats
  archetype: Archetype
}

const r2 = (n: number): number => Math.round(n * 100) / 100
const total = (s: BattleStats): number => s.hp + s.atk + s.def

/** The bot's 3 fighting cards for a gym: two minions first, BOSS last. */
export function gymBotSquad(gym: number): string[] {
  const g = gymDef(gym)
  return [g.botCardIds[0]!, g.botCardIds[1]!, g.bossCardId]
}

/**
 * Owned cards as picker entries, STRONGEST FIRST (drives the §13.6
 * auto-pick-strongest default). Pure: never mutates the save fields.
 */
export function ownedSquadEntries(
  cardStars: Record<string, number>,
  cardBattleXp: Record<string, number>,
): SquadEntry[] {
  const out: SquadEntry[] = []
  for (const def of ALL_CARDS) {
    const copies = cardStars[def.id] ?? 0
    if (copies <= 0) continue // unowned cards never enter the squad
    const { star, level, hp, atk, def: defStat } = ownedCardStats(
      def.tier,
      copies,
      cardBattleXp[def.id] ?? 0,
    )
    out.push({
      def,
      star,
      level,
      stats: { hp, atk, def: defStat },
      archetype: CARD_ARCHETYPE[def.id] ?? 'speed',
    })
  }
  out.sort((a, b) => total(b.stats) - total(a.stats))
  return out
}

/** The strongest `n` owned card ids — the picker's pre-selected squad. */
export function autoPickStrongest(entries: readonly SquadEntry[], n = SQUAD_SIZE): string[] {
  return entries.slice(0, n).map((e) => e.def.id)
}

/** One picked squad entry as a `DuelCard` (player side). */
export function playerDuelCard(entry: SquadEntry): DuelCard {
  return {
    uid: `you:${entry.def.id}`,
    cardId: entry.def.id,
    name: entry.def.name,
    tier: entry.def.tier,
    archetype: entry.archetype,
    stats: entry.stats,
    star: entry.star,
    bot: false,
  }
}

/**
 * The gym's 3 bot `DuelCard`s: gym star level + `gymBotMul` scaling on the
 * shared stat curve (§13.3 strictly escalating hp/atk per gym), then the
 * WS26/WS27 difficulty tier on top (hp/atk × per tier — def is untouched so
 * player damage stays comparable across tiers; the rival's special moves get
 * the tier's specialMul inside duel.ts).
 */
export function gymBotDuelCards(
  gym: number,
  difficulty: BattleDifficulty = DEFAULT_BATTLE_DIFFICULTY,
): DuelCard[] {
  const mul = gymBotMul(gym)
  const star = gymBotStar(gym)
  // WS27: late gyms compress the tier extras (elite base rival) — see
  // effectiveBattleDifficulty in difficulty.ts.
  const tier = effectiveBattleDifficulty(difficulty, gym)
  return gymBotSquad(gym).map((cardId) => {
    const def = CARD_BY_ID[cardId]
    if (!def) throw new Error(`battle: gym ${gym} references unknown card '${cardId}'`)
    const base = deriveStats(def.tier, star, 1)
    return {
      uid: `bot:${cardId}`,
      cardId,
      name: def.name,
      tier: def.tier,
      archetype: CARD_ARCHETYPE[cardId] ?? 'tech',
      stats: {
        hp: r2(base.hp * mul * tier.hpMul),
        atk: r2(base.atk * mul * tier.atkMul),
        def: r2(base.def * mul),
      },
      star,
      bot: true,
    }
  })
}
