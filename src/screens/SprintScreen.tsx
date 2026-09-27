import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { sfx } from '../engine/sfx'
import { usePlayer } from '../engine/store'
import {
  SPRINT_FEEDBACK_MS,
  SPRINT_MS,
  applySprintAnswer,
  buildSprintBank,
  initialSprintRun,
  isNewSprintBest,
  sprintAccuracy,
  sprintDeck,
  sprintRemainingMs,
  sprintXpFor,
  type SprintCard,
  type SprintRunState,
} from '../engine/sprint'

/**
 * WS16 — Flashcard Sprint. A STANDALONE screen (not a LessonScreen mode):
 * 60 seconds of rapid-fire MCQs drawn from the existing English banks.
 * Correct = +1 score & streak extends; wrong = streak resets; the round always
 * moves on. XP is paid XP-only through recordPractice (no crowns, no chests);
 * sprintBest / sprintRuns persist via finishSprint.
 */
export function SprintScreen({ onExit }: { onExit: () => void }) {
  const player = usePlayer()
  const bank = useMemo(() => buildSprintBank(), [])

  const [phase, setPhase] = useState<'intro' | 'playing' | 'done'>('intro')
  const [deck, setDeck] = useState<SprintCard[]>([])
  const [idx, setIdx] = useState(0)
  const [run, setRun] = useState<SprintRunState>(initialSprintRun())
  const [remaining, setRemaining] = useState(SPRINT_MS)
  const [feedback, setFeedback] = useState<{ picked: number; correct: boolean } | null>(null)
  const [newBest, setNewBest] = useState(false)
  const [earnedXp, setEarnedXp] = useState(0)

  const runRef = useRef<SprintRunState>(run)
  const startedAtRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lockRef = useRef(false)
  const finishedRef = useRef(false)

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // Unmount safety: never leave the round interval running behind us.
  useEffect(() => stopTimer, [stopTimer])

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    stopTimer()
    const r = runRef.current
    const prevBest = usePlayer.getState().sprintBest
    const xp = sprintXpFor(r.score)
    // XP-only payout: streak/dailies/calendar go through recordPractice,
    // sprint counters through finishSprint. No crowns, no chests.
    usePlayer.getState().recordPractice({ xp, correct: r.score, totalQuestions: r.answered })
    usePlayer.getState().finishSprint(r.score)
    setEarnedXp(xp)
    setNewBest(isNewSprintBest(r.score, prevBest))
    setPhase('done')
  }, [stopTimer])

  const start = useCallback(() => {
    const seed = (Date.now() & 0xffffffff) || 1
    setDeck(sprintDeck(bank, seed))
    setIdx(0)
    runRef.current = initialSprintRun()
    setRun(runRef.current)
    setFeedback(null)
    setNewBest(false)
    setEarnedXp(0)
    setRemaining(SPRINT_MS)
    lockRef.current = false
    finishedRef.current = false
    startedAtRef.current = Date.now()
    setPhase('playing')
    stopTimer()
    timerRef.current = setInterval(() => {
      const left = sprintRemainingMs(startedAtRef.current, Date.now())
      setRemaining(left)
      if (left <= 0) finish()
    }, 100)
  }, [bank, finish, stopTimer])

  const answer = useCallback(
    (choice: number) => {
      if (phase !== 'playing' || lockRef.current || finishedRef.current) return
      const card = deck[idx]
      if (!card || sprintRemainingMs(startedAtRef.current, Date.now()) <= 0) return
      lockRef.current = true
      sfx.tap()
      const correct = choice === card.answerIndex
      runRef.current = applySprintAnswer(runRef.current, correct)
      setRun(runRef.current)
      setFeedback({ picked: choice, correct })
      setTimeout(() => {
        lockRef.current = false
        setFeedback(null)
        if (sprintRemainingMs(startedAtRef.current, Date.now()) <= 0) {
          finish()
          return
        }
        setIdx((i) => {
          if (i + 1 < deck.length) return i + 1
          // Deck exhausted (very long sprint) → reshuffle a fresh pass.
          setDeck(sprintDeck(bank, ((Date.now() & 0xffffffff) || 1) + i))
          return 0
        })
      }, SPRINT_FEEDBACK_MS)
    },
    [bank, deck, finish, idx, phase],
  )

  const card = phase === 'playing' ? deck[idx] : undefined
  const secondsLeft = Math.ceil(remaining / 1000)
  const barPct = Math.max(0, Math.min(100, (remaining / SPRINT_MS) * 100))

  /* ------------------------------- intro ------------------------------- */
  if (phase === 'intro') {
    return (
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-xl flex-col px-4 pb-10 pt-6">
        <button onClick={() => { sfx.tap(); onExit() }}
          className="self-start font-display text-sm font-bold text-slate-400 hover:text-slate-600">
          ‹ Back
        </button>
        <div className="mt-6 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-fuchsia-100 text-5xl">💨</div>
          <h1 className="mt-4 font-display text-3xl font-extrabold">Flashcard Sprint</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">English · 60 seconds of word power!</p>
        </div>
        <div className="card-white mt-6 space-y-2 text-sm font-semibold text-slate-600">
          <p>⏱️ You get <b>60 seconds</b>.</p>
          <p>⚡ Tap the RIGHT word as fast as you can — every correct answer is <b>+1 score</b>.</p>
          <p>🔥 Keep a streak alive by answering correctly in a row.</p>
          <p>🌟 Score earns XP — no crowns needed, just speed!</p>
        </div>
        <div className="card-white mt-4 flex items-center justify-between">
          <span className="font-display text-sm font-bold uppercase tracking-wide text-slate-400">Your best</span>
          <span className="font-display text-2xl font-extrabold">{player.sprintBest}</span>
        </div>
        <button onClick={() => { sfx.tap(); start() }} disabled={bank.length === 0}
          className="btn3d btn-green mt-6 w-full !py-4 !text-xl disabled:opacity-50">
          {bank.length === 0 ? 'No words yet' : 'Start sprint 🚀'}
        </button>
      </div>
    )
  }

  /* -------------------------------- done -------------------------------- */
  if (phase === 'done') {
    const acc = sprintAccuracy(run)
    return (
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-xl flex-col px-4 pb-10 pt-6">
        <div className="mt-10 text-center">
          <p className="font-display text-sm font-bold uppercase tracking-wide text-slate-400">Time&apos;s up!</p>
          <p className="mt-2 font-display text-6xl font-extrabold">{run.score}</p>
          <p className="text-sm font-bold text-slate-400">score</p>
          {newBest && (
            <p className="mt-3 inline-block rounded-full bg-amber-100 px-4 py-1.5 font-display text-lg font-extrabold text-amber-600">
              🏆 NEW BEST!
            </p>
          )}
        </div>
        <div className="card-white mt-6 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="font-display text-lg font-extrabold">🔥 {run.bestStreak}</p>
            <p className="text-xs font-bold text-slate-400">best streak</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="font-display text-lg font-extrabold">{acc === null ? '—' : `${acc}%`}</p>
            <p className="text-xs font-bold text-slate-400">accuracy</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="font-display text-lg font-extrabold">⚡ {earnedXp}</p>
            <p className="text-xs font-bold text-slate-400">XP</p>
          </div>
        </div>
        <div className="card-white mt-4 flex items-center justify-between">
          <span className="font-display text-sm font-bold uppercase tracking-wide text-slate-400">Your best</span>
          <span className="font-display text-2xl font-extrabold">
            {usePlayer.getState().sprintBest}
          </span>
        </div>
        <button onClick={() => { sfx.tap(); start() }}
          className="btn3d btn-green mt-6 w-full !py-4 !text-xl">
          Play again 🔄
        </button>
        <button onClick={() => { sfx.tap(); onExit() }}
          className="btn3d btn-grey mt-3 w-full !py-3 !text-base">
          Back to path
        </button>
      </div>
    )
  }

  /* ------------------------------- playing ------------------------------ */
  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-xl flex-col px-4 pb-10 pt-4">
      <div className="flex items-center gap-3">
        <button onClick={() => { sfx.tap(); finish(); onExit() }} title="Quit sprint"
          className="font-display text-sm font-bold text-slate-400 hover:text-slate-600">
          ✕
        </button>
        <div className="flex-1">
          <div className="h-3.5 w-full overflow-hidden rounded-full border border-slate-200 bg-slate-100">
            <div
              className={`h-full rounded-full transition-[width] duration-100 ease-linear ${barPct <= 20 ? 'bg-red-400' : 'bg-gradient-to-r from-fuchsia-400 to-pink-500'}`}
              style={{ width: `${barPct}%` }}
            />
          </div>
        </div>
        <span className={`w-12 text-right font-display text-lg font-extrabold ${secondsLeft <= 10 ? 'text-red-500' : 'text-slate-700'}`}>
          {secondsLeft}s
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between font-display font-extrabold">
        <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-slate-600">⭐ {run.score}</span>
        <span className={`rounded-xl px-3 py-1.5 ${run.streak > 0 ? 'bg-orange-100 text-orange-500' : 'bg-slate-100 text-slate-400'}`}>
          🔥 {run.streak}
        </span>
      </div>

      {card ? (
        <div className="mt-5">
          <p className="text-center font-display text-sm font-bold uppercase tracking-wide text-slate-400">
            {card.unitTitle}
          </p>
          <div className="card-white mt-3 min-h-32 flex items-center justify-center p-5 text-center">
            <p className="font-display text-2xl font-extrabold leading-snug text-slate-800">{card.prompt}</p>
          </div>
          <div className={`mt-4 grid gap-3 ${card.choices.length === 2 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {card.choices.map((choice, i) => {
              const state =
                feedback === null
                  ? 'idle'
                  : i === feedback.picked
                    ? feedback.correct
                      ? 'right'
                      : 'wrong'
                    : feedback.correct && i === card.answerIndex
                      ? 'right'
                      : 'dim'
              return (
                <button
                  key={`${idx}-${i}`}
                  onClick={() => answer(i)}
                  disabled={feedback !== null}
                  className={`btn3d !py-4 !text-lg text-left transition-colors ${
                    state === 'right'
                      ? 'btn-green'
                      : state === 'wrong'
                        ? 'bg-[#ff4b4b] text-white shadow-[0_4px_0_#ea2b2b]'
                        : state === 'dim'
                          ? 'btn-grey opacity-50'
                          : 'btn-grey'
                  }`}
                >
                  {choice}
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <p className="mt-10 text-center font-display font-bold text-slate-400">Loading words…</p>
      )}
    </div>
  )
}
