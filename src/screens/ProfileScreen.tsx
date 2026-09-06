import { useState } from 'react'
import { ACHIEVEMENTS, LEAGUES, LEAGUE_META } from '../engine/gamification'
import { usePlayer } from '../engine/store'
import { MASCOTS, Mascot } from '../components/mascots/Mascots'
import { GoogleSignInInline } from '../components/ui/AuthBadge'
import { signOutGoogle, useAuth } from '../engine/auth'
import { syncNow, useSyncStatus } from '../engine/cloudsave'
import { sfx } from '../engine/sfx'
import { summariseSkill, type SkillSummary } from '../engine/adaptive'
import type { MascotId } from '../content/types'

export function ProfileScreen() {
  const s = usePlayer()
  const user = useAuth((a) => a.user)
  const signOut = useAuth((a) => a.signOut)
  const [editing, setEditing] = useState(false)
  const [draftName, setDraftName] = useState(s.name)

  const lessonsCompleted = Object.values(s.lessonProgress).reduce((a, p) => a + p.completions, 0)
  const crowns = Object.values(s.lessonProgress).reduce((a, p) => a + p.crown, 0)

  // Adaptive insights: per-skill summary, sorted by lowest mastery first.
  const insights: SkillSummary[] = Object.keys(s.adaptive.snapshot.skills)
    .map((code) => summariseSkill(code, s.adaptive.snapshot))
    .filter((x): x is SkillSummary => x !== null)
    .sort((a, b) => a.mastery - b.mastery)

  function exportJson() {
    const payload = {
      exportedAt: new Date().toISOString(),
      version: 4,
      adaptive: s.adaptive,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `momomath-adaptive-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

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
        <Stat icon="🔥" label="Streak" value={`${s.streakCurrent}`} sub={`best ${s.streakLongest}`} />
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

      {/* optional extra: Deutsch (Felix & Franzi beginner DaF).
          Opt-in DLC — never forced, never in the core Math ⇄ English toggle
          until enabled. Shared XP/gems/league economy when on. */}
      <section className="card-white mt-4 border-l-4 border-l-[#00a651]">
        <p className="font-display text-sm font-bold uppercase tracking-wide text-slate-400">
          Extra adventures · optional
        </p>
        <div className="mt-2 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-50 text-2xl">🇩🇪</span>
          <div className="min-w-0 flex-1">
            <p className="font-display font-extrabold text-slate-700">Deutsch mit Felix &amp; Franzi</p>
            <p className="text-xs font-semibold text-slate-500">
              Beginner German extra (10 units · Hallo! → Feste). Off by default — turn on to add 🇩🇪 to the top-bar switch.
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          {!s.germanEnabled ? (
            <button
              onClick={() => { sfx.tap(); s.setGermanEnabled(true) }}
              className="btn3d btn-green flex-1 !px-3 !py-2.5 !text-sm"
            >
              ➕ Add Deutsch
            </button>
          ) : (
            <>
              <button
                onClick={() => { sfx.tap(); s.setSubject('german') }}
                className="btn3d btn-green flex-1 !px-3 !py-2.5 !text-sm"
              >
                ▶ Play Deutsch
              </button>
              <button
                onClick={() => { sfx.tap(); s.setGermanEnabled(false) }}
                className="btn3d btn-grey flex-1 !px-3 !py-2.5 !text-sm"
                title="Hide the German extra (progress is kept)"
              >
                Remove
              </button>
            </>
          )}
        </div>
        {s.germanEnabled && s.subject === 'german' && (
          <p className="mt-2 text-xs font-bold text-emerald-600">🇩🇪 Deutsch is on — switch anytime in the top bar!</p>
        )}
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

      {/* cross-device sync */}
      <section className="card-white mt-4">
        <p className="font-display text-sm font-bold uppercase tracking-wide text-slate-400">Device sync</p>
        <SyncRow />
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

      {/* adaptive learning insights — parent/admin facing */}
      <section className="card-white mt-4">
        <p className="font-display text-sm font-bold uppercase tracking-wide text-slate-400">Learning insights</p>
        <p className="mt-1 text-xs font-semibold text-slate-500">
          Tracked from the first question. Lowest-mastery skills first.
        </p>
        {insights.length === 0 ? (
          <p className="mt-2 text-sm font-bold text-slate-400">No data yet — play a lesson to start tracking.</p>
        ) : (
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400">
                  <th className="px-1 py-1 font-display">Skill</th>
                  <th className="px-1 py-1 font-display text-right">Mastery</th>
                  <th className="px-1 py-1 font-display text-right">Tries</th>
                  <th className="px-1 py-1 font-display text-right">Acc</th>
                  <th className="px-1 py-1 font-display">Trend</th>
                </tr>
              </thead>
              <tbody>
                {insights.map((i) => (
                  <tr key={i.code} className="border-t border-slate-100">
                    <td className="px-1 py-1 font-mono text-[11px] text-slate-700">{i.code}</td>
                    <td className="px-1 py-1 text-right font-display font-extrabold text-speed-blue">
                      {Math.round(i.mastery * 100)}%
                    </td>
                    <td className="px-1 py-1 text-right text-slate-500">{i.attempts}</td>
                    <td className="px-1 py-1 text-right text-slate-500">{Math.round(i.accuracy * 100)}%</td>
                    <td className="px-1 py-1 text-slate-500">{i.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <p className="font-semibold text-slate-500">
            LLM explanations: {s.adaptive.telemetry.llmHits}/{s.adaptive.telemetry.llmRequests} served
            {s.adaptive.telemetry.lastLlmProvider ? ` · last: ${s.adaptive.telemetry.lastLlmProvider}` : ''}
          </p>
          <button onClick={() => { sfx.tap(); exportJson() }} className="btn3d btn-blue !px-3 !py-2 !text-xs">
            Export JSON
          </button>
        </div>
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

function SyncRow() {
  const user = useAuth((a) => a.user)
  const signOut = useAuth((a) => a.signOut)
  const status = useSyncStatus((x) => x.status)
  const detail = useSyncStatus((x) => x.detail)
  const lastSyncedAt = usePlayer((x) => x.lastSyncedAt)

  async function retry() {
    sfx.tap()
    try {
      await syncNow()
    } catch {
      /* status store already explains */
    }
  }

  function signInAgain() {
    sfx.tap()
    signOutGoogle()
    signOut()
  }

  if (!user) {
    return (
      <p className="mt-1 text-sm font-bold text-slate-500">
        Sign in with your Google account above — the same account loads the same progress on every
        device.
      </p>
    )
  }
  const when =
    lastSyncedAt != null
      ? new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : null
  return (
    <div className="mt-1 flex items-center gap-3">
      <p className="min-w-0 flex-1 text-sm font-bold text-slate-500">
        {status === 'syncing' && '🔄 Syncing…'}
        {status === 'synced' && `✅ Synced across your devices${when ? ` · ${when}` : ''}`}
        {status === 'expired' && '⚠️ Google session expired — sign in again to keep syncing.'}
        {status === 'error' && `📴 ${detail || 'Offline — progress is safe on this device.'}`}
        {status === 'signed-out' && 'Sign in to sync across devices.'}
      </p>
      {status === 'expired' ? (
        <button onClick={signInAgain} className="btn3d btn-blue shrink-0 !px-3 !py-2 !text-xs">
          Sign in again
        </button>
      ) : (
        <button onClick={retry} className="btn3d btn-grey shrink-0 !px-3 !py-2 !text-xs">
          Sync now
        </button>
      )}
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
