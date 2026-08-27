import type { UnitDef } from '../types'
import {
  PICTURE_BANK,
  type Rand,
  makeLesson,
  matchQ,
  mcqE,
  orderQ,
  pick,
  shuffle,
  tilesQ,
  unitDef,
} from './helpers'

const RHYME_PAIRS: { left: string; right: string }[] = [
  { left: 'whale', right: 'snail' },
  { left: 'cake', right: 'lake' },
  { left: 'night', right: 'light' },
  { left: 'play', right: 'day' },
  { left: 'boat', right: 'goat' },
  { left: 'moon', right: 'spoon' },
]

const RHYME_TILES = [
  { fam: 'cake, lake, ___', target: 'rake', hint: 'a garden tool' },
  { fam: 'moon, spoon, ___', target: 'soon', hint: 'not late - now!' },
  { fam: 'boat, goat, ___', target: 'coat', hint: 'you wear it outside' },
  { fam: 'whale, snail, ___', target: 'tail', hint: 'a dog wags it' },
  { fam: 'play, day, ___', target: 'say', hint: 'use your words' },
  { fam: 'cat, hat, ___', target: 'mat', hint: 'wipe your feet on it' },
]

const PLURAL_PICTURES = [
  {
    scene: [PICTURE_BANK.mouse, PICTURE_BANK.mouse],
    answer: 'mice',
    wrong: ['mouses', 'mices', 'mouseling', 'mousies', 'mouse'],
  },
  {
    scene: [PICTURE_BANK.sheep, PICTURE_BANK.sheep, PICTURE_BANK.sheep],
    answer: 'sheep',
    wrong: ['sheeps', 'sheepies', 'sheepes', 'lamb', 'wools'],
  },
  {
    scene: [PICTURE_BANK.fish, PICTURE_BANK.fish, PICTURE_BANK.fish, PICTURE_BANK.fish],
    answer: 'fish',
    wrong: ['fishies', 'fished', 'fishing', 'fishman', 'fishen'],
  },
  {
    scene: [PICTURE_BANK.foot, PICTURE_BANK.foot],
    answer: 'feet',
    wrong: ['foots', 'feets', 'footer', 'footsies', 'foot'],
  },
  {
    scene: ['🦷', '🦷'],
    answer: 'teeth',
    wrong: ['tooths', 'teeths', 'toothies', 'dentist', 'tooth'],
  },
  {
    scene: ['👨', '👨', '👨'],
    answer: 'men',
    wrong: ['mans', 'mens', 'manes', 'male', 'man'],
  },
]

const PLURAL_FIXES = [
  { q: 'One child, two ___.', answer: 'children', wrong: ['childs', 'childes', 'childrens', 'childies', 'childish'] },
  { q: 'One man, two ___.', answer: 'men', wrong: ['mans', 'mens', 'manes', 'manners', 'males'] },
  { q: 'One mouse, two ___.', answer: 'mice', wrong: ['mouses', 'mices', 'mousen', 'mouselets', 'rat'] },
  { q: 'One tooth, two ___.', answer: 'teeth', wrong: ['tooths', 'teeths', 'toothpaste', 'toothies', 'tooth'] },
  { q: 'One foot, two ___.', answer: 'feet', wrong: ['foots', 'feets', 'footprint', 'footsie', 'leg'] },
  { q: 'One sheep, three ___.', answer: 'sheep', wrong: ['sheeps', 'sheepes', 'sheepy', 'wool', 'goats'] },
  { q: 'One person, two ___.', answer: 'people', wrong: ['peoples', 'peopley', 'personsies', 'personses', 'many'] },
]

const HOMOPHONE_FILLS_1 = [
  { q: 'The dog wagged its ___.', answer: 'tail', wrong: ['tale', 'tile', 'tails', 'tiling', 'teller'] },
  { q: 'Grandpa told a funny ___.', answer: 'tale', wrong: ['tail', 'tile', 'tales', 'tiling', 'storyteller'] },
  { q: 'The wind ___ my hat off.', answer: 'blew', wrong: ['blue', 'blow', 'blown', 'bloo', 'blu'] },
  { q: 'The sky is ___ today.', answer: 'blue', wrong: ['blew', 'bloo', 'bluw', 'blurry', 'blews'] },
  { q: 'Can you ___ the sea?', answer: 'see', wrong: ['sea', 'sees', 'seen', 'sey', 'looker'] },
  { q: 'Fish swim in the ___.', answer: 'sea', wrong: ['see', 'sees', 'seen', 'oceany', 'seashore'] },
  { q: 'I want to ___ a pilot.', answer: 'be', wrong: ['bee', 'been', 'bes', 'bing', 'beingly'] },
  { q: 'The ___ makes honey.', answer: 'bee', wrong: ['be', 'bees', 'beeing', 'buzz', 'hive'] },
  { q: 'We bake bread with ___.', answer: 'flour', wrong: ['flower', 'flowers', 'flowery', 'floury', 'petal'] },
  { q: 'A tulip is a pretty ___.', answer: 'flower', wrong: ['flour', 'flours', 'floured', 'tuliply', 'petals'] },
]

const HOMOPHONE_HEARS_1 = [
  { s: 'The dog wagged its tail.', answer: 'tail', wrong: ['tale', 'tiles', 'tailing', 'tailed', 'teller'] },
  { s: 'The sky is blue today.', answer: 'blue', wrong: ['blew', 'blues', 'bluey', 'bleww', 'bloo'] },
  { s: 'Come and see my den.', answer: 'see', wrong: ['sea', 'sees', 'seeing', 'sey', 'seen'] },
  { s: 'I want to be a vet.', answer: 'be', wrong: ['bee', 'bees', 'been', 'beeing', 'bes'] },
  { s: 'A busy bee flew past.', answer: 'bee', wrong: ['be', 'beeen', 'beeing', 'beez', 'bees'] },
  { s: 'Dad spilled the flour.', answer: 'flour', wrong: ['flower', 'flowers', 'floury', 'flowered', 'flouer'] },
  { s: 'Grandpa told a long tale.', answer: 'tale', wrong: ['tail', 'tales', 'tailing', 'taill', 'taler'] },
  { s: 'The waves splashed at the sea.', answer: 'sea', wrong: ['see', 'seas', 'seeing', 'cee', 'sey'] },
]

const HOMOPHONE_FILLS_2 = [
  { q: 'Do not ___ at the sun!', answer: 'stare', wrong: ['stair', 'star', 'stares', 'stairway', 'start'] },
  { q: 'I sat on the top ___.', answer: 'stair', wrong: ['stare', 'stared', 'starry', 'upstairs', 'staired'] },
  { q: 'Come and sit ___.', answer: 'here', wrong: ['hear', 'hare', 'hair', 'herd', 'hereing'] },
  { q: 'Did you ___ that bang?', answer: 'hear', wrong: ['here', 'hare', 'hair', 'herd', 'heard'] },
  { q: 'Mia brushed her long ___.', answer: 'hair', wrong: ['hare', 'hairy', 'haring', 'hared', 'brush'] },
  { q: 'The ___ raced the tortoise.', answer: 'hare', wrong: ['hair', 'hares', 'hairy', 'haring', 'hared'] },
  { q: 'My feet are bare on the sand.', answer: 'bare', wrong: ['bear', 'bears', 'baring', 'barley', 'baired'] },
  { q: 'My teddy ___ is soft.', answer: 'bear', wrong: ['bare', 'bears', 'baring', 'teddily', 'bearish'] },
  { q: 'I lost one glove from my ___.', answer: 'pair', wrong: ['pear', 'paring', 'apples', 'paired', 'peare'] },
  { q: 'This juicy ___ tastes sweet.', answer: 'pear', wrong: ['pair', 'pare', 'paring', 'pears', 'pared'] },
  { q: '___ your coat to school.', answer: 'Wear', wrong: ['Where', 'Were', 'Ware', 'Wears', 'Weared'] },
  { q: '___ is my hat?', answer: 'Where', wrong: ['Wear', 'Were', 'Ware', 'Wears', 'Wearing'] },
]

const HOMOPHONE_HEARS_2 = [
  { s: 'Do not stare at the sun.', answer: 'stare', wrong: ['stair', 'stares', 'stairing', 'stayer', 'staired'] },
  { s: 'Sit here next to me.', answer: 'here', wrong: ['hear', 'herd', 'hare', 'hereing', 'hered'] },
  { s: 'Did you hear the thunder?', answer: 'hear', wrong: ['here', 'hare', 'hair', 'herd', 'hearing'] },
  { s: 'Mia brushed her shiny hair.', answer: 'hair', wrong: ['hare', 'hairy', 'haring', 'haress', 'haires'] },
  { s: 'The hare hopped away.', answer: 'hare', wrong: ['hair', 'hairy', 'hares', 'hariness', 'haried'] },
  { s: 'My teddy bear hugs tight.', answer: 'bear', wrong: ['bare', 'bears', 'baring', 'beary', 'baired'] },
  { s: 'Wear your scarf outside.', answer: 'wear', wrong: ['where', 'were', 'ware', 'wearing', 'weared'] },
  { s: 'I ate a sweet pear.', answer: 'pear', wrong: ['pair', 'pared', 'paring', 'peare', 'pares'] },
]

const EXCEPTION_WORDS = [
  { word: 'said', hint: 'the past of say' },
  { word: 'says', hint: 'he or she says it' },
  { word: 'were', hint: 'we were happy - past of are' },
  { word: 'one', hint: 'a number between zero and two' },
  { word: 'who', hint: 'a question word for people' },
  { word: 'was', hint: 'I was here - past of is' },
  { word: 'they', hint: 'those kids over there' },
  { word: 'there', hint: 'not here - over there!' },
  { word: 'people', hint: 'more than one person' },
  { word: 'friend', hint: 'someone you play with' },
  { word: 'school', hint: 'you learn here' },
  { word: 'because', hint: 'it gives the reason' },
  { word: 'again', hint: 'one more time' },
]

const EXCEPTION_FILLS = [
  { q: '"Dinner time!" ___ Mum.', answer: 'said', wrong: ['say', 'saying', 'sed', 'sayed', 'saied'] },
  { q: 'Tom ___ he is five.', answer: 'says', wrong: ['say', 'sed', 'sayed', 'saying', 'saiz'] },
  { q: 'We ___ at the beach all day.', answer: 'were', wrong: ['where', 'was', 'wer', 'werey', 'wering'] },
  { q: 'I have ___ brother.', answer: 'one', wrong: ['won', 'wno', 'ono', 'ones', 'once'] },
  { q: '___ is knocking?', answer: 'Who', wrong: ['How', 'Whos', 'Hoo', 'Whot', 'Why'] },
  { q: 'I ___ at home yesterday.', answer: 'was', wrong: ['waht', 'wsa', 'were', 'saw', 'wering'] },
  { q: '___ are my boots.', answer: 'They', wrong: ['Thay', 'Thye', 'Their', 'Them', 'Theiy'] },
  { q: 'The bag is over ___.', answer: 'there', wrong: ['their', 'they', 'theirr', 'ther', 'theire'] },
  { q: 'Lots of ___ came to the show.', answer: 'people', wrong: ['pepole', 'peopel', 'poepel', 'peopley', 'peoples'] },
  { q: 'My ___ lives next door.', answer: 'friend', wrong: ['freind', 'firnd', 'frind', 'firend', 'fried'] },
  { q: 'I walk to ___.', answer: 'school', wrong: ['skool', 'schoool', 'schol', 'shcool', 'scool'] },
  { q: 'I wore a coat ___ it was cold.', answer: 'because', wrong: ['becuase', 'becase', 'beacuse', 'bacause', 'becouse'] },
  { q: 'Jump in the pool ___!', answer: 'again', wrong: ['agen', 'agian', 'agane', 'agean', 'aganist'] },
]

const DICTATION_SENTENCES = [
  'Sam can run very fast.',
  'We had fun at school.',
  'Mia said hello to her friend.',
  'The frog sat on a log.',
  'Dad made toast and jam.',
]

function gRhymeMatch(rand: Rand) {
  const pairs = shuffle(rand, RHYME_PAIRS).slice(0, 4)
  return matchQ(rand, 'Find the rhyming twins!', pairs)
}

function gRhymeFamilyTiles(rand: Rand) {
  const e = pick(rand, RHYME_TILES)
  return tilesQ(`Rhyme time: ${e.fam}`, e.target, e.hint)
}

function gPluralPicture(rand: Rand) {
  const e = pick(rand, PLURAL_PICTURES)
  return mcqE(rand, 'More than one! What are they?', e.answer, shuffle(rand, e.wrong), {
    visual: { type: 'emoji-group', emojis: e.scene },
  })
}

function gPluralFix(rand: Rand) {
  const e = pick(rand, PLURAL_FIXES)
  return mcqE(rand, e.q, e.answer, shuffle(rand, e.wrong))
}

function gHomophoneFill(rand: Rand) {
  const e = pick(rand, HOMOPHONE_FILLS_1)
  return mcqE(rand, e.q, e.answer, shuffle(rand, e.wrong))
}

function gHomophoneHear(rand: Rand) {
  const e = pick(rand, HOMOPHONE_HEARS_1)
  return mcqE(rand, 'Which spelling did you hear?', e.answer, shuffle(rand, e.wrong), {
    audioText: e.s,
  })
}

function gHomophoneFill2(rand: Rand) {
  const e = pick(rand, HOMOPHONE_FILLS_2)
  return mcqE(rand, e.q, e.answer, shuffle(rand, e.wrong))
}

function gHomophoneHear2(rand: Rand) {
  const e = pick(rand, HOMOPHONE_HEARS_2)
  return mcqE(rand, 'Which spelling did you hear?', e.answer, shuffle(rand, e.wrong), {
    audioText: e.s,
  })
}

function gExceptionSprint(rand: Rand) {
  const e = pick(rand, EXCEPTION_WORDS)
  return tilesQ('Spell the star word!', e.word, e.hint)
}

function gExceptionFill(rand: Rand) {
  const e = pick(rand, EXCEPTION_FILLS)
  return mcqE(rand, e.q, e.answer, shuffle(rand, e.wrong))
}

function gDictationOrder(rand: Rand) {
  const s = pick(rand, DICTATION_SENTENCES)
  return orderQ('Listen, then build the sentence!', s.split(' '), { audioText: s })
}

export const UNIT_E4: UnitDef = unitDef(
  'e4',
  4,
  'Spelling Stars',
  'Cambridge 2Ww - patterns, plurals, homophones, exception words',
  '#ff9600',
  '🌟',
  [
    makeLesson(
      'e4l1',
      'Rhyme Families',
      ['2Ww.03'],
      'amy',
      'Rhyme Time Line-up!',
      'Words that rhyme often share the same spelling pattern!',
      [gRhymeMatch, gRhymeFamilyTiles],
    ),
    makeLesson(
      'e4l2',
      'Irregular Plural Zoo',
      ['2Ww.04'],
      'knuckles',
      'Odd Plurals Party!',
      'Some plurals change their whole word - mice, feet, teeth!',
      [gPluralPicture, gPluralFix],
    ),
    makeLesson(
      'e4l3',
      'Homophone Twins I',
      ['2Ww.07'],
      'shadow',
      'Sound-Alike Twins!',
      'Some words sound the same but have different spellings and meanings!',
      [gHomophoneFill, gHomophoneHear],
    ),
    makeLesson(
      'e4l4',
      'Homophone Twins II',
      ['2Ww.07'],
      'blaze',
      'Twins Strike Back!',
      'More sound-alike twins - the sentence tells you which spelling wins!',
      [gHomophoneFill2, gHomophoneHear2],
    ),
    makeLesson(
      'e4l5',
      'Exception Word Bootcamp',
      ['2Ww.09'],
      'cream',
      'Tricky Word Bootcamp!',
      'Common exception words refuse to follow rules, so we learn them by heart!',
      [gExceptionSprint, gExceptionFill],
    ),
    makeLesson(
      'e4boss',
      'Spelling Boss',
      ['2Ww.03', '2Ww.04', '2Ww.07', '2Ww.09'],
      'eggman',
      "Beat Eggman's Spelling Tricks!",
      'Eggman mixed rhymes, plurals, twins and tricky words into one mega quiz!',
      [gRhymeFamilyTiles, gPluralFix, gHomophoneFill, gHomophoneHear2, gExceptionFill, gPluralPicture],
      gDictationOrder,
    ),
  ],
)
