import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Subject, UnitDef } from '../content/types'
import {
  ACTIVITY_QUESTIONS,
  ACTIVITY_SECONDS_PER_QUESTION,
  activityTheme,
  activityXp,
  buildUnitChallenge,
} from '../engine/unitActivity'
import { correctAnswerText } from '../engine/questionText'
import { QuestionView, type GradeResult } from '../components/QuestionView'
import { Mascot } from '../components/mascots/Mascots'
import { usePlayer } from '../engine/store'
import { sfx } from '../engine/sfx'

/** Duolingo-style per-unit fun activity (PLAN 102-104): a timed challenge of
 *  ACTIVITY_QUESTIONS questions from THAT unit's lessons. The subject theme
 *  makes it feel like that subject's own game; the unit header keeps it tied
 *  to the unit. Records the per-unit best via the store + pays XP/gems. */
export function UnitActivityScreen({
  unit,
  subject,
  onExit,
}: {
  unit: UnitDef
  subject: Subject
  onExit: () => void
}) {
  const theme = activityTheme(subject)
  const recordUnitActivity = usePlayer((s) => s.recordUnitActivity)
  const best = usePlayer((s) => s.unitActivityBest[unit.id] ?? 0)

  const questions = useMemo(() => buildUnitChallenge(unit, Date.now()), [unit])
  const total = Math.min(questions.length, ACTIVITY_QUESTIONS)
  const [qIdx, setQIdx] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [lock, setLock] = useState(false)
  const [reveal, setReveal] = useState<GradeResult | null>(null)
  const [left, setLeft] = useState(ACTIVITY_SECONDS_PER_QUESTION)
  const [reward, setReward] = useState<{ xp: number; gems: number } | null>(null)

  const q = questions[qIdx]
  const finished = reward !== null

  const advanceTo = (nextIdx: number, correctNow: number) => {
    if (nextIdx >= total || nextIdx >= questions.length) {
      const r = recordUnitActivity(unit.id, correctNow, Math.max(total, questions.length))
      sfx.complete()
      setReward(r)
      setCorrect(correctNow)
    } else {
      setQIdx(nextIdx)
      setCorrect(correctNow)
    }
    setReveal(null)
    setLock(false)
    setLeft(ACTIVITY_SECONDS_PER_QUESTION)
  }

  const submit = (ok: boolean, g: GradeResult | null) => {
    if (lock || finished || !q) return
    setLock(true)
    const correctNow = correct + (ok ? 1 : 0)
    try {
      if (ok) sfx.correct()
      else sfx.wrong()
    } catch { /* sfx optional */ }
    if (!ok && g) {
      // wrong: flash the right answer briefly, then move on
      setReveal(g)
      window.setTimeout(() => advanceTo(qIdx + 1, correctNow), 950)
    } else {
      advanceTo(qIdx + 1, correctNow)
    }
  }

  // per-question countdown: timeout counts as wrong and moves on
  useEffect(() => {
    if (finished || lock || !q) return
    const id = window.setInterval(() => {
      setLeft((v) => {
        if (v <= 1) {
          window.clearInterval(id)
          submit(false, null)
          return ACTIVITY_SECONDS_PER_QUESTION
        }
        return v - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIdx, finished, lock, q])

  /* ------------------------------- RESULTS ----------------------------- */
  if (finished) {
    const newBest = correct > best
    return (
      <div className="mx-auto flex h-[100dvh] w-full max-w-xl flex-col items-center justify-center px-5 pb-24" data-testid="activity-results">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 15 }} className="h-36 w-36">
          <Mascot id="sonic" expression={total > 0 && correct >= Math.ceil(total / 2) ? 'cheer' : 'happy'} />
        </motion.div>
        <h2 className="mt-2 font-display text-3xl font-extrabold text-slate-800">
          {correct}/{Math.max(total, 1)} {newBest ? '— new best! 🏆' : ''}
        </h2>
        <p className="mt-1 font-body text-sm font-bold text-slate-500">
          {theme.game} · {unit.icon} {unit.title}
        </p>
        {newBest && best > 0 && (
          <p className="mt-0.5 text-xs font-bold text-slate-400">Beat your best of {best}! 🎉</p>
        )}
        <p className="mt-3 font-display text-xl font-extrabold text-emerald-500" data-testid="activity-rewards">
          +{activityXp(correct)} XP · +{reward?.gems ?? 0} gems
        </p>
        <button
          className="btn3d btn-green mt-5"
          data-testid="activity-back"
          onClick={() => { sfx.tap(); onExit() }}
        >
          Keep going! 🚀
        </button>
      </div>
    )
  }

  if (!q) {
    return (
      <div className="mx-auto flex h-[100dvh] w-full max-w-xl flex-col items-center justify-center px-5">
        <p className="font-display text-lg font-extrabold text-slate-600">No questions in this unit yet!</p>
        <button className="btn3d btn-blue mt-4" onClick={onExit}>Back to path</button>
      </div>
    )
  }

  /* --------------------------------- PLAY ------------------------------ */
  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-xl flex-col px-4 pt-3 pb-6" data-testid="unit-activity">
      <div className={`bg-gradient-to-r ${theme.gradient} -mx-4 -mt-3 px-4 pb-3 pt-3 text-white`}>
        <div className="flex items-center justify-between">
          <button onClick={onExit} className="font-display text-2xl text-white/70 hover:text-white" title="Quit">Quit</button>
          <p className="font-display text-sm font-extrabold" data-testid="activity-title">
            {theme.icon} {theme.game}
          </p>
          <span className={`rounded-full px-2 py-0.5 font-display text-xs font-extrabold ${left <= 4 ? 'bg-red-500 text-white' : 'bg-white/25 text-white'}`} data-testid="activity-timer">
            {left}s
          </span>
        </div>
        <p className="mt-0.5 text-xs font-bold text-white/85">
          {unit.icon} {unit.title} · {qIdx + 1}/{total} · best {best}
        </p>
        <p className="text-[11px] font-bold text-white/70">{theme.tagline}</p>
      </div>

      <div className="mt-3">
        <div className="h-3 overflow-hidden rounded-full bg-slate-200">
          <motion.div
            className="h-full rounded-full bg-emerald-400"
            animate={{ width: `${total > 0 ? (qIdx / total) * 100 : 0}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="card-white mt-3 flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={qIdx}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.18 }}
          >
            {reveal ? (
              <div className="py-6 text-center">
                <p className="font-display text-xl font-extrabold text-rose-500">Not quite!</p>
                <p className="mt-2 font-body text-lg font-bold text-slate-700">
                  The answer was: {reveal.correctAnswer || correctAnswerText(q)}
                </p>
              </div>
            ) : (
              <QuestionView
                q={q}
                disabled={lock}
                onSubmit={(g: GradeResult) => submit(g.correct, g)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
