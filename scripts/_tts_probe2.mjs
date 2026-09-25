import { createRequire } from 'node:module'
const require = createRequire('C:/Users/momo/AppData/Local/hermes/node/node_modules/@playwright/cli/node_modules/playwright-core/index.js')
const { chromium } = require('playwright-core')
const URL_BASE = 'http://127.0.0.1:3200/'
const SEED = { state: { name: 'Momo', mascot: 'sonic', onboarded: true, gems: 120, xpTotal: 340, subject: 'english', soundOn: true, streakCurrent: 4, streakLongest: 5, dailyGoal: 30, todayXp: 10, lessonProgress: {}, currentLeague: 'Bronze', shopInventory: {}, achievements: [], leagueHistory: [], cardStars: {}, cardPity: 0, claimedQuests: { day: '1970-01-01', questIds: [] }, dust: 120, arcadeScores: {}, arcadeRounds: 0, arcadeBossesDown: 0 }, version: 11 }
const AUTH = { state: { user: { sub: 'qa-seed', name: 'Momo', email: 'qa@example.com' }, credential: null, guestName: null }, version: 0 }
const INIT = () => {
  const log = []; window.__ttsLog = log
  const ps = window.speechSynthesis
  if (ps) {
    const oS = ps.speak.bind(ps), oC = ps.cancel.bind(ps)
    ps.speak = (u) => { log.push({ ev: 'speak', text: u.text, t: Date.now() }); return oS(u) }
    ps.cancel = () => { log.push({ ev: 'cancel', t: Date.now() }); return oC() }
  }
}
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
await page.addInitScript(INIT)
await page.goto(`${URL_BASE}?cb=${Date.now()}`, { waitUntil: 'domcontentloaded' })
await page.evaluate(({ seed, auth }) => {
  localStorage.setItem('momomath-year2-player-v2', JSON.stringify(seed))
  localStorage.setItem('momomath-year2-auth', JSON.stringify(auth))
}, { seed: SEED, auth: AUTH })
await page.evaluate(() => { location.href = location.pathname + '?lesson=e1l1&cb=' + Date.now() })
await page.waitForLoadState('domcontentloaded').catch(() => {})
await page.waitForTimeout(1500)
// click any start/continue button on intro
for (let i = 0; i < 3; i++) {
  const clicked = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) => /Let's go|Start|Begin|Play|Continue|▶/i.test(b.textContent || ''))
    if (!btn) return null
    btn.click(); return btn.textContent.trim().slice(0, 30)
  })
  console.log('intro click:', clicked)
  if (!clicked) break
  await page.waitForTimeout(900)
}
await page.waitForTimeout(1200)
const info = await page.evaluate(() => {
  const body = document.body.innerText
  return {
    promptLine: (body.match(/Tap the word you hear/) || [null])[0],
    audioButtons: Array.from(document.querySelectorAll('button')).filter((x) => /🔊|🐢/.test(x.textContent || '')).map((x) => x.textContent.trim().slice(0, 40)),
    ttsLog: window.__ttsLog,
    bodyHead: body.slice(0, 300).replace(/\s+/g, ' '),
  }
})
console.log(JSON.stringify(info, null, 1))
await browser.close()
