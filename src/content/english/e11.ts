import type { Question, StoryPanel, UnitDef } from '../types'
import {
  makeLesson,
  matchQ,
  mcqE,
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

interface McqItem {
  q: string
  answer: string
  wrong: string[]
}

interface PanelMcq extends McqItem {
  panel: StoryPanel
}

const FEATURES: McqItem[] = [
  {
    q: 'It lists the chapters and their page numbers at the front.',
    answer: 'contents page',
    wrong: ['glossary', 'label', 'subheading', 'caption', 'index'],
  },
  {
    q: 'It is a word list at the back explaining tricky words.',
    answer: 'glossary',
    wrong: ['contents page', 'label', 'subheading', 'caption', 'index'],
  },
  {
    q: 'It is a word beside a diagram naming one part, like wing.',
    answer: 'label',
    wrong: ['glossary', 'contents page', 'caption', 'subheading', 'title'],
  },
  {
    q: 'It is a small heading telling what a section is about.',
    answer: 'subheading',
    wrong: ['glossary', 'label', 'contents page', 'caption', 'index'],
  },
]

const FEATURE_JOBS = [
  { left: 'contents page', right: 'lists what is in the book' },
  { left: 'glossary', right: 'explains tricky words' },
  { left: 'label', right: 'names a part of a picture' },
  { left: 'subheading', right: 'tells what a section is about' },
  { left: 'caption', right: 'tells you more about a picture' },
]

function gFeatureSpot(rand: Rand): Question {
  const f = pick(rand, FEATURES)
  return mcqE(rand, `Which text feature is this? ${f.q}`, f.answer, shuffle(rand, f.wrong))
}

function gFeatureJob(rand: Rand): Question {
  return matchQ(rand, 'Match each feature to its job.', shuffle(rand, FEATURE_JOBS).slice(0, 4))
}

const DIAGRAM_FACTS: PanelMcq[] = [
  {
    panel: story('A Bee Diagram', ['🐝', '🌸'], [
      'This diagram labels a bee.',
      'It has six legs.',
      'Its four wings help it fly.',
    ]),
    q: 'How many legs does the bee have?',
    answer: 'six',
    wrong: ['four', 'eight', 'two', 'ten', 'twelve'],
  },
  {
    panel: story('A Flower Diagram', ['🌻', '🐝'], [
      'This flower diagram has labels.',
      'The roots hold it in the soil.',
      'Bright petals attract bees.',
    ]),
    q: 'What do the labels name?',
    answer: 'parts of the flower',
    wrong: ['kinds of animals', 'days of the week', 'types of weather', 'colours of paint', 'shapes of boxes'],
  },
  {
    panel: story('A Ladybird Diagram', ['🐞', '🍃'], [
      'This diagram labels a ladybird.',
      'Five spots sit on its back.',
      'Under the shell are hidden wings.',
    ]),
    q: 'How many spots are on its back?',
    answer: 'five',
    wrong: ['three', 'seven', 'ten', 'two', 'nine'],
  },
]

const DIAGRAM_CHECKS: { panel: StoryPanel; trueS: string; falseS: string }[] = [
  {
    panel: story('A Bee Diagram', ['🐝'], [
      'This diagram labels a bee.',
      'It has six legs and four wings.',
    ]),
    trueS: 'The bee has four wings.',
    falseS: 'The bee has eight legs.',
  },
  {
    panel: story('A Fish Diagram', ['🐟', '💧'], [
      'This fish diagram has labels.',
      'Fish use fins and a tail to swim.',
    ]),
    trueS: 'Fish use fins to swim.',
    falseS: 'Fish use fins to sing songs.',
  },
  {
    panel: story('An Owl Diagram', ['🦉', '🌙'], [
      'This owl diagram points to big eyes.',
      'Owls use their big eyes at night.',
    ]),
    trueS: 'Owls see well at night.',
    falseS: 'Owls cannot see anything at all.',
  },
]

function gDiagramFact(rand: Rand): Question {
  const d = pick(rand, DIAGRAM_FACTS)
  return mcqE(rand, d.q, d.answer, shuffle(rand, d.wrong), { story: d.panel })
}

function gDiagramCheck(rand: Rand): Question {
  const d = pick(rand, DIAGRAM_CHECKS)
  const ans = pick(rand, [true, false])
  return tfQ('Is this true or false?', ans ? d.trueS : d.falseS, ans, { story: d.panel })
}

const FIND_FACTS: PanelMcq[] = [
  {
    panel: story('All About Bees', ['🐝', '🌻'], [
      'Bees live in a hive.',
      'They buzz from flower to flower.',
      'Bees make sweet honey.',
    ]),
    q: 'What do bees make?',
    answer: 'honey',
    wrong: ['milk', 'jam', 'bread', 'cheese', 'soup'],
  },
  {
    panel: story('All About Penguins', ['🐧', '❄️'], [
      'Penguins are birds that cannot fly.',
      'They love to slide on the ice.',
    ]),
    q: 'What do penguins love to do on the ice?',
    answer: 'slide',
    wrong: ['fly', 'gallop', 'cluck', 'quack', 'moo'],
  },
  {
    panel: story('All About Sunflowers', ['🌻', '☀️'], [
      'Sunflowers are tall plants.',
      'They turn their faces to the sun.',
      'Birds eat their tasty seeds.',
    ]),
    q: 'What do sunflowers turn to face?',
    answer: 'the sun',
    wrong: ['the moon', 'the rain', 'the wind', 'the stars', 'the snow'],
  },
  {
    panel: story('All About Hedgehogs', ['🦔', '🌙'], [
      'Hedgehogs sleep all day.',
      'At night they snuffle in the leaves.',
      'Their backs are covered in spikes.',
    ]),
    q: 'When do hedgehogs go hunting?',
    answer: 'at night',
    wrong: ['in the morning', 'at midday', 'at breakfast time', 'after school', 'at sunrise'],
  },
]

const LOCATE_WORDS: PanelMcq[] = [
  {
    panel: FIND_FACTS[0].panel,
    q: 'Find the word that names where bees live.',
    answer: 'hive',
    wrong: ['flower', 'buzz', 'sweet', 'honey', 'live'],
  },
  {
    panel: FIND_FACTS[1].panel,
    q: 'Find the word that names what penguins slide on.',
    answer: 'ice',
    wrong: ['birds', 'fly', 'love', 'slide', 'that'],
  },
  {
    panel: FIND_FACTS[2].panel,
    q: 'Find the word that names what sunflowers turn to face.',
    answer: 'sun',
    wrong: ['faces', 'turn', 'seeds', 'tall', 'eat'],
  },
  {
    panel: FIND_FACTS[3].panel,
    q: 'Find the word that names when hedgehogs hunt.',
    answer: 'night',
    wrong: ['leaves', 'snuffle', 'day', 'spikes', 'sleep'],
  },
]

function gFindTheFact(rand: Rand): Question {
  const f = pick(rand, FIND_FACTS)
  return mcqE(rand, f.q, f.answer, shuffle(rand, f.wrong), { story: f.panel })
}

function gLocateWord(rand: Rand): Question {
  const f = pick(rand, LOCATE_WORDS)
  return mcqE(rand, f.q, f.answer, shuffle(rand, f.wrong), { story: f.panel })
}

const PURPOSE_JOBS = [
  { left: 'a story', right: 'to entertain you' },
  { left: 'a recipe', right: 'to show how to cook' },
  { left: 'a report about bees', right: 'to give you facts' },
  { left: 'a lost-dog poster', right: 'to share important news' },
  { left: 'a joke book', right: 'to make you laugh' },
]

const WHY_WRITTEN: McqItem[] = [
  {
    q: 'a funny poem about a dancing cat',
    answer: 'to make you laugh',
    wrong: ['to teach you to bake', 'to give facts about sharks', 'to warn about storms', 'to tell you the time', 'to list shopping'],
  },
  {
    q: 'steps for planting a seed',
    answer: 'to show how to plant',
    wrong: ['to tell a fairy tale', 'to make you laugh', 'to describe a monster', 'to sing a song', 'to sell a toy'],
  },
  {
    q: 'a book of shark facts',
    answer: 'to teach you about sharks',
    wrong: ['to tell a bedtime story', 'to share a cake recipe', 'to make you giggle', 'to warn about rain', 'to list your toys'],
  },
  {
    q: 'a card saying get well soon',
    answer: 'to cheer someone up',
    wrong: ['to give map directions', 'to teach numbers', 'to explain volcanoes', 'to list rules', 'to show how to knit'],
  },
]

function gPurposeMatch(rand: Rand): Question {
  return matchQ(rand, 'Match each text to its purpose.', shuffle(rand, PURPOSE_JOBS).slice(0, 4))
}

function gWhyWritten(rand: Rand): Question {
  const w = pick(rand, WHY_WRITTEN)
  return mcqE(rand, `Someone wrote ${w.q}. Why?`, w.answer, shuffle(rand, w.wrong))
}

const MAIN_POINTS: { prompt: string; panel: StoryPanel; items: string[] }[] = [
  {
    prompt: 'Put the main points in order.',
    panel: story('All About Bees', ['🐝', '🌻'], [
      'Bees live in a hive.',
      'They visit flowers for food.',
      'Bees make sweet honey.',
    ]),
    items: ['A bee lives in a hive.', 'It visits flowers for food.', 'It makes sweet honey.'],
  },
  {
    prompt: 'Put the main points in order.',
    panel: story('A Frog Grows Up', ['🐸', '💧'], [
      'Frogspawn floats in the pond.',
      'Tiny tadpoles hatch and swim.',
      'They grow into hopping frogs.',
    ]),
    items: ['Frogspawn floats in the pond.', 'Tadpoles hatch and swim.', 'They grow into hopping frogs.'],
  },
  {
    prompt: 'Put the steps in order.',
    panel: story('How to Make a Jam Sandwich', ['🍞', '🍓'], [
      'First, wash your hands.',
      'Next, spread jam on the bread.',
      'Last, put the slices together.',
    ]),
    items: ['Wash your hands.', 'Spread jam on the bread.', 'Put the slices together.'],
  },
]

const SAY_FACTS: { panel: StoryPanel; target: string }[] = [
  { panel: FIND_FACTS[0].panel, target: 'Bees make sweet honey in a hive.' },
  { panel: FIND_FACTS[1].panel, target: 'Penguins love to slide on the ice.' },
  { panel: FIND_FACTS[3].panel, target: 'Hedgehogs hunt for food at night.' },
]

function gOrderPoints(rand: Rand): Question {
  const m = pick(rand, MAIN_POINTS)
  return orderQ(m.prompt, m.items, { story: m.panel })
}

function gSayFact(rand: Rand): Question {
  const s = pick(rand, SAY_FACTS)
  return speakQ('Retell one fact out loud.', s.target, {
    story: s.panel,
    hint: 'Speak clearly like a news reporter!',
  })
}

export const UNIT_E11: UnitDef = unitDef(
  'e11',
  11,
  'Fact Finder',
  'Cambridge 2Ri/2Rs non-fiction - features & retrieval',
  '#14b8a6',
  '🔎',
  [
    makeLesson(
      'e11l1',
      'Feature Finder',
      ['2Rs.02', '2Rs.03'],
      'tails',
      'Be a Page Spy!',
      'Non-fiction books have special parts that help you find facts fast.',
      [gFeatureSpot, gFeatureJob],
    ),
    makeLesson(
      'e11l2',
      'Diagram Detective',
      ['2Ri.09'],
      'knuckles',
      'Read the Labels!',
      'Diagrams are pictures with labels that name every part.',
      [gDiagramFact, gDiagramCheck],
    ),
    makeLesson(
      'e11l3',
      'Find the Fact',
      ['2Ri.14'],
      'amy',
      'Go Fact Hunting!',
      'Good readers hunt in the text to find facts and words.',
      [gFindTheFact, gLocateWord],
    ),
    makeLesson(
      'e11l4',
      "What's It For?",
      ['2Ri.05'],
      'blaze',
      'Spot the Purpose!',
      'Every text is written for a reason - your job is to spot it!',
      [gPurposeMatch, gWhyWritten],
    ),
    makeLesson(
      'e11l5',
      'Explain It Back',
      ['2SLs.01', '2Ri.15'],
      'sonic',
      'Explain It Back!',
      'Great readers can retell the main points in their own words.',
      [gOrderPoints, gSayFact],
      gSayFact,
    ),
    makeLesson(
      'e11boss',
      'Fact Boss',
      ['2Ri.14', '2Rs.02', '2Ri.05'],
      'eggman',
      'Beat the Fact Boss!',
      'Show Eggman you can find facts anywhere!',
      [gFeatureSpot, gDiagramCheck, gPurposeMatch, gOrderPoints],
      gFindTheFact,
    ),
  ],
)
