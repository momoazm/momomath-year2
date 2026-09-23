import type { Question, UnitDef } from '../types'
import {
  PICTURE_BANK,
  makeLesson,
  matchQ,
  mcqE,
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
  { left: 'المسجد', right: '🕌 نصلي ونتجمع فيه' },
  { left: 'المكتبة', right: '📖 نقرأ ونستعين بالكتب' },
  { left: 'الحديقة', right: '🏡 نلعب ونستريح' },
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
  ['أساعد جارًا كبيرًا في حمل حقائبه', true],
  ['أتحدث بصوت هادئ عند زيارة المستشفى', true],
  ['أنظف باب منزلي وأزرع زهرة أمامه', true],
  ['لا أحب مساعدة جيراني', false],
  ['أحترم عامل النظافة وأشكره على عمله', true],
  ['ألقي أوراق الشجر المتساقطة في سلة المهملات', true],
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
  { left: 'الحافلة', right: '🚌 تنقل الركاب في الشوارع' },
  { left: 'الدراجة', right: '🚲 نركبها قرب البيت' },
  { left: 'القارب', right: '🛶 يعبر مياه النيل' },
]

function d6TransportMatch(rand: Rand): Question {
  const pairs = shuffle(rand, TRANSPORT_MATCH).slice(0, 4)
  return matchQ(rand, 'صل كل وسيلة مواصلات بما يناسبها', pairs)
}

const TRANSPORT_MCQ: { q: string; a: string; others: string[] }[] = [
  { q: 'أي وسيلة أسرع: الجمل أم الطائرة؟', a: 'الطائرة', others: ['الجمل'] },
  { q: 'أي وسيلة تسير على القضبان؟', a: 'القطار', others: ['السيارة', 'الجمل', 'الدراجة'] },
  { q: 'أي وسيلة تطير في السماء؟', a: 'الطائرة', others: ['القارب', 'الحافلة', 'القطار'] },
  { q: 'أي وسيلة تعبر مياه النيل؟', a: 'القارب', others: ['الدراجة', 'الحافلة', 'القطار'] },
  { q: 'أي وسيلة كنا نستخدمها قديما في الصحراء؟', a: 'الجمل', others: ['السيارة', 'الطائرة', 'المترو'] },
  { q: 'أي وسيلة تسير تحت الأرض في المدن الكبيرة؟', a: 'المترو', others: ['الدراجة', 'الحافلة', 'القارب'] },
  { q: 'أي وسيلة تناسب الطريق القصير قرب البيت؟', a: 'الدراجة', others: ['القطار', 'الطائرة', 'القارب'] },
  { q: 'أي وسيلة تنقل كثيرًا من الركاب في الشوارع؟', a: 'الحافلة', others: ['الدراجة', 'القارب', 'الجمل'] },
  { q: 'أي وسيلة يستخدمها الصياد ليعبر الماء؟', a: 'القارب', others: ['الدراجة', 'الطائرة', 'القطار'] },
  { q: 'أي وسيلة يقودها السائق لتنقل أسرتي؟', a: 'السيارة', others: ['القطار', 'الطائرة', 'القارب'] },
]

function d6TransportPick(rand: Rand): Question {
  const item = pick(rand, TRANSPORT_MCQ)
  return mcqE(rand, item.q, item.a, item.others, { hint: 'فكّر في مكان كل وسيلة' })
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

const GREEN_LINES = [
  'أحافظ على بيئتي نظيفة',
  'أزرع شجرة في حيي',
  'أطفئ الأنوار عند الخروج',
  'أرشد استهلاك الماء والكهرباء',
  'أعيد تدوير الورق والكرتون',
  'أمشي في الحديقة وأحافظ على نظافتها',
  'أقول لا للتلوث دائما',
]

function d6GreenSpeak(rand: Rand): Question {
  const line = pick(rand, GREEN_LINES)
  return speakQ('تحدث عن حمايتك للبيئة', line, { hint: 'قل بحماس!' })
}

const GREEN_ORDERS: string[][] = [
  ['أجمع', 'القمامة', 'في', 'السلة'],
  ['أزرع', 'زهرة', 'أمام', 'بيتي'],
  ['أطفئ', 'الضوء', 'عند', 'الخروج'],
  ['أغلق', 'الصنبور', 'بعد', 'الوضوء'],
  ['أحفظ', 'الماء', 'والكهرباء', 'في', 'بيتي'],
  ['أعيد', 'تدوير', 'الورق', 'والكرتون'],
  ['أنظف', 'شوارع', 'حيي', 'كل', 'يوم'],
]

function d6GreenOrder(rand: Rand): Question {
  const item = pick(rand, GREEN_ORDERS)
  return orderQ('رتب كلمات الجملة الخضراء', item, say(item.join(' ')))
}

const GREEN_TF: Array<[string, boolean]> = [
  ['أرمي القمامة في السلة', true],
  ['أوفر الماء والكهرباء', true],
  ['أقطف أزهار الحديقة العامة', false],
  ['أزرع شجرة وأسقيها', true],
  ['ألقي النفايات في النهر', false],
  ['أركب الدراجة للمسافات القريبة', true],
  ['أفتح الصنبور طوال تنظيف أسناني', false],
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
