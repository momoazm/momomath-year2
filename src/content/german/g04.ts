import type { Question, UnitDef } from '../types'
import {
  makeLesson,
  matchQ,
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
  { de: 'eins', n: 1 }, { de: 'zwei', n: 2 }, { de: 'drei', n: 3 },
  { de: 'vier', n: 4 }, { de: 'fünf', n: 5 }, { de: 'sechs', n: 6 },
  { de: 'sieben', n: 7 }, { de: 'acht', n: 8 }, { de: 'neun', n: 9 },
  { de: 'zehn', n: 10 }, { de: 'elf', n: 11 }, { de: 'zwölf', n: 12 },
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

const g4l1 = makeLesson(
  'g4l1',
  'Eins bis sechs',
  ['4Vl.01', '4Lm.01'],
  'sonic',
  'Zählen!',
  'Count with Felix: eins, zwei, drei! Match words to digits and count the stars!',
  [gNumberMatch, gCountEmojis],
)

const g4l2 = makeLesson(
  'g4l2',
  'Sieben bis zwölf',
  ['4Vl.01', '4Rm.01'],
  'tails',
  'Weiter zählen!',
  'Bigger numbers! Listen, order them small → big, and spell fünf and zwölf!',
  [gHearNumber, gOrderNumbers],
)

const g4l3 = makeLesson(
  'g4l3',
  'Wie alt bist du?',
  ['4Sc.01', '4Wc.01'],
  'amy',
  'Geburtstag!',
  'Birthday time! Ich bin … Jahre alt. Spell it and pick the candle sentence!',
  [gAgeTiles, gAgeSentence],
)

const g4boss = makeLesson(
  'g4boss',
  'Zahlen Boss',
  ['4Vl.01', '4Sc.01'],
  'eggman',
  'BOSS TIME!',
  'Numbers 1–12, counting, ordering and birthdays — count Eggman out!',
  [gNumberMatch, gHearNumber, gOrderNumbers, gAgeSentence],
  gCountEmojis,
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
