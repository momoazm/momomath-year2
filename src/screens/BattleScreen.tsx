import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { usePlayer } from '../engine/store'
import {
  GYM_COUNT,
  ROADMAP_GYMS,
  ROADMAP_UNLOCK,
  TOTAL_NODES,
  countCompletedLessons,
  isGymUnlocked,
  type GymDef,
} from '../engine/battle/roadmap'
import { ARCHETYPE_META, CARD_ARCHETYPE } from '../engine/battle/archetypes'
import { CARD_BY_ID } from '../engine/cards'

/** Node state for the roadmap visuals: 🔒 locked / ✨ available / 🏆 cleared. */
type NodeState = 'locked' | 'available' | 'cleared'

function nodeState(gym: GymDef, cleared: Set<number>, completed: number): NodeState {
  if (cleared.has(gym.index)) return 'cleared'
  return isGymUnlocked(gym.index, completed) ? 'available' : 'locked'
}

const STATE_BADGE: Record<NodeState, { icon: string; label: string; cls: string }> = {
  locked: { icon: '🔒', label: 'Locked', cls: 'bg-slate-100 text-slate-400' },
  available: { icon: '✨', label: 'Fight!', cls: 'bg-amber-100 text-amber-600' },
  cleared: { icon: '🏆', label: 'Cleared', cls: 'bg-emerald-100 text-emerald-600' },
}

export function BattleScreen({ onStartGym }: { onStartGym?: (gym: number) => void }) {
  const battleCleared = usePlayer((s) => s.battleCleared)
  const battleTrophies = usePlayer((s) => s.battleTrophies)
  const battleWins = usePlayer((s) => s.battleWins)
  const lessonProgress = usePlayer((s) => s.lessonProgress)
  const [selected, setSelected] = useState<number | null>(null)

  const cleared = useMemo(() => new Set(battleCleared), [battleCleared])
  const completed = useMemo(() => countCompletedLessons(lessonProgress), [lessonProgress])
  const sel = selected != null ? ROADMAP_GYMS.find((g) => g.index === selected) ?? null : null
  const selState = sel ? nodeState(sel, cleared, completed) : null

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-28 pt-4">
      <div className="mb-5 text-center">
        <h1 className="font-display text-2xl font-extrabold text-speed-blue">⚔️ Battle Road</h1>
        <p className="font-body text-sm font-bold text-slate-400">
          3v3 card battles · clear villain gyms · earn trophies
        </p>
      </div>

      {/* Trophy cabinet + stats panel (additive; §13.8 #6) */}
      <section className="card-white mb-5 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-wide text-amber-600">Trophy Cabinet</p>
            <p className="font-display text-3xl font-extrabold text-amber-700">🏆 {battleTrophies}</p>
          </div>
          <div className="text-right">
            <p className="font-display text-xs font-bold uppercase tracking-wide text-slate-400">Gyms Cleared</p>
            <p className="font-display text-3xl font-extrabold text-speed-blue">
              {cleared.size}
              <span className="text-slate-300">/{TOTAL_NODES}</span>
            </p>
            <p className="text-[11px] font-bold text-slate-400">{battleWins} wins</p>
          </div>
        </div>
        <p className="mt-2 text-xs font-bold text-slate-500">
          ✨ {completed} non-boss lessons done — finish lessons to unlock more gyms!
        </p>
      </section>

      {/* The roadmap */}
      <ol className="space-y-3">
        {ROADMAP_GYMS.map((g, i) => {
          const st = nodeState(g, cleared, completed)
          const badge = STATE_BADGE[st]
          const arch = CARD_ARCHETYPE[g.bossCardId]
          const meta = arch ? ARCHETYPE_META[arch] : null
          const bossName = CARD_BY_ID[g.bossCardId]?.name ?? g.bossCardId
          return (
            <motion.li
              key={g.index}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: Math.min(i * 0.04, 0.5) }}
            >
              <button
                onClick={() => setSelected(g.index)}
                className={`card-white flex w-full items-center gap-4 text-left transition-transform ${
                  st === 'locked' ? 'opacity-60 grayscale' : 'hover:scale-[1.01]'
                } ${selected === g.index ? 'ring-2 ring-speed-blue' : ''}`}
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-speed-bluelight text-3xl">
                  {badge.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-display font-extrabold text-slate-800">
                    <span className="text-slate-400">#{g.index}</span> {g.name}
                    {g.champion && (
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-purple-600">
                        👑 Champion
                      </span>
                    )}
                  </p>
                  <p className="truncate text-sm font-medium text-slate-500">
                    {st === 'locked'
                      ? `🔒 Finish ${ROADMAP_UNLOCK[g.index]} lessons to unlock`
                      : `${g.villain} · ${bossName}${meta ? ` · ${meta.icon} ${meta.label}` : ''}`}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${badge.cls}`}>
                  {badge.label}
                </span>
              </button>
            </motion.li>
          )
        })}
      </ol>

      {/* Detail sheet for the tapped gym */}
      {sel && selState && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-white mt-5 bg-gradient-to-r from-speed-bluelight/60 to-white"
        >
          <p className="font-display text-lg font-extrabold text-slate-800">
            #{sel.index} · {sel.name}
          </p>
          <p className="text-sm font-medium text-slate-500">
            Boss: <span className="font-bold text-slate-700">{CARD_BY_ID[sel.bossCardId]?.name ?? sel.bossCardId}</span>{' '}
            ({sel.villain})
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-700">
              💎 {sel.gems} gems
            </span>
            <span className="rounded-full bg-speed-bluelight px-3 py-1 text-xs font-extrabold text-speed-blue">
              ⚡ {sel.xp} battle XP
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-600">
              3 enemies
            </span>
          </div>
          {selState === 'available' && (
            <button
              onClick={() => onStartGym?.(sel.index)}
              className="btn-blue mt-4 w-full rounded-2xl py-3 font-display text-sm font-extrabold uppercase tracking-wide transition-transform active:scale-95"
            >
              ⚔️ Start Battle
            </button>
          )}
          {selState === 'locked' && (
            <p className="mt-4 rounded-2xl bg-slate-100 py-3 text-center text-sm font-bold text-slate-500">
              🔒 Finish {ROADMAP_UNLOCK[sel.index]! - completed} more lessons to unlock
            </p>
          )}
          {selState === 'cleared' && (
            <p className="mt-4 rounded-2xl bg-emerald-50 py-3 text-center text-sm font-bold text-emerald-600">
              🏆 Cleared! Replaying is for fun — no extra reward.
            </p>
          )}
        </motion.section>
      )}

      {/* Legend */}
      <p className="mt-6 text-center text-[11px] font-bold text-slate-400">
        🔒 Locked · ✨ Available · 🏆 Cleared · {GYM_COUNT} gyms + champion
      </p>
    </div>
  )
}
