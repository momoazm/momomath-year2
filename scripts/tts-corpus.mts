/* Phase 36 (user request 2026-10-17) — build-time corpus of every string the
 * app can speak, per voice profile. Single source of truth for the clip
 * generator (scripts/generate-tts.mts) and the coverage test. NOT shipped to
 * the browser: it imports the full content tree (all years), which the runtime
 * bundle must never pull in.
 *
 * Coverage map (every speak*() call site):
 *   - QuestionView / LessonScreen / BattleScreen / AudioBar -> q.audioText,
 *     q.targetText (kind 'speak') for every lesson x year x seed below.
 *   - LessonSlideshow -> buildSlideDeck() per lesson (deterministic:
 *     seed = hashString(lesson.id), mission text = intro.title).
 *   - BookScreen read-along -> every book page text + focus word (narrator).
 *   - FriendsScreen speaks a per-user friend code (dynamic) -> intentionally
 *     not covered; the runtime falls back to Web Speech for it.
 */

import { CURRICULA } from '../src/content/registry'
import { QUESTIONS_PER_LESSON } from '../src/content/curriculum'
import { BOOKS_BY_ID } from '../src/content/english/books'
import { buildSlideDeck, slideSpeakText } from '../src/engine/slideshow'
import { segmentByScript, ttsLangFor } from '../src/engine/tts'
import { hashString } from '../src/content/rng'
import { normalizeSpeechText, type TtsProfile } from '../src/engine/ttsPremium'
import type { Subject } from '../src/content/types'

export interface SpeakableItem {
  profile: TtsProfile
  lang: string
  text: string
  /** Index into the seed list of the seed that FIRST produced this string;
   *  undefined for seed-independent items (slides, books). Used by the stats
   *  mode to prove the question banks saturate: any item whose index lands in
   *  the hashed batch is a string the consecutive seeds never produced. */
  seedIdx?: number
}

/** Consecutive seeds cover every replay/attempt up to 300; the hashed batch
 *  stands in for the unbounded runtime seeds (attempt counters, hashString()
 *  derived battle/sprint/check-up/unit-activity/follow-up seeds). The question
 *  banks saturate long before either set — see scripts/generate-tts.mts
 *  --stats saturation report. */
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

  for (const year of [1, 2, 3, 4] as const) {
    const bySubject = CURRICULA[year]
    for (const subject of Object.keys(bySubject) as Subject[]) {
      const cur = bySubject[subject] ?? CURRICULA[2].math
      const baseLang = ttsLangFor(subject)
      for (const { lesson } of Object.values(cur.allLessons)) {
        for (let si = 0; si < seeds.length; si++) {
          try {
            for (const q of lesson.generate(QUESTIONS_PER_LESSON, seeds[si])) {
              const anyQ = q as unknown as Record<string, unknown>
              if (typeof anyQ.audioText === 'string') add('narrator', anyQ.audioText, baseLang, si)
              if (q.kind === 'speak' && typeof anyQ.targetText === 'string')
                add('narrator', anyQ.targetText, baseLang, si)
            }
          } catch {
            /* a misbehaving generator must not kill the corpus */
          }
        }
        try {
          const deck = buildSlideDeck(lesson, hashString(lesson.id), lesson.intro.title)
          for (const slide of deck) add('sonic', slideSpeakText(slide), baseLang)
        } catch {
          /* same */
        }
      }
    }
  }

  // Read-along storybooks (English unit books + classic stories, narrator profile).
  for (const book of Object.values(BOOKS_BY_ID)) {
    for (const page of book.pages) {
      add('narrator', page.text, 'en-GB')
      if (page.focus) add('narrator', page.focus, 'en-GB')
    }
  }

  return [...items.values()]
}
