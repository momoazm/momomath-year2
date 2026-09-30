import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { getCurriculum } from '../content/registry'
import { isLessonUnlocked, isUnitActivityUnlocked, nextActiveLesson } from '../engine/path'
import { usePlayer } from '../engine/store'
import { CLASSIC_BOOKS } from '../content/english/classic'
import { buildCheckup, dueSkillCodes } from '../engine/adaptive'
import type { RetryItem } from '../engine/adaptive'
import { displayStreak, isStreakActive } from '../engine/gamification'
import { roadmapFooterFor } from '../engine/branding'
import { Mascot } from '../components/mascots/Mascots'
import { sfx } from '../engine/sfx'
import type { Expression, LessonDef, UnitDef } from '../content/types'

const OFFSETS = [0, 44, 64, 0, -44, -64] // zigzag x-offsets like Duolingo's winding path

/** Explicit roadmap node typing (PLAN 78) — id-suffix fallback stays authoritative. */
export type NodeKind = 'lesson' | 'boss' | 'book' | 'practice' | 'activity'
export const KIND_ICON: Record<NodeKind, string> = { lesson: '⭐', boss: '👑', book: '📖', practice: '🔁', activity: '🎯' }
export function kindFor(l: LessonDef): NodeKind {
  return l.id.endsWith('boss') ? 'boss' : 'lesson'
}

/* ---------------------- roadside characters (cast) ---------------------- *
 * Deterministic mascots standing beside the path so the roadmap reads like
 * a populated world map: your own buddy cheers on the active lesson, a rival
 * guards each boss, themed friends sit at book/practice/activity nodes, and
 * every third lesson gets an ambient friend who "thinks" (guards) any still-
 * locked stretch and cheers once it's perfected. Pure functions so the node
 * test env can cover them (it can't render JSX). */

export type RoadsideRole = 'active' | 'boss' | 'book' | 'practice' | 'activity' | 'ambient'

const BOSS_RIVALS = ['shadow', 'eggman', 'metal', 'omega', 'jet'] as const
const BOOK_READERS = ['cream', 'big', 'tails', 'rouge'] as const
const PRACTICE_THINKERS = ['silver', 'espio', 'ray'] as const
const ACTIVITY_HYPES = ['knuckles', 'blaze', 'charmy', 'vector'] as const
const AMBIENT_FRIENDS = ['amy', 'tails', 'cream', 'ray', 'charmy', 'big', 'vector', 'jet', 'blaze', 'rouge'] as const

function pickFrom(roster: readonly string[], seed: number, avoid?: string): string {
  const id = roster[((seed % roster.length) + roster.length) % roster.length]
  if (avoid && id === avoid) return roster[(seed + 1) % roster.length]
  return id
}

/** Who stands beside this node and what face they make. `cleared` = crown-3
 *  / read book / beaten unit; `unlocked` drives the thinking-guard face. */
export function roadsideCast(
  role: RoadsideRole,
  o: {
    unitIdx: number
    slot: number
    unlocked: boolean
    cleared?: boolean
    isActive?: boolean
    playerMascot: string
  },
): { id: string; expression: Expression } | null {
  const seed = o.unitIdx * 7 + o.slot
  switch (role) {
    case 'active':
      return { id: o.playerMascot, expression: 'excited' }
    case 'boss':
      return { id: BOSS_RIVALS[o.unitIdx % BOSS_RIVALS.length], expression: o.unlocked ? 'excited' : 'thinking' }
    case 'book':
      return { id: pickFrom(BOOK_READERS, seed), expression: o.cleared ? 'happy' : o.unlocked ? 'excited' : 'thinking' }
    case 'practice':
      return { id: pickFrom(PRACTICE_THINKERS, seed), expression: o.unlocked ? 'excited' : 'thinking' }
    case 'activity':
      return { id: pickFrom(ACTIVITY_HYPES, seed), expression: o.unlocked ? 'excited' : 'thinking' }
    case 'ambient': {
      if (o.isActive) return null // the active node gets its own companion
      return {
        id: pickFrom(AMBIENT_FRIENDS, seed, o.playerMascot),
        expression: o.unlocked ? (o.cleared ? 'cheer' : 'happy') : 'thinking',
      }
    }
  }
}

/** Which edge the character stands on: toward the path centre so it never
 *  pushes past the container on narrow phones (node offsets run +/-64px).
 *  Zero offsets alternate by seed so same-row pairs don't stack a side. */
export function roadsideSide(offset: number, seed: number): 'left' | 'right' {
  if (offset > 0) return 'left'
  if (offset < 0) return 'right'
  return seed % 2 === 0 ? 'left' : 'right'
}

/* ---------------- unit progress ring + unlock-flash helpers ---------------- *
 * Pure so the node test env can cover them (no DOM). The ring shows how many
 * lessons of a unit are PERFECTED (bestAccuracy 100); the key-diff decides
 * which nodes deserve a "just opened!" glow — snapshots live in sessionStorage
 * so a node flashes when you come BACK to the path after unlocking it. */

export function unitPerfected(u: UnitDef, progress: ProgressMap): number {
  return u.lessons.filter((l) => (progress[l.id]?.bestAccuracy ?? 0) >= 100).length
}

/** stroke-dasharray math for an SVG progress ring (clamped to 0..1). */
export function ringDash(value: number, total: number, r = 15): { dash: string; pct: number } {
  const c = 2 * Math.PI * r
  const pct = total > 0 ? Math.min(1, Math.max(0, value / total)) : 0
  return { dash: `${(pct * c).toFixed(2)} ${c.toFixed(2)}`, pct }
}

/** Keys of every node that is currently open: lessons + book + practice + activity. */
export function collectUnlockedKeys(units: UnitDef[], progress: ProgressMap): Set<string> {
  const keys = new Set<string>()
  units.forEach((u, ui) => {
    u.lessons.forEach((l, li) => {
      if (isLessonUnlocked(ui, li, progress, units)) keys.add(`l:${l.id}`)
    })
    if (u.book && isLessonUnlocked(ui, 0, progress, units)) keys.add(`b:${u.id}`)
    if (u.lessons.every((l) => (progress[l.id]?.completions ?? 0) > 0)) {
      keys.add(`p:${u.id}`)
      if (isUnitActivityUnlocked(u, progress)) keys.add(`a:${u.id}`)
    }
  })
  return keys
}

/** Nodes that opened since the last snapshot → they get the unlock glow. */
export function newlyUnlocked(prev: Set<string>, next: Set<string>): string[] {
  return [...next].filter((k) => !prev.has(k))
}

/** Decorative-only: pointer-events-none so node taps/tests pass straight
 *  through; aria-hidden because it's ambience, not content.
 *  Perf: 67 mascots = ~4700 SVG nodes + 27 infinite sway animations, which
 *  janked scrolling — the mascot only mounts while its node is within 300px
 *  of the viewport. The empty shell stays (stable observer target, zero cost). */
function RoadsideChar({ cast, side }: { cast: { id: string; expression: Expression } | null; side: 'left' | 'right' }) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const [near, setNear] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: '300px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  if (!cast) return null
  // Duolingo-style idle bob: gentle hop + tilt, phase-offset per mascot so the
  // cast never bounces in lockstep (deterministic from the mascot id). Only
  // applied while the mascot is actually mounted (perf gate above).
  const phase = -(([...cast.id].reduce((a, c) => a + c.charCodeAt(0), 0) % 22) / 10)
  return (
    <span
      ref={ref}
      aria-hidden
      data-testid="roadside-char"
      style={near ? { animationDelay: `${phase}s` } : undefined}
      className={`pointer-events-none absolute top-1 h-14 w-14 ${near ? 'animate-char-idle' : ''} ${
        side === 'left' ? 'right-full mr-2' : 'left-full ml-2'
      }`}
    >
      {near && <Mascot id={cast.id} expression={cast.expression} />}
    </span>
  )
}

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
  return unitPerfected(u, progress) === u.lessons.length
}

export function PathScreen({
  onStartLesson,
  onOpenBook,
  onOpenActivity,
  onStartCheckup,
  onStartSprint,
}: {
  onStartLesson: (lessonId: string) => void
  onOpenBook: (bookId: string) => void
  onOpenActivity: (unitId: string) => void
  /** Start the daily check-up (mixed due-skill + wrong-question round). */
  onStartCheckup?: (items: RetryItem[]) => void
  /** WS16 - open the 60-second Flashcard Sprint (english only, see banner). */
  onStartSprint?: () => void
}) {
  const player = usePlayer()
  const celebrateUnit = usePlayer((s) => s.celebrateUnit)
  const nextRef = useRef<HTMLButtonElement | null>(null)
  const [lockedMsg, setLockedMsg] = useState<string | null>(null)
  const [trophy, setTrophy] = useState<{ unitId: string; label: string } | null>(null)
  // floating stack: mini daily-goal chip only when the big banner scrolled away
  const goalRef = useRef<HTMLDivElement | null>(null)
  const [bannerGone, setBannerGone] = useState(false)
  useEffect(() => {
    const el = goalRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setBannerGone(!e.isIntersecting), { threshold: 0.1 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // jump pill arrow points TOWARD the START node: ↑ when it's above the
  // viewport, ↓ when below (rAF-throttled; same-value state updates bail out
  // so scrolling without a crossing never re-renders).
  const [jumpUp, setJumpUp] = useState(false)
  useEffect(() => {
    let raf = 0
    const measure = () => {
      raf = 0
      const el = nextRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const mid = r.top + r.height / 2
      const dir = mid < 16 ? true : mid > window.innerHeight - 16 ? false : null
      if (dir !== null) setJumpUp((v) => (v === dir ? v : dir))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    measure()
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])
  const { units, lessonCount, subjectLabel } = useMemo(() => {
    const c = getCurriculum(player.subject, player.yearLevel)
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
  }, [player.subject, player.yearLevel])

  // "just unlocked!" glow: diff the open-node keys against the last snapshot in
  // sessionStorage (survives the battle screen unmount), then flash for 3s.
  const unlockedKeys = useMemo(
    () => collectUnlockedKeys(units, player.lessonProgress),
    [units, player.lessonProgress],
  )
  const [flashKeys, setFlashKeys] = useState<ReadonlySet<string>>(new Set())
  useEffect(() => {
    const storeKey = `momomath-year2-unlocked:${player.subject}:${player.yearLevel}`
    let stored: Set<string> | null = null
    try {
      const raw = sessionStorage.getItem(storeKey)
      if (raw) stored = new Set(JSON.parse(raw) as string[])
    } catch {
      stored = null
    }
    try {
      sessionStorage.setItem(storeKey, JSON.stringify([...unlockedKeys]))
    } catch {
      /* storage optional */
    }
    if (!stored) return
    const fresh = newlyUnlocked(stored, unlockedKeys)
    if (fresh.length > 0) setFlashKeys(new Set(fresh))
    // always (re)schedule the clear: StrictMode's double-run must never strand
    // the glow by clearing the only timer before a second run re-flashes.
    const t = setTimeout(() => setFlashKeys(new Set()), 3000)
    return () => clearTimeout(t)
  }, [unlockedKeys, player.subject, player.yearLevel])
  const flashCls = (key: string) => (flashKeys.has(key) ? ' animate-unlock-flash' : '')

  // pulse the NEXT LESSON TO BE DONE (PLAN 121): first unlocked lesson never
  // tried — the badge moves forward as soon as a lesson is started; when every
  // lesson has been tried it falls back to the first unlocked not-yet-perfected
  // (replay). Never a locked node.
  const active = useMemo(
    () => nextActiveLesson(player.lessonProgress, units),
    [player.lessonProgress, units],
  )

  // 🏆 unit trophy celebration (PLAN 76): first time a unit hits 100%, pop the
  // celebration once per unit (+30 gems via celebrateUnit) — existing inline
  // "Unit mastered!" line below stays as-is.
  useEffect(() => {
    if (trophy) return
    for (const u of units) {
      if (unitDone(u, player.lessonProgress) && !player.unitsCelebrated.includes(u.id)) {
        setTrophy({ unitId: u.id, label: `Unit ${u.order} · ${u.icon} ${u.title}` })
        try {
          confetti({ particleCount: 140, spread: 80, origin: { y: 0.5 }, disableForReducedMotion: true })
        } catch {
          /* confetti optional */
        }
        break
      }
    }
  }, [units, player.lessonProgress, player.unitsCelebrated, trophy])

  // Daily check-up: due-for-review skills (any subject) + recent misses →
  // one mixed round. Built here so the banner only shows when a real round
  // exists (deterministic per day, so rebuilding per mount is cheap).
  const checkup = useMemo(() => {
    const due = dueSkillCodes(player.adaptive.snapshot)
    if (due.length === 0) return null
    const session = buildCheckup({
      snap: player.adaptive.snapshot,
      attempts: player.adaptive.attempts,
      year: player.yearLevel,
    })
    if (session.items.length === 0) return null
    return { count: due.length, items: session.items }
  }, [player.adaptive.snapshot, player.adaptive.attempts, player.yearLevel])

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-28 pt-4">
      {/* daily check-up - mixed review of due skills + recent misses */}
      {checkup && onStartCheckup && (
        <motion.button
          data-testid="checkup-banner"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => { sfx.tap(); onStartCheckup(checkup.items) }}
          className="card-white mb-3 flex w-full items-center gap-3 border-l-4 border-l-amber-400 text-left shadow-pop transition-transform active:scale-[0.99]"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-2xl">
            🩺
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-xs font-bold uppercase tracking-wider text-amber-500">
              Daily check-up
            </p>
            <p className="truncate font-display text-base font-extrabold text-slate-700">
              {checkup.count} skill{checkup.count === 1 ? '' : 's'} due ⏰
            </p>
            <p className="truncate text-xs font-bold text-slate-400">
              A quick mixed round — due skills and your recent misses.
            </p>
          </div>
          <span className="shrink-0 font-display text-xl text-slate-300">›</span>
        </motion.button>
      )}
      {/* WS16 - Flashcard Sprint entry (english only: the bank is english MCQs) */}
      {onStartSprint && player.subject === 'english' && (
        <motion.button
          data-testid="sprint-banner"
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
      {/* daily goal banner */}
      <div ref={goalRef} data-testid="goal-banner" className="card-white mb-5 flex items-center gap-3">
        <div className="h-12 w-12 shrink-0">
          <Mascot id={player.mascot} expression="happy" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-bold text-slate-500">
            Daily goal ·{' '}
            <span className={isStreakActive(player) ? 'text-orange-500' : 'text-slate-400'}>
              {isStreakActive(player)
                ? displayStreak(player) > 0
                  ? `🔥 ${displayStreak(player)}-day streak`
                  : '🔥 Streak started today!'
                : '🔥 Play a lesson today to start your streak!'}
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

      {/* 📚 Story Library (PLAN 100) — reading lives on the ENGLISH roadmap
          only; other subjects never render it (hidden, not removed). */}
      {player.subject === 'english' && (
        <section className="card-white mb-5" data-testid="story-library">
          <div className="flex items-center justify-between">
            <p className="font-display text-sm font-extrabold text-slate-700">📚 Story Library</p>
            <span className="text-xs font-bold text-slate-400" data-testid="story-progress">
              {CLASSIC_BOOKS.filter((b) => player.booksRead[b.id]).length}/{CLASSIC_BOOKS.length} read
            </span>
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {CLASSIC_BOOKS.map((b) => (
              <button
                key={b.id}
                data-testid="story-tile"
                className="shrink-0 rounded-2xl border-2 border-b-4 border-slate-200 bg-sky-50 px-3 py-2 text-left transition-colors active:border-b-2"
                onClick={() => { sfx.whoosh(); onOpenBook(b.id) }}
              >
                <span className="block text-lg">{player.booksRead[b.id] ? '📖✅' : '📖'}</span>
                <span className="block max-w-28 truncate font-display text-xs font-extrabold text-slate-600">{b.title}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {units.map((u, ui) => {
        const done = unitDone(u, player.lessonProgress)
        const perfected = unitPerfected(u, player.lessonProgress)
        const ring = ringDash(perfected, u.lessons.length, 14)
        return (
          <section key={u.id} className="mb-8">
            <motion.header
              initial={{ opacity: 0, y: -8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25 }}
              className="sticky top-14 z-20 mb-10 flex items-center justify-between rounded-2xl px-4 py-3 text-white shadow-pop"
              style={{ backgroundColor: u.color }}
            >
              <div>
                <h2 className="font-display text-lg font-extrabold leading-tight">
                  Unit {u.order} · {u.icon} {u.title}
                </h2>
                <p className="text-xs font-bold opacity-90">{u.subtitle}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  title={`${perfected}/${u.lessons.length} lessons at 100%`}
                  data-testid="unit-ring"
                  className="shrink-0"
                >
                  <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden>
                    <g transform="rotate(-90 17 17)">
                      <circle cx="17" cy="17" r="14" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="4" />
                      <circle
                        cx="17"
                        cy="17"
                        r="14"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={ring.dash}
                      />
                    </g>
                    <text
                      x="17"
                      y="17.5"
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="fill-white font-display"
                      style={{ fontSize: 9.5, fontWeight: 800 }}
                    >
                      {perfected}/{u.lessons.length}
                    </text>
                  </svg>
                </span>
                {u.book && (
                  <span title={player.booksRead[u.book.id] ? 'Book read!' : 'Unit book'} className="text-xl">
                    📖{player.booksRead[u.book.id] ? '✅' : ''}
                  </span>
                )}
                {done && <span title="Unit complete!" className="text-2xl">🏅</span>}
              </div>
            </motion.header>

            <ol className="relative flex flex-col items-center gap-8">
              {/* dashed road spine - nodes read as one connected path */}
              <span
                aria-hidden
                data-testid="path-road"
                className="pointer-events-none absolute inset-y-1 left-1/2 w-[6px] -translate-x-1/2 rounded-full"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(to bottom, rgba(255,255,255,0.92) 0 10px, rgba(255,255,255,0) 10px 22px)',
                }}
              />
              {/* 📖 Book node — a NORMAL roadmap node (same markup as lesson
                  nodes), first in the unit so reading opens each unit. */}
              {u.book && (() => {
                const bookUnlocked = isLessonUnlocked(ui, 0, player.lessonProgress, units)
                const read = !!player.booksRead[u.book.id]
                const offsetBook = OFFSETS[(ui * 3 + u.lessons.length + 2) % OFFSETS.length]
                const cast = roadsideCast('book', {
                  unitIdx: ui,
                  slot: 50,
                  unlocked: bookUnlocked,
                  cleared: read,
                  playerMascot: player.mascot,
                })
                return (
                  <li className="relative" style={{ transform: `translateX(${offsetBook}px)` }}>
                    <RoadsideChar cast={cast} side={roadsideSide(offsetBook, ui * 2 + 1)} />
                    <button
                      aria-disabled={!bookUnlocked}
                      data-testid="book-node"
                      onClick={() => {
                        if (!bookUnlocked) {
                          // friendly locked popup (PLAN 75), like locked lessons
                          sfx.tap()
                          setLockedMsg('Finish the first lesson to unlock the book — you\'ve got this! 💪')
                          return
                        }
                        sfx.whoosh()
                        onOpenBook(u.book!.id)
                      }}
                      className={`gpu group relative flex flex-col items-center transition-transform duration-150 ${
                        bookUnlocked ? 'hover:scale-105 active:scale-95' : 'cursor-not-allowed opacity-70'
                      }`}
                      title={
                        bookUnlocked ? `📖 ${u.book.title}` : 'Finish the first lesson to unlock the book!'
                      }
                    >
                      <span className={`relative rounded-full bg-white p-1.5 shadow-pop${flashCls(`b:${u.id}`)}`}>
                        {bookUnlocked && !read && (
                          <span className="animate-pulse-ring absolute inset-0 rounded-full border-4 border-sky-400" />
                        )}
                        <span
                          className={`relative flex h-14 w-14 items-center justify-center rounded-full border-b-4 font-display text-xl ${
                            bookUnlocked ? 'border-black/15 text-white' : 'border-black/5 bg-slate-300 text-white'
                          }`}
                          style={
                            bookUnlocked
                              ? {
                                  backgroundImage: read
                                    ? 'linear-gradient(180deg,#fbbf24,#d97706)'
                                    : `linear-gradient(180deg, ${u.color}, ${shade(u.color)})`,
                                }
                              : undefined
                          }
                        >
                          {bookUnlocked ? KIND_ICON.book : '🔒'}
                        </span>
                      </span>
                      <span className="mt-1.5 max-w-36 truncate rounded-full bg-white px-2 py-0.5 text-center font-display text-xs font-bold text-slate-600 shadow-sm">
                        {read ? '✅ Read the book' : `📖 ${u.book.title}`}
                      </span>
                    </button>
                  </li>
                )
              })()}
              {u.lessons.map((l: LessonDef, li) => {
                const unlocked = isLessonUnlocked(ui, li, player.lessonProgress, units)
                const prog = player.lessonProgress[l.id]
                const crowns = prog?.crown ?? 0
                const isActive = active?.unitIdx === ui && active.lessonIdx === li
                const offset = OFFSETS[(ui * 3 + li) % OFFSETS.length]
                const nodeKind = kindFor(l)
                const isBoss = nodeKind === 'boss'
                const cast = isBoss
                  ? roadsideCast('boss', { unitIdx: ui, slot: li, unlocked, playerMascot: player.mascot })
                  : isActive
                    ? roadsideCast('active', { unitIdx: ui, slot: li, unlocked, playerMascot: player.mascot })
                    : li % 3 === 2
                      ? roadsideCast('ambient', {
                          unitIdx: ui,
                          slot: li,
                          unlocked,
                          cleared: crowns >= 3,
                          isActive,
                          playerMascot: player.mascot,
                        })
                      : null
                return (
                  <li key={l.id} className="relative" style={{ transform: `translateX(${offset}px)` }}>
                    {cast && <RoadsideChar cast={cast} side={roadsideSide(offset, ui + li)} />}
                    <button
                      ref={isActive ? nextRef : undefined}
                      aria-disabled={!unlocked}
                      onClick={() => {
                        if (!unlocked) {
                          // friendly locked popup (PLAN 75) instead of a silent disabled tap
                          sfx.tap()
                          const prev =
                            li > 0 ? u.lessons[li - 1] : units[ui - 1]?.lessons[units[ui - 1].lessons.length - 1]
                          setLockedMsg(
                            prev
                              ? `Finish “${prev.title}” first — you've got this! 💪`
                              : 'Finish the first lesson to unlock — you\'ve got this! 💪',
                          )
                          return
                        }
                        sfx.whoosh()
                        onStartLesson(l.id)
                      }}
                      className={`gpu group relative flex flex-col items-center transition-transform duration-150 ${
                        unlocked ? 'hover:scale-105 active:scale-95' : 'cursor-not-allowed opacity-70'
                      }`}
                      title={unlocked ? l.title : 'Finish the previous lesson first to unlock!'}
                    >
                      <span className={`relative rounded-full bg-white p-1.5 shadow-pop${flashCls(`l:${l.id}`)}`}>
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
                          {!unlocked ? '🔒' : KIND_ICON[nodeKind]}
                          {isActive && (
                            <span className="animate-pop-in absolute -top-9 whitespace-nowrap rounded-xl border-2 border-emerald-100 bg-white px-2.5 py-0.5 font-display text-xs font-extrabold text-emerald-600 shadow-md">
                              START ▶
                            </span>
                          )}
                        </span>
                      </span>
                      <span className="mt-1.5 max-w-36 truncate rounded-full bg-white px-2 py-0.5 text-center font-display text-xs font-bold text-slate-600 shadow-sm">
                        {crowns > 0 && !isBoss ? '★'.repeat(crowns) + ' ' : ''}
                        {l.title}
                      </span>
                    </button>
                  </li>
                )
              })}
              {/* 🔁 Practice node (PLAN 77) — synthetic, never part of UnitDef.lessons */}
              {(() => {
                const allTried = u.lessons.every((l) => (player.lessonProgress[l.id]?.completions ?? 0) > 0)
                const weakest = u.lessons.reduce((a, b) =>
                  (player.lessonProgress[a.id]?.bestAccuracy ?? 0) <= (player.lessonProgress[b.id]?.bestAccuracy ?? 0)
                    ? a
                    : b,
                )
                const offset = OFFSETS[(ui * 3 + u.lessons.length) % OFFSETS.length]
                const cast = roadsideCast('practice', {
                  unitIdx: ui,
                  slot: 60,
                  unlocked: allTried,
                  playerMascot: player.mascot,
                })
                return (
                  <li key={`${u.id}practice`} className="relative" style={{ transform: `translateX(${offset}px)` }}>
                    <RoadsideChar cast={cast} side={roadsideSide(offset, ui * 2 + 2)} />
                    <button
                      aria-disabled={!allTried}
                      className={`gpu group relative flex flex-col items-center transition-transform duration-150 ${
                        allTried ? 'hover:scale-105 active:scale-95' : 'cursor-not-allowed opacity-70'
                      }`}
                      title={
                        allTried
                          ? `Practice the trickiest lesson: ${weakest.title}`
                          : 'Finish every lesson in this unit once to unlock practice!'
                      }
                      onClick={() => {
                        if (!allTried) {
                          sfx.tap()
                          setLockedMsg('Finish every lesson in this unit first — you\'ve got this! 💪')
                          return
                        }
                        sfx.whoosh()
                        onStartLesson(weakest.id)
                      }}
                    >
                      <span className={`relative rounded-full bg-white p-1.5 shadow-pop${flashCls(`p:${u.id}`)}`}>
                        <span
                          className={`relative flex h-14 w-14 items-center justify-center rounded-full border-b-4 text-xl ${
                            allTried ? 'border-black/15 text-white' : 'border-black/5 bg-slate-300 text-white'
                          }`}
                          style={
                            allTried
                              ? { backgroundImage: 'linear-gradient(180deg,#14b8a6,#0f766e)' }
                              : undefined
                          }
                        >
                          {allTried ? KIND_ICON.practice : '🔒'}
                        </span>
                      </span>
                      <span className="mt-1.5 max-w-36 truncate rounded-full bg-white px-2 py-0.5 text-center font-display text-xs font-bold text-slate-600 shadow-sm">
                        🔁 Practice
                      </span>
                    </button>
                  </li>
                )
              })()}
              {/* 🎯 Unit fun-activity node (PLAN 104/122) — renders like the 🔁
                practice node but opens the subject-themed mini-game for
                THIS unit. Unlocked only once EVERY lesson in the unit is
                tried (isUnitActivityUnlocked — same gate as 🔁 practice). */}
              {(() => {
                const activityUnlocked = isUnitActivityUnlocked(u, player.lessonProgress)
                const offsetA = OFFSETS[(ui * 3 + u.lessons.length + 1) % OFFSETS.length]
                const unitBest = player.unitActivityBest[u.id] ?? 0
                const cast = roadsideCast('activity', {
                  unitIdx: ui,
                  slot: 70,
                  unlocked: activityUnlocked,
                  playerMascot: player.mascot,
                })
                return (
                  <li key={`${u.id}activity`} className="relative" style={{ transform: `translateX(${offsetA}px)` }}>
                    <RoadsideChar cast={cast} side={roadsideSide(offsetA, ui * 2 + 3)} />
                    <button
                      aria-disabled={!activityUnlocked}
                      data-testid="activity-node"
                      className={`gpu group relative flex flex-col items-center transition-transform duration-150 ${
                        activityUnlocked ? 'hover:scale-105 active:scale-95' : 'cursor-not-allowed opacity-70'
                      }`}
                      title={
                        activityUnlocked
                          ? `🎯 Unit challenge${unitBest > 0 ? ` — best ${unitBest}` : ''}`
                          : 'Finish every lesson in this unit to unlock the fun game!'
                      }
                      onClick={() => {
                        if (!activityUnlocked) {
                          sfx.tap()
                          setLockedMsg('Finish every lesson in this unit first to unlock the fun game — you\'ve got this! 💪')
                          return
                        }
                        sfx.whoosh()
                        onOpenActivity(u.id)
                      }}
                    >
                      <span className={`relative rounded-full bg-white p-1.5 shadow-pop${flashCls(`a:${u.id}`)}`}>
                        {activityUnlocked && unitBest === 0 && (
                          <span className="animate-pulse-ring absolute inset-0 rounded-full border-4 border-violet-400" />
                        )}
                        <span
                          className={`relative flex h-14 w-14 items-center justify-center rounded-full border-b-4 text-xl ${
                            activityUnlocked ? 'border-black/15 text-white' : 'border-black/5 bg-slate-300 text-white'
                          }`}
                          style={
                            activityUnlocked
                              ? { backgroundImage: 'linear-gradient(180deg,#8b5cf6,#7c3aed)' }
                              : undefined
                          }
                        >
                          {activityUnlocked ? KIND_ICON.activity : '🔒'}
                        </span>
                      </span>
                      <span className="mt-1.5 max-w-36 truncate rounded-full bg-white px-2 py-0.5 text-center font-display text-xs font-bold text-slate-600 shadow-sm">
                        🎯 Unit game{unitBest > 0 ? ` · ${unitBest}` : ''}
                      </span>
                    </button>
                  </li>
                )
              })()}
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
        {roadmapFooterFor(player.yearLevel, subjectLabel, lessonCount)}
      </footer>

      {/* floating stack: jump-to-START + mini daily-goal chip (hidden while the
          big banner is on screen) */}
      <div className="fixed bottom-24 right-3 z-30 flex flex-col items-end gap-2" data-testid="path-float">
        {bannerGone && (
          <motion.button
            data-testid="goal-chip"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.18 }}
            title="Back to the daily goal"
            onClick={() => {
              sfx.tap()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="flex items-center gap-2 rounded-full border-2 border-white bg-white/95 px-3 py-1.5 shadow-pop"
          >
            <span aria-hidden className="text-sm">🔥</span>
            <span className="font-display text-xs font-extrabold tabular-nums text-slate-700">
              {Math.min(player.todayXp, player.dailyGoal)}/{player.dailyGoal} XP
            </span>
            <span className="block h-2 w-12 overflow-hidden rounded-full bg-slate-200">
              <span
                className="block h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                style={{ width: `${Math.min(100, (player.todayXp / player.dailyGoal) * 100)}%` }}
              />
            </span>
          </motion.button>
        )}
        <motion.button
          data-testid="jump-active"
          whileTap={{ scale: 0.92 }}
          title="Jump to your next lesson"
          aria-label="Jump to your next lesson"
          onClick={() => {
            sfx.tap()
            nextRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }}
          className="grid h-12 w-12 place-items-center rounded-full border-2 border-white bg-[#58cc02] text-2xl font-extrabold leading-none text-white shadow-pop"
        >
          {jumpUp ? '↑' : '↓'}
        </motion.button>
      </div>

      {/* friendly locked-node popup (PLAN 75) */}
      {lockedMsg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-6"
          onClick={() => setLockedMsg(null)}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="card-white w-full max-w-xs text-center"
            data-testid="locked-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-4xl">💪</div>
            <p className="mt-2 font-display text-base font-extrabold leading-snug text-slate-800">{lockedMsg}</p>
            <button className="btn3d btn-green mt-4" onClick={() => setLockedMsg(null)}>
              Got it!
            </button>
          </motion.div>
        </div>
      )}

      {/* 🏆 unit trophy celebration (PLAN 76) — +30 gems, once per unit */}
      {trophy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-6">
          <motion.div
            initial={{ scale: 0.7, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 14 }}
            className="card-white w-full max-w-xs text-center"
          >
            <div className="mx-auto h-24 w-24">
              <Mascot id="sonic" expression="cheer" />
            </div>
            <div className="text-4xl">🏆</div>
            <h2 className="mt-1 font-display text-xl font-extrabold text-slate-800">Unit mastered!</h2>
            <p className="mt-0.5 text-xs font-bold text-slate-500">{trophy.label}</p>
            <p className="mt-2 font-display text-lg font-extrabold text-amber-500">+30 💎</p>
            <button
              className="btn3d btn-green mt-4"
              onClick={() => {
                try {
                  sfx.complete()
                } catch { /* sfx optional */ }
                celebrateUnit(trophy.unitId)
                setTrophy(null)
              }}
            >
              Amazing! 🎉
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}
