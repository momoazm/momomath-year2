/** PLAN 169h — Year-4 science generators. Built directly on the statutory
 *  DfE Year-4 programme of study (see src/content/syllabus/y4/science.ts
 *  for the extracted source): working-scientifically practice, living
 *  things and their habitats, the digestive system and teeth, food chains,
 *  states of matter, sound, and electricity.
 *
 *  Vocabulary stays inside src/content/syllabus/y4/science.ts: bank-tier
 *  words (mcq choices, match sides, order items) must pass the year-4
 *  syllabus or stay short enough to be soft; prompts, hints, truefalse
 *  statements, speak targets and teach lines are text tier (report-only). */

import type { Question } from '../../../types'
import {
  matchQ,
  mcqE,
  orderQ,
  pick,
  pickOthers,
  say,
  shuffle,
  speakQ,
  tfQ,
  type Rand,
} from '../../../science/helpers'

/* ===================== Unit 1 · working scientists ===================== */

const ASK_Q = [
  'Why does a shadow change size when the light moves?',
  'Which surface makes a toy car travel farthest?',
  'What happens to a sound as you move far away?',
  'Why does a puddle disappear on a sunny day?',
  'How does a lamp light up in a circuit?',
  'What makes an elastic band twang?',
  'Which material lets heat pass through it best?',
  'What happens to ice left in a warm room?',
]

export function gY4AskQ(rand: Rand): Question {
  const answer = pick(rand, ASK_Q)
  return mcqE(rand, 'Which of these is a real science question?', answer,
    pickOthers(rand, [
      'The bus was late again.', 'Red is my favourite colour.',
      'I scored two goals at break.', 'Lunch was rice and chicken.',
      'The cat slept on the sofa.', 'Ice cream is nice.',
    ], answer, 3))
}

const FINDINGS = [
  'The sound grew fainter as we walked away.',
  'The puddle dried fastest in the sunny corner.',
  'The lamp lit when the loop was complete.',
  'Ice turned to water as the room warmed up.',
  'The thick band made the lowest pitch.',
  'The car went farthest on the smooth surface.',
  'The thermometer read the same each time we tried.',
  'The metal wire let the circuit work, the plastic did not.',
]

export function gY4ScReport(rand: Rand): Question {
  return speakQ('Report your finding out loud', pick(rand, FINDINGS),
    { hint: 'Speak slowly. Say what you found out.' })
}

const MEASURE4 = [
  { q: 'Temperature is measured in...', a: 'degrees Celsius', o: ['centimetres', 'metres', 'litres'] },
  { q: 'Which tool measures temperature?', a: 'a thermometer', o: ['a ruler', 'a clock', 'a magnifier'] },
  { q: 'Length is measured in...', a: 'centimetres', o: ['degrees', 'seconds', 'grams'] },
  { q: 'Which tool watches a value all night by itself?', a: 'a data logger', o: ['a magnifier', 'a mirror', 'a ruler'] },
  { q: 'We measure how long an enquiry takes with...', a: 'a clock and seconds', o: ['a ruler and metres', 'a thermometer and degrees', 'a jug and litres'] },
  { q: 'Accurate measuring means...', a: 'look at the scale each time', o: ['guessing the number', 'looking away early', 'counting twice'] },
  { q: 'Which unit fits a temperature of 20 degrees?', a: 'degrees Celsius', o: ['centimetres', 'seconds', 'litres'] },
  { q: 'A fair measurement uses...', a: 'the same tool every time', o: ['a different tool each go', 'no tool at all', 'only your eyes'] },
]

export function gY4Measure(rand: Rand): Question {
  const it = pick(rand, MEASURE4)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const EQUIP4: { left: string; right: string }[] = [
  { left: 'thermometer', right: 'measures temperature' },
  { left: 'data logger', right: 'records values over time' },
  { left: 'ruler', right: 'measures with centimetres' },
  { left: 'bar chart', right: 'shows counts as bars' },
  { left: 'table', right: 'keeps numbers in rows' },
  { left: 'key', right: 'names an unknown thing' },
  { left: 'labelled diagram', right: 'names the parts' },
  { left: 'clock', right: 'counts the seconds' },
  { left: 'measuring jug', right: 'measures liquids' },
  { left: 'magnifier', right: 'makes small things look bigger' },
]

export function gY4Equipment(rand: Rand): Question {
  return matchQ(rand, 'Match each tool to its job',
    shuffle(rand, EQUIP4).slice(0, 4).map((p) => ({ ...p })))
}

const RECORD4 = [
  { q: 'We counted each finding. Which record shows counts as bars?', a: 'a bar chart', o: ['a key', 'a sentence', 'a model'] },
  { q: 'Which record keeps values in rows and boxes?', a: 'a table', o: ['a drawing', 'a song', 'a key'] },
  { q: 'We sorted things with questions. What did we make?', a: 'a key', o: ['a bar chart', 'a thermometer', 'a clock'] },
  { q: 'Which record names parts with arrows?', a: 'a labelled diagram', o: ['a table of numbers', 'a chart of bars', 'a list of names'] },
  { q: 'How do we share results as rows of boxes?', a: 'a table', o: ['a magnifier', 'a model', 'a torch'] },
  { q: 'To show counts for each group, we draw...', a: 'a bar chart', o: ['a key', 'a table of words', 'a drawing with no numbers'] },
  { q: 'We recorded classifying results. Which record fits?', a: 'a table of groups', o: ['a poem', 'a tune', 'a map of roads'] },
  { q: 'Which record helps an unknown thing get named?', a: 'a key', o: ['a bar chart', 'a clock', 'a ruler'] },
]

export function gY4RecordHow(rand: Rand): Question {
  const it = pick(rand, RECORD4)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const PREDICT = [
  { q: 'A plant measured 2 cm, 4 cm, 6 cm. What comes next?', a: '8 cm', o: ['0 cm', '1 cm', '5 cm'] },
  { q: 'The bell rang 1 time, 2 times, 3 times. What comes next?', a: '4 times', o: ['5 times', '0 times', '2 times'] },
  { q: 'Water measured 10, 20, 30 millilitres. What comes next?', a: '40 millilitres', o: ['35 millilitres', '50 millilitres', '25 millilitres'] },
  { q: 'The car went 3 m, 6 m, 9 m. What comes next?', a: '12 m', o: ['10 m', '15 m', '8 m'] },
  { q: 'Shadow length went 5 cm, 4 cm, 3 cm. What comes next?', a: '2 cm', o: ['6 cm', '4 cm', '1 cm'] },
  { q: 'The lamp grew brighter, then brighter still. What comes next?', a: 'brightest yet', o: ['as dim as before', 'no light at all', 'the same as first'] },
  { q: 'Sound grew louder, then louder. What comes next?', a: 'louder still', o: ['silent', 'the quietest yet', 'the same as first'] },
  { q: 'Ice melted a little, then a little more. What comes next?', a: 'more ice turns to water', o: ['more water turns to ice', 'nothing changes again', 'the ice grows back'] },
]

export function gY4Predict(rand: Rand): Question {
  const it = pick(rand, PREDICT)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const EVIDENCE = [
  { q: 'Which evidence shows sound needs a medium?', a: 'no sound travelled through the empty gap', o: ['the bell rang louder', 'the ruler was long', 'the room was warm'] },
  { q: 'Which evidence shows metals conduct?', a: 'the metal wire lit the lamp', o: ['the plastic wire did nothing', 'the table was brown', 'the clock ticked'] },
  { q: 'Why do we trust the plant result?', a: 'we saw the same result three times', o: ['we only tried once', 'we guessed the height', 'we wrote no notes'] },
  { q: 'Which evidence backs the evaporation claim?', a: 'the puddle shrank faster in the sun', o: ['the puddle stayed the same', 'the stone got wetter', 'the cloud grew thicker'] },
  { q: 'Which evidence shows the sound grew fainter?', a: 'the sound dropped as we walked away', o: ['the sound stayed the same', 'the bell broke', 'the room got colder'] },
  { q: 'Which evidence says the loop was complete?', a: 'the lamp lit up', o: ['the switch was painted', 'the wire was blue', 'the cell was new'] },
  { q: 'Both rulers showed 5 centimetres. What does that tell us?', a: 'the measurements agree', o: ['one ruler broke', 'the numbers are wrong', 'the plant grew'] },
  { q: 'Which evidence shows the surface slowed the car?', a: 'the car stopped soonest there', o: ['the car was red', 'the ramp was short', 'the clock ticked'] },
]

export function gY4Evidence(rand: Rand): Question {
  const it = pick(rand, EVIDENCE)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const IMPROVE4 = [
  { q: 'We measured once only. How do we improve?', a: 'repeat the test three times', o: ['stop after one go', 'throw the results away', 'never write anything down'] },
  { q: 'Our table had no headings. What now?', a: 'add labels and numbers', o: ['remove every label', 'draw no lines', 'hide the numbers'] },
  { q: 'We changed two things at once. Improve next time?', a: 'change one thing and keep the rest', o: ['change everything each time', 'skip the test', 'hide the results'] },
  { q: 'The reading was hard to see. What is the fix?', a: 'use a bigger scale and write clearly', o: ['guess instead', 'squint and stop', 'write in the dark'] },
  { q: 'Only one person did all the work. Change?', a: 'everyone takes a turn', o: ['one person does it all', 'no one writes notes', 'work with no turns'] },
  { q: 'We tested only one of each. How do we improve?', a: 'test every item in the set', o: ['test one and stop', 'only test the first', 'test nothing else'] },
  { q: 'Our conclusion went past the data. What now?', a: 'say only what the results show', o: ['add a wild guess', 'make up a new answer', 'delete the results'] },
  { q: 'The sound test was noisy. How do we improve it?', a: 'test one sound at a time', o: ['play every sound at once', 'close the book', 'shout over the sound'] },
]

export function gY4Improve(rand: Rand): Question {
  const it = pick(rand, IMPROVE4)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

/* ===================== Unit 2 · living things & habitats ===================== */

const GROUP_WAYS = [
  { q: 'How can we group these animals?', a: 'by the number of legs', o: ['by their favourite colour', 'by the day of the week', 'by their names'] },
  { q: 'How can we group these plants?', a: 'flowering or non-flowering', o: ['loud or quiet', 'fast or slow', 'hot or cold'] },
  { q: 'Which way groups living things by food?', a: 'what they eat', o: ['when they sleep', 'where chairs go', 'what colour paper is'] },
  { q: 'How can we group these insects?', a: 'by their body features', o: ['by the weather', 'by lunch time', 'by the page order'] },
  { q: 'What is a good way to sort these animals?', a: 'by their habitat', o: ['by the clock', 'by the page number', 'by shoe size'] },
  { q: 'How can we group these living things a second way?', a: 'by size', o: ['by the date', 'by the bell', 'by the page'] },
  { q: 'Which grouping uses a yes or no question?', a: 'a classification key', o: ['a bar chart', 'a clock face', 'a model'] },
  { q: 'How do scientists sort a wide set of living things?', a: 'group them in a variety of ways', o: ['leave them in one pile', 'only name them', 'count them twice'] },
]

export function gY4GroupWays(rand: Rand): Question {
  const it = pick(rand, GROUP_WAYS)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const GROUP_ODD = [
  { q: 'Odd one out: spider, insect, worm, snail', a: 'insect', o: ['spider', 'worm', 'snail'] },
  { q: 'Odd one out: fern, moss, grass, rose', a: 'moss', o: ['fern', 'grass', 'rose'] },
  { q: 'Odd one out: fish, bird, reptile, stone', a: 'stone', o: ['fish', 'bird', 'reptile'] },
  { q: 'Odd one out: mammal, bird, amphibian, table', a: 'table', o: ['mammal', 'bird', 'amphibian'] },
  { q: 'Odd one out: snail, slug, worm, apple', a: 'apple', o: ['snail', 'slug', 'worm'] },
  { q: 'Odd one out: flowering plant, fern, moss, spider', a: 'spider', o: ['flowering plant', 'fern', 'moss'] },
  { q: 'Odd one out: rabbit, fox, owl, cabbage', a: 'cabbage', o: ['rabbit', 'fox', 'owl'] },
  { q: 'Odd one out: bird, fish, reptile, cloud', a: 'cloud', o: ['bird', 'fish', 'reptile'] },
]

export function gY4GroupOdd(rand: Rand): Question {
  const it = pick(rand, GROUP_ODD)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const KEY_STEP = [
  { q: 'First key question for a snail and a bird?', a: 'Does it have a backbone?', o: ['Is it blue?', 'Can it fly at night?', 'Is it a plant?'] },
  { q: 'You meet a spider. What do you ask first?', a: 'How many legs does it have?', o: ['What colour is it?', 'Is it raining?', 'What day is it?'] },
  { q: 'First key question for grass and a fern?', a: 'Does it have flowers?', o: ['Can it walk?', 'Does it have legs?', 'Is it an animal?'] },
  { q: 'Key question to split a fish from a frog?', a: 'Does it live in water all the time?', o: ['Is it green?', 'Is it tall?', 'Does it wear a shell?'] },
  { q: 'First question to sort these insects?', a: 'Does it have six legs?', o: ['Is it sweet?', 'Can it read?', 'Is it Monday?'] },
  { q: 'You find a slug. What is the useful question?', a: 'Does it have a shell?', o: ['Is it heavy?', 'Is it sunny?', 'Is it white?'] },
  { q: 'To name an unknown animal, you use...', a: 'a classification key', o: ['a bar chart', 'a clock', 'a scale'] },
  { q: 'First question for a mammal and a bird?', a: 'Does it have fur or feathers?', o: ['Is it hungry?', 'Is it loud?', 'Is it short?'] },
]

export function gY4KeyStep(rand: Rand): Question {
  const it = pick(rand, KEY_STEP)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const KEY_NEXT = [
  { q: 'The animal has no backbone and six legs. What is it?', a: 'an insect', o: ['a fish', 'a bird', 'a fern'] },
  { q: 'It has a backbone, scales and lives in water. What is it?', a: 'a fish', o: ['a mammal', 'an insect', 'a moss'] },
  { q: 'No backbone, eight legs. What do we name it?', a: 'a spider', o: ['an insect', 'a reptile', 'a bird'] },
  { q: 'It has feathers and wings. What is it?', a: 'a bird', o: ['a reptile', 'a fish', 'a slug'] },
  { q: 'The plant has flowers. What group is it?', a: 'a flowering plant', o: ['a fern', 'a moss', 'an animal'] },
  { q: 'Backbone, warm blood, feeds milk. What is it?', a: 'a mammal', o: ['a bird', 'a fish', 'an insect'] },
  { q: 'No backbone, soft body, lives in a shell. What is it?', a: 'a snail', o: ['a spider', 'a frog', 'a fox'] },
  { q: 'It has gills and fins. What is it?', a: 'a fish', o: ['a mammal', 'a bird', 'a worm'] },
]

export function gY4KeyNext(rand: Rand): Question {
  const it = pick(rand, KEY_NEXT)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const VERTEBRATE = [
  { q: 'Which animal has a backbone?', a: 'a frog', o: ['a snail', 'a spider', 'a worm'] },
  { q: 'Which animal has NO backbone?', a: 'a slug', o: ['a fox', 'a bird', 'a fish'] },
  { q: 'Which one is a vertebrate?', a: 'a reptile', o: ['an insect', 'a spider', 'a slug'] },
  { q: 'Which one is an invertebrate?', a: 'a worm', o: ['a cow', 'an owl', 'a snake'] },
  { q: 'Which animal is grouped with mammals?', a: 'a whale', o: ['a frog', 'a crab', 'a bee'] },
  { q: 'Which group does a turtle belong to?', a: 'reptiles', o: ['insects', 'mosses', 'fungi'] },
  { q: 'Which of these is an amphibian?', a: 'a newt', o: ['a sparrow', 'a shark', 'a snail'] },
  { q: 'Which one lacks a backbone?', a: 'a spider', o: ['a lizard', 'a dog', 'a shark'] },
]

export function gY4Vertebrate(rand: Rand): Question {
  const it = pick(rand, VERTEBRATE)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const CLASS_PAIRS: { left: string; right: string }[] = [
  { left: 'frog', right: 'amphibian' },
  { left: 'spider', right: 'invertebrate' },
  { left: 'eagle', right: 'bird' },
  { left: 'snake', right: 'reptile' },
  { left: 'snail', right: 'invertebrate' },
  { left: 'salmon', right: 'fish' },
  { left: 'rabbit', right: 'mammal' },
  { left: 'moss', right: 'non-flowering plant' },
  { left: 'rose', right: 'flowering plant' },
  { left: 'worm', right: 'invertebrate' },
  { left: 'gecko', right: 'reptile' },
  { left: 'dolphin', right: 'mammal' },
]

export function gY4ClassMatch(rand: Rand): Question {
  return matchQ(rand, 'Match each living thing to its group',
    shuffle(rand, CLASS_PAIRS).slice(0, 4).map((p) => ({ ...p })))
}

const ENV_CHANGE = [
  { q: 'The pond dried up in a hot summer. What is at risk?', a: 'the frogs that lived there', o: ['the clouds above it', 'the wind', 'the hills nearby'] },
  { q: 'A cold snap hit the garden. What can be in danger?', a: 'the insects living there', o: ['the stones', 'the path', 'the fence'] },
  { q: 'The woodland was cut down. What changes for the birds?', a: 'their habitat is gone', o: ['their feathers change colour', 'they grow bigger', 'they learn new songs'] },
  { q: 'The river stopped flowing. What is put at risk?', a: 'the fish in the river', o: ['the rocks on the bank', 'the road above', 'the bridge paint'] },
  { q: 'Why can a changing environment be dangerous?', a: 'living things lose what they need', o: ['the weather gets written down', 'groups get bigger', 'keys get shorter'] },
  { q: 'A building site cleared the field. What happened?', a: 'the habitat was destroyed', o: ['the habitat grew', 'the plants moved in', 'the insects got more food'] },
  { q: 'The lake froze early. What must the ducks do?', a: 'move to open water', o: ['grow fur', 'sleep all year', 'turn into fish'] },
  { q: 'Less rain fell all summer. What is threatened?', a: 'the plants that need water', o: ['the clouds', 'the date', 'the shadows'] },
]

export function gY4EnvChange(rand: Rand): Question {
  const it = pick(rand, ENV_CHANGE)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const HUMAN_IMPACT = [
  { q: 'A garden pond was built for wildlife. Is this positive or negative?', a: 'positive', o: ['negative', 'the same', 'it is a secret'] },
  { q: 'Litter was dropped in the woods. Impact?', a: 'negative', o: ['positive', 'helpful', 'it does nothing'] },
  { q: 'A nature reserve was set up. Impact?', a: 'positive', o: ['negative', 'harmful', 'it changes nothing'] },
  { q: 'Trees were cut down for a car park. Impact?', a: 'negative', o: ['positive', 'useful', 'it helps the birds'] },
  { q: 'A park planned room for ponds and trees. Impact?', a: 'positive', o: ['negative', 'rough', 'it hurts the park'] },
  { q: 'More homes were built and litter followed. Impact?', a: 'negative', o: ['positive', 'safe', 'it feeds the birds'] },
  { q: 'Which action helps living things?', a: 'protecting a nature reserve', o: ['dropping litter', 'cutting the hedge', 'draining the pond'] },
  { q: 'Which action harms a habitat?', a: 'clearing a woodland', o: ['planting trees', 'building a pond', 'making a park'] },
]

export function gY4HumanImpact(rand: Rand): Question {
  const it = pick(rand, HUMAN_IMPACT)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

/* ===================== Unit 3 · digestive system ===================== */

const DIGEST_ORDER: { p: string; items: string[] }[] = [
  { p: 'Put the digestive journey in order', items: ['mouth', 'oesophagus', 'stomach', 'small intestine', 'large intestine'] },
  { p: 'Order the journey of a sandwich', items: ['chewed in the mouth', 'travels down the gullet', 'broken up in the stomach', 'nutrients taken in the gut'] },
  { p: 'Put these parts after the stomach', items: ['small intestine', 'large intestine'] },
  { p: 'Order the first steps of digestion', items: ['bite the food', 'chew with teeth', 'swallow', 'travel down the gullet'] },
  { p: 'Put the whole journey in order', items: ['mouth', 'gullet', 'stomach', 'intestines'] },
  { p: 'Order the path food takes', items: ['tongue and teeth', 'swallowed', 'stomach', 'intestines'] },
  { p: 'What happens to food first, next, then?', items: ['first: chewed', 'next: swallowed', 'then: broken up'] },
  { p: 'Order the parts food passes through', items: ['mouth', 'stomach', 'small intestine', 'large intestine'] },
]

export function gY4DigestOrder(rand: Rand): Question {
  const it = pick(rand, DIGEST_ORDER)
  return orderQ(it.p, [...it.items])
}

const DIGEST_JOB: { left: string; right: string }[] = [
  { left: 'mouth', right: 'chews food with teeth' },
  { left: 'tongue', right: 'moves food and helps swallow' },
  { left: 'teeth', right: 'bite and grind food' },
  { left: 'gullet', right: 'carries food down to the stomach' },
  { left: 'stomach', right: 'mixes and breaks up food' },
  { left: 'small intestine', right: 'takes in the goodness from food' },
  { left: 'large intestine', right: 'takes back water from food' },
  { left: 'saliva', right: 'wets food so it is easy to swallow' },
  { left: 'tongue', right: 'helps you taste food' },
  { left: 'teeth', right: 'tear and grind food' },
]

export function gY4DigestPartJob(rand: Rand): Question {
  return matchQ(rand, 'Match each digestive part to its job',
    shuffle(rand, DIGEST_JOB).slice(0, 4).map((p) => ({ ...p })))
}

const DIGEST_FN = [
  { q: 'Which part pushes food down to the stomach?', a: 'the gullet', o: ['the teeth', 'the tongue', 'the gut'] },
  { q: 'Where is food chewed?', a: 'in the mouth', o: ['in the stomach', 'in the gullet', 'in the intestines'] },
  { q: 'Which part takes in goodness from food?', a: 'the small intestine', o: ['the large intestine', 'the gullet', 'the teeth'] },
  { q: 'What does the stomach do?', a: 'breaks food up', o: ['chews the food', 'makes saliva', 'holds breath'] },
  { q: 'Which part is a simple tube from mouth to stomach?', a: 'the gullet', o: ['the tongue', 'the teeth', 'the lip'] },
  { q: 'Where does saliva help?', a: 'in the mouth', o: ['in the gullet', 'in the stomach', 'in the gut'] },
  { q: 'Which part works after the stomach?', a: 'the intestines', o: ['the teeth', 'the tongue', 'the lip'] },
  { q: 'What is the job of the teeth?', a: 'bite and grind food', o: ['swallow food whole', 'take in water', 'make air'] },
]

export function gY4DigestFunction(rand: Rand): Question {
  const it = pick(rand, DIGEST_FN)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const DIGEST_TF = [
  { s: 'Food is chewed in the mouth.', a: true },
  { s: 'The gullet carries food to the stomach.', a: true },
  { s: 'The stomach takes in goodness from food.', a: false },
  { s: 'Teeth bite and grind food.', a: true },
  { s: 'The large intestine takes back water from food.', a: true },
  { s: 'Saliva wets food so it is easy to swallow.', a: true },
  { s: 'Food travels up from the stomach to the mouth.', a: false },
  { s: 'The small intestine takes in the goodness from food.', a: true },
  { s: 'The tongue helps you taste food.', a: true },
  { s: 'Digestion happens only in the teeth.', a: false },
]

export function gY4DigestTF(rand: Rand): Question {
  const it = pick(rand, DIGEST_TF)
  return tfQ('True or false?', it.s, it.a)
}

/* ===================== Unit 4 · teeth ===================== */

const TEETH_TYPE = [
  { q: 'Which teeth are sharp and pointed at the front?', a: 'canines', o: ['molars', 'incisors', 'gums'] },
  { q: 'Which teeth bite pieces from food?', a: 'incisors', o: ['molars', 'canines', 'roots'] },
  { q: 'Which teeth grind food at the back?', a: 'molars', o: ['incisors', 'canines', 'tongue'] },
  { q: 'Which teeth sit between canines and molars?', a: 'premolars', o: ['incisors', 'gums', 'roots'] },
  { q: 'Humans have how many types of teeth?', a: 'four types', o: ['two types', 'one type', 'six types'] },
  { q: 'Which teeth do you use to smile wide?', a: 'incisors', o: ['molars', 'premolars', 'canines'] },
  { q: 'Which teeth do the heavy grinding?', a: 'molars', o: ['incisors', 'canines', 'tongue'] },
  { q: 'Pointed teeth for tearing are called...', a: 'canines', o: ['incisors', 'molars', 'gums'] },
]

export function gY4TeethType(rand: Rand): Question {
  const it = pick(rand, TEETH_TYPE)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const TEETH_JOB: { left: string; right: string }[] = [
  { left: 'incisors', right: 'bite pieces from food' },
  { left: 'canines', right: 'tear food apart' },
  { left: 'premolars', right: 'cut and crush food' },
  { left: 'molars', right: 'grind food at the back' },
  { left: 'tongue', right: 'moves food around the mouth' },
  { left: 'saliva', right: 'wets food for swallowing' },
  { left: 'incisors', right: 'cut through food' },
  { left: 'molars', right: 'crush the food small' },
  { left: 'canines', right: 'sharp and pointed teeth' },
  { left: 'gums', right: 'hold the teeth in place' },
]

export function gY4TeethJob(rand: Rand): Question {
  return matchQ(rand, 'Match each tooth type to its job',
    shuffle(rand, TEETH_JOB).slice(0, 4).map((p) => ({ ...p })))
}

const TEETH_COMPARE = [
  { q: 'Which animal has sharp pointed teeth for meat?', a: 'a fox', o: ['a cow', 'a sheep', 'a horse'] },
  { q: 'Which animal has flat teeth for grinding grass?', a: 'a cow', o: ['a fox', 'a dog', 'a cat'] },
  { q: 'A herbivore has teeth made to...', a: 'grind plants', o: ['tear meat', 'crush bones', 'catch flies'] },
  { q: 'A carnivore has teeth made to...', a: 'tear meat', o: ['grind grass', 'crush seeds', 'suck nectar'] },
  { q: 'Which animal has flat molars like ours for plants?', a: 'a horse', o: ['a wolf', 'a lion', 'a shark'] },
  { q: 'Which animal needs sharp canines the most?', a: 'a dog', o: ['a rabbit', 'a cow', 'a goat'] },
  { q: 'Rabbit teeth are best suited to...', a: 'nibbling plants', o: ['tearing meat', 'cracking bones', 'eating fish'] },
  { q: 'Why do lions have long pointed teeth?', a: 'to catch and tear prey', o: ['to grind grass', 'to crack seeds', 'to sip water'] },
]

export function gY4TeethCompare(rand: Rand): Question {
  const it = pick(rand, TEETH_COMPARE)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const TEETH_CARE = [
  { q: 'What keeps teeth clean and free of plaque?', a: 'brushing them each day', o: ['eating sweets', 'skipping breakfast', 'staying up late'] },
  { q: 'What damages teeth over time?', a: 'too much sugar', o: ['brushing twice a day', 'drinking water', 'eating vegetables'] },
  { q: 'Who checks your teeth are healthy?', a: 'a dentist', o: ['a baker', 'a driver', 'a pilot'] },
  { q: 'When should you brush?', a: 'morning and night', o: ['once a month', 'only on Sundays', 'never'] },
  { q: 'What helps wash food off teeth?', a: 'drinking water', o: ['drinking juice all day', 'eating crisps', 'talking loudly'] },
  { q: 'Sweets left on teeth cause...', a: 'decay', o: ['growth', 'cleaner teeth', 'stronger gums'] },
  { q: 'Which habit protects your teeth?', a: 'brushing after food', o: ['sharing a brush', 'chewing pens', 'skipping water'] },
  { q: 'Plaque is...', a: 'a film that harms teeth', o: ['a tooth type', 'a kind of gum', 'food for bones'] },
]

export function gY4TeethCare(rand: Rand): Question {
  const it = pick(rand, TEETH_CARE)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

/* ===================== Unit 5 · food chains ===================== */

const CHAIN_ROLE = [
  { q: 'In grass, rabbit, fox - what is the grass?', a: 'the producer', o: ['the predator', 'the prey', 'the hunter'] },
  { q: 'In grass, rabbit, fox - what is the fox?', a: 'the predator', o: ['the producer', 'the prey', 'the grass'] },
  { q: 'In grass, rabbit, fox - what is the rabbit?', a: 'the prey', o: ['the producer', 'the predator', 'the sun'] },
  { q: 'Which part of a chain makes its own food?', a: 'the producer', o: ['the predator', 'the prey', 'the hunter'] },
  { q: 'An owl that hunts mice is the...', a: 'predator', o: ['producer', 'prey', 'plant'] },
  { q: 'The mouse hunted by the owl is the...', a: 'prey', o: ['producer', 'hunter', 'plant'] },
  { q: 'Which role does a plant always play?', a: 'producer', o: ['predator', 'prey', 'hunter'] },
  { q: 'A snake that eats frogs acts as the...', a: 'predator', o: ['producer', 'prey', 'grass'] },
]

export function gY4ChainRole(rand: Rand): Question {
  const it = pick(rand, CHAIN_ROLE)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const CHAIN_ORDER: { p: string; items: string[] }[] = [
  { p: 'Build the food chain in order', items: ['grass', 'rabbit', 'fox'] },
  { p: 'Order this chain from the start', items: ['sunlit plant', 'caterpillar', 'bird', 'hawk'] },
  { p: 'Put the chain in feeding order', items: ['leaves', 'slug', 'thrush', 'cat'] },
  { p: 'Order the pond chain', items: ['pond plant', 'water snail', 'fish', 'heron'] },
  { p: 'Build the chain the arrows point along', items: ['grass', 'locust', 'frog', 'snake'] },
  { p: 'Order these links from producer to hunter', items: ['grass', 'rabbit', 'fox'] },
  { p: 'Put the meadow chain in order', items: ['seeds', 'mouse', 'owl'] },
  { p: 'Order the feeding chain', items: ['leaf', 'caterpillar', 'bird'] },
]

export function gY4ChainBuild(rand: Rand): Question {
  const it = pick(rand, CHAIN_ORDER)
  return orderQ(it.p, [...it.items])
}

const CHAIN_NEXT = [
  { q: 'Grass, rabbit, fox. What does the rabbit eat?', a: 'grass', o: ['fox', 'hawk', 'mice'] },
  { q: 'Seeds, mouse, owl. What eats the mouse?', a: 'the owl', o: ['the seeds', 'the grass', 'the hawk'] },
  { q: 'Leaves, slug, thrush. What does the thrush eat?', a: 'the slug', o: ['the leaves', 'the grass', 'the thrush'] },
  { q: 'Grass, locust, frog. What is eaten by the frog?', a: 'the locust', o: ['the grass', 'the snake', 'the hawk'] },
  { q: 'Which arrow is correct: grass, rabbit, fox?', a: 'grass points to rabbit', o: ['rabbit points to grass', 'fox points to rabbit', 'fox points to grass'] },
  { q: 'Pond plant, snail, fish. What does the snail eat?', a: 'the pond plant', o: ['the fish', 'the heron', 'the water'] },
  { q: 'Sunlit plant, caterpillar, bird. What eats the plant?', a: 'the caterpillar', o: ['the bird', 'the hawk', 'the snake'] },
  { q: 'In leaves, slug, thrush - what comes first?', a: 'the leaves', o: ['the slug', 'the thrush', 'the fox'] },
]

export function gY4ChainNext(rand: Rand): Question {
  const it = pick(rand, CHAIN_NEXT)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const CHAIN_READ = [
  { q: 'Grass, rabbit, fox. Who is the predator?', a: 'the fox', o: ['the grass', 'the rabbit', 'the sun'] },
  { q: 'Seeds, mouse, owl. What is the producer?', a: 'the seeds', o: ['the mouse', 'the owl', 'the grass'] },
  { q: 'A chain starts with a producer. What always comes first?', a: 'a plant', o: ['an animal', 'a predator', 'a hunter'] },
  { q: 'In the chain leaf, caterpillar, bird - the bird is the...', a: 'predator', o: ['producer', 'prey', 'plant'] },
  { q: 'What does the arrow in a food chain show?', a: 'who eats who', o: ['how tall it grows', 'where it sleeps', 'when it rains'] },
  { q: 'Grass, rabbit, fox. Which is eaten?', a: 'the rabbit', o: ['the fox', 'the grass', 'the sun'] },
  { q: 'Which reading is correct for pond plant, snail, fish?', a: 'the snail eats the plant', o: ['the plant eats the fish', 'the fish eats the plant', 'the snail eats the fish'] },
  { q: 'The chain shows energy passing. Where does it start?', a: 'with the producer', o: ['with the predator', 'with the prey', 'with the hunter'] },
]

export function gY4ChainRead(rand: Rand): Question {
  const it = pick(rand, CHAIN_READ)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const CHAIN_TF = [
  { s: 'A producer comes first in a food chain.', a: true },
  { s: 'The predator is eaten by the prey.', a: false },
  { s: 'Energy passes along the chain from plant to animal.', a: true },
  { s: 'A food chain always starts with an animal.', a: false },
  { s: 'The rabbit is the prey in grass, rabbit, fox.', a: true },
  { s: 'Prey is the animal that gets hunted.', a: true },
  { s: 'A fox hunts a rabbit, so the fox is the prey.', a: false },
  { s: 'Grass is the producer in a meadow chain.', a: true },
]

export function gY4ChainTF(rand: Rand): Question {
  const it = pick(rand, CHAIN_TF)
  return tfQ('True or false?', it.s, it.a)
}

/* ===================== Unit 6 · states of matter ===================== */

const STATE_GROUP = [
  { q: 'Which of these is a liquid?', a: 'water', o: ['ice', 'air', 'steam'] },
  { q: 'Which of these is a gas?', a: 'air', o: ['a rock', 'juice', 'ice'] },
  { q: 'Which of these is a solid?', a: 'ice', o: ['milk', 'air', 'steam'] },
  { q: 'Which state keeps its own shape?', a: 'solid', o: ['liquid', 'gas', 'steam'] },
  { q: 'Which state forms a pool and not a pile?', a: 'liquid', o: ['solid', 'gas', 'ice'] },
  { q: 'Which state escapes from an unsealed container?', a: 'gas', o: ['solid', 'liquid', 'ice'] },
  { q: 'Steam is water as a...', a: 'gas', o: ['solid', 'liquid', 'pool'] },
  { q: 'Which of these flows and pours?', a: 'a liquid', o: ['a solid', 'a gas', 'a shape'] },
]

export function gY4StateGroup(rand: Rand): Question {
  const it = pick(rand, STATE_GROUP)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const STATE_PROP = [
  { q: 'A solid...', a: 'holds its shape', o: ['escapes from a cup', 'forms a pool', 'fades away'] },
  { q: 'A liquid...', a: 'forms a pool, not a pile', o: ['holds a fixed shape', 'escapes all lids', 'never moves'] },
  { q: 'A gas...', a: 'escapes from an unsealed container', o: ['keeps a cube shape', 'stays in a pool', 'never fills a room'] },
  { q: 'What do we notice about ice?', a: 'it is a solid with a fixed shape', o: ['it pours like juice', 'it fills the room', 'you cannot see it'] },
  { q: 'Juice in a jug is a...', a: 'liquid', o: ['gas', 'solid', 'shape'] },
  { q: 'The air around us is a...', a: 'gas', o: ['liquid', 'solid', 'pool'] },
  { q: 'A brick is a...', a: 'solid', o: ['liquid', 'gas', 'pool'] },
  { q: 'Which state takes the shape of its container?', a: 'liquid', o: ['solid', 'gas', 'ice'] },
]

export function gY4StateProperty(rand: Rand): Question {
  const it = pick(rand, STATE_PROP)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const STATE_CHANGE = [
  { q: 'What happens to ice when it is heated?', a: 'it melts into water', o: ['it freezes harder', 'it dries away', 'it turns to air'] },
  { q: 'What happens to water when it boils?', a: 'it turns to steam', o: ['it turns to ice', 'it turns to stone', 'it stays the same'] },
  { q: 'What happens to water when it is cooled enough?', a: 'it freezes into ice', o: ['it boils away', 'it turns to steam', 'it dries up'] },
  { q: 'Butter left in a warm pan...', a: 'melts into a liquid', o: ['freezes solid', 'turns to air', 'stays hard'] },
  { q: 'Steam cooled down becomes...', a: 'water droplets', o: ['ice cubes', 'air', 'nothing'] },
  { q: 'Chocolate in a warm hand...', a: 'melts', o: ['freezes', 'boils', 'stays the same'] },
  { q: 'What change does heating cause?', a: 'a change of state', o: ['a new colour', 'a louder sound', 'no change at all'] },
  { q: 'A puddle on a cold night can...', a: 'freeze into ice', o: ['boil away', 'turn to steam', 'grow taller'] },
]

export function gY4StateChange(rand: Rand): Question {
  const it = pick(rand, STATE_CHANGE)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const STATE_TEMP = [
  { q: 'We measure state changes in...', a: 'degrees Celsius', o: ['centimetres', 'litres', 'seconds'] },
  { q: 'Which tool reads the temperature?', a: 'a thermometer', o: ['a ruler', 'a clock', 'a key'] },
  { q: 'Water freezes at how many degrees?', a: '0 degrees', o: ['10 degrees', '100 degrees', '50 degrees'] },
  { q: 'Water boils at how many degrees?', a: '100 degrees', o: ['0 degrees', '10 degrees', '50 degrees'] },
  { q: 'The temperature rises when a substance is...', a: 'heated', o: ['cooled', 'frozen', 'buried'] },
  { q: 'Melting happens when a solid is...', a: 'warmed up', o: ['cooled down', 'left in the dark', 'kept still'] },
  { q: 'Which pair shows temperature going down?', a: 'cooling and freezing', o: ['heating and boiling', 'melting and steaming', 'drying and burning'] },
  { q: 'To research the temperature of a change we use...', a: 'a thermometer in degrees', o: ['a ruler in centimetres', 'a key in groups', 'a clock in seconds'] },
]

export function gY4StateTemp(rand: Rand): Question {
  const it = pick(rand, STATE_TEMP)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const EVAPORATE = [
  { q: 'Why did the puddle disappear?', a: 'the water evaporated', o: ['the water froze', 'the water sank into stone', 'the water grew'] },
  { q: 'Wet washing dries because...', a: 'water evaporates', o: ['water freezes', 'water condenses', 'water pools'] },
  { q: 'What makes evaporation faster?', a: 'a warmer temperature', o: ['a colder day', 'a dark room', 'a sealed tub'] },
  { q: 'Where does the water go when it evaporates?', a: 'into the air as a gas', o: ['into the soil', 'into a pool', 'into a solid'] },
  { q: 'A puddle shrinks on a sunny day. What is happening?', a: 'evaporation', o: ['condensation', 'freezing', 'melting'] },
  { q: 'Why does a wet road dry after rain?', a: 'the water evaporates', o: ['the water turns to ice', 'the water sinks away at once', 'the water grows warmer'] },
  { q: 'Evaporation happens faster when it is...', a: 'warm and windy', o: ['cold and still', 'dark and sealed', 'wet and damp'] },
  { q: 'Snow left in the sun...', a: 'melts then evaporates', o: ['freezes harder', 'turns to stone', 'stays the same'] },
]

export function gY4Evaporate(rand: Rand): Question {
  const it = pick(rand, EVAPORATE)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const CONDENSE = [
  { q: 'Droplets form on a cold window. What is this?', a: 'condensation', o: ['evaporation', 'melting', 'freezing'] },
  { q: 'Clouds form when water vapour...', a: 'cools and condenses', o: ['boils away', 'freezes hard', 'escapes forever'] },
  { q: 'Steam on a cold mirror turns into...', a: 'tiny water droplets', o: ['ice', 'air', 'nothing at all'] },
  { q: 'What does cooling water vapour cause?', a: 'condensation', o: ['evaporation', 'boiling', 'drying'] },
  { q: 'Why do droplets sit on a cold drink glass?', a: 'water in the air condenses', o: ['the glass leaks', 'the water boils', 'ice forms inside'] },
  { q: 'Morning dew forms by...', a: 'condensation', o: ['evaporation', 'melting', 'grinding'] },
  { q: 'When does condensation happen?', a: 'when vapour cools down', o: ['when water boils', 'when ice melts', 'when it gets hotter'] },
  { q: 'Clouds are made of...', a: 'tiny condensed water droplets', o: ['dry air', 'steam from the sea', 'smoke only'] },
]

export function gY4Condense(rand: Rand): Question {
  const it = pick(rand, CONDENSE)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const WATER_CYCLE: { p: string; items: string[] }[] = [
  { p: 'Order the water cycle', items: ['evaporates', 'rises as vapour', 'cools and condenses', 'falls as rain'] },
  { p: 'Put the cycle steps in order', items: ['puddle warms', 'water evaporates', 'cloud forms', 'rain falls'] },
  { p: 'Order water from ground to cloud', items: ['water in the river', 'evaporates', 'condenses into cloud', 'rain'] },
  { p: 'Complete the water cycle order', items: ['heat from the sun', 'evaporation', 'condensation', 'rain'] },
  { p: 'Order the steps a raindrop takes', items: ['falls as rain', 'flows to the river', 'evaporates', 'forms a cloud'] },
  { p: 'Put the cycle in the right order', items: ['evaporation', 'condensation', 'rain'] },
  { p: 'Order the puddle story', items: ['water pools', 'sun warms it', 'it evaporates', 'vapour cools', 'rain falls'] },
  { p: 'Order the journey of water to a cloud', items: ['liquid water', 'evaporates', 'vapour rises', 'condenses'] },
]

export function gY4WaterCycle(rand: Rand): Question {
  const it = pick(rand, WATER_CYCLE)
  return orderQ(it.p, [...it.items])
}

/* ===================== Unit 7 · sound ===================== */

const VIBRATE = [
  { q: 'What makes the sound of a drum?', a: 'the skin vibrates', o: ['the paint dries', 'the wood freezes', 'the light reflects'] },
  { q: 'An elastic band twangs because it...', a: 'vibrates', o: ['melts', 'evaporates', 'conducts'] },
  { q: 'What does a bell do when it rings?', a: 'it vibrates', o: ['it melts', 'it freezes', 'it grows'] },
  { q: 'A ruler buzzing on a desk is...', a: 'vibrating', o: ['melting', 'freezing', 'drying'] },
  { q: 'All sounds are made by...', a: 'something vibrating', o: ['something melting', 'something freezing', 'something shining'] },
  { q: 'What happens inside a drum when you hit it?', a: 'the skin shakes and vibrates', o: ['the skin turns to liquid', 'the skin evaporates', 'the skin grows colder'] },
  { q: 'A guitar string makes sound when it...', a: 'vibrates', o: ['dries out', 'cools down', 'stays still'] },
  { q: 'Your voice comes from vibrations in your...', a: 'throat', o: ['knee', 'ankle', 'elbow'] },
]

export function gY4Vibrate(rand: Rand): Question {
  const it = pick(rand, VIBRATE)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const SOUND_TF = [
  { s: 'Sounds are made by something vibrating.', a: true },
  { s: 'Sound can travel through an empty gap with no medium.', a: false },
  { s: 'Vibrations travel through a medium to the ear.', a: true },
  { s: 'A sound gets fainter as you move away.', a: true },
  { s: 'A higher pitch means weaker vibrations.', a: false },
  { s: 'A louder sound means stronger vibrations.', a: true },
  { s: 'Ice melting is how a drum makes sound.', a: false },
  { s: 'You hear sound when vibrations reach your ear.', a: true },
]

export function gY4SoundTF(rand: Rand): Question {
  const it = pick(rand, SOUND_TF)
  return tfQ('True or false?', it.s, it.a)
}

const TRAVEL = [
  { q: 'How does sound reach your ear?', a: 'vibrations travel through a medium', o: ['light bounces off the ear', 'water freezes by the ear', 'the air melts'] },
  { q: 'Sound travels through...', a: 'air, solids and liquids', o: ['only ice', 'only light', 'a vacuum with nothing'] },
  { q: 'Between the drum and your ear is...', a: 'a medium to carry vibrations', o: ['a frozen layer', 'an empty paint pot', 'a beam of light'] },
  { q: 'Why can you hear a bell across a room?', a: 'vibrations travel through the air', o: ['the bell moves to you', 'light carries sound', 'the air freezes'] },
  { q: 'What carries the vibration from the desk to you?', a: 'the air and the desk', o: ['the light in the room', 'the colour of the desk', 'the cold air'] },
  { q: 'Sound cannot travel through...', a: 'a gap with no medium', o: ['air', 'water', 'a metal bar'] },
  { q: 'You hear thunder because vibrations travel...', a: 'through the air to your ear', o: ['through light only', 'through the ground only', 'they do not travel'] },
  { q: 'The medium that carries sound best here is...', a: 'the air in the room', o: ['the picture on the wall', 'the colour of the wall', 'the clock face'] },
]

export function gY4Travel(rand: Rand): Question {
  const it = pick(rand, TRAVEL)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const PITCH = [
  { q: 'A thick tight band makes a...', a: 'low pitch', o: ['high pitch', 'loud volume', 'faint light'] },
  { q: 'A short thin string makes a...', a: 'high pitch', o: ['low pitch', 'quiet sound', 'warm heat'] },
  { q: 'Which makes the highest pitch?', a: 'a short tight string', o: ['a long loose string', 'a thick band', 'a big drum'] },
  { q: 'Bigger objects usually make a...', a: 'lower pitch', o: ['higher pitch', 'louder light', 'faster light'] },
  { q: 'Tighten a string and the pitch becomes...', a: 'higher', o: ['lower', 'louder only', 'fainter only'] },
  { q: 'A loose thick band gives a...', a: 'low pitch', o: ['high pitch', 'bright light', 'hot heat'] },
  { q: 'Small bells ring at a...', a: 'high pitch', o: ['low pitch', 'warm pitch', 'dark pitch'] },
  { q: 'Pitch is about how...', a: 'high or low the sound is', o: ['loud or quiet it is', 'far it travels', 'warm the air is'] },
]

export function gY4Pitch(rand: Rand): Question {
  const it = pick(rand, PITCH)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const VOLUME = [
  { q: 'A sound is louder when the vibrations are...', a: 'stronger', o: ['weaker', 'slower only', 'lower'] },
  { q: 'Volume means how...', a: 'loud or quiet a sound is', o: ['high or low it is', 'warm the air is', 'far the light goes'] },
  { q: 'Bang the drum harder and it gets...', a: 'louder', o: ['lower', 'quieter', 'warmer'] },
  { q: 'Weak vibrations make a...', a: 'quiet sound', o: ['loud sound', 'high pitch only', 'bright light'] },
  { q: 'Why is one radio louder than another?', a: 'its vibrations are stronger', o: ['its colour is different', 'it is colder', 'it is shorter'] },
  { q: 'The volume rises when you...', a: 'shake something harder', o: ['shake it more gently', 'paint it red', 'cool it down'] },
  { q: 'A whisper has vibrations that are...', a: 'weak', o: ['strong', 'frozen', 'bright'] },
  { q: 'Which word describes a shouting voice?', a: 'loud', o: ['faint', 'low', 'cold'] },
]

export function gY4Volume(rand: Rand): Question {
  const it = pick(rand, VOLUME)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const FAINTER = [
  { q: 'Walk away from a bell. The sound becomes...', a: 'fainter', o: ['louder', 'higher', 'warmer'] },
  { q: 'Sounds get fainter as the ... grows.', a: 'distance from the source', o: ['heat of the room', 'colour of the bell', 'weight of the air'] },
  { q: 'Why can you barely hear a friend far away?', a: 'the sound got fainter with distance', o: ['the sound froze', 'the sound turned to light', 'the sound grew louder'] },
  { q: 'Far from the speaker, the volume is...', a: 'lower', o: ['higher', 'the loudest', 'the same always'] },
  { q: 'As you move away, a sound...', a: 'gets fainter', o: ['gets stronger', 'stays the same loudness', 'turns into light'] },
  { q: 'Which is true about distance and sound?', a: 'farther away means fainter sound', o: ['farther away means louder sound', 'distance never matters', 'sound fades after one step'] },
  { q: 'A clock in the next room sounds...', a: 'fainter than close by', o: ['louder than close by', 'the same always', 'higher always'] },
  { q: 'Near the source the sound is...', a: 'at its loudest', o: ['at its faintest', 'always silent', 'lower in pitch only'] },
]

export function gY4Fainter(rand: Rand): Question {
  const it = pick(rand, FAINTER)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

/* ===================== Unit 8 · electricity ===================== */

const APPLIANCE = [
  { q: 'Which appliance runs on electricity?', a: 'a torch', o: ['a stone', 'a feather', 'a stick'] },
  { q: 'Which of these needs electricity to work?', a: 'a radio', o: ['a bucket', 'a spoon', 'a brick'] },
  { q: 'A fridge runs on...', a: 'electricity', o: ['wind', 'sound', 'light alone'] },
  { q: 'Which one is NOT an electrical appliance?', a: 'a wooden spoon', o: ['a kettle', 'a television', 'a computer'] },
  { q: 'A hairdryer is powered by...', a: 'electricity', o: ['water', 'sound', 'ice'] },
  { q: 'Which appliance uses a motor and power?', a: 'a fan', o: ['a plate', 'a rug', 'a mug'] },
  { q: 'What do common appliances need to run?', a: 'a supply of electricity', o: ['a supply of paint', 'a supply of ice', 'a supply of sand'] },
  { q: 'Which of these plugs into a socket?', a: 'a kettle', o: ['a cushion', 'a pebble', 'a leaf'] },
]

export function gY4Appliance(rand: Rand): Question {
  const it = pick(rand, APPLIANCE)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const CIRCUIT_ORDER: { p: string; items: string[] }[] = [
{ p: 'Put the simple circuit parts in order', items: ['cell', 'wire', 'bulb'] },
{ p: 'Order the parts around the loop', items: ['cell', 'wire', 'lamp', 'switch'] },
{ p: 'Build the circuit from the battery out', items: ['battery', 'wire', 'bulb'] },
{ p: 'Order the path of the current', items: ['cells', 'wires', 'bulb'] },
{ p: 'Put the buzzer circuit in order', items: ['cell', 'wire', 'buzzer'] },
{ p: 'Order the parts a switch sits between', items: ['cell', 'wire', 'switch', 'bulb'] },
{ p: 'Assemble the lamp loop', items: ['cells', 'wires', 'lamp', 'switch'] },
{ p: 'Order the series circuit parts', items: ['cell', 'wire', 'bulb', 'switch'] },
]

export function gY4CircuitParts(rand: Rand): Question {
  const it = pick(rand, CIRCUIT_ORDER)
  return orderQ(it.p, [...it.items])
}

const CIRCUIT_TF = [
  { s: 'A lamp lights only in a complete loop.', a: true },
  { s: 'A switch opens and closes a circuit.', a: true },
  { s: 'Metals are good conductors.', a: true },
  { s: 'Plastic is a good conductor.', a: false },
  { s: 'Cells, wires and bulbs are basic circuit parts.', a: true },
  { s: 'A broken loop still lights the lamp.', a: false },
  { s: 'A buzzer can work in a simple series circuit.', a: true },
  { s: 'A switch that is open lets the lamp light.', a: false },
]

export function gY4CircuitTF(rand: Rand): Question {
  const it = pick(rand, CIRCUIT_TF)
  return tfQ('True or false?', it.s, it.a)
}

const CIRCUIT_LOOP = [
  { q: 'The wire loop is complete. What happens to the lamp?', a: 'it lights', o: ['it stays dark', 'it melts', 'it turns to sound'] },
  { q: 'One wire is disconnected. The lamp...', a: 'does not light', o: ['lights up', 'gets brighter', 'rings like a bell'] },
  { q: 'The switch is closed. What happens?', a: 'the lamp lights', o: ['the lamp stays dark', 'the cell dies at once', 'the wire melts'] },
  { q: 'We open the switch. The lamp...', a: 'goes out', o: ['stays lit', 'gets brighter', 'turns into a buzzer'] },
  { q: 'Is the lamp part of a complete loop with a battery?', a: 'yes, so it can light', o: ['no, so it stays dark', 'it depends on colour', 'only at night'] },
  { q: 'The loop has a gap of air. The lamp...', a: 'stays dark', o: ['lights', 'buzzes', 'spins'] },
  { q: 'Add another cell to the loop. The lamp gets...', a: 'brighter', o: ['dimmer', 'the same always', 'colder'] },
  { q: 'What must a lamp be part of to light?', a: 'a complete loop with a battery', o: ['a painting', 'a loose wire', 'an open switch'] },
]

export function gY4CircuitLoop(rand: Rand): Question {
  const it = pick(rand, CIRCUIT_LOOP)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const CONDUCTOR = [
  { q: 'Which material is a conductor?', a: 'metal', o: ['plastic', 'wood', 'glass'] },
  { q: 'Which material is an insulator?', a: 'plastic', o: ['copper', 'iron', 'steel'] },
  { q: 'Which lets current flow across the gap?', a: 'a metal wire', o: ['a plastic strip', 'a wooden stick', 'a glass rod'] },
  { q: 'Which is a good conductor of electricity?', a: 'iron', o: ['rubber', 'plastic', 'paper'] },
  { q: 'Which is used to cover wires for safety?', a: 'plastic', o: ['copper', 'glass', 'steel'] },
  { q: 'Metals tend to be...', a: 'conductors', o: ['insulators', 'magnets only', 'lights'] },
  { q: 'Which pair is conductor then insulator?', a: 'metal, plastic', o: ['plastic, metal', 'wood, iron', 'glass, copper'] },
  { q: 'Which one will NOT carry current across a gap?', a: 'a wooden rod', o: ['a metal clip', 'a steel pin', 'a copper wire'] },
]

export function gY4Conductor(rand: Rand): Question {
  const it = pick(rand, CONDUCTOR)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const CONDUCTOR_TF = [
  { s: 'Metals are good conductors of electricity.', a: true },
  { s: 'Plastic can carry current across a gap.', a: false },
  { s: 'An insulator stops current flowing through it.', a: true },
  { s: 'A metal clip completes the circuit across a gap.', a: true },
  { s: 'Wood is one of the best conductors.', a: false },
  { s: 'Wire covers are made of plastic for safety.', a: true },
  { s: 'Glass and rubber are insulators.', a: true },
  { s: 'Current flows the same through plastic as metal.', a: false },
]

export function gY4ConductorTF(rand: Rand): Question {
  const it = pick(rand, CONDUCTOR_TF)
  return tfQ('True or false?', it.s, it.a)
}
