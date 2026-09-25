// Phase 16 probe: locked popup, practice node, unit trophy (+30, once)
import { createRequire } from 'node:module'
const require = createRequire('C:/Users/momo/AppData/Local/hermes/node/node_modules/@playwright/cli/node_modules/playwright-core/index.js')
const { chromium } = require('playwright-core')
const URL_BASE = process.argv[2] || 'http://127.0.0.1:3200/'
const baseState = {
  name: 'Momo', mascot: 'sonic', onboarded: true, gems: 120, xpTotal: 340,
  subject: 'english', soundOn: true,
  streakCurrent: 4, streakLongest: 5, dailyGoal: 30, todayXp: 10,
  lessonProgress: {}, currentLeague: 'Bronze', shopInventory: {}, achievements: [],
  leagueHistory: [], cardStars: {}, cardPity: 0,
  claimedQuests: { day: '1970-01-01', questIds: [] },
  dust: 120, arcadeScores: {}, arcadeRounds: 0, arcadeBossesDown: 0,
}
const AUTH = { state: { user: { sub: 'qa-seed', name: 'Momo', email: 'qa@example.com' }, credential: null, guestName: null }, version: 0 }
const browser = await chromium.launch({ headless: true })

async function withPage(seed, fn) {
  const page = await browser.newPage({ viewport: { width: 420, height: 900 } })
  page.on('pageerror', (e) => console.log('PAGEERR', String(e).slice(0, 200)))
  await page.goto(`${URL_BASE}?cb=${Date.now()}`, { waitUntil: 'domcontentloaded' })
  await page.evaluate(({ seed, auth }) => {
    localStorage.setItem('momomath-year2-player-v2', JSON.stringify(seed))
    localStorage.setItem('momomath-year2-auth', JSON.stringify(auth))
  }, { seed, auth: AUTH })
  await page.evaluate(() => { location.href = location.pathname + '?cb=' + Date.now() })
  await page.waitForLoadState('domcontentloaded').catch(() => {})
  await page.waitForTimeout(1500)
  await fn(page)
  await page.close()
}

// A) locked lesson popup + practice node
await withPage({ state: baseState, version: 12 }, async (page) => {
  const meta = await page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll('button[title]')).map((b) => ({ t: b.title, d: b.getAttribute('aria-disabled') }))
    return {
      practice: labels.filter((x) => /Practice|practice/.test(x.t)),
      lockedSample: labels.filter((x) => /Finish the previous/.test(x.t)).slice(0, 2),
    }
  })
  console.log('A NODES', JSON.stringify(meta))
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find((x) => x.title && /Finish the previous/.test(x.title))
    b.click()
  })
  await page.waitForTimeout(600)
  const popup = await page.evaluate(() => ({
    shown: /you've got this/.test(document.body.innerText),
    msg: (Array.from(document.querySelectorAll('p.font-display')).find((p) => /got this/.test(p.textContent)) || {}).textContent,
    gotIt: /Got it!/.test(document.body.innerText),
  }))
  console.log('A LOCKED POPUP', JSON.stringify(popup))
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find((x) => /Got it!/.test(x.textContent || ''))
    if (b) b.click()
  })
  await page.waitForTimeout(400)
  // practice node popup (locked)
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find((x) => /Practice/.test(x.textContent || ''))
    if (b) b.click()
  })
  await page.waitForTimeout(500)
  console.log('A PRACTICE POPUP', JSON.stringify(await page.evaluate(() => /Finish every lesson/.test(document.body.innerText))))
})

// B) trophy: unit e1 fully mastered -> celebration -> +30
const mastered = {}
for (const id of ['e1l1','e1l2','e1l3','e1l4','e1l5','e1boss']) mastered[id] = { crown: 3, bestAccuracy: 100, completions: 1 }
await withPage({ state: { ...baseState, gems: 100, lessonProgress: mastered }, version: 12 }, async (page) => {
  const b0 = await page.evaluate(() => JSON.parse(localStorage.getItem('momomath-year2-player-v2')).state.gems)
  const trophy = await page.evaluate(() => ({
    shown: /Unit mastered!/.test(document.body.innerText) && /🏆/.test(document.body.innerText),
    plus: /\+30/.test(document.body.innerText),
    amazing: /Amazing!/.test(document.body.innerText),
    inlineLine: document.body.innerText.match(/Unit mastered!/g)?.length ?? 0,
  }))
  console.log('B TROPHY', JSON.stringify(trophy), 'gems0=', b0)
  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find((x) => /Amazing!/.test(x.textContent || ''))
    if (b) b.click()
  })
  await page.waitForTimeout(600)
  const after = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('momomath-year2-player-v2')).state
    return { gems: s.gems, unitsCelebrated: s.unitsCelebrated, trophyGone: !document.body.innerText.includes('🏆'), inlineStillThere: /Unit mastered! 🎉/.test(document.body.innerText) }
  })
  console.log('B AFTER', JSON.stringify(after))
  // reload: no trophy again
  await page.evaluate(() => { location.href = location.pathname + '?cb=' + Date.now() })
  await page.waitForLoadState('domcontentloaded').catch(() => {})
  await page.waitForTimeout(1500)
  console.log('B RELOAD trophyGone:', await page.evaluate(() => !document.body.innerText.includes('+30')))
})
await browser.close()
