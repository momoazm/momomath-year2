import { createRequire } from 'module'
import { mkdirSync } from 'fs'
import { spawn } from 'child_process'
import http from 'http'

const require = createRequire('C:/Users/momo/.config/opencode/skills/website-clips/scripts/node_modules/_.js')
const { chromium } = require('playwright-core')

const BASE = 'http://localhost:3200'
mkdirSync('shots', { recursive: true })

const log = (...a) => console.log('[shots]', ...a)

function ping(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (r) => resolve(r.statusCode < 500))
    req.on('error', () => resolve(false))
    req.setTimeout(2500, () => { req.destroy(); resolve(false) })
  })
}

async function ensureServer() {
  for (let i = 0; i < 30; i++) {
    if (await ping(BASE)) return
    if (i === 0) {
      log('booting vite dev server...')
      const child = spawn('node', ['node_modules/vite/bin/vite.js', '--port', '3200'], {
        cwd: process.cwd(),
        detached: true,
        stdio: 'ignore',
      })
      child.unref()
    }
    await new Promise((r) => setTimeout(r, 1000))
  }
  throw new Error('dev server never came up')
}

async function resilientShot(page, path, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      await page.screenshot({ path, timeout: 8000 })
      return true
    } catch (e) {
      log(`shot ${path} attempt ${i + 1} failed: ${String(e).split('\n')[0]}`)
      await page.waitForTimeout(1500)
    }
  }
  return false
}

async function main() {
  await ensureServer()
  const browser = await chromium.launch({ channel: 'msedge', headless: true })

  // ---------- 1. mascot gallery ----------
  {
    const ctx = await browser.newContext({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 2 })
    const page = await ctx.newPage()
    page.setDefaultTimeout(15000)
    await page.goto(`${BASE}/?gallery`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1200)
    await resilientShot(page, 'shots/r1-gallery-happy.png')
    const cards = page.locator('.card-white')
    const n = await cards.count()
    for (let i = 0; i < Math.min(n, 12); i++) {
      try {
        await cards.nth(i).screenshot({ path: `shots/r1-char-${i}.png`, timeout: 6000 })
      } catch { /* skip */ }
    }
    await ctx.close().catch(() => {})
    log('gallery done')
  }

  // ---------- 2. main app screens (onboarded) ----------
  {
    const ctx = await browser.newContext({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 2 })
    const page = await ctx.newPage()
    page.setDefaultTimeout(15000)
    await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
    await page.evaluate(() => {
      localStorage.setItem(
        'momomath-year2-player-v2',
        JSON.stringify({
          state: {
            onboarded: true, name: 'Momo', mascot: 'sonic', gems: 120, xpTotal: 340,
            streakCurrent: 4, dailyGoal: 30, todayXp: 10, soundOn: false,
          },
          version: 0,
        }),
      )
    })
    await page.goto(BASE + '/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)
    await resilientShot(page, 'shots/r1-path.png')

    try {
      const start = page.getByText('START', { exact: false }).first()
      if (await start.isVisible({ timeout: 4000 })) {
        await start.click()
        await page.waitForTimeout(1200)
        await resilientShot(page, 'shots/r1-lesson-intro.png')
        const go = page.getByRole('button', { name: /Let's go/i }).first()
        if (await go.isVisible().catch(() => false)) {
          await go.click()
          await page.waitForTimeout(1200)
          await resilientShot(page, 'shots/r1-lesson-q.png')
        }
      }
    } catch (e) {
      log('lesson part failed:', String(e).split('\n')[0])
    }

    try {
      await page.goto(BASE + '/', { waitUntil: 'networkidle' })
      await page.waitForTimeout(800)
      for (const [label, file] of [['Shop', 'r1-shop.png'], ['Leagues', 'r1-leagues.png'], ['Quests', 'r1-quests.png'], ['You', 'r1-profile.png']]) {
        await page.getByRole('button', { name: label, exact: false }).first().click()
        await page.waitForTimeout(900)
        await resilientShot(page, `shots/${file}`)
        log('tab', label)
      }
    } catch (e) {
      log('tabs part failed:', String(e).split('\n')[0])
    }

    // ---------- boss intro (Eggman) ----------
    try {
      await page.evaluate(() => {
        const raw = localStorage.getItem('momomath-year2-player-v2')
        const data = raw ? JSON.parse(raw) : { state: {}, version: 0 }
        const prog = {}
        for (const id of ['u1l1', 'u1l2', 'u1l3', 'u1l4', 'u1l5', 'u1l6']) prog[id] = { crown: 3, bestAccuracy: 100, completions: 2 }
        data.state = { ...data.state, onboarded: true, name: 'Momo', mascot: 'sonic', lessonProgress: prog, soundOn: false }
        localStorage.setItem('momomath-year2-player-v2', JSON.stringify(data))
      })
      await page.goto(BASE + '/', { waitUntil: 'networkidle' })
      await page.waitForTimeout(1200)
      const boss = page.getByRole('button', { name: /Counting Boss/i }).first()
      if (await boss.isVisible({ timeout: 4000 })) {
        await boss.click()
        await page.waitForTimeout(1300)
        await resilientShot(page, 'shots/r3-boss-intro.png')
        log('boss intro done')
      } else {
        log('boss node not visible')
      }
    } catch (e) {
      log('boss part failed:', String(e).split('\n')[0])
    }
    await ctx.close().catch(() => {})
  }

  // ---------- 3. welcome gate character picker ----------
  {
    const ctx2 = await browser.newContext({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 2 })
    const p2 = await ctx2.newPage()
    p2.setDefaultTimeout(15000)
    await p2.goto(BASE + '/?gate=3', { waitUntil: 'networkidle' })
    await p2.waitForTimeout(1500)
    await resilientShot(p2, 'shots/r2-welcome-pick.png')
    log('welcome picker done')
    await ctx2.close().catch(() => {})
  }

  await browser.close()
  log('ALL DONE')
}

main().catch((e) => {
  console.error('[shots] FAILED', e)
  process.exit(1)
})
