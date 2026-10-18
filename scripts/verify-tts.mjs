// TTS smoke test: premium speech clips + Web Speech fallback.
// Usage: node scripts/verify-tts.mjs [url] [--only=premium|fallback]
//
// Drives a real Chromium (playwright-core) against any deployment (preview
// server or live URL). Audio questions auto-speak once per question when they
// carry `audioText` (LessonScreen); math lessons carry none, so the flow opens
// the first English lesson (e1l1 "Same Letters, Different Sound"), whose first
// question is a listen-and-tap MCQ that speaks its word ("low" for a fresh
// attempt seed — that clip ships in the manifest):
//   premium  — trusted clicks open the node + "Let's go!"; the question MUST
//              fetch the manifest and a /tts/<key>.mp3 clip (HTTP 2xx).
//              Sticky user activation from the real mouse clicks lets the
//              Audio element actually play.
//   fallback — same flow with /tts/** route-aborted and window.speechSynthesis
//              stubbed: the app must fall back to Web Speech (stub called,
//              zero page errors, no tts mp3 fetched).
// Exits 0 only when every executed case passes.
import { createRequire } from 'node:module'
import { existsSync } from 'node:fs'

// playwright-core installs vary per machine/agent environment; use the first
// candidate that actually exists, else fall back to the repo's node_modules.
const PW_CANDIDATES = [
  'C:/Users/momo/AppData/Local/hermes/node/node_modules/@playwright/cli/playwright-core/index.js',
  'C:/Users/momo/.config/opencode/skills/website-clips/scripts/node_modules/playwright-core/index.js',
  'C:/Users/momo/.config/opencode/skills/clip-guard/scripts/node_modules/playwright-core/index.js',
]
let chromium = null
for (const p of PW_CANDIDATES) {
  if (!existsSync(p)) continue
  try { chromium = createRequire(p)('playwright-core').chromium; break } catch { /* try the next candidate */ }
}
if (!chromium) {
  try { chromium = createRequire(import.meta.url)('playwright-core').chromium } catch { /* no install found */ }
}
if (!chromium) {
  console.error('playwright-core not found. Looked for:\n  ' + [...PW_CANDIDATES, '<repo>/node_modules/playwright-core'].join('\n  '))
  process.exit(2)
}

const URL_BASE = process.argv[2] || 'https://momoazm.github.io/momomath-year2/'
const only = (process.argv.find((a) => a.startsWith('--only=')) || '').split('=')[1] || 'both'
// The lesson that speaks lives in the English roadmap, so pin the subject
// (via the URL and the seed below) before any audio can fire.
const SUBJECT_URL = URL_BASE.includes('?') ? `${URL_BASE}&subject=english` : `${URL_BASE}?subject=english`

const results = []
const ok = (name, pass, detail) => {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name} - ${detail}`)
}

const AUTH_SEED = {
  state: { user: { sub: 'qa-seed', name: 'Momo', email: 'qa@example.com' }, credential: null, guestName: null },
  version: 0,
}
// Same seed shape as verify-live.mjs; soundOn: true so nothing gates playback;
// subject pinned to English (math lessons carry no audioText, so no speech).
const SEED = {
  state: {
    name: 'Momo', mascot: 'sonic', onboarded: true, gems: 120, xpTotal: 340,
    streakCurrent: 4, streakLongest: 5, dailyGoal: 30, todayXp: 10, soundOn: true,
    subject: 'english', lessonProgress: {}, currentLeague: 'Bronze', shopInventory: {},
    achievements: [], leagueHistory: [], cardStars: {}, cardPity: 0,
    claimedQuests: { day: '1970-01-01', questIds: [] },
  },
  version: 7,
}

const TTS_MP3_RE = /\/tts\/[0-9a-z]{14}\.mp3/

async function seedAndSettle(page) {
  await page.goto(SUBJECT_URL, { waitUntil: 'domcontentloaded' })
  await page.evaluate(({ seed, auth }) => {
    localStorage.setItem('momomath-year2-player-v2', JSON.stringify(seed))
    localStorage.setItem('momomath-year2-auth', JSON.stringify(auth))
  }, { seed: SEED, auth: AUTH_SEED })
  await page.goto(`${SUBJECT_URL}&cb=${Date.now()}`, { waitUntil: 'domcontentloaded' })
  // Poll until the e1l1 node exists and no auth gate overlay blocks it.
  for (let i = 0; i < 30; i++) {
    const ready = await page.evaluate(() =>
      !document.querySelector('div.fixed.inset-0.z-50') &&
      Array.from(document.querySelectorAll('button[title]')).some(
        (b) => /Same Letters, Different Sound/.test(b.title || '') && !b.disabled,
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
      (x) => /Same Letters, Different Sound/.test(x.title || '') && !x.disabled,
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

/** REAL mouse click on the lesson-intro "Let's go! 🚀" button once it renders. */
async function clickLetsGo(page) {
  for (let i = 0; i < 25; i++) {
    const box = await page.evaluate(() => {
      const b = Array.from(document.querySelectorAll('button')).find(
        (x) => /let.?s go/i.test(x.textContent || '') && !x.disabled,
      )
      if (!b) return null
      b.scrollIntoView({ block: 'center' })
      const r = b.getBoundingClientRect()
      return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }
    }).catch(() => null)
    if (box) {
      await page.mouse.click(box.x, box.y)
      return true
    }
    await page.waitForTimeout(200)
  }
  return false
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
  ok('premium: lesson node click (trusted, sticky audio activation)', clicked, `clicked=${clicked}`)
  const started = await clickLetsGo(page)
  ok('premium: intro "Let\'s go!" starts the lesson', started, `started=${started}`)
  for (let i = 0; i < 60 && ttsHits.length === 0; i++) await page.waitForTimeout(200)
  // Media elements request with a Range header, so static servers answer 206
  // (Partial Content) — any 2xx proves the clip was fetched and played.
  const hitOk = ttsHits.find((h) => h.s >= 200 && h.s < 300)
  ok('premium: manifest.json served', manifestStatus === 200, `status=${manifestStatus}`)
  ok('premium: first question fetched a /tts clip (HTTP 2xx)',
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
  await installSpeechStub(ctx)
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
  ok('fallback: lesson node click', clicked, `clicked=${clicked}`)
  const started = await clickLetsGo(page)
  ok('fallback: intro "Let\'s go!" starts the lesson', started, `started=${started}`)
  for (let i = 0; i < 50; i++) {
    const n = await page.evaluate(() => window.__spokeCalls?.length ?? 0)
    if (n > 0) break
    await page.waitForTimeout(200)
  }
  const spokeCalls = await page.evaluate(() => window.__spokeCalls ?? [])
  ok('fallback: Web Speech used (question spoke)', spokeCalls.length > 0,
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
