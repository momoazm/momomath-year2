import type { Question, VisualSpec } from "../types"
import {
  ROCK_TYPES, SEASONS,
  mcqE, matchQ, orderQ, tfQ,
  pick, pickOthers, randInt, shuffle, type Gen, type Rand,
  makeLesson, unitDef,
} from "./helpers"

const ROCK_DESC: Record<typeof ROCK_TYPES[number], { look: string; example: string }> = {
  igneous: { look: "formed when melted rock cools", example: "granite" },
  sedimentary: { look: "made of tiny pieces pressed together", example: "sandstone" },
  metamorphic: { look: "rock changed by heat and pressure", example: "marble" },
}
const EXTRACT: Record<string, string> = {
  "from a quarry": "🪨", "from a deep mine": "⛏️", "from a riverbed": "🏞️", "from under the sea": "🌊",
  "from a sandy beach": "🏖️", "from a rocky cliff": "⛰️",
}
const TIMES_OF_DAY = ["morning", "midday", "afternoon", "evening"]
const SUN_SPOT = [
  "rises in the east", "is high in the middle of the sky", "is lower in the west",
  "gives us light and warmth", "looks like it travels from east to west",
  "is brightest around the middle of the day", "moves across the sky during the day",
  "is warmer at midday than at sunset", "shines so we can see outdoors in the daytime",
]
const CARE_ACTIONS = [
  "put rubbish in the bin", "pick up plastic on the playground",
  "plant a tree in the garden", "turn off the tap while brushing teeth",
  "switch off lights when leaving a room",
  "recycle bottles, paper and cans", "walk or cycle instead of taking the car",
  "reuse a bag instead of throwing it away",
]
const NOT_CARE = [
  "throw crisp packets on the ground", "leave the tap running",
  "chop down a forest for fun", "leave rubbish on the beach",
]
const ROCK_FACT_MCQS: { prompt: string; answer: string }[] = [
  { prompt: "Which rock type forms when melted rock cools down and becomes solid?", answer: "igneous" },
  { prompt: "Which rock type is made of tiny pieces pressed together over time?", answer: "sedimentary" },
  { prompt: "Which rock type is changed by great heat and pressure?", answer: "metamorphic" },
  { prompt: "Granite is an example of which rock type?", answer: "igneous" },
  { prompt: "Sandstone is an example of which rock type?", answer: "sedimentary" },
  { prompt: "Marble is an example of which rock type?", answer: "metamorphic" },
  { prompt: "A rock with layers of sand and shells pressed together is which type?", answer: "sedimentary" },
  { prompt: "Lava that cools on the surface makes which type of rock?", answer: "igneous" },
  { prompt: "Limestone changed by heat and pressure becomes which type of rock?", answer: "metamorphic" },
]
const ROCK_MATCH_STYLES: { prompt: string; pairs: { left: string; right: string }[] }[] = [
  {
    prompt: "Match the rock type to its example",
    pairs: ROCK_TYPES.map((t) => ({ left: t, right: ROCK_DESC[t].example })),
  },
  {
    prompt: "Match the rock type to how it is formed",
    pairs: ROCK_TYPES.map((t) => ({ left: t, right: ROCK_DESC[t].look })),
  },
]
const CARE_TF: { statement: string; answer: boolean }[] = [
  { statement: "Human activity (like dropping litter or cutting down trees) can HARM the environment.", answer: true },
  { statement: "Litter dropped in a river can harm fish and other animals.", answer: true },
  { statement: "Planting a tree helps the environment.", answer: true },
  { statement: "Recycling paper means fewer trees have to be cut down.", answer: true },
  { statement: "Leaving the tap running wastes clean water.", answer: true },
  { statement: "Switching off lights when you leave a room saves energy.", answer: true },
  { statement: "Picking up litter and putting it in a bin looks after our planet.", answer: true },
  { statement: "Burning all our rubbish is the best way to look after the planet.", answer: false },
  { statement: "Cutting down a forest gives animals more homes.", answer: false },
]
const SUN_PATHS: { prompt: string; items: string[]; audio: string }[] = [
  {
    prompt: "Trace the Sun's path across the sky from morning to evening",
    items: ["morning (eastern sky)", "midday (high in the sky)", "afternoon (western sky)", "evening (sets in the west)"],
    audio: "Order the Sun across the sky.",
  },
  {
    prompt: "Put the day in order from sunrise to sunset",
    items: ["sunrise in the east", "the Sun climbs higher", "highest point at midday", "the Sun sinks towards the west", "sunset below the western horizon"],
    audio: "Order the day from sunrise to sunset.",
  },
  {
    prompt: "Order these from the start of the day to the end of the day",
    items: ["morning", "midday", "afternoon", "evening"],
    audio: "Order the times of day.",
  },
  {
    prompt: "Put the Sun's journey in order, from when it first appears to when it disappears",
    items: ["appears in the east", "rises higher", "reaches its highest point", "moves down in the west", "sets below the horizon"],
    audio: "Order the Sun's journey.",
  },
]
const SEASON_SETS: { prompt: string; pairs: { left: string; right: string }[] }[] = [
  {
    prompt: "Match each SEASON to what you might see",
    pairs: [
      { left: "spring", right: "🌷 flowers bloom" }, { left: "summer", right: "☀️ hot and sunny" },
      { left: "autumn", right: "🍂 leaves fall" }, { left: "winter", right: "❄️ cold and icy" },
    ],
  },
  {
    prompt: "Match each SEASON to the weather you would expect",
    pairs: [
      { left: "spring", right: "mild with showers" }, { left: "summer", right: "hot and dry" },
      { left: "autumn", right: "cool and windy" }, { left: "winter", right: "cold and frosty" },
    ],
  },
  {
    prompt: "Match each SEASON to what you might wear",
    pairs: [
      { left: "spring", right: "a light jacket" }, { left: "summer", right: "a sun hat" },
      { left: "autumn", right: "a warm jumper" }, { left: "winter", right: "a coat and gloves" },
    ],
  },
  {
    prompt: "Match each SEASON to something you can do",
    pairs: [
      { left: "spring", right: "plant a seed" }, { left: "summer", right: "paddle in the sea" },
      { left: "autumn", right: "collect fallen leaves" }, { left: "winter", right: "build a snowman" },
    ],
  },
]

function gRockType(rand: Rand): Question {
  const t = pick(rand, ROCK_TYPES)
  const visual: VisualSpec = { type: "emoji-group", emojis: ["🪨", "🪨"] }
  if (rand() < 0.45) {
    return mcqE(rand, `Which type of rock is described? ${ROCK_DESC[t].look}`,
      t, pickOthers(rand, ROCK_TYPES as unknown as string[], t, 2), { visual },
    )
  }
  const f = pick(rand, ROCK_FACT_MCQS)
  return mcqE(rand, f.prompt, f.answer,
    pickOthers(rand, ROCK_TYPES as unknown as string[], f.answer, 2), { visual },
  )
}
function gRockExample(rand: Rand): Question {
  const style = pick(rand, ROCK_MATCH_STYLES)
  const howMany = randInt(rand, 2, 3)
  const pairs = shuffle(rand, style.pairs).slice(0, howMany)
  return matchQ(rand, style.prompt, pairs, { visual: { type: "emoji-group", emojis: ["🪨"] } })
}
function gExtract(rand: Rand): Question {
  const a = pick(rand, Object.keys(EXTRACT))
  return mcqE(rand, "Rocks are taken from the Earth in different ways. Which describes this one?",
    a, pickOthers(rand, Object.keys(EXTRACT), a, 3),
    { visual: { type: "emoji-group", emojis: [EXTRACT[a]] } },
  )
}
function gCare(rand: Rand): Question {
  return mcqE(rand, "Which action CARES for the environment?", pick(rand, CARE_ACTIONS), NOT_CARE, { visual: { type: "emoji-group", emojis: ["🌍", "🌱"] } })
}
function gCareTF(rand: Rand): Question {
  const t = pick(rand, CARE_TF)
  return tfQ("Earth care", t.statement, t.answer, { visual: { type: "emoji-group", emojis: ["🌍"] } })
}
function gSunMove(rand: Rand): Question {
  const path = pick(rand, SUN_PATHS)
  return orderQ(path.prompt, path.items, { audioText: path.audio, visual: { type: "emoji-group", emojis: ["☀️"] } })
}
function gSunSpot(rand: Rand): Question {
  return mcqE(rand, "Which statement about the Sun is TRUE during the day?", pick(rand, SUN_SPOT), ["it stays in the same spot all day", "it never moves at all"], { visual: { type: "emoji-group", emojis: ["☀️", "🌅"] } })
}
function gSeason(rand: Rand): Question {
  const set = pick(rand, SEASON_SETS)
  const howMany = randInt(rand, 2, 4)
  const pairs = shuffle(rand, set.pairs).slice(0, howMany)
  return matchQ(rand, set.prompt, pairs,
    { visual: { type: "emoji-group", emojis: ["🌷", "☀️", "🍂", "❄️"] } },
  )
}
function gTimeOfDay(rand: Rand): Question {
  const a = pick(rand, TIMES_OF_DAY)
  return mcqE(rand, `When the Sun is high overhead, which time of day is it most likely to be?`, a, pickOthers(rand, TIMES_OF_DAY, a, 3), { visual: { type: "emoji-group", emojis: ["☀️"] } })
}

const S6 = [gRockType, gRockExample, gExtract, gCare, gCareTF, gSunMove, gSunSpot, gSeason, gTimeOfDay]

const lessons = [
  makeLesson("s6l1", "Three Rock Types", ["2ESp.01"], "knuckles", "Rock solid!", "Rocks come in three main types: igneous, sedimentary and metamorphic. Each looks different.", [gRockType, gRockExample], gRockType),
  makeLesson("s6l2", "Where Rocks Come From", ["2ESp.02"], "tails", "Dig it!", "We dig rocks from quarries, mines, riverbeds and even under the sea!", [gExtract, gRockType], gExtract),
  makeLesson("s6l3", "Care for Our Planet", ["2ESp.03"], "cream", "Earth heroes!", "Human actions can hurt the planet: but small, smart choices protect it!", [gCare, gCareTF], gCare),
  makeLesson("s6l4", "The Sun in the Sky", ["2ESs.01"], "amy", "Look up!", "The Sun rises in the east, moves across the sky, and sets in the west.", [gSunMove, gSunSpot], gSunMove),
  makeLesson("s6l5", "Seasons of the Year", ["2ESp.03", "2ESs.01"], "shadow", "What season?", "Spring, summer, autumn, winter: each has its own weather and colours.", [gSeason, gTimeOfDay], gSeason),
]

const boss = makeLesson("s6boss", "Planet Earth Boss", ["2ESp.01-03", "2ESs.01"], "eggman", "BOSS TIME!", "Eggman is melting the ice caps! Match rocks, trace the Sun, and care for the planet to stop him.", [gRockType, gExtract, gCare, gSunMove, gSeason], gCare)

export const UNIT_S6 = unitDef("s6", 6, "Rocks & Our Planet", "Cambridge 2ESp (rock types, extraction, care) + 2ESs (Sun in the sky)", "#f97316", "🪨", [...lessons, boss])
