import type { Question, UnitDef } from '../types'
import {
  PICTURE_BANK,
  buildDe,
  buildEn,
  makeLesson,
  matchDeEn,
  matchQ,
  mcqDeToEn,
  mcqEnToDe,
  mcqE,
  pick,
  say,
  shuffle,
  tfQ,
  unitDef,
  type Rand,
} from './helpers'

const ANIMALS = [
  { de: 'der Frosch', bare: 'Frosch', art: 'der', en: 'frog', pic: PICTURE_BANK.frosch },
  { de: 'die Ente', bare: 'Ente', art: 'die', en: 'duck', pic: PICTURE_BANK.ente },
  { de: 'die Katze', bare: 'Katze', art: 'die', en: 'cat', pic: PICTURE_BANK.katze },
  { de: 'der Hund', bare: 'Hund', art: 'der', en: 'dog', pic: PICTURE_BANK.hund },
  { de: 'das Pferd', bare: 'Pferd', art: 'das', en: 'horse', pic: PICTURE_BANK.pferd },
  { de: 'die Kuh', bare: 'Kuh', art: 'die', en: 'cow', pic: PICTURE_BANK.kuh },
  { de: 'das Schaf', bare: 'Schaf', art: 'das', en: 'sheep', pic: PICTURE_BANK.schaf },
  { de: 'die Maus', bare: 'Maus', art: 'die', en: 'mouse', pic: PICTURE_BANK.maus },
  { de: 'der Hase', bare: 'Hase', art: 'der', en: 'rabbit', pic: PICTURE_BANK.hase },
  { de: 'der Bär', bare: 'Bär', art: 'der', en: 'bear', pic: PICTURE_BANK.bär },
  { de: 'der Löwe', bare: 'Löwe', art: 'der', en: 'lion', pic: PICTURE_BANK.löwe },
  { de: 'der Affe', bare: 'Affe', art: 'der', en: 'monkey', pic: PICTURE_BANK.affe },
]

function gAnimalPicture(rand: Rand): Question {
  const item = pick(rand, ANIMALS)
  const others = ANIMALS.filter((a) => a.de !== item.de).map((a) => a.de)
  return mcqE(rand, 'Welches Tier ist das?', item.de, others, {
    visual: { type: 'emoji-group', emojis: [item.pic] },
    ...say(item.de),
  })
}

function gAnimalMatch(rand: Rand): Question {
  const pairs = shuffle(rand, ANIMALS.map((a) => ({ left: a.de, right: a.pic }))).slice(0, 4)
  return matchQ(rand, 'Match the animal to its picture', pairs)
}

function gArticleMatch(rand: Rand): Question {
  const trio = shuffle(rand, ANIMALS).slice(0, 3)
  // Both sides unique: picture ↔ full article+noun. The article frame is the
  // skill being trained; the picture keeps every left distinct.
  const pairs = trio.map((a) => ({ left: a.pic, right: `${a.art} ${a.bare}` }))
  return {
    kind: 'match',
    prompt: 'Which article fits? der / die / das',
    pairs: shuffle(rand, pairs),
    hint: 'Say the whole thing together: der Frosch, die Ente, das Pferd — learn each word WITH its little front word!',
  }
}

function gHearAnimal(rand: Rand): Question {
  const item = pick(rand, ANIMALS)
  const others = ANIMALS.filter((a) => a.de !== item.de).map((a) => a.de)
  return mcqE(rand, 'Tap the animal you hear', item.de, others, say(item.de))
}

const ZOO_TF = [
  { s: 'Felix Frosch comes from Zoo Berlin.', a: true },
  { s: 'Franzi Ente is a frog.', a: false },
  { s: '“Hund” means cat.', a: false },
  { s: '“Ente” means duck.', a: true },
]

function gZooTrueFalse(rand: Rand): Question {
  const item = pick(rand, ZOO_TF)
  return tfQ('True or false?', item.s, item.a)
}

/* ----- Duolingo-style EN ⇄ DE: both directions + sentence builds ----- */
const ANIMAL_GLOSS = ANIMALS.map((a) => ({ de: a.de, en: a.en }))

function gAnimalDeToEn(rand: Rand): Question {
  return mcqDeToEn(rand, ANIMAL_GLOSS)
}

function gAnimalEnToDe(rand: Rand): Question {
  return mcqEnToDe(rand, ANIMAL_GLOSS)
}

function gAnimalMatchDeEn(rand: Rand): Question {
  return matchDeEn(rand, ANIMAL_GLOSS, 'Match the animal: German to English')
}

function gBuildAnimalDe(rand: Rand): Question {
  const item = pick(rand, ANIMALS)
  return buildDe(`This is the ${item.en}.`, ['Das', 'ist', item.art, `${item.bare}.`])
}

function gBuildAnimalEn(rand: Rand): Question {
  const item = pick(rand, ANIMALS)
  return buildEn(`Das ist ${item.art} ${item.bare}.`, ['This', 'is', 'the', `${item.en}.`])
}

const g5l1 = makeLesson(
  'g5l1',
  'Besuch aus Deutschland',
  ['4Vl.01', '4Rm.01'],
  'tails',
  'Zoo Berlin!',
  'Felix and Franzi bring friends from Zoo Berlin. Meet every animal WITH its article!',
  [gAnimalPicture, gAnimalMatch, gAnimalDeToEn, gAnimalEnToDe],
)

const g5l2 = makeLesson(
  'g5l2',
  'der die das',
  ['4Gr.01', '4Rm.01'],
  'shadow',
  'Artikel-Alarm!',
  'German nouns wear der, die or das. Match each bare noun to its article frame!',
  [gArticleMatch, gAnimalPicture, gAnimalMatchDeEn, gBuildAnimalDe],
)

const g5l3 = makeLesson(
  'g5l3',
  'Tierstimmen',
  ['4Lm.01', '4Sc.01'],
  'sonic',
  'Hör zu!',
  'Listen and sort the zoo. Tap the animal you hear, then prove the zoo facts!',
  [gHearAnimal, gZooTrueFalse, gAnimalDeToEn, gBuildAnimalEn],
)

const g5boss = makeLesson(
  'g5boss',
  'Tier Boss',
  ['4Gr.01', '4Vl.01'],
  'eggman',
  'BOSS TIME!',
  'Animals plus articles — tame the Tier Boss like a true zookeeper!',
  [gAnimalMatchDeEn, gArticleMatch, gBuildAnimalDe, gBuildAnimalEn],
  gAnimalEnToDe,
)

export const UNIT_G5: UnitDef = unitDef(
  'g5',
  5,
  'Tiere',
  'Deutsch extra · animals, der/die/das articles',
  '#0ea5e9',
  '🐸',
  [g5l1, g5l2, g5l3, g5boss],
)
