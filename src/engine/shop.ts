export interface ShopItem {
  id: string
  name: string
  description: string
  price: number
  icon: string
  category: 'boost' | 'utility' | 'cosmetic'
  maxStack?: number
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
    description: 'Your next lesson chest contains DOUBLE the gems and XP!',
    price: 75,
    icon: '🍀',
    category: 'boost',
    maxStack: 5,
  },
  {
    id: 'mega-chest',
    name: 'Mega Chest',
    description: 'Your next lesson chest contains DOUBLE gems AND 2× XP!',
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

export const ITEM_IDS = SHOP_ITEMS.map((i) => i.id)

export function getItem(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((i) => i.id === id)
}

export function canAfford(gems: number, price: number): boolean {
  return gems >= price
}

export function formatPrice(price: number): string {
  return `${price} 💎`
}