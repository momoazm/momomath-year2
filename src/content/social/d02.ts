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
  { left: 'الحقل', right: '🌾 يسقيه ماء النيل' },
  { left: 'الترعة', right: '💧 تنقل الماء إلى الحقل' },
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
  ['السمك يعيش في مياه النيل', true],
  ['مياه النيل لا تصل إلى الحقول', false],
  ['النيل يروي أرض مصر منذ آلاف السنين', true],
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

const JOURNEYS: Array<{ prompt: string; steps: string[] }> = [
  {
    prompt: 'رتب رحلة القمح من البذرة إلى الخبز',
    steps: ['نزرع بذور القمح', 'نرش الماء على الحقل', 'ينمو القمح في الأرض', 'نحصد القمح الناضج', 'نطحنه في الطاحونة', 'نخبز الخبز'],
  },
  {
    prompt: 'رتب رحلة القطن من الحقل إلى القميص',
    steps: ['نزرع بذور القطن', 'يسقي الفلاح النبات', 'ينضج القطن الأبيض', 'نحصد القطن', 'نصنع الخيوط', 'نخيط القميص'],
  },
  {
    prompt: 'رتب خطوات الفلاح في حقله',
    steps: ['يفتح ترعة الماء', 'يزرع البذور في الأرض', 'يسقي زرعه', 'ينمو القمح في الحقل', 'يبيع المحصول في السوق'],
  },
]

function d2JourneyOrder(rand: Rand): Question {
  if (rand() < 0.75) {
    const j = pick(rand, JOURNEYS)
    return orderQ(j.prompt, j.steps, say(j.steps.join(' ثم ')))
  }
  const steps = ['تمطر السماء في الجنوب', 'يجري النيل إلى مصر', 'يسقي الفلاح حقله', 'ينمو القمح', 'نخبز الخبز']
  return orderQ('رتب رحلة قطرة الماء من النيل إلى الخبز', steps, say(steps.join(' ثم ')))
}

const FIELD_MATCH = [
  { left: 'الفلاح', right: '👨‍🌾 يزرع الحقل' },
  { left: 'القمح', right: '🌾 نصنع منه الخبز' },
  { left: 'القطن', right: '☁️ نصنع منه الملابس' },
  { left: 'التمر', right: '🌴 من النخلة' },
  { left: 'الذرة', right: '🌽 نصنع منه العصيدة' },
  { left: 'البطاطس', right: '🥔 نأكله مع الطعام' },
  { left: 'الموز', right: '🍌 من أشجار البستان' },
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
    'نغلق الصنبور بعد الاستعمال',
    'نضع القمامة في السلة',
    'نركب الدراجة بدلا من السيارة',
    'نبلغ عن تسريب المياه',
    'نرشد استهلاك الكهرباء',
  ])
  const others = ['نرمي القمامة في النيل', 'نترك الصنبور مفتوحا', 'نلوث الهواء']
  return mcqE(rand, 'أي تصرف يحمي بيئتنا؟', item, others, say(item))
}

const WATER_TAPS = [
  {
    prompt: 'اضغط على كل صنبور يجب إغلاقه',
    target: 3,
    targetEmoji: '🚰',
    cells: ['🚰', '🔥', '🚰', '🌙', '🚰', '⭐', '🍎', '⚽'],
    hint: 'الصنابير المفتوحة فقط!',
  },
  {
    prompt: 'اضغط على كل سمكة في النهر',
    target: 3,
    targetEmoji: '🐟',
    cells: ['🐟', '🔥', '🐟', '🌙', '🐟', '⭐', '🍎', '⚽'],
    hint: 'السمك فقط!',
  },
  {
    prompt: 'اضغط على كل شجرة نزرعها',
    target: 4,
    targetEmoji: '🌳',
    cells: ['🌳', '💧', '🌳', '⭐', '🌳', '🔥', '🌳', '⚽'],
    hint: 'الأشجار فقط!',
  },
  {
    prompt: 'اضغط على كل غيمة تُمطر علينا',
    target: 3,
    targetEmoji: '☁️',
    cells: ['☁️', '🌙', '☁️', '⭐', '☁️', '🍎', '⚽', '🔥'],
    hint: 'الغيوم فقط!',
  },
  {
    prompt: 'اضغط على كل زهرة نحافظ عليها',
    target: 3,
    targetEmoji: '🌸',
    cells: ['🌸', '💧', '🌸', '🔥', '🌸', '🌙', '⭐', '⚽'],
    hint: 'الأزهار فقط!',
  },
]

function d2WaterTap(rand: Rand): Question {
  if (rand() < 0.85) {
    const t = pick(rand, WATER_TAPS)
    return { kind: 'tap-count', ...t } as Question
  }
  return {
    kind: 'tap-count',
    prompt: 'اضغط على كل قطرة ماء تراها',
    target: 3,
    targetEmoji: '💧',
    cells: ['💧', '🔥', '💧', '🌙', '💧', '⭐', '🍎', '⚽'],
    hint: 'قطرة الماء فقط!',
  } as Question
}

const d2l3 = makeLesson(
  'd2l3',
  'نحمي مياهنا',
  ['EG-So-2C', 'EG-So-2E'],
  'amy',
  'حماة النيل!',
  'نحمي النيل من التلوث ونرشد الماء. كل نقطة ماء حياة.',
  [d2ProtectPick, d2WaterTap],
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
