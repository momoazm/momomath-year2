// PLAN 151d side-effect probe: pressing the slideshow ✕ must be a clean
// ABORT — back to the path, no XP/gems awarded, lesson NOT marked complete
// (verify-live.mjs covers the UX, this covers the save-state invariant).
// Usage: node scripts/_exit_state_probe.mjs [url]
import { createRequire } from 'node:module'

const require = createRequire('C:/Users/momo/AppData/Local/hermes/node/node_modules/@playwright/cli/playwright-core/index.js')
const { chromium } = require('playwright-core')

const URL_BASE = process.argv[2] || 'https://momoazm.github.io/momomath-year2/'

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

const PLAYER_KEY = 'momomath-year2-player-v2'
const read = (page) =>
  page.evaluate((k) => {
    const s = JSON.parse(localStorage.getItem(k)).state
    return {
      xpTotal: s.xpTotal, todayXp: s.todayXp, gems: s.gems,
      u1l1: s.lessonProgress?.u1l1 ?? null,
      roadmap: /Daily goal/i.test(document.body.innerText),
      slideshow: !!document.querySelector('[data-testid="lesson-slideshow"]'),
      hp: /\d+\/\d+ HP/.test(document.body.innerText),
    }
  }, PLAYER_KEY)

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
const errors = []
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`.slice(0, 140)) })
await page.goto(URL_BASE, { waitUntil: 'domcontentloaded' })
await page.evaluate(({ a, s }) => {
  localStorage.setItem('momomath-year2-auth', JSON.stringify(a))
  localStorage.setItem('momomath-year2-player-v2', JSON.stringify(s))
}, { a: AUTH_SEED, s: SEED })
await page.goto(URL_BASE, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(2500)
const before = await read(page)
console.log('BEFORE exit :', JSON.stringify(before))

await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll('button[title]'))
    .find((x) => /Count Everything/.test(x.title || '') && !x.disabled)
  b?.click()
})
await page.waitForTimeout(1200)
// advance one slide so the ✕ is exercised mid-deck, not on slide 0
await page
  .waitForSelector('[data-testid="slide-next"]:not([disabled])', { timeout: 15000 })
  .then(() => page.evaluate(() => document.querySelector('[data-testid="slide-next"]')?.click()))
  .catch(() => {})
await page.waitForTimeout(700)
const clicked = await page.evaluate(() => {
  const b = document.querySelector('[data-testid="slide-close"]')
  if (!b) return false
  b.click()
  return true
})
await page.waitForTimeout(2500)
const after = await read(page)
console.log(`AFTER exit (clicked=${clicked}):`, JSON.stringify(after))

const pass = clicked && !after.slideshow && !after.hp && after.roadmap &&
  after.xpTotal === before.xpTotal && after.todayXp === before.todayXp &&
  after.gems === before.gems && after.u1l1 === null
console.log(`RESULT no-progress-on-exit=${pass}`)
console.log(`ERRORS ${JSON.stringify([...new Set(errors)].slice(0, 5))}`)
await browser.close()
process.exit(pass && errors.length === 0 ? 0 : 1)
