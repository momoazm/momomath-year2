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
  speakQ,
  tilesQ,
  tfQ,
  unitDef,
  type Rand,
} from './helpers'

/* ---------- a10l1: أسلوب التعجب ---------- */

const EXCLAIM = ['ما أجمل نهر النيل!', 'ما أحلى الوردة!', 'ما أكبر الفيل!', 'ما أسرع الغزال!']
const PLAIN_S = ['نهر النيل جميل', 'الوردة حمراء', 'الفيل كبير', 'الغزال سريع']

function a10ExclaimPick(rand: Rand): Question {
  const i = Math.floor(rand() * EXCLAIM.length)
  const choices = shuffle(rand, [EXCLAIM[i], PLAIN_S[i]])
  return mcqFixed('أي جملة أسلوب تعجب؟', choices, choices.indexOf(EXCLAIM[i]), {
    hint: 'التعجب يبدأ بـ ما أفعل وينتهي بعلامة !',
  })
}

const STYLE_SORT = [
  { s: 'ما أجمل السماء!', ans: 'تعجب' },
  { s: 'لا تقطف الأزهار', ans: 'نهي' },
  { s: 'اكتب درسك', ans: 'أمر' },
  { s: 'يا صديقي، هيا نلعب', ans: 'نداء' },
]

function a10StyleSort(rand: Rand): Question {
  const item = pick(rand, STYLE_SORT)
  const others = shuffle(rand, ['تعجب', 'نهي', 'أمر', 'نداء'].filter((s) => s !== item.ans)).slice(0, 2)
  const choices = shuffle(rand, [item.ans, ...others])
  return mcqFixed(`«${item.s}» — ما نوع الأسلوب؟`, choices, choices.indexOf(item.ans))
}

function a10ExclaimSpeak(rand: Rand): Question {
  const line = pick(rand, EXCLAIM)
  return speakQ('اقرأ جملة التعجب بدهشة وفرح', line, { hint: 'تعجب بصوت عال!' })
}

const a10l1 = makeLesson(
  'a10l1',
  'أسلوب التعجب',
  ['EG-Ar-2G', 'EG-Ar-2E'],
  'sonic',
  'ما أجمل!',
  'أسلوب التعجب مثل ما أجمل نهر النيل! صنف الأساليب واقرأ بدهشة.',
  [a10ExclaimPick, a10StyleSort, a10ExclaimSpeak],
)

/* ---------- a10l2: أماكن جميلة ---------- */

const PLACES_MATCH = [
  { left: 'نهر النيل', right: '🌊 ماء عذب' },
  { left: 'الحديقة', right: '🌸 أزهار' },
  { left: 'البحر', right: '🏖️ رمال' },
  { left: 'المزرعة', right: '🌾 قمح' },
  { left: 'المتحف', right: '🏛️ آثار' },
  { left: 'المكتبة', right: '📚 قصص' },
]

function a10PlacesMatch(rand: Rand): Question {
  const pairs = shuffle(rand, PLACES_MATCH).slice(0, 4)
  return matchQ(rand, 'درس القراءة: أماكن جميلة. صل كل مكان بما فيه', pairs)
}

const PLACES_TF: Array<[string, boolean]> = [
  ['عاش المصريون القدماء على ضفاف نهر النيل', true],
  ['نشرب من مياه النيل العذبة ونسقي الزرع', true],
  ['نلوث مياه النيل بإلقاء القمامة فيه', false],
  ['الحديقة مكان جميل فيه أزهار ملونة', true],
  ['المتحف فيه آثار من حضارتنا العظيمة', true],
]

function a10PlacesTF(rand: Rand): Question {
  const [statement, answer] = pick(rand, PLACES_TF)
  return tfQ('أماكن جميلة. هل الجملة صحيحة؟', statement, answer)
}

function a10DescribeSpeak(rand: Rand): Question {
  const line = pick(rand, [
    'نهر النيل جميل وماؤه عذب',
    'الحديقة فيها أزهار ملونة',
    'مصر بلد جميل وحضارته عظيمة',
  ])
  return speakQ('صف مكانا جميلا في مصر', line, { hint: 'صف بجملة كاملة' })
}

const a10l2 = makeLesson(
  'a10l2',
  'أماكن جميلة',
  ['EG-Ar-2R', 'EG-Ar-2E'],
  'tails',
  'بلادي جميلة!',
  'درس القراءة: أماكن جميلة. من النيل إلى المتحف، صف بلدك بجمل جميلة.',
  [a10PlacesMatch, a10PlacesTF, a10DescribeSpeak],
)

/* ---------- a10l3: الكاتب الصغير (مراجعة شاملة) ---------- */

const REVIEW_TILES = ['مدرسة', 'صديق', 'نيل', 'كتاب', 'قمر', 'وردة', 'قلم', 'حديقة', 'سيارة']

function a10ReviewTiles(rand: Rand): Question {
  const w = pick(rand, REVIEW_TILES)
  return tilesQ('اكتب كلمة من كلمات السنة', w, 'كاتب صغير بخط جميل')
}

const FINAL_GRAMMAR = [
  { q: '«هذان هما المعلمان» — الكلمة مثنى أم مفرد؟', a: 'مثنى', others: ['مفرد', 'جمع'] },
  { q: '«هؤلاء أطباء» — هؤلاء للجمع أم للمفرد؟', a: 'للجمع', others: ['للمفرد', 'للمثنى'] },
  { q: '«الشمس» — اللام شمسية أم قمرية؟', a: 'شمسية', others: ['قمرية'] },
  { q: '«يجري» — اسم أم فعل؟', a: 'فعل', others: ['اسم', 'حرف'] },
  { q: '«الأطفال» — مفرد أم جمع؟', a: 'جمع', others: ['مفرد', 'مثنى'] },
  { q: '«يكتب الطفل» — جملة أم كلمة؟', a: 'جملة', others: ['كلمة', 'حرف'] },
  { q: '«قطة» — التاء مربوطة أم مفتوحة؟', a: 'مربوطة', others: ['مفتوحة'] },
  { q: '«متى» — أداة استفهام أم حرف جر؟', a: 'أداة استفهام', others: ['حرف جر', 'أداة نداء'] },
]

function a10FinalGrammar(rand: Rand): Question {
  const item = pick(rand, FINAL_GRAMMAR)
  const choices = shuffle(rand, [item.a, ...item.others])
  return mcqE(rand, item.q, item.a, item.others, undefined)
}

/** Review sequencing drills. First entry is the original story-parts drill. */
const STORY_TASKS: Array<{ prompt: string; items: string[]; audio?: string }> = [
  {
    prompt: 'رتب أجزاء القصة القصيرة',
    items: ['البداية', 'الأحداث', 'النهاية'],
    audio: 'البداية ثم الأحداث ثم النهاية',
  },
  { prompt: 'رتب كلمات جملة عن مدرستي', items: ['أحب', 'مدرستي', 'وأزور', 'مكتبتها'] },
  { prompt: 'رتب كلمات قصة زيارة المتحف', items: ['زرت', 'المتحف', 'وقرأت', 'عن', 'آثارنا'] },
]

function a10StoryOrder(rand: Rand): Question {
  const task = pick(rand, STORY_TASKS)
  return orderQ(task.prompt, task.items, say(task.audio ?? task.items.join(' ')))
}

const a10l3 = makeLesson(
  'a10l3',
  'الكاتب الصغير',
  ['EG-Ar-2W', 'EG-Ar-2G'],
  'knuckles',
  'كاتب صغير!',
  'مراجعة السنة كلها: اكتب قصة قصيرة لها بداية وأحداث ونهاية. أنت كاتب صغير.',
  [a10ReviewTiles, a10FinalGrammar, a10StoryOrder],
)

/* ---------- a10boss: بطل السنة ---------- */

const a10boss = makeLesson(
  'a10boss',
  'بطل السنة',
  ['EG-Ar-2R', 'EG-Ar-2G', 'EG-Ar-2W', 'EG-Ar-2E'],
  'eggman',
  'التحدي الأخير!',
  'كل سلاح التلميذ تانية ابتدائي في تحد واحد: الأساليب والأماكن الجميلة والكتابة. أثبت أنك بطل السنة.',
  [a10StyleSort, a10PlacesMatch, a10ReviewTiles, a10StoryOrder, a10ExclaimSpeak],
  a10PlacesTF,
)

export const UNIT_A10: UnitDef = unitDef(
  'a10',
  10,
  'أماكن جميلة',
  'سلاح التلميذ · ترم ثان · التعجب · أماكن جميلة · الكاتب الصغير',
  '#f97316',
  '🏛️',
  [a10l1, a10l2, a10l3, a10boss],
)
