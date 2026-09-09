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
  unitDef,
  type Rand,
} from './helpers'

const FAMILY = [
  { de: 'die Mama', en: 'mum', emoji: '👩' },
  { de: 'der Papa', en: 'dad', emoji: '👨' },
  { de: 'der Bruder', en: 'brother', emoji: '👦' },
  { de: 'die Schwester', en: 'sister', emoji: '👧' },
  { de: 'die Oma', en: 'grandma', emoji: '👵' },
  { de: 'der Opa', en: 'grandpa', emoji: '👴' },
  { de: 'der Freund', en: 'friend (boy)', emoji: '🧑' },
  { de: 'die Freundin', en: 'friend (girl)', emoji: '🧒' },
]

function gFamilyMatch(rand: Rand): Question {
  const pairs = shuffle(rand, FAMILY.map((f) => ({ left: f.de, right: f.emoji }))).slice(0, 4)
  return matchQ(rand, 'Match the family word to its face', pairs)
}

function gFamilyPicture(rand: Rand): Question {
  const item = pick(rand, FAMILY)
  const others = FAMILY.filter((f) => f.de !== item.de).map((f) => f.de)
  return mcqE(rand, 'Wer ist das?', item.de, others, {
    visual: { type: 'emoji-group', emojis: [item.emoji] },
    ...say(item.de),
  })
}

function gDasIst(rand: Rand): Question {
  const item = pick(rand, FAMILY)
  const answer = `Das ist ${item.en === 'mum' ? 'meine' : item.de.startsWith('der') ? 'mein' : 'meine'} ${item.de.split(' ')[1]}.`
  const others = FAMILY.filter((f) => f.de !== item.de)
    .slice(0, 3)
    .map((f) => `Das ist ${f.de.split(' ')[1]}.`)
  const choices = shuffle(rand, [answer, ...others])
  return mcqFixed('Which “Das ist…” line fits?', choices, choices.indexOf(answer), {
    visual: { type: 'emoji-group', emojis: [item.emoji] },
    hint: 'mein = my (masculine/neuter), meine = my (feminine).',
  })
}

const INTRO_SENTENCES: string[][] = [
  ['Hallo!', 'Ich heiße Felix.', 'Ich bin ein Frosch.'],
  ['Hallo!', 'Ich heiße Franzi.', 'Ich bin eine Ente.'],
  ['Guten Tag!', 'Das ist mein Bruder.', 'Er heißt Tom.'],
  ['Hallo!', 'Das ist meine Schwester.', 'Sie heißt Mia.'],
]

function gIntroOrder(rand: Rand): Question {
  return orderQ('Put the introduction in order', pick(rand, INTRO_SENTENCES), {
    ...say('Hallo! Ich heiße Felix.'),
  })
}

/* ----- Duolingo-style EN ⇄ DE: both directions + sentence builds ----- */
const FAMILY_GLOSS = FAMILY.map((f) => ({ de: f.de, en: f.en }))

function gFamilyDeToEn(rand: Rand): Question {
  return mcqDeToEn(rand, FAMILY_GLOSS)
}

function gFamilyEnToDe(rand: Rand): Question {
  return mcqEnToDe(rand, FAMILY_GLOSS)
}

function gFamilyMatchDeEn(rand: Rand): Question {
  return matchDeEn(rand, FAMILY_GLOSS, 'Match the family: German to English')
}

/** mein (masculine) vs meine (feminine) — mirrors the gDasIst rule. */
function meinFor(de: string): 'mein' | 'meine' {
  return de.startsWith('der') ? 'mein' : 'meine'
}

function gBuildFamilyDe(rand: Rand): Question {
  const item = pick(rand, FAMILY)
  const noun = item.de.split(' ')[1]
  return buildDe(`This is my ${item.en}.`, ['Das', 'ist', meinFor(item.de), `${noun}.`])
}

function gBuildFamilyEn(rand: Rand): Question {
  const item = pick(rand, FAMILY)
  const noun = item.de.split(' ')[1]
  return buildEn(`Das ist ${meinFor(item.de)} ${noun}.`, ['This', 'is', 'my', `${item.en}.`])
}

const NAME_BUILDS: { en: string; de: string[]; back: string[] }[] = [
  { en: 'I am Felix.', de: ['Ich', 'heiße', 'Felix.'], back: ['I', 'am', 'Felix.'] },
  { en: 'I am Franzi.', de: ['Ich', 'heiße', 'Franzi.'], back: ['I', 'am', 'Franzi.'] },
]

function gBuildNameDe(rand: Rand): Question {
  const s = pick(rand, NAME_BUILDS)
  return buildDe(s.en, s.de)
}

function gBuildNameEn(rand: Rand): Question {
  const s = pick(rand, NAME_BUILDS)
  return buildEn(s.de.join(' '), s.back)
}

const g6l1 = makeLesson(
  'g6l1',
  'Meine Familie',
  ['4Vl.01', '4Gr.01'],
  'amy',
  'Familie!',
  'Meet Mama, Papa, Bruder, Schwester, Oma and Opa — each WITH der or die!',
  [gFamilyMatch, gFamilyPicture, gFamilyDeToEn, gFamilyEnToDe],
)

const g6l2 = makeLesson(
  'g6l2',
  'Das ist…',
  ['4Sc.01', '4Gr.02'],
  'cream',
  'Vorstellen!',
  'Introduce people: Das ist mein/meine… Learn when mein becomes meine!',
  [gDasIst, gFamilyMatchDeEn, gBuildFamilyDe, gBuildFamilyEn],
)

const g6l3 = makeLesson(
  'g6l3',
  'Ich heiße…',
  ['4Sc.01', '4Wc.01'],
  'sonic',
  'Ich bin…!',
  'Say your name like Felix: Ich heiße… Build the intro in the right order!',
  [gIntroOrder, gFamilyPicture, gBuildNameDe, gBuildNameEn],
)

const g6boss = makeLesson(
  'g6boss',
  'Familien Boss',
  ['4Gr.01', '4Sc.01'],
  'eggman',
  'BOSS TIME!',
  'Family, mein/meine and introductions — introduce the boss to defeat him!',
  [gFamilyMatchDeEn, gBuildFamilyDe, gBuildFamilyEn, gBuildNameDe],
  gFamilyEnToDe,
)

export const UNIT_G6: UnitDef = unitDef(
  'g6',
  6,
  'Familie & Freunde',
  'Deutsch extra · family, Das ist…, mein/meine',
  '#fb7185',
  '👨‍👩‍👧',
  [g6l1, g6l2, g6l3, g6boss],
)
