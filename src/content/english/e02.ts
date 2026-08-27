import type { Question, UnitDef } from '../types'
import {
  PICTURE_BANK,
  makeLesson,
  matchQ,
  mcqE,
  mcqFixed,
  orderQ,
  pick,
  pickOthers,
  randInt,
  say,
  shuffle,
  tilesQ,
  unitDef,
  type Rand,
} from './helpers'

const MAGIC_E_PAIRS = [
  ['cap', 'cape'],
  ['hop', 'hope'],
  ['kit', 'kite'],
  ['plan', 'plane'],
  ['tap', 'tape'],
  ['tub', 'tube'],
  ['man', 'mane'],
  ['rid', 'ride'],
  ['win', 'wine'],
]

const MAGIC_E_HINTS: Record<string, string> = {
  a: 'Magic e makes the a say its name!',
  i: 'Magic e makes the i say its name!',
  o: 'Magic e makes the o say its name!',
  u: 'Magic e makes the u say its name!',
}

function gMagicETiles(rand: Rand): Question {
  const [short, long] = pick(rand, MAGIC_E_PAIRS)
  const vowel = [...short].find((c) => 'aeiou'.includes(c)) ?? 'a'
  return tilesQ(`${short} becomes ___`, long, MAGIC_E_HINTS[vowel])
}

const MAGIC_E_WORDS = [
  { w: 'cake', pic: PICTURE_BANK.cake },
  { w: 'kite', pic: PICTURE_BANK.kite },
  { w: 'plane', pic: PICTURE_BANK.plane },
  { w: 'grape', pic: PICTURE_BANK.grape },
  { w: 'stone', pic: PICTURE_BANK.stone },
]

const MAGIC_E_DISTRACTORS = [
  'cape', 'hope', 'tape', 'mane', 'wine', 'ride', 'tube',
  'kite', 'cake', 'plane', 'grape', 'stone', 'bone', 'rose',
  'five', 'nine',
]

function gMagicEPicture(rand: Rand): Question {
  const item = pick(rand, MAGIC_E_WORDS)
  if (randInt(rand, 0, 1) === 0) {
    return mcqE(
      rand,
      'Which magic e word matches the picture?',
      item.w,
      MAGIC_E_DISTRACTORS.filter((d) => d !== item.w),
      { visual: { type: 'emoji-group', emojis: [item.pic] } },
    )
  }
  const others = pickOthers(rand, MAGIC_E_WORDS, item, 3)
  const arts = shuffle(rand, [item.pic, ...others.map((o) => o.pic)])
  return mcqFixed(`Tap the picture of ${item.w}`, arts, arts.indexOf(item.pic), say(item.w))
}

const CLAP_WORDS = [
  { w: 'rabbit', n: 2 },
  { w: 'tiger', n: 2 },
  { w: 'elephant', n: 3 },
  { w: 'umbrella', n: 3 },
  { w: 'garden', n: 2 },
  { w: 'sunset', n: 2 },
  { w: 'pencil', n: 2 },
  { w: 'dinosaur', n: 3 },
  { w: 'butterfly', n: 3 },
  { w: 'river', n: 2 },
  { w: 'robot', n: 2 },
  { w: 'banana', n: 3 },
  { w: 'computer', n: 3 },
  { w: 'winter', n: 2 },
  { w: 'market', n: 2 },
  { w: 'popcorn', n: 2 },
  { w: 'monster', n: 2 },
  { w: 'pirate', n: 2 },
  { w: 'rocket', n: 2 },
  { w: 'ladder', n: 2 },
]

function gHowManyClaps(rand: Rand): Question {
  const item = pick(rand, CLAP_WORDS)
  return mcqFixed(`How many claps in ${item.w}?`, ['1', '2', '3'], item.n - 1, {
    hint: 'Say the word slowly and listen for the beats.',
  })
}

const SYLLABLE_PAIRS = [
  ['rabbit', 'rab·bit'],
  ['tiger', 'ti·ger'],
  ['garden', 'gar·den'],
  ['pencil', 'pen·cil'],
  ['robot', 'rob·ot'],
  ['banana', 'ba·na·na'],
  ['dinosaur', 'di·no·saur'],
  ['popcorn', 'pop·corn'],
  ['butterfly', 'but·ter·fly'],
  ['monster', 'mon·ster'],
  ['rocket', 'rock·et'],
  ['winter', 'win·ter'],
]

function gSyllableMatch(rand: Rand): Question {
  const pairs = shuffle(rand, SYLLABLE_PAIRS.map(([l, r]) => ({ left: l, right: r }))).slice(0, 5)
  return matchQ(rand, 'Match each word to its syllables', pairs)
}

const COMPOUND_PAIRS = [
  ['sun + flower', 'sunflower'],
  ['rain + bow', 'rainbow'],
  ['star + fish', 'starfish'],
  ['foot + ball', 'football'],
  ['tree + house', 'treehouse'],
  ['cup + cake', 'cupcake'],
  ['snow + man', 'snowman'],
  ['tooth + brush', 'toothbrush'],
  ['book + shop', 'bookshop'],
  ['lunch + box', 'lunchbox'],
]

function gCompoundMatch(rand: Rand): Question {
  const pairs = shuffle(rand, COMPOUND_PAIRS.map(([l, r]) => ({ left: l, right: r }))).slice(0, 5)
  return matchQ(rand, 'Build each compound word', pairs)
}

const COMPOUND_PICS = [
  { w: 'snowman', scene: ['❄️', '⛄'] },
  { w: 'starfish', scene: ['⭐', '🐟'] },
  { w: 'football', scene: ['⚽'] },
  { w: 'rainbow', scene: [PICTURE_BANK.rainbow] },
  { w: 'treehouse', scene: ['🌳', '🏠'] },
  { w: 'cupcake', scene: ['🧁'] },
  { w: 'raincoat', scene: ['🌧️', '🧥'] },
  { w: 'sunflower', scene: ['☀️', '🌻'] },
]

const COMPOUND_ALL = [
  ...COMPOUND_PICS.map((p) => p.w),
  'bookshop',
  'toothbrush',
  'lunchbox',
  'snowball',
]

function gCompoundPicture(rand: Rand): Question {
  const item = pick(rand, COMPOUND_PICS)
  if (randInt(rand, 0, 1) === 0) {
    return mcqE(
      rand,
      'Which word names the picture?',
      item.w,
      COMPOUND_ALL.filter((w) => w !== item.w),
      { visual: { type: 'emoji-group', emojis: item.scene } },
    )
  }
  const others = pickOthers(rand, COMPOUND_PICS, item, 3)
  const art = item.scene.join('')
  const arts = shuffle(rand, [art, ...others.map((o) => o.scene.join(''))])
  return mcqFixed(`Tap the picture of ${item.w}`, arts, arts.indexOf(art), say(item.w))
}

const CHUNK_SENTENCES = [
  ['The', 'robot', 'found', 'a', 'lost', 'pencil.'],
  ['My', 'tiger', 'eats', 'bananas', 'for', 'lunch.'],
  ['Popcorn', 'sizzled', 'in', 'the', 'hot', 'pan.'],
  ['A', 'butterfly', 'landed', 'on', 'my', 'nose.'],
  ['Dinosaur', 'prints', 'crossed', 'the', 'muddy', 'path.'],
  ['Winter', 'fog', 'crept', 'over', 'the', 'market.'],
]

function gSyllableSentence(rand: Rand): Question {
  const words = pick(rand, CHUNK_SENTENCES)
  return orderQ('Chunk it! Put the words in order', words, say(words.join(' ')))
}

const CHUNK_CLOZE_ITEMS = [
  { s: 'rab·___', ans: 'bit', opts: ['bit', 'bet', 'bat', 'bud', 'bed'], m: 'a fluffy pet' },
  { s: 'ti·___', ans: 'ger', opts: ['ger', 'ter', 'per', 'ver', 'ner'], m: 'a big striped cat' },
  { s: 'gar·___', ans: 'den', opts: ['den', 'don', 'dan', 'din', 'dun'], m: 'where flowers grow' },
  { s: 'pop·___', ans: 'corn', opts: ['corn', 'cone', 'cart', 'core', 'cord'], m: 'a crunchy snack' },
  { s: 'mon·___', ans: 'ster', opts: ['ster', 'star', 'stor', 'stir', 'step'], m: 'a spooky costume' },
  { s: 'pen·___', ans: 'cil', opts: ['cil', 'cal', 'sil', 'col', 'cul'], m: 'you write with it' },
  { s: 'but·ter·___', ans: 'fly', opts: ['fly', 'fry', 'sly', 'flu', 'flow'], m: 'it flutters to flowers' },
  { s: 'din·o·___', ans: 'saur', opts: ['saur', 'door', 'sore', 'sour', 'store'], m: 'a beast from long ago' },
]

function gChunkCloze(rand: Rand): Question {
  const item = pick(rand, CHUNK_CLOZE_ITEMS)
  return mcqE(rand, `${item.s} (${item.m})`, item.ans, item.opts)
}

const e2l1 = makeLesson(
  'e2l1',
  'Magic e Turns Up the Volume',
  ['2Rw.02'],
  'cream',
  'Magic e!',
  "The sneaky e at the end makes the vowel say its name - loud and proud!",
  [gMagicETiles, gMagicEPicture],
)

const e2l2 = makeLesson(
  'e2l2',
  'Syllable Claps',
  ['2Rw.06'],
  'knuckles',
  'Clap it out!',
  'Every syllable is a beat - clap your way through big words!',
  [gHowManyClaps, gSyllableMatch],
)

const e2l3 = makeLesson(
  'e2l3',
  'Compound Word Factory',
  ['2Rw.06'],
  'amy',
  'Word factory!',
  'Two small words snap together to build one brand-new word!',
  [gCompoundMatch, gCompoundPicture],
)

const e2l4 = makeLesson(
  'e2l4',
  'Chunk It & Read',
  ['2Rw.06', '2Ww.08'],
  'tails',
  'Chunk chomper!',
  'Chomp long words into syllable chunks and read them like a pro!',
  [gSyllableSentence, gChunkCloze],
)

const e2boss = makeLesson(
  'e2boss',
  'Magic e Boss',
  ['2Rw.02', '2Rw.06'],
  'eggman',
  'BOSS TIME!',
  'Magic e and the Syllable Squad challenge you - cast your spelling spells!',
  [gMagicETiles, gHowManyClaps, gCompoundMatch, gChunkCloze],
  gHowManyClaps,
)

export const UNIT_E2: UnitDef = unitDef(
  'e2',
  2,
  'Magic e & Syllable Squad',
  'Cambridge 2Rw.02/.06 - split digraphs & syllables',
  '#1cb0f6',
  '🪄',
  [e2l1, e2l2, e2l3, e2l4, e2boss],
)
