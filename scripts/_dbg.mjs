import { createRequire } from 'node:module'
const require = createRequire('C:/Users/momo/AppData/Local/hermes/node/node_modules/@playwright/cli/node_modules/playwright-core/index.js')
const { chromium } = require('playwright-core')
const baseState = {
  name: 'Momo', mascot: 'sonic', onboarded: true, gems: 120, xpTotal: 340,
  subject: 'english', soundOn: true, streakCurrent: 4, streakLongest: 5,
  dailyGoal: 30, todayXp: 10, lessonProgress: {}, currentLeague: 'Bronze',
  shopInventory: {}, achievements: [], leagueHistory: [], cardStars: {}, cardPity: 0,
  claimedQuests: { day: '1970-01-01', questIds: [] },
  dust: 120, arcadeScores: {}, arcadeRounds: 0, arcadeBossesDown: 0,
}
const AUTH = { state: { user: { sub: 'qa-seed', name: 'Momo', email: 'qa@example.com' }, credential: null, guestName: null }, version: 0 }
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 420, height: 900 } })
await page.goto('http://127.0.0.1:3200/?cb=' + Date.now(), { waitUntil: 'domcontentloaded' })
await page.evaluate(({ seed, auth }) => {
  localStorage.setItem('momomath-year2-player-v2', JSON.stringify(seed))
  localStorage.setItem('momomath-year2-auth', JSON.stringify(auth))
}, { seed: { state: baseState, version: 12 }, auth: AUTH })
await page.evaluate(() => { location.href = location.pathname + '?cb=' + Date.now() })
await page.waitForLoadState('domcontentloaded').catch(() => {})
await page.waitForTimeout(2000)
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll('button')).find((x) => x.title && /Finish the previous/.test(x.title))
  b.click()
})
await page.waitForTimeout(600)
const before = await page.evaluate(() => ({
  gotItBtns: Array.from(document.querySelectorAll('button')).filter((b) => /Got it!/.test(b.textContent)).length,
  popupText: /you've got this/.test(document.body.innerText),
}))
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll('button')).find((x) => /Got it!/.test(x.textContent || ''))
  if (b) b.click()
})
await page.waitForTimeout(500)
const after = await page.evaluate(() => ({
  gotItBtns: Array.from(document.querySelectorAll('button')).filter((b) => /Got it!/.test(b.textContent)).length,
  popupText: /you've got this/.test(document.body.innerText),
}))
console.log('POPUP', JSON.stringify({ before, after }))
await browser.close()
