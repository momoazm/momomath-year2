import type { LessonDef, Question } from '../types'
import {
  makeLesson,
  matchQ,
  mcqE,
  mcqFixed,
  orderQ,
  pick,
  pickOthers,
  shuffle,
  tfQ,
  type Gen,
  type Rand,
} from './helpers'

/** Term Challenges are cumulative checkpoints: 30 exam-style items, no hints.
 *  Stage 2 has no official Progression Tests (those start at Stage 3), so we
 *  mirror the simplified Stage 3 sample-paper formats: tick-box MCQ, number
 *  the events, match the heading, find-and-copy the word. */
export const TERM_QUESTIONS = 30

/* ------------------------------------------------------------------ */
/*  Shared exam-style generators (cumulative banks, NO hint fields)    */
/* ------------------------------------------------------------------ */

const TICK_PHONICS = [
  { q: 'Which word has the same sound as "how"?', a: 'cow', w: ['low', 'law', 'leg'] },
  { q: 'Which word rhymes with "moon"?', a: 'spoon', w: ['soon', 'star', 'snow'] },
  { q: 'Tap the word you would hear: "rain"', a: 'rain', w: ['train-t', 'ran', 'ren'] },
  { q: 'Which word starts with the same sound as "sun"?', a: 'sock', w: ['moon', 'fish', 'hat'] },
  { q: 'Which word has a long vowel team like "boat"?', a: 'goat', w: ['cat', 'bed', 'pig'] },
  { q: 'Which word rhymes with "cake"?', a: 'lake', w: ['clock', 'cow', 'key'] },
  { q: 'Which word has the "ay" sound as in "day"?', a: 'play', w: ['pen', 'top', 'mud'] },
  { q: 'Which word rhymes with "light"?', a: 'night', w: ['leaf', 'lamp', 'log'] },
  { q: 'Tap the word that sounds like "see":', a: 'sea', w: ['sea-shell-spelling-check', 'say', 'sat'] },
  { q: 'Which word rhymes with "fish"?', a: 'dish', w: ['face', 'fox', 'fun'] },
  { q: 'Which word starts with the same sound as "moon"?', a: 'milk', w: ['sun', 'dog', 'cap'] },
  { q: 'Which word has the "ee" sound as in "tree"?', a: 'bee', w: ['bag', 'boat', 'box'] },
]

const TICK_SPELLING = [
  { q: 'One child, two ___.', a: 'children', w: ['childs', 'childes', 'childrens'] },
  { q: 'One mouse, two ___.', a: 'mice', w: ['mouses', 'mices', 'micies'] },
  { q: 'The dog wagged its ___.', a: 'tail', w: ['tale', 'tile', 'tails'] },
  { q: 'The sky is ___ today.', a: 'blue', w: ['blew', 'bloo', 'blurry'] },
  { q: '"Dinner time!" ___ Mum.', a: 'said', w: ['say', 'sed', 'sayed'] },
  { q: 'I have ___ brothers.', a: 'one', w: ['won', 'ono', 'once'] },
  { q: 'We ___ at the beach. (past of are)', a: 'were', w: ['where', 'was', 'weir'] },
  { q: 'The bag is over ___.', a: 'there', w: ['their', 'theyre', 'ther'] },
  { q: 'I walk to ___ every day.', a: 'school', w: ['skool', 'shcool', 'schoool'] },
  { q: 'I wore a coat ___ it was cold.', a: 'because', w: ['becuase', 'becase', 'becouse'] },
  { q: 'Do not ___ at the sun!', a: 'stare', w: ['stair', 'star', 'steer'] },
  { q: 'Did you ___ the thunder?', a: 'hear', w: ['here', 'hare', 'herd'] },
  { q: 'A tulip is a pretty ___.', a: 'flower', w: ['flour', 'flowr', 'flouer'] },
  { q: 'We bake bread with ___.', a: 'flour', w: ['flower', 'flaor', 'floury'] },
  { q: 'My teddy ___ is soft.', a: 'bear', w: ['bare', 'beir', 'bayr'] },
  { q: 'Jump in the pool ___!', a: 'again', w: ['agen', 'agian', 'agan'] },
]

const TICK_VOCAB = [
  { q: 'Tom saw a giant pumpkin. What does "giant" mean?', a: 'very big', w: ['very small', 'very old', 'very quiet'] },
  { q: 'Mum was peckish, so she made sandwiches. "Peckish" means…', a: 'a bit hungry', w: ['a bit thirsty', 'very tired', 'very sad'] },
  { q: '"Go and fetch it!" What does fetch mean?', a: 'go and get it', w: ['go to sleep', 'leave it', 'hide it'] },
  { q: 'Dad mended the kite. He…', a: 'fixed it', w: ['broke it', 'threw it', 'hid it'] },
  { q: 'Lily was cross. She felt…', a: 'angry', w: ['happy', 'sleepy', 'shy'] },
  { q: 'Nana was delighted. She was…', a: 'very pleased', w: ['very cross', 'worried', 'sleepy'] },
  { q: 'Which word is a describing word (adjective)?', a: 'enormous', w: ['running', 'under', 'slowly-run'] },
  { q: '"Suddenly" tells you…', a: 'when something happened', w: ['where it happened', 'who did it', 'how big it was'] },
  { q: 'A synonyms pair: big ↔ …', a: 'large', w: ['small', 'tiny', 'short'] },
  { q: 'What is the opposite of "loud"?', a: 'quiet', w: ['noisy', 'quiet-opp-check', 'aloud'] },
  { q: 'Which word means very pleased?', a: 'delighted', w: ['cross', 'worried', 'tired'] },
  { q: 'Which word best completes: "The spider ___ across the bath."', a: 'scuttled', w: ['went', 'moved', 'came'] },
]

const TICK_GRAMMAR = [
  { q: 'Which sentence is punctuated correctly?', a: 'The dog barked.', w: ['my dad is tall.', 'the dog barked', 'The dog barked'] },
  { q: 'Which mark ends a question?', a: '?', w: ['.', '!', ','] },
  { q: 'Join with the right word: "I like cats ___ I love dogs."', a: 'and', w: ['because-join', 'so-join-2', 'unless'] },
  { q: '"Do you want jam ___ honey?"', a: 'or', w: ['and-2', 'because', 'so'] },
  { q: 'Which is a command?', a: 'Sit down quietly.', w: ['Where is my hat?', 'The pencil is sharp.', 'What a surprise!'] },
  { q: 'Which noun phrase is bigger: "dog" or…?', a: 'the happy dog', w: ['dog-the', 'a-dog-only', 'dog.'] },
  { q: 'Pick the correct pronoun: "Mia lost ___ bag."', a: 'her', w: ['she', 'hers-2', 'Mia'] },
  { q: '"First, I put on my socks. ___, I put on my shoes."', a: 'Then', w: ['Finally', 'At last', 'In the end'] },
  { q: 'Which word joins two ideas: "It was cold ___ sunny."', a: 'but', w: ['because-3', 'or-3', 'unless-3'] },
  { q: 'Which sentence uses a capital letter correctly?', a: 'We played football.', w: ['we played football.', 'we Played football.', 'WE played football.'] },
  { q: 'Add the missing full stop: "The sun is hot___"', a: '.', w: ['?', '!', ','] },
  { q: 'Which is a plural?', a: 'cats', w: ['cat', 'cat-ish', 'catting'] },
]

const TICK_STORY = [
  { q: 'A story usually has a beginning, a middle and a…', a: 'ending', w: ['title-only', 'picture', 'index'] },
  { q: 'Where a story happens is its…', a: 'setting', w: ['plot', 'ending', 'author'] },
  { q: 'The main person in a story is the…', a: 'character', w: ['setting', 'heading', 'chapter'] },
  { q: 'Predict next: Poppy planted seeds and watered them. Next…', a: 'green shoots appeared', w: ['it snowed hard', 'the seeds vanished', 'she bought a car'] },
  { q: 'Alfie found a glowing key. This is probably a…', a: 'made-up tale', w: ['fact book', 'recipe', 'manual'] },
  { q: 'Characters show feelings by…', a: 'what they do', w: ['what colour they are', 'page numbers', 'the title only'] },
  { q: 'Which is a fiction text type?', a: 'a tale about dragons', w: ['a report on bees', 'a recipe', 'a timetable'] },
  { q: 'Retell: put "The team won" where it belongs — after…', a: 'they scored', w: ['they arrived', 'they cheered', 'they slept'] },
  { q: 'Between the lines: Hana bowed and smiled. She feels…', a: 'proud', w: ['guilty', 'homesick', 'furious'] },
  { q: 'A poem often repeats sounds at line ends — that is…', a: 'rhyme', w: ['setting', 'report', 'chapter'] },
  { q: 'Non-fiction texts aim to…', a: 'give real information', w: ['invent dragons', 'only make you laugh', 'hide facts'] },
  { q: 'Guess the ending: the door opened on a land of…', a: 'dragons', w: ['socks', 'homework', 'sandwiches'] },
]

const TICK_WRITING = [
  { q: 'A good story plan starts with…', a: 'who and where', w: ['the full stop', 'the index', 'the glossary'] },
  { q: 'Reports stack facts under…', a: 'headings', w: ['rhymes', 'questions', 'names'] },
  { q: 'Which opener sparks a story?', a: 'Suddenly, the lights went out!', w: ['The.', 'Yes.', 'Table 1.'] },
  { q: 'Proofread: which line is perfect?', a: 'Mia painted a rainbow.', w: ['mia painted a rainbow.', 'Mia painted a rainbow', 'mia painted A rainbow.'] },
  { q: 'Writers choose WHO first in a…', a: 'plan', w: ['footnote', 'glossary', 'index'] },
  { q: 'A wow word beats a dull word. "stomped" beats…', a: 'went', w: ['walked-careful', 'moved-ish', 'got'] },
  { q: 'Beginning, middle, end is a story…', a: 'skeleton', w: ['spelling', 'alphabet', 'report-card'] },
  { q: 'Describe with an adjective: "the ___ wave"', a: 'enormous', w: ['the-run', 'went', 'and'] },
  { q: 'A report is…', a: 'true facts in order', w: ['a made-up dragon tale', 'a rhyme only', 'a shopping list joke'] },
  { q: 'Check your work by…', a: 're-reading for mistakes', w: ['closing your eyes', 'guessing forever', 'skipping capitals'] },
  { q: 'Which is a setting for a story?', a: 'a deep dark wood', w: ['a full stop', 'a pronoun', 'a heading number'] },
  { q: 'Speech marks show…', a: 'someone is talking', w: ['the end of the book', 'a new chapter number', 'a picture'] },
]

const ORDER_EVENTS: { label: string; items: string[] }[] = [
  { label: 'Number the events: a butterfly life', items: ['egg', 'caterpillar', 'chrysalis', 'butterfly'] },
  { label: 'Number the events: growing a plant', items: ['seed', 'sprout', 'young plant', 'flower'] },
  { label: 'Number the events: our morning', items: ['wake up', 'eat breakfast', 'go to school', 'lessons'] },
  { label: 'Number the events: baking a pie', items: ['pick apples', 'carry them home', 'bake the pie', 'eat a slice'] },
  { label: 'Number the events: a stormy night', items: ['clouds roll in', 'lights go out', 'find a torch', 'tell stories'] },
  { label: 'Number the events: planting sunflowers', items: ['dig a hole', 'plant the seed', 'water daily', 'sunflowers smile'] },
  { label: 'Number the events: fixing the bike', items: ['check the bike', 'pump the tyres', 'ride to the park', 'share an ice lolly'] },
  { label: 'Number the events: learning to swim', items: ['hold the float', 'paddle shallow end', 'swim a width', 'grin big'] },
  { label: 'Order the day: Sun path', items: ['rises in the east', 'high at midday', 'lower in the west', 'sets in the west'] },
  { label: 'Order ABC: dictionary train', items: ['ant', 'bee', 'cow', 'dog'] },
  { label: 'Order the story skeleton', items: ['plan the characters', 'write the middle', 'add the problem', 'check the ending'] },
  { label: 'Order: getting ready for bed', items: ['wash hands', 'brush teeth', 'read a story', 'lights out'] },
  { label: 'Order the report', items: ['title', 'fact paragraph 1', 'fact paragraph 2', 'closing line'] },
  { label: 'Number: making a sandwich', items: ['get bread', 'add filling', 'cut in half', 'eat lunch'] },
  { label: 'Order the seasons', items: ['spring', 'summer', 'autumn', 'winter'] },
  { label: 'Order: losing a tooth', items: ['wobbly tooth', 'tooth falls out', 'tooth fairy visits', 'new tooth grows'] },
]

const MATCH_HEADINGS_A: { left: string; right: string }[] = [
  { left: 'A tale of dragons and glowing keys', right: 'fiction' },
  { left: 'How bees make honey', right: 'non-fiction' },
  { left: 'Poppy and the magic seed', right: 'story' },
  { left: 'All about volcanoes for kids', right: 'report' },
  { left: 'The Talking Cat', right: 'made-up tale' },
  { left: 'Rainforest layers explained', right: 'information text' },
  { left: 'Beat & Repeat verse lines', right: 'poem' },
  { left: 'Where the story happens', right: 'setting' },
  { left: 'The hero of the tale', right: 'character' },
  { left: 'What happens in order', right: 'plot' },
  { left: 'A dictionary first-word finder', right: 'glossary skill' },
  { left: 'Contents page in a book', right: 'navigation feature' },
  { left: 'Rhyming ends in a verse', right: 'poetry feature' },
  { left: 'True facts under headings', right: 'report feature' },
  { left: 'Predict what happens next', right: 'inference skill' },
  { left: 'Feelings shown by actions', right: 'inference skill 2' },
]

const MATCH_HEADINGS_B: { left: string; right: string }[] = [
  { left: 'happy', right: 'glad' },
  { left: 'big', right: 'large' },
  { left: 'angry', right: 'cross' },
  { left: 'tiny', right: 'small' },
  { left: 'quiet', right: 'silent' },
  { left: 'brave', right: 'bold' },
  { left: 'said', right: 'past of say' },
  { left: 'mice', right: 'plural of mouse' },
  { left: 'tail', right: 'wagging body part' },
  { left: 'flour', right: 'baking powder' },
  { left: 'flower', right: 'in the garden' },
  { left: 'because', right: 'gives the reason' },
  { left: 'there', right: 'not here' },
  { left: 'stare', right: 'look hard' },
  { left: 'stair', right: 'steps up' },
  { left: 'blue', right: 'sky colour' },
]

const FIND_WORD: { sentence: string; target: string; wrong: string[] }[] = [
  { sentence: 'The quick fox jumped over the lazy dog.', target: 'fox', wrong: ['cat', 'bird', 'fish'] },
  { sentence: 'Mia painted a rainbow after the rain.', target: 'rainbow', wrong: ['sandwich', 'ladder', 'pencil'] },
  { sentence: 'Sam packed his boots for the long walk.', target: 'boots', wrong: ['helmet', 'spoon', 'kite'] },
  { sentence: 'The owl slept in the old oak tree.', target: 'owl', wrong: ['bee', 'ant', 'hen'] },
  { sentence: 'Gran baked warm bread for our picnic.', target: 'bread', wrong: ['brick', 'boot', 'broom'] },
  { sentence: 'A tiny ant carried a crumb home.', target: 'ant', wrong: ['elephant', 'tiger', 'whale'] },
  { sentence: 'The red kite danced in the windy sky.', target: 'kite', wrong: ['boat', 'bed', 'bell'] },
  { sentence: 'We spotted a shiny shell on the beach.', target: 'shell', wrong: ['ship', 'shoe', 'shirt'] },
  { sentence: 'The baby frog hopped onto a lily pad.', target: 'frog', wrong: ['fox', 'fin', 'fly'] },
  { sentence: 'Ben loaded his wagon with apples.', target: 'wagon', wrong: ['window', 'wicket', 'wing'] },
  { sentence: 'She whispered a secret to her friend.', target: 'secret', wrong: ['sausage', 'socket', 'spider'] },
  { sentence: 'The moon glowed above the quiet hills.', target: 'moon', wrong: ['mug', 'mask', 'mop'] },
  { sentence: 'Dad roasted juicy corn on the grill.', target: 'corn', wrong: ['cake', 'crab', 'coat'] },
  { sentence: 'Our class planted ten bright tulips.', target: 'tulips', wrong: ['tables', 'tunnels', 'toasters'] },
  { sentence: 'The pirates hunted for buried gold.', target: 'gold', wrong: ['gravel', 'glue', 'glass'] },
  { sentence: 'A soft kitten napped in the warm basket.', target: 'kitten', wrong: ['kettle', 'kiosk', 'koala'] },
]

const TRUEFALSE_EXAM: { statement: string; answer: boolean }[] = [
  { statement: 'A fair test changes only one thing at a time.', answer: true },
  { statement: 'Darkness is a material you can hold.', answer: false },
  { statement: 'Burning wood is a reversible change.', answer: false },
  { statement: 'All living things need water and air.', answer: true },
  { statement: 'The Moon makes its own light like a torch.', answer: false },
  { statement: 'Magnets attract a rubber ball.', answer: false },
  { statement: 'A circuit must be complete for a lamp to light.', answer: true },
  { statement: 'Sugar dissolving in water is always permanent.', answer: false },
  { statement: 'A prediction is a guess before testing.', answer: true },
  { statement: 'A habitat must be indoors like a classroom.', answer: false },
  { statement: 'Incisors cut food and molars grind it.', answer: true },
  { statement: 'Once you kick a ball, no forces act on it.', answer: false },
  { statement: 'Recycling paper helps care for the planet.', answer: true },
  { statement: 'A model must be made of the same material as the real thing.', answer: false },
  { statement: 'Plants need sunlight as well as water to grow.', answer: true },
  { statement: 'Fiction texts only give real information.', answer: false },
  { statement: 'Speech marks show that someone is talking.', answer: true },
  { statement: 'A plural of child is childs.', answer: false },
  { statement: 'Stories can be retold by putting events in order.', answer: true },
  { statement: 'Delighted means very cross.', answer: false },
  { statement: 'Gravity pulls objects towards the Earth.', answer: true },
  { statement: 'Opaque objects block light and make shadows.', answer: true },
  { statement: 'You should only brush teeth when something hurts.', answer: false },
  { statement: 'Rocks come in igneous, sedimentary and metamorphic types.', answer: true },
]

function gTickPhonics(rand: Rand): Question {
  const e = pick(rand, TICK_PHONICS)
  return mcqE(rand, e.q, e.a, e.w)
}
function gTickSpelling(rand: Rand): Question {
  const e = pick(rand, TICK_SPELLING)
  return mcqE(rand, e.q, e.a, e.w)
}
function gTickVocab(rand: Rand): Question {
  const e = pick(rand, TICK_VOCAB)
  return mcqE(rand, e.q, e.a, e.w)
}
function gTickGrammar(rand: Rand): Question {
  const e = pick(rand, TICK_GRAMMAR)
  return mcqE(rand, e.q, e.a, e.w)
}
function gTickStory(rand: Rand): Question {
  const e = pick(rand, TICK_STORY)
  return mcqE(rand, e.q, e.a, e.w)
}
function gTickWriting(rand: Rand): Question {
  const e = pick(rand, TICK_WRITING)
  return mcqE(rand, e.q, e.a, e.w)
}
function gOrderEvents(rand: Rand): Question {
  const o = pick(rand, ORDER_EVENTS)
  return orderQ(o.label, o.items)
}
function gMatchHeadingA(rand: Rand): Question {
  const picked = shuffle(rand, MATCH_HEADINGS_A).slice(0, 4)
  return matchQ(rand, 'Match each clue to its heading word', picked)
}
function gMatchHeadingB(rand: Rand): Question {
  const picked = shuffle(rand, MATCH_HEADINGS_B).slice(0, 4)
  return matchQ(rand, 'Match the word to its partner meaning', picked)
}
function gFindWord(rand: Rand): Question {
  const e = pick(rand, FIND_WORD)
  return mcqE(rand, `Find-and-copy: which word appears in "${e.sentence}"?`, e.target, e.wrong)
}
function gExamTF(rand: Rand): Question {
  const e = pick(rand, TRUEFALSE_EXAM)
  return tfQ('Exam check', e.statement, e.answer)
}
function gAlphabetOrder(rand: Rand): Question {
  const sets = [
    ['ant', 'bee', 'cow'],
    ['dog', 'egg', 'frog'],
    ['goat', 'hen', 'igloo'],
    ['kite', 'lion', 'moon'],
    ['nest', 'owl', 'pig'],
    ['queen', 'rat', 'sun'],
    ['tree', 'umbrella', 'van'],
  ]
  return orderQ('Exam: put the words in ABC order.', pick(rand, sets))
}
function gPunctPick(rand: Rand): Question {
  const items = [
    { text: 'Where is my hat?', good: true },
    { text: 'my dad is tall.', good: false },
    { text: 'We played football.', good: true },
    { text: 'the shop is shut', good: false },
    { text: 'What time is it?', good: true },
    { text: 'it is cold today.', good: false },
    { text: 'Wash your hands, please.', good: true },
    { text: 'birds can fly', good: false },
    { text: 'The cat is asleep.', good: true },
    { text: 'can we go now.', good: false },
    { text: 'Who took my pencil?', good: true },
    { text: 'frogs can hop.', good: false },
  ]
  const good = items.filter((i) => i.good).map((i) => i.text)
  const answer = pick(rand, good)
  const distractors = pickOthers(rand, items.map((i) => i.text), answer, 3)
  const choices = shuffle(rand, [answer, ...distractors])
  return mcqFixed('Tick-box: which sentence is correct?', choices, choices.indexOf(answer), {})
}

/** Cumulative tick-box pool generators — thin wrappers keep gens swappable. */
function gTickMix1(rand: Rand): Question {
  const gens = [gTickPhonics, gTickSpelling, gTickVocab, gTickGrammar, gOrderEvents]
  return pick(rand, gens)(rand)
}
function gTickMix2(rand: Rand): Question {
  const gens = [gTickStory, gTickWriting, gMatchHeadingA, gFindWord, gExamTF]
  return pick(rand, gens)(rand)
}
function gTickMix3(rand: Rand): Question {
  const gens = [gTickSpelling, gTickVocab, gMatchHeadingB, gAlphabetOrder, gPunctPick, gOrderEvents]
  return pick(rand, gens)(rand)
}

/* ------------------------------------------------------------------ */
/*  The three Term Challenge lessons                                   */
/* ------------------------------------------------------------------ */

/** Term 1 — after E4/E5 (phonics, spelling, vocab, early grammar). */
export const TERM1: LessonDef = makeLesson(
  'e5term',
  'Term 1 Challenge',
  ['2Rw.01', '2Ww.03', '2Ww.07', '2Rv.01', '2Wg.01'],
  'tails',
  'Term 1 exam time!',
  'Thirty tick-box questions from Units 1–5 — no hints, Gold / Silver / Bronze at the end. You have got this!',
  [gTickPhonics, gTickSpelling, gTickVocab, gOrderEvents, gMatchHeadingB, gFindWord, gExamTF, gAlphabetOrder, gPunctPick],
  gTickSpelling,
)

/** Term 2 — after E9/E10 (sentences, grammar, fiction comprehension). */
export const TERM2: LessonDef = makeLesson(
  'e10term',
  'Term 2 Challenge',
  ['2Wg.05', '2Wg.07', '2Ri.01', '2Ri.11', '2Rs.01'],
  'amy',
  'Term 2 exam time!',
  'Thirty cumulative questions from Units 6–10 — joiners, tenses, stories and more. No hints. Aim for Gold!',
  [gTickGrammar, gTickStory, gOrderEvents, gMatchHeadingA, gFindWord, gExamTF, gTickVocab, gPunctPick, gTickMix1],
  gTickStory,
)

/** End of year — after E13 (full-year cumulative paper). */
export const TERM3: LessonDef = makeLesson(
  'e13term',
  'Year-End Challenge',
  ['2Wc.02', '2Ws.01', '2Wp.05', '2Ri.16', '2Ww.09'],
  'sonic',
  'The big year-end paper!',
  'Thirty questions covering the WHOLE year — reading, writing, spelling and grammar. No hints. Finish strong!',
  [gTickMix1, gTickMix2, gTickMix3, gOrderEvents, gMatchHeadingA, gMatchHeadingB, gFindWord, gExamTF, gTickWriting],
  gTickWriting,
)

export const TERM_LESSONS: LessonDef[] = [TERM1, TERM2, TERM3]
export const TERM_LESSON_IDS = TERM_LESSONS.map((l) => l.id)

/** Lesson count used by LessonScreen for term checkpoints. */
export function questionsForLesson(lessonId: string, defaultCount: number): number {
  return lessonId.endsWith('term') ? TERM_QUESTIONS : defaultCount
}

/** Cambridge-style medal for term challenges (null for normal lessons). */
export function termMedal(lessonId: string, accuracy: number): 'gold' | 'silver' | 'bronze' | null {
  if (!lessonId.endsWith('term')) return null
  if (accuracy >= 90) return 'gold'
  if (accuracy >= 75) return 'silver'
  return 'bronze'
}
