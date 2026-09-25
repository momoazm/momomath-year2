// Phase 14 probe: guide card shows -> Let's go -> battle + autoplay; teach lines present
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
const page = await browser.newPage({ viewport: { width: 420, height: 900 } })
page.on('pageerror', (e) => console.log('PAGEERR', String(e).slice(0, 200)))
await page.addInitScript(() => {
  window.__tts = []
  const ps = window.speechSynthesis
  if (ps) { const os = ps.speak.bind(ps); ps.speak = (u) => { window.__tts.push({ text: u.text }); return os(u) } }
})
await page.goto(`${URL_BASE}?cb=${Date.now()}`, { waitUntil: 'domcontentloaded' })
await page.evaluate(({ seed, auth }) => {
  localStorage.setItem('momomath-year2-player-v2', JSON.stringify(seed))
  localStorage.setItem('momomath-year2-auth', JSON.stringify(auth))
}, { seed: SEED, auth: AUTH })
await page.evaluate(() => { location.href = location.pathname + '?cb=' + Date.now() })
await page.waitForLoadState('domcontentloaded').catch(() => {})
await page.waitForTimeout(1500)

await page.evaluate(() => {
  const nodes = Array.from(document.querySelectorAll('button[title]')).filter((b) => b.title && !b.closest('header, nav'))
  nodes[0].click()
})
await page.waitForTimeout(1500)

const guide = await page.evaluate(() => ({
  mission: /Today's mission/i.test(document.body.innerText),
  title: (Array.from(document.querySelectorAll('h2')).find((h) => h.textContent) || {}).textContent || null,
  lines: Array.from(document.querySelectorAll('.bg-sky-50')).map((p) => p.textContent),
  objectives: /Cambridge objectives/.test(document.body.innerText),
  letsGo: /Let's go/i.test(document.body.innerText),
  speakButtons: document.querySelectorAll('button[title="Say it again"]').length,
  tts: window.__tts,
}))
console.log('GUIDE', JSON.stringify(guide, null, 1))

await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll('button')).find((x) => /Let's go/i.test(x.textContent || ''))
  if (b) b.click()
})
await page.waitForTimeout(1500)

const battle = await page.evaluate(() => ({
  question: !!document.querySelector('.card-white button'),
  prompt: (document.querySelector('p.font-display') || {}).textContent || null,
  autoplay: window.__tts,
  audioBtns: Array.from(document.querySelectorAll('button')).map((b) => b.textContent.trim()).filter((t) => t.startsWith('\uD83D\uDD0A')),
  guideGone: !/Today's mission/i.test(document.body.innerText),
}))
console.log('AFTER LETS GO', JSON.stringify(battle, null, 1))
await browser.close()
