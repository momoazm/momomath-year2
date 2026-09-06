import type { Question, UnitDef } from '../types'
import {
  PICTURE_BANK,
  makeLesson,
  matchQ,
  mcqE,
  pick,
  say,
  shuffle,
  unitDef,
  type Rand,
} from './helpers'

const BODY = [
  { de: 'der Kopf', emoji: PICTURE_BANK.kopf },
  { de: 'das Auge', emoji: PICTURE_BANK.auge },
  { de: 'das Ohr', emoji: PICTURE_BANK.ohr },
  { de: 'die Nase', emoji: PICTURE_BANK.nase },
  { de: 'der Mund', emoji: PICTURE_BANK.mund },
  { de: 'die Hand', emoji: PICTURE_BANK.hand },
  { de: 'der Fuß', emoji: PICTURE_BANK.fuß },
  { de: 'das Bein', emoji: PICTURE_BANK.bein },
]

const CLOTHES = [
  { de: 'der Hut', emoji: PICTURE_BANK.hut },
  { de: 'der Schuh', emoji: PICTURE_BANK.schuh },
  { de: 'die Socke', emoji: PICTURE_BANK.socke },
  { de: 'die Jacke', emoji: PICTURE_BANK.jacke },
  { de: 'das Hemd', emoji: PICTURE_BANK.hemd },
  { de: 'die Hose', emoji: PICTURE_BANK.hose },
  { de: 'die Brille', emoji: PICTURE_BANK.brille },
  { de: 'der Mantel', emoji: '🥼' },
]

function gBodyPicture(rand: Rand): Question {
  const item = pick(rand, BODY)
  const others = BODY.filter((b) => b.de !== item.de).map((b) => b.de)
  return mcqE(rand, 'Welcher Körperteil ist das?', item.de, others, {
    visual: { type: 'emoji-group', emojis: [item.emoji] },
    ...say(item.de),
  })
}

function gBodyMatch(rand: Rand): Question {
  const pairs = shuffle(rand, BODY.map((b) => ({ left: b.de, right: b.emoji }))).slice(0, 4)
  return matchQ(rand, 'Match the body part', pairs)
}

function gClothesPicture(rand: Rand): Question {
  const item = pick(rand, CLOTHES)
  const others = CLOTHES.filter((c) => c.de !== item.de).map((c) => c.de)
  return mcqE(rand, 'Was zieht Felix an?', item.de, others, {
    visual: { type: 'emoji-group', emojis: [item.emoji] },
    ...say(item.de),
  })
}

function gClothesMatch(rand: Rand): Question {
  const pairs = shuffle(rand, CLOTHES.map((c) => ({ left: c.de, right: c.emoji }))).slice(0, 4)
  return matchQ(rand, 'Match the clothing', pairs)
}

const WEATHER_SETS = [
  [
    { left: 'Es regnet 🌧️', right: 'der Regenschirm ☂️' },
    { left: 'Es schneit ❄️', right: 'der Mantel 🧥' },
    { left: 'Die Sonne scheint ☀️', right: 'die Brille 👓' },
    { left: 'Es ist kalt 🥶', right: 'die Socke 🧦' },
  ],
  [
    { left: 'Es ist heiß 🥵', right: 'das Wasser 💧' },
    { left: 'Es ist windig 🌬️', right: 'die Jacke 🧥' },
    { left: 'Es regnet 🌧️', right: 'der Schuh 👟' },
    { left: 'Schnee! ❄️', right: 'der Hut 🎩' },
  ],
]

function gWeatherClothes(rand: Rand): Question {
  const set = pick(rand, WEATHER_SETS)
  return matchQ(rand, 'Weather → what do you wear?', set, {
    hint: 'Sunday is no-shopping day in Germany — dress right the first time!',
  })
}

const g8l1 = makeLesson(
  'g8l1',
  'Mein Körper',
  ['4Vl.01', '4Rm.01'],
  'knuckles',
  'Kopf bis Fuß!',
  'Head to toe: Kopf, Auge, Ohr, Nase, Mund, Hand, Fuß. Point and name!',
  [gBodyPicture, gBodyMatch],
)

const g8l2 = makeLesson(
  'g8l2',
  'Anziehen!',
  ['4Vl.01', '4Sc.01'],
  'amy',
  'Mode-Show!',
  'Dress Felix for the weather! Hut, Schuh, Jacke, Hose — what fits?',
  [gClothesPicture, gClothesMatch],
)

const g8l3 = makeLesson(
  'g8l3',
  'Sonnenbrille oder Regenschirm?',
  ['4Cu.01', '4Sc.01'],
  'tails',
  'Wetter-Detektiv!',
  'German weather changes fast! Match each weather to the right clothing!',
  [gWeatherClothes, gClothesPicture],
)

const g8boss = makeLesson(
  'g8boss',
  'Körper Boss',
  ['4Vl.01', '4Cu.01'],
  'eggman',
  'BOSS TIME!',
  'Body, clothes and weather — dress sharper than the boss!',
  [gBodyMatch, gClothesMatch, gWeatherClothes, gBodyPicture],
  gWeatherClothes,
)

export const UNIT_G8: UnitDef = unitDef(
  'g8',
  8,
  'Körper & Kleidung',
  'Deutsch extra · body, clothes, weather match',
  '#22d3ee',
  '👕',
  [g8l1, g8l2, g8l3, g8boss],
)
