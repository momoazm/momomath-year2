import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  LEAGUES,
  LEAGUE_META,
  STAY_FACTOR,
  msUntilWeekEnd,
  rivalXp,
  weekKey,
  weeklyGoal,
} from '../engine/gamification'
import {
  botsForPlayerCount,
  fetchSharedPlayers,
  pushSharedPlayer,
  weeklyXpOf,
  type SharedPlayer,
} from '../engine/leaderboard'
import { usePlayer } from '../engine/store'
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

function zoneOf(xp: number, goal: number, stayGoal: number): Zone {
  if (xp >= goal) return 'promo'
  if (xp >= stayGoal) return 'stay'
  return 'danger'
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
  const wk = weekKey()

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

  // share my progress whenever it changes (and once on entry)
  useEffect(() => {
    if (!s.name.trim()) return
    let alive = true
    pushSharedPlayer({
      id: myId,
      name: s.name.trim(),
      xp: s.weeklyXp,
      league: s.currentLeague,
      mascot: s.mascot,
      week: wk,
    }).then((entries) => {
      if (alive && entries.length) setShared(entries)
    })
    return () => {
      alive = false
    }
  }, [myId, s.name, s.weeklyXp, s.currentLeague, s.mascot, wk])

  const meta = LEAGUE_META[s.currentLeague]
  const goal = weeklyGoal(s.currentLeague)
  const stayGoal = Math.round(goal * STAY_FACTOR)
  const countdown = formatCountdown(msUntilWeekEnd(new Date(nowMs)))

  const others = shared.filter((p) => p.id !== myId)
  const realCount = 1 + others.length
  const bots = botsForPlayerCount(realCount)

  const standings: Row[] = [
    ...others.map((p) => ({
      id: p.id,
      name: p.name,
      xp: weeklyXpOf(p, wk),
      isYou: false,
      kind: 'real' as const,
      mascotId: p.mascot,
    })),
    ...bots.map((r) => ({
      id: r.id,
      name: r.name,
      xp: rivalXp(r, s.currentLeague, wk, new Date(nowMs)),
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
            const zone = zoneOf(p.xp, goal, stayGoal)
            const prevZone =
              i > 0 ? zoneOf(standings[i - 1].xp, goal, stayGoal) : null
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
                        expression={zoneOf(p.xp, goal, stayGoal) === 'promo' ? 'cheer' : 'happy'}
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
