import type { Question, UnitDef } from '../types'
import {
  makeLesson,
  matchQ,
  mcqE,
  pick,
  say,
  shuffle,
  tfQ,
  tilesQ,
  unitDef,
  type Rand,
} from './helpers'

const FEELINGS = [
  { de: 'gut', en: 'good', emoji: '😊' },
  { de: 'schlecht', en: 'bad', emoji: '😞' },
  { de: 'müde', en: 'tired', emoji: '🥱' },
  { de: 'froh', en: 'happy', emoji: '😄' },
  { de: 'traurig', en: 'sad', emoji: '😢' },
  { de: 'hungrig', en: 'hungry', emoji: '🍽️' },
  { de: 'durstig', en: 'thirsty', emoji: '🥤' },
  { de: 'krank', en: 'sick', emoji: '🤒' },
]

function gFeelPicture(rand: Rand): Question {
  const item = pick(rand, FEELINGS)
  const others = FEELINGS.filter((f) => f.de !== item.de).map((f) => f.de)
  return mcqE(rand, 'Wie geht es dir? Tap the feeling', item.de, others, {
    visual: { type: 'emoji-group', emojis: [item.emoji] },
    ...say(item.de),
  })
}

function gFeelMatch(rand: Rand): Question {
  const pairs = shuffle(rand, FEELINGS.map((f) => ({ left: f.de, right: f.emoji }))).slice(0, 4)
  return matchQ(rand, 'Match the feeling to its face', pairs)
}

function gHearFeeling(rand: Rand): Question {
  const item = pick(rand, FEELINGS)
  const others = FEELINGS.filter((f) => f.de !== item.de).map((f) => f.de)
  return mcqE(rand, 'Tap the feeling you hear', item.de, others, say(item.de))
}

const UMLAUT_WORDS = ['bär', 'tür', 'grün', 'zwölf', 'schön', 'hänsel', 'füße', 'böse']

function gUmlautTiles(rand: Rand): Question {
  const w = pick(rand, UMLAUT_WORDS)
  return tilesQ(`Spell it: ${w}`, w, 'Ä Ö Ü are single tiles — tap them whole!')
}

const TF_ITEMS = [
  { s: '“Mir geht es gut” means I feel good.', a: true },
  { s: '“Ich bin müde” means I am hungry.', a: false },
  { s: '“Und dir?” asks “And you?” back.', a: true },
  { s: '“Danke” means thank you.', a: true },
  { s: '“Schlecht” means happy.', a: false },
]

function gFeelTrueFalse(rand: Rand): Question {
  const item = pick(rand, TF_ITEMS)
  return tfQ('True or false?', item.s, item.a)
}

const g2l1 = makeLesson(
  'g2l1',
  'Wie geht es dir?',
  ['4Sc.01', '4Lm.01'],
  'cream',
  'Gefühle!',
  'How are you? Mir geht es gut! Learn feelings and answer back with Und dir?',
  [gFeelPicture, gFeelMatch],
)

const g2l2 = makeLesson(
  'g2l2',
  'Hör gut zu!',
  ['4Lm.01', '4Sc.03'],
  'tails',
  'Ohren auf!',
  'Listen like a detective. Tap the feeling you hear — Felix speaks fast!',
  [gHearFeeling, gFeelTrueFalse],
)

const g2l3 = makeLesson(
  'g2l3',
  'Ä Ö Ü Party',
  ['4Sc.03', '4Wc.01'],
  'shadow',
  'Umlaut-Alarm!',
  'Ä Ö Ü and ß are German super-letters. Build them tile by tile!',
  [gUmlautTiles, gFeelPicture],
)

const g2boss = makeLesson(
  'g2boss',
  'Gefühle Boss',
  ['4Sc.01', '4Lm.01'],
  'eggman',
  'BOSS TIME!',
  'Feelings, listening and umlauts — show Eggman your German heart!',
  [gFeelMatch, gHearFeeling, gUmlautTiles, gFeelTrueFalse],
  gHearFeeling,
)

export const UNIT_G2: UnitDef = unitDef(
  'g2',
  2,
  "Wie geht's?",
  'Deutsch extra · feelings, Und dir?, ä ö ü',
  '#1cb0f6',
  '😊',
  [g2l1, g2l2, g2l3, g2boss],
)
