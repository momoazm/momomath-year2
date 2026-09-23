/** Shared speak-question ASR grading helpers (LessonScreen + tests). */

/** Normalise a transcript/target into comparable words.
 *  Unicode-aware so Arabic and German umlauts survive. */
export function normWords(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s']/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

/** Fraction of target words present anywhere in the transcript (order-free). */
export function wordMatchScore(said: string[], target: string[]): number {
  if (!target.length) return 0
  let hits = 0
  for (const w of target) if (said.includes(w)) hits++
  return hits / target.length
}

/** Forgiving pass threshold for Year-2 read-aloud. */
export const SPEAK_PASS_SCORE = 0.6

export function gradeSpeak(transcript: string, targetText: string): {
  transcript: string
  score: number
  ok: boolean
} {
  const score = wordMatchScore(normWords(transcript), normWords(targetText))
  return { transcript: transcript.trim(), score, ok: score >= SPEAK_PASS_SCORE }
}
