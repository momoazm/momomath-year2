export interface ShopItem {
  id: string
  name: string
  description: string
  price: number
  icon: string
  category: 'boost' | 'utility' | 'cosmetic'
  maxStack?: number
  /** which currency the price is paid in (default gems) */
  currency?: 'gems' | 'dust'
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'streak-saver',
    name: 'Streak Saver',
    description: 'Automatically protects your streak if you miss a day. Consumed on use.',
    price: 200,
    icon: '🧊',
    category: 'utility',
    maxStack: 5,
  },
  {
    id: 'double-xp',
    name: 'Double XP Boost',
    description: 'Next 3 lessons earn 2× XP. Stacks with chest bonus!',
    price: 100,
    icon: '⚡',
    category: 'boost',
    maxStack: 3,
  },
  {
    id: 'chest-boost',
    name: 'Chest Boost',
    description: 'Your next lesson chest contains DOUBLE the gems!',
    price: 75,
    icon: '🍀',
    category: 'boost',
    maxStack: 5,
  },
  {
    id: 'mega-chest',
    name: 'Mega Chest',
    description: 'Your next lesson chest contains TRIPLE the gems! Stacks with Chest Boost.',
    price: 150,
    icon: '🎁',
    category: 'boost',
    maxStack: 3,
  },
  {
    id: 'lucky-ticket',
    name: 'Lucky Ticket',
    description: 'Boosts your next chest: way better odds of a Rare, Epic or Legendary card!',
    price: 120,
    icon: '🎟️',
    category: 'boost',
    maxStack: 5,
  },
]

/** Paid with 🌪️ dust (earns from maxed 5★ duplicate cards) instead of gems. */
export const DUST_ITEMS: ShopItem[] = [
  {
    id: 'dust-chest-boost',
    name: 'Chest Boost',
    description: 'Your next lesson chest contains DOUBLE the gems!',
    price: 30,
    icon: '🍀',
    category: 'boost',
    maxStack: 5,
    currency: 'dust',
  },
  {
    id: 'dust-lucky-ticket',
    name: 'Lucky Ticket',
    description: 'Way better odds of a Rare, Epic or Legendary card on your next chest!',
    price: 50,
    icon: '🎟️',
    category: 'boost',
    maxStack: 5,
    currency: 'dust',
  },
  {
    id: 'dust-double-xp',
    name: 'Double XP Boost',
    description: 'Next 3 lessons earn 2× XP.',
    price: 60,
    icon: '⚡',
    category: 'boost',
    maxStack: 3,
    currency: 'dust',
  },
  {
    id: 'dust-streak-saver',
    name: 'Streak Saver',
    description: 'Protects your streak automatically if you miss a day.',
    price: 40,
    icon: '🧊',
    category: 'utility',
    maxStack: 5,
    currency: 'dust',
  },
]

export const ALL_SHOP_ITEMS = [...SHOP_ITEMS, ...DUST_ITEMS]
export const ITEM_IDS = ALL_SHOP_ITEMS.map((i) => i.id)

export function getItem(id: string): ShopItem | undefined {
  return ALL_SHOP_ITEMS.find((i) => i.id === id)
}

export function canAfford(gems: number, price: number): boolean {
  return gems >= price
}

/**
 * Gem multiplier applied to the next lesson chest from the active shop boosts.
 * - Chest Boost: ×2
 * - Mega Chest: ×3 (the bigger, pricier boost)
 * - Both active: they stack (×6)
 */
export function chestGemMultiplier(chestBoost: boolean, megaChest: boolean): number {
  return (chestBoost ? 2 : 1) * (megaChest ? 3 : 1)
}

export function formatPrice(price: number, currency: 'gems' | 'dust' = 'gems'): string {
  return `${price} ${currency === 'dust' ? '🌪️' : '💎'}`
}