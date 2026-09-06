import type { Question, UnitDef } from '../types'
import {
  PICTURE_BANK,
  makeLesson,
  matchQ,
  mcqE,
  pick,
  say,
  shuffle,
  tfQ,
  unitDef,
  type Rand,
} from './helpers'

const ANIMALS = [
  { de: 'der Frosch', bare: 'Frosch', art: 'der', pic: PICTURE_BANK.frosch },
  { de: 'die Ente', bare: 'Ente', art: 'die', pic: PICTURE_BANK.ente },
  { de: 'die Katze', bare: 'Katze', art: 'die', pic: PICTURE_BANK.katze },
  { de: 'der Hund', bare: 'Hund', art: 'der', pic: PICTURE_BANK.hund },
  { de: 'das Pferd', bare: 'Pferd', art: 'das', pic: PICTURE_BANK.pferd },
  { de: 'die Kuh', bare: 'Kuh', art: 'die', pic: PICTURE_BANK.kuh },
  { de: 'das Schaf', bare: 'Schaf', art: 'das', pic: PICTURE_BANK.schaf },
  { de: 'die Maus', bare: 'Maus', art: 'die', pic: PICTURE_BANK.maus },
  { de: 'der Hase', bare: 'Hase', art: 'der', pic: PICTURE_BANK.hase },
  { de: 'der Bär', bare: 'Bär', art: 'der', pic: PICTURE_BANK.bär },
  { de: 'der Löwe', bare: 'Löwe', art: 'der', pic: PICTURE_BANK.löwe },
  { de: 'der Affe', bare: 'Affe', art: 'der', pic: PICTURE_BANK.affe },
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
    hint: 'der = masculine, die = feminine, das = neuter. Learn each noun WITH its article!',
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
  { s: '“der, die, das” all mean “the”.', a: true },
  { s: '“die Katze” needs no article.', a: false },
]

function gZooTrueFalse(rand: Rand): Question {
  const item = pick(rand, ZOO_TF)
  return tfQ('True or false?', item.s, item.a)
}

const g5l1 = makeLesson(
  'g5l1',
  'Besuch aus Deutschland',
  ['4Vl.01', '4Rm.01'],
  'tails',
  'Zoo Berlin!',
  'Felix and Franzi bring friends from Zoo Berlin. Meet every animal WITH its article!',
  [gAnimalPicture, gAnimalMatch],
)

const g5l2 = makeLesson(
  'g5l2',
  'der die das',
  ['4Gr.01', '4Rm.01'],
  'shadow',
  'Artikel-Alarm!',
  'German nouns wear der, die or das. Match each bare noun to its article frame!',
  [gArticleMatch, gAnimalPicture],
)

const g5l3 = makeLesson(
  'g5l3',
  'Tierstimmen',
  ['4Lm.01', '4Sc.01'],
  'sonic',
  'Hör zu!',
  'Listen and sort the zoo. Tap the animal you hear, then prove the zoo facts!',
  [gHearAnimal, gZooTrueFalse],
)

const g5boss = makeLesson(
  'g5boss',
  'Tier Boss',
  ['4Gr.01', '4Vl.01'],
  'eggman',
  'BOSS TIME!',
  'Animals plus articles — tame the Tier Boss like a true zookeeper!',
  [gAnimalMatch, gArticleMatch, gHearAnimal, gZooTrueFalse],
  gAnimalPicture,
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
