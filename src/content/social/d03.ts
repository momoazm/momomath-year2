import type { Question, UnitDef } from '../types'
import {
  PICTURE_BANK,
  makeLesson,
  matchQ,
  mcqE,
  mcqFixed,
  orderQ,
  pick,
  pickOthers,
  say,
  shuffle,
  speakQ,
  tilesQ,
  tfQ,
  unitDef,
  type Rand,
} from './helpers'

/* ---------- d3l1: مهن مجتمعي ---------- */

const JOBS_MATCH = [
  { left: 'الفلاح', right: '👨‍🌾 يزرع الحقل' },
  { left: 'المعلم', right: '👨‍🏫 يعلمنا في المدرسة' },
  { left: 'الطبيب', right: '👨‍⚕️ يعالج المرضى' },
  { left: 'المهندس', right: '👷 يبني البيوت' },
  { left: 'الطباخ', right: '👨‍🍳 يطهو الطعام' },
  { left: 'الجندي', right: '💂 يحمي الوطن' },
  { left: 'الشرطي', right: '👮 ينظم المرور ويحرس الشارع' },
  { left: 'الخباز', right: '🥖 يخبز لنا الخبز' },
]

function d3JobsMatch(rand: Rand): Question {
  const pairs = shuffle(rand, JOBS_MATCH).slice(0, 4)
  return matchQ(rand, 'صل كل صاحب مهنة بعمله', pairs)
}

const JOBS_HEAR = ['الفلاح', 'المعلم', 'الطبيب', 'المهندس', 'الطباخ', 'الجندي', 'الشرطي', 'الخباز']

function d3JobsHear(rand: Rand): Question {
  const item = pick(rand, JOBS_HEAR)
  const others = pickOthers(rand, JOBS_HEAR, item, 3)
  return mcqE(rand, 'استمع واضغط على المهنة التي سمعتها', item, others, say(item))
}

const d3l1 = makeLesson(
  'd3l1',
  'مهن مجتمعي',
  ['EG-So-2E', 'EG-So-2L'],
  'sonic',
  'ماذا أريد أن أكون؟',
  'مجتمعنا فيه مهن كثيرة: الفلاح والمعلم والطبيب والمهندس. كل مهنة مهمة.',
  [d3JobsMatch, d3JobsHear],
)

/* ---------- d3l2: أدوات المهن ---------- */

const TOOLS_MATCH = [
  { left: 'المعلم', right: '📖 الكتاب والقلم' },
  { left: 'الطبيب', right: '💊 الدواء والسماعة' },
  { left: 'الفلاح', right: '🌾 المحراث والبذور' },
  { left: 'المهندس', right: '📐 المسطرة والخريطة' },
  { left: 'الطباخ', right: '🍳 القدر والنار' },
  { left: 'الصياد', right: '🎣 الشباك والقصبة' },
  { left: 'الخباز', right: '🥖 العجانة والأفران' },
  { left: 'النجار', right: '🪚 المطرقة والمسمار' },
]

function d3ToolsMatch(rand: Rand): Question {
  const pairs = shuffle(rand, TOOLS_MATCH).slice(0, 4)
  return matchQ(rand, 'صل كل صاحب مهنة بأدواته', pairs)
}

const ALL_JOBS = ['الفلاح', 'المعلم', 'الطبيب', 'المهندس', 'الطباخ', 'الجندي', 'الشرطي', 'الخباز', 'النجار', 'الصياد']

const TOOLS_MCQ: { q: string; a: string }[] = [
  { q: 'من يعالج المرضى؟', a: 'الطبيب' },
  { q: 'من يعلمنا في المدرسة؟', a: 'المعلم' },
  { q: 'من يزرع الحقل؟', a: 'الفلاح' },
  { q: 'من يحمي الوطن؟', a: 'الجندي' },
  { q: 'من يطهو الطعام في المطعم؟', a: 'الطباخ' },
  { q: 'من يخبز لنا الخبز الطازج؟', a: 'الخباز' },
  { q: 'من يصنع الأثاث من الخشب؟', a: 'النجار' },
  { q: 'من يصطاد السمك في النيل؟', a: 'الصياد' },
  { q: 'من ينظم المرور في الشارع؟', a: 'الشرطي' },
  { q: 'من يبني البيوت والجسور؟', a: 'المهندس' },
]

function d3ToolsPick(rand: Rand): Question {
  const item = pick(rand, TOOLS_MCQ)
  const others = pickOthers(rand, ALL_JOBS, item.a, 3)
  return mcqE(rand, item.q, item.a, others, say(item.a))
}

const d3l2 = makeLesson(
  'd3l2',
  'أدوات المهن',
  ['EG-So-2E', 'EG-So-2R'],
  'tails',
  'عدة الشغل!',
  'لكل مهنة أدواتها: الطبيب بالسماعة والفلاح بالمحراث. من صاحب هذه الأدوات؟',
  [d3ToolsMatch, d3ToolsPick],
)

/* ---------- d3l3: عندما أكبر ---------- */

const DREAM_LINES = [
  'عندما أكبر أريد أن أكون طبيبا',
  'عندما أكبر أريد أن أكون معلما',
  'عندما أكبر أريد أن أكون مهندسا',
  'عندما أكبر أريد أن أكون طباخا مشهورا',
  'عندما أكبر أريد أن أكون إطفائيا ينقذ الناس',
  'عندما أكبر سأساعد جيراني وأخدم بلدي',
  'عندما أكبر سأفخر بمهنتي وأتقنها',
]

function d3DreamSpeak(rand: Rand): Question {
  const line = pick(rand, DREAM_LINES)
  return speakQ('تحدث عن مهنة أحلامك', line, { hint: 'قل بثقة!' })
}

const JOB_TILES = ['معلم', 'طبيب', 'فلاح', 'جندي', 'مهندس', 'طباخ', 'خباز', 'نجار']

function d3JobTiles(rand: Rand): Question {
  const w = pick(rand, JOB_TILES)
  return tilesQ('اكتب مهنة من المهن', w, 'كل المهن مهمة')
}

const JOBS_TF: Array<[string, boolean]> = [
  ['كل المهن مهمة وتخدم المجتمع', true],
  ['أحترم كل عامل يخدم مجتمعي', true],
  ['المهنة السيئة لا نحترم صاحبها', false],
  ['أذاكر لأكون نافعا لبلدي', true],
  ['الكسل مهنة نفتخر بها', false],
  ['أساعد أبي وأمي في أعمال المنزل', true],
  ['علينا أن نتقن مهنتنا ونحسن عملنا', true],
]

function d3JobsTF(rand: Rand): Question {
  const [statement, answer] = pick(rand, JOBS_TF)
  return tfQ('قيمة العمل. هل الجملة صحيحة؟', statement, answer)
}

const d3l3 = makeLesson(
  'd3l3',
  'عندما أكبر',
  ['EG-So-2E', 'EG-So-2W'],
  'amy',
  'مهنة أحلامي!',
  'عندما أكبر أريد أن أكون نافعا لبلدي. تحدث واكتب عن مهنتك المفضلة.',
  [d3DreamSpeak, d3JobTiles, d3JobsTF],
)

/* ---------- d3boss ---------- */

const d3boss = makeLesson(
  'd3boss',
  'بطل المهن',
  ['EG-So-2E', 'EG-So-2L', 'EG-So-2W'],
  'eggman',
  'تحدي البطل!',
  'مهن مجتمعي وأدوات المهن وعندما أكبر كلها معا.',
  [d3JobsMatch, d3ToolsMatch, d3JobTiles, d3DreamSpeak],
  d3ToolsPick,
)

export const UNIT_D3: UnitDef = unitDef(
  'd3',
  3,
  'المهن',
  'دراسات · اقتصاد مبسط · مهن مجتمعي وأدواتهم وأحلامي',
  '#eab308',
  '👷',
  [d3l1, d3l2, d3l3, d3boss],
)
