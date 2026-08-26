// Single source of truth for the MomoMath Year 2 chest/prize system.
// Plain ESM so BOTH the app (Vite/TS) and scripts/verify-chests.mjs import this exact data.

// Weights are out of 10000 => percentage = weight / 100.
// Design invariants (enforced by scripts/verify-chests.mjs):
//   1. Every tier's weights sum to exactly 10000.
//   2. Higher-value prizes always have lower-or-equal probability ("smallest chance = best prize").
//   3. Legendary band (streak freeze + wallpapers) stays under 2% and grows with chest quality.
//   4. Expected value is strictly increasing: WOOD < SILVER < GOLD.
//   5. Pity timers bound bad luck: rare+ within 10 opens, jackpot within 50.

export const PRIZES = {
  gemsSmall: { id: 'gems-small', label: 'Small Gem Pouch', kind: 'currency', icon: '💎', gemValue: 10, gemRange: [5, 15], rarity: 'common' },
  gemsMedium: { id: 'gems-medium', label: 'Gem Bag', kind: 'currency', icon: '💰', gemValue: 37.5, gemRange: [25, 50], rarity: 'common' },
  chestBoost: { id: 'chest-boost', label: 'Chest Boost', kind: 'item', icon: '🍀', gemValue: 75, shopPrice: 75, rarity: 'uncommon' },
  doubleXp: { id: 'double-xp', label: 'Double XP Boost', kind: 'item', icon: '⚡', gemValue: 100, shopPrice: 100, rarity: 'uncommon' },
  gems100: { id: 'gems-100', label: 'Gem Pile', kind: 'currency', icon: '💠', gemValue: 100, gemRange: [90, 110], rarity: 'rare' },
  megaChest: { id: 'mega-chest', label: 'Mega Chest Item', kind: 'item', icon: '🎁', gemValue: 150, shopPrice: 150, rarity: 'epic' },
  streakFreeze: { id: 'streak-freeze', label: 'Streak Freeze', kind: 'utility', icon: '🧊', gemValue: 200, shopPrice: 200, rarity: 'legendary' },
  gems250: { id: 'gems-250', label: 'Treasure Gems', kind: 'currency', icon: '🌟', gemValue: 250, gemRange: [225, 275], rarity: 'epic' },
  wallpaperSunset: { id: 'wallpaper-sunset', label: 'Sunset Wallpaper', kind: 'cosmetic', icon: '🌅', gemValue: 300, shopPrice: 750, dupeRefund: 150, rarity: 'legendary' },
  wallpaperGalaxy: { id: 'wallpaper-galaxy', label: 'Galaxy Wallpaper', kind: 'cosmetic', icon: '🌌', gemValue: 500, shopPrice: 1200, dupeRefund: 250, rarity: 'legendary' },
}

export const CHEST_TIERS = [
  {
    id: 'wood',
    name: 'Wooden Chest',
    icon: '📦',
    color: '#b08968',
    source: 'Finish any lesson',
    // sum = 10000 exactly
    weights: {
      gemsSmall: 5000,
      gemsMedium: 2600,
      chestBoost: 900,
      doubleXp: 700,
      gems100: 500,
      megaChest: 140,
      streakFreeze: 60,
      gems250: 55,
      wallpaperSunset: 35,
      wallpaperGalaxy: 10,
    },
  },
  {
    id: 'silver',
    name: 'Silver Chest',
    icon: '🥈',
    color: '#8d99ae',
    source: 'Perfect lesson or 3-day streak milestone',
    // sum = 10000 exactly
    weights: {
      gemsSmall: 3300,
      gemsMedium: 3150,
      chestBoost: 1200,
      doubleXp: 1100,
      gems100: 730,
      megaChest: 300,
      streakFreeze: 90,
      gems250: 80,
      wallpaperSunset: 35,
      wallpaperGalaxy: 15,
    },
  },
  {
    id: 'gold',
    name: 'Gold Chest',
    icon: '🏆',
    color: '#ffd60a',
    source: 'Perfect lesson on a streak day, or weekly league reward',
    // sum = 10000 exactly
    weights: {
      gemsSmall: 3300,
      gemsMedium: 2100,
      chestBoost: 1350,
      doubleXp: 1300,
      gems100: 1130,
      megaChest: 575,
      streakFreeze: 105,
      gems250: 85,
      wallpaperSunset: 40,
      wallpaperGalaxy: 15,
    },
  },
]

// Pity timers: hard guarantees that bound unlucky streaks (trust preservation).
export const PITY = {
  RARE_PLUS_WITHIN: 10,   // if no rare-or-better in N opens of a tier, next open is upgraded
  JACKPOT_WITHIN: 50,     // global: if no legendary (freeze/wallpaper/gems-250+) in N opens, next forces it
}

export const WEIGHT_SUM = 10000
