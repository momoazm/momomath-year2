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

/* ---------- a6l1: الرياضة لنا جميعا (استماع) ---------- */

const SPORT_MATCH = [
  { left: 'كرة القدم', right: '⚽ هدف' },
  { left: 'السباحة', right: '🏊 ماء' },
  { left: 'الجري', right: '🏃 سرعة' },
  { left: 'ركوب الدراجة', right: '🚲 عجلات' },
  { left: 'كرة السلة', right: '🏀 سلة' },
  { left: 'القفز', right: '🤸 حركة' },
]

function a6SportMatch(rand: Rand): Question {
  const pairs = shuffle(rand, SPORT_MATCH).slice(0, 4)
  return matchQ(rand, 'قصة استماع: الرياضة لنا جميعا. صل كل رياضة بما يناسبها', pairs)
}

function a6SportHear(rand: Rand): Question {
  const item = pick(rand, ['كرة القدم', 'السباحة', 'الجري', 'ركوب الدراجة'])
  const others = ['كرة القدم', 'السباحة', 'الجري', 'ركوب الدراجة'].filter((s) => s !== item)
  return mcqE(rand, 'استمع واضغط على الرياضة التي سمعتها', item, others, say(item))
}

const a6l1 = makeLesson(
  'a6l1',
  'الرياضة لنا جميعا',
  ['EG-Ar-2L', 'EG-Ar-2R'],
  'sonic',
  'هيا نلعب رياضة!',
  'قصة استماع: الرياضة لنا جميعا. الرياضة تقوي الجسم وتسعد القلب.',
  [a6SportMatch, a6SportHear],
)

/* ---------- a6l2: حسام والكمبيوتر ---------- */

const TECH_MATCH = [
  { left: 'كمبيوتر', right: '💻 شاشة' },
  { left: 'لوحة المفاتيح', right: '⌨️ حروف' },
  { left: 'فأرة', right: '🖱️ ضغطة' },
  { left: 'يطبع', right: '🖨️ ورقة' },
  { left: 'يرسم', right: '🎨 ألوان' },
  { left: 'يتعلم', right: PICTURE_BANK.كتاب },
]

function a6TechMatch(rand: Rand): Question {
  const pairs = shuffle(rand, TECH_MATCH).slice(0, 4)
  return matchQ(rand, 'درس القراءة: حسام والكمبيوتر. صل كل كلمة بما يناسبها', pairs)
}

const TECH_TF: Array<[string, boolean]> = [
  ['حسام يتعلم على الكمبيوتر دروسه', true],
  ['الكمبيوتر يساعدنا في التعلم والرسم', true],
  ['أجلس أمام الشاشة طوال اليوم دون توقف', false],
  ['أنا والكمبيوتر أصدقاء في التعلم', true],
  ['أشارك أخي اللعب على الكمبيوتر', true],
  ['أكسر لوحة المفاتيح عندما أغضب', false],
]

function a6TechTF(rand: Rand): Question {
  const [statement, answer] = pick(rand, TECH_TF)
  return tfQ('درس حسام والكمبيوتر. هل الجملة صحيحة؟', statement, answer)
}

function a6TechSpeak(rand: Rand): Question {
  const line = pick(rand, ['أنا أتعلم على الكمبيوتر دروسي', 'الكمبيوتر يساعدني في الرسم والتعلم'])
  return speakQ('تحدث عن الكمبيوتر بصوت واضح', line, { hint: 'قل جملة كاملة!' })
}

const a6l2 = makeLesson(
  'a6l2',
  'حسام والكمبيوتر',
  ['EG-Ar-2R', 'EG-Ar-2E'],
  'tails',
  'أنا والكمبيوتر!',
  'درس القراءة: حسام والكمبيوتر. التكنولوجيا تساعدنا عندما نستخدمها جيدا.',
  [a6TechMatch, a6TechTF, a6TechSpeak],
)

/* ---------- a6l3: أسلوب الأمر والنهي + الحروف المتشابهة ---------- */

const COMMAND_PROHIB = [
  { s: 'اكتب درسك', ans: 'أمر' },
  { s: 'لا تلعب في الشارع', ans: 'نهي' },
  { s: 'اشرب اللبن', ans: 'أمر' },
  { s: 'لا تسهر ليلا', ans: 'نهي' },
  { s: 'ساعد أمك', ans: 'أمر' },
  { s: 'لا ترم القمامة', ans: 'نهي' },
]

function a6StylePick(rand: Rand): Question {
  const item = pick(rand, COMMAND_PROHIB)
  const other = item.ans === 'أمر' ? 'نهي' : 'أمر'
  const choices = shuffle(rand, [item.ans, other])
  return mcqFixed(`«${item.s}» — أسلوب أمر أم نهي؟`, choices, choices.indexOf(item.ans), {
    hint: 'الأمر يطلب الفعل، والنهي يطلب الترك بـ لا',
  })
}

const SIMILAR_LETTERS = [
  { good: 'ذرة', odd: 'زرة', hint: 'ذ بالذال' },
  { good: 'ثعلب', odd: 'سعلب', hint: 'ث بالثاء' },
  { good: 'طائرة', odd: 'تائرة', hint: 'ط بالطاء' },
  { good: 'ضابط', odd: 'دابط', hint: 'ض بالضاد' },
]

function a6SimilarPick(rand: Rand): Question {
  const item = pick(rand, SIMILAR_LETTERS)
  const choices = shuffle(rand, [item.good, item.odd])
  return mcqFixed('أي كلمة مكتوبة بحروف صحيحة؟', choices, choices.indexOf(item.good), {
    hint: item.hint,
  })
}

function a6DescribeOrder(rand: Rand): Question {
  const item = pick(rand, [
    ['ألعب', 'كرة', 'القدم', 'مع', 'أصدقائي'],
    ['أتعلم', 'على', 'الكمبيوتر', 'دروسي'],
  ])
  return orderQ('رتب الكلمات لتكون جملة صحيحة', item, say(item.join(' ')))
}

const a6l3 = makeLesson(
  'a6l3',
  'الأمر والنهي',
  ['EG-Ar-2G', 'EG-Ar-2W'],
  'knuckles',
  'افعل ولا تفعل!',
  'الأساليب: أسلوب الأمر مثل اكتب، وأسلوب النهي مثل لا تلعب. واحذر الحروف المتشابهة في النطق.',
  [a6StylePick, a6SimilarPick, a6DescribeOrder],
)

/* ---------- a6boss ---------- */

const a6boss = makeLesson(
  'a6boss',
  'بطل الرياضة والتكنولوجيا',
  ['EG-Ar-2L', 'EG-Ar-2R', 'EG-Ar-2G'],
  'eggman',
  'تحدي البطل!',
  'الرياضة لنا جميعا وحسام والكمبيوتر والأمر والنهي كلها معا.',
  [a6SportMatch, a6TechMatch, a6StylePick, a6SimilarPick],
  a6StylePick,
)

export const UNIT_A6: UnitDef = unitDef(
  'a6',
  6,
  'الرياضة والتكنولوجيا ١',
  'سلاح التلميذ · الرياضة لنا جميعا · حسام والكمبيوتر · الأمر والنهي',
  '#0ea5e9',
  '⚽',
  [a6l1, a6l2, a6l3, a6boss],
)
