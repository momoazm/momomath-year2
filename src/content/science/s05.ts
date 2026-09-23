import type { Question } from "../types"
import {
  LIGHT_SOURCES, CIRCUIT_PARTS, SOCKET_DONTS, SOCKET_DOES,
  mcqE, matchQ, orderQ, tfQ,
  pick, pickOthers, shuffle, type Gen, type Rand,
  makeLesson, unitDef,
} from "./helpers"

const SHAPE_CHANGE = ["squash a sponge", "twist a rubber band", "stretch a spring", "bend a wire", "break a cracker"]
const MOTION_CHANGE = ["kick a ball", "throw a paper plane", "push a toy car", "catch a ball", "stop a rolling ball"]
const LIGHT_EXAMPLES: { source: string; natural: boolean; emoji: string }[] = [
  { source: "the Sun", natural: true, emoji: "☀️" }, { source: "a candle", natural: false, emoji: "🕯️" },
  { source: "a star", natural: true, emoji: "⭐" }, { source: "a torch", natural: false, emoji: "🔦" },
  { source: "a phone torch", natural: false, emoji: "📱" },
]
const CIRCUIT_DRAW_PARTS: Record<string, string> = { cell: "🔋", wire: "〰️", lamp: "💡", switch: "🔘" }

const FORCE_EFFECTS: { answer: string; wrong: string[]; emojis: string[] }[] = [
  { answer: "Change how something moves or its shape", wrong: ["Make things disappear", "Make things taste sweet"], emojis: ["🏀", "🧸"] },
  { answer: "Speed something up or slow it down", wrong: ["Turn it invisible", "Make it sing"], emojis: ["🚀", "🐢"] },
  { answer: "Change an object's direction", wrong: ["Change its favourite colour", "Make it float forever"], emojis: ["⚽", "🔄"] },
  { answer: "Hold something in place", wrong: ["Make it wet by looking", "Fill it with honey"], emojis: ["🧲", "✋"] },
]
function gForcesMove(rand: Rand): Question {
  const f = pick(rand, FORCE_EFFECTS)
  return mcqE(rand, "What can a push or a pull (a FORCE) do?", f.answer, f.wrong, { visual: { type: "emoji-group", emojis: f.emojis } })
}
function gShapeChange(rand: Rand): Question {
  return mcqE(rand, `What shape change happens when you ${pick(rand, SHAPE_CHANGE)}?`, "the object bends, twists, stretches or squashes", ["it turns into a different object", "it grows bigger forever"], { visual: { type: "emoji-group", emojis: ["🧽", "🪢"] } })
}
function gPushPulls(rand: Rand): Question {
  const a = pick(rand, MOTION_CHANGE)
  return mcqE(rand, `When you ${a}, what kind of force are you using?`, "a push or a pull", ["a sticky force", "a tasty force"], { visual: { type: "emoji-group", emojis: ["💥"] } })
}
const FORCE_TF: { text: string; ok: boolean; emojis: string[] }[] = [
  { text: "Things only speed up, slow down or change direction when something pushes or pulls them.", ok: true, emojis: ["🎾"] },
  { text: "When you stop pushing a moving swing, it slows down and eventually stops because of the push of air.", ok: true, emojis: ["🍃", "🪑"] },
  { text: "A force can be a push or a pull.", ok: true, emojis: ["👐"] },
  { text: "Once you kick a ball, no forces act on it at all.", ok: false, emojis: ["⚽"] },
  { text: "Gravity pulls objects towards the Earth.", ok: true, emojis: ["🌍"] },
  { text: "Friction helps a bicycle stop when you use the brakes.", ok: true, emojis: ["🚲"] },
  { text: "A book on a table has no forces acting on it.", ok: false, emojis: ["📖"] },
  { text: "Bigger pushes usually change motion more than tiny pushes.", ok: true, emojis: ["💪"] },
]
function gSpeedUpCause(rand: Rand): Question {
  const line = pick(rand, FORCE_TF)
  return tfQ("Forces", line.text, line.ok, { visual: { type: "emoji-group", emojis: line.emojis } })
}
function gForceStop(rand: Rand): Question {
  const line = pick(rand, FORCE_TF.filter((l) => l.text !== "Things only speed up, slow down or change direction when something pushes or pulls them."))
  return tfQ("Forces", line.text, line.ok, { visual: { type: "emoji-group", emojis: line.emojis } })
}
function gLightSource(rand: Rand): Question {
  const a = pick(rand, LIGHT_EXAMPLES)
  return mcqE(rand, `Is ${a.source} a NATURAL or a MAN-MADE light source?`, a.natural ? "natural" : "man-made", a.natural ? ["man-made"] : ["natural"], { visual: { type: "emoji-group", emojis: [a.emoji] } })
}
const LIGHT_TF: { text: string; ok: boolean; emojis: string[] }[] = [
  { text: "Darkness is the ABSENCE of light: it is not a thing on its own.", ok: true, emojis: ["🌑"] },
  { text: "A shiny or smooth surface, like a mirror or still water, can reflect (bounce back) light.", ok: true, emojis: ["🪞", "💧"] },
  { text: "You need a light source to see an object in a dark room.", ok: true, emojis: ["🔦"] },
  { text: "Darkness is a material you can hold in your hands.", ok: false, emojis: ["🤲"] },
  { text: "Transparent objects let most light pass through them.", ok: true, emojis: ["🪟"] },
  { text: "Opaque objects block light and make shadows.", ok: true, emojis: ["🧱", "🌑"] },
  { text: "The Moon makes its own light like a torch.", ok: false, emojis: ["🌙"] },
  { text: "Light travels in straight lines until it hits something.", ok: true, emojis: ["➡️", "☀️"] },
]
function gDarkness(rand: Rand): Question {
  const line = pick(rand, LIGHT_TF)
  return tfQ("Light science", line.text, line.ok, { visual: { type: "emoji-group", emojis: line.emojis } })
}
const SHADOW_ANS: { answer: string; wrong: string[] }[] = [
  { answer: "a solid object blocking light", wrong: ["a shiny surface", "a coloured surface", "a noisy place"] },
  { answer: "an opaque object in front of a light", wrong: ["a mirror facing the lamp", "a loud bell", "a wet floor"] },
  { answer: "light being blocked by something", wrong: ["too much soap", "a soft pillow", "a sweet smell"] },
]
function gShadow(rand: Rand): Question {
  const s = pick(rand, SHADOW_ANS)
  return mcqE(rand, "What makes a shadow?", s.answer, s.wrong, { visual: { type: "emoji-group", emojis: ["🌞", "👤"] } })
}
function gReflection(rand: Rand): Question {
  const line = pick(rand, LIGHT_TF.filter((l) => l.text !== "Darkness is the ABSENCE of light: it is not a thing on its own."))
  return tfQ("Light science", line.text, line.ok, { visual: { type: "emoji-group", emojis: line.emojis } })
}
const EXTRA_SOCKET_DOES = ['unplug appliances you are not using', 'keep drinks away from leads']
const EXTRA_SOCKET_DONTS = ['pull a plug out by the cable', 'charge a phone under your pillow']
function gSafety(rand: Rand): Question {
  return mcqE(rand, "Which is the SAFE thing to do near electricity?", pick(rand, [...SOCKET_DOES, ...EXTRA_SOCKET_DOES]), [...SOCKET_DONTS, ...EXTRA_SOCKET_DONTS], { visual: { type: "emoji-group", emojis: ["⚡", "🔌"] } })
}
function gNotSafety(rand: Rand): Question {
  return mcqE(rand, "Which is the UNSAFE thing to do?", pick(rand, [...SOCKET_DONTS, ...EXTRA_SOCKET_DONTS]), [...SOCKET_DOES, ...EXTRA_SOCKET_DOES], { visual: { type: "emoji-group", emojis: ["🚫", "⚡"] } })
}
function gCircuitParts(rand: Rand): Question {
  const keys = shuffle(rand, Object.keys(CIRCUIT_DRAW_PARTS)).slice(0, 3)
  return matchQ(rand, "Name each part of a simple circuit",
    keys.map((p) => ({ left: CIRCUIT_DRAW_PARTS[p], right: p })), { visual: { type: "emoji-group", emojis: ["🔋", "〰️", "💡"] } },
  )
}
function gCircuitComplete(rand: Rand): Question {
  return mcqE(rand, "A lamp does NOT light up. What is most likely missing?", "a complete (unbroken) circuit", ["a light switch", "a battery holder", "a coloured wire"], { visual: { type: "emoji-group", emojis: ["💡", "🔋", "〰️"] } })
}
const CIRCUIT_TF: { text: string; ok: boolean }[] = [
  { text: "A simple series circuit has one path from the cell, through wires and the lamp, and back to the cell.", ok: true },
  { text: "A circuit must be complete (a closed loop) for the lamp to light.", ok: true },
  { text: "The cell pushes electric current around the circuit.", ok: true },
  { text: "You can touch a bare wire with wet hands to test a circuit.", ok: false },
  { text: "A switch can break the loop and turn the lamp off.", ok: true },
  { text: "If one part of a series circuit breaks, the lamp goes out.", ok: true },
]
function gSeries(rand: Rand): Question {
  const line = pick(rand, CIRCUIT_TF)
  return tfQ("Electric circuits", line.text, line.ok, { visual: { type: "emoji-group", emojis: ["🔋", "💡", "〰️"] } })
}
function gMagnet(rand: Rand): Question {
  const attract = pick(rand, ["a steel scissors", "a metal spoon", "a safety pin", "a metal key"])
  const noAttract = pick(rand, ["a wooden pencil", "a plastic ruler", "a rubber ball", "a glass cup"])
  return mcqE(rand, `Which of these would a magnet pull towards it (attract)?`, attract, [noAttract, "a paper sheet", "a cotton sock"], { visual: { type: "emoji-group", emojis: ["🧲"] } })
}

const S5 = [gForcesMove, gShapeChange, gPushPulls, gSpeedUpCause, gForceStop,
  gLightSource, gDarkness, gShadow, gReflection,
  gSafety, gNotSafety, gCircuitParts, gCircuitComplete, gSeries, gMagnet]

const lessons = [
  makeLesson("s5l1", "Pushes & Pulls", ["2Pf.01"], "sonic", "Use a force!", "A FORCE is a push or a pull. Forces make things move, or change direction or speed.", [gForcesMove, gSpeedUpCause, gForceStop, gPushPulls, gShapeChange], gForcesMove),
  makeLesson("s5l2", "Squash, Twist, Bend", ["2Pf.02"], "knuckles", "Bend it!", "Forces can also change an object's SHAPE: squash, twist, stretch, or break.", [gShapeChange, gPushPulls, gForceStop, gSpeedUpCause, gForcesMove], gShapeChange),
  makeLesson("s5l3", "Light Sources", ["2Ps.01"], "amy", "Where does light come from?", "The Sun is a light source. So are candles, stars, torches and lamps.", [gLightSource, gDarkness, gShadow, gReflection], gLightSource),
  makeLesson("s5l4", "Light & Dark", ["2Ps.02"], "shadow", "Turn it off!", "When the lights go out, there is darkness. Darkness is just NO light.", [gDarkness, gShadow, gReflection, gLightSource], gDarkness),
  makeLesson("s5l5", "Electricity Safety", ["2Pe.01"], "cream", "Stay safe!", "Plugs and sockets are ONLY for grown-ups. Keep water away and ask an adult first.", [gSafety, gNotSafety, gSeries, gCircuitComplete], gSafety),
  makeLesson("s5l6", "Build a Simple Circuit", ["2Pe.02", "2Pe.03"], "tails", "Light it up!", "A cell, wires and a lamp make a simple series circuit. Add a switch to control it.", [gCircuitParts, gCircuitComplete, gSeries, gSafety, gNotSafety], gCircuitParts),
  makeLesson("s5l7", "Magnets", ["2Pf.03"], "silver", "Attract or not?", "Magnets pull towards some metals: but not all materials. Try it!", [gMagnet, gForcesMove], gMagnet),
]

const boss = makeLesson("s5boss", "Forces & Light Boss", ["2Pf.01-03", "2Ps.01-02", "2Pe.01-03"], "eggman", "BOSS TIME!", "Eggman's robots are off! Push, pull, light a lamp, make a shadow and stay safe with electricity to beat them.", [gForcesMove, gShapeChange, gLightSource, gShadow, gSafety, gCircuitParts], gShapeChange)

export const UNIT_S5 = unitDef("s5", 5, "Forces, Light & Electricity", "Cambridge 2Pf (pushes/pulls, magnets) + 2Ps (light/dark, shadows, reflections) + 2Pe (electricity safety & circuits)", "#a3e635", "⚡", [...lessons, boss])
