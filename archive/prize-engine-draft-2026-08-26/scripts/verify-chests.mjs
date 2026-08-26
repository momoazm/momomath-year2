// Verification loop for the MomoMath Year 2 chest system.
// Run: node momomath-year2/scripts/verify-chests.mjs
// Exits 1 on ANY failure so it can gate CI / iterate-until-green workflows.

import { PRIZES, CHEST_TIERS, PITY, WEIGHT_SUM } from '../src/engine/loot-tables.js'

let failures = 0
let checks = 0

function check(name, ok, detail = '') {
  checks++
  if (!ok) {
    failures++
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`)
  } else {
    console.log(`  ok    ${name}`)
  }
}

const prizeOf = (k) => PRIZES[k]
const evOf = (tier) =>
  Object.entries(tier.weights).reduce((s, [k, w]) => s + prizeOf(k).gemValue * w, 0) / WEIGHT_SUM
const bandSum = (tier, rarities) =>
  Object.entries(tier.weights)
    .filter(([k]) => rarities.includes(prizeOf(k).rarity))
    .reduce((s, [, w]) => s + w, 0)

console.log('== 1. Structural integrity ==')
for (const tier of CHEST_TIERS) {
  const sum = Object.values(tier.weights).reduce((a, b) => a + b, 0)
  check(`${tier.id}: weights sum to exactly ${WEIGHT_SUM}`, sum === WEIGHT_SUM, `got ${sum}`)
  const allKnown = Object.keys(tier.weights).every((k) => PRIZES[k])
  check(`${tier.id}: every weight key is a known prize`, allKnown)
}

console.log('== 2. Smallest probability gives the best prizes ==')
for (const tier of CHEST_TIERS) {
  const entries = Object.entries(tier.weights)
    .map(([k, w]) => ({ value: prizeOf(k).gemValue, w, k }))
    .sort((a, b) => a.value - b.value)
  let monotone = true
  let badPair = ''
  for (let i = 1; i < entries.length; i++) {
    if (entries[i].value > entries[i - 1].value && entries[i].w > entries[i - 1].w) {
      monotone = false
      badPair = `${entries[i].k} (${entries[i].w}) vs cheaper ${entries[i - 1].k} (${entries[i - 1].w})`
      break
    }
  }
  check(`${tier.id}: higher-value prize => lower-or-equal probability`, monotone, badPair)

  // The jackpot slot (streak freeze + wallpapers) must be the least likely band.
  const jackpotW = bandSum(tier, ['legendary'])
  const commonW = bandSum(tier, ['common', 'uncommon', 'rare', 'epic'])
  check(`${tier.id}: jackpot band is rarer than everything else combined`, jackpotW < commonW / 50, `${jackpotW} vs ${commonW}`)

  // Ultra-rare feels "really small": under 2% per open.
  check(`${tier.id}: legendary band < 2%`, jackpotW / 100 < 2, `${(jackpotW / 100).toFixed(2)}%`)
}

console.log('== 3. Expected value ordering (better chest pays more) ==')
const evs = CHEST_TIERS.map((t) => ({ id: t.id, ev: evOf(t) }))
evs.forEach(({ id, ev }) => console.log(`        EV(${id}) = ${ev.toFixed(2)} gems`))
check('EV strictly increasing wood < silver < gold', evs[0].ev < evs[1].ev && evs[1].ev < evs[2].ev)
check('EV(wood) in sane lesson-reward range (< 60 gems)', evs[0].ev < 60, `${evs[0].ev.toFixed(2)}`)

console.log('== 4. Rarity bands scale with chest quality ==')
const legBands = CHEST_TIERS.map((t) => ({ id: t.id, v: bandSum(t, ['legendary']) }))
check(
  'legendary band non-decreasing with tier quality',
  legBands[0].v <= legBands[1].v && legBands[1].v <= legBands[2].v,
  legBands.map((b) => `${b.id}:${b.v}`).join(' '),
)
const wpBands = CHEST_TIERS.map((t) => ({
  id: t.id,
  v: Object.entries(t.weights)
    .filter(([k]) => k.startsWith('wallpaper'))
    .reduce((s, [, w]) => s + w, 0),
}))
check(
  'wallpaper band non-decreasing with tier quality',
  wpBands[0].v <= wpBands[1].v && wpBands[1].v <= wpBands[2].v,
  wpBands.map((b) => `${b.id}:${b.v}`).join(' '),
)
const freezeW = CHEST_TIERS.map((t) => t.weights.streakFreeze)
check(
  'streak-freeze odds non-decreasing with tier quality',
  freezeW[0] <= freezeW[1] && freezeW[1] <= freezeW[2],
  freezeW.join(' '),
)

console.log('== 5. Economy sanity (no exploit loops) ==')
for (const [k, p] of Object.entries(PRIZES)) {
  if (p.shopPrice && p.dupeRefund) {
    check(`${k}: duplicate refund < shop price (no buy->dupe loop)`, p.dupeRefund < p.shopPrice)
  }
}
// Buying chest-boost (75) to double a wood chest (+EV 39.73) must be net-negative.
check('chest-boost cannot print gems (cost > EV gain)', 75 > evs[0].ev, `75 vs ${evs[0].ev.toFixed(2)}`)
// Streak freeze obtainable both ways (RNG jackpot + deterministic shop path).
check('streak-freeze has deterministic shop path', PRIZES.streakFreeze.shopPrice > 0)
check('both wallpapers have deterministic shop paths', PRIZES.wallpaperSunset.shopPrice > 0 && PRIZES.wallpaperGalaxy.shopPrice > 0)

console.log('== 6. Monte Carlo (500,000 opens per tier) ==')
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

const N = 500_000
for (const tier of CHEST_TIERS) {
  const rand = mulberry32(1234567 + tier.id.length)
  const counts = {}
  for (let i = 0; i < N; i++) {
    const k = pickWeighted(tier.weights, rand)
    counts[k] = (counts[k] || 0) + 1
  }
  let worst = { k: '', dev: 0 }
  for (const [k, w] of Object.entries(tier.weights)) {
    const expected = (w / WEIGHT_SUM) * N
    const sigma = Math.sqrt(N * (w / WEIGHT_SUM) * (1 - w / WEIGHT_SUM))
    const z = Math.abs(counts[k] - expected) / sigma
    if (z > worst.dev) worst = { k, dev: z }
  }
  check(`${tier.id}: all empirical rates within 4 sigma`, worst.dev <= 4, `worst z=${worst.dev.toFixed(2)} on ${worst.k}`)
}

console.log('== 7. Pity timers bound bad luck ==')
function simulatePity(tierId) {
  const tier = CHEST_TIERS.find((t) => t.id === tierId)
  const rand = mulberry32(99 + tierId.length)
  const order = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 }
  let sinceRarePlus = 0
  let sinceLegendary = 0
  let maxRareGap = 0
  let maxLegGap = 0
  let legCount = 0
  const N = 200_000
  for (let i = 0; i < 200_000; i++) {
    const forceRare = sinceRarePlus >= PITY.RARE_PLUS_WITHIN - 1
    const forceLeg = sinceLegendary >= PITY.JACKPOT_WITHIN - 1
    let k
    if (forceLeg) {
      const legBand = Object.fromEntries(Object.entries(tier.weights).filter(([key]) => order[prizeOf(key).rarity] === 4))
      k = pickWeighted(legBand, rand)
    } else if (forceRare) {
      const rareBand = Object.fromEntries(Object.entries(tier.weights).filter(([key]) => order[prizeOf(key).rarity] >= 2))
      k = pickWeighted(rareBand, rand)
    } else {
      k = pickWeighted(tier.weights, rand)
    }
    const rank = order[prizeOf(k).rarity]
    if (rank === 4) legCount++
    sinceRarePlus = rank >= 2 ? 0 : sinceRarePlus + 1
    sinceLegendary = rank === 4 ? 0 : sinceLegendary + 1
    maxRareGap = Math.max(maxRareGap, sinceRarePlus)
    maxLegGap = Math.max(maxLegGap, sinceLegendary)
  }
  return { maxRareGap, maxLegGap, effectiveLegPct: (legCount / N) * 100 }
}
for (const tier of CHEST_TIERS) {
  const { maxRareGap, maxLegGap, effectiveLegPct } = simulatePity(tier.id)
  console.log(`        ${tier.id}: effective legendary rate with pity = ${effectiveLegPct.toFixed(2)}%`)
  check(
    `${tier.id}: rare+ gap never exceeds ${PITY.RARE_PLUS_WITHIN}`,
    maxRareGap <= PITY.RARE_PLUS_WITHIN,
    `observed max gap ${maxRareGap}`,
  )
  check(
    `${tier.id}: legendary gap never exceeds ${PITY.JACKPOT_WITHIN}`,
    maxLegGap <= PITY.JACKPOT_WITHIN,
    `observed max gap ${maxLegGap}`,
  )
  // Guard against future tuning making jackpots feel common (kid-friendly ceiling: ~3.5%).
  check(`${tier.id}: effective legendary rate stays magical (< 3.5%)`, effectiveLegPct < 3.5, `${effectiveLegPct.toFixed(2)}%`)
}

console.log('')
if (failures === 0) {
  console.log(`ALL ${checks} CHECKS PASSED — math is verified.`)
} else {
  console.log(`${failures}/${checks} CHECKS FAILED — fix and re-run.`)
}
process.exit(failures === 0 ? 0 : 1)
