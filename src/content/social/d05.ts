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

/* ---------- d5l1: أهرامات الجيزة ---------- */

const PYRAMID_MATCH = [
  { left: 'الهرم الأكبر', right: '🔺 خوفو' },
  { left: 'أبو الهول', right: PICTURE_BANK.أبوالهول },
  { left: 'الجيزة', right: '🏜️ مكان الأهرامات' },
  { left: 'الحجر', right: '🧱 بنيت منه الأهرامات' },
  { left: 'الفراعنة', right: '👑 بناة الأهرامات' },
]

function d5PyramidMatch(rand: Rand): Question {
  const pairs = shuffle(rand, PYRAMID_MATCH).slice(0, 4)
  return matchQ(rand, 'صل كل كلمة بما يناسبها عن الأهرامات', pairs)
}

const PYRAMID_TF: Array<[string, boolean]> = [
  ['الأهرامات في الجيزة من عجائب الدنيا', true],
  ['بنى المصريون القدماء الأهرامات بالحجارة', true],
  ['أبو الهول تمثال بجسم أسد ورأس إنسان', true],
  ['الأهرامات بنيت من الخشب', false],
]

function d5PyramidTF(rand: Rand): Question {
  const [statement, answer] = pick(rand, PYRAMID_TF)
  return tfQ('أهرامات الجيزة. هل الجملة صحيحة؟', statement, answer)
}

const d5l1 = makeLesson(
  'd5l1',
  'أهرامات الجيزة',
  ['EG-So-2H', 'EG-So-2R'],
  'sonic',
  'عجائب الدنيا!',
  'أهرامات الجيزة وأبو الهول: حضارة أجدادنا الفراعنة منذ آلاف السنين.',
  [d5PyramidMatch, d5PyramidTF],
)

/* ---------- d5l2: الأقصر وأسوان والمتحف ---------- */

const SITES_MATCH = [
  { left: 'الأقصر', right: '🏯 معابد كثيرة' },
  { left: 'أسوان', right: '🌊 النيل والسد' },
  { left: 'المتحف', right: PICTURE_BANK.متحف },
  { left: 'المسلة', right: PICTURE_BANK.مسلة },
  { left: 'توت عنخ آمون', right: '👑 قناعه الذهبي' },
]

function d5SitesMatch(rand: Rand): Question {
  const pairs = shuffle(rand, SITES_MATCH).slice(0, 4)
  return matchQ(rand, 'صل كل مكان أثري بما يميزه', pairs)
}

function d5SitesPick(rand: Rand): Question {
  const item = pick(rand, [
    { q: 'أين توجد معابد كثيرة من الحضارة الفرعونية؟', a: 'الأقصر', others: ['الجيزة', 'القاهرة', 'أسوان'] },
    { q: 'أين يوجد السد العالي؟', a: 'أسوان', others: ['الأقصر', 'الجيزة', 'القاهرة'] },
  ])
  return mcqE(rand, item.q, item.a, item.others, say(item.a))
}

const d5l2 = makeLesson(
  'd5l2',
  'الأقصر وأسوان',
  ['EG-So-2H', 'EG-So-2L'],
  'tails',
  'رحلة عبر الزمن!',
  'الأقصر مدينة المعابد وأسوان مدينة النيل والسد. والمتحف يحفظ كنوزنا.',
  [d5SitesMatch, d5SitesPick],
)

/* ---------- d5l3: أحافظ على آثار بلدي ---------- */

function d5PrideSpeak(rand: Rand): Question {
  const line = pick(rand, ['آثار مصر عظيمة أحافظ عليها', 'أنا فخور بحضارة بلدي'])
  return speakQ('تحدث عن فخرك بحضارة مصر', line, { hint: 'قل بفخر!' })
}

const RUIN_TILES = ['هرم', 'متحف', 'نيل', 'أقصر', 'أسوان']

function d5RuinTiles(rand: Rand): Question {
  const w = pick(rand, RUIN_TILES)
  return tilesQ('اكتب كلمة عن آثار مصر', w, 'حضارة سبعة آلاف سنة')
}

const RUIN_TF: Array<[string, boolean]> = [
  ['أحافظ على الآثار ولا أكتب عليها', true],
  ['أرمي القمامة عند زيارة المتحف', false],
  ['أخبر أصدقائي عن عظمة حضارتنا', true],
]

function d5RuinTF(rand: Rand): Question {
  const [statement, answer] = pick(rand, RUIN_TF)
  return tfQ('حماية الآثار. هل الجملة صحيحة؟', statement, answer)
}

const d5l3 = makeLesson(
  'd5l3',
  'أحافظ على آثار بلدي',
  ['EG-So-2H', 'EG-So-2W'],
  'amy',
  'حارس الحضارة!',
  'آثارنا كنز: نحافظ عليها ونفخر بها أمام العالم.',
  [d5PrideSpeak, d5RuinTiles, d5RuinTF],
)

/* ---------- d5boss ---------- */

const d5boss = makeLesson(
  'd5boss',
  'بطل الحضارة',
  ['EG-So-2H', 'EG-So-2R', 'EG-So-2W'],
  'eggman',
  'تحدي البطل!',
  'الأهرامات والأقصر وحماية الآثار كلها معا.',
  [d5PyramidMatch, d5SitesMatch, d5RuinTiles, d5PrideSpeak],
  d5PyramidTF,
)

export const UNIT_D5: UnitDef = unitDef(
  'd5',
  5,
  'آثار مصر',
  'دراسات · تاريخ · الأهرامات والأقصر وحماية الآثار',
  '#eab308',
  '🔺',
  [d5l1, d5l2, d5l3, d5boss],
)
