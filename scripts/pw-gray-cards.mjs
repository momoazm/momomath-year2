// Phase 11 smoke — locked-card gray art preview (temp; not committed).
// Usage: node scripts/pw-gray-cards.mjs [url]
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'

const require = createRequire('C:/Users/momo/AppData/Local/hermes/node/node_modules/@playwright/cli/node_modules/playwright-core/index.js')
const { chromium } = require('playwright-core')

const URL_BASE = process.argv[2] || 'http://localhost:3200/'
const OUT = 'C:/Users/momo/screenshot_loop_output'
mkdirSync(OUT, { recursive: true })

const results = []
const ok = (name, pass, detail) => {
  results.push({ name, pass })
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name} - ${detail}`)
}

// Mostly-locked: only tails owned; no fang/bean/bark so exclusives stay locked.
const SEED = {
  state: {
    name: 'Momo', mascot: 'sonic', onboarded: true, gems: 120, xpTotal: 340,
    streakCurrent: 4, streakLongest: 5, dailyGoal: 30, todayXp: 10, soundOn: false,
    lessonProgress: {}, currentLeague: 'Bronze', shopInventory: {}, achievements: [],
    leagueHistory: [], cardStars: { tails: 3 }, cardPity: 0,
    claimedQuests: { day: '1970-01-01', questIds: [] },
    dust: 120, arcadeScores: {}, arcadeRounds: 0, arcadeBossesDown: 0,
  },
  version: 11,
}
const AUTH = { state: { user: { sub: 'qa-seed', name: 'Momo', email: 'qa@example.com' }, credential: null, guestName: null }, version: 0 }
const PLAYER_KEY = 'momomath-year2-player-v2'

async function seedAndLoad(page) {
  await page.goto(`${URL_BASE}?cb=${Date.now()}`, { waitUntil: 'domcontentloaded' })
  await page.evaluate(({ seed, auth, key }) => {
    localStorage.setItem(key, JSON.stringify(seed))
    localStorage.setItem('momomath-year2-auth', JSON.stringify(auth))
  }, { seed: SEED, auth: AUTH, key: PLAYER_KEY })
  await page.evaluate(() => { location.href = location.pathname + '?library&cb=' + Date.now() })
  await page.waitForLoadState('domcontentloaded').catch(() => {})
  let ready = false
  for (let i = 0; i < 40 && !ready; i++) {
    await page.waitForTimeout(250)
    try {
      ready = await page.evaluate(() => document.body.innerText.includes('Card Library'))
    } catch {
      ready = false
    }
  }
  await page.waitForTimeout(600)
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => {
    if (m.type() !== 'error') return
    const t = m.text()
    if (/GSI_LOGGER|accounts\.google\.com|Failed to load resource.*403/i.test(t)) return
    errors.push(t)
  })
  page.setDefaultTimeout(20000)

  await seedAndLoad(page)
  await page.screenshot({ path: `${OUT}/p11-library.png` }).catch(() => {})

  const lib = await page.evaluate(() => {
    const body = document.body.innerText
    const section = document.querySelector('section[aria-label="Arcade Exclusives"]')
    const secText = section ? section.innerText : ''
    const imgs = Array.from(document.querySelectorAll('img.grayscale'))
    const visible = imgs.filter((i) => {
      const s = getComputedStyle(i)
      const r = i.getBoundingClientRect()
      return s.display !== 'none' && s.visibility !== 'hidden' && parseFloat(s.opacity) > 0 && r.width > 10 && r.height > 10
    })
    const sample = visible[0]
    return {
      heading: body.includes('Card Library'),
      overall: (body.match(/\d+ \/ 100 collected/) || [null])[0],
      arcadeHeading: body.includes('🕹️ Arcade Exclusives'),
      arcadeCollected: (secText.match(/\d+ \/ 3 collected/) || [null])[0],
      winToUnlock: body.includes('Win to unlock'),
      exclusive: secText.includes('Exclusive'),
      beanGoal: secText.includes('Score in all 3 subject games'),
      barkGoal: secText.includes('Defeat 5 bosses in Boss Rush'),
      hasQmark: body.includes('❓'),
      hasLock: secText.includes('🔒'),
      grayCount: visible.length,
      sampleFilter: sample ? getComputedStyle(sample).filter : null,
      sampleOpacity: sample ? getComputedStyle(sample).opacity : null,
      sampleSrc: sample ? (sample.getAttribute('src') || '') : null,
      // badge wrapper is a SIBLING of the img, not its parent
      sampleZ: sample && sample.nextElementSibling ? getComputedStyle(sample.nextElementSibling).zIndex : null,
      badgeText: sample && sample.nextElementSibling ? (sample.nextElementSibling.innerText || '').slice(0, 80) : null,
    }
  })

  ok('library heading', lib.heading, `heading=${lib.heading}`)
  ok('library overall /100', !!lib.overall, `overall=${lib.overall}`)
  ok('arcade exclusives section + count', lib.arcadeHeading && !!lib.arcadeCollected, `heading=${lib.arcadeHeading} collected=${lib.arcadeCollected}`)
  ok('chest locked keeps ❓ + Win to unlock', lib.hasQmark && lib.winToUnlock, `q=${lib.hasQmark} win=${lib.winToUnlock}`)
  ok('arcade locked keeps 🔒 + Exclusive + goal', lib.hasLock && lib.exclusive && lib.beanGoal, `lock=${lib.hasLock} excl=${lib.exclusive} bean=${lib.beanGoal}`)
  ok('bark goal intact', lib.barkGoal, `bark=${lib.barkGoal}`)
  ok('gray locked art visible (>=3)', lib.grayCount >= 3, `gray=${lib.grayCount}`)
  ok('gray art is grayscale + opacity-40',
    !!lib.sampleFilter && /grayscale/.test(lib.sampleFilter) && String(lib.sampleOpacity) === '0.4',
    `filter=${lib.sampleFilter} opacity=${lib.sampleOpacity}`)
  ok('gray art has real card src', !!lib.sampleSrc && /cards\//.test(lib.sampleSrc), `src=${lib.sampleSrc}`)
  ok('badge content above art (z-10)', lib.sampleZ === '10', `z=${lib.sampleZ}`)

  // locked toast still works
  const clicked = await page.evaluate(() => {
    const re = /Score in all 3 subject games/
    const el = Array.from(document.querySelectorAll('button, span')).find((e) => re.test((e.textContent || '').trim()))
    if (!el) return false
    el.click()
    return true
  })
  await page.waitForTimeout(500)
  const toast = await page.evaluate(() => {
    const body = document.body.innerText
    return body.includes('Bean the Dynamite') && body.includes('Score in all 3 subject games')
  })
  ok('locked arcade toast still works', clicked && toast, `clicked=${clicked} toast=${toast}`)
  await page.screenshot({ path: `${OUT}/p11-toast.png` }).catch(() => {})

  // arcade page intact (retry: bottom-nav mount + SPA anim can race)
  let arcadeNav = false
  let arcadeOk = false
  for (let attempt = 0; attempt < 3 && !arcadeOk; attempt++) {
    try {
      await page.evaluate(() => { location.href = location.pathname + '?cb=' + Date.now() })
      await page.waitForLoadState('domcontentloaded').catch(() => {})
    } catch { /* nav in flight */ }
    await page.waitForTimeout(1200)
    arcadeNav = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button, a')).find((e) => /Arcade/i.test(e.getAttribute('aria-label') || e.textContent || ''))
      if (!btn) return false
      btn.click()
      return true
    }).catch(() => false)
    await page.waitForTimeout(900)
    const arcadeBody = await page.evaluate(() => document.body.innerText).catch(() => '')
    arcadeOk = /Boss Rush|Word Rescue|Lab Blitz|Pixel Run/i.test(arcadeBody)
  }
  ok('arcade page intact', arcadeNav && arcadeOk, `nav=${arcadeNav} games=${arcadeOk}`)
  await page.screenshot({ path: `${OUT}/p11-arcade.png` }).catch(() => {})

  ok('zero page errors', errors.length === 0, errors.length ? JSON.stringify(errors.slice(0, 3)) : 'none')

  const pass = results.every((r) => r.pass)
  console.log(`\n${results.filter((r) => r.pass).length}/${results.length} passed`)
  await browser.close()
  process.exit(pass ? 0 : 1)
}

main().catch((e) => { console.error('SMOKE_ERR', e); process.exit(1) })
