// Live end-to-end card/chest verification with the screenshot loop.
// Usage: node scripts/verify-live.mjs [url]
//
// Drives the REAL deployed site in a real browser (playwright):
//   1. seeds a collection with known copy counts (star levels)
//   2. Phase 7 gate: returning user → roadmap; sign-out → gate; no guest path;
//      ?gate=2 forces the new-user name picker
//   3. plays a full u1l1 BATTLE (wrong×9 to force question-bank refill, then
//      correct answers to win; wrong answers must show 💡 hint)
//   4. opens the chest and ASSERTS the reveal shows exactly ONE card with
//      1-3 copies + a visible star track
//   5. re-opens the Library and asserts the packed card's copies/stars grew
//   6. screenshots every step to screenshot_loop_output/
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

/** PLAN 95: walk the Sonic lesson slideshow (PLAN 90-94) to its mission slide.
 *  - ASSERTS the anti-skip gate: the Next button must start DISABLED.
 *  - Then waits out each slide's minimum read time (real timers, no QA hook),
 *    clicks the enabled button, and repeats until "Today's mission" shows.
 *  Returns { sawSlideshow, gated, clicks } for the caller's assertions. */
const advanceSlideshow = async (page) => {
  const sawSlideshow = await page.getByTestId('lesson-slideshow').isVisible().catch(() => false)
  // gating probe: the Next button exists and is disabled at slide 0
  const gated = await page.evaluate(() => {
    const b = document.querySelector('[data-testid="slide-next"]')
    return !!b && b.disabled
  })
  let clicks = 0
  let mission = false
  const probe = () =>
    page.evaluate(() => {
      const b = document.querySelector('[data-testid="slide-next"]')
      if (!b) return null
      return { disabled: b.disabled, letsGo: /Let's go/i.test(b.textContent || '') }
    })
  for (let s = 0; s < 16; s++) {
    let st = await probe()
    if (!st) break
    // While gated the mission button reads "🔒 Wait Ns" — its text only flips
    // to "Let's go" once unlocked, so re-probe after every enable wait.
    if (st.letsGo && !st.disabled) {
      mission = true
      await page.evaluate(() => document.querySelector('[data-testid="slide-next"]')?.click())
      clicks++
      break
    }
    const enabled = await page
      .waitForSelector('[data-testid="slide-next"]:not([disabled])', { timeout: 15000 })
      .then(() => true)
      .catch(() => false)
    if (!enabled) break
    st = await probe()
    if (st?.letsGo) {
      // mission slide unlocked: tap Let's go → dismisses the slideshow
      // (Q1 for a lesson, the boss card for a boss node).
      mission = true
      await page.evaluate(() => document.querySelector('[data-testid="slide-next"]')?.click())
      clicks++
      break
    }
    await page.evaluate(() => document.querySelector('[data-testid="slide-next"]')?.click())
    clicks++
    await page.waitForTimeout(300)
  }
  if (mission) await page.waitForTimeout(400)
  return { sawSlideshow, gated, clicks, mission }
}

const AUTH_SEED = {
  state: { user: { sub: 'qa-seed', name: 'Momo', email: 'qa@example.com' }, credential: null, guestName: null },
  version: 0,
}
const AUTH_OUT = { state: { user: null, credential: null, guestName: null }, version: 0 }

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

// One auto-play step for BattleScreen + shared ChestReveal, run inside the page.
// Strategy: first 9 answers WRONG (force question-bank refill without dying —
// player 68 HP / enemy hit 7), then CORRECT to win. u1l1 only emits
// tap-count + estimate-mcq so both kinds are solvable from the DOM.
//
// `.btn3d` is CSS `uppercase` — `innerText` returns FLEE/ATTACK! (rendered),
// while `textContent` keeps the source casing. Always match case-insensitively.
function autoPlayBattleStep() {
  const w = window
  const body = document.body.innerText
  const btns = Array.from(document.querySelectorAll('button'))
  const txt = (b) => (b.textContent || '').trim()
  const enabled = (b) => !b.disabled

  // Chest / victory / loss stages
  if (/Tap to open!|Kick! \(\d left\)|NEW CARD!|copies unlocked/i.test(body)) return 'chest'
  if (/Out of breath|Retry battle/i.test(body)) return 'lost'
  if (/Victory!|PERFECT!|BOSS DEFEATED!|Nice practice!|Continue to roadmap/i.test(body)) return 'victory'

  // Track Q header + refill (initial bank length vs current)
  const qm = body.match(/Q\s+(\d+)\/(\d+)/)
  if (qm) {
    w.__qNum = Number(qm[1])
    w.__qLen = Number(qm[2])
    if (w.__qLen0 == null) w.__qLen0 = w.__qLen
    else if (w.__qLen > w.__qLen0) w.__refilled = true
  }

  const answered = w.__answers || 0
  const wantWrong = answered < 9

  // Post-hit input lock: Attack exists, is disabled, AND no choice cells are
  // still clickable. Initial tap-count also has Attack disabled (nothing
  // selected yet) — those cells remain enabled, so we must not treat that
  // as "locked" or the harness never starts answering.
  const atk = btns.find((b) => /^Attack!$/i.test(txt(b)))
  if (atk && atk.disabled) {
    const liveChoices = btns.filter((b) =>
      !b.disabled &&
      !/^Attack!$/i.test(txt(b)) &&
      !/Flee|Fight|Retry|Back/i.test(txt(b)))
    if (liveChoices.length === 0) return 'locked'
  }

  // 1) tap-count: "Tap ALL the 🍎"
  //    Cells first (React must re-render before Attack enables) — if we just
  //    tapped this step, return so the next step can click Attack.
  const tapPrompt = Array.from(document.querySelectorAll('p')).find((p) => /^Tap ALL the/.test(txt(p)))
  if (tapPrompt) {
    const emoji = txt(tapPrompt).replace(/^Tap ALL the/, '').trim()
    const targets = btns.filter((b) => txt(b) === emoji && enabled(b))
    const pressed = (t) => (t.className || '').includes('border-speed-blue')
    const anyPressed = targets.some(pressed)
    if (!anyPressed) {
      if (wantWrong) {
        // Incomplete selection: tap exactly one target (n is always ≥3).
        if (targets[0]) targets[0].click()
      } else {
        for (const t of targets) {
          if (!pressed(t)) t.click()
        }
      }
      return 'tap-select'
    }
    const atk2 = btns.find((b) => /^Attack!$/i.test(txt(b)) && enabled(b))
    if (atk2) {
      atk2.click()
      w.__answers = answered + 1
      return wantWrong ? 'wrong-answer' : 'right-answer'
    }
    return 'tap-wait'
  }

  // 2) estimate mcq: "About how many…" → "about 5|10|20"
  const estOpts = btns.filter((b) => /^about \d+$/i.test(txt(b)) && enabled(b))
  if (estOpts.length) {
    const visual = Array.from(document.querySelectorAll('p')).find((p) => /text-3xl/.test(p.className || ''))
    const n = visual ? visual.textContent.trim().split(/\s+/).filter(Boolean).length : 0
    const want =
      n >= 6 && n <= 7 ? 'about 5' :
      n === 8 || n === 9 || n === 11 || n === 12 ? 'about 10' :
      n >= 17 && n <= 18 ? 'about 20' : null
    let pick
    if (wantWrong) {
      pick = estOpts.find((b) => txt(b).toLowerCase() !== want) || estOpts[0]
    } else {
      pick = (want && estOpts.find((b) => txt(b).toLowerCase() === want)) || estOpts[0]
    }
    if (pick) {
      pick.click()
      w.__answers = answered + 1
      return wantWrong ? 'wrong-answer' : 'right-answer'
    }
    return 'est-wait'
  }

  // Boss intro (n/a for u1l1, kept for robustness)
  const fight = btns.find((b) => /^Fight!$/i.test(txt(b)) && enabled(b))
  if (fight) {
    fight.click()
    return 'intro'
  }

  return 'idle'
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
    // Google Sign-In on localhost always logs a 403 origin error — not the app's.
    if (/GSI_LOGGER|accounts\.google\.com|Failed to load resource.*403/i.test(t)) return
    errors.push(t)
  })
  page.setDefaultTimeout(20000)

  const url = `${URL_BASE}?cb=${Date.now()}`
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  // Seed the player AND a QA user (no credential): the sign-in gate settles
  // on local onboarded, so the roadmap opens without a Google session.
  await page.evaluate(({ seed, auth }) => {
    localStorage.setItem('momomath-year2-player-v2', JSON.stringify(seed))
    localStorage.setItem('momomath-year2-auth', JSON.stringify(auth))
  }, { seed: SEED, auth: AUTH_SEED })
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1500)
  await shot(page, '01-home')

  const gateGone = !(await page.getByText('Welcome to Momo Year 2 Cambridge!').isVisible().catch(() => false))
  ok('home renders (no welcome gate with seeded session)', gateGone, 'seeded user (no credential) + onboarded player load straight to the path')
  const guestGone = !(await page.getByText(/Continue without signing in/i).first().isVisible().catch(() => false))
  ok('guest path removed from gate', guestGone, 'no "Continue without signing in" affordance')

  // --- sign-out returns the gate: clearing the user must block the roadmap
  // again until the visitor re-signs in ---
  await page.evaluate((authOut) => {
    localStorage.setItem('momomath-year2-auth', JSON.stringify(authOut))
  }, AUTH_OUT)
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1500)
  await shot(page, '01b-gate-after-signout')
  const gateBack = await page.getByText('Welcome to Momo Year 2 Cambridge!').isVisible().catch(() => false)
  ok('signing out returns the sign-in gate', gateBack, 'no user = welcome gate blocks the roadmap')

  // --- Phase 7: ?gate=2 forces the NEW-USER name picker (QA) ---
  // The gate is a fixed overlay: the roadmap may still sit in the DOM beneath
  // it — assert the picker step is what the visitor actually sees.
  await page.evaluate(({ seed, auth }) => {
    localStorage.setItem('momomath-year2-player-v2', JSON.stringify(seed))
    localStorage.setItem('momomath-year2-auth', JSON.stringify(auth))
  }, { seed: SEED, auth: AUTH_SEED })
  await page.goto(`${URL_BASE}?gate=2&cb=${Date.now()}`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1200)
  await shot(page, '01c-gate-forced-picker')
  const picker = await page.getByText('Step 2 - Pick your player name').isVisible().catch(() => false)
  const gateOverlay = await page.evaluate(() => {
    const el = document.querySelector('div.fixed.inset-0.z-50')
    if (!el) return false
    const r = el.getBoundingClientRect()
    return r.width >= window.innerWidth - 2 && r.height >= window.innerHeight - 2
  })
  ok('?gate=2 forces new-user name picker over roadmap', picker && gateOverlay,
    `picker=${picker} overlay=${gateOverlay}`)

  // Restore the seeded session (no gate param) so battle/chest checks can proceed.
  await page.evaluate(({ seed, auth }) => {
    localStorage.setItem('momomath-year2-player-v2', JSON.stringify(seed))
    localStorage.setItem('momomath-year2-auth', JSON.stringify(auth))
  }, { seed: SEED, auth: AUTH_SEED })
  await page.goto(url, { waitUntil: 'domcontentloaded' })
  // Poll: auth hydration + gate phase can settle a beat after load.
  let gateClosed = false
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(400)
    gateClosed = await page.evaluate(() => !document.querySelector('div.fixed.inset-0.z-50'))
    if (gateClosed) break
  }
  if (!gateClosed) {
    const dbg = await page.evaluate(() => ({
      hasFixed: !!document.querySelector('div.fixed.inset-0.z-50'),
      text: document.body.innerText.slice(0, 200),
      auth: localStorage.getItem('momomath-year2-auth'),
      player: (() => { try { return JSON.parse(localStorage.getItem('momomath-year2-player-v2'))?.state?.onboarded } catch { return null } })(),
    }))
    console.log('  gate-still-open debug:', JSON.stringify(dbg))
  }
  ok('seeded session reopens without gate', gateClosed, `gateClosed=${gateClosed}`)
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

  // --- open the battle (path node → BattleScreen, no LessonScreen intro) ---
  // JS click: the node unmounts the instant BattleScreen mounts, which makes
  // Playwright's post-click actionability wait hang.
  const opened = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button[title]'))
      .find((x) => /Count Everything/.test(x.title || '') && !x.disabled)
    if (!b) return false
    b.click()
    return true
  })
  await page.waitForTimeout(1200)
  await shot(page, '02-battle-open')
  // PLAN 95: walk the Sonic slideshow (asserting the anti-skip gate) to Q1
  const flow = await advanceSlideshow(page)
  const chrome = await page.evaluate(() => {
    const body = document.body.innerText
    // .btn3d is CSS uppercase — innerText has FLEE/ATTACK!; match /i.
    return {
      battle: /⚔ Battle/i.test(body),
      hp: /\d+\/\d+ HP/.test(body),
      flee: /flee/i.test(body),
      letsGo: /Let's go/i.test(body),
      mission: /Today's mission/i.test(body),
      intro: /Boss time|Fight!/i.test(body),
    }
  })
  ok('node tap opens BattleScreen with Sonic slideshow (anti-skip gated)',
    opened && flow.sawSlideshow && flow.gated && flow.mission &&
      chrome.battle && chrome.hp && chrome.flee && !chrome.intro,
    JSON.stringify({ opened, ...flow, ...chrome }))
  await page.waitForTimeout(600)

  // --- auto-play battle: wrong×9 (refill + hint) then correct to win ---
  let stage = 'active'
  let hintAfterWrong = false
  let sawWrong = false
  let enemyDropped = false
  const trace = []
  let prevEnemy = null
  for (let i = 0; i < 320; i++) {
    const state = await page.evaluate(autoPlayBattleStep)
    const snap = await page.evaluate(() => {
      const body = document.body.innerText
      const hp = (body.match(/(\d+)\/(\d+) HP/g) || []).slice(0, 2)
      const q = (body.match(/Q\s+\d+\/\d+/) || [null])[0]
      return { hp, q, hint: /💡/.test(body), refilled: !!window.__refilled, answers: window.__answers || 0 }
    })
    trace.push(`${i}:${state} q=${snap.q} hp=${snap.hp.join(' ')} a=${snap.answers}`)
    if (state === 'wrong-answer') sawWrong = true
    if (sawWrong && snap.hint) hintAfterWrong = true
    if (prevEnemy && snap.hp[1] && prevEnemy !== snap.hp[1]) {
      const [e0] = prevEnemy.split('/')
      const [e1] = snap.hp[1].split('/')
      if (Number(e1) < Number(e0)) enemyDropped = true
    }
    if (snap.hp[1]) prevEnemy = snap.hp[1]
    if (i < 4) await shot(page, `step${i}`)
    if (state === 'chest' || state === 'victory') { stage = state; break }
    if (state === 'lost') { stage = 'lost'; break }
    await page.waitForTimeout(state === 'locked' ? 250 : state === 'tap-select' ? 200 : 350)
  }
  const refillInfo = await page.evaluate(() => ({
    refilled: !!window.__refilled, len0: window.__qLen0, len: window.__qLen, answers: window.__answers || 0,
  }))
  ok('battle playable end-to-end to victory/chest', stage === 'victory' || stage === 'chest',
    `stage=${stage} answers=${refillInfo.answers}`)
  ok('question bank refilled mid-battle', refillInfo.refilled,
    `len ${refillInfo.len0} -> ${refillInfo.len}`)
  ok('wrong answer shows 💡 hint', hintAfterWrong, `hintAfterWrong=${hintAfterWrong}`)
  ok('enemy HP dropped on correct answers', enemyDropped, `enemyDropped=${enemyDropped}`)
  console.log('  trace: ' + trace.slice(0, 24).join('\n    '))
  console.log(`  steps=${trace.length} last=[${trace.slice(-3).join(' | ')}]`)
  await shot(page, '03-chest-closed')

  if (stage === 'victory' || stage === 'chest') {
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
        singleCardText: /NEW CARD!|cop(?:y|ies) unlocked/.test(body),
        xpLine: /\+\d+ ⚡ XP/.test(body),
      }
    })

    ok('reveal shows ONE card', reveal.stars.length === 1,
      `star tracks in reveal = ${reveal.stars.length} (${JSON.stringify(reveal.stars)})`)
    ok('pack size is 1-3 copies', reveal.copies !== null && reveal.copies >= 1 && reveal.copies <= 3,
      `copies line = ${reveal.copiesMatch}`)
    ok('star track + copy count visible in reveal', !!reveal.starLine && reveal.singleCardText,
      `star line = ${reveal.starLine} singleCard=${reveal.singleCardText}`)
    ok('battle victory awards XP in reveal', reveal.xpLine, `xpLine=${reveal.xpLine}`)

    const cont = page.getByRole('button', { name: /Continue to roadmap/i }).first()
    const contVisible = await cont.isVisible().catch(() => false)
    if (contVisible) await cont.click().catch(() => {})
    else await jsClick(page, 'Continue to roadmap')
    await page.waitForTimeout(1500)

    const after = await page.evaluate((k) => {
      const s = JSON.parse(localStorage.getItem(k)).state
      return { cardStars: s.cardStars, prog: s.lessonProgress?.u1l1 }
    }, 'momomath-year2-player-v2')
    ok('u1l1 progress written by battle win', !!after.prog && after.prog.completions >= 1,
      `u1l1=${JSON.stringify(after.prog)}`)
    const starsAfter = after.cardStars
    const before = SEED.state.cardStars
    const changed = Object.keys(starsAfter).filter((id) => (starsAfter[id] ?? 0) !== (before[id] ?? 0))
    ok('exactly one character gained copies', changed.length === 1,
      `changed = ${changed.map((id) => `${id}: ${before[id] ?? 0} -> ${starsAfter[id]}`).join(', ') || 'none'}`)
    const gained = changed.length === 1 ? starsAfter[changed[0]] - (before[changed[0]] ?? 0) : 0
    ok('copies gained match the pack size', gained === (reveal.copies ?? -1),
      `gained ${gained} copies; reveal said ${reveal.copies}`)

    // --- tougher BOSS battle: unlock u1boss, assert intro + 150 HP, Fight!, flee ---
    await page.evaluate((k) => {
      const raw = JSON.parse(localStorage.getItem(k))
      const prog = { ...(raw.state.lessonProgress || {}) }
      for (const id of ['u1l1', 'u1l2', 'u1l3', 'u1l4', 'u1l5', 'u1l6']) {
        prog[id] = { ...(prog[id] || {}), completions: Math.max(2, prog[id]?.completions || 0), bestAccuracy: 100, crown: 3 }
      }
      raw.state.lessonProgress = prog
      localStorage.setItem(k, JSON.stringify(raw))
    }, 'momomath-year2-player-v2')
    await page.goto(`${URL_BASE}?cb=${Date.now()}`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1500)
    const bossOpened = await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll('button[title]'))
        .find((x) => /Counting Boss/i.test(x.title) && !x.disabled)
      if (!b) return false
      b.click()
      return true
    })
    await page.waitForTimeout(1200)
    await shot(page, '05b-boss-intro')
    // PLAN 95: the boss battle also gets the Sonic slideshow first — walk it
    // (the Let's go  tap is inside advanceSlideshow) before the Fight! intro.
    const bossFlow = await advanceSlideshow(page)
    const bossChrome = await page.evaluate(() => {
      const body = document.body.innerText
      return {
        boss: /👑 BOSS/i.test(body),
        hp150: /150\/150 HP/.test(body),
        fight: /Fight!/i.test(body),
        introTitle: /Boss time/i.test(body),
      }
    })
    ok('boss node: slideshow then 150 HP intro',
      bossOpened && bossFlow.sawSlideshow && bossFlow.gated && bossFlow.mission &&
      bossChrome.boss && bossChrome.hp150 && bossChrome.introTitle && bossChrome.fight,
      JSON.stringify({ bossOpened, ...bossFlow, ...bossChrome }))
    // Dismiss the Fight! intro, then flee back to path.
    await page.evaluate(() => {
      const f = Array.from(document.querySelectorAll('button'))
        .find((b) => /^Fight!$/i.test((b.textContent || '').trim()) && !b.disabled)
      f?.click()
    })
    await page.waitForTimeout(500)
    const bossFled = await page.evaluate(() => {
      const f = Array.from(document.querySelectorAll('button'))
        .find((b) => /Flee/i.test(b.textContent || '') && !b.disabled)
      if (!f) return false
      f.click()
      return true
    })
    await page.waitForTimeout(700)
    const backOnPath = await page.evaluate(() =>
      Array.from(document.querySelectorAll('button[title]')).some((x) => /Count Everything/i.test(x.title || '')),
    )
    ok('boss flee returns to roadmap', bossFled && backOnPath, `fled=${bossFled} path=${backOnPath}`)

    // The Card Library button lives in the TopBar (path screen only — not the
    // lesson end screen), so navigate via the ?library URL param directly.
    // Full page nav — wait for library content, not a fixed 2s.
    await page.evaluate(() => { location.href = location.pathname + '?library&cb=' + Date.now() })
    for (let i = 0; i < 20; i++) {
      await page.waitForTimeout(250)
      const ready = await page.evaluate(() =>
        document.querySelectorAll('[aria-label$="out of 5 stars"]').length >= 97)
      if (ready) break
    }
    await shot(page, '05-library-after')
    const lib = await page.evaluate(() => {
      const body = document.body.innerText
      return {
        collected: (body.match(/\d+ \/ 100 collected/) || [null])[0],
        starLines: (body.match(/★\d\/5 · ×\d+[^\n]*/g) || []).slice(0, 6),
        ariaCount: document.querySelectorAll('[aria-label$="out of 5 stars"]').length,
        hasNewBadge: /\bNEW\b/.test(body),
      }
    })
    ok('library renders star-up lines', lib.ariaCount >= 97 && lib.starLines.length > 0,
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
