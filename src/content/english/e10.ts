import type { Question, UnitDef } from '../types'
import type { Rand } from './helpers'
import {
  makeLesson,
  matchQ,
  mcqE,
  mcqFixed,
  orderQ,
  pick,
  story,
  tfQ,
  unitDef,
} from './helpers'

interface StorySeed {
  title: string
  scene: string[]
  lines: string[]
}

const panel = (seed: StorySeed) => story(seed.title, seed.scene, seed.lines)

const OTHER_NAMES = ['Ben', 'Mia', 'Sam', 'Alfie', 'Poppy', 'Zoe']

const gStoryOrFact = (rand: Rand): Question => {
  const items = [
    {
      title: 'The Magic Key',
      scene: ['🗝️', '🐉', '🚪'],
      lines: ['Alfie found a key that glowed gold.', 'The door opened on a land of dragons.'],
      statement: 'Alfie finds a glowing key and dragons.',
      isStory: true,
      hint: 'Magic keys and dragons only happen in made-up tales!',
    },
    {
      title: 'The Talking Cat',
      scene: ['🐱', '🍞', '💬'],
      lines: ["Mia's cat said, \"Good morning!\"", 'They shared warm toast together.'],
      statement: 'A cat talks and shares toast with Mia.',
      isStory: true,
      hint: 'Real cats cannot talk!',
    },
    {
      title: 'The Flying Bike',
      scene: ['🚲', '☁️', '🏘️'],
      lines: ["Sam's old bike lifted off into the sky.", 'He flew over the sleeping town.'],
      statement: "Sam's bike lifts off and flies.",
      isStory: true,
      hint: 'Bikes really cannot fly - this is pretend.',
    },
    {
      title: 'Busy Bees',
      scene: ['🐝', '🌻'],
      lines: ['Bees visit flowers to collect food.', 'They live together in a hive.'],
      statement: 'Bees visit flowers and live in a hive.',
      isStory: false,
      hint: 'These are true facts about real bees.',
    },
    {
      title: 'Frogs Grow Up',
      scene: ['🐸', '💧'],
      lines: ['Frogspawn hatches into tiny tadpoles.', 'Slowly the tadpoles grow legs.'],
      statement: 'Tadpoles slowly grow legs.',
      isStory: false,
      hint: 'This really happens - it is a fact book page.',
    },
    {
      title: 'Night Trains',
      scene: ['🚂', '🌙'],
      lines: ['Trains run along metal rails.', 'Some trains travel under the ground.'],
      statement: 'Some trains run under the ground.',
      isStory: false,
      hint: 'True facts about real trains.',
    },
  ]
  const item = pick(rand, items)
  return tfQ('Does this come from a story?', item.statement, item.isStory, {
    story: panel(item),
    hint: item.hint,
  })
}

const WRITING_KIND_SETS = [
  [
    { left: 'Once upon a time a fox lost a sock.', right: 'a story' },
    { left: 'Foxes have bushy tails and sharp ears.', right: 'real facts' },
    { left: 'Hickory, dickory, dock!', right: 'a rhyme' },
  ],
  [
    { left: 'The dragon swooped over the castle.', right: 'a story' },
    { left: 'Volcanoes spray out hot, melted rock.', right: 'real facts' },
    { left: 'Twinkle, twinkle, little star...', right: 'a rhyme' },
  ],
]

const gSortWriting = (rand: Rand): Question =>
  matchQ(rand, 'What kind of writing is each one?', pick(rand, WRITING_KIND_SETS), {
    hint: 'A made-up tale, true information or rhyming words?',
  })

const WHO_STORIES: (StorySeed & { who: string })[] = [
  {
    title: 'The Lost Teddy',
    scene: ['🧸', '🏪', '😢'],
    lines: ['Poppy lost Ted at the busy shop.', 'She searched under every single shelf.'],
    who: 'Poppy',
  },
  {
    title: 'Sports Day Dash',
    scene: ['🏃', '🏟️', '📣'],
    lines: ['Ben lined up for the final race.', 'His legs pumped faster and faster.'],
    who: 'Ben',
  },
  {
    title: "Gran's Carrots",
    scene: ['👵', '🥕', '🐌'],
    lines: ['Alfie helped Gran pull carrots in her garden.', 'A plump snail slid past his boot.'],
    who: 'Alfie',
  },
  {
    title: 'A Puppy Called Biscuit',
    scene: ['🐶', '👟', '🏠'],
    lines: ["Zoe's family adopted a bouncy puppy.", 'Biscuit nibbled her best shoe to bits.'],
    who: 'Zoe',
  },
]

const gMainCharacter = (rand: Rand): Question => {
  const seed = pick(rand, WHO_STORIES)
  return mcqE(
    rand,
    'Who is the main character?',
    seed.who,
    OTHER_NAMES.filter((n) => n !== seed.who),
    { story: panel(seed), hint: 'Whose doings fill the whole story?' },
  )
}

const PLACE_POOL = [
  'at the beach',
  'at the park',
  'at the farm',
  'at the library',
  'at the swimming pool',
  'at the shop',
]

const WHERE_STORIES: (StorySeed & { where: string })[] = [
  {
    title: 'Ducks in the Rain',
    scene: ['🦆', '🌧️', '💧'],
    lines: ['Mia and Dad threw seed to the ducks.', 'Raindrops pattered on the pond.'],
    where: 'at the park',
  },
  {
    title: 'Crab Tickles',
    scene: ['🦀', '🏖️', '😂'],
    lines: ['Sam and Mum paddled in the shallow sea.', "A tiny crab tickled Sam's toes!"],
    where: 'at the beach',
  },
  {
    title: 'Storytime Visit',
    scene: ['📚', '🧒', '🤫'],
    lines: ['The class heard tales in the hushed hall.', 'The grown-up reading made them giggle.'],
    where: 'at the library',
  },
  {
    title: 'Coach Trip to the Farm',
    scene: ['🚌', '🐄', '🌾'],
    lines: ['Year Two rumbled along in a big coach.', 'A cow mooed hello at the gate.'],
    where: 'at the farm',
  },
]

const gWhereAreThey = (rand: Rand): Question => {
  const seed = pick(rand, WHERE_STORIES)
  return mcqE(rand, 'Where are they?', seed.where, PLACE_POOL.filter((p) => p !== seed.where), {
    story: panel(seed),
    hint: 'Look for the place word inside the story.',
  })
}

const RETELL_STORIES: (StorySeed & { events: string[] })[] = [
  {
    title: 'The Kite Day',
    scene: ['🪁', '👦', '🌳'],
    lines: [
      'Ben raced up the windy hill.',
      'Up went his scarlet kite!',
      'Crack! The string snapped and the kite flopped into a tree.',
    ],
    events: ['Ben hurried up the hill', 'His kite soared into the sky', 'The kite snagged in a tree'],
  },
  {
    title: "Poppy's First Cake",
    scene: ['🎂', '🥣', '👩‍🍳'],
    lines: [
      'Poppy decided to bake a surprise cake.',
      'With Mum she stirred eggs, flour and sugar.',
      'At last a golden cake cooled on the rack.',
    ],
    events: [
      'Poppy planned a surprise cake',
      'Poppy and Mum stirred the mixture',
      'The golden cake cooled down',
    ],
  },
  {
    title: "Sam's Wobbly Tooth",
    scene: ['🦷', '😬', '👨'],
    lines: [
      'At breakfast Sam felt a wobbly tooth.',
      'Dad advised, "Give it gentle wiggles."',
      'Plop! The tooth sat in his palm.',
    ],
    events: ['Sam noticed a loose tooth', 'Dad suggested gentle wiggles', 'Out popped the tooth'],
  },
]

const gRetellOrder = (rand: Rand): Question => {
  const seed = pick(rand, RETELL_STORIES)
  return orderQ('Put the events in the right order.', seed.events, {
    story: panel(seed),
    hint: 'Follow the story from beginning to end.',
  })
}

const TRIP_STORIES: (StorySeed & { events: string[] })[] = [
  {
    title: 'The Farm Coach Trip',
    scene: ['🚌', '🐄', '🐑'],
    lines: [
      'Class Two trundled to Green Farm.',
      'First they tossed grain to the honking geese.',
      'Finally they stroked a woolly lamb.',
    ],
    events: ['The class reached Green Farm', 'Grain went to the geese', 'Everyone stroked a lamb'],
  },
  {
    title: 'Museum Morning',
    scene: ['🦕', '🏛️', '📝'],
    lines: [
      'The class marched to the museum.',
      'A towering dinosaur skeleton loomed overhead.',
      'Zoe copied its shape into her sketchbook.',
    ],
    events: [
      'The class walked to the museum',
      'Giant dinosaur bones towered up',
      'Zoe drew the skeleton',
    ],
  },
]

const gTripOrder = (rand: Rand): Question => {
  const seed = pick(rand, TRIP_STORIES)
  return orderQ('Number the events from first to last.', seed.events, {
    story: panel(seed),
    hint: 'Words like "first" and "finally" are clues.',
  })
}

const NEXT_STORIES: (StorySeed & { next: string; distract: string[] })[] = [
  {
    title: 'The Runaway Hamster',
    scene: ['🐹', '📚', '🫳'],
    lines: [
      'Chip the hamster squeezed out of his cage.',
      'Zoe spied him quivering behind the bookcase.',
      'She held out his favourite sunflower seed.',
    ],
    next: 'Chip creeps out and takes the seed',
    distract: [
      'Chip gnaws straight through the wall',
      'The bookcase scurries away on little legs',
      'Chip flutters off like a bird',
    ],
  },
  {
    title: 'Save the Snowman',
    scene: ['⛄', '☀️', '☂️'],
    lines: [
      'Bright sunshine melted the garden snow.',
      "Ben's snowman began to droop and drip.",
      'Ben dashed indoors and returned with his biggest umbrella.',
    ],
    next: 'Ben shelters the snowman under it',
    distract: [
      'The snowman hops onto the shed roof',
      'Ben sails away holding the umbrella handle',
      'The umbrella sprouts wings and flies',
    ],
  },
  {
    title: 'The Squeaky Box',
    scene: ['🎁', '🐶', '🎈'],
    lines: [
      'On his birthday Alfie shook a mystery box.',
      'Something inside went squeak, squeak!',
      'Mum grinned and passed him the scissors.',
    ],
    next: 'A small puppy tumbles out',
    distract: [
      'The box is completely empty',
      'Ten frozen fish spill across the floor',
      'A fridge is crammed inside the box',
    ],
  },
]

const gGuessNext = (rand: Rand): Question => {
  const seed = pick(rand, NEXT_STORIES)
  return mcqE(rand, 'What happens next?', seed.next, seed.distract, {
    story: panel(seed),
    hint: 'Pick the ending the story clues point to.',
  })
}

const ENDING_STORIES: (StorySeed & { end: string; distract: string[] })[] = [
  {
    title: 'The Muddy Pup',
    scene: ['🐶', '🛁', '🌿'],
    lines: [
      'Biscuit the pup rolled in the squelchy mud.',
      'He trotted home brown from nose to tail.',
      'Zoe sighed and ran a deep bubble bath.',
    ],
    end: 'Biscuit enjoys a bubbly scrub',
    distract: [
      'Biscuit stays filthy forever',
      'The bathtub trots off down the street',
      'Zoe buries the soap in the garden',
    ],
  },
  {
    title: 'The Red Mitten',
    scene: ['🧤', '❄️', '🛝'],
    lines: [
      'Fat snowflakes tumbled over the park.',
      "One red mitten slunk off Zoe's hand.",
      'Zoe backtracked along her own footprints.',
    ],
    end: 'Zoe finds the mitten under the snow',
    distract: [
      'The mitten dissolves in the snow',
      'The slide gobbles up the mitten',
      'Zoe gives up searching at once',
    ],
  },
  {
    title: "Grandpa's Glasses",
    scene: ['👴', '👓', '🛋️'],
    lines: [
      'Grandpa hunted high and low for his glasses.',
      'He rifled drawers, plant pots and even shoes.',
      'Ben quivered behind the cushion, giggling.',
    ],
    end: 'Ben peeks out with the glasses on',
    distract: [
      'The glasses sprint upstairs to bed',
      'The glasses hop out of the window',
      'The cushion swallows them whole',
    ],
  },
]

const gPickEnding = (rand: Rand): Question => {
  const seed = pick(rand, ENDING_STORIES)
  return mcqE(rand, 'How does the story end?', seed.end, seed.distract, {
    story: panel(seed),
    hint: 'Which ending truly fits?',
  })
}

const FEEL_STORIES: (StorySeed & { feel: string; options: string[] })[] = [
  {
    title: 'Gold Sticker Day',
    scene: ['🏆', '😊', '📒'],
    lines: [
      'Mia bounced up and cheered aloud.',
      'Her holiday story won the gold sticker.',
      'She paraded it round every table.',
    ],
    feel: 'happy',
    options: ['happy', 'sad', 'scared'],
  },
  {
    title: 'Thunder Rumble',
    scene: ['⛈️', '😱', '🛏️'],
    lines: [
      'CRASH! Thunder rattled the window frames.',
      'Sam burrowed under his blanket.',
      "He gripped Mum's hand extra tight.",
    ],
    feel: 'scared',
    options: ['scared', 'brave', 'cross'],
  },
  {
    title: 'Robot Breaks',
    scene: ['🤖', '💢', '🍽️'],
    lines: [
      "Snap! Alfie's robot lost an arm.",
      'He stamped his feet and scowled.',
      'He pushed his tea away untouched.',
    ],
    feel: 'cross',
    options: ['cross', 'cheerful', 'calm'],
  },
  {
    title: 'Bye-Bye Balloon',
    scene: ['🎈', '😢', '☁️'],
    lines: [
      "Poppy's balloon slipped over the garden fence.",
      'Big tears rolled down her cheeks.',
      'She watched until it became a dot.',
    ],
    feel: 'sad',
    options: ['sad', 'excited', 'proud'],
  },
]

const gFeelCheck = (rand: Rand): Question => {
  const seed = pick(rand, FEEL_STORIES)
  return mcqFixed('How does the character feel?', seed.options, seed.options.indexOf(seed.feel), {
    story: panel(seed),
    hint: 'What do their actions tell you?',
  })
}

const EVIDENCE_STORIES: (StorySeed & { ask: string; proof: string; distract: string[] })[] = [
  {
    title: 'A Shiny New Bike',
    scene: ['🚲', '✨', '👦'],
    lines: [
      'Dad wheeled out a gleaming red bike.',
      'Ben sprang into the air with a whoop.',
      'He begged to ride it that minute.',
    ],
    ask: 'Which line shows Ben is excited?',
    proof: 'He sprang into the air with a whoop.',
    distract: [
      'He yawned and drifted off to sleep',
      'He hid behind the garden shed',
      'He asked Dad to take it back',
    ],
  },
  {
    title: 'Spider Alarm',
    scene: ['🕷️', '📖', '😨'],
    lines: [
      "A chunky spider plopped onto Zoe's book.",
      'She froze stiff and squeaked, "Help!"',
      'Her eyes stretched as wide as saucers.',
    ],
    ask: 'Which line shows Zoe is frightened?',
    proof: 'She froze stiff and squeaked, "Help!"',
    distract: [
      'She cuddled the spider warmly',
      'She sang it a lullaby',
      'She invited it home for tea',
    ],
  },
  {
    title: 'The Winning Goal',
    scene: ['⚽', '🥅', '🎉'],
    lines: [
      'Sam thumped in the very last goal.',
      'He punched the air and roared with joy.',
      'Teammates tumbled on top of him.',
    ],
    ask: 'Which line shows Sam is thrilled?',
    proof: 'He punched the air and roared with joy.',
    distract: [
      'He trudged off in sulky silence',
      'He ripped up the team list',
      'He sobbed quietly in the goal net',
    ],
  },
]

const gFindEvidence = (rand: Rand): Question => {
  const seed = pick(rand, EVIDENCE_STORIES)
  return mcqE(rand, seed.ask, seed.proof, seed.distract, {
    story: panel(seed),
    hint: 'Hunt for the line that proves the feeling.',
  })
}

const REPEAT_STORIES: (StorySeed & { repeat: string; distract: string[] })[] = [
  {
    title: 'Run, Ben, Run!',
    scene: ['🏃', '💨', '📣'],
    lines: [
      '"Run, Ben, run!" called Miss Grey.',
      '"Run, Ben, run!" cheered Poppy.',
      'Ben flashed past the finish flag!',
    ],
    repeat: 'Run, Ben, run',
    distract: ['called Miss Grey', 'past the finish flag', 'cheered Poppy'],
  },
  {
    title: 'Clap Along',
    scene: ['👏', '🎵', '🦶'],
    lines: [
      'Clap your hands, clap your hands!',
      'Stomp your feet right to the beat!',
      'Now everybody join the dance!',
    ],
    repeat: 'Clap your hands',
    distract: ['Stomp your feet', 'right to the beat', 'join the dance'],
  },
  {
    title: 'Tick, Tock',
    scene: ['⏰', '🌙', '🍳'],
    lines: [
      'Tick, tock, chimed the kitchen clock.',
      'Tick, tock, on through the night.',
      'Morning burst in with a bang!',
    ],
    repeat: 'Tick, tock',
    distract: ['the kitchen clock', 'through the night', 'burst in with a bang'],
  },
]

const gFindRepeat = (rand: Rand): Question => {
  const seed = pick(rand, REPEAT_STORIES)
  return mcqE(rand, 'Which words repeat in the story?', seed.repeat, seed.distract, {
    story: panel(seed),
    hint: 'Find the words that come round twice.',
  })
}

const RHYME_STORIES: (StorySeed & { pair: string; distract: string[] })[] = [
  {
    title: "The Cat's Hat",
    scene: ['🐱', '🎩', '🦆'],
    lines: [
      'A cat wore a glossy hat.',
      'It settled on a striped mat.',
      'The ducks quacked, "Imagine that!"',
    ],
    pair: 'cat / hat',
    distract: ['hat / ducks', 'striped / imagine', 'ducks / mat'],
  },
  {
    title: 'Keep Afloat',
    scene: ['⛈️', '⛵', '🧥'],
    lines: [
      'Rain hammered on our little boat.',
      'We pulled on coats to stay afloat.',
      'Dad scooped the puddles, wave by wave.',
    ],
    pair: 'boat / afloat',
    distract: ['boat / wave', 'coats / wave', 'hammered / little'],
  },
  {
    title: 'Moonlight Spoon',
    scene: ['🌙', '🥄', '🦉'],
    lines: [
      'The moon hung bright as a polished spoon.',
      'An owl hummed a drowsy tune.',
      'Mia yawned and sank into her pillows.',
    ],
    pair: 'moon / spoon',
    distract: ['moon / owl', 'polished / drowsy', 'tune / pillows'],
  },
]

const gSpotRhyme = (rand: Rand): Question => {
  const seed = pick(rand, RHYME_STORIES)
  return mcqE(rand, 'Which two words rhyme?', seed.pair, seed.distract, {
    story: panel(seed),
    hint: 'Rhyming words share their ending sound.',
  })
}

const BOSS_WHO: (StorySeed & { who: string })[] = [
  {
    title: 'The Secret Cave',
    scene: ['🔦', '🕳️', '✨'],
    lines: [
      'Sam edged first into the dripping cave.',
      'His friends crowded in behind with torches.',
      'Water plinked from the stony roof.',
      'Far ahead, something sparkled gold!',
    ],
    who: 'Sam',
  },
  {
    title: 'The Paper Plane Contest',
    scene: ['✈️', '📜', '🏅'],
    lines: [
      'Alfie creased his paper plane with care.',
      'The rest of the class folded quickly.',
      'Planes whirred across the classroom air.',
      'His glided furthest of all!',
    ],
    who: 'Alfie',
  },
]

const gBossCharacter = (rand: Rand): Question => {
  const seed = pick(rand, BOSS_WHO)
  return mcqE(
    rand,
    'Who is the main character?',
    seed.who,
    OTHER_NAMES.filter((n) => n !== seed.who),
    { story: panel(seed), hint: 'Whose deeds drive the story?' },
  )
}

const BOSS_SEQUENCE: (StorySeed & { events: string[] })[] = [
  {
    title: 'The Class Play',
    scene: ['🎭', '🌟', '👧'],
    lines: [
      'Class Two staged The Little Red Hen.',
      'On stage Zoe blanked on her opening line.',
      'From row three Mum silently mouthed the words.',
      'Zoe remembered, finished proudly and bowed!',
    ],
    events: [
      'Zoe forgot her line on stage',
      'Mum mouthed the words to help',
      'Zoe remembered her line',
      'She finished and took a bow',
    ],
  },
  {
    title: 'The Snow Fort',
    scene: ['❄️', '🏰', '⛄'],
    lines: [
      'Fresh snow carpeted the playground.',
      'Ben and Sam patted snow into sturdy bricks.',
      'A rival gang lobbed a friendly snowball.',
      'Peace was sealed with a carrot-nosed sentry!',
    ],
    events: [
      'Snow covered the playground',
      'The boys built snow bricks',
      'A snowball flew their way',
      'They crowned the fort with a snowman',
    ],
  },
]

const gBossSequence = (rand: Rand): Question => {
  const seed = pick(rand, BOSS_SEQUENCE)
  return orderQ('Put the events in the right order.', seed.events, {
    story: panel(seed),
    hint: 'Trace the tale from start to finish.',
  })
}

const BOSS_NEXT: (StorySeed & { next: string; distract: string[] })[] = [
  {
    title: 'The Enormous Turnip',
    scene: ['🌱', '👴', '👵'],
    lines: [
      'Grandpa tugged the enormous turnip.',
      'The turnip refused to budge.',
      'Gran added her pull. Still it stuck.',
      "Zoe seized Gran's waist and everyone heaved...",
    ],
    next: 'The turnip pops out at last!',
    distract: [
      'The turnip swallows the tool shed',
      'The family drifts off on the turnip',
      'The turnip sings a thunderous song',
    ],
  },
  {
    title: 'The Midnight Noise',
    scene: ['🌙', '🔊', '🐭'],
    lines: [
      'Scratch, scratch, came a noise downstairs.',
      'Ben tiptoed down with his torch.',
      'The cupboard door rattled gently...',
    ],
    next: 'Out pops a hungry little mouse',
    distract: [
      'The cupboard gallops off on four legs',
      'A dragon unrolls from the broom closet',
      'The stairs float up into the clouds',
    ],
  },
]

const gBossPredict = (rand: Rand): Question => {
  const seed = pick(rand, BOSS_NEXT)
  return mcqE(rand, 'What happens next?', seed.next, seed.distract, {
    story: panel(seed),
    hint: 'Choose the ending the clues support.',
  })
}

const BOSS_FEELINGS: (StorySeed & { feel: string; options: string[] })[] = [
  {
    title: 'The Last Lap',
    scene: ['🏃', '🩹', '👏'],
    lines: [
      'Alfie tripped hard on the final lap.',
      'His knee scraped and hot tears pricked.',
      'Yet he rose, limped on and finished.',
      'The whole field rose clapping for him.',
    ],
    feel: 'proud',
    options: ['proud', 'jealous', 'bored'],
  },
  {
    title: 'The Thank-You Card',
    scene: ['💌', '🖍️', '😊'],
    lines: [
      'Zoe drew the finest thank-you card.',
      'Her wobbly letters spelled every name.',
      'Nan read it twice and hugged her tight.',
      'Zoe glowed like a little lantern.',
    ],
    feel: 'happy',
    options: ['happy', 'grumpy', 'worried'],
  },
]

const gBossFeelings = (rand: Rand): Question => {
  const seed = pick(rand, BOSS_FEELINGS)
  return mcqFixed('How does the character feel at the end?', seed.options, seed.options.indexOf(seed.feel), {
    story: panel(seed),
    hint: 'Read the last lines closely.',
  })
}

export const UNIT_E10: UnitDef = unitDef(
  'e10',
  10,
  'Story Quests',
  'Cambridge 2Ri fiction comprehension - stories',
  '#6366f1',
  '🏰',
  [
    makeLesson(
      'e10l1',
      'Story or Fact?',
      ['2Ri.01', '2Ra.01', '2Ra.04'],
      'cream',
      'Story Spotter!',
      'Made-up tales sparkle with magic, but fact books stick to what is really true.',
      [gStoryOrFact, gSortWriting],
    ),
    makeLesson(
      'e10l2',
      'Who & Where?',
      ['2Ri.08'],
      'amy',
      'Meet the Cast!',
      'Every story hides a hero and a place - sniff both of them out!',
      [gMainCharacter, gWhereAreThey],
    ),
    makeLesson(
      'e10l3',
      'Retell the Tale',
      ['2Ri.07', '2Rs.01'],
      'tails',
      'Retell Rocket!',
      'Super readers pop story events back into the right order.',
      [gRetellOrder, gTripOrder],
    ),
    makeLesson(
      'e10l4',
      'Guess the Ending',
      ['2Ri.11'],
      'blaze',
      'Endings Ahead!',
      'Sharp detectives use story clues to predict what happens next.',
      [gGuessNext, gPickEnding],
    ),
    makeLesson(
      'e10l5',
      'Between the Lines',
      ['2Ri.10', '2Ri.12'],
      'shadow',
      'Feeling Detective!',
      'Characters show their feelings through what they do, not what they say.',
      [gFeelCheck, gFindEvidence],
    ),
    makeLesson(
      'e10l6',
      'Pattern Detective',
      ['2Ri.16', '2Ri.02', '2Ra.01'],
      'sonic',
      'Pattern Power!',
      'Watch for words and rhymes that come whirling round again and again.',
      [gFindRepeat, gSpotRhyme],
    ),
    makeLesson(
      'e10boss',
      'Big Story Boss',
      ['2Ri.13', '2Ri.15'],
      'eggman',
      'Big Story Boss!',
      'Dr Eggman dares you to unravel his longest, sneakiest stories yet.',
      [gBossCharacter, gBossSequence, gBossPredict, gBossFeelings],
    ),
  ],
)
