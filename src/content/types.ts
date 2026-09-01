export type Expression = 'happy' | 'excited' | 'sad' | 'thinking' | 'cheer'

/** Which curriculum the app is currently showing. */
export type Subject = 'math' | 'english' | 'science'

export interface MascotProps {
  expression?: Expression
  className?: string
}

/** Illustration shown above a question during Story Time lessons. */
export interface StoryPanel {
  title: string
  /** emoji cast for this beat */
  scene: string[]
  /** narration lines revealed so far */
  lines: string[]
}

/** Text spoken aloud via TTS; presence triggers the audio bar UI. */
export type WithAudio = { audioText?: string }

export type QuestionKind =
  | 'mcq'
  | 'type-number'
  | 'match'
  | 'order'
  | 'tap-count'
  | 'letter-tiles'
  | 'truefalse'
  | 'speak'

export interface McqQuestion extends WithAudio {
  kind: 'mcq'
  prompt: string
  visual?: VisualSpec
  choices: string[]
  answerIndex: number
  hint?: string
  story?: StoryPanel
}

export interface TypeNumberQuestion {
  kind: 'type-number'
  prompt: string
  visual?: VisualSpec
  answer: number
  hint?: string
}

export interface MatchQuestion extends WithAudio {
  kind: 'match'
  prompt: string
  visual?: VisualSpec
  pairs: { left: string; right: string }[]
  hint?: string
}

export interface OrderQuestion extends WithAudio {
  kind: 'order'
  prompt: string
  visual?: VisualSpec
  items: string[]
  hint?: string
  story?: StoryPanel
}

/** items in `order` are the CORRECT order; player sees them shuffled */
/** Player taps every cell matching `emoji`; correct iff tapped set == targets */
export interface TapCountQuestion {
  kind: 'tap-count'
  prompt: string
  visual?: VisualSpec
  target: number
  targetEmoji: string
  cells: string[]
  hint?: string
}

/** Player taps letter tiles in order to spell `targetWord`. */
export interface LetterTilesQuestion {
  kind: 'letter-tiles'
  prompt: string
  /** the correct spelling; renderer shuffles its letters */
  targetWord: string
  visual?: VisualSpec
  hint?: string
}

/** True/False comprehension card (used inside stories). */
export interface TrueFalseQuestion {
  kind: 'truefalse'
  prompt: string
  statement: string
  answer: boolean
  visual?: VisualSpec
  hint?: string
  story?: StoryPanel
}

/** Read-aloud line; forgiving ASR or self-check when speech recognition is unavailable. */
export interface SpeakQuestion {
  kind: 'speak'
  prompt: string
  targetText: string
  visual?: VisualSpec
  hint?: string
  story?: StoryPanel
}

export type Question =
  | McqQuestion
  | TypeNumberQuestion
  | MatchQuestion
  | OrderQuestion
  | TapCountQuestion
  | LetterTilesQuestion
  | TrueFalseQuestion
  | SpeakQuestion

export type VisualSpec =
  | { type: 'emoji-group'; emojis: string[] }
  | { type: 'ten-frames'; count: number }
  | { type: 'number-line'; from: number; to: number; mark: number }
  | { type: 'shapes'; shape: string; count: number }
  | { type: 'fraction'; slices: number; filled: number }
  | { type: 'clock'; hour: number; minute: number }

export interface IntroCard {
  mascotId: MascotId
  title: string
  body: string
}

export type MascotId =
  | 'sonic'
  | 'tails'
  | 'knuckles'
  | 'amy'
  | 'shadow'
  | 'silver'
  | 'metal'
  | 'cream'
  | 'blaze'
  | 'rouge'
  | 'eggman'

export interface LessonDef {
  id: string
  title: string
  objectiveCodes: string[]
  intro: IntroCard
  /** returns n questions, deterministic for (lessonId, attemptSeed) */
  generate: (n: number, seed: number) => Question[]
}

export interface UnitDef {
  id: string
  order: number
  title: string
  subtitle: string
  color: string
  icon: string
  lessons: LessonDef[]
  bossLessonIds: string[]
}

export const questionEmojiBank = [
  '🍎', '⭐', '🎈', '🚗', '🐝', '🍪', '🐟', '🌻', '🧩', '⚽',
]
