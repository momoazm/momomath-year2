/** PLAN 169e — Year-3 science generators. Built directly on the statutory
 *  DfE Year-3 programme of study (see src/content/syllabus/y3/science.ts for
 *  the extracted source): working-scientifically enquiries, plant parts and
 *  their functions, flowers and life cycles, animal nutrition, skeletons and
 *  muscles, rocks and soils, light, and forces and magnets.
 *
 *  Vocabulary stays inside src/content/syllabus/y3/science.ts: bank-tier
 *  words (mcq choices, match sides, order items) must pass the year-3
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

/** Real answerable Year-3 science questions (mcq answers, bank tier). */
const QUESTIONS = [
  'Which parts of a plant take in water?',
  'What makes a shadow change size?',
  'Why does a magnet pick up a paper clip?',
  'How do seeds travel to new places?',
  'What happens to light in a dark room?',
  'Which surface makes a toy car go farthest?',
  'How does water get from soil to flower?',
  'What holds your bones in place as you move?',
]

/** Statements that are NOT science questions (mcq distractors). */
const NOT_QUESTIONS = [
  'The cat slept on the sofa.', 'Lunch was rice and chicken.',
  'I scored two goals in the match.', 'The bus was late again.',
  'Red is a nice name.', 'Ice cream is nice.',
]

export function gY3ScQuestion(rand: Rand): Question {
  const answer = pick(rand, QUESTIONS)
  return mcqE(rand, 'Which of these is a real science question?', answer,
    pickOthers(rand, NOT_QUESTIONS, answer, 3))
}

const FINDINGS = [
  'We predicted the car would go farthest on ice, and it was.',
  'The plant by the window grew the tallest.',
  'Shadows were longest when the light was low.',
  'The magnet picked up the steel clip, not the wood.',
  'Seeds in the warm tray sprouted first.',
  'The rough surface made the car stop soonest.',
]

export function gY3ScSpeak(rand: Rand): Question {
  return speakQ('Report your finding out loud', pick(rand, FINDINGS),
    { hint: 'Speak slowly. Say what you found out.' })
}

const FAIR_TESTS = [
  { q: 'How do we find out which ramp sends the car farthest?', a: 'roll the same car down both ramps', o: ['use a heavy car then a light one', 'push one car with your hand', 'count the colours on the cars'] },
  { q: 'Which is a fair test for two cloths?', a: 'pour the same water on each', o: ['pour a bucket on one and a drop on the other', 'only test the blue cloth', 'hold them both up once'] },
  { q: 'We test two plants. What stays the same for each one?', a: 'the water, light and pot for each plant', o: ['nothing stays the same', 'only one plant gets water', 'the plants swap places each day'] },
  { q: 'How can we test which ball bounces highest?', a: 'drop both balls from the same height', o: ['throw one high and one low', 'bounce one ball only', 'count the letters'] },
  { q: 'What makes an enquiry a fair test?', a: 'change one thing and keep the rest the same', o: ['change everything at once', 'change nothing at all', 'hide the results'] },
  { q: 'We test two sponges. What do we keep the same?', a: 'the amount of water we pour', o: ['the colour of the sponges', 'the time of lunch', 'the number of chairs'] },
  { q: 'How do we find out which surface is smoothest?', a: 'slide the same toy car over each surface', o: ['use different toys on each', 'close your eyes the whole time', 'guess before you start'] },
  { q: 'Which enquiry keeps every part the same except one?', a: 'a fair test', o: ['a story', 'a guess', 'a song'] },
]

export function gY3FairTest(rand: Rand): Question {
  const it = pick(rand, FAIR_TESTS)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const MEASURE = [
  { q: 'Which tool do we use for temperature?', a: 'a thermometer', o: ['a ruler', 'a clock', 'a magnifier'] },
  { q: 'Which tool measures how long something is?', a: 'a ruler', o: ['a thermometer', 'a magnifier', 'a data logger'] },
  { q: 'Length is measured in...', a: 'centimetres', o: ['degrees', 'litres', 'seconds'] },
  { q: 'Temperature is measured in...', a: 'degrees', o: ['metres', 'litres', 'seconds'] },
  { q: 'How do we count how long an enquiry takes?', a: 'a clock and seconds', o: ['a ruler and metres', 'a magnifier and lens', 'a thermometer and degrees'] },
  { q: 'Which tool watches temperature all night by itself?', a: 'a data logger', o: ['a magnifier', 'a mirror', 'a torch'] },
  { q: 'We use a magnifier to...', a: 'look closely at small things', o: ['read the writing', 'count the letters', 'weigh the rock'] },
  { q: 'Why do scientists use standard units?', a: 'so their measurements can be compared', o: ['so the numbers look big', 'so the tools get dirty', 'so the test ends early'] },
]

export function gY3Measure(rand: Rand): Question {
  const it = pick(rand, MEASURE)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const RECORDS = [
  { q: 'We counted each plant. Which record shows counts as bars?', a: 'a bar chart', o: ['a table', 'a key', 'a drawing'] },
  { q: 'Which record uses labels and arrows to name parts?', a: 'a labelled diagram', o: ['a bar chart', 'a table', 'a key'] },
  { q: 'We sorted things with questions. What did we make?', a: 'a key', o: ['a table', 'a bar chart', 'a torch'] },
  { q: 'Which record keeps numbers in rows and boxes?', a: 'a table', o: ['a drawing', 'a key', 'a bar chart'] },
  { q: 'Which record helps name an unknown rock?', a: 'a key', o: ['a torch', 'a ruler', 'a clock'] },
  { q: 'To show plant parts with names, we draw...', a: 'a labelled diagram', o: ['a table of numbers', 'a bar chart', 'a sentence'] },
  { q: 'How do scientists share results in rows of boxes?', a: 'a table', o: ['a magnifier', 'a mirror', 'a lens'] },
  { q: 'Which record shows how many of each thing we found?', a: 'a bar chart', o: ['a ruler', 'a thermometer', 'a lens'] },
]

export function gY3Record(rand: Rand): Question {
  const it = pick(rand, RECORDS)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const EQUIPMENT: { left: string; right: string }[] = [
  { left: 'thermometer', right: 'measures temperature' },
  { left: 'ruler', right: 'measures with centimetres' },
  { left: 'magnifier', right: 'makes small things look bigger' },
  { left: 'data logger', right: 'records temperature every hour' },
  { left: 'clock', right: 'counts the seconds' },
  { left: 'key', right: 'names an unknown thing' },
  { left: 'bar chart', right: 'shows counts as bars' },
  { left: 'table', right: 'keeps numbers in rows' },
  { left: 'labelled diagram', right: 'names the parts' },
  { left: 'measuring jug', right: 'measures water' },
]

export function gY3ScEquipment(rand: Rand): Question {
  return matchQ(rand, 'Match each tool to its job',
    shuffle(rand, EQUIPMENT).slice(0, 4).map((p) => ({ ...p })))
}

const CONCLUSIONS = [
  { q: 'The plant by the window grew tallest. What can we conclude?', a: 'light helps plants grow', o: ['plants hate light', 'soil is blue', 'plants never need water'] },
  { q: 'Seeds in the warm tray sprouted first. What is the conclusion?', a: 'warmth helps seeds sprout', o: ['seeds dislike warmth', 'light stops seeds growing', 'water ends growth'] },
  { q: 'The magnet took the paper clip but not the wooden block. Conclusion?', a: 'the clip is magnetic', o: ['the block is magnetic', 'the magnet is broken', 'wood is metal'] },
  { q: 'Shadows were longest when the sun was low. What did we find?', a: 'shadows change size through the day', o: ['shadows never change', 'shadows stay the same', 'the sun is cold'] },
  { q: 'One cloth soaked up more water than the other. Conclusion?', a: 'that cloth soaks up more water', o: ['the cloth is broken', 'water runs away from cloth', 'it did not rain'] },
  { q: 'Both rulers showed 3 centimetres. What do we say?', a: 'the measurements agree', o: ['one ruler is broken', 'the numbers are wrong', 'the plant grew'] },
  { q: 'The rough surface stopped the car soonest. Conclusion?', a: 'friction is bigger on rough surfaces', o: ['smooth ice is rougher', 'the car broke down', 'ice melts cars'] },
  { q: 'We saw the same result three times. What does that tell us?', a: 'our result looks strong', o: ['the result changed at once', 'we should stop testing', 'the result is wrong'] },
]

export function gY3Conclusion(rand: Rand): Question {
  const it = pick(rand, CONCLUSIONS)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const IMPROVE = [
  { q: 'We only measured once. How can we improve?', a: 'repeat the test three times', o: ['do it once and stop', 'throw the results away', 'never write anything down'] },
  { q: 'Our ruler slipped during the test. What now?', a: 'hold the ruler straight and measure again', o: ['guess the length instead', 'use a broken ruler', 'close your eyes and pull'] },
  { q: 'We forgot to keep everything the same. Improve next time?', a: 'keep everything the same except one thing', o: ['change everything each time', 'hide the results', 'skip the test'] },
  { q: 'Our results were hard to read. What is the improvement?', a: 'make a clear table', o: ['hide the results', 'use no labels', 'write in the dark'] },
  { q: 'One person did all the work. What should we change?', a: 'everyone takes a turn', o: ['one person does it all', 'no one writes notes', 'work with no turns'] },
  { q: 'We tested only one ball. How do we improve?', a: 'test every ball in the set', o: ['stop after one ball', 'only test the blue ball', 'test nothing else'] },
  { q: 'Our table had no headings. What is the improvement?', a: 'add labels and numbers', o: ['remove the labels', 'draw no lines at all', 'hide the numbers'] },
]

export function gY3Improve(rand: Rand): Question {
  const it = pick(rand, IMPROVE)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

/* ===================== Unit 2 · plant parts & needs ===================== */

const PART_FUNCTION = [
  { q: 'Which part drinks up water from the soil?', a: 'the roots', o: ['the flower', 'the petals', 'the fruit'] },
  { q: 'Which part holds the plant up straight?', a: 'the stem', o: ['the seed', 'the leaf', 'the bud'] },
  { q: 'Which part catches light to make food?', a: 'the leaves', o: ['the roots', 'the bud', 'the seed'] },
  { q: 'Which part makes seeds after pollination?', a: 'the flower', o: ['the stem', 'the roots', 'the trunk'] },
  { q: 'A tall tree has a strong...', a: 'trunk', o: ['bud', 'pollen', 'petal'] },
  { q: 'Which part takes nutrients from the soil?', a: 'the roots', o: ['the leaves', 'the flower', 'the petals'] },
  { q: 'Which part carries water up to the leaves?', a: 'the stem', o: ['the petals', 'the pollen', 'the fruit'] },
  { q: 'Every part of a plant has a...', a: 'job', o: ['story', 'song', 'hat'] },
]

export function gY3PartFunction(rand: Rand): Question {
  const it = pick(rand, PART_FUNCTION)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const PART_JOB: { left: string; right: string }[] = [
  { left: 'roots', right: 'absorb water and nutrients' },
  { left: 'stem', right: 'carries water up the plant' },
  { left: 'leaves', right: 'catch light for food' },
  { left: 'flower', right: 'makes seeds after pollination' },
  { left: 'trunk', right: 'supports a tall tree' },
  { left: 'bud', right: 'opens into a flower' },
  { left: 'branch', right: 'holds the leaves' },
  { left: 'petal', right: 'part of the flower' },
]

export function gY3PlantPartJob(rand: Rand): Question {
  return matchQ(rand, 'Match each plant part to its job',
    shuffle(rand, PART_JOB).slice(0, 4).map((p) => ({ ...p })))
}

const PLANT_TF = [
  { s: 'Every part of a plant has a job to do.', a: true },
  { s: 'Flowers are only for looking at; they have no job.', a: false },
  { s: 'Plants can make their own food.', a: true },
  { s: 'The stem supports the plant and carries water.', a: true },
  { s: 'Roots fly up into the sky.', a: false },
  { s: 'Leaves catch light.', a: true },
  { s: 'Seeds can grow into new plants.', a: true },
  { s: 'A plant needs no air to live.', a: false },
]

export function gY3PlantTF(rand: Rand): Question {
  const it = pick(rand, PLANT_TF)
  return tfQ('True or false?', it.s, it.a)
}

const PLANT_NEEDS = [
  { q: 'Which of these is NOT a thing a plant needs?', a: 'a chair', o: ['air', 'water', 'light'] },
  { q: 'Plants take nutrients up from...', a: 'the soil', o: ['the sky', 'a mirror', 'the wind'] },
  { q: 'What do leaves need to make food?', a: 'light', o: ['darkness', 'pebbles', 'poles'] },
  { q: 'Which list has everything a plant needs?', a: 'air, light, water, nutrients, room', o: ['air, stones, toys', 'water, poles, clips', 'light, mud, iron'] },
  { q: 'What does every plant need to grow tall and healthy?', a: 'room to grow', o: ['room to sleep in', 'a room with a door', 'a room with a lamp'] },
  { q: 'How can requirements vary from plant to plant?', a: 'a cactus needs less water than a rose', o: ['all plants need the same always', 'no plant needs water', 'plants never need light'] },
  { q: 'What do roots take in with the water?', a: 'nutrients', o: ['shadows', 'poles', 'pebbles'] },
  { q: 'What do plants use light for?', a: 'making food', o: ['counting to ten', 'tying shoes', 'singing songs'] },
]

export function gY3PlantNeeds(rand: Rand): Question {
  const it = pick(rand, PLANT_NEEDS)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const WATER_TRANSPORT = [
  { q: 'A white carnation in coloured water shows what?', a: 'water travels up the stem', o: ['flowers drink tea', 'the stem turns to stone', 'water runs down the stem'] },
  { q: 'How does water reach the flower?', a: 'it travels up the stem', o: ['bees pour it up', 'the sun lifts it up', 'it is blown by the wind'] },
  { q: 'What carries water through the plant?', a: 'the stem', o: ['the petal', 'the pollen', 'the fruit'] },
  { q: 'Where does water enter the plant?', a: 'the roots', o: ['the flower', 'the leaves', 'the fruit'] },
  { q: 'The coloured water reaches the petals. What does that prove?', a: 'the plant has pipes inside its stem', o: ['the flower is thirsty', 'petals hate water', 'the stem fell off'] },
  { q: 'What job does the stem do for water?', a: 'it carries water up to the leaves', o: ['it eats the water', 'it throws the water away', 'it hides the water'] },
  { q: 'Plants make their own food. Where does the making happen?', a: 'in the leaves', o: ['in the roots', 'in the soil', 'in the flower'] },
]

export function gY3WaterTransport(rand: Rand): Question {
  const it = pick(rand, WATER_TRANSPORT)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

/* ===================== Unit 3 · flowers & life cycles ===================== */

const POLLINATION = [
  { q: 'What do bees carry from flower to flower?', a: 'pollen', o: ['stones', 'poles', 'seeds'] },
  { q: 'Pollination means pollen moves from...', a: 'the male part to the female part', o: ['the roots to the sky', 'the soil to the leaves', 'the stem to the ground'] },
  { q: 'Which insect is famous for pollination?', a: 'the bee', o: ['the ant', 'the worm', 'the snail'] },
  { q: 'What happens after pollination?', a: 'seeds form', o: ['the plant dies at once', 'the roots fly up', 'the flower turns to stone'] },
  { q: 'Why does a flower make nectar?', a: 'to attract insects', o: ['to repel every insect', 'to hold water tight', 'to make the stem rough'] },
  { q: 'The pollen reaches the female part. What is this called?', a: 'pollination', o: ['dispersal', 'formation', 'support'] },
  { q: 'Flowers help the plant to...', a: 'reproduce', o: ['sleep', 'count', 'sink'] },
]

export function gY3Pollination(rand: Rand): Question {
  const it = pick(rand, POLLINATION)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const SEED_FORM = [
  { q: 'Seeds form after...', a: 'pollination', o: ['soil', 'stones', 'wind'] },
  { q: 'Where do seeds form?', a: 'inside the flower', o: ['under the sea', 'inside a cloud', 'on the roof'] },
  { q: 'What does a seed need before it can grow?', a: 'water and warmth', o: ['a lamp and a mirror', 'a ruler and a clock', 'a pen and a key'] },
  { q: 'A seed contains a tiny baby...', a: 'plant', o: ['rock', 'sand', 'glass'] },
  { q: 'What must happen before seeds can form?', a: 'pollination', o: ['the wind blows', 'the sun sets', 'it rains hard'] },
  { q: 'What protects the seed while it waits?', a: 'the seed coat', o: ['the seed mirror', 'the seed magnet', 'the seed shadow'] },
  { q: 'The flower makes seeds so the plant can make...', a: 'new plants', o: ['a bright colour', 'a loud sound', 'a soft bed'] },
]

export function gY3SeedForm(rand: Rand): Question {
  const it = pick(rand, SEED_FORM)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const LIFE_CYCLE: { p: string; items: string[] }[] = [
  { p: 'Order the plant life cycle:', items: ['seed', 'sprout', 'young plant', 'flower'] },
  { p: 'Order from a seed to new seeds:', items: ['seed', 'flower opens', 'pollen travels', 'seeds form'] },
  { p: 'What happens to a fruit seed?', items: ['fruit opens', 'seed lands', 'seed grows', 'new plant'] },
  { p: 'Put the flower stages in order:', items: ['bud', 'flower', 'pollination', 'seed'] },
  { p: 'Order how a seed grows into a plant:', items: ['seed', 'sprouting', 'young plant', 'flower'] },
  { p: 'How does a dandelion spread?', items: ['seed', 'wind carries it', 'seed lands', 'new plant'] },
]

export function gY3LifeCycleOrder(rand: Rand): Question {
  const it = pick(rand, LIFE_CYCLE)
  return orderQ(it.p, [...it.items])
}

const DISPERSAL = [
  { q: 'How does a dandelion seed travel?', a: 'the wind carries it', o: ['a bus carries it', 'it walks there', 'a magnet pulls it'] },
  { q: 'A burr sticks to animal fur. How does it travel?', a: 'it sticks to animal fur', o: ['it swims across the sea', 'the wind blows it', 'a magnet pulls it'] },
  { q: 'A coconut floats on sea water. How does it travel?', a: 'on the water', o: ['on a bus', 'in a car', 'on the wind'] },
  { q: 'Seeds that are light fly away. What carries them?', a: 'the wind', o: ['a magnet', 'the soil', 'a mirror'] },
  { q: 'Birds eat the fruit and drop the seeds. The seeds travel...', a: 'with the birds', o: ['under a rock', 'inside a magnet', 'up the stem'] },
  { q: 'A seed lands far from its parent. Why does that help?', a: 'it gets more light and room', o: ['it gets less water', 'it never grows again', 'it turns into stone'] },
  { q: 'Apple seeds are eaten by animals. How do they travel?', a: 'they pass through the animal and are left behind', o: ['they sink into the sea', 'they are held by magnets', 'they stay inside the flower'] },
  { q: 'What one thing do wind-blown seeds have?', a: 'they are very light', o: ['they are heavy and wet', 'they are magnetic', 'they are made of metal'] },
]

export function gY3Dispersal(rand: Rand): Question {
  const it = pick(rand, DISPERSAL)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const DISPERSAL_MATCH: { left: string; right: string }[] = [
  { left: 'dandelion', right: 'carried by the wind' },
  { left: 'burr', right: 'sticks to animal fur' },
  { left: 'coconut', right: 'floats on sea water' },
  { left: 'apple', right: 'eaten by birds and animals' },
  { left: 'pea', right: 'pops open and jumps' },
  { left: 'maple', right: 'spins down from the tree' },
  { left: 'water lily', right: 'floats away on the pond' },
  { left: 'grass seed', right: 'dropped from the parent plant' },
]

export function gY3DispersalMatch(rand: Rand): Question {
  return matchQ(rand, 'Match each seed to how it travels',
    shuffle(rand, DISPERSAL_MATCH).slice(0, 4).map((p) => ({ ...p })))
}

/* ===================== Unit 4 · animal nutrition ===================== */

const COMPARE_DIET = [
  { q: 'A cow eats only plants. A cow is a...', a: 'herbivore', o: ['carnivore', 'omnivore', 'robot'] },
  { q: 'A lion eats meat. A lion is a...', a: 'carnivore', o: ['herbivore', 'omnivore', 'robot'] },
  { q: 'A dog eats meat and plants. A dog is an...', a: 'omnivore', o: ['herbivore', 'carnivore', 'robot'] },
  { q: 'Which animal is a herbivore?', a: 'a rabbit', o: ['a lion', 'a shark', 'a wolf'] },
  { q: 'Humans are...', a: 'omnivores', o: ['herbivores only', 'carnivores only', 'stones'] },
  { q: 'What do herbivores eat?', a: 'plants', o: ['meat only', 'rocks', 'glass'] },
  { q: 'A cat is mainly a meat eater. It is a...', a: 'carnivore', o: ['herbivore', 'omnivore', 'plant'] },
]

export function gY3CompareDiet(rand: Rand): Question {
  const it = pick(rand, COMPARE_DIET)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const FOOD_GROUP: { left: string; right: string }[] = [
  { left: 'bread', right: 'gives energy to move' },
  { left: 'fish', right: 'gives protein to grow' },
  { left: 'milk', right: 'builds strong bones' },
  { left: 'fruit', right: 'gives vitamins' },
  { left: 'vegetables', right: 'keeps you healthy' },
  { left: 'eggs', right: 'helps you grow' },
  { left: 'cheese', right: 'builds strong teeth' },
  { left: 'potatoes', right: 'gives energy for sport' },
]

export function gY3FoodGroup(rand: Rand): Question {
  return matchQ(rand, 'Match each food to why it helps you',
    shuffle(rand, FOOD_GROUP).slice(0, 4).map((p) => ({ ...p })))
}

const NUTRITION_TF = [
  { s: 'Animals cannot make their own food.', a: true },
  { s: 'Humans make food from sunlight.', a: false },
  { s: 'You get nutrition from the food you eat.', a: true },
  { s: 'A balanced diet means only eating sweets.', a: false },
  { s: 'Plants can make their own food.', a: true },
  { s: 'Nutrition comes only from air.', a: false },
  { s: 'The right amount of food matters too.', a: true },
  { s: 'Only plants need food and nutrition.', a: false },
]

export function gY3NutritionTF(rand: Rand): Question {
  const it = pick(rand, NUTRITION_TF)
  return tfQ('True or false?', it.s, it.a)
}

const HEALTHY = [
  { q: 'Which breakfast is the better choice?', a: 'cereal with milk and a banana', o: ['cake with sweets', 'chips with more chips', 'no breakfast at all'] },
  { q: 'How much of each food type should you eat?', a: 'the right amount, not too much or too little', o: ['no food at all', 'only sweets every day', 'twice the amount always'] },
  { q: 'Which snack helps you grow?', a: 'fruit and milk', o: ['sweets and cake', 'chips and cola', 'nothing at all'] },
  { q: 'Why should we not eat only sweets?', a: 'they do not give the nutrients we need', o: ['sweets give every vitamin', 'sweets build strong bones', 'sweets are vegetables'] },
  { q: 'Which drink is the better choice?', a: 'water', o: ['cola only', 'melted sweets', 'oil'] },
  { q: 'Ben wants strong bones. Which food helps most?', a: 'milk and cheese', o: ['sweets and chips', 'only bread', 'stones and sand'] },
  { q: 'What should a healthy meal include?', a: 'the right types of food in the right amount', o: ['only sugar and sweets', 'no food at all', 'the same food forever'] },
]

export function gY3HealthyChoice(rand: Rand): Question {
  const it = pick(rand, HEALTHY)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

/* ===================== Unit 5 · skeletons & muscles ===================== */

const SKELETON_PART = [
  { q: 'Which bones protect your chest?', a: 'the ribs', o: ['the skull', 'the spine', 'the joints'] },
  { q: 'What protects your brain inside your head?', a: 'the skull', o: ['the ribs', 'the spine', 'the muscles'] },
  { q: 'Which part runs up your back?', a: 'the spine', o: ['the ribs', 'the skull', 'the arm'] },
  { q: 'Where do your arm and leg bones join?', a: 'the joints', o: ['the ribs', 'the skull', 'the chest'] },
  { q: 'What pulls on your bones to make you move?', a: 'muscles', o: ['leaves', 'petals', 'pollen'] },
  { q: 'Your skeleton gives your body...', a: 'support and protection', o: ['food and water', 'light and dark', 'seeds and soil'] },
  { q: 'Where is your spine?', a: 'in your back', o: ['in your hand', 'in your eye', 'in your hair'] },
  { q: 'Which part is a hard case around your head?', a: 'the skull', o: ['the ribs', 'the joints', 'the spine'] },
]

export function gY3SkeletonPart(rand: Rand): Question {
  const it = pick(rand, SKELETON_PART)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const SKELETON_JOB: { left: string; right: string }[] = [
  { left: 'skull', right: 'protects your head' },
  { left: 'ribs', right: 'protects your chest' },
  { left: 'spine', right: 'supports your back' },
  { left: 'muscles', right: 'pull your bones to move' },
  { left: 'leg bones', right: 'help you walk and run' },
  { left: 'arm bones', right: 'help you bend at the elbow' },
  { left: 'joints', right: 'let the parts move smoothly' },
  { left: 'shoulder', right: 'helps your arm move' },
]

export function gY3SkeletonJob(rand: Rand): Question {
  return matchQ(rand, 'Match each bone or muscle to its job',
    shuffle(rand, SKELETON_JOB).slice(0, 4).map((p) => ({ ...p })))
}

const SKELETON_TF = [
  { s: 'Humans have a skeleton inside their body.', a: true },
  { s: 'A snail has hard bones like ours.', a: false },
  { s: 'Muscles help you move your body.', a: true },
  { s: 'A jellyfish has bones like a fish.', a: false },
  { s: 'Your skull protects your head.', a: true },
  { s: 'Fish walk on legs to move.', a: false },
  { s: 'A skeleton gives support and protection.', a: true },
  { s: 'Worms have a skeleton just like humans.', a: false },
]

export function gY3SkeletonTF(rand: Rand): Question {
  const it = pick(rand, SKELETON_TF)
  return tfQ('True or false?', it.s, it.a)
}

const MOVEMENT = [
  { q: 'How does a snake move?', a: 'it slithers along the ground', o: ['it hops on legs', 'it flies away', 'it rolls like a wheel'] },
  { q: 'How do fish move without legs?', a: 'they swim with their tails', o: ['they walk on fins', 'they climb trees', 'they hop on the ground'] },
  { q: 'How do humans move on land?', a: 'they walk on two legs', o: ['they swim with fins', 'they slither on their skin', 'they fly away'] },
  { q: 'A worm has no legs. How does it move?', a: 'it bends and stretches', o: ['it hops quickly', 'it rolls like a ball', 'it flies away'] },
  { q: 'How does a starfish move?', a: 'it moves slowly on tube feet', o: ['it walks on legs', 'it climbs up trees', 'it jumps high'] },
  { q: 'What do muscles do when you run?', a: 'they pull your bones', o: ['they make food for you', 'they hold water', 'they catch light'] },
  { q: 'A snail carries its home. How does it move?', a: 'it slides on its body', o: ['it flies with wings', 'it walks on four legs', 'it jumps over walls'] },
]

export function gY3MovementCompare(rand: Rand): Question {
  const it = pick(rand, MOVEMENT)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const NO_SKELETON = [
  { q: 'What would happen without a skeleton?', a: 'you would have no support', o: ['you would fly at once', 'you would grow wings', 'you would turn to stone'] },
  { q: 'Why do animals need skeletons?', a: 'to support and protect their bodies', o: ['to eat more food', 'to sleep all day', 'to hide in the dark'] },
  { q: 'An animal with no bones would...', a: 'have no support inside', o: ['be stronger than a horse', 'grow bones at once', 'never need food'] },
  { q: 'Why is your skull hard?', a: 'to protect your head', o: ['to help you eat', 'to make you tall', 'to keep your shoes on'] },
  { q: 'What do bones give your body?', a: 'shape and support', o: ['food and air', 'light and heat', 'seeds and soil'] },
  { q: 'Which animal survives with no bones at all?', a: 'a worm', o: ['a dog', 'a horse', 'a cow'] },
  { q: 'Your muscles attach to...', a: 'your bones', o: ['your hair', 'your shoes', 'the floor'] },
]

export function gY3NoSkeleton(rand: Rand): Question {
  const it = pick(rand, NO_SKELETON)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

/* ===================== Unit 6 · rocks & soils ===================== */

const ROCK_PROPERTY = [
  { q: 'We group rocks by their appearance and their...', a: 'physical properties', o: ['price in coins', 'the day of the week', 'their names only'] },
  { q: 'Which property can we test just by touching?', a: 'rough or smooth', o: ['how loud it is', 'what colour it is', 'how it smells'] },
  { q: 'Rocks can be hard or soft, rough or smooth, shiny or...', a: 'dull', o: ['wet', 'alive', 'green'] },
  { q: 'What does a grainy rock show you?', a: 'it is made of grains', o: ['it is a magnet', 'it is warm', 'it floats'] },
  { q: 'Crystals inside a rock tell you...', a: 'how it formed', o: ['how old your shoe is', 'which day it is', 'how hot your lunch is'] },
  { q: 'A rock with fossils inside is grouped by...', a: 'the fossils trapped inside', o: ['its price', 'the weather', 'the time of day'] },
  { q: 'Which is a physical property of a rock?', a: 'its hardness', o: ['its lunch', 'its story', 'its colour'] },
  { q: 'Why do scientists group rocks?', a: 'to compare and classify them', o: ['to sell them', 'to paint them', 'to eat them'] },
]

export function gY3RockProperty(rand: Rand): Question {
  const it = pick(rand, ROCK_PROPERTY)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const ROCK_NAME = [
  { q: 'Which rock is often used in buildings?', a: 'granite', o: ['chalk', 'clay', 'soil'] },
  { q: 'Which rock is soft, white and used to write on walls?', a: 'chalk', o: ['slate', 'flint', 'granite'] },
  { q: 'Which rock is dug from the ground to make bricks?', a: 'clay', o: ['sand', 'chalk', 'ice'] },
  { q: 'Which rock splits into thin flat sheets for roofs?', a: 'slate', o: ['chalk', 'clay', 'sand'] },
  { q: 'Which rock can be sharp like a tool?', a: 'flint', o: ['chalk', 'clay', 'soil'] },
  { q: 'Fossils are often found in which rock?', a: 'sedimentary rock', o: ['granite', 'slate', 'flint'] },
  { q: 'Which rock type forms when melted rock cools?', a: 'igneous rock', o: ['sedimentary rock', 'metamorphic rock', 'chalk rock'] },
  { q: 'Which rock would you find on a beach?', a: 'pebbles', o: ['chalk', 'slate', 'clay'] },
]

export function gY3RockName(rand: Rand): Question {
  const it = pick(rand, ROCK_NAME)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const FOSSIL_FORM: { p: string; items: string[] }[] = [
  { p: 'Order how an animal turns into a fossil:', items: ['the animal dies', 'mud covers it', 'rock traps it', 'we find the fossil'] },
  { p: 'Order how a plant becomes a fossil:', items: ['plant dies', 'sand buries it', 'rock holds it tight', 'a fossil remains'] },
  { p: 'Order fossil formation:', items: ['living thing dies', 'layers cover it', 'it is trapped in rock', 'the fossil remains'] },
  { p: 'How does mud turn to stone? Order the steps:', items: ['mud settles', 'layers pile up', 'rock presses it', 'stone is formed'] },
  { p: 'Order how a fish fossil forms:', items: ['the fish dies', 'sand sinks over it', 'rock traps the bones', 'we find a fossil'] },
  { p: 'Order from dead animal to fossil:', items: ['dead animal', 'buried in mud', 'trapped in rock', 'fossil remains'] },
]

export function gY3FossilForm(rand: Rand): Question {
  const it = pick(rand, FOSSIL_FORM)
  return orderQ(it.p, [...it.items])
}

const ROCK_TF = [
  { s: 'Fossils form when living things get trapped within rock.', a: true },
  { s: 'Fossils are made of metal.', a: false },
  { s: 'Soil is made from rocks and organic matter.', a: true },
  { s: 'Any animal can turn into a fossil the same day it dies.', a: false },
  { s: 'Fossils can show us plants that lived long ago.', a: true },
  { s: 'We can find fossils inside some rocks.', a: true },
  { s: 'Fossils only form in water.', a: false },
  { s: 'Scientists study fossils to learn about the past.', a: true },
]

export function gY3FossilTF(rand: Rand): Question {
  const it = pick(rand, ROCK_TF)
  return tfQ('True or false?', it.s, it.a)
}

const SOIL_FORM: { p: string; items: string[] }[] = [
  { p: 'Order how soil forms:', items: ['rocks wear into bits', 'dead leaves fall', 'organic matter mixes in', 'soil forms on top'] },
  { p: 'Order the making of soil:', items: ['rock breaks into bits', 'plants and leaves die', 'matter mixes with the bits', 'soil builds up'] },
  { p: 'How does dead matter turn to soil? Order:', items: ['things die', 'they rot into the ground', 'mixes with rock bits', 'soil is ready'] },
  { p: 'Order soil from rocks and dead plants:', items: ['rocks break down', 'dead plants fall', 'the parts mix', 'soil appears'] },
  { p: 'Order how the ground gets its soil:', items: ['rock wears away', 'leaves and plants die', 'matter mixes in', 'soil builds up'] },
  { p: 'Order from bare rock to soil:', items: ['bare rock', 'bits of rock', 'dead matter mixes', 'soil forms'] },
]

export function gY3SoilForm(rand: Rand): Question {
  const it = pick(rand, SOIL_FORM)
  return orderQ(it.p, [...it.items])
}

const SOIL_TF = [
  { s: 'Soil is made from tiny bits of rock.', a: true },
  { s: 'Dead plants and animals add organic matter to soil.', a: true },
  { s: 'Soil is only made of sand.', a: false },
  { s: 'Soil gives plants a place to hold on.', a: true },
  { s: 'Soil forms very quickly, in one day.', a: false },
  { s: 'Layers of rock and matter make soil over a long time.', a: true },
  { s: 'You cannot find soil in a forest.', a: false },
  { s: 'Garden soil has rocks, matter and air in it.', a: true },
]

export function gY3SoilTF(rand: Rand): Question {
  const it = pick(rand, SOIL_TF)
  return tfQ('True or false?', it.s, it.a)
}

/* ===================== Unit 7 · light ===================== */

const LIGHT_NEED = [
  { q: 'What do we need to see things?', a: 'light', o: ['dark', 'a magnet', 'soil'] },
  { q: 'Dark means...', a: 'the absence of light', o: ['a lot of light', 'a bright sun', 'a shiny mirror'] },
  { q: 'Which of these is a light source?', a: 'the sun', o: ['a chair', 'a shoe', 'a stone'] },
  { q: 'Our eyes need light to...', a: 'see things', o: ['sleep all night', 'grow taller', 'hear music'] },
  { q: 'At night, with no light, we say it is...', a: 'dark', o: ['bright', 'shiny', 'loud'] },
  { q: 'We cannot see colours when...', a: 'there is no light', o: ['the room is big', 'the window is open', 'the bell rings'] },
  { q: 'What travels to your eyes so you can see?', a: 'light', o: ['soil', 'seeds', 'poles'] },
]

export function gY3LightNeed(rand: Rand): Question {
  const it = pick(rand, LIGHT_NEED)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const REFLECT = [
  { q: 'When light bounces off a mirror, it...', a: 'reflects off the surface', o: ['stops and hides', 'turns into water', 'sinks into the floor'] },
  { q: 'Why can you see yourself in a mirror?', a: 'light reflects off the mirror', o: ['the mirror eats light', 'light never reaches mirrors', 'mirrors make their own light'] },
  { q: 'What do we call light bouncing off a wall?', a: 'reflection', o: ['a shadow', 'darkness', 'a magnet'] },
  { q: 'Which surface reflects the most light?', a: 'a shiny mirror', o: ['a rough rock', 'a dull cloth', 'a wooden floor'] },
  { q: 'You can see a reflection in...', a: 'a mirror', o: ['a rug', 'a chair', 'a coat'] },
  { q: 'Why does a mirror show your face?', a: 'light bounces into your eyes', o: ['the mirror draws your face', 'the mirror is a window', 'light never leaves the mirror'] },
  { q: 'What happens when light hits a shiny surface?', a: 'it reflects', o: ['it melts', 'it grows', 'it sings'] },
]

export function gY3Reflect(rand: Rand): Question {
  const it = pick(rand, REFLECT)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const SUN_SAFE = [
  { q: 'Why must we never look straight at the sun?', a: 'it can hurt your eyes', o: ['it is too cold', 'it is not real', 'it makes you hungry'] },
  { q: 'How can we protect our eyes in bright sun?', a: 'wear dark glasses', o: ['stare at the sun', 'close one eye only', 'look at the ground all day'] },
  { q: 'What should you do at midday on a beach?', a: 'wear a hat and stay in the shade', o: ['look straight at the sun', 'take off your glasses', 'lie in the sun all day'] },
  { q: 'Sunburn is caused by...', a: 'too much sun on your skin', o: ['too much rain', 'too much wind', 'the cold night'] },
  { q: 'Why do we wear dark glasses in summer?', a: 'to protect our eyes from bright light', o: ['to see better in the dark', 'to make the sun go away', 'to hear the sun'] },
  { q: 'What should you never do with a bright torch?', a: "shine it in someone's eyes", o: ['shine it on the wall', 'hold it low to the ground', 'use it to read'] },
  { q: 'Why do we look away from the sun?', a: 'to keep our eyes safe', o: ['to see the sun better', 'to grow taller', 'to run faster'] },
]

export function gY3SunSafe(rand: Rand): Question {
  const it = pick(rand, SUN_SAFE)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const SHADOW_FORM = [
  { q: 'A shadow forms when...', a: 'an object blocks the light', o: ['the object glows', 'light passes straight through the object', 'the room fills with water'] },
  { q: 'Which of these is opaque?', a: 'a wooden board', o: ['clear water', 'clean air', 'a bright lamp'] },
  { q: 'What happens to light when it hits an opaque block?', a: 'it cannot pass through', o: ['it speeds up', 'it turns into a shadow', 'it goes into your eyes'] },
  { q: 'You need a light source and a... to make a shadow?', a: 'solid object', o: ['a mirror', 'a magnet', 'water'] },
  { q: 'Which of these does light pass straight through?', a: 'a clear window', o: ['a wooden door', 'a thick rug', 'a metal sheet'] },
  { q: 'Where there is light, a block can make a...', a: 'shadow', o: ['mirror', 'magnet', 'bell'] },
  { q: 'What must stand between the light and the floor to make a shadow?', a: 'an opaque object', o: ['a mirror facing it', 'nothing at all', 'a pool of water'] },
]

export function gY3ShadowForm(rand: Rand): Question {
  const it = pick(rand, SHADOW_FORM)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const SHADOW_SIZE = [
  { q: 'You move the torch closer. The shadow gets...', a: 'bigger', o: ['smaller', 'the same size always', 'faded away'] },
  { q: 'The light moves further away. The shadow gets...', a: 'smaller', o: ['bigger', 'stays the same', 'turns bright'] },
  { q: 'What happens to a shadow when the light source moves?', a: 'it moves too', o: ['nothing ever changes', 'it fades away', 'it grows wings'] },
  { q: 'Shadows are longest when the light is...', a: 'low down', o: ['high and bright', 'right above you', 'behind you'] },
  { q: 'You shine the torch from very near. The shadow...', a: 'is big', o: ['is tiny', 'stays the same', 'fades away'] },
  { q: 'Which change makes a shadow grow?', a: 'the light moves closer', o: ['the light moves further away', 'you add more blocks', 'the room gets colder'] },
  { q: 'Why does the shadow change when we move the lamp?', a: 'the light comes from a different place', o: ['the lamp changes colour', 'the object grows bigger', 'the floor moves'] },
]

export function gY3ShadowSize(rand: Rand): Question {
  const it = pick(rand, SHADOW_SIZE)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const SHADOW_TF = [
  { s: 'A shadow forms when an object blocks light.', a: true },
  { s: 'Shadows can form with no light at all.', a: false },
  { s: 'Light can reflect off a surface.', a: true },
  { s: 'We can see in total darkness without any light.', a: false },
  { s: 'Looking straight at the sun can hurt our eyes.', a: true },
  { s: 'Opaque objects let light pass straight through.', a: false },
  { s: 'A shadow can change size when the light moves.', a: true },
  { s: 'Dark is the absence of light.', a: true },
]

export function gY3ShadowTF(rand: Rand): Question {
  const it = pick(rand, SHADOW_TF)
  return tfQ('True or false?', it.s, it.a)
}

/* ===================== Unit 8 · forces & magnets ===================== */

const FORCE_CONTACT = [
  { q: 'Opening a door needs...', a: 'a push or a pull you make', o: ['two north poles', 'a magnet far away', 'no force at all'] },
  { q: 'Magnets can pull without touching because they act...', a: 'at a distance', o: ['only when touching', 'only in the dark', 'only on wood'] },
  { q: 'Which force slows a sliding book?', a: 'friction', o: ['gravity', 'sunlight', 'pollen'] },
  { q: 'Two magnets can push apart without touching. That force is...', a: 'magnetic force', o: ['gravity', 'the wind', 'a shadow'] },
  { q: 'What do we call a push or a pull?', a: 'a force', o: ['a magnet', 'a shadow', 'a seed'] },
  { q: 'Opening a door needs you to touch it. This force...', a: 'needs contact', o: ['acts at a distance', 'needs no push', 'is only magnetic'] },
  { q: 'A magnet picks up a clip without touching it. It acts...', a: 'at a distance', o: ['with contact only', 'only when warm', 'only in the dark'] },
]

export function gY3ForceContact(rand: Rand): Question {
  const it = pick(rand, FORCE_CONTACT)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const SURFACE_MOVE = [
  { q: 'A toy car goes farthest on...', a: 'smooth ice', o: ['a thick rug', 'deep grass', 'rough carpet'] },
  { q: 'Which surface makes a sled stop soonest?', a: 'rough carpet', o: ['wet ice', 'shiny floor', 'a metal sheet'] },
  { q: 'How far a toy rolls depends on the...', a: 'surface it rolls on', o: ['colour of the toy', 'time of day', 'shape of the room'] },
  { q: 'Which is the roughest surface?', a: 'a rough carpet', o: ['smooth ice', 'a metal sheet', 'shiny glass'] },
  { q: 'Why does the sled go far on ice?', a: 'ice is smooth so there is little friction', o: ['ice is rough and sticky', 'ice is soft like cloth', 'ice stops everything'] },
  { q: 'What makes a rolling ball stop?', a: 'friction from the surface', o: ['more wheels', 'bright light', 'cold soil'] },
  { q: 'A trolley rolls easier on a smooth floor than on...', a: 'a deep rug', o: ['a shiny sheet', 'ice', 'a metal bar'] },
]

export function gY3SurfaceMove(rand: Rand): Question {
  const it = pick(rand, SURFACE_MOVE)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const MAGNET_TF = [
  { s: 'Magnets attract some materials and not others.', a: true },
  { s: 'Every material in the world is magnetic.', a: false },
  { s: 'Two north poles will attract each other.', a: false },
  { s: 'A magnet can act without touching.', a: true },
  { s: 'Every magnet has two poles.', a: true },
  { s: 'Iron is attracted to a magnet.', a: true },
  { s: 'Wood is a magnetic material.', a: false },
  { s: 'North and south poles attract each other.', a: true },
]

export function gY3MagnetTF(rand: Rand): Question {
  const it = pick(rand, MAGNET_TF)
  return tfQ('True or false?', it.s, it.a)
}

const MAGNET_JOB: { left: string; right: string }[] = [
  { left: 'bar magnet', right: 'picks up paper clips' },
  { left: 'ring magnet', right: 'holds notes on the fridge' },
  { left: 'button magnet', right: 'keeps a box shut' },
  { left: 'horseshoe magnet', right: 'lifts heavy iron' },
  { left: 'compass', right: 'points to north' },
  { left: 'magnetic strip', right: 'holds keys on the wall' },
  { left: 'magnet in a door catch', right: 'keeps the door shut' },
  { left: 'toy magnet', right: 'helps you pick up pins' },
]

export function gY3MagnetMatch(rand: Rand): Question {
  return matchQ(rand, 'Match each magnet to its job',
    shuffle(rand, MAGNET_JOB).slice(0, 4).map((p) => ({ ...p })))
}

const POLE_PREDICT = [
  { q: 'Two north poles face each other. What happens?', a: 'they repel', o: ['they attract', 'they stick together', 'nothing happens'] },
  { q: 'A north pole meets a south pole. What happens?', a: 'they attract', o: ['they repel', 'they pass through', 'nothing happens'] },
  { q: 'Which pair of poles will attract?', a: 'north and south', o: ['north and north', 'south and south', 'both north'] },
  { q: 'You push two south poles together. They...', a: 'repel each other', o: ['attract strongly', 'stick together', 'melt at once'] },
  { q: 'What do the two poles of one magnet do to each other?', a: 'they attract', o: ['they repel', 'they hide', 'they turn around'] },
  { q: 'A magnet has how many poles?', a: 'two', o: ['one', 'four', 'ten'] },
  { q: 'Prediction: north pole near south pole. Result?', a: 'they pull together', o: ['they push apart', 'nothing at all', 'they fall to pieces'] },
]

export function gY3PolePredict(rand: Rand): Question {
  const it = pick(rand, POLE_PREDICT)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const MAGNET_USE = [
  { q: 'Why is a magnet useful on a fridge?', a: 'it holds things without glue', o: ['it makes the fridge cold', 'it cooks the food', 'it lights the kitchen'] },
  { q: 'Which everyday item uses a magnet?', a: 'a compass', o: ['a spoon', 'a sheet of paper', 'a glass of water'] },
  { q: 'What does a fridge magnet hold?', a: 'a note or a drawing', o: ['a bowl of water', 'a hot pan', 'a shoe'] },
  { q: 'Which magnet is shaped like a horseshoe?', a: 'the horseshoe magnet', o: ['the bar magnet', 'the ring magnet', 'the button magnet'] },
  { q: 'Where do we use a magnetic strip?', a: 'to hold keys or notes on a wall', o: ['to cook dinner', 'to light the room', 'to wash clothes'] },
  { q: 'Why do tools stick to a magnetic holder?', a: 'they are made of magnetic material', o: ['they are alive', 'they are hot', 'they are sweet'] },
  { q: 'A magnet can pick up...', a: 'a steel paper clip', o: ['a wooden spoon', 'a plastic cup', 'a glass window'] },
]

export function gY3MagnetUse(rand: Rand): Question {
  const it = pick(rand, MAGNET_USE)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}
