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

/* ---------- a5l1: طعامي الصحي ---------- */

const FOOD_MATCH = [
  { left: 'تفاحة', right: PICTURE_BANK.تفاحة },
  { left: 'موزة', right: PICTURE_BANK.موزة },
  { left: 'لبن', right: PICTURE_BANK.لبن },
  { left: 'خبز', right: PICTURE_BANK.خبز },
  { left: 'جبنة', right: PICTURE_BANK.جبنة },
  { left: 'كرة', right: PICTURE_BANK.كرة },
]

function a5FoodMatch(rand: Rand): Question {
  const pairs = shuffle(rand, FOOD_MATCH).slice(0, 4)
  return matchQ(rand, 'درس القراءة: طعامي الصحي. صل كل طعام بصورته', pairs)
}

const HEALTHY = ['تفاحة', 'موزة', 'لبن', 'خبز']
const JUNK = ['حلويات كثيرة', 'شيبسي', 'مياه غازية']

function a5HealthyPick(rand: Rand): Question {
  const item = pick(rand, HEALTHY)
  const junks = shuffle(rand, JUNK).slice(0, 2)
  const healthyOther = shuffle(rand, HEALTHY.filter((h) => h !== item)).slice(0, 1)
  const choices = shuffle(rand, [item, ...junks, ...healthyOther])
  return mcqFixed('أنا أهتم بغدائي. أي طعام صحي؟', choices, choices.indexOf(item), {
    hint: 'الطعام الصحي يقوي الجسم',
  })
}

function a5HealthySpeak(rand: Rand): Question {
  const line = pick(rand, ['أنا آكل طعامي الصحي كل يوم', 'اللبن يقوي أسناني وعظامي'])
  return speakQ('تحدث عن طعامك الصحي بصوت واضح', line, { hint: 'قل جملة كاملة!' })
}

const a5l1 = makeLesson(
  'a5l1',
  'طعامي الصحي',
  ['EG-Ar-2R', 'EG-Ar-2E'],
  'amy',
  'طعام يقويني!',
  'درس القراءة: طعامي الصحي. اختر الطعام الصحي واهتم بغدائك.',
  [a5FoodMatch, a5HealthyPick, a5HealthySpeak],
)

/* ---------- a5l2: ظرف المكان وظرف الزمان ---------- */

const PLACE_ADV = [
  { word: 'أمام', ex: 'أقف أمام المدرسة' },
  { word: 'خلف', ex: 'القطة خلف الباب' },
  { word: 'فوق', ex: 'الكتاب فوق الكرسي' },
  { word: 'تحت', ex: 'الكرة تحت الطاولة' },
]

const TIME_ADV = [
  { word: 'صباحا', ex: 'أذهب صباحا' },
  { word: 'مساء', ex: 'أنام مساء' },
  { word: 'ليلا', ex: 'القمر يظهر ليلا' },
]

function a5AdverbPick(rand: Rand): Question {
  const all = [...PLACE_ADV.map((a) => ({ ...a, kind: 'مكان' })), ...TIME_ADV.map((a) => ({ ...a, kind: 'زمان' }))]
  const item = pick(rand, all)
  const other = item.kind === 'مكان' ? 'زمان' : 'مكان'
  const choices = shuffle(rand, [item.kind, other])
  return mcqFixed(`كلمة «${item.word}» ظرف مكان أم ظرف زمان؟`, choices, choices.indexOf(item.kind), {
    hint: `مثل: ${item.ex}`,
  })
}

function a5AdverbMatch(rand: Rand): Question {
  const places = shuffle(rand, PLACE_ADV).slice(0, 2).map((a) => ({ left: a.word, right: `مكان: ${a.ex}` }))
  const times = shuffle(rand, TIME_ADV).slice(0, 2).map((a) => ({ left: a.word, right: `زمان: ${a.ex}` }))
  return matchQ(rand, 'صنف الكلمات: ظرف مكان أم ظرف زمان؟', [...places, ...times])
}

const a5l2 = makeLesson(
  'a5l2',
  'ظرف المكان والزمان',
  ['EG-Ar-2G', 'EG-Ar-2R'],
  'knuckles',
  'أين ومتى؟',
  'الأساليب: ظرف المكان مثل أمام وخلف، وظرف الزمان مثل صباحا ومساء.',
  [a5AdverbPick, a5AdverbMatch],
)

/* ---------- a5l3: البطاقة التعريفية + نشيد البطل الصغير ---------- */

const CARD_TILES = ['مريم', 'كريم', 'سلمى', 'أحمد', 'نور', 'عمر']

function a5CardTiles(rand: Rand): Question {
  const w = pick(rand, CARD_TILES)
  return tilesQ('اكتب اسما للبطاقة التعريفية', w, 'البطاقة فيها الاسم والصف')
}

function a5AnthemSpeak(rand: Rand): Question {
  const line = pick(rand, ['أنا بطل صغير أسناني قوية', 'آكل طعامي الصحي كل يوم'])
  return speakQ('غِنِّ نشيد البطل الصغير', line, { hint: 'بطل صغير بصوت كبير!' })
}

const GHAZAL_TF: Array<[string, boolean]> = [
  ['الغزال حيوان سريع يجري في الغابة', true],
  ['الغزال يعيش في البحر مع السمك', false],
  ['ساعد الأصدقاء الغزال في ورطته', true],
  ['ترك الأصدقاء الغزال وحده', false],
]

function a5GhazalTF(rand: Rand): Question {
  const [statement, answer] = pick(rand, GHAZAL_TF)
  return tfQ('قصة: غزال في ورطة. هل الجملة صحيحة؟', statement, answer)
}

const a5l3 = makeLesson(
  'a5l3',
  'البطل الصغير',
  ['EG-Ar-2W', 'EG-Ar-2E'],
  'tails',
  'بطل صغير!',
  'اكتب بطاقتك التعريفية وغن نشيد البطل الصغير. ثم اقرأ قصة غزال في ورطة.',
  [a5CardTiles, a5AnthemSpeak, a5GhazalTF],
)

/* ---------- a5boss ---------- */

function a5BossOrder(rand: Rand): Question {
  const meal = pick(rand, [
    ['أغسل', 'يدي', 'قبل', 'الأكل'],
    ['أتناول', 'فطوري', 'صباحا'],
    ['أنام', 'مبكرا', 'مساء'],
  ])
  return orderQ('رتب كلمات العادة الصحية', meal, say(meal.join(' ')))
}

const a5boss = makeLesson(
  'a5boss',
  'بطل الصحة',
  ['EG-Ar-2R', 'EG-Ar-2G', 'EG-Ar-2W'],
  'eggman',
  'تحدي البطل!',
  'طعامي الصحي وظرف المكان والزمان والبطاقة التعريفية كلها معا.',
  [a5FoodMatch, a5AdverbMatch, a5CardTiles, a5BossOrder],
  a5AdverbPick,
)

export const UNIT_A5: UnitDef = unitDef(
  'a5',
  5,
  'عادات صحية ٢',
  'سلاح التلميذ · طعامي الصحي · ظرف المكان والزمان · نشيد البطل الصغير',
  '#00cd9c',
  '🍎',
  [a5l1, a5l2, a5l3, a5boss],
)
