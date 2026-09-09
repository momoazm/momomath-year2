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
  tfQ,
  unitDef,
  type Rand,
} from './helpers'

/* ---------- a3l1: أحب أصدقائي (قراءة) ---------- */

const FRIEND_MATCH = [
  { left: 'صديق', right: '🧑‍🤝‍🧑 أصدقاء' },
  { left: 'يلعب', right: PICTURE_BANK.كرة },
  { left: 'يقرأ', right: PICTURE_BANK.كتاب },
  { left: 'يرسم', right: '🎨 ألوان' },
  { left: 'يغني', right: '🎵 أغنية' },
  { left: 'يساعد', right: '🤲 مساعدة' },
]

function a3FriendMatch(rand: Rand): Question {
  const pairs = shuffle(rand, FRIEND_MATCH).slice(0, 4)
  return matchQ(rand, 'صل كل كلمة من درس أحب أصدقائي بمعناها', pairs)
}

const FRIEND_TF: Array<[string, boolean]> = [
  ['أحب أصدقائي وألعب معهم', true],
  ['ألعب وحدي دائما ولا أشارك أحدا', false],
  ['أساعد صديقي عندما يحتاجني', true],
  ['آخذ ألوان صديقي دون أن أستأذن', false],
  ['أفرح عندما ينجح صديقي', true],
  ['أغضب عندما يفوز صديقي باللعبة', false],
]

function a3FriendTF(rand: Rand): Question {
  const [statement, answer] = pick(rand, FRIEND_TF)
  return tfQ('اقرأ وقل: هل هذا تصرف صديق جيد؟', statement, answer)
}

const a3l1 = makeLesson(
  'a3l1',
  'أحب أصدقائي',
  ['EG-Ar-2R', 'EG-Ar-2L'],
  'knuckles',
  'أصدقائي أحبابي!',
  'درس القراءة: أحب أصدقائي. اقرأ وافهم ثم أجب عن الأسئلة.',
  [a3FriendMatch, a3FriendTF],
)

/* ---------- a3l2: أسماء الإشارة ---------- */

const DEMON_PAIRS = [
  { word: 'قمر', ans: 'هذا', pic: PICTURE_BANK.قمر },
  { word: 'كتاب', ans: 'هذا', pic: PICTURE_BANK.كتاب },
  { word: 'قلم', ans: 'هذا', pic: PICTURE_BANK.قلم },
  { word: 'شمس', ans: 'هذه', pic: PICTURE_BANK.شمس },
  { word: 'مدرسة', ans: 'هذه', pic: PICTURE_BANK.بيت },
  { word: 'وردة', ans: 'هذه', pic: PICTURE_BANK.وردة },
  { word: 'قطة', ans: 'هذه', pic: PICTURE_BANK.قطة },
  { word: 'كرسي', ans: 'هذا', pic: PICTURE_BANK.كرسي },
]

function a3DemonPick(rand: Rand): Question {
  const item = pick(rand, DEMON_PAIRS)
  const other = item.ans === 'هذا' ? 'هذه' : 'هذا'
  const choices = shuffle(rand, [item.ans, other])
  return mcqFixed(`«.... ${item.word}» — نضع هذا أم هذه؟`, choices, choices.indexOf(item.ans), {
    visual: { type: 'emoji-group', emojis: [item.pic] },
  })
}

function a3DemonMatch(rand: Rand): Question {
  const masc = shuffle(rand, DEMON_PAIRS.filter((d) => d.ans === 'هذا')).slice(0, 2)
  const fem = shuffle(rand, DEMON_PAIRS.filter((d) => d.ans === 'هذه')).slice(0, 2)
  return matchQ(
    rand,
    'صل كل كلمة باسم الإشارة المناسب',
    [...masc.map((d) => ({ left: d.word, right: `هذا ${d.pic}` })), ...fem.map((d) => ({ left: d.word, right: `هذه ${d.pic}` }))],
    { hint: 'هذا للمذكر وهذه للمؤنث' },
  )
}

function a3NewFriend(rand: Rand): Question {
  const item = pick(rand, ['هذا صديقي الجديد', 'هذه صديقتي الجديدة', 'هذا معلمي', 'هذه معلمتي'])
  return orderQ('رتب الكلمات لتكون جملة صحيحة', item.split(' '), say(item))
}

const a3l2 = makeLesson(
  'a3l2',
  'أسماء الإشارة',
  ['EG-Ar-2G', 'EG-Ar-2R'],
  'shadow',
  'هذا وهذه!',
  'هذا للمذكر مثل هذا قمر، وهذه للمؤنث مثل هذه شمس. ثم رحب بصديقنا الجديد.',
  [a3DemonPick, a3DemonMatch, a3NewFriend],
)

/* ---------- a3l3: نشيد الطفل المهذب + صديقنا الجديد + وصف صورة ---------- */

function a3AnthemHear(rand: Rand): Question {
  const line = pick(rand, [
    'أنا طفل مهذب',
    'أحب أصدقائي',
    'أساعد أمي وأبي',
    'أحترم معلمي',
  ])
  const others = ['أنا طفل مهذب', 'أحب أصدقائي', 'أساعد أمي وأبي', 'أحترم معلمي'].filter((l) => l !== line)
  return mcqE(rand, 'استمع واضغط على سطر النشيد الذي سمعته', line, others, say(line))
}

function a3AnthemSpeak(rand: Rand): Question {
  const line = pick(rand, ['أنا طفل مهذب أحب أصدقائي', 'أساعد أمي وأحترم معلمي'])
  return speakQ('غِنِّ سطر النشيد بصوت جميل', line, { hint: 'غِنِّ بفرح!' })
}

const a3l3 = makeLesson(
  'a3l3',
  'نشيد الطفل المهذب',
  ['EG-Ar-2E', 'EG-Ar-2L'],
  'amy',
  'غِنِّ معنا!',
  'نشيد: الطفل المهذب. استمع للسطور ثم غنها بصوت جميل مثل صديقنا الجديد.',
  [a3AnthemHear, a3AnthemSpeak],
)

/* ---------- a3boss ---------- */

const a3boss = makeLesson(
  'a3boss',
  'بطل الأصدقاء',
  ['EG-Ar-2R', 'EG-Ar-2G', 'EG-Ar-2E'],
  'eggman',
  'تحدي البطل!',
  'أحب أصدقائي وأسماء الإشارة والنشيد كلها معا. مثل قصة القطة والكلب: الصداقة أجمل شيء.',
  [a3FriendMatch, a3DemonPick, a3AnthemHear, a3AnthemSpeak],
  a3DemonMatch,
)

export const UNIT_A3: UnitDef = unitDef(
  'a3',
  3,
  'المعاملة الطيبة ٢',
  'سلاح التلميذ · أحب أصدقائي · أسماء الإشارة · نشيد الطفل المهذب',
  '#ff9600',
  '🧡',
  [a3l1, a3l2, a3l3, a3boss],
)
