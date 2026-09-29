/** PLAN 169a — Year-1 english generators. Y1-appropriate phonics (DfE
 *  "Letters and Sounds" Phase 2-5: CVC blending, digraphs, adjacent
 *  blends, split digraphs), the DfE Year-1 common exception words and
 *  statutory spelling rules, then sentence punctuation, comprehension and
 *  poetry built from the same small vocabulary.
 *
 *  Vocabulary stays inside src/content/syllabus/y1/english.ts: bank-tier
 *  words (mcq choices, match sides, order items, tiles targets) must pass
 *  the year-1 syllabus or stay short enough to be soft; the grapheme
 *  labels ("sh", "igh") and the intentional near-miss spellings live in
 *  ENGLISH_Y1_TOLERANCE. Prompts, hints, truefalse statements, speak
 *  targets and story lines are text tier (report-only). */

import type { Question } from '../../../types'
import {
  PICTURE_BANK,
  matchQ,
  mcqE,
  mcqFixed,
  orderQ,
  pick,
  pickOthers,
  randInt,
  say,
  shuffle,
  speakQ,
  story,
  tfQ,
  tilesQ,
  type Rand,
} from '../../../english/helpers'

/* ========================= Unit 1 · first sounds ========================= */

/** Four-letter windows of the alphabet, in order (name the letters A-Z). */
const ALPHA_WINDOWS: readonly (readonly string[])[] = [
  ['a', 'b', 'c', 'd'], ['e', 'f', 'g', 'h'], ['i', 'j', 'k', 'l'],
  ['m', 'n', 'o', 'p'], ['q', 'r', 's', 't'], ['u', 'v', 'w', 'x'],
  ['v', 'w', 'x', 'y'], ['w', 'x', 'y', 'z'],
]

export function gY1AlphabetOrder(rand: Rand): Question {
  return orderQ('Put the letters in order', [...pick(rand, ALPHA_WINDOWS)])
}

const NEXT_LETTERS = [
  { w: 'm', a: 'n', o: ['p', 'r', 's'] },
  { w: 'p', a: 'q', o: ['o', 'r', 't'] },
  { w: 't', a: 'u', o: ['s', 'v', 'w'] },
  { w: 'w', a: 'x', o: ['v', 'y', 'z'] },
  { w: 'd', a: 'e', o: ['c', 'f', 'g'] },
  { w: 'k', a: 'l', o: ['j', 'm', 'n'] },
  { w: 'r', a: 's', o: ['q', 't', 'p'] },
  { w: 'v', a: 'w', o: ['u', 'x', 'y'] },
]

export function gY1NextLetter(rand: Rand): Question {
  const it = pick(rand, NEXT_LETTERS)
  return mcqE(rand, `What letter comes after ${it.w}?`, it.a, it.o)
}

const HEAR_CVC = [
  { a: 'cat', o: ['bat', 'cut', 'cap', 'can'] },
  { a: 'dog', o: ['dig', 'log', 'dot', 'dat'] },
  { a: 'sit', o: ['sat', 'set', 'bit', 'pit'] },
  { a: 'hen', o: ['han', 'hit', 'him', 'ten'] },
  { a: 'fox', o: ['fix', 'fax', 'box', 'fun'] },
  { a: 'run', o: ['ran', 'ron', 'rum', 'rim'] },
  { a: 'mug', o: ['mag', 'meg', 'bug', 'mat'] },
  { a: 'cup', o: ['cop', 'cap', 'cut', 'cub'] },
  { a: 'top', o: ['tap', 'tip', 'tot', 'tup'] },
  { a: 'red', o: ['rad', 'rod', 'rid', 'rev'] },
  { a: 'bed', o: ['bad', 'bid', 'bud', 'beg'] },
  { a: 'pig', o: ['peg', 'pin', 'dig', 'fig'] },
]

export function gY1HearWord(rand: Rand): Question {
  const it = pick(rand, HEAR_CVC)
  return mcqE(rand, 'Tap the word you hear', it.a, it.o, say(it.a))
}

const FIRST_SOUND = [
  { w: 'sun', a: 's', o: ['m', 'f', 't'] },
  { w: 'cat', a: 'c', o: ['m', 'p', 's'] },
  { w: 'dog', a: 'd', o: ['b', 'g', 'n'] },
  { w: 'pig', a: 'p', o: ['b', 't', 'd'] },
  { w: 'frog', a: 'f', o: ['r', 'v', 'b'] },
  { w: 'star', a: 's', o: ['t', 'n', 'l'] },
  { w: 'moon', a: 'm', o: ['n', 'l', 'r'] },
  { w: 'bird', a: 'b', o: ['d', 'p', 't'] },
  { w: 'cake', a: 'c', o: ['k', 'g', 's'] },
  { w: 'fish', a: 'f', o: ['v', 's', 'h'] },
  { w: 'duck', a: 'd', o: ['b', 't', 'n'] },
  { w: 'ball', a: 'b', o: ['d', 't', 'p'] },
]

export function gY1FirstSound(rand: Rand): Question {
  const it = pick(rand, FIRST_SOUND)
  return mcqE(rand, `Which letter does ${it.w} start with?`, it.a, it.o)
}

const FINISH_WORD = [
  { gap: 'c_t', a: 'a', o: ['e', 'i', 'o'] },
  { gap: 'd_g', a: 'o', o: ['a', 'e', 'u'] },
  { gap: 's_n', a: 'u', o: ['a', 'e', 'o'] },
  { gap: 'h_n', a: 'e', o: ['a', 'i', 'o'] },
  { gap: 'p_g', a: 'i', o: ['a', 'o', 'u'] },
  { gap: 'f_x', a: 'o', o: ['a', 'e', 'u'] },
  { gap: 'b_d', a: 'e', o: ['a', 'i', 'o'] },
  { gap: 'm_p', a: 'a', o: ['e', 'i', 'o'] },
  { gap: 'l_g', a: 'o', o: ['a', 'e', 'u'] },
  { gap: 'c_p', a: 'u', o: ['a', 'e', 'o'] },
  { gap: 't_n', a: 'u', o: ['a', 'e', 'o'] },
  { gap: 'r_d', a: 'e', o: ['a', 'i', 'o'] },
]

export function gY1FinishWord(rand: Rand): Question {
  const it = pick(rand, FINISH_WORD)
  return mcqE(rand, `Which letter finishes the word? ${it.gap}`, it.a, it.o)
}

const WORD_PIC: { left: string; right: string }[] = [
  { left: 'cat', right: PICTURE_BANK.cat },
  { left: 'dog', right: PICTURE_BANK.dog },
  { left: 'sun', right: PICTURE_BANK.sun },
  { left: 'moon', right: PICTURE_BANK.moon },
  { left: 'star', right: PICTURE_BANK.star },
  { left: 'tree', right: PICTURE_BANK.tree },
  { left: 'fish', right: PICTURE_BANK.fish },
  { left: 'bird', right: PICTURE_BANK.bird },
  { left: 'frog', right: PICTURE_BANK.frog },
  { left: 'duck', right: PICTURE_BANK.duck },
  { left: 'pig', right: PICTURE_BANK.pig },
  { left: 'sheep', right: PICTURE_BANK.sheep },
  { left: 'ball', right: PICTURE_BANK.ball },
  { left: 'car', right: PICTURE_BANK.car },
  { left: 'bus', right: PICTURE_BANK.bus },
  { left: 'hat', right: PICTURE_BANK.hat },
]

export function gY1WordPictureMatch(rand: Rand): Question {
  const pairs = shuffle(rand, WORD_PIC).slice(0, 4)
  return matchQ(rand, 'Match each word to its picture', pairs)
}

const PICK_PIC = [
  { w: 'fish', pic: PICTURE_BANK.fish },
  { w: 'cat', pic: PICTURE_BANK.cat },
  { w: 'sun', pic: PICTURE_BANK.sun },
  { w: 'moon', pic: PICTURE_BANK.moon },
  { w: 'star', pic: PICTURE_BANK.star },
  { w: 'bird', pic: PICTURE_BANK.bird },
  { w: 'duck', pic: PICTURE_BANK.duck },
  { w: 'pig', pic: PICTURE_BANK.pig },
  { w: 'ball', pic: PICTURE_BANK.ball },
  { w: 'car', pic: PICTURE_BANK.car },
  { w: 'bus', pic: PICTURE_BANK.bus },
  { w: 'hat', pic: PICTURE_BANK.hat },
]

export function gY1PictureWord(rand: Rand): Question {
  const item = pick(rand, PICK_PIC)
  if (randInt(rand, 0, 1) === 0) {
    return mcqE(
      rand,
      'Which word matches the picture?',
      item.w,
      PICK_PIC.filter((v) => v.w !== item.w).map((v) => v.w),
      { visual: { type: 'emoji-group', emojis: [item.pic] } },
    )
  }
  const arts = shuffle(rand, [
    item.pic,
    ...pickOthers(rand, PICK_PIC, item, 3).map((o) => o.pic),
  ])
  return mcqFixed(`Tap the picture: ${item.w}`, arts, arts.indexOf(item.pic), say(item.w))
}

const REAL_WORDS = [
  'cat', 'dog', 'sun', 'bed', 'hop', 'fin', 'tap', 'log', 'hen', 'bus',
  'pig', 'mug', 'red', 'box', 'cup',
]
const ALIEN_WORDS = [
  'blom', 'vost', 'glim', 'morp', 'plam', 'zim', 'nasp', 'lorp', 'bram',
  'thop', 'snim', 'zock', 'femp', 'quib', 'mard', 'grull', 'droke', 'wug',
]

export function gY1RealOrAlien(rand: Rand): Question {
  const real = pick(rand, REAL_WORDS)
  return mcqE(rand, 'Which one is a REAL word?', real, pickOthers(rand, ALIEN_WORDS, real, 3))
}

/** Tap-count over grapheme labels: all target cells must be IDENTICAL
 *  (QuestionView matches `c === targetEmoji`), so the drill taps the same
 *  letter pair among look-alike digraphs. Cells are not audited. */
const COLLECT = [
  { s: 'sh', d: ['ch', 'th', 'ng'] },
  { s: 'ch', d: ['sh', 'th', 'ck'] },
  { s: 'th', d: ['sh', 'ch', 'ph'] },
  { s: 'ng', d: ['nk', 'ck', 'wh'] },
  { s: 'ck', d: ['qu', 'ch', 'll'] },
  { s: 'qu', d: ['ck', 'wh', 'ss'] },
  { s: 'ai', d: ['ay', 'ee', 'oa'] },
  { s: 'ee', d: ['ea', 'ai', 'oo'] },
  { s: 'igh', d: ['ie', 'ai', 'ay'] },
  { s: 'oa', d: ['oo', 'ai', 'ee'] },
  { s: 'oo', d: ['oa', 'ou', 'ee'] },
  { s: 'ar', d: ['or', 'er', 'ur'] },
  { s: 'or', d: ['ar', 'er', 'ow'] },
  { s: 'ow', d: ['ou', 'oo', 'oa'] },
  { s: 'oi', d: ['oy', 'ou', 'ay'] },
  { s: 'ue', d: ['ew', 'ou', 'oo'] },
]

export function gY1CollectSound(rand: Rand): Question {
  const it = pick(rand, COLLECT)
  const cells = shuffle(rand, [it.s, it.s, it.s, ...it.d])
  return {
    kind: 'tap-count',
    prompt: `Tap every time you see ${it.s}`,
    target: 3,
    targetEmoji: it.s,
    cells,
    hint: 'Look at each pair of letters.',
  }
}

/* ===================== Unit 2 · digraphs & long vowels ==================== */

const DIGRAPHS = [
  { s: 'sh', a: 'sh', o: ['ch', 'th', 'ng'] },
  { s: 'ch', a: 'ch', o: ['sh', 'th', 'ck'] },
  { s: 'th', a: 'th', o: ['sh', 'ch', 'ph'] },
  { s: 'ng', a: 'ng', o: ['nk', 'ck', 'wh'] },
  { s: 'ck', a: 'ck', o: ['qu', 'ch', 'll'] },
  { s: 'qu', a: 'qu', o: ['ck', 'wh', 'ss'] },
  { s: 'ai', a: 'ai', o: ['ay', 'ee', 'oa'] },
  { s: 'ee', a: 'ee', o: ['ea', 'ai', 'oo'] },
  { s: 'igh', a: 'igh', o: ['ie', 'ai', 'ay'] },
  { s: 'oa', a: 'oa', o: ['oo', 'ai', 'ee'] },
  { s: 'oo', a: 'oo', o: ['oa', 'ou', 'ee'] },
  { s: 'ar', a: 'ar', o: ['or', 'er', 'ur'] },
  { s: 'or', a: 'or', o: ['ar', 'er', 'ow'] },
  { s: 'ow', a: 'ow', o: ['ou', 'oo', 'oa'] },
  { s: 'oi', a: 'oi', o: ['oy', 'ou', 'ay'] },
  { s: 'ue', a: 'ue', o: ['ew', 'ou', 'oo'] },
]

export function gY1DigraphSound(rand: Rand): Question {
  const it = pick(rand, DIGRAPHS)
  return mcqE(rand, `Which letters make the /${it.s}/ sound?`, it.a, it.o)
}

const DIGRAPH_PIC: { left: string; right: string }[] = [
  { left: 'ship', right: '🚢' },
  { left: 'shop', right: PICTURE_BANK.shop },
  { left: 'fish', right: PICTURE_BANK.fish },
  { left: 'chick', right: '🐥' },
  { left: 'rain', right: PICTURE_BANK.rain },
  { left: 'boat', right: PICTURE_BANK.boat },
  { left: 'moon', right: PICTURE_BANK.moon },
  { left: 'sheep', right: PICTURE_BANK.sheep },
  { left: 'cheese', right: PICTURE_BANK.cheese },
  { left: 'duck', right: PICTURE_BANK.duck },
  { left: 'cake', right: PICTURE_BANK.cake },
  { left: 'tree', right: PICTURE_BANK.tree },
  { left: 'train', right: PICTURE_BANK.train },
  { left: 'star', right: PICTURE_BANK.star },
]

export function gY1DigraphMatch(rand: Rand): Question {
  const pairs = shuffle(rand, DIGRAPH_PIC).slice(0, 4)
  return matchQ(rand, 'Match each word to its picture', pairs)
}

const HEAR_LONG = [
  { a: 'cake', o: ['cat', 'car', 'can', 'cap'] },
  { a: 'kite', o: ['kit', 'king', 'kick', 'kid'] },
  { a: 'home', o: ['hop', 'hot', 'ham', 'hen'] },
  { a: 'bone', o: ['bot', 'box', 'bun', 'bed'] },
  { a: 'rule', o: ['rug', 'run', 'rub', 'rut'] },
  { a: 'rose', o: ['rob', 'rod', 'rip', 'rug'] },
  { a: 'mule', o: ['mud', 'mug', 'men', 'mat'] },
  { a: 'snake', o: ['snag', 'snap', 'sack', 'sad'] },
  { a: 'wheel', o: ['well', 'will', 'wall', 'wet'] },
  { a: 'goat', o: ['god', 'got', 'get', 'gap'] },
  { a: 'moon', o: ['man', 'men', 'map', 'mat'] },
  { a: 'tree', o: ['top', 'tag', 'ten', 'tap'] },
]

export function gY1HearLong(rand: Rand): Question {
  const it = pick(rand, HEAR_LONG)
  return mcqE(rand, 'Tap the word you hear', it.a, it.o, say(it.a))
}

const LONG_PIC = [
  { w: 'cake', pic: PICTURE_BANK.cake },
  { w: 'kite', pic: PICTURE_BANK.kite },
  { w: 'plane', pic: PICTURE_BANK.plane },
  { w: 'grape', pic: PICTURE_BANK.grape },
  { w: 'goat', pic: PICTURE_BANK.goat },
  { w: 'boat', pic: PICTURE_BANK.boat },
  { w: 'moon', pic: PICTURE_BANK.moon },
  { w: 'tree', pic: PICTURE_BANK.tree },
  { w: 'leaf', pic: PICTURE_BANK.leaf },
  { w: 'rain', pic: PICTURE_BANK.rain },
]

export function gY1LongVowelWord(rand: Rand): Question {
  const item = pick(rand, LONG_PIC)
  return mcqE(
    rand,
    'Which word names the picture?',
    item.w,
    LONG_PIC.filter((v) => v.w !== item.w).map((v) => v.w),
    { visual: { type: 'emoji-group', emojis: [item.pic] } },
  )
}

const ODD_SOUND = [
  { a: 'pig', o: ['cat', 'hat', 'mat'] },
  { a: 'dog', o: ['cat', 'hen', 'pig'] },
  { a: 'sun', o: ['cat', 'dog', 'bed'] },
  { a: 'bed', o: ['sit', 'dog', 'sun'] },
  { a: 'star', o: ['cat', 'dog', 'sun'] },
  { a: 'boat', o: ['cat', 'hen', 'pig'] },
  { a: 'cake', o: ['cat', 'hat', 'mat'] },
  { a: 'sheep', o: ['cat', 'dog', 'bed'] },
  { a: 'moon', o: ['cat', 'hen', 'bed'] },
  { a: 'frog', o: ['hen', 'sun', 'bed'] },
]

export function gY1OddSound(rand: Rand): Question {
  const it = pick(rand, ODD_SOUND)
  return mcqE(rand, 'Which word has a different sound?', it.a, it.o)
}

const ODD_SPLIT = [
  { a: 'cat', o: ['cake', 'kite', 'home'] },
  { a: 'dog', o: ['bone', 'mule', 'rose'] },
  { a: 'sun', o: ['rule', 'snake', 'cake'] },
  { a: 'pig', o: ['kite', 'cake', 'home'] },
  { a: 'hen', o: ['rose', 'rule', 'bone'] },
  { a: 'bus', o: ['mule', 'rule', 'rose'] },
  { a: 'hop', o: ['home', 'bone', 'rose'] },
  { a: 'cat', o: ['cake', 'plane', 'grape'] },
]

export function gY1OddSplit(rand: Rand): Question {
  const it = pick(rand, ODD_SPLIT)
  return mcqE(rand, 'Which word does NOT have a split digraph?', it.a, it.o)
}

/* ================= Unit 3 · blends & decodable words ==================== */

const BLEND_PIC = [
  { w: 'frog', pic: PICTURE_BANK.frog },
  { w: 'star', pic: PICTURE_BANK.star },
  { w: 'train', pic: PICTURE_BANK.train },
  { w: 'boat', pic: PICTURE_BANK.boat },
  { w: 'hand', pic: PICTURE_BANK.hand },
  { w: 'milk', pic: PICTURE_BANK.milk },
  { w: 'cloud', pic: PICTURE_BANK.cloud },
  { w: 'snail', pic: PICTURE_BANK.snail },
  { w: 'bread', pic: PICTURE_BANK.bread },
  { w: 'sheep', pic: PICTURE_BANK.sheep },
  { w: 'plane', pic: PICTURE_BANK.plane },
  { w: 'bridge', pic: PICTURE_BANK.bridge },
  { w: 'crown', pic: PICTURE_BANK.crown },
  { w: 'clock', pic: PICTURE_BANK.clock },
]

export function gY1BlendWord(rand: Rand): Question {
  const item = pick(rand, BLEND_PIC)
  return mcqE(
    rand,
    'Tap the word for this picture',
    item.w,
    BLEND_PIC.filter((v) => v.w !== item.w).map((v) => v.w),
    { visual: { type: 'emoji-group', emojis: [item.pic] } },
  )
}

const COLLECT_BLEND = [
  { s: 'st', d: ['sp', 'sk', 'sw'] },
  { s: 'tr', d: ['dr', 'cr', 'gr'] },
  { s: 'bl', d: ['pl', 'cl', 'fl'] },
  { s: 'cl', d: ['fl', 'gl', 'bl'] },
  { s: 'fr', d: ['br', 'gr', 'dr'] },
  { s: 'gr', d: ['fr', 'br', 'cr'] },
  { s: 'pl', d: ['bl', 'cl', 'fl'] },
  { s: 'br', d: ['pr', 'cr', 'gr'] },
  { s: 'sn', d: ['sw', 'sm', 'sl'] },
  { s: 'sp', d: ['st', 'sk', 'sw'] },
]

export function gY1CollectBlend(rand: Rand): Question {
  const it = pick(rand, COLLECT_BLEND)
  const cells = shuffle(rand, [it.s, it.s, it.s, ...it.d])
  return {
    kind: 'tap-count',
    prompt: `Tap every time you see ${it.s}`,
    target: 3,
    targetEmoji: it.s,
    cells,
    hint: 'Say the start of each pair.',
  }
}

/* ==================== Unit 4 · common exception words =================== */

const SPELL_RIGHT = [
  { a: 'said', o: ['sed', 'sayd', 'saed'] },
  { a: 'friend', o: ['frend', 'frind', 'frendz'] },
  { a: 'they', o: ['thee', 'thay', 'theye'] },
  { a: 'school', o: ['skol', 'shool', 'scool'] },
  { a: 'house', o: ['hous', 'howse', 'hows'] },
  { a: 'love', o: ['luv', 'lov', 'lave'] },
  { a: 'once', o: ['ones', 'wuns', 'wunce'] },
  { a: 'come', o: ['cum', 'com', 'cume'] },
  { a: 'some', o: ['sum', 'som', 'somee'] },
  { a: 'ask', o: ['esk', 'askd', 'aks'] },
  { a: 'where', o: ['wer', 'wher', 'whare'] },
  { a: 'full', o: ['ful', 'fulll', 'fuul'] },
]

export function gY1WhichSpelling(rand: Rand): Question {
  const it = pick(rand, SPELL_RIGHT)
  return mcqE(rand, 'Which one is spelled right?', it.a, it.o)
}

const TRICKY_TILES = [
  { w: 'said', p: 's__d' },
  { w: 'they', p: 'th_y' },
  { w: 'friend', p: 'fr__nd' },
  { w: 'school', p: 'sch__l' },
  { w: 'house', p: 'h__se' },
  { w: 'love', p: 'l__ve' },
  { w: 'come', p: 'c__me' },
  { w: 'some', p: 's__me' },
  { w: 'once', p: 'o__e' },
  { w: 'where', p: 'wh__e' },
  { w: 'full', p: 'f__l' },
  { w: 'push', p: 'p__h' },
  { w: 'pull', p: 'p__l' },
  { w: 'today', p: 't__ay' },
  { w: 'here', p: 'h__e' },
  { w: 'there', p: 'th__e' },
]

export function gY1TrickyTiles(rand: Rand): Question {
  const it = pick(rand, TRICKY_TILES)
  return tilesQ(`Spell the tricky word: ${it.p}`, it.w, 'Say it, then tap the tiles.')
}

const TRICKY_PIC: { left: string; right: string }[] = [
  { left: 'house', right: PICTURE_BANK.house },
  { left: 'school', right: PICTURE_BANK.school },
  { left: 'sun', right: PICTURE_BANK.sun },
  { left: 'star', right: PICTURE_BANK.star },
  { left: 'cat', right: PICTURE_BANK.cat },
  { left: 'dog', right: PICTURE_BANK.dog },
  { left: 'moon', right: PICTURE_BANK.moon },
  { left: 'ball', right: PICTURE_BANK.ball },
  { left: 'hat', right: PICTURE_BANK.hat },
  { left: 'bed', right: PICTURE_BANK.bed },
  { left: 'car', right: PICTURE_BANK.car },
  { left: 'bus', right: PICTURE_BANK.bus },
]

export function gY1TrickyMatch(rand: Rand): Question {
  const pairs = shuffle(rand, TRICKY_PIC).slice(0, 4)
  return matchQ(rand, 'Match each tricky word to its picture', pairs)
}

const TRICKY_SENTENCES: readonly (readonly string[])[] = [
  ['we', 'love', 'our', 'school'],
  ['i', 'can', 'see', 'you'],
  ['my', 'friend', 'is', 'here'],
  ['they', 'go', 'to', 'school'],
  ['come', 'and', 'play'],
  ['one', 'red', 'car'],
  ['i', 'have', 'a', 'dog'],
  ['she', 'is', 'my', 'friend'],
  ['we', 'put', 'it', 'on'],
  ['do', 'you', 'see', 'me'],
  ['he', 'can', 'run', 'fast'],
  ['it', 'is', 'so', 'big'],
]

export function gY1TrickySentence(rand: Rand): Question {
  return orderQ('Put the words in order to make a sentence', [...pick(rand, TRICKY_SENTENCES)])
}

/* ===================== Unit 5 · statutory spelling rules ================= */

const DOUBLE_RIGHT = [
  { a: 'buzz', o: ['buz', 'buss', 'buzze'] },
  { a: 'miss', o: ['mis', 'misse', 'mmiss'] },
  { a: 'well', o: ['wel', 'welle', 'weell'] },
  { a: 'off', o: ['of', 'offe', 'ofe'] },
  { a: 'bell', o: ['bel', 'belle', 'beell'] },
  { a: 'hill', o: ['hil', 'hille', 'hiill'] },
  { a: 'duck', o: ['duc', 'duk', 'dukk'] },
  { a: 'sock', o: ['sok', 'socke', 'sook'] },
  { a: 'kiss', o: ['kis', 'kisse', 'kiiss'] },
  { a: 'fizz', o: ['fiz', 'fizze', 'fiizz'] },
]

export function gY1Doubled(rand: Rand): Question {
  const it = pick(rand, DOUBLE_RIGHT)
  return mcqE(rand, 'Which word doubles its last letter?', it.a, it.o)
}

const CK_RIGHT = [
  { a: 'back', o: ['bac', 'bakk', 'baak'] },
  { a: 'kick', o: ['kic', 'kik', 'kikk'] },
  { a: 'duck', o: ['duc', 'duk', 'dook'] },
  { a: 'lock', o: ['loc', 'lok', 'lokk'] },
  { a: 'sack', o: ['sac', 'sak', 'saak'] },
  { a: 'neck', o: ['nec', 'nek', 'neek'] },
  { a: 'pick', o: ['pic', 'pik', 'peek'] },
  { a: 'rock', o: ['roc', 'rok', 'rook'] },
]

export function gY1CKRule(rand: Rand): Question {
  const it = pick(rand, CK_RIGHT)
  return mcqE(rand, 'Which word ends with the /k/ sound written ck?', it.a, it.o)
}

const NK_WORDS = ['bank', 'think', 'honk', 'sunk', 'pink', 'drink', 'trunk', 'wink']
const NON_NK = ['back', 'hand', 'milk', 'sun', 'dog', 'cat', 'bed', 'fox']

export function gY1NKWord(rand: Rand): Question {
  const answer = pick(rand, NK_WORDS)
  return mcqE(
    rand,
    'Which word ends with the /ŋk/ sound written nk?',
    answer,
    pickOthers(rand, NON_NK, answer, 3),
  )
}

const TCH_WORDS = ['catch', 'fetch', 'kitchen', 'notch', 'hutch']
const NON_TCH = ['cat', 'chip', 'much', 'lunch', 'rich', 'chin']

export function gY1TchWord(rand: Rand): Question {
  const answer = pick(rand, TCH_WORDS)
  return mcqE(
    rand,
    'Which word has the letters tch in it?',
    answer,
    pickOthers(rand, NON_TCH, answer, 3),
  )
}

const BEATS = [
  { w: 'cat', n: 1 }, { w: 'dog', n: 1 }, { w: 'rabbit', n: 2 },
  { w: 'yellow', n: 2 }, { w: 'carrot', n: 2 }, { w: 'butterfly', n: 3 },
  { w: 'elephant', n: 3 }, { w: 'garden', n: 2 }, { w: 'family', n: 3 },
  { w: 'happy', n: 2 }, { w: 'before', n: 2 }, { w: 'morning', n: 2 },
  { w: 'button', n: 2 }, { w: 'pocket', n: 2 },
]

export function gY1ClapBeats(rand: Rand): Question {
  const it = pick(rand, BEATS)
  return {
    kind: 'type-number',
    prompt: `How many beats in ${it.w}?`,
    answer: it.n,
    hint: 'Say it slowly and clap.',
  }
}

/* ======================= Unit 6 · word endings ========================== */

const PLURALS: { left: string; right: string }[] = [
  { left: 'cat', right: 'cats' },
  { left: 'dog', right: 'dogs' },
  { left: 'fox', right: 'foxes' },
  { left: 'tree', right: 'trees' },
  { left: 'ball', right: 'balls' },
  { left: 'boat', right: 'boats' },
  { left: 'bird', right: 'birds' },
  { left: 'frog', right: 'frogs' },
  { left: 'star', right: 'stars' },
  { left: 'pig', right: 'pigs' },
  { left: 'apple', right: 'apples' },
  { left: 'egg', right: 'eggs' },
]

export function gY1Plural(rand: Rand): Question {
  const pairs = shuffle(rand, PLURALS).slice(0, 4)
  return matchQ(rand, 'Match each word to its plural', pairs)
}

const SUFFIXES = [
  { base: 'jump', end: 'ing', a: 'jumping', o: ['jumpin', 'jummping', 'jumpeng'] },
  { base: 'play', end: 'ed', a: 'played', o: ['plaied', 'playd', 'playeed'] },
  { base: 'walk', end: 'ed', a: 'walked', o: ['walkd', 'walkeed', 'walket'] },
  { base: 'help', end: 'ed', a: 'helped', o: ['helpd', 'helpet', 'helpes'] },
  { base: 'jump', end: 'ed', a: 'jumped', o: ['jumpd', 'jumpet', 'jumpped'] },
  { base: 'look', end: 'ed', a: 'looked', o: ['lookd', 'loooked', 'looket'] },
  { base: 'smile', end: 'ed', a: 'smiled', o: ['smild', 'smileed', 'smiiled'] },
  { base: 'laugh', end: 'ing', a: 'laughing', o: ['laughin', 'laugheng', 'lauging'] },
]

export function gY1SuffixIng(rand: Rand): Question {
  const it = pick(rand, SUFFIXES)
  return mcqE(rand, `Add "${it.end}" to "${it.base}". Which spelling is right?`, it.a, it.o)
}

const ER_EST: { left: string; right: string }[] = [
  { left: 'quick', right: 'quicker' },
  { left: 'fresh', right: 'fresher' },
  { left: 'grand', right: 'grander' },
  { left: 'old', right: 'oldest' },
  { left: 'new', right: 'newest' },
  { left: 'long', right: 'longest' },
  { left: 'big', right: 'bigger' },
  { left: 'small', right: 'smaller' },
]

export function gY1SuffixErEst(rand: Rand): Question {
  const pairs = shuffle(rand, ER_EST).slice(0, 4)
  return matchQ(rand, 'Match each word to its -er or -est form', pairs)
}

const UN_WORDS: { left: string; right: string }[] = [
  { left: 'happy', right: 'unhappy' },
  { left: 'fair', right: 'unfair' },
  { left: 'lock', right: 'unlock' },
  { left: 'load', right: 'unload' },
  { left: 'do', right: 'undo' },
  { left: 'tie', right: 'untie' },
]

export function gY1UnPrefix(rand: Rand): Question {
  const pairs = shuffle(rand, UN_WORDS).slice(0, 4)
  return matchQ(rand, 'Match each word to its un- word', pairs)
}

const COMPOUNDS = [
  { a: 'football', parts: 'foot + ball', o: ['footbal', 'footbll', 'fooball'] },
  { a: 'playground', parts: 'play + ground', o: ['playound', 'playgron', 'playgon'] },
  { a: 'farmyard', parts: 'farm + yard', o: ['farmyrd', 'farmyad', 'farmyart'] },
  { a: 'bedroom', parts: 'bed + room', o: ['bedrom', 'bedruum', 'bedrem'] },
  { a: 'blackberry', parts: 'black + berry', o: ['blakbry', 'blacbry', 'blackbri'] },
  { a: 'rainbow', parts: 'rain + bow', o: ['rainbo', 'rainbw', 'raynbow'] },
]

export function gY1Compound(rand: Rand): Question {
  const it = pick(rand, COMPOUNDS)
  return mcqE(rand, `What does ${it.parts} make?`, it.a, it.o)
}

const Y_ENDINGS = [
  { a: 'happy', o: ['hop', 'happ', 'hapy'] },
  { a: 'funny', o: ['fun', 'funn', 'funne'] },
  { a: 'party', o: ['part', 'parte', 'partry'] },
  { a: 'family', o: ['famly', 'famili', 'fammily'] },
  { a: 'sunny', o: ['sun', 'suny', 'sonny'] },
  { a: 'dry', o: ['die', 'drye', 'drie'] },
  { a: 'fly', o: ['flie', 'flye', 'fli'] },
  { a: 'baby', o: ['bab', 'babe', 'babi'] },
]

export function gY1YEndings(rand: Rand): Question {
  const it = pick(rand, Y_ENDINGS)
  return mcqE(rand, 'Which word ends with the letter y?', it.a, it.o)
}

/* ==================== Unit 7 · sentences & punctuation =================== */

const CAPITALS = [
  { a: 'The cat sat on the mat.', o: ['the cat sat on the mat.', 'the Cat sat on the mat.'] },
  { a: 'I can see a fish.', o: ['i can see a fish.', 'i Can see a fish.'] },
  { a: 'We love our school.', o: ['we love our school.', 'we Love our school.'] },
  { a: 'My friend is here.', o: ['my friend is here.', 'my Friend is here.'] },
  { a: 'It is a big dog.', o: ['it is a big dog.', 'it is a Big dog.'] },
  { a: 'He has a red car.', o: ['he has a red car.', 'he has a Red car.'] },
  { a: 'They are at the park.', o: ['they are at the park.', 'they are at the Park.'] },
  { a: 'She can jump far.', o: ['she can jump far.', 'she can Jump far.'] },
]

export function gY1CapitalPick(rand: Rand): Question {
  const it = pick(rand, CAPITALS)
  return mcqE(rand, 'Which sentence starts with a capital letter?', it.a, it.o)
}

const END_MARKS = [
  { s: 'The sun is hot.', a: 'full stop' },
  { s: 'Where is the cat?', a: 'question mark' },
  { s: 'What a big fish!', a: 'exclamation mark' },
  { s: 'I can see the sea.', a: 'full stop' },
  { s: 'Look at me!', a: 'exclamation mark' },
  { s: 'Can you see a dog?', a: 'question mark' },
  { s: 'The dog is red.', a: 'full stop' },
  { s: 'What is that?', a: 'question mark' },
]
const MARKS = ['full stop', 'question mark', 'exclamation mark']

export function gY1EndMark(rand: Rand): Question {
  const it = pick(rand, END_MARKS)
  return mcqE(rand, `Which mark ends this sentence? "${it.s}"`, it.a, MARKS.filter((m) => m !== it.a))
}

const BUILD_SENTENCES: readonly (readonly string[])[] = [
  ['the', 'dog', 'can', 'run'],
  ['i', 'see', 'a', 'big', 'fish'],
  ['my', 'cat', 'is', 'red'],
  ['we', 'play', 'in', 'the', 'sun'],
  ['she', 'can', 'jump', 'far'],
  ['he', 'has', 'a', 'red', 'car'],
  ['it', 'is', 'a', 'good', 'day'],
  ['they', 'are', 'in', 'the', 'den'],
  ['we', 'all', 'love', 'school'],
  ['come', 'and', 'sit', 'here'],
  ['do', 'you', 'like', 'cake'],
  ['i', 'can', 'write', 'my', 'name'],
]

export function gY1BuildSentence(rand: Rand): Question {
  return orderQ('Put the words in order to make a sentence', [...pick(rand, BUILD_SENTENCES)])
}

const JOINS = [
  { s: 'I like fish ___ I like cake', a: 'and', o: ['but', 'so', 'the'] },
  { s: 'You ___ me', a: 'and', o: ['but', 'so', 'in'] },
  { s: 'It is small ___ it is nice', a: 'but', o: ['and', 'so', 'or'] },
  { s: 'I like cats ___ not dogs', a: 'but', o: ['and', 'so', 'a'] },
  { s: 'It is fun ___ we play', a: 'so', o: ['and', 'but', 'to'] },
  { s: 'I was tired ___ I slept', a: 'so', o: ['and', 'but', 'my'] },
  { s: 'Red ___ blue', a: 'or', o: ['and', 'but', 'so'] },
  { s: 'We go ___ school', a: 'to', o: ['and', 'but', 'a'] },
]

export function gY1JoinWord(rand: Rand): Question {
  const it = pick(rand, JOINS)
  return mcqE(rand, `Which word joins the sentence? ${it.s}`, it.a, it.o)
}

const SENTENCE_TF = [
  { st: 'The cat sat on the mat.', a: true },
  { st: 'the cat sat on the mat.', a: false },
  { st: 'Where is the dog?', a: true },
  { st: 'where is the dog.', a: false },
  { st: 'What a big fish!', a: true },
  { st: 'what a big fish.', a: false },
  { st: 'We love school.', a: true },
  { st: 'we love school', a: false },
  { st: 'I can see you.', a: true },
  { st: 'i can see you.', a: false },
]

export function gY1SentenceTF(rand: Rand): Question {
  const it = pick(rand, SENTENCE_TF)
  return tfQ('Is this sentence written right?', it.st, it.a, {
    hint: 'Check the first letter and the end mark.',
  })
}

/* ======================= Unit 8 · stories & meaning ====================== */

const STORY_EVENTS: readonly (readonly string[])[] = [
  ['A fox saw a bird.', 'The fox was hungry.', 'The fox ran home.'],
  ['The cat saw a fish.', 'The cat was hungry.', 'The cat ate the fish.'],
  ['A dog found a ball.', 'The dog played all day.', 'The dog slept in bed.'],
  ['The hen laid an egg.', 'A fox came near the den.', 'The fox ran away.'],
  ['I got a new kite.', 'The wind blew it high.', 'I ran to get it.'],
  ['Sam put on his coat.', 'Sam walked to the gate.', 'Sam met his friend.'],
]

export function gY1StorySequence(rand: Rand): Question {
  return orderQ('Put the story events in order', [...pick(rand, STORY_EVENTS)])
}

const FOX_STORY = story('The Hungry Fox', ['🦊', '🐦', '🌳'], [
  'A fox is in the wood.',
  'A bird sits in the tree.',
  'The fox is hungry.',
])
const CAT_STORY = story('The Hungry Cat', ['🐱', '🐟', '🌧️'], [
  'The cat sits by the pond.',
  'It sees a big fish.',
  'The cat is hungry too.',
])
const HEN_STORY = story('The Fox and the Hen', ['🦊', '🐔', '🏠'], [
  'The hen is in the yard.',
  'A fox comes near the gate.',
  'The fox runs away.',
])

const STORY_TF = [
  { panel: FOX_STORY, st: 'The fox is hungry.', a: true },
  { panel: FOX_STORY, st: 'The fox can fly.', a: false },
  { panel: CAT_STORY, st: 'The cat saw a fish.', a: true },
  { panel: CAT_STORY, st: 'The dog is in the story.', a: false },
  { panel: HEN_STORY, st: 'The fox ran away.', a: true },
  { panel: HEN_STORY, st: 'The hen can fly.', a: false },
]

export function gY1StoryTF(rand: Rand): Question {
  const it = pick(rand, STORY_TF)
  return tfQ('True or false?', it.st, it.a, { story: it.panel })
}

const PREDICT = [
  { s: 'The cat is hungry.', a: 'The cat eats fish.', o: ['The cat flies away.', 'The cat turns blue.'] },
  { s: 'It starts to rain.', a: 'We get our coats.', o: ['We eat the rain.', 'We give away the coats.'] },
  { s: 'Sam is at the gate.', a: 'Sam walks to school.', o: ['Sam eats his coat.', 'Sam turns into a fish.'] },
  { s: 'The wind blows hard.', a: 'The kite flies high.', o: ['The kite melts.', 'The kite turns red.'] },
  { s: 'The dog found a ball.', a: 'They play together.', o: ['They eat the ball.', 'It is morning.'] },
  { s: 'I am tired.', a: 'I go to bed.', o: ['I eat a rock.', 'I fly away.'] },
]

export function gY1Predict(rand: Rand): Question {
  const it = pick(rand, PREDICT)
  return mcqE(rand, `What happens next? ${it.s}`, it.a, it.o)
}

const TITLES = [
  { q: 'a story about a fish', a: 'The Big Fish', o: ['The Red Car', 'My Hat'] },
  { q: 'a story about a dog', a: 'The Dog Ran', o: ['The Sun Is Hot', 'A Big Fish'] },
  { q: 'a story about rain', a: 'Rain Rain Go Away', o: ['The Cat Sat', 'One Red Car'] },
  { q: 'a story about school', a: 'My First Day', o: ['The Sun Is Hot', 'A Red Car'] },
  { q: 'a story about a fox', a: 'The Hungry Fox', o: ['The Big Fish', 'My Hat'] },
  { q: 'a story about night', a: 'Good Night Moon', o: ['A Dog Ran', 'The Sun Is Up'] },
]

export function gY1StoryTitle(rand: Rand): Question {
  const it = pick(rand, TITLES)
  return mcqE(rand, `Which title fits ${it.q}?`, it.a, it.o)
}

const TELL_LINES = [
  'The cat sat on the mat.',
  'I can see a big fish.',
  'We love our school.',
  'The dog ran to the ball.',
  'It is a red kite.',
  'My friend is here.',
  'The sun is hot today.',
  'We play in the garden.',
]

export function gY1TellIt(rand: Rand): Question {
  return speakQ('Read the sentence out loud.', pick(rand, TELL_LINES), {
    hint: 'Speak slowly and clearly.',
  })
}

/* ========================= Unit 9 · word wizard ========================= */

const ODD_CATEGORY = [
  { q: 'These are all animals. Which one is not?', a: 'car', o: ['cat', 'dog', 'fish'] },
  { q: 'These are all fruit. Which one is not?', a: 'carrot', o: ['apple', 'banana', 'grape'] },
  { q: 'These are all vehicles. Which one is not?', a: 'fish', o: ['car', 'bus', 'train'] },
  { q: 'These are all colours. Which one is not?', a: 'big', o: ['red', 'blue', 'green'] },
  { q: 'These are all body parts. Which one is not?', a: 'moon', o: ['hand', 'foot', 'eye'] },
  { q: 'These are all places. Which one is not?', a: 'cat', o: ['school', 'shop', 'castle'] },
]

export function gY1OddCategory(rand: Rand): Question {
  const it = pick(rand, ODD_CATEGORY)
  return mcqE(rand, it.q, it.a, it.o)
}

const OPPOSITE_PAIRS: { left: string; right: string }[] = [
  { left: 'big', right: 'little' },
  { left: 'hot', right: 'cold' },
  { left: 'up', right: 'down' },
  { left: 'fast', right: 'slow' },
  { left: 'new', right: 'old' },
  { left: 'good', right: 'bad' },
  { left: 'wet', right: 'dry' },
  { left: 'in', right: 'out' },
  { left: 'near', right: 'far' },
  { left: 'day', right: 'night' },
]

export function gY1Opposites(rand: Rand): Question {
  const pairs = shuffle(rand, OPPOSITE_PAIRS).slice(0, 4)
  return matchQ(rand, 'Match each word to its opposite', pairs)
}

const OPPOSITE_PICK = [
  { w: 'big', a: 'little', o: ['hot', 'red', 'fast'] },
  { w: 'hot', a: 'cold', o: ['big', 'wet', 'new'] },
  { w: 'up', a: 'down', o: ['in', 'over', 'near'] },
  { w: 'fast', a: 'slow', o: ['big', 'red', 'new'] },
  { w: 'new', a: 'old', o: ['bad', 'red', 'big'] },
  { w: 'day', a: 'night', o: ['red', 'up', 'cold'] },
  { w: 'wet', a: 'dry', o: ['bad', 'old', 'in'] },
  { w: 'sad', a: 'happy', o: ['red', 'big', 'up'] },
]

export function gY1OppositePick(rand: Rand): Question {
  const it = pick(rand, OPPOSITE_PICK)
  return mcqE(rand, `What is the opposite of ${it.w}?`, it.a, it.o)
}

const YOUNG = [
  { q: 'Which word means a young cat?', a: 'kitten', o: ['puppy', 'lamb', 'hen'] },
  { q: 'Which word means a young dog?', a: 'puppy', o: ['kitten', 'cow', 'hen'] },
  { q: 'Which word means a young bird?', a: 'chick', o: ['lamb', 'puppy', 'sheep'] },
  { q: 'Which word means a young sheep?', a: 'lamb', o: ['chick', 'puppy', 'cow'] },
]

export function gY1YoungAnimal(rand: Rand): Question {
  const it = pick(rand, YOUNG)
  return mcqE(rand, it.q, it.a, it.o)
}

/* ========================= Unit 10 · poems & rhymes ====================== */

const RHYME = [
  { w: 'cat', a: 'hat', o: ['dog', 'sun', 'bed'] },
  { w: 'star', a: 'car', o: ['fish', 'bed', 'sun'] },
  { w: 'tree', a: 'bee', o: ['cat', 'dog', 'hat'] },
  { w: 'sun', a: 'run', o: ['bed', 'cat', 'fox'] },
  { w: 'bed', a: 'red', o: ['sun', 'dog', 'hat'] },
  { w: 'box', a: 'fox', o: ['cat', 'sun', 'tree'] },
  { w: 'boat', a: 'goat', o: ['fish', 'bed', 'hat'] },
  { w: 'house', a: 'mouse', o: ['sun', 'cat', 'tree'] },
  { w: 'top', a: 'hop', o: ['bed', 'fox', 'sun'] },
  { w: 'rain', a: 'train', o: ['dog', 'hat', 'bed'] },
]

export function gY1FindRhyme(rand: Rand): Question {
  const it = pick(rand, RHYME)
  return mcqE(rand, `Which word rhymes with ${it.w}?`, it.a, it.o)
}

const RHYME_PAIRS: { left: string; right: string }[] = [
  { left: 'cat', right: 'hat' },
  { left: 'star', right: 'car' },
  { left: 'bed', right: 'red' },
  { left: 'box', right: 'fox' },
  { left: 'top', right: 'hop' },
  { left: 'boat', right: 'goat' },
  { left: 'rain', right: 'train' },
  { left: 'tree', right: 'bee' },
  { left: 'sun', right: 'run' },
  { left: 'house', right: 'mouse' },
]

export function gY1RhymeMatch(rand: Rand): Question {
  const pairs = shuffle(rand, RHYME_PAIRS).slice(0, 4)
  return matchQ(rand, 'Match each word to a word that rhymes', pairs)
}

const POEM_LINES = [
  { s: 'Twinkle twinkle little ___', a: 'star', o: ['bed', 'cat', 'sun'] },
  { s: 'Rain rain go ___', a: 'away', o: ['cat', 'red', 'up'] },
  { s: 'Jack and Jill went up the ___', a: 'hill', o: ['sea', 'bed', 'car'] },
  { s: 'Humpty Dumpty sat on a ___', a: 'wall', o: ['dog', 'sun', 'fish'] },
  { s: 'Rock a bye ___', a: 'baby', o: ['dog', 'car', 'star'] },
  { s: 'Three blind mice, see how they ___', a: 'run', o: ['sat', 'hat', 'bed'] },
  { s: 'Baa baa black sheep, have you any ___', a: 'wool', o: ['cat', 'sun', 'car'] },
]

export function gY1PoemLine(rand: Rand): Question {
  const it = pick(rand, POEM_LINES)
  return mcqE(rand, `Finish the line: ${it.s}`, it.a, it.o)
}

const POEM_ORDER: readonly (readonly string[])[] = [
  ['Twinkle twinkle little star', 'How I wonder what you are', 'Up above the world so high'],
  ['Baa baa black sheep', 'Have you any wool', 'Yes sir, three bags full'],
  ['Jack and Jill went up the hill', 'To fetch a pail of water', 'Jack fell down and broke his crown'],
  ['Row row row your boat', 'Gently down the stream', 'Merrily merrily merrily merrily'],
  ['One two buckle my shoe', 'Three four knock at the door', 'Five six pick up sticks'],
]

export function gY1PoemOrder(rand: Rand): Question {
  return orderQ('Put the poem lines in order', [...pick(rand, POEM_ORDER)])
}

const POEM_SAY = [
  'Twinkle twinkle little star',
  'Rain rain go away',
  'Baa baa black sheep',
  'Humpty Dumpty sat on a wall',
  'Jack and Jill went up the hill',
  'Row row row your boat',
]

export function gY1PoemSpeak(rand: Rand): Question {
  return speakQ('Read the line out loud.', pick(rand, POEM_SAY), {
    hint: 'Clap the beats as you read.',
  })
}
