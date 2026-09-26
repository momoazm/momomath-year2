import type { LessonDef, Question } from '../content/types'

/** One beat of the pre-lesson slideshow (PLAN 90-93). Pure data — the React
 *  component only renders it, so the deck + anti-skip timer are unit-testable. */
export type Slide =
  | { kind: 'welcome'; text: string }
  | { kind: 'teach'; text: string }
  | { kind: 'example'; text: string; prompt: string; answer: string }
  | { kind: 'mission'; text: string }

/** Text spoken for a slide (the mission slide speaks its own title text). */
export function slideSpeakText(slide: Slide): string {
  return slide.text
}

/** Extract a teachable prompt→answer pair from any question kind.
 *  Returns null when the question has no sensible textual answer to show. */
export function exampleFromQuestion(q: Question): { prompt: string; answer: string } | null {
  switch (q.kind) {
    case 'mcq':
      return { prompt: q.prompt, answer: q.choices[q.answerIndex] ?? '' }
    case 'type-number':
      return { prompt: q.prompt, answer: String(q.answer) }
    case 'truefalse':
      return { prompt: q.statement, answer: q.answer ? 'True ✅' : 'False ❌' }
    case 'letter-tiles':
      return { prompt: q.prompt, answer: q.targetWord }
    case 'order':
      return { prompt: q.prompt, answer: q.items.join(' → ') }
    case 'tap-count':
      return { prompt: q.prompt, answer: `${q.target} ${q.targetEmoji}` }
    case 'speak':
      return { prompt: q.prompt, answer: q.targetText }
    case 'match':
      return { prompt: q.prompt, answer: q.pairs.map((p) => `${p.left} → ${p.right}`).join(' · ') }
  }
}

/** Anti-skip minimum read time (seconds) for a slide, scaled to its length:
 *  ~0.45s per word, clamped to 4–9s in production. Short slides still get the
 *  full 4s floor so a fast tap can never skip the teaching content.
 *  QA speed-up: if window.__FAST_SLIDES is truthy, floor drops to 0s so
 *  headless E2E test runs can advance the deck without waiting 4s×N slides. */
export function slideMinSeconds(text: string): number {
  if (typeof window !== 'undefined' && (window as unknown as { __FAST_SLIDES?: boolean }).__FAST_SLIDES) {
    return 0
  }
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(4, Math.min(9, Math.ceil(words * 0.45)))
}

/** Build the full deck: Sonic welcome → every teach line → up to 2 worked
 *  examples derived from the lesson's own questions → the mission slide. */
export function buildSlideDeck(lesson: LessonDef, seed: number, missionText: string): Slide[] {
  const teach = lesson.teach && lesson.teach.length ? lesson.teach : [lesson.intro.body]
  const deck: Slide[] = [
    { kind: 'welcome', text: `Hi! I'm Sonic! Today: ${lesson.title}.` },
    ...teach.map((text): Slide => ({ kind: 'teach', text })),
  ]

  const examples: { prompt: string; answer: string }[] = []
  try {
    const seen = new Set<string>()
    for (const q of lesson.generate(6, seed)) {
      const ex = exampleFromQuestion(q)
      if (!ex || !ex.answer || seen.has(ex.prompt)) continue
      seen.add(ex.prompt)
      examples.push(ex)
      if (examples.length >= 2) break
    }
  } catch {
    // a lesson whose generator misbehaves still gets a working slideshow
  }
  for (const ex of examples) {
    deck.push({
      kind: 'example',
      prompt: ex.prompt,
      answer: ex.answer,
      text: `${ex.prompt} The answer is ${ex.answer}.`,
    })
  }

  deck.push({ kind: 'mission', text: missionText })
  return deck
}
