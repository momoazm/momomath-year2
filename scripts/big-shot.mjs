// Visual check: real Big the Cat image (cards/big.webp) renders in the
// live Library on the deployed site, desktop viewport. Exit 0 iff loaded.
import { createRequire } from 'node:module'
const require = createRequire('C:/Users/momo/AppData/Local/hermes/node/node_modules/@playwright/cli/playwright-core/index.js')
const { chromium } = require('playwright-core')

const URL_BASE = 'https://momoazm.github.io/momomath-year2/'
const seed = {
  state: {
    name: 'Momo', mascot: 'sonic', onboarded: true, gems: 120, xpTotal: 340,
    streakCurrent: 4, streakLongest: 5, dailyGoal: 30, todayXp: 10, soundOn: false,
    lessonProgress: {}, currentLeague: 'Bronze', shopInventory: {}, achievements: [],
    leagueHistory: [], cardStars: { big: 2, tails: 17, amy: 4 }, cardPity: 0,
    claimedQuests: { day: '1970-01-01', questIds: [] },
  },
  version: 7,
}

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
await page.goto(URL_BASE, { waitUntil: 'domcontentloaded' })
await page.evaluate((s) => {
  localStorage.setItem('momomath-year2-player-v2', JSON.stringify(s))
  localStorage.setItem('momomath-year2-auth', JSON.stringify({ state: { user: null, guestName: 'Momo' }, version: 0 }))
}, seed)
await page.goto(URL_BASE + '?library&cb=' + Date.now(), { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)

const big = await page.evaluate(() => {
  const img = Array.from(document.querySelectorAll('img')).find((i) => /big\.webp/.test(i.src || ''))
  if (!img) return { found: false }
  const card = img.closest('div')
  const nameEl = Array.from(document.querySelectorAll('*')).find((e) => e.children.length === 0 && e.textContent === 'Big the Cat')
  return {
    found: true,
    src: img.src,
    loaded: img.complete && img.naturalWidth > 0,
    naturalWidth: img.naturalWidth,
    visible: img.getBoundingClientRect().height > 40,
    nameVisible: !!nameEl,
  }
})
await page.screenshot({ path: 'C:/Users/momo/screenshot_loop_output/big-library-desktop.png' })
console.log(JSON.stringify(big, null, 2))
console.log(`pageErrors=${errors.length}`)
const pass = big.found && big.loaded && big.visible && errors.length === 0
console.log(pass ? 'PASS big.webp renders in live library (desktop 1280x900)' : 'FAIL big.webp did not render')
await browser.close()
process.exit(pass ? 0 : 1)
