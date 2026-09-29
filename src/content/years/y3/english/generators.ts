/** PLAN 169d — Year-3 english generators. DfE Appendix 1 "work for years
 *  3 and 4" (prefixes, -ation/-ly/-ous, the -tion family, ch/gue/que/sc/
 *  ei spellings, doubling), the statutory "Word list: years 3 and 4",
 *  homophones + plural possessive apostrophes, the PoS years 3 and 4
 *  grammar (conjunctions, fronted adverbials, present perfect, pronouns),
 *  comprehension (retrieve/infer/predict/main idea/word meaning) and
 *  composition (paragraph order, speech marks, edit/proofread, performance)
 *  — all built from the vocabulary in src/content/syllabus/y3/english.ts.
 *
 *  Vocabulary rule: bank-tier words (mcq choices, match sides, order items,
 *  tiles targets) must pass the year-3 english syllabus; prompts, hints,
 *  truefalse statements, speak targets and story lines are text tier
 *  (report-only). Intentional near-miss spellings live in
 *  ENGLISH_Y3_TOLERANCE. */

import type { Question } from '../../../types'
import {
  PICTURE_BANK,
  matchQ,
  mcqE,
  orderQ,
  pick,
  pickOthers,
  randInt,
  say,
  shuffle,
  speakQ,
  story,
  tfQ,
  tilesQ,
  type Rand,
} from '../../../english/helpers'

/* ============ Unit 1 · Prefixes: dis-, mis-, in-/il-/im-/ir- ========== */

const DIS_MIS_POOL = [
  'disappoint', 'disagree', 'disobey', 'dislike', 'disappear',
  'misbehave', 'mislead', 'misspell', 'mistake',
]

export function gY3DisMis(rand: Rand): Question {
  const answer = pick(rand, DIS_MIS_POOL)
  return mcqE(rand, 'Which word has a prefix meaning not or wrongly?', answer,
    pickOthers(rand, DIS_MIS_POOL, answer, 3))
}

const PREFIX_MEANINGS = [
  { w: 'misbehave', a: 'wrongly' }, { w: 'misspell', a: 'wrongly' },
  { w: 'disobey', a: 'wrongly' }, { w: 'redo', a: 'again' },
  { w: 'refresh', a: 'again' }, { w: 'reappear', a: 'again' },
  { w: 'submerge', a: 'under' }, { w: 'subdivide', a: 'under' },
  { w: 'submarine', a: 'under' }, { w: 'interact', a: 'between' },
  { w: 'intercity', a: 'between' }, { w: 'international', a: 'between' },
  { w: 'supermarket', a: 'above' }, { w: 'superman', a: 'above' },
  { w: 'antisocial', a: 'against' }, { w: 'antiseptic', a: 'against' },
  { w: 'autobiography', a: 'self' }, { w: 'autograph', a: 'self' },
  { w: 'incorrect', a: 'not' }, { w: 'inactive', a: 'not' },
  { w: 'impossible', a: 'not' }, { w: 'immature', a: 'not' },
]
const MEANING_CHOICES = ['not', 'again', 'wrongly', 'under', 'between', 'above', 'against', 'self']

export function gY3PrefixMeaning(rand: Rand): Question {
  const it = pick(rand, PREFIX_MEANINGS)
  return mcqE(rand, `What does the prefix in "${it.w}" mean?`, it.a,
    pickOthers(rand, MEANING_CHOICES, it.a, 3))
}

const IN_PREFIX_RIGHT = [
  { a: 'illegal', o: ['inlegal', 'illigal', 'illegable'] },
  { a: 'illegible', o: ['inlegible', 'illigible', 'illegabal'] },
  { a: 'immature', o: ['inmature', 'imature', 'immatuer'] },
  { a: 'immortal', o: ['inmortal', 'imortal', 'immortel'] },
  { a: 'impossible', o: ['inpossible', 'imposible', 'impossibel'] },
  { a: 'impatient', o: ['impatiant', 'impashent', 'impacient'] },
  { a: 'imperfect', o: ['inperfect', 'imperfekt', 'imprefect'] },
  { a: 'irregular', o: ['inregular', 'irreguler', 'irrgular'] },
  { a: 'irrelevant', o: ['inrelevant', 'irrelevent', 'irrelavent'] },
  { a: 'irresponsible', o: ['inresponsible', 'irresponsable', 'irresponsble'] },
  { a: 'inactive', o: ['inactiv', 'inactiff', 'inactve'] },
  { a: 'incorrect', o: ['incorect', 'incoreckt', 'incorrekt'] },
]

export function gY3InPrefixSpell(rand: Rand): Question {
  const it = pick(rand, IN_PREFIX_RIGHT)
  return mcqE(rand, 'Which word uses the prefix spelled correctly?', it.a, it.o)
}

const PREFIX_PAIRS: { left: string; right: string }[] = [
  { left: 'appear', right: 'disappear' }, { left: 'possible', right: 'impossible' },
  { left: 'regular', right: 'irregular' }, { left: 'spell', right: 'misspell' },
  { left: 'agree', right: 'disagree' }, { left: 'obey', right: 'disobey' },
  { left: 'behave', right: 'misbehave' }, { left: 'national', right: 'international' },
  { left: 'divide', right: 'subdivide' }, { left: 'market', right: 'supermarket' },
  { left: 'social', right: 'antisocial' }, { left: 'merge', right: 'submerge' },
  { left: 'graph', right: 'autograph' }, { left: 'city', right: 'intercity' },
  { left: 'act', right: 'interact' }, { left: 'patient', right: 'impatient' },
  { left: 'legal', right: 'illegal' }, { left: 'mature', right: 'immature' },
  { left: 'perfect', right: 'imperfect' }, { left: 'man', right: 'superman' },
]

export function gY3PrefixMatch(rand: Rand): Question {
  const pairs = shuffle(rand, PREFIX_PAIRS).slice(0, 4)
  return matchQ(rand, 'Match each root word to its prefixed form', pairs)
}

/* ============= Unit 2 · Prefixes: re-, sub-, inter-, super- ============ */

const RE_WORDS = ['redo', 'refresh', 'return', 'reappear', 'redecorate']
const SUB_WORDS = ['subdivide', 'subheading', 'submarine', 'submerge']

export function gY3ReSub(rand: Rand): Question {
  if (randInt(rand, 0, 1) === 0) {
    const answer = pick(rand, RE_WORDS)
    return mcqE(rand, 'Which word starts with re-, meaning again or back?', answer,
      pickOthers(rand, SUB_WORDS, answer, 3))
  }
  const answer = pick(rand, SUB_WORDS)
  return mcqE(rand, 'Which word starts with sub-, meaning under?', answer,
    pickOthers(rand, RE_WORDS, answer, 3))
}

const INTER_WORDS = ['interact', 'intercity', 'international', 'interrelated']
const SUPER_WORDS = ['supermarket', 'superman', 'superstar']

export function gY3InterSuper(rand: Rand): Question {
  if (randInt(rand, 0, 1) === 0) {
    const answer = pick(rand, INTER_WORDS)
    return mcqE(rand, 'Which word starts with inter-, meaning between or among?', answer,
      pickOthers(rand, SUPER_WORDS, answer, 3))
  }
  const answer = pick(rand, SUPER_WORDS)
  return mcqE(rand, 'Which word starts with super-, meaning above?', answer,
    pickOthers(rand, INTER_WORDS, answer, 3))
}

const BUILDS = [
  { p: 'dis + agree', a: 'disagree' }, { p: 'mis + spell', a: 'misspell' },
  { p: 'in + correct', a: 'incorrect' }, { p: 'sub + divide', a: 'subdivide' },
  { p: 'auto + graph', a: 'autograph' }, { p: 'anti + social', a: 'antisocial' },
  { p: 'super + market', a: 'supermarket' }, { p: 're + appear', a: 'reappear' },
  { p: 'inter + national', a: 'international' }, { p: 'in + possible', a: 'impossible' },
  { p: 'inter + related', a: 'interrelated' }, { p: 'mis + behave', a: 'misbehave' },
  { p: 'il + legal', a: 'illegal' }, { p: 'im + mature', a: 'immature' },
]

export function gY3PrefixBuild(rand: Rand): Question {
  const it = pick(rand, BUILDS)
  return mcqE(rand, `What does "${it.p}" make?`, it.a,
    pickOthers(rand, BUILDS.map((b) => b.a), it.a, 3))
}

/* ================= Unit 3 · -ation, -ly and -ous ======================= */

const ATION_NOUNS: { left: string; right: string }[] = [
  { left: 'inform', right: 'information' }, { left: 'prepare', right: 'preparation' },
  { left: 'admire', right: 'admiration' }, { left: 'adore', right: 'adoration' },
  { left: 'sense', right: 'sensation' }, { left: 'act', right: 'action' },
  { left: 'invent', right: 'invention' }, { left: 'express', right: 'expression' },
  { left: 'hesitate', right: 'hesitation' }, { left: 'confess', right: 'confession' },
  { left: 'admit', right: 'admission' }, { left: 'divide', right: 'division' },
  { left: 'complete', right: 'completion' }, { left: 'discuss', right: 'discussion' },
]

export function gY3Ation(rand: Rand): Question {
  const it = pick(rand, ATION_NOUNS)
  return mcqE(rand, `What is the noun form of "${it.left}"?`, it.right,
    pickOthers(rand, ATION_NOUNS.map((n) => n.right), it.right, 3))
}

export function gY3AtionMatch(rand: Rand): Question {
  const pairs = shuffle(rand, ATION_NOUNS).slice(0, 4)
  return matchQ(rand, 'Match each verb to its noun form', pairs)
}

const LY_PAIRS: { left: string; right: string }[] = [
  { left: 'sad', right: 'sadly' }, { left: 'happy', right: 'happily' },
  { left: 'angry', right: 'angrily' }, { left: 'gentle', right: 'gently' },
  { left: 'simple', right: 'simply' }, { left: 'humble', right: 'humbly' },
  { left: 'quick', right: 'quickly' }, { left: 'quiet', right: 'quietly' },
  { left: 'slow', right: 'slowly' }, { left: 'careful', right: 'carefully' },
  { left: 'final', right: 'finally' }, { left: 'complete', right: 'completely' },
  { left: 'usual', right: 'usually' }, { left: 'comic', right: 'comically' },
  { left: 'nervous', right: 'nervously' }, { left: 'plain', right: 'plainly' },
]
const LY_WRONG: Record<string, string[]> = {
  sad: ['sadley', 'saddly'], happy: ['happyly', 'happely'], angry: ['angryly', 'angerly'],
  gentle: ['gentley', 'gentil'], simple: ['simpley', 'simpel'], humble: ['humbley', 'humbel'],
  quick: ['quikly', 'quicly'], quiet: ['quiettly', 'quetly'], slow: ['slowely', 'sloly'],
  careful: ['carefull', 'careflly'], final: ['finelly', 'fianlly'], complete: ['compleatly', 'completly'],
  usual: ['useally', 'usally'], comic: ['comickly', 'comicly'], nervous: ['nervosly', 'nervious'],
  plain: ['planeley', 'planelly'],
}

export function gY3LyAdverb(rand: Rand): Question {
  const it = pick(rand, LY_PAIRS)
  const base = it.left
  if (randInt(rand, 0, 3) === 0 && (base === 'happy' || base === 'angry' || base === 'plain')) {
    const wrongs = [...LY_WRONG[base], base === 'happy' ? 'angrily' : 'happily']
    return mcqE(rand, 'y changes to i before -ly. Which spelling is right?', it.right, wrongs)
  }
  return mcqE(rand, `Add -ly to "${base}". Which spelling is right?`, it.right,
    (LY_WRONG[base] ?? []).concat(pickOthers(rand, LY_PAIRS.map((p) => p.right), it.right, 3)))
}

export function gY3LyMatch(rand: Rand): Question {
  const pairs = shuffle(rand, LY_PAIRS).slice(0, 4)
  return matchQ(rand, 'Match each word to its -ly adverb', pairs)
}

const OUS_BASES = [
  { b: 'poison', a: 'poisonous' }, { b: 'danger', a: 'dangerous' },
  { b: 'mountain', a: 'mountainous' }, { b: 'fame', a: 'famous' },
  { b: 'vary', a: 'various' }, { b: 'courage', a: 'courageous' },
  { b: 'outrage', a: 'outrageous' }, { b: 'glamour', a: 'glamorous' },
  { b: 'humor', a: 'humorous' }, { b: 'vigour', a: 'vigorous' },
]
const OUS_WRONG: Record<string, string[]> = {
  poison: ['poisenous', 'poisonus'], danger: ['dangeorus', 'dangrous'],
  mountain: ['mountanous', 'mounteinous'], fame: ['famouse', 'fameous'],
  vary: ['varyous', 'varieus'], courage: ['couragous', 'courrageous'],
  outrage: ['outragous', 'outragueous'], glamour: ['glamoros', 'glamoures'],
  humor: ['humoros', 'humourous'], vigour: ['vigorus', 'vigourous'],
}

export function gY3OusAdj(rand: Rand): Question {
  const it = pick(rand, OUS_BASES)
  return mcqE(rand, `Add -ous to "${it.b}". Which spelling is right?`, it.a,
    OUS_WRONG[it.b].concat(pickOthers(rand, OUS_BASES.map((o) => o.a), it.a, 2)))
}

/* ============ Unit 4 · The -tion family & sound endings =============== */

const TION_SET = ['invention', 'injection', 'action', 'hesitation', 'completion']
const SSION_SET = ['expression', 'discussion', 'confession', 'permission', 'admission']
const SION_SET = ['division', 'invasion', 'confusion', 'decision', 'collision',
  'television', 'expansion', 'extension', 'comprehension', 'tension']
const CIAN_SET = ['musician', 'electrician', 'magician', 'politician', 'mathematician']
const ALL_FAN = [...TION_SET, ...SSION_SET, ...SION_SET, ...CIAN_SET]

const FAMILIES: { end: string; pool: readonly string[] }[] = [
  { end: '-tion', pool: TION_SET },
  { end: '-ssion', pool: SSION_SET },
  { end: '-sion', pool: SION_SET },
  { end: '-cian', pool: CIAN_SET },
]

export function gY3TIONChoice(rand: Rand): Question {
  const fam = pick(rand, FAMILIES)
  const answer = pick(rand, fam.pool)
  return mcqE(rand, `Which word ends in ${fam.end}?`, answer,
    pickOthers(rand, ALL_FAN.filter((w) => !fam.pool.includes(w)), answer, 3))
}

export function gY3SIONWords(rand: Rand): Question {
  const answer = pick(rand, SION_SET)
  return mcqE(rand, 'Which word makes the /jən/ sound, spelt -sion?', answer,
    pickOthers(rand, [...TION_SET, ...SSION_SET], answer, 3))
}

export function gY3CIAN(rand: Rand): Question {
  const answer = pick(rand, CIAN_SET)
  const prompt = randInt(rand, 0, 1) === 0
    ? 'Which word ends in -cian, naming a job?'
    : 'Which word names a person who does a job?'
  return mcqE(rand, prompt, answer,
    pickOthers(rand, [...TION_SET, ...SION_SET], answer, 3))
}

const TURE_SET = ['creature', 'furniture', 'picture', 'nature', 'adventure']
const SURE_SET = ['measure', 'treasure', 'pleasure', 'enclosure']

export function gY3SureTure(rand: Rand): Question {
  if (randInt(rand, 0, 1) === 0) {
    const answer = pick(rand, SURE_SET)
    return mcqE(rand, 'Which word ends in -sure?', answer,
      pickOthers(rand, TURE_SET, answer, 3))
  }
  const answer = pick(rand, TURE_SET)
  return mcqE(rand, 'Which word ends in -ture?', answer,
    pickOthers(rand, SURE_SET, answer, 3))
}

/* =================== Unit 5 · Tricky spellings ========================= */

const CH_K = ['scheme', 'chorus', 'chemist', 'echo', 'character']
const CH_SH = ['chef', 'chalet', 'machine', 'brochure']

export function gY3CHWord(rand: Rand): Question {
  if (randInt(rand, 0, 1) === 0) {
    const answer = pick(rand, CH_K)
    return mcqE(rand, 'Which word has ch making a /k/ sound?', answer,
      pickOthers(rand, CH_SH, answer, 3))
  }
  const answer = pick(rand, CH_SH)
  return mcqE(rand, 'Which word has ch making a /sh/ sound?', answer,
    pickOthers(rand, CH_K, answer, 3))
}

const GUE_SET = ['league', 'tongue']
const QUE_SET = ['antique', 'unique']

export function gY3GueQue(rand: Rand): Question {
  const fam = randInt(rand, 0, 2)
  if (fam === 0) {
    const answer = pick(rand, GUE_SET)
    return mcqE(rand, 'Which word ends in -gue?', answer,
      pickOthers(rand, QUE_SET, answer, 3))
  }
  if (fam === 1) {
    const answer = pick(rand, QUE_SET)
    return mcqE(rand, 'Which word ends in -que?', answer,
      pickOthers(rand, GUE_SET, answer, 3))
  }
  const answer = pick(rand, [...GUE_SET, ...QUE_SET])
  return mcqE(rand, 'Which word ends with a French ending: -gue or -que?', answer,
    pickOthers(rand, [...CH_K, ...CH_SH], answer, 3))
}

const SC_WORDS = ['science', 'scene', 'discipline', 'fascinate', 'crescent']

export function gY3SC(rand: Rand): Question {
  const answer = pick(rand, SC_WORDS)
  const prompt = randInt(rand, 0, 1) === 0
    ? 'Which word uses sc to make the /s/ sound?'
    : 'Which word starts with the letters sc?'
  return mcqE(rand, prompt, answer,
    pickOthers(rand, [...CH_K, ...CH_SH, ...GUE_SET, ...QUE_SET], answer, 3))
}

const EI_WORDS = ['vein', 'weigh', 'neighbour', 'eight', 'obey', 'they']
const NON_EI = ['see', 'sea', 'train', 'rain', 'day', 'play']

export function gY3EISpelling(rand: Rand): Question {
  const answer = pick(rand, EI_WORDS)
  const prompt = randInt(rand, 0, 1) === 0
    ? 'Which word has the /eɪ/ sound spelled ei, eigh or ey?'
    : 'Which word spells its /eɪ/ sound with ei or eigh?'
  return mcqE(rand, prompt, answer,
    pickOthers(rand, NON_EI, answer, 3))
}

const OU_WORDS = ['young', 'touch', 'double', 'trouble', 'country']
const NON_OU = ['moon', 'soup', 'group', 'sound', 'round']

export function gY3OuY(rand: Rand): Question {
  const answer = pick(rand, OU_WORDS)
  const prompt = randInt(rand, 0, 1) === 0
    ? 'Which word spells the /ʌ/ sound with ou?'
    : 'Which word has ou making a short /u/ sound?'
  return mcqE(rand, prompt, answer,
    pickOthers(rand, NON_OU, answer, 3))
}

const Y_IS_I = ['myth', 'gym', 'egypt', 'pyramid', 'mystery']
const NON_Y_IS_I = ['happy', 'baby', 'funny', 'party']

export function gY3MythY(rand: Rand): Question {
  const answer = pick(rand, Y_IS_I)
  const prompt = randInt(rand, 0, 1) === 0
    ? 'Which word spells /ɪ/ with y NOT at the end?'
    : 'Which word has the y sound in the middle?'
  return mcqE(rand, prompt, answer,
    pickOthers(rand, NON_Y_IS_I, answer, 3))
}

const DOUBLE_WORDS = ['forgetting', 'forgotten', 'beginning', 'beginner',
  'preferred', 'gardening', 'gardener', 'limiting', 'limited']
const DOUBLE_WRONG: Record<string, string[]> = {
  forgetting: ['forgeting', 'forgetten'], forgotten: ['forgeten', 'forgottened'],
  beginning: ['begining', 'begginning'], beginner: ['beginer', 'beginnig'],
  preferred: ['prefered', 'preferrd'], gardening: ['gardning', 'gardenning'],
  gardener: ['gardner', 'gardenner'], limiting: ['limting', 'limmiting'],
  limited: ['limitted', 'limted'],
}

export function gY3DoubleCons(rand: Rand): Question {
  const answer = pick(rand, DOUBLE_WORDS)
  const prompt = randInt(rand, 0, 1) === 0
    ? 'Which word doubles its last letter before the ending?'
    : 'Which word is spelled correctly?'
  const wrongs = (DOUBLE_WRONG[answer] ?? []).filter((w) => w !== answer)
  return mcqE(rand, prompt, answer,
    wrongs.concat(pickOthers(rand, DOUBLE_WORDS, answer, 2)))
}

/* ============= Unit 6 · Word list: years 3 and 4 ====================== */

const WL_TILES: readonly (readonly [string, string])[] = [
  ['separate', 's_parate'], ['library', 'l_brary'], ['medicine', 'm_dicine'],
  ['occasion', 'o_asion'], ['calendar', 'c_lendar'], ['grammar', 'g_ammer'],
  ['believe', 'b_lieve'], ['disappear', 'd_sappear'], ['question', 'q_estion'],
  ['quarter', 'q_arter'], ['straight', 's_aight'], ['surprise', 's_rprise'],
  ['potatoes', 'p_tatoes'], ['favourite', 'f_ourite'], ['February', 'f_bruary'],
  ['exercise', 'e_ercise'], ['experience', 'e_perience'], ['important', 'i_portant'],
  ['different', 'd_fferent'], ['knowledge', 'k_owledge'], ['paragraph', 'p_ragraph'],
  ['possession', 'p_ssession'], ['vegetable', 'v_getable'], ['peculiar', 'p_culiar'],
]

export function gY3WLTiles(rand: Rand): Question {
  const [word, pattern] = pick(rand, WL_TILES)
  return tilesQ(`Spell the word list word: ${pattern}`, word.toLowerCase(),
    'Say it, then tap the tiles in order.')
}

const WL_SPELLING = [
  { a: 'separate', o: ['seperate', 'saparate', 'separte'] },
  { a: 'library', o: ['libary', 'librray', 'libaryy'] },
  { a: 'occasion', o: ['ocassion', 'occassion', 'ocasion'] },
  { a: 'calendar', o: ['calender', 'calandar', 'callender'] },
  { a: 'grammar', o: ['grammer', 'grammor', 'gramar'] },
  { a: 'medicine', o: ['medecine', 'medicin', 'meddicine'] },
  { a: 'surprise', o: ['surprize', 'surrprise', 'surprizee'] },
  { a: 'potatoes', o: ['potatos', 'potatoe', 'pottatoes'] },
  { a: 'height', o: ['hieght', 'heigth', 'hight'] },
  { a: 'believe', o: ['beleive', 'believ', 'beleave'] },
  { a: 'beginning', o: ['begining', 'beginnig', 'begginning'] },
  { a: 'February', o: ['febuary', 'februrary', 'febrruary'] },
  { a: 'important', o: ['importent', 'improtant', 'importannt'] },
  { a: 'different', o: ['diferent', 'diffrent', 'diferrent'] },
  { a: 'possess', o: ['posess', 'posses', 'posesss'] },
  { a: 'straight', o: ['strait', 'straigth', 'straght'] },
]

export function gY3WLSpelling(rand: Rand): Question {
  const it = pick(rand, WL_SPELLING)
  return mcqE(rand, 'Which one is spelled right?', it.a, it.o)
}

const WL_ALPHA_POOL = ['address', 'believe', 'calendar', 'decide', 'exercise',
  'favourite', 'grammar', 'height', 'island', 'knowledge', 'library',
  'medicine', 'notice', 'ordinary', 'purpose', 'quarter', 'remember',
  'separate', 'straight', 'therefore', 'weight', 'appear', 'breathe',
  'century']

export function gY3WLAlphabet(rand: Rand): Question {
  const picked: string[] = []
  let guard = 0
  while (picked.length < 4 && guard < 80) {
    const w = pick(rand, WL_ALPHA_POOL)
    if (!picked.includes(w)) picked.push(w)
    guard++
  }
  picked.sort((a, b) => a.localeCompare(b))
  return orderQ('Put these words in alphabetical order', picked)
}

const WL_MEANINGS = [
  { w: 'library', a: 'a place with books', o: ['a place with tools', 'a place with food'] },
  { w: 'quarter', a: 'one of four equal parts', o: ['one of two equal parts', 'one of ten equal parts'] },
  { w: 'separate', a: 'not together', o: ['the same as', 'very close'] },
  { w: 'breathe', a: 'take air into your body', o: ['push a cart', 'write with a pen'] },
  { w: 'weight', a: 'how heavy something is', o: ['how long something is', 'how fast something goes'] },
  { w: 'recent', a: 'happening a short time ago', o: ['happening long ago', 'never happening'] },
  { w: 'purpose', a: 'the reason for something', o: ['the end of something', 'the name of something'] },
  { w: 'natural', a: 'made by nature, not people', o: ['made in a factory', 'made of glass'] },
  { w: 'strength', a: 'how strong you are', o: ['how tall you are', 'how old you are'] },
  { w: 'peculiar', a: 'strange or odd', o: ['very common', 'extremely big'] },
  { w: 'ancient', a: 'very old', o: ['very new', 'very small'] },
  { w: 'increase', a: 'get bigger or more', o: ['get smaller', 'stay the same'] },
]

export function gY3WLMeaning(rand: Rand): Question {
  const it = pick(rand, WL_MEANINGS)
  return mcqE(rand, `What does "${it.w}" mean?`, it.a, it.o)
}

const WL_PIC: { left: string; right: string }[] = [
  { left: 'library', right: '📖' }, { left: 'hospital', right: '🏥' },
  { left: 'school', right: PICTURE_BANK.school }, { left: 'castle', right: PICTURE_BANK.castle },
  { left: 'mountain', right: PICTURE_BANK.mountain }, { left: 'island', right: PICTURE_BANK.island },
  { left: 'bridge', right: PICTURE_BANK.bridge }, { left: 'beach', right: PICTURE_BANK.beach },
  { left: 'garden', right: PICTURE_BANK.garden }, { left: 'shop', right: PICTURE_BANK.shop },
  { left: 'road', right: PICTURE_BANK.road }, { left: 'house', right: PICTURE_BANK.house },
  { left: 'village', right: '🏘️' }, { left: 'forest', right: '🌲' },
]

export function gY3WLMatch(rand: Rand): Question {
  const pairs = shuffle(rand, WL_PIC).slice(0, 4)
  return matchQ(rand, 'Match each place to its picture', pairs)
}

/* ============= Unit 7 · Homophones & apostrophes ====================== */

const HOMOPHONE_ROWS = [
  { s: 'The ___ fell all night.', a: 'rain', o: ['rein', 'reign', 'plain'] },
  { s: 'We sat down for a meal. The ___ was tasty.', a: 'meat', o: ['meet', 'mist', 'mail'] },
  { s: 'I can ___ the birds singing.', a: 'hear', o: ['here', 'heel', 'heal'] },
  { s: 'Press the ___ to stop the car.', a: 'brake', o: ['break', 'bawl', 'bury'] },
  { s: 'Be careful, do not ___ the glass.', a: 'break', o: ['brake', 'grate', 'great'] },
  { s: 'The path was ___ and wide.', a: 'plain', o: ['plane', 'peace', 'piece'] },
  { s: 'Please keep ___ in the library.', a: 'peace', o: ['piece', 'plain', 'plane'] },
  { s: 'I have never ___ such a big castle.', a: 'seen', o: ['scene', 'sea', 'saw'] },
  { s: "I don't know ___ it will rain.", a: 'whether', o: ['weather', 'wheather', 'wheter'] },
  { s: 'Tie a ___ in the rope.', a: 'knot', o: ['not', 'knock', 'neat'] },
  { s: 'Send the ___ today.', a: 'mail', o: ['male', 'main', 'man'] },
  { s: 'The bus ___ is one pound.', a: 'fare', o: ['fair', 'fear', 'far'] },
  { s: "The lion's ___ was thick.", a: 'mane', o: ['main', 'man', 'many'] },
  { s: 'The cut will ___ soon.', a: 'heal', o: ['heel', 'held', 'help'] },
  { s: 'She won a gold ___.', a: 'medal', o: ['meddle', 'medel', 'meddal'] },
]

export function gY3Homophone(rand: Rand): Question {
  const it = pick(rand, HOMOPHONE_ROWS)
  return mcqE(rand, `Which word completes the sentence? ${it.s}`, it.a, it.o)
}

const HOMOPHONE_PAIRS: { left: string; right: string }[] = [
  { left: 'here', right: 'hear' }, { left: 'meat', right: 'meet' },
  { left: 'brake', right: 'break' }, { left: 'plain', right: 'plane' },
  { left: 'peace', right: 'piece' }, { left: 'weather', right: 'whether' },
  { left: 'knot', right: 'not' }, { left: 'mail', right: 'male' },
  { left: 'main', right: 'mane' }, { left: 'heel', right: 'heal' },
  { left: 'scene', right: 'seen' }, { left: 'fair', right: 'fare' },
  { left: 'berry', right: 'bury' }, { left: 'groan', right: 'grown' },
  { left: 'ball', right: 'bawl' }, { left: 'grate', right: 'great' },
  { left: 'medal', right: 'meddle' },
]

export function gY3HomophoneMatch(rand: Rand): Question {
  const pairs = shuffle(rand, HOMOPHONE_PAIRS).slice(0, 4)
  return matchQ(rand, 'Match each word to its homophone', pairs)
}

const POSSESSIVE = [
  { a: "The girls' coats were on the chair.", o: ["The girls coat's were on the chair.", "The girl's coats were on the chair."] },
  { a: "The boys' shoes were dirty.", o: ["The boys shoe's were dirty.", "The boy's shoes were dirty."] },
  { a: "The children's books were new.", o: ["The childrens' books were new.", "The children book's were new."] },
  { a: "My mum's car was red.", o: ["My mums' car was red.", "My mum car's was red."] },
  { a: "The men's hats were black.", o: ["The mens' hats were black.", "The man's hats were black."] },
  { a: "The women's bags were heavy.", o: ["The womens' bags were heavy.", "The woman's bags were heavy."] },
  { a: "The dogs' bowls were full.", o: ["The dogs bowl's were full.", "The dog's bowls were full."] },
  { a: "The babies' room was tidy.", o: ["The babys' room was tidy.", "The baby's room was tidy."] },
]

export function gY3ApostropheChoice(rand: Rand): Question {
  const it = pick(rand, POSSESSIVE)
  return mcqE(rand, 'Which sentence shows the possessive apostrophe correctly?', it.a, it.o)
}

const PLURAL_PAIRS: { left: string; right: string }[] = [
  { left: 'girl', right: 'girls' }, { left: 'boy', right: 'boys' },
  { left: 'baby', right: 'babies' }, { left: 'child', right: 'children' },
  { left: 'man', right: 'men' }, { left: 'mouse', right: 'mice' },
  { left: 'woman', right: 'women' }, { left: 'foot', right: 'feet' },
  { left: 'tooth', right: 'teeth' }, { left: 'leaf', right: 'leaves' },
  { left: 'potato', right: 'potatoes' }, { left: 'story', right: 'stories' },
]

export function gY3PluralPossess(rand: Rand): Question {
  const pairs = shuffle(rand, PLURAL_PAIRS).slice(0, 4)
  return matchQ(rand, 'Match each word to its plural', pairs)
}

/* ============ Unit 8 · Grammar: clauses & adverbials =================== */

const JOIN_ROWS = [
  { s: 'It rained ___ we stayed inside.', a: 'because' },
  { s: '___ you practice, you improve.', a: 'if' },
  { s: 'She smiled ___ she was tired.', a: 'although' },
  { s: 'We played ___ the rain stopped.', a: 'until' },
  { s: '___ lunch, we read our books.', a: 'during' },
  { s: 'We walked home ___ the sun set.', a: 'after' },
  { s: 'Hold the rope ___ I climb.', a: 'while' },
  { s: 'Come home ___ it gets dark.', a: 'before' },
  { s: 'We cheered ___ we won.', a: 'when' },
  { s: 'He stayed home ___ he was ill.', a: 'because' },
]
const JOIN_CHOICES = ['because', 'if', 'although', 'until', 'during', 'after', 'while', 'before', 'when']

export function gY3Conjunction(rand: Rand): Question {
  const it = pick(rand, JOIN_ROWS)
  return mcqE(rand, `Which word joins the sentence? ${it.s}`, it.a,
    pickOthers(rand, JOIN_CHOICES, it.a, 3))
}

const FRONTED = [
  { right: 'After lunch, we played outside.', plain: 'We played outside after lunch.' },
  { right: 'In the morning, the sun was bright.', plain: 'The sun was bright in the morning.' },
  { right: 'Suddenly, the door opened.', plain: 'The door opened suddenly.' },
  { right: 'With my friends, I built a tent.', plain: 'I built a tent with my friends.' },
  { right: 'Under the tree, the cat slept.', plain: 'The cat slept under the tree.' },
  { right: 'Because it rained, we went inside.', plain: 'We went inside because it rained.' },
]

export function gY3Fronted(rand: Rand): Question {
  const it = pick(rand, FRONTED)
  if (randInt(rand, 0, 1) === 0) {
    return mcqE(rand, 'Which sentence starts with a fronted adverbial?', it.right,
      pickOthers(rand, FRONTED.map((f) => f.plain), it.right, 3))
  }
  return mcqE(rand, 'Which sentence has the comma after the fronted adverbial?', it.right,
    pickOthers(rand, FRONTED.map((f) => f.plain), it.right, 3))
}

const PERFECT_ROWS = [
  { a: 'I have eaten my lunch.', o: ['I have ate my lunch.', 'I has eaten my lunch.'] },
  { a: 'She has written a story.', o: ['She has wrote a story.', 'She have written a story.'] },
  { a: 'We have seen that film.', o: ['We have saw that film.', 'We has seen that film.'] },
  { a: 'He has gone home.', o: ['He has went home.', 'He have gone home.'] },
  { a: 'They have made a cake.', o: ['They has made a cake.', 'They have make a cake.'] },
  { a: 'I have taken my book.', o: ['I has taken my book.', 'I have took my book.'] },
  { a: 'She has bought a coat.', o: ['She has buyed a coat.', 'She have bought a coat.'] },
  { a: 'We have brought our books.', o: ['We has brought our books.', 'We have brought our book.'] },
]
const PERFECT_WRONG = PERFECT_ROWS.flatMap((r) => r.o)

export function gY3PresentPerfect(rand: Rand): Question {
  const it = pick(rand, PERFECT_ROWS)
  return mcqE(rand, 'Which sentence uses have or has correctly?', it.a,
    pickOthers(rand, PERFECT_WRONG, it.a, 3))
}

const PRONOUN_ROWS = [
  { s: 'Mia ran. Mia jumped. Which word can replace the second Mia?', a: 'she', o: ['he', 'it', 'they'] },
  { s: 'Jack sat. Jack smiled. Which word can replace the second Jack?', a: 'he', o: ['she', 'it', 'they'] },
  { s: 'The dog barked. The dog ran. Which word can replace the second dog?', a: 'it', o: ['he', 'she', 'they'] },
  { s: 'Lucy and Ruby played. Lucy and Ruby laughed. Which word replaces both names?', a: 'they', o: ['he', 'she', 'it'] },
  { s: 'Sam and Leo read. Sam and Leo wrote. Which word replaces both names?', a: 'they', o: ['he', 'she', 'it'] },
  { s: 'Zara read. Zara answered. Which word can replace the second Zara?', a: 'she', o: ['he', 'it', 'they'] },
  { s: 'Tom and Hassan ran. Tom and Hassan won. Which word replaces both names?', a: 'they', o: ['he', 'she', 'it'] },
  { s: 'The cat slept. The cat was tired. Which word can replace the second cat?', a: 'it', o: ['he', 'she', 'they'] },
]

export function gY3Pronoun(rand: Rand): Question {
  const it = pick(rand, PRONOUN_ROWS)
  return mcqE(rand, it.s, it.a, it.o)
}

/* ===================== Unit 9 · Comprehension ========================== */

const FARM_STORY = story('On the Farm', ['🌾', '🐄', '🚜'], [
  'The farmer grows wheat in the field.',
  'The cows eat grass every morning.',
  'The tractor works when the sun shines.',
])
const STORM_STORY = story('The Storm', ['⛈️', '🏠', '🌧️'], [
  'Dark clouds covered the sky.',
  'The wind shook the old trees.',
  'The family stayed inside the house.',
])
const GARDEN_STORY = story('In the Garden', ['🌻', '🐝', '💧'], [
  'Sunflowers grow tall near the fence.',
  'Bees visit the flowers for nectar.',
  'Tom waters the plants after school.',
])

const RETRIEVE_TF = [
  { panel: FARM_STORY, st: 'The farmer grows wheat in the field.', a: true },
  { panel: FARM_STORY, st: 'The cows eat grass every morning.', a: true },
  { panel: FARM_STORY, st: 'The tractor works at night.', a: false },
  { panel: FARM_STORY, st: 'The farmer drives a red tractor.', a: false },
  { panel: STORM_STORY, st: 'Dark clouds covered the sky.', a: true },
  { panel: STORM_STORY, st: 'The family stayed inside the house.', a: true },
  { panel: STORM_STORY, st: 'The sun was shining brightly.', a: false },
  { panel: STORM_STORY, st: 'The trees fell down in the wind.', a: false },
  { panel: GARDEN_STORY, st: 'Bees visit the flowers for nectar.', a: true },
  { panel: GARDEN_STORY, st: 'Tom waters the plants after school.', a: true },
  { panel: GARDEN_STORY, st: 'Sunflowers grow near the pond.', a: false },
  { panel: GARDEN_STORY, st: 'Tom waters the plants before school.', a: false },
]

export function gY3Retrieve(rand: Rand): Question {
  const it = pick(rand, RETRIEVE_TF)
  return tfQ('Read the card. Does it say this?', it.st, it.a, { story: it.panel })
}

const FEEL_ROWS = [
  { s: 'Mia won the race and smiled. How did Mia feel?', a: 'proud', o: ['sad', 'lonely', 'scared'] },
  { s: 'Tom could not find his book anywhere. How did Tom feel?', a: 'confused', o: ['proud', 'excited', 'pleased'] },
  { s: 'The dark storm came at night. How did the child feel?', a: 'scared', o: ['pleased', 'proud', 'hungry'] },
  { s: 'Leo finished his big project. How did Leo feel?', a: 'excited', o: ['nervous', 'lonely', 'tired'] },
  { s: 'Ruby sat alone at lunch. How did Ruby feel?', a: 'lonely', o: ['excited', 'proud', 'pleased'] },
  { s: 'Sam read his poem to the class. How did Sam feel?', a: 'nervous', o: ['hungry', 'angry', 'calm'] },
  { s: 'Zara missed her gran and did not smile. How did Zara feel?', a: 'sad', o: ['happy', 'proud', 'excited'] },
  { s: 'Hassan had not eaten all day. How did Hassan feel?', a: 'hungry', o: ['pleased', 'calm', 'tired'] },
  { s: 'Emma opened her birthday present. How did Emma feel?', a: 'excited', o: ['scared', 'sad', 'angry'] },
  { s: 'Ben walked into the dark room alone. How did Ben feel?', a: 'scared', o: ['pleased', 'proud', 'hungry'] },
]

export function gY3InferFeelings(rand: Rand): Question {
  const it = pick(rand, FEEL_ROWS)
  return mcqE(rand, it.s, it.a, it.o)
}

const PREDICT_ROWS = [
  { s: 'The sky turned dark and the wind grew strong.', a: 'We ran inside the house.', o: ['We planted more flowers.', 'We ate ice cream outside.', 'We went swimming.'] },
  { s: 'Mia found a lost puppy in the park.', a: 'Mia took it home to look after it.', o: ['Mia ran away from the park.', 'Mia left it in the rain.', 'Mia gave it to the dog.'] },
  { s: 'The bell rang and the teacher smiled.', a: 'The class had worked hard.', o: ['The class went home early.', 'The teacher left the room.', 'It was time for lunch.'] },
  { s: 'There were big footprints in the snow.', a: 'Someone had walked past.', o: ['The sun came out again.', 'The snow turned to rain.', 'Nobody was outside.'] },
  { s: "Sam's cake was still in the oven.", a: 'Sam took the cake out to cool.', o: ['Sam threw the cake away.', 'The cake had gone cold.', 'Sam gave the cake to Ben.'] },
  { s: 'The boat rocked and the waves grew high.', a: 'We held on to the rope.', o: ['The sea became glass.', 'We sailed home fast.', 'The fish jumped into the boat.'] },
  { s: 'The library clock struck six.', a: 'It was time to go home.', o: ['It was time for school.', 'The library opened its doors.', 'The lights went out.'] },
  { s: 'There was a bright light in the sky.', a: 'It was a shooting star.', o: ['It was a rainy day.', 'The moon had disappeared.', 'Someone turned on a lamp.'] },
]

export function gY3PredictR(rand: Rand): Question {
  const it = pick(rand, PREDICT_ROWS)
  return mcqE(rand, `What happens next? ${it.s}`, it.a, it.o)
}

const IDEA_ROWS = [
  { p: 'Plants need light and water to grow. Farmers give their crops water when the sun is hot.', a: 'Plants need care to grow.', o: ['Farmers work only at night.', 'The sun is cold and wet.'] },
  { p: 'Mia forgot her lunch. Her friend Ben shared his sandwich. Mia smiled and said thank you.', a: 'Friends help each other.', o: ['Mia did not like sandwiches.', 'Ben was angry all day.'] },
  { p: 'The wind blew all morning. Doors banged and trees bent low. By lunchtime the sky was clear.', a: 'The storm passed quickly.', o: ['It rained all afternoon.', 'The wind never stopped.'] },
  { p: 'Tom tried the poem again and again. At the show his voice shook, but he remembered every word.', a: 'Trying again helped Tom.', o: ['Tom forgot the poem.', 'Tom did not try again.'] },
  { p: 'Rain fell for days. The river grew wide and covered the path. People waited inside for it to stop.', a: 'The river covered the path.', o: ['The sun dried the path.', 'People swam in the river.'] },
  { p: 'The museum was quiet. Ancient pots sat behind glass. A guide told stories about kings and queens.', a: 'The visit taught us about the past.', o: ['The museum sold ice cream.', 'The guide played loud music.'] },
]

export function gY3MainIdea(rand: Rand): Question {
  const it = pick(rand, IDEA_ROWS)
  return mcqE(rand, `What is the main idea of this paragraph? ${it.p}`, it.a, it.o)
}

const CONTEXT_ROWS = [
  { w: 'ancient', s: 'The ancient castle stood on the hill.', a: 'very old', o: ['very new', 'very small'] },
  { w: 'brave', s: 'The brave firefighter ran into the fire.', a: 'not scared', o: ['very scared', 'tired all day'] },
  { w: 'silent', s: 'The room was silent during the test.', a: 'very quiet', o: ['very loud', 'full of people'] },
  { w: 'huge', s: 'A huge shadow crossed the grass.', a: 'very big', o: ['very small', 'very thin'] },
  { w: 'separate', s: 'Put the red blocks separate from the blue ones.', a: 'not together', o: ['all together', 'on top'] },
  { w: 'peculiar', s: 'The peculiar smell came from the kitchen.', a: 'strange', o: ['nice and fresh', 'very common'] },
  { w: 'increase', s: 'The queue will increase at lunchtime.', a: 'get bigger', o: ['get smaller', 'stay quiet'] },
]

export function gY3WordContext(rand: Rand): Question {
  const it = pick(rand, CONTEXT_ROWS)
  return mcqE(rand, `What does "${it.w}" mean here? ${it.s}`, it.a, it.o)
}

const SPEAK_LINES = [
  'The wind blew through the tall trees.',
  'Mia read her poem to the whole class.',
  'The old castle stood on the hill.',
  'We planted seeds in the garden after lunch.',
  'Sam smiled when his friend arrived.',
  'The bright moon lit the dark path.',
  'Ben shared his story with the group.',
  'After the storm, the sky was clear again.',
]

export function gY3SpeakLine(rand: Rand): Question {
  return speakQ('Read the sentence out loud.', pick(rand, SPEAK_LINES), {
    hint: 'Speak slowly and clearly.',
  })
}

/* ========= Unit 10 · Composition, speech & performance ================= */

const PARA_SEQS: readonly (readonly string[])[] = [
  ['First we washed the fruit.', 'Then Mum cut it into pieces.', 'Finally we mixed it with ice cream.'],
  ['The bell rang for lunch.', 'We washed our hands.', 'Then we sat down to eat.'],
  ['It started to rain.', 'Ben opened his umbrella.', 'We ran inside the room.'],
  ['Sam put on his coat.', 'He locked the door.', 'He walked to the bus stop.'],
  ['The seed was planted in the mud.', 'Weeks later a green shoot appeared.', 'By summer the flower opened.'],
  ['Ruby watered the plants.', 'She counted the bright flowers.', 'She smiled at her work.'],
  ['Hassan found a map.', 'He followed the winding road.', 'At last he reached the village.'],
  ['The clock struck midnight.', 'The house was dark and quiet.', 'Everyone was fast asleep.'],
]

export function gY3ParaOrder(rand: Rand): Question {
  return orderQ('Put the sentences in order to make a paragraph', [...pick(rand, PARA_SEQS)])
}

const STORY_SEQS: readonly (readonly string[])[] = [
  ['A fox crept out of the woods.', 'It saw a fat hen by the fence.', 'The hen flapped away safely.'],
  ['Ruby planted a tiny seed.', 'She covered it with soft earth.', 'A green shoot came up soon.'],
  ['The ship left the harbour at dawn.', 'By noon dark clouds appeared.', 'The crew tied down the sails.'],
  ['Ben climbed the tall hill.', 'He looked across the valley.', 'He saw a silver lake below.'],
  ['The puppy barked at the stranger.', 'It wagged its tail and jumped up.', 'The stranger patted its head.'],
  ['Dark clouds gathered over the town.', 'The wind howled through the streets.', 'Then heavy rain fell in waves.'],
  ['Grandma baked warm bread for us.', 'The smell filled the kitchen.', 'We ate it with butter and jam.'],
  ['A red kite snagged on the branch.', 'Tails pulled the string gently.', 'The kite floated free into the sky.'],
]

export function gY3NarrativeOrder(rand: Rand): Question {
  return orderQ('Put the story events in order', [...pick(rand, STORY_SEQS)])
}

const SPEECH_ROWS = [
  { a: '"Hello!" waved Mia.', o: ['"hello!" waved Mia.', '"Hello! waved Mia.', 'Hello!" waved Mia.'] },
  { a: '"Where is my hat?" asked Ben.', o: ['"where is my hat?" asked Ben.', '"Where is my hat? asked Ben.', 'Where is my hat?" asked Ben.'] },
  { a: '"I can see the sea," said Tom.', o: ['"i can see the sea," said Tom.', '"I can see the sea. said Tom.', 'I can see the sea," said Tom.'] },
  { a: '"Look at the time!" cried Lucy.', o: ['"look at the time!" cried Lucy.', '"Look at the time! cried Lucy.', 'Look at the time!" cried Lucy.'] },
  { a: '"Do you like cake?" asked Ruby.', o: ['"do you like cake?" asked Ruby.', '"Do you like cake? asked Ruby.', 'Do you like cake?" asked Ruby.'] },
  { a: '"Wait for me," called Sam.', o: ['"wait for me," called Sam.', '"Wait for me. called Sam.', 'Wait for me," called Sam.'] },
  { a: '"What a big fish!" said Zara.', o: ['"what a big fish!" said Zara.', '"What a big fish! said Zara.', 'What a big fish!" said Zara.'] },
  { a: '"Help me lift it," said Hassan.', o: ['"help me lift it," said Hassan.', '"Help me lift it. said Hassan.', 'Help me lift it," said Hassan.'] },
]

export function gY3SpeechMarks(rand: Rand): Question {
  const it = pick(rand, SPEECH_ROWS)
  return mcqE(rand, 'Which line punctuates the speech correctly?', it.a, it.o)
}

const EDIT_TF = [
  { st: 'She went to the shop on Friday.', a: true },
  { st: 'She go to the shop on Friday.', a: false },
  { st: 'The boys were playing in the garden.', a: true },
  { st: 'The boys was playing in the garden.', a: false },
  { st: 'I have finished my homework.', a: true },
  { st: 'I has finished my homework.', a: false },
  { st: 'We was running in the park.', a: false },
  { st: 'We were running in the park.', a: true },
  { st: "He don't like broccoli.", a: false },
  { st: "He doesn't like broccoli.", a: true },
  { st: 'The dog runned across the road.', a: false },
  { st: 'The dog ran across the road.', a: true },
  { st: 'Their going to the library.', a: false },
  { st: "They're going to the library.", a: true },
  { st: 'The cat sat on the mat.', a: true },
  { st: 'The cat sets on the mat.', a: false },
]

export function gY3EditProof(rand: Rand): Question {
  const it = pick(rand, EDIT_TF)
  return tfQ('Is this sentence written correctly?', it.st, it.a, {
    hint: 'Read it slowly. Check the verb.',
  })
}

const POEM_PERFORM = [
  'How doth the little busy bee improve each shining hour',
  'Twinkle twinkle little star how I wonder what you are',
  'Baa baa black sheep have you any wool',
  'Jack and Jill went up the hill',
  'Rain rain go away come again another day',
  'Row row row your boat gently down the stream',
  'One two buckle my shoe three four shut the door',
  'Hickory dickory dock the mouse ran up the clock',
]

export function gY3PoemPerform(rand: Rand): Question {
  return speakQ('Read the poem line out loud with feeling.', pick(rand, POEM_PERFORM), {
    hint: 'Clap the beats as you read.',
  })
}

/* ====== Ending collector (challenge slot for the -tion unit) ========== */

const END_TILES = [
  { s: '-tion', d: ['-sion', '-cian', '-ssion'] },
  { s: '-sion', d: ['-tion', '-ture', '-cian'] },
  { s: '-ture', d: ['-sure', '-tion', '-sion'] },
  { s: '-gue', d: ['-que', '-tion', '-ture'] },
]

export function gY3CollectEnding(rand: Rand): Question {
  const it = pick(rand, END_TILES)
  const cells = shuffle(rand, [it.s, it.s, it.s, ...it.d])
  return {
    kind: 'tap-count',
    prompt: `Tap every time you see ${it.s}`,
    target: 3,
    targetEmoji: it.s,
    cells,
    hint: 'Read each ending on the tiles.',
  }
}


