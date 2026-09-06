import type { Question, UnitDef } from '../types'
import {
  PICTURE_BANK,
  makeLesson,
  matchQ,
  mcqE,
  mcqFixed,
  pick,
  say,
  shuffle,
  unitDef,
  type Rand,
} from './helpers'

const GREET_MATCH = [
  { left: 'Hallo', right: '👋 ankommen' },
  { left: 'Guten Morgen', right: '🌅 Morgen' },
  { left: 'Guten Tag', right: '☀️ Mittag' },
  { left: 'Tschüss', right: '👋 gehen' },
  { left: 'Bis bald', right: '🙋 später' },
  { left: 'Auf Wiedersehen', right: '🚪 Abschied' },
]

function gGreetMatch(rand: Rand): Question {
  const pairs = shuffle(rand, GREET_MATCH).slice(0, 4)
  return matchQ(rand, 'Match the greeting to its moment', pairs)
}

const GREET_PICK = [
  { w: 'Hallo', pic: '👋' },
  { w: 'Tschüss', pic: '👋' },
  { w: 'Guten Morgen', pic: '🌅' },
  { w: 'Guten Tag', pic: '☀️' },
  { w: 'Bis bald', pic: '🙋' },
]

function gHearGreeting(rand: Rand): Question {
  const item = pick(rand, GREET_PICK)
  const others = GREET_PICK.filter((g) => g.w !== item.w).map((g) => g.w)
  return mcqE(rand, 'Tap the greeting you hear', item.w, others, say(item.w))
}

function gPolitely(rand: Rand): Question {
  const pairs = shuffle(rand, [
    { left: 'Frau', right: 'Mrs / Ms 👩' },
    { left: 'Herr', right: 'Mr 👨' },
    { left: 'Felix Frosch', right: PICTURE_BANK.frosch },
    { left: 'Franzi Ente', right: PICTURE_BANK.ente },
    { left: 'Briefkasten', right: PICTURE_BANK.briefkasten },
  ]).slice(0, 4)
  return matchQ(rand, 'Who is who? Match!', pairs, {
    hint: 'Frau = Mrs/Ms, Herr = Mr. Shake hands with grown-ups!',
  })
}

function gHelloOrGoodbye(rand: Rand): Question {
  const hellos = ['Hallo', 'Guten Morgen', 'Guten Tag']
  const byes = ['Tschüss', 'Bis bald', 'Auf Wiedersehen']
  const all = [...hellos, ...byes]
  const answer = pick(rand, all)
  const isHello = hellos.includes(answer)
  const choices = ['Sagen Hallo 👋', 'Sagen Tschüss 🚪']
  return mcqFixed(
    `“${answer}” — hello or goodbye?`,
    choices,
    isHello ? 0 : 1,
    say(answer),
  )
}

const g1l1 = makeLesson(
  'g1l1',
  'Hallo, Felix!',
  ['4Sc.01', '4Cu.01'],
  'sonic',
  'Hallo zusammen!',
  'Felix Frosch and Franzi Ente just moved from Zoo Berlin. Say Hallo and shake hands like in Germany!',
  [gGreetMatch, gHearGreeting],
)

const g1l2 = makeLesson(
  'g1l2',
  'Frau und Herr',
  ['4Cu.01', '4Sc.01'],
  'amy',
  'So höflich!',
  'Grown-ups are Frau (Mrs/Ms) and Herr (Mr). Friends use first names. Meet Felix, Franzi and the Briefkasten!',
  [gPolitely, gGreetMatch],
)

const g1l3 = makeLesson(
  'g1l3',
  'Hallo oder Tschüss?',
  ['4Lm.01', '4Sc.01'],
  'tails',
  'Komm oder geh?',
  'Listen close: is it a hello or a goodbye? Tap what you hear, then sort it!',
  [gHelloOrGoodbye, gHearGreeting],
)

const g1boss = makeLesson(
  'g1boss',
  'Hallo Boss',
  ['4Sc.01', '4Lm.01'],
  'eggman',
  'BOSS TIME!',
  'Greet Eggman politely, sort hellos from goodbyes, and prove you know Felix & Franzi!',
  [gGreetMatch, gHearGreeting, gPolitely, gHelloOrGoodbye],
  gHearGreeting,
)

export const UNIT_G1: UnitDef = unitDef(
  'g1',
  1,
  'Hallo!',
  'Deutsch extra · greetings, Frau/Herr, Felix & Franzi',
  '#58cc02',
  '👋',
  [g1l1, g1l2, g1l3, g1boss],
)
