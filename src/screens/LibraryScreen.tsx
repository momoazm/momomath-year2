import { useEffect, useState, type CSSProperties } from 'react'
import { usePlayer } from '../engine/store'
import { CARDS, cardImageUrl, STAR_THRESHOLDS, toStar, type CardDef, type ChestTier } from '../engine/cards'
import { RARITY_META, type ChestRarity } from '../engine/gamification'
import { AnimatePresence, motion } from 'framer-motion'

/** Map ChestTier -> ChestRarity for display colors */
const TIER_TO_RARITY: Record<ChestTier, ChestRarity> = {
  common: 'common',
  rare: 'rare',
  epic: 'epic',
  legendary: 'legendary',
  exclusive: 'legendary',
}

const TIER_ORDER: ChestTier[] = ['common', 'rare', 'epic', 'legendary', 'exclusive']

export function LibraryScreen({ onClose }: { onClose?: () => void }) {
  const { cardStars } = usePlayer()
  const [filterTier, setFilterTier] = useState<ChestTier | 'all'>('all')
  const [selectedCard, setSelectedCard] = useState<CardDef | null>(null)
  const [lockedToast, setLockedToast] = useState<{card: CardDef; rarity: ChestRarity} | null>(null)

  const owned = new Set(Object.keys(cardStars).filter((id) => (cardStars[id] ?? 0) > 0))
  const allCards = CARDS

  const filteredCards = filterTier === 'all'
    ? allCards
    : allCards.filter((c) => c.tier === filterTier)

  const tiers: (ChestTier | 'all')[] = ['all', 'common', 'rare', 'epic', 'legendary', 'exclusive']

  const isOwned = (id: string) => (cardStars[id] ?? 0) > 0

  const handleCardClick = (card: CardDef) => {
    if (isOwned(card.id)) {
      setSelectedCard(card)
    } else {
      const rarity = TIER_TO_RARITY[card.tier]
      // LockedCardToast handles its own 2.5s auto-dismiss via onDone
      setLockedToast({ card, rarity })
    }
  }

  const getHiddenCardStyle = (tier: ChestTier) => {
    const rarity = TIER_TO_RARITY[tier]
    const meta = RARITY_META[rarity]
    return {
      borderColor: meta.color,
      boxShadow: `0 0 0 2px ${meta.color}, 0 0 24px ${meta.glowColor}`,
      background: `linear-gradient(145deg, ${meta.color}15, ${meta.color}05)`,
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-4 pb-24">
      <LibraryHeader ownedCount={owned.size} totalCount={allCards.length} onClose={onClose} />
      <TierFilterTabs filterTier={filterTier} setFilterTier={setFilterTier} />
      <CardGrid
        cards={filteredCards}
        isOwned={isOwned}
        onCardClick={handleCardClick}
        getHiddenCardStyle={getHiddenCardStyle}
        cardStars={cardStars}
      />
                  {filteredCards.length === 0 && <EmptyState filterTier={filterTier} />}
      <CardModal
        selectedCard={selectedCard}
        setSelectedCard={setSelectedCard}
      />
      <LockedCardToast
        card={lockedToast?.card ?? null}
        rarity={lockedToast?.rarity ?? null}
        onDone={() => setLockedToast(null)}
      />
    </div>
  )
}

/* --- Sub-components below --- */

function LibraryHeader({ ownedCount, totalCount, onClose }: { ownedCount: number; totalCount: number; onClose?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="font-display text-3xl font-extrabold text-slate-800">Card Library</h1>
      <div className="flex items-center gap-4">
        <div className="text-sm text-slate-500">
          {ownedCount} / {totalCount} collected
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full border border-white bg-white/90 text-xl shadow-sm transition-colors hover:bg-white hover:scale-105"
            aria-label="Close Library"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

function TierFilterTabs({
  filterTier,
  setFilterTier,
}: { filterTier: ChestTier | 'all'; setFilterTier: (t: ChestTier | 'all') => void }) {
  const tiers: (ChestTier | 'all')[] = ['all', 'common', 'rare', 'epic', 'legendary', 'exclusive']
  return (
    <div className="mb-4 flex flex-wrap gap-2" role="tablist">
      {tiers.map((tier) => (
        <button
          key={tier}
          role="tab"
          aria-selected={filterTier === tier}
          onClick={() => setFilterTier(tier)}
          className={`rounded-full px-4 py-1.5 font-display text-sm font-extrabold transition ${
            filterTier === tier
              ? 'bg-speed-blue text-white shadow-lg'
              : 'bg-white text-slate-500 hover:bg-slate-50'
          }`}
        >
          {tier === 'all' ? 'All' : tier.charAt(0).toUpperCase() + tier.slice(1)}
        </button>
      ))}
    </div>
  )
}
interface CardGridProps {
  cards: CardDef[]
  isOwned: (id: string) => boolean
  onCardClick: (card: CardDef) => void
  getHiddenCardStyle: (tier: ChestTier) => CSSProperties
}

function CardGrid({ cards, isOwned, onCardClick, getHiddenCardStyle, cardStars }: CardGridProps & { cardStars: Record<string, number> }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {cards.map((card) => {
        const owned_ = isOwned(card.id)
        const rarity = TIER_TO_RARITY[card.tier]
        const meta = RARITY_META[rarity]
        const hiddenStyle = getHiddenCardStyle(card.tier)

        return (
          <motion.button
            key={card.id}
            onClick={() => onCardClick(card)}
            className={`relative aspect-[3/4] rounded-xl overflow-hidden card-white transition-all ${
              owned_ ? 'cursor-pointer' : 'cursor-default'
            }`}
            whileTap={{ scale: 0.95 }}
            style={owned_ ? undefined : hiddenStyle}
          >
            <AnimatePresence mode="wait">
              {!owned_ && (
                <motion.div
                  key="hidden"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-4"
                  style={{
                    background: `linear-gradient(145deg, ${meta.color}20, ${meta.color}05)`,
                    border: `2px solid ${meta.color}`,
                    boxShadow: `inset 0 0 40px ${meta.glowColor}`,
                  }}
                >
                  <div
                    className="w-16 h-16 rounded-full mb-3 flex items-center justify-center"
                    style={{
                      background: meta.color,
                      boxShadow: `0 0 30px ${meta.glowColor}`,
                    }}
                  >
                    <span className="text-3xl">❓</span>
                  </div>
                  <p className="font-display text-lg font-extrabold text-center"
                     style={{ color: meta.color }}>
                    {meta.label}
                  </p>
                  <p className="font-display text-xs font-bold text-center mt-1 opacity-70"
                     style={{ color: meta.color }}>
                    {card.tier.charAt(0).toUpperCase() + card.tier.slice(1)} Card
                  </p>
                  <p className="font-display text-xs text-center mt-2 opacity-60">
                    Win to unlock
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={`absolute inset-0 flex flex-col ${owned_ ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.12) 100%)',
                boxShadow: `inset 0 0 60px ${meta.glowColor}`,
              }} />

              <div className="relative z-10 px-3 py-1.5 flex items-center justify-between"
                   style={{ background: `linear-gradient(90deg, ${meta.color}20, transparent)` }}>
                <span className="font-display text-xs font-extrabold px-2 py-0.5 rounded-full"
                      style={{ background: meta.color, color: 'white' }}>
                  {meta.label}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  #{String(CARDS.findIndex(c => c.id === card.id) + 1).padStart(2, '0')}
                </span>
              </div>

              <div className="relative z-10 flex-1 flex items-center justify-center p-4">
                <div className="w-full h-full max-w-48 max-h-48 flex items-center justify-center">
                  <img
                    src={cardImageUrl(card)}
                    alt={card.name}
                    loading="lazy"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                    className="h-full w-full object-contain drop-shadow-md"
                  />
                </div>
              </div>

              <div className="relative z-10 px-3 pb-3 text-center">
                <h3 className="font-display text-base font-extrabold text-slate-800">
                  {card.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {card.flavor}
                </p>
                {(() => {
                  const count = (cardStars[card.id] ?? 0)
                  const star = toStar(count)
                  return (
                    <div className="mt-1 flex justify-center gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className={"text-xs " + (s <= star ? "text-amber-400" : "text-slate-300")}>★</span>
                      ))}
                    </div>
                  )
                })()}
              </div>

              {owned_ && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="absolute top-2 right-2"
                >
                  <span className="bg-emerald-500 text-white text-xs font-extrabold px-1.5 py-0.5 rounded-full">
                    NEW
                  </span>
                </motion.div>
              )}
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}

function EmptyState({ filterTier }: { filterTier: ChestTier | 'all' }) {
  return (
    <div className="text-center py-12 text-slate-500">
      <p className="font-display text-lg">No {filterTier === 'all' ? '' : filterTier} cards yet</p>
      <p className="text-sm mt-1">Win chests from lessons to unlock cards!</p>
    </div>
  )
}

interface CardModalProps {
  selectedCard: CardDef | null
  setSelectedCard: (card: CardDef | null) => void
}

function CardModal({ selectedCard, setSelectedCard }: CardModalProps) {
  return (
    <AnimatePresence>
      {selectedCard && (() => {
        const rarity = TIER_TO_RARITY[selectedCard.tier]
        const meta = RARITY_META[rarity]
        return (
        <motion.div
          key={selectedCard.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedCard(null)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative w-full max-w-md card-white rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden" style={{
              background: `linear-gradient(180deg, ${meta.color}15, transparent 60%)`,
            }}>
              <div className="h-64 flex items-center justify-center p-6" style={{
                boxShadow: `inset 0 0 80px ${meta.glowColor}`,
              }}>
                <img
                  src={cardImageUrl(selectedCard)}
                  alt={selectedCard.name}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                  className="h-full w-full object-contain drop-shadow-lg"
                />
              </div>
              <div className="absolute top-4 left-4 right-4 flex justify-between">
                <span className="font-display text-xs font-extrabold px-2 py-1 rounded-full"
                      style={{ background: meta.color, color: 'white' }}>
                  {meta.label}
                </span>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="w-8 h-8 rounded-full bg-white/90 text-slate-500 flex items-center justify-center hover:bg-white"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 text-center">
              <h2 className="font-display text-2xl font-extrabold text-slate-800">
                {selectedCard.name}
              </h2>
              <p className="mt-2 text-slate-600">{selectedCard.flavor}</p>

              <div className="mt-4 flex items-center justify-center gap-2">
                {['common', 'rare', 'epic', 'legendary', 'exclusive']
                  .slice(0, TIER_ORDER.indexOf(selectedCard.tier) + 1)
                  .map((t, i) => (
                    <motion.span
                      key={t}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="w-2 h-2 rounded-full"
                      style={{ background: RARITY_META[TIER_TO_RARITY[t as ChestTier]].color }}
                    />
                  ))}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-slate-50">
                <p className="text-sm text-slate-600">
                  Obtained from <strong className="font-display capitalize">{selectedCard.tier}</strong> chests
                  {selectedCard.tier === 'legendary' || selectedCard.tier === 'exclusive'
                    ? ' (guaranteed card drop)'
                    : ' (~10% chance per chest)'}
                </p>
              </div>

              <button
                onClick={() => setSelectedCard(null)}
                className="mt-6 w-full bg-speed-blue text-white font-display font-extrabold py-3 rounded-xl hover:bg-blue-600 transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
        )
      })()}
    </AnimatePresence>
  )
}

function LockedCardToast({ card, rarity, onDone }: { card: CardDef | null; rarity: ChestRarity | null; onDone: () => void }) {
  // Auto-dismiss the toast after 2.5s; reset the timer if a new toast arrives.
  useEffect(() => {
    if (!card) return
    const t = setTimeout(onDone, 2500)
    return () => clearTimeout(t)
  }, [card, onDone])
  return (
    <AnimatePresence>
      {card && rarity && (
        <motion.div
          key="locked"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 max-w-sm"
        >
          {(() => {
            const meta = RARITY_META[rarity]
            return (
              <div className="card-white rounded-xl shadow-xl px-4 py-3 flex items-center gap-3"
                   style={{ border: `2px solid ${meta.color}` }}>
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ background: meta.color, boxShadow: `0 0 12px ${meta.glowColor}` }}
                >
                  <span className="text-xl">🔒</span>
                </div>
                <div className="flex-1">
                  <p className="font-display text-sm font-extrabold text-slate-800">
                    {card.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    Win from a <span style={{ color: meta.color, fontWeight: 700 }}>{meta.label}</span> chest
                  </p>
                </div>
              </div>
            )
          })()}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
