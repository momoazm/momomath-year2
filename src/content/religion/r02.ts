import type { Question, UnitDef } from '../types'
import {
  makeLesson,
  matchQ,
  mcqE,
  mcqFixed,
  pick,
  say,
  shuffle,
  speakQ,
  tilesQ,
  tfQ,
  unitDef,
  type Rand,
} from './helpers'

/* ---------- r2l1: سور أحفظها ---------- */

const SURAHS = [
  { name: 'الإخلاص', verse: 'قل هو الله أحد', pic: '☝️' },
  { name: 'الكوثر', verse: 'إنا أعطيناك الكوثر', pic: '🌊' },
  { name: 'العصر', verse: 'والعصر إن الإنسان لفي خسر', pic: '⏰' },
  { name: 'الفيل', verse: 'ألم تر كيف فعل ربك بأصحاب الفيل', pic: '🐘' },
  { name: 'قريش', verse: 'لإيلاف قريش', pic: '🐪' },
  { name: 'الناس', verse: 'قل أعوذ برب الناس', pic: '🤲' },
]

function r2SurahMatch(rand: Rand): Question {
  const pairs = shuffle(rand, SURAHS).slice(0, 4).map((s) => ({ left: `سورة ${s.name}`, right: `${s.pic} ${s.verse}` }))
  return matchQ(rand, 'صل كل سورة بأول آية فيها', pairs)
}

function r2SurahHear(rand: Rand): Question {
  const item = pick(rand, SURAHS)
  const others = SURAHS.filter((s) => s.name !== item.name).map((s) => `سورة ${s.name}`)
  return mcqE(rand, 'استمع واضغط على السورة التي سمعتها', `سورة ${item.name}`, others, say(item.verse))
}

const r2l1 = makeLesson(
  'r2l1',
  'سور أحفظها',
  ['EG-Rl-2Q', 'EG-Rl-2L'],
  'sonic',
  'أحفظ كتاب الله!',
  'سور قصيرة نحفظها: الإخلاص والكوثر والعصر والفيل وقريش والناس. استمع وصل.',
  [r2SurahHear, r2SurahMatch],
)

/* ---------- r2l2: أرتل وأتعلم ---------- */

const T1_SURAHS = [
  { name: 'القدر', verse: 'إنا أنزلناه في ليلة القدر', pic: '🌙' },
  { name: 'التين', verse: 'والتين والزيتون', pic: '🫒' },
  { name: 'العلق', verse: 'اقرأ باسم ربك الذي خلق', pic: '📖' },
  { name: 'الشرح', verse: 'ألم نشرح لك صدرك', pic: '💚' },
  { name: 'الضحى', verse: 'والضحى والليل إذا سجى', pic: '🌞' },
  { name: 'الليل', verse: 'والليل إذا يغشى', pic: '🌑' },
  { name: 'الفجر', verse: 'وبالفجر إذا تنفس', pic: '🌅' },
  { name: 'البلد', verse: 'لا أقسم بهذه البلد', pic: '🏞️' },
  { name: 'الفلق', verse: 'قل أعوذ برب الفلق', pic: '🛡️' },
  { name: 'المسد', verse: 'تبت يدا أبي لهب وتب', pic: '🔥' },
  { name: 'النصر', verse: 'إذا جاء نصر الله والفتح', pic: '🎉' },
  { name: 'الكافرون', verse: 'قل يا أيها الكافرون', pic: '🚩' },
]

function r2T1Match(rand: Rand): Question {
  const pairs = shuffle(rand, T1_SURAHS).slice(0, 4).map((s) => ({ left: `سورة ${s.name}`, right: `${s.pic} ${s.verse}` }))
  return matchQ(rand, 'سور الترم الأول: صل كل سورة بآيتها', pairs)
}

const RECITE_LINES = [
  'قل هو الله أحد',
  'إنا أعطيناك الكوثر',
  'والعصر إن الإنسان لفي خسر',
  'اقرأ باسم ربك الذي خلق',
  'إنا أنزلناه في ليلة القدر',
  'والتين والزيتون',
  'ألم نشرح لك صدرك',
  'والضحى والليل إذا سجى',
  'والليل إذا يغشى',
  'وبالفجر إذا تنفس',
  'قل أعوذ برب الفلق',
  'إذا جاء نصر الله والفتح',
]

function r2Recite(rand: Rand): Question {
  const line = pick(rand, RECITE_LINES)
  return speakQ('رتل الآية بصوت جميل ومرتل', line, { hint: 'رتل بتأن!' })
}

const r2l2 = makeLesson(
  'r2l2',
  'أرتل وأتعلم',
  ['EG-Rl-2Q', 'EG-Rl-2E'],
  'tails',
  'مرتل صغير!',
  'سور مقررة: القدر والتين والعلق والشرح. ثم رتل آية بصوتك الجميل.',
  [r2T1Match, r2Recite],
)

/* ---------- r2l3: أفهم معاني كلماتي ---------- */

const MEANINGS = [
  { word: 'الصمد', meaning: 'الذي يحتاجه كل أحد', others: ['القمر المنير', 'الجبل العالي', 'البحر الواسع'] },
  { word: 'الكوثر', meaning: 'نهر في الجنة', others: ['جبل في مكة', 'نوع من التمر', 'اسم صحابي'] },
  { word: 'العصر', meaning: 'الدهر والزمن', others: ['العصير الطازج', 'العصفور الصغير', 'القصر الكبير'] },
  { word: 'القدر', meaning: 'ليلة عظيمة في رمضان', others: ['يوم العيد', 'شهر الحج', 'ليلة الجمعة'] },
  { word: 'الأبتر', meaning: 'المنقطع عن الخير', others: ['القوي الشجاع', 'الكريم السخي', 'الصادق الأمين'] },
]

function r2MeaningPick(rand: Rand): Question {
  const item = pick(rand, MEANINGS)
  return mcqE(rand, `ما معنى كلمة «${item.word}»؟`, item.meaning, item.others, say(item.meaning))
}

const QURAN_TILES = ['قرآن', 'سورة', 'آية', 'نور', 'هدى']

function r2QuranTiles(rand: Rand): Question {
  const w = pick(rand, QURAN_TILES)
  return tilesQ('اكتب كلمة من عالم القرآن', w, 'كتاب الله نور وهدى')
}

const QURAN_TF: Array<[string, boolean]> = [
  ['القرآن كلام الله أنزله على نبينا محمد', true],
  ['أحفظ السور القصيرة وأرتلها', true],
  ['أقرأ القرآن وأنا ألعب وألهو', false],
  ['أتوضأ قبل أن أمسك المصحف', true],
]

function r2QuranTF(rand: Rand): Question {
  const [statement, answer] = pick(rand, QURAN_TF)
  return tfQ('آداب القرآن. هل الجملة صحيحة؟', statement, answer)
}

const r2l3 = makeLesson(
  'r2l3',
  'أفهم كلماتي',
  ['EG-Rl-2Q', 'EG-Rl-2W'],
  'amy',
  'أفهم ما أقرأ!',
  'نتعلم معاني الكلمات: الصمد والكوثر والعصر. ونحترم المصحف.',
  [r2MeaningPick, r2QuranTiles, r2QuranTF],
)

/* ---------- r2boss ---------- */

const r2boss = makeLesson(
  'r2boss',
  'بطل القرآن',
  ['EG-Rl-2Q', 'EG-Rl-2L', 'EG-Rl-2E'],
  'eggman',
  'تحدي البطل!',
  'السور التي أحفظها والترتيل والمعاني كلها معا.',
  [r2SurahMatch, r2T1Match, r2MeaningPick, r2Recite],
  r2SurahMatch,
)

export const UNIT_R2: UnitDef = unitDef(
  'r2',
  2,
  'كتاب الله',
  'دين · القرآن الكريم · سور أحفظها وأرتلها وأفهمها',
  '#0d7a5f',
  '📖',
  [r2l1, r2l2, r2l3, r2boss],
)
