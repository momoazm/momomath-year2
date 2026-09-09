/** Hook that wires the BKT engine into the existing lesson loop. The screen
 *  calls `recordFirstAttempt` exactly once per question (after grading the
 *  first attempt), and we handle timing, mastery update, attempt log, and
 *  optional LLM explanation behind the scenes. */

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ADAPTIVE_CONFIG,
  buildAttemptEntry,
  classifyMistake,
  fetchExplanation,
  recordAttempt,
  snapshotQuestion,
  templateExplain,
  withUpdatedDifficulty,
  type MistakeAnalysis,
  type AdaptiveSnapshot,
} from './index'
import type { AttemptLogEntry, Difficulty } from './types'
import type { Question } from '../../content/types'
import { usePlayer } from '../store'

export interface UseAdaptiveLessonArgs {
  lessonId: string
  objectiveCode: string
  difficulty: Difficulty
  question: Question | undefined
  studentAnswer: string
  correctAnswer: string
  /** Display prompt (falls back to question.prompt when omitted). */
  prompt?: string
  correct: boolean
  isFirstAttempt: boolean
  enabled: boolean
}

export function useAdaptiveLesson(): AdaptiveLessonResult & {
  recordFirstAttempt: (a: UseAdaptiveLessonArgs) => AttemptLogEntry | null
  snapshot: AdaptiveSnapshot
} {
  const player = usePlayer()
  const snap = player.adaptive.snapshot
  const [lastMistake, setLastMistake] = useState<MistakeAnalysis | null>(null)
  const [explanation, setExplanation] = useState<string | null>(null)
  const [explanationIsLlm, setExplanationIsLlm] = useState(false)
  const lastFetchedKey = useRef<string | null>(null)
  const questionShownAt = useRef<number>(Date.now())

  useEffect(() => {
    questionShownAt.current = Date.now()
  }, [])

  const recordFirstAttempt = useCallback(
    (a: UseAdaptiveLessonArgs) => {
      if (!a.enabled || !a.isFirstAttempt || !a.question) return null
      const responseTimeMs = Date.now() - questionShownAt.current
      const r = recordAttempt(
        snap,
        a.objectiveCode,
        a.correct,
        a.question.kind,
        responseTimeMs,
        Date.now(),
      )
      const skill = r.snap.skills[a.objectiveCode]!
      const updatedSkill = withUpdatedDifficulty(skill)
      const nextSnap: AdaptiveSnapshot = {
        ...r.snap,
        skills: { ...r.snap.skills, [a.objectiveCode]: updatedSkill },
      }
      const entry = buildAttemptEntry({
        lessonId: a.lessonId,
        objectiveCode: a.objectiveCode,
        kind: a.question.kind,
        difficulty: a.difficulty,
        answer: a.studentAnswer,
        correct: a.correct,
        responseTimeMs,
        masteryBefore: r.before,
        masteryAfter: r.after,
        reason: 'in-lesson',
        prompt: a.prompt ?? '',
        correctAnswer: a.correctAnswer,
        // Keep the exact question ONLY when it was missed — that's what
        // powers "retry your tricky ones". Correct ones stay lightweight.
        q: !a.correct && a.question ? snapshotQuestion(a.question) : null,
      })
      if (!a.correct) {
        const m = classifyMistake(a.question, a.studentAnswer, a.correctAnswer)
        setLastMistake(m)
        const recentAccPct = Math.round(
          (skill.recent.filter((b) => b).length / Math.max(1, skill.recent.length)) * 100,
        )
        const cacheKey = `${a.lessonId}|${a.objectiveCode}|${a.studentAnswer}|${a.correctAnswer}`
        if (lastFetchedKey.current !== cacheKey) {
          lastFetchedKey.current = cacheKey
          fetchExplanation({
            prompt: a.question.prompt,
            studentAnswer: a.studentAnswer,
            correctAnswer: a.correctAnswer,
            objectiveCode: a.objectiveCode,
            recentAccuracyPct: recentAccPct,
            ageBand: ADAPTIVE_CONFIG.AGE_BAND,
          })
            .then((out) => {
              setExplanation(out.text)
              setExplanationIsLlm(out.source === 'llm')
              player.bumpLlm({
                hit: out.source === 'llm',
                provider: out.provider ?? null,
                latencyMs: null,
              })
            })
            .catch(() => {
              const t = templateExplain({
                prompt: a.question!.prompt,
                studentAnswer: a.studentAnswer,
                correctAnswer: a.correctAnswer,
                objectiveCode: a.objectiveCode,
                recentAccuracyPct: recentAccPct,
                ageBand: ADAPTIVE_CONFIG.AGE_BAND,
                cacheKey: 'fallback',
              })
              setExplanation(t.text)
              setExplanationIsLlm(false)
            })
        }
      } else {
        setLastMistake(null)
        setExplanation(null)
      }
      player.recordAdaptiveAttempt(entry)
      void nextSnap
      return entry
    },
    [player, snap],
  )

  const reset = useCallback(() => {
    setLastMistake(null)
    setExplanation(null)
    setExplanationIsLlm(false)
    lastFetchedKey.current = null
  }, [])

  return { lastMistake, explanation, explanationIsLlm, reset, recordFirstAttempt, snapshot: snap }
}


export interface AdaptiveLessonResult {
  lastMistake: MistakeAnalysis | null
  explanation: string | null
  explanationIsLlm: boolean
  reset: () => void
}
