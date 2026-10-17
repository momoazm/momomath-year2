// Phase 36 smoke test: premium speech clips + Web Speech fallback.
// Usage: node scripts/verify-tts.mjs [url] [--only=premium|fallback]
//
// Drives a real Chromium (playwright-core, same install as verify-live.mjs)
// against any deployment (preview server or live URL):
//   premium  — a trusted click opens the u1l1 battle node; the Sonic slideshow
//              auto-speaks its first slide and MUST fetch the manifest and a
//              /tts/<key>.mp3 clip (HTTP 200). Sticky user activation from the
//              real mouse click lets the Audio element actually play.
//   fallback — same flow with /tts/** route-aborted and window.speechSynthesis
//              stubbed: the app must fall back to Web Speech (stub called,
//              zero page errors, no tts mp3 fetched).
// Exits 0 only when every executed case passes.
import { createRequire } from 'node:module'

const require = createRequire(
  'C:/Users/momo/AppData/Local/hermes/node/node_modules/@playwright/cli/playwright-core/index.js',
)
const { chromium } = require('playwright-core')

const URL_BASE = process.argv[2] || 'https://momoazm.github.io/momomath-year2/'
const only = (process.argv.find((a) => a.startsWith('--only=')) || '').split('=')[1] || 'both'

const results = []
const ok = (name, pass, detail) => {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name} - ${detail}`)
}

const AUTH_SEED = {
  state: { user: { sub: 'qa-seed', name: 'Momo', email: 'qa@example.com' }, credential: null, guestName: null },
  version: 0,
}
// Same seed shape as verify-live.mjs; soundOn: true so nothing gates playback.
const SEED = {
  state: {
    name: 'Momo', mascot: 'sonic', onboarded: true, gems: 120, xpTotal: 340,
    streakCurrent: 4, streakLongest: 5, dailyGoal: 30, todayXp: 10, soundOn: true,
    lessonProgress: {}, currentLeague: 'Bronze', shopInventory: {}, achievements: [],
    leagueHistory: [], cardStars: {}, cardPity: 0,
    claimedQuests: { day: '1970-01-01', questIds: [] },
  },
  version: 7,
}

const TTS_MP3_RE = /\/tts\/[0-9a-z]{14}\.mp3/

async function seedAndSettle(page) {
  await page.goto(URL_BASE, { waitUntil: 'domcontentloaded' })
  await page.evaluate(({ seed, auth }) => {
    localStorage.setItem('momomath-year2-player-v2', JSON.stringify(seed))
    localStorage.setItem('momomath-year2-auth', JSON.stringify(auth))
  }, { seed: SEED, auth: AUTH_SEED })
  await page.goto(`${URL_BASE}?cb=${Date.now()}`, { waitUntil: 'domcontentloaded' })
  // Poll until the battle node exists and no auth gate overlay blocks it.
  for (let i = 0; i < 30; i++) {
    const ready = await page.evaluate(() =>
      !document.querySelector('div.fixed.inset-0.z-50') &&
      Array.from(document.querySelectorAll('button[title]')).some(
        (b) => /Count Everything/.test(b.title || '') && !b.disabled,
      ),
    ).catch(() => false)
    if (ready) return true
    await page.waitForTimeout(400)
  }
  return false
}

/** REAL mouse click (trusted → sticky user activation) on the node button. */
async function clickNode(page) {
  const box = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button[title]')).find(
      (x) => /Count Everything/.test(x.title || '') && !x.disabled,
    )
    if (!b) return null
    b.scrollIntoView({ block: 'center' })
    const r = b.getBoundingClientRect()
    return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }
  }).catch(() => null)
  if (!box) return false
  await page.mouse.click(box.x, box.y)
  return true
}

/** Stub speechSynthesis BEFORE app scripts run; records utterances so a case
 *  can assert whether the Web Speech fallback was (not) used. */
async function installSpeechStub(ctx) {
  await ctx.addInitScript(() => {
    const calls = []
    window.__spokeCalls = calls
    const stub = {
      getVoices: () => [],
      speak: (u) => { calls.push(String(u?.text ?? '')) },
      cancel: () => {}, pause: () => {}, resume: () => {},
      speaking: false, pending: false, paused: false, onvoiceschanged: null,
    }
    try { Object.defineProperty(window, 'speechSynthesis', { value: stub, configurable: true }) } catch { /* keep native */ }
  })
}

async function casePremium(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  await installSpeechStub(ctx)
  const page = await ctx.newPage()
  const errors = []
  const ttsHits = []
  let manifestStatus = null
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('response', (res) => {
    const u = res.url()
    if (u.includes('/tts/manifest.json')) manifestStatus = res.status()
    if (TTS_MP3_RE.test(u)) ttsHits.push({ u, s: res.status() })
  })

  const settled = await seedAndSettle(page)
  ok('premium: seeded session settles on the roadmap', settled, `settled=${settled}`)
  // Let the runtime's idle manifest warm (timer 1.5s) complete before speaking.
  await page.waitForTimeout(2600)
  const clicked = await clickNode(page)
  ok('premium: battle node click (trusted, sticky audio activation)', clicked, `clicked=${clicked}`)
  for (let i = 0; i < 60 && ttsHits.length === 0; i++) await page.waitForTimeout(200)
  // Media elements request with a Range header, so static servers answer 206
  // (Partial Content) — any 2xx proves the clip was fetched and played.
  const hitOk = ttsHits.find((h) => h.s >= 200 && h.s < 300)
  ok('premium: manifest.json served', manifestStatus === 200, `status=${manifestStatus}`)
  ok('premium: slideshow fetched a /tts clip (HTTP 2xx)',
    !!hitOk, hitOk ? `${hitOk.u.split('/').pop()} (${hitOk.s})` : `no 2xx tts hits (${JSON.stringify(ttsHits.slice(0, 3))})`)
  // The spoken line must come from the clip, i.e. Web Speech must stay silent.
  const spokeCalls = await page.evaluate(() => window.__spokeCalls ?? [])
  ok('premium: no Web Speech fallback used when a clip exists', spokeCalls.length === 0,
    spokeCalls.length ? `unexpected utterances: ${spokeCalls.length}` : 'zero utterances')
  ok('premium: no page errors', errors.length === 0, errors.slice(0, 2).join(' | ') || 'clean')
  await ctx.close()
}

async function caseFallback(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  // Abort every tts asset: manifest fetch fails -> the runtime must stay on
  // Web Speech for the whole session.
  await ctx.route('**/tts/**', (route) => route.abort())
  // Stub speechSynthesis BEFORE app scripts run; record utterances.
  await ctx.addInitScript(() => {
    const calls = []
    window.__spokeCalls = calls
    const stub = {
      getVoices: () => [],
      speak: (u) => { calls.push(String(u?.text ?? '')) },
      cancel: () => {}, pause: () => {}, resume: () => {},
      speaking: false, pending: false, paused: false, onvoiceschanged: null,
    }
    try { Object.defineProperty(window, 'speechSynthesis', { value: stub, configurable: true }) } catch { /* keep native */ }
  })
  const page = await ctx.newPage()
  const errors = []
  const ttsServed = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('response', (res) => {
    if (TTS_MP3_RE.test(res.url()) && res.status() >= 200 && res.status() < 300) ttsServed.push(res.url())
  })

  const settled = await seedAndSettle(page)
  ok('fallback: seeded session settles on the roadmap', settled, `settled=${settled}`)
  await page.waitForTimeout(2600)
  const clicked = await clickNode(page)
  ok('fallback: battle node click', clicked, `clicked=${clicked}`)
  for (let i = 0; i < 50; i++) {
    const n = await page.evaluate(() => window.__spokeCalls?.length ?? 0)
    if (n > 0) break
    await page.waitForTimeout(200)
  }
  const spokeCalls = await page.evaluate(() => window.__spokeCalls ?? [])
  ok('fallback: Web Speech used (slideshow spoke)', spokeCalls.length > 0,
    spokeCalls.length ? `"${String(spokeCalls[0]).slice(0, 42)}"` : 'no utterances recorded')
  ok('fallback: zero tts mp3 served', ttsServed.length === 0, `2xx=${ttsServed.length}`)
  ok('fallback: no page errors', errors.length === 0, errors.slice(0, 2).join(' | ') || 'clean')
  await ctx.close()
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  try {
    if (only !== 'fallback') await casePremium(browser)
    if (only !== 'premium') await caseFallback(browser)
  } finally {
    await browser.close()
  }
  const failed = results.filter((r) => !r.pass)
  console.log(`\n${results.length - failed.length}/${results.length} checks passed  (${URL_BASE})`)
  process.exit(failed.length ? 1 : 0)
}

main().catch((e) => { console.error('HARNESS FAILED', e); process.exit(2) })
