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
  { left: 'الهرم الأشهر في الجيزة', right: '🔺 الهرم الأكبر' },
  { left: 'تمثال برأس إنسان وجسم أسد', right: '🗿 أبو الهول' },
  { left: 'بنوها قبل آلاف السنين', right: '⏳ من زمن الفراعنة' },
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
  ['أهرامات الجيزة في مصر', true],
  ['السياح من كل العالم يزورون الأهرامات', true],
  ['نكتب على جدران الآثار ونترك توقيعنا', false],
  ['العلماء ما زالوا يكتشفون أسرار الأهرامات', true],
  ['بنى المصريون القدماء الأهرامات بدون آلات حديثة', true],
  ['الهرم الأكبر شيده الملك خوفو', true],
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
  { left: 'معبد أبو سمبل', right: '🗿 قرب أسوان' },
  { left: 'كنوز توت عنخ آمون', right: '💎 في المتحف' },
  { left: 'وادي الملوك', right: '⛰️ مقابر ملوك الأقصر' },
]

function d5SitesMatch(rand: Rand): Question {
  const pairs = shuffle(rand, SITES_MATCH).slice(0, 4)
  return matchQ(rand, 'صل كل مكان أثري بما يميزه', pairs)
}

const SITES_MCQ: { q: string; a: string; others: string[] }[] = [
  { q: 'أين توجد معابد كثيرة من الحضارة الفرعونية؟', a: 'الأقصر', others: ['الجيزة', 'القاهرة', 'أسوان'] },
  { q: 'أين يوجد السد العالي؟', a: 'أسوان', others: ['الأقصر', 'الجيزة', 'القاهرة'] },
  { q: 'أين نشاهد قناع توت عنخ آمون الذهبي؟', a: 'المتحف', others: ['الأقصر', 'الجيزة', 'أسوان'] },
  { q: 'أين يقع معبد أبو سمبل؟', a: 'أسوان', others: ['الأقصر', 'الجيزة', 'القاهرة'] },
  { q: 'ما المسلة؟', a: 'عمود حجري منقوش من العصر الفرعوني', others: ['تمثال أبو الهول', 'نهر طويل', 'سوق قديم'] },
  { q: 'أين تقع أهرامات الجيزة؟', a: 'الجيزة', others: ['الأقصر', 'أسوان', 'القاهرة'] },
  { q: 'أين ينام ملوك مصر القدماء في مقابر منحوتة في الصخر؟', a: 'وادي الملوك بالأقصر', others: ['الجيزة', 'أسوان', 'القاهرة'] },
  { q: 'ما الذي يحفظه المتحف؟', a: 'آثار وكنوز مصر القديمة', others: ['الخضار والفواكه', 'الكتب الحديثة فقط', 'الحيوانات فقط'] },
  { q: 'أين نشاهد آثار ومقتنيات الفراعنة القديمة؟', a: 'في المتحف', others: ['في السوق', 'في المدرسة', 'في الميناء'] },
  { q: 'أي مدينة تشتهر بمعابدها وبالسد العالي؟', a: 'أسوان', others: ['الأقصر', 'الجيزة', 'القاهرة'] },
]

function d5SitesPick(rand: Rand): Question {
  const item = pick(rand, SITES_MCQ)
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

const PRIDE_LINES = [
  'آثار مصر عظيمة أحافظ عليها',
  'أنا فخور بحضارة بلدي',
  'زرت المتحف ورأيت كنوز الفراعنة',
  'أحكي لصديقي عن أهرامات الجيزة',
  'إن حضارتنا قديمة وعظيمة',
  'لا أكتب على الآثار وأحترمها',
  'أحب أن أزور المعابد والأهرامات',
]

function d5PrideSpeak(rand: Rand): Question {
  const line = pick(rand, PRIDE_LINES)
  return speakQ('تحدث عن فخرك بحضارة مصر', line, { hint: 'قل بفخر!' })
}

const RUIN_TILES = ['هرم', 'متحف', 'نيل', 'أقصر', 'أسوان', 'معبد', 'فرعون', 'مسلة']

function d5RuinTiles(rand: Rand): Question {
  const w = pick(rand, RUIN_TILES)
  return tilesQ('اكتب كلمة عن آثار مصر', w, 'حضارة سبعة آلاف سنة')
}

const RUIN_TF: Array<[string, boolean]> = [
  ['أحافظ على الآثار ولا أكتب عليها', true],
  ['أرمي القمامة عند زيارة المتحف', false],
  ['أخبر أصدقائي عن عظمة حضارتنا', true],
  ['الآثار كنز لنا وللأجيال القادمة', true],
  ['أعبث بجدران المعبد وأرسم عليها', false],
  ['أزور المتاحف لأتعلم عن تاريخ بلدي', true],
  ['أشتري تذكارًا أصيلًا من متجر المتحف', true],
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
