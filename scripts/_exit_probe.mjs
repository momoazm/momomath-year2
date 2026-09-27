// PLAN 151d probe: does the slideshow ✕ really get the player back to the path?
// Mirrors the live UX complaint (child stuck inside the intro deck with no way
// out). Mid-deck exit is the important case, so the probe advances one slide
// before hitting ✕. Usage: node scripts/_exit_probe.mjs [url] [runs]
import { createRequire } from 'node:module'

const require = createRequire('C:/Users/momo/AppData/Local/hermes/node/node_modules/@playwright/cli/playwright-core/index.js')
const { chromium } = require('playwright-core')

const URL_BASE = process.argv[2] || 'https://momoazm.github.io/momomath-year2/'
const RUNS = Number(process.argv[3] || 2)

const AUTH_SEED = {
  state: { user: { sub: 'qa-seed', name: 'Momo', email: 'qa@example.com' }, credential: null, guestName: null },
  version: 0,
}
const SEED = {
  state: {
    name: 'Momo', mascot: 'sonic', onboarded: true, gems: 120, xpTotal: 340,
    streakCurrent: 4, streakLongest: 5, dailyGoal: 30, todayXp: 10, soundOn: false,
    lessonProgress: {}, currentLeague: 'Bronze', shopInventory: {}, achievements: [],
    leagueHistory: [], cardStars: { tails: 17, amy: 4, knuckles: 6 }, cardPity: 0,
    claimedQuests: { day: '1970-01-01', questIds: [] },
  },
  version: 7,
}

const state = (page) =>
  page.evaluate(() => {
    const body = document.body.innerText
    const close = document.querySelector('[data-testid="slide-close"]')
    const ss = document.querySelector('[data-testid="lesson-slideshow"]')
    return {
      close: close ? { label: close.getAttribute('aria-label'), disabled: !!close.disabled } : null,
      slideshow: !!ss,
      slide: (ss ? ss.innerText : '').slice(0, 80).replace(/\n+/g, ' | '),
      battleHp: /\d+\/\d+ HP/.test(body),
      roadmap: /Daily goal/i.test(body),
      gate: !!document.querySelector('div.fixed.inset-0.z-50'),
      url: location.search,
    }
  })

const runOnce = async (browser, n) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`.slice(0, 160)) })
  await page.goto(URL_BASE, { waitUntil: 'domcontentloaded' })
  await page.evaluate(({ a, s }) => {
    localStorage.setItem('momomath-year2-auth', JSON.stringify(a))
    localStorage.setItem('momomath-year2-player-v2', JSON.stringify(s))
  }, { a: AUTH_SEED, s: SEED })
  await page.goto(URL_BASE, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2500)

  const opened = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button[title]'))
      .find((x) => /Count Everything/.test(x.title || '') && !x.disabled)
    if (!b) return false
    b.click()
    return true
  })
  await page.waitForTimeout(1200)
  const before = await state(page)
  console.log(`\n=== run ${n}: opened=${opened} slide0=${JSON.stringify(before)}`)

  // Advance one slide (respecting the anti-skip gate) so the ✕ is exercised
  // mid-deck rather than on slide 0.
  const enabled = await page
    .waitForSelector('[data-testid="slide-next"]:not([disabled])', { timeout: 15000 })
    .then(() => true).catch(() => false)
  if (enabled) {
    await page.evaluate(() => document.querySelector('[data-testid="slide-next"]')?.click())
    await page.waitForTimeout(600)
  }
  const mid = await state(page)
  console.log(`  mid-deck (advanced=${enabled}) ${JSON.stringify(mid)}`)

  const clicked = await page.evaluate(() => {
    const b = document.querySelector('[data-testid="slide-close"]')
    if (!b) return false
    b.click()
    return true
  })
  await page.waitForTimeout(1500)
  const after = await state(page)
  console.log(`  after ✕ clicked=${clicked}: ${JSON.stringify(after)}`)

  // Re-entering must still work after an exit.
  const reopen = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button[title]'))
      .find((x) => /Count Everything/.test(x.title || '') && !x.disabled)
    if (!b) return false
    b.click()
    return true
  })
  await page.waitForTimeout(1200)
  const re = await state(page)
  console.log(`  reopen=${reopen} ${JSON.stringify(re)}`)

  const pass = opened && !!before.close && !before.close.disabled && clicked &&
    !after.slideshow && !after.battleHp && after.roadmap && !after.gate &&
    reopen && re.slideshow && !!re.close
  const realErrors = errors.filter((e) => !/favicon|net::|ERR_|Failed to load resource|google/i.test(e))
  console.log(`  RESULT run ${n}: pass=${pass} errors=${JSON.stringify(realErrors.slice(0, 4))}`)
  await page.close()
  return { pass, errors: realErrors }
}

const browser = await chromium.launch()
let pass = 0
let fail = 0
const errs = []
for (let n = 1; n <= RUNS; n++) {
  try {
    const r = await runOnce(browser, n)
    r.pass ? pass++ : fail++
    errs.push(...r.errors)
  } catch (e) {
    fail++
    console.log(`  ERROR run ${n}: ${e.message}`)
  }
}
await browser.close()
console.log(`\nSUMMARY: exit-pass=${pass} failed=${fail} of ${RUNS} uniqueErrors=${JSON.stringify([...new Set(errs)].slice(0, 6))}`)
