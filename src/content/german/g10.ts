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

const WHERE_SETS = [
  [
    { left: 'Das Buch ist…', right: 'auf dem Stuhl 🪑' },
    { left: 'Die Lampe ist…', right: 'in dem Zimmer 🚪' },
    { left: 'Der Ball ist…', right: 'unter dem Bett 🛏️' },
    { left: 'Die Katze ist…', right: 'auf dem Bett 🛏️' },
  ],
  [
    { left: 'Felix ist…', right: 'in dem Briefkasten 📮' },
    { left: 'Der Käse ist…', right: 'in der Küche 🍳' },
    { left: 'Das Schiff ist…', right: 'auf dem Wasser 💧' },
    { left: 'Der Stern ist…', right: 'am Himmel ⭐' },
  ],
]

function gWhereMatch(rand: Rand): Question {
  return matchQ(rand, 'Wo ist es? in / auf / unter', pick(rand, WHERE_SETS), {
    hint: 'in = inside, auf = on top, unter = under.',
  })
}

const ORDINALS = [
  { de: 'erste', emoji: '🥇' }, { de: 'zweite', emoji: '🥈' },
  { de: 'dritte', emoji: '🥉' }, { de: 'vierte', emoji: '4️⃣' },
]

function gOrdinalPicture(rand: Rand): Question {
  const item = pick(rand, ORDINALS)
  const others = ORDINALS.filter((o) => o.de !== item.de).map((o) => o.de)
  return mcqE(rand, 'Der wievielte? Ordinal!', item.de, others, {
    visual: { type: 'emoji-group', emojis: [item.emoji] },
    ...say(item.de),
  })
}

const FEST_TF = [
  { s: 'In Germany shops are closed on Sunday — family day.', a: true },
  { s: '“Alles Gute zum Geburtstag!” means Happy Birthday!', a: true },
  { s: 'Nikolaus brings treats on 6 December.', a: true },
  { s: 'Felix phones Germany without a country code.', a: false },
]

function gFestTrueFalse(rand: Rand): Question {
  const item = pick(rand, FEST_TF)
  return tfQ('True or false? Feste!', item.s, item.a)
}

const LETTER_SETS: string[][] = [
  [
    'Liebe Franzi,',
    'Ich bin in Berlin.',
    'Das Wetter ist schön.',
    'Bis bald! Felix',
  ],
  [
    'Hallo Franzi,',
    'Ich spiele im Garten.',
    'Der Ball ist rot.',
    'Tschüss! Felix',
  ],
]

function gLetterOrder(rand: Rand): Question {
  const lines = pick(rand, LETTER_SETS)
  return orderQ('Put Felix’s letter in order', lines, {
    story: story('Ein Brief von Felix', ['🐸', '📮', '🇩🇪'], lines),
    ...say('Liebe Franzi! Bis bald!'),
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

/** Preposition sentences use phrase chunks so the two English “the”s never
 *  collide as duplicate word-bank tiles (harness requires unique items). */
const WHERE_BUILDS: { en: string; de: string[]; back: string[] }[] = [
  { en: 'The book is on the chair.', de: ['Das Buch', 'ist', 'auf dem Stuhl'], back: ['The book', 'is', 'on the chair'] },
  { en: 'The cat is on the bed.', de: ['Die Katze', 'ist', 'auf dem Bett'], back: ['The cat', 'is', 'on the bed'] },
  { en: 'The lamp is in the room.', de: ['Die Lampe', 'ist', 'in dem Zimmer'], back: ['The lamp', 'is', 'in the room'] },
  { en: 'The ball is under the bed.', de: ['Der Ball', 'ist', 'unter dem Bett'], back: ['The ball', 'is', 'under the bed'] },
]

function gBuildWhereDe(rand: Rand): Question {
  const s = pick(rand, WHERE_BUILDS)
  return buildDe(s.en, s.de)
}

function gBuildWhereEn(rand: Rand): Question {
  const s = pick(rand, WHERE_BUILDS)
  return buildEn(s.de.join(' ') + '.', s.back)
}

function gBuildWishDe(rand: Rand): Question {
  void rand
  return buildDe('Happy birthday!', ['Alles', 'Gute', 'zum', 'Geburtstag!'])
}

function gBuildWishEn(rand: Rand): Question {
  void rand
  return buildEn('Alles Gute zum Geburtstag!', ['Happy', 'birthday!'])
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
  'Something nibbled the painting! Hunt it with in, auf and unter!',
  [gWhereMatch, gRoomPicture, gBuildWhereDe, gBuildWhereEn],
)

const g10l3 = makeLesson(
  'g10l3',
  'Felix hat Geburtstag',
  ['4Vl.01', '4Cu.02'],
  'amy',
  'Party!',
  'Ordinal candles: erste, zweite, dritte! Plus Nikolaus and Sunday family-day facts!',
  [gOrdinalPicture, gFestTrueFalse, gBuildWishDe, gBuildWishEn],
)

const g10l4 = makeLesson(
  'g10l4',
  'Ein Brief aus Berlin',
  ['4Rm.01', '4Wc.01'],
  'cream',
  'Post!',
  'Read Felix’s mini letter, order it, then read the birthday wish aloud!',
  [gLetterOrder, gSpeakWish, gRoomMatchDeEn, gBuildWhereDe],
)

const g10boss = makeLesson(
  'g10boss',
  'Deutsch Boss',
  ['4Gr.02', '4Cu.01'],
  'eggman',
  'BOSS TIME!',
  'Home, prepositions, party and the big letter — the final Deutsch boss!',
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
