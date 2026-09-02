import type { Question } from '../types'
import {
  LIGHT_SOURCES, CIRCUIT_PARTS, SOCKET_DONTS, SOCKET_DOES,
  mcqE, matchQ, orderQ, tfQ,
  pick, pickOthers, shuffle, type Gen, type Rand,
  makeLesson, unitDef,
} from './helpers'

const SHAPE_CHANGE = ['squash a sponge', 'twist a rubber band', 'stretch a spring', 'bend a wire', 'break a cracker']
const MOTION_CHANGE = ['kick a ball', 'throw a paper plane', 'push a toy car', 'catch a ball', 'stop a rolling ball']
const LIGHT_EXAMPLES: { source: string; natural: boolean; emoji: string }[] = [
  { source: 'the Sun', natural: true, emoji: '☀️' }, { source: 'a candle', natural: false, emoji: '🕯️' },
  { source: 'a star', natural: true, emoji: '⭐' }, { source: 'a torch', natural: false, emoji: '🔦' },
  { source: 'a phone torch', natural: false, emoji: '📱' },
]
const CIRCUIT_DRAW_PARTS: Record<string, string> = { cell: '🔋', wire: '〰️', lamp: '💡', switch: '🔘' }

function gForcesMove(rand: Rand): Question {
  return mcqE(rand, 'What can a push or a pull (a FORCE) do?', 'Change how something moves or its shape', ['Make things disappear', 'Make things taste sweet'], { visual: { type: 'emoji-group', emojis: ['🏀', '🧸'] } })
}
function gShapeChange(rand: Rand): Question {
  return mcqE(rand, `What shape change happens when you ${pick(rand, SHAPE_CHANGE)}?`, 'the object bends, twists, stretches or squashes', ['it turns into a different object', 'it grows bigger forever'], { visual: { type: 'emoji-group', emojis: ['🧽', '🪢'] } })
}
function gPushPulls(rand: Rand): Question {
  const a = pick(rand, MOTION_CHANGE)
  return mcqE(rand, `When you ${a}, what kind of force are you using?`, 'a push or a pull', ['a sticky force', 'a tasty force'], { visual: { type: 'emoji-group', emojis: ['💥'] } })
}
function gSpeedUpCause(rand: Rand): Question {
  return tfQ('Forces', 'Things only speed up, slow down or change direction when something pushes or pulls them.', true, { visual: { type: 'emoji-group', emojis: ['🎾'] } })
}
function gLightSource(rand: Rand): Question {
  const a = pick(rand, LIGHT_EXAMPLES)
  return mcqE(rand, `Is ${a.source} a NATURAL or a MAN-MADE light source?`, a.natural ? 'natural' : 'man-made', a.natural ? ['man-made'] : ['natural'], { visual: { type: 'emoji-group', emojis: [a.emoji] } })
}
function gDarkness(rand: Rand): Question {
  return tfQ('Light science', 'Darkness is the ABSENCE of light — it is not a thing on its own.', true, { visual: { type: 'emoji-group', emojis: ['🌑'] } })
}
function gSafety(rand: Rand): Question {
  return mcqE(rand, 'Which is the SAFE thing to do near electricity?', pick(rand, SOCKET_DOES), SOCKET_DONTS, { visual: { type: 'emoji-group', emojis: ['⚡', '🔌'] } })
}
function gNotSafety(rand: Rand): Question {
  return mcqE(rand, 'Which is the UNSAFE thing to do?', pick(rand, SOCKET_DONTS), SOCKET_DOES, { visual: { type: 'emoji-group', emojis: ['🚫', '⚡'] } })
}
function gCircuitParts(rand: Rand): Question {
  const keys = shuffle(rand, Object.keys(CIRCUIT_DRAW_PARTS)).slice(0, 3)
  return matchQ(rand, 'Name each part of a simple circuit',
    keys.map((p) => ({ left: CIRCUIT_DRAW_PARTS[p], right: p })), { visual: { type: 'emoji-group', emojis: ['🔋', '〰️', '💡'] } },
  )
}
function gSeries(rand: Rand): Question {
  return tfQ('Electric circuits', 'A simple series circuit has one path from the cell, through wires and the lamp, and back to the cell.', true, { visual: { type: 'emoji-group', emojis: ['🔋', '💡', '〰️'] } })
}

const S5 = [gForcesMove, gShapeChange, gPushPulls, gSpeedUpCause, gLightSource, gDarkness, gSafety, gNotSafety, gCircuitParts, gSeries]

const lessons = [
  makeLesson('s5l1', 'Pushes & Pulls', ['2Pf.01'], 'sonic', 'Use a force!', 'A FORCE is a push or a pull. Forces make things move — or change direction or speed.', [gForcesMove, gSpeedUpCause], gForcesMove),
  makeLesson('s5l2', 'Squash, Twist, Bend', ['2Pf.02'], 'knuckles', 'Bend it!', 'Forces can also change an object\'s SHAPE — squash, twist, stretch, or break.', [gShapeChange, gPushPulls], gShapeChange),
  makeLesson('s5l3', 'Light Sources', ['2Ps.01'], 'amy', 'Where does light come from?', 'The Sun is a light source. So are candles, stars, torches and lamps.', [gLightSource, gLightSource], gLightSource),
  makeLesson('s5l4', 'Light & Dark', ['2Ps.02'], 'shadow', 'Turn it off!', 'When the lights go out, there is darkness. Darkness is just NO light.', [gDarkness, gLightSource], gDarkness),
  makeLesson('s5l5', 'Electricity Safety', ['2Pe.01'], 'cream', 'Stay safe!', 'Plugs and sockets are ONLY for grown-ups. Keep water away and ask an adult first.', [gSafety, gNotSafety], gSafety),
  makeLesson('s5l6', 'Build a Simple Circuit', ['2Pe.02', '2Pe.03'], 'tails', 'Light it up!', 'A cell, wires and a lamp make a simple series circuit. Add a switch to control it.', [gCircuitParts, gSeries], gCircuitParts),
]

const boss = makeLesson('s5boss', 'Forces & Light Boss', ['2Pf.01-03', '2Ps.01-02', '2Pe.01-03'], 'eggman', 'BOSS TIME!', 'Eggman\'s robots are off! Push, pull, light a lamp and stay safe with electricity to beat them.', [gForcesMove, gShapeChange, gLightSource, gSafety, gCircuitParts], gShapeChange)

export const UNIT_S5 = unitDef('s5', 5, 'Forces, Light & Electricity', 'Cambridge 2Pf (pushes/pulls, shape) + 2Ps (light/dark) + 2Pe (electricity safety & circuits)', '#a3e635', '⚡', [...lessons, boss])
