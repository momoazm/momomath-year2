import type { Question, UnitDef } from '../types'
import {
  PICTURE_BANK,
  makeLesson,
  matchQ,
  mcqE,
  mcqFixed,
  orderQ,
  pick,
  say,
  shuffle,
  tilesQ,
  tfQ,
  unitDef,
  type Rand,
} from './helpers'

/* ---------- r5l1: نبي الله شعيب ---------- */

const SHUAIB_MATCH = [
  { left: 'شعيب', right: '🧔 نبي مدين' },
  { left: 'الميزان', right: '⚖️ العدل في الكيل' },
  { left: 'الغش', right: '🚫 نهى عنه شعيب' },
  { left: 'الدعوة', right: '📿 دعا قومه لعبادة الله' },
]

function r5ShuaibMatch(rand: Rand): Question {
  const pairs = shuffle(rand, SHUAIB_MATCH).slice(0, 4)
  return matchQ(rand, 'قصة شعيب عليه السلام. صل كل كلمة بمعناها', pairs)
}

const SHUAIB_TF: Array<[string, boolean]> = [
  ['دعا شعيب قومه إلى عبادة الله وحده', true],
  ['نهى شعيب قومه عن الغش في الميزان', true],
  ['كان قوم شعيب يوفون الكيل والميزان', false],
  ['نتعلم من شعيب الأمانة والعدل', true],
]

function r5ShuaibTF(rand: Rand): Question {
  const [statement, answer] = pick(rand, SHUAIB_TF)
  return tfQ('قصة شعيب. هل الجملة صحيحة؟', statement, answer)
}

const r5l1 = makeLesson(
  'r5l1',
  'نبي الله شعيب',
  ['EG-Rl-2S', 'EG-Rl-2R'],
  'knuckles',
  'العدل في الميزان!',
  'قصة شعيب عليه السلام: دعا قومه لعبادة الله ونهاهم عن الغش في الميزان.',
  [r5ShuaibMatch, r5ShuaibTF],
)

/* ---------- r5l2: نبي الله موسى ---------- */

function r5MusaOrder(rand: Rand): Question {
  void rand
  const steps = ['ولد موسى في مصر', 'ألقته أمه في النيل', 'كلمه الله عند الجبل', 'شق البحر بعصاه', 'نجا وقومه من فرعون']
  return orderQ('رتب أحداث قصة موسى عليه السلام', steps, say(steps.join(' ثم ')))
}

const MUSA_MATCH = [
  { left: 'العصا', right: '🪄 معجزة موسى' },
  { left: 'البحر', right: '🌊 انشق لموسى' },
  { left: 'فرعون', right: '👑 طغى وتكبر' },
  { left: 'هارون', right: '🧔 أخو موسى ومساعده' },
  { left: 'التوراة', right: '📖 كتاب موسى' },
]

function r5MusaMatch(rand: Rand): Question {
  const pairs = shuffle(rand, MUSA_MATCH).slice(0, 4)
  return matchQ(rand, 'قصة موسى عليه السلام. صل كل كلمة بما يناسبها', pairs)
}

const r5l2 = makeLesson(
  'r5l2',
  'نبي الله موسى',
  ['EG-Rl-2S', 'EG-Rl-2L'],
  'sonic',
  'العصا والبحر!',
  'قصة موسى عليه السلام: من النيل إلى شق البحر. الله ينصر عباده الصالحين.',
  [r5MusaOrder, r5MusaMatch],
)

/* ---------- r5l3: إبراهيم ونوح ويوسف ---------- */

const PROPHETS_MATCH = [
  { left: 'إبراهيم', right: '🕋 بنى الكعبة' },
  { left: 'نوح', right: PICTURE_BANK.سفينة },
  { left: 'يوسف', right: '🌟 رأى أحد عشر كوكبا' },
  { left: 'إسماعيل', right: '💧 زمزم' },
]

function r5ProphetsMatch(rand: Rand): Question {
  const pairs = shuffle(rand, PROPHETS_MATCH).slice(0, 4)
  return matchQ(rand, 'صل كل نبي بأشهر قصته', pairs)
}

const PROPHET_TILES = ['موسى', 'نوح', 'شعيب', 'يوسف', 'آدم']

function r5ProphetTiles(rand: Rand): Question {
  const w = pick(rand, PROPHET_TILES)
  return tilesQ('اكتب اسم نبي من الأنبياء', w, 'عليهم السلام جميعا')
}

function r5ProphetPick(rand: Rand): Question {
  const item = pick(rand, [
    { q: 'من بنى الكعبة مع ابنه إسماعيل؟', a: 'إبراهيم', others: ['موسى', 'نوح', 'يوسف'] },
    { q: 'من صنع السفينة بأمر الله؟', a: 'نوح', others: ['شعيب', 'موسى', 'آدم'] },
    { q: 'من شق الله له البحر؟', a: 'موسى', others: ['يوسف', 'إبراهيم', 'شعيب'] },
  ])
  return mcqE(rand, item.q, item.a, item.others, say(item.a))
}

const r5l3 = makeLesson(
  'r5l3',
  'أنبياء الله',
  ['EG-Rl-2S', 'EG-Rl-2W'],
  'tails',
  'قصص الأنبياء!',
  'إبراهيم بنى الكعبة ونوح صنع السفينة ويوسف الصديق. قصص نتعلم منها.',
  [r5ProphetsMatch, r5ProphetTiles, r5ProphetPick],
)

/* ---------- r5boss ---------- */

const r5boss = makeLesson(
  'r5boss',
  'بطل القصص',
  ['EG-Rl-2S', 'EG-Rl-2R', 'EG-Rl-2W'],
  'eggman',
  'تحدي البطل!',
  'شعيب وموسى وإبراهيم ونوح ويوسف: قصص الأنبياء كلها معا.',
  [r5ShuaibMatch, r5MusaOrder, r5ProphetsMatch, r5ProphetTiles],
  r5MusaMatch,
)

export const UNIT_R5: UnitDef = unitDef(
  'r5',
  5,
  'قصص الأنبياء',
  'دين · قصص قرآنية · شعيب وموسى وإبراهيم ونوح',
  '#0d7a5f',
  '📜',
  [r5l1, r5l2, r5l3, r5boss],
)
