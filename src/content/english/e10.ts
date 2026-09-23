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
import { TERM2 } from './terms'

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
      title: 'The Greedy Dragon',
      scene: ['🐲', '👑', '🔥'],
      lines: ['A dragon stole the golden crown.', 'It burped a ring of sparkly smoke.'],
      statement: 'A dragon steals a crown and burps smoke.',
      isStory: true,
      hint: 'Real dragons never steal crowns - this is pretend!',
    },
    {
      title: 'How Rainbows Form',
      scene: ['🌈', '☀️', '🌧️'],
      lines: ['Sunshine bends through raindrops.', 'The colours spread across the sky.'],
      statement: 'Sunshine and rain make rainbow colours.',
      isStory: false,
      hint: 'This is true science, not a made-up tale.',
    },
    {
      title: 'The Sleepwalking Sock',
      scene: ['🧦', '🌙', '🚪'],
      lines: ['One night the red sock tiptoed away.', 'It climbed out the cat flap.'],
      statement: 'A sock walks out of the house at night.',
      isStory: true,
      hint: 'Socks cannot walk - pure make-believe!',
    },
    {
      title: 'Why Leaves Change',
      scene: ['🍂', '🍁', '🌬️'],
      lines: ['In autumn leaves stop making green colour.', 'Yellow and orange pigments show through.'],
      statement: 'Leaves turn yellow and orange in autumn.',
      isStory: false,
      hint: 'A real fact from nature books.',
    },
    {
      title: 'The Wishing Well Whale',
      scene: ['🐋', '🪙', '✨'],
      lines: ['A whale swallowed a lucky coin.', 'It spat fountains of glitter all day.'],
      statement: 'A whale swallows a coin and spouts glitter.',
      isStory: true,
      hint: 'Whales do not wish on coins - made up!',
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
    { left: 'A pirate found a chest of gold coins.', right: 'a story' },
    { left: 'Bees visit lots of flowers every day.', right: 'real facts' },
    { left: 'Pat a cake, pat a cake, bake a cake...', right: 'a rhyme' },
  ],
  [
    { left: 'The robot learned to dance the twist.', right: 'a story' },
    { left: 'Penguins are birds that cannot fly.', right: 'real facts' },
    { left: 'Rain, rain, go away...', right: 'a rhyme' },
  ],
  [
    { left: 'Mia sneezed and discovered superpowers.', right: 'a story' },
    { left: 'The moon pulls the ocean tides.', right: 'real facts' },
    { left: 'Humpty Dumpty sat on a wall...', right: 'a rhyme' },
  ],
  [
    { left: 'A tiny dragon hatched under the shed.', right: 'a story' },
    { left: 'Snakes shed their skin as they grow.', right: 'real facts' },
    { left: 'Jack and Jill went up the hill...', right: 'a rhyme' },
  ],
  [
    { left: 'The clock struck thirteen and time ran backwards.', right: 'a story' },
    { left: 'Your heart beats about one hundred times a minute.', right: 'real facts' },
    { left: 'Baa baa black sheep, have you any wool?', right: 'a rhyme' },
  ],
  [
    { left: 'A shadow slipped off Sam and ran away.', right: 'a story' },
    { left: 'Ice is frozen water that floats on lakes.', right: 'real facts' },
    { left: 'One, two, buckle my shoe...', right: 'a rhyme' },
  ],
  [
    { left: 'The submarine ate a picnic by mistake.', right: 'a story' },
    { left: 'Butterflies taste with their feet.', right: 'real facts' },
    { left: 'Mary had a little lamb...', right: 'a rhyme' },
  ],
  [
    { left: 'Two aliens shared the last biscuit on Mars.', right: 'a story' },
    { left: 'Sound travels faster through steel than air.', right: 'real facts' },
    { left: 'London Bridge is falling down...', right: 'a rhyme' },
  ],
  [
    { left: 'A sock puppet staged a midnight revolt.', right: 'a story' },
    { left: 'Octopuses have three hearts.', right: 'real facts' },
    { left: 'Ring-a-ring-a-roses, a pocket full of posies...', right: 'a rhyme' },
  ],
  [
    { left: 'The moon grumbled when comets bumped into it.', right: 'a story' },
    { left: 'Deserts can be freezing cold at night.', right: 'real facts' },
    { left: 'To market, to market, to buy a fat pig...', right: 'a rhyme' },
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
    title: 'The Jumping Frog',
    scene: ['🐸', '💧', '🥇'],
    lines: ['Rory practised jumps by the pond all week.', 'At the contest he soared over the log.'],
    who: 'Rory',
  },
  {
    title: 'Nia Builds a Raft',
    scene: ['🪵', '🌊', '🎈'],
    lines: ['Nia nailed old planks into a wobbly raft.', 'Her flag fluttered as it floated free.'],
    who: 'Nia',
  },
  {
    title: "Jay's Secret Treehouse",
    scene: ['🌳', '🔨', '📚'],
    lines: ['Jay hammered the last plank into place.', 'He filled it with comics and a torch.'],
    who: 'Jay',
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
  'at the museum',
  'at the cafe',
  'at the zoo',
]

const WHERE_STORIES: (StorySeed & { where: string })[] = [
  {
    title: 'Ducks in the Rain',
    scene: ['🦆', '🌧️', '💧'],
    lines: ['Mia and Dad threw seed to the ducks in the park.', 'Raindrops pattered on the pond.'],
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
    lines: ['The class heard tales in the hushed library.', 'The grown-up reading made them giggle.'],
    where: 'at the library',
  },
  {
    title: 'Coach Trip to the Farm',
    scene: ['🚌', '🐄', '🌾'],
    lines: ['Year Two rumbled along in a big coach.', 'A cow mooed hello at the gate.'],
    where: 'at the farm',
  },
  {
    title: 'Dino Bones Day',
    scene: ['🦕', '🦖', '📝'],
    lines: ['Ben copied a giant leg-bone sketch.', 'Inside the museum a T. rex skull loomed overhead.'],
    where: 'at the museum',
  },
  {
    title: 'Hot Chocolate Break',
    scene: ['☕', '🍪', '🪑'],
    lines: ['Lily and Gran shared a frothy cocoa at the cafe.', 'They munched warm cookies by the window.'],
    where: 'at the cafe',
  },
  {
    title: 'Penguin Parade',
    scene: ['🐧', '🧊', '🗣️'],
    lines: ['The zoo keeper showed the class penguin facts.', 'One penguin belly-flopped into the pool.'],
    where: 'at the zoo',
  },
  {
    title: 'Pool Race Practice',
    scene: ['🏊', '🎽', '⏱️'],
    lines: ['Jay practised freestyle lengths all afternoon.', 'His coach counted every stroke.'],
    where: 'at the swimming pool',
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
    title: 'The Class Caterpillar',
    scene: ['🐛', '🍃', '🦋'],
    lines: [
      'The class found a fat green caterpillar.',
      'They popped it in a leafy pot.',
      'One Monday a butterfly emerged!',
    ],
    events: ['They discovered the caterpillar', 'It lived in the leafy pot', 'A butterfly hatched'],
  },
  {
    title: 'Lost in the Supermarket',
    scene: ['🛒', '📯', '😊'],
    lines: [
      'Rafi let go of Mum near the cereals.',
      'A kind till-worker raised the tannoy.',
      'Soon Mum came running - big hugs all round!',
    ],
    events: ['Rafi got separated from Mum', 'The tannoy called for his family', 'They reunited happily'],
  },
  {
    title: 'The Muddy Bike Race',
    scene: ['🚲', '💦', '🏁'],
    lines: [
      'A sudden shower turned the track to soup.',
      'Jay skidded but leapt back on fast.',
      'He splattered over the line in first place!',
    ],
    events: ['Rain made the track slippery', 'Jay skidded then remounted', 'He won the race'],
  },
  {
    title: 'Gran Learns to Video Call',
    scene: ['📱', '👵', '😄'],
    lines: [
      'Gran tapped the wrong button at first.',
      'Nia showed her the green camera icon.',
      'Soon Gran was waving at everyone on screen!',
    ],
    events: ['Gran struggled with the phone', 'Nia taught her the camera button', 'The video call worked'],
  },
  {
    title: 'The Empty Bird Nest',
    scene: ['🪺', '🐦', '🌱'],
    lines: [
      'Storm winds shook the old oak tree.',
      'Dad rebuilt the nest with soft moss.',
      'By spring, three blue eggs sat safely inside.',
    ],
    events: ['The storm wrecked the nest', 'Dad repaired it with moss', 'New eggs arrived in spring'],
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
    title: 'Pond Dipping Day',
    scene: ['🌊', '🐸', '🔬'],
    lines: [
      'We tiptoed down to the reedy pond.',
      'A wriggling newt swam into the net.',
      'We sketched it gently, then tipped it home.',
    ],
    events: ['We arrived at the pond', 'We caught a newt', 'We set it free safely'],
  },
  {
    title: 'Bakery Morning',
    scene: ['🥐', '👨‍🍳', '🎒'],
    lines: [
      'The bakery door sighed open at nine.',
      'Chef Amira showed us how to knead dough.',
      'Each child left with a warm sugar bun.',
    ],
    events: ['We entered the bakery', 'We learned to knead', 'We took home our buns'],
  },
  {
    title: 'Rockpool Watch',
    scene: ['🦀', '🪨', '🔭'],
    lines: [
      'Low tide opened a shining rockpool.',
      'A clingy limpet held tight to the stone.',
      'We counted crabs before the waves returned.',
    ],
    events: ['The tide revealed the pool', 'We spotted a limpet', 'We counted the crabs'],
  },
  {
    title: 'Planetarium Visit',
    scene: ['🪐', '🌌', '🚀'],
    lines: [
      'We settled into the dark dome seats.',
      'Stars swirled across the curved ceiling.',
      'Afterwards we built our own paper rockets.',
    ],
    events: ['We sat in the dome', 'Stars filled the ceiling', 'We crafted paper rockets'],
  },
  {
    title: 'Spelling Bee Final',
    scene: ['🐝', '📝', '🏆'],
    lines: [
      'The hall buzzed for the spelling final.',
      'Zoe nailed "necessary" without a pause.',
      'She beamed as the trophy came her way.',
    ],
    events: ['The final began', 'Zoe spelled a hard word', 'She won the trophy'],
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
    title: 'The Leaky Roof',
    scene: ['🌧️', '🪣', '🏠'],
    lines: [
      'Drip, drip went the ceiling in the hall.',
      'Dad scrambled for every empty bucket.',
      'He climbed the ladder with a roll of felt...',
    ],
    next: 'Dad patches the hole before the storm',
    distract: [
      'The buckets grow legs and jog away',
      'The rain falls upward into the clouds',
      'The roof turns into a chocolate slide',
    ],
  },
  {
    title: 'Seed Under the Mug',
    scene: ['🌱', '☕', '🪟'],
    lines: [
      'Mia buried a bean under her sunny mug.',
      'Each morning she checked for a green spike.',
      'On Friday a pale shoot finally curled up...',
    ],
    next: 'A green shoot pushes into the light',
    distract: [
      'The bean turns into a chocolate button',
      'The mug flies off to the moon',
      'Nothing ever happens - ever',
    ],
  },
  {
    title: 'The Missing Mascot',
    scene: ['🦉', '🔍', '🏫'],
    lines: [
      'Someone had moved Woody the owl mascot.',
      'Clues pointed towards the bike sheds.',
      'Ben crouched and peeked behind the crates...',
    ],
    next: 'Woody sits beaming on a bicycle seat',
    distract: [
      'Woody has flown to Antarctica',
      'The mascot melts into a puddle',
      'There never was a mascot',
    ],
  },
  {
    title: 'Packed for the Wrong Day',
    scene: ['🎒', '🧦', '📅'],
    lines: [
      'Sam packed his swim kit full of fizz.',
      'The timetable said PE, not swimming!',
      'He zipped the bag and dashed to the gate...',
    ],
    next: 'Miss Grey borrows spare gym socks for Sam',
    distract: [
      'The kit turns into a living octopus',
      'The school vanishes overnight',
      'PE is cancelled forever',
    ],
  },
  {
    title: 'The Braided Rope',
    scene: ['🪢', '🧗', '🚩'],
    lines: [
      'The climbing rope frayed near the knot.',
      'Coach Lee inspected every twisted strand.',
      'She reached for the safety clips...',
    ],
    next: 'She re-ties the knot and tests it twice',
    distract: [
      'The rope swims away like an eel',
      'Gravity switches off for the week',
      'The hall fills with jelly',
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
    title: 'The Unread Note',
    scene: ['📝', '🎒', '🏫'],
    lines: [
      'A folded note sat in Zara\'s pocket all day.',
      'At home she finally smoothed it open.',
      'Her eyes went wide with a happy surprise...',
    ],
    end: 'It is an invitation to a surprise party',
    distract: [
      'The note turns to confetti immediately',
      'It is a bill for one million pounds',
      'The words wriggle off the page',
    ],
  },
  {
    title: 'Soggy Football Kit',
    scene: ['⚽', '🌧️', '🧺'],
    lines: [
      'The kit lay soaked after the match.',
      'Mum loaded the washing machine carefully.',
      'By morning everything hung crisp and clean...',
    ],
    end: 'The kit dries ready for Saturday',
    distract: [
      'The kit shrinks to doll size forever',
      'All the socks turn into toast',
      'The machine starts telling jokes',
    ],
  },
  {
    title: 'The Quiet Hamster',
    scene: ['🐹', '🪵', '🔔'],
    lines: [
      'Pip the hamster refused his sunflower seed.',
      'He curled deeper into his sawdust bed.',
      'Ben tapped the cage gently and peered in...',
    ],
    end: 'Pip pops out for a midnight wheel run',
    distract: [
      'Pip files a formal complaint',
      'The cage turns into a spaceship',
      'Pip forgets how to be a hamster',
    ],
  },
  {
    title: 'The Chalk Masterpiece',
    scene: ['🎨', '🛣️', '⭐'],
    lines: [
      'Rain clouds threatened the playground art.',
      'Kemi raced to cover the chalk comet.',
      'She flung the tarpaulin over the drawing...',
    ],
    end: 'The chalk art survives the downpour',
    distract: [
      'The chalk melts into rainbow soup',
      'The playground floats away',
      'The rain paints a better picture instead',
    ],
  },
  {
    title: 'Late for the Bus',
    scene: ['🚌', '🏃', '⏰'],
    lines: [
      'The 8:15 bus groaned at the corner stop.',
      'Omar sprinted with his satchel bouncing.',
      'He banged on the rear door just in time...',
    ],
    end: 'The driver smiles and holds the door open',
    distract: [
      'The bus grows wings and lifts off',
      'Omar instantly ages ninety years',
      'The bus was never scheduled at all',
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
    title: "The Spider's Web",
    scene: ['🕷️', '😨', '🚪'],
    lines: [
      'A fat spider dangled above Leo\'s pillow.',
      'He leapt backwards and knocked the lamp.',
      'He stood frozen until Gran flicked on the light.',
    ],
    feel: 'scared',
    options: ['scared', 'proud', 'sleepy'],
  },
  {
    title: 'Gold Star Speech',
    scene: ['🏅', '🎤', '😊'],
    lines: [
      'Amira read her poem to the whole hall.',
      'Every round of claps made her grin wider.',
      'She took a wobbly but joyful bow.',
    ],
    feel: 'proud',
    options: ['proud', 'cross', 'bored'],
  },
  {
    title: 'Broken Spectacles',
    scene: ['👓', '💔', '📚'],
    lines: [
      'Tariq\'s new glasses crunched under a book.',
      'He blinked at the blurry classroom board.',
      'He hid them in his bag and sniffled.',
    ],
    feel: 'sad',
    options: ['sad', 'excited', 'calm'],
  },
  {
    title: 'Surprise Sleepover',
    scene: ['🛏️', '🍿', '🥳'],
    lines: [
      'Her best mates piled out of the cupboard.',
      'Lanterns blinked and popcorn flew everywhere.',
      'Sara shrieked and leapt onto the cushions.',
    ],
    feel: 'excited',
    options: ['excited', 'scared', 'cross'],
  },
  {
    title: 'The Lost Tunnel',
    scene: ['🚇', '🗺️', '😰'],
    lines: [
      'The train stopped deep inside a black tunnel.',
      'No lights blinked on above the seats.',
      'Yusuf gripped his rucksack strap tightly.',
    ],
    feel: 'scared',
    options: ['scared', 'proud', 'hungry'],
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
    title: 'The Bruised Knee',
    scene: ['🩹', '😢', '🚲'],
    lines: [
      'Ivy toppled off her bike at speed.',
      'A bright red graze stung her knee.',
      'She sniffled and refused to pedal again.',
    ],
    ask: 'Which line shows Ivy is upset?',
    proof: 'She sniffled and refused to pedal again.',
    distract: [
      'She cheered and pedalled faster',
      'She laughed and did a handstand',
      'She fell asleep on the grass',
    ],
  },
  {
    title: 'The Wobbly Tooth',
    scene: ['🦷', '😬', '😮'],
    lines: [
      'Lotte felt her tooth rock for the first time.',
      'Her eyes went round as dinner plates.',
      'She prodded it with her tongue again and again.',
    ],
    ask: 'Which line shows Lotte is shocked?',
    proof: 'Her eyes went round as dinner plates.',
    distract: [
      'She yawned and stretched sleepily',
      'She calmly finished her soup',
      'She skipped off whistling',
    ],
  },
  {
    title: 'The Class Pet Surprise',
    scene: ['🐹', '🎁', '🤩'],
    lines: [
      'Miss Hall wheeled in a cage under a sheet.',
      'She whipped the cloth away with a flourish.',
      'The whole class gasped and crowded round.',
    ],
    ask: 'Which line shows the class is amazed?',
    proof: 'The whole class gasped and crowded round.',
    distract: [
      'Everyone quietly opened their books',
      'The class lined up without a word',
      'They all put their coats on to leave',
    ],
  },
  {
    title: 'The Stung Hand',
    scene: ['🐝', '😣', '🫙'],
    lines: [
      'A bee bumped Ravi\'s hand while he picked apples.',
      'His eyes watered and his lip trembled.',
      'He held his palm and hopped from foot to foot.',
    ],
    ask: 'Which line shows Ravi is in pain?',
    proof: 'His eyes watered and his lip trembled.',
    distract: [
      'He giggled and kept picking apples',
      'He took a long refreshing nap',
      'He started juggling the apples',
    ],
  },
  {
    title: 'The Secret Party Prep',
    scene: ['🎈', '🤫', '🎂'],
    lines: [
      'Zara had to keep Mum\'s party a secret.',
      'She bit her tongue nearly all afternoon.',
      'When the guests arrived she burst out beaming.',
    ],
    ask: 'Which line shows Zara is bursting with joy?',
    proof: 'When the guests arrived she burst out beaming.',
    distract: [
      'She yawned and shuffled to bed',
      'She scowled at the balloon banner',
      'She left the party early alone',
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
    title: 'Boom Di-Boom',
    scene: ['🥁', '🎺', '🎶'],
    lines: [
      'Boom di-boom went the big bass drum.',
      'Boom di-boom! The trumpets joined in.',
      'The whole parade stomped to the beat.',
    ],
    repeat: 'Boom di-boom',
    distract: ['the big bass drum', 'the trumpets joined in', 'stomped to the beat'],
  },
  {
    title: 'Splash Splash',
    scene: ['🏊', '💦', '🌊'],
    lines: [
      'Splash, splash, went Ellie\'s happy feet.',
      'Splash, splash, through the shiny pool.',
      'Coach cheered as she reached the wall.',
    ],
    repeat: 'Splash, splash',
    distract: ['Ellie\'s happy feet', 'through the shiny pool', 'reached the wall'],
  },
  {
    title: 'Buzz Buzz',
    scene: ['🐝', '🌼', '☀️'],
    lines: [
      'Buzz, buzz, hummed the busy bees.',
      'Buzz, buzz, between the sunny flowers.',
      'The hive hummed all afternoon long.',
    ],
    repeat: 'Buzz, buzz',
    distract: ['the busy bees', 'between the sunny flowers', 'all afternoon long'],
  },
  {
    title: 'Shhh!',
    scene: ['🤫', '📖', '🏮'],
    lines: [
      'Shhh! whispered the library sign.',
      'Shhh! The reading lamp glowed softly.',
      'Only quiet pages turned that evening.',
    ],
    repeat: 'Shhh!',
    distract: ['whispered the library sign', 'the reading lamp glowed', 'pages turned'],
  },
  {
    title: 'Zoom Zoom',
    scene: ['🏎️', '🏁', '💨'],
    lines: [
      'Zoom zoom! The toy car sped by.',
      'Zoom zoom! Around the rug it raced.',
      'It parked perfectly by the sofa.',
    ],
    repeat: 'Zoom zoom',
    distract: ['the toy car sped by', 'around the rug it raced', 'parked by the sofa'],
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
    title: 'Snail Trail',
    scene: ['🐌', '🍃', '💦'],
    lines: [
      'A shiny snail slid down the rail.',
      'It left a glittering silvery trail.',
      'Rain washed it clean without fail.',
    ],
    pair: 'snail / rail',
    distract: ['snail / shiny', 'shiny / clean', 'down / rain'],
  },
  {
    title: 'Bee and Tree',
    scene: ['🐝', '🌳', '🍯'],
    lines: [
      'A buzzy bee sat on my knee.',
      'It zoomed up hard against the tree.',
      'Then shared its golden honey with me.',
    ],
    pair: 'bee / tree',
    distract: ['knee / zoomed', 'zoomed / tree', 'golden / honey'],
  },
  {
    title: 'Hop to the Shop',
    scene: ['🦘', '🏪', '🎁'],
    lines: [
      'A rabbit hopped non-stop.',
      'It bounced all the way to the shop.',
      'It bought a carrot for its pup.',
    ],
    pair: 'hop / shop',
    distract: ['rabbit / stop', 'bounced / shop', 'carrot / pup'],
  },
  {
    title: 'Frog on a Log',
    scene: ['🐸', '🪵', '🌧️'],
    lines: [
      'A little frog sat on a log.',
      'It leapt and did a clever jog.',
      'Back home before the final fog.',
    ],
    pair: 'frog / log',
    distract: ['frog / home', 'leapt / jog', 'home / fog'],
  },
  {
    title: 'Quack Track',
    scene: ['🦆', '🛤️', '🌾'],
    lines: [
      'A duck went walking down the track.',
      'It gave a happy quack quack quack.',
      'It found a pile of grain - snap snap!',
    ],
    pair: 'track / quack',
    distract: ['duck / track', 'happy / quack', 'grain / snap'],
  },
  {
    title: 'Goat in a Coat',
    scene: ['🐐', '🧥', '🌧️'],
    lines: [
      'My grandpa kept a goat in a coat.',
      'It trotted along in a scarlet float.',
      'The neighbours laughed at the joke they wrote.',
    ],
    pair: 'goat / coat',
    distract: ['goat / scarlet', 'scarlet / float', 'laughed / wrote'],
  },
  {
    title: 'Mouse in the House',
    scene: ['🐭', '🏠', '🧀'],
    lines: [
      'A tiny mouse stole into the house.',
      'It nibbled cheese as quiet as a mouse.',
      'Then slipped back out across the ploughed ground.',
    ],
    pair: 'mouse / house',
    distract: ['mouse / nibbled', 'nibbled / cheese', 'slipped / out'],
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
    title: 'The Midnight Owl',
    scene: ['🦉', '🌙', '🌳'],
    lines: [
      'Mina woke to a soft hoot outside.',
      'She crept to the window with her torch.',
      'A tawny owl bobbed low over the lawn.',
      'It landed on the old oak and stared back.',
    ],
    who: 'Mina',
  },
  {
    title: 'The Broken Robot',
    scene: ['🤖', '🔧', '😅'],
    lines: [
      'Kofi\'s remote-control robot stopped mid-turn.',
      'He flipped it over and checked the wires.',
      'A loose blue cable dangled free.',
      'He clicked it home and the robot danced!',
    ],
    who: 'Kofi',
  },
  {
    title: 'The Garden Treasure',
    scene: ['🗺️', '🌻', '🥇'],
    lines: [
      'Sana found a rusted tin under the roses.',
      'Her grandad smiled a knowing smile.',
      'Inside lay a brass medallion and a note.',
      'It was her grandmother\'s long-lost prize!',
    ],
    who: 'Sana',
  },
  {
    title: 'The Substitute Teacher',
    scene: ['👩‍🏫', '📚', '🤨'],
    lines: [
      'A brand-new teacher arrived on Monday.',
      'She wrote riddles instead of homework.',
      'The class whispered that she was a wizard.',
      'By Friday everyone adored Miss Okafor and her riddles.',
    ],
    who: 'Miss Okafor',
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
    title: 'The Science Fair Fuse',
    scene: ['🌋', '🧪', '🏆'],
    lines: [
      'Priya\'s volcano sat ready for its big debut.',
      'She stirred the bicarbonate and vinegar mix.',
      'Foam erupted in a glorious orange cascade!',
      'The judges awarded her a shimmering rosette.',
    ],
    events: [
      'The volcano was set up',
      'She mixed the ingredients',
      'Foam erupted everywhere',
      'She won a prize rosette',
    ],
  },
  {
    title: 'The Broken Stage Light',
    scene: ['🎭', '💡', '🔦'],
    lines: [
      'Ten minutes to curtain-up and the light died.',
      'Jamal sprinted backstage for the spare bulb.',
      'He stood on a crate and twisted it home.',
      'The spotlight blazed as the curtain rose!',
    ],
    events: [
      'The stage light failed',
      'Jamal fetched a spare bulb',
      'He fitted the new bulb',
      'The show opened on time',
    ],
  },
  {
    title: 'The Adopted Hedgehog',
    scene: ['🦔', '🧺', '🌙'],
    lines: [
      'A shivering hedgehog sat by the bins.',
      'Asha lined a laundry basket with old towels.',
      'She offered shallow water and meaty cat food.',
      'By dawn it had waddled safely back to the hedge.',
    ],
    events: [
      'They found the hedgehog',
      'Asha prepared a cosy basket',
      'She gave it food and water',
      'It returned to the wild',
    ],
  },
  {
    title: 'The Substitute Captain',
    scene: ['⚽', '🦵', '📣'],
    lines: [
      'Our captain twisted her ankle in warm-ups.',
      'Coach pointed at Dev and handed him the armband.',
      'Dev rallied the team with a fiery pep talk.',
      'They won 2-1 with Dev assisting the winner.',
    ],
    events: [
      'The captain got injured',
      'Dev was made temporary captain',
      'He gave a motivating talk',
      'The team won the match',
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
    title: 'The Unfinished Jigsaw',
    scene: ['🧩', '👁️', '✨'],
    lines: [
      'One blue sky piece was still missing.',
      'Luca scanned the rug under the sofa.',
      'Something small and cardboardy glinted...',
    ],
    next: 'He slots the final piece in perfectly',
    distract: [
      'The jigsaw eats itself in one gulp',
      'Every piece turns into a butterfly',
      'The box was always empty',
    ],
  },
  {
    title: 'The Locked Diary',
    scene: ['📔', '🔑', '🔢'],
    lines: [
      'Nadia\'s new diary clicked shut with a snap.',
      'The tiny key slipped under her pillow.',
      'That night a folded clue appeared...',
    ],
    next: 'The key opens - and page one begins',
    distract: [
      'The diary forgets its own password forever',
      'A knight in shining armour claims it',
      'The pillow digests the key',
    ],
  },
  {
    title: 'The Creaky Attic',
    scene: ['🏚️', '🪜', '🔦'],
    lines: [
      'One board in the attic floor went groan...',
      'Ivy held the torch while Grandad knelt.',
      'Under loose boards something pale peeked out...',
    ],
    next: 'They lift a hatbox of old family photos',
    distract: [
      'The attic launches into orbit',
      'A ghost politely asks them to leave',
      'The boards turn to spaghetti',
    ],
  },
  {
    title: 'The Silent Violin',
    scene: ['🎻', '🎼', '😰'],
    lines: [
      'Her violin sounded more like a squeak.',
      'The concert was only two sleeps away.',
      'Her teacher inspected the bridge carefully...',
    ],
    next: 'A tiny bridge tweak restores the rich tone',
    distract: [
      'The violin turns into a banjo mid-song',
      'Music notes flee the instrument forever',
      'The concert is postponed for a decade',
    ],
  },
  {
    title: 'The Lighthouse Signal',
    scene: ['🗼', '🌊', '⛵'],
    lines: [
      'Fog smothered the bay like grey wool.',
      'A lone yacht tooted faintly offshore.',
      'Old Keeper Bea threw the main switch...',
    ],
    next: 'The great lamp flashes a safe path in',
    distract: [
      'The lighthouse packs up and emigrates',
      'The fog turns into lemonade',
      'The yacht grows wings and flies home',
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
    title: 'The Chipped Trophy',
    scene: ['🏆', '💔', '😢'],
    lines: [
      'The relay trophy slipped from a wet hand.',
      'A chip appeared along its golden rim.',
      'Team heart sank as silence filled the hall.',
      'Coach muttered that points would be docked.',
    ],
    feel: 'upset',
    options: ['upset', 'thrilled', 'sleepy'],
  },
  {
    title: 'The Hide-and-Seek Legend',
    scene: ['🫣', '🌳', '🤣'],
    lines: [
      'Everyone counted to a hundred under the oak.',
      'Tiago had already smuggled himself into the goal.',
      'He waited not a second longer than needed.',
      'His giggle burst out as the final seeker passed.',
    ],
    feel: 'cheeky',
    options: ['cheeky', 'furious', 'terrified'],
  },
  {
    title: 'The Long-Awaited Parcel',
    scene: ['📦', '✂️', '🤩'],
    lines: [
      'The tracked delivery finally beeped outside.',
      'Ivy tore the tape with shaking fingers.',
      'There - the model rocket kit she begged for!',
      'She whooped so loud the cat fled upstairs.',
    ],
    feel: 'thrilled',
    options: ['thrilled', 'bored', 'nervous'],
  },
  {
    title: 'The Broken Promise',
    scene: ['🤞', '😞', '🌧️'],
    lines: [
      'He swore he would guard her comic collection.',
      'A gust toppled the whole stack outdoors.',
      'Pages soaked through in the sudden shower.',
      'He could only stammer a miserable sorry.',
    ],
    feel: 'guilty',
    options: ['guilty', 'proud', 'delighted'],
  },
  {
    title: 'The Curtain Call',
    scene: ['🎭', '👏', '😃'],
    lines: [
      'The audience rose for a second standing ovation.',
      'Confetti drifted down onto the stage.',
      'Hana bowed again, tears of joy in her eyes.',
      'Her mum cheered the loudest in row three.',
    ],
    feel: 'elated',
    options: ['elated', 'furious', 'homesick'],
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
    TERM2,
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
