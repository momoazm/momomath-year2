import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import {
  CARD_BY_ID,
  KICK_UPGRADE,
  cardImageUrl,
  copiesToNextStar,
  toStar,
  type ChestResult,
  type ChestTier,
} from '../../engine/cards'
import { usePlayer } from '../../engine/store'
import { sfx } from '../../engine/sfx'

const TIER_META: Record<ChestTier, { color: string; label: string; glow: string }> = {
  common:    { color: '#94a3b8', label: 'Common',    glow: 'rgba(148,163,184,0.4)' },
  rare:      { color: '#3b82f6', label: 'Rare',      glow: 'rgba(59,130,247,0.4)' },
  epic:      { color: '#a855f7', label: 'Epic',      glow: 'rgba(168,85,247,0.45)' },
  legendary: { color: '#f59e0b', label: 'Legendary', glow: 'rgba(245,158,11,0.5)' },
  exclusive: { color: '#ec4899', label: 'Exclusive', glow: 'rgba(236,72,153,0.5)' },
}
const TIER_RANK: ChestTier[] = ['common', 'rare', 'epic', 'legendary', 'exclusive']
const tierIdx = (t: ChestTier) => TIER_RANK.indexOf(t)

/**
 * Shared 4-kick chest reveal ritual used by LessonScreen (done) and
 * BattleScreen (victory). Pure presentational — callers pass the rolled
 * ChestResult (or null for redos) and an onContinue callback.
 */
export function ChestReveal({
  chestResult,
  xpEarned,
  streakBonus,
  isRedo,
  onContinue,
  continueLabel = 'Continue to roadmap ▶',
}: {
  chestResult: ChestResult | null
  xpEarned: number
  streakBonus?: number | null
  isRedo?: boolean
  onContinue: () => void
  continueLabel?: string
}) {
  const [kicksLeft, setKicksLeft] = useState(4)
  const [currentTier, setCurrentTier] = useState<ChestTier>('common')
  const [revealed, setRevealed] = useState(false)
  const [kickPulse, setKickPulse] = useState(0)
  const [flashTier, setFlashTier] = useState<ChestTier | null>(null)
  const [floater, setFloater] = useState<{ id: number; tier: ChestTier } | null>(null)
  const [shaking, setShaking] = useState(false)
  const cardStars = usePlayer((s) => s.cardStars)

  // PLAN 123: the grant lands BEFORE this reveal renders (Lesson + Battle both
  // grant first), so the card shows final stars — compute what this chest
  // actually upgraded so the NEW stars can pop in after the card lands.
  const firstCard = chestResult?.cards[0] ?? null
  const upgCount = firstCard ? (cardStars[firstCard.cardId] ?? firstCard.copies) : 0
  const gainedStars = firstCard
    ? toStar(upgCount) - toStar(Math.max(0, upgCount - firstCard.copies))
    : 0
  useEffect(() => {
    if (!revealed || gainedStars <= 0) return
    const t = setTimeout(() => sfx.leagueUp(), 550 + (gainedStars - 1) * 220)
    return () => clearTimeout(t)
  }, [revealed, gainedStars])

  const showChest = !!chestResult && !isRedo

  function onChestKick() {
    if (revealed) return
    if (kicksLeft <= 0) return
    if (!chestResult) return
    sfx.tap()
    setKickPulse((n) => n + 1)
    const kicksDone = 4 - kicksLeft
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
      const color = TIER_META[toTier].color
      confetti({
        particleCount: 60,
        spread: 90,
        origin: { y: 0.55 },
        colors: [color, TIER_META[fromTier].color, '#ffffff'],
        disableForReducedMotion: true,
      })
      setTimeout(() => {
        setFlashTier(null)
        setFloater(null)
        setShaking(false)
      }, 900)
    } else {
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

  return (
    <div className="w-full">
      {streakBonus !== null && streakBonus !== undefined && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 16 }}
          className="mx-auto mt-4 max-w-md rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-2 text-center font-display text-sm font-extrabold text-amber-600 shadow-pop"
        >
          🔥 {streakBonus}-DAY STREAK! BONUS HIGH-RARITY CHEST! 🎁
        </motion.div>
      )}

      {showChest && (
        <motion.div
          className="relative mx-auto mt-6 flex flex-col items-center"
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
              <div
                className="absolute inset-0 -m-4 rounded-[2.5rem] pointer-events-none"
                style={{
                  boxShadow: `0 0 60px 10px ${TIER_META[currentTier].glow}, inset 0 0 40px ${TIER_META[currentTier].glow}`,
                  opacity: 0.85,
                }}
              />
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
          {!revealed && (() => {
            const idx = tierIdx(currentTier)
            const canUpgrade = idx < 3
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
          {!revealed && (
            <div className="mt-2 flex gap-1.5" aria-label="Kicks remaining">
              {Array.from({ length: 4 }).map((_, i) => {
                const filled = i < 4 - kicksLeft
                return (
                  <motion.span
                    key={i}
                    animate={filled ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                    transition={filled ? { duration: 0.4, ease: 'easeOut' } : {}}
                    className="h-2 w-2 rounded-full"
                    style={{ background: filled ? TIER_META[currentTier].color : '#cbd5e1' }}
                  />
                )
              })}
            </div>
          )}
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
          <p className="mt-2 font-display text-sm font-extrabold text-blue-600">
            {chestResult.isNew
              ? `✨ NEW CARD! +${chestResult.copies} ${chestResult.copies === 1 ? 'copy' : 'copies'}!`
              : `+${chestResult.copies} ${chestResult.copies === 1 ? 'copy' : 'copies'} unlocked`}
          </p>
          <div className="mt-4 flex flex-col items-center justify-center gap-1.5">
            {(() => {
              const card = chestResult.cards[0]
              const def = CARD_BY_ID[card.cardId]
              if (!def) return null
              const count = cardStars[card.cardId] ?? card.copies
              const stars = toStar(count)
              const prevStars = toStar(Math.max(0, count - card.copies))
              const gained = stars - prevStars
              const lastDelay = 0.55 + Math.max(0, gained - 1) * 0.22
              return (
                <>
                  <motion.div
                    key={card.cardId}
                    initial={{ rotateY: 180, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                    className="card-white w-44 overflow-hidden"
                    style={{ borderColor: TIER_META[def.tier].color }}
                  >
                    <div className="h-28 bg-gradient-to-b from-white/40 to-transparent flex items-center justify-center px-1 pt-1">
                      <img
                        src={cardImageUrl(def)}
                        alt={def.name}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                        className="h-full w-full object-contain drop-shadow"
                      />
                    </div>
                    <div className="px-1.5 pb-1.5">
                      <p className="font-display text-[10px] font-extrabold text-blue-600 leading-tight">
                        {card.isNew ? '✨ NEW!' : `×${card.copies}`}
                      </p>
                      <p className="font-display text-sm font-extrabold text-slate-800 leading-tight">{def.name}</p>
                      <div className="flex gap-0.5 mt-0.5 justify-center" aria-label={`${stars} out of 5 stars`}>
                        {[1, 2, 3, 4, 5].map((s) => {
                          const isNewStar = s > prevStars && s <= stars
                          if (!isNewStar) {
                            return (
                              <span key={s} className="text-[10px]" style={{ color: s <= stars ? '#f59e0b' : '#e2e8f0' }}>
                                ★
                              </span>
                            )
                          }
                          // star earned by THIS chest — grey until its turn, then pop gold
                          return (
                            <motion.span
                              key={s}
                              className="text-[10px]"
                              initial={{ scale: 1, color: '#e2e8f0' }}
                              animate={{ scale: [1, 1.6, 1], color: '#f59e0b' }}
                              transition={{
                                delay: 0.55 + (s - prevStars - 1) * 0.22,
                                duration: 0.4,
                                times: [0, 0.5, 1],
                                ease: 'easeOut',
                              }}
                            >
                              ★
                            </motion.span>
                          )
                        })}
                      </div>
                      <p className="font-display text-[9px] font-extrabold text-slate-400 leading-tight">
                        ★{stars}/5 · ×{count} {copiesToNextStar(count) > 0
                          ? `· +${copiesToNextStar(count)} → ${stars + 1}★`
                          : '· MAX ★'}
                      </p>
                    </div>
                  </motion.div>
                  {gained > 0 && (
                    <motion.p
                      initial={{ scale: 0.5, opacity: 0, y: 6 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      transition={{ delay: lastDelay + 0.1, type: 'spring', stiffness: 300, damping: 14 }}
                      className="rounded-full border-2 border-amber-300 bg-amber-50 px-3 py-0.5 font-display text-xs font-extrabold text-amber-600 shadow-pop"
                    >
                      ⬆️ STAR UP! {stars}★
                    </motion.p>
                  )}
                </>
              )
            })()}
          </div>
        </motion.div>
      )}

      <div className="mt-8 w-full max-w-xs mx-auto">
        {revealed || !showChest ? (
          <button onClick={onContinue} className="btn3d btn-green w-full gpu">
            {continueLabel}
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
