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
  tfQ,
  unitDef,
  type Rand,
} from './helpers'

/* ---------- r4l1: مولد النبي ---------- */

const BIRTH_MATCH = [
  { left: 'مكة', right: '🕋 ولد فيها النبي' },
  { left: 'عام الفيل', right: '🐘 عام مولده' },
  { left: 'آمنة', right: '👩 أمه' },
  { left: 'حليمة', right: '🤱 مرضعته' },
  { left: 'عبد المطلب', right: '👴 جده' },
  { left: 'خديجة', right: '💝 زوجته' },
]

function r4BirthMatch(rand: Rand): Question {
  const pairs = shuffle(rand, BIRTH_MATCH).slice(0, 4)
  return matchQ(rand, 'صل كل اسم بما يعرفه عن حياة النبي', pairs)
}

const BIRTH_TF: Array<[string, boolean]> = [
  ['ولد النبي محمد في مكة المكرمة', true],
  ['ولد النبي في عام الفيل', true],
  ['أم النبي اسمها آمنة', true],
  ['ولد النبي في المدينة المنورة', false],
  ['أرضعت النبي حليمة السعدية', true],
]

function r4BirthTF(rand: Rand): Question {
  const [statement, answer] = pick(rand, BIRTH_TF)
  return tfQ('مولد النبي. هل الجملة صحيحة؟', statement, answer)
}

const r4l1 = makeLesson(
  'r4l1',
  'مولد النبي',
  ['EG-Rl-2S', 'EG-Rl-2R'],
  'sonic',
  'ولد الهدى!',
  'ولد نبينا محمد في مكة عام الفيل. أمه آمنة ومرضعته حليمة.',
  [r4BirthMatch, r4BirthTF],
)

/* ---------- r4l2: الوحي وبداية الدعوة ---------- */

function r4WahyOrder(rand: Rand): Question {
  void rand
  const steps = ['نزل جبريل في غار حراء', 'قال اقرأ باسم ربك', 'بدأ النبي دعوة الناس', 'آمن به أبو بكر وخديجة']
  return orderQ('رتب أحداث بداية الدعوة', steps, say(steps.join(' ثم ')))
}

const DAWA_MATCH = [
  { left: 'غار حراء', right: PICTURE_BANK.غار },
  { left: 'جبريل', right: '😇 ملك الوحي' },
  { left: 'اقرأ', right: '📖 أول كلمة نزلت' },
  { left: 'أبو بكر', right: '🧔 أول من آمن من الرجال' },
  { left: 'خديجة', right: '👩 أول من آمنت' },
]

function r4DawaMatch(rand: Rand): Question {
  const pairs = shuffle(rand, DAWA_MATCH).slice(0, 4)
  return matchQ(rand, 'صل كل اسم بدوره في بداية الدعوة', pairs)
}

const r4l2 = makeLesson(
  'r4l2',
  'الوحي والدعوة',
  ['EG-Rl-2S', 'EG-Rl-2L'],
  'tails',
  'اقرأ!',
  'نزل الوحي على النبي في غار حراء: اقرأ باسم ربك الذي خلق. ثم بدأ الدعوة.',
  [r4WahyOrder, r4DawaMatch],
)

/* ---------- r4l3: أخلاق النبي ومعجزاته ---------- */

const CHARACTER_TF: Array<[string, boolean]> = [
  ['كان النبي صادقا أمينا قبل البعثة', true],
  ['كان النبي يعفو ويسامح', true],
  ['كان النبي يحب الأطفال ويلاعبهم', true],
  ['انشق القمر معجزة للنبي', true],
  ['نبع الماء من بين أصابع النبي', true],
  ['كان النبي قاسيا على أصحابه', false],
]

function r4CharacterTF(rand: Rand): Question {
  const [statement, answer] = pick(rand, CHARACTER_TF)
  return tfQ('أخلاق النبي ومعجزاته. هل الجملة صحيحة؟', statement, answer)
}

function r4CharacterSpeak(rand: Rand): Question {
  const line = pick(rand, ['نبينا محمد صادق أمين', 'أحب النبي وأتبع سنته'])
  return speakQ('تحدث عن حبك للنبي', line, { hint: 'قل بحب!' })
}

const r4l3 = makeLesson(
  'r4l3',
  'أخلاق النبي',
  ['EG-Rl-2S', 'EG-Rl-2E'],
  'amy',
  'خلقه القرآن!',
  'نبينا صادق أمين رحيم. ومعجزاته مثل انشقاق القمر. نحبه ونتبع سنته.',
  [r4CharacterTF, r4CharacterSpeak],
)

/* ---------- r4boss ---------- */

const r4boss = makeLesson(
  'r4boss',
  'بطل السيرة',
  ['EG-Rl-2S', 'EG-Rl-2R', 'EG-Rl-2E'],
  'eggman',
  'تحدي البطل!',
  'مولد النبي والوحي والدعوة وأخلاقه كلها معا.',
  [r4BirthMatch, r4WahyOrder, r4CharacterTF, r4CharacterSpeak],
  r4DawaMatch,
)

export const UNIT_R4: UnitDef = unitDef(
  'r4',
  4,
  'سيرة نبينا',
  'دين · السيرة · مولده والوحي والدعوة وأخلاقه',
  '#0d7a5f',
  '🌙',
  [r4l1, r4l2, r4l3, r4boss],
)
