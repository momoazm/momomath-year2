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
  tfQ,
  tilesQ,
  unitDef,
  type Rand,
} from './helpers'

const HEAR_WORD_ITEMS = [
  { answer: 'how', others: ['low', 'cow', 'now', 'row', 'wow', 'law'] },
  { answer: 'low', others: ['how', 'law', 'leg', 'log', 'lot'] },
  { answer: 'hot', others: ['cold', 'hat', 'hop', 'cot', 'hit'] },
  { answer: 'cold', others: ['gold', 'cord', 'card', 'old', 'cod'] },
  { answer: 'read', others: ['road', 'head', 'bread', 'bead', 'red'] },
  { answer: 'live', others: ['love', 'five', 'give', 'line', 'life'] },
  { answer: 'wind', others: ['find', 'kind', 'mind', 'wand', 'win'] },
]

function gHearTheWord(rand: Rand): Question {
  const item = pick(rand, HEAR_WORD_ITEMS)
  return mcqE(rand, 'Tap the word you hear', item.answer, item.others, say(item.answer))
}

const GRAPH_MATCH_POOL = [
  { left: 'rain', right: PICTURE_BANK.rain },
  { left: 'train', right: PICTURE_BANK.train },
  { left: 'boat', right: PICTURE_BANK.boat },
  { left: 'goat', right: PICTURE_BANK.goat },
  { left: 'moon', right: PICTURE_BANK.moon },
  { left: 'star', right: PICTURE_BANK.star },
  { left: 'tree', right: PICTURE_BANK.tree },
  { left: 'leaf', right: PICTURE_BANK.leaf },
  { left: 'snow', right: PICTURE_BANK.snow },
  { left: 'cloud', right: PICTURE_BANK.cloud },
  { left: 'sheep', right: PICTURE_BANK.sheep },
  { left: 'cheese', right: PICTURE_BANK.cheese },
]

function gTrickyGraphemeMatch(rand: Rand): Question {
  const pairs = shuffle(rand, GRAPH_MATCH_POOL).slice(0, 4)
  return matchQ(rand, 'Match each word to its picture', pairs)
}

const VOWEL_TEAM_WORDS = [
  { w: 'rain', pic: PICTURE_BANK.rain },
  { w: 'train', pic: PICTURE_BANK.train },
  { w: 'boat', pic: PICTURE_BANK.boat },
  { w: 'goat', pic: PICTURE_BANK.goat },
  { w: 'snow', pic: PICTURE_BANK.snow },
  { w: 'moon', pic: PICTURE_BANK.moon },
  { w: 'star', pic: PICTURE_BANK.star },
  { w: 'tree', pic: PICTURE_BANK.tree },
  { w: 'leaf', pic: PICTURE_BANK.leaf },
  { w: 'sheep', pic: PICTURE_BANK.sheep },
  { w: 'cheese', pic: PICTURE_BANK.cheese },
  { w: 'cake', pic: PICTURE_BANK.cake },
  { w: 'kite', pic: PICTURE_BANK.kite },
  { w: 'plane', pic: PICTURE_BANK.plane },
  { w: 'grape', pic: PICTURE_BANK.grape },
]

function gPickVowelTeamWord(rand: Rand): Question {
  const item = pick(rand, VOWEL_TEAM_WORDS)
  if (randInt(rand, 0, 1) === 0) {
    return mcqE(
      rand,
      'Which word matches the picture?',
      item.w,
      VOWEL_TEAM_WORDS.filter((v) => v.w !== item.w).map((v) => v.w),
      { visual: { type: 'emoji-group', emojis: [item.pic] } },
    )
  }
  const others = pickOthers(rand, VOWEL_TEAM_WORDS, item, 3)
  const arts = shuffle(rand, [item.pic, ...others.map((o) => o.pic)])
  return mcqFixed(`Tap the picture: ${item.w}`, arts, arts.indexOf(item.pic), say(item.w))
}

const RHYME_ITEMS = [
  { a: 'cat', b: 'hat', ans: true },
  { a: 'dog', b: 'log', ans: true },
  { a: 'star', b: 'car', ans: true },
  { a: 'moon', b: 'spoon', ans: true },
  { a: 'cake', b: 'lake', ans: true },
  { a: 'sun', b: 'fun', ans: true },
  { a: 'fish', b: 'dish', ans: true },
  { a: 'tree', b: 'bee', ans: true },
  { a: 'goat', b: 'boat', ans: true },
  { a: 'house', b: 'mouse', ans: true },
  { a: 'light', b: 'night', ans: true },
  { a: 'blue', b: 'glue', ans: true },
  { a: 'blue', b: 'cake', ans: false },
  { a: 'rain', b: 'pig', ans: false },
  { a: 'cake', b: 'sock', ans: false },
  { a: 'shoe', b: 'tree', ans: false },
  { a: 'star', b: 'dog', ans: false },
  { a: 'night', b: 'cat', ans: false },
]

function gRhymeOrNot(rand: Rand): Question {
  const item = pick(rand, RHYME_ITEMS)
  return tfQ('True or false?', `"${item.a}" rhymes with "${item.b}"`, item.ans)
}

const ALIEN_REALS = ['frog', 'hand', 'milk', 'nest', 'stop', 'tent', 'jump', 'ship', 'gran', 'drum']

const ALIEN_WORDS = [
  'blom', 'trand', 'vost', 'glim', 'morp', 'wug', 'plam', 'zim',
  'grull', 'nasp', 'lorp', 'bram', 'vell', 'thop', 'snim', 'rilm',
  'zock', 'thrim', 'femp', 'quib', 'droke', 'crine', 'mard', 'pon',
]

function gRealOrAlien(rand: Rand): Question {
  const real = pick(rand, ALIEN_REALS)
  const aliens = pickOthers(rand, ALIEN_WORDS, real, 5)
  return mcqE(rand, 'Which one is a REAL word?', real, aliens)
}

const HEAR_ALIEN_ITEMS = [
  { t: 'blom', alts: ['brom', 'bolm', 'blon', 'plom', 'blop'] },
  { t: 'vask', alts: ['vaks', 'vasp', 'wask', 'vusk', 'vosp'] },
  { t: 'norp', alts: ['narp', 'worp', 'norpe', 'norb', 'nolp'] },
  { t: 'trand', alts: ['trond', 'trant', 'frand', 'stram', 'cland'] },
  { t: 'zib', alts: ['zob', 'zub', 'vib', 'wib', 'zobe'] },
]

function gAlienHear(rand: Rand): Question {
  const item = pick(rand, HEAR_ALIEN_ITEMS)
  return mcqE(rand, 'Tap the alien word you hear', item.t, item.alts, say(item.t))
}

const COLLECT_ITEMS = [
  { word: 'rain', cells: ['rain', 'tail', 'pain', 'sun', 'rain', 'dog', 'boat', 'train'] },
  { word: 'boot', cells: ['boot', 'foot', 'moon', 'coat', 'boot', 'ship', 'goat', 'root'] },
  { word: 'ship', cells: ['ship', 'shop', 'shed', 'fish', 'ship', 'sheep', 'chop', 'wish'] },
  { word: 'moon', cells: ['moon', 'spoon', 'soon', 'sun', 'moon', 'noon', 'sock', 'book'] },
  { word: 'light', cells: ['light', 'night', 'sight', 'lamp', 'dark', 'light', 'sunny', 'torch'] },
  { word: 'goat', cells: ['goat', 'boat', 'coat', 'road', 'goat', 'soap', 'toad', 'cat'] },
  { word: 'deep', cells: ['deep', 'sheep', 'jeep', 'seal', 'deep', 'feed', 'feet', 'sleep'] },
  { word: 'cake', cells: ['cake', 'lake', 'make', 'kit', 'kite', 'cake', 'cook', 'sock'] },
]

function gCollectTheSound(rand: Rand): Question {
  const item = pick(rand, COLLECT_ITEMS)
  const target = item.cells.filter((c) => c === item.word).length
  return {
    kind: 'tap-count',
    prompt: `Tap every card that says ${item.word}`,
    target,
    targetEmoji: item.word,
    cells: item.cells,
    hint: 'Only exact matches count!',
  }
}

const ODD_SOUND_ITEMS = [
  { label: '/ai/', good: ['rain', 'train', 'tail', 'snail', 'chain', 'paint'], odd: 'book' },
  { label: '/ee/', good: ['tree', 'bee', 'sheep', 'seed', 'deep', 'cheese'], odd: 'ship' },
  { label: '/oa/', good: ['boat', 'goat', 'coat', 'soap', 'road', 'toast'], odd: 'moon' },
  { label: '/sh/', good: ['ship', 'shop', 'fish', 'shell', 'wish', 'shed'], odd: 'sun' },
  { label: '/igh/', good: ['light', 'night', 'high', 'right', 'bright', 'sight'], odd: 'mint' },
  { label: '/ee/', good: ['green', 'sleep', 'three', 'feet', 'jeep', 'sweet'], odd: 'rain' },
]

function gOddSoundOut(rand: Rand): Question {
  const item = pick(rand, ODD_SOUND_ITEMS)
  return mcqE(rand, `Which word has NO ${item.label} sound?`, item.odd, item.good)
}

const DECODE_SENTENCES = [
  ['Six', 'frogs', 'hop', 'in', 'a', 'pond.'],
  ['A', 'big', 'crab', 'ran', 'up', 'rocks.'],
  ['The', 'red', 'hen', 'sat', 'on', 'straw.'],
  ['Gran', 'fed', 'the', 'hen', 'some', 'corn.'],
  ['Tim', 'had', 'milk', 'in', 'his', 'cup.'],
  ['The', 'fox', 'hid', 'in', 'a', 'den.'],
]

function gDecodeSentence(rand: Rand): Question {
  const words = pick(rand, DECODE_SENTENCES)
  return orderQ('Put the words in order to make the sentence', words, say(words.join(' ')))
}

const FINISH_ITEMS = [
  { s: 'Fly the k_te.', ans: 'i', opts: ['i', 'a', 'o', 'u', 'e'], pic: PICTURE_BANK.kite },
  { s: 'I ate a c_ke.', ans: 'a', opts: ['a', 'o', 'u', 'e', 'i'], pic: PICTURE_BANK.cake },
  { s: 'The b__t sails.', ans: 'oa', opts: ['oa', 'ee', 'ow', 'ai', 'ue'], pic: PICTURE_BANK.boat },
  { s: 'Look at the m__n.', ans: 'oo', opts: ['oo', 'ee', 'oa', 'ou', 'ue'], pic: PICTURE_BANK.moon },
  { s: 'The r__n fell.', ans: 'ai', opts: ['ai', 'ee', 'oa', 'ou', 'oi'], pic: PICTURE_BANK.rain },
  { s: 'Twinkle, little st_r.', ans: 'a', opts: ['a', 'e', 'i', 'o', 'u'], pic: PICTURE_BANK.star },
  { s: 'A f_sh swims.', ans: 'i', opts: ['i', 'a', 'o', 'u', 'e'], pic: PICTURE_BANK.fish },
  { s: 'Mum has a red h_t.', ans: 'a', opts: ['a', 'o', 'u', 'i', 'e'], pic: PICTURE_BANK.hat },
]

function gFinishTheWord(rand: Rand): Question {
  const item = pick(rand, FINISH_ITEMS)
  return mcqE(rand, 'Tap the sound to finish the word', item.ans, item.opts, {
    visual: { type: 'emoji-group', emojis: [item.pic] },
  })
}

const e1l1 = makeLesson(
  'e1l1',
  'Same Letters, Different Sound',
  ['2Rw.01'],
  'tails',
  'Ear detectives!',
  'Some sneaky letters change their sound - listen closely and catch them!',
  [gHearTheWord, gTrickyGraphemeMatch],
)

const e1l2 = makeLesson(
  'e1l2',
  'Long or Short Vowel Team?',
  ['2Rw.01', '2Ww.01'],
  'cream',
  'Long or short?',
  'Vowel teams can stretch a sound long - train your ears to hear it!',
  [gPickVowelTeamWord, gRhymeOrNot],
)

const e1l3 = makeLesson(
  'e1l3',
  'Alien Word Decoder',
  ['2Rw.05'],
  'shadow',
  'Alien alert!',
  'Decode silly alien words and spot the REAL Earth words hiding among them!',
  [gRealOrAlien, gAlienHear],
)

const e1l4 = makeLesson(
  'e1l4',
  'Sound Collector',
  ['2Rw.05'],
  'knuckles',
  'Collect the sounds!',
  'Scan the cards fast and collect every one that hides your target sound!',
  [gCollectTheSound, gOddSoundOut],
)

const e1l5 = makeLesson(
  'e1l5',
  'Blend Bandit',
  ['2Rw.05'],
  'sonic',
  'Stop the Blend Bandit!',
  'Blend your sounds to rebuild the words and sentences he scrambled!',
  [gDecodeSentence, gFinishTheWord],
)

const e1boss = makeLesson(
  'e1boss',
  'Phonics Boss',
  ['2Rw.01', '2Rw.05'],
  'eggman',
  'BOSS TIME!',
  "Prove your phonics powers and crack Eggman's secret sound code!",
  [gHearTheWord, gRealOrAlien, gCollectTheSound, gFinishTheWord],
  gRealOrAlien,
)

export const UNIT_E1: UnitDef = unitDef(
  'e1',
  1,
  'Sound Detectives',
  'Cambridge 2Rw.01/.05 - alternative sounds & decoding',
  '#58cc02',
  '🔍',
  [e1l1, e1l2, e1l3, e1l4, e1l5, e1boss],
)
