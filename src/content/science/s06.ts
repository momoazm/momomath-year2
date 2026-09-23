import type { Question } from "../types"
import {
  ROCK_TYPES, SEASONS,
  mcqE, matchQ, orderQ, tfQ,
  pick, pickOthers, shuffle, type Gen, type Rand,
  makeLesson, unitDef,
} from "./helpers"

const ROCK_DESC: Record<typeof ROCK_TYPES[number], { look: string; example: string }> = {
  igneous: { look: "formed when melted rock cools", example: "granite" },
  sedimentary: { look: "made of tiny pieces pressed together", example: "sandstone" },
  metamorphic: { look: "rock changed by heat and pressure", example: "marble" },
}
const EXTRACT: Record<string, string> = {
  "from a quarry": "🪨", "from a deep mine": "⛏️", "from a riverbed": "🏞️", "from under the sea": "🌊",
}
const TIMES_OF_DAY = ["morning", "midday", "afternoon", "evening"]
const SUN_SPOT = [
  "rises in the east", "is high in the middle of the sky", "is lower in the west",
  "appears to move across the sky", "sets in the west at the end of the day",
]
const CARE_ACTIONS = [
  "put rubbish in the bin", "pick up plastic on the playground",
  "plant a tree in the garden", "turn off the tap while brushing teeth",
  "switch off lights when leaving a room", "recycle paper and cardboard",
  "walk or cycle instead of driving short trips",
]
const NOT_CARE = [
  "throw crisp packets on the ground", "leave the tap running",
  "chop down a forest for fun", "leave rubbish on the beach",
  "leave every light on at home", "pour oil down the sink",
]
const ROCK_EXTRA: Record<string, { look: string; example: string }> = {
  limestone: { look: "made from shells and coral pressed together", example: "chalk" },
  slate: { look: "metamorphic rock that splits into flat sheets", example: "roof tile stone" },
  obsidian: { look: "volcanic glass cooled very quickly", example: "black volcanic glass" },
}
const ALL_ROCKS: Record<string, { look: string; example: string }> = { ...ROCK_DESC, ...ROCK_EXTRA }
const ROCK_CATEGORY: Record<string, string> = {
  igneous: "igneous", obsidian: "igneous",
  sedimentary: "sedimentary", limestone: "sedimentary",
  metamorphic: "metamorphic", slate: "metamorphic",
}
const ROCK_CATEGORIES = ["igneous", "sedimentary", "metamorphic"]

function gRockType(rand: Rand): Question {
  const t = pick(rand, Object.keys(ALL_ROCKS))
  const describe = ALL_ROCKS[t]
  const category = ROCK_CATEGORY[t] ?? "igneous"
  return mcqE(rand, `Which type of rock is described? ${describe.look}`,
    category, ROCK_CATEGORIES.filter((c) => c !== category),
    { visual: { type: "emoji-group", emojis: ["🪨", "🪨"] } },
  )
}
function gRockExample(rand: Rand): Question {
  const t = pick(rand, ROCK_TYPES)
  return matchQ(rand, "Match the rock type to its example",
    [{ left: t, right: ROCK_DESC[t].example },
     ...pickOthers(rand, ROCK_TYPES, t, 2).map((k) => ({ left: k, right: ROCK_DESC[k].example }))],
    { visual: { type: "emoji-group", emojis: ["🪨"] } },
  )
}
function gRockDescribePair(rand: Rand): Question {
  const keys = Object.keys(ALL_ROCKS)
  const a = pick(rand, keys)
  const b = pickOthers(rand, keys, a, 1)[0]
  if (!b) return gRockExample(rand)
  const pairs = [
    { left: ALL_ROCKS[a].look, right: ALL_ROCKS[a].example },
    { left: ALL_ROCKS[b].look, right: ALL_ROCKS[b].example },
    { left: `clue about ${ROCK_CATEGORY[a] ?? "igneous"} rocks`, right: ROCK_CATEGORY[a] ?? "igneous" },
  ]
  return matchQ(rand, "Match each rock clue to the rock it describes", pairs,
    { visual: { type: "emoji-group", emojis: ["🪨", "🔍"] } },
  )
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
const EARTH_TF: { text: string; ok: boolean }[] = [
  { text: "Human activity (like dropping litter or cutting down trees) can HARM the environment.", ok: true },
  { text: "Recycling paper and plastic helps care for the planet.", ok: true },
  { text: "Cutting down a whole forest for fun is good for wildlife.", ok: false },
  { text: "Pollution in rivers can harm fish and other animals.", ok: true },
  { text: "Saving energy at home uses fewer resources.", ok: true },
  { text: "Litter on the beach never affects sea animals.", ok: false },
]
function gCareTF(rand: Rand): Question {
  const line = pick(rand, EARTH_TF)
  return tfQ("Earth care", line.text, line.ok, { visual: { type: "emoji-group", emojis: ["🌍"] } })
}
const SUN_PATHS: { label: string; items: string[] }[] = [
  {
    label: "Trace the Sun's path across the sky from morning to evening",
    items: ["morning (eastern sky)", "midday (high in the sky)", "afternoon (western sky)", "evening (sets in the west)"],
  },
  {
    label: "Put the day in order from when the Sun rises",
    items: ["sunrise (east)", "late morning", "sunset (west)", "night"],
  },
  {
    label: "Order these times from earliest to latest",
    items: ["early morning", "lunchtime", "after school", "bedtime"],
  },
  {
    label: "Order a sunny day from start to finish",
    items: ["dawn", "morning break", "afternoon lesson", "sunset"],
  },
  {
    label: "Put these sky moments in time order",
    items: ["first light", "high noon", "golden hour", "starry night"],
  },
]
function gSunMove(rand: Rand): Question {
  const p = pick(rand, SUN_PATHS)
  return orderQ(p.label, p.items, { visual: { type: "emoji-group", emojis: ["☀️"] } })
}
const SUN_SPOT_MCQ: { answer: string; wrong: string[] }[] = [
  { answer: "rises in the east", wrong: ["it stays in the same spot all day", "it never moves at all"] },
  { answer: "is high in the middle of the sky", wrong: ["it stays in the same spot all day", "it never moves at all"] },
  { answer: "is lower in the west", wrong: ["it stays in the same spot all day", "it never moves at all"] },
  { answer: "appears to move across the sky", wrong: ["it stays in the same spot all day", "it never moves at all"] },
  { answer: "sets in the west at the end of the day", wrong: ["it stays in the same spot all day", "it never moves at all"] },
  { answer: "gives us daylight", wrong: ["it stays in the same spot all day", "it never moves at all"] },
  { answer: "rises again the next morning", wrong: ["it stays in the same spot all day", "it never moves at all"] },
]
function gSunSpot(rand: Rand): Question {
  const s = pick(rand, SUN_SPOT_MCQ)
  return mcqE(rand, "Which statement about the Sun is TRUE during the day?", s.answer, s.wrong, { visual: { type: "emoji-group", emojis: ["☀️", "🌅"] } })
}
const SEASON_SETS: { pairs: { left: string; right: string }[]; emojis: string[] }[] = [
  {
    pairs: [
      { left: "spring", right: "🌷 flowers bloom" }, { left: "summer", right: "☀️ hot and sunny" },
      { left: "autumn", right: "🍂 leaves fall" }, { left: "winter", right: "❄️ cold and icy" },
    ],
    emojis: ["🌷", "☀️", "🍂", "❄️"],
  },
  {
    pairs: [
      { left: "spring", right: "baby animals born" }, { left: "summer", right: "long sunny days" },
      { left: "autumn", right: "harvest and shorter days" }, { left: "winter", right: "frost and warm coats" },
    ],
    emojis: ["🐣", "🌞", "🌾", "🧥"],
  },
  {
    pairs: [
      { left: "spring", right: "plant seeds" }, { left: "summer", right: "go swimming" },
      { left: "autumn", right: "pick apples" }, { left: "winter", right: "wear a scarf" },
    ],
    emojis: ["🌱", "🏊", "🍎", "🧣"],
  },
  {
    pairs: [
      { left: "spring", right: "rain showers help plants" }, { left: "summer", right: "the longest days" },
      { left: "autumn", right: "leaves change colour" }, { left: "winter", right: "the shortest days" },
    ],
    emojis: ["🌧️", "🌞", "🍁", "黑夜"],
  },
]
function gSeason(rand: Rand): Question {
  const set = pick(rand, SEASON_SETS)
  return matchQ(rand, "Match each SEASON to what you might see", set.pairs, { visual: { type: "emoji-group", emojis: set.emojis } })
}
function gTimeOfDay(rand: Rand): Question {
  const a = pick(rand, TIMES_OF_DAY)
  return mcqE(rand, `When the Sun is high overhead, which time of day is it most likely to be?`, a, pickOthers(rand, TIMES_OF_DAY, a, 3), { visual: { type: "emoji-group", emojis: ["☀️"] } })
}

const S6 = [gRockType, gRockExample, gExtract, gCare, gCareTF, gSunMove, gSunSpot, gSeason, gTimeOfDay]

const lessons = [
  makeLesson("s6l1", "Three Rock Types", ["2ESp.01"], "knuckles", "Rock solid!", "Rocks come in three main types: igneous, sedimentary and metamorphic. Each looks different.", [gRockType, gRockExample, gRockDescribePair, gExtract], gRockType),
  makeLesson("s6l2", "Where Rocks Come From", ["2ESp.02"], "tails", "Dig it!", "We dig rocks from quarries, mines, riverbeds and even under the sea!", [gExtract, gRockType, gRockDescribePair, gRockExample, gCare], gExtract),
  makeLesson("s6l3", "Care for Our Planet", ["2ESp.03"], "cream", "Earth heroes!", "Human actions can hurt the planet: but small, smart choices protect it!", [gCare, gCareTF, gTimeOfDay], gCare),
  makeLesson("s6l4", "The Sun in the Sky", ["2ESs.01"], "amy", "Look up!", "The Sun rises in the east, moves across the sky, and sets in the west.", [gSunMove, gSunSpot, gTimeOfDay, gSeason, gCareTF], gSunMove),
  makeLesson("s6l5", "Seasons of the Year", ["2ESp.03", "2ESs.01"], "shadow", "What season?", "Spring, summer, autumn, winter: each has its own weather and colours.", [gSeason, gTimeOfDay, gSunSpot, gCareTF, gSunMove], gSeason),
]

const boss = makeLesson("s6boss", "Planet Earth Boss", ["2ESp.01-03", "2ESs.01"], "eggman", "BOSS TIME!", "Eggman is melting the ice caps! Match rocks, trace the Sun, and care for the planet to stop him.", [gRockType, gExtract, gCare, gSunMove, gSeason, gSunSpot, gCareTF], gCare)

export const UNIT_S6 = unitDef("s6", 6, "Rocks & Our Planet", "Cambridge 2ESp (rock types, extraction, care) + 2ESs (Sun in the sky)", "#f97316", "🪨", [...lessons, boss])
