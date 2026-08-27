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

const UN_PAIRS: { left: string; right: string }[] = [
  { left: 'lock', right: 'unlock' },
  { left: 'do', right: 'undo' },
  { left: 'tie', right: 'untie' },
  { left: 'zip', right: 'unzip' },
  { left: 'pack', right: 'unpack' },
  { left: 'kind', right: 'unkind' },
  { left: 'safe', right: 'unsafe' },
]

const UN_MEANINGS = [
  { word: 'unlock', answer: 'to open it', wrong: ['to close it', 'to lose it', 'to hide it', 'to eat it', 'to wash it'] },
  { word: 'untie', answer: 'to undo the knot', wrong: ['to make a knot', 'to cut the rope', 'to tie it twice', 'to pull harder', 'to bend it'] },
  { word: 'unpack', answer: 'to take things out of a bag', wrong: ['to put things into a bag', 'to buy a bag', 'to lose the bag', 'to sit down', 'to sleep'] },
  { word: 'unhappy', answer: 'not happy', wrong: ['very happy', 'extra jumpy', 'a bit sleepy', 'super loud', 'tiny'] },
  { word: 'unkind', answer: 'not kind', wrong: ['very kind', 'so silly', 'quite quiet', 'double quick', 'old'] },
  { word: 'unsafe', answer: 'not safe', wrong: ['very safe', 'warm and cosy', 'shiny', 'brand new', 'sweet'] },
]

const DIS_RE_WORDS = [
  { word: 'disagree', parts: 'dis + agree', hint: 'you think differently' },
  { word: 'replay', parts: 're + play', hint: 'play it again' },
  { word: 'disobey', parts: 'dis + obey', hint: 'does not follow the rules' },
  { word: 'redo', parts: 're + do', hint: 'do it again' },
  { word: 'dislike', parts: 'dis + like', hint: 'do not enjoy it' },
  { word: 'retell', parts: 're + tell', hint: 'tell it again' },
]

const DIS_RE_FILLS = [
  { q: 'I ___ with you.', answer: 'disagree', wrong: ['reagree', 'unagree', 'misagree', 'outagree', 'disagreesy'] },
  { q: 'Please ___ the story.', answer: 'retell', wrong: ['distell', 'untell', 'mistell', 'pretelly', 'outtell'] },
  { q: 'I ___ slimy slugs.', answer: 'dislike', wrong: ['relike', 'unliking', 'mislikey', 'prelike', 'outlike'] },
  { q: 'Mum will ___ the soup.', answer: 'reheat', wrong: ['disheat', 'unheat', 'misheat', 'outheat', 'reheatty'] },
  { q: 'Do not ___ the referee.', answer: 'disobey', wrong: ['reobey', 'unobey', 'misobey', 'preobey', 'outobey'] },
  { q: 'Can you ___ the sum?', answer: 'redo', wrong: ['disdo', 'misdo', 'undisdo', 'disdoing', 'redoesy'] },
]

const COMPARE_PICKS = [
  {
    scene: [PICTURE_BANK.mouse, PICTURE_BANK.mouse, PICTURE_BANK.elephant],
    prompt: 'The elephant is ___ than the mouse.',
    answer: 'bigger',
    wrong: ['smallest', 'smaller', 'shorter', 'lighter', 'thinner'],
  },
  {
    scene: [PICTURE_BANK.flower, PICTURE_BANK.tree],
    prompt: 'The tree is ___ than the flower.',
    answer: 'taller',
    wrong: ['tallest', 'shorter', 'smaller', 'lower', 'thinner'],
  },
  {
    scene: [PICTURE_BANK.snail, PICTURE_BANK.rabbit],
    prompt: 'The rabbit is ___ than the snail.',
    answer: 'faster',
    wrong: ['fastest', 'slower', 'slowest', 'later', 'sleepier'],
  },
  {
    scene: [PICTURE_BANK.mouse, PICTURE_BANK.elephant, PICTURE_BANK.elephant],
    prompt: 'The mouse is the ___.',
    answer: 'smallest',
    wrong: ['smaller', 'biggest', 'bigger', 'largest', 'longest'],
  },
  {
    scene: [PICTURE_BANK.tree, PICTURE_BANK.tree, PICTURE_BANK.flower],
    prompt: 'The flower is the ___.',
    answer: 'shortest',
    wrong: ['shorter', 'longest', 'highest', 'loudest', 'oldest'],
  },
  {
    scene: [PICTURE_BANK.horse, PICTURE_BANK.snail],
    prompt: 'The snail is ___ than the horse.',
    answer: 'slower',
    wrong: ['slowest', 'faster', 'fastest', 'quicker', 'speedier'],
  },
]

const ER_EST_CHAINS = [
  ['big', 'bigger', 'biggest'],
  ['tall', 'taller', 'tallest'],
  ['fast', 'faster', 'fastest'],
  ['slow', 'slower', 'slowest'],
  ['short', 'shorter', 'shortest'],
  ['loud', 'louder', 'loudest'],
]

const SUFFIX_WORDS = [
  { word: 'helpful', parts: 'help + ful', hint: 'always ready to help' },
  { word: 'slowly', parts: 'slow + ly', hint: 'how a snail moves' },
  { word: 'sunny', parts: 'sun + y (double n!)', hint: 'bright with sunshine' },
  { word: 'playful', parts: 'play + ful', hint: 'full of fun' },
  { word: 'quickly', parts: 'quick + ly', hint: 'really fast!' },
  { word: 'rainy', parts: 'rain + y', hint: 'when the drops keep falling' },
  { word: 'careful', parts: 'care + ful', hint: 'taking great care' },
  { word: 'funny', parts: 'fun + y (double n!)', hint: 'makes you laugh' },
]

const SUFFIX_MEANINGS = [
  { word: 'Handful', answer: 'as much as your hand holds', wrong: ['a hand that claps', 'five fingers only', 'very handy', 'a tiny hand', 'hands in gloves'] },
  { word: 'Helpful', answer: 'likes to help a lot', wrong: ['full of holes', 'very heavy', 'a kind of shelf', 'needing lots of help', 'half asleep'] },
  { word: 'Slowly', answer: 'in a slow way', wrong: ['very fast indeed', 'stopped moving', 'only in slow songs', 'going backwards', 'wide awake'] },
  { word: 'Playful', answer: 'full of fun', wrong: ['made only of toys', 'feeling sad', 'quiet bed time', 'full of grass', 'rather cross'] },
  { word: 'Sunny', answer: 'full of sunshine', wrong: ['cold and soaking wet', 'the darkest night', 'a fried egg only', 'under the sea', 'covered in frost'] },
  { word: 'Carefully', answer: 'with lots of care', wrong: ['in a big hurry', 'without looking at all', 'very scary', 'upside down', 'fast asleep'] },
]

const TENSE_PAIRS: { left: string; right: string }[] = [
  { left: 'walk', right: 'walked' },
  { left: 'jump', right: 'jumped' },
  { left: 'play', right: 'played' },
  { left: 'help', right: 'helped' },
  { left: 'look', right: 'looked' },
  { left: 'want', right: 'wanted' },
]

const ENDING_FILLS = [
  { q: 'Yesterday I ___ to school.', answer: 'walked', wrong: ['walk', 'walks', 'walking', 'walken', 'walksy'] },
  { q: 'Today she ___ to school.', answer: 'walks', wrong: ['walk', 'walked', 'walking', 'walken', 'walksy'] },
  { q: 'Yesterday we ___ in the park.', answer: 'played', wrong: ['play', 'plays', 'playing', 'playen', 'playerly'] },
  { q: 'He ___ his mum every day.', answer: 'helps', wrong: ['help', 'helped', 'helping', 'helpen', 'helperly'] },
  { q: 'I am ___ with my toys.', answer: 'playing', wrong: ['play', 'plays', 'played', 'playen', 'playingful'] },
  { q: 'Yesterday they ___ TV.', answer: 'watched', wrong: ['watch', 'watches', 'watching', 'watchen', 'watchly'] },
]

const BOSS_WORDS = [
  { word: 'unlock', hint: 'un + lock: open it!' },
  { word: 'replay', hint: 're + play: again!' },
  { word: 'unpack', hint: 'un + pack: empty the bag!' },
  { word: 'helpful', hint: 'help + ful: likes to help!' },
  { word: 'biggest', hint: 'big + gest: the champion size!' },
  { word: 'walked', hint: 'walk + ed: it happened yesterday!' },
]

function gUnMatch(rand: Rand) {
  const pairs = shuffle(rand, UN_PAIRS).slice(0, 4)
  return matchQ(rand, 'Match each word to its un- twin!', pairs)
}

function gUnMeaning(rand: Rand) {
  const e = pick(rand, UN_MEANINGS)
  return mcqE(rand, `What does "${e.word}" mean?`, e.answer, shuffle(rand, e.wrong))
}

function gDisReTiles(rand: Rand) {
  const e = pick(rand, DIS_RE_WORDS)
  return tilesQ(`Build the word: ${e.parts}`, e.word, e.hint)
}

function gDisReFill(rand: Rand) {
  const e = pick(rand, DIS_RE_FILLS)
  return mcqE(rand, e.q, e.answer, shuffle(rand, e.wrong))
}

function gComparativePick(rand: Rand) {
  const e = pick(rand, COMPARE_PICKS)
  return mcqE(rand, e.prompt, e.answer, shuffle(rand, e.wrong), {
    visual: { type: 'emoji-group', emojis: e.scene },
  })
}

function gErEstOrder(rand: Rand) {
  const chain = pick(rand, ER_EST_CHAINS)
  return orderQ('Order them: plain, then -er, then -est!', chain, {
    hint: `${chain[0]} ... ${chain[1]} ... ${chain[2]}`,
  })
}

function gSuffixTiles(rand: Rand) {
  const e = pick(rand, SUFFIX_WORDS)
  return tilesQ(`Glue it: ${e.parts}`, e.word, e.hint)
}

function gSuffixMeaning(rand: Rand) {
  const e = pick(rand, SUFFIX_MEANINGS)
  return mcqE(rand, `"${e.word}" means...`, e.answer, shuffle(rand, e.wrong))
}

function gTensePairMatch(rand: Rand) {
  const pairs = shuffle(rand, TENSE_PAIRS).slice(0, 4)
  return matchQ(rand, 'Match today to yesterday!', pairs)
}

function gEndingFill(rand: Rand) {
  const e = pick(rand, ENDING_FILLS)
  return mcqE(rand, e.q, e.answer, shuffle(rand, e.wrong))
}

function gBossTiles(rand: Rand) {
  const e = pick(rand, BOSS_WORDS)
  return tilesQ('BOSS BUILD! Glue the pieces:', e.word, e.hint)
}

export const UNIT_E3: UnitDef = unitDef(
  'e3',
  3,
  'Prefix & Suffix Lab',
  'Cambridge 2Rw.03/2Ww.06/2Wg.07/2Wg.10 - affixes',
  '#ce82ff',
  '🧪',
  [
    makeLesson(
      'e3l1',
      'un- Undo Machine',
      ['2Rw.03', '2Ww.06'],
      'amy',
      'Flip It with un-!',
      'Adding un- to a word flips its meaning to the opposite!',
      [gUnMatch, gUnMeaning],
    ),
    makeLesson(
      'e3l2',
      'dis- & re- Removers',
      ['2Rw.03'],
      'blaze',
      'Prefix Power-Up!',
      'dis- and re- glue onto verbs to change what they mean!',
      [gDisReTiles, gDisReFill],
    ),
    makeLesson(
      'e3l3',
      '-er / -est Showdown',
      ['2Wg.10', '2Ww.06'],
      'knuckles',
      'Bigger, Biggest, GO!',
      'Add -er to compare two things and -est to crown the champion!',
      [gComparativePick, gErEstOrder],
    ),
    makeLesson(
      'e3l4',
      '-ful -ly -y Word Glue',
      ['2Ww.06'],
      'tails',
      'Glue On -ful, -ly, -y!',
      'Endings glue onto words to build brand-new ones!',
      [gSuffixTiles, gSuffixMeaning],
    ),
    makeLesson(
      'e3l5',
      'Verb Endings -s -ed -ing',
      ['2Wg.07', '2Ww.05'],
      'shadow',
      'Time-Travel Endings!',
      'Change the ending of a verb to zoom to today or yesterday!',
      [gTensePairMatch, gEndingFill],
    ),
    makeLesson(
      'e3boss',
      'Affix Boss',
      ['2Rw.03', '2Ww.06', '2Wg.07', '2Wg.10'],
      'eggman',
      'Boss Battle: Affix Lab!',
      'Eggman mixed every prefix and suffix together - unmix them all!',
      [gUnMeaning, gDisReFill, gComparativePick, gSuffixTiles, gEndingFill, gUnMatch, gTensePairMatch],
      gBossTiles,
    ),
  ],
)
