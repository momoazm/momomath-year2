import type {
  LessonDef,
  MatchQuestion,
  McqQuestion,
  OrderQuestion,
  Question,
  StoryPanel,
  TrueFalseQuestion,
  UnitDef,
} from '../types'
import { hashString, mulberry32, pick, randInt, shuffle, type Rand } from '../rng'

export { hashString, mulberry32, pick, randInt, shuffle }
export type { Rand }

/** Common noun -> emoji picture bank for Picture Pick exercises.
 *  Every entry must be an unambiguous, kid-friendly pairing. */
export const PICTURE_BANK = {
  cat: '🐱', dog: '🐶', sun: '☀️', moon: '🌙', star: '⭐', tree: '🌳',
  flower: '🌸', fish: '🐟', bird: '🐦', frog: '🐸', duck: '🦆', horse: '🐴',
  cow: '🐮', pig: '🐷', sheep: '🐑', mouse: '🐭', rabbit: '🐰', bear: '🐻',
  lion: '🦁', monkey: '🐵', elephant: '🐘', snake: '🐍', bee: '🐝',
  butterfly: '🦋', snail: '🐌', ant: '🐜', spider: '🕷️', apple: '🍎',
  banana: '🍌', grape: '🍇', strawberry: '🍓', carrot: '🥕', bread: '🍞',
  cheese: '🧀', cake: '🍰', milk: '🥛', juice: '🧃', water: '💧',
  ball: '⚽', kite: '🪁', book: '📖', pencil: '✏️', chair: '🪑', bed: '🛏️',
  door: '🚪', window: '🪟', car: '🚗', bus: '🚌', train: '🚂', boat: '⛵',
  plane: '✈️', rocket: '🚀', bike: '🚲', hat: '🎩', shoe: '👟', sock: '🧦',
  coat: '🧥', crown: '👑', key: '🔑', clock: '🕒', lamp: '💡', phone: '📞',
  rain: '🌧️', snow: '❄️', cloud: '☁️', wind: '🌬️', storm: '⛈️',
  rainbow: '🌈', fire: '🔥', leaf: '🍃', mushroom: '🍄', stone: '🪨',
  shell: '🐚', egg: '🥚', nest: '🪹', worm: '🪱', fox: '🦊', owl: '🦉',
  wolf: '🐺', goat: '🐐', cherry: '🍒', peach: '🍑', corn: '🌽',
  tomato: '🍅', potato: '🥔', onion: '🧅', sweet: '🍬', cakeSlice: '🍰',
  hand: '✋', foot: '🦶', eye: '👁️', ear: '👂', nose: '👃', mouth: '👄',
  house: '🏠', school: '🏫', shop: '🏪', castle: '🏰', bridge: '🌉',
  road: '🛣️', mountain: '⛰️', island: '🏝️', beach: '🏖️', garden: '🏡',
} as const

export type PictureWord = keyof typeof PICTURE_BANK

/** Shuffled MCQ with a guaranteed-correct answerIndex. */
export function mcqE(
  rand: Rand,
  prompt: string,
  answer: string,
  distractors: string[],
  extra?: Partial<McqQuestion>,
): McqQuestion {
  const unique: string[] = []
  for (const d of distractors) {
    if (d !== answer && !unique.includes(d)) unique.push(d)
    if (unique.length === 3) break
  }
  const choices = shuffle(rand, [answer, ...unique])
  return { kind: 'mcq', prompt, choices, answerIndex: choices.indexOf(answer), ...extra }
}

/** MCQ whose answer position is explicit (no reshuffle). */
export function mcqFixed(
  prompt: string,
  choices: string[],
  answerIndex: number,
  extra?: Partial<McqQuestion>,
): McqQuestion {
  return { kind: 'mcq', prompt, choices, answerIndex, ...extra }
}

/** Tap-the-pairs exercise. Stored pair order is shuffled so the items come out
 *  fresh on every attempt; the renderer additionally de-aligns the two columns. */
export function matchQ(
  rand: Rand,
  prompt: string,
  pairs: { left: string; right: string }[],
  extra?: Partial<MatchQuestion>,
): MatchQuestion {
  return { kind: 'match', prompt, pairs: shuffle(rand, pairs), ...extra }
}

/** Word-bank sentence builder / sequencing exercise (`items` in CORRECT order). */
export function orderQ(
  prompt: string,
  items: string[],
  extra?: Partial<OrderQuestion>,
): OrderQuestion {
  return { kind: 'order', prompt, items, ...extra }
}

/** Spell-the-word letter tiles. Single lowercase words only. */
export function tilesQ(
  prompt: string,
  targetWord: string,
  hint?: string,
): { kind: 'letter-tiles'; prompt: string; targetWord: string; hint?: string } {
  return { kind: 'letter-tiles', prompt, targetWord: targetWord.toLowerCase(), hint }
}

/** True/False comprehension card. */
export function tfQ(
  prompt: string,
  statement: string,
  answer: boolean,
  extra?: Partial<TrueFalseQuestion>,
): TrueFalseQuestion {
  return { kind: 'truefalse', prompt, statement, answer, ...extra }
}

/** Read-aloud line. */
export function speakQ(
  prompt: string,
  targetText: string,
  extra?: { story?: StoryPanel; hint?: string },
): { kind: 'speak'; prompt: string; targetText: string; story?: StoryPanel; hint?: string } {
  return { kind: 'speak', prompt, targetText, ...extra }
}

/** Audio sentence for listening exercises (played via TTS). */
export function say(text: string): { audioText: string } {
  return { audioText: text }
}

/** Story panel shown above Story Time questions. */
export function story(title: string, scene: string[], lines: string[]): StoryPanel {
  return { title, scene, lines }
}

/** Pick n distinct members of pool, excluding `exclude`. Pool must be big enough. */
export function pickOthers<T>(rand: Rand, pool: readonly T[], exclude: T, n: number): T[] {
  const out: T[] = []
  let guard = 0
  while (out.length < n && guard < pool.length * 10) {
    const c = pick(rand, pool)
    if (c !== exclude && !out.includes(c)) out.push(c)
    guard++
  }
  return out
}

export type Gen = (rand: Rand) => Question

export const Q_PER_LESSON = 10

/** Same generator contract as the math curriculum: deterministic per (lessonId, seed),
 *  last question uses the challenge generator. */
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
      const out: Question[] = []
      for (let i = 0; i < n - 1; i++) out.push(gens[i % gens.length](rand))
      const finalGen = challenge ?? gens[(n - 1) % gens.length]
      out.push(finalGen(rand))
      return out
    },
  }
}

export function unitDef(
  id: string,
  order: number,
  title: string,
  subtitle: string,
  color: string,
  icon: string,
  lessons: LessonDef[],
): UnitDef {
  const bossId = `${id}boss`
  return {
    id,
    order,
    title,
    subtitle,
    color,
    icon,
    lessons,
    bossLessonIds: lessons.some((l) => l.id === bossId) ? [bossId] : [],
  }
}
