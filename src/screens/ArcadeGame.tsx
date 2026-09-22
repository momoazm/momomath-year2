import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { ArcadeGameDef } from '../engine/arcade'
import { usePlayer } from '../engine/store'
import { sfx } from '../engine/sfx'

// Simple kid-safe arithmetic generator (year 2 level) for arcade rounds.
type Q = { text: string; answer: number; options: number[] }

function makeQuestion(rand: () => number = Math.random): Q {
  const ops = ['+', '-', '×'] as const
  const op = ops[Math.floor(rand() * ops.length)]
  let a: number, b: number, answer: number
  if (op === '+') {
    a = 1 + Math.floor(rand() * 40)
    b = 1 + Math.floor(rand() * 40)
    answer = a + b
  } else if (op === '-') {
    a = 10 + Math.floor(rand() * 40)
    b = 1 + Math.floor(rand() * Math.min(a - 1, 30))
    answer = a - b
  } else {
    a = 2 + Math.floor(rand() * 9)
    b = 2 + Math.floor(rand() * 9)
    answer = a * b
  }
  const options = new Set<number>([answer])
  let guard = 0
  while (options.size < 4 && guard++ < 40) {
    const delta = Math.floor(rand() * 11) - 5
    const candidate = answer + (delta === 0 ? 3 : delta)
    if (candidate >= 0) options.add(candidate)
  }
  while (options.size < 4) options.add(answer + options.size + 1)
  const shuffled = [...options].sort(() => rand() - 0.5)
  return { text: `${a} ${op} ${b}`, answer, options: shuffled }
}

const ROUND_SECONDS = 60
const FUSE_MS = 6000 // number-blaster: escape window per question

export function ArcadeGame({ game, onExit }: { game: ArcadeGameDef; onExit: () => void }) {
  const [phase, setPhase] = useState<'ready' | 'play' | 'over'>('ready')
  const [q, setQ] = useState<Q>(() => makeQuestion())
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [bossHp, setBossHp] = useState(3)
  const [bossesDown, setBossesDown] = useState(0)
  const [lives, setLives] = useState(3)
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [flash, setFlash] = useState<'ok' | 'no' | null>(null)
  const [fuse, setFuse] = useState(FUSE_MS)
  const [rewards, setRewards] = useState({ xp: 0, gems: 0 })
  const best = usePlayer((s) => s.arcadeScores[game.id] ?? 0)
  const submitted = useRef(false)
  const fuseSpent = useRef(false)

  const isBoss = game.id === 'boss-rush'
  const finalScore = isBoss ? bossesDown * 100 : score

  const finish = useCallback(() => {
    if (submitted.current) return
    submitted.current = true
    setPhase('over')
    const st = usePlayer.getState()
    st.submitArcadeScore(game.id, finalScore)
    const xp = finalScore > 0 ? Math.min(30, Math.max(5, Math.round(finalScore / 10))) : 0
    const gems = finalScore > 0 ? Math.min(20, Math.max(2, Math.round(finalScore / 20))) : 0
    if (finalScore > 0) {
      st.addGems(gems)
      st.addArcadeCorrect(Math.min(finalScore, 100))
      st.addArcadeXp(xp)
    }
    setRewards({ xp, gems })
    sfx.leagueUp()
  }, [finalScore, game.id])

  const nextQuestion = useCallback(() => {
    setQ(makeQuestion())
    setFuse(FUSE_MS)
    fuseSpent.current = false
  }, [])

  // Fresh timeout closure every render (reads current lives/phase/finish).
  const onFuseOut = useRef<() => void>(() => {})
  onFuseOut.current = () => {
    if (phase !== 'play') return
    sfx.wrong()
    setFlash('no')
    setCombo(0)
    nextQuestion()
    const nl = lives - 1
    if (nl <= 0) {
      setLives(0)
      setTimeout(() => finish(), 200)
    } else {
      setLives(nl)
    }
    setTimeout(() => setFlash(null), 150)
  }

  // Per-question fuse: counts down, then the number escapes (lose a life).
  useEffect(() => {
    if (phase !== 'play' || game.id !== 'number-blaster') return
    const t = setInterval(() => setFuse((f) => Math.max(0, f - 100)), 100)
    return () => clearInterval(t)
  }, [phase, game.id])

  useEffect(() => {
    if (phase !== 'play' || game.id !== 'number-blaster' || fuse > 0) return
    if (fuseSpent.current) return
    fuseSpent.current = true
    onFuseOut.current()
  }, [fuse, phase, game.id])

  useEffect(() => {
    if (phase !== 'play') return
    const t = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(t)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [phase])

  useEffect(() => {
    if (phase === 'play' && timeLeft === 0) finish()
  }, [phase, timeLeft, finish])

  const start = () => {
    submitted.current = false
    setScore(0)
    setCombo(0)
    setBossHp(3)
    setBossesDown(0)
    setLives(3)
    setTimeLeft(ROUND_SECONDS)
    nextQuestion()
    setPhase('play')
    sfx.tap()
  }

  const answer = (opt: number) => {
    if (phase !== 'play') return
    const correct = opt === q.answer
    if (correct) {
      sfx.correct()
      setFlash('ok')
      setCombo((c) => c + 1)
      if (isBoss) {
        const nextHp = bossHp - 1
        if (nextHp <= 0) {
          setBossesDown((b) => b + 1)
          setBossHp(3)
        } else {
          setBossHp(nextHp)
        }
      } else {
        setScore((s) => s + 10 + combo * 2)
      }
      nextQuestion()
    } else {
      sfx.wrong()
      setFlash('no')
      setCombo(0)
      if (game.id === 'math-run') {
        setTimeLeft((t) => Math.max(0, t - 5))
      } else if (game.id === 'number-blaster') {
        const nl = lives - 1
        if (nl <= 0) {
          setLives(0)
          setTimeout(() => finish(), 200)
          return
        }
        setLives(nl)
      } else if (lives <= 1) {
        // boss-rush: 3 wrong ends the run
        setLives(0)
        setTimeout(() => finish(), 200)
        return
      } else {
        setLives(lives - 1)
      }
      nextQuestion()
    }
    setTimeout(() => setFlash(null), 150)
  }

  const shownScore = isBoss ? bossesDown * 100 : score
  const isPb = phase === 'over' && finalScore > best

  if (phase === 'ready') {
    return (
      <div className="mx-auto w-full max-w-xl px-4 pb-28 pt-8 text-center">
        <div className="text-6xl">{game.icon}</div>
        <h2 className="mt-3 font-display text-2xl font-extrabold text-speed-blue">{game.title}</h2>
        <p className="mt-1 font-body text-sm font-bold text-slate-400">{game.desc}</p>
        <div className="card-white mx-auto mt-6 max-w-sm text-left text-sm font-bold text-slate-500">
          <p>⏱ {ROUND_SECONDS}s round</p>
          <p>
            {isBoss
              ? '⚔️ 3 correct answers defeat a boss — how many can you clear?'
              : game.id === 'math-run'
                ? '🏃 Wrong answers cost 5s — streak for combo bonus!'
                : '🔫 3 lives · 6s per answer — numbers escape when time runs out!'}
          </p>
          <p>🏆 Personal best: {best || '—'}</p>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <button className="btn3d btn-green !px-8" onClick={start}>▶ Play</button>
          <button className="btn3d btn-grey !px-6" onClick={onExit}>← Back</button>
        </div>
      </div>
    )
  }

  if (phase === 'over') {
    return (
      <div className="mx-auto w-full max-w-xl px-4 pb-28 pt-8 text-center">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="text-6xl">{finalScore > 0 ? '🎉' : '😅'}</div>
          <h2 className="mt-3 font-display text-2xl font-extrabold text-speed-blue">Time's up!</h2>
          <p className="mt-2 font-display text-4xl font-extrabold text-emerald-500">{finalScore}</p>
          {rewards.xp + rewards.gems > 0 && (
            <p className="mt-1 font-display font-extrabold text-sky-500">
              ⚡ +{rewards.xp} XP · 💎 +{rewards.gems}
            </p>
          )}
          {isPb && <p className="mt-1 font-display font-bold text-amber-500">⭐ NEW PERSONAL BEST!</p>}
          <p className="mt-1 text-sm font-bold text-slate-400">Previous best: {best || '—'}</p>
        </motion.div>
        <div className="mt-6 flex justify-center gap-3">
          <button className="btn3d btn-green !px-8" onClick={start}>↻ Play again</button>
          <button className="btn3d btn-grey !px-6" onClick={onExit}>← Back</button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-28 pt-4">
      <div className="mb-4 flex items-center justify-between font-display font-extrabold">
        <span className="rounded-xl bg-speed-bluelight px-3 py-1 text-speed-blue">🏆 {shownScore}</span>
        <span className={`rounded-xl px-3 py-1 ${timeLeft <= 10 ? 'bg-red-100 text-red-500' : 'bg-slate-100 text-slate-600'}`}>
          ⏱ {timeLeft}s
        </span>
        <span className="rounded-xl bg-amber-100 px-3 py-1 text-amber-600">🔥 {combo}</span>
      </div>

      {!isBoss && game.id === 'number-blaster' && (
        <div className="mb-3 text-center font-display font-extrabold text-red-400">
          ❤️ {'❤️'.repeat(lives)}{'🤍'.repeat(Math.max(0, 3 - lives))}
        </div>
      )}

      {isBoss && (
        <div className="mb-4 rounded-2xl border-2 border-red-200 bg-red-50 p-3 text-center">
          <p className="font-display text-sm font-extrabold text-red-500">👹 Boss HP: {'❤️'.repeat(bossHp)}{'🖤'.repeat(3 - bossHp)}</p>
          <p className="text-xs font-bold text-slate-400">Bosses defeated: {bossesDown} · Lives: {'❤️'.repeat(lives)}</p>
        </div>
      )}

      <div
        className={`card-white py-8 text-center transition-colors ${
          flash === 'ok' ? '!bg-emerald-50' : flash === 'no' ? '!bg-red-50' : ''
        }`}
      >
        <p className="text-sm font-bold uppercase tracking-wide text-slate-400">What is</p>
        <p className="mt-1 font-display text-5xl font-extrabold text-slate-800">{q.text} = ?</p>
      </div>

      {game.id === 'number-blaster' && (
        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-label="Answer time left"
          aria-valuemin={0}
          aria-valuemax={FUSE_MS}
          aria-valuenow={fuse}
        >
          <div
            className={`h-full rounded-full transition-[width] duration-100 ease-linear ${
              fuse / FUSE_MS < 0.3 ? 'bg-red-400' : 'bg-emerald-400'
            }`}
            style={{ width: `${(fuse / FUSE_MS) * 100}%` }}
          />
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3">
        {q.options.map((opt) => (
          <button
            key={opt}
            onClick={() => answer(opt)}
            className="btn3d btn-green !py-4 !text-2xl font-display font-extrabold"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
