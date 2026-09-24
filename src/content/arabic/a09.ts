import type { Question, UnitDef } from '../types'
import {
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

/* ---------- a9l1: أدوات الاستفهام ---------- */

const ISTIFHAM = [
  { tool: 'من', ex: 'من يطرق الباب؟' },
  { tool: 'ماذا', ex: 'ماذا تأكل؟' },
  { tool: 'أين', ex: 'أين كتابي؟' },
  { tool: 'متى', ex: 'متى تذهب إلى النادي؟' },
  { tool: 'لماذا', ex: 'لماذا تذاكر دروسك؟' },
  { tool: 'كم', ex: 'كم قلما معك؟' },
]

function a9ToolMatch(rand: Rand): Question {
  const pairs = shuffle(rand, ISTIFHAM.map((t) => ({ left: t.tool, right: t.ex }))).slice(0, 4)
  return matchQ(rand, 'صل كل أداة استفهام بمثالها', pairs)
}

const QA_PAIRS = [
  { q: 'أين تذهب صباحا؟', a: 'أذهب إلى المدرسة', others: ['أذهب إلى البحر', 'أنام مبكرا', 'آكل التفاح'] },
  { q: 'لماذا تذاكر دروسك؟', a: 'لأنجح بتفوق', others: ['لألعب بالكرة', 'لأنام مبكرا', 'لآكل الحلوى'] },
  { q: 'متى تذهب إلى النادي؟', a: 'أذهب في الخامسة مساء', others: ['أذهب في الصباح الباكر', 'لا أذهب أبدا', 'أذهب نهارا'] },
  { q: 'كم قلما معك؟', a: 'معي قلمان', others: ['معي كتاب', 'معي حقيبة', 'معي مسطرة'] },
]

function a9AnswerPick(rand: Rand): Question {
  const item = pick(rand, QA_PAIRS)
  const choices = shuffle(rand, [item.a, ...item.others.slice(0, 3)])
  return mcqE(rand, item.q, item.a, choices.filter((c) => c !== item.a), say(item.q))
}

const a9l1 = makeLesson(
  'a9l1',
  'أدوات الاستفهام',
  ['EG-Ar-2G', 'EG-Ar-2R'],
  'sonic',
  'أسأل وأجيب!',
  'أدوات الاستفهام: من وماذا وأين ومتى ولماذا وكم. اسأل سؤالا صحيحا وأجب إجابة صحيحة.',
  [a9ToolMatch, a9AnswerPick],
)

/* ---------- a9l2: حروف الجر والعطف ---------- */

const PREP_MATCH = [
  { left: 'في', right: 'الكتاب في الحقيبة' },
  { left: 'على', right: 'القطة على الكرسي' },
  { left: 'إلى', right: 'أذهب إلى المدرسة' },
  { left: 'عن', right: 'أسأل عن صديقي' },
  { left: 'و', right: 'أحمد ومريم' },
  { left: 'ثم', right: 'أذاكر ثم ألعب' },
]

function a9PrepMatch(rand: Rand): Question {
  const pairs = shuffle(rand, PREP_MATCH).slice(0, 4)
  return matchQ(rand, 'صل كل حرف بمثال يوضح معناه', pairs)
}

const PREP_CLOZE = [
  { s: 'الكتاب .... الحقيبة', ans: 'في', others: ['على', 'إلى'] },
  { s: 'القطة .... الكرسي', ans: 'على', others: ['في', 'عن'] },
  { s: 'أذهب .... المدرسة صباحا', ans: 'إلى', others: ['في', 'على'] },
  { s: 'ألعب .... أصدقائي', ans: 'مع', others: ['في', 'إلى'] },
]

function a9PrepCloze(rand: Rand): Question {
  const item = pick(rand, PREP_CLOZE)
  const choices = shuffle(rand, [item.ans, ...item.others])
  return mcqFixed(`«${item.s}» — ما الحرف الناقص؟`, choices, choices.indexOf(item.ans))
}

const a9l2 = makeLesson(
  'a9l2',
  'حروف الجر والعطف',
  ['EG-Ar-2G', 'EG-Ar-2R'],
  'knuckles',
  'حروف صغيرة مهمة!',
  'حروف الجر مثل في وعلى وإلى، وحروف العطف مثل الواو وثم. أكمل الجملة بالحرف الصحيح.',
  [a9PrepMatch, a9PrepCloze],
)

/* ---------- a9l3: الشدة مع التنوين ---------- */

const SHADDA_TANWEEN = ['قطٌّ', 'معلّمٌ', 'سيّارةً', 'تفّاحٌ']
const PLAIN_TANWEEN = ['قمرٌ', 'كتابٌ', 'بابٌ', 'نيلٌ']

function a9ShaddaTanween(rand: Rand): Question {
  const item = pick(rand, SHADDA_TANWEEN)
  const others = shuffle(rand, PLAIN_TANWEEN).slice(0, 3)
  return mcqE(rand, 'أي كلمة فيها شدة مع التنوين؟', item, others, say(item))
}

const SCHOOL_TF: Array<[string, boolean]> = [
  ['في مدرستي معلم يحبنا', true],
  ['في مدرستي مكتبة فيها قصص جميلة', true],
  ['أرمي الأوراق في فناء المدرسة', false],
  ['أحافظ على نظافة مدرستي', true],
  ['أصرخ في الفصل أثناء الشرح', false],
]

function a9SchoolTF(rand: Rand): Question {
  const [statement, answer] = pick(rand, SCHOOL_TF)
  return tfQ('في مدرستي. هل الجملة صحيحة؟', statement, answer)
}

function a9SchoolOrder(rand: Rand): Question {
  const item = pick(rand, [
    ['أذهب', 'إلى', 'مدرستي', 'صباحا'],
    ['أجلس', 'على', 'الكرسي', 'في', 'الفصل'],
  ])
  return orderQ('رتب كلمات الجملة عن المدرسة', item, say(item.join(' ')))
}

const a9l3 = makeLesson(
  'a9l3',
  'في مدرستي',
  ['EG-Ar-2G', 'EG-Ar-2E'],
  'amy',
  'مدرستي جميلة!',
  'القواعد الإملائية: الشدة مع التنوين. ثم تحدث عن مدرستك ورتب الجمل.',
  [a9ShaddaTanween, a9SchoolTF, a9SchoolOrder],
)

/* ---------- a9boss ---------- */

const a9boss = makeLesson(
  'a9boss',
  'بطل المدرسة',
  ['EG-Ar-2G', 'EG-Ar-2R', 'EG-Ar-2E'],
  'eggman',
  'تحدي البطل!',
  'أدوات الاستفهام وحروف الجر والعطف والشدة مع التنوين كلها معا.',
  [a9ToolMatch, a9PrepMatch, a9ShaddaTanween, a9SchoolOrder],
  a9PrepCloze,
)

export const UNIT_A9: UnitDef = unitDef(
  'a9',
  9,
  'في مدرستي',
  'سلاح التلميذ · ترم ثان · الاستفهام · حروف الجر والعطف · الشدة مع التنوين',
  '#4a90e2',
  '🏫',
  [a9l1, a9l2, a9l3, a9boss],
)
