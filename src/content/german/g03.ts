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
  mcqFixed,
  pick,
  say,
  shuffle,
  unitDef,
  type Rand,
} from './helpers'

const COLOURS = [
  { de: 'rot', en: 'red', emoji: '🔴' },
  { de: 'blau', en: 'blue', emoji: '🔵' },
  { de: 'grün', en: 'green', emoji: '🟢' },
  { de: 'gelb', en: 'yellow', emoji: '🟡' },
  { de: 'rosa', en: 'pink', emoji: '🌸' },
  { de: 'lila', en: 'purple', emoji: '🟣' },
  { de: 'orange', en: 'orange', emoji: '🟠' },
  { de: 'schwarz', en: 'black', emoji: '⚫' },
  { de: 'weiß', en: 'white', emoji: '⚪' },
  { de: 'braun', en: 'brown', emoji: '🟤' },
]

function gColourPicture(rand: Rand): Question {
  const item = pick(rand, COLOURS)
  const others = COLOURS.filter((c) => c.de !== item.de).map((c) => c.de)
  return mcqE(rand, 'Welche Farbe ist das?', item.de, others, {
    visual: { type: 'emoji-group', emojis: [item.emoji] },
    ...say(item.de),
  })
}

function gColourMatch(rand: Rand): Question {
  const pairs = shuffle(rand, COLOURS.map((c) => ({ left: c.de, right: c.emoji }))).slice(0, 4)
  return matchQ(rand, 'Match the colour to its dot', pairs)
}

function gHearColour(rand: Rand): Question {
  const item = pick(rand, COLOURS)
  const others = COLOURS.filter((c) => c.de !== item.de).map((c) => c.de)
  return mcqE(rand, 'Tap the colour you hear', item.de, others, say(item.de))
}

function gFavourite(rand: Rand): Question {
  const item = pick(rand, COLOURS)
  const others = COLOURS.filter((c) => c.de !== item.de)
    .slice(0, 3)
    .map((c) => `Meine Lieblingsfarbe ist ${c.de}.`)
  const answer = `Meine Lieblingsfarbe ist ${item.de}.`
  const choices = shuffle(rand, [answer, ...others])
  return mcqFixed('Which sentence matches the dot?', choices, choices.indexOf(answer), {
    visual: { type: 'emoji-group', emojis: [item.emoji] },
    ...say(answer),
  })
}

function gFlags(rand: Rand): Question {
  void rand
  void PICTURE_BANK
  return mcqFixed(
    'Which flag is Germany? 🇩🇪',
    ['🇩🇪 Germany', '🇦🇹 Austria', '🇨🇭 Switzerland', '🇬🇧 United Kingdom'],
    0,
    { hint: 'Black, red, gold — sideways stripes!' },
  )
}

/* ----- Duolingo-style EN ⇄ DE: both directions + sentence builds ----- */
const COLOUR_GLOSS = COLOURS.map((c) => ({ de: c.de, en: c.en }))

function gColourDeToEn(rand: Rand): Question {
  return mcqDeToEn(rand, COLOUR_GLOSS)
}

function gColourEnToDe(rand: Rand): Question {
  return mcqEnToDe(rand, COLOUR_GLOSS)
}

function gColourMatchDeEn(rand: Rand): Question {
  return matchDeEn(rand, COLOUR_GLOSS, 'Match the colour: German to English')
}

const COLOUR_EN: Record<string, string> = {
  rot: 'red', blau: 'blue', grün: 'green', gelb: 'yellow', rosa: 'pink',
  lila: 'purple', orange: 'orange', schwarz: 'black', weiß: 'white', braun: 'brown',
}

function gBuildColourDe(rand: Rand): Question {
  const item = pick(rand, COLOURS)
  return buildDe(`My favourite colour is ${COLOUR_EN[item.de]}.`, ['Meine', 'Lieblingsfarbe', 'ist', `${item.de}.`])
}

function gBuildColourEn(rand: Rand): Question {
  const item = pick(rand, COLOURS)
  return buildEn(`Meine Lieblingsfarbe ist ${item.de}.`, ['My', 'favourite', 'colour', 'is', `${COLOUR_EN[item.de]}.`])
}

const g3l1 = makeLesson(
  'g3l1',
  'Das Gemälde',
  ['4Vl.01', '4Rm.01'],
  'amy',
  'Bunte Farben!',
  'Felix and Franzi painted in black and white — help them colour it! Welche Farbe ist das?',
  [gColourPicture, gColourMatch, gColourDeToEn, gColourEnToDe],
)

const g3l2 = makeLesson(
  'g3l2',
  'Meine Lieblingsfarbe',
  ['4Sc.01', '4Vl.01'],
  'blaze',
  'Lieblingsfarbe!',
  'Say your favourite: Meine Lieblingsfarbe ist… Pick the sentence that matches!',
  [gFavourite, gHearColour, gBuildColourDe, gBuildColourEn],
)

const g3l3 = makeLesson(
  'g3l3',
  'Flaggen & Länder',
  ['4Cu.01', '4Rm.01'],
  'knuckles',
  'Deutschland!',
  'German is spoken in Germany, Austria, Switzerland and more. Spot the flags!',
  [gFlags, gColourMatchDeEn, gColourDeToEn, gColourEnToDe],
)

const g3boss = makeLesson(
  'g3boss',
  'Farben Boss',
  ['4Vl.01', '4Rm.01'],
  'eggman',
  'BOSS TIME!',
  'Colours, favourites and flags — paint the boss defeat rainbow-bright!',
  [gColourMatchDeEn, gHearColour, gBuildColourDe, gBuildColourEn],
  gColourDeToEn,
)

export const UNIT_G3: UnitDef = unitDef(
  'g3',
  3,
  'Farben',
  'Deutsch extra · colours, Lieblingsfarbe, D-A-CH flags',
  '#ff9600',
  '🎨',
  [g3l1, g3l2, g3l3, g3boss],
)
