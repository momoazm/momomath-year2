/* Build-time corpus of every string the app can speak, per voice profile.
 * ADAPTED for momomath-year2 main (subject-keyed CURRICULA; no books/slideshow
 * — those are tts-branch-only features). Single source of truth for the clip
 * generator (scripts/generate-tts.mts) and the coverage stats. NOT shipped to
 * the browser: it imports the full content tree, which the runtime bundle must
 * never pull in.
 *
 * Coverage map (every speak*() call site on THIS main):
 *   - LessonScreen speaks q.audioText (question audio) + the AudioBar replay /
 *     slow-replay for every lesson x subject x seed below. It is the ONLY
 *     speak() call site, so audioText is the complete speakable surface.
 *   - (No slideshow decks, no read-along books, no battle speech on this main.)
 *   - FriendsScreen speaks a per-user friend code (dynamic) -> intentionally
 *     not covered; the runtime falls back to Web Speech for it.
 */

import { CURRICULA } from '../src/content/registry'
import { QUESTIONS_PER_LESSON } from '../src/content/curriculum'
import { segmentByScript, ttsLangFor } from '../src/engine/tts'
import { hashString } from '../src/content/rng'
import { normalizeSpeechText, type TtsProfile } from '../src/engine/ttsPremium'
import type { Subject } from '../src/content/types'

export interface SpeakableItem {
  profile: TtsProfile
  lang: string
  text: string
  /** Index into the seed list of the seed that FIRST produced this string;
   *  undefined for seed-independent items. Used by the stats mode to prove the
   *  question banks saturate: any item whose index lands in the hashed batch is
   *  a string the consecutive seeds never produced. */
  seedIdx?: number
}

/** Consecutive seeds cover every replay/attempt up to 300; the hashed batch
 *  stands in for the unbounded runtime seeds (attempt counters, hashString()
 *  derived check-up/follow-up seeds). The question banks saturate long before
 *  either set — see scripts/generate-tts.mts --stats saturation report. */
export const BASE_SEEDS: readonly number[] = Array.from({ length: 300 }, (_, i) => i)
export const HASHED_SEEDS: readonly number[] = Array.from({ length: 600 }, (_, i) =>
  hashString(`tts-corpus-${i}`),
)

function looksSpeakable(text: string): boolean {
  return /[\p{L}\p{N}]/u.test(text)
}

export function enumerateSpeakable(
  opts: { extraSeeds?: boolean; seeds?: readonly number[] } = {},
): SpeakableItem[] {
  const seeds =
    opts.seeds ?? (opts.extraSeeds === false ? BASE_SEEDS : [...BASE_SEEDS, ...HASHED_SEEDS])
  const items = new Map<string, SpeakableItem>()
  const add = (profile: TtsProfile, raw: string, baseLang: string, seedIdx?: number) => {
    if (!raw || !raw.trim()) return
    for (const run of segmentByScript(raw)) {
      const lang = run.script === 'arabic' ? 'ar-EG' : baseLang
      const text = normalizeSpeechText(run.text)
      if (!text || !looksSpeakable(text)) continue
      const dedupe = `${profile}|${lang}|${text}`
      if (!items.has(dedupe)) items.set(dedupe, { profile, lang, text, seedIdx })
    }
  }

  for (const subject of Object.keys(CURRICULA) as Subject[]) {
    const cur = CURRICULA[subject]
    const baseLang = ttsLangFor(subject)
    for (const { lesson } of Object.values(cur.allLessons)) {
      for (let si = 0; si < seeds.length; si++) {
        try {
          for (const q of lesson.generate(QUESTIONS_PER_LESSON, seeds[si])) {
            const anyQ = q as unknown as Record<string, unknown>
            // LessonScreen speaks q.audioText — the only spoken field on this main.
            if (typeof anyQ.audioText === 'string') add('narrator', anyQ.audioText, baseLang, si)
          }
        } catch {
          /* a misbehaving generator must not kill the corpus */
        }
      }
    }
  }

  return [...items.values()]
}
