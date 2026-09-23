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
  { left: 'مدين', right: '🏘️ قوم شعيب' },
  { left: 'الصاع', right: '📏 يوفون به الكيل' },
  { left: 'الكيل', right: '📦 لا يظلمون فيه' },
  { left: 'الأمانة', right: '🔒 يحفظونها في البيع' },
  { left: 'النخلة', right: '🌴 من نعم الله عليهم' },
  { left: 'الوحي', right: '😇 أوحي إلى شعيب' },
  { left: 'التوحيد', right: '☝️ دعا إليه شعيب' },
  { left: 'قوم شعيب', right: '😠 كذبوا نبيهم' },
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
  ['دعا شعيب قومه إلى ترك الأصنام', true],
  ['كذب قوم شعيب نبيهم شعيبا', true],
  ['اتبع قوم شعيب نبيهم فكلهم آمنوا', false],
  ['نهى شعيب قومه عن الظلم والبغي', true],
  ['شعيب نبي من أنبياء الله', true],
  ['كان شعيب يأمر بالصدق والأمانة', true],
  ['عذب المشركون المؤمنين في مدين', true],
  ['كان قوم شعيب يحبون العدل ويوفون الوعد', false],
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

const MUSA_ORDER: { label: string; items: string[] }[] = [
  { label: 'رتب أحداث قصة موسى عليه السلام', items: ['ولد موسى في مصر', 'ألقته أمه في النيل', 'كلمه الله عند الجبل', 'شق البحر بعصاه', 'نجا وقومه من فرعون'] },
  { label: 'رتب نجاة موسى من فرعون', items: ['ولد موسى في بني إسرائيل', 'أودعته أمه في التبن', 'وجدته ابنة فرعون', 'تربى في قصر فرعون'] },
  { label: 'رتب لقاء الله عند الطور', items: ['حمل موسى العصا', 'سار ببني إسرائيل', 'أتى إلى طور سينين', 'كلمه الله تعالى'] },
  { label: 'رتب خروج بني إسرائيل', items: ['أخرجهم موسى من مصر', 'ساروا في الليل', 'فرعون طاردهم', 'شق الله البحر لهم'] },
  { label: 'رتب معجزة موسى', items: ['رفع موسى عصاه', 'ضرب بها البحر', 'انشق البحر', 'عبر بنو إسرائيل'] },
  { label: 'رتب قصة التوراة', items: ['صعد موسى إلى الجبل', 'أخذ التوراة من الله', 'رجع إلى قومه', 'لقاهم يعبدون العجل'] },
]

function r5MusaOrder(rand: Rand): Question {
  const task = pick(rand, MUSA_ORDER)
  return orderQ(task.label, task.items, say(task.items.join(' ثم ')))
}

const MUSA_MATCH = [
  { left: 'العصا', right: '🪄 معجزة موسى' },
  { left: 'البحر', right: '🌊 انشق لموسى' },
  { left: 'فرعون', right: '👑 طغى وتكبر' },
  { left: 'هارون', right: '🧔 أخو موسى ومساعده' },
  { left: 'التوراة', right: '📖 كتاب موسى' },
  { left: 'النيل', right: '🌊 أودعه فيه أمه' },
  { left: 'ابنة فرعون', right: '👩 رعته في القصر' },
  { left: 'بني إسرائيل', right: '👥 قوم موسى' },
  { left: 'الطور', right: '⛰️ كلمه الله فيه' },
  { left: 'السحرة', right: '🎩 آمنوا بموسى' },
  { left: 'العجل', right: '🐄 عبدوه بعد موسى' },
  { left: 'مدين', right: '🏠 هاجر إليها موسى' },
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
  { left: 'لوط', right: '⚠️ أنذر قومه العصاة' },
  { left: 'هود', right: '🌪️ نبي قوم عاد' },
  { left: 'صالح', right: '🐫 نبي قوم ثمود' },
  { left: 'شعيب', right: '⚖️ نهى عن الغش' },
  { left: 'موسى', right: '🪄 شق الله البحر له' },
  { left: 'آدم', right: '🌍 أول الناس' },
  { left: 'يعقوب', right: '👨 أبو يوسف' },
  { left: 'محمد', right: '🕌 خاتم الأنبياء' },
]

function r5ProphetsMatch(rand: Rand): Question {
  const pairs = shuffle(rand, PROPHETS_MATCH).slice(0, 4)
  return matchQ(rand, 'صل كل نبي بأشهر قصته', pairs)
}

const PROPHET_TILES = [
  'موسى', 'نوح', 'شعيب', 'يوسف', 'آدم',
  'هود', 'صالح', 'لوط', 'يعقوب', 'إسماعيل',
]

function r5ProphetTiles(rand: Rand): Question {
  const w = pick(rand, PROPHET_TILES)
  return tilesQ('اكتب اسم نبي من الأنبياء', w, 'عليهم السلام جميعا')
}

const PROPHET_PICK: { q: string; a: string; others: string[] }[] = [
  { q: 'من بنى الكعبة مع ابنه إسماعيل؟', a: 'إبراهيم', others: ['موسى', 'نوح', 'يوسف'] },
  { q: 'من صنع السفينة بأمر الله؟', a: 'نوح', others: ['شعيب', 'موسى', 'آدم'] },
  { q: 'من شق الله له البحر؟', a: 'موسى', others: ['يوسف', 'إبراهيم', 'شعيب'] },
  { q: 'من صبر على ظلم إخوته؟', a: 'يوسف', others: ['هود', 'صالح', 'لوط'] },
  { q: 'من هاجر وأقام الدعوة لبيت الله؟', a: 'إبراهيم', others: ['يوسف', 'يعقوب', 'هود'] },
  { q: 'من رأى أحد عشر كوكبا والقمر والشمس تسجد له؟', a: 'يوسف', others: ['إبراهيم', 'نوح', 'موسى'] },
  { q: 'من أرسله الله إلى قوم ثمود؟', a: 'صالح', others: ['شعيب', 'هود', 'لوط'] },
  { q: 'من نهى قومه عن الغش في الميزان؟', a: 'شعيب', others: ['موسى', 'نوح', 'آدم'] },
  { q: 'من بعثه الله إلى قوم عاد؟', a: 'هود', others: ['صالح', 'لوط', 'يعقوب'] },
  { q: 'من أنذر قومه فخاطبهم الملائكة؟', a: 'لوط', others: ['هود', 'صالح', 'يوسف'] },
  { q: 'من أبو يوسف عليه السلام؟', a: 'يعقوب', others: ['إبراهيم', 'نوح', 'شعيب'] },
  { q: 'من أول الأنبياء وأبو البشر؟', a: 'آدم', others: ['نوح', 'موسى', 'إبراهيم'] },
]

function r5ProphetPick(rand: Rand): Question {
  const item = pick(rand, PROPHET_PICK)
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
