import { motion } from 'framer-motion'
import {
  LEAGUES,
  LEAGUE_META,
  STAY_FACTOR,
  nextWeekKey,
  todayISO,
  weeklyGoal,
} from '../engine/gamification'
import { usePlayer } from '../engine/store'
import { Mascot } from '../components/mascots/Mascots'

export function LeaguesScreen() {
  const s = usePlayer()
  const meta = LEAGUE_META[s.currentLeague]
  const goal = weeklyGoal(s.currentLeague)
  const stayGoal = Math.round(goal * STAY_FACTOR)
  const pct = Math.min(100, Math.round((s.weeklyXp / goal) * 100))
  const daysLeft = (() => {
    const end = new Date(nextWeekKey(todayISO()) + 'T00:00:00')
    return Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86400000))
  })()

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-28 pt-4">
      <div className="flex flex-col items-center">
        <div className="relative h-28 w-28 gpu animate-float-y text-7xl">{meta.icon}</div>
        <h1 className="font-display text-2xl font-extrabold" style={{ color: meta.color }}>
          {s.currentLeague} League
        </h1>
        <p className="text-center font-body text-sm font-bold text-slate-400">
          Real players only - no bots. League auto-resets every Monday · {daysLeft} day
          {daysLeft === 1 ? '' : 's'} left
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
        <ul className="mt-3 space-y-1 text-xs font-bold text-slate-500">
          <li>⬆️ Reach {goal} XP — promoted</li>
          <li>➖ Reach {stayGoal} XP — stay in {s.currentLeague}</li>
          <li>⬇️ Below {stayGoal} XP — drop down a league</li>
        </ul>
      </section>

      {/* your placement card */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-4 flex items-center gap-3 rounded-2xl bg-speed-bluelight px-4 py-3 ring-2 ring-speed-blue"
      >
        <span className="w-7 text-center font-display text-lg font-extrabold text-yellow-500">1</span>
        <div className="h-10 w-10 shrink-0"><Mascot id={s.mascot} expression={pct >= 100 ? 'cheer' : 'happy'} /></div>
        <span className="min-w-0 flex-1 truncate font-body font-bold text-speed-blue">{s.name} ⚡</span>
        <span className="font-display font-extrabold text-orange-400">{s.weeklyXp} XP</span>
      </motion.section>

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
