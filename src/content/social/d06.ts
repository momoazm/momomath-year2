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

/* ---------- d6l1: أسرتي ومدرستي وحيي ---------- */

const COMMUNITY_MATCH = [
  { left: 'الأسرة', right: '👨‍👩‍👧 أبي وأمي وإخوتي' },
  { left: 'المدرسة', right: '🏫 أتعلم فيها' },
  { left: 'الحي', right: '🏠 جيراني وأصدقائي' },
  { left: 'المستشفى', right: '🏥 نعالج فيها' },
  { left: 'السوق', right: '🏪 نشتري منه' },
  { left: 'الحديقة', right: '🌳 نلعب ونستريح' },
  { left: 'المكتبة', right: '📚 نقرأ الكتب' },
  { left: 'الملعب', right: '⚽ نلعب الكرة' },
]

function d6CommunityMatch(rand: Rand): Question {
  const pairs = shuffle(rand, COMMUNITY_MATCH).slice(0, 4)
  return matchQ(rand, 'صل كل مكان في مجتمعي بدوره', pairs)
}

const COMMUNITY_TF: Array<[string, boolean]> = [
  ['أحترم جيراني وأساعدهم', true],
  ['أحافظ على نظافة مدرستي وحيي', true],
  ['ألعب الكرة في الشارع وأزعج الجيران', false],
  ['أشارك في تنظيف الحي', true],
  ['أساعد جدي وجدتي في البيت', true],
  ['أقول كلمة شكرا لجيراني', true],
  ['أزور مريض من أهل الحي', true],
  ['أعبث بأغراض الجيران', false],
]

function d6CommunityTF(rand: Rand): Question {
  const [statement, answer] = pick(rand, COMMUNITY_TF)
  return tfQ('مجتمعي. هل الجملة صحيحة؟', statement, answer)
}

const d6l1 = makeLesson(
  'd6l1',
  'أسرتي ومدرستي وحيي',
  ['EG-So-2C', 'EG-So-2R'],
  'sonic',
  'مجتمعي الجميل!',
  'أسرتي ومدرستي وحيي: مجتمعي الصغير الذي أحبه وأحافظ عليه.',
  [d6CommunityMatch, d6CommunityTF],
)

/* ---------- d6l2: المواصلات قديما وحديثا ---------- */

const TRANSPORT_MATCH = [
  { left: 'الجمل', right: '🐪 سفينة الصحراء قديما' },
  { left: 'السيارة', right: PICTURE_BANK.سيارة },
  { left: 'القطار', right: PICTURE_BANK.قطار },
  { left: 'المترو', right: PICTURE_BANK.مترو },
  { left: 'الطائرة', right: PICTURE_BANK.طائرة },
  { left: 'السفينة', right: '🚢 تسير في البحر' },
  { left: 'الدراجة', right: PICTURE_BANK.دراجة },
  { left: 'الحافلة', right: '🚌 تنقل الركاب' },
]

function d6TransportMatch(rand: Rand): Question {
  const pairs = shuffle(rand, TRANSPORT_MATCH).slice(0, 4)
  return matchQ(rand, 'صل كل وسيلة مواصلات بما يناسبها', pairs)
}

const TRANSPORT_ASKS: Array<{ q: string; a: string; others: string[] }> = [
  { q: 'أي وسيلة تسير في البحر؟', a: 'السفينة', others: ['القطار', 'الجمل', 'الدراجة'] },
  { q: 'أي وسيلة تنقلك من مدينة إلى أخرى بسرعة؟', a: 'القطار', others: ['الجمل', 'الدراجة', 'السفينة'] },
  { q: 'أي وسيلة تطير في السماء؟', a: 'الطائرة', others: ['السيارة', 'الجمل', 'السفينة'] },
  { q: 'أي وسيلة كانت تُستخدم قديما في الصحراء؟', a: 'الجمل', others: ['الطائرة', 'السيارة', 'المترو'] },
  { q: 'أي وسيلة تسير على قضبان في الأرض؟', a: 'القطار', others: ['الحافلة', 'الدراجة', 'السفينة'] },
  { q: 'أي وسيلة تسير تحت الأرض في المدن الكبيرة؟', a: 'المترو', others: ['الجمل', 'الدراجة', 'السفينة'] },
]

function d6TransportPick(rand: Rand): Question {
  if (rand() < 0.75) {
    const item = pick(rand, TRANSPORT_ASKS)
    return mcqE(rand, item.q, item.a, item.others, say(item.a))
  }
  const choices = shuffle(rand, ['الجمل', 'الطائرة'])
  return mcqFixed('أي وسيلة أسرع: الجمل أم الطائرة؟', choices, choices.indexOf('الطائرة'), {
    hint: 'الطائرة تطير في السماء',
  })
}

const d6l2 = makeLesson(
  'd6l2',
  'المواصلات',
  ['EG-So-2H', 'EG-So-2L'],
  'tails',
  'من الجمل إلى الطائرة!',
  'قديما كانوا يسافرون بالجمل، واليوم بالسيارة والقطار والطائرة.',
  [d6TransportMatch, d6TransportPick],
)

/* ---------- d6l3: بيئتي مسؤوليتي ---------- */

function d6GreenSpeak(rand: Rand): Question {
  const line = pick(rand, [
    'أحافظ على بيئتي نظيفة',
    'أزرع شجرة في حيي',
    'أطفئ الضوء عند الخروج',
    'أوفر الماء في البيت',
    'لا أرمي القمامة في الشارع',
    'أحفظ نظافة مدرستي',
  ])
  return speakQ('تحدث عن حمايتك للبيئة', line, { hint: 'قل بحماس!' })
}

function d6GreenOrder(rand: Rand): Question {
  const item = pick(rand, [
    ['أجمع', 'القمامة', 'في', 'السلة'],
    ['أزرع', 'زهرة', 'أمام', 'بيتي'],
    ['أطفئ', 'الضوء', 'عند', 'الخروج'],
    ['أوفر', 'الماء', 'في', 'البيت'],
    ['أحفظ', 'نظافة', 'حيي'],
    ['أسقي', 'الشجرة', 'كل', 'يوم'],
  ])
  return orderQ('رتب كلمات الجملة الخضراء', item, say(item.join(' ')))
}

const GREEN_TF: Array<[string, boolean]> = [
  ['أرمي القمامة في السلة', true],
  ['أوفر الماء والكهرباء', true],
  ['أقطف أزهار الحديقة العامة', false],
  ['أزرع شجرة وأسقيها', true],
  ['أطفئ الضوء إذا خرجت من الغرفة', true],
  ['أعيد استخدام الأشياء القديمة', true],
  ['أركب الدراجة بدلا من السيارة', true],
  ['أفرغ القمامة في النهر', false],
]

function d6GreenTF(rand: Rand): Question {
  const [statement, answer] = pick(rand, GREEN_TF)
  return tfQ('بيئتي. هل الجملة صحيحة؟', statement, answer)
}

const d6l3 = makeLesson(
  'd6l3',
  'بيئتي مسؤوليتي',
  ['EG-So-2C', 'EG-So-2E'],
  'knuckles',
  'صديق البيئة!',
  'بيئتي مسؤوليتي: نظافة وتوفير وتشجير. كن صديقا للبيئة.',
  [d6GreenSpeak, d6GreenOrder, d6GreenTF],
)

/* ---------- d6boss ---------- */

const d6boss = makeLesson(
  'd6boss',
  'بطل المجتمع',
  ['EG-So-2C', 'EG-So-2H', 'EG-So-2E'],
  'eggman',
  'تحدي البطل!',
  'مجتمعي والمواصلات والبيئة: دراسات السنة كلها معا.',
  [d6CommunityMatch, d6TransportMatch, d6GreenSpeak, d6GreenOrder],
  d6CommunityTF,
)

export const UNIT_D6: UnitDef = unitDef(
  'd6',
  6,
  'مجتمعي',
  'دراسات · مواطنة · أسرتي والمواصلات والبيئة',
  '#00cd9c',
  '🏡',
  [d6l1, d6l2, d6l3, d6boss],
)
