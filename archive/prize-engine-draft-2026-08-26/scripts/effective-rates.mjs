// Measures EFFECTIVE prize rates including pity timers (advertised vs actual).
import { PRIZES, CHEST_TIERS, PITY, WEIGHT_SUM } from '../src/engine/loot-tables.js'

const order = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 }
const prizeOf = (k) => PRIZES[k]

function pickWeighted(weights, rand) {
  const entries = Object.entries(weights)
  const total = entries.reduce((s, [, w]) => s + w, 0)
  let roll = rand() * total
  for (const [k, w] of entries) {
    roll -= w
    if (roll < 0) return k
  }
  return entries[entries.length - 1][0]
}

function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const N = 1_000_000
for (const tier of CHEST_TIERS) {
  const rand = mulberry32(424242)
  let sinceRarePlus = 0
  let sinceLegendary = 0
  const counts = {}
  for (let i = 0; i < N; i++) {
    const forceLeg = sinceLegendary >= PITY.JACKPOT_WITHIN - 1
    const forceRare = sinceRarePlus >= PITY.RARE_PLUS_WITHIN - 1
    let k
    if (forceLeg) {
      k = pickWeighted(Object.fromEntries(Object.entries(tier.weights).filter(([key]) => order[prizeOf(key).rarity] === 4)), rand)
    } else if (forceRare) {
      k = pickWeighted(Object.fromEntries(Object.entries(tier.weights).filter(([key]) => order[prizeOf(key).rarity] >= 2)), rand)
    } else {
      k = pickWeighted(tier.weights, rand)
    }
    counts[k] = (counts[k] || 0) + 1
    const rank = order[prizeOf(k).rarity]
    sinceRarePlus = rank >= 2 ? 0 : sinceRarePlus + 1
    sinceLegendary = rank === 4 ? 0 : sinceLegendary + 1
  }
  console.log(`\n${tier.name} — effective vs advertised (per ${N.toLocaleString()} opens):`)
  const legKeys = Object.keys(tier.weights).filter((k) => order[prizeOf(k).rarity] === 4)
  for (const k of Object.keys(tier.weights)) {
    const effPct = ((counts[k] / N) * 100).toFixed(3)
    const advPct = ((tier.weights[k] / WEIGHT_SUM) * 100).toFixed(2)
    const flag = legKeys.includes(k) ? ' <-- jackpot' : ''
    console.log(`  ${prizeOf(k).label.padEnd(20)} advertised ${String(advPct).padStart(6)}%  effective ${effPct}%${flag}`)
  }
}
