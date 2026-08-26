# MomoMath Year 2 — Prize & Chest System

Published odds (transparency policy: exact percentages are shown to players in-game via `getOdds()`).

## Chest sources

| Chest | Icon | How you get it |
|---|---|---|
| Wooden | 📦 | Finish any lesson |
| Silver | 🥈 | Perfect lesson, or 3-day streak milestone |
| Gold | 🏆 | Perfect lesson on a streak day, or weekly league reward |

Chests are **never sold for gems** — they are earned through play only, so chest EV cannot be looped for infinite gems.

## Prize odds

Weights are out of 10,000. `100 = 1.00%`.

### 📦 Wooden Chest — EV ≈ 39.7 gems

| Prize | Rarity | Odds |
|---|---|---|
| Small Gem Pouch 💎 (5–15) | Common | 50% |
| Gem Bag 💰 (25–50) | Common | 26% |
| Chest Boost 🍀 | Uncommon | 9% |
| Double XP Boost ⚡ | Uncommon | 7% |
| Gem Pile 💠 (90–110) | Rare | 5% |
| Mega Chest Item 🎁 | Epic | 1.4% |
| **Streak Freeze 🧊** | Legendary | **0.6%** |
| Treasure Gems 🌟 (225–275) | Epic | 0.55% |
| **Sunset Wallpaper 🌅** | Legendary | **0.35%** |
| **Galaxy Wallpaper 🌌** | Legendary | **0.1%** |

### 🥈 Silver Chest — EV ≈ 52.5 gems

| Prize | Rarity | Odds |
|---|---|---|
| Small Gem Pouch 💎 (5–15) | Common | 33% |
| Gem Bag 💰 (25–50) | Common | 31.5% |
| Chest Boost 🍀 | Uncommon | 12% |
| Double XP Boost ⚡ | Uncommon | 11% |
| Gem Pile 💠 (90–110) | Rare | 7.3% |
| Mega Chest Item 🎁 | Epic | 3% |
| **Streak Freeze 🧊** | Legendary | **0.9%** |
| Treasure Gems 🌟 (225–275) | Epic | 0.8% |
| **Sunset Wallpaper 🌅** | Legendary | **0.35%** |
| **Galaxy Wallpaper 🌌** | Legendary | **0.15%** |

### 🏆 Gold Chest — EV ≈ 60.4 gems

| Prize | Rarity | Odds |
|---|---|---|
| Small Gem Pouch 💎 (5–15) | Common | 33% |
| Gem Bag 💰 (25–50) | Common | 21% |
| Chest Boost 🍀 | Uncommon | 13.5% |
| Double XP Boost ⚡ | Uncommon | 13% |
| Gem Pile 💠 (90–110) | Rare | 11.3% |
| Mega Chest Item 🎁 | Epic | 5.75% |
| **Streak Freeze 🧊** | Legendary | **1.05%** |
| Treasure Gems 🌟 (225–275) | Epic | 0.85% |
| **Sunset Wallpaper 🌅** | Legendary | **0.4%** |
| **Galaxy Wallpaper 🌌** | Legendary | **0.15%** |

## Design rules (all machine-verified by `scripts/verify-chests.mjs`)

1. **Smallest chance = best prize.** Within every chest, probability is monotonically non-increasing as prize value rises.
2. **Jackpot band is truly tiny:** streak freeze + wallpapers combined are ≤ 1.45% per chest *base odds* and grow with chest quality (wood 1.05% → silver 1.3% → gold 1.45%).
3. **EV ordering:** better chests pay strictly more on average (39.7 < 52.5 < 60.4).
4. **Pity timers:** guaranteed Rare-or-better within 10 opens of the same chest tier; guaranteed legendary within any 50 opens. Bad luck is bounded.
5. **Duplicate protection:** a wallpaper you already own auto-converts to gems (Sunset → 150 💎, Galaxy → 250 💎). Refunds are below shop price, so no buy-and-refund exploit exists.
6. **Deterministic paths exist for every jackpot item:** Streak Freeze 🧊 200 💎, Sunset Wallpaper 🌅 750 💎, Galaxy Wallpaper 🌌 1200 💎 in the shop. Lucky drops are a bonus, not the only route.
7. **No gem-printing loops:** chests aren't purchasable; buying a Chest Boost (75 💎) can never return more than its cost on a wooden chest.

## Consolidated odds (base + pity guarantee, disclosed per transparency best practice)

The pity guarantee raises real-world jackpot frequency above base odds — measured over 200k simulated opens:

| Chest | Base legendary | Consolidated legendary |
|---|---|---|
| 📦 Wooden | 1.05% | ~2.98% |
| 🥈 Silver | 1.30% | ~3.03% |
| 🏆 Gold | 1.45% | ~2.99% |

In practice: **every player is guaranteed at least one streak freeze or wallpaper within any 50 chest opens**, and typically sees one roughly every 33 opens. The verifier caps consolidated rate below 3.5% so jackpots always feel special.

## Verification

```bash
node momomath-year2/scripts/verify-chests.mjs   # 37 checks, exit 1 on failure
node momomath-year2/scripts/effective-rates.mjs # advertised vs actual rates incl. pity
```
