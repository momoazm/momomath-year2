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

/* ---------- r3l1: الأذان ينادينا ---------- */

const ADHAN_MATCH = [
  { left: 'الله أكبر', right: '🔊 بداية الأذان' },
  { left: 'أشهد أن لا إله إلا الله', right: '☝️ التوحيد' },
  { left: 'أشهد أن محمدا رسول الله', right: '📿 الرسالة' },
  { left: 'حي على الصلاة', right: '🕌 تعال إلى المسجد' },
  { left: 'حي على الفلاح', right: '🌟 تعال إلى الخير' },
  { left: 'حي على أفضل العمل', right: '🙏 أفضل الأعمال' },
  { left: 'قد قامت الصلاة', right: '⏰ حان وقت الصلاة' },
  { left: 'الصلاة خير من النوم', right: '😴 قم إلى الصلاة' },
  { left: 'برحمتك الله', right: '💝 نرجو رحمة الله' },
  { left: 'أصبحنا وأصبح الملك لله', right: '🌅 نحمد الله في الصباح' },
  { left: 'أمسينا وأمسى الملك لله', right: '🌇 نحمد الله في المساء' },
  { left: 'اللهم صل على محمد', right: '🤲 نصلي على النبي' },
]

const ADHAN_PHRASES = ADHAN_MATCH.map((p) => p.left)

function r3AdhanMatch(rand: Rand): Question {
  const pairs = shuffle(rand, ADHAN_MATCH).slice(0, 4)
  return matchQ(rand, 'صل كل جملة من الأذان بمعناها', pairs)
}

function r3AdhanHear(rand: Rand): Question {
  const item = pick(rand, ADHAN_PHRASES)
  const others = ADHAN_PHRASES.filter((a) => a !== item)
  return mcqE(rand, 'استمع واضغط على جملة الأذان التي سمعتها', item, others, say(item))
}

const r3l1 = makeLesson(
  'r3l1',
  'الأذان ينادينا',
  ['EG-Rl-2F', 'EG-Rl-2L'],
  'sonic',
  'حي على الصلاة!',
  'الأذان ينادي المسلمين للصلاة: الله أكبر وحي على الصلاة وحي على الفلاح.',
  [r3AdhanMatch, r3AdhanHear],
)

/* ---------- r3l2: أتوضأ وأصلي ---------- */

const WUDU_ORDER: { label: string; items: string[] }[] = [
  { label: 'رتب خطوات الوضوء بالترتيب', items: ['أنوي الوضوء', 'أغسل وجهي', 'أغسل يدي إلى المرفقين', 'أمسح رأسي', 'أغسل رجلي'] },
  { label: 'رتب خطوات الصلاة', items: ['أصلي التكبيرة', 'أقرأ الفاتحة', 'أركع', 'أسجد', 'أتشهد', 'أسلم'] },
  { label: 'رتب أجزاء الصلاة', items: ['القيام والقراءة', 'الركوع', 'الرفع من الركوع', 'السجود', 'التشهد', 'التسليم'] },
  { label: 'رتب الصلوات الخمس في يومك', items: ['صلاة الفجر', 'صلاة الظهر', 'صلاة العصر', 'صلاة المغرب', 'صلاة العشاء'] },
  { label: 'رتب خطوات الوضوء بالسنة', items: ['أجرم فمي وأنفي', 'أغسل وجهي', 'أغسل يدي', 'أمسح رأسي', 'أغسل أذني', 'أغسل رجلي'] },
  { label: 'رتب أول خطوات الوضوء', items: ['أجرم فمي', 'أغسل وجهي', 'أغسل يدي', 'أمسح رأسي'] },
  { label: 'رتب الاستعداد للصلاة في المسجد', items: ['أتوضأ', 'أذهب إلى المسجد', 'أصلي مع الإمام', 'أدعو ربي'] },
  { label: 'رتب خطوات الصلاة المختصرة', items: ['أستقبل القبلة', 'أقرؤ الفاتحة', 'أركع', 'أسجد', 'أسلم'] },
  { label: 'رتب الاستعداد للمكتوبة', items: ['أسمع الأذان', 'أتوضأ', 'أذهب إلى المسجد', 'أصلي المكتوبة'] },
  { label: 'رتب الطهارة والنية', items: ['أنوي الطهارة', 'أجرم فمي', 'أغسل وجهي', 'أغسل يدي'] },
  { label: 'رتب الطهارة قبل الصلاة', items: ['أغسل وجهي', 'أغسل يدي', 'أمسح رأسي', 'أغسل رجلي', 'أصلي ركعتين'] },
  { label: 'رتب ترتيب الركوع والسجود', items: ['أصلي التكبيرة', 'أسمع القراءة', 'أركع', 'أرفع من الركوع', 'أسجد', 'أتشهد', 'أسلم'] },
]

function r3WuduOrder(rand: Rand): Question {
  const task = pick(rand, WUDU_ORDER)
  return orderQ(task.label, task.items, say(task.items.join(' ثم ')))
}

const PRAYERS: Array<[string, string, string]> = [
  ['الفجر', 'ركعتان', '🌅'],
  ['الظهر', 'أربع ركعات', '☀️'],
  ['العصر', 'أربع ركعات', '🌤️'],
  ['المغرب', 'ثلاث ركعات', '🌇'],
  ['العشاء', 'أربع ركعات', '🌙'],
]

function r3PrayerMatch(rand: Rand): Question {
  const pairs = shuffle(rand, PRAYERS).slice(0, 4).map(([name, count, pic]) => ({ left: `صلاة ${name}`, right: `${pic} ${count}` }))
  return matchQ(rand, 'صل كل صلاة بعدد ركعاتها', pairs)
}

function r3PrayerPick(rand: Rand): Question {
  const [name, count] = pick(rand, PRAYERS)
  const choices = shuffle(rand, ['ركعتان', 'ثلاث ركعات', 'أربع ركعات'])
  return mcqFixed(`كم عدد ركعات صلاة ${name}؟`, choices, choices.indexOf(count))
}

const r3l2 = makeLesson(
  'r3l2',
  'أتوضأ وأصلي',
  ['EG-Rl-2F', 'EG-Rl-2R'],
  'knuckles',
  'وضوء وصلاة!',
  'نتوضأ بالترتيب ثم نصلي الصلوات الخمس: الفجر والظهر والعصر والمغرب والعشاء.',
  [r3WuduOrder, r3PrayerMatch, r3PrayerPick],
)

/* ---------- r3l3: في المسجد وصلاة الجماعة ---------- */

const MOSQUE_TF: Array<[string, boolean]> = [
  ['أدخل المسجد بقدمي اليمنى وأقول الدعاء', true],
  ['أصلي الجماعة مع المسلمين في المسجد', true],
  ['ألعب وأصرخ داخل المسجد', false],
  ['أحافظ على نظافة المسجد وسجادته', true],
  ['صلاة الجماعة أفضل من صلاة الفرد', true],
  ['أرمي الأوراق في فناء المسجد', false],
  ['أقول: اللهم افتح لي أبواب رحمتك عند الدخول', true],
  ['أتحدث بصوت عال مع أصدقائي أثناء الصلاة', false],
  ['أخلع حذائي قبل دخول المسجد', true],
  ['أمشي بهدوء وأطأطئ رأسي داخل المسجد', true],
  ['أصلي التحية للمسجد بخشوع', true],
  ['أترك طعامي وأوراقي بعد زيارتي في المسجد', false],
]

function r3MosqueTF(rand: Rand): Question {
  const [statement, answer] = pick(rand, MOSQUE_TF)
  return tfQ('آداب المسجد. هل الجملة صحيحة؟', statement, answer)
}

const MOSQUE_TAPS: { prompt: string; emoji: string; target: number; cells: string[] }[] = [
  { prompt: 'اضغط على كل المساجد التي تراها', emoji: '🕌', target: 3, cells: ['🕌', '🏠', '🕌', '🏫', '🕌', '🌙', '⭐', '🕋'] },
  { prompt: 'اضغط على المساجد في هذا الصف', emoji: '🕌', target: 4, cells: ['🕌', '🕌', '🌳', '🕌', '🌙', '🕌', '🏠', '⭐'] },
  { prompt: 'اضغط على كل المصاحف', emoji: '📗', target: 3, cells: ['📗', '📖', '📗', '✏️', '📗', '🏫', '⭐', '🏠'] },
  { prompt: 'اضغط على كل هلال رمضان', emoji: '🌙', target: 3, cells: ['🌙', '⭐', '🌙', '☀️', '🌙', '🏠', '🕌', '🌳'] },
  { prompt: 'اضغط على كل السجادات', emoji: '🧶', target: 3, cells: ['🧶', '🏠', '🧶', '🏫', '🧶', '🌙', '⭐', '📗'] },
  { prompt: 'اضغط على كل قطرات الماء للوضوء', emoji: '💧', target: 3, cells: ['💧', '🏠', '💧', '⭐', '💧', '🕌', '✏️', '🏫'] },
  { prompt: 'اضغط على كل النجوم', emoji: '⭐', target: 4, cells: ['⭐', '🌙', '⭐', '🏠', '⭐', '🕌', '⭐', '📗'] },
  { prompt: 'اضغط على كل صور الدعاء', emoji: '🤲', target: 3, cells: ['🤲', '🏠', '🤲', '🏫', '🤲', '🌙', '⭐', '🕌'] },
  { prompt: 'اضغط على كل الكتب', emoji: '📖', target: 3, cells: ['📖', '✏️', '📖', '🏫', '📖', '🏠', '🌙', '⭐'] },
  { prompt: 'اضغط على كل المساجد في الحي', emoji: '🕌', target: 3, cells: ['🕌', '🌙', '🕌', '⭐', '🕌', '🏠', '📗', '🌳'] },
]

function r3MosqueTap(rand: Rand): Question {
  const tap = pick(rand, MOSQUE_TAPS)
  return {
    kind: 'tap-count',
    prompt: tap.prompt,
    target: tap.target,
    targetEmoji: tap.emoji,
    cells: [...tap.cells],
    hint: 'اضغط فقط على المطلوب!',
  } as Question
}

const r3l3 = makeLesson(
  'r3l3',
  'في المسجد',
  ['EG-Rl-2F', 'EG-Rl-2E'],
  'amy',
  'بيت الله!',
  'المسجد بيت الله: ندخله بأدب ونصلي الجماعة ونحافظ على نظافته.',
  [r3MosqueTF, r3MosqueTap, r3AdhanHear],
)

/* ---------- r3boss ---------- */

const r3boss = makeLesson(
  'r3boss',
  'بطل العبادة',
  ['EG-Rl-2F', 'EG-Rl-2L', 'EG-Rl-2E'],
  'eggman',
  'تحدي البطل!',
  'الأذان والوضوء والصلوات الخمس وآداب المسجد كلها معا.',
  [r3AdhanMatch, r3WuduOrder, r3PrayerMatch, r3MosqueTF],
  r3PrayerPick,
)

export const UNIT_R3: UnitDef = unitDef(
  'r3',
  3,
  'صلاتي',
  'دين · العبادات · الأذان والوضوء والصلوات الخمس والمسجد',
  '#0d7a5f',
  '🕌',
  [r3l1, r3l2, r3l3, r3boss],
)
