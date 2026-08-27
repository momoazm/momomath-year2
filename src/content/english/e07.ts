import {
  PICTURE_BANK,
  makeLesson,
  matchQ,
  mcqE,
  mcqFixed,
  orderQ,
  pick,
  pickOthers,
  say,
  shuffle,
  tfQ,
  tilesQ,
  unitDef,
} from './helpers'
import type { Rand } from './helpers'

const NOUN_KIND_CHOICES = ['a person', 'a place', 'a thing']

const NOUN_ITEMS: {
  word: string
  kind: 'person' | 'place' | 'thing'
  emoji?: string
}[] = [
  { word: 'mum', kind: 'person' },
  { word: 'dad', kind: 'person' },
  { word: 'teacher', kind: 'person' },
  { word: 'nurse', kind: 'person' },
  { word: 'school', kind: 'place', emoji: PICTURE_BANK.school },
  { word: 'beach', kind: 'place', emoji: PICTURE_BANK.beach },
  { word: 'garden', kind: 'place', emoji: PICTURE_BANK.garden },
  { word: 'castle', kind: 'place', emoji: PICTURE_BANK.castle },
  { word: 'shop', kind: 'place', emoji: PICTURE_BANK.shop },
  { word: 'cat', kind: 'thing', emoji: PICTURE_BANK.cat },
  { word: 'ball', kind: 'thing', emoji: PICTURE_BANK.ball },
  { word: 'book', kind: 'thing', emoji: PICTURE_BANK.book },
  { word: 'cake', kind: 'thing', emoji: PICTURE_BANK.cake },
  { word: 'car', kind: 'thing', emoji: PICTURE_BANK.car },
  { word: 'hat', kind: 'thing', emoji: PICTURE_BANK.hat },
]

function gNounPicture(rand: Rand) {
  const item = pick(rand, NOUN_ITEMS)
  const idx = item.kind === 'person' ? 0 : item.kind === 'place' ? 1 : 2
  if (item.emoji !== undefined && rand() < 0.5) {
    return mcqFixed('What kind of naming word is this?', NOUN_KIND_CHOICES, idx, {
      visual: { type: 'emoji-group', emojis: [item.emoji] },
      hint: 'A noun names a person, place or thing.',
    })
  }
  return mcqFixed(`Which kind of word is “${item.word}”?`, NOUN_KIND_CHOICES, idx, {
    hint: 'A noun names a person, place or thing.',
  })
}

const NOUN_POOL = [
  'dog', 'park', 'mum', 'cake', 'train', 'book',
  'garden', 'shoe', 'bird', 'school', 'bridge', 'apple',
]
const NOT_NOUNS = [
  'jump', 'hop', 'sing', 'eat', 'clap', 'swim', 'skip',
  'happy', 'sad', 'big', 'tall', 'quick',
]

function gNounOrNot(rand: Rand) {
  const noun = pick(rand, NOUN_POOL)
  return mcqE(rand, 'Which word is a noun?', noun, pickOthers(rand, NOT_NOUNS, noun, 5), {
    hint: 'A noun is a naming word.',
  })
}

const PHRASES = [
  { words: ['the', 'fluffy', 'cat'], noun: 'cat', adj: 'fluffy' },
  { words: ['a', 'big', 'dog'], noun: 'dog', adj: 'big' },
  { words: ['the', 'green', 'frog'], noun: 'frog', adj: 'green' },
  { words: ['a', 'red', 'kite'], noun: 'kite', adj: 'red' },
  { words: ['the', 'tiny', 'ant'], noun: 'ant', adj: 'tiny' },
  { words: ['a', 'tall', 'tree'], noun: 'tree', adj: 'tall' },
  { words: ['the', 'soft', 'hat'], noun: 'hat', adj: 'soft' },
  { words: ['a', 'fast', 'train'], noun: 'train', adj: 'fast' },
]

function gPhraseBuild(rand: Rand) {
  const p = pick(rand, PHRASES)
  const article = /^[aeiou]/i.test(p.noun) ? 'an' : 'a'
  return orderQ('Put the words in the right order.', p.words, {
    hint: `A phrase about ${article} ${p.noun} that is ${p.adj}.`,
  })
}

const ADJ_SCENES: { emoji: string; text: string; answer: string; wrong: string[] }[] = [
  { emoji: PICTURE_BANK.fire, text: 'The fire is ___.', answer: 'hot', wrong: ['icy', 'freezing', 'wet', 'chilly', 'frosty'] },
  { emoji: PICTURE_BANK.snow, text: 'The snow is ___.', answer: 'cold', wrong: ['hot', 'warm', 'steamy', 'boiling', 'toasty'] },
  { emoji: PICTURE_BANK.elephant, text: 'The elephant is ___.', answer: 'big', wrong: ['tiny', 'little', 'small', 'mini', 'short'] },
  { emoji: PICTURE_BANK.snail, text: 'The snail is ___.', answer: 'slow', wrong: ['fast', 'quick', 'speedy', 'swift', 'zippy'] },
  { emoji: PICTURE_BANK.stone, text: 'The stone is ___.', answer: 'hard', wrong: ['soft', 'fluffy', 'squishy', 'cuddly', 'gooey'] },
  { emoji: PICTURE_BANK.storm, text: 'The storm is ___.', answer: 'loud', wrong: ['quiet', 'silent', 'soft', 'gentle', 'hushed'] },
]

function gBestAdjective(rand: Rand) {
  const s = pick(rand, ADJ_SCENES)
  return mcqE(rand, s.text, s.answer, s.wrong, {
    visual: { type: 'emoji-group', emojis: [s.emoji] },
    hint: 'Pick the describing word that fits.',
  })
}

const QUANT_ITEMS: { text: string; answer: string; audio: string }[] = [
  { text: 'There are 5 cats. Every cat is black. ___ of the cats are black.', answer: 'All', audio: 'All of the cats are black.' },
  { text: 'There are 6 dogs. Only 2 dogs are big. ___ of the dogs are big.', answer: 'Some', audio: 'Some of the dogs are big.' },
  { text: 'There are 10 birds. 9 birds can fly. ___ of the birds can fly.', answer: 'Most', audio: 'Most of the birds can fly.' },
  { text: 'There are 4 cakes. Every cake has a cherry. ___ of the cakes have a cherry.', answer: 'All', audio: 'All of the cakes have a cherry.' },
  { text: 'There are 7 mice. Just 3 mice are grey. ___ of the mice are grey.', answer: 'Some', audio: 'Some of the mice are grey.' },
  { text: 'There are 8 ducks. 6 ducks swim. ___ of the ducks swim.', answer: 'Most', audio: 'Most of the ducks swim.' },
]

function gQuantifierFill(rand: Rand) {
  const q = pick(rand, QUANT_ITEMS)
  const choices = ['All', 'Some', 'Most']
  return mcqFixed(q.text, choices, choices.indexOf(q.answer), {
    ...say(q.audio),
    hint: 'All = every one. Most = nearly all. Some = a small number, but not all.',
  })
}

const QUANT_TRUE: { prompt: string; statement: string; answer: boolean }[] = [
  { prompt: 'What does “all” mean?', statement: 'All means every single one.', answer: true },
  { prompt: 'Does “some” mean all of them?', statement: 'Some means all of them.', answer: false },
  { prompt: 'Does “most” mean every one?', statement: 'Most means every single one.', answer: false },
  { prompt: 'What does “some” mean?', statement: 'Some means more than one, but not all.', answer: true },
]

function gQuantifierTrue(rand: Rand) {
  const q = pick(rand, QUANT_TRUE)
  return tfQ(q.prompt, q.statement, q.answer, {
    hint: 'Say the quantifier meaning out loud.',
  })
}

const PRONOUN_PAIRS = [
  { left: 'Mum', right: 'she' },
  { left: 'Dad', right: 'he' },
  { left: 'the dog', right: 'it' },
  { left: 'Anna and I', right: 'we' },
  { left: 'the children', right: 'they' },
]

function gPronounMatch(rand: Rand) {
  const four = shuffle(rand, PRONOUN_PAIRS).slice(0, 4)
  return matchQ(rand, 'Match each naming word to its pronoun.', four, {
    hint: 'she = one girl or woman. he = one boy or man.',
  })
}

const PRONOUN_FILL: { text: string; answer: string; wrong: string[] }[] = [
  { text: 'Mum is cooking. ___ is making soup.', answer: 'She', wrong: ['He', 'It', 'We', 'They', 'Them', 'Him', 'Us'] },
  { text: 'Dad is reading. ___ has a funny book.', answer: 'He', wrong: ['She', 'It', 'We', 'They', 'Her', 'Them', 'Us'] },
  { text: 'The ball is red. ___ bounces high.', answer: 'It', wrong: ['He', 'She', 'We', 'They', 'Him', 'Them', 'Us'] },
  { text: 'Ben and I are friends. ___ play together.', answer: 'We', wrong: ['He', 'She', 'It', 'They', 'Him', 'Her', 'Them'] },
  { text: 'The children are singing. ___ love music.', answer: 'They', wrong: ['He', 'She', 'It', 'We', 'Him', 'Her', 'Us'] },
]

function gPronounFill(rand: Rand) {
  const f = pick(rand, PRONOUN_FILL)
  return mcqE(rand, f.text, f.answer, f.wrong, {
    hint: 'Choose the pronoun that fits the naming word.',
  })
}

const COMPARE_ITEMS: { emoji: string[] | null; text: string; answer: string; wrong: string[] }[] = [
  { emoji: [PICTURE_BANK.elephant, PICTURE_BANK.mouse], text: 'The elephant is ___ than the mouse.', answer: 'bigger', wrong: ['smaller', 'tinier', 'shorter', 'littler', 'weaker'] },
  { emoji: [PICTURE_BANK.mouse, PICTURE_BANK.elephant], text: 'The mouse is ___ than the elephant.', answer: 'smaller', wrong: ['bigger', 'larger', 'taller', 'longer', 'heavier'] },
  { emoji: [PICTURE_BANK.horse, PICTURE_BANK.snail], text: 'The horse is ___ than the snail.', answer: 'faster', wrong: ['slower', 'tinier', 'quieter', 'softer', 'weaker'] },
  { emoji: [PICTURE_BANK.tree, PICTURE_BANK.flower], text: 'The tree is ___ than the flower.', answer: 'taller', wrong: ['shorter', 'smaller', 'lower', 'littler', 'tinier'] },
  { emoji: null, text: 'Mia came first, Zoe second and Sam last in the race. Mia was the ___ runner.', answer: 'fastest', wrong: ['slowest', 'slower', 'slow', 'sluggish', 'last'] },
  { emoji: null, text: 'A whale, a shark and a minnow swam past. The minnow was the ___ fish.', answer: 'smallest', wrong: ['biggest', 'largest', 'longest', 'widest', 'heaviest'] },
]

function gComparePicture(rand: Rand) {
  const c = pick(rand, COMPARE_ITEMS)
  return mcqE(
    rand,
    c.text,
    c.answer,
    c.wrong,
    c.emoji
      ? { visual: { type: 'emoji-group', emojis: c.emoji }, hint: 'Compare the pictures in your head!' }
      : { hint: 'Compare the friends in the sentence!' },
  )
}

const ER_EST_WORDS = [
  { sum: 'big + er', word: 'bigger', hint: 'Double the g!' },
  { sum: 'tall + est', word: 'tallest', hint: 'Reach the sky!' },
  { sum: 'small + est', word: 'smallest', hint: 'The tiniest one of all!' },
  { sum: 'fast + er', word: 'faster', hint: 'Zoom!' },
  { sum: 'long + er', word: 'longer', hint: 'Stretch it out!' },
]

function gErEstTiles(rand: Rand) {
  const w = pick(rand, ER_EST_WORDS)
  return tilesQ(`${w.sum} = ?`, w.word, w.hint)
}

export const UNIT_E7 = unitDef(
  'e7',
  7,
  'Naming & Describing Words',
  'Cambridge 2Rg.05/.06 / 2Wg.08-.10 - nouns, pronouns, quantifiers',
  '#fb7185',
  '🏷️',
  [
    makeLesson('e7l1', 'Noun Hunt', ['2Rg.05'], 'cream', 'Go Noun Hunting!', 'Nouns name people, places and things - start spotting!', [
      gNounPicture,
      gNounOrNot,
    ]),
    makeLesson('e7l2', 'Grow a Noun Phrase', ['2Rg.05', '2Wv.02'], 'tails', 'Grow a Noun Phrase!', 'Pop a describing word in front to paint a better picture!', [
      gPhraseBuild,
      gBestAdjective,
    ]),
    makeLesson('e7l3', 'Quantifier Pick', ['2Wg.08'], 'amy', 'Quantifier Power!', 'All, some and most tell you how many!', [
      gQuantifierFill,
      gQuantifierTrue,
    ]),
    makeLesson('e7l4', 'Pronoun Swap', ['2Rg.06', '2Wg.09'], 'blaze', 'Pronoun Swap!', 'Swap long names for little words like she, he, it, we and they!', [
      gPronounMatch,
      gPronounFill,
    ]),
    makeLesson('e7l5', 'Bigger, Biggest!', ['2Wg.10'], 'knuckles', 'Bigger, Biggest!', 'Add -er to compare two things and -est to crown the champion!', [
      gComparePicture,
      gErEstTiles,
    ]),
    makeLesson(
      'e7boss',
      'Grammar Boss',
      ['2Rg.05', '2Rg.06', '2Wg.08', '2Wg.09', '2Wg.10'],
      'eggman',
      'Grammar Boss!',
      'Eggman demands your best nouns, pronouns and comparing words!',
      [gPhraseBuild, gQuantifierFill, gPronounFill, gComparePicture],
      gErEstTiles,
    ),
  ],
)
