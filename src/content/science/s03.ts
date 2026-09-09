import type { Question } from "../types"
import {
  LIVING_BANK, HABITAT_BANK, ANIMAL_LIFE_CYCLES,
  mcqE, matchQ, orderQ, tfQ,
  pick, pickOthers, shuffle, type Gen, type Rand,
  makeLesson, unitDef,
} from "./helpers"

const NEEDS = ["water", "food", "air", "shelter"]
const ADAPTATION_PAIRS: { animal: string; trait: string; explains: string }[] = [
  { animal: "polar bear", trait: "thick fur", explains: "stays warm in cold snow" },
  { animal: "frog", trait: "webbed feet", explains: "swims well in water" },
  { animal: "eagle", trait: "sharp talons", explains: "catches prey" },
  { animal: "camel", trait: "long eyelashes", explains: "blocks desert sand" },
  { animal: "duck", trait: "oily feathers", explains: "stays dry in water" },
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
  const hot = shuffle(rand, ["desert", "savannah", "beach", "flowery field"])[0]
  const cold = shuffle(rand, ["arctic", "snowy forest", "high mountain"])[0]
  return mcqE(rand, `Which place is hotter and drier?`, hot, [cold, "a quiet library", "a busy road"], { visual: { type: "emoji-group", emojis: ["☀️", "❄️"] } })
}
function gNeeds(rand: Rand): Question {
  const a = pick(rand, NEEDS)
  return matchQ(rand, "What do living things need to stay alive?",
    [{ left: a, right: "a need of all living things" }, { left: "toy", right: "nice but not needed" }],
    { visual: { type: "emoji-group", emojis: ["💧", "🍎", "🌞", "🏠"] } },
  )
}
function gNeedsTF(rand: Rand): Question {
  const a = pick(rand, NEEDS)
  return tfQ("Science check", `All animals, including humans, need ${a} to survive.`, true, { visual: { type: "emoji-group", emojis: ["💧", "🍎", "🌞", "🏠"] } })
}
function gPlantsNeed(rand: Rand): Question {
  return mcqE(rand, "What do plants need to grow (besides air and water)?", "sunlight", ["snowfall", "cement", "melted chocolate"], { visual: { type: "emoji-group", emojis: ["🌱", "☀️"] } })
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
