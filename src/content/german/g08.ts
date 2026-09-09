import type { Question, UnitDef } from '../types'
import {
  PICTURE_BANK,
  buildDe,
  buildEn,
  makeLesson,
  matchDeEn,
  matchQ,
  mcqDeToEn,
  mcqEnToDe,
  mcqE,
  pick,
  say,
  shuffle,
  unitDef,
  type Rand,
} from './helpers'

const BODY = [
  { de: 'der Kopf', en: 'head', emoji: PICTURE_BANK.kopf },
  { de: 'das Auge', en: 'eye', emoji: PICTURE_BANK.auge },
  { de: 'das Ohr', en: 'ear', emoji: PICTURE_BANK.ohr },
  { de: 'die Nase', en: 'nose', emoji: PICTURE_BANK.nase },
  { de: 'der Mund', en: 'mouth', emoji: PICTURE_BANK.mund },
  { de: 'die Hand', en: 'hand', emoji: PICTURE_BANK.hand },
  { de: 'der Fuß', en: 'foot', emoji: PICTURE_BANK.fuß },
  { de: 'das Bein', en: 'leg', emoji: PICTURE_BANK.bein },
]

const CLOTHES = [
  { de: 'der Hut', en: 'hat', emoji: PICTURE_BANK.hut },
  { de: 'der Schuh', en: 'shoe', emoji: PICTURE_BANK.schuh },
  { de: 'die Socke', en: 'sock', emoji: PICTURE_BANK.socke },
  { de: 'die Jacke', en: 'jacket', emoji: PICTURE_BANK.jacke },
  { de: 'das Hemd', en: 'shirt', emoji: PICTURE_BANK.hemd },
  { de: 'die Hose', en: 'trousers', emoji: PICTURE_BANK.hose },
  { de: 'die Brille', en: 'glasses', emoji: PICTURE_BANK.brille },
  { de: 'der Mantel', en: 'coat', emoji: '🥼' },
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

/* ----- Duolingo-style EN ⇄ DE: both directions + sentence builds ----- */
const BODY_GLOSS = BODY.map((b) => ({ de: b.de, en: b.en }))
const CLOTHES_GLOSS = CLOTHES.map((c) => ({ de: c.de, en: c.en }))

function gBodyDeToEn(rand: Rand): Question {
  return mcqDeToEn(rand, BODY_GLOSS)
}

function gBodyEnToDe(rand: Rand): Question {
  return mcqEnToDe(rand, BODY_GLOSS)
}

function gBodyMatchDeEn(rand: Rand): Question {
  return matchDeEn(rand, BODY_GLOSS, 'Match the body part: German to English')
}

function gClothesDeToEn(rand: Rand): Question {
  return mcqDeToEn(rand, CLOTHES_GLOSS)
}

function gClothesEnToDe(rand: Rand): Question {
  return mcqEnToDe(rand, CLOTHES_GLOSS)
}

function gClothesMatchDeEn(rand: Rand): Question {
  return matchDeEn(rand, CLOTHES_GLOSS, 'Match the clothing: German to English')
}

const WEATHER_BUILDS: { en: string; de: string[]; back: string[] }[] = [
  { en: 'It is raining.', de: ['Es', 'regnet.'], back: ['It', 'is', 'raining.'] },
  { en: 'It is snowing.', de: ['Es', 'schneit.'], back: ['It', 'is', 'snowing.'] },
  { en: 'The sun is shining.', de: ['Die', 'Sonne', 'scheint.'], back: ['The', 'sun', 'is', 'shining.'] },
  { en: 'It is cold.', de: ['Es', 'ist', 'kalt.'], back: ['It', 'is', 'cold.'] },
]

function gBuildWeatherDe(rand: Rand): Question {
  const s = pick(rand, WEATHER_BUILDS)
  return buildDe(s.en, s.de)
}

function gBuildWeatherEn(rand: Rand): Question {
  const s = pick(rand, WEATHER_BUILDS)
  return buildEn(s.de.join(' '), s.back)
}

const g8l1 = makeLesson(
  'g8l1',
  'Mein Körper',
  ['4Vl.01', '4Rm.01'],
  'knuckles',
  'Kopf bis Fuß!',
  'Head to toe: Kopf, Auge, Ohr, Nase, Mund, Hand, Fuß. Point and name!',
  [gBodyPicture, gBodyMatch, gBodyDeToEn, gBodyEnToDe],
)

const g8l2 = makeLesson(
  'g8l2',
  'Anziehen!',
  ['4Vl.01', '4Sc.01'],
  'amy',
  'Mode-Show!',
  'Dress Felix for the weather! Hut, Schuh, Jacke, Hose — what fits?',
  [gClothesPicture, gClothesMatch, gClothesDeToEn, gClothesEnToDe],
)

const g8l3 = makeLesson(
  'g8l3',
  'Sonnenbrille oder Regenschirm?',
  ['4Cu.01', '4Sc.01'],
  'tails',
  'Wetter-Detektiv!',
  'German weather changes fast! Match each weather to the right clothing!',
  [gWeatherClothes, gClothesPicture, gBuildWeatherDe, gBuildWeatherEn],
)

const g8boss = makeLesson(
  'g8boss',
  'Körper Boss',
  ['4Vl.01', '4Cu.01'],
  'eggman',
  'BOSS TIME!',
  'Body, clothes and weather — dress sharper than the boss!',
  [gBodyMatchDeEn, gClothesMatchDeEn, gBuildWeatherDe, gBuildWeatherEn],
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
