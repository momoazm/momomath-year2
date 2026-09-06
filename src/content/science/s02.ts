import type { Question } from '../types'
import {
  LIVING_BANK, mcqE, matchQ, orderQ, tfQ,
  pick, pickOthers, shuffle, type Gen, type Rand,
  makeLesson, unitDef,
} from './helpers'

const HEALTHY = ['do regular exercise', 'eat fruit and vegetables', 'wash your hands many times a day', 'sleep well at night']
const UNEHEALTHY = ['never wash hands', 'only eat sweets all day', 'never run or play', 'never sleep']
const FEVER_SIGNS = ['fever', 'coughing a lot', 'runny nose', 'feeling cold and hot']
const NOT_ILL = ['a big smile', 'a full tummy', 'playing with toys', 'a bright red face']
const COVERINGS: Record<string, string> = {
  fish: '🐟 scales', dog: '🐶 fur', cat: '🐱 fur', bird: '🐦 feathers', snake: '🐍 scales',
  frog: '🐸 wet skin', whale: '🐋 blubber', elephant: '🐘 thick skin', giraffe: '🦒 spots',
}
const BABY: Record<string, string> = {
  dog: '🐶 puppy', cat: '🐱 kitten', cow: '🐮 calf', sheep: '🐑 lamb',
  duck: '🦆 duckling', horse: '🐴 foal', pig: '🐷 piglet', goat: '🐐 kid',
}
const TOOTH_FUNC: Record<string, string> = {
  'front teeth (incisors)': 'cut food', 'pointed teeth (canines)': 'tear food', 'back teeth (molars)': 'grind food',
}

function gHealthy(rand: Rand): Question {
  return mcqE(rand, 'Which habit helps you stay healthy and strong?', pick(rand, HEALTHY), UNEHEALTHY, { visual: { type: 'emoji-group', emojis: ['🍎', '🏃', '🦷', '😴'] } })
}
function gIllness(rand: Rand): Question {
  const a = pick(rand, FEVER_SIGNS)
  return mcqE(rand, 'Which is a sign that you might be ill?', a, NOT_ILL, { visual: { type: 'emoji-group', emojis: ['🤒'] } })
}
function gIllnessTF(rand: Rand): Question {
  const a = pick(rand, NOT_ILL)
  return tfQ('True or false: you might be ill tells.', a + ' means a person is probably ill.', false)
}
function gCoverings(rand: Rand): Question {
  const keys = shuffle(rand, Object.keys(COVERINGS)).slice(0, 4)
  return matchQ(rand, 'Match the animal to its body covering',
    keys.map((a) => ({ left: a, right: COVERINGS[a] })),
    { visual: { type: 'emoji-group', emojis: ['🐾'] } },
  )
}
function gBabies(rand: Rand): Question {
  const a = pick(rand, Object.keys(BABY))
  return matchQ(rand, 'What is the baby of this animal called?', [
    { left: a, right: BABY[a] },
    ...pickOthers(rand, Object.keys(BABY), a, 3).map((b) => ({ left: b, right: BABY[b] })),
  ])
}
function gTeeth(rand: Rand): Question {
  const a = pick(rand, Object.keys(TOOTH_FUNC))
  return matchQ(rand, 'Match the tooth type to what it does', [
    { left: a, right: TOOTH_FUNC[a] },
    ...pickOthers(rand, Object.keys(TOOTH_FUNC), a, 2).map((b) => ({ left: b, right: TOOTH_FUNC[b] })),
  ])
}
function gTeethCareTF(rand: Rand): Question {
  return tfQ('Dental care', 'You should brush your teeth twice a day once in the morning and once before bed.', true, { visual: { type: 'emoji-group', emojis: ['🦷', '🪥'] } })
}
function gGrow(rand: Rand): Question {
  return orderQ('Put a persons life stages in order, from youngest to oldest', ['baby', 'toddler', 'child', 'adult'], { visual: { type: 'emoji-group', emojis: ['🧒'] } })
}

const S2 = [gHealthy, gIllness, gIllnessTF, gCoverings, gBabies, gTeeth, gTeethCareTF, gGrow]

const lessons = [
  makeLesson('s2l1', 'Stay Healthy', ['2Bp.01'], 'cream', 'Fuel up!', 'Eat fruit and veg, move your body, wash hands and sleep well to stay healthy.', [gHealthy, gIllness], gHealthy),
  makeLesson('s2l2', 'Signs of Illness', ['2Bp.02'], 'amy', 'Under the weather?', 'A fever, cough or sniffles tells your body it is fighting off bugs.', [gIllness, gIllnessTF], gIllness),
  makeLesson('s2l3', 'Growing Up', ['2Bp.03'], 'tails', 'Growing tall!', 'Babies grow into adults and people and animals change as they get older.', [gBabies, gGrow], gGrow),
  makeLesson('s2l4', 'Body Coverings', ['2Bs.01'], 'knuckles', 'Skin deep!', 'Skins, fur, feathers and scales keep animals comfy in their homes.', [gCoverings, gBabies], gCoverings),
  makeLesson('s2l5', 'Teeth Power', ['2Bs.02'], 'silver', 'Chompers!', 'Incisors cut, canines tear, molars grind and brush twice for strong teeth.', [gTeeth, gTeethCareTF], gTeeth),
]

const boss = makeLesson('s2boss', 'Health Boss', ['2Bp.01-04', '2Bs.01-02'], 'eggman', 'BOSS TIME!', 'Eggman made a sickness ray! Answer healthy habits, growing-up and teeth to beat it.', [gHealthy, gIllness, gGrow, gTeeth, gCoverings], gTeeth)

export const UNIT_S2 = unitDef('s2', 2, 'Humans & Health', 'Cambridge 2Bp (diet, hygiene, illness, growing) + 2Bs (teeth)', '#ff9600', '🧍', [...lessons, boss])
