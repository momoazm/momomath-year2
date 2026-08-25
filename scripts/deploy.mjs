// Momo Year 2 Cambridge - one-shot deploy with retry-until-clean verification.
// Usage: node scripts/deploy.mjs
// Steps: build (with base flag) -> publish gh-pages -> verify live bundle matches dist.
// Exits 0 only when the live site is verified in sync. Retries transient failures.

import { execSync, spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const BASE = '/momomath-year2/'
const LIVE_URL = 'https://momoazm.github.io/momomath-year2/'
const MUST_CONTAIN = ['apps.googleusercontent.com', 'Momo Year 2 Cambridge']

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const log = (...a) => console.log(`[${new Date().toISOString().slice(11, 19)}]`, ...a)

function run(cmd, { retries = 3, waitMs = 15000 } = {}) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      execSync(cmd, { cwd: ROOT, stdio: 'inherit', shell: true })
      return
    } catch (err) {
      log(`STEP FAILED (attempt ${attempt}/${retries}): ${cmd}`)
      if (attempt === retries) {
        console.error(`FATAL: step kept failing: ${cmd}`)
        process.exit(1)
      }
      log(`retrying in ${waitMs / 1000}s...`)
      sleepSync(waitMs)
    }
  }
}

function sleepSync(ms) {
  spawnSync('node', ['-e', `setTimeout(() => {}, ${ms})`], { stdio: 'ignore' })
}

function localAsset() {
  const html = readFileSync(join(ROOT, 'dist', 'index.html'), 'utf8')
  return /assets\/index-[^"]+\.js/.exec(html)?.[0]
}

async function liveAsset() {
  const res = await fetch(`${LIVE_URL}?cb=${Date.now()}`, { headers: { Pragma: 'no-cache' } })
  const html = await res.text()
  return /assets\/index-[^"]+\.js/.exec(html)?.[0]
}

async function liveBundleContains(asset, needle) {
  const res = await fetch(`${LIVE_URL}${asset}?cb=${Date.now()}`)
  const js = await res.text()
  return js.includes(needle)
}

// 1. Build
log('building (tsc + vite, base=' + BASE + ')...')
run('npm run build -- --base=' + BASE, { retries: 3, waitMs: 10000 })
const asset = localAsset()
if (!asset) {
  console.error('FATAL: no JS asset found in dist/index.html')
  process.exit(1)
}
log('built', asset)

// 2. Publish gh-pages
log('publishing to gh-pages...')
run('npx --yes gh-pages -d dist -m "Deploy ' + asset + '"', { retries: 5, waitMs: 20000 })

// 3. Verify live (retry loop until in sync or timeout ~6 min)
const deadline = Date.now() + 6 * 60 * 1000
let inSync = false
while (Date.now() < deadline) {
  await sleep(30000)
  try {
    const live = await liveAsset()
    log(`live=${live || 'none'} dist=${asset}`)
    if (live === asset) {
      let allMarkers = true
      for (const needle of MUST_CONTAIN) {
        if (!(await liveBundleContains(asset, needle))) {
          log(`marker missing on live bundle: ${needle}`)
          allMarkers = false
        }
      }
      if (allMarkers) {
        inSync = true
        break
      }
    }
  } catch (err) {
    log('verify error, will retry:', String(err).slice(0, 120))
  }
}

if (!inSync) {
  console.error('FATAL: live site never matched dist within timeout')
  process.exit(1)
}

log(`VERIFIED: ${LIVE_URL} is live, in sync, and contains all required markers.`)
