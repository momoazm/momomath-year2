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
  { left: 'الوفاء', right: '🤝 أوفي بالعهد' },
  { left: 'النصيحة', right: '💡 أحسن إلى الناس' },
  { left: 'الرفق', right: '🕊️ لين مع الناس' },
  { left: 'العهد', right: '📜 أحفظ ما عاهدت عليه' },
  { left: 'الشكر', right: '🙏 أشكر من أحسن إلي' },
  { left: 'الكتمان', right: '🔒 أحفظ أسرار أصدقائي' },
  { left: 'التواضع', right: '🙇 لست متكبرا' },
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
  ['أوفي بعهدي حتى لو كان صعبا', true],
  ['أنصح صديقي حتى لو لم يحب النصيحة', true],
  ['أفضح سر صديقي أمام الجميع', false],
  ['أطلب الإذن قبل أخذ أشياء الآخرين', true],
  ['أقول الحقيقة ولو كانت في غير مصلحتي', true],
  ['كل ما يقوله الناس صحيح', false],
  ['أعتذر إذا أخطأت في حق صديقي', true],
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

const PARENTS_LINES = [
  'أحب أبي وأمي وأطيعهما',
  'رب اغفر لي ولوالدي',
  'أحسن إلى والدي وأخدمهما',
  'أدعو لأمي بالصحة والعافية',
  'أطلب رضا أبي وأمي',
  'أقول الحمد لله على والدي',
  'أصلي لأمي وأبي كل يوم',
  'أتكلم مع أمي بلطف',
  'أشكر أمي على تعبها',
  'أجلس مع أبي وأحدثه',
  'أحترم معلمي كما أحترم والدي',
  'أقول لأمي إنني أحبها',
]

function r6ParentsSpeak(rand: Rand): Question {
  const line = pick(rand, PARENTS_LINES)
  return speakQ('تحدث عن برك بوالديك', line, { hint: 'قل بحب!' })
}

const PARENTS_TF: Array<[string, boolean]> = [
  ['أقبل يد أبي وأمي وأحترمهما', true],
  ['أساعد أمي في أعمال البيت', true],
  ['أرفع صوتي على معلمي في الفصل', false],
  ['أستمع لشرح معلمي بانتباه', true],
  ['أدعو لوالدي بالرحمة والمغفرة', true],
  ['ألقي التحية على والدي أولا', true],
  ['أرفض مساعدة أمي في أعمال البيت', false],
  ['أحفظ كلمتي لأمي ولا أخالفها', true],
  ['أتكلم مع أبي بهدوء وأحترام', true],
  ['أغضب من أمي إذا عاتبتني', false],
  ['أشكر معلمي على علمه وأحترمه', true],
  ['أدعو لمعلمي بالهداية', true],
]

function r6ParentsTF(rand: Rand): Question {
  const [statement, answer] = pick(rand, PARENTS_TF)
  return tfQ('بر الوالدين. هل الجملة صحيحة؟', statement, answer)
}

const VALUE_TILES = ['صدق', 'أمانة', 'بر', 'شكر', 'عهد', 'صبر', 'محبة', 'رحمة', 'طاعة', 'دعاء']

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
  { left: 'بلال', right: '📿 مؤذن الرسول' },
  { left: 'زيد', right: '✍️ كاتب الوحي' },
  { left: 'سعد', right: '🐎 فارس المسلمين' },
  { left: 'جعفر', right: '🧑 يشبه النبي في الخلق' },
  { left: 'عائشة', right: '👩 أم المؤمنين عالمة' },
  { left: 'خديجة', right: '💍 أول من آمنت' },
  { left: 'الأنصار', right: '🏠 نصروا الدين' },
]

function r6SahabaMatch(rand: Rand): Question {
  const pairs = shuffle(rand, SAHABA_MATCH).slice(0, 4)
  return matchQ(rand, 'صل كل صحابي بما اشتهر به', pairs)
}

const SAHABA_PICK: { q: string; a: string; others: string[] }[] = [
  { q: 'من أول الخلفاء الراشدين ولقب بالصديق؟', a: 'أبو بكر', others: ['عمر', 'عثمان', 'علي'] },
  { q: 'من لقب بالفاروق لعدله؟', a: 'عمر', others: ['حمزة', 'علي', 'أبو بكر'] },
  { q: 'من جمع القرآن في مصحف واحد؟', a: 'عثمان', others: ['عمر', 'علي', 'حمزة'] },
  { q: 'من لقب بأسد الله شجاعا؟', a: 'حمزة', others: ['أبو بكر', 'عمر', 'علي'] },
  { q: 'من أول من نادى بالأذان؟', a: 'بلال', others: ['أبو بكر', 'عمر', 'عثمان'] },
  { q: 'من كان كاتب الوحي للنبي؟', a: 'زيد', others: ['بلال', 'جعفر', 'سعد'] },
  { q: 'من لقب بفارس المسلمين؟', a: 'سعد', others: ['حمزة', 'زيد', 'جعفر'] },
  { q: 'من أول من آمن من الغلمان؟', a: 'علي', others: ['أبو بكر', 'عمر', 'عثمان'] },
  { q: 'من لقب ذو النورين؟', a: 'عثمان', others: ['أبو بكر', 'عمر', 'حمزة'] },
  { q: 'من عالمة الأمة وأم المؤمنين؟', a: 'عائشة', others: ['خديجة', 'فاطمة', 'سمية'] },
  { q: 'من شابه النبي في خلقه وأخلاقه؟', a: 'جعفر', others: ['بلال', 'زيد', 'سعد'] },
  { q: 'من أول من آمنت من النساء؟', a: 'خديجة', others: ['عائشة', 'فاطمة', 'سمية'] },
]

function r6SahabaPick(rand: Rand): Question {
  const item = pick(rand, SAHABA_PICK)
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
