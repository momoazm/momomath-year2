import { chromium } from 'file:///C:/Users/momo/.config/opencode/skills/website-clips/scripts/node_modules/playwright-core/index.mjs'

const BASE = 'http://localhost:3200'
const OUT = 'C:/Users/momo/Documents/momomath-year2/shots'

const browser = await chromium.launch({ channel: 'msedge', headless: true })
const page = await browser.newPage({ viewport: { width: 420, height: 860 } })
page.setDefaultTimeout(30000)
const errors = []
page.on('pageerror', (e) => errors.push('pageerror: ' + String(e)))
page.on('console', (m) => m.type() === 'error' && errors.push('console: ' + m.text()))

const shots = process.argv.slice(2)
const all = shots.length === 0

async function seedPlayer() {
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => {
    const state = {
      state: {
        name: 'Momo', mascot: 'sonic', onboarded: true, gems: 120, xpTotal: 340,
        streakCurrent: 3, streakLongest: 5, dailyGoal: 50, todayXp: 20, soundOn: false,
        lessonProgress: { u1l1: { crown: 3, bestAccuracy: 100, completions: 2 } },
        currentLeague: 'Bronze', shopInventory: {}, achievements: [], leagueHistory: [],
      },
      version: 0,
    }
    localStorage.setItem('momomath-year2-player-v2', JSON.stringify(state))
  })
}

if (all || shots.includes('gallery')) {
  await page.goto(BASE + '/?gallery=1', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  await page.screenshot({ path: OUT + '/gallery-happy.png' })
  await page.screenshot({ path: OUT + '/gallery-full.png', fullPage: true })
  await page.getByRole('button', { name: 'excited' }).click()
  await page.waitForTimeout(300)
  await page.screenshot({ path: OUT + '/gallery-excited.png' })
  console.log('gallery done')
}

if (all || shots.includes('path')) {
  await seedPlayer()
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  await page.screenshot({ path: OUT + '/path.png' })
  console.log('path done')
}

if (all || shots.includes('gate3')) {
  await page.evaluate(() => localStorage.removeItem('momomath-year2-player-v2'))
  await page.goto(BASE + '/?gate=3', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)
  await page.screenshot({ path: OUT + '/gate3.png' })
  console.log('gate3 done')
}

if (all || shots.includes('lesson')) {
  await seedPlayer()
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  const btn = page.locator('button[title]:not([disabled])').filter({ hasText: '⭐' }).first()
  try {
    await btn.click({ timeout: 5000 })
  } catch {}
  await page.waitForTimeout(800)
  await page.screenshot({ path: OUT + '/lesson-intro.png' })
  console.log('lesson done')
}

console.log('ERRORS:', errors.length ? errors.join(' | ') : 'none')
await browser.close()
