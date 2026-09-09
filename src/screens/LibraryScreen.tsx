import { useEffect, useState } from 'react'
import { usePlayer } from '../engine/store'
import { CARDS, CARD_CHANCE, type CardDef, type ChestTier } from '../engine/cards'
import { CardArt } from '../components/ui/CardArt'
import { RARITY_META, type ChestRarity } from '../engine/gamification'
import { AnimatePresence, motion } from 'framer-motion'

/** Map ChestTier -> ChestRarity for display colors */
const TIER_TO_RARITY: Record<ChestTier, ChestRarity> = {
  common: 'common',
  rare: 'rare',
  epic: 'epic',
  legendary: 'legendary',
  exclusive: 'legendary',
  mythic: 'mythic',
  ultimate: 'ultimate',
  hyper: 'hyper',
}

const TIER_ORDER: ChestTier[] = ['common', 'rare', 'epic', 'legendary', 'exclusive', 'mythic', 'ultimate', 'hyper']

export function LibraryScreen({ onClose }: { onClose?: () => void }) {
  const { cardStars } = usePlayer()
  const [filterTier, setFilterTier] = useState<ChestTier | 'all'>('all')
  const [selectedCard, setSelectedCard] = useState<CardDef | null>(null)
  const [lockedToast, setLockedToast] = useState<{card: CardDef; rarity: ChestRarity} | null>(null)

  const owned = new Set(Object.keys(cardStars))
  const totalStars = Object.values(cardStars).reduce((s, n) => s + n, 0)
  const allCards = CARDS

  const filteredCards = filterTier === 'all'
    ? allCards
    : allCards.filter((c) => c.tier === filterTier)

  const tiers: (ChestTier | 'all')[] = ['all', 'common', 'rare', 'epic', 'legendary', 'exclusive', 'mythic', 'ultimate', 'hyper']

  const isOwned = (id: string) => owned.has(id)

  const handleCardClick = (card: CardDef) => {
    if (isOwned(card.id)) {
      setSelectedCard(card)
    } else {
      const rarity = TIER_TO_RARITY[card.tier]
      setLockedToast({ card, rarity })
      setTimeout(() => setLockedToast(null), 2500)
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
      <LibraryHeader ownedCount={owned.size} totalCount={allCards.length} totalStars={totalStars} onClose={onClose} />
      <TierFilterTabs filterTier={filterTier} setFilterTier={setFilterTier} />
      <CardGrid
        cards={filteredCards}
        isOwned={isOwned}
        starsOf={(id) => cardStars[id] ?? 0}
        onCardClick={handleCardClick}
        getHiddenCardStyle={getHiddenCardStyle}
      />
                  {filteredCards.length === 0 && <EmptyState filterTier={filterTier} />}
      <CardModal
        selectedCard={selectedCard}
        setSelectedCard={setSelectedCard}
        allCards={allCards}
        stars={selectedCard ? (cardStars[selectedCard.id] ?? 0) : 0}
      />
      {lockedToast && (
        <LockedCardToast card={lockedToast.card} rarity={lockedToast.rarity} />
      )}
    </div>
  )
}

/* --- Sub-components below --- */

function LibraryHeader({ ownedCount, totalCount, totalStars, onClose }: { ownedCount: number; totalCount: number; totalStars: number; onClose?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="font-display text-3xl font-extrabold text-slate-800">Card Library</h1>
      <div className="flex items-center gap-4">
        <div className="text-right text-sm text-slate-500">
          <div>{ownedCount} / {totalCount} collected</div>
          <div className="font-display font-extrabold text-amber-500">★ {totalStars} star-ups</div>
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
  const tiers: (ChestTier | 'all')[] = ['all', 'common', 'rare', 'epic', 'legendary', 'exclusive', 'mythic', 'ultimate', 'hyper']
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
  starsOf: (id: string) => number
  onCardClick: (card: CardDef) => void
  getHiddenCardStyle: (tier: ChestTier) => React.CSSProperties
}

function StarPips({ stars, max = 5 }: { stars: number; max?: number }) {
  return (
    <span className="font-display text-sm font-extrabold tracking-tight text-amber-400 drop-shadow" title={`${stars}/${max} stars`}>
      {'★'.repeat(Math.min(stars, max))}
      <span className="text-slate-300">{'★'.repeat(Math.max(0, max - Math.min(stars, max)))}</span>
    </span>
  )
}

function CardGrid({ cards, isOwned, starsOf, onCardClick, getHiddenCardStyle }: CardGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {cards.map((card) => {
        const owned_ = isOwned(card.id)
        const rarity = TIER_TO_RARITY[card.tier]
        const meta = RARITY_META[rarity]
        const hiddenStyle = getHiddenCardStyle(card.tier)
        const stars = starsOf(card.id)

        return (
          <motion.button
            key={card.id}
            onClick={() => onCardClick(card)}
            className={`relative aspect-[3/4] rounded-xl overflow-hidden card-white transition-all ${
              owned_ ? 'cursor-pointer' : 'cursor-default'
            }`}
            whileTap={{ scale: 0.95 }}
            style={owned_ ? { borderColor: meta.color, boxShadow: `0 0 0 2px ${meta.color}, 0 0 24px ${meta.glowColor}` } : hiddenStyle}
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

            {owned_ && (
              <div className="absolute inset-0">
                {/* full-bleed artwork: no need to open the card to see it */}
                <div className="absolute inset-0">
                  <CardArt cardId={card.id} character={card.character} expression="cheer" className="h-full w-full object-cover" />
                </div>
                <div className="absolute inset-x-0 top-0 flex items-center justify-between px-2 pt-1.5"
                     style={{ background: `linear-gradient(180deg, ${meta.color}55, transparent)` }}>
                  <span className="font-display text-[11px] font-extrabold px-2 py-0.5 rounded-full"
                        style={{ background: meta.color, color: 'white' }}>
                    {meta.label}
                  </span>
                  <span className="text-[11px] font-bold text-white drop-shadow">
                    #{String(CARDS.findIndex(c => c.id === card.id) + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 px-2 pb-2 pt-6 text-center"
                     style={{ background: 'linear-gradient(0deg, rgba(2,6,23,0.82) 30%, transparent)' }}>
                  <StarPips stars={stars} />
                  <h3 className="font-display text-base font-extrabold leading-tight text-white drop-shadow">
                    {card.name}
                  </h3>
                </div>
              </div>
            )}
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
  allCards: CardDef[]
  stars: number
}

function CardModal({ selectedCard, setSelectedCard, allCards, stars }: CardModalProps) {
  if (!selectedCard) return null

  const rarity = TIER_TO_RARITY[selectedCard.tier]
  const meta = RARITY_META[rarity]

  return (
    <AnimatePresence>
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
            <div className="h-48 flex items-center justify-center p-6" style={{
              boxShadow: `inset 0 0 80px ${meta.glowColor}`,
            }}>
              <div className="h-full">
                <CardArt cardId={selectedCard.id} character={selectedCard.character} expression="cheer" />
              </div>
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
              {['common', 'rare', 'epic', 'legendary', 'exclusive', 'mythic', 'ultimate', 'hyper']
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
            <div className="mt-3 flex items-center justify-center gap-2">
              <StarPips stars={stars} />
              <span className="text-xs font-bold text-slate-400">
                {stars >= 5 ? 'MAXED OUT!' : 'duplicates star it up'}
              </span>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-slate-50">
              <p className="text-sm text-slate-600">
                Drops from <strong className="font-display capitalize">{selectedCard.tier}</strong> chests
                ({Math.round(CARD_CHANCE[selectedCard.tier] * 100)}% per card slot — rarer chest, rarer card!)
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
        </AnimatePresence>
  )
}

function LockedCardToast({ card, rarity }: { card: CardDef; rarity: ChestRarity }) {
  const meta = RARITY_META[rarity]
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 max-w-sm"
      >
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
      </motion.div>
    </AnimatePresence>
  )
}
