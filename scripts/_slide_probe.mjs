// Verbose reproduction probe for the live slideshow anti-skip walk flake
// (PLAN Phase-28 re-verify 2026-09-27: verify-live slideshow check failed 2/4
// live runs with mission=false while the harness kept clicking). Mirrors
// advanceSlideshow()'s timing but logs the button state every cycle.
// Usage: node scripts/_slide_probe.mjs [url] [runs]
import { createRequire } from 'node:module'

const require = createRequire('C:/Users/momo/AppData/Local/hermes/node/node_modules/@playwright/cli/playwright-core/index.js')
const { chromium } = require('playwright-core')

const URL_BASE = process.argv[2] || 'https://momoazm.github.io/momomath-year2/'
const RUNS = Number(process.argv[3] || 3)

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
    const btns = Array.from(document.querySelectorAll('[data-testid="slide-next"]')).map((b, i) => ({
      i,
      text: (b.textContent || '').trim(),
      disabled: !!b.disabled,
      visible: b.getBoundingClientRect().width > 0,
    }))
    const body = document.body.innerText
    const ss = document.querySelector('[data-testid="lesson-slideshow"]')
    return {
      slideshow: !!ss,
      buttons: btns,
      back: !!document.querySelector('[data-testid="slide-back"]'),
      missionInBody: /Today's mission/i.test(body),
      battleQ: /Q\s+\d+\/\d+/.test(body),
      slide: (ss ? ss.innerText : '').slice(0, 110).replace(/\n+/g, ' | '),
    }
  })

const runOnce = async (browser, n) => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
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
  console.log(`\n=== run ${n}: opened=${opened}`)
  await page.waitForTimeout(1200)

  // Mirror advanceSlideshow(): probe -> wait enabled -> probe -> click -> 300ms
  const t0 = Date.now()
  let clicks = 0
  let mission = false
  let last = ''
  for (let s = 0; s < 16; s++) {
    let st = await state(page)
    const snap = JSON.stringify(st)
    if (snap !== last) {
      console.log(`  [t+${((Date.now() - t0) / 1000).toFixed(1)}s it=${s}] ${snap}`)
      last = snap
    }
    if (!st.slideshow) { console.log('  -> slideshow gone'); break }
    const b0 = st.buttons[0]
    if (b0 && /Let's go/i.test(b0.text) && !b0.disabled) { mission = true; clicks++; await page.evaluate(() => document.querySelector('[data-testid="slide-next"]')?.click()); break }
    const enabled = await page
      .waitForSelector('[data-testid="slide-next"]:not([disabled])', { timeout: 15000 })
      .then(() => true).catch(() => false)
    if (!enabled) { console.log(`  -> enabled-wait TIMEOUT at it=${s}`); break }
    st = await state(page)
    const b = st.buttons[0]
    if (b && /Let's go/i.test(b.text)) { mission = true; clicks++; await page.evaluate(() => document.querySelector('[data-testid="slide-next"]')?.click()); break }
    await page.evaluate(() => document.querySelector('[data-testid="slide-next"]')?.click())
    clicks++
    await page.waitForTimeout(300)
  }
  const end = await state(page)
  console.log(`  RESULT run ${n}: mission=${mission} clicks=${clicks} end=${JSON.stringify(end)}`)
  await page.close()
  return { mission, clicks }
}

const browser = await chromium.launch()
let pass = 0
let fail = 0
for (let n = 1; n <= RUNS; n++) {
  try {
    const r = await runOnce(browser, n)
    r.mission ? pass++ : fail++
  } catch (e) {
    fail++
    console.log(`  ERROR run ${n}: ${e.message}`)
  }
}
await browser.close()
console.log(`\nSUMMARY: mission-reached=${pass} failed=${fail} of ${RUNS}`)