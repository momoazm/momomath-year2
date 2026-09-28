/** PLAN 144/145 — the ONE syllabus matcher, shared by
 *  scripts/audit-syllabus.mjs (bundled via esbuild) and
 *  tests/syllabusRegistry.test.ts, so the audit and the regression guard can
 *  never drift apart.
 *
 *  Verdicts (bank tier only gates the audit exit code / test):
 *   - 'ok'   : token (or a morphology variant of it) is in the subject
 *              syllabus / tolerance / stoplist — or, for German, in the
 *              English gloss sets (the units teach English translations).
 *   - 'soft' : absent from the lists but plausibly year-2 (short / common) —
 *              reported for information, never fails the build.
 *   - 'hard' : absent AND beyond the year-2 threshold (length + vowel-group
 *              rarity) — must be fixed in content (PLAN 145) or added to the
 *              syllabus / tolerance with provenance (extraction gap).
 *
 *  Morphology (both sides closed through the same transform, so two real
 *  syllabus words can never diverge):
 *   - en: query-side suffix strip (s/es/ing/ed/'s/ies), hyphen/space phrase
 *         entries tokenized into their parts.
 *   - de: suffix closure on BOTH the set entries and the query (socken ~ socke).
 *   - ar: alef normalisation (أ إ آ -> ا), ال article variants, and person/
 *         object prefix stems (أذهب ~ يذهب ~ ذهب, استمع ~ مع...) with a
 *         minimum stem length to avoid over-stripping.
 */
import type { Subject } from '../types'
import { SYLLABUS, TOLERANCE, SUBJECT_LANG } from './index'
import { ENGLISH_SYLLABUS } from './english'
import { EN_CORE } from './en-core'
import { EN_STOP, DE_STOP, AR_STOP } from './stopwords'

export type Lang = 'en' | 'de' | 'ar'
export type Verdict = 'ok' | 'soft' | 'hard'

const TOKEN_RE = /\p{L}[\p{L}\p{M}'’-]*/gu

const SUF: Record<Lang, string[]> = {
  en: ['s', 'es', 'ing', 'ed', "'s", 'ies', 'ly'],
  de: ['e', 'n', 'en', 'er', 'es', 's', 'le', 'chen', 'heit', 'ung', 'ig', 't', 'st'],
  ar: ['ات', 'ون', 'ين', 'ة', 'ها', 'هم', 'كما', 'ي', 'ان'],
}

/** Arabic person/object prefixes whose removal exposes the lexeme. */
const AR_PREFIXES = ['است', 'ا', 'أ', 'إ', 'آ', 'ي', 'ن', 'ت']
const AR_STEM_MIN = 3

export function norm(w: string, lang: Lang): string {
  let s = w.normalize('NFKC').toLowerCase().replace(/^['’-]+|['’-]+$/g, '')
  if (lang === 'ar') s = s.replace(/[\u064B-\u0652\u0640]/g, '').replace(/[أإآ]/g, 'ا')
  return s
}

export function tokenize(text: string): string[] {
  return String(text).match(TOKEN_RE) ?? []
}

/** Morphology variants of ONE word (query side and set side use the SAME
 *  closure, so matching stays symmetric). */
export function closure(w: string, lang: Lang): string[] {
  const out = new Set<string>([w])
  if (lang === 'de') {
    for (const suf of SUF.de) {
      if (w.endsWith(suf) && w.length > suf.length + 2) out.add(w.slice(0, -suf.length))
    }
  }
  if (lang === 'ar') {
    if (w.startsWith('ال') && w.length > 3) out.add(w.slice(2))
    else if (w.length > 2) out.add('ال' + w)
    for (const p of AR_PREFIXES) {
      if (w.startsWith(p)) {
        const stem = w.slice(p.length)
        if (stem.length >= AR_STEM_MIN) out.add(stem)
      }
    }
    for (const suf of SUF.ar) {
      if (w.endsWith(suf) && w.length > suf.length + 2) out.add(w.slice(0, -suf.length))
    }
  }
  return [...out]
}

function enSuffixHit(set: Set<string>, w: string): boolean {
  for (const suf of SUF.en) {
    if (w.endsWith(suf) && w.length > suf.length + 1) {
      const base = w.slice(0, -suf.length)
      if (set.has(base)) return true
      if (suf === 'ies' && set.has(base + 'y')) return true
    }
  }
  return false
}

/** Split multi-word syllabus entries into their parts as extra members. */
function phraseParts(w: string): string[] {
  return w.split(/[\s|'’-]+/).filter((p) => p.length > 1)
}

function buildSet(entries: readonly string[], lang: Lang): Set<string> {
  const set = new Set<string>()
  for (const raw of entries) {
    const w = norm(raw, lang)
    if (!w) continue
    if (lang === 'en') {
      set.add(w)
      for (const p of phraseParts(w)) set.add(p)
    } else {
      for (const v of closure(w, lang)) set.add(v)
      for (const p of phraseParts(w)) set.add(p)
    }
  }
  return set
}

function has(set: Set<string>, w: string, lang: Lang): boolean {
  if (set.has(w)) return true
  if (lang === 'de') {
    for (const v of closure(w, 'de')) if (set.has(v)) return true
    return false
  }
  if (lang === 'ar') {
    for (const v of closure(w, 'ar')) if (set.has(v)) return true
    return false
  }
  return enSuffixHit(set, w)
}

function vowelGroups(w: string): number {
  let n = 0
  let inRun = false
  for (const ch of w) {
    const v = 'aeiou'.includes(ch)
    if (v && !inRun) { n++; inRun = true } else if (!v) inRun = false
  }
  return n
}

/** Year-2 threshold: absent words longer/rarer than this are 'hard'. */
export function isHard(w: string, lang: Lang): boolean {
  if (lang === 'en') return w.length >= 9 || (w.length >= 7 && vowelGroups(w) >= 3)
  if (lang === 'de') return w.length >= 10
  return w.length >= 11 // ar
}

const STOP: Record<Lang, Set<string>> = { en: EN_STOP, de: DE_STOP, ar: AR_STOP }

/** English gloss sets allowed inside German lessons (translations the units
 *  deliberately teach) — function words + the full Year-2 English list. */
let EN_GLOSS: Set<string> | null = null
function enGloss(): Set<string> {
  if (!EN_GLOSS) EN_GLOSS = buildSet([...EN_STOP, ...ENGLISH_SYLLABUS], 'en')
  return EN_GLOSS
}

export interface SubjectMatcher {
  subject: Subject
  lang: Lang
  syllabusSize: number
  toleranceSize: number
  check(token: string): Verdict
}

export function buildMatcher(subject: Subject): SubjectMatcher {
  const lang = SUBJECT_LANG[subject]
  const syllabus = buildSet(SYLLABUS[subject], lang)
  const tol = buildSet(TOLERANCE[subject], lang)
  const stop = buildSet([...STOP[lang]], lang)
  // Shared Year-2 core reading vocabulary (all English-medium subjects).
  const core = lang === 'en' ? buildSet(EN_CORE, 'en') : null
  const check = (token: string): Verdict => {
    const w = norm(token, lang)
    if (!w || w.length < 2) return 'ok'
    if (/^\d/.test(w)) return 'ok'
    if (has(syllabus, w, lang) || has(tol, w, lang)) return 'ok'
    if (core && has(core, w, 'en')) return 'ok'
    if (has(stop, w, lang)) return 'ok'
    if (lang === 'de' && has(enGloss(), w, 'en')) return 'ok'
    return isHard(w, lang) ? 'hard' : 'soft'
  }
  return {
    subject,
    lang,
    syllabusSize: syllabus.size,
    toleranceSize: tol.size,
    check,
  }
}
