import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { getCurriculum } from '../content/registry'
import { isLessonUnlocked, nextActiveLesson } from '../engine/path'
import { usePlayer } from '../engine/store'
import { CLASSIC_BOOKS } from '../content/english/classic'
import { displayStreak, isStreakActive } from '../engine/gamification'
import { Mascot } from '../components/mascots/Mascots'
import { sfx } from '../engine/sfx'
import type { LessonDef, UnitDef } from '../content/types'

const OFFSETS = [0, 44, 64, 0, -44, -64] // zigzag x-offsets like Duolingo's winding path

/** Explicit roadmap node typing (PLAN 78) — id-suffix fallback stays authoritative. */
export type NodeKind = 'lesson' | 'boss' | 'book' | 'practice' | 'activity'
export const KIND_ICON: Record<NodeKind, string> = { lesson: '⭐', boss: '👑', book: '📖', practice: '🔁', activity: '🎯' }
export function kindFor(l: LessonDef): NodeKind {
  return l.id.endsWith('boss') ? 'boss' : 'lesson'
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
  return u.lessons.every((l) => (progress[l.id]?.bestAccuracy ?? 0) >= 100)
}

export function PathScreen({
  onStartLesson,
  onOpenBook,
  onOpenActivity,
}: {
  onStartLesson: (lessonId: string) => void
  onOpenBook: (bookId: string) => void
  onOpenActivity: (unitId: string) => void
}) {
  const player = usePlayer()
  const celebrateUnit = usePlayer((s) => s.celebrateUnit)
  const nextRef = useRef<HTMLButtonElement | null>(null)
  const [lockedMsg, setLockedMsg] = useState<string | null>(null)
  const [trophy, setTrophy] = useState<{ unitId: string; label: string } | null>(null)
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

  // 🏆 unit trophy celebration (PLAN 76): first time a unit hits 100%, pop the
  // celebration once per unit (+30 gems via celebrateUnit) — existing inline
  // "Unit mastered!" line below stays as-is.
  useEffect(() => {
    if (trophy) return
    for (const u of units) {
      if (unitDone(u, player.lessonProgress) && !player.unitsCelebrated.includes(u.id)) {
        setTrophy({ unitId: u.id, label: `Unit ${u.order} · ${u.icon} ${u.title}` })
        break
      }
    }
  }, [units, player.lessonProgress, player.unitsCelebrated, trophy])

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-28 pt-4">
      {/* daily goal banner */}
      <div className="card-white mb-5 flex items-center gap-3">
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
                {u.book && (
                  <span title={player.booksRead[u.book.id] ? 'Book read!' : 'Unit book'} className="text-xl">
                    📖{player.booksRead[u.book.id] ? '✅' : ''}
                  </span>
                )}
                {done && <span title="Unit complete!" className="text-2xl">🏅</span>}
              </div>
            </motion.header>

            <ol className="flex flex-col items-center gap-8">
              {/* 📖 Book node — a NORMAL roadmap node (same markup as lesson
                  nodes), first in the unit so reading opens each unit. */}
              {u.book && (() => {
                const bookUnlocked = isLessonUnlocked(ui, 0, player.lessonProgress, units)
                const read = !!player.booksRead[u.book.id]
                const offsetBook = OFFSETS[(ui * 3 + u.lessons.length + 2) % OFFSETS.length]
                return (
                  <li style={{ transform: `translateX(${offsetBook}px)` }}>
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
                      <span className="relative rounded-full bg-white p-1.5 shadow-pop">
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
                return (
                  <li key={l.id} style={{ transform: `translateX(${offset}px)` }}>
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
                return (
                  <li key={`${u.id}practice`} style={{ transform: `translateX(${offset}px)` }}>
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
                      <span className="relative rounded-full bg-white p-1.5 shadow-pop">
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
              {/* 🎯 Unit fun-activity node (PLAN 104) — renders like the 🔁
                practice node but opens the subject-themed mini-game for
                THIS unit. Unlocked once any lesson in the unit is tried. */}
              {(() => {
                const anyTried = u.lessons.some(
                  (l) => (player.lessonProgress[l.id]?.completions ?? 0) > 0,
                )
                const offsetA = OFFSETS[(ui * 3 + u.lessons.length + 1) % OFFSETS.length]
                const unitBest = player.unitActivityBest[u.id] ?? 0
                return (
                  <li key={`${u.id}activity`} style={{ transform: `translateX(${offsetA}px)` }}>
                    <button
                      aria-disabled={!anyTried}
                      data-testid="activity-node"
                      className={`gpu group relative flex flex-col items-center transition-transform duration-150 ${
                        anyTried ? 'hover:scale-105 active:scale-95' : 'cursor-not-allowed opacity-70'
                      }`}
                      title={
                        anyTried
                          ? `🎯 Unit challenge${unitBest > 0 ? ` — best ${unitBest}` : ''}`
                          : 'Finish any lesson in this unit to unlock the fun game!'
                      }
                      onClick={() => {
                        if (!anyTried) {
                          sfx.tap()
                          setLockedMsg('Finish any lesson in this unit first to unlock the fun game — you\'ve got this! 💪')
                          return
                        }
                        sfx.whoosh()
                        onOpenActivity(u.id)
                      }}
                    >
                      <span className="relative rounded-full bg-white p-1.5 shadow-pop">
                        {anyTried && unitBest === 0 && (
                          <span className="animate-pulse-ring absolute inset-0 rounded-full border-4 border-violet-400" />
                        )}
                        <span
                          className={`relative flex h-14 w-14 items-center justify-center rounded-full border-b-4 text-xl ${
                            anyTried ? 'border-black/15 text-white' : 'border-black/5 bg-slate-300 text-white'
                          }`}
                          style={
                            anyTried
                              ? { backgroundImage: 'linear-gradient(180deg,#8b5cf6,#7c3aed)' }
                              : undefined
                          }
                        >
                          {anyTried ? KIND_ICON.activity : '🔒'}
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
        Momo Year 2 Cambridge · {subjectLabel} · {lessonCount} lessons
      </footer>

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
