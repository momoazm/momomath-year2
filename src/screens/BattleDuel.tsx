import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { usePlayer, REPEAT_WIN_GEMS, LOSS_CONSOLATION_GEMS } from '../engine/store'
import { CARD_BY_ID, cardImageUrl } from '../engine/cards'
import type { ChestResult } from '../engine/cards'
import {
  advance,
  createDuel,
  swapIn,
  type DuelCard,
  type DuelLogEntry,
  type DuelQuestion,
  type DuelState,
} from '../engine/battle/duel'
import {
  BATTLE_DIFFICULTIES,
  DEFAULT_BATTLE_DIFFICULTY,
  battleDifficultyDef,
  type BattleDifficulty,
} from '../engine/battle/difficulty'
import {
  autoPickStrongest,
  gymBotDuelCards,
  ownedSquadEntries,
  playerDuelCard,
  SQUAD_SIZE,
} from '../engine/battle/squad'
import { buildBattleDeck } from '../engine/battle/questions'
import { GYM_GEMS, GYM_XP, TOTAL_NODES, gymDef } from '../engine/battle/roadmap'
import { ARCHETYPE_META } from '../engine/battle/archetypes'
import { BATTLE_XP_LOSS, BATTLE_XP_WIN } from '../engine/battle/stats'
import { TEAM_BLAST_CHARGE } from '../engine/battle/moves'
import { sfx } from '../engine/sfx'

/**
 * WS22/WS26 — Momo Battle duel screen (additive, §13.6 / §13.10). Full-screen
 * overlay:
 *
 *   pick  → squad picker (owned cards only; star row + battle level + HP/ATK;
 *           auto-pick-strongest default; friendly hint at 0 cards) +
 *           WS26 rival-difficulty picker (Easy → Impossible)
 *   intro → VS panel (your 3 vs the gym's villain squad + difficulty chip)
 *   fight → 3v3 question duel (§13.10): EVERY turn carries a question and a
 *           correct answer is the only way to deal damage — both ways (the
 *           rival answers its own, visibly). Power turns fire Specials; the
 *           Team-Blast meter charges on correct Power answers; CSS arena
 *           backdrop behind the fighters; hit/KO/miss banner, faint-swap, sfx
 *   result→ prizes (§13.4 payouts via battleFinished), card XP, retry/map
 *
 * The engine drives everything; this file is the state machine around it.
 * Pacing: the rival's turn resolves on a short beat so its answer is visible.
 */

type Stage = 'pick' | 'intro' | 'fight' | 'result'

/** Beat before an auto/bot turn resolves (ms) so hits are watchable. */
const AUTO_BEAT_MS = 700
/** Beat before the bot's next card swaps in after a KO (ms). */
const FAINT_BEAT_MS = 950
/** How long the ✅/❌ answer chip stays up (ms). */
const ANSWER_FLASH_MS = 850

interface ResultInfo {
  won: boolean
  firstClear: boolean
  gems: number
  xp: number
  cardXp: number
  /** first-clear victory chest (WS23), revealed on the result screen */
  chest?: ChestResult | null
}

function nameOf(state: DuelState, uid: string): string {
  const all = [...state.player, ...state.bot]
  return all.find((c) => c.uid === uid)?.name ?? uid
}

function hpColor(pct: number): string {
  if (pct > 0.5) return 'bg-emerald-400'
  if (pct > 0.25) return 'bg-amber-400'
  return 'bg-rose-500'
}

function starRow(star: number): string {
  return '★'.repeat(star) + '☆'.repeat(Math.max(0, 5 - star))
}

/** One HP bar + portrait for a combatant. */
function HpBar({
  card,
  hp,
  active,
  side,
}: {
  card: DuelCard
  hp: number
  active: boolean
  side: 'player' | 'bot'
}) {
  const max = Math.max(1, Math.round(card.stats.hp))
  const pct = Math.max(0, Math.min(1, hp / max))
  const down = hp <= 0
  const def = CARD_BY_ID[card.cardId]
  const meta = ARCHETYPE_META[card.archetype]
  return (
    <div
      className={`flex items-center gap-2 rounded-2xl border-2 px-2 py-1.5 transition-all ${
        down
          ? 'border-slate-100 bg-slate-50 opacity-50'
          : active
            ? side === 'bot'
              ? 'border-rose-300 bg-rose-50 ring-2 ring-rose-200'
              : 'border-speed-blue bg-speed-bluelight ring-2 ring-blue-200'
            : 'border-slate-100 bg-white'
      }`}
    >
      {def ? (
        <img src={cardImageUrl(def)} alt={card.name} className={`h-9 w-9 shrink-0 object-contain ${down ? 'grayscale' : ''}`} />
      ) : (
        <div className="h-9 w-9 shrink-0 rounded-xl bg-slate-100" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-1">
          <span className="truncate font-display text-xs font-extrabold text-slate-700">{card.name}</span>
          <span className="shrink-0 text-[9px] font-bold text-slate-400">{meta.icon}</span>
        </div>
        <div className="mt-0.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-[width] duration-500 ${hpColor(pct)}`}
            style={{ width: `${Math.round(pct * 100)}%` }}
          />
        </div>
        <div className="mt-0.5 flex items-center justify-between">
          <span className="text-[9px] font-bold text-slate-400">{down ? '💫 fainted' : `${Math.max(0, Math.round(hp))}/${max}`}</span>
          <span className="text-[9px] font-bold text-amber-500">{down ? '' : starRow(card.star)}</span>
        </div>
      </div>
    </div>
  )
}

/** The 3 Team-Blast pips. */
function ChargePips({ charge, label, ready }: { charge: number; label: string; ready?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">{label}</span>
      {Array.from({ length: TEAM_BLAST_CHARGE }).map((_, i) => (
        <span
          key={i}
          className={`h-2.5 w-2.5 rounded-full transition-all ${
            i < charge ? (ready ? 'scale-125 bg-rose-500 shadow-sm shadow-rose-300' : 'bg-speed-blue') : 'bg-slate-200'
          }`}
        />
      ))}
      {ready && <span className="animate-pulse text-[10px] font-extrabold text-rose-500">🔥 TEAM BLAST!</span>}
    </div>
  )
}

/**
 * WS26 — decorative arena backdrop for the duel + VS stages (pure CSS, no
 * assets — safe under the no-IP-art rule). `MotionConfig reducedMotion="user"`
 * disables the cloud drift for users who ask for reduced motion.
 */
function ArenaBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* sky */}
      <div className="absolute inset-x-0 top-0 h-3/4 bg-gradient-to-b from-sky-200/70 via-sky-100/40 to-transparent" />
      {/* sun */}
      <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-amber-200/80 blur-2xl" />
      {/* drifting clouds */}
      <motion.div
        className="absolute left-2 top-8 h-6 w-24 rounded-full bg-white/80 blur-[1px]"
        animate={{ x: [0, 16, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-10 top-24 h-5 w-16 rounded-full bg-white/70 blur-[1px]"
        animate={{ x: [0, -12, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* arena floor */}
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-emerald-200/80 via-emerald-100/40 to-transparent" />
      <div className="absolute inset-x-10 bottom-8 h-28 rounded-[100%] border-2 border-white/60 bg-white/20" />
    </div>
  )
}

/**
 * WS26 — the visible arena scene at the top of the fight stage: sky, sun,
 * drifting clouds, distant hills and a grass horizon (pure CSS, no assets).
 * The full-bleed `ArenaBackdrop` stays behind the cards; this strip is what
 * makes the "we're in an arena" read obvious at a glance.
 */
function ArenaScene() {
  return (
    <div
      aria-hidden="true"
      className="relative mb-3 h-28 overflow-hidden rounded-2xl border-2 border-sky-100 bg-gradient-to-b from-sky-300 to-sky-100"
    >
      <div className="absolute right-4 top-3 h-10 w-10 rounded-full bg-amber-300 shadow-[0_0_24px_8px_rgba(252,211,77,0.65)]" />
      <motion.div
        className="absolute left-3 top-4 h-4 w-16 rounded-full bg-white/90 shadow-sm"
        animate={{ x: [0, 18, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute left-24 top-10 h-3.5 w-12 rounded-full bg-white/80 shadow-sm"
        animate={{ x: [0, -14, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute -bottom-6 -left-6 h-16 w-32 rounded-[50%] bg-emerald-200/80" />
      <div className="absolute -bottom-8 left-20 h-20 w-44 rounded-[50%] bg-emerald-300/70" />
      <div className="absolute -bottom-7 right-0 h-16 w-36 rounded-[50%] bg-emerald-200/80" />
      <div className="absolute inset-x-0 bottom-0 h-5 bg-gradient-to-t from-emerald-400/80 to-emerald-300/60" />
    </div>
  )
}

export function BattleDuel({ gym, dailyRival, onExit }: { gym: number; dailyRival?: boolean; onExit: () => void }) {
  const cardStars = usePlayer((s) => s.cardStars)
  const cardBattleXp = usePlayer((s) => s.cardBattleXp)
  const lessonProgress = usePlayer((s) => s.lessonProgress)
  const subject = usePlayer((s) => s.subject)
  const battleCleared = usePlayer((s) => s.battleCleared)
  const battleFinished = usePlayer((s) => s.battleFinished)

  const gDef = gymDef(gym)
  const firstClearNow = !battleCleared.includes(gym)

  const entries = useMemo(() => ownedSquadEntries(cardStars, cardBattleXp), [cardStars, cardBattleXp])
  const [difficulty, setDifficulty] = useState<BattleDifficulty>(DEFAULT_BATTLE_DIFFICULTY)
  const diffMeta = battleDifficultyDef(difficulty)
  const botCards = useMemo(() => gymBotDuelCards(gym, difficulty), [gym, difficulty])

  const [stage, setStage] = useState<Stage>('pick')
  const [sel, setSel] = useState<string[]>(() => autoPickStrongest(entries))
  const [duel, setDuel] = useState<DuelState | null>(null)
  const [result, setResult] = useState<ResultInfo | null>(null)
  const [answerFlash, setAnswerFlash] = useState<'correct' | 'wrong' | null>(null)
  const [lastChosen, setLastChosen] = useState<number | null>(null)

  const attemptRef = useRef(0)
  const settledRef = useRef(false)
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const need = Math.min(SQUAD_SIZE, Math.max(1, entries.length))
  const hasCards = entries.length > 0
  const squadReady = sel.length === need

  // ---- battle lifecycle -------------------------------------------------
  function startBattle(ids: string[]) {
    const seed = gym * 7919 + attemptRef.current * 104729 + 13
    attemptRef.current += 1
    settledRef.current = false
    const byId = new Map(entries.map((e) => [e.def.id, e]))
    const playerCards = ids
      .map((id) => byId.get(id))
      .filter((e): e is NonNullable<typeof e> => !!e)
      .map(playerDuelCard)
    if (playerCards.length === 0) return
    const deck = buildBattleDeck({ subject, progress: lessonProgress, gym, seed })
    const questions: DuelQuestion[] = deck.map((q) => ({
      prompt: q.prompt,
      choices: q.choices,
      answerIndex: q.answerIndex,
    }))
    setAnswerFlash(null)
    setLastChosen(null)
    setDuel(
      createDuel({
        player: { cards: playerCards },
        bot: { cards: botCards },
        seed,
        questions,
        botAccuracy: diffMeta.accuracy,
      }),
    )
    setStage('intro')
  }

  // The question to show right now: surfaced by the engine on 'power' (every
  // player turn, WS26), or built for the opening turn ('intro' = turn 0).
  const pendingQuestion: DuelQuestion | null = useMemo(() => {
    if (!duel || stage !== 'fight') return null
    if (duel.phase === 'power') return duel.question
    if (duel.phase === 'intro') {
      if (duel.turn % 2 === 0 && duel.questions.length > 0) {
        return duel.questions[duel.qIndex % duel.questions.length]!
      }
    }
    return null
  }, [duel, stage])

  // Auto beats: bot/normal turns + bot KO swaps resolve on a timer.
  useEffect(() => {
    if (stage !== 'fight' || !duel) return
    const p = duel.phase
    if (p === 'won' || p === 'lost') {
      if (settledRef.current) return
      settledRef.current = true
      const won = p === 'won'
      const wasFirst = won && !battleCleared.includes(gym)
      const perCardXp: Record<string, number> = {}
      for (const id of sel) perCardXp[id] = won ? BATTLE_XP_WIN : BATTLE_XP_LOSS
      const chest = battleFinished({
        gym,
        won,
        gems: GYM_GEMS[gym] ?? 0,
        xp: GYM_XP[gym] ?? 0,
        perCardXp,
        dailyRival,
      })
      setResult({
        won,
        firstClear: wasFirst,
        gems: won ? (wasFirst ? GYM_GEMS[gym] ?? 0 : REPEAT_WIN_GEMS) : LOSS_CONSOLATION_GEMS,
        xp: won && wasFirst ? GYM_XP[gym] ?? 0 : 0,
        cardXp: won ? BATTLE_XP_WIN : BATTLE_XP_LOSS,
        chest,
      })
      if (won) sfx.complete()
      else sfx.wrong()
      setStage('result')
      return
    }
    const waitsForPlayer =
      (p === 'power' && !!pendingQuestion) || (p === 'intro' && !!pendingQuestion) || p === 'playerFainted'
    if (waitsForPlayer) return
    const ms = p === 'botFainted' ? FAINT_BEAT_MS : AUTO_BEAT_MS
    const t = setTimeout(() => {
      setDuel((cur) => {
        if (!cur) return cur
        if (cur.phase === 'botFainted') return swapIn(cur)
        if (cur.phase === 'auto' || cur.phase === 'intro') return advance(cur)
        return cur
      })
    }, ms)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duel, stage])

  function answer(chosen: number) {
    if (!duel || !pendingQuestion) return
    const correct = chosen === pendingQuestion.answerIndex
    if (correct) sfx.correct()
    else sfx.wrong()
    setAnswerFlash(correct ? 'correct' : 'wrong')
    setLastChosen(chosen)
    if (flashTimer.current) clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => setAnswerFlash(null), ANSWER_FLASH_MS)
    setDuel(advance(duel, { chosen, correct }))
  }

  function pickNext(index: number) {
    if (!duel || duel.phase !== 'playerFainted') return
    sfx.tap('swap')
    setDuel(swapIn(duel, index))
  }

  function quit() {
    if (flashTimer.current) clearTimeout(flashTimer.current)
    sfx.tap('quit')
    onExit()
  }

  function replay() {
    sfx.tap('replay')
    startBattle(sel)
  }

  const lastEntry: DuelLogEntry | null = duel && duel.log.length > 0 ? duel.log[duel.log.length - 1]! : null
  const lastAnswerCorrect = answerFlash === 'correct'

  return (
    <MotionConfig reducedMotion="user">
      <div className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-b from-paper to-white">
        {/* header */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-slate-100 bg-white/95 px-4 py-2.5 backdrop-blur">
          <button onClick={quit} className="rounded-xl px-3 py-1.5 font-display text-sm font-extrabold text-slate-400 hover:text-slate-600" aria-label="Leave battle">
            ✕
          </button>
          <div className="text-center">
            <p className="font-display text-sm font-extrabold text-slate-800">
              #{gym} · {gDef.name}
            </p>
            <p className="text-[10px] font-bold text-slate-400">
              {gDef.villain}'s squad · {diffMeta.emoji} {diffMeta.label}
            </p>
          </div>
          <div className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-extrabold text-amber-700">
            {firstClearNow ? `💎${GYM_GEMS[gym]}` : `+${REPEAT_WIN_GEMS}💎`}
          </div>
        </header>

        <div className="mx-auto w-full max-w-xl px-4 pb-8 pt-4">
          {/* ---------------- SQUAD PICKER ---------------- */}
          {stage === 'pick' && (
            <div>
              {!hasCards ? (
                <section className="card-white mt-6 bg-gradient-to-r from-purple-50 to-fuchsia-50 text-center">
                  <p className="text-4xl">🎒</p>
                  <p className="mt-2 font-display text-lg font-extrabold text-slate-800">No cards yet!</p>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Finish a lesson to open a chest — win your first card and your squad is ready to fight.
                  </p>
                  <button onClick={quit} className="btn-blue mt-4 w-full rounded-2xl py-3 font-display text-sm font-extrabold uppercase">
                    Back to map
                  </button>
                </section>
              ) : (
                <>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="font-display text-lg font-extrabold text-slate-800">Pick your squad</h2>
                    <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${squadReady ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                      {sel.length}/{need} picked
                    </span>
                  </div>

                  <ul className="grid grid-cols-2 gap-3">
                    {entries.map((e) => {
                      const on = sel.includes(e.def.id)
                      const meta = ARCHETYPE_META[e.archetype]
                      return (
                        <li key={e.def.id}>
                          <button
                            aria-pressed={sel.includes(e.def.id)}
                            aria-label={`${e.def.name}${sel.includes(e.def.id) ? ', selected' : ''}`}
                            onClick={() => {
                              sfx.tap(e.def.id)
                              setSel((cur) => {
                                if (cur.includes(e.def.id)) return cur.filter((x) => x !== e.def.id)
                                if (cur.length >= need) return [...cur.slice(1), e.def.id] // keep it full: swap oldest
                                return [...cur, e.def.id]
                              })
                            }}
                            className={`w-full rounded-2xl border-2 bg-white p-2.5 text-left transition-all ${
                              on ? 'border-speed-blue ring-2 ring-blue-200 shadow-pop' : 'border-slate-100 hover:border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <img src={cardImageUrl(e.def)} alt={e.def.name} className="h-14 w-14 object-contain" />
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${on ? 'bg-speed-blue text-white' : 'bg-slate-100 text-slate-400'}`}>
                                {on ? '✓ Picked' : 'Pick'}
                              </span>
                            </div>
                            <p className="mt-1 truncate font-display text-sm font-extrabold text-slate-800">{e.def.name}</p>
                            <p className="text-[11px] font-bold text-amber-500">
                              {starRow(e.star)} <span className="text-slate-400">· Lv{e.level}</span>
                            </p>
                            <p className="mt-1 flex flex-wrap gap-1 text-[10px] font-bold">
                              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-600">❤️ {e.stats.hp}</span>
                              <span className="rounded bg-rose-50 px-1.5 py-0.5 text-rose-500">⚔️ {e.stats.atk}</span>
                              <span className="rounded bg-sky-50 px-1.5 py-0.5 text-sky-500">🛡️ {e.stats.def}</span>
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-500">
                                {meta.icon} {meta.label}
                              </span>
                            </p>
                          </button>
                        </li>
                      )
                    })}
                  </ul>

                  {entries.length < SQUAD_SIZE && (
                    <p className="mt-3 rounded-2xl bg-amber-50 px-3 py-2 text-center text-xs font-bold text-amber-600">
                      💡 Tip: open more chests to bring a full {SQUAD_SIZE}-card squad!
                    </p>
                  )}

                  <section className="mt-4 rounded-2xl border-2 border-slate-100 bg-white p-3">
                    <p className="font-display text-xs font-extrabold uppercase tracking-wide text-slate-400">
                      👑 Rival difficulty
                    </p>
                    <div className="mt-2 grid grid-cols-4 gap-2" role="radiogroup" aria-label="Rival difficulty">
                      {BATTLE_DIFFICULTIES.map((d) => {
                        const on = d.key === difficulty
                        return (
                          <button
                            key={d.key}
                            role="radio"
                            aria-checked={on}
                            aria-label={`${d.label} difficulty`}
                            onClick={() => {
                              sfx.tap('difficulty')
                              setDifficulty(d.key)
                            }}
                            className={`rounded-xl border-2 px-1 py-2 text-center transition-all active:scale-95 ${
                              on
                                ? 'border-speed-blue bg-speed-bluelight ring-2 ring-blue-200'
                                : 'border-slate-100 bg-white hover:border-slate-200'
                            }`}
                          >
                            <span className="block text-lg" aria-hidden="true">
                              {d.emoji}
                            </span>
                            <span className={`block font-display text-[10px] font-extrabold ${on ? 'text-speed-blue' : 'text-slate-500'}`}>
                              {d.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                    <p className="mt-2 text-center text-[11px] font-bold text-slate-500">{diffMeta.tagline}</p>
                    <p className="mt-0.5 text-center text-[10px] font-bold text-slate-400">
                      Rival: ❤️ ×{diffMeta.hpMul} · ⚔️ ×{diffMeta.atkMul} · answers ~{Math.round(diffMeta.accuracy * 100)}% of questions right
                    </p>
                  </section>

                  <button
                    disabled={!squadReady}
                    onClick={() => {
                      sfx.tap('fight')
                      startBattle(sel)
                    }}
                    className={`mt-5 w-full rounded-2xl py-3.5 font-display text-base font-extrabold uppercase tracking-wide transition-transform active:scale-95 ${
                      squadReady ? 'btn-blue' : 'cursor-not-allowed bg-slate-200 text-slate-400'
                    }`}
                  >
                    ⚔️ Fight!
                  </button>
                </>
              )}
            </div>
          )}

          {/* ---------------- VS INTRO ---------------- */}
          {stage === 'intro' && duel && (
            <div className="relative pt-2">
              <ArenaBackdrop />
              <p className="text-center font-display text-xs font-extrabold uppercase tracking-widest text-slate-400">3 vs 3 · cover your eyes, it's a brawl!</p>
              <div className="mt-3 space-y-3">
                <div className="card-white">
                  <p className="font-display text-xs font-extrabold uppercase text-speed-blue">Your squad</p>
                  <ul className="mt-2 grid grid-cols-3 gap-2">
                    {duel.player.map((c) => (
                      <li key={c.uid} className="rounded-xl bg-speed-bluelight p-2 text-center">
                        {CARD_BY_ID[c.cardId] && (
                          <img src={cardImageUrl(CARD_BY_ID[c.cardId]!)} alt={c.name} className="mx-auto h-14 w-14 object-contain" />
                        )}
                        <p className="truncate font-display text-[11px] font-extrabold text-slate-700">{c.name}</p>
                        <p className="text-[9px] font-bold text-amber-500">{starRow(c.star)}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="card-white">
                  <p className="font-display text-xs font-extrabold uppercase text-rose-500">
                    {gDef.villain}'s squad
                    {gDef.champion && <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-purple-600">👑 CHAMPION</span>}
                    <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-slate-500">
                      {diffMeta.emoji} {diffMeta.label}
                    </span>
                  </p>
                  <ul className="mt-2 grid grid-cols-3 gap-2">
                    {duel.bot.map((c, i) => (
                      <li key={c.uid} className={`rounded-xl p-2 text-center ${i === duel.bot.length - 1 ? 'bg-rose-50 ring-2 ring-rose-200' : 'bg-rose-50/50'}`}>
                        {CARD_BY_ID[c.cardId] && (
                          <img src={cardImageUrl(CARD_BY_ID[c.cardId]!)} alt={c.name} className="mx-auto h-14 w-14 object-contain" />
                        )}
                        <p className="truncate font-display text-[11px] font-extrabold text-slate-700">{c.name}</p>
                        <p className="text-[9px] font-bold text-amber-500">{starRow(c.star)}</p>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-1 text-center text-[10px] font-bold text-slate-400">👑 {duel.bot[duel.bot.length - 1]?.name} fights LAST!</p>
                </div>
              </div>
              <button
                onClick={() => {
                  sfx.whoosh()
                  setStage('fight')
                }}
                className="btn-blue mt-5 w-full rounded-2xl py-3.5 font-display text-base font-extrabold uppercase tracking-wide transition-transform active:scale-95"
              >
                ⚔️ FIGHT!
              </button>
            </div>
          )}

          {/* ---------------- DUEL ---------------- */}
          {stage === 'fight' && duel && (
            <div className="relative">
              <ArenaBackdrop />
              <ArenaScene />
              {/* bot side */}
              <div className="grid grid-cols-3 gap-2">
                {duel.bot.map((c, i) => (
                  <HpBar key={c.uid} card={c} hp={duel.botHp[i]!} active={i === duel.botActive} side="bot" />
                ))}
              </div>

              {/* battle banner */}
              <div className="my-3 min-h-[64px] rounded-2xl border-2 border-dashed border-slate-200 bg-white/80 p-3 text-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={duel.log.length}
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22 }}
                  >
                    {!lastEntry && <p className="font-display text-sm font-extrabold text-slate-400">⚔️ FIGHT!</p>}
                    {lastEntry && lastEntry.kind === 'hit' && (
                      <>
                        <p className="font-display text-sm font-extrabold text-slate-800">
                          {lastEntry.side === 'player' ? '🔵 ' : '🔴 '}
                          {nameOf(duel, lastEntry.attackerUid)}{' '}
                          {lastEntry.side === 'player' ? 'used' : 'answered right —'}{' '}
                          <span className={lastEntry.move === 'quick' ? 'text-slate-600' : 'text-purple-600'}>{lastEntry.moveName}</span>
                          {lastEntry.teamBlast && ' 🔥'} · {lastEntry.damage} dmg
                        </p>
                        <p className="mt-0.5 text-xs font-bold">
                          {lastEntry.ko && <span className="text-rose-500">💫 {nameOf(duel, lastEntry.targetUid)} fainted!</span>}
                          {!lastEntry.ko && lastEntry.effect === 'super' && <span className="text-emerald-600">🌟 SUPER EFFECTIVE!</span>}
                          {!lastEntry.ko && lastEntry.effect === 'weak' && <span className="text-slate-400">🛡️ Not very effective</span>}
                          {lastEntry.side === 'player' && answerFlash && (
                            <span className={lastAnswerCorrect ? 'text-emerald-600' : 'text-rose-500'}>
                              {lastAnswerCorrect ? ' ✅ Nice answer!' : ' ❌ Miss!'}
                            </span>
                          )}
                        </p>
                      </>
                    )}
                    {lastEntry && lastEntry.kind === 'miss' && (
                      <>
                        <p className="font-display text-sm font-extrabold text-slate-800">
                          {lastEntry.side === 'player'
                            ? `🔵 ${nameOf(duel, lastEntry.actorUid)} missed the question — no damage!`
                            : `🛡️ ${nameOf(duel, lastEntry.actorUid)} missed its question — you're safe!`}
                        </p>
                        <p className="mt-0.5 text-xs font-bold text-slate-400">
                          {lastEntry.side === 'player'
                            ? '❌ Wrong answers deal no damage — get the next one right!'
                            : '🌟 The rival fumbled its turn!'}
                        </p>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* player side + meter */}
              <div className="grid grid-cols-3 gap-2">
                {duel.player.map((c, i) => (
                  <HpBar key={c.uid} card={c} hp={duel.playerHp[i]!} active={i === duel.playerActive} side="player" />
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <ChargePips charge={duel.charge} label="Team-Blast" ready={duel.charge >= TEAM_BLAST_CHARGE} />
                <ChargePips charge={duel.botCharge} label="Rival" ready={duel.botCharge >= TEAM_BLAST_CHARGE} />
              </div>

              {/* interaction panel */}
              <div className="mt-3">
                {duel.phase === 'playerFainted' && (
                  <div className="card-white bg-amber-50">
                    <p className="text-center font-display text-sm font-extrabold text-amber-700">💫 Who's next?</p>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {duel.player.map((c, i) => {
                        const alive = duel.playerHp[i]! > 0
                        return (
                          <button
                            key={c.uid}
                            disabled={!alive}
                            onClick={() => pickNext(i)}
                            className={`rounded-xl border-2 px-2 py-2 font-display text-xs font-extrabold transition-transform ${
                              alive ? 'border-speed-blue bg-white text-speed-blue active:scale-95' : 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300'
                            }`}
                          >
                            {c.name}
                            <span className="mt-0.5 block text-[9px] font-bold text-slate-400">
                              {alive ? `${Math.round(duel.playerHp[i]!)} HP` : '💫'}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {pendingQuestion && duel.phase !== 'playerFainted' && (
                  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="card-white bg-gradient-to-r from-purple-50 to-indigo-50">
                    <p className="font-display text-[11px] font-extrabold uppercase tracking-wide text-purple-500">
                      {duel.turn % 4 === 0
                        ? '⚡ POWER turn — answer right for a SPECIAL!'
                        : '🎯 Your turn — answer right to attack!'}
                    </p>
                    <p className="mt-1 font-display text-base font-extrabold leading-snug text-slate-800">{pendingQuestion.prompt}</p>
                    <div className="mt-2 grid gap-2">
                      {pendingQuestion.choices.map((choice, i) => {
                        const answered = answerFlash !== null
                        const isRight = i === pendingQuestion.answerIndex
                        const isPicked = i === lastChosen
                        let cls = 'border-slate-100 bg-white text-slate-700'
                        if (answered) {
                          // reveal: green on the right answer, red on the wrong pick
                          if (isRight) cls = 'border-emerald-400 bg-emerald-50 text-emerald-700'
                          else if (isPicked) cls = 'border-rose-400 bg-rose-50 text-rose-600'
                          else cls = 'border-slate-100 bg-white text-slate-300'
                        }
                        return (
                          <button
                            key={i}
                            disabled={answered}
                            onClick={() => answer(i)}
                            className={`rounded-2xl border-2 px-4 py-3 text-left font-display text-sm font-bold transition-transform active:scale-[0.98] ${cls} ${
                              answered ? '' : 'hover:border-purple-300'
                            }`}
                          >
                            <span className="mr-2 font-extrabold text-purple-400">{String.fromCharCode(65 + i)}.</span>
                            {choice}
                          </button>
                        )
                      })}
                    </div>
                    {answerFlash === 'wrong' && pendingQuestion && (
                      <p className="mt-1.5 text-center text-xs font-bold text-rose-500">
                        It was: {pendingQuestion.choices[pendingQuestion.answerIndex]}
                      </p>
                    )}
                  </motion.div>
                )}

                {!pendingQuestion && duel.phase === 'auto' && (
                  <p className="text-center text-xs font-bold text-slate-400">
                    🤔 {duel.bot[duel.botActive]?.name ?? 'The rival'} is answering its question…
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ---------------- RESULT ---------------- */}
          {stage === 'result' && result && (
            <div className="pt-6 text-center" role="status" aria-live="polite">
              <motion.p initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-6xl" aria-hidden="true">
                {result.won ? '🎉' : '💫'}
              </motion.p>
              <h2 className={`mt-2 font-display text-3xl font-extrabold ${result.won ? 'text-speed-blue' : 'text-slate-500'}`}>
                {result.won ? (result.firstClear ? 'VICTORY!' : 'You won again!') : 'So close!'}
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {result.won
                  ? result.firstClear
                    ? `${gDef.name} cleared — ${gDef.villain} is toast!`
                    : 'Replay win — the trophy cabinet likes a repeat.'
                  : 'No worries — free retry, nothing lost. You got this!'}
              </p>
              <p className="mt-1 text-xs font-bold text-slate-400">
                {diffMeta.emoji} {diffMeta.label} difficulty
              </p>

              <section className="card-white mt-5 bg-gradient-to-r from-amber-50 to-orange-50">
                <p className="font-display text-xs font-extrabold uppercase tracking-wide text-amber-600">Prizes</p>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                  <span className="rounded-full bg-white px-3 py-1.5 text-sm font-extrabold text-amber-700 shadow-sm">💎 +{result.gems}</span>
                  {result.xp > 0 && (
                    <span className="rounded-full bg-white px-3 py-1.5 text-sm font-extrabold text-speed-blue shadow-sm">⚡ +{result.xp} XP</span>
                  )}
                  {result.won && result.firstClear && (
                    <span className="rounded-full bg-white px-3 py-1.5 text-sm font-extrabold text-purple-600 shadow-sm">🏆 +1 trophy</span>
                  )}
                  <span className="rounded-full bg-white px-3 py-1.5 text-sm font-extrabold text-emerald-600 shadow-sm">
                    📈 +{result.cardXp} battle XP each
                  </span>
                </div>
                <p className="mt-2 text-[11px] font-bold text-slate-400">Squad: {sel.join(' · ')}</p>
                {result.chest && (
                  <div
                    className="mt-3 rounded-xl border-2 border-amber-300 bg-amber-50 p-3 text-center"
                    role="status"
                    aria-label="Victory Chest"
                  >
                    <p className="font-display text-sm font-extrabold text-amber-700">
                      🎁 Victory Chest · {result.chest.finalTier.toUpperCase()}
                    </p>
                    <p className="mt-0.5 text-[11px] font-bold text-amber-600">+{result.chest.gems} gems{result.chest.dust > 0 ? ` · +${result.chest.dust} dust` : ''}</p>
                    {result.chest.cards.length > 0 && (
                      <p className="mt-1 text-[11px] font-extrabold text-slate-700">
                        {result.chest.cards
                          .map((c) => CARD_BY_ID[c.cardId]?.name ?? c.cardId)
                          .join(' · ')}{' '}
                        card{result.chest.cards.length > 1 ? 's' : ''}!
                      </p>
                    )}
                  </div>
                )}
              </section>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button onClick={replay} className="btn-blue rounded-2xl py-3.5 font-display text-sm font-extrabold uppercase transition-transform active:scale-95">
                  🔁 Replay
                </button>
                <button
                  onClick={() => {
                    sfx.tap('map')
                    onExit()
                  }}
                  className="rounded-2xl border-2 border-slate-200 bg-white py-3.5 font-display text-sm font-extrabold uppercase text-slate-500 transition-transform active:scale-95"
                >
                  🗺️ Map
                </button>
              </div>
              {gym < TOTAL_NODES && (
                <p className="mt-3 text-xs font-bold text-slate-400">Next up: #{gym + 1} · {gymDef(Math.min(gym + 1, TOTAL_NODES)).name}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </MotionConfig>
  )
}
