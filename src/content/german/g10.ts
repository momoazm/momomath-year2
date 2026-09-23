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
  [
    { left: 'Das Brot ist…', right: 'auf dem Tisch 🍽️' },
    { left: 'Der Regenschirm ist…', right: 'unter der Treppe 🪜' },
    { left: 'Die Schlüssel sind…', right: 'in der Tasche 👜' },
    { left: 'Der Frosch ist…', right: 'auf dem Stein 🪨' },
  ],
  [
    { left: 'Der Apfel ist…', right: 'in dem Korb 🧺' },
    { left: 'Das Licht ist…', right: 'an der Decke 💡' },
    { left: 'Der Stift ist…', right: 'auf dem Papier 📝' },
    { left: 'Die Ente ist…', right: 'auf dem Teich 🦆' },
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
  { de: 'fünfte', emoji: '5️⃣' }, { de: 'sechste', emoji: '6️⃣' },
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
  { s: 'German schools usually start in August or September.', a: true },
  { s: 'Oktoberfest always happens in October only.', a: false },
  { s: 'In German the word for Christmas is “Weihnachten”.', a: true },
  { s: '“Guten Appetit!” is said before someone goes to bed.', a: false },
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
  [
    'Liebe Franzi,',
    'Der Park ist groß.',
    'Ich lerne Deutsch.',
    'Bis morgen! Felix',
  ],
  [
    'Hallo Franzi,',
    'Die Ente ist im Teich.',
    'Das Brot ist frisch.',
    'Tschüss! Felix',
  ],
  [
    'Liebe Franzi,',
    'Heute scheint die Sonne.',
    'Der Frosch sitzt am Stein.',
    'Bis bald! Felix',
  ],
  [
    'Hallo Franzi,',
    'Ich habe einen Brief.',
    'Die Lampe leuchtet.',
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

const WISHES = [
  'Alles Gute zum Geburtstag!',
  'Viel Glück zum Geburtstag!',
  'Herzlichen Glückwunsch!',
  'Alles Liebe zum Geburtstag!',
  'Ich wünsche dir alles Gute!',
  'Zum Geburtstag alles Liebe!',
  'Happy Birthday, Franzi!',
  'Genieße deinen besonderen Tag!',
  'Hab einen wunderschönen Geburtstag!',
  'Feier schön, lieber Freund!',
  'Beste Wünsche für dich!',
  'Ein Jahr voller Freude!',
]

function gSpeakWish(rand: Rand): Question {
  const wish = pick(rand, WISHES)
  return speakQ('Read the birthday wish aloud!', wish, {
    story: story('Franzis Party', ['🎂', '🦆', '🎉'], ['Heute hat Franzi Geburtstag.', 'Alle singen ein Lied.']),
    hint: 'Tap the turtle for slow audio first.',
  })
}

function gPartyPick(rand: Rand): Question {
  const items = [
    { answer: 'Alles Gute zum Geburtstag!', wrong: ['Guten Appetit!', 'Gute Nacht!', 'Viel Glück!'] },
    { answer: 'Viel Glück zum Geburtstag!', wrong: ['Gute Nacht!', 'Auf Wiedersehen!', 'Danke schön!'] },
    { answer: 'Herzlichen Glückwunsch!', wrong: ['Guten Morgen!', 'Entschuldigung!', 'Bis morgen!'] },
    { answer: 'Alles Liebe zum Geburtstag!', wrong: ['Guten Appetit!', 'Viel Spaß!', 'Gute Reise!'] },
    { answer: 'Ich wünsche dir alles Gute!', wrong: ['Gute Nacht!', 'Auf Wiedersehen!', 'Danke sehr!'] },
    { answer: 'Zum Geburtstag alles Liebe!', wrong: ['Guten Appetit!', 'Gute Besserung!', 'Tschüss!'] },
  ]
  const item = pick(rand, items)
  const choices = shuffle(rand, [item.answer, ...item.wrong])
  return mcqFixed('What do you say at the party?', choices, choices.indexOf(item.answer), say(item.answer))
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
  { en: 'The dog is in the garden.', de: ['Der Hund', 'ist', 'in dem Garten'], back: ['The dog', 'is', 'in the garden'] },
  { en: 'The star is in the sky.', de: ['Der Stern', 'ist', 'am Himmel'], back: ['The star', 'is', 'in the sky'] },
  { en: 'The bread is on the table.', de: ['Das Brot', 'ist', 'auf dem Tisch'], back: ['The bread', 'is', 'on the table'] },
  { en: 'The frog is under the leaf.', de: ['Der Frosch', 'ist', 'unter dem Blatt'], back: ['The frog', 'is', 'under the leaf'] },
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
  const wish = pick(rand, [
    { en: 'Happy birthday!', de: ['Alles', 'Gute', 'zum', 'Geburtstag!'] },
    { en: 'All the best on your birthday!', de: ['Alles', 'Gute', 'zum', 'Geburtstag!'] },
    { en: 'Many happy returns!', de: ['Viel', 'Glück', 'zum', 'Geburtstag!'] },
    { en: 'Best wishes for your birthday!', de: ['Herzlichen', 'Glückwunsch', 'zum', 'Geburtstag!'] },
    { en: 'Everything good for you!', de: ['Ich', 'wünsche', 'dir', 'alles', 'Gute!'] },
    { en: 'Lots of love on your birthday!', de: ['Zum', 'Geburtstag', 'alles', 'Liebe!'] },
  ])
  return buildDe(wish.en, wish.de)
}

function gBuildWishEn(rand: Rand): Question {
  const wish = pick(rand, [
    { de: 'Alles Gute zum Geburtstag!', tokens: ['Happy', 'birthday!'] },
    { de: 'Viel Glück zum Geburtstag!', tokens: ['Good', 'luck', 'on', 'your', 'birthday!'] },
    { de: 'Herzlichen Glückwunsch zum Geburtstag!', tokens: ['Congratulations', 'on', 'your', 'birthday!'] },
    { de: 'Ich wünsche dir alles Gute!', tokens: ['I', 'wish', 'you', 'all', 'the', 'best!'] },
    { de: 'Zum Geburtstag alles Liebe!', tokens: ['Lots', 'of', 'love', 'on', 'your', 'birthday!'] },
    { de: 'Alles Gute zum Geburtstag!', tokens: ['Happy', 'birthday!'] },
  ])
  return buildEn(wish.de, wish.tokens)
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
  [gLetterOrder, gSpeakWish, gRoomMatchDeEn, gBuildWhereDe, gBuildWhereEn, gRoomPicture],
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
