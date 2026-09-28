/** PLAN 144/145 — Year-2 syllabus audit.
 *  Bundles the real content registry + the shared matcher
 *  (src/content/syllabus/match.ts), materializes every lesson's questions, and
 *  classifies learner-facing vocabulary:
 *
 *   - bank  : words the child must READ/CHOOSE/MATCH (mcq choices, match pairs,
 *             order items, letter-tiles target)
 *   - text  : prompts, hints, statements, titles, teach/story lines
 *
 *  Verdicts per token (see match.ts): ok (in syllabus/tolerance/stoplist or an
 *  allowed variant) / soft (absent but plausibly year-2: reported only) / hard
 *  (absent AND beyond the year-2 threshold -> gates the exit code; fix in
 *  content under PLAN 145 or add to the syllabus with provenance).
 *
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
export { buildMatcher } from './syllabus/match'
export { SUBJECT_LANG } from './syllabus'
export { eachGeneratedQuestion, bucketQuestion } from './syllabus/walk'
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
const { CURRICULA, buildMatcher, SUBJECT_LANG, eachGeneratedQuestion, bucketQuestion } = mod

/* ---------------------------------------------------- question walk */

const unitOf = (lessonId) => lessonId.replace(/l\d+.*$/, '')

const report = {}
let anyHard = false

// PLAN 163 — the registry is year-keyed; this audit walks Year 2 (the full
// subject set). A --year flag for the other years arrives with PLAN 168.
const YEAR2 = CURRICULA[2]

for (const subject of Object.keys(YEAR2)) {
  const matcher = buildMatcher(subject)
  const lang = SUBJECT_LANG[subject]
  const hardBank = new Map() // word -> {count, where}
  const softBank = new Map()
  const hardText = new Map()
  const softText = new Map()
  const hardByUnit = new Map()
  let bankTokens = 0
  let textTokens = 0

  const bump = (map, key, where) => {
    const prev = map.get(key)
    if (prev) prev.count++
    else map.set(key, { count: 1, where })
  }
  const classify = (which, token, where) => {
    const v = matcher.check(token)
    if (v === 'ok') return
    const key = token.toLowerCase()
    if (which === 'bank') bump(v === 'hard' ? hardBank : softBank, key, where)
    else bump(v === 'hard' ? hardText : softText, key, where)
    if (v === 'hard' && which === 'bank') {
      const u = unitOf(where.split('/')[0])
      hardByUnit.set(u, (hardByUnit.get(u) ?? 0) + 1)
    }
  }

  // shared walk (same seeds + bucketing as tests/syllabusRegistry.test.ts)
  const lessons = eachGeneratedQuestion(YEAR2, subject, (lesson, q) => {
    const { bank, text } = bucketQuestion(q)
    for (const phrase of bank) {
      for (const tok of String(phrase).match(/\p{L}[\p{L}\p{M}'’-]*/gu) ?? []) {
        bankTokens++
        classify('bank', tok, `${lesson.id}/${q.kind}`)
      }
    }
    for (const phrase of text) {
      for (const tok of String(phrase).match(/\p{L}[\p{L}\p{M}'’-]*/gu) ?? []) {
        if (textTokens > 400000) break
        textTokens++
        classify('text', tok, `${lesson.id}/${q.kind ?? 'story'}`)
      }
    }
  })

  // lesson-level teaching text (once per lesson)
  for (const entry2 of Object.values(YEAR2[subject].allLessons)) {
    const lesson = entry2.lesson
    for (const phrase of [lesson.title, lesson.subtitle, ...(lesson.teach ?? []), lesson.intro?.body ?? '']) {
      for (const tok of String(phrase).match(/\p{L}[\p{L}\p{M}'’-]*/gu) ?? []) {
        textTokens++
        classify('text', tok, `${lesson.id}/teach`)
      }
    }
  }

  const sorted = (m) => [...m.entries()].sort((a, b) => b[1].count - a[1].count)
  const hardArr = sorted(hardBank)
  const softArr = sorted(softBank)
  const textHardArr = sorted(hardText)
  if (hardArr.length > 0) anyHard = true
  report[subject] = {
    lessons,
    lang,
    syllabusSize: matcher.syllabusSize,
    bankTokens,
    textTokens,
    hardUnique: hardArr.length,
    softUnique: softArr.length,
    textHardUnique: textHardArr.length,
    hardByUnit: Object.fromEntries([...hardByUnit.entries()].sort((a, b) => b[1] - a[1])),
    hard: hardArr.slice(0, 500).map(([w, m]) => ({ w, n: m.count, where: m.where })),
    soft: softArr.slice(0, 200).map(([w, m]) => ({ w, n: m.count, where: m.where })),
    textHard: textHardArr.slice(0, 200).map(([w, m]) => ({ w, n: m.count, where: m.where })),
  }

  console.log(`\n=== ${subject.toUpperCase()} (lang=${lang}, lessons=${lessons}, syllabus=${matcher.syllabusSize}) ===`)
  console.log(`  bank tokens=${bankTokens}  HARD unique=${hardArr.length}  soft unique=${softArr.length}  |  text: hard=${textHardArr.length} soft=${softText.size}`)
  console.log(`  top HARD: ${hardArr.slice(0, 25).map(([w, m]) => `${w}(${m.count})`).join(', ') || '—'}`)
  console.log(`  top soft: ${softArr.slice(0, 12).map(([w, m]) => `${w}(${m.count})`).join(', ') || '—'}`)
  if (hardByUnit.size) {
    console.log(`  hard by unit: ${[...hardByUnit.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([u, n]) => `${u}=${n}`).join(', ')}`)
  }
}

await writeFile(jsonOut, JSON.stringify(report, null, 2), 'utf8')
console.log(`\nJSON report -> ${jsonOut}`)
console.log(anyHard ? 'RESULT: HARD flags present -> exit 1' : 'RESULT: clean -> exit 0')
process.exit(anyHard ? 1 : 0)
