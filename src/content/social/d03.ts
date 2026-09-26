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
]

function d3JobsMatch(rand: Rand): Question {
  const pairs = shuffle(rand, JOBS_MATCH).slice(0, 4)
  return matchQ(rand, 'صل كل صاحب مهنة بعمله', pairs)
}

function d3JobsHear(rand: Rand): Question {
  const item = pick(rand, ['الفلاح', 'المعلم', 'الطبيب', 'المهندس'])
  const others = ['الفلاح', 'المعلم', 'الطبيب', 'المهندس'].filter((j) => j !== item)
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
  { left: 'النجار', right: '🔨 المطرقة والمسمار' },
  { left: 'الخباز', right: '🥖 العجين والفرن' },
  { left: 'عامل النظافة', right: '🧹 المكنسة والكيس' },
]

function d3ToolsMatch(rand: Rand): Question {
  const pairs = shuffle(rand, TOOLS_MATCH).slice(0, 4)
  return matchQ(rand, 'صل كل صاحب مهنة بأدواته', pairs)
}

function d3ToolsPick(rand: Rand): Question {
  const item = pick(rand, [
    { q: 'من يعالج المرضى؟', a: 'الطبيب', others: ['الفلاح', 'المهندس', 'الطباخ'] },
    { q: 'من يعلمنا في المدرسة؟', a: 'المعلم', others: ['الطبيب', 'الجندي', 'الفلاح'] },
    { q: 'من يزرع الحقل؟', a: 'الفلاح', others: ['المعلم', 'الطباخ', 'المهندس'] },
    { q: 'من يحمي الوطن؟', a: 'الجندي', others: ['الطباخ', 'الفلاح', 'المعلم'] },
    { q: 'من يمسح الشوارع وينظفها؟', a: 'عامل النظافة', others: ['الطبيب', 'المعلم', 'الفلاح'] },
    { q: 'من يصنع الأثاث من الخشب؟', a: 'النجار', others: ['المهندس', 'الطباخ', 'المعلم'] },
    { q: 'من يبني البيوت والجسور؟', a: 'المهندس', others: ['النجار', 'الفلاح', 'الطباخ'] },
  ])
  return mcqE(rand, item.q, item.a, item.others, say(item.a))
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

function d3DreamSpeak(rand: Rand): Question {
  const line = pick(rand, [
    'عندماكبر أريد أن أكون طبيبا',
    'عندماكبر أريد أن أكون معلما',
    'عندماكبر أريد أن أكون مهندسا',
    'عندماكبر أريد أن أكون فلاحا',
    'عندماكبر أريد أن أكون طباخا',
    'عندماكبر أريد أن أكون رساما',
  ])
  return speakQ('تحدث عن مهنة أحلامك', line, { hint: 'قل بثقة!' })
}

const JOB_TILES = ['معلم', 'طبيب', 'فلاح', 'جندي', 'مهندس', 'طباخ', 'نجار']

function d3JobTiles(rand: Rand): Question {
  const w = pick(rand, JOB_TILES)
  return tilesQ('اكتب مهنة من المهن', w, 'كل المهن مهمة')
}

const JOBS_TF: Array<[string, boolean]> = [
  ['كل المهن مهمة وتخدم المجتمع', true],
  ['أحترم عامل النظافة مثل الطبيب', true],
  ['المهنة السيئة لا نحترم صاحبها', false],
  ['أذاكر لأكون نافعا لبلدي', true],
  ['أحترم صاحب أي مهنة نافعة', true],
  ['أنجح بلا مذاكرة ولا عمل', false],
  ['لكل مهنة أدواتها ومكانها', true],
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
