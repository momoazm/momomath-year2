import type { Question } from "../types"
import {
  MATERIALS, MATERIAL_BANK, MATERIAL_PROPERTY, MATERIAL_CHANGES, PROPERTY_BANK,
  mcqE, matchQ, orderQ, tfQ,
  pick, pickOthers, shuffle, type Gen, type Rand,
  makeLesson, unitDef,
} from "./helpers"

const NATURAL = ["wood", "stone", "water", "ice", "sand", "wool"]
const MADE = ["plastic", "glass", "paper", "fabric", "rubber", "brick"]
const PURPOSE: { material: string; use: string; property: string }[] = [
  { material: "glass", use: "a window", property: "transparent and hard" },
  { material: "rubber", use: "a tyre", property: "stretchy and strong" },
  { material: "wood", use: "a chair", property: "hard and strong" },
  { material: "metal", use: "a saucepan", property: "hard and shiny" },
  { material: "paper", use: "a book", property: "soft and light" },
  { material: "plastic", use: "a water bottle", property: "light and waterproof" },
]
const WATERPROOF_ITEMS = ["plastic bag", "rubber glove", "waxed coat", "raincoat"]
const NOT_WATERPROOF = ["cardboard box", "paper bag", "tissue", "wooden door"]

function gNaturalOrMade(rand: Rand): Question {
  const a = pick(rand, MATERIALS)
  return mcqE(rand, `Is ${a} natural (found in nature) or manufactured (made by people)?`,
    a in Object.fromEntries(NATURAL.map((k) => [k, k])) ? "natural" : "manufactured",
    a in Object.fromEntries(NATURAL.map((k) => [k, k])) ? ["manufactured"] : ["natural"],
    { visual: { type: "emoji-group", emojis: [MATERIAL_BANK[a]] } },
  )
}
function gPropWord(rand: Rand): Question {
  const a = pick(rand, MATERIALS)
  return mcqE(rand, `Which property BEST describes ${a}?`, PROPERTY_BANK[MATERIAL_PROPERTY[a]] ?? "hard", pickOthers(rand, Object.values(PROPERTY_BANK), PROPERTY_BANK[MATERIAL_PROPERTY[a]] ?? "hard", 3), { visual: { type: "emoji-group", emojis: [MATERIAL_BANK[a]] } })
}
function gWhyThisMaterial(rand: Rand): Question {
  const a = pick(rand, PURPOSE)
  return mcqE(rand, `Why is ${a.material} a great material for ${a.use}?`, `Because it is ${a.property}.`, ["Because it is soft and light.", "Because it is bright."], { visual: { type: "emoji-group", emojis: [MATERIAL_BANK[a.material]] } })
}
function gSameMaterialSort(rand: Rand): Question {
  const a = pick(rand, MATERIALS)
  return tfQ("Material test", `The spoon and the pan can both be made of the same material: ${a}.`, true, { visual: { type: "emoji-group", emojis: ["🥄", "🍳"] } })
}
function gChange(rand: Rand): Question {
  const a = pick(rand, MATERIAL_CHANGES)
  return mcqE(rand, `Is ${a.item} a reversible or irreversible change?`, a.kind, ["a colour change", "a different kind of change"], { visual: { type: "emoji-group", emojis: ["🔁"] } })
}
function gHardVsSoft(rand: Rand): Question {
  return matchQ(rand, "Is each material HARD or SOFT?",
    [
      { left: "wood", right: "hard" }, { left: "stone", right: "hard" },
      { left: "paper", right: "soft" }, { left: "rubber", right: "soft" },
    ], { visual: { type: "emoji-group", emojis: ["🪵", "🪨", "📄", "🏀"] } },
  )
}
function gReversibleIdea(rand: Rand): Question {
  return tfQ("Material change", "A reversible change can be undone like ice melting back to water.", true, { visual: { type: "emoji-group", emojis: ["🧊", "💧"] } })
}
function gOrderSolids(rand: Rand): Question {
  return orderQ("Order objects from LIGHTEST to HEAVIEST (just a guess!)",
    ["feather", "apple", "book", "rock", "car"], { visual: { type: "emoji-group", emojis: ["🪶", "🍎", "📖", "🪨", "🚗"] } })
}
function gMultiProp(rand: Rand): Question {
  return tfQ("Material science", "A single material can have more than one useful property: for example wood is hard AND strong.", true, { visual: { type: "emoji-group", emojis: ["🪵"] } })
}
function gWaterproof(rand: Rand): Question {
  return mcqE(rand, "Which of these would best keep water from soaking through?", pick(rand, WATERPROOF_ITEMS), NOT_WATERPROOF, { visual: { type: "emoji-group", emojis: ["💧", "🧴"] } })
}

const S4 = [gNaturalOrMade, gPropWord, gWhyThisMaterial, gSameMaterialSort, gChange, gHardVsSoft, gReversibleIdea, gOrderSolids, gMultiProp, gWaterproof]

const lessons = [
  makeLesson("s4l1", "Natural or Made?", ["2Cm.01"], "cream", "Found it or made it?", "Wood comes from trees (natural) and plastic is made in a factory (manufactured).", [gNaturalOrMade, gPropWord, gMultiProp], gNaturalOrMade),
  makeLesson("s4l2", "Material Properties", ["2Cp.01"], "tails", "Hard, soft, shiny, dull!", "Every material has properties: describing words that help us choose them for a job.", [gPropWord, gMultiProp, gHardVsSoft], gPropWord),
  makeLesson("s4l3", "Choosing the Right Material", ["2Cp.02"], "shadow", "Pick the perfect one!", "Windows use glass because it is transparent. Pans use metal because it is strong and hard.", [gWhyThisMaterial, gPropWord, gWaterproof], gWhyThisMaterial),
  makeLesson("s4l4", "Test It!", ["2Cp.03"], "knuckles", "Material lab!", "You can TEST materials: is it hard, soft, shiny or dull? Sort and compare!", [gHardVsSoft, gOrderSolids, gSameMaterialSort], gHardVsSoft),
  makeLesson("s4l5", "Reversible or Not?", ["2Cc.01"], "silver", "Undo it or not?", "Bending a paperclip is reversible. Burning paper is irreversible: you cannot un-burn it!", [gChange, gReversibleIdea], gChange),
]

const boss = makeLesson("s4boss", "Materials Boss", ["2Cm.01", "2Cp.01-03", "2Cc.01"], "eggman", "BOSS TIME!", "Eggman mixed up every material! Sort, match, and check the right properties to set things right.", [gNaturalOrMade, gPropWord, gWhyThisMaterial, gChange, gHardVsSoft], gWhyThisMaterial)

export const UNIT_S4 = unitDef("s4", 4, "Materials", "Cambridge 2Cm (natural vs made), 2Cp (properties + testing), 2Cc (reversible / irreversible changes)", "#eab308", "🧪", [...lessons, boss])
