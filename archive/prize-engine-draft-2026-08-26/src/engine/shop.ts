import { usePlayer } from './store'
import { addGems, setMascot } from './store'

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
    id: 'streak-freeze',
    name: 'Streak Freeze',
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
    description: 'Your next lesson chest contains DOUBLE gems AND 2× XP!',
    price: 150,
    icon: '🎁',
    category: 'boost',
    maxStack: 3,
  },
  {
    id: 'wallpaper-sunset',
    name: 'Sunset Wallpaper',
    description: 'Golden-hour sky for your profile. Also drops from Gold Chests!',
    price: 750,
    icon: '🌅',
    category: 'cosmetic',
    maxStack: 1,
  },
  {
    id: 'wallpaper-galaxy',
    name: 'Galaxy Wallpaper',
    description: 'The rarest backdrop in MomoMath. Legendary chest drop, or earn it here.',
    price: 1200,
    icon: '🌌',
    category: 'cosmetic',
    maxStack: 1,
  },
]

export const ITEM_IDS = SHOP_ITEMS.map((i) => i.id)

export function getItem(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((i) => i.id === id)
}

export function canAfford(gems: number, price: number): boolean {
  return gems >= price
}

export function purchaseItem(itemId: string): { success: boolean; message: string } {
  const item = getItem(itemId)
  if (!item) return { success: false, message: 'Item not found' }

  const player = usePlayer.getState()
  if (!canAfford(player.gems, item.price)) {
    return { success: false, message: 'Not enough gems!' }
  }

  const currentCount = player.shopInventory?.[itemId] || 0
  if (item.maxStack && currentCount >= item.maxStack) {
    return { success: false, message: `Max ${item.maxStack} per item!` }
  }

  return { success: true, message: 'Purchase successful!' }
}

export function applyItemEffect(itemId: string): void {
  const item = getItem(itemId)
  if (!item) return

  const state = usePlayer.getState()

  switch (itemId) {
    case 'streak-freeze':
      // Handled in streak logic
      break
    case 'double-xp':
      // Handled in lesson completion
      break
    case 'chest-boost':
      // Handled in chest opening
      break
    case 'mega-chest':
      // Handled in chest opening
      break
  }
}

export function formatPrice(price: number): string {
  return `${price} 💎`
}