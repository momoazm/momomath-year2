import type { Question } from "../types"
import {
  LIGHT_SOURCES, CIRCUIT_PARTS, SOCKET_DONTS, SOCKET_DOES,
  mcqE, matchQ, orderQ, tfQ,
  pick, pickOthers, randInt, shuffle, type Gen, type Rand,
  makeLesson, unitDef,
} from "./helpers"

const SHAPE_CHANGE = ["squash a sponge", "twist a rubber band", "stretch a spring", "bend a wire", "break a cracker"]
const MOTION_CHANGE = ["kick a ball", "throw a paper plane", "push a toy car", "catch a ball", "stop a rolling ball"]
const LIGHT_EXAMPLES: { source: string; natural: boolean; emoji: string }[] = [
  { source: "the Sun", natural: true, emoji: "☀️" }, { source: "a candle", natural: false, emoji: "🕯️" },
  { source: "a star", natural: true, emoji: "⭐" }, { source: "a torch", natural: false, emoji: "🔦" },
  { source: "a phone torch", natural: false, emoji: "📱" },
  { source: "a lightning flash", natural: true, emoji: "⚡" }, { source: "a lamp", natural: false, emoji: "💡" },
  { source: "a lantern", natural: false, emoji: "🏮" }, { source: "a bonfire", natural: false, emoji: "🔥" },
]
const CIRCUIT_DRAW_PARTS: Record<string, string> = { cell: "🔋", wire: "〰️", lamp: "💡", switch: "🔘" }
const FORCE_MCQS: { prompt: string; answer: string; wrong: string[]; emojis: string[] }[] = [
  {
    prompt: "What can a push or a pull (a FORCE) do?",
    answer: "Change how something moves or its shape",
    wrong: ["Make things disappear", "Make things taste sweet"], emojis: ["🏀", "🧸"],
  },
  {
    prompt: "Which of these is a PUSH?",
    answer: "pushing a swing upwards",
    wrong: ["pulling a wagon towards you", "dragging a heavy box"], emojis: ["🛝", "💪"],
  },
  {
    prompt: "Which of these is a PULL?",
    answer: "dragging a toy box across the floor",
    wrong: ["shutting a door with your hand", "kicking a football"], emojis: ["🧺", "💪"],
  },
  {
    prompt: "What happens when you push a toy car?",
    answer: "it moves away from your hand",
    wrong: ["it turns into juice", "it stops existing"], emojis: ["🚗", "👐"],
  },
  {
    prompt: "A force can make an object...",
    answer: "speed up, slow down or change direction",
    wrong: ["vanish completely", "become a liquid"], emojis: ["🏃", "🔄"],
  },
  {
    prompt: "You slow a scooter down with your foot. What are you changing?",
    answer: "how fast it is moving",
    wrong: ["its colour", "its smell"], emojis: ["🛴", "🛑"],
  },
  {
    prompt: "You pull a toy wagon along the floor. Which force are you using?",
    answer: "a pull force",
    wrong: ["a taste force", "a colour force"], emojis: ["🛒", "💪"],
  },
  {
    prompt: "Which of these uses a force?",
    answer: "kicking a football",
    wrong: ["looking at a picture", "thinking about your lunch"], emojis: ["⚽", "🦵"],
  },
]
const FORCE_TF: { statement: string; answer: boolean }[] = [
  { statement: "Things only speed up, slow down or change direction when something pushes or pulls them.", answer: true },
  { statement: "A push can make a ball roll faster.", answer: true },
  { statement: "Forces can change how fast something moves.", answer: true },
  { statement: "A force can change the direction a ball is travelling.", answer: true },
  { statement: "You need a push or a pull to start a toy car moving.", answer: true },
  { statement: "Kicking a ball is a push force.", answer: true },
  { statement: "A push and a pull are both forces.", answer: true },
  { statement: "Nothing at all happens when you push a wall as hard as you can.", answer: false },
]
const FORCE_STOP_TF: { statement: string; answer: boolean }[] = [
  { statement: "When you stop pushing a moving swing, it slows down and eventually stops because of the push of air.", answer: true },
  { statement: "A toy car that nobody is pushing will slow down and stop.", answer: true },
  { statement: "A ball rolling along the floor keeps rolling forever with nothing slowing it down.", answer: false },
  { statement: "A push or a pull can stop something that is already moving.", answer: true },
  { statement: "Air resistance can slow a moving object down.", answer: true },
  { statement: "Once something is moving it can never be slowed down or stopped.", answer: false },
]
const DARK_TF: { statement: string; answer: boolean }[] = [
  { statement: "Darkness is the ABSENCE of light: it is not a thing on its own.", answer: true },
  { statement: "You need some light to see the colours of a toy.", answer: true },
  { statement: "The Moon makes its own light.", answer: false },
  { statement: "A mirror gives out light of its own.", answer: false },
  { statement: "A completely dark room has no light source shining in it.", answer: true },
  { statement: "Light travels away from a torch in every direction.", answer: true },
  { statement: "Switching off the lamp removes the light, so the room becomes dark.", answer: true },
  { statement: "Darkness is a material you can hold in your hand.", answer: false },
]
const SHADOW_MCQS: { prompt: string; answer: string; wrong: string[]; emojis: string[] }[] = [
  {
    prompt: "What makes a shadow?",
    answer: "a solid object blocking light",
    wrong: ["a shiny surface", "a coloured surface", "a noisy place"], emojis: ["🌞", "👤"],
  },
  {
    prompt: "Where must an object be to throw a shadow on the wall?",
    answer: "between the light and the wall",
    wrong: ["behind the wall", "far away from both the light and the wall"], emojis: ["💡", "🧍", "🧱"],
  },
  {
    prompt: "You move the torch closer to the toy. What happens to its shadow?",
    answer: "it becomes bigger",
    wrong: ["it disappears completely", "it turns a different colour"], emojis: ["🔦", "🧸", "⬛"],
  },
  {
    prompt: "You move the toy further away from the light. What happens to its shadow?",
    answer: "it becomes smaller",
    wrong: ["it fills the whole room", "it changes into a circle of light"], emojis: ["🧸", "💡", "⬛"],
  },
  {
    prompt: "Why can you not see a shadow in a pitch-dark room?",
    answer: "there is no light to block",
    wrong: ["the wall is too bright", "shadows only exist in books"], emojis: ["🌑", "🚫"],
  },
  {
    prompt: "Can a shadow move all by itself?",
    answer: "no - it moves when the light or the object moves",
    wrong: ["yes - shadows like to walk around", "yes - shadows are alive"], emojis: ["👤", "🚶"],
  },
]
const REFLECT_TF: { statement: string; answer: boolean }[] = [
  { statement: "A shiny or smooth surface, like a mirror or still water, can reflect (bounce back) light.", answer: true },
  { statement: "You can see your face in a shiny spoon because it reflects light.", answer: true },
  { statement: "A mirror bounces light straight back at you.", answer: true },
  { statement: "Still water can act like a mirror and show the reflection of a tree.", answer: true },
  { statement: "A dull, rough surface reflects light as clearly as a mirror.", answer: false },
  { statement: "A rough blanket works exactly like a mirror.", answer: false },
  { statement: "Light bounces off a mirror instead of being absorbed by it.", answer: true },
]
const CIRCUIT_FIX_MCQS: { prompt: string; answer: string; wrong: string[] }[] = [
  {
    prompt: "A lamp does NOT light up. What is most likely missing?",
    answer: "a complete (unbroken) circuit",
    wrong: ["a light switch", "a battery holder", "a coloured wire"],
  },
  {
    prompt: "What does a circuit need before a lamp can light up?",
    answer: "a cell to push the electricity around",
    wrong: ["a paper label", "a plastic box"],
  },
  {
    prompt: "The switch is OPEN. What does the lamp do?",
    answer: "it stays off",
    wrong: ["it shines brighter", "it changes colour"],
  },
  {
    prompt: "You take the cell out of the circuit. What happens?",
    answer: "the lamp goes out",
    wrong: ["the lamp shines forever", "the wires turn into gold"],
  },
  {
    prompt: "Why does the lamp light when you close the switch?",
    answer: "the circuit is complete, so electricity can flow",
    wrong: ["the switch turns into a lamp", "the wires disappear"],
  },
  {
    prompt: "A wire comes loose in a circuit. What is the problem?",
    answer: "the circuit is broken, so no electricity can flow",
    wrong: ["the circuit is now too bright", "the lamp needs more paint"],
  },
]
const SERIES_TF: { statement: string; answer: boolean }[] = [
  { statement: "A simple series circuit has one path from the cell, through wires and the lamp, and back to the cell.", answer: true },
  { statement: "In a series circuit the electricity has only one path to follow.", answer: true },
  { statement: "A series circuit with two lamps has two separate paths.", answer: false },
  { statement: "A switch in a series circuit can turn the lamp on and off.", answer: true },
  { statement: "If the circuit is broken anywhere, the lamp will not light.", answer: true },
  { statement: "Electricity flows out of the cell and travels back to the cell.", answer: true },
  { statement: "You can light a lamp with no cell in the circuit at all.", answer: false },
]
const MAGNET_ATTRACTS = ["a steel scissors", "a metal spoon", "a safety pin", "a metal key", "an iron nail", "a steel paper clip", "a tin can"]
const MAGNET_IGNORES = ["a wooden pencil", "a plastic ruler", "a rubber ball", "a glass cup"]

function gForcesMove(rand: Rand): Question {
  const q = pick(rand, FORCE_MCQS)
  return mcqE(rand, q.prompt, q.answer, q.wrong, { visual: { type: "emoji-group", emojis: q.emojis } })
}
function gShapeChange(rand: Rand): Question {
  return mcqE(rand, `What shape change happens when you ${pick(rand, SHAPE_CHANGE)}?`, "the object bends, twists, stretches or squashes", ["it turns into a different object", "it grows bigger forever"], { visual: { type: "emoji-group", emojis: ["🧽", "🪢"] } })
}
function gPushPulls(rand: Rand): Question {
  const a = pick(rand, MOTION_CHANGE)
  return mcqE(rand, `When you ${a}, what kind of force are you using?`, "a push or a pull", ["a sticky force", "a tasty force"], { visual: { type: "emoji-group", emojis: ["💥"] } })
}
function gSpeedUpCause(rand: Rand): Question {
  const t = pick(rand, FORCE_TF)
  return tfQ("Forces", t.statement, t.answer, { visual: { type: "emoji-group", emojis: ["🎾"] } })
}
function gForceStop(rand: Rand): Question {
  const t = pick(rand, FORCE_STOP_TF)
  return tfQ("Forces", t.statement, t.answer, { visual: { type: "emoji-group", emojis: ["🍃", "🪑"] } })
}
function gLightSource(rand: Rand): Question {
  const a = pick(rand, LIGHT_EXAMPLES)
  return mcqE(rand, `Is ${a.source} a NATURAL or a MAN-MADE light source?`, a.natural ? "natural" : "man-made", a.natural ? ["man-made"] : ["natural"], { visual: { type: "emoji-group", emojis: [a.emoji] } })
}
function gDarkness(rand: Rand): Question {
  const t = pick(rand, DARK_TF)
  return tfQ("Light science", t.statement, t.answer, { visual: { type: "emoji-group", emojis: ["🌑"] } })
}
function gShadow(rand: Rand): Question {
  const q = pick(rand, SHADOW_MCQS)
  return mcqE(rand, q.prompt, q.answer, q.wrong, { visual: { type: "emoji-group", emojis: q.emojis } })
}
function gReflection(rand: Rand): Question {
  const t = pick(rand, REFLECT_TF)
  return tfQ("Light science", t.statement, t.answer, { visual: { type: "emoji-group", emojis: ["🪞", "💧"] } })
}
function gSafety(rand: Rand): Question {
  return mcqE(rand, "Which is the SAFE thing to do near electricity?", pick(rand, SOCKET_DOES), SOCKET_DONTS, { visual: { type: "emoji-group", emojis: ["⚡", "🔌"] } })
}
function gNotSafety(rand: Rand): Question {
  return mcqE(rand, "Which is the UNSAFE thing to do?", pick(rand, SOCKET_DONTS), SOCKET_DOES, { visual: { type: "emoji-group", emojis: ["🚫", "⚡"] } })
}
function gCircuitParts(rand: Rand): Question {
  const howMany = randInt(rand, 2, 4)
  const keys = shuffle(rand, Object.keys(CIRCUIT_DRAW_PARTS)).slice(0, howMany)
  return matchQ(rand, "Name each part of a simple circuit",
    keys.map((p) => ({ left: CIRCUIT_DRAW_PARTS[p], right: p })), { visual: { type: "emoji-group", emojis: ["🔋", "〰️", "💡"] } },
  )
}
function gCircuitComplete(rand: Rand): Question {
  const q = pick(rand, CIRCUIT_FIX_MCQS)
  return mcqE(rand, q.prompt, q.answer, q.wrong, { visual: { type: "emoji-group", emojis: ["💡", "🔋", "〰️"] } })
}
function gSeries(rand: Rand): Question {
  const t = pick(rand, SERIES_TF)
  return tfQ("Electric circuits", t.statement, t.answer, { visual: { type: "emoji-group", emojis: ["🔋", "💡", "〰️"] } })
}
function gMagnet(rand: Rand): Question {
  const attract = pick(rand, MAGNET_ATTRACTS)
  const noAttract = pick(rand, MAGNET_IGNORES)
  return mcqE(rand, `Which of these would a magnet pull towards it (attract)?`, attract, [noAttract, "a paper sheet", "a cotton sock"], { visual: { type: "emoji-group", emojis: ["🧲"] } })
}

const S5 = [gForcesMove, gShapeChange, gPushPulls, gSpeedUpCause, gForceStop,
  gLightSource, gDarkness, gShadow, gReflection,
  gSafety, gNotSafety, gCircuitParts, gCircuitComplete, gSeries, gMagnet]

const lessons = [
  makeLesson("s5l1", "Pushes & Pulls", ["2Pf.01"], "sonic", "Use a force!", "A FORCE is a push or a pull. Forces make things move, or change direction or speed.", [gForcesMove, gSpeedUpCause], gForcesMove),
  makeLesson("s5l2", "Squash, Twist, Bend", ["2Pf.02"], "knuckles", "Bend it!", "Forces can also change an object's SHAPE: squash, twist, stretch, or break.", [gShapeChange, gPushPulls, gForceStop], gShapeChange),
  makeLesson("s5l3", "Light Sources", ["2Ps.01"], "amy", "Where does light come from?", "The Sun is a light source. So are candles, stars, torches and lamps.", [gLightSource, gDarkness], gLightSource),
  makeLesson("s5l4", "Light & Dark", ["2Ps.02"], "shadow", "Turn it off!", "When the lights go out, there is darkness. Darkness is just NO light.", [gDarkness, gShadow, gReflection], gDarkness),
  makeLesson("s5l5", "Electricity Safety", ["2Pe.01"], "cream", "Stay safe!", "Plugs and sockets are ONLY for grown-ups. Keep water away and ask an adult first.", [gSafety, gNotSafety], gSafety),
  makeLesson("s5l6", "Build a Simple Circuit", ["2Pe.02", "2Pe.03"], "tails", "Light it up!", "A cell, wires and a lamp make a simple series circuit. Add a switch to control it.", [gCircuitParts, gCircuitComplete, gSeries], gCircuitParts),
  makeLesson("s5l7", "Magnets", ["2Pf.03"], "silver", "Attract or not?", "Magnets pull towards some metals: but not all materials. Try it!", [gMagnet, gForcesMove], gMagnet),
]

const boss = makeLesson("s5boss", "Forces & Light Boss", ["2Pf.01-03", "2Ps.01-02", "2Pe.01-03"], "eggman", "BOSS TIME!", "Eggman's robots are off! Push, pull, light a lamp, make a shadow and stay safe with electricity to beat them.", [gForcesMove, gShapeChange, gLightSource, gShadow, gSafety, gCircuitParts], gShapeChange)

export const UNIT_S5 = unitDef("s5", 5, "Forces, Light & Electricity", "Cambridge 2Pf (pushes/pulls, magnets) + 2Ps (light/dark, shadows, reflections) + 2Pe (electricity safety & circuits)", "#a3e635", "⚡", [...lessons, boss])
