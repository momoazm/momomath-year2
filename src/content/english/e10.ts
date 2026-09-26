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
    {
      title: 'The Umbrella Plane',
      scene: ['☂️', '✈️', '🌃'],
      lines: ['Poppy clicked her red umbrella and it lifted off.', 'They zoomed over the glittering rooftops.'],
      statement: 'Poppy flies over the rooftops in an umbrella.',
      isStory: true,
      hint: 'Umbrellas cannot really fly - this is pretend.',
    },
    {
      title: 'The Grinning Snail',
      scene: ['🐌', '🌟', '💬'],
      lines: ['The snail tipped its shell like a hat.', '"Lovely day!" it said to Otto.'],
      statement: 'A snail tips its hat and chats to Otto.',
      isStory: true,
      hint: 'Real snails cannot talk!',
    },
    {
      title: 'Baby Sea Turtles',
      scene: ['🐢', '🏖️', '🌊'],
      lines: ['Hatchlings scramble down to the sea at night.', 'They paddle off into the deep water.'],
      statement: 'Baby turtles crawl down to the sea.',
      isStory: false,
      hint: 'This really happens - it is a fact.',
    },
    {
      title: 'Why We Yawn',
      scene: ['😴', '😮', '🛏️'],
      lines: ['Yawning helps your body cool down.', 'We yawn most when we feel sleepy.'],
      statement: 'We yawn when we feel sleepy.',
      isStory: false,
      hint: 'True facts about real bodies.',
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
  [
    { left: 'The robot whirred into the kitchen.', right: 'a story' },
    { left: 'Robots need batteries to work.', right: 'real facts' },
    { left: 'Baa, baa, black sheep...', right: 'a rhyme' },
  ],
  [
    { left: 'A fairy granted Tom three wishes.', right: 'a story' },
    { left: 'Butterflies start as caterpillars.', right: 'real facts' },
    { left: 'Row, row, row your boat...', right: 'a rhyme' },
  ],
  [
    { left: 'The moon monster baked green pies.', right: 'a story' },
    { left: 'The moon has no air to breathe.', right: 'real facts' },
    { left: 'Humpty Dumpty sat on a wall...', right: 'a rhyme' },
  ],
  [
    { left: "Nina's shoes danced all by themselves.", right: 'a story' },
    { left: 'Snakes smell with their tongues.', right: 'real facts' },
    { left: 'Old Mother Hubbard went to the cupboard...', right: 'a rhyme' },
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
  {
    title: 'The Spotted Scarf',
    scene: ['🧣', '🧶', '🪡'],
    lines: ['Mia knitted a scarf as long as a snake.', 'It trailed behind her all the way home.'],
    who: 'Mia',
  },
  {
    title: "Sam's Big Catch",
    scene: ['🎣', '🐟', '🚣'],
    lines: ['Sam cast his line from the little jetty.', 'A wriggling silver fish snapped at the bait.'],
    who: 'Sam',
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
  {
    title: 'Splash Time',
    scene: ['🏊', '💦', '🛟'],
    lines: ['Zoe practised her starfish float.', 'Coach Dan counted her lengths out loud.'],
    where: 'at the swimming pool',
  },
  {
    title: 'Loose Change',
    scene: ['🛒', '🍬', '💰'],
    lines: ['Ben chose a chewy sweet from the shelf.', 'He paid the shopkeeper his shiny coin.'],
    where: 'at the shop',
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
  {
    title: 'The Frog Pond',
    scene: ['🐸', '🪰', '💧'],
    lines: [
      'A green frog sat on the lily pad.',
      'A fat fly buzzed past his nose.',
      'Flick! His sticky tongue snapped it up.',
    ],
    events: ['The frog waits on the lily pad', 'A fly buzzes past', 'His tongue snaps up the fly'],
  },
  {
    title: 'Nan Lost Her Keys',
    scene: ['🔑', '🪴', '🚪'],
    lines: [
      'Nan hunted for her keys by the door.',
      'She checked behind the spotty plant pot.',
      'There they were, hanging on her coat!',
    ],
    events: ['Nan searches by the door', 'She looks behind the plant pot', 'The keys hang on her coat'],
  },
  {
    title: 'The Paper Boat',
    scene: ['⛵', '🌧️', '🏞️'],
    lines: [
      'Ben folded a boat from bright white paper.',
      'He floated it in the gutter after rain.',
      'It sailed all the way to the drain.',
    ],
    events: ['Ben folds a paper boat', 'He floats it in the gutter', 'It sails to the drain'],
  },
  {
    title: 'The Brave Butterfly',
    scene: ['🦋', '🌱', '🌺'],
    lines: [
      'The tiny caterpillar spun a cosy chrysalis.',
      'Days later, a damp wing pushed out.',
      'At last the butterfly dried its wings in the sun.',
    ],
    events: ['The caterpillar spins a chrysalis', 'A damp wing pushes out', 'The butterfly dries its wings'],
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
  {
    title: 'Pond Dipping',
    scene: ['🎣', '🐸', '📓'],
    lines: [
      'Class Two crouched around the silver pond.',
      'They dipped their nets into the weeds.',
      'Everyone copied the minnows into their books.',
    ],
    events: ['The class gathers at the pond', 'They dip nets in the weeds', 'They sketch the minnows'],
  },
  {
    title: 'Bakery Visit',
    scene: ['🥐', '👨‍🍳', '🍞'],
    lines: [
      'We tiptoed into the warm, floury bakery.',
      'The baker showed us how to plait the dough.',
      'Last of all, we tasted fresh warm bread.',
    ],
    events: ['We enter the bakery', 'The baker plaits the dough', 'We taste the warm bread'],
  },
  {
    title: 'The Fire Station',
    scene: ['🚒', '🚿', '🧥'],
    lines: [
      'The engine roared out to meet us.',
      'A firefighter slid down the shiny pole.',
      'Then she let us try on her heavy jacket.',
    ],
    events: ['The fire engine meets us', 'A firefighter slides down the pole', 'We try on her jacket'],
  },
  {
    title: 'River Watch',
    scene: ['🦆', '🔭', '🌲'],
    lines: [
      'We walked down the path to the river.',
      'A heron stood as still as a statue.',
      'We wrote down every bird we spotted.',
    ],
    events: ['We walk to the river', 'A heron stands still', 'We list the birds we saw'],
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
  {
    title: 'The Hungry Caterpillar',
    scene: ['🐛', '🍃', '🍽️'],
    lines: [
      'A plump caterpillar munched a bright green leaf.',
      'It wriggled to the next leaf and munched again.',
      'Its tummy was still rumbling loudly...',
    ],
    next: 'It munches through the whole juicy leaf',
    distract: [
      'It grows wings and flies off at once',
      'The leaf turns into a chocolate bar',
      'It puts on a tiny woolly hat',
    ],
  },
  {
    title: 'Missed the Bus',
    scene: ['🚌', '🏃', '⏰'],
    lines: [
      'Jack raced down the hill with his satchel bouncing.',
      'The bus doors hissed closed at the corner.',
      'He glanced at his ticking watch and took a deep breath...',
    ],
    next: 'He sprints to the next stop on the route',
    distract: [
      'He swims after the bus through the sky',
      'The bus grows wings and floats away',
      'He sits down and eats a picnic lunch',
    ],
  },
  {
    title: 'The Wobbly Tooth',
    scene: ['🦷', '👅', '✨'],
    lines: [
      'Amira wiggled her tooth with her tongue.',
      'It swung like a tiny gate now.',
      'She took a brave breath and gave one last nudge...',
    ],
    next: 'The tooth pops out into her hand',
    distract: [
      'Her whole set of teeth zooms away',
      'A dragon appears and brushes them',
      'The tooth turns into a gold coin in the air',
    ],
  },
  {
    title: 'Bread for Ducks',
    scene: ['🦆', '🍞', '🏞️'],
    lines: [
      'Zoe crumbled her last crust over the water.',
      'Five greedy ducks paddled towards her.',
      'A big white swan glided across the pond...',
    ],
    next: 'The swan stretches out its long neck',
    distract: [
      'The ducks pay her with shiny money',
      'The pond freezes solid in a second',
      'The bread turns into a rubber duck',
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
  {
    title: 'The Muddy Boots',
    scene: ['🥾', '🌿', '🚿'],
    lines: [
      'Tom stomped through the squelchy fields.',
      'Brown mud caked his boots right to the tops.',
      'Mum pointed at the garden hose and grinned.',
    ],
    end: 'Tom hoses the mud off outside',
    distract: [
      'The boots run away down the road',
      'Mum plants the boots in the flower bed',
      'The mud turns into chocolate sauce',
    ],
  },
  {
    title: 'The Broken Kite',
    scene: ['🪁', '🪡', '🌬️'],
    lines: [
      "A gust tore the kite from Leo's hands.",
      'It crash-landed in the hedge with one sail ripped.',
      'Gran found her sewing basket and a long strip of tape.',
    ],
    end: 'Gran tapes the sail and it flies again',
    distract: [
      'The kite turns into a real bird',
      'The hedge swallows the kite whole',
      'Leo throws the kite into the bin',
    ],
  },
  {
    title: 'The Shy Singer',
    scene: ['🎤', '😰', '👏'],
    lines: [
      'Ino froze when her name was called for the concert.',
      'Her voice came out as a tiny squeak.',
      'Her friends began to clap along softly.',
    ],
    end: 'Ino sings the whole song out loud',
    distract: [
      'The microphone swallows her song',
      'Everyone runs out of the hall',
      'The stage turns into a swimming pool',
    ],
  },
  {
    title: 'The Seedling',
    scene: ['🌱', '🪣', '☀️'],
    lines: [
      'Asha watered her little seedling every day.',
      'One morning only one green leaf stayed up.',
      'She carried the pot to the sunny window.',
    ],
    end: 'The seedling grows tall and strong',
    distract: [
      'The pot turns into a hungry dinosaur',
      'The leaf flies off to the moon',
      'The plant shrinks into a tiny pebble',
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
  {
    title: 'The Big Reading Badge',
    scene: ['🏅', '📚', '😊'],
    lines: [
      'Kai read his longest book yet today.',
      'Miss Green pinned a shiny badge to his shirt.',
      'He stood taller than everyone in the line.',
    ],
    feel: 'proud',
    options: ['proud', 'shy', 'sleepy'],
  },
  {
    title: 'The Missing Hamster',
    scene: ['🐹', '🔍', '😨'],
    lines: [
      'Nils came home to an empty cage door.',
      'He searched under the sofa and the rug.',
      'He kept glancing at the loose wire.',
    ],
    feel: 'worried',
    options: ['worried', 'delighted', 'bored'],
  },
  {
    title: 'Party Invitation',
    scene: ['🎉', '✉️', '🥳'],
    lines: [
      'A fat envelope landed on the doormat.',
      'Rosa ripped it open with quick fingers.',
      'Her name was printed on the golden ticket.',
    ],
    feel: 'excited',
    options: ['excited', 'calm', 'grumpy'],
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
  {
    title: 'The Lost Chick',
    scene: ['🐤', '🌾', '😥'],
    lines: [
      'One chick tumbled from the high nest.',
      'It cheeped weakly in the long grass.',
      'Mum hen clucked and ran towards it.',
    ],
    ask: 'Which line shows the chick is in trouble?',
    proof: 'It cheeped weakly in the long grass.',
    distract: [
      'It strutted like a proud rooster',
      'It pecked happily at sweet corn',
      'It flapped up to the fence to roost',
    ],
  },
  {
    title: 'Surprise Sleepover',
    scene: ['🛏️', '🥳', '😄'],
    lines: [
      'Ammara answered the door in her slippers.',
      'Her cousin stood there with a big rucksack.',
      'Ammara whooped and grabbed her overnight bag.',
    ],
    ask: 'Which line shows Ammara is thrilled?',
    proof: 'Ammara whooped and grabbed her overnight bag.',
    distract: [
      'She yawned and shuffled to the sofa',
      'She closed the door quietly',
      'She started to tidy the shoes',
    ],
  },
  {
    title: 'The Splinter',
    scene: ['🪵', '✋', '😢'],
    lines: [
      'Rafi pulled a long splinter from the fence.',
      'Tears rolled down his dusty cheeks.',
      'Dad hurried over with the tweezers.',
    ],
    ask: 'Which line shows Rafi is upset?',
    proof: 'Tears rolled down his dusty cheeks.',
    distract: [
      'He laughed all the way down the garden',
      'He danced on the grass with his friends',
      'He waved at the neighbour on his bike',
    ],
  },
  {
    title: 'The Raging River',
    scene: ['🌊', '🚤', '⛈️'],
    lines: [
      'Brown water churned under the little bridge.',
      'Branches banged against the wooden posts.',
      'Dad backed the family away from the edge.',
    ],
    ask: 'Which line shows the river is dangerous?',
    proof: 'Brown water churned under the little bridge.',
    distract: [
      'The water trickled over smooth stones',
      'A duck paddled slowly past',
      'The sun sparkled on the calm surface',
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
  {
    title: 'Buzz, Buzz',
    scene: ['🐝', '🌼', '🎵'],
    lines: [
      'Buzz, buzz, went the busy bee.',
      'Buzz, buzz, round the foxglove tree.',
      'Buzz, buzz, now it flies to me!',
    ],
    repeat: 'Buzz, buzz',
    distract: ['busy bee', 'foxglove tree', 'flies to me'],
  },
  {
    title: 'Sweep and Sweep',
    scene: ['🧹', '🍂', '🍁'],
    lines: [
      'Sweep the leaves, sweep the leaves,',
      'Under the gate and round the trees,',
      'Sweep them up before the freeze!',
    ],
    repeat: 'Sweep the leaves',
    distract: ['under the gate', 'round the trees', 'before the freeze'],
  },
  {
    title: 'Twinkle Stars',
    scene: ['⭐', '🌙', '✨'],
    lines: [
      'Twinkle, twinkle, little star,',
      'Twinkle, twinkle, there you are,',
      'Peeping through the window bar.',
    ],
    repeat: 'Twinkle',
    distract: ['little star', 'there you are', 'window bar'],
  },
  {
    title: 'Slide Away',
    scene: ['🛝', '😄', '☀️'],
    lines: [
      'Up I climb and down I slide,',
      'Up I climb and down I slide,',
      'Round the playground, far and wide!',
    ],
    repeat: 'Up I climb and down I slide',
    distract: ['down I slide', 'round the playground', 'far and wide'],
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
  {
    title: 'The Big Dig',
    scene: ['🚜', '🕳️', '🪱'],
    lines: [
      'The digger made a deep dark hole.',
      'It rolled straight past the rabbit warren.',
      'The mole popped out to watch it rumble.',
    ],
    pair: 'hole / mole',
    distract: ['digger / mole', 'dark / rabbit', 'warren / rumble'],
  },
  {
    title: 'The Dinosaur Bone',
    scene: ['🦴', '🦖', '🏫'],
    lines: [
      'We found a bone beneath the stones.',
      'The teacher carried it home on the bus.',
      'Nobody knew whose bone it was.',
    ],
    pair: 'bone / stones',
    distract: ['bone / teacher', 'stones / bus', 'whose / carried'],
  },
  {
    title: 'The Cheerful Bear',
    scene: ['🐻', '🍯', '🪑'],
    lines: [
      'The bear sat down upon a chair.',
      'He licked the golden honey there.',
      'Sticky paws and messy hair!',
    ],
    pair: 'chair / there',
    distract: ['bear / honey', 'golden / sticky', 'hair / paws'],
  },
  {
    title: 'Jump the Puddle',
    scene: ['🌧️', '🥾', '💦'],
    lines: [
      'I jumped the puddle, splash and spatter,',
      'My boots got soaked, it did not matter,',
      'I hopped all home and heard the pitter-patter.',
    ],
    pair: 'spatter / matter',
    distract: ['jumped / soaked', 'puddle / pitter', 'home / boots'],
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
  {
    title: 'The Whispering Well',
    scene: ['🪣', '⛲', '✨'],
    lines: [
      'Mia lowered her bucket into the old well.',
      'Something down there hummed a silvery tune.',
      'She pulled up a water beetle wearing a tiny crown.',
    ],
    who: 'Mia',
  },
  {
    title: 'The Midnight Bakery',
    scene: ['🥐', '🌙', '😈'],
    lines: [
      'Ben crept downstairs following a warm sweet smell.',
      'The flour sacks were bouncing on their own.',
      'He grabbed a moon-shaped loaf and bolted back to bed.',
    ],
    who: 'Ben',
  },
  {
    title: 'The Clock Thief',
    scene: ['🕐', '🕳️', '🏃'],
    lines: [
      'Zoe spotted a hooded figure stuffing clocks into a sack.',
      'She chased it down the echoing alley.',
      'At last she grabbed the sack and freed every chime.',
    ],
    who: 'Zoe',
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
  {
    title: 'The Volcano Project',
    scene: ['🌋', '🧪', '🏆'],
    lines: [
      'Sam glued the cardboard cone onto the tray.',
      'He spooned in the bicarbonate of soda and red paint.',
      'Fizz! Orange foam bubbled over the rim.',
      'The whole class clapped as it erupted.',
    ],
    events: [
      'Sam builds the cardboard volcano',
      'He adds soda and red paint',
      'Foam fizzes over the rim',
      'The class claps for the eruption',
    ],
  },
  {
    title: 'The Broken Swing',
    scene: ['🛝', '🔧', '🎠'],
    lines: [
      "The chain on Poppy's swing snapped with a bang.",
      'She fetched Mr Lane from the shed.',
      'He clamped a shiny new link in place.',
      'Poppy swung higher than the willow tree.',
    ],
    events: [
      'The swing chain snaps',
      'Poppy fetches Mr Lane',
      'He fits a new link',
      'Poppy swings higher than before',
    ],
  },
  {
    title: 'The Class Pet',
    scene: ['🐹', '🏠', '💕'],
    lines: [
      'A cardboard cage arrived on Monday morning.',
      'The children took turns filling the water bottle.',
      'By Friday the hamster knew all their names.',
      'Everyone waved goodbye when it went home.',
    ],
    events: [
      'The cage arrives on Monday',
      'The children fill the water bottle',
      'The hamster learns their names',
      'It goes home on Friday',
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
  {
    title: 'The Hole in the Fence',
    scene: ['🐔', '🪶', '🌿'],
    lines: [
      'Two hens squeezed through the hole in the fence.',
      'They pecked along the dusty lane.',
      'A shadow fell across the pebbles...',
    ],
    next: 'The farmer scoops them up gently',
    distract: [
      'The hens build a rocket in the lane',
      'The fence grows taller than the trees',
      'The pebbles turn into biscuits',
    ],
  },
  {
    title: 'The Long Jump',
    scene: ['🏃', '🏖️', '🎽'],
    lines: [
      'Tara rocked back on her heels at the white line.',
      'The crowd went suddenly quiet.',
      'She swung her arms and bent her knees...',
    ],
    next: 'She sails through the air and lands in the sand',
    distract: [
      'She floats up into the clouds',
      'The sandpit turns into a chocolate lake',
      'The crowd grows wings and flies off',
    ],
  },
  {
    title: 'The Secret Door',
    scene: ['🚪', '🗝️', '🕯️'],
    lines: [
      'Behind the bookcase a tiny keyhole appeared.',
      'Dusty light spilled out around the edges.',
      'Mia turned the smallest key in the house...',
    ],
    next: 'A staircase of glittering steps opens up',
    distract: [
      'The door turns into a slice of toast',
      'The key melts into a puddle',
      'The bookcase swallows the keyhole',
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
  {
    title: "Sam's Shiny Trophy",
    scene: ['🏆', '😞', '⚽'],
    lines: [
      'Sam lifted the golden cup above his head.',
      'His best friend clapped slowly at the back.',
      'The friend kicked at the grass and looked away.',
    ],
    feel: 'jealous',
    options: ['jealous', 'pleased', 'sleepy'],
  },
  {
    title: 'Before the Play',
    scene: ['🎭', '😬', '🎬'],
    lines: [
      'Ivy peeked through the curtain at the full hall.',
      'Her hands felt cold and clammy.',
      'The music started and her feet moved forwards.',
    ],
    feel: 'nervous',
    options: ['nervous', 'bored', 'furious'],
  },
  {
    title: 'The Kind Surprise',
    scene: ['🍪', '🎁', '🥹'],
    lines: [
      'Grandma left a plate of warm cookies by my bed.',
      'She made them even though her back hurt.',
      'I hugged her twice and said thank you.',
    ],
    feel: 'grateful',
    options: ['grateful', 'cross', 'frightened'],
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
