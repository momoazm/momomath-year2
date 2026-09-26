import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { getCurriculum } from '../content/registry'
import { QUESTIONS_PER_LESSON } from '../content/curriculum'
import {
  answerBattle,
  battleAccuracy,
  battleKindFor,
  createBattle,
  enemyNameFor,
  type BattleState,
} from '../engine/battle'
import { usePlayer } from '../engine/store'
import { isLessonRedo, crownsEarned } from '../engine/path'
import { rollChest, type ChestContext, type ChestResult } from '../engine/cards'
import { chestGemMultiplier } from '../engine/shop'
import { QuestionView } from '../components/QuestionView'
import { LessonSlideshow } from '../components/lesson/LessonSlideshow'
import { ChestReveal } from '../components/ui/ChestReveal'
import { Mascot } from '../components/mascots/Mascots'
import { enemyArt, playerArt } from '../engine/enemyArt'
import { speakFor, stopSpeaking } from '../engine/tts'
import { sfx } from '../engine/sfx'

export function BattleScreen({
  lessonId,
  epoch = 0,
  onExit,
  onRetry,
  onVictoryContinue,
}: {
  lessonId: string
  epoch?: number
  onExit: () => void
  onRetry: () => void
  onVictoryContinue: () => void
}) {
  const subject = usePlayer((s) => s.subject)
  const mascot = usePlayer((s) => s.mascot)
  const player = usePlayer()
  const completeLesson = usePlayer((s) => s.completeLesson)

  const seedRef = useRef(Math.floor(Math.random() * 1e9))
  const [battle, setBattle] = useState<BattleState | null>(null)
  const [reward, setReward] = useState<{ chest: ChestResult | null; xp: number; redo: boolean; streakBonus: number | null } | null>(null)
  const [showIntro, setShowIntro] = useState(() => battleKindFor(lessonId) === 'boss')
  // guide phase: friendly mascot explanation before Q1 (first attempt only — skip loss-retries)
  const [guideDone, setGuideDone] = useState(epoch > 0)
  const [lockInput, setLockInput] = useState(false)
  const [failedArt, setFailedArt] = useState<string | null>(null)
  const [failedPlayerArt, setFailedPlayerArt] = useState<string | null>(null)
  const [hint, setHint] = useState<string | null>(null)
  const rewardedRef = useRef(false)

  const kind = battleKindFor(lessonId)
  const entry = useMemo(() => getCurriculum(subject).allLessons[lessonId], [subject, lessonId])

  useEffect(() => {
    if (!entry) return
    const st = createBattle(
      {
        kind,
        subject,
        lessonId,
        enemyName: enemyNameFor(kind, lessonId),
        mascotId: mascot,
      },
      seedRef.current,
    )
    setBattle(st)
  }, [entry, kind, subject, lessonId, mascot])

  // auto-play audio prompts once per question
  const q = battle && battle.status === 'active' && !showIntro && guideDone ? battle.questions[battle.index] : undefined
  useEffect(() => {
    if (q && 'audioText' in q && q.audioText) speakFor(subject, q.audioText)
    return () => stopSpeaking()
  }, [q])

  // guide phase content (PLAN 94): the Sonic slideshow teaches it before practice
  const guideLines = entry ? entry.lesson.teach ?? [entry.lesson.intro.body] : []

  // DEV-only hook for e2e QA (never in production builds)
  useEffect(() => {
    if (import.meta.env.DEV) {
      ;(window as unknown as Record<string, unknown>).__mbBattle = battle
    }
  }, [battle])

  useEffect(() => {
    if (battle?.status === 'won' && !rewardedRef.current && battle.cfg) {
      rewardedRef.current = true
      const acc = Math.round(battleAccuracy(battle) * 100)
      const isBoss = battle.cfg.lessonId.endsWith('boss')
      const base = isBoss ? 20 : 10
      const perfect = battle.correct === QUESTIONS_PER_LESSON && battle.wrong === 0
      let gained = base + (perfect ? 5 : 0)
      if (player.doubleXpLessons > 0) {
        gained *= 2
        player.useDoubleXp()
      }

      const redo = isLessonRedo(player.lessonProgress, battle.cfg.lessonId)
      completeLesson({
        lessonId: battle.cfg.lessonId,
        xp: gained,
        correct: battle.correct,
        totalQuestions: battle.correct + battle.wrong,
        crownsGained: crownsEarned(redo, battle.wrong),
        accuracy: acc,
      })

      const streakMilestone = redo ? null : player.consumeStreakChest()
      let chest: ChestResult | null = null
      if (!redo) {
        const ctx: ChestContext = streakMilestone !== null
          ? 'streak'
          : player.consumeLuckyTicket() ? 'lucky' : isBoss ? 'boss' : 'normal'
        const rolled = rollChest(Math.random, ctx, player.cardStars, player.cardPity)
        const finalGems = chestGemMultiplier(player.chestBoost, player.megaChest) * rolled.gems
        if (player.chestBoost) player.useChestBoost()
        if (player.megaChest) player.useMegaChest()
        chest = { ...rolled, gems: finalGems }
        player.grantChest(chest)
      }

      setReward({ chest, xp: gained, redo, streakBonus: streakMilestone })
      try {
        confetti({ particleCount: battle.wrong === 0 ? 120 : 60, spread: 75, origin: { y: 0.7 }, disableForReducedMotion: true })
        sfx.complete()
      } catch { /* confetti optional */ }
    }
  }, [battle, completeLesson, player])

  if (!entry || !battle) {
    return (
      <div className="p-8 text-center font-display font-extrabold text-white">
        Lesson not found: {lessonId}
        <button className="btn3d btn-blue mt-4" onClick={onExit}>Back</button>
      </div>
    )
  }

  const curQ = battle.questions[battle.index]
  const questionDone = battle.status !== 'active'
  const showQuestion = !showIntro && guideDone && !questionDone && curQ

  const onGrade = (g: { correct: boolean; studentAnswer: string; correctAnswer: string }) => {
    if (lockInput || battle.status !== 'active' || !curQ) return
    setLockInput(true)
    setHint(!g.correct ? (curQ.hint ?? null) : null)
    try {
      if (g.correct) sfx.correct()
      else sfx.wrong()
    } catch { /* sfx optional */ }
    const next = answerBattle(battle, g.correct, !g.correct ? (curQ.hint ?? '') : '')
    setBattle(next)
    window.setTimeout(() => setLockInput(false), next.lastFeedback?.special ? 1400 : 900)
  }

  const enemyPct = (battle.enemyHp / battle.enemyHpMax) * 100
  const playerPct = (battle.playerHp / battle.playerHpMax) * 100
  const enemyEmoji = kind === 'boss' ? '🦹' : '🤖'
  const sonicSrc = playerArt('sonic')
  const fb = battle.lastFeedback
  const introHidden = !showIntro
  const unitColor = entry.unit.color

  const playerAnimate =
    battle.status === 'lost'
      ? { rotate: -70, y: 46, opacity: 0.3, x: 0 }
      : !introHidden || !fb
        ? { x: 0, rotate: 0, y: 0, opacity: 1 }
        : fb.correct
          ? { x: [0, 30, 0], rotate: 0, y: 0, opacity: 1 }
          : { x: [0, -12, 9, -3, 0], rotate: 0, y: 0, opacity: 1 }
  const enemyAnimate =
    battle.status === 'won'
      ? { rotate: 75, y: 56, opacity: 0.3, x: 0 }
      : !introHidden || !fb
        ? { x: 0, rotate: 0, y: 0, opacity: 1 }
        : fb.correct
          ? { x: [0, -16, 10, -4, 0], rotate: 0, y: 0, opacity: 1 }
          : { x: [0, -26, 0], rotate: 0, y: 0, opacity: 1 }
  const motionTransition = { duration: battle.status !== 'active' ? 0.7 : 0.45, ease: 'easeOut' as const }

  if (battle.status === 'won' && reward) {
    return (
      <div className="mx-auto flex h-[100dvh] max-w-xl flex-col items-center justify-center px-6 pb-24">
        <motion.div initial={{ scale: 0.5, rotate: -8, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 14 }}
          className="h-40 w-40 gpu">
          <Mascot id={mascot} expression="cheer" />
        </motion.div>
        <motion.h1 initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}
          className="mt-3 text-center font-display text-4xl font-extrabold text-yellow-500 drop-shadow">
          {kind === 'boss' ? 'BOSS DEFEATED!' : reward.redo ? 'Nice practice!' : battle.wrong === 0 ? 'PERFECT!' : 'Victory!'}
        </motion.h1>
        <p className="mt-1 text-center font-body text-sm font-bold text-slate-700">
          {reward.redo
            ? 'Replays earn XP — clear a fresh lesson for stars and chests!'
            : battle.wrong === 0
              ? 'Flawless run — every answer right!'
              : `Accuracy ${Math.round(battleAccuracy(battle) * 100)}% · best streak ${battle.bestStreak}`}
        </p>
        <ChestReveal
          chestResult={reward.chest}
          xpEarned={reward.xp}
          streakBonus={reward.streakBonus}
          isRedo={reward.redo}
          onContinue={onVictoryContinue}
        />
      </div>
    )
  }

  if (battle.status === 'lost') {
    return (
      <div className="mx-auto flex h-[100dvh] max-w-xl flex-col items-center justify-center px-6 pb-24">
        <div className="text-6xl">💨</div>
        <h2 className="mt-3 font-display text-2xl font-extrabold text-slate-800">Out of breath… for now!</h2>
        <p className="mt-1 text-center font-body text-sm font-bold text-slate-500">
          No penalty — free retry. You keep everything you've earned.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            className="btn3d btn-green"
            onClick={() => {
              rewardedRef.current = false
              setReward(null)
              setHint(null)
              onRetry()
            }}
          >
            Retry battle
          </button>
          <button className="btn3d btn-blue" onClick={onExit}>
            Back to path
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 pt-3 pb-8">
      <div className="flex items-center justify-between">
        <button className="btn3d btn-blue !px-3 !py-1 !text-sm" onClick={onExit}>
          ✕ Flee
        </button>
        <span className="rounded-xl bg-white/80 px-2 py-1 text-xs font-extrabold text-slate-600">
          {kind === 'boss' ? '👑 BOSS' : '⚔ Battle'} · Q {Math.min(battle.index + 1, battle.questions.length)}/{battle.questions.length}
        </span>
      </div>

      <div className="relative mt-3 overflow-hidden rounded-3xl border-4 border-white/60 p-4" style={{ background: `linear-gradient(160deg, ${unitColor} 0%, #0b1020 130%)` }}>
        <div className="flex items-end justify-between gap-2">
          <div className="w-1/2 text-left">
            <motion.div
              key={`pl${battle.index}`}
              initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
              animate={playerAnimate}
              transition={motionTransition}
              className="relative inline-block"
            >
              <div className="animate-bob">
                {mascot === 'sonic' && sonicSrc && failedPlayerArt !== sonicSrc ? (
                  <img
                    src={sonicSrc}
                    alt="Sonic"
                    className="h-24 w-24 object-contain drop-shadow-[0_6px_0_rgba(0,0,0,0.45)]"
                    onError={() => setFailedPlayerArt(sonicSrc)}
                  />
                ) : (
                  <div className="h-24 w-24">
                    <Mascot id={mascot} expression={fb?.correct ? 'excited' : 'thinking'} />
                  </div>
                )}
              </div>
            </motion.div>
            <p className="font-display text-sm font-extrabold text-white">{player.name || 'You'}</p>
            <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-black/40">
              <div className="h-full bg-emerald-400 transition-all" style={{ width: `${playerPct}%` }} />
            </div>
            <p className="text-[10px] font-bold text-white/80">{battle.playerHp}/{battle.playerHpMax} HP</p>
            <div className="mt-1 flex gap-0.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} className={`h-2 w-6 rounded ${i < battle.charge ? 'bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.9)]' : 'bg-white/40 ring-1 ring-white/20'}`} />
              ))}
            </div>
            <p className="mt-0.5 inline-block rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-bold text-amber-200">⚡ charge {battle.charge}/3 (special at 3)</p>
          </div>
          <motion.div
            key={`en${battle.index}`}
            initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
            animate={enemyAnimate}
            transition={motionTransition}
            className="text-center"
          >
            <div className="animate-bob" style={{ animationDelay: '0.35s' }}>
              {(() => {
                const art = enemyArt(battle.cfg.enemyName)
                return art && failedArt !== art ? (
                  <img
                    src={art}
                    alt={battle.cfg.enemyName}
                    className="mx-auto h-24 w-24 object-contain drop-shadow-[0_6px_0_rgba(0,0,0,0.45)]"
                    onError={() => setFailedArt(art)}
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center text-6xl">{enemyEmoji}</div>
                )
              })()}
            </div>
            <p className="font-display text-sm font-extrabold text-white">{battle.cfg.enemyName}</p>
            <div className="mt-1 h-3 w-32 overflow-hidden rounded-full bg-black/40">
              <div className="h-full bg-red-400 transition-all" style={{ width: `${enemyPct}%` }} />
            </div>
            <p className="text-[10px] font-bold text-white/80">{battle.enemyHp}/{battle.enemyHpMax} HP</p>
          </motion.div>
        </div>

        {battle.lastFeedback && battle.status === 'active' && !showIntro && guideDone && (
          <motion.p
            key={battle.index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-2 rounded-xl px-3 py-2 text-center text-sm font-extrabold ${
              battle.lastFeedback.correct ? 'bg-emerald-500/30 text-emerald-100' : 'bg-red-500/30 text-red-100'
            }`}
          >
            {battle.lastFeedback.message}
          </motion.p>
        )}
        {!battle.lastFeedback?.correct && hint && !lockInput && battle.status === 'active' && !showIntro && guideDone && (
          <p className="mt-2 rounded-xl bg-sky-500/25 px-3 py-2 text-center text-xs font-bold text-sky-100">
            💡 {hint}
          </p>
        )}
      </div>

      {!guideDone && (
        <LessonSlideshow
          lesson={entry.lesson}
          title={entry.lesson.intro.title}
          lines={guideLines}
          objectives={entry.lesson.objectiveCodes}
          onDone={() => setGuideDone(true)}
        />
      )}

      {showIntro && guideDone && (
        <div className="card-white mt-4 text-center">
          <p className="font-display text-xs font-extrabold uppercase tracking-widest text-red-500">⚠ Boss time</p>
          <h2 className="font-display text-xl font-extrabold text-slate-800">
            {battle.cfg.enemyName} blocks the way!
          </h2>
          <p className="mt-1 text-sm font-bold text-slate-500">
            Keep fighting until his HP hits 0 — win to claim the chest and crown!
          </p>
          <button className="btn3d btn-green mt-4" onClick={() => { sfx.tap(); setShowIntro(false) }}>
            Fight!
          </button>
        </div>
      )}

      {showQuestion && (
        <div className="card-white mt-4">
          <QuestionView key={battle.index} q={curQ} disabled={lockInput} onSubmit={onGrade} />
        </div>
      )}

      <div className="mt-3 flex justify-center">
        <Mascot id={mascot} expression={battle.lastFeedback?.correct ? 'excited' : 'thinking'} className="h-14 w-14" />
      </div>
    </div>
  )
}
