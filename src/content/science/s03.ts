import type { Question, VisualSpec } from "../types"
import {
  LIVING_BANK, HABITAT_BANK, ANIMAL_LIFE_CYCLES,
  mcqE, matchQ, orderQ, tfQ,
  pick, pickOthers, shuffle, type Gen, type Rand,
  makeLesson, unitDef,
} from "./helpers"

const NEEDS = ["water", "food", "air", "shelter"]
const NOT_NEEDS = ["toy", "a television", "a bicycle", "a computer game"]
const ADAPTATION_PAIRS: { animal: string; trait: string; explains: string }[] = [
  { animal: "polar bear", trait: "thick fur", explains: "stays warm in cold snow" },
  { animal: "frog", trait: "webbed feet", explains: "swims well in water" },
  { animal: "eagle", trait: "sharp talons", explains: "catches prey" },
  { animal: "camel", trait: "long eyelashes", explains: "blocks desert sand" },
  { animal: "duck", trait: "oily feathers", explains: "stays dry in water" },
  { animal: "seal", trait: "thick blubber", explains: "stays warm in freezing water" },
  { animal: "rabbit", trait: "long ears", explains: "hears predators coming from far away" },
  { animal: "fish", trait: "gills", explains: "takes in oxygen from the water" },
  { animal: "chameleon", trait: "changing skin colour", explains: "hides from hungry predators" },
]
const NEEDS_TF_EXTRA: { statement: string; answer: boolean }[] = [
  { statement: "Plants need light from the Sun to grow.", answer: true },
  { statement: "Every living thing needs air to stay alive.", answer: true },
  { statement: "A seed will not sprout if it never gets any water.", answer: true },
  { statement: "Living things need food so they have energy to move.", answer: true },
  { statement: "Plants make their own food using light from the Sun.", answer: true },
  { statement: "Seeds need warmth and water before they sprout.", answer: true },
  { statement: "A rock is alive because it needs water to survive.", answer: false },
  { statement: "Animals can live with no air at all for a whole year.", answer: false },
  { statement: "A plant kept in a completely dark cupboard will not stay healthy.", answer: true },
  { statement: "Fish do not need water to live.", answer: false },
]
const PLANT_NEED_MCQS: { prompt: string; answer: string; wrong: string[]; emojis: string[] }[] = [
  {
    prompt: "What do plants need to grow (besides air and water)?",
    answer: "sunlight", wrong: ["snowfall", "cement", "melted chocolate"], emojis: ["🌱", "☀️"],
  },
  {
    prompt: "Where do most garden plants grow best?",
    answer: "in soil", wrong: ["under a bed", "inside a closed tin", "on top of a fridge"], emojis: ["🌱", "🪴"],
  },
  {
    prompt: "What do the roots of a plant do?",
    answer: "take in water from the soil", wrong: ["change the leaf colour", "lift the plant into the sky"], emojis: ["🌱", "💧"],
  },
  {
    prompt: "Why do plants need water?",
    answer: "to stay healthy and grow", wrong: ["to become heavier than a car", "to turn the leaves blue"], emojis: ["🌱", "💧"],
  },
  {
    prompt: "What job do the leaves do for a plant?",
    answer: "catch the light the plant uses to make food", wrong: ["drink from a cup", "keep the soil warm"], emojis: ["🌿", "☀️"],
  },
  {
    prompt: "Which things help a seedling grow into a strong plant?",
    answer: "light, water and warm soil", wrong: ["ice cubes and darkness", "plastic and metal"], emojis: ["🌱", "💧", "☀️"],
  },
  {
    prompt: "A plant on the windowsill leans towards the window. What is it reaching for?",
    answer: "light from the Sun", wrong: ["cold air", "the sound of music"], emojis: ["🌱", "🪟"],
  },
  {
    prompt: "What do plant roots hold the plant in?",
    answer: "the soil", wrong: ["the sky", "a plastic bag"], emojis: ["🌱", "🪴"],
  },
]
const CYCLE_KEYS = Object.keys(ANIMAL_LIFE_CYCLES)

function gHabitat(rand: Rand): Question {
  const keys = shuffle(rand, Object.keys(HABITAT_BANK)).slice(0, 4)
  return matchQ(rand, "Match each animal to its home (habitat)",
    keys.map((a) => ({ left: a, right: HABITAT_BANK[a] })),
    { visual: { type: "emoji-group", emojis: ["🌍"] } },
  )
}
function gLocalCompare(rand: Rand): Question {
  const hot = shuffle(rand, ["desert", "savannah", "beach", "flowery field", "a dry riverbed in summer", "a dusty desert track"])[0]
  const cold = shuffle(rand, ["arctic", "snowy forest", "high mountain"])[0]
  return mcqE(rand, `Which place is hotter and drier?`, hot, [cold, "a quiet library", "a busy road"], { visual: { type: "emoji-group", emojis: ["☀️", "❄️"] } })
}
function gNeeds(rand: Rand): Question {
  const a = pick(rand, NEEDS)
  const b = pick(rand, NOT_NEEDS)
  return matchQ(rand, "What do living things need to stay alive?",
    [{ left: a, right: "a need of all living things" }, { left: b, right: "nice but not needed" }],
    { visual: { type: "emoji-group", emojis: ["💧", "🍎", "🌞", "🏠"] } },
  )
}
function gNeedsTF(rand: Rand): Question {
  const visual: VisualSpec = { type: "emoji-group", emojis: ["💧", "🍎", "🌞", "🏠"] }
  if (rand() < 0.5) {
    const e = pick(rand, NEEDS_TF_EXTRA)
    return tfQ("Science check", e.statement, e.answer, { visual })
  }
  const a = pick(rand, NEEDS)
  return tfQ("Science check", `All animals, including humans, need ${a} to survive.`, true, { visual })
}
function gPlantsNeed(rand: Rand): Question {
  const q = pick(rand, PLANT_NEED_MCQS)
  return mcqE(rand, q.prompt, q.answer, q.wrong, { visual: { type: "emoji-group", emojis: q.emojis } })
}
function gAdaptation(rand: Rand): Question {
  const a = pick(rand, ADAPTATION_PAIRS)
  return mcqE(rand, `How does the ${a.animal}'s ${a.trait} help it survive?`, a.explains, ["tastes better", "scares its friends away"], { visual: { type: "emoji-group", emojis: ["🐻", "🐸", "🦅", "🐫"] } })
}
function gCycle(rand: Rand): Question {
  const key = pick(rand, CYCLE_KEYS)
  return orderQ(`Put the ${key}'s life cycle in order, from start to end.`, ANIMAL_LIFE_CYCLES[key], { visual: { type: "emoji-group", emojis: ["🦋"] } })
}
function gHabitatIsHome(rand: Rand): Question {
  return tfQ("Science check", "The place a plant or animal naturally lives is its habitat.", true, { visual: { type: "emoji-group", emojis: ["🏡", "🌳"] } })
}

const S3 = [gHabitat, gLocalCompare, gNeeds, gNeedsTF, gPlantsNeed, gAdaptation, gCycle, gHabitatIsHome]

const lessons = [
  makeLesson("s3l1", "What is a Habitat?", ["2Be.01", "2Be.02"], "tails", "Welcome home!", "A habitat is the natural place where a plant or animal lives with the food, water and shelter it needs.", [gHabitatIsHome, gHabitat], gHabitat),
  makeLesson("s3l2", "Hot, Cold, Wet, Dry", ["2Be.03"], "cream", "Around the world!", "Habitats are different: some are hot and dry like a desert, others cold and icy. Compare them!", [gLocalCompare, gAdaptation], gLocalCompare),
  makeLesson("s3l3", "What Living Things Need", ["2Be.02"], "sonic", "Stay alive!", "All living things need water, food and air. Most also need shelter.", [gNeeds, gNeedsTF], gNeeds),
  makeLesson("s3l4", "Plants Need", ["2Be.02"], "amy", "Sun is the secret!", "Plants need water, air AND sunlight to grow tall and strong.", [gPlantsNeed, gNeedsTF], gPlantsNeed),
  makeLesson("s3l5", "Match the Animal", ["2Be.01", "2Be.02"], "knuckles", "Right place!", "Each animal has a body that fits where it lives: fur in the cold, webbed feet in water!", [gAdaptation, gCycle, gHabitat], gAdaptation),
]

const boss = makeLesson("s3boss", "Habitats Boss", ["2Be.01-03"], "eggman", "BOSS TIME!", "Eggman moved all the animals to the wrong places! Match each animal to its home to fix it.", [gHabitat, gAdaptation, gCycle], gHabitat)

export const UNIT_S3 = unitDef("s3", 3, "Living Things & Habitats", "Cambridge 2Be (habitats, what living things need, local environments)", "#16a34a", "🌿", [...lessons, boss])
