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

/* ---------- d1l1: مصر بلدي ---------- */

const EGYPT_MATCH = [
  { left: 'علم مصر', right: '🔴⚪⚫ أحمر وأبيض وأسود' },
  { left: 'النسر', right: '🦅 في وسط العلم' },
  { left: 'القاهرة', right: '🏙️ عاصمة مصر' },
  { left: 'النيل', right: PICTURE_BANK.نيل },
  { left: 'الجنيه', right: '💰 عملة مصر' },
]

function d1EgyptMatch(rand: Rand): Question {
  const pairs = shuffle(rand, EGYPT_MATCH).slice(0, 4)
  return matchQ(rand, 'صل كل رمز من رموز مصر بما يعرفه', pairs)
}

const EGYPT_TF: Array<[string, boolean]> = [
  ['مصر بلدي وأنا أحبها', true],
  ['عاصمة مصر هي القاهرة', true],
  ['علم مصر فيه نسر', true],
  ['عملة مصر هي الجنيه', true],
  ['عاصمة مصر هي باريس', false],
]

function d1EgyptTF(rand: Rand): Question {
  const [statement, answer] = pick(rand, EGYPT_TF)
  return tfQ('مصر بلدي. هل الجملة صحيحة؟', statement, answer)
}

const d1l1 = makeLesson(
  'd1l1',
  'مصر بلدي',
  ['EG-So-2C', 'EG-So-2G'],
  'sonic',
  'تحيا مصر!',
  'مصر بلدنا الجميل: عاصمتها القاهرة وعلمنا فيه النسر وعملتنا الجنيه.',
  [d1EgyptMatch, d1EgyptTF],
)

/* ---------- d1l2: محافظتي ومدينتي ---------- */

const GOV_MATCH = [
  { left: 'المحافظة', right: '🗺️ جزء كبير من مصر' },
  { left: 'المدينة', right: '🏙️ بيوت وشوارع كثيرة' },
  { left: 'القرية', right: '🌾 حقول وهدوء' },
  { left: 'الحي', right: '🏠 بيوت جيراننا' },
  { left: 'المدرسة', right: PICTURE_BANK.مدرسة },
]

function d1GovMatch(rand: Rand): Question {
  const pairs = shuffle(rand, GOV_MATCH).slice(0, 4)
  return matchQ(rand, 'صل كل مكان بوصفه', pairs)
}

function d1GovPick(rand: Rand): Question {
  const choices = shuffle(rand, ['مدينة', 'قرية'])
  return mcqFixed('أعيش في مكان فيه بيوت وشوارع كثيرة. هل هو مدينة أم قرية؟', choices, choices.indexOf('مدينة'), {
    hint: 'المدينة كبيرة والقرية فيها حقول',
  })
}

const d1l2 = makeLesson(
  'd1l2',
  'محافظتي ومدينتي',
  ['EG-So-2G', 'EG-So-2C'],
  'tails',
  'أين أعيش؟',
  'مصر فيها محافظات، والمحافظة فيها مدن وقرى. أين تعيش أنت؟',
  [d1GovMatch, d1GovPick],
)

/* ---------- d1l3: أحب بلدي ---------- */

function d1LoveSpeak(rand: Rand): Question {
  const line = pick(rand, ['مصر بلدي الجميلة أحبها', 'أحافظ على نظافة بلدي'])
  return speakQ('تحدث عن حبك لمصر', line, { hint: 'قل بفخر!' })
}

const PLACE_TILES = ['مصر', 'قاهرة', 'نيل', 'علم', 'جنيه']

function d1PlaceTiles(rand: Rand): Question {
  const w = pick(rand, PLACE_TILES)
  return tilesQ('اكتب كلمة عن بلدك', w, 'بلادي مصر جميلة')
}

const d1l3 = makeLesson(
  'd1l3',
  'أحب بلدي',
  ['EG-So-2C', 'EG-So-2W'],
  'amy',
  'بلادي في قلبي!',
  'نحب مصر ونحافظ عليها نظيفة جميلة. تحدث واكتب عن بلدك.',
  [d1LoveSpeak, d1PlaceTiles],
)

/* ---------- d1boss ---------- */

const d1boss = makeLesson(
  'd1boss',
  'بطل بلدي',
  ['EG-So-2C', 'EG-So-2G', 'EG-So-2W'],
  'eggman',
  'تحدي البطل!',
  'مصر بلدي ومحافظتي وحب بلدي كلها معا.',
  [d1EgyptMatch, d1GovMatch, d1LoveSpeak, d1PlaceTiles],
  d1EgyptTF,
)

export const UNIT_D1: UnitDef = unitDef(
  'd1',
  1,
  'مصر بلدي',
  'دراسات · انتماء · العلم والعاصمة ومحافظتي',
  '#b3541e',
  '🇪🇬',
  [d1l1, d1l2, d1l3, d1boss],
)
