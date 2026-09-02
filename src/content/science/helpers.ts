import type {
  LessonDef,
  MatchQuestion,
  McqQuestion,
  OrderQuestion,
  Question,
  SpeakQuestion,
  TrueFalseQuestion,
  UnitDef,
} from '../types'
import { hashString, mulberry32, pick, randInt, shuffle, type Rand } from '../rng'

export { hashString, mulberry32, pick, randInt, shuffle, type Rand }

export type Gen = (rand: Rand) => Question
export const Q_PER_LESSON = 10

/** Seeds questions the same way the math curriculum does, so the engine treats
 *  science lessons identically: deterministic per (lessonId, attempt). */
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
    id, order, title, subtitle, color, icon, lessons,
    bossLessonIds: lessons.some((l) => l.id === bossId) ? [bossId] : [],
  }
}

/* ---- question builders (identical contract to the English helpers) ---- */
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

export function mcqFixed(
  prompt: string,
  choices: string[],
  answerIndex: number,
  extra?: Partial<McqQuestion>,
): McqQuestion {
  return { kind: 'mcq', prompt, choices, answerIndex, ...extra }
}

export function matchQ(
  rand: Rand,
  prompt: string,
  pairs: { left: string; right: string }[],
  extra?: Partial<MatchQuestion>,
): MatchQuestion {
  return { kind: 'match', prompt, pairs: shuffle(rand, pairs), ...extra }
}

export function orderQ(prompt: string, items: string[], extra?: Partial<OrderQuestion>): OrderQuestion {
  return { kind: 'order', prompt, items, ...extra }
}

export function tfQ(prompt: string, statement: string, answer: boolean, extra?: Partial<TrueFalseQuestion>): TrueFalseQuestion {
  return { kind: 'truefalse', prompt, statement, answer, ...extra }
}

export function speakQ(prompt: string, targetText: string, extra?: { hint?: string }): SpeakQuestion {
  return { kind: 'speak', prompt, targetText, ...extra }
}

export function say(text: string): { audioText: string } {
  return { audioText: text }
}

/** Pick n distinct members of a pool, excluding `exclude`. */
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

/* ------------------------------------------------------------------------- */
/*                         Science data banks (emoji)                        */
/* ------------------------------------------------------------------------- */

/** Living things grouped by broad class — used for sort/match questions. */
export const LIVING_BANK = {
  // mammals
  elephant: '🐘', lion: '🦁', tiger: '🐅', bear: '🐻', zebra: '🦓',
  giraffe: '🦒', monkey: '🐒', bat: '🦇', whale: '🐋', dolphin: '🐬',
  dog: '🐶', cat: '🐱', horse: '🐴', cow: '🐮', pig: '🐷', sheep: '🐑',
  // birds
  eagle: '🦅', penguin: '🐧', owl: '🦉', parrot: '🦜', duck: '🦆',
  // fish / sea / land
  fish: '🐟', shark: '🦈', turtle: '🐢', frog: '🐸',
  // insects / bugs
  butterfly: '🦋', bee: '🐝', spider: '🕷️', worm: '🪱', ant: '🐜',
  // humans
  child: '🧒', baby: '👶',
} as const

export type LivingKind = keyof typeof LIVING_BANK

export enum LivingClass {
  Mammal = 'mammal',
  Bird = 'bird',
  Fish = 'fish',
  ReptileAmph = 'reptile / amphibian',
  Insect = 'insect',
  Human = 'human',
}

/** Which living-class each animal belongs to. */
export const LIVING_CLASS: Record<string, LivingClass> = {
  elephant: LivingClass.Mammal, lion: LivingClass.Mammal, tiger: LivingClass.Mammal,
  bear: LivingClass.Mammal, zebra: LivingClass.Mammal, giraffe: LivingClass.Mammal,
  monkey: LivingClass.Mammal, bat: LivingClass.Mammal, whale: LivingClass.Mammal,
  dolphin: LivingClass.Mammal, dog: LivingClass.Mammal, cat: LivingClass.Mammal,
  horse: LivingClass.Mammal, cow: LivingClass.Mammal, pig: LivingClass.Mammal,
  sheep: LivingClass.Mammal,
  eagle: LivingClass.Bird, penguin: LivingClass.Bird, owl: LivingClass.Bird,
  parrot: LivingClass.Bird, duck: LivingClass.Bird,
  fish: LivingClass.Fish, shark: LivingClass.Fish,
  turtle: LivingClass.ReptileAmph, frog: LivingClass.ReptileAmph,
  butterfly: LivingClass.Insect, bee: LivingClass.Insect, spider: LivingClass.Insect,
  worm: LivingClass.Insect, ant: LivingClass.Insect,
  child: LivingClass.Human, baby: LivingClass.Human,
}

/** Habitats & where animals naturally live (emoji describes the home). */
export const HABITAT_BANK: Record<string, string> = {
  elephant: '🌵', lion: '☀️', tiger: '🌴', bear: '🌲', zebra: '🌾',
  giraffe: '🌳', monkey: '🌴', bat: '🕳️', whale: '🌊', dolphin: '🌊',
  eagle: '⛰️', penguin: '❄️', owl: '🌲', parrot: '🌴', duck: '🦆',
  fish: '🌊', shark: '🌊', turtle: '🏖️', frog: 'pond',
  butterfly: '🌸', bee: '🌻', spider: '🕸️', worm: 'soil', ant: '🐜',
}

/** Materials we meet every day, with a representative emoji. */
export const MATERIAL_BANK: Record<string, string> = {
  wood: '🪵', stone: '🪨', brick: '🧱', glass: '🪟', metal: '🔩',
  plastic: '🥤', fabric: '👕', paper: '📄', rubber: '🏀',
  water: '💧', ice: '🧊',
}
export const MATERIALS = Object.keys(MATERIAL_BANK)

/** A property of a material. */
export const PROPERTY_BANK: Record<string, string> = {
  hard: 'hard', soft: 'soft', rough: 'rough', smooth: 'smooth',
  bendy: 'bendable', stiff: 'stiff', heavy: 'heavy', light: 'lightweight',
  shiny: 'shiny', dull: 'dull', stretchy: 'stretchy', warm: 'warm',
}
export type PropertyWord = keyof typeof PROPERTY_BANK

/** Pairs of material -> one property it has (the answer pool). */
export const MATERIAL_PROPERTY: Record<string, PropertyWord> = {
  wood: 'hard', stone: 'hard', brick: 'hard', glass: 'hard', metal: 'hard',
  plastic: 'soft', fabric: 'soft', paper: 'soft', rubber: 'soft',
  water: 'wet', ice: 'cold',
}

/** Rock types found on Earth. */
export const ROCK_TYPES = ['igneous', 'sedimentary', 'metamorphic'] as const

/** A few simple reversible / irreversible change examples. */
export const MATERIAL_CHANGES: { item: string; result: string; kind: 'reversible' | 'irreversible' }[] = [
  { item: 'melting ice cube', result: 'water', kind: 'reversible' },
  { item: 'freezing juice', result: 'ice pop', kind: 'reversible' },
  { item: 'bending a paperclip', result: 'bent paperclip', kind: 'reversible' },
  { item: 'crumpling paper', result: 'crumpled ball', kind: 'reversible' },
  { item: 'breaking a twig', result: 'two short pieces', kind: 'irreversible' },
  { item: 'burning paper', result: 'ash and smoke', kind: 'irreversible' },
  { item: 'mixing milk and juice', result: 'chocolatey drink', kind: 'irreversible' },
]

/** Light sources / darkness situations. */
export const LIGHT_SOURCES = ['☀️', '💡', '🔥', '⭐', '⚡'] as const

/** Circuit components we teach at Stage 2. */
export const CIRCUIT_PARTS = ['cell battery', 'wire', 'lamp', 'switch'] as const

/** Safety dos and don'ts around electricity. */
export const SOCKET_DONTS = [
  'put a plug in the wall socket',
  'pour water near a plug socket',
  'touch a plug with wet hands',
  'stick objects into a socket',
]
export const SOCKET_DOES = [
  'switch off appliances when not in use',
  'tell an adult before plugging anything in',
  'keep sockets dry',
  'use only things grown-ups give you',
]

/** Tools for non-standard measurement. */
export const TOOLS = ['blocks', 'paper clips', 'hand spans', 'foot steps', 'string'] as const

/** Seasons. */
export const SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const

/** Life-cycle stages we can sequence. */
export const LIFE_STAGES = ['baby', 'toddler', 'child', 'adult'] as const
export const ANIMAL_LIFE_CYCLES: Record<string, string[]> = {
  butterfly: ['egg', 'caterpillar', 'chrysalis', 'butterfly'],
  frog: ['egg', 'tadpole', 'tadpole with legs', 'froglet', 'frog'],
  plant: ['seed', 'sprout', 'plant with leaves', 'flower', 'seed'],
}

export function emojiPair(word: string): string {
  return `${LIVING_BANK[word as LivingKind] ?? MATERIAL_BANK[word] ?? word} ${word}`
}

