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

/* ---------- d2l1: نهر النيل شريان الحياة ---------- */

const NILE_MATCH = [
  { left: 'النيل', right: '🌊 أطول أنهار العالم' },
  { left: 'الماء', right: '💧 نشرب ونزرع منه' },
  { left: 'المركب', right: PICTURE_BANK.مركب },
  { left: 'السمكة', right: PICTURE_BANK.سمكة },
  { left: 'الفلاح', right: PICTURE_BANK.فلاح },
  { left: 'الزراعة', right: '🌾 نسقيها بماء النيل' },
  { left: 'الصياد', right: '🎣 يصطاد السمك في النيل' },
]

function d2NileMatch(rand: Rand): Question {
  const pairs = shuffle(rand, NILE_MATCH).slice(0, 4)
  return matchQ(rand, 'صل كل كلمة بما يناسبها عن نهر النيل', pairs)
}

const NILE_TF: Array<[string, boolean]> = [
  ['نهر النيل مصدر الماء في مصر', true],
  ['نشرب من النيل ونسقي الزرع', true],
  ['نرمي القمامة في النيل', false],
  ['نحافظ على نظافة مياه النيل', true],
  ['النيل يجري في مصر من الجنوب إلى الشمال', true],
  ['نهر النيل أهم أنهار مصر', true],
  ['الأسماك تعيش في مياه النيل النظيفة', true],
  ['نرمي الزيت والنفايات في ماء النيل', false],
  ['يساعد النيل المزارعين على ري محاصيلهم', true],
  ['نركب المراكب ونتفسح على النيل', true],
]

function d2NileTF(rand: Rand): Question {
  const [statement, answer] = pick(rand, NILE_TF)
  return tfQ('نهر النيل. هل الجملة صحيحة؟', statement, answer)
}

const d2l1 = makeLesson(
  'd2l1',
  'نهر النيل',
  ['EG-So-2G', 'EG-So-2C'],
  'sonic',
  'شريان الحياة!',
  'نهر النيل هبة مصر: نشرب منه ونسقي الزرع. نحافظ على نظافته.',
  [d2NileMatch, d2NileTF],
)

/* ---------- d2l2: من النيل إلى الحقل ---------- */

const JOURNEYS: { label: string; items: string[] }[] = [
  { label: 'رتب رحلة قطرة الماء من النيل إلى الخبز', items: ['تمطر السماء في الجنوب', 'يجري النيل إلى مصر', 'يسقي الفلاح حقله', 'ينمو القمح', 'نخبز الخبز'] },
  { label: 'رتب من بذرة القمح إلى الرغيف', items: ['نزرع بذرة القمح', 'نسقيها بماء النيل', 'تنمو سنبلة القمح', 'نحصد السنابل', 'نطحن الدقيق', 'نخبز الرغيف'] },
  { label: 'رتب من نبات القطن إلى قميصك', items: ['يزرع الفلاح بذرة القطن', 'ينمو نبات القطن', 'نقطف الأقطان', 'نغزل الخيوط', 'ننسج القماش', 'نخيط الملابس'] },
  { label: 'رتب خطوات زراعة شجرة', items: ['نحضر حفرة صغيرة', 'نضع الشجرة في الحفرة', 'نضع التربة حولها', 'نسقيها بالماء', 'نعتني بها حتى تكبر'] },
  { label: 'رتب من النخلة إلى التمر', items: ['تزرع نخلة صغيرة', 'نسقيها بالماء', 'تكبر النخلة', 'تعطي التمر', 'نقطف التمر', 'نأكل التمر'] },
  { label: 'رتب رحلة الماء إلى بيتك', items: ['تمطر السماء', 'يجري الماء في الأنهار', 'يصل إلى محطة المياه', 'ينقل في الأنابيب', 'يصل إلى صنبور بيتك', 'نملأ الكوب ونشرب'] },
  { label: 'رتب من الشجرة إلى الورق', items: ['تكبر الشجرة', 'نصنع الخشب', 'نصنع اللب', 'نطبع الورق', 'نكتب عليه'] },
]

function d2JourneyOrder(rand: Rand): Question {
  const j = pick(rand, JOURNEYS)
  return orderQ(j.label, j.items, say(j.items.join(' ثم ')))
}

const FIELD_MATCH = [
  { left: 'الفلاح', right: '👨‍🌾 يزرع الحقل' },
  { left: 'القمح', right: '🌾 نصنع منه الخبز' },
  { left: 'القطن', right: '☁️ نصنع منه الملابس' },
  { left: 'التمر', right: '🌴 من النخلة' },
  { left: 'الذرة', right: '🌽 حبة شهية' },
  { left: 'الأرز', right: '🍚 نأكله كل يوم' },
  { left: 'الزيتون', right: '🫒 نصنع منه الزيت' },
  { left: 'الخضروات', right: '🥕 نأكلها صحية' },
]

function d2FieldMatch(rand: Rand): Question {
  const pairs = shuffle(rand, FIELD_MATCH).slice(0, 4)
  return matchQ(rand, 'صل كل كلمة بما تنتجه الأرض', pairs)
}

const d2l2 = makeLesson(
  'd2l2',
  'من النيل إلى الحقل',
  ['EG-So-2G', 'EG-So-2E'],
  'knuckles',
  'رحلة قطرة ماء!',
  'من ماء النيل ينمو القمح والقطن. رتب الرحلة وصل كل محصول بمصدره.',
  [d2JourneyOrder, d2FieldMatch],
)

/* ---------- d2l3: نحمي مياهنا ---------- */

function d2ProtectPick(rand: Rand): Question {
  const item = pick(rand, [
    'نحافظ على نظافة النيل',
    'نرشد استهلاك الماء',
    'نزرع الأشجار',
    'نغلق الصنبور بعد الاستخدام',
    'نصلح الحنفية المتسربة',
    'لا نرمي الزيت في الحوض',
    'نضع القمامة في السلة',
    'نستحم في وقت قصير',
  ])
  const others = ['نرمي القمامة في النيل', 'نترك الصنبور مفتوحا', 'نلوث الهواء']
  return mcqE(rand, 'أي تصرف يحمي بيئتنا؟', item, others, say(item))
}

const TAP_TASKS = [
  { prompt: 'اضغط على كل قطرة ماء تراها', target: 3, targetEmoji: '💧', cells: ['💧', '🔥', '💧', '🌙', '💧', '⭐', '🍎', '⚽'], hint: 'قطرة الماء فقط!' },
  { prompt: 'اضغط على كل سمكة في النهر', target: 3, targetEmoji: '🐟', cells: ['🐟', '🪨', '🐟', '🌳', '🐟', '🔥', '💧', '⭐'], hint: 'السمك فقط!' },
  { prompt: 'اضغط على كل شجرة خضراء', target: 3, targetEmoji: '🌳', cells: ['🌳', '🍎', '🌳', '🔥', '🌳', '💧', '⚽', '⭐'], hint: 'الأشجار فقط!' },
  { prompt: 'اضغط على كل نجمة في السماء', target: 4, targetEmoji: '⭐', cells: ['⭐', '🌙', '⭐', '💧', '⭐', '🍎', '⭐', '🔥'], hint: 'النجوم فقط!' },
  { prompt: 'اضغط على كل زهرة في الحديقة', target: 3, targetEmoji: '🌸', cells: ['🌸', '🌿', '🌸', '🔥', '🌸', '💧', '⭐', '🍎'], hint: 'الزهور فقط!' },
  { prompt: 'اضغط على كل قطرة من المطر', target: 2, targetEmoji: '🌧️', cells: ['🌧️', '☀️', '🌧️', '🔥', '💧', '⭐', '🍎', '⚽'], hint: 'المطر فقط!' },
]

function d2WaterTap(rand: Rand): Question {
  const t = pick(rand, TAP_TASKS)
  return {
    kind: 'tap-count',
    prompt: t.prompt,
    target: t.target,
    targetEmoji: t.targetEmoji,
    cells: t.cells,
    hint: t.hint,
  } as Question
}

const d2l3 = makeLesson(
  'd2l3',
  'نحمي مياهنا',
  ['EG-So-2C', 'EG-So-2E'],
  'amy',
  'حماة النيل!',
  'نحمي النيل من التلوث ونرشد الماء. كل نقطة ماء حياة.',
  [d2ProtectPick, d2WaterTap, d2NileTF, d2FieldMatch],
)

/* ---------- d2boss ---------- */

const d2boss = makeLesson(
  'd2boss',
  'بطل النيل',
  ['EG-So-2G', 'EG-So-2C', 'EG-So-2E'],
  'eggman',
  'تحدي البطل!',
  'نهر النيل ومن النيل إلى الحقل وحماية المياه كلها معا.',
  [d2NileMatch, d2JourneyOrder, d2ProtectPick, d2WaterTap],
  d2NileTF,
)

export const UNIT_D2: UnitDef = unitDef(
  'd2',
  2,
  'نهر النيل',
  'دراسات · جغرافيا · شريان الحياة والزراعة وحماية الماء',
  '#0ea5e9',
  '🌊',
  [d2l1, d2l2, d2l3, d2boss],
)
