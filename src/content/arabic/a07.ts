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

/* ---------- a7l1: في النادي ---------- */

const CLUB_MATCH = [
  { left: 'النادي', right: '🏟️ ملعب' },
  { left: 'المدرب', right: '🧑‍🏫 تدريب' },
  { left: 'الفريق', right: '👥 لاعبون' },
  { left: 'الكأس', right: '🏆 فوز' },
  { left: 'السباق', right: '🏃 سرعة' },
  { left: 'الجمهور', right: '👏 تشجيع' },
]

function a7ClubMatch(rand: Rand): Question {
  const pairs = shuffle(rand, CLUB_MATCH).slice(0, 4)
  return matchQ(rand, 'درس القراءة: في النادي. صل كل كلمة بما يناسبها', pairs)
}

const CLUB_TF: Array<[string, boolean]> = [
  ['أذهب إلى النادي مع أصدقائي', true],
  ['المدرب يعلمنا اللعب النظيف', true],
  ['أغضب عندما يفوز الفريق الآخر', false],
  ['أحيي زملائي قبل المباراة وبعدها', true],
  ['أرمي الزجاجات في أرض الملعب', false],
]

function a7ClubTF(rand: Rand): Question {
  const [statement, answer] = pick(rand, CLUB_TF)
  return tfQ('درس في النادي. هل الجملة صحيحة؟', statement, answer)
}

const a7l1 = makeLesson(
  'a7l1',
  'في النادي',
  ['EG-Ar-2R', 'EG-Ar-2L'],
  'amy',
  'يوم في النادي!',
  'درس القراءة: في النادي. أنشطتي المميزة مع فريقي ومدربي.',
  [a7ClubMatch, a7ClubTF],
)

/* ---------- a7l2: الأسماء الموصولة الذي والتي ---------- */

const RELATIVE = [
  { s: 'الولد .... يلعب ماهر', ans: 'الذي' },
  { s: 'الكتاب .... أقرؤه ممتع', ans: 'الذي' },
  { s: 'البنت .... تساعد أمها مهذبة', ans: 'التي' },
  { s: 'المدرسة .... أتعلم فيها جميلة', ans: 'التي' },
  { s: 'الطائر .... يغني صوته جميل', ans: 'الذي' },
  { s: 'الزهرة .... أسقيها حمراء', ans: 'التي' },
]

function a7RelativePick(rand: Rand): Question {
  const item = pick(rand, RELATIVE)
  const other = item.ans === 'الذي' ? 'التي' : 'الذي'
  const choices = shuffle(rand, [item.ans, other])
  return mcqFixed(`«${item.s}» — نضع الذي أم التي؟`, choices, choices.indexOf(item.ans), {
    hint: 'الذي للمذكر والتي للمؤنث',
  })
}

const a7l2 = makeLesson(
  'a7l2',
  'الذي والتي',
  ['EG-Ar-2G', 'EG-Ar-2R'],
  'shadow',
  'كلمتا الوصل!',
  'الأسماء الموصولة: الذي للمذكر مثل الولد الذي يلعب، والتي للمؤنث مثل البنت التي تساعد.',
  [a7RelativePick, a7ClubMatch],
)

/* ---------- a7l3: نشيد رياضتي + أنشطتي المميزة ---------- */

const ANTHEM_LINES = [
  'رياضتي تقويني',
  'أجري وألعب كل صباح',
  'الفوز حلو باللعب النظيف',
  'أحب رياضتي وأتمرن كل يوم',
  'ألعب مع أصدقائي في النادي',
  'أجري بسرعة مثل العاصفة',
  'اللعب النظيف أجمل فوز',
]

function a7AnthemHear(rand: Rand): Question {
  const line = pick(rand, ANTHEM_LINES)
  const others = ANTHEM_LINES.filter((l) => l !== line)
  return mcqE(rand, 'استمع واضغط على سطر النشيد الذي سمعته', line, others, say(line))
}

function a7AnthemSpeak(rand: Rand): Question {
  const line = pick(rand, [
    'رياضتي تقويني وأجري كل صباح',
    'ألعب مع أصدقائي باللعب النظيف',
    'أنا أحب رياضتي وأتمرن كل صباح',
    'ألعب مع فريقي وأحترم الخصم',
    'الفوز باللعب النظيف فوز حقيقي',
  ])
  return speakQ('غِنِّ نشيد رياضتي', line, { hint: 'رياضي بصوت قوي!' })
}

const SPORT_TILES = ['كرة', 'نديم', 'فوز', 'ملعب', 'سباق', 'تمرين', 'خصم', 'تدريب']

function a7SportTiles(rand: Rand): Question {
  const w = pick(rand, SPORT_TILES)
  return tilesQ('اكتب كلمة من عالم الرياضة', w, 'تذكر حروف الكلمة جيدا')
}

const ACTIVITY_EMOJIS = [
  { emoji: '⚽', target: 3, word: 'الكرات' },
  { emoji: '🏀', target: 2, word: 'كرات السلة' },
  { emoji: '🐟', target: 4, word: 'السمكات' },
  { emoji: '⭐', target: 5, word: 'النجوم' },
  { emoji: '🎈', target: 3, word: 'البالونات' },
  { emoji: '🌸', target: 2, word: 'الزهور' },
]

function a7MyActivity(rand: Rand): Question {
  const item = pick(rand, ACTIVITY_EMOJIS)
  const fillers = shuffle(rand, ACTIVITY_EMOJIS.filter((e) => e.emoji !== item.emoji))
    .slice(0, 3)
    .map((e) => e.emoji)
  const cells = shuffle(rand, [...Array.from({ length: item.target }, () => item.emoji), ...fillers])
  return {
    kind: 'tap-count',
    prompt: `اضغط على كل ${item.word} التي تراها`,
    target: item.target,
    targetEmoji: item.emoji,
    cells,
    hint: 'الهدف فقط!',
  } as Question
}

const a7l3 = makeLesson(
  'a7l3',
  'نشيد رياضتي',
  ['EG-Ar-2E', 'EG-Ar-2W'],
  'tails',
  'رياضتي!',
  'نشيد: رياضتي. ثم اكتب عن أنشطتك المميزة واجمع الكرات.',
  [a7AnthemHear, a7AnthemSpeak, a7SportTiles, a7MyActivity, a7ClubTF, a7RelativePick],
)

/* ---------- a7boss ---------- */

const a7boss = makeLesson(
  'a7boss',
  'بطل النادي',
  ['EG-Ar-2R', 'EG-Ar-2G', 'EG-Ar-2E'],
  'eggman',
  'تحدي البطل!',
  'في النادي والذي والتي ونشيد رياضتي كلها معا. هيا نلعب يا بطل!',
  [a7ClubMatch, a7RelativePick, a7AnthemHear, a7SportTiles],
  a7RelativePick,
)

export const UNIT_A7: UnitDef = unitDef(
  'a7',
  7,
  'الرياضة والتكنولوجيا ٢',
  'سلاح التلميذ · في النادي · الذي والتي · نشيد رياضتي',
  '#0ea5e9',
  '🏟️',
  [a7l1, a7l2, a7l3, a7boss],
)
