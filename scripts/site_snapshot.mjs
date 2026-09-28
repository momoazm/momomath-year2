// Momo rule (user-mandated 2026-09-28): the site that is LIVE must be archived
// LOCALLY before a new one is published, so a bad deploy is a one-command undo.
// Rolling window: the oldest archive is deleted when the newest one is taken.
//
//   node scripts/site_snapshot.mjs save   [--reason text]   (deploy.mjs does this)
//   node scripts/site_snapshot.mjs list
//   node scripts/site_snapshot.mjs restore [--name <dir>] [--publish]
//   node scripts/site_snapshot.mjs prune
//
// Env overrides: SITE_URL, DIST_DIR, SNAPSHOT_DIR, SNAPSHOT_KEEP (default 2).
// To reuse in another site repo: copy this file and edit CONFIG below.
import { execSync } from 'node:child_process'
import {
  cpSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync,
} from 'node:fs'
import { homedir } from 'node:os'
import { basename, dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const CONFIG = {
  repo: basename(ROOT),
  siteUrl: process.env.SITE_URL || 'https://momoazm.github.io/momomath-year2/',
  distDir: process.env.DIST_DIR || join(ROOT, 'dist'),
  storeRoot: process.env.SNAPSHOT_DIR || join(homedir(), 'site_snapshots'),
  keep: Math.max(1, Number(process.env.SNAPSHOT_KEEP || 2)),
}
const STORE = join(CONFIG.storeRoot, CONFIG.repo)

const log = (...a) => console.log(`[snapshot ${new Date().toISOString().slice(11, 19)}]`, ...a)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const git = (cmd) => {
  try {
    return execSync(`git ${cmd}`, { cwd: ROOT, encoding: 'utf8', shell: true }).trim()
  } catch {
    return 'unknown'
  }
}
const assetOf = (html) => /assets\/[A-Za-z0-9_.-]+\.js/.exec(html)?.[0] ?? null
const stamp = () => new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)

function snapshots() {
  if (!existsSync(STORE)) return []
  return readdirSync(STORE)
    .filter((d) => existsSync(join(STORE, d, 'meta.json')))
    .sort()
    .reverse()
}

/** Delete archives outside the rolling window (newest CONFIG.keep survive). */
function prune(quiet = false) {
  const all = snapshots()
  const doomed = all.slice(CONFIG.keep)
  for (const d of doomed) {
    rmSync(join(STORE, d), { recursive: true, force: true })
    if (!quiet) log(`pruned ${d} (outside rolling window of ${CONFIG.keep})`)
  }
  if (!quiet && !doomed.length) log(`nothing to prune (${all.length} stored, window ${CONFIG.keep})`)
  return doomed
}

async function fetchText(url, tries = 4) {
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch(url, { headers: { Pragma: 'no-cache', 'Cache-Control': 'no-cache' } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.text()
    } catch (err) {
      if (i === tries) throw err
      await sleep(2000 * i)
    }
  }
  return null
}

/** Absolute URL for a src/href value found in the live HTML. */
function resolveRef(ref, siteUrl) {
  if (!ref || /^(data|blob|javascript):/i.test(ref)) return null
  try {
    const u = new URL(ref, siteUrl)
    if (u.origin !== new URL(siteUrl).origin) return null
    return u
  } catch {
    return null
  }
}

async function fetchBuf(url, tries = 4) {
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch(url, { headers: { Pragma: 'no-cache', 'Cache-Control': 'no-cache' } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return Buffer.from(await res.arrayBuffer())
    } catch (err) {
      if (i === tries) throw err
      await sleep(2000 * i)
    }
  }
  return null
}

/** Download the whole live site (HTML + every same-origin asset it references). */
async function captureLive(siteUrl) {
  const base = new URL(siteUrl).pathname
  const html = await fetchText(`${siteUrl}?cb=${Date.now()}`)
  const refs = new Set()
  for (const m of html.matchAll(/(?:src|href)=(?:"([^"]+)"|'([^']+)')/g)) {
    const u = resolveRef(m[1] ?? m[2], siteUrl)
    if (u) refs.add(u.pathname.slice(base.length).replace(/^\/+/, ''))
  }
  // PWA extras that are only referenced from JS/JSON, never from the HTML.
  for (const extra of ['sw.js', 'registerSW.js', 'manifest.webmanifest', 'manifest.json']) refs.add(extra)

  const files = [{ path: 'index.html', buf: Buffer.from(html, 'utf8') }]
  const missing = []
  for (const p of [...refs].sort()) {
    if (!p || p.includes('..')) continue
    try {
      files.push({ path: p, buf: await fetchBuf(new URL(p, siteUrl).href) })
    } catch (err) {
      if (/^(sw\.js|registerSW\.js|manifest\.(webmanifest|json))$/.test(p)) continue
      missing.push(`${p} (${String(err).slice(0, 60)})`)
    }
  }
  // Manifest icons — their src is relative to the manifest, not the page.
  for (const mf of files.filter((f) => /manifest\.(webmanifest|json)$/.test(f.path))) {
    try {
      const j = JSON.parse(mf.buf.toString('utf8'))
      for (const icon of j.icons ?? []) {
        const u = resolveRef(icon.src, new URL(mf.path, siteUrl).href)
        if (!u) continue
        const p = u.pathname.slice(base.length).replace(/^\/+/, '')
        if (!p || files.some((f) => f.path === p)) continue
        try {
          files.push({ path: p, buf: await fetchBuf(u.href) })
        } catch { /* an icon is not worth losing the snapshot over */ }
      }
    } catch { /* not JSON */ }
  }
  return { files, missing, asset: assetOf(html) }
}

/** Authoritative full-tree capture: the deployed gh-pages branch itself
 *  (an HTTP crawl would miss assets the app loads lazily at runtime). */
function captureGhPages(siteDir) {
  execSync('git fetch -q origin gh-pages', { cwd: ROOT, shell: true })
  const wt = join(STORE, `_wt_${stamp()}`)
  rmSync(wt, { recursive: true, force: true })
  execSync(`git worktree add --detach --quiet "${wt}" FETCH_HEAD`, { cwd: ROOT, shell: true })
  try {
    mkdirSync(siteDir, { recursive: true })
    for (const e of readdirSync(wt, { withFileTypes: true })) {
      if (e.name === '.git') continue
      cpSync(join(wt, e.name), join(siteDir, e.name), { recursive: true, force: true })
    }
  } finally {
    execSync(`git worktree remove --force "${wt}"`, { cwd: ROOT, shell: true })
    rmSync(wt, { recursive: true, force: true })
  }
  return readFileSync(join(siteDir, 'index.html'), 'utf8')
}

function readdirRecursive(root) {
  const out = []
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name)
      if (e.isDirectory()) walk(p)
      else out.push(relative(root, p).split(sep).join('/'))
    }
  }
  walk(root)
  return out
}

async function save(reason) {
  const tmp = join(STORE, `_saving_${stamp()}`)
  const siteDir = join(tmp, 'site')
  mkdirSync(siteDir, { recursive: true })

  const distIndex = join(CONFIG.distDir, 'index.html')
  const distAsset = existsSync(distIndex) ? assetOf(readFileSync(distIndex, 'utf8')) : null
  const liveHtml = await fetchText(`${CONFIG.siteUrl}?cb=${Date.now()}`).catch(() => null)
  const liveAsset = liveHtml ? assetOf(liveHtml) : null

  let source, asset, missing = []
  try {
    if (liveAsset && distAsset === liveAsset) {
      // Best case: the local build IS the live one - copy it, no network needed.
      source = 'local dist (same hashed bundle as live)'
      asset = distAsset
      cpSync(CONFIG.distDir, siteDir, { recursive: true, force: true })
    } else {
      // Otherwise take what is actually deployed: the gh-pages branch has the
      // whole tree, including assets the app only requests at runtime.
      let ok = false
      try {
        asset = assetOf(captureGhPages(siteDir))
        if (!asset) throw new Error('gh-pages index.html references no bundle')
        source = 'deployed gh-pages branch'
        ok = true
        if (liveAsset && liveAsset !== asset)
          log(`note: gh-pages holds ${asset}, live edge still serves ${liveAsset} (Pages propagating)`)
      } catch (ghErr) {
        log(`gh-pages capture failed (${String(ghErr).slice(0, 70)}); falling back to an HTTP crawl`)
        rmSync(siteDir, { recursive: true, force: true })
        mkdirSync(siteDir, { recursive: true })
      }
      if (!ok && liveHtml) {
        const cap = await captureLive(CONFIG.siteUrl)
        asset = cap.asset
        missing = cap.missing
        if (!asset) throw new Error('live HTML references no JS asset')
        source = 'HTTP crawl of live site (lazily loaded files not included)'
        for (const f of cap.files) {
          const dest = join(siteDir, f.path)
          mkdirSync(dirname(dest), { recursive: true })
          writeFileSync(dest, f.buf)
        }
        ok = true
      }
      if (!ok && distAsset) {
        source = 'local dist (live site unreachable)'
        asset = distAsset
        cpSync(CONFIG.distDir, siteDir, { recursive: true, force: true })
        ok = true
      }
      if (!ok) throw new Error('nothing to archive: gh-pages, the live site and local dist/ all unavailable')
    }
    if (missing.length) throw new Error(`incomplete capture:\n  ${missing.join('\n  ')}`)

    const files = readdirRecursive(siteDir)
    const bytes = files.reduce((n, f) => n + statSync(join(siteDir, f)).size, 0)
    writeFileSync(join(tmp, 'meta.json'), JSON.stringify({
      takenAt: new Date().toISOString(), reason: reason || 'manual', repo: CONFIG.repo,
      siteUrl: CONFIG.siteUrl, asset, source, commit: git('rev-parse --short HEAD'),
      branch: git('rev-parse --abbrev-ref HEAD'), dirty: !!git('status --porcelain'),
      liveAssetAtCapture: liveAsset, distAssetAtCapture: distAsset, files: files.length, bytes,
    }, null, 2), 'utf8')

    const name = `${stamp()}_${git('rev-parse --short HEAD')}_${asset.replace(/\.js$/, '').replace(/^assets\//, '')}`
    const dir = join(STORE, name)
    rmSync(dir, { recursive: true, force: true })
    renameSync(tmp, dir)
    log(`STORED ${name} — ${files.length} files, ${(bytes / 1048576).toFixed(1)} MB (asset ${asset})`)
    log(`  archive : ${dir}`)
    log(`  rollback: node scripts/site_snapshot.mjs restore --name ${name} --publish`)
    prune()
    return name
  } catch (err) {
    rmSync(tmp, { recursive: true, force: true })
    console.error(`FATAL: no snapshot taken — refusing to deploy blind. ${String(err).slice(0, 300)}`)
    process.exit(1)
  }
}


function readMeta(name) {
  return JSON.parse(readFileSync(join(STORE, name, 'meta.json'), 'utf8'))
}

function list() {
  const all = snapshots()
  if (!all.length) return log(`no snapshots yet in ${STORE}`)
  log(`${all.length} archive(s) in ${STORE} (window keeps the newest ${CONFIG.keep}):`)
  for (const d of all) {
    const m = readMeta(d)
    log(`  ${d}  ${(m.bytes / 1048576).toFixed(1)} MB  ${m.files} files  ${m.reason}  [${m.asset}]`)
  }
}

async function restore(opts) {
  const all = snapshots()
  const name = opts.name ?? all[0]
  if (!name || !existsSync(join(STORE, name))) {
    console.error(`FATAL: snapshot "${name ?? '(none)'}" not found in ${STORE}`)
    process.exit(1)
  }
  const meta = readMeta(name)
  const src = join(STORE, name, 'site')
  if (opts.clean && existsSync(CONFIG.distDir)) rmSync(CONFIG.distDir, { recursive: true, force: true })
  cpSync(src, CONFIG.distDir, { recursive: true, force: true })
  log(`restored ${name} (${meta.files} files, asset ${meta.asset}) into ${CONFIG.distDir}`)
  log(`  it was live as of ${meta.takenAt} (commit ${meta.commit}, source: ${meta.source})`)
  log(`  preview: npm run preview  →  http://localhost:3200/`)
  if (!opts.publish) {
    log('  NOT published. Re-run with --publish to ship this archive back to GitHub Pages.')
    return
  }
  log(`publishing rollback ${meta.asset} to gh-pages...`)
  execSync(`npx --yes gh-pages -d dist -m "Rollback to ${meta.asset} (snapshot ${name})"`,
    { cwd: ROOT, stdio: 'inherit', shell: true })
  const deadline = Date.now() + 6 * 60 * 1000
  while (Date.now() < deadline) {
    await sleep(30000)
    const live = assetOf(await fetchText(`${CONFIG.siteUrl}?cb=${Date.now()}`).catch(() => ''))
    log(`live=${live ?? 'none'} want=${meta.asset}`)
    if (live === meta.asset) {
      log(`VERIFIED ROLLBACK: ${CONFIG.siteUrl} serves ${meta.asset} again.`)
      return
    }
  }
  console.error('FATAL: rollback never went live within timeout')
  process.exit(1)
}

const argv = process.argv.slice(2)
const cmd = argv[0] ?? 'list'
const flag = (n) => argv.includes(`--${n}`)
const val = (n) => {
  const i = argv.indexOf(`--${n}`)
  return i >= 0 ? argv[i + 1] : undefined
}

if (cmd === 'save') await save(val('reason'))
else if (cmd === 'list') list()
else if (cmd === 'prune') prune()
else if (cmd === 'restore') await restore({ name: val('name'), publish: flag('publish'), clean: flag('clean') })
else {
  console.log(`usage:
  node scripts/site_snapshot.mjs save [--reason text]
  node scripts/site_snapshot.mjs list
  node scripts/site_snapshot.mjs restore [--name <archive>] [--clean] [--publish]
  node scripts/site_snapshot.mjs prune
  env: SITE_URL, DIST_DIR, SNAPSHOT_DIR, SNAPSHOT_KEEP=${CONFIG.keep}`)
  process.exit(cmd === 'help' ? 0 : 1)
}

