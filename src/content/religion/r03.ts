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
]

function r3AdhanMatch(rand: Rand): Question {
  const pairs = shuffle(rand, ADHAN_MATCH).slice(0, 4)
  return matchQ(rand, 'صل كل جملة من الأذان بمعناها', pairs)
}

function r3AdhanHear(rand: Rand): Question {
  const item = pick(rand, ['الله أكبر', 'حي على الصلاة', 'حي على الفلاح'])
  const others = ['الله أكبر', 'حي على الصلاة', 'حي على الفلاح'].filter((a) => a !== item)
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

const WUDU_STEPS = ['أنوي الوضوء', 'أغسل وجهي', 'أغسل يدي إلى المرفقين', 'أمسح رأسي', 'أغسل رجلي']

function r3WuduOrder(rand: Rand): Question {
  void rand
  return orderQ('رتب خطوات الوضوء بالترتيب', WUDU_STEPS, say(WUDU_STEPS.join(' ثم ')))
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
]

function r3MosqueTF(rand: Rand): Question {
  const [statement, answer] = pick(rand, MOSQUE_TF)
  return tfQ('آداب المسجد. هل الجملة صحيحة؟', statement, answer)
}

function r3MosqueTap(rand: Rand): Question {
  void rand
  return {
    kind: 'tap-count',
    prompt: 'اضغط على كل المساجد التي تراها',
    target: 3,
    targetEmoji: '🕌',
    cells: ['🕌', '🏠', '🕌', '🏫', '🕌', '🌙', '⭐', '🕋'],
    hint: 'المسجد فقط!',
  } as Question
}

const r3l3 = makeLesson(
  'r3l3',
  'في المسجد',
  ['EG-Rl-2F', 'EG-Rl-2E'],
  'amy',
  'بيت الله!',
  'المسجد بيت الله: ندخله بأدب ونصلي الجماعة ونحافظ على نظافته.',
  [r3MosqueTF, r3MosqueTap],
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
