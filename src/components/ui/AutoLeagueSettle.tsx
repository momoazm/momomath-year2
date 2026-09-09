import { useEffect, useState } from 'react'
import { isValidAnchor, usePlayer } from '../../engine/store'
import { useAuth } from '../../engine/auth'
import { leagueWeekElapsed, weekKey } from '../../engine/gamification'
import { fetchSharedPlayers } from '../../engine/leaderboard'
import { buildStandings } from '../../engine/standings'

/**
 * Background league auto-adjust: settles EVERY user's league week without
 * requiring a visit to the Leagues tab. When the 7-day week elapsed (or a
 * finished week is pending from lesson time), it pulls the shared board,
 * ranks identically to the Leagues screen, and runs the rank-based settle
 * (top 3 promote / middle stay / bottom 3 demote). Renders nothing.
 * Idempotent with the Leagues tab's own settle — the second call no-ops.
 */
export function AutoLeagueSettle() {
  const pending = usePlayer((x) => x.pendingLeagueSettle)
  const anchor = usePlayer((x) => x.weeklyXpWeek)
  const [tick, setTick] = useState(0)

  // Re-check shortly after week boundaries even mid-session.
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 60_000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const st = usePlayer.getState()
    const an = st.weeklyXpWeek
    const pa = st.pendingLeagueSettle
    const live = isValidAnchor(an) && !leagueWeekElapsed(an, new Date())
    if (live && !pa) return
    let alive = true
    const authUser = useAuth.getState().user
    fetchSharedPlayers().then((shared) => {
      if (!alive) return
      const cur = usePlayer.getState()
      const curAnchor = cur.weeklyXpWeek
      const curPending = cur.pendingLeagueSettle
      const curLive =
        isValidAnchor(curAnchor) && !leagueWeekElapsed(curAnchor, new Date())
      if (curLive && !curPending) return
      const myId = authUser?.sub
        ? `g:${authUser.sub}`
        : `name:${cur.name.trim().toLowerCase()}`
      const { standings, myRank } = buildStandings({
        shared,
        myId,
        myName: cur.name.trim().toLowerCase(),
        name: cur.name,
        weeklyXp: cur.weeklyXp,
        mascot: cur.mascot,
        currentLeague: cur.currentLeague,
        anchor: curAnchor,
        boardWeek: weekKey(new Date()),
      })
      cur.syncLeagueWeekByRank(myRank, standings.length)
    })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending, anchor, tick])

  return null
}
