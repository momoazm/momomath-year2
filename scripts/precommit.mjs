#!/usr/bin/env node
// Pre-commit safety net for momomath-year2.
// Catches the two failure modes I hit this session:
//   1) a file being committed with most of its lines deleted in one go
//      (the "I zeroed LeaguesScreen.tsx" mistake).
//   2) duplicate `it(...)` titles in any test file (the "duplicate tests that
//      silently pass" mistake).
// Also runs `tsc -b` so a type break never lands in main.
//
// Usage: `npm run verify`  (wired into .husky/pre-commit if husky is set up,
// or call directly: `node scripts/precommit.mjs`)

import { execSync, spawnSync } from 'node:child_process'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const FAIL_THRESHOLD_PCT = 50 // file must not lose more than 50% of its lines in one commit

function run(cmd, opts = {}) {
  return execSync(cmd, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', ...opts })
}

let failed = false
const errors = []
const warnings = []

// --- 1. TypeScript must compile ---
console.log('[precommit] tsc -b ...')
try {
  run('npx tsc -b', { stdio: 'inherit' })
  console.log('[precommit] tsc OK')
} catch (e) {
  errors.push('tsc failed; fix type errors before committing')
  failed = true
}

// --- 2. No file should lose > 50% of its lines vs HEAD~1 ---
// IMPORTANT: this checks ABSOLUTE line count, not just the net diff of the
// commit, otherwise a clean dedup (22 - 22) would falsely read as "lost 100%".
console.log('[precommit] checking for catastrophic file shrinkages ...')
try {
  const diff = run('git diff --name-only HEAD~1..HEAD', { stdio: ['ignore', 'pipe', 'pipe'] })
  for (const file of diff.split('\n').filter(Boolean)) {
    let prevLines = 0
    try {
      const prev = run(`git show HEAD~1:${JSON.stringify(file)}`, { stdio: ['ignore', 'pipe', 'pipe'] })
      prevLines = prev.split('\n').length
    } catch {
      // file didn't exist in HEAD~1 -> new file, skip
      continue
    }
    if (prevLines < 20) continue // too small to matter
    const cur = readFileSync(join(ROOT, file), 'utf8')
    const curLines = cur.split('\n').length
    const pctLost = ((prevLines - curLines) / prevLines) * 100
    if (pctLost > FAIL_THRESHOLD_PCT) {
      errors.push(
        `file ${file} shrank from ${prevLines} to ${curLines} lines (${pctLost.toFixed(0)}% loss) in this commit; aborting`,
      )
      failed = true
    }
  }
} catch (e) {
  warnings.push('could not compute diff stats against HEAD~1 (probably first commit); skipped shrinkage check')
}

// --- 3. No duplicate `it(...)` titles in tests/ ---
console.log('[precommit] scanning tests/ for duplicate it() titles ...')
function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git') continue
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) out.push(...walk(full))
    else if (full.endsWith('.test.ts') || full.endsWith('.test.tsx')) out.push(full)
  }
  return out
}
const seen = new Map() // title -> [file,line]
let dupes = 0
for (const f of walk(join(ROOT, 'tests'))) {
  const lines = readFileSync(f, 'utf8').split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    const m = /^\s*(?:it|test)\(\s*['"]([^'"]+)['"]/.exec(lines[i])
    if (!m) continue
    const title = m[1]
    if (!seen.has(title)) seen.set(title, [])
    seen.get(title).push(`${relative(ROOT, f)}:${i + 1}`)
  }
}
for (const [title, locs] of seen) {
  if (locs.length > 1) {
    errors.push(`duplicate test title "${title}" at ${locs.join(', ')}`)
    dupes++
    failed = true
  }
}
if (dupes === 0) console.log('[precommit] no duplicate it() titles')

// --- Summary ---
if (warnings.length) for (const w of warnings) console.warn('[precommit] WARN:', w)
if (failed) {
  console.error('\n[precommit] FAILED:')
  for (const e of errors) console.error('  -', e)
  process.exit(1)
}
console.log('[precommit] OK')
