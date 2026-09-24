// Custom smoke for Phase 10 — the 4 optional subject extras.
// Usage: node scripts/pw-extras-subjects.mjs [url]
//
// Locator notes (learned the hard way):
//  - TopBar pills expose their name via aria-label; textContent is emoji only
//    → always use getByRole('button', { name }). jsClick(textContent) MISSSES them.
//  - BottomNav profile tab label is "You" (icon 🦔), never "Profile".
//  - Profile renders one Remove per ENABLED extra card → scope by section text.
//  - Lesson nodes are <button title={lessonTitle}> outside header/nav.
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'

const require = createRequire('C:/Users/momo/AppData/Local/hermes/node/node_modules/@playwright/cli/node_modules/playwright-core/index.js')
const { chromium } = require('playwright-core')

const URL_BASE = process.argv[2] || 'http://localhost:3201/momomath-year2/'
const OUT = 'C:/Users/momo/screenshot_loop_output'
mkdirSync(OUT, { recursive: true })

const results = []
const ok = (name, pass, detail) => {
  results.push({ name, pass })
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name} - ${detail}`)
}

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
const AUTH = { state: { user: { sub: 'qa-seed', name: 'Momo', email: 'qa@example.com' }, credential: null, guestName: null }, version: 0 }
const PLAYER_KEY = 'momomath-year2-player-v2'

async function seedAndLoad(page, extraQuery = '') {
  await page.goto(`${URL_BASE}?cb=${Date.now()}${extraQuery}`, { waitUntil: 'domcontentloaded' })
  await page.evaluate(({ seed, auth, key }) => {
    localStorage.setItem(key, JSON.stringify(seed))
    localStorage.setItem('momomath-year2-auth', JSON.stringify(auth))
  }, { seed: SEED, auth: AUTH, key: PLAYER_KEY })
  await page.goto(`${URL_BASE}?cb=${Date.now()}${extraQuery}`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1100)
}

const body = (page) => page.evaluate(() => document.body.innerText)
const state = (page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k)).state, PLAYER_KEY)
const footer = async (page) => ((await body(page)).replace(/\s+/g, ' ').match(/Momo Year 2 Cambridge · [^·]+ · \d+ lessons/) || [''])[0]
const extraPills = (page) =>
  page.$$eval('header button[aria-label]', (bs) => bs.map((b) => b.getAttribute('aria-label')).filter((l) => /optional extra/.test(l || '')))
const openProfile = async (page) => {
  await page.getByRole('button', { name: /You/ }).first().click()
  // tab render is animated — wait for actual content, not a fixed sleep
  await page.getByText('Extra adventures').first().waitFor({ timeout: 8000 }).catch(() => {})
  await page.waitForTimeout(300)
}
const openPath = async (page) => {
  // accessible name is "🏁 PATH" (emoji first, CSS-uppercased) — never anchored
  await page.getByRole('button', { name: 'Path' }).first().click()
  await page.waitForTimeout(500)
}
const clickRole = async (page, name, opts = {}) => {
  try {
    await page.getByRole('button', { name, exact: opts.exact ?? false, ...opts }).first().click({ timeout: 4000 })
    return true
  } catch {
    return false
  }
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

  // --- A. fresh v7 seed: migrate v11, flags off, core roadmap
  await seedAndLoad(page)
  const persisted = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)), PLAYER_KEY)
  ok('A1 persist migrated v7 -> v11', persisted.version === 11, `version=${persisted.version}`)
  const st = persisted.state
  ok(
    'A2 all 4 extra flags backfilled off',
    st.germanEnabled === false && st.arabicEnabled === false && st.religionEnabled === false && st.socialEnabled === false,
    `g=${st.germanEnabled} a=${st.arabicEnabled} r=${st.religionEnabled} s=${st.socialEnabled}`,
  )
  let txt = await body(page)
  ok('A3 core roadmap renders (Maths footer)', /Momo Year 2 Cambridge · Maths · \d+ lessons/.test(txt.replace(/\s+/g, ' ')), await footer(page))
  ok('A4 NO "coming soon" anywhere', !/coming soon/i.test(txt), 'clean')
  ok('A5 zero extra pills before opt-in', (await extraPills(page)).length === 0, JSON.stringify(await extraPills(page)))
  await page.screenshot({ path: `${OUT}/x-01-core.png` }).catch(() => {})

  // --- B. Profile: 4 Add buttons; Add Deutsch → pill; Play Deutsch → german roadmap
  await openProfile(page)
  txt = await body(page)
  // NOTE: ProfileScreen uppercases via CSS (text-transform), and innerText reflects it.
  // Match role/text locators (case-insensitive) instead of raw innerText regexes.
  const addBtns = await page.getByRole('button', { name: /Add / }).count()
  ok('B1 Profile shows 4 "Add" buttons', addBtns === 4, `found ${addBtns}`)
  const headerCount = await page.getByText('Extra adventures').count()
  ok('B2 "Extra adventures · optional" header present', headerCount >= 4, `headers=${headerCount}`)
  await page.screenshot({ path: `${OUT}/x-02-profile.png` }).catch(() => {})

  const added = await clickRole(page, /Add Deutsch/)
  await page.waitForTimeout(400)
  const bPills = await extraPills(page)
  ok('B3 Add Deutsch → 🇩🇪 pill appears', added && bPills.some((p) => p === 'Deutsch (optional extra)'), JSON.stringify(bPills))
  let s1 = await state(page)
  ok('B4 germanEnabled persisted true', s1.germanEnabled === true, `flag=${s1.germanEnabled}`)

  await clickRole(page, /▶ Play Deutsch/)
  await page.waitForTimeout(400)
  await openPath(page) // Play only switches subject — footer lives on Path
  ok('C1 footer shows "Deutsch (extra)"', /Deutsch \(extra\)/.test(await footer(page)), await footer(page))
  txt = await body(page)
  ok('C2 german unit titles render (Hallo!)', /Hallo!/.test(txt), 'Hallo! unit found')
  ok('C3 german unit headers ≥1', (txt.match(/Unit \d+ ·/g) || []).length >= 1, `units=${(txt.match(/Unit \d+ ·/g) || []).length}`)
  ok('C4 still no "coming soon"', !/coming soon/i.test(txt), 'clean')
  s1 = await state(page)
  ok('C5 subject=german persisted', s1.subject === 'german', `subject=${s1.subject}`)
  await page.screenshot({ path: `${OUT}/x-03-german.png` }).catch(() => {})

  // --- D. deep link ?subject=arabic: migrate must NOT clobber it (regression)
  await seedAndLoad(page, '&subject=arabic')
  const s2 = await state(page)
  const dPills = await extraPills(page)
  ok('D1 deep link: subject=arabic + flag on + pill', s2.subject === 'arabic' && s2.arabicEnabled === true && dPills.some((p) => p === 'العربية (optional extra)'), `subject=${s2.subject} arabicEnabled=${s2.arabicEnabled} pills=${JSON.stringify(dPills)}`)
  ok('D2 arabic roadmap footer', /العربية \(extra\)/.test(await footer(page)), await footer(page))
  txt = await body(page)
  ok('D3 arabic unit headers ≥1', (txt.match(/Unit \d+ ·/g) || []).length >= 1, `units=${(txt.match(/Unit \d+ ·/g) || []).length}`)
  await page.screenshot({ path: `${OUT}/x-04-arabic.png` }).catch(() => {})

  // --- E. enable all 4 → 4 extra pills; religion Remove (scoped) → Maths fallback
  await seedAndLoad(page)
  await openProfile(page)
  for (const name of [/Add Deutsch/, /Add العربية/, /Add الدين/, /Add دراسات/]) {
    await clickRole(page, name)
    await page.waitForTimeout(300)
  }
  let ePills = await extraPills(page)
  ok('E1 all 4 extras enabled → 4 extra pills (7 total incl. core)', ePills.length === 4, JSON.stringify(ePills))
  await page.screenshot({ path: `${OUT}/x-05-all4.png` }).catch(() => {})

  await clickRole(page, /▶ Play الدين/)
  await page.waitForTimeout(400)
  await openPath(page)
  ok('E2 religion roadmap renders', /الدين \(extra\)/.test(await footer(page)), await footer(page))

  await openProfile(page)
  // Scope Remove to the RELIGION card only (4 Remove buttons exist).
  let removed = false
  try {
    await page
      .locator('section')
      .filter({ hasText: 'التربية الدينية' })
      .getByRole('button', { name: 'Remove' })
      .first()
      .click({ timeout: 4000 })
    removed = true
  } catch { /* fallthrough */ }
  await page.waitForTimeout(600)
  const s3 = await state(page)
  ePills = await extraPills(page)
  ok('E3 religion Remove (scoped) while viewing → falls back to Maths', removed && s3.subject === 'math' && s3.religionEnabled === false, `subject=${s3.subject} religion=${s3.religionEnabled}`)
  ok(
    'E4 religion pill gone, other 3 extras stay',
    !ePills.some((p) => p === 'الدين (optional extra)') && ePills.length === 3,
    JSON.stringify(ePills),
  )

  // --- F. core switching untouched (aria-label pills, exact names)
  await openPath(page) // pills live in TopBar, but footer assert needs Path
  await clickRole(page, 'English', { exact: true })
  await page.waitForTimeout(600)
  ok('F1 English core switch works', /· English ·/.test(await footer(page)), await footer(page))
  await clickRole(page, 'Science', { exact: true })
  await page.waitForTimeout(600)
  ok('F2 Science core switch works', /· Science ·/.test(await footer(page)), await footer(page))
  await clickRole(page, 'Maths', { exact: true })
  await page.waitForTimeout(600)
  ok('F3 back to Maths', /· Maths ·/.test(await footer(page)), await footer(page))
  await page.screenshot({ path: `${OUT}/x-06-finish.png` }).catch(() => {})

  // --- G. german lesson node → BattleScreen (title-scoped, skips header/nav)
  await seedAndLoad(page, '&subject=german')
  const node = await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('button[title]')).filter(
      (b) =>
        !b.closest('header') &&
        !b.closest('nav') &&
        !b.disabled &&
        b.title &&
        !/Switch subject|Finish the previous/.test(b.title),
    )
    const target = nodes[0]
    if (!target) return null
    const t = target.title
    target.click()
    return t
  })
  await page.waitForTimeout(1000)
  txt = await body(page)
  const battleChrome = /Flee/i.test(txt) && !/Momo Year 2 Cambridge ·/.test(txt.replace(/\s+/g, ' '))
  ok('G1 german lesson node opens BattleScreen', node !== null && battleChrome, `node="${node}" fled-chrome=${/Flee/i.test(txt)}`)
  await page.screenshot({ path: `${OUT}/x-07-battle.png` }).catch(() => {})

  ok('G2 zero page errors', errors.length === 0, errors.length ? errors.slice(0, 3).join(' | ') : 'zero')

  await browser.close()
  const failed = results.filter((r) => !r.pass)
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
  process.exit(failed.length ? 1 : 0)
}

main().catch((e) => {
  console.error('FATAL', e)
  process.exit(1)
})
