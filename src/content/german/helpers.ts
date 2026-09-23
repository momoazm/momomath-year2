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

/** German picture bank: unambiguous, kid-friendly word → emoji pairings.
 *  Includes Felix & Franzi regulars (Frosch, Ente, Briefkasten). */
export const PICTURE_BANK = {
  frosch: '🐸', ente: '🦆', briefkasten: '📮',
  katze: '🐱', hund: '🐶', sonne: '☀️', mond: '🌙', stern: '⭐', baum: '🌳',
  blume: '🌸', fisch: '🐟', vogel: '🐦', pferd: '🐴', kuh: '🐮',
  schwein: '🐷', schaf: '🐑', maus: '🐭', hase: '🐰', bär: '🐻',
  löwe: '🦁', affe: '🐵', elefant: '🐘', bienen: '🐝', apfel: '🍎',
  banane: '🍌', traube: '🍇', erdbeere: '🍓', brot: '🍞', käse: '🧀',
  kuchen: '🍰', milch: '🥛', saft: '🧃', wasser: '💧',
  ball: '⚽', drachen: '🪁', buch: '📖', stift: '✏️', stuhl: '🪑',
  bett: '🛏️', tür: '🚪', auto: '🚗', bus: '🚌', zug: '🚂',
  schiff: '⛵', flugzeug: '✈️', fahrrad: '🚲', hut: '🎩', schuh: '👟',
  socke: '🧦', mantel: '🧥', krone: '👑', schlüssel: '🔑', uhr: '🕒',
  lampe: '💡', regen: '🌧️', schnee: '❄️', wolke: '☁️', wind: '🌬️',
  regenbogen: '🌈', feuer: '🔥', blatt: '🍃', pilz: '🍄', fuchs: '🦊',
  eule: '🦉', ziege: '🐐', kirsche: '🍒', hand: '✋', fuß: '🦶',
  auge: '👁️', ohr: '👂', nase: '👃', mund: '👄',
  haus: '🏠', schule: '🏫', schloss: '🏰', straße: '🛣️', berg: '⛰️',
  strand: '🏖️', garten: '🏡', kopf: '🗣️', bein: '🦵', brille: '👓',
  hose: '👖', hemd: '👔', jacke: '🧥', teller: '🍽️', tasse: '☕',
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

/** Tap-the-pairs exercise. */
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

/** Spell-the-word letter tiles. German lowercase incl. ä ö ü ß. */
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

/** Read-aloud line (German target, de-DE voice picked by LessonScreen). */
export function speakQ(
  prompt: string,
  targetText: string,
  extra?: { story?: StoryPanel; hint?: string },
): { kind: 'speak'; prompt: string; targetText: string; story?: StoryPanel; hint?: string } {
  return { kind: 'speak', prompt, targetText, ...extra }
}

/** Audio sentence for listening exercises (played via de-DE TTS). */
export function say(text: string): { audioText: string } {
  return { audioText: text }
}

/* ------- Duolingo-style EN ⇄ DE two-way drills -------------------- */
/** German ⇄ English gloss entry for bidirectional drills. */
export interface DeEnEntry {
  de: string
  en: string
}

/** DE → EN: “What does “müde” mean?” German audio, English choices. */
export function mcqDeToEn(
  rand: Rand,
  entries: readonly DeEnEntry[],
  extra?: Partial<McqQuestion>,
): McqQuestion {
  const item = pick(rand, entries)
  const others = entries.filter((e) => e.en !== item.en).map((e) => e.en)
  return mcqE(rand, `What does “${item.de}” mean?`, item.en, others, {
    ...say(item.de),
    ...extra,
  })
}

/** EN → DE: “How do you say “tired” in German?” No audio — the prompt is
 *  English and the German-track voice (de-DE) would mispronounce it. */
export function mcqEnToDe(
  rand: Rand,
  entries: readonly DeEnEntry[],
  extra?: Partial<McqQuestion>,
): McqQuestion {
  const item = pick(rand, entries)
  const others = entries.filter((e) => e.de !== item.de).map((e) => e.de)
  return mcqE(rand, `How do you say “${item.en}” in German?`, item.de, others, {
    hint: 'Say it aloud, then tap!',
    ...extra,
  })
}

/** Tap-the-pairs German ↔ English text — both directions in one card. */
export function matchDeEn(
  rand: Rand,
  entries: readonly DeEnEntry[],
  prompt = 'Match German to English',
): MatchQuestion {
  const pairs = shuffle(
    rand,
    entries.map((e) => ({ left: e.de, right: e.en })),
  ).slice(0, 4)
  return matchQ(rand, prompt, pairs, {
    hint: 'DE ⇄ EN — both directions count!',
  })
}

/** Word-bank builder EN → DE (“translate this sentence”). No audio: the
 *  source is English but German-track TTS speaks de-DE. */
export function buildDe(
  enSentence: string,
  deTokens: string[],
  extra?: Partial<OrderQuestion>,
): OrderQuestion {
  return orderQ(`Build in German: “${enSentence}”`, deTokens, {
    hint: 'Tap the words in order — capital letters matter!',
    ...extra,
  })
}

/** Word-bank builder DE → EN with German listening attached. */
export function buildEn(
  deSentence: string,
  enTokens: string[],
  extra?: Partial<OrderQuestion>,
): OrderQuestion {
  return orderQ(`Build in English: “${deSentence}”`, enTokens, {
    ...say(deSentence),
    ...extra,
  })
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

export { makeLesson } from '../makeLesson'

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
