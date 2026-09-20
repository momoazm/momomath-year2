// Legacy-save probe: replays OLD persisted-state versions against the LIVE
// site to reproduce the "returning user blank page" (fresh seeds always
// rendered fine). For each legacy version: seed localStorage, load, capture
// pageerror/console errors + whether the home path renders, screenshot it.
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'

const require = createRequire('C:/Users/momo/AppData/Local/hermes/node/node_modules/@playwright/cli/playwright-core/index.js')
const { chromium } = require('playwright-core')

const URL_BASE = process.argv[2] || 'https://momoazm.github.io/momomath-year2/'
const OUT = 'C:/Users/momo/screenshot_loop_output'
mkdirSync(OUT, { recursive: true })

// Common current-shape core; each legacy case drops/reshapes fields per era.
const CORE = {
  name: 'Momo', mascot: 'sonic', onboarded: true, gems: 120, xpTotal: 340,
  streakCurrent: 4, streakLongest: 5, dailyGoal: 30, todayXp: 10, soundOn: false,
  lessonProgress: {}, currentLeague: 'Bronze', shopInventory: {}, achievements: [],
  leagueHistory: [], claimedQuests: { day: '1970-01-01', questIds: [] },
}

const CASES = [
  { v: 3, state: { ...CORE, cardCollection: ['tails', 'amy'], weeklyXp: 12 } }, // pre-v4: old card field, no streak fields
  { v: 5, state: { ...CORE, cardCollection: ['tails', 'amy'], lastStreakReward: 0, pendingStreakMilestone: null, weeklyXpWeek: '', weeklyXp: 12 } },
  { v: 6, state: { ...CORE, cardCounts: { tails: 3, amy: 1 }, cardPity: 0, lastStreakReward: 0, pendingStreakMilestone: null, weeklyXpWeek: '', weeklyXp: 12 } },
  { v: 7, state: { ...CORE, cardStars: { tails: 3, amy: 1 }, cardPity: 0, lastStreakReward: 0, pendingStreakMilestone: null, weeklyXpWeek: '', weeklyXp: 12 } },
  { v: 8, state: { ...CORE, cardStars: { tails: 3, amy: 1 }, cardPity: 0, lastStreakReward: 0, pendingStreakMilestone: null, weeklyXpWeek: '', weeklyXp: 12, pendingLeagueSettle: null } },
]

const results = []
const main = async () => {
  const browser = await chromium.launch({ headless: true })
  for (const c of CASES) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
    const page = await ctx.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(String(e)))
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
    page.setDefaultTimeout(20000)
    const url = `${URL_BASE}?cb=legacy${c.v}-${Date.now()}`
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    await page.evaluate(([seed, ver]) => {
      localStorage.setItem('momomath-year2-player-v2', JSON.stringify({ state: seed, version: ver }))
    }, [c.state, c.v])
    await page.goto(url, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)
    const rendered = await page.evaluate(() => {
      const body = document.body.innerText
      return {
        unitVisible: /Unit 1/i.test(body),
        dailyGoal: /Daily goal/i.test(body),
        welcomeGate: /Welcome to Momo Year 2/i.test(body),
        bodyLen: body.length,
      }
    })
    const pass = rendered.unitVisible && errors.length === 0
    results.push({ v: c.v, pass, rendered, errors: errors.slice(0, 3) })
    console.log(`${pass ? 'PASS' : 'FAIL'} legacy-v${c.v} unit=${rendered.unitVisible} dailyGoal=${rendered.dailyGoal} gate=${rendered.welcomeGate} bodyLen=${rendered.bodyLen} errors=${errors.length ? JSON.stringify(errors.slice(0, 2)) : 'none'}`)
    await page.screenshot({ path: `${OUT}/legacy-v${c.v}.png` }).catch(() => {})
    await ctx.close()
  }
  await browser.close()
  const failed = results.filter((r) => !r.pass)
  console.log(`\n${results.length - failed.length}/${results.length} legacy cases passed`)
  process.exit(failed.length ? 1 : 0)
}
main().catch((e) => { console.error('PROBE FAILED', e); process.exit(2) })