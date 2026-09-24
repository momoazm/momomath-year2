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

function d4DirectionsMatch(rand: Rand): Question {
  const pairs = shuffle(rand, DIRECTIONS_MATCH).slice(0, 4)
  return matchQ(rand, 'صل كل اتجاه بما يعرفه', pairs)
}

function d4SunPick(rand: Rand): Question {
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

function d4TripOrder(rand: Rand): Question {
  void rand
  const trip = ['ننظر في الخريطة', 'نحدد الاتجاه شمالا', 'نركب القطار', 'نصل إلى الأقصر']
  return orderQ('رتب خطوات الرحلة', trip, say(trip.join(' ثم ')))
}

function d4TripPick(rand: Rand): Question {
  const item = pick(rand, [
    { q: 'أسافر من القاهرة إلى أسوان. أتجه إلى...؟', a: 'الجنوب', others: ['الشمال', 'الشرق', 'الغرب'] },
    { q: 'تشرق الشمس صباحا من جهة...؟', a: 'الشرق', others: ['الغرب', 'الشمال', 'الجنوب'] },
  ])
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
