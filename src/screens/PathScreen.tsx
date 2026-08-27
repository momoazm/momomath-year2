import { useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { getCurriculum } from '../content/registry'
import { isLessonUnlocked, nextActiveLesson } from '../engine/path'
import { usePlayer } from '../engine/store'
import { Mascot } from '../components/mascots/Mascots'
import { sfx } from '../engine/sfx'
import type { LessonDef, UnitDef } from '../content/types'

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

export function PathScreen({ onStartLesson }: { onStartLesson: (lessonId: string) => void }) {
  const player = usePlayer()
  const nextRef = useRef<HTMLButtonElement | null>(null)
  const { units, lessonCount, subjectLabel } = useMemo(() => {
    const c = getCurriculum(player.subject)
    return {
      units: c.units,
      lessonCount: Object.keys(c.allLessons).length,
      subjectLabel: player.subject === 'english' ? 'English' : 'Maths',
    }
  }, [player.subject])

  // pulse the first lesson that is unlocked and not yet mastered — never a
  // locked node, so finishing lesson 6 below 100% keeps lesson 6 active
  // (replay) until the boss unlocks
  const active = useMemo(
    () => nextActiveLesson(player.lessonProgress, units),
    [player.lessonProgress, units],
  )

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-28 pt-4">
      {/* daily goal banner */}
      <div className="card-white mb-5 flex items-center gap-3">
        <div className="h-12 w-12 shrink-0">
          <Mascot id={player.mascot} expression="happy" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-bold text-slate-500">
            Daily goal · <span className="text-orange-500">🔥 streak day {player.streakCurrent || 'new!'}</span>
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
