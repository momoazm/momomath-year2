import type { Question } from '../types'
import {
  LIVING_BANK, mcqE, matchQ, orderQ, tfQ, speakQ,
  pick, pickOthers, shuffle, randInt, type Gen, type Rand,
  makeLesson, unitDef,
} from './helpers'

/* local banks */
const SAFE = ['wear safety goggles', 'follow the teacher instructions', 'keep the workspace tidy', 'tell an adult if it looks dangerous']
const UNSAFE = ['run with scissors', 'touch chemicals with bare hands', 'eat or taste materials', 'ignore the safety rules']
const NONLIVING = ['rock', 'paper', 'plastic bottle', 'water', 'sun', 'cloud']
const JOBS: Record<string, string> = { doctor: '👩‍⚕️', chef: '👨‍🍳', farmer: '👨‍🌾', teacher: '👩‍🏫', builder: '👷', engineer: '👩‍🔬' }
const QUESTIONS = ['How can I make the tallest tower?', 'What happens if I add more water?']
const NOT_QUESTIONS = ['I think it will be blue.', 'What is the right answer?', 'Blue is the best colour.']

function gSafe(rand: Rand): Question {
  return mcqE(rand, 'Which is a SAFE thing to do in a science investigation?', pick(rand, SAFE), UNSAFE, { visual: { type: 'emoji-group', emojis: ['🔬', '🧪'] } })
}
function gUnSafeTF(rand: Rand): Question {
  const u = pick(rand, UNSAFE)
    return tfQ('True or false: a good science rule.', `Scientists should ${u}.`, false)
}
function gSortLiving(rand: Rand): Question {
  const living = shuffle(rand, Object.keys(LIVING_BANK)).slice(0, 4)
  const nonliving = shuffle(rand, NONLIVING).slice(0, 4)
  return matchQ(rand, 'Is it LIVING or NON-LIVING?', [
    ...living.map((a) => ({ left: a, right: 'living' })),
    ...nonliving.map((a) => ({ left: a, right: 'non-living' })),
  ])
}
function gPredict(rand: Rand): Question {
  const item = pick(rand, ['ice cube in a warm room', 'seed in a dark cupboard', 'seedling in sunlight', 'bread left out'])
  return tfQ('Science skill', `Before testing, guessing what ${item} will do is called making a prediction.`, true, { visual: { type: 'emoji-group', emojis: ['🔮', '🧊', '🌱'] } })
}
function gGoodQuestion(rand: Rand): Question {
  return mcqE(rand, 'Which sentence is a good science QUESTION?', pick(rand, QUESTIONS), NOT_QUESTIONS, { visual: { type: 'emoji-group', emojis: ['❓'] } })
}
function gScientist(rand: Rand): Question {
  const a = pick(rand, Object.keys(JOBS))
  return mcqE(rand, 'Which person uses science in their job?', a, pickOthers(rand, Object.keys(JOBS), a, 3), { visual: { type: 'emoji-group', emojis: [JOBS[a] ?? '👷'] } })
}
function gGraph(rand: Rand): Question {
  const cats = randInt(rand, 1, 8), dogs = randInt(rand, 1, 8), birds = randInt(rand, 4, 9), fish = randInt(rand, 1, 5)
  const counts = { cats, dogs, birds, fish }
  const top = (Object.entries(counts) as [string, number][]).reduce((a, b) => (b[1] > a[1] ? b : a))[0]
  const bot = (Object.entries(counts) as [string, number][]).reduce((a, b) => (b[1] < a[1] ? b : a))[0]
  return mcqE(rand, `On Sam's chart, ${top} were seen most and ${bot} least. Which sentence fits?`, `${top} more than ${bot}`, [`${bot} more than ${top}`], { visual: { type: 'emoji-group', emojis: ['📊'] } })
}
function gModel(rand: Rand): Question {
  const t = rand() < 0.5
    return tfQ('Science skill', t ? 'A model is a smaller, simpler copy used to learn about a real thing.' : 'A model looks exactly like the real thing and is heavier.', t, { visual: { type: 'emoji-group', emojis: ['⚙️'] } })
}
function gCycle(rand: Rand): Question {
  const cycles = { plant: ['seed', 'root', 'sprout', 'flower', 'seeds'], butterfly: ['egg', 'caterpillar', 'chrysalis', 'butterfly'], frog: ['egg', 'tadpole', 'froglet', 'frog'] }
  const [name, stages] = pick(rand, Object.entries(cycles) as [string, string[]][])
  return orderQ(`Put the ${name}'s life stages in order, start to finish.`, stages, { audioText: `Order the ${name} life stages.` })
}
function gSpeak(rand: Rand): Question {
  return speakQ('Say this aloud', 'Scientists ask questions and look for answers.')
}

const S1 = [gSafe, gUnSafeTF, gSortLiving, gPredict, gGoodQuestion, gScientist, gGraph, gModel, gCycle, gSpeak]

const lessons = [
  makeLesson('s1l1', 'Safe Scientists', ['2TWSc.04', '2TWSc.01'], 'tails', 'Lab coat on!', 'Good scientists stay safe — goggles, tidy space, and ask an adult if something looks dangerous.', [gSafe, gUnSafeTF], gUnSafeTF),
  makeLesson('s1l2', 'Good Science Questions', ['2TWSp.01'], 'amy', 'Ask away!', 'A science question is answerable. "How tall?" yes. "I like blue" is not!', [gGoodQuestion, gScientist], gGoodQuestion),
  makeLesson('s1l3', 'Make a Prediction', ['2TWSp.02'], 'knuckles', 'Guess the outcome!', 'Before you test, make a prediction — it is even fun when you are wrong!', [gPredict, gModel], gPredict),
  makeLesson('s1l4', 'Sort It Out', ['2TWSc.01'], 'sonic', 'Sorter badge!', 'Group things by what is alike — living vs non-living.', [gSortLiving, gGraph], gSortLiving),
  makeLesson('s1l5', 'Models & Diagrams', ['2TWSm.01', '2TWSm.02', '2TWSm.03'], 'shadow', 'Mini me!', 'A model is a smaller copy that helps us learn. A diagram shows how parts join.', [gModel, gSpeak], gModel),
]

const boss = makeLesson('s1boss', 'Scientist Boss', ['2TWSm.01-03', '2TWSp.01-02', '2TWSc.01', '2TWSa.03'], 'eggman', 'BOSS TIME!', 'Eggman wired his lab with a safety trap! Sort, predict and read the charts to beat him.', [gSafe, gSortLiving, gGraph, gCycle], gGraph)

export const UNIT_S1 = unitDef('s1', 1, 'Being a Scientist', 'Cambridge 2TWS (questions, predictions, sorting, tables, models) + 2SIC', '#58cc02', '🧪', [...lessons, boss])
