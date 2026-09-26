import {
  makeLesson,
  matchQ,
  mcqE,
  mcqFixed,
  pick,
  say,
  shuffle,
  tilesQ,
  unitDef,
} from './helpers'
import type { Rand } from './helpers'

const TENSE_PAIRS = [
  { left: 'played', right: 'play' },
  { left: 'jumped', right: 'jump' },
  { left: 'walked', right: 'walk' },
  { left: 'helped', right: 'help' },
  { left: 'looked', right: 'look' },
  { left: 'wanted', right: 'want' },
]

function gTenseSortMatch(rand: Rand) {
  const four = shuffle(rand, TENSE_PAIRS).slice(0, 4)
  return matchQ(rand, 'Match each yesterday word to its today word.', four, {
    hint: 'Yesterday words end in -ed.',
  })
}

const TIME_FILL: { text: string; answer: string; wrong: string[] }[] = [
  { text: 'Yesterday she ___ in the garden.', answer: 'played', wrong: ['plays', 'play', 'playing', 'is playing', 'will play'] },
  { text: 'Yesterday he ___ a picture.', answer: 'painted', wrong: ['paints', 'paint', 'painting', 'is painting', 'will paint'] },
  { text: 'Yesterday they ___ to the park.', answer: 'walked', wrong: ['walk', 'walks', 'walking', 'are walking', 'will walk'] },
  { text: 'Today she ___ in the garden.', answer: 'plays', wrong: ['played', 'play', 'playing', 'walked', 'jumped'] },
  { text: 'Today the birds ___.', answer: 'sing', wrong: ['sang', 'sings', 'singing', 'sung', 'will sang'] },
]

function gTimeWordFill(rand: Rand) {
  const q = pick(rand, TIME_FILL)
  return mcqE(rand, q.text, q.answer, q.wrong, {
    hint: 'Find the time word first!',
  })
}

const ING_WORDS = [
  { sum: 'play + ing', word: 'playing', hint: 'Game on!' },
  { sum: 'jump + ing', word: 'jumping', hint: 'Jump to it!' },
  { sum: 'read + ing', word: 'reading', hint: 'Book lovers only!' },
  { sum: 'sing + ing', word: 'singing', hint: 'La la la!' },
  { sum: 'walk + ing', word: 'walking', hint: 'One foot at a time!' },
  { sum: 'help + ing', word: 'helping', hint: 'Lend a hand!' },
  { sum: 'cook + ing', word: 'cooking', hint: 'Yum yum!' },
  { sum: 'draw + ing', word: 'drawing', hint: 'Pencils ready!' },
  { sum: 'laugh + ing', word: 'laughing', hint: 'Ha ha ha!' },
  { sum: 'cry + ing', word: 'crying', hint: 'A single tear!' },
]

function gIngTiles(rand: Rand) {
  const w = pick(rand, ING_WORDS)
  return tilesQ(`${w.sum} = ?`, w.word, w.hint)
}

const ING_FILL: { text: string; answer: string; wrong: string[] }[] = [
  { text: 'I am ___ a book.', answer: 'reading', wrong: ['read', 'reads', 'look', 'watch', 'looked'] },
  { text: 'The girl is ___ a song.', answer: 'singing', wrong: ['sing', 'sings', 'sang', 'dance', 'shouted'] },
  { text: 'We are ___ to school.', answer: 'walking', wrong: ['walk', 'walks', 'walked', 'ran', 'sit'] },
  { text: 'He is ___ with the ball.', answer: 'playing', wrong: ['play', 'plays', 'played', 'kick', 'bounced'] },
  { text: 'Mum is ___ dinner.', answer: 'cooking', wrong: ['cook', 'cooks', 'cooked', 'eat', 'washed'] },
  { text: 'The baby is ___.', answer: 'crying', wrong: ['cry', 'cries', 'cried', 'smile', 'laughed'] },
  { text: 'Dad is ___ a picture.', answer: 'drawing', wrong: ['draw', 'draws', 'drew', 'paint', 'coloured'] },
  { text: 'The children are ___ at the clown.', answer: 'laughing', wrong: ['laugh', 'laughs', 'laughed', 'watch', 'clapped'] },
  { text: 'I am ___ my hands.', answer: 'washing', wrong: ['wash', 'washes', 'washed', 'dry', 'dried'] },
]

function gIngFill(rand: Rand) {
  const q = pick(rand, ING_FILL)
  return mcqE(rand, q.text, q.answer, q.wrong, {
    hint: 'am, is or are means you need -ing!',
  })
}

const MIXED_TENSE: { text: string; answer: string; wrong: string[] }[] = [
  { text: 'Yesterday Dad ___ a cake.', answer: 'baked', wrong: ['makes', 'making', 'bake', 'is baking', 'will bake'] },
  { text: 'Every day I ___ to school.', answer: 'walk', wrong: ['walked', 'walking', 'walks', 'am walking', 'goes'] },
  { text: 'Last week it ___ all week.', answer: 'rained', wrong: ['rains', 'rain', 'raining', 'is raining', 'will rain'] },
  { text: 'Yesterday we ___ in the yard.', answer: 'skipped', wrong: ['skip', 'skips', 'skipping', 'are skipping', 'will skip'] },
  { text: 'On Mondays she ___ the piano.', answer: 'plays', wrong: ['play', 'played', 'playing', 'will played', 'have played'] },
  { text: 'Last night we ___ a film.', answer: 'watched', wrong: ['watch', 'watches', 'watching', 'are watching', 'will watch'] },
  { text: 'Every morning Grandad ___ his breakfast.', answer: 'makes', wrong: ['made', 'making', 'make', 'is making', 'will make'] },
  { text: 'Yesterday the baby ___ for a long time.', answer: 'slept', wrong: ['sleeps', 'sleep', 'sleeping', 'is sleeping', 'will sleep'] },
  { text: 'In summer it ___ very hot.', answer: 'gets', wrong: ['got', 'getting', 'get', 'is getting', 'will get'] },
]

function gMixedTense(rand: Rand) {
  const q = pick(rand, MIXED_TENSE)
  return mcqE(rand, q.text, q.answer, q.wrong, {
    hint: 'Let the time word choose the verb.',
  })
}

const HEAR_ITEMS: { heard: string; correct: string; wrong: [string, string] }[] = [
  {
    heard: 'Yesterday I played football.',
    correct: 'Yesterday I played football.',
    wrong: ['Yesterday I play football.', 'Yesterday I playing football.'],
  },
  {
    heard: 'Yesterday she jumped over the puddle.',
    correct: 'Yesterday she jumped over the puddle.',
    wrong: ['Yesterday she jumps over the puddle.', 'Yesterday she jumping over the puddle.'],
  },
  {
    heard: 'Today we are walking to school.',
    correct: 'Today we are walking to school.',
    wrong: ['Today we walk to school.', 'Today we walking to school.'],
  },
  {
    heard: 'Every morning he feeds the dog.',
    correct: 'Every morning he feeds the dog.',
    wrong: ['Every morning he feed the dog.', 'Every morning he feeding the dog.'],
  },
  {
    heard: 'Last night it rained hard.',
    correct: 'Last night it rained hard.',
    wrong: ['Last night it rains hard.', 'Last night it raining hard.'],
  },
  {
    heard: 'Yesterday we walked to the woods.',
    correct: 'Yesterday we walked to the woods.',
    wrong: ['Yesterday we walk to the woods.', 'Yesterday we walking to the woods.'],
  },
  {
    heard: 'This morning Dad cooked pancakes.',
    correct: 'This morning Dad cooked pancakes.',
    wrong: ['This morning Dad cook pancakes.', 'This morning Dad cooking pancakes.'],
  },
  {
    heard: 'Every day the baby sleeps in the pram.',
    correct: 'Every day the baby sleeps in the pram.',
    wrong: ['Every day the baby sleep in the pram.', 'Every day the baby sleeping in the pram.'],
  },
  {
    heard: 'Right now we are watching the boats.',
    correct: 'Right now we are watching the boats.',
    wrong: ['Right now we watch the boats.', 'Right now we watching the boats.'],
  },
]

function gTenseHear(rand: Rand) {
  const h = pick(rand, HEAR_ITEMS)
  const choices = shuffle(rand, [h.correct, ...h.wrong])
  return mcqFixed('Which sentence did you hear?', choices, choices.indexOf(h.correct), {
    ...say(h.heard),
    hint: 'Listen for the verb!',
  })
}

export const UNIT_E8 = unitDef(
  'e8',
  8,
  'Verb Time Machine',
  'Cambridge 2Wg.07 - past & present verb forms',
  '#a78bfa',
  '⏳',
  [
    makeLesson('e8l1', 'Past or Present?', ['2Wg.07'], 'shadow', 'Fire Up the Time Machine!', 'Words like yesterday send verbs back in time!', [
      gTenseSortMatch,
      gTimeWordFill,
    ]),
    makeLesson('e8l2', 'Adding -ing', ['2Wg.07'], 'tails', 'Add -ing Now!', '-ing means it is happening right now!', [
      gIngTiles,
      gIngFill,
    ]),
    makeLesson('e8l3', 'Tense Trainer Mix', ['2Wg.07'], 'amy', 'Train Every Tense!', 'Spot the time word, then pick the matching verb!', [
      gMixedTense,
      gTenseHear,
    ]),
    makeLesson(
      'e8boss',
      'Tense Boss',
      ['2Wg.07'],
      'eggman',
      'Tense Boss!',
      'Race through past, present and -ing time to beat Eggman!',
      [gTenseSortMatch, gTimeWordFill, gIngFill, gMixedTense],
      gTenseHear,
    ),
  ],
)
