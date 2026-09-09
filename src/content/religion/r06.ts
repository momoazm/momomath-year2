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

/* ---------- r6l1: الصدق والأمانة ---------- */

const HONEST_MATCH = [
  { left: 'الصدق', right: '✅ أقول الحق دائما' },
  { left: 'الكذب', right: '🚫 يغضب الله' },
  { left: 'الأمانة', right: PICTURE_BANK.صدقة },
  { left: 'الخيانة', right: '⛔ صفة ذميمة' },
  { left: 'الوعد', right: '🤝 أوفي بوعدي' },
]

function r6HonestMatch(rand: Rand): Question {
  const pairs = shuffle(rand, HONEST_MATCH).slice(0, 4)
  return matchQ(rand, 'صل كل خلق بما يدل عليه', pairs)
}

const HONEST_TF: Array<[string, boolean]> = [
  ['المسلم صادق يقول الحق دائما', true],
  ['أعيد القلم الذي وجدته لصاحبه', true],
  ['الكذب ينجي صاحبه دائما', false],
  ['الأمانة أن أحفظ أسرار أصدقائي', true],
  ['أخلف وعدي إذا كان صعبا', false],
]

function r6HonestTF(rand: Rand): Question {
  const [statement, answer] = pick(rand, HONEST_TF)
  return tfQ('الصدق والأمانة. هل الجملة صحيحة؟', statement, answer)
}

const r6l1 = makeLesson(
  'r6l1',
  'الصدق والأمانة',
  ['EG-Rl-2E', 'EG-Rl-2R'],
  'sonic',
  'صادق وأمين!',
  'المسلم صادق في قوله أمين في فعله. الصدق ينجي والأمانة تزين صاحبها.',
  [r6HonestMatch, r6HonestTF],
)

/* ---------- r6l2: بر الوالدين واحترام المعلم ---------- */

function r6ParentsSpeak(rand: Rand): Question {
  const line = pick(rand, ['أحب أبي وأمي وأطيعهما', 'رب اغفر لي ولوالدي'])
  return speakQ('تحدث عن برك بوالديك', line, { hint: 'قل بحب!' })
}

const PARENTS_TF: Array<[string, boolean]> = [
  ['أقبل يد أبي وأمي وأحترمهما', true],
  ['أساعد أمي في أعمال البيت', true],
  ['أرفع صوتي على معلمي في الفصل', false],
  ['أستمع لشرح معلمي بانتباه', true],
  ['أدعو لوالدي بالرحمة والمغفرة', true],
]

function r6ParentsTF(rand: Rand): Question {
  const [statement, answer] = pick(rand, PARENTS_TF)
  return tfQ('بر الوالدين. هل الجملة صحيحة؟', statement, answer)
}

const VALUE_TILES = ['صدق', 'أمانة', 'بر', 'شكر', 'عهد']

function r6ValueTiles(rand: Rand): Question {
  const w = pick(rand, VALUE_TILES)
  return tilesQ('اكتب خلقا من أخلاق المسلم', w, 'المسلم جميل الأخلاق')
}

const r6l2 = makeLesson(
  'r6l2',
  'بر الوالدين',
  ['EG-Rl-2E', 'EG-Rl-2W'],
  'amy',
  'أبي وأمي ومعلمي!',
  'بر الوالدين واحترام المعلم من أعظم الأخلاق. قل وتحدث واكتب.',
  [r6ParentsSpeak, r6ParentsTF, r6ValueTiles],
)

/* ---------- r6l3: الصحابة قدوتنا ---------- */

const SAHABA_MATCH = [
  { left: 'أبو بكر', right: '🧔 الصديق أول الخلفاء' },
  { left: 'عمر', right: '⚖️ الفاروق العادل' },
  { left: 'عثمان', right: '📖 جمع القرآن' },
  { left: 'علي', right: '🦁 الشجاع العالم' },
  { left: 'حمزة', right: '🏹 أسد الله' },
]

function r6SahabaMatch(rand: Rand): Question {
  const pairs = shuffle(rand, SAHABA_MATCH).slice(0, 4)
  return matchQ(rand, 'صل كل صحابي بما اشتهر به', pairs)
}

function r6SahabaPick(rand: Rand): Question {
  const item = pick(rand, [
    { q: 'من أول الخلفاء الراشدين ولقب بالصديق؟', a: 'أبو بكر', others: ['عمر', 'عثمان', 'علي'] },
    { q: 'من لقب بالفاروق لعدله؟', a: 'عمر', others: ['حمزة', 'علي', 'أبو بكر'] },
    { q: 'من جمع القرآن في مصحف واحد؟', a: 'عثمان', others: ['عمر', 'علي', 'حمزة'] },
  ])
  return mcqE(rand, item.q, item.a, item.others, say(item.a))
}

const r6l3 = makeLesson(
  'r6l3',
  'الصحابة قدوتنا',
  ['EG-Rl-2S', 'EG-Rl-2E'],
  'tails',
  'قدوتي الصحابة!',
  'أبو بكر وعمر وعثمان وعلي: صحابة النبي وقدوتنا في الخير.',
  [r6SahabaMatch, r6SahabaPick],
)

/* ---------- r6boss ---------- */

function r6YearOrder(rand: Rand): Question {
  void rand
  return orderQ('رتب: مسلم اليوم الكامل', ['أصلي الفجر', 'أذهب إلى المدرسة', 'أساعد أمي', 'أنام مبكرا'], say('يوم المسلم الصغير'))
}

const r6boss = makeLesson(
  'r6boss',
  'بطل الأخلاق',
  ['EG-Rl-2E', 'EG-Rl-2S', 'EG-Rl-2W'],
  'eggman',
  'تحدي البطل!',
  'الصدق والأمانة وبر الوالدين والصحابة: أخلاق المسلم كلها معا.',
  [r6HonestMatch, r6ParentsTF, r6SahabaMatch, r6YearOrder],
  r6SahabaPick,
)

export const UNIT_R6: UnitDef = unitDef(
  'r6',
  6,
  'أخلاق المسلم',
  'دين · القيم · الصدق والأمانة وبر الوالدين والصحابة',
  '#0d7a5f',
  '💚',
  [r6l1, r6l2, r6l3, r6boss],
)
