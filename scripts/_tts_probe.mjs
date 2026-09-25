// TTS probe (dev): does autoplay fire on a listening question? any replay button?
// Usage: node scripts/_tts_probe.mjs [url]
import { createRequire } from 'node:module'

const require = createRequire('C:/Users/momo/AppData/Local/hermes/node/node_modules/@playwright/cli/node_modules/playwright-core/index.js')
const { chromium } = require('playwright-core')

const URL_BASE = process.argv[2] || 'http://127.0.0.1:3200/'

const SEED = {
  state: {
    name: 'Momo', mascot: 'sonic', onboarded: true, gems: 120, xpTotal: 340,
    subject: 'english', soundOn: true,
    streakCurrent: 4, streakLongest: 5, dailyGoal: 30, todayXp: 10,
    lessonProgress: {}, currentLeague: 'Bronze', shopInventory: {}, achievements: [],
    leagueHistory: [], cardStars: {}, cardPity: 0,
    claimedQuests: { day: '1970-01-01', questIds: [] },
    dust: 120, arcadeScores: {}, arcadeRounds: 0, arcadeBossesDown: 0,
  },
  version: 11,
}
const AUTH = { state: { user: { sub: 'qa-seed', name: 'Momo', email: 'qa@example.com' }, credential: null, guestName: null }, version: 0 }

const INIT = () => {
  const log = []
  window.__ttsLog = log
  const ps = window.speechSynthesis
  if (ps) {
    const origSpeak = ps.speak.bind(ps)
    const origCancel = ps.cancel.bind(ps)
    const origGetVoices = ps.getVoices.bind(ps)
    ps.speak = (u) => {
      log.push({ ev: 'speak', text: u.text, lang: u.lang, rate: u.rate, voice: u.voice ? u.voice.name : null, t: Date.now() })
      return origSpeak(u)
    }
    ps.cancel = () => { log.push({ ev: 'cancel', t: Date.now() }); return origCancel() }
    ps.getVoices = () => { const v = origGetVoices(); log.push({ ev: 'getVoices', n: v.length }); return v }
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  page.on('pageerror', (e) => console.log('PAGEERR', String(e).slice(0, 200)))
  await page.addInitScript(INIT)

  // --- seed (english subject) ---
  await page.goto(`${URL_BASE}?cb=${Date.now()}`, { waitUntil: 'domcontentloaded' })
  await page.evaluate(({ seed, auth }) => {
    localStorage.setItem('momomath-year2-player-v2', JSON.stringify(seed))
    localStorage.setItem('momomath-year2-auth', JSON.stringify(auth))
  }, { seed: SEED, auth: AUTH })
  await page.evaluate(() => { location.href = location.pathname + '?cb=' + Date.now() })
  await page.waitForLoadState('domcontentloaded').catch(() => {})
  await page.waitForTimeout(1500)

  const roadmap = await page.evaluate(() => ({
    subjectPills: Array.from(document.querySelectorAll('header button')).map((b) => b.textContent.trim()).slice(0, 8),
    lessonNodes: Array.from(document.querySelectorAll('button[title]')).map((b) => b.title).slice(0, 6),
  }))
  console.log('ROADMAP', JSON.stringify(roadmap))

  // --- open first lesson node -> BattleScreen ---
  const opened = await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('button[title]')).filter((b) => {
      const t = b.title || ''
      return t && !/boss/i.test(t) && b.closest('header, nav') === null
    })
    if (!nodes[0]) return null
    const title = nodes[0].title
    nodes[0].click()
    return title
  })
  console.log('OPENED NODE:', opened)
  await page.waitForTimeout(1500)

  const battleInfo = await page.evaluate(() => {
    const b = window.__mbBattle
    const body = document.body.innerText
    return {
      inBattle: /⚔ Battle/i.test(body),
      status: b && b.status,
      index: b && b.index,
      q0: b && b.questions[0] ? { kind: b.questions[0].kind, prompt: b.questions[0].prompt, audioText: b.questions[0].audioText } : null,
      audioButtons: Array.from(document.querySelectorAll('button')).filter((x) => /🔊|Listen|🐢| Hear/i.test(x.textContent || '')).map((x) => x.textContent.trim().slice(0, 40)),
      voices: window.speechSynthesis ? window.speechSynthesis.getVoices().length : -1,
      ttsAvailable: 'speechSynthesis' in window,
      speaking: window.speechSynthesis ? window.speechSynthesis.speaking : null,
      pending: window.speechSynthesis ? window.speechSynthesis.pending : null,
      paused: window.speechSynthesis ? window.speechSynthesis.paused : null,
    }
  })
  console.log('BATTLE', JSON.stringify(battleInfo, null, 1))

  await page.waitForTimeout(800)
  const log1 = await page.evaluate(() => window.__ttsLog)
  console.log('TTS LOG (after autoplay window):', JSON.stringify(log1, null, 1))

  // --- try the plain LessonScreen path (?lesson=e1l1) ---
  await page.evaluate(() => { location.href = location.pathname + '?lesson=e1l1&cb=' + Date.now() })
  await page.waitForLoadState('domcontentloaded').catch(() => {})
  await page.waitForTimeout(1800)
  const lessonInfo = await page.evaluate(() => {
    const body = document.body.innerText
    return {
      prompt: (Array.from(document.querySelectorAll('p')).find((p) => /hear|Listen/i.test(p.textContent)) || {}).textContent || null,
      audioButtons: Array.from(document.querySelectorAll('button')).filter((x) => /🔊|🐢/.test(x.textContent || '')).map((x) => x.textContent.trim().slice(0, 40)),
    }
  })
  console.log('LESSON (?lesson=e1l1)', JSON.stringify(lessonInfo))

  // click 🔊 Listen if present
  const clicked = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) => /🔊\s*Listen/.test(b.textContent || ''))
    if (!btn) return false
    btn.click()
    return true
  })
  await page.waitForTimeout(700)
  const log2 = await page.evaluate(() => window.__ttsLog)
  console.log('CLICKED LISTEN:', clicked)
  console.log('TTS LOG (full):', JSON.stringify(log2, null, 1))

  await browser.close()
}
main().catch((e) => { console.error('PROBE_ERR', e); process.exit(1) })
