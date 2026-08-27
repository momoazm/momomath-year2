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

const FIX_BASES = [
  'the cat sat up',
  'my mum is kind',
  'we ran in the park',
  'the dog has a bone',
  'the sun is hot',
  'birds can fly',
]

const PUNCT_CHECKS = [
  { sentence: 'The dog barked.', ok: true },
  { sentence: 'my dad is tall.', ok: false },
  { sentence: 'We played football.', ok: true },
  { sentence: 'the shop is shut', ok: false },
  { sentence: 'Frogs can hop.', ok: true },
  { sentence: 'it is cold today.', ok: false },
]

const QUESTION_SENTENCES = [
  'Where is my hat?',
  'What is that noise?',
  'Can we go now?',
  'Who took my pencil?',
  'Why is the sky blue?',
]

const STATEMENT_SENTENCES = [
  'My hat is blue.',
  'That noise is thunder.',
  'We can go home now.',
  'Ben has my pencil.',
  'The sky looks grey.',
]

const END_MARKS = [
  { text: 'Where is my hat', mark: '?' },
  { text: 'The hat is on the hook', mark: '.' },
  { text: 'Can we eat now', mark: '?' },
  { text: 'Dinner is ready', mark: '.' },
  { text: 'What time is it', mark: '?' },
  { text: 'The cat is asleep', mark: '.' },
]

const HEARD_KINDS = [
  { text: 'When is dinner ready?', kindIndex: 0 },
  { text: "Dinner is at six o'clock.", kindIndex: 1 },
  { text: 'Wash your hands, please.', kindIndex: 2 },
  { text: 'How does the trick work?', kindIndex: 0 },
  { text: 'The trick made us laugh.', kindIndex: 1 },
  { text: 'What a lovely surprise!', kindIndex: 3 },
]

const COMMAND_POOL = [
  'Sit down quietly.',
  'Put your pencils away.',
  'Line up at the door.',
  'Wash your hands, please.',
]

const STATEMENT_POOL = [
  'The pencil is sharp.',
  'Our line is very long.',
  'The sink is wet.',
  'Pencils go in the pot.',
]

const QUESTION_POOL = [
  'Where is your chair?',
  'Can you see the board?',
  'Whose coat is this?',
  'Is it playtime yet?',
]

const BOSSY_VERBS = [
  { prompt: '___ your shoes.', answer: 'Tie', wrong: ['Laces', 'Blue', 'Softly'] },
  {
    prompt: '___ the door, please.',
    answer: 'Shut',
    wrong: ['Window', 'Green', 'Slowly'],
  },
  {
    prompt: '___ your hands before tea.',
    answer: 'Wash',
    wrong: ['Soap', 'Fluffy', 'Carefully'],
  },
  {
    prompt: '___ the light off.',
    answer: 'Switch',
    wrong: ['Bright', 'Darkly', 'Bulb'],
  },
  {
    prompt: '___ up your coat, it is cold.',
    answer: 'Zip',
    wrong: ['Cosy', 'Warmly', 'Fluffy'],
  },
]

const LIST_ITEMS: string[][] = [
  ['eggs', 'milk', 'bread'],
  ['apples', 'pears', 'grapes'],
  ['pens', 'paper', 'glue'],
  ['cats', 'dogs', 'rabbits'],
  ['socks', 'shorts', 'hats'],
]

const SPOKEN_LINES = [
  'It is raining',
  'I love ice cream',
  'Look at that rainbow',
  'My tooth is wobbly',
  'The bus is late',
]

const SPEAKERS = ['Mum', 'Dad', 'Ben', 'Mia', 'Sam']

const DIALOGUES = [
  { a: 'Time for bed!', sa: 'called Mum', b: 'Not yet!', sb: 'pleaded Sam' },
  { a: 'Dinner is ready!', sa: 'called Dad', b: 'Coming!', sb: 'shouted Mia' },
  { a: 'Look at this bug!', sa: 'gasped Ben', b: 'Wow, it is huge!', sb: 'said Alfie' },
]

function gFixTheSentence(rand: Rand): Question {
  const base = pick(rand, FIX_BASES)
  const capped = base[0].toUpperCase() + base.slice(1)
  const correct = `${capped}.`
  const choices = shuffle(rand, [correct, `${base}.`, capped, base])
  return mcqFixed('Choose the correct sentence.', choices, choices.indexOf(correct))
}

function gSpotTheError(rand: Rand): Question {
  const c = pick(rand, PUNCT_CHECKS)
  return tfQ('Is this sentence punctuated correctly?', c.sentence, c.ok)
}

function gQuestionOrStatement(rand: Rand): Question {
  const isQuestion = pick(rand, [true, false])
  const s = isQuestion
    ? pick(rand, QUESTION_SENTENCES)
    : pick(rand, STATEMENT_SENTENCES)
  return mcqFixed(
    `What kind of sentence is this? "${s}"`,
    ['a question', 'a statement', 'a command', 'an exclamation'],
    isQuestion ? 0 : 1,
    say(s),
  )
}

function gEndMarkFill(rand: Rand): Question {
  const m = pick(rand, END_MARKS)
  const wrong = m.mark === '.' ? ['?', ','] : ['.', ',']
  return mcqE(rand, `${m.text} ___`, m.mark, wrong, { audioText: `${m.text}${m.mark}` })
}

function gHearTheQuestion(rand: Rand): Question {
  const h = pick(rand, HEARD_KINDS)
  return mcqFixed(
    'Listen! What kind of sentence do you hear?',
    ['a question', 'a statement', 'a command', 'an exclamation'],
    h.kindIndex,
    say(h.text),
  )
}

function gCommandSort(rand: Rand): Question {
  return matchQ(rand, 'Match each sentence to its type.', [
    { left: pick(rand, COMMAND_POOL), right: 'command' },
    { left: pick(rand, STATEMENT_POOL), right: 'statement' },
    { left: pick(rand, QUESTION_POOL), right: 'question' },
  ])
}

function gBossyVerb(rand: Rand): Question {
  const b = pick(rand, BOSSY_VERBS)
  const choices = shuffle(rand, [b.answer, ...b.wrong])
  return mcqFixed(
    `Choose the bossy verb: ${b.prompt}`,
    choices,
    choices.indexOf(b.answer),
  )
}

function gCommaList(rand: Rand): Question {
  const [a, b, c] = pick(rand, LIST_ITEMS)
  const correct = `I need ${a}, ${b} and ${c}.`
  const choices = shuffle(rand, [
    correct,
    `I need ${a} ${b} and ${c}.`,
    `I need ${a}, ${b} and ${c}`,
    `I need ${a}, ${b} and, ${c}.`,
  ])
  return mcqFixed('Choose the correct list sentence.', choices, choices.indexOf(correct))
}

function gListOrder(rand: Rand): Question {
  const [a, b, c] = pick(rand, LIST_ITEMS)
  const place = pick(rand, ['bag', 'box', 'basket'])
  return orderQ(
    'Tap the words in the order you hear them.',
    [a, b, c],
    say(`Put ${a}, ${b} and ${c} in the ${place}.`),
  )
}

function gSpeechMarks(rand: Rand): Question {
  const sp = pick(rand, SPOKEN_LINES)
  const who = pick(rand, SPEAKERS)
  const correct = `"${sp}," said ${who}.`
  const choices = shuffle(rand, [
    correct,
    `${sp}, said ${who}.`,
    `"${sp}" said ${who}.`,
    `"${sp}," Said ${who}.`,
  ])
  return mcqFixed(
    'Choose the correctly written sentence.',
    choices,
    choices.indexOf(correct),
  )
}

function gNewSpeakerLine(rand: Rand): Question {
  const d = pick(rand, DIALOGUES)
  const correct = `"${d.a}" ${d.sa}.\n"${d.b}" ${d.sb}.`
  const choices = shuffle(rand, [
    correct,
    `"${d.a}" ${d.sa}. "${d.b}" ${d.sb}.`,
    `"${d.a}" ${d.sa}.\n${d.b} ${d.sb}.`,
    `${d.a} ${d.sa}.\n"${d.b}" ${d.sb}.`,
  ])
  return mcqFixed('Choose the correct dialogue.', choices, choices.indexOf(correct))
}

export const UNIT_E6: UnitDef = unitDef(
  'e6',
  6,
  'Sentence Mechanics',
  'Cambridge 2Wg.01-.04 / 2Rg - punctuation & sentence types',
  '#0ea5e9',
  '✏️',
  [
    makeLesson(
      'e6l1',
      'Capitals & Full Stops',
      ['2Wg.01'],
      'knuckles',
      'Capital patrol!',
      'Every sentence needs a capital letter at the start and a full stop at the end!',
      [gFixTheSentence, gSpotTheError],
    ),
    makeLesson(
      'e6l2',
      'Asking or Telling?',
      ['2Wg.04', '2Rg.02'],
      'tails',
      'Ask or tell?',
      'Questions ask something and end with ? Statements tell you something and end with .',
      [gQuestionOrStatement, gEndMarkFill, gHearTheQuestion],
    ),
    makeLesson(
      'e6l3',
      'Command Time!',
      ['2Wg.04', '2Rg.04'],
      'amy',
      'Be bossy!',
      'Bossy verbs like Jump and Wash turn a sentence into a command!',
      [gCommandSort, gBossyVerb],
    ),
    makeLesson(
      'e6l4',
      'Comma Trains',
      ['2Wg.02'],
      'blaze',
      'Choo choo!',
      'Commas link list words like carriages in a train - then a full stop ends the ride!',
      [gCommaList, gListOrder],
    ),
    makeLesson(
      'e6l5',
      'Speech Marks Spotting',
      ['2Wg.03', '2Rg.01'],
      'shadow',
      'Secret speech!',
      'Words people say wear speech marks - and each new speaker starts a new line!',
      [gSpeechMarks, gNewSpeakerLine],
    ),
    makeLesson(
      'e6boss',
      'Mechanics Boss',
      ['2Wg.01', '2Wg.02', '2Wg.03', '2Wg.04'],
      'eggman',
      'BOSS TIME!',
      'Capitals, end marks, commas and speech marks - defeat the Mechanics Boss!',
      [
        gFixTheSentence,
        gQuestionOrStatement,
        gBossyVerb,
        gCommaList,
        gSpeechMarks,
      ],
      gNewSpeakerLine,
    ),
  ],
)
