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
  orderQ,
  pick,
  say,
  shuffle,
  speakQ,
  story,
  tfQ,
  unitDef,
  type Rand,
} from './helpers'

const ROOMS = [
  { de: 'das Zimmer', en: 'room', emoji: '🛋️' }, { de: 'die Küche', en: 'kitchen', emoji: '🍳' },
  { de: 'das Bad', en: 'bathroom', emoji: '🛁' }, { de: 'das Bett', en: 'bed', emoji: PICTURE_BANK.bett },
  { de: 'der Stuhl', en: 'chair', emoji: PICTURE_BANK.stuhl }, { de: 'die Lampe', en: 'lamp', emoji: PICTURE_BANK.lampe },
  { de: 'die Tür', en: 'door', emoji: PICTURE_BANK.tür }, { de: 'das Buch', en: 'book', emoji: PICTURE_BANK.buch },
]

function gRoomPicture(rand: Rand): Question {
  const item = pick(rand, ROOMS)
  const others = ROOMS.filter((r) => r.de !== item.de).map((r) => r.de)
  return mcqE(rand, 'Wo ist das? At home!', item.de, others, {
    visual: { type: 'emoji-group', emojis: [item.emoji] },
    ...say(item.de),
  })
}

function gRoomMatch(rand: Rand): Question {
  const pairs = shuffle(rand, ROOMS.map((r) => ({ left: r.de, right: r.emoji }))).slice(0, 4)
  return matchQ(rand, 'Match the room thing', pairs)
}

const WHERE_MEANINGS = [
  { left: 'auf', right: 'on top ☝️' },
  { left: 'in', right: 'inside 📦' },
  { left: 'unter', right: 'under ⬇️' },
  { left: 'neben', right: 'next to ↔️' },
]

function gWhereMatch(rand: Rand): Question {
  return matchQ(rand, 'Match the where-word', shuffle(rand, WHERE_MEANINGS), {
    hint: 'Little words that tell you WHERE something is!',
  })
}

const CANDLE_COUNTS = [
  { n: 1, de: 'eins' },
  { n: 2, de: 'zwei' }, { n: 3, de: 'drei' },
  { n: 4, de: 'vier' }, { n: 5, de: 'fünf' },
  { n: 6, de: 'sechs' },
]

function gCandleCount(rand: Rand): Question {
  const item = pick(rand, CANDLE_COUNTS)
  const others = CANDLE_COUNTS.filter((c) => c.de !== item.de).map((c) => c.de)
  const flames = Array.from({ length: item.n }, () => '🕯️')
  return mcqE(rand, 'Wie viele Kerzen? Count the candles!', item.de, others, {
    visual: { type: 'emoji-group', emojis: ['🎂', ...flames] },
    ...say(item.de),
  })
}

const FEST_TF = [
  { s: '“Alles Gute zum Geburtstag!” means Happy Birthday!', a: true },
  { s: '“Tschüss!” means hello.', a: false },
  { s: 'Franzi is a duck. 🦆', a: true },
  { s: 'You sing “Gute Nacht!” at a birthday party.', a: false },
  { s: 'You get presents on your birthday. 🎁', a: true },
  { s: 'The cake has candles on it. 🎂', a: true },
  { s: 'You make a wish and blow out the candles. 🕯️', a: true },
  { s: '“Viel Glück!” means “Happy birthday!”', a: false },
]

function gFestTrueFalse(rand: Rand): Question {
  const item = pick(rand, FEST_TF)
  return tfQ('True or false? Feste!', item.s, item.a)
}

const LETTER_SETS: string[][] = [
  [
    'Liebe Franzi,',
    'Ich bin in Berlin.',
    'Bis bald! Felix',
  ],
  [
    'Hallo Franzi,',
    'Der Ball ist rot.',
    'Tschüss! Felix',
  ],
]

function gLetterOrder(rand: Rand): Question {
  const lines = pick(rand, LETTER_SETS)
  return orderQ('Put Felix’s letter in order', lines, {
    story: story('Ein Brief von Felix', ['🐸', '📮', '🇩🇪'], lines),
    ...say(`${lines[0]} ${lines[lines.length - 1]}`),
  })
}

const WISHES = ['Alles Gute zum Geburtstag!', 'Viel Glück zum Geburtstag!']

function gSpeakWish(rand: Rand): Question {
  const wish = pick(rand, WISHES)
  return speakQ('Read the birthday wish aloud!', wish, {
    story: story('Franzis Party', ['🎂', '🦆', '🎉'], ['Heute hat Franzi Geburtstag.', 'Alle singen ein Lied.']),
    hint: 'Tap the turtle for slow audio first.',
  })
}

function gPartyPick(rand: Rand): Question {
  const answer = 'Alles Gute zum Geburtstag!'
  const choices = shuffle(rand, [
    answer,
    'Guten Appetit!',
    'Gute Nacht!',
    'Viel Glück!',
  ])
  return mcqFixed('What do you sing at the party?', choices, choices.indexOf(answer), say(answer))
}

/* ----- Duolingo-style EN ⇄ DE: both directions + sentence builds ----- */
const ROOM_GLOSS = ROOMS.map((r) => ({ de: r.de, en: r.en }))

function gRoomDeToEn(rand: Rand): Question {
  return mcqDeToEn(rand, ROOM_GLOSS)
}

function gRoomEnToDe(rand: Rand): Question {
  return mcqEnToDe(rand, ROOM_GLOSS)
}

function gRoomMatchDeEn(rand: Rand): Question {
  return matchDeEn(rand, ROOM_GLOSS, 'Match at home: German to English')
}

/** “Das ist der Stuhl.” room builds — taught vocab with its article, no case grammar. */
function gBuildWhereDe(rand: Rand): Question {
  const item = pick(rand, ROOMS)
  const [art, noun] = item.de.split(' ')
  return buildDe(`This is the ${item.en}.`, ['Das', 'ist', art, `${noun}.`])
}

function gBuildWhereEn(rand: Rand): Question {
  const item = pick(rand, ROOMS)
  return buildEn(`Das ist ${item.de}.`, ['This', 'is', 'the', `${item.en}.`])
}

/** Birthday-wish builders — every entry is short Year-2 party vocabulary. */
const WISH_BUILDS: Array<{ en: string; de: string[] }> = [
  { en: 'Happy birthday!', de: ['Alles', 'Gute', 'zum', 'Geburtstag!'] },
  { en: 'Have fun at the party!', de: ['Viel', 'Spaß', 'auf', 'der', 'Party!'] },
  { en: 'Happy birthday, Franzi!', de: ['Alles', 'Gute,', 'Franzi!'] },
]

function gBuildWishDe(rand: Rand): Question {
  const w = pick(rand, WISH_BUILDS)
  return buildDe(w.en, w.de)
}

const WISH_EN_BUILDS: Array<{ de: string; en: string[] }> = [
  { de: 'Alles Gute zum Geburtstag!', en: ['Happy', 'birthday!'] },
  { de: 'Viel Spaß auf der Party!', en: ['Have', 'fun', 'at', 'the', 'party!'] },
  { de: 'Alles Gute, Franzi!', en: ['Happy', 'birthday,', 'Franzi!'] },
]

function gBuildWishEn(rand: Rand): Question {
  const w = pick(rand, WISH_EN_BUILDS)
  return buildEn(w.de, w.en)
}

const g10l1 = makeLesson(
  'g10l1',
  'Im Briefkasten',
  ['4Vl.01', '4Rm.01'],
  'sonic',
  'Zuhause!',
  'Felix and Franzi hang their painting at home. Learn every room-thing with its article!',
  [gRoomPicture, gRoomMatch, gRoomDeToEn, gRoomEnToDe],
)

const g10l2 = makeLesson(
  'g10l2',
  'Wo ist es?',
  ['4Gr.02', '4Sc.01'],
  'tails',
  'Verstecken!',
  'Something hid the painting! Where is it? Learn the little where-words: in, auf, unter, neben!',
  [gWhereMatch, gRoomPicture, gBuildWhereDe, gBuildWhereEn],
)

const g10l3 = makeLesson(
  'g10l3',
  'Felix hat Geburtstag',
  ['4Vl.01', '4Cu.02'],
  'amy',
  'Party!',
  'Count Franzi’s birthday candles — zwei, drei, vier, fünf! — then make a wish!',
  [gCandleCount, gFestTrueFalse, gBuildWishDe, gBuildWishEn],
)

const g10l4 = makeLesson(
  'g10l4',
  'Ein Brief aus Berlin',
  ['4Rm.01', '4Wc.01'],
  'cream',
  'Post!',
  'Read Felix’s short letter, put it in order, then read the birthday wish aloud!',
  [gLetterOrder, gSpeakWish, gRoomMatchDeEn, gBuildWhereDe],
)

const g10boss = makeLesson(
  'g10boss',
  'Deutsch Boss',
  ['4Gr.02', '4Cu.01'],
  'eggman',
  'BOSS TIME!',
  'Home, where-words, party and Felix’s letter — the final Deutsch boss!',
  [gRoomMatchDeEn, gBuildWhereDe, gBuildWhereEn, gBuildWishDe, gPartyPick],
  gLetterOrder,
)

export const UNIT_G10: UnitDef = unitDef(
  'g10',
  10,
  'Zuhause & Feste',
  'Deutsch extra · home, in/auf/unter, Geburtstag',
  '#f97316',
  '🏠',
  [g10l1, g10l2, g10l3, g10l4, g10boss],
)
