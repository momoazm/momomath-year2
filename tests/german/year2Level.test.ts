import { describe, expect, it } from 'vitest'
import { Q_PER_LESSON } from '../../src/content/german/helpers'
import { UNIT_G5 } from '../../src/content/german/g05'
import { UNIT_G6 } from '../../src/content/german/g06'
import { UNIT_G10 } from '../../src/content/german/g10'
import type { UnitDef } from '../../src/content/types'

/** Year-2 (Cambridge, age 6–7) level guard for the flagged hard spots.
 *  No question in these units may contain grammar/vocab beyond pre-A1:
 *  - dative preposition phrases (auf dem Stuhl, in dem Zimmer, am Himmel…)
 *  - ordinal number words (erste/zweite/dritte/vierte)
 *  - untaught cultural trivia (Nikolaus, Sunday shops, country codes)
 *  - gender/meta-grammar analysis (masculine, neuter, der/die/das theory) */
const BANNED = [
  /auf dem /, /in dem /, /unter dem /, /in der /, /am Himmel/,
  /\b(erste|zweite|dritte|vierte)\b/,
  /Nikolaus|country code|shops are closed/i,
  /masculine|neuter|feminine|der, die, das/,
]

function allQuestions(unit: UnitDef) {
  const qs = []
  for (const lesson of unit.lessons) {
    for (let seed = 1; seed <= 12; seed++) qs.push(...lesson.generate(Q_PER_LESSON, seed))
  }
  return qs
}

describe('German Year-2 level guard', () => {
  for (const unit of [UNIT_G5, UNIT_G6, UNIT_G10]) {
    it(`${unit.id} · ${unit.title} stays within Year-2 level (seeds 1-12)`, () => {
      for (const q of allQuestions(unit)) {
        const json = JSON.stringify(q)
        for (const banned of BANNED) {
          expect(json, `question matched ${banned} → ${json.slice(0, 160)}`).not.toMatch(banned)
        }
      }
    })
  }
})
