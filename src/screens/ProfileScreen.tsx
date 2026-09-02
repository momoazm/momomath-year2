import { useState } from 'react'
import { ACHIEVEMENTS, LEAGUES, LEAGUE_META, displayStreak, isStreakActive } from '../engine/gamification'
import { usePlayer } from '../engine/store'
import { MASCOTS, Mascot } from '../components/mascots/Mascots'
import { GoogleSignInInline } from '../components/ui/AuthBadge'
import { signOutGoogle, useAuth } from '../engine/auth'
import { sfx } from '../engine/sfx'
import type { MascotId } from '../content/types'
import { CARDS, STAR_THRESHOLDS, toStar } from '../engine/cards'

export function ProfileScreen() {
  const s = usePlayer()
  const user = useAuth((a) => a.user)
  const signOut = useAuth((a) => a.signOut)
  const [editing, setEditing] = useState(false)
  const [draftName, setDraftName] = useState(s.name)

  const lessonsCompleted = Object.values(s.lessonProgress).reduce((a, p) => a + p.completions, 0)
  const crowns = Object.values(s.lessonProgress).reduce((a, p) => a + p.crown, 0)

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-28 pt-4">
      <div className="flex flex-col items-center">
        <div className="h-32 w-32 gpu animate-float-y"><Mascot id={s.mascot} expression="happy" /></div>
        {editing ? (
          <div className="mt-2 flex items-center gap-2">
            <input
              autoFocus
              value={draftName}
              maxLength={16}
              onChange={(e) => setDraftName(e.target.value)}
              className="w-40 rounded-xl border-2 border-speed-blue px-3 py-1.5 text-center font-display font-bold outline-none"
            />
            <button onClick={() => { s.setName(draftName); setEditing(false); sfx.tap() }}
              className="btn3d btn-green !px-3 !py-2 !text-sm">Save</button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="mt-2 font-display text-2xl font-extrabold hover:underline">
            {s.name} <span className="text-sm text-slate-400">✏️</span>
          </button>
        )}
        <div className="mt-2 flex flex-wrap justify-center gap-2 px-2">
          {(Object.keys(MASCOTS) as MascotId[]).map((id) => (
            <button key={id} onClick={() => { sfx.tap(id); s.setMascot(id) }} title={`Play as ${id}`}
              className={`h-10 w-10 rounded-full p-0.5 transition-transform hover:scale-110 ${s.mascot === id ? 'bg-speed-blue' : 'bg-slate-200'}`}>
              <Mascot id={id} expression={s.mascot === id ? 'excited' : 'happy'} />
            </button>
          ))}
        </div>
      </div>

      {/* stats grid */}
      <section className="card-white mt-6 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
        <Stat icon="⚡" label="Total XP" value={String(s.xpTotal)} />
        <Stat
          icon="🔥"
          label="Streak"
          value={`${displayStreak(s)}`}
          sub={
            isStreakActive(s)
              ? `best ${s.streakLongest}`
              : `best ${s.streakLongest} · complete a lesson today to keep it going`
          }
        />
        <Stat icon="👑" label="Crowns" value={String(crowns)} />
        <Stat icon="📚" label="Lessons" value={String(lessonsCompleted)} />
      </section>

      {/* daily goal */}
      <section className="card-white mt-4">
        <p className="font-display text-sm font-bold uppercase tracking-wide text-slate-400">Daily XP goal</p>
        <div className="mt-2 flex gap-2">
          {[15, 30, 50].map((g) => (
            <button key={g} onClick={() => { sfx.tap(); s.setDailyGoal(g) }}
              className={`btn3d flex-1 !px-2 !py-2.5 !text-base ${s.dailyGoal === g ? 'btn-green' : 'btn-grey'}`}>
              ⚡{g}
            </button>
          ))}
        </div>
      </section>

      {/* account */}
      <section className="card-white mt-4">
        <p className="font-display text-sm font-bold uppercase tracking-wide text-slate-400">Google account</p>
        {user ? (
          <div className="mt-2 flex items-center gap-3">
            {user.picture ? (
              <img src={user.picture} alt="" className="h-11 w-11 rounded-full ring-2 ring-speed-blue" referrerPolicy="no-referrer" />
            ) : (
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-speed-blue font-display text-lg font-extrabold text-white">
                {user.name[0]?.toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-display font-extrabold">{user.name}</p>
              <p className="truncate text-xs font-bold text-slate-400">{user.email}</p>
            </div>
            <button onClick={() => { sfx.tap(); signOutGoogle(); signOut() }} className="btn3d btn-grey !px-3 !py-2 !text-xs">
              Sign out
            </button>
          </div>
        ) : (
          <div className="mt-2">
            <GoogleSignInInline />
          </div>
        )}
      </section>
      {/* card collection */}
      <section className="card-white mt-4">
        <p className="font-display text-sm font-bold uppercase tracking-wide text-slate-400">Card Collection</p>
        <div className="mt-2 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
          <Stat
            icon="🃏"
            label="Unique Cards"
            value={`${Object.keys(s.cardCounts).filter((id) => s.cardCounts[id] > 0).length}/${CARDS.length}`}
          />
          <Stat
            icon="📦"
            label="Total Copies"
            value={String(Object.values(s.cardCounts).reduce((a, b) => a + b, 0))}
          />
        </div>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => {
            const count = CARDS.filter((c) => toStar(s.cardCounts[c.id] ?? 0) === star).length
            return (
              <div key={star} className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 font-display text-sm font-bold">
                {'★'.repeat(star)}{'☆'.repeat(5 - star)} {count}
              </div>
            )
          })}
        </div>
      </section>



      {/* league history */}
      <section className="card-white mt-4">
        <p className="font-display text-sm font-bold uppercase tracking-wide text-slate-400">League history</p>
        <p className="mt-1 font-body font-bold text-slate-500">
          Current: <span style={{ color: LEAGUE_META[s.currentLeague].color }}>
            {LEAGUE_META[s.currentLeague].icon} {s.currentLeague}
          </span> · ladder: {LEAGUES.join(' → ')}
        </p>
        {s.leagueHistory.length > 0 && (
          <ul className="mt-2 space-y-1 text-sm font-bold text-slate-400">
            {[...s.leagueHistory].reverse().slice(0, 5).map((h) => (
              <li key={h.weekKey}>
                Week of {h.weekKey}: {LEAGUE_META[h.league].icon} {h.league} · {h.xp} XP ·{' '}
                {h.outcome === 'promoted' ? '⬆️ promoted' : h.outcome === 'demoted' ? '⬇️ demoted' : '— stayed'}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* achievements */}
      <section className="card-white mt-4">
        <p className="font-display text-sm font-bold uppercase tracking-wide text-slate-400">Achievements</p>
        <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ACHIEVEMENTS.map((a) => {
            const got = s.achievements.includes(a.id)
            return (
              <li key={a.id} title={a.desc}
                className={`flex items-center gap-2 rounded-xl border-2 p-2 ${got ? 'border-emerald-300 bg-emerald-50' : 'border-slate-100 opacity-45 grayscale'}`}>
                <span className="text-2xl">{a.icon}</span>
                <span className="min-w-0 truncate font-display text-xs font-bold">{a.title}</span>
              </li>
            )
          })}
        </ul>
      </section>

      <button onClick={() => { s.toggleSound() }} className="btn3d btn-grey mt-6 w-full">
        {s.soundOn ? '🔊 Sound on' : '🔇 Sound off'}
      </button>
    </div>
  )
}

function Stat({ icon, label, value, sub }: { icon: string; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="font-display text-lg font-extrabold">{icon} {value}</p>
      <p className="text-xs font-bold text-slate-400">{label}{sub ? ` · ${sub}` : ''}</p>
    </div>
  )
}
