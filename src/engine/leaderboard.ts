// Shared weekly leaderboard — every device syncs through the momolearn.space API.
// Real players replace the practice bots one-for-one as they join.

import { LEAGUE_RIVALS, type LeagueRival, type LeagueName } from './gamification'

export interface SharedPlayer {
  id: string
  name: string
  xp: number // weekly XP for `week`
  league: LeagueName
  mascot: string
  week: string // Monday-based week key
  updatedAt?: number
}

export const LEADERBOARD_API = 'https://momolearn-ai.vercel.app/api/year2/leaderboard'

export async function fetchSharedPlayers(): Promise<SharedPlayer[]> {
  try {
    const res = await fetch(LEADERBOARD_API, { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data?.entries) ? (data.entries as SharedPlayer[]) : []
  } catch {
    return []
  }
}

/** Push my entry; resolves to the merged list (or [] on failure). */
export async function pushSharedPlayer(player: SharedPlayer): Promise<SharedPlayer[]> {
  try {
    const res = await fetch(LEADERBOARD_API, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry: player }),
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data?.entries) ? (data.entries as SharedPlayer[]) : []
  } catch {
    return []
  }
}

/** XP a shared player counts for the given week (stale weeks count as 0). */
export function weeklyXpOf(p: SharedPlayer, wk: string): number {
  return p.week === wk ? Math.max(0, Math.round(p.xp)) : 0
}

/** One bot leaves the board for every real player on it. */
export function botsForPlayerCount(realCount: number): LeagueRival[] {
  return LEAGUE_RIVALS.slice(0, Math.max(0, LEAGUE_RIVALS.length - Math.max(0, realCount)))
}
