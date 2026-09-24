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

/* ---------- a1l1: الحركات القصيرة ---------- */

const VOWEL_SLICES = [
  'بَ', 'بُ', 'بِ',
  'تَ', 'تُ', 'تِ',
  'مَ', 'مُ', 'مِ',
  'نَ', 'نُ', 'نِ',
  'كَ', 'كُ', 'كِ',
]

function a1HearVowel(rand: Rand): Question {
  const item = pick(rand, VOWEL_SLICES)
  const others = shuffle(rand, VOWEL_SLICES.filter((w) => w !== item)).slice(0, 3)
  return mcqE(rand, 'استمع جيدا واضغط على المقطع الذي سمعته', item, others, say(item))
}

const VOWEL_MATCH = [
  { left: 'بَ', right: 'بَاب 🚪' },
  { left: 'تُ', right: 'تُفَّاح 🍎' },
  { left: 'مُ', right: 'مُوز 🍌' },
  { left: 'نِ', right: 'نِيل 🌊' },
  { left: 'كِ', right: 'كِتَاب 📖' },
  { left: 'بِ', right: 'بِنْت 👧' },
]

function a1VowelMatch(rand: Rand): Question {
  const pairs = shuffle(rand, VOWEL_MATCH).slice(0, 4)
  return matchQ(rand, 'صل كل مقطع بالكلمة التي تبدأ به', pairs, {
    hint: 'انظر إلى أول حرف في الكلمة',
  })
}

function a1NameVowel(rand: Rand): Question {
  const item = pick(rand, VOWEL_SLICES)
  const mark = item.slice(-1)
  const answer = mark === 'َ' ? 'فتحة' : mark === 'ُ' ? 'ضمة' : 'كسرة'
  const choices = shuffle(rand, ['فتحة', 'ضمة', 'كسرة', 'سكون'])
  return mcqFixed(`المقطع «${item}» فيه فتحة أم ضمة أم كسرة؟`, choices, choices.indexOf(answer), say(item))
}

const a1l1 = makeLesson(
  'a1l1',
  'الحركات القصيرة',
  ['EG-Ar-2L', 'EG-Ar-2R'],
  'sonic',
  'هيا نغني مع الحركات!',
  'الفتحة والضمة والكسرة تغير صوت الحرف. استمع جيدا واضغط على ما سمعته.',
  [a1HearVowel, a1VowelMatch, a1NameVowel],
)

/* ---------- a1l2: المدود ---------- */

const LONG_MATCH = [
  { left: 'باب', right: PICTURE_BANK.باب },
  { left: 'فيل', right: PICTURE_BANK.فيل },
  { left: 'حصان', right: PICTURE_BANK.حصان },
  { left: 'كتاب', right: PICTURE_BANK.كتاب },
  { left: 'قطار', right: PICTURE_BANK.قطار },
  { left: 'عصفور', right: PICTURE_BANK.عصفور },
]

function a1LongMatch(rand: Rand): Question {
  const pairs = shuffle(rand, LONG_MATCH).slice(0, 4)
  return matchQ(rand, 'صل كل كلمة مد بالصورة المناسبة لها', pairs)
}

const LONG_SPELL = ['باب', 'نور', 'قيل', 'فيل', 'حصان', 'كتاب']

function a1LongTiles(rand: Rand): Question {
  const w = pick(rand, LONG_SPELL)
  return tilesQ('رتب الحروف لتكتب كلمة المد', w, 'مد الصوت طويلا مثل بَاب')
}

const LONG_WORDS = ['باب', 'نور', 'فيل', 'حصان', 'كتاب', 'قطار']
const SHORT_WORDS = ['قمر', 'شمس', 'كرة', 'قلم', 'بيت', 'نيل']

function a1LongVsShort(rand: Rand): Question {
  const item = pick(rand, LONG_WORDS)
  const others = shuffle(rand, SHORT_WORDS).slice(0, 3)
  return mcqE(rand, 'أي كلمة فيها حرف مد؟ استمع جيدا', item, others, say(item))
}

const a1l2 = makeLesson(
  'a1l2',
  'المدود',
  ['EG-Ar-2R', 'EG-Ar-2W'],
  'tails',
  'هيا نمد الصوت!',
  'المد بالألف والواو والياء يجعل الصوت طويلا. مثل بَاب ونُور وقِيل.',
  [a1LongMatch, a1LongTiles, a1LongVsShort],
)

/* ---------- a1l3: الشدة ---------- */

const SHADDA_WORDS = ['قطّة', 'سيّارة', 'معلّم', 'تفّاح', 'نظّارة', 'سبّورة']
const PLAIN_WORDS = ['قمر', 'كتاب', 'باب', 'قلم', 'مدرسة', 'نيل']

function a1FindShadda(rand: Rand): Question {
  const item = pick(rand, SHADDA_WORDS)
  const others = shuffle(rand, PLAIN_WORDS).slice(0, 3)
  return mcqE(rand, 'أي كلمة فيها شدّة؟', item, others, say(item))
}

const LETTER_WORDS = ['قمر', 'نور', 'شمس', 'نيل', 'كتاب', 'مدرسة']

function a1OrderLetters(rand: Rand): Question {
  const w = pick(rand, LETTER_WORDS)
  return orderQ('رتب الحروف لتكون كلمة صحيحة', [...w], say(w))
}

const SHADDA_TF: Array<[string, boolean]> = [
  ['كلمة قطّة فيها شدّة', true],
  ['كلمة قمر فيها شدّة', false],
  ['الشدة تعني حرفا قويا ننطقه بقوة', true],
  ['كلمة كتاب فيها شدّة', false],
  ['كلمة سيّارة فيها شدّة', true],
  ['كلمة نيل فيها شدّة', false],
]

function a1ShaddaTF(rand: Rand): Question {
  const [statement, answer] = pick(rand, SHADDA_TF)
  return tfQ('اقرأ الجملة وقل: هل هي صحيحة أم لا؟', statement, answer)
}

const a1l3 = makeLesson(
  'a1l3',
  'الشدة',
  ['EG-Ar-2R', 'EG-Ar-2G'],
  'amy',
  'الحرف القوي!',
  'الشدة تعني أن الحرف مكتوب مرتين لكننا ننطقه مرة واحدة قوية. مثل قِطَّة وسَيَّارَة.',
  [a1FindShadda, a1OrderLetters, a1ShaddaTF],
)

/* ---------- a1boss ---------- */

const a1boss = makeLesson(
  'a1boss',
  'بطل الحروف',
  ['EG-Ar-2R', 'EG-Ar-2L', 'EG-Ar-2W'],
  'eggman',
  'تحدي البطل!',
  'الحركات والمدود والشدة كلها معا. أثبت أنك بطل الحروف.',
  [a1VowelMatch, a1HearVowel, a1LongMatch, a1LongTiles, a1FindShadda, a1OrderLetters],
  a1HearVowel,
)

export const UNIT_A1: UnitDef = unitDef(
  'a1',
  1,
  'مراجعة تأسيسية',
  'سلاح التلميذ · تمهيد تانية ابتدائي · الحركات والمدود والشدة',
  '#58cc02',
  '🧰',
  [a1l1, a1l2, a1l3, a1boss],
)
