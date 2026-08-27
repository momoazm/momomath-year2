import type { Question, StoryPanel, UnitDef } from '../types'
import {
  makeLesson,
  mcqE,
  orderQ,
  pick,
  say,
  shuffle,
  speakQ,
  story,
  unitDef,
  matchQ,
  type Rand,
} from './helpers'

interface McqItem {
  q: string
  answer: string
  wrong: string[]
}

const RHYME_PAIRS = [
  { left: 'cat', right: 'hat' },
  { left: 'bee', right: 'tree' },
  { left: 'star', right: 'car' },
  { left: 'cake', right: 'snake' },
  { left: 'moon', right: 'spoon' },
  { left: 'light', right: 'kite' },
  { left: 'fox', right: 'box' },
  { left: 'mouse', right: 'house' },
]

const ODD_RHYME_SETS: McqItem[] = [
  { q: '', answer: 'dog', wrong: ['cat', 'hat', 'bat', 'rat', 'mat'] },
  { q: '', answer: 'day', wrong: ['bee', 'tree', 'see', 'free', 'three'] },
  { q: '', answer: 'stone', wrong: ['star', 'car', 'far', 'jar', 'bar'] },
  { q: '', answer: 'book', wrong: ['cake', 'snake', 'lake', 'rake', 'wake'] },
  { q: '', answer: 'frog', wrong: ['moon', 'spoon', 'noon', 'balloon', 'raccoon'] },
  { q: '', answer: 'ship', wrong: ['light', 'kite', 'night', 'bright', 'sight'] },
]

function gRhymePairs(rand: Rand): Question {
  return matchQ(rand, 'Match the words that rhyme.', shuffle(rand, RHYME_PAIRS).slice(0, 4))
}

function gOddRhymeOut(rand: Rand): Question {
  const s = pick(rand, ODD_RHYME_SETS)
  return mcqE(rand, 'Which word does not rhyme?', s.answer, shuffle(rand, s.wrong))
}

interface Verse {
  panel: StoryPanel
  lines: string[]
  frame: string
  decoys: string[]
}

const VERSES: Verse[] = [
  {
    panel: story('Clap Along', ['👏', '🎵'], [
      'Clap your hands with me,',
      'tap your toes with me,',
      'stamp your feet with me,',
      'sing a song with me.',
    ]),
    lines: [
      'Clap your hands with me,',
      'tap your toes with me,',
      'stamp your feet with me,',
      'sing a song with me.',
    ],
    frame: 'with me',
    decoys: ['clap your hands', 'tap your toes', 'stamp your feet', 'sing a song', 'play guitar'],
  },
  {
    panel: story('Hop Hop Hop', ['🐰', '🐸'], [
      'Hop like a bunny, hop hop hop,',
      'jump like a froggy, hop hop hop,',
      'skip like a lamb, hop hop hop.',
    ]),
    lines: [
      'Hop like a bunny, hop hop hop,',
      'jump like a froggy, hop hop hop,',
      'skip like a lamb, hop hop hop.',
    ],
    frame: 'hop hop hop',
    decoys: ['like a bunny', 'jump like a froggy', 'skip like a lamb', 'run run run', 'wiggle wiggle'],
  },
  {
    panel: story('Drip Drop', ['🌧️', '🎵'], [
      'Drip, drop, hear the rain,',
      'Drip, drop, on the pane,',
      'Drip, drop, down the drain.',
    ]),
    lines: [
      'Drip, drop, hear the rain,',
      'Drip, drop, on the pane,',
      'Drip, drop, down the drain.',
    ],
    frame: 'Drip, drop',
    decoys: ['hear the rain', 'on the pane', 'down the drain', 'splish splash', 'pitter patter'],
  },
]

function gRepeatLines(rand: Rand): Question {
  const v = pick(rand, VERSES)
  return orderQ('Put the verse lines in order.', v.lines, { story: v.panel })
}

function gFindRepeat(rand: Rand): Question {
  const v = pick(rand, VERSES)
  return mcqE(rand, 'Which words come again and again?', v.frame, shuffle(rand, v.decoys), {
    story: v.panel,
  })
}

const SOUND_WORDS: { sentence: string; answer: string; wrong: string[] }[] = [
  { sentence: 'Splash! Went the water.', answer: 'splash', wrong: ['crash', 'pop', 'buzz', 'hiss', 'moo'] },
  { sentence: 'Buzz went the busy bee.', answer: 'buzz', wrong: ['splash', 'pop', 'moo', 'hiss', 'ding'] },
  { sentence: 'Pop! Went the big bubble.', answer: 'pop', wrong: ['buzz', 'crash', 'moo', 'whizz', 'splash'] },
  { sentence: 'Crash! Went the cymbals.', answer: 'crash', wrong: ['splash', 'pop', 'moo', 'ting', 'buzz'] },
  { sentence: 'Moo! Said the cow in the poem.', answer: 'moo', wrong: ['buzz', 'pop', 'splash', 'hiss', 'quack'] },
  { sentence: 'Hiss went the sneaky snake.', answer: 'hiss', wrong: ['splash', 'buzz', 'pop', 'purr', 'moo'] },
]

const ALLITERATION: McqItem[] = [
  {
    q: '',
    answer: 'six slippery snakes',
    wrong: ['fat brown dog', 'green wet frog', 'red big hen', 'tiny round stones', 'long dark night'],
  },
  {
    q: '',
    answer: 'busy buzzing bees',
    wrong: ['happy little cats', 'quiet sleepy owls', 'shiny red kites', 'cold icy drinks', 'warm soft bread'],
  },
  {
    q: '',
    answer: 'five fat fish',
    wrong: ['two small eyes', 'four old boots', 'nine tall men', 'one big star', 'ten green bottles'],
  },
  {
    q: '',
    answer: 'dark damp den',
    wrong: ['bright sunny day', 'soft warm bed', 'quick little fox', 'nice hot bun', 'cosy snug rug'],
  },
]

function gOnomatopoeiaHear(rand: Rand): Question {
  const o = pick(rand, SOUND_WORDS)
  return mcqE(rand, 'Which sound word was in the sentence?', o.answer, shuffle(rand, o.wrong), say(o.sentence))
}

function gAlliterationPick(rand: Rand): Question {
  const a = pick(rand, ALLITERATION)
  return mcqE(rand, 'Which phrase starts every word with the same sound?', a.answer, shuffle(rand, a.wrong))
}

const PERFORM_LINES: { prompt: string; target: string; hint?: string }[] = [
  {
    prompt: 'Perform this excited line aloud!',
    target: '"Wake up! Wake up! It is a sunny morning!"',
    hint: 'Make your voice big and bouncy!',
  },
  {
    prompt: 'Whisper this quiet line aloud.',
    target: 'Shh, the baby bird is asleep.',
    hint: 'Use your softest voice.',
  },
  {
    prompt: 'Read this slow line aloud, nice and slow.',
    target: 'Slowly, slowly creeps the snail.',
    hint: 'Take your time with every word.',
  },
  {
    prompt: 'Read the speech marks line aloud!',
    target: '"Come and play!" called Mia.',
    hint: 'Sound like Mia calling her friends.',
  },
]

const EXPRESSIONS: McqItem[] = [
  { q: '"Yippee! It is snowing!"', answer: 'excited', wrong: ['quiet', 'slow', 'sad', 'grumpy', 'sleepy'] },
  { q: 'Hush now, the stars are sleeping.', answer: 'quiet', wrong: ['excited', 'shouty', 'angry', 'bouncy', 'loud'] },
  { q: 'Slowly, slowly crept the snail.', answer: 'slow', wrong: ['excited', 'quick', 'loud', 'happy', 'shouty'] },
  { q: '"Wake up! Wake up! It is morning!"', answer: 'excited', wrong: ['quiet', 'slow', 'sad', 'sleepy', 'grumpy'] },
]

function gPerformLine(rand: Rand): Question {
  const p = pick(rand, PERFORM_LINES)
  return speakQ(p.prompt, p.target, { hint: p.hint })
}

function gExpressionPick(rand: Rand): Question {
  const e = pick(rand, EXPRESSIONS)
  return mcqE(rand, `How should you read this line? ${e.q}`, e.answer, shuffle(rand, e.wrong))
}

export const UNIT_E12: UnitDef = unitDef(
  'e12',
  12,
  'Poetry Corner',
  'Cambridge 2Ri.16/2Ra/2SLp - rhyme, rhythm, performance',
  '#ec4899',
  '🎵',
  [
    makeLesson(
      'e12l1',
      'Rhyme Time Match',
      ['2Ri.16'],
      'cream',
      'Rhyme Time!',
      'Rhyming words end with the very same sound.',
      [gRhymePairs, gOddRhymeOut],
    ),
    makeLesson(
      'e12l2',
      'Beat & Repeat',
      ['2Ri.16'],
      'amy',
      'Feel the Beat!',
      'Poems often repeat words to make a catchy rhythm.',
      [gRepeatLines, gFindRepeat],
    ),
    makeLesson(
      'e12l3',
      'Sound Poems',
      ['2Rv.04'],
      'tails',
      'Make Some Noise!',
      'Sound words like splash and buzz bring poems to life.',
      [gOnomatopoeiaHear, gAlliterationPick],
    ),
    makeLesson(
      'e12l4',
      'Perform It!',
      ['2SLp.01', '2SLp.02'],
      'blaze',
      'Take the Stage!',
      'Performing a poem means using your best storyteller voice.',
      [gPerformLine, gExpressionPick],
      gPerformLine,
    ),
    makeLesson(
      'e12boss',
      'Poetry Boss',
      ['2Ri.16', '2Rv.04', '2SLp.01'],
      'eggman',
      'Face the Poetry Boss!',
      'Use all your rhyme and rhythm skills to win!',
      [gOddRhymeOut, gRepeatLines, gOnomatopoeiaHear, gExpressionPick],
      gPerformLine,
    ),
  ],
)
