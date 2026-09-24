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

/* ---------- a2l1: يوم جميل (استماع) ---------- */

const DEED_MATCH = [
  { left: 'أساعد أمي', right: '🤲 تنظيف' },
  { left: 'أرتب سريري', right: PICTURE_BANK.بيت },
  { left: 'أذاكر دروسي', right: PICTURE_BANK.كتاب },
  { left: 'ألعب بالكرة', right: PICTURE_BANK.كرة },
  { left: 'أسقي الزهرة', right: PICTURE_BANK.زهرة },
  { left: 'أطعم القطة', right: PICTURE_BANK.قطة },
]

function a2DeedMatch(rand: Rand): Question {
  const pairs = shuffle(rand, DEED_MATCH).slice(0, 4)
  return matchQ(rand, 'صل كل عمل جميل بالصورة المناسبة له', pairs)
}

const DEED_HEAR = [
  { w: 'يوم جميل', pic: '🌞' },
  { w: 'أساعد أمي', pic: '🤲' },
  { w: 'أرتب سريري', pic: PICTURE_BANK.بيت },
  { w: 'أذاكر دروسي', pic: PICTURE_BANK.كتاب },
  { w: 'ألعب بالكرة', pic: PICTURE_BANK.كرة },
]

function a2HearDeed(rand: Rand): Question {
  const item = pick(rand, DEED_HEAR)
  const others = DEED_HEAR.filter((d) => d.w !== item.w).map((d) => d.w)
  return mcqE(rand, 'استمع واضغط على العمل الذي سمعته', item.w, others, say(item.w))
}

const a2l1 = makeLesson(
  'a2l1',
  'يوم جميل',
  ['EG-Ar-2L', 'EG-Ar-2E'],
  'sonic',
  'يوم جميل!',
  'قصة استماع: يومي جميل عندما أساعد وأرتب وأذاكر. استمع جيدا وصل كل عمل بصورته.',
  [a2DeedMatch, a2HearDeed],
)

/* ---------- a2l2: كلماتي الجميلة (المفرد والمثنى + تحليل مقاطع) ---------- */

const SINGULAR_DUAL = [
  { one: 'قلم', two: 'قلمان' },
  { one: 'كتاب', two: 'كتابان' },
  { one: 'وردة', two: 'وردتان' },
  { one: 'قطة', two: 'قطتان' },
  { one: 'نجمة', two: 'نجمتان' },
  { one: 'كرسي', two: 'كرسيان' },
]

function a2DualMatch(rand: Rand): Question {
  const pairs = shuffle(rand, SINGULAR_DUAL.map((p) => ({ left: p.one, right: p.two }))).slice(0, 4)
  return matchQ(rand, 'صل كل مفرد بالمثنى المناسب له', pairs, {
    hint: 'المثنى يعني اثنين: قلم becomes قلمان',
  })
}

function a2PickDual(rand: Rand): Question {
  const item = pick(rand, SINGULAR_DUAL)
  const others = SINGULAR_DUAL.filter((p) => p.one !== item.one).map((p) => p.two)
  return mcqE(rand, `ما مثنى كلمة «${item.one}»؟`, item.two, others, say(item.two))
}

const SYLLABLE_TILES = ['قلم', 'كتاب', 'مدرسة', 'وردة', 'قطة', 'كرسي']

function a2SyllableTiles(rand: Rand): Question {
  const w = pick(rand, SYLLABLE_TILES)
  return tilesQ('حلل الكلمة إلى حروف ورتبها', w, 'انطق كل مقطع بصوت واضح')
}

const a2l2 = makeLesson(
  'a2l2',
  'كلماتي الجميلة',
  ['EG-Ar-2R', 'EG-Ar-2W'],
  'amy',
  'كلماتي الجميلة!',
  'المفرد يعني واحدا والمثنى يعني اثنين. وحلل الكلمات إلى مقاطع صوتية مثل سلاح التلميذ.',
  [a2DualMatch, a2PickDual, a2SyllableTiles],
)

/* ---------- a2l3: كلمات تسعد الآخرين + وصف صورة ---------- */

const KIND_WORDS = [
  { w: 'شكرا', pic: '🙏' },
  { w: 'من فضلك', pic: '🤲' },
  { w: 'صباح الخير', pic: '🌞' },
  { w: 'أحبك', pic: '❤️' },
  { w: 'أحسنت', pic: '👏' },
]

function a2KindHear(rand: Rand): Question {
  const item = pick(rand, KIND_WORDS)
  const others = KIND_WORDS.filter((k) => k.w !== item.w).map((k) => k.w)
  return mcqE(rand, 'استمع واضغط على الكلمة الطيبة التي سمعتها', item.w, others, say(item.w))
}

const KIND_TF: Array<[string, boolean]> = [
  ['أقول شكرا لمن يساعدني', true],
  ['أصرخ في وجه صديقي', false],
  ['أقول صباح الخير لمعلمي', true],
  ['آخذ لعبة أخي بالقوة', false],
  ['أساعد زميلي في الدرس', true],
  ['أضحك على من يخطئ', false],
]

function a2KindTF(rand: Rand): Question {
  const [statement, answer] = pick(rand, KIND_TF)
  return tfQ('هل هذا تصرف مهذب؟', statement, answer)
}

function a2DescribeSpeak(rand: Rand): Question {
  const item = pick(rand, [
    'صديقي يلعب بالكرة في الحديقة',
    'البنت تساعد أمها في البيت',
    'التلميذ يقرأ الكتاب في المدرسة',
  ])
  return speakQ('صف الصورة بصوت واضح', item, { hint: 'انظر وقل جملة كاملة' })
}

const a2l3 = makeLesson(
  'a2l3',
  'كلمات تسعد الآخرين',
  ['EG-Ar-2E', 'EG-Ar-2L'],
  'tails',
  'كلمات سحرية!',
  'شكرا ومن فضلك وصباح الخير كلمات تسعد من حولنا. ثم صف الصورة بجملة جميلة.',
  [a2KindHear, a2KindTF, a2DescribeSpeak],
)

/* ---------- a2boss ---------- */

const a2boss = makeLesson(
  'a2boss',
  'بطل المعاملة الطيبة',
  ['EG-Ar-2L', 'EG-Ar-2R', 'EG-Ar-2E'],
  'eggman',
  'تحدي البطل!',
  'يوم جميل وكلماتي الجميلة والكلمات الطيبة كلها معا. قيم نفسك يا بطل.',
  [a2DeedMatch, a2DualMatch, a2KindTF, a2DescribeSpeak],
  a2DualMatch,
)

export const UNIT_A2: UnitDef = unitDef(
  'a2',
  2,
  'المعاملة الطيبة ١',
  'سلاح التلميذ · يوم جميل · كلماتي الجميلة · المفرد والمثنى',
  '#ff9600',
  '💛',
  [a2l1, a2l2, a2l3, a2boss],
)
