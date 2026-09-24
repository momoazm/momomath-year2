import type { Question, UnitDef } from '../types'
import {
  buildDe,
  buildEn,
  makeLesson,
  matchDeEn,
  matchQ,
  mcqDeToEn,
  mcqEnToDe,
  mcqE,
  mcqFixed,
  orderQ,
  pick,
  say,
  shuffle,
  tilesQ,
  unitDef,
  type Rand,
} from './helpers'

const NUMBERS = [
  { de: 'eins', en: 'one', n: 1 }, { de: 'zwei', en: 'two', n: 2 }, { de: 'drei', en: 'three', n: 3 },
  { de: 'vier', en: 'four', n: 4 }, { de: 'fünf', en: 'five', n: 5 }, { de: 'sechs', en: 'six', n: 6 },
  { de: 'sieben', en: 'seven', n: 7 }, { de: 'acht', en: 'eight', n: 8 }, { de: 'neun', en: 'nine', n: 9 },
  { de: 'zehn', en: 'ten', n: 10 }, { de: 'elf', en: 'eleven', n: 11 }, { de: 'zwölf', en: 'twelve', n: 12 },
]

function gNumberMatch(rand: Rand): Question {
  const pairs = shuffle(rand, NUMBERS.map((x) => ({ left: x.de, right: String(x.n) }))).slice(0, 4)
  return matchQ(rand, 'Match the number word to its digit', pairs)
}

function gHearNumber(rand: Rand): Question {
  const item = pick(rand, NUMBERS)
  const others = NUMBERS.filter((x) => x.de !== item.de).map((x) => x.de)
  return mcqE(rand, 'Tap the number you hear', item.de, others, say(item.de))
}

function gCountEmojis(rand: Rand): Question {
  const item = pick(rand, NUMBERS.slice(0, 10))
  const emojis = ['🍎', '⭐', '🎈', '🐝', '🍪', '🐟', '🌻', '⚽', '🧩', '🚗']
  const emoji = pick(rand, emojis)
  const shown = Array.from({ length: item.n }, () => emoji)
  const near = NUMBERS.filter((x) => x.n !== item.n).slice(0, 3).map((x) => x.de)
  return mcqE(rand, 'Wie viele siehst du? Count!', item.de, near, {
    visual: { type: 'emoji-group', emojis: shown },
    ...say(`Wie viele? ${item.de}`),
  })
}

function gOrderNumbers(rand: Rand): Question {
  const start = pick(rand, [NUMBERS.slice(0, 5), NUMBERS.slice(3, 8), NUMBERS.slice(5, 10)])
  const words = start.map((x) => x.de)
  return orderQ('Put the numbers in order: klein → groß', words)
}

function gAgeTiles(rand: Rand): Question {
  const item = pick(rand, NUMBERS.slice(4, 10))
  return tilesQ(`Spell it: ${item.de} (${item.n})`, item.de, 'Wie alt bist du? Ich bin …')
}

function gAgeSentence(rand: Rand): Question {
  const item = pick(rand, NUMBERS.slice(4, 10))
  const answer = `Ich bin ${item.de} Jahre alt.`
  const others = NUMBERS.filter((x) => x.n !== item.n)
    .slice(0, 3)
    .map((x) => `Ich bin ${x.de} Jahre alt.`)
  const choices = shuffle(rand, [answer, ...others])
  return mcqFixed('Which sentence matches the candles?', choices, choices.indexOf(answer), {
    visual: { type: 'emoji-group', emojis: Array.from({ length: item.n }, () => '🎂') },
    ...say(answer),
  })
}

/* ----- Duolingo-style EN ⇄ DE: both directions + sentence builds ----- */
const NUMBER_GLOSS = NUMBERS.map((x) => ({ de: x.de, en: x.en }))

function gNumberDeToEn(rand: Rand): Question {
  return mcqDeToEn(rand, NUMBER_GLOSS)
}

function gNumberEnToDe(rand: Rand): Question {
  return mcqEnToDe(rand, NUMBER_GLOSS)
}

function gNumberMatchDeEn(rand: Rand): Question {
  return matchDeEn(rand, NUMBER_GLOSS, 'Match the number: German to English')
}

function gBuildAgeDe(rand: Rand): Question {
  const item = pick(rand, NUMBERS.slice(4, 10))
  return buildDe(`I am ${item.en} years old.`, ['Ich', 'bin', item.de, 'Jahre', 'alt.'])
}

function gBuildAgeEn(rand: Rand): Question {
  const item = pick(rand, NUMBERS.slice(4, 10))
  return buildEn(`Ich bin ${item.de} Jahre alt.`, ['I', 'am', item.en, 'years', 'old.'])
}

const g4l1 = makeLesson(
  'g4l1',
  'Eins bis sechs',
  ['4Vl.01', '4Lm.01'],
  'sonic',
  'Zählen!',
  'Count with Felix: eins, zwei, drei! Match words to digits and count the stars!',
  [gNumberMatch, gCountEmojis, gNumberDeToEn, gNumberEnToDe],
)

const g4l2 = makeLesson(
  'g4l2',
  'Sieben bis zwölf',
  ['4Vl.01', '4Rm.01'],
  'tails',
  'Weiter zählen!',
  'Bigger numbers! Listen, order them small → big, and spell fünf and zwölf!',
  [gHearNumber, gOrderNumbers, gNumberMatchDeEn, gNumberDeToEn],
)

const g4l3 = makeLesson(
  'g4l3',
  'Wie alt bist du?',
  ['4Sc.01', '4Wc.01'],
  'amy',
  'Geburtstag!',
  'Birthday time! Ich bin … Jahre alt. Spell it and pick the candle sentence!',
  [gAgeTiles, gAgeSentence, gBuildAgeDe, gBuildAgeEn],
)

const g4boss = makeLesson(
  'g4boss',
  'Zahlen Boss',
  ['4Vl.01', '4Sc.01'],
  'eggman',
  'BOSS TIME!',
  'Numbers 1–12, counting, ordering and birthdays — count Eggman out!',
  [gNumberMatchDeEn, gHearNumber, gBuildAgeDe, gBuildAgeEn],
  gNumberEnToDe,
)

export const UNIT_G4: UnitDef = unitDef(
  'g4',
  4,
  'Zahlen 1–12',
  'Deutsch extra · numbers, zählen, Wie alt bist du?',
  '#00cd9c',
  '🔢',
  [g4l1, g4l2, g4l3, g4boss],
)
