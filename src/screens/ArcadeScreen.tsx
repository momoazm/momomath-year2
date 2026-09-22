import { useState } from 'react'
import { motion } from 'framer-motion'
import { ARCADE_GAMES } from '../engine/arcade'
import { usePlayer } from '../engine/store'
import { ArcadeGame } from './ArcadeGame'

export function ArcadeScreen() {
  const arcadeScores = usePlayer((s) => s.arcadeScores)
  const [activeId, setActiveId] = useState<string | null>(null)

  const active = ARCADE_GAMES.find((g) => g.id === activeId)
  if (active) return <ArcadeGame game={active} onExit={() => setActiveId(null)} />

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-28 pt-4">
      <div className="mb-5 text-center">
        <h1 className="font-display text-2xl font-extrabold text-speed-blue">Retro Arcade</h1>
        <p className="font-body text-sm font-bold text-slate-400">
          Quick math games · earn ⚡ XP and set high scores
        </p>
      </div>

      <div className="space-y-4">
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
                <p className="font-display font-extrabold text-slate-800">{g.title}</p>
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
