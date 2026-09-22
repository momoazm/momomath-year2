// Live smoke test for the subject-roadmap + arcade-exclusives release.
// Usage: node scripts/verify-gamification.mjs [url]
// Exit 0 only when every check passes.
//
// Covers (PLAN.md step 15):
//   1. v7 seed -> v10 persist migration (arcadeRounds/arcadeBossesDown backfill)
//   2. subject switching renders unit roadmaps for english/science (no "coming soon")
//   3. arcade lists all 4 games + badges + subtitle (Boss Rush/Word Rescue/Lab Blitz/Pixel Run)
//   4. Boss Rush play-through: 1 boss killed, round ends, score/XP persisted
//   5. exclusive-card grant: seeded 9 rounds -> 10th round unlocks Fang (celebration overlay)
//   6. Library "🕹️ Arcade Exclusives" panel: 1/3 collected, live progress, locked-card toast
//   7. quests / shop / dust / login calendar (kept from the previous release)
//   8. mobile 360px viewport checks
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'

const require = createRequire('C:/Users/momo/AppData/Local/hermes/node/node_modules/@playwright/cli/playwright-core/index.js')
const { chromium } = require('playwright-core')

const URL_BASE = process.argv[2] || 'https://momoazm.github.io/momomath-year2/'
const OUT = 'C:/Users/momo/screenshot_loop_output'
mkdirSync(OUT, { recursive: true })

const results = []
const shot = async (page, name) => page.screenshot({ path: `${OUT}/gam-${name}.png` }).catch(() => {})
const ok = (name, pass, detail) => {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name} - ${detail}`)
}
// JS-level click: immune to framer-motion animations that make Playwright's
// actionability checks time out. Matches button/span text against a regex SOURCE.
const jsClick = async (page, src) =>
  page.evaluate((s) => {
    const re = new RegExp(s)
    const t = (e) => (e.textContent || '').trim()
    const el = Array.from(document.querySelectorAll('button, span')).find((e) => re.test(t(e)))
    if (!el) return false
    el.click()
    return true
  }, src)

// v7 seed (pre-dust) so the full v7->v10 persist migration runs on the live bundle.
// dust/arcadeScores are provided so the dust-shop + XP checks have a balance to spend.
// cardStars deliberately EXCLUDES fang/bean/bark so the exclusive grant is observable.
const SEED = {
  state: {
    name: 'Momo', mascot: 'sonic', onboarded: true, gems: 120, xpTotal: 340,
    streakCurrent: 4, streakLongest: 5, dailyGoal: 30, todayXp: 10, soundOn: false,
    lessonProgress: {}, currentLeague: 'Bronze', shopInventory: {}, achievements: [],
    leagueHistory: [], cardStars: { tails: 17, amy: 4, knuckles: 6 }, cardPity: 0,
    claimedQuests: { day: '1970-01-01', questIds: [] },
    dust: 120, arcadeScores: {},
  },
  version: 7,
}

const PLAYER_KEY = 'momomath-year2-player-v2'
const readState = (page) =>
  page.evaluate((k) => JSON.parse(localStorage.getItem(k)).state, PLAYER_KEY)

async function main() {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.setDefaultTimeout(20000)

  const url = `${URL_BASE}?cb=${Date.now()}`
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.evaluate((seed) => {
    localStorage.setItem('momomath-year2-player-v2', JSON.stringify(seed))
    localStorage.setItem('momomath-year2-auth', JSON.stringify({ state: { user: null, guestName: 'Momo' }, version: 0 }))
  }, SEED)
  await page.goto(url, { waitUntil: 'networkidle' })

  // --- 1. migration ran: v7 -> v10, arcade counters backfilled ---
  const persisted = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)), PLAYER_KEY)
  ok('persist migrated to v10', persisted.version === 10, `version=${persisted.version}`)
  const st = persisted.state
  ok(
    'v10 arcade counters backfilled to 0',
    st.arcadeRounds === 0 && st.arcadeBossesDown === 0,
    `arcadeRounds=${st.arcadeRounds} arcadeBossesDown=${st.arcadeBossesDown}`,
  )
  ok(
    'earlier fields still backfilled (dust/login/arcadeScores)',
    typeof st.dust === 'number' && typeof st.dailyLoginStreak === 'number' && !!st.arcadeScores && st.arcadeScores.constructor === Object,
    `dust=${st.dust} loginStreak=${st.dailyLoginStreak} arcadeScores=${JSON.stringify(st.arcadeScores)}`,
  )

  // --- seed 9 lifetime rounds so the NEXT finished round grants Fang (goal 10) ---
  await page.evaluate((k) => {
    const raw = JSON.parse(localStorage.getItem(k))
    raw.state.arcadeRounds = 9
    localStorage.setItem(k, JSON.stringify(raw))
  }, PLAYER_KEY)
  await page.goto(url, { waitUntil: 'networkidle' })
  const seeded = await readState(page)
  ok('arcadeRounds seed survives reload', seeded.arcadeRounds === 9, `arcadeRounds=${seeded.arcadeRounds}`)

  // --- 2. maths roadmap renders, no stale "coming soon" ---
  await shot(page, '01-path')
  const mathUnits = await page.evaluate(() => (document.body.innerText.match(/Unit \d+ ·/g) || []).length)
  ok('maths roadmap shows unit headers', mathUnits >= 1, `unit headers=${mathUnits}`)
  const comingSoon = await page.getByText(/coming soon/i).first().isVisible().catch(() => false)
  ok('no "coming soon" empty state', !comingSoon, `comingSoon=${comingSoon}`)

  // --- subject switching: english + science roadmaps render unit headers ---
  for (const subj of ['English', 'Science']) {
    const pill = page.getByRole('button', { name: subj, exact: true }).first()
    const pillOk = await pill.isVisible().catch(() => false)
    if (pillOk) await pill.click().catch(() => {})
    await page.waitForTimeout(500)
    const info = await page.evaluate((label) => {
      const body = document.body.innerText
      return {
        labelShown: body.includes(`· ${label} ·`),
        units: (body.match(/Unit \d+ ·/g) || []).length,
        comingSoon: /coming soon/i.test(body),
      }
    }, subj)
    ok(
      `${subj} roadmap renders units`,
      pillOk && info.labelShown && info.units >= 1 && !info.comingSoon,
      `pill=${pillOk} label=${info.labelShown} units=${info.units} comingSoon=${info.comingSoon}`,
    )
    await shot(page, `02-path-${subj.toLowerCase()}`)
  }
  // back to maths for the rest of the run
  const mathPill = page.getByRole('button', { name: 'Maths', exact: true }).first()
  if (await mathPill.isVisible().catch(() => false)) await mathPill.click().catch(() => {})
  await page.waitForTimeout(400)

  // --- 3. Arcade tab: 4 games + badges + subtitle ---
  const arcadeTab = page.getByRole('button', { name: /Arcade/i }).first()
  ok('Arcade tab in bottom nav', await arcadeTab.isVisible().catch(() => false), 'nav button found')
  await arcadeTab.click()
  await page.waitForTimeout(500)
  const listInfo = await page.evaluate(() => {
    const body = document.body.innerText
    const games = ['Boss Rush', 'Word Rescue', 'Lab Blitz', 'Pixel Run']
    const badges = { 'Boss Rush': 'Maths', 'Word Rescue': 'English', 'Lab Blitz': 'Science', 'Pixel Run': 'Maths' }
    const perGame = {}
    for (const g of games) {
      const btn = Array.from(document.querySelectorAll('button')).find((b) => (b.textContent || '').includes(g))
      perGame[g] = btn ? { present: true, badge: (btn.textContent || '').includes(badges[g]) } : { present: false, badge: false }
    }
    return {
      title: body.includes('Retro Arcade'),
      subtitle: body.includes('Retro games'),
      perGame,
    }
  })
  ok('arcade title + subtitle', listInfo.title && listInfo.subtitle, `title=${listInfo.title} subtitle=${listInfo.subtitle}`)
  const gamesOk = Object.entries(listInfo.perGame).every(([, v]) => v.present && v.badge)
  ok(
    'all 4 arcade games listed with subject badges',
    gamesOk,
    JSON.stringify(listInfo.perGame),
  )
  await shot(page, '03-arcade-list')

  // --- 4. Boss Rush play-through ---
  await page.locator('button').filter({ hasText: 'Boss Rush' }).first().click()
  await page.waitForTimeout(400)
  const ready = await page.evaluate(() => ({
    play: !!Array.from(document.querySelectorAll('button')).find((b) => /▶ Play/.test(b.textContent || '')),
    exclusiveHint: document.body.innerText.includes('Rounds feed exclusive card unlocks'),
  }))
  ok('Boss Rush ready screen + exclusive hint', ready.play && ready.exclusiveHint, `play=${ready.play} hint=${ready.exclusiveHint}`)
  await shot(page, '04-boss-ready')
  await page.getByRole('button', { name: /▶ Play/i }).click()
  await page.waitForTimeout(400)

  const readBossQ = () =>
    page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('p')).find((p) =>
        /^\d+\s*[+\-×]\s*\d+\s*=\s*\?$/.test((p.textContent || '').trim()),
      )
      return el ? el.textContent.trim() : null
    })
  const solve = (q) => {
    const m = q.match(/(\d+)\s*([+\-×])\s*(\d+)/)
    if (!m) return null
    const [, a, op, b] = m
    return op === '+' ? String(+a + +b) : op === '-' ? String(+a - +b) : String(+a * +b)
  }
  const options = () =>
    page.evaluate(() =>
      Array.from(document.querySelectorAll('button'))
        .map((b) => (b.textContent || '').trim())
        .filter((t) => /^\d+$/.test(t)),
    )
  const clickOpt = (n) =>
    page.getByRole('button', { name: new RegExp(`^\\s*${n}\\s*$`) }).first().click()

  // 3 correct answers defeat the first boss (3 HP).
  let correct = 0
  for (let i = 0; i < 3; i++) {
    const q = await readBossQ()
    const ans = q ? solve(q) : null
    if (!ans) break
    await clickOpt(ans).catch(() => {})
    await page.waitForTimeout(300)
    correct++
  }
  const midInfo = await page.evaluate(() => ({
    defeated: (document.body.innerText.match(/Bosses defeated: (\d+)/) || [null, '0'])[1],
    boss: !!document.querySelector('[aria-label^="Boss"]'),
  }))
  ok(
    '3 correct answers defeat a pixel boss',
    correct === 3 && midInfo.defeated === '1' && midInfo.boss,
    `answered=${correct} bossesDown=${midInfo.defeated} pixelBoss=${midInfo.boss}`,
  )
  await shot(page, '05-boss-playing')

  // 3 wrong answers empty the lives bar -> round finishes (no 60s wait).
  for (let i = 0; i < 3; i++) {
    const q = await readBossQ()
    const ans = q ? solve(q) : null
    const opts = await options()
    const wrong = opts.find((t) => t !== ans)
    if (!wrong) break
    await clickOpt(wrong).catch(() => {})
    await page.waitForTimeout(350)
  }
  await page.waitForTimeout(900)
  const over = await page.evaluate(() => ({
    overShown: document.body.innerText.includes("Time's up!"),
    score: (Array.from(document.querySelectorAll('p')).map((p) => (p.textContent || '').trim()).find((t) => /^\d+$/.test(t))) || '',
    celebration: /exclusive card unlocked/i.test(document.body.innerText),
    fang: document.body.innerText.includes('Fang the Fox'),
  }))
  ok('round ends and shows result', over.overShown, `overShown=${over.overShown}`)
  ok('final score = 100 (1 boss)', Number(over.score) === 100, `finalScore=${over.score}`)
  ok('exclusive-card celebration overlay (Fang)', over.celebration && over.fang, `celebration=${over.celebration} fang=${over.fang}`)
  await shot(page, '06-boss-over-fang')

  // --- persisted effects of the round ---
  const after = await readState(page)
  ok('arcadeScores persisted for boss-rush', after.arcadeScores['boss-rush'] === 100, JSON.stringify(after.arcadeScores))
  ok('arcadeRounds 9 -> 10', after.arcadeRounds === 10, `arcadeRounds=${after.arcadeRounds}`)
  ok('Fang granted exactly 3 copies (1 star)', after.cardStars.fang === 3, `cardStars.fang=${after.cardStars.fang}`)
  ok('arcade round awarded XP', after.xpTotal > 340, `xpTotal 340 -> ${after.xpTotal}`)

  // back to the list: personal best shows
  await page.getByRole('button', { name: /← Back/i }).click()
  await page.waitForTimeout(500)
  const bestText = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) => /Boss Rush/.test(b.textContent || ''))
    return btn ? btn.textContent : ''
  })
  ok('arcade list shows personal best 100', /100/.test(bestText || ''), `card="${(bestText || '').slice(0, 90)}"`)
  await shot(page, '07-arcade-pb')

  // --- 5. Library arcade section ---
  await page.evaluate(() => { location.href = location.pathname + '?library&cb=' + Date.now() })
  await page.waitForTimeout(2000)
  await shot(page, '08-library')
  const lib = await page.evaluate(() => {
    const body = document.body.innerText
    const section = document.querySelector('section[aria-label="Arcade Exclusives"]')
    const secText = section ? section.innerText : ''
    const fangImg = !!Array.from(document.querySelectorAll('img')).find((i) => i.alt === 'Fang the Fox')
    return {
      overall: (body.match(/\d+ \/ 22 collected/) || [null])[0],
      heading: body.includes('🕹️ Arcade Exclusives'),
      arcadeCollected: (secText.match(/\d+ \/ 3 collected/) || [null])[0],
      beanGoal: secText.includes('Score in all 3 subject games'),
      beanProgress: secText.includes('Games 1/3'),
      barkGoal: secText.includes('Defeat 5 bosses in Boss Rush'),
      barkProgress: secText.includes('Bosses 1/5'),
      fangImg,
      chestPhrase: /Win from a .*chest/.test(body),
    }
  })
  ok('library overall count /22', !!lib.overall, `overall=${lib.overall}`)
  ok('arcade exclusives heading', lib.heading, `heading=${lib.heading}`)
  ok(
    'arcade panel 1/3 collected with live progress',
    lib.arcadeCollected === '1 / 3 collected' && lib.beanGoal && lib.beanProgress && lib.barkGoal && lib.barkProgress,
    `collected=${lib.arcadeCollected} bean=${lib.beanGoal && lib.beanProgress} bark=${lib.barkGoal && lib.barkProgress}`,
  )
  ok('unlocked Fang renders its art', lib.fangImg, `fangImg=${lib.fangImg}`)
  ok('no chest-phrase for arcade cards', !lib.chestPhrase, `chestPhrase=${lib.chestPhrase}`)

  // locked-card click -> toast shows the unlock CONDITION (not a chest phrase)
  const clicked = await jsClick(page, 'Score in all 3 subject games')
  await page.waitForTimeout(400)
  const toast = await page.evaluate(() => {
    const body = document.body.innerText
    return {
      name: body.includes('Bean the Dynamite'),
      condition: body.includes('Score in all 3 subject games'),
      chest: /Win from a .*chest/.test(body),
    }
  })
  ok(
    'locked arcade card toast shows condition',
    clicked && toast.name && toast.condition && !toast.chest,
    `clicked=${clicked} name=${toast.name} condition=${toast.condition} chest=${toast.chest}`,
  )
  await shot(page, '09-library-locked-toast')

  // --- 6. Quests: exactly 3 rotating quests ---
  await page.evaluate(() => { location.href = location.pathname + '?cb=' + Date.now() })
  await page.waitForTimeout(1500)
  await page.getByRole('button', { name: /Quests/i }).first().click()
  await page.waitForTimeout(500)
  const questCount = await page.evaluate(() => document.querySelectorAll('ul.space-y-3 > li').length)
  ok('3 rotating daily quests', questCount === 3, `quest items=${questCount}`)
  const questLabels = await page.evaluate(() =>
    Array.from(document.querySelectorAll('ul.space-y-3 > li p')).map((p) => (p.textContent || '').trim()).slice(0, 3),
  )
  ok('quest labels rendered', questLabels.every((t) => t.length > 0), JSON.stringify(questLabels))
  await shot(page, '10-quests')

  // --- 7. Shop: dust chip + daily login calendar + claim ---
  await page.getByRole('button', { name: /Shop/i }).first().click()
  await page.waitForTimeout(500)
  const dustVisible = await page.getByText('🌪️').first().isVisible().catch(() => false)
  const calVisible = await page.getByText('Daily Login Rewards').first().isVisible().catch(() => false)
  ok('shop shows dust + login calendar', dustVisible && calVisible, `dust=${dustVisible} calendar=${calVisible}`)
  await shot(page, '11-shop')

  const gemsBefore = (await readState(page)).gems
  const claimBtn = page.getByRole('button', { name: /Claim Day \d+ reward/i }).first()
  const canClaim = await claimBtn.isVisible().catch(() => false)
  ok('claim button available', canClaim, `canClaim=${canClaim}`)
  if (canClaim) {
    await claimBtn.click()
    await page.waitForTimeout(600)
  }
  const claimed = await readState(page)
  ok(
    'claim grants gems + marks day',
    claimed.gems > gemsBefore && claimed.loginRewardClaimedDay !== null && claimed.dailyLoginStreak >= 1,
    `gems ${gemsBefore} -> ${claimed.gems}, streak=${claimed.dailyLoginStreak}, claimedDay=${claimed.loginRewardClaimedDay}`,
  )
  const claimedUi = await page.getByText(/Claimed — come back tomorrow/i).first().isVisible().catch(() => false)
  ok('claim button flips to claimed', claimedUi, `claimedUi=${claimedUi}`)
  await shot(page, '12-shop-claimed')

  // dust shop: buy a dust item (spends dust, not gems)
  const beforeDust = await page.evaluate((k) => {
    const s = JSON.parse(localStorage.getItem(k)).state
    return { dust: s.dust, gems: s.gems, owned: s.shopInventory['dust-chest-boost'] || 0 }
  }, PLAYER_KEY)
  const dustSectionOk = await page.locator('h2', { hasText: 'Spend 🌪️ Dust' }).isVisible().catch(() => false)
  ok('dust section rendered', dustSectionOk, `visible=${dustSectionOk}`)
  const dustBuyBtn = page
    .locator('div')
    .filter({ has: page.locator('h3', { hasText: 'Chest Boost' }) })
    .filter({ hasText: '30 🌪️' })
    .locator('button', { hasText: 'Buy' })
    .first()
  const dustBuyVisible = await dustBuyBtn.isVisible().catch(() => false)
  if (dustBuyVisible) {
    await dustBuyBtn.click()
    await page.waitForTimeout(600)
  }
  const afterDust = await page.evaluate((k) => {
    const s = JSON.parse(localStorage.getItem(k)).state
    return { dust: s.dust, gems: s.gems, owned: s.shopInventory['dust-chest-boost'] || 0 }
  }, PLAYER_KEY)
  ok(
    'dust purchase spends dust (not gems)',
    dustBuyVisible &&
      afterDust.dust === beforeDust.dust - 30 &&
      afterDust.gems === beforeDust.gems &&
      afterDust.owned === beforeDust.owned + 1,
    `btn=${dustBuyVisible} dust ${beforeDust.dust}->${afterDust.dust} gems ${beforeDust.gems}->${afterDust.gems} owned ${beforeDust.owned}->${afterDust.owned}`,
  )
  await shot(page, '13-dust-purchase')

  // arcade play fed the daily quest counter
  const finalState = await readState(page)
  ok('arcade play fed the daily quest counter', finalState.arcadeCorrectToday > 0, `arcadeCorrectToday=${finalState.arcadeCorrectToday}`)

  ok('no page errors', errors.length === 0, errors.length ? errors.slice(0, 3).join(' | ') : 'zero pageerror/console errors')

  // --- mobile viewport (360x740): header + bottom nav fully visible, no h-scroll ---
  const errCountBeforeMobile = errors.length
  const mctx = await browser.newContext({ viewport: { width: 360, height: 740 } })
  const mp = await mctx.newPage()
  mp.on('pageerror', (e) => errors.push(String(e)))
  mp.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  mp.setDefaultTimeout(20000)
  await mp.goto(`${URL_BASE}?cb=${Date.now()}`, { waitUntil: 'domcontentloaded' })
  await mp.evaluate((seed) => {
    localStorage.setItem('momomath-year2-player-v2', JSON.stringify(seed))
    localStorage.setItem('momomath-year2-auth', JSON.stringify({ state: { user: null, guestName: 'Momo' }, version: 0 }))
  }, SEED)
  await mp.goto(`${URL_BASE}?cb=${Date.now()}`, { waitUntil: 'networkidle' })
  await mp.waitForTimeout(600)
  const mob = await mp.evaluate(() => {
    const header = document.querySelector('header')
    const nav = document.querySelector('nav')
    const hr = header ? header.getBoundingClientRect() : null
    const nr = nav ? nav.getBoundingClientRect() : null
    const buttons = nav ? Array.from(nav.querySelectorAll('button')) : []
    const vw = window.innerWidth
    return {
      scrollW: document.documentElement.scrollWidth,
      vw,
      headerOk: !!hr && hr.left >= -1 && hr.right <= vw + 1 && hr.top >= -1,
      navOk: !!nr && nr.left >= -1 && nr.right <= vw + 1 && nr.bottom <= window.innerHeight + 1,
      navButtons: buttons.length,
      navLabelsVisible: buttons.every((b) => {
        const r = b.getBoundingClientRect()
        return r.width > 0 && r.height > 0 && r.left >= -1 && r.right <= vw + 1
      }),
      headerText: (header?.innerText || '').slice(0, 60),
    }
  })
  await mp.screenshot({ path: `${OUT}/gam-14-mobile.png` }).catch(() => {})
  ok('mobile: no horizontal scroll', mob.scrollW <= mob.vw + 1, `scrollWidth=${mob.scrollW} vw=${mob.vw}`)
  ok('mobile: header fully within viewport', mob.headerOk, `header="${mob.headerText}"`)
  ok('mobile: bottom nav fully within viewport', mob.navOk, `navOk=${mob.navOk}`)
  ok('mobile: all 6 nav buttons visible', mob.navButtons === 6 && mob.navLabelsVisible, `buttons=${mob.navButtons} labelsVisible=${mob.navLabelsVisible}`)
  ok(
    'mobile: no page errors',
    errors.length === errCountBeforeMobile,
    errors.length > errCountBeforeMobile ? errors.slice(errCountBeforeMobile, errCountBeforeMobile + 3).join(' | ') : 'zero errors',
  )
  await mctx.close()

  await browser.close()
  const failed = results.filter((r) => !r.pass)
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
  process.exit(failed.length ? 1 : 0)
}

main().catch((e) => {
  console.error('FATAL', e)
  process.exit(1)
})
