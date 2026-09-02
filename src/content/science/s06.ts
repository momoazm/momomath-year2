import type { Question } from '../types'
import {
  ROCK_TYPES, SEASONS,
  mcqE, matchQ, orderQ, tfQ,
  pick, pickOthers, shuffle, type Gen, type Rand,
  makeLesson, unitDef,
} from './helpers'

const ROCK_DESC: Record<typeof ROCK_TYPES[number], { look: string; example: string }> = {
  igneous: { look: 'formed when melted rock cools — shiny crystals inside', example: 'granite' },
  sedimentary: { look: 'made of tiny pieces pressed together — you can see layers', example: 'sandstone' },
  metamorphic: { look: 'rock that was changed by heat and pressure — often with bands', example: 'marble' },
}
const EXTRACT: Record<string, string> = {
  'from a quarry': '🪨', 'from a deep mine': '⛏️', 'from a riverbed': '🏞️', 'from under the sea': '🌊',
}
const TIMES_OF_DAY = ['morning', 'midday', 'afternoon', 'evening']
const SUN_SPOT = ['rises in the east', 'is high in the middle of the sky', 'is lower in the west']
const CARE_ACTIONS = [
  'put rubbish in the bin', 'pick up plastic on the playground',
  'plant a tree in the garden', 'turn off the tap while brushing teeth',
  'switch off lights when leaving a room',
]
const NOT_CARE = [
  'throw crisp packets on the ground', 'leave the tap running',
  'chop down a forest for fun', 'leave rubbish on the beach',
]

function gRockType(rand: Rand): Question {
  const t = pick(rand, ROCK_TYPES)
  return mcqE(rand, `Which type of rock is described? "${ROCK_DESC[t].look}"`,
    t, pickOthers(rand, ROCK_TYPES as unknown as string[], t, 2),
    { visual: { type: 'emoji-group', emojis: ['🪨', '🪨'] } },
  )
}
function gRockExample(rand: Rand): Question {
  const t = pick(rand, ROCK_TYPES)
  return matchQ(rand, 'Match the rock type to its example',
    ROCK_TYPES.map((k) => ({ left: k, right: ROCK_DESC[k].example })),
    { visual: { type: 'emoji-group', emojis: ['🪨'] } },
  )
}
function gExtract(rand: Rand): Question {
  const a = pick(rand, Object.keys(EXTRACT))
  return mcqE(rand, 'Rocks are extracted from the Earth in different ways. Which is it?',
    a, pickOthers(rand, Object.keys(EXTRACT), a, 3),
    { visual: { type: 'emoji-group', emojis: [EXTRACT[a]] } },
  )
}
function gCare(rand: Rand): Question {
  return mcqE(rand, 'Which action CARES for the environment?', pick(rand, CARE_ACTIONS), NOT_CARE, { visual: { type: 'emoji-group', emojis: ['🌍', '🌱'] } })
}
function gCareTF(rand: Rand): Question {
  return tfQ('Earth care', 'Human activity (like dropping litter or cutting down trees) can HARM the environment.', true, { visual: { type: 'emoji-group', emojis: ['🌍'] } })
}
function gSunMove(rand: Rand): Question {
  return orderQ('Trace the Sun\'s path across the sky from morning to evening',
    ['morning (eastern sky)', 'midday (high in the sky)', 'afternoon (western sky)', 'evening (sets in the west)'],
    { visual: { type: 'emoji-group', emojis: ['☀️'] } },
  )
}
function gSunSpot(rand: Rand): Question {
  return mcqE(rand, 'Which statement about the Sun is TRUE during the day?', pick(rand, SUN_SPOT), ['it stays in the same spot all day', 'it never moves at all'], { visual: { type: 'emoji-group', emojis: ['☀️', '🌅'] } })
}
function gSeason(rand: Rand): Question {
  return matchQ(rand, 'Match each SEASON to what you might see',
    [
      { left: 'spring', right: '🌷 flowers bloom' }, { left: 'summer', right: '☀️ hot and sunny' },
      { left: 'autumn', right: '🍂 leaves fall' }, { left: 'winter', right: '❄️ cold and icy' },
    ], { visual: { type: 'emoji-group', emojis: ['🌷', '☀️', '🍂', '❄️'] } },
  )
}
function gTimeOfDay(rand: Rand): Question {
  const a = pick(rand, TIMES_OF_DAY)
  return mcqE(rand, `When the Sun is high overhead, which time of day is it most likely to be?`, a, pickOthers(rand, TIMES_OF_DAY, a, 3), { visual: { type: 'emoji-group', emojis: ['☀️'] } })
}

const S6 = [gRockType, gRockExample, gExtract, gCare, gCareTF, gSunMove, gSunSpot, gSeason, gTimeOfDay]

const lessons = [
  makeLesson('s6l1', 'Three Rock Types', ['2ESp.01'], 'knuckles', 'Rock solid!', 'Rocks come in three types — igneous, sedimentary and metamorphic.', [gRockType, gRockExample], gRockType),
  makeLesson('s6l2', 'Where Rocks Come From', ['2ESp.02'], 'tails', 'Dig it!', 'We dig rocks from quarries, mines, riverbeds and even under the sea!', [gExtract, gRockType], gExtract),
  makeLesson('s6l3', 'Care for Our Planet', ['2ESp.03'], 'cream', 'Earth heroes!', 'Human actions can hurt the planet — but small, smart choices protect it!', [gCare, gCareTF], gCare),
  makeLesson('s6l4', 'The Sun in the Sky', ['2ESs.01'], 'amy', 'Look up!', 'The Sun rises in the east, moves across the sky, and sets in the west.', [gSunMove, gSunSpot], gSunMove),
  makeLesson('s6l5', 'Seasons of the Year', ['2ESp.03', '2ESs.01'], 'shadow', 'What season?', 'Spring, summer, autumn, winter — each has its own weather and colours.', [gSeason, gTimeOfDay], gSeason),
]

const boss = makeLesson('s6boss', 'Planet Earth Boss', ['2ESp.01-03', '2ESs.01'], 'eggman', 'BOSS TIME!', 'Eggman is melting the ice caps! Match rocks, trace the Sun, and care for the planet to stop him.', [gRockType, gExtract, gCare, gSunMove, gSeason], gCare)

export const UNIT_S6 = unitDef('s6', 6, 'Rocks & Our Planet', 'Cambridge 2ESp (rock types, extraction, care) + 2ESs (Sun in the sky)', '#f97316', '🪨', [...lessons, boss])
