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

/* ---------- r1l1: الله ربي وخالقي ---------- */

const CREATOR_MATCH = [
  { left: 'الله', right: '☝️ خالقنا' },
  { left: 'الشمس', right: PICTURE_BANK.شمس },
  { left: 'القمر', right: PICTURE_BANK.هلال },
  { left: 'الشجرة', right: PICTURE_BANK.شجرة },
  { left: 'العسل', right: PICTURE_BANK.عسل },
  { left: 'التمر', right: PICTURE_BANK.تمر },
]

function r1CreatorMatch(rand: Rand): Question {
  const pairs = shuffle(rand, CREATOR_MATCH.filter((p) => p.left !== 'الله')).slice(0, 3)
  return matchQ(rand, 'صل كل مخلوق بصورته: كلها من خلق الله', [
    { left: 'الله خالق كل شيء', right: '🌍 العالم' },
    ...pairs,
  ])
}

const CREATOR_TF: Array<[string, boolean]> = [
  ['الله هو خالق السماء والأرض', true],
  ['الشمس والقمر من خلق الله', true],
  ['الإنسان هو الذي خلق الشجرة', false],
  ['نشكر الله على نعمه الكثيرة', true],
  ['الله لا يحتاج إلى أحد ونحن نحتاجه', true],
]

function r1CreatorTF(rand: Rand): Question {
  const [statement, answer] = pick(rand, CREATOR_TF)
  return tfQ('هل الجملة صحيحة؟', statement, answer)
}

const r1l1 = makeLesson(
  'r1l1',
  'الله ربي وخالقي',
  ['EG-Rl-2A', 'EG-Rl-2E'],
  'sonic',
  'الله ربي!',
  'الله هو خالقنا وخالق كل شيء: الشمس والقمر والشجر. نشكره على نعمه.',
  [r1CreatorMatch, r1CreatorTF],
)

/* ---------- r1l2: أسماء الله الحسنى ---------- */

const NAMES_MATCH = [
  { left: 'الرحمن', right: '💝 رحيم بعباده' },
  { left: 'الخالق', right: '🌍 خلق كل شيء' },
  { left: 'الرزاق', right: '🍯 يرزقنا الطعام' },
  { left: 'السميع', right: '👂 يسمع دعاءنا' },
  { left: 'البصير', right: '👁️ يرى أعمالنا' },
  { left: 'الغفور', right: '🤲 يغفر ذنوبنا' },
]

function r1NamesMatch(rand: Rand): Question {
  const pairs = shuffle(rand, NAMES_MATCH).slice(0, 4)
  return matchQ(rand, 'صل كل اسم من أسماء الله بمعناه', pairs)
}

function r1NamesHear(rand: Rand): Question {
  const item = pick(rand, ['الرحمن', 'الخالق', 'الرزاق', 'السميع', 'البصير', 'الغفور'])
  const others = ['الرحمن', 'الخالق', 'الرزاق', 'السميع', 'البصير', 'الغفور'].filter((n) => n !== item)
  return mcqE(rand, 'استمع واضغط على الاسم الذي سمعته', item, others, say(item))
}

const NAME_TILES = ['الرحمن', 'الخالق', 'الرزاق', 'السميع', 'الغفور']

function r1NamesTiles(rand: Rand): Question {
  const w = pick(rand, NAME_TILES)
  return tilesQ('اكتب الاسم بدون الألف واللام', w.replace('ال', ''), 'مثل: رحمن من الرحمن')
}

const r1l2 = makeLesson(
  'r1l2',
  'أسماء الله الحسنى',
  ['EG-Rl-2A', 'EG-Rl-2W'],
  'amy',
  'أسماء جميلة!',
  'لله أسماء حسنى مثل الرحمن والخالق والرزاق. نتعلمها وندعو بها.',
  [r1NamesMatch, r1NamesHear, r1NamesTiles],
)

/* ---------- r1l3: التوكل على الله والشكر ---------- */

function r1DuaSpeak(rand: Rand): Question {
  const line = pick(rand, [
    'الحمد لله رب العالمين',
    'توكلت على الله',
    'سبحان الله وبحمده',
    'اللهم احفظ أبي وأمي',
    'أستغفر الله وأتوب إليه',
    'اللهم اجعلني من الصالحين',
    'لا حول ولا قوة إلا بالله',
    'اللهم ارزقني العلم النافع',
  ])
  return speakQ('قل الدعاء بصوت واضح وجميل', line, { hint: 'قل بخشوع!' })
}

const THANK_TF: Array<[string, boolean]> = [
  ['أقول الحمد لله بعد الأكل', true],
  ['أتوكل على الله وأذاكر دروسي', true],
  ['أنسى شكر الله على نعمه', false],
  ['أدعو الله أن يحفظ أبي وأمي', true],
  ['أغضب عندما لا أحصل على ما أريد فورا', false],
  ['أشكر الله قبل أن أبدأ دروسي', true],
  ['أدعو الله في كل وقت', true],
  ['لا أشكر الله على الماء والطعام', false],
  ['أتكل على عملي وحدي ولا أتوكل على الله', false],
  ['أحمد الله وأشكره على نعمه كلها', true],
]

function r1ThankTF(rand: Rand): Question {
  const [statement, answer] = pick(rand, THANK_TF)
  return tfQ('هل هذا تصرف المسلم الشاكر؟', statement, answer)
}

function r1ThankOrder(rand: Rand): Question {
  const item = pick(rand, [
    ['أقول', 'الحمد', 'لله', 'دائما'],
    ['أتوكل', 'على', 'الله', 'في', 'كل', 'أمري'],
    ['أشكر', 'الله', 'على', 'نعمه'],
    ['اللهم', 'اعفو', 'عنا'],
    ['أستغفر', 'الله', 'وأتوب', 'إليه'],
    ['أدعو', 'لأبي', 'ولأمي', 'خيرا'],
  ])
  return orderQ('رتب كلمات الجملة', item, say(item.join(' ')))
}

const r1l3 = makeLesson(
  'r1l3',
  'التوكل والشكر',
  ['EG-Rl-2A', 'EG-Rl-2E'],
  'tails',
  'متوكل وشاكر!',
  'المسلم يتوكل على الله ويشكر نعمه: يقول الحمد لله ويدعو لوالديه.',
  [r1DuaSpeak, r1ThankTF, r1ThankOrder],
)

/* ---------- r1boss ---------- */

const r1boss = makeLesson(
  'r1boss',
  'بطل العقيدة',
  ['EG-Rl-2A', 'EG-Rl-2E', 'EG-Rl-2W'],
  'eggman',
  'تحدي البطل!',
  'الله خالقنا وأسماؤه الحسنى والتوكل والشكر كلها معا.',
  [r1CreatorMatch, r1NamesMatch, r1ThankTF, r1DuaSpeak],
  r1NamesMatch,
)

export const UNIT_R1: UnitDef = unitDef(
  'r1',
  1,
  'الله ربي',
  'دين · عقيدتي · الخالق وأسماؤه الحسنى والتوكل',
  '#0d7a5f',
  '☝️',
  [r1l1, r1l2, r1l3, r1boss],
)
