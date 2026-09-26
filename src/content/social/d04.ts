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
]

const DIRECTIONS_MATCH_EG = [
  { left: 'شمال مصر', right: '🌊 البحر المتوسط' },
  { left: 'شرق مصر', right: '🌊 البحر الأحمر' },
  { left: 'غرب مصر', right: '🏜️ الصحراء' },
  { left: 'جنوب مصر', right: '⛵ أسوان' },
  { left: 'وسط مصر', right: '🏙️ القاهرة' },
]

function d4DirectionsMatch(rand: Rand): Question {
  if (rand() < 0.7) {
    const pairs = shuffle(rand, DIRECTIONS_MATCH_EG).slice(0, 4)
    return matchQ(rand, 'اتجاهات مصر. صل كل جهة بمكانها', pairs)
  }
  const pairs = shuffle(rand, DIRECTIONS_MATCH).slice(0, 4)
  return matchQ(rand, 'صل كل اتجاه بما يعرفه', pairs)
}

const SUN_ASKS: Array<{ q: string; a: string; others: string[] }> = [
  { q: 'أي اتجاه يقابل الشرق؟', a: 'الغرب', others: ['الشمال', 'الجنوب', 'الشرق'] },
  { q: 'أي اتجاه يقابل الشمال؟', a: 'الجنوب', others: ['الشرق', 'الغرب', 'الشمال'] },
  { q: 'أعلى الخريطة هو اتجاه...؟', a: 'الشمال', others: ['الجنوب', 'الشرق', 'الغرب'] },
  { q: 'أسفل الخريطة هو اتجاه...؟', a: 'الجنوب', others: ['الشمال', 'الشرق', 'الغرب'] },
  { q: 'أين تختفي الشمس عند المساء؟', a: 'الغرب', others: ['الشرق', 'الشمال', 'الجنوب'] },
  { q: 'البوصلة تدلنا على...؟', a: 'الاتجاهات', others: ['الألوان', 'الأرقام', 'الحيوانات'] },
  { q: 'أي اتجاه تراه عند الشروق؟', a: 'الشرق', others: ['الغرب', 'الشمال', 'الجنوب'] },
  { q: 'أي اتجاه يقابل الغرب؟', a: 'الشرق', others: ['الشمال', 'الجنوب', 'الغرب'] },
  { q: 'إذا مشيت نحو الغروب فأنا أمشي نحو...؟', a: 'الغرب', others: ['الشرق', 'الشمال', 'الجنوب'] },
]

function d4SunPick(rand: Rand): Question {
  if (rand() < 0.75) {
    const item = pick(rand, SUN_ASKS)
    return mcqE(rand, item.q, item.a, item.others, say(item.a))
  }
  const choices = shuffle(rand, ['الشرق', 'الغرب'])
  return mcqFixed('تشرق الشمس من الشرق أم الغرب؟', choices, choices.indexOf('الشرق'), {
    hint: 'الشرق يعني الشروق',
  })
}

const d4l1 = makeLesson(
  'd4l1',
  'الاتجاهات الأربعة',
  ['EG-So-2G', 'EG-So-2R'],
  'sonic',
  'شرق وغرب!',
  'الاتجاهات أربعة: الشرق حيث تشرق الشمس، والغرب حيث تغرب، والشمال والجنوب.',
  [d4DirectionsMatch, d4SunPick],
)

/* ---------- d4l2: الخريطة صديقتنا ---------- */

const MAP_MATCH = [
  { left: 'الخريطة', right: PICTURE_BANK.خريطة },
  { left: 'البوصلة', right: PICTURE_BANK.بوصلة },
  { left: 'النيل في الخريطة', right: '〰️ خط أزرق' },
  { left: 'القاهرة في الخريطة', right: '⭐ نجمة العاصمة' },
  { left: 'الصحراء', right: '🏜️ لون أصفر' },
  { left: 'الغابة', right: '🌳 لون أخضر' },
  { left: 'الماء في الخريطة', right: '💧 لون أزرق' },
  { left: 'الجبل في الخريطة', right: '⛰️ لون بني' },
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
  ['الخريطة تدلنا على الطريق الصحيح', true],
  ['البحار تظهر بلون أزرق في الخريطة', true],
  ['نرمي الخريطة بعد أول استعمال', false],
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

const TRIPS: Array<{ prompt: string; steps: string[] }> = [
  {
    prompt: 'رتب خطوات رحلة القطار',
    steps: ['نصل إلى المحطة', 'نشتري تذكرة القطار', 'نصعد إلى القطار', 'نجلس في مقعدنا', 'نصل إلى وجهتنا'],
  },
  {
    prompt: 'رتب خطوات زيارة المتحف',
    steps: ['نصل إلى المتحف', 'ندخل ونشاهد الآثار', 'نسمع شرح المرشد', 'نحافظ على نظافة المكان'],
  },
  {
    prompt: 'رتب رحلة من القاهرة إلى أسوان',
    steps: ['نحدد الاتجاه جنوبا على الخريطة', 'نشتري تذكرة القطار', 'نسافر باتجاه الجنوب', 'نصل إلى أسوان'],
  },
  {
    prompt: 'رتب رحلة المركب في النيل',
    steps: ['نصل إلى الرصيف', 'نركب المركب', 'نبحر في النيل', 'نصل إلى الجهة المقابلة'],
  },
]

function d4TripOrder(rand: Rand): Question {
  if (rand() < 0.75) {
    const t = pick(rand, TRIPS)
    return orderQ(t.prompt, t.steps, say(t.steps.join(' ثم ')))
  }
  const trip = ['ننظر في الخريطة', 'نحدد الاتجاه شمالا', 'نركب القطار', 'نصل إلى الأقصر']
  return orderQ('رتب خطوات الرحلة', trip, say(trip.join(' ثم ')))
}

const TRIP_ASKS: Array<{ q: string; a: string; others: string[] }> = [
  { q: 'أسافر من القاهرة إلى أسوان. أتجه إلى...؟', a: 'الجنوب', others: ['الشمال', 'الشرق', 'الغرب'] },
  { q: 'تشرق الشمس صباحا من جهة...؟', a: 'الشرق', others: ['الغرب', 'الشمال', 'الجنوب'] },
  { q: 'أسافر من القاهرة إلى الإسكندرية. أتجه إلى...؟', a: 'الشمال', others: ['الجنوب', 'الشرق', 'الغرب'] },
  { q: 'أسافر من القاهرة إلى الغردقة. أتجه إلى...؟', a: 'الشرق', others: ['الجنوب', 'الشمال', 'الغرب'] },
  { q: 'أسافر من أسوان إلى القاهرة. أتجه إلى...؟', a: 'الشمال', others: ['الجنوب', 'الشرق', 'الغرب'] },
  { q: 'أعلى الخريطة هو اتجاه...؟', a: 'الشمال', others: ['الجنوب', 'الشرق', 'الغرب'] },
  { q: 'أسفل الخريطة هو اتجاه...؟', a: 'الجنوب', others: ['الشمال', 'الشرق', 'الغرب'] },
  { q: 'البوصلة تدلنا على...؟', a: 'الاتجاهات', others: ['الألوان', 'الأشكال', 'الأرقام'] },
  { q: 'الشمس تغرب من جهة...؟', a: 'الغرب', others: ['الشرق', 'الشمال', 'الجنوب'] },
  { q: 'النيل يجري في مصر من الجنوب إلى...؟', a: 'الشمال', others: ['الجنوب', 'الشرق', 'الغرب'] },
  { q: 'رأس البوصلة الدائم يدل على...؟', a: 'الشمال', others: ['الجنوب', 'الشرق', 'الغرب'] },
]

function d4TripPick(rand: Rand): Question {
  const item = pick(rand, TRIP_ASKS)
  return mcqE(rand, item.q, item.a, item.others, say(item.a))
}

const d4l3 = makeLesson(
  'd4l3',
  'رحلتي في مصر',
  ['EG-So-2G', 'EG-So-2E'],
  'knuckles',
  'رحالة صغير!',
  'هيا في رحلة بخريطتنا وبوصلتنا: نحدد الاتجاه ونصل إلى وجهتنا.',
  [d4TripOrder, d4TripPick],
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
