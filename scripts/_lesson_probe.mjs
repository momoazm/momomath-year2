// Lesson-path probe (dev): seeded ?lesson= flow — intro -> Let's go -> AudioBar present + click speaks?
import { createRequire } from 'node:module'
const require = createRequire('C:/Users/momo/AppData/Local/hermes/node/node_modules/@playwright/cli/node_modules/playwright-core/index.js')
const { chromium } = require('playwright-core')

const URL_BASE = process.argv[2] || 'http://127.0.0.1:3200/'
const SEED = {
  state: {
    name: 'Momo', mascot: 'sonic', onboarded: true, gems: 120, xpTotal: 340,
    subject: 'english', soundOn: true,
    streakCurrent: 4, streakLongest: 5, dailyGoal: 30, todayXp: 10,
    lessonProgress: {}, currentLeague: 'Bronze', shopInventory: {}, achievements: [],
    leagueHistory: [], cardStars: {}, cardPity: 0,
    claimedQuests: { day: '1970-01-01', questIds: [] },
    dust: 120, arcadeScores: {}, arcadeRounds: 0, arcadeBossesDown: 0,
  },
  version: 11,
}
const AUTH = { state: { user: { sub: 'qa-seed', name: 'Momo', email: 'qa@example.com' }, credential: null, guestName: null }, version: 0 }

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
page.on('pageerror', (e) => console.log('PAGEERR', String(e).slice(0, 200)))
await page.addInitScript(() => {
  window.__ttsLog = []
  const ps = window.speechSynthesis
  if (ps) {
    const os = ps.speak.bind(ps)
    ps.speak = (u) => { window.__ttsLog.push({ ev: 'speak', text: u.text, lang: u.lang }); return os(u) }
  }
})
await page.goto(`${URL_BASE}?cb=${Date.now()}`, { waitUntil: 'domcontentloaded' })
await page.evaluate(({ seed, auth }) => {
  localStorage.setItem('momomath-year2-player-v2', JSON.stringify(seed))
  localStorage.setItem('momomath-year2-auth', JSON.stringify(auth))
}, { seed: SEED, auth: AUTH })
await page.evaluate(() => { location.href = location.pathname + '?lesson=e1l1&cb=' + Date.now() })
await page.waitForLoadState('domcontentloaded').catch(() => {})
await page.waitForTimeout(1500)

const intro = await page.evaluate(() => ({
  hasIntro: /Let.s go/i.test(document.body.innerText),
  buttons: Array.from(document.querySelectorAll('button')).map((b) => b.textContent.trim()).slice(0, 8),
}))
console.log('INTRO', JSON.stringify(intro))

await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll('button')).find((x) => /Let.s go/i.test(x.textContent || ''))
  if (b) b.click()
})
await page.waitForTimeout(1200)

const qInfo = await page.evaluate(() => ({
  audioButtons: Array.from(document.querySelectorAll('button')).map((b) => b.textContent.trim()).filter((t) => t.startsWith('\uD83D\uDD0A') || t.startsWith('\uD83E\uDD22')),
  prompt: (document.querySelector('p.font-display') || {}).textContent || null,
}))
console.log('LESSON QUESTION', JSON.stringify(qInfo))

const clicked = await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll('button')).find((x) => /\uD83D\uDD0A\s*Listen/.test(x.textContent || ''))
  if (!b) return false
  b.click()
  return true
})
await page.waitForTimeout(700)
console.log('CLICKED LISTEN:', clicked, 'SPEAK EVENTS:', JSON.stringify(await page.evaluate(() => window.__ttsLog)))
await browser.close()
