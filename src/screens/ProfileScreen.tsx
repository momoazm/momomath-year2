import { useEffect, useMemo, useState } from 'react'
import confetti from 'canvas-confetti'
import { ACHIEVEMENTS, LEAGUES, LEAGUE_META, ARCADE_GAMES, displayStreak, isStreakActive } from '../engine/gamification'
import { usePlayer } from '../engine/store'
import type { YearLevel } from '../engine/store'
import { validate as validateUnlockCode, trioVisible } from '../engine/unlock'
import { MASCOTS, Mascot } from '../components/mascots/Mascots'
import { GoogleSignInInline } from '../components/ui/AuthBadge'
import { signOutGoogle, useAuth } from '../engine/auth'
import { sfx } from '../engine/sfx'
import { fetchMyCode } from '../engine/friends'
import { guestIdFromName } from '../engine/playerId'
import { buildCheckup, dueSkillCodes } from '../engine/adaptive'
import type { RetryItem } from '../engine/adaptive'
import { buildMonthGrid, buildWeeklyRecap } from '../engine/recap'
import type { MascotId } from '../content/types'
import { subjectInYear } from '../content/years'
import { ALL_CARDS, STAR_THRESHOLDS, toStar } from '../engine/cards'

const CODE_CACHE_KEY = 'momomath-year2-friendcode'

export function ProfileScreen({ onOpenFriends, onStartCheckup }: {
  onOpenFriends?: () => void
  /** Start the daily check-up (mixed due-skill + wrong-question round). */
  onStartCheckup?: (items: RetryItem[]) => void
}) {
  const s = usePlayer()
  const user = useAuth((a) => a.user)
  const signOut = useAuth((a) => a.signOut)
  const guestName = useAuth((a) => a.guestName)
  const signGuestOut = useAuth((a) => a.signGuestOut)
  const [editing, setEditing] = useState(false)
  const [draftName, setDraftName] = useState(s.name)
  // PLAN 160 — year chip + switcher with a confirm before the buckets swap.
  const [yearOpen, setYearOpen] = useState(false)
  const [pendingYear, setPendingYear] = useState<YearLevel | null>(null)
  // PLAN 161 — extras unlock code box (rendered only when yearLevel === 2).
  const [unlockCode, setUnlockCode] = useState('')
  const [unlockError, setUnlockError] = useState<string | null>(null)

  // PLAN 106: show the referral code right on the Friends entry card so it is
  // visible alongside the friend system (cached + fetched, never blocking).
  // Frozen guest id (PLAN 141e): identity never follows the display name.
  const playerId = user?.sub ? `g:${user.sub}` : (s.guestId || guestIdFromName(s.name))
  const [referralCode, setReferralCode] = useState('')
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    try {
      const cached = window.localStorage.getItem(`${CODE_CACHE_KEY}:${playerId}`)
      if (cached) setReferralCode(cached)
    } catch { /* storage optional */ }
    let live = true
    fetchMyCode(playerId, s.name.trim() || 'Champion')
      .then((c) => { if (live && c) setReferralCode(c) })
      .catch(() => { /* offline keeps the cached code */ })
    return () => { live = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId])

  const lessonsCompleted = Object.values(s.lessonProgress).reduce((a, p) => a + p.completions, 0)
  const crowns = Object.values(s.lessonProgress).reduce((a, p) => a + p.crown, 0)

  // Daily check-up: due-for-review skills (any subject) + recent misses.
  const checkup = useMemo(() => {
    const due = dueSkillCodes(s.adaptive.snapshot)
    if (due.length === 0) return null
    const session = buildCheckup({
      snap: s.adaptive.snapshot,
      attempts: s.adaptive.attempts,
      year: s.yearLevel,
    })
    if (session.items.length === 0) return null
    return { count: due.length, items: session.items }
  }, [s.adaptive.snapshot, s.adaptive.attempts, s.yearLevel])

  // WS15 (PLAN 136) — practice calendar (this month) + weekly recap. Pure
  // local math (deterministic, no AI): tiny inputs (≤60 day strings,
  // ≤500 attempts), recomputed per render so the grid rolls over at midnight.
  const monthGrid = buildMonthGrid(new Date().getFullYear(), new Date().getMonth(), s.activityDays)
  const recap = buildWeeklyRecap({
    weeklyXp: s.weeklyXp,
    weeklyXpWeek: s.weeklyXpWeek,
    cardsWonWeek: s.cardsWonWeek,
    cardsWonWeekKey: s.cardsWonWeekKey,
    activityDays: s.activityDays,
    attempts: s.adaptive.attempts,
    year: s.yearLevel,
  })

  // PLAN 161 — manual extras unlock (universal code; Year 2 only UI).
  const submitUnlock = () => {
    if (validateUnlockCode(unlockCode)) {
      s.setExtrasUnlocked(true)
      setUnlockCode('')
      setUnlockError(null)
      sfx.complete()
      confetti({ particleCount: 120, spread: 75, origin: { y: 0.6 }, disableForReducedMotion: true })
    } else {
      sfx.wrong()
      setUnlockError("That code didn't work — check with a grown-up.")
    }
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

      {/* PLAN 160 — year chip: tap -> switcher, confirm before switching.
          Per-year progress buckets are kept (store setYearLevel). */}
      <div className="mt-3 flex justify-center">
        <button
          onClick={() => { sfx.tap(); setYearOpen((v) => !v); setPendingYear(null) }}
          data-testid="year-chip"
          aria-expanded={yearOpen}
          className="rounded-full border-2 border-speed-blue bg-speed-bluelight px-4 py-1.5 font-display text-sm font-extrabold text-speed-blue transition-transform hover:scale-105"
        >
          📅 Year {s.yearLevel} {yearOpen ? '▴' : '▾'}
        </button>
      </div>
      {yearOpen && (
        <section className="card-white mt-2 w-full" data-testid="year-switcher">
          <p className="font-display text-sm font-bold uppercase tracking-wide text-slate-400">Switch year</p>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {([1, 2, 3, 4] as const).map((y) => (
              <button
                key={y}
                data-testid={`year-opt-${y}`}
                onClick={() => {
                  sfx.tap()
                  if (y === s.yearLevel) { setPendingYear(null); setYearOpen(false) }
                  else setPendingYear(y)
                }}
                className={`rounded-xl border-2 py-2 font-display text-sm font-extrabold transition-colors ${
                  s.yearLevel === y
                    ? 'border-speed-blue bg-speed-bluelight text-speed-blue'
                    : 'border-slate-100 text-slate-400 hover:border-slate-200'
                }`}
              >
                Year {y}
              </button>
            ))}
          </div>
          {pendingYear !== null && (
            <div className="mt-3 rounded-xl bg-slate-50 p-3 text-center" data-testid="year-confirm">
              <p className="font-display text-sm font-extrabold text-slate-700">
                Switch to Year {pendingYear}?
              </p>
              <p className="mt-0.5 text-xs font-semibold text-slate-400" data-testid="year-confirm-copy">
                Your Year {s.yearLevel} progress is kept.
              </p>
              <div className="mt-2 flex justify-center gap-2">
                <button
                  data-testid="year-cancel"
                  onClick={() => { sfx.tap(); setPendingYear(null) }}
                  className="btn3d btn-grey !px-4 !py-1.5 !text-xs"
                >
                  Cancel
                </button>
                <button
                  data-testid="year-confirm-switch"
                  onClick={() => {
                    if (pendingYear === null) return
                    sfx.whoosh()
                    s.setYearLevel(pendingYear)
                    setPendingYear(null)
                    setYearOpen(false)
                  }}
                  className="btn3d btn-blue !px-4 !py-1.5 !text-xs"
                >
                  Switch
                </button>
              </div>
            </div>
          )}
        </section>
      )}

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
        <Stat icon="🌪️" label="Dust" value={String(s.dust)} sub="from maxed 5★ dupes" />
        <Stat
          icon="🕹️"
          label="Arcade best"
          value={String(Math.max(0, ...Object.values(s.arcadeScores)))}
          sub={`${Object.values(s.arcadeScores).filter((v) => v > 0).length}/${ARCADE_GAMES.length} games`}
        />
        <Stat icon="🎁" label="Login streak" value={`${s.dailyLoginStreak}`} sub="daily calendar" />
      </section>

      {/* daily check-up - one mixed round of due skills + recent misses */}
      {checkup && onStartCheckup && (
        <section className="card-white mt-4" data-testid="profile-checkup">
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-bold uppercase tracking-wide text-slate-400">
                🩺 Daily check-up
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                {checkup.count} skill{checkup.count === 1 ? '' : 's'} due for a refresh, plus your
                recent misses — one quick mixed round.
              </p>
            </div>
            <button
              onClick={() => { sfx.tap(); onStartCheckup(checkup.items) }}
              className="btn3d btn-green shrink-0 !px-3 !py-1.5 !text-xs"
            >
              Start ({checkup.items.length})
            </button>
          </div>
        </section>
      )}

      {/* WS15 (PLAN 136) - practice calendar (practised days of the month) */}
      <section className="card-white mt-4" data-testid="practice-calendar">
        <div className="flex items-baseline justify-between">
          <p className="font-display text-sm font-bold uppercase tracking-wide text-slate-400">Practice calendar</p>
          <p className="text-xs font-semibold text-slate-400">
            {monthGrid.monthLabel} · {monthGrid.practisedCount} {monthGrid.practisedCount === 1 ? 'day' : 'days'}
          </p>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase text-slate-400">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {monthGrid.cells.map((c, i) =>
            c === null ? (
              <span key={i} />
            ) : (
              <span
                key={i}
                title={c.active ? `Practised on ${c.iso}` : c.iso}
                className={`flex aspect-square items-center justify-center rounded-lg text-xs font-bold ${
                  c.active
                    ? 'bg-green-500 text-white shadow-sm'
                    : c.isToday
                      ? 'border-2 border-speed-blue text-slate-700'
                      : c.future
                        ? 'text-slate-300'
                        : 'bg-slate-100 text-slate-500'
                }`}
              >
                {c.day}
              </span>
            ),
          )}
        </div>
      </section>

      {/* WS15 (PLAN 136) - weekly recap (XP, accuracy, subjects touched, cards won) */}
      <section className="card-white mt-4" data-testid="weekly-recap">
        <p className="font-display text-sm font-bold uppercase tracking-wide text-slate-400">Your week</p>
        <div className="mt-2 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
          <Stat icon="⚡" label="XP" value={String(recap.xp)} sub="last 7 days" />
          <Stat
            icon="🎯"
            label="Accuracy"
            value={recap.accuracyPct === null ? '-' : `${recap.accuracyPct}%`}
            sub={recap.attemptCount > 0 ? `${recap.correctCount}/${recap.attemptCount} answers` : 'no answers yet'}
          />
          <Stat
            icon="🌍"
            label="Subjects"
            value={String(recap.subjects.length)}
            sub={recap.subjects.join(' · ') || 'none yet'}
          />
          <Stat icon="🃏" label="Cards won" value={String(recap.cardsWon)} sub="this week" />
        </div>
        <p className="mt-3 text-center text-xs font-semibold text-slate-400">
          Practised {recap.activeDays} of the last 7 days
        </p>
      </section>

      {/* friends entry (PLAN Phase 17 + PLAN 106) — Profile section, so the
        bottom nav never re-layouts. Shows the referral code inline so kids
        can share it right from here as well as inside FriendsScreen. */}
      <button
        onClick={() => { sfx.tap(); onOpenFriends?.() }}
        className="card-white mt-4 flex w-full items-center gap-3 text-left transition-transform hover:scale-[1.01]"
        data-testid="profile-friends-entry"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-xl">🤝</div>
        <div className="min-w-0 flex-1">
          <p className="font-display font-bold">Friends</p>
          <p className="truncate text-xs font-bold text-slate-400">
            Referral code <span className="font-display text-sky-600" data-testid="referral-code">{referralCode || '······'}</span>
            {' '}· 🎁 +30 💎 when a friend joins
          </p>
        </div>
        <span className="text-slate-300">→</span>
      </button>
      <button
        className="btn3d btn-green mt-2 w-full !py-2 !text-sm"
        data-testid="referral-copy"
        disabled={!referralCode}
        onClick={async () => {
          if (!referralCode) return
          try {
            await navigator.clipboard.writeText(referralCode)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 2000)
          } catch {
            /* clipboard optional — the Friends screen can read it aloud */
          }
        }}
      >
        {copied ? '✅ Copied!' : '📋 Copy my referral code'}
      </button>

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

      {/* PLAN 161 — extras unlock code box: rendered ONLY when yearLevel === 2
          (the trio is Year-2-only until unlocked; other years never see it). */}
      {s.yearLevel === 2 &&
        (s.extrasUnlocked ? (
          <section className="card-white mt-4" data-testid="unlock-done">
            <p className="font-display text-sm font-bold uppercase tracking-wide text-emerald-600">
              ✅ Extra subjects unlocked
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              Arabic, Religion and Social Studies are ready to turn on below.
            </p>
          </section>
        ) : (
          <section className="card-white mt-4" data-testid="unlock-code-box">
            <p className="font-display text-sm font-bold uppercase tracking-wide text-slate-400">Have a code?</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              Got a grown-up code? Enter it to unlock extra subjects.
            </p>
            <div className="mt-2 flex gap-2">
              <input
                value={unlockCode}
                onChange={(e) => { setUnlockCode(e.target.value); setUnlockError(null) }}
                onKeyDown={(e) => e.key === 'Enter' && submitUnlock()}
                placeholder="Enter code"
                data-testid="unlock-code-input"
                className="min-w-0 flex-1 rounded-xl border-2 border-slate-200 px-3 py-2 font-display text-sm font-bold outline-none focus:border-speed-blue"
              />
              <button
                onClick={submitUnlock}
                data-testid="unlock-code-submit"
                className="btn3d btn-blue shrink-0 !px-4 !py-2 !text-sm"
              >
                Unlock
              </button>
            </div>
            {unlockError && (
              <p className="mt-2 text-xs font-bold text-rose-500" data-testid="unlock-code-error">
                {unlockError}
              </p>
            )}
          </section>
        ))}

      {/* optional extras: Deutsch + Arabic (Egyptian Tawassol Grade 2).
          Opt-in DLC — never forced, never in the core toggle until enabled.
          Shared XP/gems/league economy when on.
          PLAN 163 — the German card renders only in Year 2 (subjectInYear);
          other years teach maths/english/science only. */}
      {subjectInYear('german', s.yearLevel) && (
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
      )}

      {/* optional extra: Arabic (Egyptian Tawassol Grade 2, full year T1+T2).
          Same opt-in DLC model as German. Lesson keys are `a*`.
          PLAN 162 — trio renders only when (extrasUnlocked || own flag) AND
          yearLevel === 2; grandfathered saves keep seeing them untouched. */}
      {trioVisible(s.yearLevel, s.extrasUnlocked, s.arabicEnabled) && (
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
      )}

      {/* optional extra: Islamic religion (Egyptian govt Grade 2, T1+T2).
          Same opt-in DLC model. Lesson keys are `r*`. PLAN 162 gate. */}
      {trioVisible(s.yearLevel, s.extrasUnlocked, s.religionEnabled) && (
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
      )}

      {/* optional extra: Social studies (Discover-based Egypt Grade 2).
          Same opt-in DLC model. Lesson keys are `d*`. PLAN 162 gate. */}
      {trioVisible(s.yearLevel, s.extrasUnlocked, s.socialEnabled) && (
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
      )}

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
            <p className="font-body text-sm font-bold text-slate-500">
              Playing as guest{guestName ? <> — <span className="text-speed-blue">{guestName}</span></> : ''}.
              {guestName ? ' Sign out to switch players.' : ''}
            </p>
            {guestName && (
              <button onClick={() => { sfx.tap(); signGuestOut() }} className="btn3d btn-grey mt-2 !px-3 !py-2 !text-xs">
                Sign out
              </button>
            )}
            {!guestName && <GoogleSignInInline />}
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
