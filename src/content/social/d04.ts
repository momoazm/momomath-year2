import type { Question, UnitDef } from '../types'
import {
  PICTURE_BANK,
  makeLesson,
  matchQ,
  mcqE,
  orderQ,
  pick,
  say,
  shuffle,
  tfQ,
  unitDef,
  type Rand,
} from './helpers'

/* ---------- d4l1: الاتجاهات الأربعة ---------- */

const DIRECTIONS_MATCH = [
  { left: 'الشرق', right: '🌅 تشرق منه الشمس' },
  { left: 'الغرب', right: '🌇 تغرب فيه الشمس' },
  { left: 'الشمال', right: '⬆️ أعلى الخريطة' },
  { left: 'الجنوب', right: '⬇️ أسفل الخريطة' },
  { left: 'سهم الشمال', right: '⬆️ يدل على الأعلى' },
  { left: 'نسافر إلى أسوان', right: '⬇️ نتّجه جنوبا' },
  { left: 'شروق الشمس', right: '🌅 من جهة الشرق' },
  { left: 'غروب الشمس', right: '🌇 إلى جهة الغرب' },
]

function d4DirectionsMatch(rand: Rand): Question {
  const pairs = shuffle(rand, DIRECTIONS_MATCH).slice(0, 4)
  return matchQ(rand, 'صل كل اتجاه بما يعرفه', pairs)
}

const SUN_MCQ: { q: string; a: string; others: string[] }[] = [
  { q: 'تشرق الشمس من الشرق أم الغرب؟', a: 'الشرق', others: ['الغرب'] },
  { q: 'تغرب الشمس من الشرق أم الغرب؟', a: 'الغرب', others: ['الشرق'] },
  { q: 'أين أعلى الخريطة؟', a: 'الشمال', others: ['الجنوب', 'الشرق', 'الغرب'] },
  { q: 'أين أسفل الخريطة؟', a: 'الجنوب', others: ['الشمال', 'الشرق', 'الغرب'] },
  { q: 'أي اتجاه يقابل الشمال؟', a: 'الجنوب', others: ['الشرق', 'الغرب'] },
  { q: 'أي اتجاه يقابل الشرق؟', a: 'الغرب', others: ['الشمال', 'الجنوب'] },
  { q: 'في أي اتجاه تظهر الشمس أولا في الصباح؟', a: 'الشرق', others: ['الغرب', 'الشمال', 'الجنوب'] },
  { q: 'إذا وقفت تنظر إلى الشرق فما خلفك؟', a: 'الغرب', others: ['الشمال', 'الجنوب', 'الشرق'] },
]

function d4SunPick(rand: Rand): Question {
  const item = pick(rand, SUN_MCQ)
  return mcqE(rand, item.q, item.a, item.others, { hint: 'الشرق يعني الشروق' })
}

const DIRECTIONS_TF: Array<[string, boolean]> = [
  ['الشمال في أعلى الخريطة', true],
  ['الجنوب في أسفل الخريطة', true],
  ['الشمس تغرب من الشرق', false],
  ['الشرق والغرب اتجاهتان متقابلتان', true],
  ['البوصلة تدلنا على الاتجاهات الأربعة', true],
  ['نذهب من القاهرة إلى أسوان نحو الشمال', false],
  ['الغرب هو حيث تغرب الشمس', true],
]

function d4DirTF(rand: Rand): Question {
  const [statement, answer] = pick(rand, DIRECTIONS_TF)
  return tfQ('الاتجاهات. هل الجملة صحيحة؟', statement, answer)
}

const d4l1 = makeLesson(
  'd4l1',
  'الاتجاهات الأربعة',
  ['EG-So-2G', 'EG-So-2R'],
  'sonic',
  'شرق وغرب!',
  'الاتجاهات أربعة: الشرق حيث تشرق الشمس، والغرب حيث تغرب، والشمال والجنوب.',
  [d4DirectionsMatch, d4SunPick, d4DirTF],
)

/* ---------- d4l2: الخريطة صديقتنا ---------- */

const MAP_MATCH = [
  { left: 'الخريطة', right: PICTURE_BANK.خريطة },
  { left: 'البوصلة', right: PICTURE_BANK.بوصلة },
  { left: 'النيل في الخريطة', right: '〰️ خط أزرق' },
  { left: 'القاهرة في الخريطة', right: '⭐ نجمة العاصمة' },
  { left: 'الصحراء', right: '🏜️ لون أصفر' },
  { left: 'الجبل', right: '⛰️ مثلث بني' },
  { left: 'الطريق', right: '🛣️ خط أحمر' },
  { left: 'حدود المحافظة', right: '➖ خط متقطع' },
]

function d4MapMatch(rand: Rand): Question {
  const pairs = shuffle(rand, MAP_MATCH).slice(0, 4)
  return matchQ(rand, 'صل كل رمز خريطة بمعناه', pairs)
}

const MAP_TF: Array<[string, boolean]> = [
  ['الخريطة رسم مصغر للأرض', true],
  ['البوصلة تساعدنا على معرفة الاتجاهات', true],
  ['الشمال في أسفل الخريطة', false],
  ['النيل يظهر خطا أزرق في الخريطة', true],
  ['المدن الكبرى تظهر بنجمة أو نقطة على الخريطة', true],
  ['الخريطة تساعدنا في إيجاد الطريق', true],
  ['نقرأ مفتاح الخريطة لفهم رموزها', true],
  ['الصحراء تظهر بلون أخضر في الخريطة', false],
  ['نقدر المسافات على الخريطة بمساعدة المفتاح', true],
  ['الخريطة مرسومة بالألوان والرموز', true],
]

function d4MapTF(rand: Rand): Question {
  const [statement, answer] = pick(rand, MAP_TF)
  return tfQ('الخريطة. هل الجملة صحيحة؟', statement, answer)
}

const d4l2 = makeLesson(
  'd4l2',
  'الخريطة صديقتنا',
  ['EG-So-2G', 'EG-So-2L'],
  'tails',
  'مستكشف صغير!',
  'الخريطة رسم مصغر نرى فيه النيل والصحراء والمدن. والبوصلة تدلنا.',
  [d4MapMatch, d4MapTF],
)

/* ---------- d4l3: رحلتي في مصر ---------- */

const TRIPS: { label: string; items: string[] }[] = [
  { label: 'رتب خطوات الرحلة', items: ['ننظر في الخريطة', 'نحدد الاتجاه شمالا', 'نركب القطار', 'نصل إلى الأقصر'] },
  { label: 'رتب رحلة من القاهرة إلى أسوان', items: ['نحدد الاتجاه جنوبا على الخريطة', 'نحضر تذاكر القطار', 'نركب القطار', 'نرى النيل من النافذة', 'نصل إلى أسوان'] },
  { label: 'رتب خطوات رحلة إلى البحر', items: ['نجهز أغراضنا', 'نركب السيارة', 'نتبع لوحات الطريق', 'نصل إلى الشاطئ'] },
  { label: 'رتب رحلة إلى المتحف', items: ['نقرأ عن المتحف في الخريطة', 'نحدد اتجاه المتحف', 'نركب الحافلة', 'ندخل المتحف', 'نتعرف على آثار الفراعنة'] },
  { label: 'رتب خطوات السفر بالطائرة', items: ['نصل إلى المطار', 'نأخذ تذكرة الطائرة', 'نصعد إلى الطائرة', 'نهبط في وجهتنا'] },
  { label: 'رتب رحلة إلى الأهرامات', items: ['نحدد اتجاه الجيزة من بيتنا', 'نرسم الطريق على الخريطة', 'نركب الأتوبيس', 'نصل إلى الأهرامات', 'نصعد لمشاهدة الهرم'] },
  { label: 'رتب خطوات الذهاب إلى الحديقة', items: ['نخرج من بيتنا', 'نعبر الشارع بحذر', 'نصل إلى الحديقة', 'نلعب ونستمتع'] },
]

function d4TripOrder(rand: Rand): Question {
  const t = pick(rand, TRIPS)
  return orderQ(t.label, t.items, say(t.items.join(' ثم ')))
}

const TRIP_MCQ: { q: string; a: string; others: string[] }[] = [
  { q: 'أسافر من القاهرة إلى أسوان. أتجه إلى...؟', a: 'الجنوب', others: ['الشمال', 'الشرق', 'الغرب'] },
  { q: 'تشرق الشمس صباحا من جهة...؟', a: 'الشرق', others: ['الغرب', 'الشمال', 'الجنوب'] },
  { q: 'أسافر من أسوان إلى القاهرة. أتجه إلى...؟', a: 'الشمال', others: ['الجنوب', 'الشرق', 'الغرب'] },
  { q: 'مدينة أسوان في جنوب مصر أم شمالها؟', a: 'جنوب مصر', others: ['شمال مصر', 'شرق مصر', 'غرب مصر'] },
  { q: 'البحر الأحمر في أي جهة من مصر؟', a: 'الشرق', others: ['الغرب', 'الجنوب', 'الشمال'] },
  { q: 'سأسافر إلى مرسى مطروح على الساحل. أتجه إلى...؟', a: 'الغرب', others: ['الشرق', 'الجنوب', 'الشمال'] },
  { q: 'البحر المتوسط يطل على أي جهة من مصر؟', a: 'الشمال', others: ['الجنوب', 'الشرق', 'الغرب'] },
  { q: 'قبل السفر نحتاج إلى معرفة الاتجاهات بـ...؟', a: 'الخريطة والبوصلة', others: ['الساعة فقط', 'اللعبة فقط', 'المظلة فقط'] },
]

function d4TripPick(rand: Rand): Question {
  const item = pick(rand, TRIP_MCQ)
  return mcqE(rand, item.q, item.a, item.others, say(item.a))
}

const d4l3 = makeLesson(
  'd4l3',
  'رحلتي في مصر',
  ['EG-So-2G', 'EG-So-2E'],
  'knuckles',
  'رحالة صغير!',
  'هيا في رحلة بخريطتنا وبوصلتنا: نحدد الاتجاه ونصل إلى وجهتنا.',
  [d4TripOrder, d4TripPick, d4DirectionsMatch, d4MapTF],
)

/* ---------- d4boss ---------- */

const d4boss = makeLesson(
  'd4boss',
  'بطل الخريطة',
  ['EG-So-2G', 'EG-So-2R', 'EG-So-2E'],
  'eggman',
  'تحدي البطل!',
  'الاتجاهات والخريطة والرحلة كلها معا.',
  [d4DirectionsMatch, d4MapMatch, d4TripOrder, d4TripPick],
  d4SunPick,
)

export const UNIT_D4: UnitDef = unitDef(
  'd4',
  4,
  'الخريطة والاتجاهات',
  'دراسات · جغرافيا · الاتجاهات والخريطة والرحلة',
  '#22d3ee',
  '🧭',
  [d4l1, d4l2, d4l3, d4boss],
)
