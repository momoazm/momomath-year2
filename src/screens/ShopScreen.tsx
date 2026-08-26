import { useState } from 'react'
import { motion } from 'framer-motion'
import { usePlayer } from '../engine/store'
import { SHOP_ITEMS, formatPrice } from '../engine/shop'
import { Mascot } from '../components/mascots/Mascots'
import { sfx } from '../engine/sfx'

export function ShopScreen() {
  const { gems, shopInventory, buyItem, streakSavers, doubleXpLessons, chestBoost, megaChest } = usePlayer()
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleBuy = (itemId: string) => {
    const result = usePlayer.getState().buyItem(itemId)
    if (result.success) {
      sfx.correct()
      setMessage(result.message)
      setTimeout(() => setMessage(null), 2000)
    } else {
      sfx.wrong()
      setMessage(result.message)
      setTimeout(() => setMessage(null), 2000)
    }
  }

  const getCount = (id: string) => usePlayer.getState().shopInventory[id] || 0

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-28 pt-4">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold text-speed-blue">Item Shop</h1>
        <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-teal-400 px-4 py-2 rounded-2xl shadow-lg">
          <span className="text-lg">💎</span>
          <span className="font-display font-extrabold text-white">{usePlayer.getState().gems}</span>
        </div>
      </div>

      {/* Active Boosts */}
      {(usePlayer.getState().doubleXpLessons > 0 || usePlayer.getState().chestBoost || usePlayer.getState().megaChest) && (
        <div className="mb-5 p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200">
          <div className="font-display text-sm font-bold text-emerald-700 mb-2">Active Boosts</div>
          <div className="flex flex-wrap justify-center gap-2">
            {usePlayer.getState().doubleXpLessons > 0 && (
              <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                ⚡ 2× XP × {usePlayer.getState().doubleXpLessons} lessons
              </span>
            )}
            {usePlayer.getState().chestBoost && (
              <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                🍀 Next chest 2×
              </span>
            )}
            {usePlayer.getState().megaChest && (
              <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">
                🎁 Mega Chest ready!
              </span>
            )}
          </div>
        </div>
      )}

      {/* Active Items */}
      {((usePlayer.getState().streakSavers > 0) || (usePlayer.getState().doubleXpLessons > 0)) && (
        <div className="mb-5 p-3 rounded-2xl bg-slate-50 border-2 border-slate-100">
          <div className="font-display text-sm font-bold text-slate-500 mb-2">Your Items</div>
          <div className="flex flex-wrap justify-center gap-2">
            {usePlayer.getState().streakSavers > 0 && (
              <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                🧊 Streak Saver × {usePlayer.getState().streakSavers}
              </span>
            )}
            {usePlayer.getState().doubleXpLessons > 0 && (
              <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                ⚡ 2× XP × {usePlayer.getState().doubleXpLessons} lessons
              </span>
            )}
          </div>
        </div>
      )}

      {/* Shop Items */}
      <div className="space-y-4">
        {SHOP_ITEMS.map((item) => {
          const count = usePlayer.getState().shopInventory[item.id] || 0
          const atMax = item.maxStack && count >= item.maxStack
          const canBuy = usePlayer.getState().gems >= item.price && !atMax

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`card-white relative ${!canBuy ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center text-4xl">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-display font-extrabold text-slate-800">{item.name}</h3>
                    <span className="font-display font-extrabold text-orange-500">{formatPrice(item.price)}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-slate-500 truncate">{item.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`text-xs font-bold ${count > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                      Owned: {count}/{item.maxStack || '∞'}
                    </span>
                    <button
                      onClick={() => handleBuy(item.id)}
                      disabled={!canBuy}
                      className={`btn3d w-24 text-sm ${canBuy ? 'btn-green' : 'btn-grey'}`}
                    >
                      {atMax ? 'Maxed' : 'Buy'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Toast messages */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="rounded-xl bg-slate-800/90 px-4 py-2 text-white text-sm font-bold backdrop-blur">
            {message}
          </div>
        </motion.div>
      )}

      <p className="mt-8 text-center text-xs font-bold text-slate-400">
        Gems earned from lessons & chests • Spend wisely!
      </p>
    </div>
  )
}