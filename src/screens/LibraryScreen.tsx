import { useEffect, useState, type CSSProperties } from 'react'
import { usePlayer } from '../engine/store'
import { CARDS, ALL_CARDS, ARCADE_CARDS, cardImageUrl, STAR_THRESHOLDS, copiesToNextStar, toStar, TIER_META, TIER_ORDER, type CardDef, type ChestTier } from '../engine/cards'
import { AnimatePresence, motion } from 'framer-motion'

function isOwnedId(cardStars: Record<string, number>, id: string): boolean {
  return (cardStars[id] ?? 0) > 0
}

export function LibraryScreen({ onClose }: { onClose?: () => void }) {
  const { cardStars } = usePlayer()
  const [filterTier, setFilterTier] = useState<ChestTier | 'all'>('all')
  const [query, setQuery] = useState('')
  const [ownedOnly, setOwnedOnly] = useState(false)
  const [selectedCard, setSelectedCard] = useState<CardDef | null>(null)
  const [lockedToast, setLockedToast] = useState<{card: CardDef; tier: ChestTier} | null>(null)

  const owned = new Set(Object.keys(cardStars).filter((id) => (cardStars[id] ?? 0) > 0))
  const allCards = CARDS
  const totalCount = ALL_CARDS.length
  const ownedCount = ALL_CARDS.filter((c) => owned.has(c.id)).length

  const q = query.trim().toLowerCase()
  const filteredCards = allCards.filter((c) => {
    if (filterTier !== 'all' && c.tier !== filterTier) return false
    if (ownedOnly && !isOwnedId(cardStars, c.id)) return false
    if (q && !c.name.toLowerCase().includes(q) && !c.id.includes(q)) return false
    return true
  })

  const isOwned = (id: string) => isOwnedId(cardStars, id)

  const handleCardClick = (card: CardDef) => {
    if (isOwned(card.id)) {
      setSelectedCard(card)
    } else {
      // LockedCardToast handles its own 2.5s auto-dismiss via onDone
      setLockedToast({ card, tier: card.tier })
    }
  }

  const getHiddenCardStyle = (tier: ChestTier) => {
    const meta = TIER_META[tier]
    return {
      borderColor: meta.color,
      boxShadow: `0 0 0 2px ${meta.color}, 0 0 24px ${meta.glow}`,
      background: `linear-gradient(145deg, ${meta.color}15, ${meta.color}05)`,
    }
  }

  return (
    <div className="mx-auto max-w-xl p-4 pb-24">
      <LibraryHeader ownedCount={ownedCount} totalCount={totalCount} onClose={onClose} />
      <ArcadeExclusives
        isOwned={isOwned}
        onCardClick={handleCardClick}
        getHiddenCardStyle={getHiddenCardStyle}
        cardStars={cardStars}
      />
      <LibraryToolbar
        filterTier={filterTier}
        setFilterTier={setFilterTier}
        query={query}
        setQuery={setQuery}
        ownedOnly={ownedOnly}
        setOwnedOnly={setOwnedOnly}
      />
      <CardGrid
        cards={filteredCards}
        isOwned={isOwned}
        onCardClick={handleCardClick}
        getHiddenCardStyle={getHiddenCardStyle}
        cardStars={cardStars}
      />
      {filteredCards.length === 0 && (
        <EmptyState filterTier={filterTier} ownedOnly={ownedOnly} query={query.trim()} />
      )}
      <CardModal
        selectedCard={selectedCard}
        setSelectedCard={setSelectedCard}
      />
      <LockedCardToast
        card={lockedToast?.card ?? null}
        tier={lockedToast?.tier ?? null}
        onDone={() => setLockedToast(null)}
      />
    </div>
  )
}

/* --- Sub-components below --- */

function ArcadeExclusives({
  isOwned,
  onCardClick,
  getHiddenCardStyle,
  cardStars,
}: {
  isOwned: (id: string) => boolean
  onCardClick: (card: CardDef) => void
  getHiddenCardStyle: (tier: ChestTier) => CSSProperties
  cardStars: Record<string, number>
}) {
  const collected = ARCADE_CARDS.filter((c) => isOwned(c.id)).length
  return (
    <section className="mb-6" aria-label="Arcade Exclusives">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-xl font-extrabold text-slate-800">🕹️ Arcade Exclusives</h2>
        <span className="text-sm text-slate-500">{collected} / {ARCADE_CARDS.length} collected</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {ARCADE_CARDS.map((card) => {
          const owned_ = isOwned(card.id)
          const hiddenStyle = getHiddenCardStyle(card.tier)
          const count = cardStars[card.id] ?? 0
          const meta = TIER_META[card.tier]
          return (
            <motion.button
              key={card.id}
              onClick={() => onCardClick(card)}
              className={`relative aspect-[3/4] rounded-xl overflow-hidden card-white transition-all ${
                owned_ ? 'cursor-pointer' : 'cursor-default'
              }`}
              whileTap={{ scale: 0.95 }}
              style={owned_ ? { borderColor: meta.color, boxShadow: `0 0 0 2px ${meta.color}, 0 0 24px ${meta.glow}` } : hiddenStyle}
            >
              <div className="absolute inset-0">
                <img
                  src={cardImageUrl(card)}
                  alt={owned_ ? card.name : `${card.name} (locked)`}
                  loading="lazy"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                  className={`absolute inset-0 h-full w-full object-cover transition-[filter,opacity] ${
                    owned_ ? '' : 'opacity-55 saturate-[0.25] brightness-75'
                  }`}
                />
                <div
                  className="absolute inset-x-0 top-0 flex items-center justify-between px-2 pt-1.5"
                  style={{ background: `linear-gradient(180deg, ${meta.color}66, transparent)` }}
                >
                  <span
                    className="font-display text-[11px] font-extrabold px-2 py-0.5 rounded-full"
                    style={{ background: meta.color, color: 'white' }}
                  >
                    {meta.label}
                  </span>
                </div>
                {!owned_ && (
                  <div className="absolute inset-0 flex flex-col items-center justify-end p-2 text-center"
                    style={{ background: 'linear-gradient(0deg, rgba(2,6,23,0.78) 0%, transparent 55%)' }}>
                    <p className="font-display text-sm font-extrabold text-white drop-shadow">{card.name}</p>
                    <p className="font-display text-[10px] font-bold text-slate-200">🔒 Arcade exclusive</p>
                    <p className="font-display text-[9px] font-bold text-slate-300 leading-tight">{card.flavor}</p>
                  </div>
                )}
                {owned_ && (
                  <div className="absolute inset-x-0 bottom-0 px-2 pb-2 pt-6 text-center"
                    style={{ background: 'linear-gradient(0deg, rgba(2,6,23,0.85) 35%, transparent)' }}>
                    {(() => {
                      const star = toStar(count)
                      const need = copiesToNextStar(count)
                      return (
                        <>
                          <div className="flex justify-center gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <span key={s} className={"text-xs " + (s <= star ? "text-amber-400" : "text-slate-500")}>★</span>
                            ))}
                          </div>
                          <h3 className="font-display text-base font-extrabold leading-tight text-white drop-shadow">
                            {card.name}
                          </h3>
                          <p className="mt-0.5 text-center font-display text-[10px] font-extrabold text-slate-200">
                            ×{count} {need > 0 ? `· ${need} more for ${star + 1}★` : '· MAX ★'}
                          </p>
                        </>
                      )
                    })()}
                  </div>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}

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

function LibraryToolbar({
  filterTier,
  setFilterTier,
  query,
  setQuery,
  ownedOnly,
  setOwnedOnly,
}: {
  filterTier: ChestTier | 'all'
  setFilterTier: (t: ChestTier | 'all') => void
  query: string
  setQuery: (q: string) => void
  ownedOnly: boolean
  setOwnedOnly: (v: boolean) => void
}) {
  const tiers: (ChestTier | 'all')[] = ['all', ...TIER_ORDER]
  return (
    <div className="mb-4 space-y-3">
      <div className="flex gap-2" role="tablist">
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
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search cards…"
          aria-label="Search cards"
          className="min-w-0 flex-1 rounded-xl border-2 border-slate-200 bg-white px-3 py-1.5 font-display text-sm font-bold outline-none focus:border-speed-blue"
        />
        <button
          type="button"
          aria-pressed={ownedOnly}
          onClick={() => setOwnedOnly(!ownedOnly)}
          className={`shrink-0 rounded-xl px-3 py-1.5 font-display text-sm font-extrabold transition ${
            ownedOnly ? 'bg-speed-blue text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-50'
          }`}
        >
          Owned
        </button>
      </div>
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
        const meta = TIER_META[card.tier]
        const hiddenStyle = getHiddenCardStyle(card.tier)

        return (
          <motion.button
            key={card.id}
            onClick={() => onCardClick(card)}
            className={`relative aspect-[3/4] rounded-xl overflow-hidden card-white transition-all ${
              owned_ ? 'cursor-pointer' : 'cursor-default'
            }`}
            whileTap={{ scale: 0.95 }}
            style={owned_ ? { borderColor: meta.color, boxShadow: `0 0 0 2px ${meta.color}, 0 0 24px ${meta.glow}` } : hiddenStyle}
          >
            {/* Full roster always shows real art; locked = dimmed silhouette so every card "appears". */}
            <div className="absolute inset-0">
              <img
                src={cardImageUrl(card)}
                alt={owned_ ? card.name : `${card.name} (locked)`}
                loading="lazy"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                className={`absolute inset-0 h-full w-full object-cover transition-[filter,opacity] ${
                  owned_ ? '' : 'opacity-55 saturate-[0.25] brightness-75'
                }`}
              />
              <div
                className="absolute inset-x-0 top-0 flex items-center justify-between px-2 pt-1.5"
                style={{ background: `linear-gradient(180deg, ${meta.color}66, transparent)` }}
              >
                <span
                  className="font-display text-[11px] font-extrabold px-2 py-0.5 rounded-full"
                  style={{ background: meta.color, color: 'white' }}
                >
                  {meta.label}
                </span>
                <span className="text-[11px] font-bold text-white drop-shadow">
                  #{String(CARDS.findIndex(c => c.id === card.id) + 1).padStart(2, '0')}
                </span>
              </div>
              {!owned_ && (
                <div className="absolute inset-0 flex flex-col items-center justify-end p-2 text-center"
                  style={{ background: 'linear-gradient(0deg, rgba(2,6,23,0.78) 0%, transparent 55%)' }}>
                  <p className="font-display text-sm font-extrabold text-white drop-shadow">{card.name}</p>
                  <p className="font-display text-[10px] font-bold text-slate-200">🔒 Locked · win chests</p>
                </div>
              )}
              {owned_ && (
                <div className="absolute inset-x-0 bottom-0 px-2 pb-2 pt-6 text-center"
                  style={{ background: 'linear-gradient(0deg, rgba(2,6,23,0.85) 35%, transparent)' }}>
                  {(() => {
                    const count = (cardStars[card.id] ?? 0)
                    const star = toStar(count)
                    const need = copiesToNextStar(count)
                    return (
                      <>
                        <div className="flex justify-center gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} className={"text-xs " + (s <= star ? "text-amber-400" : "text-slate-500")}>★</span>
                          ))}
                        </div>
                        <h3 className="font-display text-base font-extrabold leading-tight text-white drop-shadow">
                          {card.name}
                        </h3>
                        <p className="mt-0.5 text-center font-display text-[10px] font-extrabold text-slate-200">
                          ×{count} {need > 0 ? `· ${need} more for ${star + 1}★` : '· MAX ★'}
                        </p>
                      </>
                    )
                  })()}
                </div>
              )}
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}

function EmptyState({ filterTier, ownedOnly, query }: { filterTier: ChestTier | 'all'; ownedOnly?: boolean; query?: string }) {
  return (
    <div className="text-center py-12 text-slate-500">
      <p className="font-display text-lg">
        {query ? `No cards match “${query}”` : ownedOnly ? 'No owned cards in this filter' : `No ${filterTier === 'all' ? '' : filterTier} cards yet`}
      </p>
      <p className="text-sm mt-1">{ownedOnly || query ? 'Try another search or tier.' : 'Win chests from lessons to unlock cards!'}</p>
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
        const meta = TIER_META[selectedCard.tier]
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
                boxShadow: `inset 0 0 80px ${meta.glow}`,
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
                {TIER_ORDER
                  .slice(0, TIER_ORDER.indexOf(selectedCard.tier) + 1)
                  .map((t, i) => (
                    <motion.span
                      key={t}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="w-2 h-2 rounded-full"
                      style={{ background: TIER_META[t].color }}
                    />
                  ))}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-slate-50">
                <p className="text-sm text-slate-600">
                  {selectedCard.source === 'arcade' ? (
                    <>Arcade exclusive — unlock through the <strong className="font-display">Retro Arcade</strong> (coming soon)</>
                  ) : (
                    <>
                      Obtained from <strong className="font-display capitalize">{selectedCard.tier}</strong> chests
                      {selectedCard.tier === 'legendary' || selectedCard.tier === 'exclusive'
                        ? ' (guaranteed card drop)'
                        : ' (~10% chance per chest)'}
                    </>
                  )}
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

function LockedCardToast({ card, tier, onDone }: { card: CardDef | null; tier: ChestTier | null; onDone: () => void }) {
  // Auto-dismiss the toast after 2.5s; reset the timer if a new toast arrives.
  useEffect(() => {
    if (!card) return
    const t = setTimeout(onDone, 2500)
    return () => clearTimeout(t)
  }, [card, onDone])
  return (
    <AnimatePresence>
      {card && tier && (
        <motion.div
          key="locked"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 max-w-sm"
        >
          {(() => {
            const meta = TIER_META[tier]
            return (
              <div className="card-white rounded-xl shadow-xl px-4 py-3 flex items-center gap-3"
                   style={{ border: `2px solid ${meta.color}` }}>
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ background: meta.color, boxShadow: `0 0 12px ${meta.glow}` }}
                >
                  <span className="text-xl">🔒</span>
                </div>
                <div className="flex-1">
                  <p className="font-display text-sm font-extrabold text-slate-800">
                    {card.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {card.source === 'arcade' ? (
                      <>🔒 Arcade exclusive — {card.flavor}</>
                    ) : (
                      <>
                        Win from a <span style={{ color: meta.color, fontWeight: 700 }}>{meta.label}</span> chest
                      </>
                    )}
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
