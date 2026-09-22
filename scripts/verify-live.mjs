// Live end-to-end card/chest verification with the screenshot loop.
// Usage: node scripts/verify-live.mjs [url]
//
// Drives the REAL deployed site in a real browser (playwright):
//   1. seeds a collection with known copy counts (star levels)
//   2. plays a full u1l1 lesson
//   3. opens the chest and ASSERTS the reveal shows exactly ONE card with
//      1-3 copies + a visible star track
//   4. re-opens the Library and asserts the packed card's copies/stars grew
//   5. screenshots every step to screenshot_loop_output/
//
// Exit code 0 only when every assertion passes.
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'

const require = createRequire('C:/Users/momo/AppData/Local/hermes/node/node_modules/@playwright/cli/playwright-core/index.js')
const { chromium } = require('playwright-core')

const URL_BASE = process.argv[2] || 'https://momoazm.github.io/momomath-year2/'
const OUT = 'C:/Users/momo/screenshot_loop_output'
mkdirSync(OUT, { recursive: true })

const results = []
const shot = async (page, name) => page.screenshot({ path: `${OUT}/live-${name}.png` }).catch(() => {})
const ok = (name, pass, detail) => {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name} - ${detail}`)
}
// JS-level click: immune to framer-motion animations/overlays that make
// Playwright's actionability checks time out. Clicks bubble to the parent
// onClick (e.g. the chest card's kick handler). Pass a regex SOURCE string.
const jsClick = async (page, src) =>
  page.evaluate((s) => {
    const re = new RegExp(s)
    const t = (e) => (e.textContent || '').trim()
    const el = Array.from(document.querySelectorAll('button, span')).find((e) => re.test(t(e)))
    if (!el) return false
    el.click()
    return true
  }, src)

// Seed: collections at known copy counts so star-ups are observable.
// tails 17 (4 star, next at 21), amy 4 (1 star), knuckles 6 (2 star)
const SEED = {
  state: {
    name: 'Momo', mascot: 'sonic', onboarded: true, gems: 120, xpTotal: 340,
    streakCurrent: 4, streakLongest: 5, dailyGoal: 30, todayXp: 10, soundOn: false,
    lessonProgress: {}, currentLeague: 'Bronze', shopInventory: {}, achievements: [],
    leagueHistory: [], cardStars: { tails: 17, amy: 4, knuckles: 6 }, cardPity: 0,
    claimedQuests: { day: '1970-01-01', questIds: [] },
  },
  version: 7,
}

// One auto-play step, run inside the page. Returns what it did.
function autoPlayStep() {
  const w = window
  const btns = Array.from(document.querySelectorAll('button'))
  const txt = (b) => (b.textContent || '').trim()
  const enabled = (b) => !b.disabled
  if (btns.some((b) => /Kick!|Tap to open!|Open the chest/i.test(txt(b)))) return 'chest'
  // The chest CTA is a <span> inside the clickable chest card (NOT a <button>),
  // so the button scan above never fires — detect the chest stage by body text.
  if (/Tap to open!|Kick! \(\d left\)/.test(document.body.innerText)) return 'chest'
  if (btns.some((b) => /Back to path|Play again/i.test(txt(b)))) return 'finished'

  // The footer holds Check/Continue and turns GREEN when correct, ROSE when
  // wrong (both show a "Continue" button), so colour is what tells them apart.
  const footer = Array.from(document.querySelectorAll('div'))
    .find((d) => /border-emerald-200|border-rose-200/.test(d.className))
  const h2 = document.querySelector('h2')
  const head = h2 ? h2.textContent.trim() : ''

  if (footer) {
    const wrong = /border-rose-200/.test(footer.className)
    const cont = Array.from(footer.querySelectorAll('button')).find((b) => /^Continue$/i.test(txt(b)))
    if (wrong) {
      // The footer prints the right answer — remember it for this question.
      w.__hints = w.__hints || {}
      w.__hints[head] = footer.innerText
      if (cont) cont.click()
      return 'continue'
    }
    if (cont && enabled(cont)) { if (cont) cont.click(); return 'continue' }
  }

  // chrome to never treat as an answer
  const CHROME = /^(|×|✖|✗|Close|Quit|Exit|Hint|💡 Hint|∞|Check|Continue|Retry|Try again|Back to path|Play again)$/
  const isChrome = (b) => {
    const t = txt(b)
    if (!t || CHROME.test(t)) return true
    const al = (b.getAttribute('aria-label') || '').toLowerCase()
    if (/close|quit|exit|back|kick|hint/.test(al)) return true
    const r = b.getBoundingClientRect()
    return r.top < 70 || r.bottom > window.innerHeight - 55
  }

  // 1) "Tap ALL the X" -> tap every exact-X cell
  if (/^Tap ALL the/.test(head)) {
    const emoji = head.replace('Tap ALL the', '').trim()
    btns.filter((b) => txt(b) === emoji && !isChrome(b)).forEach((b) => {
      if (b.getAttribute('aria-pressed') !== 'true') b.click()
    })
    return 'tapall'
  }

  // 2) "About how many" -> the emoji objects are <span>s (NOT buttons) inside
  //    a flex-wrap row (LessonScreen Visual 'emoji-group'), so counting
  //    buttons always yielded 0 and the harness guessed "about 5" forever,
  //    looping on the adaptive engine's re-served questions. Count the row's
  //    spans and map through the generator's EXACT bucket table
  //    (gEstimateCount): 6-7 -> about 5, 8/9/11/12 -> about 10, 17/18 -> about 20.
  if (/About how many/i.test(head)) {
    const opts = btns.filter((b) => /^about \d+$/i.test(txt(b)))
    let n = 0
    for (const row of document.querySelectorAll('div.flex-wrap')) {
      const spans = Array.from(row.children).filter((c) => c.tagName === 'SPAN')
      if (spans.length > n) n = spans.length
    }
    const want =
      (n >= 6 && n <= 7) ? 'about 5' :
      (n === 8 || n === 9 || n === 11 || n === 12) ? 'about 10' :
      (n === 17 || n === 18) ? 'about 20' : null
    const pick = (want && opts.find((b) => txt(b).toLowerCase() === want)) || opts[0]
    if (pick) pick.click()
    return 'estimate'
  }

  // 3) Anything else: prefer the option named in the previous wrong-attempt
  //    hint ("Answer: X"), else step through the options.
  const opts = btns.filter((b) => enabled(b) && !isChrome(b))
  if (opts.length) {
    let pick = null
    const hint = (w.__hints || {})[head]
    if (hint) {
      // "Answer: about 10" / "There were 9" — match the option named in it.
      pick = opts.find((b) => hint.includes(txt(b))) || null
    }
    if (!pick) {
      const cellCount = opts.length
      w.__tries = w.__tries || {}
      const t = w.__tries[head] = (w.__tries[head] || 0)
      pick = opts[Math.min(t, cellCount - 1)]
      w.__tries[head] = t + 1
    }
    pick.click()
    return 'answer'
  }
  return 'idle'
}

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
  // Seed the player AND a guest session: the new sign-in gate requires a
  // session (Google user or named guest) before the roadmap opens.
  await page.evaluate((seed) => {
    localStorage.setItem('momomath-year2-player-v2', JSON.stringify(seed))
    localStorage.setItem('momomath-year2-auth', JSON.stringify({ state: { user: null, guestName: 'Momo' }, version: 0 }))
  }, SEED)
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  await shot(page, '01-home')

  const gateGone = !(await page.getByText('Welcome to Momo Year 2 Cambridge!').isVisible().catch(() => false))
  ok('home renders (no welcome gate with seeded session)', gateGone, 'seeded guest session + onboarded player load straight to the path')

  // --- sign-out returns the gate: clearing the guest session must block the
  // roadmap again until the visitor re-signs in ---
  await page.evaluate(() => {
    localStorage.setItem('momomath-year2-auth', JSON.stringify({ state: { user: null, guestName: null }, version: 0 }))
    location.reload()
  })
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  await shot(page, '01b-gate-after-signout')
  const gateBack = await page.getByText('Welcome to Momo Year 2 Cambridge!').isVisible().catch(() => false)
  ok('signing out returns the sign-in gate', gateBack, 'no session = welcome gate blocks the roadmap')
  // Restore the seeded session so the lesson/chest checks can proceed.
  await page.evaluate(() => {
    localStorage.setItem('momomath-year2-auth', JSON.stringify({ state: { user: null, guestName: 'Momo' }, version: 0 }))
  })
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  // TopBar + page share one width: check the bar actually paints and its
  // edges line up with the path content column (no drift/zoom trap).
  const widths = await page.evaluate(() => {
    const header = document.querySelector('header')
    const main = document.querySelector('main')
    const hr = header?.getBoundingClientRect()
    const mr = main?.firstElementChild?.getBoundingClientRect() ?? main?.getBoundingClientRect()
    return {
      headerRendered: !!header && !!hr && hr.width > 300,
      headerLeft: Math.round(hr?.left ?? -1),
      headerRight: Math.round(hr?.right ?? -1),
      mainLeft: Math.round(mr?.left ?? -2),
      mainRight: Math.round(mr?.right ?? -2),
    }
  })
  ok('top bar aligned with page width', widths.headerRendered &&
    Math.abs(widths.headerLeft - widths.mainLeft) <= 32 && Math.abs(widths.headerRight - widths.mainRight) <= 32,
    `header=[${widths.headerLeft},${widths.headerRight}] main=[${widths.mainLeft},${widths.mainRight}]`)

  // --- open the lesson ---
  await page.locator('button[title]').filter({ hasText: /Count Everything/ }).first().click()
  await page.waitForTimeout(1200)
  await shot(page, '02-lesson-intro')
  await page.getByRole('button', { name: /Let's go/i }).first().click()
  await page.waitForTimeout(1000)

  // --- auto-play questions until the chest appears ---
  let chestFound = false
  const trace = []
  for (let i = 0; i < 260; i++) {
    const state = await page.evaluate(autoPlayStep)
    const head = await page.evaluate(() => {
      const h = document.querySelector('h2')
      return h ? h.textContent.trim().slice(0, 60) : '(no h2)'
    })
    trace.push(`${i}:${state} [${head}]`)
    if (i < 6) {
      const dbg = await page.evaluate(() => {
        const panel = Array.from(document.querySelectorAll('div')).find((d) => /bg-emerald-50|bg-rose-50/.test(d.className))
        const url = location.href
        return { url, panel: panel ? panel.innerText.replace(/\s+/g, ' ').slice(0, 80) : null }
      })
      trace.push(`   dbg${i}: ${JSON.stringify(dbg)}`)
      await shot(page, `step${i}`)
    }
    if (state === 'chest') { chestFound = true; break }
    if (state === 'finished') break
    await page.waitForTimeout(state === 'continue' ? 300 : 200)
    // Only press Check right after an ANSWER was picked — pressing it on a
    // fresh question would submit it blank and loop forever.
    if (state === 'tapall' || state === 'estimate' || state === 'answer') {
      const checkBtn = page.getByRole('button', { name: /^Check$/ }).first()
      if (await checkBtn.isVisible().catch(() => false)) {
        const disabled = await checkBtn.isDisabled().catch(() => true)
        if (!disabled) { await checkBtn.click().catch(() => {}); await page.waitForTimeout(400) }
      }
    }
  }
  ok('lesson playable end-to-end', chestFound, `auto-played to the chest stage (found=${chestFound})`)
  console.log('  trace: ' + trace.slice(0, 30).join('\n    '))
  console.log(`  steps=${trace.length} last=[${trace.slice(-3).join(' | ')}]`)
  await shot(page, '03-chest-closed')

  if (chestFound) {
    // Kick the chest 4x by clicking the chest button directly via JS.
    // The chest is a framer-motion <motion.button aria-label="Tap to kick
    // your chest"> with an infinite bounce; Playwright locator clicks time
    // out on its animation, so use JS clicks (bubbling to React onClick).
    for (let i = 0; i < 12; i++) {
      const revealed = await page.evaluate(() => /NEW CARD!|copies? unlocked|✨ NEW!/.test(document.body.innerText))
      if (revealed) break
      const clicked = await page.evaluate(() => {
        const b = document.querySelector('button[aria-label="Tap to kick your chest"]')
        if (!b) return false
        b.click()
        return true
      })
      if (!clicked) break
      await page.waitForTimeout(700)
    }
    await page.waitForTimeout(1500)
    await shot(page, '04-chest-reveal')

    const reveal = await page.evaluate(() => {
      const body = document.body.innerText
      const starEls = Array.from(document.querySelectorAll('[aria-label$="out of 5 stars"]'))
      const m = body.match(/\+(\d+) (copy|copies)/)
      return {
        copiesMatch: m ? m[0] : null,
        copies: m ? Number(m[1]) : null,
        stars: starEls.map((e) => e.getAttribute('aria-label')),
        starLine: (body.match(/★\d\/5 · ×\d+[^\n]*/) || [null])[0],
        singleCardText: /NEW CARD!|copies? unlocked/.test(body),
      }
    })

    ok('reveal shows ONE card', reveal.stars.length === 1,
      `star tracks in reveal = ${reveal.stars.length} (${JSON.stringify(reveal.stars)})`)
    ok('pack size is 1-3 copies', reveal.copies !== null && reveal.copies >= 1 && reveal.copies <= 3,
      `copies line = ${reveal.copiesMatch}`)
    ok('star track + copy count visible in reveal', !!reveal.starLine && reveal.singleCardText,
      `star line = ${reveal.starLine}`)

    const backVisible = await page.getByRole('button', { name: /Back to path/i }).first().isVisible().catch(() => false)
    if (backVisible) await page.getByRole('button', { name: /Back to path/i }).first().click().catch(() => {})
    else await jsClick(page, 'Back to path')
    await page.waitForTimeout(1500)
    const starsAfter = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('momomath-year2-player-v2')).state.cardStars)
    const before = SEED.state.cardStars
    const changed = Object.keys(starsAfter).filter((id) => (starsAfter[id] ?? 0) !== (before[id] ?? 0))
    ok('exactly one character gained copies', changed.length === 1,
      `changed = ${changed.map((id) => `${id}: ${before[id] ?? 0} -> ${starsAfter[id]}`).join(', ') || 'none'}`)
    const gained = changed.length === 1 ? starsAfter[changed[0]] - (before[changed[0]] ?? 0) : 0
    ok('copies gained match the pack size', gained === (reveal.copies ?? -1),
      `gained ${gained} copies; reveal said ${reveal.copies}`)

    // The Card Library button lives in the TopBar (path screen only — not the
    // lesson end screen), so navigate via the ?library URL param directly.
    await page.evaluate(() => { location.href = location.pathname + '?library&cb=' + Date.now() })
    await page.waitForTimeout(2000)
    await shot(page, '05-library-after')
    const lib = await page.evaluate(() => {
      const body = document.body.innerText
      return {
        collected: (body.match(/\d+ \/ 19 collected/) || [null])[0],
        starLines: (body.match(/★\d\/5 · ×\d+[^\n]*/g) || []).slice(0, 6),
        ariaCount: document.querySelectorAll('[aria-label$="out of 5 stars"]').length,
        hasNewBadge: /\bNEW\b/.test(body),
      }
    })
    ok('library renders star-up lines', lib.ariaCount >= 19 && lib.starLines.length > 0,
      `collected=${lib.collected} aria=${lib.ariaCount} sample=${JSON.stringify(lib.starLines.slice(0, 3))}`)
    ok('no always-on NEW badge in library', !lib.hasNewBadge, `hasNewBadge=${lib.hasNewBadge}`)
  }

  ok('no page errors', errors.length === 0,
    errors.length ? errors.slice(0, 3).join(' | ') : 'zero pageerror/console errors')

  await browser.close()
  const failed = results.filter((r) => !r.pass)
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
  process.exit(failed.length ? 1 : 0)
}

main().catch((e) => { console.error('HARNESS FAILED', e); process.exit(2) })
