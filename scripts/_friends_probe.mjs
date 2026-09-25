// Friends screen probe (PLAN 82-84) — network mocked via Playwright routes
import { createRequire } from 'node:module'
const require = createRequire('C:/Users/momo/AppData/Local/hermes/node/node_modules/@playwright/cli/node_modules/playwright-core/index.js')
const { chromium } = require('playwright-core')
const URL_BASE = process.argv[2] || 'http://127.0.0.1:3200/'

function mondayKey() {
  const d = new Date()
  const day = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - day)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}
const WEEK = mondayKey()

const baseState = {
  name: 'Momo', mascot: 'sonic', onboarded: true, gems: 120, xpTotal: 340,
  subject: 'english', soundOn: true, streakCurrent: 4, streakLongest: 5,
  dailyGoal: 30, todayXp: 10, lessonProgress: {}, currentLeague: 'Bronze',
  shopInventory: {}, achievements: [], leagueHistory: [], cardStars: {}, cardPity: 0,
  claimedQuests: { day: '1970-01-01', questIds: [] },
  dust: 120, arcadeScores: {}, arcadeRounds: 0, arcadeBossesDown: 0,
  weeklyXp: 50, weeklyXpWeek: WEEK, friendsAdded: 0,
  booksRead: {}, unitsCelebrated: [],
}
const AUTH = { state: { user: null, credential: null, guestName: 'Momo' }, version: 0 }

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 420, height: 900 } })
page.on('pageerror', (e) => console.log('PAGEERR', String(e).slice(0, 300)))

// --- network mocks ----------------------------------------------------------
let joinMode = 'first' // first | already | notfound
let myCode = 'A1B2C3'
let friendList = [{ id: 'name:amir', name: 'Amir' }]
await page.route('**/api/year2/friends/code', async (route) => {
  const body = JSON.parse(route.request().postData() || '{}')
  if (body.regenerate) myCode = 'B2C3D4'
  await route.fulfill({ json: { ok: true, code: myCode, regenerated: !!body.regenerate } })
})
await page.route('**/api/year2/friends/list**', async (route) => {
  await route.fulfill({ json: { ok: true, friends: friendList } })
})
await page.route('**/api/year2/friends/join', async (route) => {
  const body = JSON.parse(route.request().postData() || '{}')
  if (joinMode === 'notfound') {
    await route.fulfill({ status: 404, json: { ok: false, error: "That code doesn't match — check the letters!" } })
  } else if (joinMode === 'already') {
    await route.fulfill({ json: { ok: true, friendName: 'Amir', friendId: 'name:amir', firstJoin: false, already: true } })
  } else {
    if (!friendList.some((f) => f.id === 'name:sara')) friendList.push({ id: 'name:sara', name: 'Sara' })
    await route.fulfill({ json: { ok: true, friendName: 'Sara', friendId: 'name:sara', firstJoin: true } })
  }
})
await page.route('**/api/year2/leaderboard', async (route) => {
  if (route.request().method() === 'PUT') {
    await route.fulfill({ json: { ok: true, entries: [] } })
  } else {
    await route.fulfill({ json: { ok: true, entries: [
      { id: 'name:amir', name: 'Amir', xp: 120, league: 'Bronze', mascot: 'tails', week: WEEK },
    ] } })
  }
})

// --- seed + open ------------------------------------------------------------
await page.goto(`${URL_BASE}?cb=${Date.now()}`, { waitUntil: 'domcontentloaded' })
await page.evaluate(({ seed, auth }) => {
  localStorage.setItem('momomath-year2-player-v2', JSON.stringify(seed))
  localStorage.setItem('momomath-year2-auth', JSON.stringify(auth))
}, { seed: { state: baseState, version: 12 }, auth: AUTH })
await page.goto(`${URL_BASE}?friends&cb=${Date.now()}`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(2000)

// A) screen content
const a = await page.evaluate(() => {
  const t = document.body.innerText
  return {
    title: /Friends 🤝/.test(t),
    codeShown: t.includes('A1B2C3'),
    copyBtn: Array.from(document.querySelectorAll('button')).some((b) => /Copy/.test(b.textContent)),
    readBtn: !!document.querySelector('button[aria-label="Read my code aloud"]'),
    regenBtn: Array.from(document.querySelectorAll('button')).some((b) => /New code/.test(b.textContent)),
    addBtn: Array.from(document.querySelectorAll('button')).some((b) => /^Add$/.test((b.textContent || '').trim())),
    friendRow: t.includes('Amir') && t.includes('120 XP'),
    meRow: /Momo/.test(t) && t.includes('50 XP'),
    crown: t.includes('👑'),
    privacy: t.includes('Friends see only your display name and weekly XP'),
    noEmptyState: !t.includes('No friends yet'),
  }
})
console.log('A SCREEN', JSON.stringify(a))

// profile entry button (Back -> bottom-nav "You" tab -> Friends card)
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll('button')).find((x) => x.getAttribute('aria-label') === 'Back')
  b.click()
})
await page.waitForTimeout(500)
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll('button')).find((x) => /You/.test(x.textContent) && x.getAttribute('aria-current') !== undefined || /You/.test((x.textContent || '')) && /🦔/.test(x.textContent || ''))
  if (b) b.click()
})
await page.waitForTimeout(500)
const entryVisible = await page.evaluate(() =>
  Array.from(document.querySelectorAll('button')).some((x) => /Friends/.test(x.textContent || '') && /code/.test(x.textContent || '')),
)
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll('button')).find((x) => /Friends/.test(x.textContent || '') && /code/.test(x.textContent || ''))
  if (b) b.click()
})
await page.waitForTimeout(700)
console.log('B ENTRY', JSON.stringify({ entryVisible, reopened: await page.evaluate(() => /Friends 🤝/.test(document.body.innerText)) }))

// C) join error toast
await page.fill('input[aria-label="Friend code"]', 'ZZZZZZ')
joinMode = 'notfound'
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll('button')).find((x) => /^Add$/.test((x.textContent || '').trim()))
  b.click()
})
await page.waitForTimeout(700)
console.log('C JOIN ERR', JSON.stringify(await page.evaluate(() => ({
  toast: document.body.innerText.includes("That code doesn't match"),
  inputCleared: document.querySelector('input[aria-label="Friend code"]').value === '',
}))))

// D) join firstJoin -> reward overlay + store effects
await page.fill('input[aria-label="Friend code"]', 'A1B2C3')
joinMode = 'first'
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll('button')).find((x) => /^Add$/.test((x.textContent || '').trim()))
  b.click()
})
await page.waitForTimeout(800)
console.log('D REWARD', JSON.stringify(await page.evaluate(() => ({
  overlay: document.body.innerText.includes('You made a friend!'),
  plus30: document.body.innerText.includes('+30 💎'),
  achievementText: document.body.innerText.includes('Best Friends'),
  gems: JSON.parse(localStorage.getItem('momomath-year2-player-v2')).state.gems,
  friendsAdded: JSON.parse(localStorage.getItem('momomath-year2-player-v2')).state.friendsAdded,
  achievements: JSON.parse(localStorage.getItem('momomath-year2-player-v2')).state.achievements,
}))))
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll('button')).find((x) => /Yay!/.test(x.textContent || ''))
  if (b) b.click()
})
await page.waitForTimeout(500)
console.log('D2 AFTER CLOSE', JSON.stringify(await page.evaluate(() => ({
  overlayGone: !document.body.innerText.includes('You made a friend!'),
  rowSara: document.body.innerText.includes('Sara'),
}))))

// E) regenerate code
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll('button')).find((x) => /New code/.test(x.textContent || ''))
  b.click()
})
await page.waitForTimeout(700)
console.log('E REGEN', JSON.stringify(await page.evaluate(() => ({
  newCode: document.body.innerText.includes('B2C3D4'),
  toast: document.body.innerText.includes('old one stopped working'),
}))))

// F) already-friend join
await page.fill('input[aria-label="Friend code"]', 'A1B2C3')
joinMode = 'already'
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll('button')).find((x) => /^Add$/.test((x.textContent || '').trim()))
  b.click()
})
await page.waitForTimeout(700)
console.log('F ALREADY', JSON.stringify(await page.evaluate(() => ({
  toast: document.body.innerText.includes('already friends'),
  noReward: !document.body.innerText.includes('You made a friend!'),
  gemsUnchanged: JSON.parse(localStorage.getItem('momomath-year2-player-v2')).state.gems === 150,
}))))

await browser.close()
