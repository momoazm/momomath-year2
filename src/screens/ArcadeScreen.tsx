import { useState } from 'react'
import { motion } from 'framer-motion'
import { ARCADE_GAMES } from '../engine/arcade'
import { sfx } from '../engine/sfx'
import { usePlayer } from '../engine/store'
import { ArcadeGame } from './ArcadeGame'
import { PixelRun } from '../components/arcade/PixelRun'
import { SprintScreen } from './SprintScreen'

const SUBJECT_BADGE: Record<'math' | 'english' | 'science', { icon: string; label: string; cls: string }> = {
  math: { icon: '🧮', label: 'Maths', cls: 'bg-speed-bluelight text-speed-blue' },
  english: { icon: '📚', label: 'English', cls: 'bg-orange-100 text-orange-600' },
  science: { icon: '🔬', label: 'Science', cls: 'bg-emerald-100 text-emerald-600' },
}

export function ArcadeScreen() {
  const arcadeScores = usePlayer((s) => s.arcadeScores)
  const sprintBest = usePlayer((s) => s.sprintBest)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [sprintOpen, setSprintOpen] = useState(false)

  // Phase 29 / PLAN 142 - Flashcard Sprint launched from the Arcade tab too
  //  (standalone full-screen round, same instance as the PathScreen banner).
  if (sprintOpen) return <SprintScreen onExit={() => setSprintOpen(false)} />

  const active = ARCADE_GAMES.find((g) => g.id === activeId)
  if (active) {
    if (active.id === 'pixel-run') return <PixelRun game={active} onExit={() => setActiveId(null)} />
    return <ArcadeGame game={active} onExit={() => setActiveId(null)} />
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-28 pt-4">
      <div className="mb-5 text-center">
        <h1 className="font-display text-2xl font-extrabold text-slate-800">Retro Arcade</h1>
        <p className="font-body text-sm font-bold text-slate-700">
          Retro games · earn ⚡ XP and set high scores
        </p>
      </div>

      <div className="space-y-4">
        {/* PLAN 142 - Flashcard Sprint tile (bank is english MCQs -> English badge;
            visible from any subject since the Arcade mixes subjects by design) */}
        <motion.button
          data-testid="arcade-sprint-tile"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="card-white flex w-full items-center gap-4 border-l-4 border-l-fuchsia-400 text-left shadow-pop transition-transform active:scale-[0.99]"
          onClick={() => {
            sfx.tap()
            setSprintOpen(true)
          }}
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-fuchsia-100 text-3xl">
            ⚡
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 font-display font-extrabold text-slate-800">
              Flashcard Sprint
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${SUBJECT_BADGE.english.cls}`}
              >
                {SUBJECT_BADGE.english.icon} {SUBJECT_BADGE.english.label}
              </span>
            </p>
            <p className="truncate text-sm font-medium text-slate-500">60 seconds · word rush · earn ⚡ XP</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase text-slate-400">Best</p>
            <p className="font-display font-extrabold text-speed-blue">{sprintBest || '—'}</p>
          </div>
        </motion.button>
        {ARCADE_GAMES.map((g, i) => {
          const best = arcadeScores[g.id] ?? 0
          return (
            <motion.button
              key={g.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="card-white flex w-full items-center gap-4 text-left"
              onClick={() => setActiveId(g.id)}
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-speed-bluelight text-3xl">
                {g.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-display font-extrabold text-slate-800">
                  {g.title}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${SUBJECT_BADGE[g.subject].cls}`}
                  >
                    {SUBJECT_BADGE[g.subject].icon} {SUBJECT_BADGE[g.subject].label}
                  </span>
                </p>
                <p className="truncate text-sm font-medium text-slate-500">{g.desc}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase text-slate-400">Best</p>
                <p className="font-display font-extrabold text-speed-blue">{best || '—'}</p>
              </div>
            </motion.button>
          )
        })}
      </div>

      <section className="card-white mt-6 bg-gradient-to-r from-purple-50 to-fuchsia-50">
        <p className="font-display font-extrabold text-purple-700">Scores feed your daily quests 📜</p>
        <p className="text-xs font-bold text-slate-400">
          Personal bests are saved to the cloud when you're signed in.
        </p>
      </section>
    </div>
  )
}
