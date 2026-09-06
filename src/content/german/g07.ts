import type { Question, UnitDef } from '../types'
import {
  makeLesson,
  matchQ,
  mcqE,
  pick,
  say,
  shuffle,
  speakQ,
  tilesQ,
  unitDef,
  type Rand,
} from './helpers'

const FOOD = [
  { de: 'der Apfel', bare: 'Apfel', emoji: '🍎' },
  { de: 'die Banane', bare: 'Banane', emoji: '🍌' },
  { de: 'die Traube', bare: 'Traube', emoji: '🍇' },
  { de: 'die Erdbeere', bare: 'Erdbeere', emoji: '🍓' },
  { de: 'das Brot', bare: 'Brot', emoji: '🍞' },
  { de: 'der Käse', bare: 'Käse', emoji: '🧀' },
  { de: 'der Kuchen', bare: 'Kuchen', emoji: '🍰' },
  { de: 'die Milch', bare: 'Milch', emoji: '🥛' },
  { de: 'der Saft', bare: 'Saft', emoji: '🧃' },
  { de: 'das Wasser', bare: 'Wasser', emoji: '💧' },
]

function gFoodPicture(rand: Rand): Question {
  const item = pick(rand, FOOD)
  const others = FOOD.filter((f) => f.de !== item.de).map((f) => f.de)
  return mcqE(rand, 'Was ist das? Lecker!', item.de, others, {
    visual: { type: 'emoji-group', emojis: [item.emoji] },
    ...say(item.de),
  })
}

function gFoodMatch(rand: Rand): Question {
  const pairs = shuffle(rand, FOOD.map((f) => ({ left: f.de, right: f.emoji }))).slice(0, 4)
  return matchQ(rand, 'Match the food to its plate', pairs)
}

function gMagMatch(rand: Rand): Question {
  const liked = shuffle(rand, FOOD).slice(0, 2)
  const disliked = shuffle(rand, FOOD.filter((f) => !liked.includes(f))).slice(0, 2)
  // Rights embed the food name so every pair stays unique (harness rule).
  const pairs = shuffle(rand, [
    ...liked.map((f) => ({ left: f.bare, right: `Ich mag ${f.bare} 👍` })),
    ...disliked.map((f) => ({ left: `${f.bare} nicht`, right: `Ich mag ${f.bare} nicht 👎` })),
  ])
  return matchQ(rand, 'Sort: mag or mag nicht?', pairs, {
    hint: 'Ich mag = I like, Ich mag nicht = I do not like.',
  })
}

const SPELL_FOODS = ['apfel', 'banane', 'brot', 'käse', 'milch', 'saft', 'kuchen', 'wasser']

function gFoodTiles(rand: Rand): Question {
  const w = pick(rand, SPELL_FOODS)
  return tilesQ(`Spell the food: ${w}`, w, 'Build it letter by letter!')
}

function gSpeakYummy(rand: Rand): Question {
  const item = pick(rand, FOOD.slice(0, 6))
  return speakQ('Read it aloud like at breakfast!', `Ich mag ${item.bare}.`, {
    hint: 'Tap the turtle for slow audio first.',
  })
}

const g7l1 = makeLesson(
  'g7l1',
  'Obstsalat',
  ['4Vl.01', '4Rm.01'],
  'tails',
  'Lecker!',
  'Fruit salad time! Apfel, Banane, Traube — taste every word with its article!',
  [gFoodPicture, gFoodMatch],
)

const g7l2 = makeLesson(
  'g7l2',
  'Ich mag…',
  ['4Sc.01', '4Gr.02'],
  'amy',
  'Magst du?',
  'Likes and dislikes: Ich mag / Ich mag nicht. Sort the foods!',
  [gMagMatch, gFoodTiles],
)

const g7l3 = makeLesson(
  'g7l3',
  'Zeit fürs Frühstück!',
  ['4Sc.01', '4Wc.01'],
  'cream',
  'Guten Appetit!',
  'Breakfast with Felix! Spell foods and read your favourite line aloud!',
  [gFoodTiles, gSpeakYummy],
)

const g7boss = makeLesson(
  'g7boss',
  'Essen Boss',
  ['4Vl.01', '4Sc.01'],
  'eggman',
  'BOSS TIME!',
  'Foods, mag/mag nicht and breakfast lines — eat the boss for breakfast!',
  [gFoodMatch, gMagMatch, gFoodTiles, gSpeakYummy],
  gFoodPicture,
)

export const UNIT_G7: UnitDef = unitDef(
  'g7',
  7,
  'Essen & Trinken',
  'Deutsch extra · food, Ich mag / mag nicht',
  '#eab308',
  '🍎',
  [g7l1, g7l2, g7l3, g7boss],
)
