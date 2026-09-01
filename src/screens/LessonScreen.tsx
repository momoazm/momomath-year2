import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { QUESTIONS_PER_LESSON } from '../content/curriculum'
import { getCurriculum } from '../content/registry'
import { usePlayer } from '../engine/store'
import { rollChest, CARD_BY_ID, cardImageUrl, KICK_UPGRADE, type ChestContext, type ChestResult, type ChestTier } from '../engine/cards'
import { chestGemMultiplier } from '../engine/shop'
import { speak, speakSlow, stopSpeaking, ttsAvailable } from '../engine/tts'
import { Mascot } from '../components/mascots/Mascots'
import { sfx } from '../engine/sfx'
import { hashString, mulberry32, shuffle } from '../content/rng'
import { layoutMatchColumns } from '../content/matchLayout'
import type {
  LetterTilesQuestion,
  MatchQuestion,
  McqQuestion,
  OrderQuestion,
  Question,
  SpeakQuestion,
  StoryPanel,
  TapCountQuestion,
  TrueFalseQuestion,
  TypeNumberQuestion,
} from '../content/types'

/* ------------------------------ visuals ------------------------------ */

function ClockVisual({ hour, minute }: { hour: number; minute: number }) {
  const minAngle = minute * 6 - 90
  const hourAngle = ((hour % 12) + minute / 60) * 30 - 90
  return (
    <svg viewBox="0 0 120 120" className="mx-auto h-44 w-44 drop-shadow-md">
      <circle cx="60" cy="60" r="56" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
      <circle cx="60" cy="60" r="54" fill="#fff" stroke="#334155" strokeWidth="6" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = ((i + 1) * 30 - 90) * (Math.PI / 180)
        return (
          <circle key={i} cx={60 + 44 * Math.cos(a)} cy={60 + 44 * Math.sin(a)} r={i % 3 === 2 ? 3 : 2} fill={i % 3 === 2 ? '#e11d48' : '#475569'} />
        )
      })}
      <line x1="60" y1="60" x2={60 + 24 * Math.cos((hourAngle * Math.PI) / 180)} y2={60 + 24 * Math.sin((hourAngle * Math.PI) / 180)} stroke="#0f172a" strokeWidth="7" strokeLinecap="round" />
      <line x1="60" y1="60" x2={60 + 38 * Math.cos((minAngle * Math.PI) / 180)} y2={60 + 38 * Math.sin((minAngle * Math.PI) / 180)} stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />
      <circle cx="60" cy="60" r="4" fill="#0f172a" />
      <circle cx="60" cy="60" r="1.6" fill="#fff" />
    </svg>
  )
}

function NumberLineVisual({ from, to, mark }: { from: number; to: number; mark: number }) {
  const W = 320
  const pad = 26
  const step = (W - pad * 2) / (to - from)
  const x = (n: number) => pad + (n - from) * step
  return (
    <div className="mx-auto w-full max-w-sm px-2 py-3">
      <svg viewBox="0 0 320 74" className="w-full">
        <line x1={pad - 10} y1="40" x2={W - pad + 10} y2="40" stroke="#334155" strokeWidth="3.4" strokeLinecap="round" />
        <path d={`M ${W - pad + 10} 40 l -9 -5 v 10 Z`} fill="#334155" />
        {Array.from({ length: to - from + 1 }, (_, i) => {
          const n = from + i
          const active = n === mark
          return (
            <g key={n}>
              <line x1={x(n)} y1={active ? 30 : 34} x2={x(n)} y2="46" stroke={active ? '#e11d48' : '#64748b'} strokeWidth={active ? 4 : 2.6} strokeLinecap="round" />
              <text x={x(n)} y="64" textAnchor="middle" className="font-display" fontSize={active ? 17 : 13} fontWeight="800" fill={active ? '#e11d48' : '#94a3b8'}>
                {n}
              </text>
              {active && (
                <g>
                  <circle cx={x(n)} cy="18" r="9" fill="#fbbf24" stroke="#d97706" strokeWidth="2.4" />
                  <text x={x(n)} y="22.5" textAnchor="middle" fontSize="11" fontWeight="900" fill="#7c2d12">?</text>
                </g>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function Visual({ v }: { v: NonNullable<Question['visual']> }) {
  switch (v.type) {
    case 'emoji-group':
      return (
        <div className="mx-auto flex max-w-md flex-wrap justify-center gap-2 py-2">
          {v.emojis.map((e, i) => (
            <span key={i} className="gpu animate-bob text-3xl" style={{ animationDelay: `${(i % 6) * 0.15}s` }}>
              {e}
            </span>
          ))}
        </div>
      )
    case 'ten-frames':
      return (
        <div className="mx-auto flex max-w-sm flex-wrap justify-center gap-1.5 p-3">
          {Array.from({ length: Math.ceil(v.count / 10) * 10 }, (_, i) => (
            <span key={i} className={`flex h-9 w-9 items-center justify-center rounded-lg border-2 font-display font-bold ${i < v.count ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}>
              {i < v.count ? i + 1 : ''}
            </span>
          ))}
        </div>
      )
    case 'shapes':
      return (
        <div className="mx-auto flex max-w-md flex-wrap justify-center gap-1 py-2">
          {Array.from({ length: v.count }, (_, i) => (
            <span key={i} className="text-2xl">{v.shape}</span>
          ))}
        </div>
      )
    case 'number-line':
      return <NumberLineVisual from={v.from} to={v.to} mark={v.mark} />
    case 'fraction': {
      const R = 52
      const cx = 60
      const cy = 60
      const slice = (i: number) => {
        const a0 = ((i * 360) / v.slices - 90) * (Math.PI / 180)
        const a1 = (((i + 1) * 360) / v.slices - 90) * (Math.PI / 180)
        const x0 = cx + R * Math.cos(a0), y0 = cy + R * Math.sin(a0)
        const x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1)
        const large = 360 / v.slices > 180 ? 1 : 0
        return (
          <path key={i} d={`M ${cx} ${cy} L ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} Z`}
            fill={i < v.filled ? '#fb923c' : '#fff'} stroke="#78350f" strokeWidth="3" strokeLinejoin="round" />
        )
      }
      return <svg viewBox="0 0 120 120" className="mx-auto h-40 w-40">{Array.from({ length: v.slices }, (_, i) => slice(i))}</svg>
    }
    case 'clock':
      return <ClockVisual hour={v.hour} minute={v.minute} />
    default:
      return null
  }
}

/* --------------------------- keypad input ---------------------------- */

function NumberPad({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const press = useCallback((d: string) => {
    sfx.tap(d)
    onChange(d === 'del' ? value.slice(0, -1) : value.length < 4 ? value + d : value)
  }, [onChange, value])
  return (
    <div className="mx-auto mt-3 w-full max-w-xs">
      <div className="mb-3 flex h-16 items-center justify-center rounded-2xl border-2 border-b-4 border-slate-300 bg-white font-display text-4xl font-extrabold tracking-widest">
        {value || <span className="text-slate-300">?</span>}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', ''].map((k, i) =>
          k === '' ? (
            <span key={i} />
          ) : (
            <button key={i} onClick={() => press(k)}
              className="rounded-xl border-2 border-b-4 border-slate-200 bg-white py-3 font-display text-2xl font-extrabold text-slate-600 transition-transform active:translate-y-0.5 active:border-b-2">
              {k === 'del' ? '⌫' : k}
            </button>
          ),
        )}
      </div>
    </div>
  )
}

/* --------------------------- main screen ----------------------------- */

type Phase = 'intro' | 'playing' | 'done'

export function LessonScreen({ lessonId, onExit }: { lessonId: string; onExit: () => void }) {
  const subject = usePlayer((s) => s.subject)
  const entry = getCurriculum(subject).allLessons[lessonId]
  const player = usePlayer()
  const [attempt, setAttempt] = useState(1)
  const [phase, setPhase] = useState<Phase>('intro')
  const [queue, setQueue] = useState<Question[]>([])
  const [qIdx, setQIdx] = useState(0)
  const [feedback, setFeedback] = useState<null | 'correct' | 'wrong'>(null)
  const [firstAttemptCorrect, setFirstAttemptCorrect] = useState(0)
  const [totalFirstAttempts, setTotalFirstAttempts] = useState(0)
  const [xpEarned, setXpEarned] = useState(0)
  const [firstAttemptMistakes, setFirstAttemptMistakes] = useState(0)
  // 4-kick chest ritual state (drives the new cards.ts chest engine UI)
  const [chestResult, setChestResult] = useState<ChestResult | null>(null)
  /** streak milestone (7/14/21…) whose bonus high-rarity chest is in chestResult */
  const [streakBonus, setStreakBonus] = useState<number | null>(null)
  const [kicksLeft, setKicksLeft] = useState(4)
  const [currentTier, setCurrentTier] = useState<ChestTier>('common')
  const [revealed, setRevealed] = useState(false)
  // Per-kick animation state
  const [kickPulse, setKickPulse] = useState(0)            // increments each tap → forces remount/animation
  const [flashTier, setFlashTier] = useState<ChestTier | null>(null) // success → flash this color
  const [floater, setFloater] = useState<{ id: number; tier: ChestTier } | null>(null) // rising "+1 tier" text
  const [shaking, setShaking] = useState(false)            // brief screen-shake on success

  // per-question UI state
  const [choiceIdx, setChoiceIdx] = useState<number | null>(null)
  const [typed, setTyped] = useState('')
  const [tapped, setTapped] = useState<Set<number>>(new Set())
  const [pendingLeft, setPendingLeft] = useState<string | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [matchErrors, setMatchErrors] = useState(0)
  const [orderPick, setOrderPick] = useState<number[]>([])
  // letter tiles
  const [tilePicks, setTilePicks] = useState<number[]>([])
  // speak
  const [speakPhase, setSpeakPhase] = useState<'idle' | 'listening' | 'heard'>('idle')
  // track first-attempt state per queue index
  const [firstAttemptDone, setFirstAttemptDone] = useState<Set<number>>(new Set())

  const q: Question | undefined = queue[qIdx]

  const startLesson = useCallback(() => {
    setQueue(entry.lesson.generate(QUESTIONS_PER_LESSON, attempt))
    setQIdx(0); setPhase('playing'); setFeedback(null)
    setFirstAttemptCorrect(0); setTotalFirstAttempts(0); setFirstAttemptDone(new Set())
    resetQState()
  }, [entry, attempt])

  function resetQState() {
    setChoiceIdx(null); setTyped(''); setTapped(new Set())
    setPendingLeft(null); setMatched(new Set()); setMatchErrors(0); setOrderPick([])
    setTilePicks([]); setSpeakPhase('idle')
  }

  // auto-play audio prompts once per question; stop any speech on unmount
  useEffect(() => {
    if (q && 'audioText' in q && q.audioText) speak(q.audioText)
    return () => stopSpeaking()
  }, [q])

  const canCheck = useMemo(() => {
    if (!q) return false
    switch (q.kind) {
      case 'mcq': return choiceIdx !== null
      case 'type-number': return typed !== ''
      case 'tap-count': return true
      case 'match': return matched.size === q.pairs.length
      case 'order': return orderPick.length === q.items.length
      case 'letter-tiles': return tilePicks.length === q.targetWord.length
      case 'truefalse': return true
      case 'speak': return true
    }
  }, [q, choiceIdx, typed, tapped, matched, orderPick, tilePicks])

  const isCorrectNow = useCallback((): boolean => {
    if (!q) return false
    switch (q.kind) {
      case 'mcq': return choiceIdx === q.answerIndex
      case 'type-number': return Number(typed) === q.answer
      case 'tap-count': {
        if (tapped.size !== q.target) return false
        return [...tapped].every((i) => q.cells[i] === q.targetEmoji)
      }
      case 'match': return matchErrors === 0
      case 'order':
        return orderPick.every((cellIdx, pos) => cellIdx === pos)
      case 'letter-tiles':
        return tilePicks.every((tileIdx, pos) => q.targetWord[tileIdx] === q.targetWord[pos])
      case 'truefalse': {
        const saidTrue = choiceIdx === 0
        return saidTrue === q.answer
      }
      case 'speak':
        return speakPhase !== 'idle' // self-affirmed or recognised - forgiving by design
    }
  }, [q, choiceIdx, typed, tapped, matched.size, matchErrors, orderPick, tilePicks, speakPhase])

  function handleCheck() {
    if (!canCheck || !q || feedback) return
    const isFirstAttempt = !firstAttemptDone.has(qIdx)
    const ok = isCorrectNow()
    if (ok) sfx.correct()
    else sfx.wrong()
    if (isFirstAttempt) {
      setFirstAttemptDone((s) => new Set(s).add(qIdx))
      setTotalFirstAttempts((n) => n + 1)
      if (ok) setFirstAttemptCorrect((n) => n + 1)
    }
    setFeedback(ok ? 'correct' : 'wrong')
  }

  function handleContinue() {
    if (!q) return
    const requeued = feedback === 'wrong'
    if (requeued) setQueue((qq) => [...qq, q]) // retry at the end, Duolingo-style
    const finished = !requeued && qIdx + 1 >= queue.length
    setFeedback(null)
    resetQState()
    if (finished) {
      finishLesson()
    } else {
      setQIdx((i) => i + 1)
    }
  }

  function finishLesson() {
    const isBoss = entry.lesson.id.endsWith('boss')
    const base = isBoss ? 20 : 10
    const bonus = firstAttemptCorrect === QUESTIONS_PER_LESSON ? 5 : 0
    let gained = base + bonus

    // Apply double XP boost
    if (player.doubleXpLessons > 0) {
      gained *= 2
      player.useDoubleXp()
    }

    const accuracy = totalFirstAttempts > 0
      ? Math.round((firstAttemptCorrect / totalFirstAttempts) * 100)
      : 100

    const firstAttemptMistakes = totalFirstAttempts - firstAttemptCorrect
    setFirstAttemptMistakes(firstAttemptMistakes)

    // Commit lesson results FIRST: this advances the streak and may set a
    // pending streak milestone (every 7 consecutive days) for THIS lesson.
    player.completeLesson({
      lessonId,
      xp: gained,
      correct: firstAttemptCorrect,
      totalQuestions: totalFirstAttempts,
      crownsGained: firstAttemptMistakes === 0 ? 1 : 0,
      accuracy,
    })

    // Streak milestone bonus chest (HIGH rarity, guaranteed Legendary+).
    // Streak Savers protect missed days automatically inside updateStreak().
    const streakMilestone = player.consumeStreakChest()
    setStreakBonus(streakMilestone)

    // New chest engine (cards.ts) - replaces the legacy lessonChestPrize
    const ctx: ChestContext = streakMilestone !== null
      ? 'streak'
      : player.consumeLuckyTicket() ? 'lucky' : isBoss ? 'boss' : 'normal'
    const chest = rollChest(Math.random, ctx, new Set(player.cardCollection), player.cardPity)
    const finalGems = chestGemMultiplier(player.chestBoost, player.megaChest) * chest.gems
    if (player.chestBoost) player.useChestBoost()
    if (player.megaChest) player.useMegaChest()
    const finalChest: ChestResult = { ...chest, gems: finalGems }
    player.grantChest(finalChest)
    setChestResult(finalChest)
    setKicksLeft(4)
    setCurrentTier(chest.startTier)
    setRevealed(false)
    setKickPulse(0)
    setFlashTier(null)
    setFloater(null)
    setShaking(false)
    setXpEarned(gained)

    sfx.complete()
    confetti({ particleCount: firstAttemptMistakes === 0 ? 120 : 60, spread: 75, origin: { y: 0.7 }, disableForReducedMotion: true })
    setPhase('done')
  }

  /* Tier metadata for the kick-upgrade UI */
  const TIER_META: Record<ChestTier, { color: string; label: string; glow: string }> = {
    common:    { color: '#94a3b8', label: 'Common',    glow: 'rgba(148,163,184,0.4)' },
    rare:      { color: '#3b82f6', label: 'Rare',      glow: 'rgba(59,130,247,0.4)' },
    epic:      { color: '#a855f7', label: 'Epic',      glow: 'rgba(168,85,247,0.45)' },
    legendary: { color: '#f59e0b', label: 'Legendary', glow: 'rgba(245,158,11,0.5)' },
    exclusive: { color: '#ec4899', label: 'Exclusive', glow: 'rgba(236,72,153,0.5)' },
  }
  const TIER_RANK: ChestTier[] = ['common', 'rare', 'epic', 'legendary', 'exclusive']
  const tierIdx = (t: ChestTier) => TIER_RANK.indexOf(t)

  function onChestKick() {
    if (revealed) return
    if (kicksLeft <= 0) return
    if (!chestResult) return
    sfx.tap()
    setKickPulse((n) => n + 1)            // re-trigger shake/flash animation
    const kicksDone = 4 - kicksLeft       // 0..3
    const willUpgrade = chestResult.upgradesAt.includes(kicksDone)
    const fromTier = TIER_RANK[tierIdx(currentTier)]
    const toTier: ChestTier = willUpgrade && tierIdx(currentTier) < 4
      ? TIER_RANK[tierIdx(currentTier) + 1]
      : currentTier

    if (willUpgrade) {
      setCurrentTier(toTier)
      setFlashTier(toTier)
      setFloater({ id: Date.now(), tier: toTier })
      setShaking(true)
      sfx.leagueUp()
      // confetti in the new tier's color
      const color = TIER_META[toTier].color
      confetti({
        particleCount: 60,
        spread: 90,
        origin: { y: 0.55 },
        colors: [color, TIER_META[fromTier].color, '#ffffff'],
        disableForReducedMotion: true,
      })
      // clear transient state after the animation
      setTimeout(() => {
        setFlashTier(null)
        setFloater(null)
        setShaking(false)
      }, 900)
    } else {
      // a "miss" still feels punchy: small spark burst in the current tier color
      const color = TIER_META[currentTier].color
      confetti({
        particleCount: 18,
        spread: 50,
        origin: { y: 0.6 },
        colors: [color, '#ffffff'],
        scalar: 0.6,
        disableForReducedMotion: true,
      })
    }

    const next = kicksLeft - 1
    if (next <= 0) {
      setKicksLeft(0)
      setRevealed(true)
      sfx.leagueUp()
      confetti({ particleCount: 100, spread: 100, origin: { y: 0.6 }, disableForReducedMotion: true })
    } else {
      setKicksLeft(next)
    }
  }

  /* ------------------------------ INTRO ------------------------------ */
  if (phase === 'intro') {
    const { intro } = entry.lesson
    return (
      <div className="mx-auto flex h-[100dvh] max-w-xl flex-col items-center justify-center px-6 pb-28 pt-16">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="h-44 w-44 gpu animate-float-y">
          <Mascot id={intro.mascotId} expression="excited" />
        </motion.div>
        <h1 className="mt-4 text-center font-display text-3xl font-extrabold">{intro.title}</h1>
        <p className="mt-2 max-w-sm text-center font-body text-lg font-semibold leading-relaxed text-slate-500">
          {intro.body}
        </p>
        <div className="card-white mt-4 text-center text-sm font-bold text-slate-400">
          Cambridge objectives · {entry.lesson.objectiveCodes.join(' · ') || 'Review boss level'}
        </div>
        <button onClick={() => { sfx.tap(); startLesson() }} className="btn3d btn-green mt-8 gpu">
          Let's go! 🚀
        </button>
        <button onClick={onExit} className="mt-3 font-display text-sm font-bold text-slate-400 hover:text-slate-600">
          ← Back to path
        </button>
      </div>
    )
  }

  /* ------------------------------- DONE ------------------------------ */
  if (phase === 'done') {
    return (
      <div className="mx-auto flex h-[100dvh] max-w-xl flex-col items-center justify-center px-6 pb-24">
        <motion.div initial={{ scale: 0.5, rotate: -8, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 14 }}
          className="h-40 w-40 gpu">
          <Mascot id={player.mascot} expression="cheer" />
        </motion.div>
        <motion.h1 initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}
          className="mt-3 text-center font-display text-4xl font-extrabold text-yellow-500 drop-shadow">
          {firstAttemptMistakes === 0 ? 'PERFECT!' : 'Lesson complete!'}
        </motion.h1>
        <p className="mt-1 text-center font-body text-sm font-bold text-slate-400">
          {firstAttemptMistakes === 0 ? 'Flawless run - every answer right!' : `${firstAttemptMistakes} mistake${firstAttemptMistakes === 1 ? '' : 's'} on first try. Practice makes perfect!`}
        </p>

        {/* streak milestone bonus banner */}
        {streakBonus !== null && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16 }}
            className="mt-4 rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-2 text-center font-display text-sm font-extrabold text-amber-600 shadow-pop"
          >
            🔥 {streakBonus}-DAY STREAK! BONUS HIGH-RARITY CHEST! 🎁
          </motion.div>
        )}

        {chestResult && (
          <motion.div
            className="relative mt-6 flex flex-col items-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={
              shaking
                ? { scale: 1, opacity: 1, x: [0, -10, 10, -8, 8, -4, 4, 0] }
                : { scale: 1, opacity: 1 }
            }
            transition={
              shaking
                ? { duration: 0.45, ease: 'easeOut' }
                : { type: 'spring', stiffness: 220, damping: 18 }
            }
            key={revealed ? 'revealed' : 'closed'}
          >
            {/* full-screen color flash on successful upgrade */}
            <AnimatePresence>
              {flashTier && (
                <motion.div
                  key={flashTier + '-' + kickPulse}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.45 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="pointer-events-none fixed inset-0 z-40"
                  style={{ background: TIER_META[flashTier].color }}
                />
              )}
            </AnimatePresence>
            {/* the chest itself - shakes horizontally on every kick */}
            <motion.button
              onClick={onChestKick}
              whileTap={revealed ? {} : { scale: 0.88 }}
              animate={
                revealed
                  ? { rotate: [0, -8, 8, 0], scale: [1, 1.18, 1] }
                  : { y: [0, -6, 0] }
              }
              transition={
                revealed
                  ? { duration: 0.6 }
                  : { repeat: Infinity, duration: 1.6 }
              }
              disabled={revealed}
              className={`relative text-[110px] leading-none ${revealed ? '' : 'cursor-pointer'}`}
              aria-label={revealed ? 'Chest opened' : 'Tap to kick your chest'}
            >
              {/* per-kick shake layer - remounts on each tap via the key */}
              <motion.div
                key={'kick-' + kickPulse}
                initial={{ x: 0, rotate: 0 }}
                animate={
                  revealed
                    ? { x: 0, rotate: 0 }
                    : { x: [0, -22, 22, -16, 16, -8, 8, 0], rotate: [0, -8, 8, -5, 5, -2, 2, 0] }
                }
                transition={{ duration: 0.55, ease: 'easeOut' }}
                className="drop-shadow-lg"
              >
                {/* persistent glow ring (sized to the chest) */}
                <div
                  className="absolute inset-0 -m-4 rounded-[2.5rem] pointer-events-none"
                  style={{
                    boxShadow: `0 0 60px 10px ${TIER_META[currentTier].glow}, inset 0 0 40px ${TIER_META[currentTier].glow}`,
                    opacity: 0.85,
                  }}
                />
                {/* the radial-gradient "chest" panel */}
                <div
                  className="relative rounded-3xl px-8 py-4"
                  style={{
                    background: `radial-gradient(circle, ${TIER_META[currentTier].glow}, transparent 70%)`,
                  }}
                >
                  {revealed ? '🎉' : '🎁'}
                </div>
              </motion.div>
            </motion.button>
            {/* rising "+1 tier" floater on successful upgrade */}
            <AnimatePresence>
              {floater && (
                <motion.div
                  key={floater.id}
                  initial={{ y: 0, opacity: 0, scale: 0.6 }}
                  animate={{ y: -90, opacity: 1, scale: 1.1 }}
                  exit={{ y: -130, opacity: 0, scale: 1 }}
                  transition={{ duration: 0.85, ease: 'easeOut' }}
                  className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap font-display text-2xl font-extrabold"
                  style={{ color: TIER_META[floater.tier].color, textShadow: `0 0 14px ${TIER_META[floater.tier].glow}` }}
                >
                  +1 {TIER_META[floater.tier].label}!
                </motion.div>
              )}
            </AnimatePresence>

            {/* tier badge - bounces in when the tier changes */}
            <motion.div
              key={'badge-' + currentTier}
              initial={{ scale: 0.4, y: -8, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 14 }}
              className="mt-3 rounded-full px-3 py-0.5 font-display text-sm font-extrabold uppercase tracking-wider"
              style={{
                color: 'white',
                background: TIER_META[currentTier].color,
                textShadow: `0 1px 0 rgba(0,0,0,0.25)`,
                boxShadow: `0 0 18px ${TIER_META[currentTier].glow}`,
              }}
            >
              {TIER_META[currentTier].label}
            </motion.div>

            {/* probability line: "Next kick: 22% chance to become Rare" */}
            {!revealed && (() => {
              const idx = tierIdx(currentTier)
              const canUpgrade = idx < 3 // not at Legendary/Exclusive
              if (!canUpgrade) {
                return (
                  <p className="mt-2 font-display text-xs font-extrabold uppercase tracking-wider text-yellow-500">
                    ★ Max tier reached ★
                  </p>
                )
              }
              const pct = Math.round(KICK_UPGRADE[currentTier] * 100)
              const nextTier = TIER_RANK[idx + 1]
              const nextMeta = TIER_META[nextTier]
              return (
                <p className="mt-2 font-body text-xs font-bold text-slate-500">
                  Next kick: <span style={{ color: nextMeta.color, fontWeight: 800 }}>{pct}% → {nextMeta.label}</span>
                </p>
              )
            })()}

            {/* 4-dot kick progress */}
            {!revealed && (
              <div className="mt-2 flex gap-1.5" aria-label="Kicks remaining">
                {Array.from({ length: 4 }).map((_, i) => {
                  const filled = i < 4 - kicksLeft
                  return (
                    <motion.span
                      key={i}
                      animate={
                        filled
                          ? { scale: [1, 1.4, 1] }
                          : { scale: 1 }
                      }
                      transition={filled ? { duration: 0.4, ease: 'easeOut' } : {}}
                      className="h-2 w-2 rounded-full"
                      style={{ background: filled ? TIER_META[currentTier].color : '#cbd5e1' }}
                    />
                  )
                })}
              </div>
            )}

            {/* CTA below the progress */}
            {!revealed && (
              <span className="mt-2 whitespace-nowrap rounded-full bg-speed-blue px-3 py-1 font-display text-xs font-extrabold text-white">
                {kicksLeft === 4 ? 'Tap to open!' : `Kick! (${kicksLeft} left)`}
              </span>
            )}
          </motion.div>
        )}

        {revealed && chestResult && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16 }}
            className="mt-6 text-center"
          >
            <p className="font-display text-3xl font-extrabold text-orange-500">+{chestResult.gems} 💎</p>
            <p className="mt-1 font-display font-extrabold text-emerald-500">+{xpEarned} ⚡ XP</p>
            {chestResult.card && CARD_BY_ID[chestResult.card.id] && (
              <motion.div
                initial={{ rotateY: 180, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                className="card-white mt-4 mx-auto max-w-xs overflow-hidden"
                style={{ borderColor: TIER_META[CARD_BY_ID[chestResult.card.id].tier].color }}
              >
                <div className="h-40 bg-gradient-to-b from-white/40 to-transparent flex items-center justify-center px-2 pt-2">
                  <img
                    src={cardImageUrl(CARD_BY_ID[chestResult.card.id])}
                    alt={CARD_BY_ID[chestResult.card.id].name}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                    className="h-full w-full object-contain drop-shadow"
                  />
                </div>
                <div className="px-4 pb-4">
                  <p className="font-display text-xs font-extrabold text-slate-400 uppercase">
                    {chestResult.card.isNew ? 'NEW CARD!' : 'Duplicate'}
                  </p>
                  <p className="font-display text-2xl font-extrabold text-slate-800 mt-1">
                    {CARD_BY_ID[chestResult.card.id].name}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{CARD_BY_ID[chestResult.card.id].flavor}</p>
                </div>
              </motion.div>
            )}
            {chestResult.jackpot && (
              <p className="mt-2 font-display text-lg font-extrabold text-pink-500">
                🎰 JACKPOT! Collection complete! 🎰
              </p>
            )}
          </motion.div>
        )}

        <div className="mt-8 w-full max-w-xs">
          {revealed ? (
            <button onClick={onExit} className="btn3d btn-green w-full gpu">
              Continue to roadmap ▶
            </button>
          ) : (
            <p className="text-center font-body text-xs font-bold text-slate-300">
              Kick your chest 4 times to reveal the loot!
            </p>
          )}
        </div>
      </div>
    )
  }

  /* ----------------------------- PLAYING ----------------------------- */
  const progress = (qIdx / queue.length) * 100

  return (
    <div className="flex h-[100dvh] max-w-xl mx-auto flex-col px-4">
      {/* header */}
      <div className="flex items-center gap-3 py-3">
        <button onClick={onExit} className="font-display text-2xl text-slate-300 hover:text-slate-500" title="Quit lesson">✕</button>
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-slate-200">
          <motion.div className="h-full rounded-full bg-emerald-400" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
        </div>
        <span className="rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 px-2 py-0.5 font-display text-xs font-extrabold text-white">∞</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={qIdx + '-' + queue.length}
          initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.18 }}
          className="flex-1 overflow-y-auto pb-44">
          {!q ? null : q.kind === 'mcq' ? (
            <McqView q={q} selected={choiceIdx} onSelect={setChoiceIdx} />
          ) :
            q.kind === 'type-number' ? <TypeView q={q} typed={typed} onType={setTyped} /> :
            q.kind === 'tap-count' ? <TapView q={q} tapped={tapped} onTap={(i) => {
              sfx.tap(String(i)); setTapped((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n })
            }} /> :
            q.kind === 'match' ? <MatchView q={q} pendingLeft={pendingLeft} matched={matched} onPick={(side, key) => {
              if (side === 'left') { setPendingLeft(key); sfx.tap(key) } else if (pendingLeft) {
                const ok = q.pairs.find((p) => p.left === pendingLeft)?.right === key
                if (ok) { sfx.correct(); setMatched((m) => new Set(m).add(pendingLeft + '|' + key)) }
                else { sfx.wrong(); setMatchErrors((e) => e + 1) }
                setPendingLeft(null)
              }
            }} /> :
            q.kind === 'letter-tiles' ? (
              <LetterTilesView q={q} picks={tilePicks} onToggleTile={(i) => {
                sfx.tap(String(i))
                setTilePicks((p) => p.includes(i) ? p.filter((x) => x !== i) : p.length < q.targetWord.length ? [...p, i] : p)
              }} />
            ) :
            q.kind === 'truefalse' ? (
              <TrueFalseView q={q} choice={choiceIdx} onChoice={(c) => { sfx.tap(c === 0 ? 'true' : 'false'); setChoiceIdx(c) }} />
            ) :
            q.kind === 'speak' ? (
              <SpeakView q={q} phase={speakPhase} onPhase={setSpeakPhase} onHeard={() => { sfx.correct(); setSpeakPhase('heard') }} />
            ) :
            <OrderView q={q} picks={orderPick} onPick={(i) => {
              sfx.tap(String(i))
              setOrderPick((p) => p.includes(i) ? p.filter((x) => x !== i) : p.length < q.items.length ? [...p, i] : p)
            }} />}
          {q?.hint && !feedback && (
            <details className="mx-auto mt-4 w-fit text-center">
              <summary className="cursor-pointer font-display text-xs font-bold uppercase tracking-wide text-sky-400">💡 Hint</summary>
              <p className="mt-1 max-w-xs font-body text-sm font-semibold text-slate-400">{q.hint}</p>
            </details>
          )}
        </motion.div>
      </AnimatePresence>

      {/* footer */}
      <div className={`fixed inset-x-0 bottom-0 z-30 mx-auto max-w-xl border-t-2 px-4 py-4 transition-colors ${
        feedback === 'correct' ? 'border-emerald-200 bg-emerald-50' : feedback === 'wrong' ? 'border-rose-200 bg-rose-50' : 'border-transparent bg-white'}`}>
        <AnimatePresence>
          {feedback && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="mb-2 flex items-center gap-3 overflow-hidden">
              <div className="h-12 w-12 shrink-0 gpu animate-bob">
                <Mascot id={feedback === 'correct' ? player.mascot : 'eggman'} expression={feedback === 'correct' ? 'excited' : 'cheer'} />
              </div>
              <div>
                <p className={`font-display text-lg font-extrabold ${feedback === 'correct' ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {feedback === 'correct' ? ['Nice one!', 'Zoom-tastic!', 'You speedster!', 'Brilliant!'][qIdx % 4] : 'Not quite!'}
                </p>
                {feedback === 'wrong' && <p className="text-sm font-bold text-slate-500">{correctText(q)}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {!feedback ? (
          <button disabled={!canCheck} onClick={handleCheck} className={`btn3d w-full ${canCheck ? 'btn-green' : 'btn-grey'}`}>
            Check
          </button>
        ) : (
          <button onClick={handleContinue} className={`btn3d w-full ${feedback === 'correct' ? 'btn-green' : 'bg-[#ff4b4b] text-white shadow-[0_4px_0_#ea2b2b]'}`}>
            Continue
          </button>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, color, icon, delay }: { label: string; value: string; color: string; icon: string; delay: number }) {
  return (
    <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay }}>
      <p className={`font-display text-xl font-extrabold ${color}`}>{icon} {value}</p>
      <p className="text-xs font-bold text-slate-400">{label}</p>
    </motion.div>
  )
}

function correctText(q: Question): string {
  switch (q.kind) {
    case 'mcq': return `Answer: ${q.choices[q.answerIndex]}`
    case 'type-number': return `Answer: ${q.answer}`
    case 'tap-count': return `There were ${q.target}`
    case 'order': return `Order: ${q.items.join(', ')}`
    case 'match': return 'Look again and try the rematch!'
    case 'letter-tiles': return `Spelling: ${q.targetWord}`
    case 'truefalse': return q.answer ? 'It was TRUE' : 'It was FALSE'
    case 'speak': return `Try again slowly: "${q.targetText}"`
  }
}

function Prompt({ children, visual }: { children: React.ReactNode; visual?: Question['visual'] }) {
  return (
    <div>
      <h2 className="py-4 text-center font-display text-2xl font-extrabold leading-snug">{children}</h2>
      {visual && <Visual v={visual} />}
    </div>
  )
}

/* ------------------------- english extras ------------------------- */

function StoryPanelView({ panel }: { panel: StoryPanel }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="card-white mx-auto mt-3 max-w-md px-4 py-3"
    >
      <p className="text-center font-display text-sm font-extrabold uppercase tracking-wide text-violet-500">
        📖 {panel.title}
      </p>
      <div className="mt-1 flex justify-center gap-1 text-3xl">
        {panel.scene.map((e, i) => (
          <span key={i} className="gpu animate-bob" style={{ animationDelay: `${i * 0.12}s` }}>{e}</span>
        ))}
      </div>
      <div className="mt-2 space-y-1">
        {panel.lines.map((line, i) => (
          <p key={i} className="text-center font-body text-base font-semibold leading-relaxed text-slate-600">
            {line}
          </p>
        ))}
      </div>
    </motion.div>
  )
}

function AudioBar({ audioText }: { audioText: string }) {
  if (!ttsAvailable()) return null
  return (
    <div className="mx-auto mt-2 flex w-fit items-center gap-2">
      <button
        onClick={() => { sfx.tap('audio'); speak(audioText) }}
        className="btn3d btn-blue flex items-center gap-2 !px-5 !py-3 text-xl"
        title="Play again"
      >
        🔊 Listen
      </button>
      <button
        onClick={() => { sfx.tap('slow'); speakSlow(audioText) }}
        className="btn3d btn-grey !px-4 !py-3 text-xl"
        title="Slow replay (turtle mode)"
      >
        🐢
      </button>
    </div>
  )
}

function LetterTilesView({ q, picks, onToggleTile }: {
  q: LetterTilesQuestion; picks: number[]; onToggleTile: (i: number) => void
}) {
  const tiles = useMemo(() => {
    const rand = mulberry32(hashString(q.targetWord + '|' + q.prompt))
    const idx = shuffle(rand, q.targetWord.split('').map((_, i) => i))
    if (idx.every((v, i) => v === i)) idx.push(idx.shift()!)
    return idx
  }, [q])
  const answerSoFar = picks.map((i) => q.targetWord[i]).join('')
  return (
    <div>
      <Prompt visual={q.visual}>{q.prompt}</Prompt>
      {/* answer slots */}
      <div className="mx-auto flex w-fit flex-wrap justify-center gap-1.5 px-2">
        {q.targetWord.split('').map((_, slot) => {
          const tileIdx = picks[slot]
          return (
            <div key={slot}
              className={`flex h-12 w-11 items-center justify-center rounded-xl border-2 border-b-4 font-display text-2xl font-extrabold ${
                tileIdx !== undefined ? 'border-speed-blue bg-speed-bluelight text-slate-700' : 'border-dashed border-slate-300 bg-slate-50'
              }`}>
              {tileIdx !== undefined ? (
                <button onClick={() => onToggleTile(tileIdx)} aria-label={`remove letter ${q.targetWord[tileIdx]}`}>
                  {q.targetWord[tileIdx]}
                </button>
              ) : ''}
            </div>
          )
        })}
      </div>
      {/* shuffled tiles */}
      <div className="mt-6 flex flex-wrap justify-center gap-2 px-2">
        {tiles.map((charIdx) => {
          const usedAt = picks.indexOf(charIdx)
          return (
            <motion.button key={charIdx} whileTap={{ scale: 0.85 }} disabled={usedAt >= 0}
              onClick={() => onToggleTile(charIdx)}
              className={`flex h-14 w-12 items-center justify-center rounded-xl border-2 border-b-4 font-display text-3xl font-extrabold transition-colors ${
                usedAt >= 0 ? 'border-slate-200 bg-slate-100 text-slate-300' : 'border-slate-200 bg-white'
              }`}>
              {q.targetWord[charIdx]}
            </motion.button>
          )
        })}
      </div>
      <p className="pt-3 text-center font-display font-bold text-slate-400">{answerSoFar || '\u00a0'}</p>
    </div>
  )
}

function TrueFalseView({ q, choice, onChoice }: {
  q: TrueFalseQuestion; choice: number | null; onChoice: (c: number) => void
}) {
  return (
    <div>
      {q.story && <StoryPanelView panel={q.story} />}
      <h2 className="py-4 text-center font-display text-2xl font-extrabold leading-snug">{q.prompt}</h2>
      <div className="card-white mx-auto max-w-md px-4 py-4 text-center font-body text-lg font-bold leading-relaxed text-slate-700">
        {q.statement}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 px-1">
        <ChoiceButton label="TRUE ✔" selected={choice === 0} onSelect={() => onChoice(0)} />
        <ChoiceButton label="FALSE ✘" selected={choice === 1} onSelect={() => onChoice(1)} />
      </div>
    </div>
  )
}

/** Normalises words so forgiving ASR comparison works ("dog." ~ "dog"). */
const normWords = (s: string): string[] =>
  s.toLowerCase().replace(/[^a-z' ]/g, ' ').split(/\s+/).filter(Boolean)

function wordMatchScore(said: string[], target: string[]): number {
  if (!target.length) return 0
  let hits = 0
  for (const w of target) if (said.includes(w)) hits++
  return hits / target.length
}

function SpeakView({ q, phase, onPhase, onHeard }: {
  q: SpeakQuestion
  phase: 'idle' | 'listening' | 'heard'
  onPhase: (p: 'idle' | 'listening' | 'heard') => void
  onHeard: () => void
}) {
  function startListening() {
    onPhase('listening')
    const SR = (window as unknown as Record<string, unknown>).webkitSpeechRecognition ??
      (window as unknown as Record<string, unknown>).SpeechRecognition
    if (typeof SR !== 'function') return // no ASR: self-check path stays available
    try {
      const rec = new (SR as new () => {
        lang: string; interimResults: boolean; maxAlternatives: number
        start: () => void; stop: () => void
        onresult: ((e: { results: { transcript: string }[][] }) => void) | null
        onend: (() => void) | null
      })()
      rec.lang = 'en-GB'; rec.interimResults = false; rec.maxAlternatives = 3
      rec.onresult = (e) => {
        const said = normWords(String(e.results[0]?.[0]?.transcript ?? ''))
        if (wordMatchScore(said, normWords(q.targetText)) >= 0.6) {
          sfx.correct()
          onHeard()
        }
      }
      rec.onend = () => onPhase(phase === 'heard' ? 'heard' : 'idle')
      rec.start()
    } catch {
      /* fall back to self-check */
    }
  }

  return (
    <div>
      {q.story && <StoryPanelView panel={q.story} />}
      <Prompt visual={q.visual}>{q.prompt}</Prompt>
      <div className="card-white mx-auto max-w-md px-5 py-5 text-center">
        <p className="font-body text-2xl font-extrabold leading-relaxed text-slate-700">“{q.targetText}”</p>
        <AudioBar audioText={q.targetText} />
      </div>
      <div className="mt-5 flex flex-col items-center gap-3">
        {phase !== 'heard' && (
          <button onClick={startListening} className="btn3d btn-green !px-8 !py-4 text-xl gpu">
            🎤 Read it aloud!
          </button>
        )}
        {phase !== 'heard' && (
          <button onClick={() => onHeard()}
            className="font-display text-sm font-bold text-sky-400 hover:text-sky-500">
            I read it out loud ✅
          </button>
        )}
        {phase === 'heard' && (
          <motion.p initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="font-display text-xl font-extrabold text-emerald-500">
            Lovely reading! 🌟
          </motion.p>
        )}
      </div>
    </div>
  )
}

function McqView({ q, selected, onSelect }: { q: McqQuestion; selected: number | null; onSelect: (i: number) => void }) {
  return (
    <div>
      {q.story && <StoryPanelView panel={q.story} />}
      <Prompt visual={q.visual}>{q.prompt}</Prompt>
      {q.audioText && <AudioBar audioText={q.audioText} />}
      <div className={`grid gap-3 ${q.choices.some((c) => c.length > 14) ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {q.choices.map((c, i) => (
          <ChoiceButton key={i} label={c} selected={selected === i} onSelect={() => {
            sfx.tap(c)
            onSelect(i)
          }} />
        ))}
      </div>
    </div>
  )
}

function ChoiceButton({ label, selected, onSelect }: { label: string; selected: boolean; onSelect: () => void }) {
  return (
    <button className={`choice-btn justify-center text-center ${selected ? 'selected' : ''}`} onClick={onSelect}>
      <span className="block text-center">{label}</span>
    </button>
  )
}

function TypeView({ q, typed, onType }: { q: TypeNumberQuestion; typed: string; onType: (v: string) => void }) {
  return (
    <div>
      <Prompt visual={q.visual}>{q.prompt}</Prompt>
      <NumberPad value={typed} onChange={onType} />
    </div>
  )
}

function TapView({ q, tapped, onTap }: { q: TapCountQuestion; tapped: Set<number>; onTap: (i: number) => void }) {
  return (
    <div>
      <Prompt>{q.prompt}</Prompt>
      <div className="flex flex-wrap justify-center gap-2">
        {q.cells.map((cell, i) => (
          <motion.button key={i} whileTap={{ scale: 0.85 }} onClick={() => onTap(i)}
            className={`gpu relative flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-b-4 text-3xl transition-colors ${
              tapped.has(i) ? 'border-speed-blue bg-speed-bluelight' : 'border-slate-200 bg-white'}`}
            aria-pressed={tapped.has(i)}>
            {cell}
            {tapped.has(i) && <span className="absolute mt-8 ml-8 h-4 w-4 rounded-full bg-speed-blue text-center text-[10px] font-black text-white">{tapped.size}</span>}
          </motion.button>
        ))}
      </div>
      <p className="pt-3 text-center font-display font-bold text-slate-400">Selected: {tapped.size}</p>
    </div>
  )
}

function MatchView({ q, pendingLeft, matched, onPick }: {
  q: MatchQuestion; pendingLeft: string | null; matched: Set<string>; onPick: (side: 'left' | 'right', key: string) => void
}) {
  // De-align the columns: the right column is shuffled into a derangement so a
  // correct pair never sits side by side on the same row. Grading still keys
  // off q.pairs below, so this only affects presentation order.
  const { lefts, rights } = useMemo(() => {
    const key = `${q.prompt}|${q.pairs.map((p) => `${p.left}~${p.right}`).join('|')}`
    return layoutMatchColumns(q.pairs, key)
  }, [q])
  return (
    <div>
      <Prompt>{q.prompt}</Prompt>
      {q.audioText && <AudioBar audioText={q.audioText} />}
      <div className="grid grid-cols-2 gap-3 px-1">
        <div className="flex flex-col gap-2">
          {lefts.map((l) => (
            <button key={l} onClick={() => onPick('left', l)} disabled={[...matched].some((m) => m.split('|')[0] === l)}
              className={`choice-btn text-center ${pendingLeft === l ? 'selected' : ''} ${[...matched].some((m) => m.split('|')[0] === l) ? 'correct' : ''}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {rights.map((r) => (
            <button key={r} onClick={() => onPick('right', r)}
              className={`choice-btn text-center ${[...matched].some((m) => m.split('|')[1] === r) ? 'correct' : ''}`}>
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function OrderView({ q, picks, onPick }: { q: OrderQuestion; picks: number[]; onPick: (i: number) => void }) {
  const shuffled = useMemo(() => {
    const rand = mulberry32(hashString(q.items.join('|')))
    const idx = shuffle(rand, q.items.map((_, i) => i))
    // guarantee the displayed order is NOT already the answer
    if (idx.every((v, i) => v === i)) idx.push(idx.shift()!)
    return idx
  }, [q])
  return (
    <div>
      {q.story && <StoryPanelView panel={q.story} />}
      <Prompt>{q.prompt}</Prompt>
      {q.audioText && <AudioBar audioText={q.audioText} />}
      <div className="flex flex-wrap justify-center gap-2">
        {shuffled.map((i) => {
          const pos = picks.indexOf(i)
          return (
            <motion.button key={i} layout whileTap={{ scale: 0.92 }} onClick={() => onPick(i)}
              className={`choice-btn relative text-center ${pos >= 0 ? 'selected' : ''}`}>
              {pos >= 0 && <span className="absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-speed-blue font-display text-xs font-black text-white">{pos + 1}</span>}
              {q.items[i]}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
