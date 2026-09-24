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
  unitDef,
  type Rand,
} from './helpers'

/* ---------- a4l1: أرتب حياتي (استماع) ---------- */

const ROUTINE = ['أستيقظ صباحا', 'أغسل وجهي', 'أتناول فطوري', 'أذهب إلى المدرسة', 'أذاكر دروسي', 'أنام مبكرا']

function a4RoutineOrder(rand: Rand): Question {
  const items = shuffle(rand, ROUTINE).slice(0, 4)
  const correct = [...items].sort((a, b) => ROUTINE.indexOf(a) - ROUTINE.indexOf(b))
  return orderQ('رتب أحداث اليوم من الصباح إلى المساء', correct, say(correct.join(' ثم ')))
}

const ROUTINE_MATCH = [
  { left: 'أستيقظ', right: '🌞 صباحا' },
  { left: 'أغسل أسناني', right: '🪥 فرشاة' },
  { left: 'أتناول فطوري', right: '🍞 فطور' },
  { left: 'أنام', right: '🌙 مساء' },
  { left: 'ألعب', right: PICTURE_BANK.كرة },
  { left: 'أقرأ', right: PICTURE_BANK.كتاب },
]

function a4RoutineMatch(rand: Rand): Question {
  const pairs = shuffle(rand, ROUTINE_MATCH).slice(0, 4)
  return matchQ(rand, 'قصة استماع: أرتب حياتي. صل كل عمل بوقته', pairs)
}

function a4BrushTap(rand: Rand): Question {
  void rand
  return {
    kind: 'tap-count',
    prompt: 'اضغط على كل فرشاة أسنان تراها',
    target: 2,
    targetEmoji: '🪥',
    cells: ['🪥', '🍎', '📖', '🪥', '⚽', '🌙', '🧀', '🚗'],
    hint: 'فرشاة الأسنان فقط!',
  } as Question
}

const a4l1 = makeLesson(
  'a4l1',
  'أرتب حياتي',
  ['EG-Ar-2L', 'EG-Ar-2R'],
  'sonic',
  'يومي مرتب!',
  'قصة استماع: أرتب حياتي. رتب أحداث اليوم وصل كل عمل بوقته المناسب.',
  [a4RoutineOrder, a4RoutineMatch, a4BrushTap],
)

/* ---------- a4l2: أسناني قوية + ذلك وتلك ---------- */

const TEETH_MATCH = [
  { left: 'فرشاة', right: '🪥 أسنان' },
  { left: 'معجون', right: '🦷 نظافة' },
  { left: 'طبيب الأسنان', right: '👨‍⚕️ علاج' },
  { left: 'تفاحة', right: PICTURE_BANK.تفاحة },
  { left: 'لبن', right: PICTURE_BANK.لبن },
  { left: 'حلويات كثيرة', right: '🍬 تسوس' },
]

function a4TeethMatch(rand: Rand): Question {
  const pairs = shuffle(rand, TEETH_MATCH).slice(0, 4)
  return matchQ(rand, 'درس القراءة: أسناني قوية. صل كل كلمة بما يناسبها', pairs)
}

const FAR_DEMON = [
  { word: 'قمر بعيد', ans: 'ذلك' },
  { word: 'كتاب بعيد', ans: 'ذلك' },
  { word: 'نجم بعيد', ans: 'ذلك' },
  { word: 'شمس بعيدة', ans: 'تلك' },
  { word: 'مدرسة بعيدة', ans: 'تلك' },
  { word: 'وردة بعيدة', ans: 'تلك' },
]

function a4FarDemon(rand: Rand): Question {
  const item = pick(rand, FAR_DEMON)
  const other = item.ans === 'ذلك' ? 'تلك' : 'ذلك'
  const choices = shuffle(rand, [item.ans, other])
  return mcqFixed(`«.... ${item.word}» — نضع ذلك أم تلك؟`, choices, choices.indexOf(item.ans), {
    hint: 'ذلك للمذكر البعيد وتلك للمؤنث البعيد',
  })
}

const a4l2 = makeLesson(
  'a4l2',
  'أسناني قوية',
  ['EG-Ar-2R', 'EG-Ar-2G'],
  'tails',
  'أسنان قوية!',
  'درس القراءة: أسناني قوية وصديقتي الفرشاة. ثم تعلم ذلك وتلك للبعيد.',
  [a4TeethMatch, a4FarDemon],
)

/* ---------- a4l3: اللام الشمسية والقمرية ---------- */

const SUN_WORDS: Array<[string, string]> = [['الشمس', '☀️'], ['النيل', '🌊'], ['السماء', '☁️'], ['النجم', '⭐'], ['التفاح', '🍎'], ['الطائرة', '✈️']]
const MOON_WORDS: Array<[string, string]> = [['القمر', '🌙'], ['الكتاب', '📖'], ['المدرسة', '🏫'], ['الباب', '🚪'], ['الوردة', '🌸'], ['القطة', '🐱']]

function a4LamClassify(rand: Rand): Question {
  const sun = pick(rand, SUN_WORDS)[0]
  const moons = shuffle(rand, MOON_WORDS).slice(0, 3).map(([w]) => w)
  const choices = shuffle(rand, [sun, ...moons])
  return mcqFixed('أي كلمة فيها لام شمسية؟', choices, choices.indexOf(sun), say(sun))
}

function a4LamMatch(rand: Rand): Question {
  const suns = shuffle(rand, SUN_WORDS).slice(0, 2).map(([w, pic]) => ({ left: w, right: `شمسية ${pic}` }))
  const moons = shuffle(rand, MOON_WORDS).slice(0, 2).map(([w, pic]) => ({ left: w, right: `قمرية ${pic}` }))
  return matchQ(rand, 'صنف الكلمات: شمسية أم قمرية؟', [...suns, ...moons], {
    hint: 'اللام الشمسية لا تنطق، والقمرية تنطق',
  })
}

function a4IdCard(rand: Rand): Question {
  const name = pick(rand, ['أحمد', 'مريم', 'كريم', 'سلمى'])
  const item = pick(rand, ['تلميذ في الصف الثاني', 'يحب القراءة', 'أسنانه قوية'])
  return orderQ('رتب كلمات البطاقة التعريفية', [name, item], say(`${name} ${item}`))
}

const a4l3 = makeLesson(
  'a4l3',
  'اللام الشمسية والقمرية',
  ['EG-Ar-2G', 'EG-Ar-2W'],
  'amy',
  'شمس وقمر!',
  'القواعد الإملائية: اللام الشمسية والقمرية. ثم اكتب بطاقتك التعريفية.',
  [a4LamClassify, a4LamMatch, a4IdCard],
)

/* ---------- a4boss ---------- */

const a4boss = makeLesson(
  'a4boss',
  'بطل العادات الصحية',
  ['EG-Ar-2L', 'EG-Ar-2G', 'EG-Ar-2W'],
  'eggman',
  'تحدي البطل!',
  'أرتب حياتي وأسناني قوية واللام الشمسية والقمرية كلها معا.',
  [a4RoutineOrder, a4TeethMatch, a4LamMatch, a4IdCard],
  a4LamClassify,
)

export const UNIT_A4: UnitDef = unitDef(
  'a4',
  4,
  'عادات صحية ١',
  'سلاح التلميذ · أرتب حياتي · أسناني قوية · اللام الشمسية والقمرية',
  '#00cd9c',
  '🪥',
  [a4l1, a4l2, a4l3, a4boss],
)
