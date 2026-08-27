import {
  mcqE,
  mcqFixed,
  matchQ,
  orderQ,
  pick,
  shuffle,
  makeLesson,
  unitDef,
  type Gen,
} from './helpers'

const gJoinerFill: Gen = (rand) => {
  const items = [
    { text: 'I like cats ___ I love dogs.', answer: 'and', chips: ['and', 'so', 'or'] },
    { text: 'Do you want jam ___ honey?', answer: 'or', chips: ['or', 'but', 'so'] },
    { text: 'We can fly a kite ___ build a den.', answer: 'or', chips: ['or', 'so', 'but'] },
    { text: 'Poppy drew a cat ___ coloured it in.', answer: 'and', chips: ['and', 'or', 'so'] },
    { text: 'Sam washed the car ___ cut the grass.', answer: 'and', chips: ['and', 'but', 'or'] },
    { text: 'Grandma is 100 ___ she swims every day.', answer: 'but', chips: ['but', 'or', 'so'] },
    { text: 'Alfie reached the top shelf ___ he is still small.', answer: 'but', chips: ['but', 'or', 'so'] },
    { text: "It was Ben's turn ___ he rolled the dice.", answer: 'and', chips: ['and', 'but', 'or'] },
  ]
  const item = pick(rand, items)
  const cs = shuffle(rand, item.chips)
  return mcqFixed(item.text, cs, cs.indexOf(item.answer), { hint: 'Choose the joining word' })
}

const gJoinMatch: Gen = (rand) => {
  const pool = [
    { left: 'It was cold. It was sunny.', right: 'It was cold but sunny.' },
    { left: 'Mia likes jam. She likes honey.', right: 'Mia likes jam and honey.' },
    { left: 'Do you want juice? Do you want milk?', right: 'Do you want juice or milk?' },
    { left: 'Sam washed up. He dried the dishes.', right: 'Sam washed up and dried the dishes.' },
    { left: 'Ben hurried. He missed the boat.', right: 'Ben hurried but missed the boat.' },
    { left: 'We can play inside. We can play outside.', right: 'We can play inside or outside.' },
  ]
  const picked = shuffle(rand, pool).slice(0, 3)
  return matchQ(
    rand,
    'Match two sentences to the joined one!',
    picked.map((p) => ({ left: p.left, right: p.right })),
    { hint: 'Say the joined sentence out loud' },
  )
}

const gBecauseFill: Gen = (rand) => {
  const items = [
    { text: 'Mum is good at baking ___ she practises a lot.', answer: 'because', chips: ['because', 'so', 'but'] },
    { text: 'A cactus can live in the desert ___ it stores water.', answer: 'because', chips: ['because', 'so', 'but'] },
    { text: 'Whales are mammals ___ they breathe air.', answer: 'because', chips: ['because', 'but', 'or'] },
    { text: 'I brush my teeth ___ I go to bed.', answer: 'when', chips: ['when', 'if', 'or'] },
    { text: 'The clock chimes ___ it strikes midnight.', answer: 'when', chips: ['when', 'if', 'so'] },
    { text: '___ I had wings, I would fly to school.', answer: 'If', chips: ['If', 'When', 'Because'] },
    { text: '___ dragons were real, knights would ride them.', answer: 'If', chips: ['If', 'Because', 'When'] },
    { text: 'It was Sports Day ___ everyone wore team colours.', answer: 'so', chips: ['so', 'because', 'but'] },
  ]
  const item = pick(rand, items)
  const cs = shuffle(rand, item.chips)
  return mcqFixed(item.text, cs, cs.indexOf(item.answer), { hint: 'Pick the bridge word' })
}

const gBridgeBuild: Gen = (rand) => {
  const sentences = [
    ['We', 'stayed', 'inside', 'because', 'it', 'rained'],
    ['Mia', 'laughed', 'when', 'the', 'frog', 'jumped'],
    ['Rest', 'now', 'if', 'you', 'feel', 'poorly'],
    ['Ben', 'hid', 'because', 'thunder', 'boomed'],
    ['Sam', 'waves', 'when', 'Gran', 'visits'],
  ]
  return orderQ('Build the whole sentence!', pick(rand, sentences), {
    hint: 'Find the bridge word first',
  })
}

const gJoinedPick: Gen = (rand) => {
  const items = [
    {
      a: 'The bell rang.',
      b: 'We went home.',
      correct: 'The bell rang, so we went home.',
      wrong: ['The bell rang we went home.', 'We went home, so the bell rang.'],
    },
    {
      a: 'Sam found a coin.',
      b: 'He bought a lolly.',
      correct: 'Sam found a coin, so he bought a lolly.',
      wrong: ['Sam found a coin, but he bought a lolly.', 'He bought a lolly, so Sam found a coin.'],
    },
    {
      a: 'Do you want toast?',
      b: 'Do you want cereal?',
      correct: 'Do you want toast or cereal?',
      wrong: ['Do you want toast, so cereal?', 'Do you want toast we want cereal?'],
    },
    {
      a: 'Ben has a dog.',
      b: 'Mia has a cat.',
      correct: 'Ben has a dog, and Mia has a cat.',
      wrong: ['Ben has a dog, or Mia has a cat.', 'Ben has a dog Mia has a cat.'],
    },
  ]
  const item = pick(rand, items)
  return mcqE(rand, `${item.a} ${item.b}`, item.correct, item.wrong, {
    hint: 'Join both ideas into ONE sentence',
  })
}

const gClauseOrder: Gen = (rand) => {
  const sets = [
    ['The owl hooted', 'because it was scared'],
    ['We built a sandcastle', 'and dug a deep moat'],
    ['When it snows,', 'we sledge down the hill'],
    ['After the film,', 'we shared popcorn at home'],
  ]
  return orderQ('Order the clauses!', pick(rand, sets), {
    hint: 'Which clause comes first?',
  })
}

const gOpenerVariety: Gen = (rand) => {
  const items = [
    {
      q: 'Which opener tells us WHEN the story is set?',
      answer: 'One sunny morning,',
      wrong: ['Suddenly,', 'At last,', 'Slowly,'],
    },
    {
      q: 'Which opener shows a big surprise?',
      answer: 'All of a sudden,',
      wrong: ['On a frosty night,', 'At last,', 'My name is Mia.'],
    },
    {
      q: 'Which opener finishes a story?',
      answer: 'At last, we flew home.',
      wrong: ['One morning,', 'Suddenly,', 'Once upon a time,'],
    },
    {
      q: 'Which opener puts a step in order?',
      answer: 'First,',
      wrong: ['Long ago,', 'Suddenly,', 'All of a sudden,'],
    },
  ]
  const item = pick(rand, items)
  return mcqE(rand, item.q, item.answer, item.wrong)
}

const gStoryFlow: Gen = (rand) => {
  const flows = [
    [
      'One bright morning, we found a map.',
      'After that, we followed the winding path.',
      'Suddenly, a troll blocked the way!',
      'At last, we discovered the gold.',
    ],
    [
      'First, we packed our bags.',
      'Next, we rattled along on the bus.',
      'Then, we paddled in the chilly sea.',
      'At last, we slept like sleepy logs.',
    ],
    [
      'One snowy day, school closed early.',
      'First, we rolled a fat snowman.',
      'After that, we sipped warm cocoa.',
      'Finally, Mum thawed our frozen gloves.',
    ],
    [
      'On Monday, Alfie planted a seed.',
      'Soon, a green shoot peeked through.',
      'By Friday, it towered like a beanstalk!',
      'At last, he showed the whole class.',
    ],
  ]
  return orderQ('Put the story straight!', pick(rand, flows), {
    hint: 'The openers show the order',
  })
}

const lessons = [
  makeLesson('e9l1', 'And, But, Or Joiners', ['2Wg.05'], 'sonic', 'Join it up!', 'And adds ideas, but flips them, and or offers a choice!', [gJoinerFill, gJoinMatch]),
  makeLesson('e9l2', 'Because, If, When Bridges', ['2Wg.06', '2Rg.03'], 'tails', 'Bridge the gap!', 'Because tells why, if pretends, and when tells time!', [gBecauseFill, gBridgeBuild]),
  makeLesson('e9l3', 'Two Ideas, One Sentence', ['2Wg.05', '2Wg.06'], 'amy', 'Two become one!', 'Squash two short sentences into one super sentence!', [gJoinedPick, gClauseOrder]),
  makeLesson('e9l4', 'Sentence Opener Showcase', ['2Wv.03'], 'cream', 'Sparkle first!', 'A cracking opener hooks your reader straight away!', [gOpenerVariety, gStoryFlow]),
]

const boss = makeLesson(
  'e9boss',
  'Sentence Boss',
  ['2Wg.05', '2Wg.06', '2Wv.03'],
  'eggman',
  'BOSS TIME!',
  'Joiners, bridges, clauses and openers - smash them all!',
  [gJoinerFill, gJoinMatch, gBecauseFill, gBridgeBuild, gJoinedPick, gOpenerVariety, gStoryFlow],
  gClauseOrder,
)

export const UNIT_E9 = unitDef(
  'e9',
  9,
  'Super Sentences',
  'Cambridge 2Wg.05/.06 / 2Wv.03 - conjunctions & multi-clause sentences',
  '#f59e0b',
  '🌉',
  [...lessons, boss],
)
