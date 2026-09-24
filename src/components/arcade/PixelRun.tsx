import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { ArcadeGameDef } from '../../engine/arcade'
import { finishArcadeRound } from '../../engine/arcadeRound'
import { usePlayer } from '../../engine/store'
import { ARCADE_CARD_BY_ID, ARCADE_CARD_GOALS, cardImageUrl } from '../../engine/cards'
import { sfx } from '../../engine/sfx'
import { makeMathQuestion, type ArcadeQ } from '../../content/arcadeMath'
import { Mascot } from '../mascots/Mascots'

/* ---------------- tunables (exported for tests) ---------------- */

export const RUN = {
  ROUND_SECONDS: 60,
  /** logical stage size — everything is positioned as a % of this box */
  STAGE_W: 360,
  STAGE_H: 200,
  GROUND_H: 40, // px of STAGE_H → 20% bottom band
  PLAYER_X: 56,
  PLAYER_W: 26, // square-ish so the Sonic art isn't squashed
  PLAYER_H: 26,
  SPEED: 3.0, // camera px per 60fps frame
  GRAVITY: 0.6,
  /** initial upward velocity — POSITIVE because py = height above ground.
   *  apex = JUMP_V²/(2·GRAVITY) ≈ 87px — comfortably clears the h=52 coin arc. */
  JUMP_V: 10.2,
  FINISH_X: 6400,
  GATE_EVERY: 800,
  SPIKE_MIN: 280,
  SPIKE_MAX: 470,
  INVULN_FRAMES: 80,
  COIN_SCORE: 10,
  /** clearing a gate: big points + a shield (see SHIELD_FRAMES) */
  GATE_SCORE: 50,
  GATE_COINS: 30,
  /** wrong gate answer also costs this many points (floored at 0) */
  WRONG_PENALTY: 30,
  /** correct-answer shield duration (frames @60fps) — spikes pass right through */
  SHIELD_FRAMES: 240,
  FINISH_BONUS: 100,
} as const

/** World x of the i-th (0-based) question gate. */
export function gateX(i: number): number {
  return RUN.GATE_EVERY * (i + 1)
}

/** How many gates fit before the finish line. */
export const GATE_COUNT = (() => {
  let n = 0
  while (gateX(n) < RUN.FINISH_X - 200) n++
  return n
})()

/** Pure score: distance/10 + coins + gates + finish − wrong-answer penalty. */
export function computeRunScore(
  worldX: number,
  coins: number,
  gatesCleared: number,
  finished: boolean,
  wrongs = 0,
): number {
  const dist = Math.max(0, Math.floor(worldX / 10))
  const raw =
    dist +
    coins * RUN.COIN_SCORE +
    gatesCleared * RUN.GATE_SCORE +
    (finished ? RUN.FINISH_BONUS : 0) -
    wrongs * RUN.WRONG_PENALTY
  return Math.max(0, raw)
}

/* ---------------- level layout (pure, testable) ---------------- */

export const GATE_CLEAR = 80 // keep features this far from a gate on each side
export const SPIKE_W = 18
export const COIN_SIZE = 16
export const COIN_SPACING = 24
export const COIN_HEIGHTS = [8, 34, 52, 34, 8] as const
/** arc span (first coin x → last coin x + size) */
export const COIN_ARC_W = (COIN_HEIGHTS.length - 1) * COIN_SPACING + COIN_SIZE
/** gap after a coin arc before the next feature — landing is always safe */
export const COIN_GAP_AFTER = 130

export type RunEnt =
  | { kind: 'spike'; x: number }
  | { kind: 'coin'; x: number; h: number; got: boolean }

/**
 * Sequential feature planner: spikes and coin arcs share ONE cursor, so a
 * coin arc can never overlap or lead straight into a spike, and nothing is
 * placed inside a gate's clearance zone. `rand` is injectable for tests.
 */
export function planFeatures(
  rand: () => number,
  fromX: number,
  untilX: number,
): { ents: RunEnt[]; nextX: number } {
  const ents: RunEnt[] = []
  let x = fromX
  const limit = Math.min(untilX, RUN.FINISH_X - 140)

  /** push x forward until [x, x+w] is clear of every gate zone */
  const clearOfGates = (start: number, w: number): number => {
    let fx = start
    for (let pass = 0; pass < 3; pass++) {
      let moved = false
      for (let i = 0; i < GATE_COUNT; i++) {
        const g = gateX(i)
        if (fx < g + GATE_CLEAR && fx + w > g - GATE_CLEAR) {
          fx = g + GATE_CLEAR
          moved = true
        }
      }
      if (!moved) break
    }
    return fx
  }

  while (x < limit) {
    const isSpike = rand() < 0.45
    const w = isSpike ? SPIKE_W : COIN_ARC_W
    const fx = clearOfGates(x, w)
    if (fx >= limit) {
      x = fx
      break
    }
    if (isSpike) {
      ents.push({ kind: 'spike', x: fx })
      x = fx + RUN.SPIKE_MIN + rand() * (RUN.SPIKE_MAX - RUN.SPIKE_MIN)
    } else {
      for (let i = 0; i < COIN_HEIGHTS.length; i++) {
        ents.push({ kind: 'coin', x: fx + i * COIN_SPACING, h: COIN_HEIGHTS[i], got: false })
      }
      x = fx + COIN_ARC_W + COIN_GAP_AFTER + rand() * 90
    }
  }
  return { ents, nextX: x }
}

/* ---------------- run state ---------------- */

type GateEnt = { kind: 'gate'; x: number; passed: boolean }

type Ent =
  | { kind: 'spike'; x: number }
  | { kind: 'coin'; x: number; h: number; got: boolean }
  | GateEnt

type Run = {
  worldX: number
  py: number // height above ground (0 = grounded)
  vy: number
  onGround: boolean
  coins: number
  gatesOk: number
  wrongs: number
  shield: number // remaining frames of correct-answer shield
  finished: boolean
  invuln: number
  lives: number
  ents: Ent[]
  nextX: number // sequential feature cursor (spikes + coins)
  nextGateI: number
  activeGate: GateEnt | null
}

function freshRun(): Run {
  return {
    worldX: 0,
    py: 0,
    vy: 0,
    onGround: true,
    coins: 0,
    gatesOk: 0,
    wrongs: 0,
    shield: 0,
    finished: false,
    invuln: 0,
    lives: 3,
    ents: [],
    nextX: 700,
    nextGateI: 0,
    activeGate: null,
  }
}

function SpikeSprite() {
  const outline = '#1f2430'
  return (
    <svg viewBox="0 0 10 10" shapeRendering="crispEdges" className="h-full w-full" aria-label="Spike">
      <rect x="4" y="0" width="2" height="2" fill="#ef4444" />
      <rect x="3" y="2" width="4" height="2" fill="#ef4444" />
      <rect x="2" y="4" width="6" height="2" fill="#dc2626" />
      <rect x="1" y="6" width="8" height="2" fill="#dc2626" />
      <rect x="0" y="8" width="10" height="2" fill="#b91c1c" />
      <rect x="0" y="8" width="10" height="2" fill="none" stroke={outline} strokeWidth="0.6" />
    </svg>
  )
}

function CoinSprite() {
  return (
    <svg viewBox="0 0 12 12" shapeRendering="crispEdges" className="h-full w-full" aria-label="Coin">
      <rect x="3" y="1" width="6" height="1" fill="#f59e0b" />
      <rect x="2" y="2" width="8" height="8" fill="#fbbf24" />
      <rect x="3" y="10" width="6" height="1" fill="#f59e0b" />
      <rect x="1" y="3" width="1" height="6" fill="#d97706" />
      <rect x="10" y="3" width="1" height="6" fill="#d97706" />
      <rect x="5" y="3" width="2" height="6" fill="#fde68a" />
      <rect x="2" y="2" width="8" height="8" fill="none" stroke="#92400e" strokeWidth="0.5" />
    </svg>
  )
}

/* % helpers (stage = RUN.STAGE_W × RUN.STAGE_H) */
const pctX = (px: number) => (px / RUN.STAGE_W) * 100
const pctY = (px: number) => (px / RUN.STAGE_H) * 100
const GROUND_PCT = pctY(RUN.GROUND_H) // 20

export function PixelRun({ game, onExit }: { game: ArcadeGameDef; onExit: () => void }) {
  const [phase, setPhase] = useState<'ready' | 'play' | 'over'>('ready')
  const [, setTick] = useState(0)
  const [timeLeft, setTimeLeft] = useState<number>(RUN.ROUND_SECONDS)
  const [gateQ, setGateQ] = useState<ArcadeQ | null>(null)
  const [flash, setFlash] = useState<'ok' | 'no' | null>(null)
  const [finalScore, setFinalScore] = useState(0)
  const [rewards, setRewards] = useState({ xp: 0, gems: 0 })
  const [unlockedCard, setUnlockedCard] = useState<string | null>(null)
  const best = usePlayer((s) => s.arcadeScores[game.id] ?? 0)

  const run = useRef<Run>(freshRun())
  const submitted = useRef(false)
  const phaseRef = useRef(phase)
  phaseRef.current = phase

  /* -------- end of round -------- */
  const finish = useCallback(() => {
    if (submitted.current) return
    submitted.current = true
    const r = run.current
    const score = computeRunScore(r.worldX, r.coins, r.gatesOk, r.finished, r.wrongs)
    setFinalScore(score)
    setPhase('over')
    setGateQ(null)
    const { xp, gems, granted } = finishArcadeRound(game.id, score, 0)
    setRewards({ xp, gems })
    setUnlockedCard(granted[0] ?? null)
    if (granted.length > 0) sfx.streak()
    sfx.leagueUp()
  }, [game.id])

  /* -------- timer -------- */
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

  /* -------- jump input -------- */
  const jump = useCallback(() => {
    if (phaseRef.current !== 'play') return
    if (gateQ) return
    const r = run.current
    if (r.onGround) {
      r.vy = RUN.JUMP_V
      r.onGround = false
      sfx.tap('j')
    }
  }, [gateQ])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        if (phaseRef.current === 'play') e.preventDefault()
        jump()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [jump])

  /* -------- game loop -------- */
  useEffect(() => {
    if (phase !== 'play') return
    let raf = 0
    let last = performance.now()
    const step = (t: number) => {
      const dt = Math.min((t - last) / 16.667, 3)
      last = t
      const r = run.current
      const paused = gateQ !== null || submitted.current
      if (!paused && !r.finished) {
        r.worldX += RUN.SPEED * dt
        // vertical physics
        r.vy -= RUN.GRAVITY * dt
        r.py += r.vy * dt
        if (r.py <= 0) {
          r.py = 0
          r.vy = 0
          r.onGround = true
        }
        if (r.invuln > 0) r.invuln -= dt
        if (r.shield > 0) r.shield -= dt

        const pwx = r.worldX + RUN.PLAYER_X // player world x
        const ahead = r.worldX + RUN.STAGE_W + 120

        // spawn gates (fixed rhythm)
        while (r.nextGateI < GATE_COUNT && gateX(r.nextGateI) <= ahead) {
          r.ents.push({ kind: 'gate', x: gateX(r.nextGateI), passed: false })
          r.nextGateI++
        }
        // spawn spikes + coin arcs from the shared sequential cursor
        if (r.nextX <= ahead && r.nextX < RUN.FINISH_X - 140) {
          const planned = planFeatures(Math.random, r.nextX, ahead)
          for (const e of planned.ents) r.ents.push(e)
          r.nextX = planned.nextX
        }

        // collisions
        const pLeft = pwx
        const pRight = pwx + RUN.PLAYER_W
        let died = false
        for (const e of r.ents) {
          if (e.kind === 'coin') {
            if (e.got) continue
            // generous hitbox so a well-timed jump sweeps the whole arc
            if (
              pRight + 6 >= e.x &&
              pLeft <= e.x + COIN_SIZE + 6 &&
              r.py <= e.h + 20 &&
              r.py + RUN.PLAYER_H + 6 >= e.h
            ) {
              e.got = true
              r.coins++
              sfx.tap('c')
            }
          } else if (e.kind === 'spike') {
            if (r.shield > 0) continue // correct-answer shield: spikes pass through
            if (r.invuln > 0) continue
            if (pRight >= e.x && pLeft <= e.x + SPIKE_W && r.py < 18) {
              r.lives--
              r.invuln = RUN.INVULN_FRAMES
              sfx.wrong()
              setFlash('no')
              setTimeout(() => setFlash(null), 150)
              if (r.lives <= 0) died = true
            }
          } else if (e.kind === 'gate') {
            if (e.passed) continue
            if (pRight >= e.x) {
              // open the math gate — pause the world
              r.activeGate = e
              setGateQ(makeMathQuestion())
              break
            }
          }
        }

        // cull off-screen entities
        if (r.ents.length > 0 && r.ents[0].x < r.worldX - 80) {
          r.ents = r.ents.filter((e) => e.x >= r.worldX - 80 || (e.kind === 'gate' && !e.passed))
        }

        // finish line
        if (!r.finished && pwx >= RUN.FINISH_X) {
          r.finished = true
          sfx.complete()
        }

        if (died || r.finished) {
          setTick((v) => v + 1)
          finish()
          return
        }
      }
      setTick((v) => v + 1)
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [phase, gateQ, finish])

  /* -------- gate answering: clear reward / clear drawback -------- */
  const answerGate = (opt: string) => {
    if (!gateQ) return
    const correct = opt === gateQ.answer
    const r = run.current
    if (r.activeGate) r.activeGate.passed = true
    r.activeGate = null
    setGateQ(null)
    if (correct) {
      // BENEFIT: points + coins + a shield that soaks the next spikes
      sfx.correct()
      r.gatesOk++
      r.coins += RUN.GATE_COINS
      r.shield = RUN.SHIELD_FRAMES
      setFlash('ok')
    } else {
      // DRAWBACK: lose a life AND points (brief i-frames so it can't chain)
      sfx.wrong()
      r.lives--
      r.wrongs++
      r.invuln = RUN.INVULN_FRAMES
      setFlash('no')
    }
    setTimeout(() => setFlash(null), 150)
    if (r.lives <= 0) finish()
  }

  /* -------- start -------- */
  const start = () => {
    submitted.current = false
    run.current = freshRun()
    setFinalScore(0)
    setRewards({ xp: 0, gems: 0 })
    setUnlockedCard(null)
    setGateQ(null)
    setFlash(null)
    setTimeLeft(RUN.ROUND_SECONDS)
    setPhase('play')
    sfx.tap()
  }

  const r = run.current
  const liveScore = computeRunScore(r.worldX, r.coins, r.gatesOk, r.finished, r.wrongs)
  const shownScore = phase === 'over' ? finalScore : liveScore
  const isPb = phase === 'over' && finalScore > best && finalScore > 0
  const unlockedDef = unlockedCard ? ARCADE_CARD_BY_ID[unlockedCard] : null
  const unlockedGoal = unlockedCard ? ARCADE_CARD_GOALS[unlockedCard] : null
  const pwx = r.worldX + RUN.PLAYER_X
  const progressPct = Math.min(100, (pwx / RUN.FINISH_X) * 100)

  /* ---------------- ready ---------------- */
  if (phase === 'ready') {
    return (
      <div className="mx-auto w-full max-w-xl px-4 pb-28 pt-8 text-center">
        <div className="text-6xl">{game.icon}</div>
        <h2 className="mt-3 font-display text-2xl font-extrabold text-speed-blue">{game.title}</h2>
        <p className="mt-1 font-body text-sm font-bold text-slate-400">{game.desc}</p>
        <div className="card-white mx-auto mt-6 max-w-sm text-left text-sm font-bold text-slate-500">
          <p>⏱ {RUN.ROUND_SECONDS}s · ❤️ 3 lives</p>
          <p>🧡 Tap or press Space — Sonic jumps over 🟥 spikes and sweeps 🪙 coin arcs</p>
          <p>
            ✅ Gate right: <strong className="text-emerald-600">+{RUN.GATE_SCORE} pts &amp; 🛡️ shield</strong> ·
            ❌ wrong: <strong className="text-red-500">−1 ❤️ &amp; −{RUN.WRONG_PENALTY} pts</strong>
          </p>
          <p>🚩 Reach the finish line for a {RUN.FINISH_BONUS} point bonus</p>
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

  /* ---------------- over ---------------- */
  if (phase === 'over') {
    const reachedFinish = r.finished
    return (
      <div className="mx-auto w-full max-w-xl px-4 pb-28 pt-8 text-center">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="text-6xl">{reachedFinish ? '🏁' : finalScore > 0 ? '🎉' : '😅'}</div>
          <h2 className="mt-3 font-display text-2xl font-extrabold text-speed-blue">
            {reachedFinish ? 'Finish!' : "Time's up!"}
          </h2>
          <p className="mt-2 font-display text-4xl font-extrabold text-emerald-500">{finalScore}</p>
          <p className="mt-1 text-sm font-bold text-slate-400">
            🪙 {r.coins} coins · 🚧 {r.gatesOk}/{GATE_COUNT} gates
            {r.wrongs > 0 && <> · ❌ {r.wrongs} wrong (−{r.wrongs * RUN.WRONG_PENALTY})</>}
            {reachedFinish ? ` · 🚩 +${RUN.FINISH_BONUS}` : ''}
          </p>
          {rewards.xp + rewards.gems > 0 && (
            <p className="mt-1 font-display font-extrabold text-sky-500">
              ⚡ +{rewards.xp} XP · 💎 +{rewards.gems}
            </p>
          )}
          {isPb && <p className="mt-1 font-display font-bold text-amber-500">⭐ NEW PERSONAL BEST!</p>}
          <p className="mt-1 text-sm font-bold text-slate-400">Previous best: {best || '—'}</p>
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

  /* ---------------- play ---------------- */
  const blink = r.invuln > 0 && Math.floor(r.invuln / 6) % 2 === 0
  const expression = r.shield > 0 ? 'cheer' : r.onGround ? 'happy' : 'excited'

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-28 pt-4">
      <div className="mb-4 flex items-center justify-between font-display font-extrabold">
        <span className="rounded-xl bg-speed-bluelight px-3 py-1 text-speed-blue">🏆 {shownScore}</span>
        <span className={`rounded-xl px-3 py-1 ${timeLeft <= 10 ? 'bg-red-100 text-red-500' : 'bg-slate-100 text-slate-600'}`}>
          ⏱ {timeLeft}s
        </span>
        <span className="rounded-xl bg-amber-100 px-3 py-1 text-amber-600">
          ❤️ {r.lives}/3 · 🪙 {r.coins}
          {r.wrongs > 0 && <> · ❌{r.wrongs}</>}
          {r.shield > 0 && <> · 🛡️</>}
        </span>
      </div>

      {/* progress to finish */}
      <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-emerald-400 transition-[width] duration-100" style={{ width: `${progressPct}%` }} />
      </div>

      {/* stage */}
      <div
        className={`relative w-full overflow-hidden rounded-2xl border-2 border-slate-800 bg-sky-300 ${
          flash === 'ok' ? '!bg-emerald-100' : flash === 'no' ? '!bg-red-100' : ''
        }`}
        style={{ aspectRatio: `${RUN.STAGE_W} / ${RUN.STAGE_H}` }}
      >
        {/* parallax clouds */}
        <div
          className="absolute inset-x-0 top-0 h-1/3 opacity-70"
          style={{
            backgroundImage:
              'radial-gradient(circle at 30% 50%, #fff 18px, transparent 19px), radial-gradient(circle at 70% 40%, #fff 14px, transparent 15px)',
            backgroundSize: '180px 70px',
            backgroundRepeat: 'repeat-x',
            backgroundPositionX: `${-r.worldX * 0.15}px`,
          }}
        />
        {/* parallax hills */}
        <div
          className="absolute inset-x-0"
          style={{
            bottom: `${GROUND_PCT}%`,
            height: '34%',
            backgroundImage: 'radial-gradient(circle at 50% 100%, #86efac 42%, transparent 43%)',
            backgroundSize: '130px 130px',
            backgroundRepeat: 'repeat-x',
            backgroundPositionX: `${-r.worldX * 0.35}px`,
          }}
        />
        {/* ground */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            height: `${GROUND_PCT}%`,
            background: 'linear-gradient(#4ade80 0 8px, #16a34a 8px 14px, #7c4a1e 14px)',
            backgroundSize: '32px 100%',
            backgroundPositionX: `${-r.worldX}px`,
          }}
        />

        {/* finish flag */}
        {(() => {
          const sx = (RUN.FINISH_X - r.worldX) / RUN.STAGE_W * 100
          if (sx < -5 || sx > 105) return null
          return (
            <div
              className="absolute z-10"
              style={{
                left: `${sx}%`,
                bottom: `${GROUND_PCT}%`,
                width: '3%',
                height: '40%',
              }}
            >
              <div
                className="h-full w-full"
                style={{
                  background:
                    'repeating-conic-gradient(#fff 0% 25%, #1f2937 0% 50%) 0 0 / 10px 10px',
                  borderLeft: '2px solid #1f2430',
                }}
              />
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-sm">🚩</div>
            </div>
          )
        })()}

        {/* entities */}
        {r.ents.map((e, i) => {
          const sx = ((e.x - r.worldX) / RUN.STAGE_W) * 100
          if (sx < -8 || sx > 108) return null
          if (e.kind === 'spike') {
            return (
              <div
                key={`s${i}`}
                className="absolute"
                style={{ left: `${sx}%`, bottom: `${GROUND_PCT}%`, width: '5%', height: '9%' }}
              >
                <SpikeSprite />
              </div>
            )
          }
          if (e.kind === 'coin') {
            if (e.got) return null
            return (
              <div
                key={`c${i}`}
                className="absolute"
                style={{
                  left: `${sx - 1.5}%`,
                  bottom: `calc(${GROUND_PCT}% + ${pctY(e.h)}%)`,
                  width: '4%',
                  height: '7%',
                }}
              >
                <CoinSprite />
              </div>
            )
          }
          // gate
          return (
            <div
              key={`g${i}`}
              className="absolute"
              style={{
                left: `${sx}%`,
                bottom: `${GROUND_PCT}%`,
                width: '2.8%',
                height: `${100 - GROUND_PCT}%`,
              }}
            >
              <div
                className={`h-full w-full border-l-4 border-dashed ${
                  e.passed ? 'border-emerald-400 bg-emerald-200/30' : 'border-amber-500 bg-amber-200/40'
                }`}
              />
              {!e.passed && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-xs">🚧</span>
              )}
            </div>
          )
        })}

        {/* player — Sonic */}
        <div
          className="absolute z-20"
          aria-label="Runner"
          style={{
            left: `${pctX(RUN.PLAYER_X)}%`,
            bottom: `calc(${GROUND_PCT}% + ${pctY(r.py)}%)`,
            width: `${pctX(RUN.PLAYER_W)}%`,
            height: `${pctY(RUN.PLAYER_H)}%`,
            opacity: blink ? 0.35 : 1,
          }}
        >
          <Mascot id="sonic" expression={expression} />
          {r.shield > 0 && (
            <div className="pointer-events-none absolute -inset-[12%] rounded-full border-2 border-cyan-300 shadow-[0_0_10px_#22d3ee]" />
          )}
        </div>

        {/* gate question overlay */}
        {gateQ && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/55 p-3">
            <div className="w-full max-w-xs rounded-xl bg-white p-3 text-center shadow-lg">
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-amber-500">🚧 Math gate</p>
              <p className="font-display text-xl font-extrabold text-slate-800">{gateQ.text} = ?</p>
              <p className="mt-0.5 text-[10px] font-bold text-slate-400">
                ✅ +{RUN.GATE_SCORE} &amp; 🛡️ shield · ❌ −1 ❤️ &amp; −{RUN.WRONG_PENALTY}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {gateQ.options.map((opt) => (
                  <button
                    key={opt}
                    className="btn3d btn-green !py-2 !text-base font-display font-extrabold"
                    onClick={() => answerGate(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* jump control */}
      <div className="mt-4 flex justify-center">
        <button className="btn3d btn-green !px-14 !py-3 font-display text-lg font-extrabold" onPointerDown={jump}>
          ⬆ JUMP
        </button>
      </div>
      <p className="mt-2 text-center text-xs font-bold text-slate-400">Space / ↑ / W also jumps</p>
    </div>
  )
}
