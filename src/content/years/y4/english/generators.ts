/** PLAN 169g — Year-4 english generators. The shared DfE "years 3 and 4"
 *  statute seen from the Year-4 side: dictionary skills (alphabetical
 *  order, first letters, checking spelling), non-fiction retrieval
 *  (contents, index, headings, text types), summarising across paragraphs
 *  and asking questions, themes/myths/legends, poetry forms + performance,
 *  adverbs and prepositions of time and cause + commas, standard English,
 *  planning/evaluating/editing, settings-characters-plot and dialogue, and
 *  dictation with confusing word pairs — all built from the vocabulary in
 *  src/content/syllabus/y4/english.ts.
 *
 *  Vocabulary rule: bank-tier words (mcq choices, match sides, order items,
 *  tiles targets) must pass the year-4 english syllabus; prompts, hints,
 *  truefalse statements, speak targets and story lines are text tier
 *  (report-only). Intentional near-miss spellings live in
 *  ENGLISH_Y4_TOLERANCE. */

import type { Question } from '../../../types'
import {
  matchQ,
  mcqE,
  orderQ,
  pick,
  pickOthers,
  randInt,
  shuffle,
  speakQ,
  story,
  tfQ,
  tilesQ,
  type Rand,
} from '../../../english/helpers'

/** Pick n distinct words from a pool (guard-bounded like the Y3 drills). */
function pickN(rand: Rand, pool: readonly string[], n: number): string[] {
  const out: string[] = []
  let guard = 0
  while (out.length < n && guard < pool.length * 10) {
    const w = pick(rand, pool)
    if (!out.includes(w)) out.push(w)
    guard++
  }
  return out
}

/* ============= Unit 1 · Dictionary Detectives ========================= */

const DICT_POOL = [
  'address', 'breathe', 'centre', 'century', 'decide', 'describe',
  'exercise', 'favourite', 'grammar', 'height', 'island', 'library',
  'medicine', 'ordinary', 'purpose', 'quarter', 'remember', 'separate',
  'straight', 'therefore', 'weight', 'appear', 'believe', 'calendar',
  'interest', 'question',
]

export function gY4DictFirst(rand: Rand): Question {
  const picked = pickN(rand, DICT_POOL, 4)
  const sorted = [...picked].sort((a, b) => a.localeCompare(b))
  return mcqE(rand, 'Which word comes first in the dictionary?', sorted[0],
    picked.filter((w) => w !== sorted[0]))
}

export function gY4DictOrder(rand: Rand): Question {
  const picked = pickN(rand, DICT_POOL, 4)
  picked.sort((a, b) => a.localeCompare(b))
  return orderQ('Put these words in dictionary order', picked)
}

const DICT_MEANINGS = [
  { w: 'notice', a: 'to see or hear something', o: ['to make a loud noise', 'to forget something quickly', 'to write a letter'] },
  { w: 'material', a: 'what something is made of', o: ['a long story to read', 'a list of names', 'a type of animal'] },
  { w: 'opposite', a: 'completely different', o: ['very close together', 'exactly the same', 'nearly the same'] },
  { w: 'guide', a: 'a person who shows the way', o: ['a dark cold room', 'a sweet cake', 'a fast car'] },
  { w: 'ordinary', a: 'normal, nothing special', o: ['extremely rare', 'very costly', 'quite small'] },
  { w: 'certain', a: 'sure about something', o: ['unsure at all', 'angry with someone', 'tired after work'] },
  { w: 'position', a: 'where something is', o: ['how heavy something is', 'what time it is', 'how fast it goes'] },
  { w: 'length', a: 'how long something is', o: ['how heavy something is', 'how wide something is', 'how loud something is'] },
  { w: 'various', a: 'many different kinds', o: ['only one kind', 'two equal kinds', 'no kinds at all'] },
  { w: 'imagine', a: 'to make a picture in your mind', o: ['to read a book aloud', 'to count up to ten', 'to close a door'] },
  { w: 'decide', a: 'to choose after thinking', o: ['to forget at once', 'to shout very loudly', 'to write a quick note'] },
  { w: 'describe', a: 'to say what something is like', o: ['to hide something away', 'to draw with a pen', 'to sing a short song'] },
]

export function gY4DictMeaning(rand: Rand): Question {
  const it = pick(rand, DICT_MEANINGS)
  return mcqE(rand, `The dictionary says: "${it.a}". Which word is it?`, it.w, it.o)
}

const DICT_SPELL = [
  { a: 'address', o: ['adres', 'adress', 'addres'] },
  { a: 'centre', o: ['sentre', 'cetre', 'center'] },
  { a: 'island', o: ['iland', 'aisland', 'islland'] },
  { a: 'answer', o: ['anwser', 'anser', 'asnwer'] },
  { a: 'length', o: ['lenght', 'lenth', 'langth'] },
  { a: 'remember', o: ['remeber', 'rememeber', 'rembmer'] },
  { a: 'business', o: ['buisness', 'busness', 'bussiness'] },
  { a: 'knowledge', o: ['knowlege', 'konwledge', 'knowladge'] },
  { a: 'exercise', o: ['exersise', 'excercise', 'exercize'] },
  { a: 'possible', o: ['possable', 'posible', 'posssible'] },
  { a: 'calendar', o: ['calender', 'callender', 'calandar'] },
]

export function gY4DictSpell(rand: Rand): Question {
  const it = pick(rand, DICT_SPELL)
  return mcqE(rand, 'You checked the dictionary. Which word is spelled correctly?', it.a, it.o)
}

/* ============= Unit 2 · Non-fiction Explorers ========================= */

const BEE_CARD = story('All About Bees', ['🐝', '🌼', '🍯'], [
  'Bees visit many flowers every day.',
  'Bees make sweet honey in the hive.',
  'A hive can hold thousands of bees.',
])
const PLANET_CARD = story('Our Solar System', ['☀️', '🌍', '🌑'], [
  'Earth is the third planet from the sun.',
  'The moon goes round the earth.',
  'The sun lights up every planet.',
])
const VOLCANO_CARD = story('How Volcanoes Work', ['🌋', '🪨', '🔥'], [
  'Hot rock rises inside the volcano.',
  'It pours out at the top as lava.',
  'Lava cools and turns to hard rock.',
])
const WATER_CARD = story('The Water Cycle', ['☁️', '🌧️', '🌊'], [
  'The sun heats the sea.',
  'Water rises and clouds form high up.',
  'Rain falls and returns to the sea.',
])

const NF_TF = [
  { panel: BEE_CARD, st: 'Bees visit many flowers every day.', a: true },
  { panel: BEE_CARD, st: 'Bees make honey in the hive.', a: true },
  { panel: BEE_CARD, st: 'A hive can hold only three bees.', a: false },
  { panel: BEE_CARD, st: 'Bees live deep in the sea.', a: false },
  { panel: PLANET_CARD, st: 'Earth is the third planet from the sun.', a: true },
  { panel: PLANET_CARD, st: 'The moon goes round the earth.', a: true },
  { panel: PLANET_CARD, st: 'The moon gives out its own light.', a: false },
  { panel: PLANET_CARD, st: 'Planets travel around the moon.', a: false },
  { panel: VOLCANO_CARD, st: 'Hot rock rises inside the volcano.', a: true },
  { panel: VOLCANO_CARD, st: 'Lava cools and turns to hard rock.', a: true },
  { panel: VOLCANO_CARD, st: 'Volcanoes are made of ice.', a: false },
  { panel: VOLCANO_CARD, st: 'Lava is cold and soft.', a: false },
  { panel: WATER_CARD, st: 'The sun heats the sea.', a: true },
  { panel: WATER_CARD, st: 'Rain falls and returns to the sea.', a: true },
  { panel: WATER_CARD, st: 'Rain falls up from the ground.', a: false },
  { panel: WATER_CARD, st: 'The moon heats the sea.', a: false },
]

export function gY4NFCard(rand: Rand): Question {
  const it = pick(rand, NF_TF)
  return tfQ('Read the card. Does it say this?', it.st, it.a, { story: it.panel })
}

const WHERE_ROWS = [
  { q: 'Where do you look to find the page number of a chapter?', a: 'the contents page', o: ['the index', 'the glossary', 'the cover'] },
  { q: 'Where do you look to find where a topic is discussed?', a: 'the index', o: ['the contents page', 'the glossary', 'a heading'] },
  { q: 'Where do you find what a difficult word means?', a: 'the glossary', o: ['the index', 'the contents page', 'a diagram'] },
  { q: 'What tells you what each part of the text is about?', a: 'a heading', o: ['the index', 'the glossary', 'the cover'] },
  { q: 'What shows the parts of a flower with labels?', a: 'a diagram', o: ['a heading', 'the index', 'the contents page'] },
  { q: 'What do you read first to see the parts of a book?', a: 'the contents page', o: ['the glossary', 'a diagram', 'the index'] },
]

export function gY4WhereFind(rand: Rand): Question {
  const it = pick(rand, WHERE_ROWS)
  return mcqE(rand, it.q, it.a, it.o)
}

const TEXTTYPE_ROWS = [
  { s: 'Dear Grandma, thank you for the socks.', a: 'a letter', o: ['a diary entry', 'a poem', 'a report'] },
  { s: 'Monday: we went to the museum and drew the old pots.', a: 'a diary entry', o: ['a letter', 'a poem', 'instructions'] },
  { s: 'First, mix the flour and eggs. Then bake for twenty minutes.', a: 'instructions', o: ['a poem', 'a letter', 'a diary entry'] },
  { s: 'Twinkle, twinkle, little star, how I wonder what you are.', a: 'a poem', o: ['a report', 'a letter', 'instructions'] },
  { s: 'Rivers begin as small streams. They flow to the sea.', a: 'a report', o: ['a poem', 'a diary entry', 'a letter'] },
  { s: 'The frog jumped onto the leaf and smiled.', a: 'a story', o: ['a report', 'instructions', 'a diary entry'] },
]

export function gY4TextType(rand: Rand): Question {
  const it = pick(rand, TEXTTYPE_ROWS)
  return mcqE(rand, `What type of writing is this? ${it.s}`, it.a, it.o)
}

const HEADING_ROWS = [
  { p: 'Bees fly from flower to flower all day.', a: 'Bees and Flowers', o: ['Water in the Air', 'Hot Rock and Lava', 'How Rivers Flow'] },
  { p: 'The sun heats the sea and clouds form.', a: 'Water in the Air', o: ['Bees and Flowers', 'The Solar System', 'How Rivers Flow'] },
  { p: 'Melted rock pours from the top of the mountain.', a: 'Hot Rock and Lava', o: ['Water in the Air', 'The Solar System', 'Bees and Flowers'] },
  { p: 'Earth circles the sun and the moon circles the earth.', a: 'The Solar System', o: ['Hot Rock and Lava', 'How Rivers Flow', 'Bees and Flowers'] },
  { p: 'Small streams join and grow until they reach the sea.', a: 'How Rivers Flow', o: ['Water in the Air', 'The Solar System', 'Hot Rock and Lava'] },
]

export function gY4NFHeading(rand: Rand): Question {
  const it = pick(rand, HEADING_ROWS)
  return mcqE(rand, `Which heading fits this text? ${it.p}`, it.a, it.o)
}

/* ============= Unit 3 · Main Ideas & Summaries ======================== */

const SUMMARY_ROWS = [
  { p: 'Bees fly from flower to flower. They carry pollen and help new seeds grow.', a: 'Bees help plants to grow.', o: ['Bees sleep all winter.', 'Flowers run away from bees.'] },
  { p: 'The wind blew all day. Trees bent and signs rattled. By evening the sky was blue again.', a: 'The storm ended by evening.', o: ['The storm started at night.', 'The sky stayed dark all week.'] },
  { p: 'Tom practised his poem every day. At the show he spoke clearly and did not stop.', a: 'Tom practised and performed well.', o: ['Tom forgot his poem.', 'The show was cancelled.'] },
  { p: 'Mia watered the seeds every morning. Soon green shoots pushed through the soil.', a: 'The seeds needed water to grow.', o: ['The seeds died at once.', 'Mia forgot the garden forever.'] },
  { p: 'The library is quiet. People read at tables and borrow books to take home.', a: 'The library is a place to read and borrow books.', o: ['The library sells food.', 'People run in the library.'] },
  { p: 'Ben measured the shadows at nine, at noon and at three. The shadow moved each time.', a: 'Shadows move during the day.', o: ['Shadows never move.', 'Ben measured the clouds.'] },
]

export function gY4Summary(rand: Rand): Question {
  const it = pick(rand, SUMMARY_ROWS)
  return mcqE(rand, `Two paragraphs: ${it.p} What is the main summary?`, it.a, it.o)
}

const ASK_ROWS = [
  { p: 'A paragraph about how bees find food.', a: 'How do bees find food?', o: ['What colour is the sky?', 'Where does the bee sleep?'] },
  { p: 'A page about the water cycle.', a: 'Where does rain come from?', o: ['What colour is rain?', 'Who needs rain the most?'] },
  { p: 'A report about volcanoes.', a: 'Why do volcanoes erupt?', o: ['What colour is lava?', 'Who lives in a volcano?'] },
  { p: 'A text about how plants grow.', a: 'What do plants need to grow?', o: ['What colour are plants?', 'How tall is one plant?'] },
  { p: 'A page about the solar system.', a: 'How many planets are there?', o: ['What colour is the sun?', 'Who named the moon?'] },
  { p: 'A report about bees and farmers.', a: 'Why do farmers need bees?', o: ['What colour is honey?', 'Who first saw a bee?'] },
]

export function gY4AskQuestion(rand: Rand): Question {
  const it = pick(rand, ASK_ROWS)
  return mcqE(rand, `Which question would help you most? ${it.p}`, it.a, it.o)
}

const TRICK_ROWS = [
  { p: 'Under the picture of a frog it says: Tadpole, three weeks old.', a: 'a caption', o: ['a subheading', 'an index', 'the glossary'] },
  { p: 'The words Tadpoles are written large above the paragraph.', a: 'a subheading', o: ['a caption', 'the glossary', 'an index'] },
  { p: 'At the back, words are listed in order with page numbers.', a: 'an index', o: ['a caption', 'a subheading', 'the contents page'] },
  { p: 'A diagram shows the parts of a flower with labels.', a: 'a labelled diagram', o: ['a caption', 'an index', 'a subheading'] },
  { p: 'Key words are printed in bold down the side.', a: 'a bold list', o: ['a caption', 'an index', 'a subheading'] },
]

export function gY4WriterTrick(rand: Rand): Question {
  const it = pick(rand, TRICK_ROWS)
  return mcqE(rand, `How does the writer help you here? ${it.p}`, it.a, it.o)
}

/* ============= Unit 4 · Themes, Myths & Legends ======================= */

const THEME_ROWS = [
  { s: 'A boy shared his lunch with a friend who had none.', a: 'kindness', o: ['greed', 'honesty', 'courage'] },
  { s: 'A girl told the truth even though she was scared.', a: 'honesty', o: ['kindness', 'greed', 'friendship'] },
  { s: 'The knight faced the giant alone.', a: 'courage', o: ['kindness', 'honesty', 'greed'] },
  { s: 'The fox flattered the crow until the cheese fell.', a: 'greed', o: ['courage', 'honesty', 'kindness'] },
  { s: 'Two teammates passed the ball until they won.', a: 'friendship', o: ['greed', 'courage', 'honesty'] },
  { s: 'A girl shared her coat on a cold night.', a: 'kindness', o: ['greed', 'friendship', 'courage'] },
]

export function gY4Theme(rand: Rand): Question {
  const it = pick(rand, THEME_ROWS)
  return mcqE(rand, `What is the theme of this tale? ${it.s}`, it.a, it.o)
}

const THEME_PAIRS: { left: string; right: string }[] = [
  { left: 'The frog became a prince', right: 'magic' },
  { left: 'The fox shared its food', right: 'kindness' },
  { left: 'The knight fought the giant', right: 'courage' },
  { left: 'The fox stole the cheese', right: 'greed' },
  { left: 'The two teammates passed the ball', right: 'friendship' },
  { left: 'The girl told the truth', right: 'honesty' },
  { left: 'A girl gave her coat away', right: 'kindness' },
  { left: 'The boy faced the dark alone', right: 'courage' },
]

export function gY4ThemeMatch(rand: Rand): Question {
  const pairs = shuffle(rand, THEME_PAIRS).slice(0, 4)
  return matchQ(rand, 'Match each tale to its theme', pairs)
}

const LEGEND_SEQS: readonly (readonly string[])[] = [
  ['The hero found a golden key.', 'The hero opened the iron gate.', 'The hero met the sleeping dragon.'],
  ['The giant stomped down the hill.', 'The clever boy tied a rope across the path.', 'The giant fell into the deep hole.'],
  ['A farmer planted an apple seed.', 'The tree grew for many years.', 'A golden apple appeared on the branch.'],
  ['The princess climbed the tall tower.', 'She let down the long rope.', 'The prince climbed up to her.'],
  ['A boy followed the silver fish.', 'The fish led him to a hidden cave.', 'Inside he found shining stones.'],
  ['The river flowed past the town.', 'The bridge washed away in the storm.', 'The villagers built a new bridge.'],
]

export function gY4LegendOrder(rand: Rand): Question {
  return orderQ('Put the legend events in order', [...pick(rand, LEGEND_SEQS)])
}

const STORYTYPE_ROWS = [
  { s: 'How the sun and the moon were made.', a: 'a myth', o: ['a legend', 'a fairy story', 'a fable'] },
  { s: 'The dragon who guarded the gold.', a: 'a legend', o: ['a myth', 'a fable', 'a report'] },
  { s: 'A princess, a frog and a kiss.', a: 'a fairy story', o: ['a myth', 'a legend', 'a fable'] },
  { s: 'The hare and the tortoise race.', a: 'a fable', o: ['a myth', 'a legend', 'a fairy story'] },
  { s: 'The boy who cried wolf.', a: 'a fable', o: ['a myth', 'a legend', 'a report'] },
  { s: 'The giant who lived on the hill.', a: 'a legend', o: ['a myth', 'a fable', 'a fairy story'] },
]

export function gY4StoryType(rand: Rand): Question {
  const it = pick(rand, STORYTYPE_ROWS)
  return mcqE(rand, `What type of story is this? ${it.s}`, it.a, it.o)
}

/* ============= Unit 5 · Poetry & Performance ========================== */

const POEMFORM_ROWS = [
  { p: 'It ran. It jumped. It rolled away. (No rhyme at all.)', a: 'free verse', o: ['a rhyming poem', 'a narrative poem', 'a limerick'] },
  { p: 'The cat sat on the mat. The hat sat on the cat.', a: 'a rhyming poem', o: ['free verse', 'a narrative poem', 'a limerick'] },
  { p: 'A boy walked to the shop and found a silver key. (Tells a story.)', a: 'a narrative poem', o: ['free verse', 'a rhyming poem', 'a limerick'] },
  { p: 'There once was a king with a very big nose.', a: 'a limerick', o: ['free verse', 'a rhyming poem', 'a narrative poem'] },
  { p: 'Rain on the grass. Rain on the tree. Rain on the roof. Rain on me.', a: 'a rhyming poem', o: ['free verse', 'a narrative poem', 'a limerick'] },
  { p: 'The wind calls. The sea answers. Nothing rhymes.', a: 'free verse', o: ['a rhyming poem', 'a narrative poem', 'a limerick'] },
]

export function gY4PoemForm(rand: Rand): Question {
  const it = pick(rand, POEMFORM_ROWS)
  return mcqE(rand, `Which kind of poem is this? ${it.p}`, it.a, it.o)
}

const RHYME_ROWS = [
  { w: 'day', a: 'play', o: ['dog', 'sun', 'bed'] },
  { w: 'star', a: 'car', o: ['cup', 'fish', 'tree'] },
  { w: 'frog', a: 'log', o: ['hat', 'moon', 'cake'] },
  { w: 'cake', a: 'lake', o: ['cat', 'moon', 'hen'] },
  { w: 'ship', a: 'trip', o: ['sun', 'dog', 'kite'] },
  { w: 'moon', a: 'spoon', o: ['cat', 'fish', 'tree'] },
  { w: 'sock', a: 'clock', o: ['chair', 'bed', 'sun'] },
  { w: 'ring', a: 'sing', o: ['dog', 'cat', 'car'] },
]

export function gY4Rhyme(rand: Rand): Question {
  const it = pick(rand, RHYME_ROWS)
  return mcqE(rand, `Which word rhymes with "${it.w}"?`, it.a, it.o)
}

const SIMILE_ROWS = [
  { a: 'She was as brave as a lion.', o: ['She was very brave.', 'She felt brave.', 'She was brave enough.'] },
  { a: 'The moon was like a silver coin.', o: ['The moon was bright.', 'It was a full moon.', 'The moon shone at night.'] },
  { a: 'He ran like the wind.', o: ['He ran very fast.', 'He ran to the wind.', 'The wind ran fast.'] },
  { a: 'The castle stood like a giant on the hill.', o: ['The castle stood on the hill.', 'The giant was a castle.', 'On the hill stood very.'] },
  { a: 'The stars looked like sugar on a cake.', o: ['The stars shone at night.', 'The cake had stars on it.', 'Sugar is made of stars.'] },
  { a: 'The old dog slept like a stone.', o: ['The old dog slept.', 'The dog was a stone.', 'The stone was old.'] },
]

export function gY4Simile(rand: Rand): Question {
  const it = pick(rand, SIMILE_ROWS)
  return mcqE(rand, 'Which line is a simile?', it.a, it.o)
}

const PERFORM_LINES = [
  'Brave knight, you fought so well tonight!',
  'The wind is rising, rising, rising high.',
  'Quiet now, the forest sleeps.',
  'Look! The moon is huge and round.',
  'We marched through the mud and the rain.',
  'Sing out loud, do not whisper!',
  'One step, two steps, off we go!',
  'The little boat rocked on the sea.',
]

export function gY4Perform(rand: Rand): Question {
  return speakQ('Read the line out loud with feeling.', pick(rand, PERFORM_LINES), {
    hint: 'Use a loud voice, then a quiet one.',
  })
}

const POEM_SEQS: readonly (readonly string[])[] = [
  ['The sun came out.', 'The rain stopped falling.', 'A rainbow appeared.'],
  ['First the seed sprouted.', 'Then a green shoot rose.', 'At last a red flower bloomed.'],
  ['We heard the bell ring.', 'We packed our books away.', 'We walked out of the gate.'],
  ['The boat sailed far.', 'The wind died down.', 'The crew rowed home.'],
  ['Dark clouds gathered.', 'Rain pattered on the roof.', 'The storm passed by.'],
  ['The moon rose slowly.', 'Owls woke in the woods.', 'Night covered the fields.'],
]

export function gY4PoemOrder(rand: Rand): Question {
  return orderQ('Put the poem lines in order', [...pick(rand, POEM_SEQS)])
}

/* ============= Unit 6 · Time & Cause ================================= */

const WHEN_ROWS = [
  { s: '___ lunch we played outside.', a: 'during', o: ['under', 'behind', 'beside'] },
  { s: '___ summer we swam in the sea.', a: 'during', o: ['under', 'behind', 'beside'] },
  { s: 'We went home ___ the bell rang.', a: 'after', o: ['during', 'under', 'behind'] },
  { s: 'She tidied her room ___ dinner.', a: 'after', o: ['during', 'under', 'behind'] },
  { s: '___ it gets dark, come inside.', a: 'before', o: ['during', 'under', 'behind'] },
  { s: 'We packed ___ the bus arrived.', a: 'before', o: ['during', 'under', 'behind'] },
  { s: '___ the storm the sky went clear.', a: 'after', o: ['during', 'under', 'before'] },
  { s: 'We waited ___ the bus came.', a: 'until', o: ['during', 'under', 'behind'] },
]

export function gY4WhenPrep(rand: Rand): Question {
  const it = pick(rand, WHEN_ROWS)
  return mcqE(rand, `Which word tells you WHEN? ${it.s}`, it.a, it.o)
}

const CAUSE_ROWS = [
  { s: 'We stayed in ___ it rained.', a: 'because', o: ['although', 'until', 'during'] },
  { s: 'She smiled ___ she was pleased.', a: 'because', o: ['although', 'until', 'before'] },
  { s: '___ the sun was hot, we wore hats.', a: 'since', o: ['although', 'until', 'during'] },
  { s: 'We missed the bus ___ we left late.', a: 'because', o: ['although', 'until', 'behind'] },
  { s: 'He wore a coat ___ it was cold.', a: 'because', o: ['although', 'until', 'during'] },
  { s: '___ she practised, she improved.', a: 'since', o: ['although', 'until', 'before'] },
  { s: 'She brought a torch ___ it was dark.', a: 'because', o: ['although', 'until', 'during'] },
  { s: 'They cheered ___ they won.', a: 'because', o: ['although', 'until', 'before'] },
]

export function gY4WhyCause(rand: Rand): Question {
  const it = pick(rand, CAUSE_ROWS)
  return mcqE(rand, `Which word gives a REASON? ${it.s}`, it.a, it.o)
}

const TIME_ADVERBS = ['soon', 'yesterday', 'finally', 'afterwards', 'meanwhile', 'later']
const MANNER_ADVERBS = ['slowly', 'carefully', 'quietly', 'bravely', 'gently']

export function gY4AdverbSort(rand: Rand): Question {
  if (randInt(rand, 0, 1) === 0) {
    const answer = pick(rand, TIME_ADVERBS)
    return mcqE(rand, 'Which word is an adverb of TIME?', answer,
      pickOthers(rand, MANNER_ADVERBS, answer, 3))
  }
  const answer = pick(rand, MANNER_ADVERBS)
  return mcqE(rand, 'Which word tells you HOW?', answer,
    pickOthers(rand, TIME_ADVERBS, answer, 3))
}

const COMMA_ROWS = [
  { a: 'After the storm, the sky was clear.', o: ['After the storm the sky, was clear.', 'After, the storm the sky was clear.', 'After the storm the sky was clear.'] },
  { a: 'Because it rained, we stayed inside.', o: ['Because it rained the sky, was clear.', 'Because, it rained we stayed inside.', 'Because it rained we stayed, inside.'] },
  { a: 'In the morning, the birds sang loudly.', o: ['In the morning the birds, sang loudly.', 'In, the morning the birds sang loudly.', 'In the morning the birds sang, loudly.'] },
  { a: 'With my friends, I felt brave.', o: ['With my friends I felt, brave.', 'With, my friends I felt brave.', 'With my friends I, felt brave.'] },
  { a: 'Finally, we packed our bags.', o: ['Finally we packed, our bags.', 'Finally we, packed our bags.', 'Finally we packed our, bags.'] },
  { a: 'During lunch, we read our books.', o: ['During lunch we read, our books.', 'During, lunch we read our books.', 'During lunch we, read our books.'] },
]

export function gY4CommaRight(rand: Rand): Question {
  const it = pick(rand, COMMA_ROWS)
  return mcqE(rand, 'Which sentence punctuates the fronted adverbial correctly?', it.a, it.o)
}

/* ============= Unit 7 · Standard English ============================= */

const STANDARD_ROWS = [
  { a: 'We were not happy with the result.', o: ["We wasn't happy with the result.", 'We were not happy what the result.', 'Us was not happy with the result.'] },
  { a: 'The children were ready.', o: ['The children was ready.', 'Them children was ready.', 'The childrens was ready.'] },
  { a: 'She does not like the noise.', o: ["She don't like the noise.", 'She not like the noise.', 'She does not likes the noise.'] },
  { a: 'I have been to the museum twice.', o: ['I has been to the museum twice.', 'I have went to the museum twice.', 'Me have been to the museum twice.'] },
  { a: 'He does not know the answer.', o: ["He don't know the answer.", 'He not know the answer.', 'He do not knows the answer.'] },
  { a: 'We were not late.', o: ["We wasn't late.", 'We was not late.', 'Us were not late.'] },
  { a: 'The dog does not bite.', o: ["The dog don't bite.", 'The dog not bite.', 'The dog do not bites.'] },
  { a: 'They are playing in the garden.', o: ['They is playing in the garden.', 'They are play in the garden.', 'Them are playing in the garden.'] },
]

export function gY4Standard(rand: Rand): Question {
  const it = pick(rand, STANDARD_ROWS)
  return mcqE(rand, 'Which sentence is in standard English?', it.a, it.o)
}

const TENSE_ROWS = [
  { a: 'I opened the door. I walked inside. I sat down.', o: ['I opened the door. I walks inside. I sat down.', 'I opens the door. I walked inside. I sit down.', 'I opened the door. I walked inside. I sits down.'] },
  { a: 'She baked a cake. She iced it. She shared it.', o: ['She bakes a cake. She iced it. She shared it.', 'She baked a cake. She iced it. She share it.', 'She baked a cake. She icing it. She shared it.'] },
  { a: 'We played football. We cheered. We went home.', o: ['We plays football. We cheered. We went home.', 'We played football. We cheering. We went home.', 'We played football. We cheered. We go home.'] },
  { a: 'The wind blew. The rain fell. The sun appeared.', o: ['The wind blows. The rain fell. The sun appeared.', 'The wind blew. The rain falling. The sun appeared.', 'The wind blew. The rain fell. The sun appearing.'] },
  { a: 'Ben packed his bag. He left early. He caught the bus.', o: ['Ben packs his bag. He left early. He caught the bus.', 'Ben packed his bag. He leaving early. He caught the bus.', 'Ben packed his bag. He left early. He catched the bus.'] },
  { a: 'The sun rises. The birds sing. The flowers open.', o: ['The sun rised. The birds sing. The flowers open.', 'The sun rises. The birds singed. The flowers open.', 'The sun rises. The birds sing. The flowers opened early.'] },
]

export function gY4TenseKeep(rand: Rand): Question {
  const it = pick(rand, TENSE_ROWS)
  return mcqE(rand, 'Which sentence keeps the same tense throughout?', it.a, it.o)
}

const LINK_ROWS = [
  { s: 'Lena packed. Lena left. Which word can replace the second Lena?', a: 'she', o: ['he', 'it', 'they'] },
  { s: 'Omar read. Omar wrote. Which word can replace the second Omar?', a: 'he', o: ['she', 'it', 'they'] },
  { s: 'The twins won. The twins cheered. Which word replaces both names?', a: 'they', o: ['he', 'she', 'it'] },
  { s: 'The kit was new. The kit sat on the desk. Which word can replace the second kit?', a: 'it', o: ['he', 'she', 'they'] },
  { s: 'Zara and Pip practised. Zara and Pip won. Which word replaces both?', a: 'they', o: ['he', 'she', 'it'] },
  { s: 'Ben and Sam hid. Ben and Sam waited. Which word replaces both?', a: 'they', o: ['he', 'she', 'it'] },
  { s: 'Hassan ran. Hassan won. Which word can replace the second Hassan?', a: 'he', o: ['she', 'it', 'they'] },
  { s: 'Ruby and Nina sat. Ruby and Nina smiled. Which word replaces both?', a: 'they', o: ['he', 'she', 'it'] },
]

export function gY4LinkPronoun(rand: Rand): Question {
  const it = pick(rand, LINK_ROWS)
  return mcqE(rand, it.s, it.a, it.o)
}

/* ============= Unit 8 · Plan, Draft & Improve ======================== */

const PLAN_SEQS: readonly (readonly string[])[] = [
  ['Read stories like this one.', 'Write down your ideas.', 'Pick the best idea.', 'Draft the first paragraph.'],
  ['Read similar examples.', 'Jot down your ideas.', 'Choose the best plan.', 'Write the first draft.'],
  ['Look at a model text.', 'List what to include.', 'Put the notes in order.', 'Write the opening paragraph.'],
  ['Collect your ideas.', 'Sort them into groups.', 'Choose the best group.', 'Write the first draft.'],
  ['Read the task twice.', 'Make a quick plan.', 'Write the middle part.', 'Check it at the end.'],
  ['Find a text you like.', 'Notice how it starts.', 'Plan the same kind of text.', 'Write your own copy.'],
]

export function gY4PlanOrder(rand: Rand): Question {
  return orderQ('Put the planning steps in order', [...pick(rand, PLAN_SEQS)])
}

const IMPROVE_ROWS = [
  { a: 'The big dog barked loudly at the gate.', o: ['The dog barked at the gate loudly the big.', 'Loudly the big dog at the gate barked.', 'The gate barked at the big dog loudly the.'] },
  { a: 'Mia packed her bag and ran to the bus stop.', o: ['Mia her bag packed and ran to the bus stop.', 'Ran Mia bag her packed and to the bus stop.', 'Mia packed her bag and ran the to bus stop at.'] },
  { a: 'After lunch, we walked to the library.', o: ['We after lunch walked library to the.', 'After lunch we the walked to library.', 'Lunch after the walked we library to the.'] },
  { a: 'The ancient castle stood on the hill.', o: ['The castle ancient stood the on hill.', 'Ancient the castle the hill stood on.', 'The ancient hill stood the castle on.'] },
  { a: 'First we washed the fruit. Then we ate it.', o: ['First washed we the fruit then ate we it.', 'We the fruit first washed. It ate then we.', 'First we washed the fruit. Then ate we it.'] },
  { a: 'The bright moon lit the dark path home.', o: ['The moon bright the lit dark path home.', 'Bright the moon lit the home dark path.', 'The bright moon the path lit dark home.'] },
]

export function gY4Improve(rand: Rand): Question {
  const it = pick(rand, IMPROVE_ROWS)
  return mcqE(rand, 'Which sentence is written best?', it.a, it.o)
}

const EDIT_TF = [
  { st: 'She quickly ran to the door.', a: true },
  { st: 'She quick ran to the door.', a: false },
  { st: 'We will bring our books tomorrow.', a: true },
  { st: 'We will brang our books tomorrow.', a: false },
  { st: 'The bird sang in the tree.', a: true },
  { st: 'The bird sung in the tree.', a: false },
  { st: 'I have lost my pencil.', a: true },
  { st: 'I has lost my pencil.', a: false },
  { st: 'They were reading quietly.', a: true },
  { st: 'They was reading quiet.', a: false },
  { st: 'The sun rose over the hills.', a: true },
  { st: 'The sun rose over the hillss.', a: false },
]

export function gY4EditTf(rand: Rand): Question {
  const it = pick(rand, EDIT_TF)
  return tfQ('Is this sentence edited correctly?', it.st, it.a, {
    hint: 'Read it slowly. Check the verb and the spelling.',
  })
}

const PROOF_ROWS = [
  { a: 'We walked to the library.', o: ['We walked to the libary.', 'We walked to the librray.', 'We walked to the libaryy.'] },
  { a: 'The garden looked lovely.', o: ['The gardan looked lovely.', 'The gardne looked lovely.', 'The gardern looked lovely.'] },
  { a: 'I felt very proud.', o: ['I felt very pround.', 'I felt vary proud.', 'I felt vary pround.'] },
  { a: 'Our class won the game.', o: ['Our classe won the game.', 'Our class won the gane.', 'Our classs won the game.'] },
  { a: 'The baby smiled at us.', o: ['The babby smiled at us.', 'The bayby smiled at us.', 'The babie smiled at us.'] },
  { a: 'Dad baked a big cake.', o: ['Dad baiked a big cake.', 'Dad baked a big caek.', 'Dad baked a bick cake.'] },
]

export function gY4ProofPick(rand: Rand): Question {
  const it = pick(rand, PROOF_ROWS)
  return mcqE(rand, 'Which sentence is spelled correctly?', it.a, it.o)
}

/* ============= Unit 9 · Settings, Characters & Plot ================== */

const SETTING_PAIRS: { left: string; right: string }[] = [
  { left: 'a sunny meadow', right: 'bright' },
  { left: 'a dark cave', right: 'gloomy' },
  { left: 'a quiet forest', right: 'peaceful' },
  { left: 'a busy market', right: 'noisy' },
  { left: 'a winter storm', right: 'freezing' },
  { left: 'a desert island', right: 'scorching' },
  { left: 'an old castle', right: 'spooky' },
  { left: 'a friendly village', right: 'cheerful' },
]

export function gY4SettingMatch(rand: Rand): Question {
  const pairs = shuffle(rand, SETTING_PAIRS).slice(0, 4)
  return matchQ(rand, 'Match each setting to its describing word', pairs)
}

const TRAIT_ROWS = [
  { s: 'Lena faced the giant without shaking.', a: 'brave', o: ['kind', 'greedy', 'curious'] },
  { s: 'He shared his lunch with a friend.', a: 'kind', o: ['brave', 'honest', 'greedy'] },
  { s: 'She told the truth to her teacher.', a: 'honest', o: ['brave', 'kind', 'careless'] },
  { s: 'The fox kept all the food for itself.', a: 'greedy', o: ['kind', 'honest', 'curious'] },
  { s: 'He left his book on the bus again.', a: 'careless', o: ['brave', 'kind', 'honest'] },
  { s: 'She asked why the moon changes shape.', a: 'curious', o: ['greedy', 'careless', 'honest'] },
]

export function gY4Trait(rand: Rand): Question {
  const it = pick(rand, TRAIT_ROWS)
  return mcqE(rand, `Which word describes the character? ${it.s}`, it.a, it.o)
}

const PLOT_SEQS: readonly (readonly string[])[] = [
  ['A girl found a locked box.', 'She searched for the key.', 'She opened the box and smiled.'],
  ['The climbers reached the cave.', 'A cold wind blew from the dark.', 'They lit their torches and went on.'],
  ['Ben hid behind the door.', 'He jumped out and shouted boo.', 'His sister laughed out loud.'],
  ['The seed sank into the soil.', 'Roots spread under the ground.', 'A green shoot reached the sun.'],
  ['A red kite flew high.', 'The string slipped from my hand.', 'Tails chased it across the field.'],
  ['The bell rang for lunch.', 'We washed our hands.', 'Then we sat down to eat.'],
]

export function gY4PlotOrder(rand: Rand): Question {
  return orderQ('Put the story events in order', [...pick(rand, PLOT_SEQS)])
}

const DIALOGUE_ROWS = [
  { a: '"Wait for me!" called Tails.', o: ['Tails called for me to wait.', 'Tails waited by the door.', 'The wait was long for Tails.'] },
  { a: '"I found the key!" cried Lena.', o: ['Lena found the key and cried.', 'The key cried for Lena.', 'Lena cried because she lost the key.'] },
  { a: '"Look at the moon," said Ben.', o: ['Ben looked at the moon.', 'The moon said Ben.', 'Ben said the moon was gone.'] },
  { a: '"Help me lift it," called Zara.', o: ['Zara needed help to lift it.', 'It called for Zara to help.', 'Zara lifted it all alone.'] },
  { a: '"We won the game!" cheered the team.', o: ['The team won the game.', 'The game cheered the team.', 'The team lost the game.'] },
  { a: '"Do not touch that," warned Sam.', o: ['Sam touched it anyway.', 'That warned Sam not to touch.', 'Sam warned the class to listen.'] },
]

export function gY4Dialogue(rand: Rand): Question {
  const it = pick(rand, DIALOGUE_ROWS)
  return mcqE(rand, 'Which line shows a character speaking?', it.a, it.o)
}

/* ============= Unit 10 · Dictation & Confusing Words ================= */

const DICT_WORDS = [
  'answer', 'breath', 'build', 'centre', 'consider', 'continue',
  'decide', 'describe', 'enough', 'experience', 'guide', 'heart',
  'imagine', 'increase', 'island', 'learn', 'length', 'mention',
  'minute', 'natural', 'notice', 'ordinary', 'perhaps', 'popular',
  'position', 'possible', 'purpose', 'quarter', 'recent', 'regular',
  'remember', 'strength', 'suppose', 'various', 'weight',
]

export function gY4DictTiles(rand: Rand): Question {
  const word = pick(rand, DICT_WORDS)
  const blanks = word.slice(0, 2) + '\u00b7'.repeat(Math.max(1, word.length - 2))
  return tilesQ(`Dictation: write the word shown (${blanks})`, word,
    'Say it, then tap the tiles in order.')
}

const DICT_SENT_ROWS = [
  { a: 'The glass fell and broke.', o: ['The glass fell and brake.', 'The grass fell and broke.', 'The glass fill and broke.'] },
  { a: "Please write your name here.", o: ["Please write you're name here.", 'Please wright your name here.', 'Please write your name hear.'] },
  { a: 'The wind blew the door shut.', o: ['The wind blew the door shat.', 'The wine blew the door shut.', 'The wind blue the door shut.'] },
  { a: 'We saw a flock of birds.', o: ['We saw a lock of birds.', 'We sew a flock of birds.', 'We saw a flock of bird.'] },
  { a: 'The rope was tied to the post.', o: ['The rope was tide to the post.', 'The roe was tied to the post.', 'The rope was tied to the pest.'] },
  { a: 'Put the jar on the shelf.', o: ['Put the jar on the shall.', 'Put the bar on the shall.', 'Put the jar in the shelf.'] },
]

export function gY4DictSentence(rand: Rand): Question {
  const it = pick(rand, DICT_SENT_ROWS)
  return mcqE(rand, 'Which sentence matches what you heard?', it.a, it.o)
}

const CONFUSE_ROWS = [
  { s: 'Can I ___ your pencil?', a: 'borrow', o: ['lend', 'borow', 'brrow'] },
  { s: 'Please ___ the gift.', a: 'accept', o: ['except', 'accepte', 'acpet'] },
  { s: 'The wind did not ___ the tents.', a: 'affect', o: ['effect', 'afect', 'affecte'] },
  { s: '___ way is shorter?', a: 'which', o: ['witch', 'whcih', 'whitch'] },
  { s: 'The ___ rode a white horse.', a: 'knight', o: ['night', 'knigt', 'nigth'] },
  { s: 'Please be ___ in the library.', a: 'quiet', o: ['quite', 'quieet', 'qeiet'] },
  { s: 'The birds sat on the branch in ___.', a: 'peace', o: ['piece', 'peice', 'peece'] },
  { s: 'The sky was ___ and grey.', a: 'plain', o: ['plane', 'plian', 'plaine'] },
]

export function gY4Confusing(rand: Rand): Question {
  const it = pick(rand, CONFUSE_ROWS)
  return mcqE(rand, `Which word completes the sentence? ${it.s}`, it.a, it.o)
}

const POSSESS_ROWS = [
  { a: "The children's teacher smiled.", o: ["The childrens' teacher smiled.", "The child's teacher smiled.", "The children teacher's smiled."] },
  { a: "The men's team won the match.", o: ["The mens' team won the match.", "The man's team won the match.", "The men team's won the match."] },
  { a: "The women's relay was fast.", o: ["The womens' relay was fast.", "The woman's relay was fast.", "The women relay's was fast."] },
  { a: "The boys' boots landed in the mud.", o: ["The boys boot's landed in the mud.", "The boy's boots landed in the mud.", "The boys boots' landed in the mud."] },
  { a: "The babies' bottles were full.", o: ["The babies' bottle's were full.", "The baby's bottles were full.", "The babys' bottles were full."] },
  { a: "The children's coats hung on the hooks.", o: ["The childrens' coats hung on the hooks.", "The child's coats hung on the hooks.", "The children coat's hung on the hooks."] },
]

export function gY4Possess(rand: Rand): Question {
  const it = pick(rand, POSSESS_ROWS)
  return mcqE(rand, 'Which sentence places the possessive apostrophe correctly?', it.a, it.o)
}
