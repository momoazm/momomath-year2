import type { LessonDef, Question } from './types'
import { hashString, mulberry32, type Rand } from './rng'

export type Gen = (rand: Rand) => Question

const DUP_REROLL_LIMIT = 8

/** Semantic fingerprint of a question: ignores shuffle order (choice order,
 *  match pair order, order items) so re-rolls catch true duplicates only. */
export function questionFingerprint(q: Question): string {
  const story =
    'story' in q && q.story ? '|s:' + q.story.title + ':' + q.story.lines.join(' ') : ''
  switch (q.kind) {
    case 'mcq': {
      const answer = q.choices[q.answerIndex] ?? ''
      const sorted = [...q.choices].sort()
      return 'mcq:' + q.prompt + '|' + answer + '|' + sorted.join('~') + story
    }
    case 'type-number':
      return 'num:' + q.prompt + '|' + q.answer + story
    case 'match': {
      const sorted = q.pairs.map((p) => p.left + '>' + p.right).sort()
      return 'match:' + q.prompt + '|' + sorted.join('~') + story
    }
    case 'order': {
      const sorted = [...q.items].sort()
      return 'order:' + q.prompt + '|' + sorted.join('~') + story
    }
    case 'tap-count': {
      const sorted = [...q.cells].sort()
      return 'tap:' + q.prompt + '|' + q.targetEmoji + '|' + q.target + '|' + sorted.join('~')
    }
    case 'letter-tiles':
      return 'tiles:' + q.prompt + '|' + q.targetWord
    case 'truefalse':
      return 'tf:' + q.prompt + '|' + q.statement + '|' + q.answer + story
    case 'speak':
      return 'speak:' + q.prompt + '|' + q.targetText + story
  }
}

/** Shared generator contract: deterministic per (lessonId, seed), last question
 *  uses the challenge generator, and questions are deduplicated by semantic
 *  fingerprint (re-roll up to DUP_REROLL_LIMIT times from the same rand stream). */
export function makeLesson(
  id: string,
  title: string,
  objectiveCodes: string[],
  mascotId: LessonDef['intro']['mascotId'],
  introTitle: string,
  introBody: string,
  gens: Gen[],
  challenge?: Gen,
): LessonDef {
  return {
    id,
    title,
    objectiveCodes,
    intro: { mascotId, title: introTitle, body: introBody },
    generate(n, seed) {
      const rand = mulberry32(hashString(id) ^ (seed * 2654435761))
      const seen = new Set<string>()
      const tryDraw = (gen: Gen): Question | null => {
        for (let attempt = 0; attempt <= DUP_REROLL_LIMIT; attempt++) {
          const q = gen(rand)
          const fp = questionFingerprint(q)
          if (!seen.has(fp)) return q
        }
        return null
      }
      const draw = (slot: number): Question => {
        // Prefer the slot's own generator; on exhaustion walk sibling gens
        // so multi-gen lessons still fill unique slots from their total pool.
        for (let offset = 0; offset < gens.length; offset++) {
          const q = tryDraw(gens[(slot + offset) % gens.length])
          if (q) {
            seen.add(questionFingerprint(q))
            return q
          }
        }
        // Total pool exhausted: accept the collision (never infinite-loop).
        const fallback = gens[slot % gens.length](rand)
        seen.add(questionFingerprint(fallback))
        return fallback
      }
      const out: Question[] = []
      for (let i = 0; i < n - 1; i++) out.push(draw(i))
      // Final slot: prefer the challenge generator, then walk siblings the same
      // way draw() does so an exhausted challenge pool never accepts a dupe.
      const preferred = challenge ?? gens[(n - 1) % gens.length]
      const finalQ =
        tryDraw(preferred) ??
        (() => {
          for (const gen of gens) {
            const q = tryDraw(gen)
            if (q) return q
          }
          return preferred(rand)
        })()
      seen.add(questionFingerprint(finalQ))
      out.push(finalQ)
      return out
    },
  }
}
