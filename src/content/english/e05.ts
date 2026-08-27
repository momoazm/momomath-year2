import type { Question, UnitDef } from '../types'
import {
  makeLesson,
  matchQ,
  mcqE,
  mcqFixed,
  orderQ,
  pick,
  say,
  shuffle,
  tfQ,
  unitDef,
  type Gen,
  type Rand,
} from './helpers'

const WORD_MEANINGS = [
  {
    word: 'giant',
    ctx: 'Tom saw a giant pumpkin at the show. It was bigger than a car!',
    answer: 'very big',
    wrong: ['very small', 'very old', 'very quiet'],
  },
  {
    word: 'peckish',
    ctx: 'Mum said she was peckish, so she made us sandwiches. We gobbled them all up!',
    answer: 'a bit hungry',
    wrong: ['a bit thirsty', 'very tired', 'very sad'],
  },
  {
    word: 'fetch',
    ctx: 'Sam threw the stick far away. "Go and fetch it!" he called to his dog.',
    answer: 'go and get it',
    wrong: ['go and sleep', 'leave it there', 'bark at it'],
  },
  {
    word: 'mended',
    ctx: "Ali's kite tore in the tree. Dad mended it with sticky tape.",
    answer: 'fixed it',
    wrong: ['broke it again', 'threw it away', 'hid it in a box'],
  },
  {
    word: 'cross',
    ctx: 'Lily broke her brother\u2019s model plane. He was cross and stamped his foot!',
    answer: 'angry',
    wrong: ['happy', 'sleepy', 'shy'],
  },
  {
    word: 'delighted',
    ctx: 'Nana opened her gift and clapped her hands. She was delighted with it.',
    answer: 'very pleased',
    wrong: ['very cross', 'worried', 'sleepy'],
  },
]

const VOCAB_TRUE_FALSE = [
  { statement: 'If you fetch something, you bring it back.', answer: true },
  { statement: 'A giant mouse is smaller than a normal mouse.', answer: false },
  { statement: 'If Dad mended the bike, it is still broken.', answer: false },
  { statement: 'If Mia felt cross, she felt happy.', answer: false },
  { statement: 'A peckish bear wants a snack.', answer: true },
  { statement: 'Delighted means very pleased.', answer: true },
]

const ALPHA_SETS: string[][] = [
  ['ant', 'bee', 'cow'],
  ['apple', 'grape', 'pear'],
  ['cake', 'egg', 'jam'],
  ['dog', 'fox', 'hen', 'pig'],
  ['bus', 'car', 'van'],
  ['sun', 'tree', 'wind'],
]

const GLOSSARY_SETS = [
  { words: ['zebra', 'ant', 'mouse', 'tiger'], first: 'ant' },
  { words: ['rabbit', 'cat', 'bear', 'fox'], first: 'bear' },
  { words: ['grape', 'apple', 'plum', 'melon'], first: 'apple' },
  { words: ['duck', 'bird', 'sheep', 'goat'], first: 'bird' },
  { words: ['kite', 'lion', 'ant', 'bee'], first: 'ant' },
]

const ADJECTIVE_SCENES = [
  { emojis: ['🐢'], answer: 'slow', wrong: ['fast', 'speedy', 'quick'] },
  { emojis: ['🐇'], answer: 'fast', wrong: ['slow', 'still', 'sleepy'] },
  { emojis: ['🔥'], answer: 'hot', wrong: ['freezing', 'icy', 'cold'] },
  { emojis: ['❄️'], answer: 'cold', wrong: ['boiling', 'scorching', 'hot'] },
  { emojis: ['🌈'], answer: 'colourful', wrong: ['grey', 'colourless', 'dull'] },
  { emojis: ['🐘'], answer: 'enormous', wrong: ['tiny', 'little', 'small'] },
  { emojis: ['🐭'], answer: 'tiny', wrong: ['giant', 'huge', 'enormous'] },
]

const OPPOSITE_PAIRS = [
  { left: 'big', right: 'small' },
  { left: 'hot', right: 'cold' },
  { left: 'happy', right: 'sad' },
  { left: 'fast', right: 'slow' },
  { left: 'tall', right: 'short' },
  { left: 'loud', right: 'quiet' },
]

const TIME_OPENERS = [
  {
    prompt:
      'First, I put on my socks. Then, I put on my shoes. After that, I tied the laces. Finally, I ran outside.',
    answer: 'Then',
    wrong: ['Finally', 'At last', 'In the end'],
  },
  {
    prompt:
      'First, we picked apples. ___, we carried the basket home. Then we baked a pie. Finally, we all had a slice.',
    answer: 'Next',
    wrong: ['Finally', 'At last', 'In the end'],
  },
  {
    prompt:
      'First, Ben drew a rocket. Next, he painted it silver. After that, it dried overnight. ___, it was ready to fly!',
    answer: 'Finally',
    wrong: ['First', 'To begin with', 'At the very start'],
  },
  {
    prompt:
      'First, Mia made the dough. Next, she spread the jam. ___, she rolled it up. Finally, Dad cut it into slices.',
    answer: 'Then',
    wrong: ['Finally', 'At last', 'In the end'],
  },
]

const OPENER_STORIES: string[][] = [
  [
    'One morning, Ben heard a tiny mew.',
    'After that, he found a kitten under the hedge.',
    'Later, he gave it some warm milk.',
    'Finally, the kitten fell asleep on his lap.',
  ],
  [
    'That night, a storm rolled in.',
    'Soon, rain tapped on the window.',
    'After that, the lights went out.',
    'At last, the sun peeked out again.',
  ],
  [
    'On Saturday, Poppy planted seeds.',
    'Next, she watered them every day.',
    'Then, tiny green shoots appeared.',
    'In the end, tall sunflowers smiled.',
  ],
]

const WOW_WORDS = [
  {
    prompt: 'The giant ___ up the hill.',
    answer: 'stomped',
    dull: ['went', 'moved', 'got', 'walked', 'stepped'],
  },
  {
    prompt: 'Rain ___ down the window.',
    answer: 'trickled',
    dull: ['went', 'moved', 'fell', 'got', 'came'],
  },
  {
    prompt: 'The wizard wore a ___ hat.',
    answer: 'spiky',
    dull: ['nice', 'good', 'old', 'big', 'soft'],
  },
  {
    prompt: 'The cake tasted ___.',
    answer: 'delicious',
    dull: ['nice', 'good', 'fine', 'plain', 'normal'],
  },
]

const EXCITING_SENTENCES = [
  {
    exciting: 'Crash! The enormous wave splashed over the old ship!',
    flat: ['A bird sang.', 'I went to the park.', 'The wind blew.'],
  },
  {
    exciting: 'Whoosh! The golden rocket blasted into starry space!',
    flat: ['The cat slept.', 'It was warm.', 'We ate lunch.'],
  },
  {
    exciting: 'Zap! The cheeky wizard zapped the grumpy troll!',
    flat: ['He ran fast.', 'The bell rang.', 'She read a book.'],
  },
]

function gMeaningFromContext(rand: Rand): Question {
  const m = pick(rand, WORD_MEANINGS)
  return mcqE(
    rand,
    `${m.ctx} What does "${m.word}" mean?`,
    m.answer,
    m.wrong,
    say(m.word),
  )
}

function gVocabTrueFalse(rand: Rand): Question {
  const v = pick(rand, VOCAB_TRUE_FALSE)
  return tfQ('True or false?', v.statement, v.answer)
}

function gAlphaOrder(rand: Rand): Question {
  return orderQ('Put the words in ABC order.', pick(rand, ALPHA_SETS))
}

function gGlossaryFind(rand: Rand): Question {
  const g = pick(rand, GLOSSARY_SETS)
  const choices = shuffle(rand, g.words)
  return mcqFixed(
    'Which word comes first in the dictionary?',
    choices,
    choices.indexOf(g.first),
  )
}

function gAdjectivePick(rand: Rand): Question {
  const s = pick(rand, ADJECTIVE_SCENES)
  return mcqE(rand, 'Choose the best describing word.', s.answer, s.wrong, {
    visual: { type: 'emoji-group', emojis: s.emojis },
  })
}

function gAdjectiveMatch(rand: Rand): Question {
  const four = shuffle(rand, OPPOSITE_PAIRS).slice(0, 4)
  return matchQ(rand, 'Tap the matching opposites.', four)
}

function gTimeOpenerFill(rand: Rand): Question {
  const o = pick(rand, TIME_OPENERS)
  return mcqE(rand, o.prompt, o.answer, o.wrong)
}

function gOpenerOrder(rand: Rand): Question {
  return orderQ('Put the story in the right order.', pick(rand, OPENER_STORIES))
}

function gInterestingWord(rand: Rand): Question {
  const w = pick(rand, WOW_WORDS)
  return mcqE(rand, w.prompt, w.answer, w.dull, {
    hint: 'Pick the word that paints the best picture.',
  })
}

function gExcitingSentence(rand: Rand): Question {
  const s = pick(rand, EXCITING_SENTENCES)
  const choices = shuffle(rand, [s.exciting, ...s.flat])
  return mcqFixed(
    'Which sentence is the most exciting?',
    choices,
    choices.indexOf(s.exciting),
  )
}

export const UNIT_E5: UnitDef = unitDef(
  'e5',
  5,
  'Word Explorer',
  'Cambridge 2Rv/2Wv - vocabulary, alphabet order, adjectives',
  '#00cd9c',
  '🧭',
  [
    makeLesson(
      'e5l1',
      'New Word Detective',
      ['2Rv.01'],
      'tails',
      'Word Detective!',
      'Use the clues in the sentence to crack brand-new words!',
      [gMeaningFromContext, gVocabTrueFalse],
    ),
    makeLesson(
      'e5l2',
      'Alphabet Train',
      ['2Rv.03'],
      'amy',
      'All aboard!',
      'Words ride in ABC order, just like carriages on a dictionary train!',
      [gAlphaOrder, gGlossaryFind],
    ),
    makeLesson(
      'e5l3',
      'Amazing Adjectives',
      ['2Rv.04', '2Wv.02'],
      'cream',
      'Describe it!',
      'Adjectives are describing words that paint pictures with words!',
      [gAdjectivePick, gAdjectiveMatch],
    ),
    makeLesson(
      'e5l4',
      'Sparkle Openers',
      ['2Rv.05', '2Wv.03'],
      'blaze',
      'Sparkle your stories!',
      'Openers like Suddenly and Finally tell your reader WHEN things happen!',
      [gTimeOpenerFill, gOpenerOrder],
    ),
    makeLesson(
      'e5l5',
      'My Word Hoard',
      ['2Rv.02', '2Wv.04', '2Wv.05'],
      'sonic',
      'Grow your word hoard!',
      'Swap boring words for wow words and hoard the best ones you find!',
      [gInterestingWord, gExcitingSentence],
    ),
    makeLesson(
      'e5boss',
      'Vocabulary Boss',
      ['2Rv.01', '2Rv.03', '2Rv.04', '2Wv.03'],
      'eggman',
      'BOSS TIME!',
      'Meanings, ABC order, adjectives and wow words - defeat the Vocabulary Boss!',
      [
        gMeaningFromContext,
        gAlphaOrder,
        gAdjectivePick,
        gTimeOpenerFill,
        gInterestingWord,
      ],
      gExcitingSentence,
    ),
  ],
)
