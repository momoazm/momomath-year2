import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  LEAGUES,
  LEAGUE_META,
  advanceLeague,
  leagueOutcomeByRank,
  leagueWeekElapsed,
  msUntilWeekEnd,
  rivalXp,
  weekKey,
  weeklyGoal,
  type LeagueName,
} from '../engine/gamification'
import {
  botsForPlayerCount,
  dedupSelf,
  fetchSharedPlayers,
  pushSharedPlayer,
  weeklyXpOf,
  type SharedPlayer,
} from '../engine/leaderboard'
import { isValidAnchor, usePlayer } from '../engine/store'
import { useAuth } from '../engine/auth'
import { Mascot } from '../components/mascots/Mascots'

type Zone = 'promo' | 'stay' | 'danger'

type Row = {
  id: string
  name: string
  xp: number
  isYou: boolean
  kind: 'you' | 'real' | 'bot'
  mascotId?: string
  icon?: string
}

function zoneOfRank(rank: number, total: number): Zone {
  // Zone dividers follow BOARD RANK so the display matches the settle bands:
  // top 3 promote, next 4 safe, last 3 demote on a 10-player board
  // (scales for other sizes via leagueOutcomeByRank).
  const o = leagueOutcomeByRank(rank, total)
  return o === 'promoted' ? 'promo' : o === 'demoted' ? 'danger' : 'stay'
}

const ZONE_DIVIDER: Record<Zone, { label: string; cls: string }> = {
  promo: { label: '⬆️ Promotion zone', cls: 'text-emerald-500' },
  stay: { label: '➖ Safe zone', cls: 'text-slate-400' },
  danger: { label: '⬇️ Demotion zone', cls: 'text-red-400' },
}

function formatCountdown(msLeft: number): string {
  const total = Math.max(0, Math.floor(msLeft / 1000))
  const d = Math.floor(total / 86400)
  const h = Math.floor((total % 86400) / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${d}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
}

export function LeaguesScreen() {
  const s = usePlayer()
  const authUser = useAuth((a) => a.user)
  const [nowMs, setNowMs] = useState(() => Date.now())
  const [shared, setShared] = useState<SharedPlayer[]>([])

  const myId = authUser?.sub
    ? `g:${authUser.sub}`
    : `name:${s.name.trim().toLowerCase()}`

  // Dedup helper: filter the API's shared list so the local player (matched
  // by id OR by lowercased name) never appears twice in the standings. This
  // catches the case where a player has both a Google-signed entry
  // (`g:<sub>`) AND a name-only entry (`name:fares`) from an earlier session
  // — the local player should be represented by exactly one row.
  const myName = s.name.trim().toLowerCase()

  // League weeks are anchored at 12:00 AM of the day they began and run for
  // exactly 7 days. `boardWeek` is the shared Monday-based key used on the
  // leaderboard so all players' entries compare the same calendar week.
  const anchor = s.weeklyXpWeek
  // boardWeek (Monday identity for the shared board) is derived from the SAME
  // nowMs clock as weekLive so both flip at the same tick and old-week XP can
  // never be pushed under the new week's key at the boundary.
  const boardWeek = weekKey(new Date(nowMs))
  const dedupShared = (rows: typeof shared): typeof shared => dedupSelf(rows, myId, myName, boardWeek)

  const weekLive = isValidAnchor(anchor) && !leagueWeekElapsed(anchor, new Date(nowMs))
  const needsSettle = !weekLive
  // anchorBoardWeek removed - using boardWeek directly

  // tick every second for the live countdown + rival progress
  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  // pull everyone else's progress, then keep polling
  useEffect(() => {
    let alive = true
    const load = () =>
      fetchSharedPlayers().then((entries) => {
        if (alive) setShared(entries)
      })
    load()
    const t = setInterval(load, 30_000)
    return () => {
      alive = false
      clearInterval(t)
    }
  }, [])

  // share my progress whenever it changes (and once on entry).
  // Never push a stale or elapsed week: while `needsSettle` is true the XP still
  // belongs to the finished week, so we wait for the settle/promote to reset it.
  useEffect(() => {
    if (!s.name.trim() || !weekLive) return
    let alive = true
    pushSharedPlayer({
      id: myId,
      name: s.name.trim(),
      xp: s.weeklyXp,
      league: s.currentLeague,
      mascot: s.mascot,
      week: boardWeek,
    }).then((entries) => {
      if (alive && entries.length) setShared(entries)
    })
    return () => {
      alive = false
    }
  }, [myId, s.name, s.weeklyXp, s.currentLeague, s.mascot, s.weeklyXpWeek, boardWeek, weekLive])

  const meta = LEAGUE_META[s.currentLeague]
  const goal = weeklyGoal(s.currentLeague)
  const countdown = formatCountdown(msUntilWeekEnd(anchor, new Date(nowMs)))

  const others = dedupShared(shared).filter((p) => p.id !== myId)
  const realCount = 1 + others.length
  const bots = botsForPlayerCount(realCount)

  const standings: Row[] = [
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
      xp: rivalXp(r, s.currentLeague, anchor, new Date(nowMs)),
      isYou: false,
      kind: 'bot' as const,
      icon: r.icon,
    })),
    {
      id: myId,
      name: s.name,
      xp: s.weeklyXp,
      isYou: true,
      kind: 'you' as const,
      mascotId: s.mascot,
    },
  ].sort((a, b) => b.xp - a.xp)

  const myRank = standings.findIndex((p) => p.isYou) + 1

  // Secondary board: other real players whose `league` differs from ours.
  // When the API has >10 real players on the same week, the primary board
  // shows the top 10 and the rest are grouped here by their own league.
  type SecondaryRow = { id: string; name: string; xp: number; mascot: string }
  const secondaryLeagues: [LeagueName, SecondaryRow[]][] = (() => {
    const groups = new Map<LeagueName, SecondaryRow[]>()
    for (const p of others) {
      if (p.league === s.currentLeague) continue
      const list = groups.get(p.league) ?? []
      list.push({
        id: p.id,
        name: p.name,
        xp: weeklyXpOf(p, boardWeek),
        mascot: p.mascot,
      })
      groups.set(p.league, list)
    }
    // sort each league's rows by XP desc
    for (const rows of groups.values()) rows.sort((a, b) => b.xp - a.xp)
    // order leagues by the canonical order (Bronze -> Diamond)
    return Array.from(groups.entries()).sort(
      (a, b) => LEAGUES.indexOf(a[0]) - LEAGUES.indexOf(b[0]),
    )
  })()

  // banner copy: at the top/bottom league the move is a no-op, so say so
  const settle = s.lastLeagueSettle
  const settleNext = settle ? advanceLeague(settle.league, settle.outcome) : null
  const settleMoved = settle != null && settleNext !== settle.league

  // When the 7-day league week ends, the whole board settles by rank:
  //   - top 3   promote (clamped to Diamond)
  //   - middle  stay
  //   - bottom  demote (clamped to Bronze)
  // XP resets to 0 and the timer restarts at 12:00 AM of the new week.
  // The board is padded to 10 by bots when fewer real players are present;
  // any extras (>10) appear in a secondary leaderboard grouped by league
  // (rendered below). Idempotent.
  // Settle when the week elapsed OR a finished week is pending from lesson
  // time — the pending snapshot carries the finished week's XP into the
  // rank bands (top 3 promote / middle stay / bottom 3 demote). Idempotent.
  useEffect(() => {
    if (!needsSettle && !s.pendingLeagueSettle) return
    s.syncLeagueWeekByRank(myRank, standings.length)
    // re-run only when the settle state or the final rank changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsSettle, s.pendingLeagueSettle, myRank, standings.length])

  const pct = Math.min(100, Math.round((s.weeklyXp / goal) * 100))

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-28 pt-4">
      <div className="flex flex-col items-center">
        <div className="relative h-28 w-28 gpu animate-float-y text-7xl">{meta.icon}</div>
        <h1 className="font-display text-2xl font-extrabold" style={{ color: meta.color }}>
          {s.currentLeague} League
        </h1>
        <p className="text-center font-body text-sm font-bold text-slate-400">
          Reach {goal} XP to be promoted &middot; you&rsquo;re #{myRank}
        </p>
        {/* live countdown to Monday reset */}
        <p
          data-testid="reset-countdown"
          className="mt-1 rounded-full bg-slate-800 px-3 py-1 font-display text-sm font-extrabold tabular-nums tracking-wide text-white"
          title="Time until the league resets (Monday 00:00)"
        >
          ⏳ Resets in {countdown}
        </p>
        {/* last week's promotion/demotion result — shown until dismissed */}
        {s.lastLeagueSettle && (
          <div
            data-testid="league-settle-banner"
            className={`mt-3 flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 font-body text-sm font-bold ${
              s.lastLeagueSettle.outcome === 'promoted'
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-red-50 text-red-500'
            }`}
          >
            <span>
              {settle?.outcome === 'promoted'
                ? settleMoved
                  ? `🎉 Promoted to ${settleNext} League!`
                  : `🏆 You're already in the top league — ${settleNext}!`
                : settleMoved
                  ? `💪 Demoted to ${settleNext} League — climb back up!`
                  : "You're at the first league — keep going!"}
            </span>
            <button
              type="button"
              onClick={() => s.dismissLeagueSettle()}
              className="shrink-0 rounded-lg px-2 py-1 text-xs font-extrabold opacity-60 hover:opacity-100"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* weekly XP progress toward promotion */}
      <section className="card-white mt-5">
        <div className="flex items-baseline justify-between">
          <p className="font-display text-sm font-bold uppercase tracking-wide text-slate-400">
            This week&rsquo;s XP
          </p>
          <p className="font-display font-extrabold text-orange-400">
            {s.weeklyXp} / {goal} XP
          </p>
        </div>
        <div className="mt-2 h-5 overflow-hidden rounded-full bg-slate-100 ring-2 ring-slate-200">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 18 }}
            className={`h-full rounded-full ${pct >= 100 ? 'bg-emerald-400' : 'bg-speed-blue'}`}
          />
        </div>
      </section>

      {/* standings — you vs this week's rivals, competing for promotion */}
      <section className="card-white mt-5">
        <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-slate-400">
          Standings
        </h2>
        <ol>
          {standings.map((p, i) => {
            const zone = zoneOfRank(i + 1, standings.length)
            const prevZone =
              i > 0 ? zoneOfRank(i, standings.length) : null
            const showDivider = zone !== prevZone
            const rank = i + 1
            return (
              <li key={p.id}>
                {showDivider && (
                  <p
                    className={`mt-3 mb-1 border-t border-dashed border-slate-200 pt-2 font-display text-xs font-extrabold uppercase tracking-wider ${ZONE_DIVIDER[zone].cls}`}
                  >
                    {ZONE_DIVIDER[zone].label}
                  </p>
                )}
                <div
                  className={`my-1 flex items-center gap-3 rounded-xl px-3 py-2 ${
                    p.isYou
                      ? 'bg-speed-bluelight ring-2 ring-speed-blue'
                      : i % 2 === 0
                        ? 'bg-slate-50'
                        : ''
                  }`}
                >
                  <span className="w-7 text-center font-display text-lg font-extrabold text-slate-500">
                    {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                  </span>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center text-2xl">
                    {p.kind === 'bot' ? (
                      p.icon
                    ) : (
                      <Mascot
                        id={p.mascotId ?? 'sonic'}
                        expression={zone === 'promo' ? 'cheer' : 'happy'}
                      />
                    )}
                  </span>
                  <span
                    className={`min-w-0 flex-1 truncate font-body font-bold ${
                      p.isYou ? 'text-speed-blue' : 'text-slate-600'
                    }`}
                  >
                    {p.name}
                    {p.isYou && ' (you)'}
                  </span>
                  <span className="font-display font-extrabold tabular-nums text-orange-400">
                    {p.xp} XP
                  </span>
                </div>
              </li>
            )
          })}
        </ol>
        <p className="mt-3 border-t border-slate-100 pt-2 text-center text-xs font-bold text-slate-300">
          {realCount <= 1
            ? 'Playing solo — one bot steps aside for every friend who joins'
            : `${realCount} real players this week — bots fill the rest`}
        </p>
      </section>

      {/* secondary boards: extras from other leagues (only when >10 real
          players are present on the API). Each league's extras are rendered
          in a small card; empty leagues are skipped. */}
      {secondaryLeagues.length > 0 && (
        <section className="card-white mt-5">
          <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-slate-400">
            Other leagues ({secondaryLeagues.length})
          </h2>
          <ul className="space-y-2">
            {secondaryLeagues.map(([lg, rows]) => (
              <li key={lg}>
                <div className="mb-1 flex items-baseline justify-between">
                  <span
                    className="font-display text-xs font-extrabold"
                    style={{ color: LEAGUE_META[lg].color }}
                  >
                    {LEAGUE_META[lg].icon} {lg}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {rows.length} player{rows.length === 1 ? '' : 's'}
                  </span>
                </div>
                <ol>
                  {rows.map((p, i) => (
                    <li
                      key={p.id}
                      className={`flex items-center gap-2 rounded-md px-2 py-1 text-sm ${
                        i % 2 === 0 ? 'bg-slate-50' : ''
                      }`}
                    >
                      <span className="w-5 text-center text-xs font-bold text-slate-400">{i + 1}</span>
                      <span className="min-w-0 flex-1 truncate font-body font-bold text-slate-600">{p.name}</span>
                      <span className="font-display text-xs font-extrabold tabular-nums text-orange-400">
                        {p.xp} XP
                      </span>
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* league ladder */}
      <section className="card-white mt-6">
        <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-slate-400">All leagues</h2>
        <div className="flex flex-wrap gap-2">
          {LEAGUES.map((l) => (
            <span key={l}
              className={`rounded-xl px-2 py-1 font-display text-xs font-extrabold ${
                l === s.currentLeague ? 'ring-2 ring-offset-1' : 'opacity-50'
              }`}
              style={{ color: LEAGUE_META[l].color, ['--tw-ring-color' as never]: LEAGUE_META[l].color }}>
              {LEAGUE_META[l].icon} {l}
            </span>
          ))}
        </div>
      </section>

      {/* league history */}
      {s.leagueHistory.length > 0 && (
        <section className="card-white mt-4">
          <h2 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-slate-400">Past weeks</h2>
          <ul className="space-y-1 text-sm font-bold text-slate-500">
            {[...s.leagueHistory].reverse().slice(0, 5).map((h) => (
              <li key={h.weekKey}>
                Week of {h.weekKey}: {LEAGUE_META[h.league].icon} {h.league} · {h.xp} XP ·{' '}
                {h.outcome === 'promoted' ? '⬆️ promoted' : h.outcome === 'demoted' ? '⬇️ demoted' : '— stayed'}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
