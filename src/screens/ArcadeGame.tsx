import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { ArcadeGameDef } from '../engine/arcade'
import { finishArcadeRound } from '../engine/arcadeRound'
import { usePlayer } from '../engine/store'
import { ARCADE_CARD_BY_ID, ARCADE_CARD_GOALS, cardImageUrl } from '../engine/cards'
import { sfx } from '../engine/sfx'
import { rollWordQuestion } from '../content/arcadeWords'
import { rollLabQuestion } from '../content/arcadeScience'
import { makeMathQuestion, type ArcadeQ } from '../content/arcadeMath'
import { PixelBoss } from '../components/arcade/PixelBoss'

type Q = ArcadeQ

function makeQuestion(gameId: string, rand: () => number = Math.random): Q {
  if (gameId === 'word-rescue') {
    const r = rollWordQuestion(rand)
    return { text: r.text, answer: r.answer, options: r.options }
  }
  if (gameId === 'lab-blitz') {
    const r = rollLabQuestion(rand)
    return { text: `${r.emoji} ${r.text}`, answer: r.answer, options: r.options }
  }
  return makeMathQuestion(rand)
}

const ROUND_SECONDS = 60

export function ArcadeGame({ game, onExit }: { game: ArcadeGameDef; onExit: () => void }) {
  const [phase, setPhase] = useState<'ready' | 'play' | 'over'>('ready')
  const [q, setQ] = useState<Q>(() => makeQuestion(game.id))
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [bossHp, setBossHp] = useState(3)
  const [bossesDown, setBossesDown] = useState(0)
  const [bossAnim, setBossAnim] = useState<'idle' | 'hurt' | 'defeated'>('idle')
  const [bossRound, setBossRound] = useState(0) // increments per defeated boss → hue variant
  const [lives, setLives] = useState(3)
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [flash, setFlash] = useState<'ok' | 'no' | null>(null)
  const [rewards, setRewards] = useState({ xp: 0, gems: 0 })
  const [unlockedCard, setUnlockedCard] = useState<string | null>(null)
  const best = usePlayer((s) => s.arcadeScores[game.id] ?? 0)
  const submitted = useRef(false)

  const isBoss = game.id === 'boss-rush'
  const isWords = game.id === 'word-rescue'
  const finalScore = isBoss ? bossesDown * 100 : score

  const finish = useCallback(() => {
    if (submitted.current) return
    submitted.current = true
    setPhase('over')
    const { xp, gems, granted } = finishArcadeRound(game.id, finalScore, isBoss ? bossesDown : 0)
    setRewards({ xp, gems })
    setUnlockedCard(granted[0] ?? null)
    if (granted.length > 0) sfx.streak()
    sfx.leagueUp()
  }, [finalScore, game.id, isBoss, bossesDown])

  const nextQuestion = useCallback(() => {
    setQ(makeQuestion(game.id))
  }, [game.id])

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
    setBossAnim('idle')
    setBossRound(0)
    setLives(3)
    setTimeLeft(ROUND_SECONDS)
    setUnlockedCard(null)
    nextQuestion()
    setPhase('play')
    sfx.tap()
  }

  const answer = (opt: string) => {
    if (phase !== 'play') return
    const correct = opt === q.answer
    if (correct) {
      sfx.correct()
      setFlash('ok')
      setCombo((c) => c + 1)
      if (isBoss) {
        const nextHp = bossHp - 1
        if (nextHp <= 0) {
          // Boss lost: defeated animation, then the next boss spawns.
          setBossAnim('defeated')
          setBossesDown((b) => b + 1)
          setTimeout(() => {
            setBossRound((r) => r + 1)
            setBossHp(3)
            setBossAnim('idle')
          }, 650)
        } else {
          setBossHp(nextHp)
          setBossAnim('hurt')
          setTimeout(() => setBossAnim('idle'), 320)
        }
      } else {
        setScore((s) => s + 10 + combo * 2)
      }
      nextQuestion()
    } else {
      sfx.wrong()
      setFlash('no')
      setCombo(0)
      const nl = lives - 1
      if (nl <= 0) {
        setLives(0)
        nextQuestion()
        setTimeout(() => finish(), 200)
        setTimeout(() => setFlash(null), 150)
        return
      }
      setLives(nl)
      nextQuestion()
      setTimeout(() => setFlash(null), 150)
    }
  }

  const shownScore = isBoss ? bossesDown * 100 : score
  const isPb = phase === 'over' && finalScore > best
  const unlockedDef = unlockedCard ? ARCADE_CARD_BY_ID[unlockedCard] : null
  const unlockedGoal = unlockedCard ? ARCADE_CARD_GOALS[unlockedCard] : null

  if (phase === 'ready') {
    return (
      <div className="mx-auto w-full max-w-xl px-4 pb-28 pt-8 text-center">
        <div className="text-6xl">{game.icon}</div>
        <h2 className="mt-3 font-display text-2xl font-extrabold text-slate-800">{game.title}</h2>
        <p className="mt-1 font-body text-sm font-bold text-slate-700">{game.desc}</p>
        <div className="card-white mx-auto mt-6 max-w-sm text-left text-sm font-bold text-slate-500">
          <p>⏱ {ROUND_SECONDS}s round</p>
          <p>
            {isBoss
              ? '⚔️ 3 correct answers defeat a pixel boss — how many can you clear?'
              : isWords
                ? '📚 3 lives — pick the word that is spelled right!'
                : '🔬 3 lives — answer fast science questions!'}
          </p>
          <p>🏆 Personal best: {best || '—'}</p>
          <p className="mt-1 text-xs font-bold text-slate-400">🕹️ Rounds feed exclusive card unlocks</p>
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
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="card-white mx-auto mt-3 max-w-xs text-center">
          <div className="text-6xl">{finalScore > 0 ? '🎉' : '😅'}</div>
          <h2 className="mt-3 font-display text-2xl font-extrabold text-slate-800">Time's up!</h2>
          <p className="mt-2 font-display text-4xl font-extrabold text-emerald-600">{finalScore}</p>
          {rewards.xp + rewards.gems > 0 && (
            <p className="mt-1 font-display font-extrabold text-sky-600">
              ⚡ +{rewards.xp} XP · 💎 +{rewards.gems}
            </p>
          )}
          {isPb && <p className="mt-1 font-display font-bold text-amber-600">⭐ NEW PERSONAL BEST!</p>}
          <p className="mt-1 text-sm font-bold text-slate-500">Previous best: {best || '—'}</p>
        </motion.div>

        {unlockedDef && (
          <motion.div
            initial={{ scale: 0, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.35, type: 'spring', stiffness: 200, damping: 12 }}
            className="card-white mx-auto mt-4 max-w-xs border-2 border-amber-300 bg-gradient-to-b from-amber-50 to-white"
          >
            <p className="font-display text-sm font-extrabold uppercase tracking-wide text-amber-600">
              🕹️ Exclusive card unlocked!
            </p>
            <img src={cardImageUrl(unlockedDef)} alt={unlockedDef.name} className="mx-auto mt-2 h-28" />
            <p className="font-display text-lg font-extrabold text-slate-800">{unlockedDef.name}</p>
            <p className="text-xs font-bold text-slate-500">{unlockedDef.flavor}</p>
            {unlockedGoal && (
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-amber-500">
                {unlockedGoal.label.replace('{n}', String(unlockedGoal.goal))}
              </p>
            )}
          </motion.div>
        )}

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

      {!isBoss && (
        <div className="mb-3 text-center font-display font-extrabold text-red-400">
          ❤️ {'❤️'.repeat(lives)}{'🤍'.repeat(Math.max(0, 3 - lives))}
        </div>
      )}

      {isBoss && (
        <div className="mb-4 rounded-2xl border-2 border-red-200 bg-red-50 p-3 text-center">
          <PixelBoss phase={bossAnim} variant={bossRound} hp={bossHp} maxHp={3} />
          <p className="mt-1 font-display text-sm font-extrabold text-red-500">
            Boss HP: {'❤️'.repeat(bossHp)}{'🖤'.repeat(Math.max(0, 3 - bossHp))}
          </p>
          <p className="text-xs font-bold text-slate-400">
            Bosses defeated: {bossesDown} · Lives: {'❤️'.repeat(lives)}
          </p>
        </div>
      )}

      <div
        className={`card-white py-8 text-center transition-colors ${
          flash === 'ok' ? '!bg-emerald-50' : flash === 'no' ? '!bg-red-50' : ''
        }`}
      >
        <p className="text-sm font-bold uppercase tracking-wide text-slate-400">
          {isBoss ? 'What is' : isWords ? 'Which is spelled right?' : 'Science question'}
        </p>
        <p className={`mt-1 font-display font-extrabold text-slate-800 ${isBoss ? 'text-5xl' : 'text-2xl'}`}>
          {isBoss ? `${q.text} = ?` : q.text}
        </p>
      </div>

      <div className={`mt-5 grid gap-3 ${isBoss ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {q.options.map((opt) => (
          <button
            key={opt}
            onClick={() => answer(opt)}
            className={`btn3d btn-green font-display font-extrabold ${
              isBoss ? '!py-4 !text-2xl' : '!py-3 !text-base'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
