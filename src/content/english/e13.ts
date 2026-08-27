import {
  mcqE,
  mcqFixed,
  orderQ,
  speakQ,
  story,
  pick,
  shuffle,
  PICTURE_BANK,
  makeLesson,
  unitDef,
  type Gen,
} from './helpers'

const gPlanOrder: Gen = (rand) => {
  const themes = [
    ['Pick brave pirates', 'Choose a treasure island', 'Dream up a huge storm', 'Plan a daring rescue'],
    ['Choose two astronauts', 'Pick a faraway planet', 'Invent a wobbly robot problem', 'Plan a safe trip home'],
    ['Pick a kind princess', 'Choose a deep dark wood', 'Add a grumpy troll', 'Plan a clever escape'],
    ['Choose a lost kitten', 'Picture our quiet village', 'Imagine it stuck up a tree', 'Plan a ladder rescue'],
  ]
  return orderQ('Order the story plan!', pick(rand, themes), {
    hint: 'Writers choose WHO first',
  })
}

const gSettingPick: Gen = (rand) => {
  const sets = [
    { emojis: [PICTURE_BANK.castle], answer: 'a castle', wrong: ['the seaside', 'outer space', 'a farm'] },
    { emojis: [PICTURE_BANK.beach], answer: 'the seaside', wrong: ['a castle', 'a snowy hill', 'a cave'] },
    { emojis: [PICTURE_BANK.school], answer: 'a school', wrong: ['the moon', 'a jungle', 'under the sea'] },
    { emojis: [PICTURE_BANK.island], answer: 'an island', wrong: ['a busy city', 'an igloo', 'a train station'] },
    { emojis: [PICTURE_BANK.mountain], answer: 'a mountain', wrong: ['a swimming pool', 'a bakery', 'a flat field'] },
    { emojis: [PICTURE_BANK.garden], answer: 'a garden', wrong: ['a stadium', 'a garage', 'the North Pole'] },
  ]
  const set = pick(rand, sets)
  return mcqE(rand, 'Where is this story set?', set.answer, set.wrong, {
    visual: { type: 'emoji-group', emojis: set.emojis },
    hint: 'Look closely at the picture',
  })
}

const BME_STORIES = [
  {
    title: 'The Lost Puppy',
    scene: ['🐶', '🚪', '🏠'],
    beats: [
      'A soggy puppy scratches at the door.',
      'Ben makes posters to find its owner.',
      'The puppy skips home with its owner.',
    ],
    asks: [
      { p: 'a puppy scratches at the door', part: 'the beginning' },
      { p: 'Ben hunts for the owner', part: 'the middle' },
      { p: 'the puppy goes home', part: 'the end' },
    ],
  },
  {
    title: 'The Giant Sunflower',
    scene: ['🌱', '🌻', '🏆'],
    beats: [
      'Poppy plants a tiny seed.',
      'A cheeky slug munches the sprout.',
      'Her sunflower wins a prize at the fete.',
    ],
    asks: [
      { p: 'Poppy plants a seed', part: 'the beginning' },
      { p: 'a slug munches the sprout', part: 'the middle' },
      { p: 'the sunflower wins a prize', part: 'the end' },
    ],
  },
  {
    title: 'The Shed Dragon',
    scene: ['🥚', '🐉', '💨'],
    beats: [
      'Mia finds a strange warm egg in the shed.',
      'The baby dragon sneezes out sparks.',
      'The dragon flutters off to Dragon Island.',
    ],
    asks: [
      { p: 'Mia finds a warm egg', part: 'the beginning' },
      { p: 'the baby sneezes sparks', part: 'the middle' },
      { p: 'the dragon flies away', part: 'the end' },
    ],
  },
  {
    title: 'Sack Race Saturday',
    scene: ['🏃', '🌳', '🏅'],
    beats: [
      'Alfie hops into the school sack race.',
      'He bounces the wrong way into a bush.',
      'He hops back and wins a shiny medal.',
    ],
    asks: [
      { p: 'Alfie joins the race', part: 'the beginning' },
      { p: 'he tumbles into a bush', part: 'the middle' },
      { p: 'he wins a medal', part: 'the end' },
    ],
  },
]

const PARTS = ['the beginning', 'the middle', 'the end']

const gBMEOrder: Gen = (rand) => {
  const s = pick(rand, BME_STORIES)
  return orderQ('Beginning, middle, end - order it!', s.beats, {
    hint: 'How does it OPEN?',
  })
}

const gBMEFill: Gen = (rand) => {
  const s = pick(rand, BME_STORIES)
  const ask = pick(rand, s.asks)
  const cs = shuffle(rand, PARTS)
  return mcqFixed(`Which part is ${ask.p}?`, cs, cs.indexOf(ask.part), {
    story: story(s.title, s.scene, s.beats),
    hint: 'Match it to the story parts',
  })
}

const gDescribeBuild: Gen = (rand) => {
  const sentences = [
    ['The', 'fluffy', 'cat', 'sleeps', 'all', 'day'],
    ['A', 'shiny', 'rocket', 'zooms', 'past', 'Mars'],
    ['The', 'grumpy', 'troll', 'stomps', 'away'],
    ['My', 'enormous', 'sandwich', 'holds', 'cheese'],
    ['The', 'sparkly', 'crown', 'glitters', 'brightly'],
  ]
  return orderQ('Build a describing sentence!', pick(rand, sentences), {
    hint: 'Slip the adjective before the noun',
  })
}

const gDescribePick: Gen = (rand) => {
  const scenes = [
    {
      emoji: PICTURE_BANK.elephant,
      correct: 'A huge grey elephant sprays cool water.',
      wrong: ['A small blue whale dives deep.', 'Grey and big.'],
    },
    {
      emoji: PICTURE_BANK.bee,
      correct: 'A stripy bee buzzes to a golden flower.',
      wrong: ['A lazy cat purrs on a rug.', 'Buzz buzz.'],
    },
    {
      emoji: PICTURE_BANK.rocket,
      correct: 'A silver rocket races into starry space.',
      wrong: ['A red tractor plods through mud.', 'Zoom.'],
    },
    {
      emoji: PICTURE_BANK.rainbow,
      correct: 'A giant rainbow arches over the wet road.',
      wrong: ['A brown dog digs a deep hole.', 'Lots of colours.'],
    },
    {
      emoji: PICTURE_BANK.lion,
      correct: 'A fierce lion roars on the dusty plain.',
      wrong: ['A quiet rabbit nibbles grass.', 'Big and loud.'],
    },
  ]
  const s = pick(rand, scenes)
  return mcqE(rand, 'Tap the best describing sentence', s.correct, s.wrong, {
    visual: { type: 'emoji-group', emojis: [s.emoji] },
    hint: 'Which one paints a PICTURE?',
  })
}

const gFactGroup: Gen = (rand) => {
  const sections = [
    {
      heading: 'Where Polar Bears Live',
      fits: 'They roam the icy Arctic.',
      other: ['They munch hungry seals.', 'Their fur looks white.', 'Cubs are tiny at birth.'],
    },
    {
      heading: 'What Bees Make',
      fits: 'Bees make sweet runny honey.',
      other: ['Bees sleep in hives.', 'Bees dance to chat.', 'Bees own six legs.'],
    },
    {
      heading: 'How Rockets Fly',
      fits: 'Roaring fire pushes the rocket up.',
      other: ['Astronauts wear chunky suits.', 'Rockets have pointy noses.', 'Countdown is very loud.'],
    },
    {
      heading: 'All About Frogspawn',
      fits: 'Frogspawn hatches into tadpoles.',
      other: ['Frogs hop on springy legs.', 'Ponds make cosy homes.', 'Frogs snatch flies with tongues.'],
    },
  ]
  const sec = pick(rand, sections)
  const cs = shuffle(rand, [sec.fits, ...sec.other])
  return mcqFixed(`Fact file: "${sec.heading}"`, cs, cs.indexOf(sec.fits), {
    hint: 'Only ONE fact suits this heading',
  })
}

const gReportOrder: Gen = (rand) => {
  const kits = [
    ['All About Bees', 'Bees are busy little insects.', 'They visit hundreds of flowers daily.', 'Bees are super helpers!'],
    ['My Pet Rabbit', 'Rabbits make lovely quiet pets.', 'Nibbles munches hay and crunchy carrots.', 'Every home needs a hoppy friend!'],
    ['Volatile Volcanoes', 'A volcano is a mountain that erupts.', 'Red-hot lava oozes down its sides.', 'Volcanoes absolutely rock!'],
    ['Brilliant Boats', 'Boats float and carry people.', 'Sails catch the wind to push along.', 'Boats are brilliant machines!'],
  ]
  return orderQ('Stack the report in order!', pick(rand, kits), {
    hint: 'Title on top, ending last',
  })
}

const gErrorHunt: Gen = (rand) => {
  const items = [
    { good: 'Ben kicked the ball far.', bad: ['ben kicked the ball far.', 'Ben kicked the ball far'] },
    { good: 'Mia painted a rainbow.', bad: ['mia painted a rainbow.', 'Mia painted a rainbow'] },
    { good: 'We visited the castle on Friday.', bad: ['we visited the castle on friday.', 'We visited the castle on friday.'] },
    { good: 'The happy dog wagged its tail.', bad: ['The happy dog wagged it tail.', 'the happy dog wagged its tail.'] },
    { good: 'Sam sat down and read.', bad: ['Sam sat down down and read.', 'sam sat down and read.'] },
  ]
  const item = pick(rand, items)
  const cs = shuffle(rand, [item.good, ...item.bad])
  return mcqFixed('Which line is checked and perfect?', cs, cs.indexOf(item.good), {
    hint: 'Caps and full stops!',
  })
}

const gProofreadHear: Gen = (rand) => {
  const lines = [
    'The cat sat on the comfy cushion.',
    'My best friend shares her sweets.',
    'Rain pattered on the window all afternoon.',
    'Our teacher tells funny jokes on Fridays.',
    'The little boat bobbed on the choppy sea.',
  ]
  return speakQ('Read it aloud - does it make sense?', pick(rand, lines), {
    hint: 'Catch any silly slip-ups!',
  })
}

const lessons = [
  makeLesson('e13l1', 'Plan My Story', ['2Wc.02'], 'amy', 'Plan like a pro!', 'Great stories start with a plan: who, where and what goes wrong!', [gPlanOrder, gSettingPick]),
  makeLesson('e13l2', 'Beginning, Middle, End', ['2Ws.01'], 'tails', 'Story sandwich!', 'Every story has a beginning, a muddled middle and a happy end!', [gBMEOrder, gBMEFill]),
  makeLesson('e13l3', 'Describe This!', ['2Wc.03', '2Wv.02'], 'cream', 'Paint with words!', 'Delicious describing words help readers SEE your story!', [gDescribeBuild, gDescribePick]),
  makeLesson('e13l4', 'Report Builder', ['2Ws.02', '2Ws.03', '2Wc.04', '2Wc.05'], 'knuckles', 'Fact stacker!', 'Reports stack true facts under clear headings!', [gFactGroup, gReportOrder]),
  makeLesson('e13l5', 'Check It!', ['2Wp.05', '2Wp.06'], 'shadow', 'Detective eyes!', 'Real authors re-read their work to hunt sneaky mistakes!', [gErrorHunt, gProofreadHear]),
]

const boss = makeLesson(
  'e13boss',
  'Author Boss',
  ['2Ws.01', '2Wc.02', '2Wp.05'],
  'eggman',
  'BOSS TIME!',
  'Plan it, build it, check it - write like a real author!',
  [gPlanOrder, gSettingPick, gBMEOrder, gBMEFill, gDescribeBuild, gDescribePick, gFactGroup, gReportOrder, gErrorHunt],
  gProofreadHear,
)

export const UNIT_E13 = unitDef(
  'e13',
  13,
  'Author Studio',
  'Cambridge 2Ws/2Wc/2Wp - planning, structure, checking',
  '#f97316',
  '✍️',
  [...lessons, boss],
)
