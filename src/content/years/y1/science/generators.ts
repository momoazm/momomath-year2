/** PLAN 169b — Year-1 science generators. Built directly on the statutory
 *  DfE Year-1 programme of study (see src/content/syllabus/y1/science.ts for
 *  the extracted source): working-scientifically methods, plants and trees,
 *  animals (the five groups, diets, coverings), human bodies and the five
 *  senses, everyday materials and their properties, and seasonal changes.
 *
 *  Vocabulary stays inside src/content/syllabus/y1/science.ts: bank-tier
 *  words (mcq choices, match sides, order items) must pass the year-1
 *  syllabus or stay short enough to be soft; prompts, hints, truefalse
 *  statements, speak targets and teach lines are text tier (report-only).
 *  Tap-count cells are not audited at all (QuestionView matches
 *  `c === targetEmoji`, so every target cell in a drill is the SAME string). */

import type { Question } from '../../../types'
import {
  LIVING_BANK,
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

/** Real answerable Year-1 science questions (mcq answers + speak targets). */
const QUESTIONS = [
  'What is the best material for a roof?',
  'Which material makes the best bag?',
  'How does a seed know when to sprout?',
  'What makes a shadow move?',
  'Why do leaves change colour in autumn?',
  'Which animal lives in a pond?',
  'What does a plant need to grow?',
  'How many legs does a spider have?',
]

/** Statements that are NOT science questions (mcq distractors). */
const NOT_QUESTIONS = [
  'I like blue.', 'I like cats.', 'Ice cream is nice.', 'It is a big dog.',
  'My name is Ben.', 'Red is a colour.',
]

export function gY1ScQuestion(rand: Rand): Question {
  const answer = pick(rand, QUESTIONS)
  return mcqE(rand, 'Which of these is a SCIENCE question?', answer,
    pickOthers(rand, NOT_QUESTIONS, answer, 3))
}

const PREDICT = [
  { q: 'Before we test, our guess about what will happen is called a...', a: 'prediction', o: ['question', 'story', 'answer'] },
  { q: 'A seed with no water will...', a: 'dry up', o: ['grow tall', 'turn blue', 'jump away'] },
  { q: 'If it rains, the path will get...', a: 'wet', o: ['hot', 'hard', 'taller'] },
  { q: 'An ice cube in a warm room will...', a: 'melt', o: ['grow', 'freeze', 'float'] },
  { q: 'A plant put in a dark cupboard will look...', a: 'pale and weak', o: ['bright and strong', 'bigger and red', 'taller and blue'] },
  { q: 'If we pour water on sand, the sand gets...', a: 'wet', o: ['dry', 'hard', 'taller'] },
  { q: 'Before we open the box, we should say what we...', a: 'think will be inside', o: ['already ate', 'drew last week', 'wore today'] },
  { q: 'We think the ball will bounce. That is our...', a: 'prediction', o: ['lunch', 'shoe', 'song'] },
]

export function gY1ScPredict(rand: Rand): Question {
  const it = pick(rand, PREDICT)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const NONLIVING = ['rock', 'paper', 'spoon', 'bag', 'cloud', 'car']

export function gY1ScSortLiving(rand: Rand): Question {
  const livingPool = Object.keys(LIVING_BANK).filter((k) => k !== 'child' && k !== 'baby')
  const living = shuffle(rand, livingPool).slice(0, 3)
  const non = shuffle(rand, NONLIVING).slice(0, 3)
  return matchQ(rand, 'Sort it: LIVING or NOT living?', [
    ...living.map((a) => ({ left: a, right: 'living' })),
    ...non.map((a) => ({ left: a, right: 'not living' })),
  ])
}

const THING_ANIMAL = ['dog', 'cat', 'fish', 'frog', 'duck', 'bee', 'pig', 'owl', 'ant', 'hen']
const THING_PLANT = ['flower', 'tree', 'grass', 'rose', 'tulip', 'daisy', 'sunflower', 'buttercup']

export function gY1ScSortGroups(rand: Rand): Question {
  const a = shuffle(rand, THING_ANIMAL).slice(0, 2)
  const p = shuffle(rand, THING_PLANT).slice(0, 2)
  const n = shuffle(rand, NONLIVING).slice(0, 2)
  return matchQ(rand, 'Group these: animals, plants or not living?', [
    ...a.map((x) => ({ left: x, right: 'animals' })),
    ...p.map((x) => ({ left: x, right: 'plants' })),
    ...n.map((x) => ({ left: x, right: 'not living' })),
  ])
}

const SIMPLE_TESTS = [
  { q: 'How can we find out which cloth is best for a towel?', a: 'pour water on both cloths', o: ['ask someone to pick', 'only look at the colours', 'weigh them twice'] },
  { q: 'Which is a fair test for two new sponges?', a: 'use the same amount of water on each', o: ['use a full bucket and a drop', 'test only the dry one', 'count the letters'] },
  { q: 'How do we find out which ball bounces highest?', a: 'drop both balls from the same height', o: ['throw one high and one low', 'only count the blue one', 'ask the class to guess'] },
  { q: 'We want to know which paper is stronger. What do we do?', a: 'hang the same weight on each sheet', o: ['look at them once', 'read the label twice', 'count the lines'] },
  { q: 'How can we see which ramp is smoother?', a: 'roll the same ball down both ramps', o: ['use different balls', 'count the colours', 'move one ramp far away'] },
  { q: 'What is the best way to test a new umbrella?', a: 'pour water on it and see', o: ['only look at its colour', 'ask a friend to guess', 'weigh it on a scale'] },
  { q: 'How do we find out which material stretches more?', a: 'pull each one gently and watch', o: ['read about it once', 'look away while pulling', 'count the letters'] },
]

export function gY1ScTest(rand: Rand): Question {
  const it = pick(rand, SIMPLE_TESTS)
  return mcqE(rand, it.q, it.a, it.o)
}

const RECORDS = [
  { q: 'We watched a snail move. How do we record it?', a: 'draw it and label it', o: ['forget it', 'only blink', 'hide the cup'] },
  { q: 'We counted the birds. What do we do next?', a: 'write the number in our book', o: ['throw the book', 'sing a song', 'close the box'] },
  { q: 'How do we show how many we found?', a: 'make a tally chart', o: ['draw a wall', 'wear a hat', 'kick a ball'] },
  { q: 'We measured how tall the plant is. How do we keep it?', a: 'write the day and the weather', o: ['eat a snack', 'hide the plant', 'move the desk'] },
  { q: 'What do we do after we see something in an experiment?', a: 'write down what we saw', o: ['start a story', 'pack a bag', 'sing a song'] },
  { q: 'How can we share what we found out?', a: 'draw two boxes and tick', o: ['draw one big dot', 'close our eyes', 'jump on the desk'] },
  { q: 'We saw which cup was fuller. How do we record it?', a: 'draw the cups and label them', o: ['pour it away', 'forget the test', 'hide the water'] },
]

export function gY1ScRecord(rand: Rand): Question {
  const it = pick(rand, RECORDS)
  return mcqE(rand, it.q, it.a, it.o)
}

const LIVING_TF = [
  { s: 'A dog is a living thing.', a: true },
  { s: 'A rock is alive.', a: false },
  { s: 'Plants need water to grow.', a: true },
  { s: 'A stone can run and play.', a: false },
  { s: 'Fish live in water.', a: true },
  { s: 'A chair is alive.', a: false },
  { s: 'People are animals too.', a: true },
  { s: 'A cloud eats food every day.', a: false },
]

export function gY1ScLivingTF(rand: Rand): Question {
  const it = pick(rand, LIVING_TF)
  return tfQ('Living or not?', it.s, it.a)
}

export function gY1ScSpeakQuestion(rand: Rand): Question {
  const target = pick(rand, QUESTIONS)
  return speakQ('Ask your science question out loud', target, { hint: 'Speak clearly so we can hear the question.' })
}

/* ======================= Unit 2 · plants & trees ======================= */

const PART_Q = [
  { q: 'Which part holds the plant in the soil?', a: 'roots', o: ['stem', 'flower', 'leaf'] },
  { q: 'Which part grows up from the soil?', a: 'stem', o: ['root', 'seed', 'petal'] },
  { q: 'Which part do bees visit?', a: 'flower', o: ['root', 'branch', 'seed'] },
  { q: 'What does a plant grow from?', a: 'seed', o: ['root', 'leaf', 'trunk'] },
  { q: 'What do we call the soft coloured part of a flower?', a: 'petal', o: ['root', 'bark', 'stem'] },
  { q: 'Which part of a tree is thick and strong?', a: 'trunk', o: ['leaf', 'seed', 'petal'] },
  { q: 'Which part joins the leaves to the trunk?', a: 'branch', o: ['root', 'petal', 'seed'] },
  { q: 'What grows inside a fruit?', a: 'seed', o: ['trunk', 'branch', 'bark'] },
]

export function gY1PlantPart(rand: Rand): Question {
  const it = pick(rand, PART_Q)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const WILD_Q = [
  { q: 'Which of these grows WILD in a field?', a: 'dandelion', o: ['tulip', 'rose', 'sunflower'] },
  { q: 'Which of these is a GARDEN flower?', a: 'tulip', o: ['dandelion', 'grass', 'weed'] },
  { q: 'Which plant grows WILD on a lawn?', a: 'grass', o: ['rose', 'tulip', 'sunflower'] },
  { q: 'Buttercups grow...', a: 'in the wild', o: ['in a shop', 'on a wall', 'in a box'] },
  { q: 'Which of these do people PLANT in gardens?', a: 'rose', o: ['grass', 'dandelion', 'weed'] },
  { q: 'Which of these grows WILD almost anywhere?', a: 'weed', o: ['tulip', 'rose', 'sunflower'] },
]

export function gY1WildGarden(rand: Rand): Question {
  const it = pick(rand, WILD_Q)
  return mcqE(rand, it.q, it.a, it.o)
}

const PLANT_NEEDS = [
  { q: 'What does a plant need to grow?', a: 'water', o: ['a hat', 'a bus', 'a shoe'] },
  { q: 'What drinks up water for the plant?', a: 'roots', o: ['flower', 'petal', 'leaf'] },
  { q: 'Where does a plant stand to grow well?', a: 'in the soil', o: ['on a roof', 'in a bag', 'on a chair'] },
  { q: 'What does a seed need to sprout?', a: 'water', o: ['milk', 'a toy', 'a sock'] },
  { q: 'A plant in a dark cupboard will look...', a: 'pale', o: ['bright', 'red', 'tall'] },
  { q: 'What do roots hold on to?', a: 'soil', o: ['air', 'a road', 'a roof'] },
  { q: 'What does a plant need from the sun?', a: 'light', o: ['dark', 'a bag', 'a hat'] },
]

export function gY1PlantNeeds(rand: Rand): Question {
  const it = pick(rand, PLANT_NEEDS)
  return mcqE(rand, it.q, it.a, it.o)
}

const GROWTH: readonly { p: string; items: string[] }[] = [
  { p: 'Put the growing plant in order', items: ['seed', 'sprout', 'plant', 'flower'] },
  { p: 'What happens as a plant grows?', items: ['seed', 'sprout', 'small plant', 'flower'] },
  { p: 'Order the plant from the very start', items: ['seed', 'sprout', 'leaves', 'flower'] },
  { p: 'A flower starts as a... put in order', items: ['seed', 'seedling', 'plant', 'flower'] },
]

export function gY1GrowOrder(rand: Rand): Question {
  const it = pick(rand, GROWTH)
  return orderQ(it.p, [...it.items])
}

const TREE_Q = [
  { q: 'Which part of a tree is thick and strong?', a: 'trunk', o: ['leaf', 'seed', 'flower'] },
  { q: 'Which part holds the leaves?', a: 'branch', o: ['seed', 'petal', 'grass'] },
  { q: 'Which part drinks up water?', a: 'roots', o: ['flower', 'leaf', 'seed'] },
  { q: 'What covers the trunk of a tree?', a: 'bark', o: ['leaf', 'flower', 'seed'] },
  { q: 'What does a tree lose in autumn?', a: 'leaves', o: ['bark', 'roots', 'seeds'] },
  { q: 'What do squirrels hide in a tree?', a: 'a hole', o: ['a pond', 'a box', 'a bag'] },
  { q: 'Which part of a tree grows into a new tree?', a: 'seed', o: ['bark', 'leaf', 'flower'] },
]

export function gY1TreePart(rand: Rand): Question {
  const it = pick(rand, TREE_Q)
  return mcqE(rand, it.q, it.a, it.o)
}

const TREE_ODD = [
  { q: 'Which one is NOT a tree?', a: 'cup', o: ['oak', 'pine', 'willow'] },
  { q: 'Which one is NOT part of a tree?', a: 'door', o: ['leaf', 'trunk', 'branch'] },
  { q: 'Which one is NOT a plant?', a: 'brick', o: ['grass', 'weed', 'daisy'] },
  { q: 'Which one does not grow into a plant?', a: 'coin', o: ['seed', 'acorn', 'cone'] },
  { q: 'Which one is NOT a tree?', a: 'spoon', o: ['oak', 'pine', 'willow'] },
  { q: 'Which one does NOT belong?', a: 'stone', o: ['rose', 'daisy', 'tulip'] },
]

export function gY1TreeOdd(rand: Rand): Question {
  const it = pick(rand, TREE_ODD)
  return mcqE(rand, it.q, it.a, it.o)
}

const DEC_TF = [
  { s: 'A deciduous tree loses its leaves in autumn.', a: true },
  { s: 'An evergreen tree keeps its leaves in winter.', a: true },
  { s: 'An evergreen tree loses every leaf in autumn.', a: false },
  { s: 'A deciduous tree keeps its leaves all winter.', a: false },
  { s: 'Oak is a deciduous tree.', a: true },
  { s: 'Pine trees are evergreen.', a: true },
  { s: 'A tree with no leaves in winter is always dead.', a: false },
]

export function gY1DeciduousTF(rand: Rand): Question {
  const it = pick(rand, DEC_TF)
  return tfQ('Deciduous or evergreen?', it.s, it.a)
}

/* ======================= Unit 3 · animals ======================= */

/** Emoji-group visual animals (tap/choice body parts of the kingdom). */
const ANIMAL_VIS: readonly { name: string; emoji: string }[] = [
  { name: 'dog', emoji: '🐶' },
  { name: 'cat', emoji: '🐱' },
  { name: 'fish', emoji: '🐟' },
  { name: 'frog', emoji: '🐸' },
  { name: 'duck', emoji: '🦆' },
  { name: 'butterfly', emoji: '🦋' },
  { name: 'bee', emoji: '🐝' },
  { name: 'snail', emoji: '🐌' },
  { name: 'ladybird', emoji: '🐞' },
  { name: 'spider', emoji: '🕷️' },
]

export function gY1NameAnimal(rand: Rand): Question {
  const right = pick(rand, ANIMAL_VIS)
  const wrongs = pickOthers(rand, ANIMAL_VIS, right, 3)
  return mcqE(rand, `Which animal is this? ${right.emoji}`, right.name,
    wrongs.map((w) => w.name),
    { visual: { type: 'emoji-group', emojis: [right.emoji] }, ...say(right.name) })
}

const CLASS_Y1: Record<string, readonly string[]> = {
  mammal: ['dog', 'cat', 'cow', 'horse', 'rabbit', 'mouse'],
  bird: ['duck', 'eagle', 'sparrow', 'penguin', 'owl', 'hen'],
  fish: ['salmon', 'shark', 'tuna', 'goldfish', 'trout'],
  amphibian: ['frog', 'toad', 'newt'],
  reptile: ['snake', 'lizard', 'turtle', 'gecko'],
  insect: ['ant', 'bee', 'butterfly', 'ladybird', 'beetle'],
}

export function gY1ClassMatch(rand: Rand): Question {
  const groups = shuffle(rand, Object.keys(CLASS_Y1)).slice(0, 4)
  return matchQ(rand, 'Match each animal to its group', groups.map((g) => ({
    left: pick(rand, CLASS_Y1[g]), right: g,
  })), { hint: 'Mammals have fur, birds have feathers, fish live in water.' })
}

const CLASS_ODD = [
  { q: 'Which one is NOT a mammal?', a: 'eel', o: ['cow', 'rabbit', 'horse'] },
  { q: 'Which one is NOT a bird?', a: 'butterfly', o: ['owl', 'duck', 'sparrow'] },
  { q: 'Which one is NOT a fish?', a: 'frog', o: ['salmon', 'shark', 'tuna'] },
  { q: 'Which one is NOT an insect?', a: 'spider', o: ['ant', 'bee', 'beetle'] },
  { q: 'Which one is NOT a reptile?', a: 'rabbit', o: ['snake', 'lizard', 'turtle'] },
  { q: 'Which one is NOT an amphibian?', a: 'cat', o: ['frog', 'toad', 'newt'] },
]

export function gY1ClassOdd(rand: Rand): Question {
  const it = pick(rand, CLASS_ODD)
  return mcqE(rand, it.q, it.a, it.o)
}

const HAB_Q = [
  { q: 'Where does a frog live?', a: 'in a pond', o: ['on a roof', 'in a shop', 'in a bag'] },
  { q: 'Where does a bird make its home?', a: 'in a nest', o: ['in a fridge', 'on a road', 'in a box'] },
  { q: 'Where do fish live?', a: 'in water', o: ['in trees', 'on grass', 'in sand'] },
  { q: 'Where do rabbits live?', a: 'in a burrow', o: ['in a pond', 'on a cloud', 'in a nest'] },
  { q: 'Where do bees find food?', a: 'on flowers', o: ['in a pond', 'on rocks', 'in the sea'] },
  { q: 'Where do ants build their home?', a: 'in the ground', o: ['in a tree', 'in a pond', 'on a cloud'] },
  { q: 'Where do caterpillars hide?', a: 'on leaves', o: ['in a pond', 'in a bag', 'on a road'] },
]

export function gY1Habitat(rand: Rand): Question {
  const it = pick(rand, HAB_Q)
  return mcqE(rand, it.q, it.a, it.o)
}

const PET_Q = [
  { q: 'Which of these is often kept as a PEST?', a: 'rat', o: ['dog', 'cat', 'rabbit'] },
  { q: 'Which of these is a farm animal?', a: 'cow', o: ['hamster', 'goldfish', 'mouse'] },
  { q: 'Which animal lives WILD in a forest?', a: 'deer', o: ['cat', 'dog', 'budgie'] },
  { q: 'Which of these is a PEST that eats crops?', a: 'mouse', o: ['horse', 'sheep', 'goat'] },
  { q: 'Which one is a WILD animal?', a: 'fox', o: ['dog', 'cat', 'canary'] },
  { q: 'Which of these is often a PET?', a: 'hamster', o: ['wolf', 'shark', 'tiger'] },
]

export function gY1PetWild(rand: Rand): Question {
  const it = pick(rand, PET_Q)
  return mcqE(rand, it.q, it.a, it.o)
}

const COVER_Q = [
  { q: 'What covers a bird?', a: 'feathers', o: ['fur', 'scales', 'skin'] },
  { q: 'What covers a fish?', a: 'scales', o: ['fur', 'feathers', 'leaves'] },
  { q: 'What covers most mammals?', a: 'fur', o: ['scales', 'feathers', 'bark'] },
  { q: 'A snake is covered in...', a: 'scales', o: ['fur', 'feathers', 'petals'] },
  { q: 'What grows on a caterpillar?', a: 'tiny hairs', o: ['scales', 'bark', 'leaves'] },
  { q: 'A dog keeps warm with its...', a: 'fur', o: ['leaves', 'scales', 'petals'] },
  { q: 'Which animal has FEATHERS?', a: 'owl', o: ['rabbit', 'fish', 'frog'] },
]

export function gY1Cover(rand: Rand): Question {
  const it = pick(rand, COVER_Q)
  return mcqE(rand, it.q, it.a, it.o)
}

/* ======================= Unit 4 · bodies & senses ======================= */

const BODY_Q = [
  { q: 'Which body part helps you see?', a: 'eyes', o: ['ears', 'nose', 'tongue'] },
  { q: 'Which body part helps you hear?', a: 'ears', o: ['eyes', 'hands', 'feet'] },
  { q: 'Which body part helps you smell?', a: 'nose', o: ['mouth', 'knees', 'elbows'] },
  { q: 'Which body part helps you taste?', a: 'tongue', o: ['skin', 'hair', 'neck'] },
  { q: 'Which body part helps you touch?', a: 'hands', o: ['eyes', 'teeth', 'chin'] },
  { q: 'Which body part do you clap with?', a: 'hands', o: ['feet', 'ears', 'nose'] },
  { q: 'Where does your hair grow?', a: 'on your head', o: ['on your hands', 'on your knees', 'on your feet'] },
  { q: 'Which body part do you kick with?', a: 'legs', o: ['arms', 'ears', 'nose'] },
]

export function gY1BodyPart(rand: Rand): Question {
  const it = pick(rand, BODY_Q)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const SENSE_Q = [
  { q: 'Which sense do we use to smell a flower?', a: 'smell', o: ['taste', 'hear', 'see'] },
  { q: 'Which sense tells us a bell is ringing?', a: 'hearing', o: ['taste', 'touch', 'smell'] },
  { q: 'Which sense do we use to see a rainbow?', a: 'sight', o: ['smell', 'touch', 'taste'] },
  { q: 'Which sense tells us ice is cold?', a: 'touch', o: ['see', 'hear', 'smell'] },
  { q: 'Which sense do we use to try an apple?', a: 'taste', o: ['hear', 'see', 'touch'] },
  { q: 'We feel soft fur with our...', a: 'touch', o: ['taste', 'sight', 'hearing'] },
  { q: 'Which sense warns us a bus is coming?', a: 'hearing', o: ['taste', 'smell', 'touch'] },
]

export function gY1SenseUse(rand: Rand): Question {
  const it = pick(rand, SENSE_Q)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const ORGANS: readonly { sense: string; parts: string[] }[] = [
  { sense: 'taste', parts: ['tongue', 'mouth'] },
  { sense: 'smell', parts: ['nose'] },
  { sense: 'hearing', parts: ['ears'] },
  { sense: 'sight', parts: ['eyes'] },
  { sense: 'touch', parts: ['hands', 'skin', 'fingers'] },
]

export function gY1SenseMatch(rand: Rand): Question {
  const chosen = shuffle(rand, ORGANS).slice(0, 4)
  return matchQ(rand, 'Match each sense to the body part you use', chosen.map((s) => ({
    left: pick(rand, s.parts), right: s.sense,
  })))
}

const BODY_TAP = ['eyes', 'nose', 'ears', 'mouth', 'hands', 'legs', 'arms', 'feet']

export function gY1TapBody(rand: Rand): Question {
  const target = pick(rand, BODY_TAP)
  const decoys = pickOthers(rand, BODY_TAP, target, 3)
  const cells = shuffle(rand, [target, target, target, ...decoys])
  return {
    kind: 'tap-count',
    prompt: `Tap every time you see ${target}`,
    target: 3,
    targetEmoji: target,
    cells,
    hint: 'Read each word carefully.',
  }
}

const HUMAN_GROWTH: readonly { p: string; items: string[] }[] = [
  { p: 'Put the stages of growing up in order', items: ['baby', 'child', 'grown-up'] },
  { p: 'How do people grow up?', items: ['baby', 'toddler', 'child', 'grown-up'] },
  { p: 'Order from a baby to a grown-up', items: ['baby', 'child', 'grown-up'] },
]

export function gY1HumanGrow(rand: Rand): Question {
  const it = pick(rand, HUMAN_GROWTH)
  return orderQ(it.p, [...it.items])
}

const BODY_ODD = [
  { q: 'Which one is NOT part of your body?', a: 'door', o: ['elbow', 'knee', 'ankle'] },
  { q: 'Which one does NOT belong?', a: 'spoon', o: ['fingers', 'toes', 'thumb'] },
  { q: 'Which one is NOT a body part?', a: 'brick', o: ['shoulder', 'chin', 'wrist'] },
  { q: 'Which one do we NOT sense with?', a: 'shoe', o: ['eyes', 'ears', 'nose'] },
  { q: 'Which one is NOT part of your face?', a: 'heel', o: ['nose', 'mouth', 'eye'] },
  { q: 'Which one does NOT belong?', a: 'window', o: ['teeth', 'hair', 'skin'] },
]

export function gY1BodyOdd(rand: Rand): Question {
  const it = pick(rand, BODY_ODD)
  return mcqE(rand, it.q, it.a, it.o)
}

const BODY_TF = [
  { s: 'We smell things with our nose.', a: true },
  { s: 'We hear with our eyes.', a: false },
  { s: 'We taste with our tongue.', a: true },
  { s: 'We touch things with our ears.', a: false },
  { s: 'We see with our eyes.', a: true },
  { s: 'Our knees help us kick a ball.', a: true },
  { s: 'Fish have four legs.', a: false },
  { s: 'We have five fingers on each hand.', a: true },
]

export function gY1BodyTF(rand: Rand): Question {
  const it = pick(rand, BODY_TF)
  return tfQ('True or false?', it.s, it.a)
}

const SENSE_WORDS = [
  'We see with our eyes',
  'We hear with our ears',
  'We smell with our nose',
  'We taste with our tongue',
  'We touch with our hands',
  'Flowers smell sweet',
  'Ice feels cold',
  'Bells sound loud',
]

export function gY1SenseSpeak(rand: Rand): Question {
  const target = pick(rand, SENSE_WORDS)
  return speakQ('Say the sentence out loud', target, { hint: 'Speak slowly and clearly.' })
}

/* ==================== Unit 5 · what animals eat ==================== */

const DIET_NAME = [
  { q: 'A lion that eats meat is a...', a: 'carnivore', o: ['herbivore', 'omnivore', 'plant'] },
  { q: 'A rabbit that eats plants is a...', a: 'herbivore', o: ['carnivore', 'omnivore', 'meat'] },
  { q: 'A pig that eats plants AND meat is a...', a: 'omnivore', o: ['carnivore', 'herbivore', 'plant'] },
  { q: 'A tiger is a...', a: 'carnivore', o: ['herbivore', 'omnivore', 'grower'] },
  { q: 'A horse only eats plants, so it is a...', a: 'herbivore', o: ['carnivore', 'omnivore', 'hunter'] },
  { q: 'A mouse eats cheese AND seeds, so it is a...', a: 'omnivore', o: ['carnivore', 'herbivore', 'plant'] },
]

export function gY1DietName(rand: Rand): Question {
  const it = pick(rand, DIET_NAME)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const DIET_CLASS: Record<string, readonly string[]> = {
  carnivore: ['lion', 'tiger', 'shark', 'snake'],
  herbivore: ['rabbit', 'horse', 'cow', 'deer'],
  omnivore: ['pig', 'mouse', 'rat', 'bear'],
}

export function gY1DietMatch(rand: Rand): Question {
  const groups = shuffle(rand, Object.keys(DIET_CLASS))
  return matchQ(rand, 'Match each animal to what it eats', groups.map((g) => ({
    left: pick(rand, DIET_CLASS[g]), right: g,
  })), { hint: 'Meat only = carnivore, plants only = herbivore, both = omnivore.' })
}

const DIET_FOOD = [
  { q: 'What does a cow eat?', a: 'grass', o: ['meat', 'fish', 'bread'] },
  { q: 'What does a lion eat?', a: 'meat', o: ['grass', 'seeds', 'leaves'] },
  { q: 'What does a rabbit eat?', a: 'carrots', o: ['steak', 'fish', 'cake'] },
  { q: 'What does a deer eat?', a: 'leaves', o: ['meat', 'cheese', 'fish'] },
  { q: 'What does a shark eat?', a: 'fish', o: ['grass', 'seeds', 'leaves'] },
  { q: 'What does a horse eat?', a: 'hay', o: ['meat', 'fish', 'crisps'] },
  { q: 'What does a goat eat?', a: 'plants', o: ['meat', 'fish', 'cake'] },
]

export function gY1DietFood(rand: Rand): Question {
  const it = pick(rand, DIET_FOOD)
  return mcqE(rand, it.q, it.a, it.o)
}

const DIET_ODD = [
  { q: 'Which one does a carnivore NOT eat?', a: 'apple', o: ['steak', 'mouse', 'fish'] },
  { q: 'Which one is NOT food for a rabbit?', a: 'pizza', o: ['carrot', 'grass', 'straw'] },
  { q: 'Which one is NOT food for a cow?', a: 'fish', o: ['grass', 'hay', 'straw'] },
  { q: 'Which one does a herbivore NOT eat?', a: 'meat', o: ['grass', 'leaves', 'seeds'] },
  { q: 'Which one is NOT eaten by a shark?', a: 'seeds', o: ['fish', 'seal', 'crab'] },
  { q: 'Which one is NOT food for a bird?', a: 'steak', o: ['seeds', 'worms', 'grass'] },
]

export function gY1DietOdd(rand: Rand): Question {
  const it = pick(rand, DIET_ODD)
  return mcqE(rand, it.q, it.a, it.o)
}

const DIET_WORDS = [
  'Lions eat meat',
  'Rabbits eat carrots',
  'Cows eat grass',
  'Tigers are carnivores',
  'Horses are herbivores',
  'Pigs are omnivores',
  'Deer eat leaves',
  'Sharks eat fish',
]

export function gY1DietSpeak(rand: Rand): Question {
  const target = pick(rand, DIET_WORDS)
  return speakQ('Say the sentence out loud', target, { hint: 'Speak slowly and clearly.' })
}

/* ==================== Unit 6 · everyday materials ==================== */

const OBJ_MAT = [
  { q: 'What is a chair mostly made of?', a: 'wood', o: ['glass', 'metal', 'paper'] },
  { q: 'What is a window made of?', a: 'glass', o: ['wood', 'cloth', 'rock'] },
  { q: 'What is a spoon made of?', a: 'metal', o: ['paper', 'plastic', 'cloth'] },
  { q: 'What is a book made of?', a: 'paper', o: ['metal', 'glass', 'rock'] },
  { q: 'What is a coat made of?', a: 'cloth', o: ['glass', 'rock', 'metal'] },
  { q: 'What do we build a wall with?', a: 'brick', o: ['glass', 'cloth', 'paper'] },
  { q: 'What is a bottle made of?', a: 'plastic', o: ['paper', 'cloth', 'stone'] },
]

export function gY1ObjectMaterial(rand: Rand): Question {
  const it = pick(rand, OBJ_MAT)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const MAT_Q = [
  { q: 'A window is made of which material?', a: 'glass', o: ['wood', 'brick', 'cloth'] },
  { q: 'A book is made of which material?', a: 'paper', o: ['glass', 'metal', 'rock'] },
  { q: 'A brick wall is built with...', a: 'brick', o: ['glass', 'water', 'cloth'] },
  { q: 'Which material can you see through?', a: 'glass', o: ['wood', 'brick', 'metal'] },
  { q: 'A bucket is often made of...', a: 'plastic', o: ['wood', 'brick', 'stone'] },
  { q: 'Which material is shiny and can wrap food?', a: 'foil', o: ['wood', 'cloth', 'soil'] },
  { q: 'Which material comes from trees?', a: 'wood', o: ['glass', 'metal', 'plastic'] },
  { q: 'A scarf is made of...', a: 'cloth', o: ['wood', 'glass', 'brick'] },
]

export function gY1NameMaterial(rand: Rand): Question {
  const it = pick(rand, MAT_Q)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const PROP_Q = [
  { q: 'Which property does a sponge have?', a: 'absorbent', o: ['shiny', 'rough', 'stiff'] },
  { q: 'Which property does an umbrella have?', a: 'waterproof', o: ['dull', 'bendy', 'rough'] },
  { q: 'Which material lets light through?', a: 'transparent', o: ['opaque', 'metal', 'wood'] },
  { q: 'Which property does a rock have?', a: 'hard', o: ['bendy', 'soft', 'stretchy'] },
  { q: 'Which property does a rubber band have?', a: 'stretchy', o: ['rough', 'stiff', 'dull'] },
  { q: 'Which property does sandpaper have?', a: 'rough', o: ['shiny', 'smooth', 'wet'] },
  { q: 'Which property does a table have?', a: 'stiff', o: ['wet', 'bendy', 'soft'] },
  { q: 'Which property does a mirror have?', a: 'shiny', o: ['dull', 'rough', 'soft'] },
]

export function gY1Property(rand: Rand): Question {
  const it = pick(rand, PROP_Q)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const PROP_PAIRS: readonly { l: string; r: string }[] = [
  { l: 'glass', r: 'transparent' },
  { l: 'window', r: 'transparent' },
  { l: 'sponge', r: 'absorbent' },
  { l: 'towel', r: 'absorbent' },
  { l: 'raincoat', r: 'waterproof' },
  { l: 'boots', r: 'waterproof' },
  { l: 'rubber band', r: 'stretchy' },
  { l: 'rope', r: 'stretchy' },
  { l: 'stone', r: 'rough' },
  { l: 'brick', r: 'rough' },
  { l: 'mirror', r: 'shiny' },
  { l: 'spoon', r: 'shiny' },
  { l: 'rock', r: 'hard' },
  { l: 'table', r: 'stiff' },
]

export function gY1PropMatch(rand: Rand): Question {
  const rights = [...new Set(PROP_PAIRS.map((p) => p.r))]
  const chosenRights = shuffle(rand, rights).slice(0, 4)
  const pairs = chosenRights.map((r) =>
    pick(rand, PROP_PAIRS.filter((p) => p.r === r)),
  )
  return matchQ(rand, 'Match each thing to its property', pairs.map((p) => ({ left: p.l, right: p.r })),
    { hint: 'Think about how each thing feels or what it does.' })
}

const MAT_TAP = ['wood', 'glass', 'metal', 'paper', 'brick', 'cloth', 'plastic', 'water']

export function gY1TapMaterial(rand: Rand): Question {
  const target = pick(rand, MAT_TAP)
  const decoys = pickOthers(rand, MAT_TAP, target, 3)
  const cells = shuffle(rand, [target, target, target, ...decoys])
  return {
    kind: 'tap-count',
    prompt: `Tap every time you see ${target}`,
    target: 3,
    targetEmoji: target,
    cells,
    hint: 'Read each word carefully.',
  }
}

const GROUP_Q = [
  { q: 'Which of these is a MATERIAL?', a: 'metal', o: ['dog', 'flower', 'cake'] },
  { q: 'Which of these is NOT a material?', a: 'rabbit', o: ['wood', 'glass', 'brick'] },
  { q: 'Which of these comes from a plant?', a: 'wood', o: ['glass', 'metal', 'plastic'] },
  { q: 'Which of these can be found in the ground?', a: 'rock', o: ['cloth', 'paper', 'plastic'] },
  { q: 'Which of these is a LIQUID material?', a: 'water', o: ['wood', 'brick', 'glass'] },
  { q: 'Which of these is used to make clothes?', a: 'cloth', o: ['brick', 'glass', 'rock'] },
]

export function gY1GroupMat(rand: Rand): Question {
  const it = pick(rand, GROUP_Q)
  return mcqE(rand, it.q, it.a, it.o)
}

/* ====================== Unit 7 · materials at work ===================== */

const CHOOSE_Q = [
  { q: 'What is the best material for a window?', a: 'glass', o: ['brick', 'paper', 'cloth'] },
  { q: 'What is the best material for a bag?', a: 'cloth', o: ['glass', 'rock', 'metal'] },
  { q: 'What is the best material for a book?', a: 'paper', o: ['glass', 'metal', 'rock'] },
  { q: 'What is the best material for a spoon?', a: 'metal', o: ['paper', 'cloth', 'grass'] },
  { q: 'What is the best material for a raincoat?', a: 'plastic', o: ['paper', 'glass', 'brick'] },
  { q: 'What is the best material for a shelf?', a: 'wood', o: ['cloth', 'water', 'paper'] },
  { q: 'What is the best material for a cup?', a: 'glass', o: ['paper', 'grass', 'cloth'] },
  { q: 'What is the best material for a pencil?', a: 'wood', o: ['glass', 'water', 'cloth'] },
]

export function gY1ChooseMaterial(rand: Rand): Question {
  const it = pick(rand, CHOOSE_Q)
  return mcqE(rand, it.q, it.a, it.o)
}

const TEST_Q = [
  { q: 'How do we test if a material is waterproof?', a: 'pour water on it', o: ['look at it once', 'weigh it twice', 'count the lines'] },
  { q: 'How do we find out if something is transparent?', a: 'look through it', o: ['lick it', 'weigh it twice', 'count the letters'] },
  { q: 'How do we test if a material stretches?', a: 'pull it gently', o: ['sit on it', 'look away', 'count the dots'] },
  { q: 'How do we find out if something is rough?', a: 'rub it with a finger', o: ['listen to it', 'smell it twice', 'count the lines'] },
  { q: 'How do we test if a material bends?', a: 'bend it with our hands', o: ['hide it in a bag', 'count the letters', 'read it aloud'] },
  { q: 'How do we test which material is stronger?', a: 'try to tear it', o: ['only look at it', 'smell it once', 'count the colours'] },
]

export function gY1BestTest(rand: Rand): Question {
  const it = pick(rand, TEST_Q)
  return mcqE(rand, it.q, it.a, it.o)
}

const BEND_TF = [
  { s: 'A plastic ruler bends.', a: true },
  { s: 'A rock is bendy.', a: false },
  { s: 'A rubber band stretches when you pull it.', a: true },
  { s: 'Glass is soft and bendy.', a: false },
  { s: 'Paper can bend.', a: true },
  { s: 'A brick is stiff.', a: true },
  { s: 'Wood bends easily like rubber.', a: false },
]

export function gY1BendStretch(rand: Rand): Question {
  const it = pick(rand, BEND_TF)
  return tfQ('Bendy or stiff?', it.s, it.a)
}

const USE_MAP: readonly { l: string; r: string }[] = [
  { l: 'window', r: 'glass' },
  { l: 'cup', r: 'glass' },
  { l: 'book', r: 'paper' },
  { l: 'note', r: 'paper' },
  { l: 'spoon', r: 'metal' },
  { l: 'bucket', r: 'metal' },
  { l: 'chair', r: 'wood' },
  { l: 'shelf', r: 'wood' },
  { l: 'coat', r: 'cloth' },
  { l: 'bag', r: 'cloth' },
  { l: 'wall', r: 'brick' },
  { l: 'path', r: 'brick' },
]

export function gY1UseMatch(rand: Rand): Question {
  const rights = [...new Set(USE_MAP.map((p) => p.r))]
  const chosenRights = shuffle(rand, rights).slice(0, 4)
  const pairs = chosenRights.map((r) =>
    pick(rand, USE_MAP.filter((p) => p.r === r)),
  )
  return matchQ(rand, 'Match each thing to the material it is made from',
    pairs.map((p) => ({ left: p.l, right: p.r })))
}

const AROUND_Q = [
  { q: 'The kitchen tap runs with...', a: 'water', o: ['brick', 'cloth', 'rock'] },
  { q: 'A front door is often made of...', a: 'wood', o: ['water', 'paper', 'grass'] },
  { q: 'A mirror on the wall is made of...', a: 'glass', o: ['cloth', 'soil', 'grass'] },
  { q: 'A doormat can be made of...', a: 'rubber', o: ['glass', 'water', 'paper'] },
  { q: 'A warm jumper is made of...', a: 'cloth', o: ['glass', 'rock', 'brick'] },
  { q: 'A brick house is built with...', a: 'brick', o: ['cloth', 'water', 'grass'] },
]

export function gY1AroundYou(rand: Rand): Question {
  const it = pick(rand, AROUND_Q)
  return mcqE(rand, it.q, it.a, it.o)
}

/* ===================== Unit 8 · seasons & weather ===================== */

const SEASON_ORDER: readonly { p: string; items: string[] }[] = [
  { p: 'Put the seasons in order, starting with spring', items: ['spring', 'summer', 'autumn', 'winter'] },
  { p: 'Order the seasons, starting with winter', items: ['winter', 'spring', 'summer', 'autumn'] },
  { p: 'Starting from summer, list the seasons', items: ['summer', 'autumn', 'winter', 'spring'] },
  { p: 'Order the seasons, starting with autumn', items: ['autumn', 'winter', 'spring', 'summer'] },
  { p: 'Put the seasons in order from the start of the year', items: ['winter', 'spring', 'summer', 'autumn'] },
  { p: 'What comes after spring? Order the seasons', items: ['summer', 'autumn', 'winter', 'spring'] },
]

export function gY1SeasonOrder(rand: Rand): Question {
  const it = pick(rand, SEASON_ORDER)
  return orderQ(it.p, [...it.items], { visual: { type: 'emoji-group', emojis: ['🌸', '☀️', '🍂', '❄️'] } })
}

const SEASON_Q = [
  { q: 'Which season is the hottest?', a: 'summer', o: ['winter', 'autumn', 'spring'] },
  { q: 'Which season is the coldest?', a: 'winter', o: ['summer', 'spring', 'autumn'] },
  { q: 'Which season has the shortest days?', a: 'winter', o: ['summer', 'spring', 'autumn'] },
  { q: 'In which season do leaves fall from trees?', a: 'autumn', o: ['spring', 'summer', 'winter'] },
  { q: 'In which season do flowers bloom?', a: 'spring', o: ['autumn', 'winter', 'summer'] },
  { q: 'The days start to get longer. Which season is coming?', a: 'spring', o: ['autumn', 'summer', 'winter'] },
  { q: 'Which season comes after winter?', a: 'spring', o: ['autumn', 'summer', 'winter'] },
  { q: 'When do we see the most sunshine?', a: 'summer', o: ['winter', 'autumn', 'spring'] },
]

export function gY1SeasonWeather(rand: Rand): Question {
  const it = pick(rand, SEASON_Q)
  return mcqE(rand, it.q, it.a, it.o, { visual: { type: 'emoji-group', emojis: ['🌞'] } })
}

const SEASON_MAP: readonly { l: string; r: string }[] = [
  { l: 'leaves fall', r: 'autumn' },
  { l: 'trees lose leaves', r: 'autumn' },
  { l: 'flowers bloom', r: 'spring' },
  { l: 'buds open', r: 'spring' },
  { l: 'hot sunny days', r: 'summer' },
  { l: 'longest days', r: 'summer' },
  { l: 'cold and snowy', r: 'winter' },
  { l: 'shortest days', r: 'winter' },
]

export function gY1SeasonMatch(rand: Rand): Question {
  const rights = [...new Set(SEASON_MAP.map((p) => p.r))]
  const chosenRights = shuffle(rand, rights).slice(0, 3)
  const pairs = chosenRights.map((r) =>
    pick(rand, SEASON_MAP.filter((p) => p.r === r)),
  )
  return matchQ(rand, 'Match each sign to the season', pairs.map((p) => ({ left: p.l, right: p.r })),
    { visual: { type: 'emoji-group', emojis: ['🌸', '☀️', '🍂', '❄️'] } })
}

const SEASON_CLOTHES = [
  { q: 'What do we wear in winter?', a: 'coat', o: ['shorts', 'cap', 'sandals'] },
  { q: 'What do we wear when it rains?', a: 'raincoat', o: ['shorts', 'cap', 'sandals'] },
  { q: 'What do we wear in summer?', a: 'shorts', o: ['coat', 'gloves', 'scarf'] },
  { q: 'What do we wear on our head when it is cold?', a: 'hat', o: ['shorts', 'sandals', 'socks'] },
  { q: 'What do we wear on our hands in winter?', a: 'gloves', o: ['shorts', 'sandals', 'socks'] },
  { q: 'What do we wear on our feet in the rain?', a: 'boots', o: ['hat', 'gloves', 'scarf'] },
]

export function gY1SeasonClothes(rand: Rand): Question {
  const it = pick(rand, SEASON_CLOTHES)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const WEATHER_ODD = [
  { q: 'Which one is NOT a kind of weather?', a: 'table', o: ['rain', 'snow', 'wind'] },
  { q: 'Which one does NOT belong?', a: 'spoon', o: ['sunny', 'windy', 'cloudy'] },
  { q: 'Which one is NOT weather?', a: 'chair', o: ['fog', 'hail', 'storm'] },
  { q: 'Which one is NOT weather?', a: 'door', o: ['rain', 'snow', 'ice'] },
  { q: 'Which word does NOT describe the sky?', a: 'square', o: ['grey', 'blue', 'cloudy'] },
  { q: 'Which one is NOT weather?', a: 'brick', o: ['wind', 'fog', 'rain'] },
]

export function gY1WeatherOdd(rand: Rand): Question {
  const it = pick(rand, WEATHER_ODD)
  return mcqE(rand, it.q, it.a, it.o)
}

const W_NAME = [
  { q: 'What do we call tiny frozen drops falling from the sky?', a: 'snow', o: ['rain', 'wind', 'fog'] },
  { q: 'What do we call wet weather with clouds and drops?', a: 'rain', o: ['snow', 'sunny', 'fog'] },
  { q: 'What do we call white cold stuff on the ground in winter?', a: 'snow', o: ['rain', 'wind', 'sun'] },
  { q: 'What do we call moving air?', a: 'wind', o: ['rain', 'snow', 'fog'] },
  { q: 'What do we call a very bright, hot day?', a: 'sunny', o: ['rainy', 'snowy', 'foggy'] },
  { q: 'What do we call tiny water drops in the air near the ground?', a: 'fog', o: ['rain', 'wind', 'snow'] },
  { q: 'What do we call a sky with no clouds?', a: 'sunny', o: ['rainy', 'cloudy', 'foggy'] },
]

export function gY1WeatherName(rand: Rand): Question {
  const it = pick(rand, W_NAME)
  return mcqE(rand, it.q, it.a, it.o, say(it.a))
}

const DAY = [
  { q: 'When are the days longest?', a: 'in summer', o: ['in winter', 'in autumn', 'in spring'] },
  { q: 'When are the nights longest?', a: 'in winter', o: ['in summer', 'in spring', 'in autumn'] },
  { q: 'When does it get dark earliest?', a: 'in winter', o: ['in summer', 'in spring', 'in autumn'] },
  { q: 'When is there the most daylight?', a: 'in summer', o: ['in winter', 'in spring', 'in autumn'] },
  { q: 'Days start to get longer after...', a: 'winter', o: ['summer', 'autumn', 'spring'] },
  { q: 'When do the mornings stay dark the longest?', a: 'in winter', o: ['in summer', 'in spring', 'in autumn'] },
]

export function gY1DayLength(rand: Rand): Question {
  const it = pick(rand, DAY)
  return mcqE(rand, it.q, it.a, it.o, { visual: { type: 'emoji-group', emojis: ['🌅'] } })
}
