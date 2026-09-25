// Phase 15 probe: book node -> reader pages -> finish -> reward -> node gold + gems +20
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
await page.goto(`${URL_BASE}?cb=${Date.now()}`, { waitUntil: 'domcontentloaded' })
await page.evaluate(({ seed, auth }) => {
  localStorage.setItem('momomath-year2-player-v2', JSON.stringify(seed))
  localStorage.setItem('momomath-year2-auth', JSON.stringify(auth))
}, { seed: SEED, auth: AUTH })
await page.evaluate(() => { location.href = location.pathname + '?cb=' + Date.now() })
await page.waitForLoadState('domcontentloaded').catch(() => {})
await page.waitForTimeout(1500)

const nodes = await page.evaluate(() =>
  Array.from(document.querySelectorAll('button[title]')).map((b) => b.title).filter((t) => /book|Read/i.test(t)),
)
console.log('BOOK NODES on roadmap:', JSON.stringify(nodes))

const gems0 = await page.evaluate(() => JSON.parse(localStorage.getItem('momomath-year2-player-v2')).state.gems)

await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll('button')).find((x) => /Read the book/i.test(x.textContent || ''))
  b.click()
})
await page.waitForTimeout(1200)

const p1 = await page.evaluate(() => ({
  url: location.search,
  counter: (Array.from(document.querySelectorAll('span')).find((s) => /\/\d/.test(s.textContent) && /📖/.test(s.textContent)) || {}).textContent,
  text: (Array.from(document.querySelectorAll('p.font-body')).find((p) => p.textContent.length > 20) || {}).textContent,
  dots: document.querySelectorAll('.h-2\\.5').length,
  hasFocus: /👆/.test(document.body.innerText),
}))
console.log('PAGE 1:', JSON.stringify(p1))

// flip to the end
for (let i = 0; i < 6; i++) {
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find((x) => x.textContent.trim() === '→' || /The End/.test(x.textContent || ''))
    if (b) b.click()
  })
  await page.waitForTimeout(350)
}
const end = await page.evaluate(() => ({ theEnd: /The End/.test(document.body.innerText) }))
console.log('AT END:', JSON.stringify(end))

await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll('button')).find((x) => /The End/.test(x.textContent || ''))
  if (b) b.click()
})
await page.waitForTimeout(800)
const reward = await page.evaluate(() => ({
  celebrated: /whole book/.test(document.body.innerText),
  gems: JSON.parse(localStorage.getItem('momomath-year2-player-v2')).state.gems,
  booksRead: JSON.parse(localStorage.getItem('momomath-year2-player-v2')).state.booksRead,
  version: JSON.parse(localStorage.getItem('momomath-year2-player-v2')).version,
}))
console.log('REWARD:', JSON.stringify(reward), 'gems0=', gems0)

await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll('button')).find((x) => /Keep going/.test(x.textContent || ''))
  if (b) b.click()
})
await page.waitForTimeout(900)
const back = await page.evaluate(() => ({
  goldNode: /Read the book/.test(document.body.innerText),
  headerBadge: /📖✅/.test(document.body.innerText),
  url: location.search,
}))
console.log('BACK ON PATH:', JSON.stringify(back))
await browser.close()
