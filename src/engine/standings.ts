import { botsForPlayerCount, dedupSelf, entriesForYear, weeklyXpOf, type SharedPlayer } from './leaderboard'
import { rivalXp, type LeagueName } from './gamification'

export interface StandingRow {
  id: string
  name: string
  xp: number
  isYou: boolean
  kind: 'you' | 'real' | 'bot'
  mascotId?: string
  icon?: string
}

export interface StandingsInput {
  shared: SharedPlayer[]
  myId: string
  myName: string
  /** display name for the local "you" row */
  name: string
  weeklyXp: number
  mascot: string
  currentLeague: LeagueName
  /** league-week anchor (drives bot-rival XP) */
  anchor: string
  /** Monday-based shared board week (drives dedup + real-player XP) */
  boardWeek: string
  /** Active school year (PLAN 164): only that year's board rows count and
   *  their `yN:` prefixes are stripped before dedup/display. Defaults to 2
   *  (the legacy unprefixed board). */
  year?: number
  now?: Date
}

/**
 * Build the primary 10-row standings board (shared by the Leagues screen
 * and the background auto-settler so both rank identically): deduped real
 * players + bots padding to 10 + the local "you" row, sorted by XP desc.
 */
export function buildStandings(input: StandingsInput): {
  standings: StandingRow[]
  myRank: number
  others: SharedPlayer[]
  realCount: number
} {
  const { shared, myId, myName, name, weeklyXp, mascot, currentLeague, anchor, boardWeek } = input
  const now = input.now ?? new Date()
  // PLAN 164 — scope the flat shared board to the active year's namespace
  // (prefix stripped) so rows compare against the raw local id and render
  // exactly like before; other years' entries never rank here.
  const scoped = entriesForYear(shared, input.year ?? 2)
  const others = dedupSelf(scoped, myId, myName, boardWeek).filter((p) => p.id !== myId)
  const realCount = 1 + others.length
  const bots = botsForPlayerCount(realCount)
  const standings: StandingRow[] = [
    ...others.map((p) => ({
      id: p.id,
      name: p.name,
      xp: weeklyXpOf(p, boardWeek),
      isYou: false,
      kind: 'real' as const,
      mascotId: p.mascot,
    })),
    ...bots.map((r) => ({
      id: r.id,
      name: r.name,
      xp: rivalXp(r, currentLeague, anchor, now),
      isYou: false,
      kind: 'bot' as const,
      icon: r.icon,
    })),
    {
      id: myId,
      name,
      xp: weeklyXp,
      isYou: true,
      kind: 'you' as const,
      mascotId: mascot,
    },
  ].sort((a, b) => b.xp - a.xp)
  const myRank = standings.findIndex((p) => p.isYou) + 1
  return { standings, myRank, others, realCount }
}
