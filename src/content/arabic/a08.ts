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
  tilesQ,
  tfQ,
  unitDef,
  type Rand,
} from './helpers'

/* ---------- a8l1: ضمائر الغائب ---------- */

const ABSENT_PRONOUN = [
  { s: '.... يلعب بالكرة', ans: 'هو' },
  { s: '.... تقرأ القصة', ans: 'هي' },
  { s: '.... يرسمون اللوحة', ans: 'هم' },
  { s: '.... يكتب الدرس', ans: 'هو' },
  { s: '.... تساعد أمها', ans: 'هي' },
  { s: '.... يغنون النشيد', ans: 'هم' },
  { s: '.... يشرب الحليب', ans: 'هو' },
  { s: '.... تلعب بالدمية', ans: 'هي' },
  { s: '.... يلعبون في الحديقة', ans: 'هم' },
  { s: '.... يأكل التفاحة', ans: 'هو' },
  { s: '.... تغني النشيد', ans: 'هي' },
]

function a8PronounPick(rand: Rand): Question {
  const item = pick(rand, ABSENT_PRONOUN)
  const others = shuffle(rand, ['هو', 'هي', 'هم'].filter((p) => p !== item.ans))
  const choices = shuffle(rand, [item.ans, ...others.slice(0, 2)])
  return mcqFixed(`«${item.s}» — نضع هو أم هي أم هم؟`, choices, choices.indexOf(item.ans), {
    hint: 'هو للمذكر وهي للمؤنث وهم للجمع',
  })
}

function a8PronounMatch(rand: Rand): Question {
  const pairs = shuffle(rand, [
    { left: 'هو', right: '👦 ولد' },
    { left: 'هي', right: '👧 بنت' },
    { left: 'هم', right: '👥 أولاد' },
    { left: 'أنا', right: '🙋 نفسي' },
    { left: 'أنت', right: '☝️ نفسك' },
    { left: 'نحن', right: '👪 نحن جميعا' },
  ]).slice(0, 4)
  return matchQ(rand, 'صل كل ضمير بما يناسبه', pairs)
}

const a8l1 = makeLesson(
  'a8l1',
  'ضمائر الغائب',
  ['EG-Ar-2G', 'EG-Ar-2R'],
  'sonic',
  'هو وهي وهم!',
  'الترم الثاني مع سلاح التلميذ: ضمائر الغائب. هو للمذكر وهي للمؤنث وهم للجمع.',
  [a8PronounPick, a8PronounMatch],
)

/* ---------- a8l2: أسلوب النداء ---------- */

const CALL_STYLE = [
  { s: 'يا أحمد، تعال هنا', is: true },
  { s: 'يا مريم، اقرئي الدرس', is: true },
  { s: 'يا أصدقائي، هيا نلعب', is: true },
  { s: 'أحمد يلعب بالكرة', is: false },
  { s: 'مريم تقرأ القصة', is: false },
  { s: 'نلعب مع أصدقائنا', is: false },
  { s: 'يا أختي، تعالي إلينا', is: true },
  { s: 'أختي تلعب في الحديقة', is: false },
  { s: 'يا أخي، هيا إلى المدرسة', is: true },
  { s: 'أخي يقرأ القصة', is: false },
  { s: 'يا زميلي، أين قلمك', is: true },
  { s: 'نحب معلمنا في الفصل', is: false },
  { s: 'يا أمي، أنت حبيبتي', is: true },
  { s: 'تساعد أمي في أعمال البيت', is: false },
]

function a8CallTF(rand: Rand): Question {
  const item = pick(rand, CALL_STYLE)
  return tfQ('هل هذه الجملة أسلوب نداء؟', `«${item.s}»`, item.is)
}

function a8CallOrder(rand: Rand): Question {
  const item = pick(rand, [
    ['يا', 'صديقي', 'هيا', 'نلعب'],
    ['يا', 'معلمي', 'شكرا', 'لك'],
    ['يا', 'أمي', 'أحبك', 'كثيرا'],
    ['يا', 'أختي', 'تعالي', 'هنا'],
    ['يا', 'أبي', 'نحبك', 'كثيرا'],
    ['يا', 'طلاب', 'هيا', 'نتعلم'],
    ['يا', 'صديقي', 'كيف', 'حالك'],
    ['يا', 'زميلي', 'أين', 'كتابك'],
    ['يا', 'أمي', 'أنت', 'حبيبتي'],
    ['يا', 'عمي', 'أهلا', 'وسهلا'],
    ['يا', 'معلمتي', 'نحبك', 'كثيرا'],
    ['يا', 'بنات', 'تعالوا', 'هنا'],
  ])
  return orderQ('رتب كلمات جملة النداء', item, say(item.join(' ')))
}

const a8l2 = makeLesson(
  'a8l2',
  'أسلوب النداء',
  ['EG-Ar-2G', 'EG-Ar-2W'],
  'amy',
  'يا أصدقائي!',
  'أسلوب النداء يبدأ بـ يا: يا أحمد ويا مريم. رتب وتعرف عليه.',
  [a8CallTF, a8CallOrder],
)

/* ---------- a8l3: التاء المربوطة والمفتوحة ---------- */

const TAA_MARBUTA = ['مدرسة', 'وردة', 'قطة', 'شجرة', 'زهرة', 'كرة']
const TAA_MAFTOUHA = ['بيت', 'نبات', 'صوت', 'بنت', 'زيت', 'حوت']

function a8TaaClassify(rand: Rand): Question {
  const marbuta = pick(rand, TAA_MARBUTA)
  const others = shuffle(rand, TAA_MAFTOUHA).slice(0, 3)
  const choices = shuffle(rand, [marbuta, ...others])
  return mcqFixed('أي كلمة فيها تاء مربوطة (ة)؟', choices, choices.indexOf(marbuta), {
    hint: 'التاء المربوطة مثل ة في مدرسة',
  })
}

function a8TaaMatch(rand: Rand): Question {
  const tied = shuffle(rand, TAA_MARBUTA).slice(0, 2).map((w) => ({ left: w, right: `${w} فيها ة مربوطة` }))
  const open = shuffle(rand, TAA_MAFTOUHA).slice(0, 2).map((w) => ({ left: w, right: `${w} فيها ت مفتوحة` }))
  return matchQ(rand, 'صنف الكلمات: تاء مربوطة أم مفتوحة؟', [...tied, ...open])
}

const TAA_TILES = ['مدرسة', 'وردة', 'بيت', 'بنت', 'قطة', 'صوت']

function a8TaaTiles(rand: Rand): Question {
  const w = pick(rand, TAA_TILES)
  return tilesQ('اكتب الكلمة بحروف صحيحة', w, 'انتبه للتاء في آخر الكلمة')
}

function a8LoveHear(rand: Rand): Question {
  const item = pick(rand, ['أحب من حولي', 'أحب أبي وأمي', 'أحب معلمي وأصدقائي'])
  const others = ['أحب من حولي', 'أحب أبي وأمي', 'أحب معلمي وأصدقائي'].filter((l) => l !== item)
  return mcqE(rand, 'استمع واضغط على الجملة التي سمعتها', item, others, say(item))
}

const a8l3 = makeLesson(
  'a8l3',
  'التاء المربوطة والمفتوحة',
  ['EG-Ar-2G', 'EG-Ar-2L'],
  'tails',
  'تاء وتاء!',
  'القواعد الإملائية: التاء المربوطة (ة) مثل مدرسة، والمفتوحة (ت) مثل بيت.',
  [a8TaaClassify, a8TaaMatch, a8TaaTiles, a8LoveHear],
)

/* ---------- a8boss ---------- */

const a8boss = makeLesson(
  'a8boss',
  'بطل من حولي',
  ['EG-Ar-2G', 'EG-Ar-2W', 'EG-Ar-2L'],
  'eggman',
  'تحدي البطل!',
  'ضمائر الغائب وأسلوب النداء والتاء المربوطة والمفتوحة كلها معا.',
  [a8PronounPick, a8CallOrder, a8TaaMatch, a8LoveHear],
  a8PronounPick,
)

export const UNIT_A8: UnitDef = unitDef(
  'a8',
  8,
  'أحب من حولي',
  'سلاح التلميذ · ترم ثان · ضمائر الغائب · النداء · التاء المربوطة والمفتوحة',
  '#fb7185',
  '❤️',
  [a8l1, a8l2, a8l3, a8boss],
)
