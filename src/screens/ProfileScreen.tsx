import { useState } from 'react'
import { ACHIEVEMENTS, LEAGUES, LEAGUE_META, displayStreak, isStreakActive } from '../engine/gamification'
import { usePlayer } from '../engine/store'
import { GrownUpsReview } from '../components/ui/GrownUpsReview'
import { MASCOTS, Mascot } from '../components/mascots/Mascots'
import { GoogleSignInInline } from '../components/ui/AuthBadge'
import { signOutGoogle, useAuth } from '../engine/auth'
import { useSyncStatus } from '../engine/cloudsave'
import { sfx } from '../engine/sfx'
import { summariseSkill, type SkillSummary } from '../engine/adaptive'
import {
  hardestByCode,
  lessonForCode,
  lessonsToRepeat,
  recentWrong,
  retryItemsFrom,
  type RetryItem,
} from '../engine/adaptive'
import type { MascotId } from '../content/types'
import { ALL_CARDS, STAR_THRESHOLDS, toStar } from '../engine/cards'

export function ProfileScreen({ onPracticeLesson, onPracticeRetry }: {
  /** Jump into a lesson (repeat highlights). */
  onPracticeLesson?: (lessonId: string) => void
  /** Start a wrong-question practice round with these snapshots. */
  onPracticeRetry?: (items: RetryItem[]) => void
}) {
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

  // Repeat highlights: hardest-question accuracy per lesson → worst first.
  const repeats = lessonsToRepeat({
    attempts: s.adaptive.attempts,
    snapshot: s.adaptive.snapshot,
  })
  // Tricky questions: most recent misses, newest first.
  const wrong = recentWrong(s.adaptive.attempts, 5)
  const retryable = retryItemsFrom(wrong)
  // Hardest-question (difficulty 3) record per skill, for the table.
  const hardest = hardestByCode(s.adaptive.attempts)

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

      {/* optional extras: Deutsch + Arabic (Egyptian Tawassol Grade 2).
          Opt-in DLC — never forced, never in the core toggle until enabled.
          Shared XP/gems/league economy when on. */}
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

      {/* optional extra: Arabic (Egyptian Tawassol Grade 2, full year T1+T2).
          Same opt-in DLC model as German. Lesson keys are `a*`. */}
      <section className="card-white mt-4 border-l-4 border-l-[#c09300]">
        <p className="font-display text-sm font-bold uppercase tracking-wide text-slate-400">
          Extra adventures · optional
        </p>
        <div className="mt-2 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-2xl">🇪🇬</span>
          <div className="min-w-0 flex-1">
            <p className="font-display font-extrabold text-slate-700">العربية · Egyptian Grade 2</p>
            <p className="text-xs font-semibold text-slate-500">
              Arabic extra (10 units · الحروف → أكتب وأعبّر). Off by default — turn on to add 🇪🇬 to the top-bar switch.
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          {!s.arabicEnabled ? (
            <button
              onClick={() => { sfx.tap(); s.setArabicEnabled(true) }}
              className="btn3d btn-green flex-1 !px-3 !py-2.5 !text-sm"
            >
              ➕ Add العربية
            </button>
          ) : (
            <>
              <button
                onClick={() => { sfx.tap(); s.setSubject('arabic') }}
                className="btn3d btn-green flex-1 !px-3 !py-2.5 !text-sm"
              >
                ▶ Play العربية
              </button>
              <button
                onClick={() => { sfx.tap(); s.setArabicEnabled(false) }}
                className="btn3d btn-grey flex-1 !px-3 !py-2.5 !text-sm"
                title="Hide the Arabic extra (progress is kept)"
              >
                Remove
              </button>
            </>
          )}
        </div>
        {s.arabicEnabled && s.subject === 'arabic' && (
          <p className="mt-2 text-xs font-bold text-emerald-600">🇪🇬 العربية is on — switch anytime in the top bar!</p>
        )}
      </section>

      {/* optional extra: Islamic religion (Egyptian govt Grade 2, T1+T2).
          Same opt-in DLC model. Lesson keys are `r*`. */}
      <section className="card-white mt-4 border-l-4 border-l-[#0d7a5f]">
        <p className="font-display text-sm font-bold uppercase tracking-wide text-slate-400">
          Extra adventures · optional
        </p>
        <div className="mt-2 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">🕌</span>
          <div className="min-w-0 flex-1">
            <p className="font-display font-extrabold text-slate-700">التربية الدينية · Grade 2</p>
            <p className="text-xs font-semibold text-slate-500">
              Religion extra (6 units · الله ربي → أخلاق المسلم). Off by default — turn on to add 🕌 to the top-bar switch.
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          {!s.religionEnabled ? (
            <button
              onClick={() => { sfx.tap(); s.setReligionEnabled(true) }}
              className="btn3d btn-green flex-1 !px-3 !py-2.5 !text-sm"
            >
              ➕ Add الدين
            </button>
          ) : (
            <>
              <button
                onClick={() => { sfx.tap(); s.setSubject('religion') }}
                className="btn3d btn-green flex-1 !px-3 !py-2.5 !text-sm"
              >
                ▶ Play الدين
              </button>
              <button
                onClick={() => { sfx.tap(); s.setReligionEnabled(false) }}
                className="btn3d btn-grey flex-1 !px-3 !py-2.5 !text-sm"
                title="Hide the religion extra (progress is kept)"
              >
                Remove
              </button>
            </>
          )}
        </div>
        {s.religionEnabled && s.subject === 'religion' && (
          <p className="mt-2 text-xs font-bold text-emerald-600">🕌 الدين is on — switch anytime in the top bar!</p>
        )}
      </section>

      {/* optional extra: Social studies (Discover-based Egypt Grade 2).
          Same opt-in DLC model. Lesson keys are `d*`. */}
      <section className="card-white mt-4 border-l-4 border-l-[#b3541e]">
        <p className="font-display text-sm font-bold uppercase tracking-wide text-slate-400">
          Extra adventures · optional
        </p>
        <div className="mt-2 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-2xl">🗺️</span>
          <div className="min-w-0 flex-1">
            <p className="font-display font-extrabold text-slate-700">الدراسات · Grade 2</p>
            <p className="text-xs font-semibold text-slate-500">
              Social extra (6 units · مصر بلدي → مجتمعي). Off by default — turn on to add 🗺️ to the top-bar switch.
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          {!s.socialEnabled ? (
            <button
              onClick={() => { sfx.tap(); s.setSocialEnabled(true) }}
              className="btn3d btn-green flex-1 !px-3 !py-2.5 !text-sm"
            >
              ➕ Add دراسات
            </button>
          ) : (
            <>
              <button
                onClick={() => { sfx.tap(); s.setSubject('social') }}
                className="btn3d btn-green flex-1 !px-3 !py-2.5 !text-sm"
              >
                ▶ Play دراسات
              </button>
              <button
                onClick={() => { sfx.tap(); s.setSocialEnabled(false) }}
                className="btn3d btn-grey flex-1 !px-3 !py-2.5 !text-sm"
                title="Hide the social extra (progress is kept)"
              >
                Remove
              </button>
            </>
          )}
        </div>
        {s.socialEnabled && s.subject === 'social' && (
          <p className="mt-2 text-xs font-bold text-emerald-600">🗺️ دراسات is on — switch anytime in the top bar!</p>
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
      {/* card collection */}
      <section className="card-white mt-4">
        <p className="font-display text-sm font-bold uppercase tracking-wide text-slate-400">Card Collection</p>
        <div className="mt-2 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
          <Stat
            icon="🃏"
            label="Unique Cards"
            value={`${Object.keys(s.cardStars).filter((id) => s.cardStars[id] > 0).length}/${ALL_CARDS.length}`}
          />
          <Stat
            icon="📦"
            label="Total Copies"
            value={String(Object.values(s.cardStars).reduce((a, b) => a + b, 0))}
          />
        </div>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => {
            const count = ALL_CARDS.filter((c) => toStar(s.cardStars[c.id] ?? 0) === star).length
            return (
              <div key={star} className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 font-display text-sm font-bold">
                {'★'.repeat(star)}{'☆'.repeat(5 - star)} {count}
              </div>
            )
          })}
        </div>
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

      {/* repeat highlights — hardest-question accuracy per lesson */}
      <section className="card-white mt-4">
        <p className="font-display text-sm font-bold uppercase tracking-wide text-slate-400">
          🔁 Lessons to repeat
        </p>
        <p className="mt-1 text-xs font-semibold text-slate-500">
          Picked from the hardest questions — replay one to lock it in.
        </p>
        {insights.length === 0 ? (
          <p className="mt-2 text-sm font-bold text-slate-400">No data yet — play a lesson to start tracking.</p>
        ) : repeats.length === 0 ? (
          <p className="mt-2 text-sm font-bold text-emerald-600">All clear! Nothing needs a repeat right now. 🎉</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {repeats.map((r) => (
              <li key={r.lessonId} className="rounded-xl bg-slate-50 p-2.5">
                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-extrabold text-slate-700">{r.title}</p>
                    {r.unitTitle ? (
                      <p className="truncate text-[11px] font-bold text-slate-400">{r.unitTitle}</p>
                    ) : null}
                  </div>
                  <span className="shrink-0 rounded-full bg-speed-bluelight px-2 py-0.5 font-display text-xs font-extrabold text-speed-blue">
                    {Math.round(r.avgMastery * 100)}%
                  </span>
                  {r.hardestAccuracy !== null && (
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 font-display text-xs font-extrabold ${
                        r.hardestAccuracy < 0.6 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                      }`}
                      title={`${r.hardestAttempts} hardest questions tried`}
                    >
                      🔥 {Math.round(r.hardestAccuracy * 100)}%
                    </span>
                  )}
                  {onPracticeLesson && (
                    <button
                      onClick={() => { sfx.tap(); onPracticeLesson(r.lessonId) }}
                      className="btn3d btn-green shrink-0 !px-3 !py-1.5 !text-xs"
                    >
                      Practice
                    </button>
                  )}
                </div>
                <ul className="mt-1 space-y-0.5">
                  {r.reasons.map((reason) => (
                    <li key={reason} className="text-[11px] font-bold text-slate-500">· {reason}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* tricky questions — retry the exact ones missed */}
      {wrong.length > 0 && (
        <section className="card-white mt-4">
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-bold uppercase tracking-wide text-slate-400">
                ❌ Tricky questions
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                The ones missed most recently — retry them exactly as seen.
              </p>
            </div>
            {onPracticeRetry && retryable.length > 0 && (
              <button
                onClick={() => { sfx.tap(); onPracticeRetry(retryable) }}
                className="btn3d btn-blue shrink-0 !px-3 !py-1.5 !text-xs"
              >
                Practice all ({retryable.length})
              </button>
            )}
          </div>
          <ul className="mt-2 space-y-2">
            {wrong.map((w) => {
              const single = retryItemsFrom([w])
              return (
                <li key={`${w.ts}-${w.objectiveCode}`} className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-700" title={w.prompt || w.objectiveCode}>
                      {w.prompt || w.objectiveCode}
                    </p>
                    <p className="truncate text-[11px] font-bold text-slate-400">
                      {lessonForCode(w.objectiveCode)?.title ?? w.lessonId}
                      {' · '}level {'★'.repeat(Math.min(3, Math.max(1, w.difficulty ?? 1)))}
                      {w.difficulty === 3 ? ' 🔥 hardest' : ''}
                      {w.rushed ? <span className="text-rose-500"> · ⚡ rushed</span> : ''}
                    </p>
                  </div>
                  {onPracticeRetry && single.length > 0 && (
                    <button
                      onClick={() => { sfx.tap(); onPracticeRetry(single) }}
                      className="btn3d btn-grey shrink-0 !px-3 !py-1.5 !text-xs"
                    >
                      Retry
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      )}

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
                  <th className="px-1 py-1 font-display text-right">Hard</th>
                  <th className="px-1 py-1 font-display text-right">Tries</th>
                  <th className="px-1 py-1 font-display text-right">Acc</th>
                  <th className="px-1 py-1 font-display">Trend</th>
                  <th className="px-1 py-1 font-display">Curve</th>
                </tr>
              </thead>
              <tbody>
                {insights.map((i) => {
                  const h = hardest.get(i.code)
                  const lesson = lessonForCode(i.code)
                  // Few tries = low evidence: grey the mastery so parents
                  // don't read a 20% as a verdict. Confidence = tries/20.
                  const lowConfidence = i.attempts < 5
                  return (
                    <tr key={i.code} className="border-t border-slate-100">
                      <td className="px-1 py-1">
                        <span className="font-mono text-[11px] text-slate-700">
                          {i.isDueForReview ? '🔔 ' : ''}{i.code}
                        </span>
                        {lesson && (
                          <span className="block max-w-28 truncate text-[10px] font-bold text-slate-400" title={lesson.title}>
                            {lesson.title}
                          </span>
                        )}
                      </td>
                      <td
                        className={`px-1 py-1 text-right font-display font-extrabold ${
                          lowConfidence ? 'text-slate-400' : 'text-speed-blue'
                        }`}
                        title={lowConfidence ? `Only ${i.attempts} tries so far — still forming a picture` : `${i.attempts} tries`}
                      >
                        {Math.round(i.mastery * 100)}%
                        {lowConfidence && (
                          <span className="ml-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-slate-400">
                            new
                          </span>
                        )}
                      </td>
                      <td
                        className={`px-1 py-1 text-right font-display font-extrabold ${
                          h && h.total >= 2 && h.correct / h.total < 0.6 ? 'text-rose-500' : 'text-slate-500'
                        }`}
                        title={h ? `${h.correct}/${h.total} hardest questions right` : 'No hardest questions tried yet'}
                      >
                        {h && h.total > 0 ? `${Math.round((h.correct / h.total) * 100)}%` : '—'}
                      </td>
                      <td className="px-1 py-1 text-right text-slate-500">{i.attempts}</td>
                      <td className="px-1 py-1 text-right text-slate-500">{Math.round(i.accuracy * 100)}%</td>
                      <td className="px-1 py-1 text-slate-500">{i.trend}</td>
                      <td className="px-1 py-1">
                        <Sparkline points={s.adaptive.masteryHistory[i.code] ?? []} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {/* Grown-ups key status lives in the section below. */}
        <div className="mt-3 text-xs">
          <p className="font-semibold text-slate-500">
            LLM explanations: {s.adaptive.telemetry.llmHits}/{s.adaptive.telemetry.llmRequests} served
            {s.adaptive.telemetry.lastLlmProvider ? ` · last: ${s.adaptive.telemetry.lastLlmProvider}` : ''}
          </p>
        </div>
      </section>

      {/* grown-ups-only AI review — never shown to the child */}
      <section className="card-white mt-4">
        <p className="font-display text-sm font-bold uppercase tracking-wide text-slate-400">
          For grown-ups · AI review
        </p>
        <p className="mt-1 text-xs font-semibold text-slate-500">
          Private to this device. The AI only ever sees anonymous totals — no names, no history.
        </p>
        <div className="mt-2">
          <GrownUpsReview />
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
      {/* Sync is automatic (pull on sign-in, push on change) — no manual
          button. Only account recovery keeps an action. */}
      {status === 'expired' ? (
        <button onClick={signInAgain} className="btn3d btn-blue shrink-0 !px-3 !py-2 !text-xs">
          Sign in again
        </button>
      ) : null}
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

/** Tiny mastery curve (last 20 snapshots) for the insights table. */
function Sparkline({ points }: { points: { ts: number; pL: number }[] }) {
  const tail = points.slice(-20)
  if (tail.length < 2) return <span className="text-slate-300">—</span>
  const W = 48
  const H = 16
  const step = tail.length > 1 ? W / (tail.length - 1) : 0
  const d = tail
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'}${(idx * step).toFixed(1)},${(H - 2 - p.pL * (H - 4)).toFixed(1)}`)
    .join(' ')
  const up = tail[tail.length - 1]!.pL >= tail[0]!.pL
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <path d={d} fill="none" stroke={up ? '#10b981' : '#f43f5e'} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
