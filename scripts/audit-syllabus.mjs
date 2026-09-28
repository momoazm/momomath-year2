/** PLAN 144 — Year-2 syllabus audit.
 *  Bundles the real content registry + the syllabus word lists (extracted from
 *  real books, src/content/syllabus/*), materializes every lesson's questions,
 *  and flags learner-facing vocabulary that is NOT in the subject's syllabus.
 *
 *  Tiers:
 *   - bank  : words the child must READ/CHOOSE/MATCH (mcq choices, match pairs,
 *             order items, letter-tiles target)  -> CRITICAL
 *   - text  : prompts, hints, statements, titles, teach/story lines         -> WARN
 *  Usage: node scripts/audit-syllabus.mjs [--json <outPath>] [--max <n>]
 */
import { build } from 'esbuild'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const ROOT = process.cwd()
const args = process.argv.slice(2)
const jsonOut = (() => {
  const i = args.indexOf('--json')
  return i >= 0 ? args[i + 1] : path.join(tmpdir(), 'syllabus-audit.json')
})()
const maxPrint = (() => {
  const i = args.indexOf('--max')
  return i >= 0 ? Number(args[i + 1]) : 40
})()

/* ---------------------------------------------------------------- bundle */
const entry = `
export { CURRICULA } from './registry'
export { SYLLABUS, TOLERANCE, SUBJECT_LANG } from './syllabus'
export { EN_STOP, DE_STOP, AR_STOP } from './syllabus/stopwords'
`
const dir = await mkdtemp(path.join(tmpdir(), 'syllabus-audit-'))
const outfile = path.join(dir, 'bundle.mjs')
await build({
  stdin: { contents: entry, resolveDir: path.join(ROOT, 'src', 'content'), sourcefile: 'audit-entry.ts', loader: 'ts' },
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node18',
  outfile,
  logLevel: 'silent',
})
const mod = await import(pathToFileURL(outfile).href)
const { CURRICULA, SYLLABUS, TOLERANCE, SUBJECT_LANG, EN_STOP, DE_STOP, AR_STOP } = mod

/* ------------------------------------------------------------- matching */
const STOP = { en: EN_STOP, de: DE_STOP, ar: AR_STOP }
const TOKEN_RE = /\p{L}[\p{L}\p{M}'’-]*/gu
const SUF = {
  en: ['s', 'es', 'ing', 'ed', "'s", 'ies'],
  de: ['e', 'n', 'en', 'er', 'es', 's', 'le', 'chen', 'heit', 'ung', 'ig'],
  ar: ['ات', 'ون', 'ين', 'ة', 'ها', 'هم', 'كما', 'ي', 'ان'],
}

function norm(w, lang) {
  let s = w.normalize('NFKC').toLowerCase().replace(/^['’-]+|['’-]+$/g, '')
  if (lang === 'ar') s = s.replace(/[\u064B-\u0652\u0640]/g, '')
  return s
}

function inSet(set, w, lang) {
  if (set.has(w)) return true
  if (lang === 'en') {
    for (const suf of SUF.en) {
      if (w.endsWith(suf) && w.length > suf.length + 1) {
        const base = w.slice(0, -suf.length)
        if (set.has(base)) return true
        if (suf === 'ies' && set.has(base + 'y')) return true
      }
    }
    return false
  }
  if (lang === 'de') {
    for (const suf of SUF.de) {
      if (w.endsWith(suf) && w.length > suf.length + 1 && set.has(w.slice(0, -suf.length))) return true
    }
    return false
  }
  // ar
  if (w.startsWith('ال') && set.has(w.slice(2))) return true
  if (set.has('ال' + w)) return true
  for (const suf of SUF.ar) {
    if (w.endsWith(suf) && w.length > suf.length + 1 && set.has(w.slice(0, -suf.length))) return true
  }
  return false
}

function tokenize(text) {
  return String(text).match(TOKEN_RE) ?? []
}

/* ---------------------------------------------------- question walk */
function bucket(q, bank, text) {
  switch (q.kind) {
    case 'mcq':
      bank.push(...q.choices)
      text.push(q.prompt ?? '')
      break
    case 'match':
      for (const p of q.pairs) bank.push(p.left, p.right)
      text.push(q.prompt ?? '')
      break
    case 'order':
      bank.push(...q.items)
      text.push(q.prompt ?? '')
      break
    case 'letter-tiles':
      bank.push(q.targetWord)
      text.push(q.prompt ?? '')
      break
    case 'truefalse':
      text.push(q.statement ?? '', q.prompt ?? '')
      break
    case 'speak':
      text.push(q.targetText ?? '', q.prompt ?? '')
      break
    case 'tap-count':
    case 'type-number':
    default:
      text.push(q.prompt ?? '')
      break
  }
  if (q.hint) text.push(q.hint)
  if (q.story) {
    text.push(q.story.title ?? '')
    for (const line of q.story.lines ?? []) text.push(line)
  }
}

const SEEDS = [20260927, 7]
const report = {}
let anyCritical = false

for (const subject of Object.keys(CURRICULA)) {
  const lang = SUBJECT_LANG[subject]
  const syllabus = new Set(SYLLABUS[subject].map((w) => norm(w, lang)))
  const tol = new Set(TOLERANCE[subject].map((w) => norm(w, lang)))
  const stop = STOP[lang]
  const bankFlags = new Map() // word -> {count, where}
  const textFlags = new Map()
  let lessons = 0
  let bankTokens = 0
  let textTokens = 0
  const seen = new Set()

  const flag = (map, token, where) => {
    const key = norm(token, lang)
    if (!key || key.length < 2 || stop.has(key)) return
    if (/^\d/.test(key)) return
    if (inSet(syllabus, key, lang) || inSet(tol, key, lang)) return
    const prev = map.get(key)
    if (prev) prev.count++
    else map.set(key, { count: 1, where })
  }

  for (const entry2 of Object.values(CURRICULA[subject].allLessons)) {
    const lesson = entry2.lesson
    lessons++
    for (const seed of SEEDS) {
      let qs
      try {
        qs = lesson.generate(24, seed)
      } catch (err) {
        console.error(`[gen-fail] ${subject}/${lesson.id} seed=${seed}: ${err.message}`)
        continue
      }
      for (const q of qs) {
        const bank = []
        const text = []
        bucket(q, bank, text)
        for (const phrase of bank) {
          for (const tok of tokenize(phrase)) {
            bankTokens++
            flag(bankFlags, tok, `${lesson.id}/${q.kind}`)
          }
        }
        for (const phrase of text) {
          for (const tok of tokenize(phrase)) {
            if (seen.size > 400000) break
            textTokens++
            flag(textFlags, tok, `${lesson.id}/${q.kind ?? 'story'}`)
          }
        }
      }
    }
    // lesson-level teaching text
    for (const phrase of [lesson.title, lesson.subtitle, ...(lesson.teach ?? []), lesson.intro?.body ?? '']) {
      for (const tok of tokenize(phrase)) {
        textTokens++
        flag(textFlags, tok, `${lesson.id}/teach`)
      }
    }
  }

  const bankArr = [...bankFlags.entries()].sort((a, b) => b[1].count - a[1].count)
  const textArr = [...textFlags.entries()].sort((a, b) => b[1].count - a[1].count)
  if (bankArr.length > 0) anyCritical = true
  report[subject] = {
    lessons,
    bankTokens,
    textTokens,
    bankFlaggedUnique: bankArr.length,
    textFlaggedUnique: textArr.length,
    bankFlags: bankArr.slice(0, 400).map(([w, m]) => ({ w, n: m.count, where: m.where })),
    textFlags: textArr.slice(0, 300).map(([w, m]) => ({ w, n: m.count, where: m.where })),
  }

  console.log(`\n=== ${subject.toUpperCase()} (lang=${lang}, lessons=${lessons}, syllabus=${syllabus.size}) ===`)
  console.log(`  bank tokens=${bankTokens}  FLAGGED unique=${bankArr.length}  |  text tokens=${textTokens} flagged unique=${textArr.length}`)
  console.log(`  top bank flags: ${bankArr.slice(0, 25).map(([w, m]) => `${w}(${m.count})`).join(', ') || '—'}`)
  console.log(`  top text flags: ${textArr.slice(0, 15).map(([w, m]) => `${w}(${m.count})`).join(', ') || '—'}`)
}

await writeFile(jsonOut, JSON.stringify(report, null, 2), 'utf8')
console.log(`\nJSON report -> ${jsonOut}`)
process.exit(anyCritical ? 1 : 0)
