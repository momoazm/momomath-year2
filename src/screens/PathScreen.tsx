import { useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { getCurriculum } from '../content/registry'
import { isLessonUnlocked, nextActiveLesson } from '../engine/path'
import { usePlayer } from '../engine/store'
import { displayStreak, isStreakActive } from '../engine/gamification'
import { Mascot } from '../components/mascots/Mascots'
import { sfx } from '../engine/sfx'
import { buildCatalog, buildCheckup, dueSkillCodes, recommend } from '../engine/adaptive'
import type { LessonDef, UnitDef } from '../content/types'
import type { RetryItem } from '../engine/adaptive'

const OFFSETS = [0, 44, 64, 0, -44, -64] // zigzag x-offsets like Duolingo's winding path

/** Darken a hex color for gradient bottoms. */
function shade(hex: string, amt = 42) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, (n >> 16) - amt)
  const g = Math.max(0, ((n >> 8) & 0xff) - amt)
  const b = Math.max(0, (n & 0xff) - amt)
  return `rgb(${r},${g},${b})`
}

type ProgressMap = Record<string, { completions: number; bestAccuracy: number }>

function unitDone(u: UnitDef, progress: ProgressMap) {
  return u.lessons.every((l) => (progress[l.id]?.bestAccuracy ?? 0) >= 100)
}

export function PathScreen({ onStartLesson, onStartCheckup, onStartSprint }: {
  onStartLesson: (lessonId: string) => void
  /** Start the daily check-up (mixed due-skill + wrong-question round). */
  onStartCheckup?: (items: RetryItem[]) => void
  /** WS16 — open the 60-second Flashcard Sprint (english only, see banner). */
  onStartSprint?: () => void
}) {
  const player = usePlayer()
  const nextRef = useRef<HTMLButtonElement | null>(null)
  const { units, lessonCount, subjectLabel } = useMemo(() => {
    const c = getCurriculum(player.subject)
    return {
      units: c.units,
      lessonCount: Object.keys(c.allLessons).length,
      subjectLabel:
        player.subject === 'english'
          ? 'English'
          : player.subject === 'science'
            ? 'Science'
            : player.subject === 'german'
              ? 'Deutsch (extra)'
              : player.subject === 'arabic'
                ? 'العربية (extra)'
                : player.subject === 'religion'
                  ? 'الدين (extra)'
                  : player.subject === 'social'
                    ? 'دراسات (extra)'
                    : 'Maths',
    }
  }, [player.subject])

  // pulse the first lesson that is unlocked and not yet mastered — never a
  // locked node, so finishing lesson 6 below 100% keeps lesson 6 active
  // (replay) until the boss unlocks
  const active = useMemo(
    () => nextActiveLesson(player.lessonProgress, units),
    [player.lessonProgress, units],
  )

  // Coach nudge: best next skill from BKT mastery + spaced review + recency.
  // Pure useMemo only — telemetry is recorded on TAP (event handler), never
  // in an effect, so this can never loop React #185 like the old card did.
  const nudge = useMemo(() => {
    if (!active) return null
    const catalog = buildCatalog(player.subject)
    const rec = recommend({ snap: player.adaptive.snapshot, catalog })
    if (!rec.lessonId) return null
    const entry = getCurriculum(player.subject).allLessons[rec.lessonId]
    if (!entry) return null
    // Locate the lesson to test its lock (a nudge into a locked node is useless).
    let ui = -1
    let li = -1
    units.forEach((u, uIdx) => {
      const lIdx = u.lessons.findIndex((l) => l.id === rec.lessonId)
      if (lIdx >= 0) { ui = uIdx; li = lIdx }
    })
    if (ui < 0 || !isLessonUnlocked(ui, li, player.lessonProgress, units)) return null
    // Don't nudge toward the already-pulsing START node — the path says it.
    if (active && units[active.unitIdx]?.lessons[active.lessonIdx]?.id === rec.lessonId) return null
    return { rec, title: entry.lesson.title }
  }, [active, player.adaptive.snapshot, player.lessonProgress, player.subject, units])

  // Daily check-up: due-for-review skills (any subject) + recent misses →
  // one mixed round. Built here so the banner only shows when a real round
  // exists (deterministic per day, so rebuilding per mount is cheap).
  const checkup = useMemo(() => {
    const due = dueSkillCodes(player.adaptive.snapshot)
    if (due.length === 0) return null
    const session = buildCheckup({
      snap: player.adaptive.snapshot,
      attempts: player.adaptive.attempts,
    })
    if (session.items.length === 0) return null
    return { count: due.length, items: session.items }
  }, [player.adaptive.snapshot, player.adaptive.attempts])

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-28 pt-4">
      {/* daily check-up — mixed review of due skills + recent misses */}
      {checkup && onStartCheckup && (
        <motion.button
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => { sfx.tap(); onStartCheckup(checkup.items) }}
          className="card-white mb-3 flex w-full items-center gap-3 border-l-4 border-l-amber-400 text-left shadow-pop transition-transform active:scale-[0.99]"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-2xl">
            🔔
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-xs font-bold uppercase tracking-wider text-amber-500">
              Daily check-up
            </p>
            <p className="truncate font-display text-base font-extrabold text-slate-700">
              {checkup.count} skill{checkup.count === 1 ? '' : 's'} due 🔔
            </p>
            <p className="truncate text-xs font-bold text-slate-400">
              A quick mixed round — due skills and your recent misses.
            </p>
          </div>
          <span className="shrink-0 font-display text-xl text-slate-300">›</span>
        </motion.button>
      )}
      {/* WS16 — Flashcard Sprint entry (english only: the bank is english MCQs) */}
      {onStartSprint && player.subject === 'english' && (
        <motion.button
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => { sfx.tap(); onStartSprint() }}
          className="card-white mb-3 flex w-full items-center gap-3 border-l-4 border-l-fuchsia-400 text-left shadow-pop transition-transform active:scale-[0.99]"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-fuchsia-100 text-2xl">
            💨
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-xs font-bold uppercase tracking-wider text-fuchsia-500">
              Flashcard Sprint
            </p>
            <p className="truncate font-display text-base font-extrabold text-slate-700">
              60 seconds · word rush ⚡
            </p>
            <p className="truncate text-xs font-bold text-slate-400">
              Best score: {player.sprintBest}
            </p>
          </div>
          <span className="shrink-0 font-display text-xl text-slate-300">›</span>
        </motion.button>
      )}
      {/* coach nudge — personalised next step above the daily goal */}
      {nudge && (
        <motion.button
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => {
            sfx.tap()
            player.setLastAdaptiveRecommendation(nudge.rec)
            player.bumpRecommendationShown(true)
            onStartLesson(nudge.rec.lessonId!)
          }}
          className="card-white mb-3 flex w-full items-center gap-3 border-l-4 border-l-speed-blue text-left shadow-pop transition-transform active:scale-[0.99]"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-speed-bluelight text-2xl">
            🎯
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-xs font-bold uppercase tracking-wider text-speed-blue">
              {nudge.rec.reasonCode === 'spaced-review-due' ? 'Due for a check-up' : 'Recommended for you'}
            </p>
            <p className="truncate font-display text-base font-extrabold text-slate-700">
              {nudge.title} · {Math.round(nudge.rec.mastery * 100)}%
            </p>
            <p className="truncate text-xs font-bold text-slate-400">{nudge.rec.reasonText}</p>
          </div>
          <span className="shrink-0 font-display text-xl text-slate-300">›</span>
        </motion.button>
      )}
      {/* daily goal banner */}
      <div className="card-white mb-5 flex items-center gap-3">
        <div className="h-12 w-12 shrink-0">
          <Mascot id={player.mascot} expression="happy" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-bold text-slate-500">
            Daily goal ·{' '}
            <span className={isStreakActive(player) ? 'text-orange-500' : 'text-slate-400'}>
              🔥 streak day {isStreakActive(player) ? displayStreak(player) || 'new!' : 'play a lesson today!'}
            </span>
          </p>
          <div className="mt-1 h-3.5 w-full overflow-hidden rounded-full border border-orange-100 bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-[width] duration-700"
              style={{ width: `${Math.min(100, (player.todayXp / player.dailyGoal) * 100)}%` }}
            />
          </div>
          <p className="mt-0.5 text-xs font-bold text-slate-400">
            {Math.min(player.todayXp, player.dailyGoal)} / {player.dailyGoal} XP today
          </p>
        </div>
      </div>

      {/* Empty curriculum (should never happen for a registered subject) */}
      {units.length === 0 && (
        <div className="card-white mb-5 p-6 text-center">
          <div className="text-5xl">🗺️</div>
          <h2 className="mt-2 font-display text-lg font-extrabold text-slate-600">
            No roadmap here yet
          </h2>
          <p className="mt-1 text-sm font-bold text-slate-400">
            Switch subject in the top bar (Maths, English, or Science) to keep
            playing.
          </p>
        </div>
      )}

      {units.map((u, ui) => {
        const done = unitDone(u, player.lessonProgress)
        return (
          <section key={u.id} className="mb-8">
            <motion.header
              initial={{ opacity: 0, y: -8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25 }}
              className="sticky top-14 z-20 mb-6 flex items-center justify-between rounded-2xl px-4 py-3 text-white shadow-pop"
              style={{ backgroundColor: u.color }}
            >
              <div>
                <h2 className="font-display text-lg font-extrabold leading-tight">
                  Unit {u.order} · {u.icon} {u.title}
                </h2>
                <p className="text-xs font-bold opacity-90">{u.subtitle}</p>
              </div>
              {done && <span title="Unit complete!" className="text-2xl">🏅</span>}
            </motion.header>

            <ol className="flex flex-col items-center gap-4">
              {u.lessons.map((l: LessonDef, li) => {
                const unlocked = isLessonUnlocked(ui, li, player.lessonProgress, units)
                const prog = player.lessonProgress[l.id]
                const crowns = prog?.crown ?? 0
                const isActive = active?.unitIdx === ui && active.lessonIdx === li
                const offset = OFFSETS[(ui * 3 + li) % OFFSETS.length]
                const isBoss = l.id.endsWith('boss')
                return (
                  <li key={l.id} style={{ transform: `translateX(${offset}px)` }}>
                    <button
                      ref={isActive ? nextRef : undefined}
                      disabled={!unlocked}
                      onClick={() => {
                        sfx.whoosh()
                        onStartLesson(l.id)
                      }}
                      className={`gpu group relative flex flex-col items-center transition-transform duration-150 ${
                        unlocked ? 'hover:scale-105 active:scale-95' : 'cursor-not-allowed opacity-55'
                      }`}
                      title={unlocked ? l.title : 'Finish the previous lesson with 100% to unlock!'}
                    >
                      <span className="relative rounded-full bg-white p-1.5 shadow-pop">
                        {isActive && (
                          <span className="animate-pulse-ring absolute inset-0 rounded-full border-4 border-emerald-400" />
                        )}
                        <span
                          className={`relative flex items-center justify-center rounded-full border-b-4 font-display ${
                            isBoss ? 'h-20 w-20 text-3xl' : 'h-14 w-14 text-xl'
                          } ${unlocked ? 'border-black/15 text-white' : 'border-black/5 bg-slate-300 text-white'}`}
                          style={
                            unlocked
                              ? {
                                  backgroundImage:
                                    crowns >= 3
                                      ? 'linear-gradient(180deg,#fbbf24,#d97706)'
                                      : isActive
                                        ? 'linear-gradient(180deg,#6ee84a,#3fb50a)'
                                        : `linear-gradient(180deg, ${u.color}, ${shade(u.color)})`,
                                }
                              : undefined
                          }
                        >
                          {isBoss ? '👑' : unlocked ? '⭐' : '🔒'}
                          {isActive && (
                            <span className="animate-pop-in absolute -top-9 whitespace-nowrap rounded-xl border-2 border-emerald-100 bg-white px-2.5 py-0.5 font-display text-xs font-extrabold text-emerald-600 shadow-md">
                              START ▶
                            </span>
                          )}
                        </span>
                      </span>
                      <span className="mt-1.5 max-w-36 truncate rounded-full bg-white/80 px-2 py-0.5 text-center font-display text-xs font-bold text-slate-500 shadow-sm">
                        {crowns > 0 && !isBoss ? '★'.repeat(crowns) + ' ' : ''}
                        {l.title}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>

            {done && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="h-10 w-10"><Mascot id="sonic" expression="cheer" /></div>
                <p className="font-display text-sm font-extrabold text-emerald-600">Unit mastered! 🎉</p>
              </div>
            )}
          </section>
        )
      })}
      <footer className="pb-4 text-center text-xs font-bold text-slate-300">
        Momo Year 2 Cambridge · {subjectLabel} · {lessonCount} lessons
      </footer>
    </div>
  )
}
