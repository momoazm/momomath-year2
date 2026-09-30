/** PLAN 169h — Year-4 science curriculum, built on the statutory DfE
 *  Year-4 programme of study (see src/content/syllabus/y4/science.ts for
 *  the extracted source): working scientifically, living things and their
 *  habitats, the digestive system, teeth, food chains, states of matter,
 *  sound, and electricity.
 *
 *  Objective codes use the app's mirrored scheme with the Year-4 prefix:
 *  `4TWSc.NN` for programme-of-study content (01-28) and `4TWSp.NN` for
 *  working-scientifically practice skills (01-05) — the same convention as
 *  Year-3 science (`3TWSc`/`3TWSp`, PLAN 169e) and Year-1 science
 *  (`1TWSc`/`1TWSp`, PLAN 169b).
 *
 *  Lesson ids are prefixed `y4s` so they can never collide with Year-4
 *  maths `y4u…`, Year-4 english `y4e…`, Year-3 science `y3s…` or any
 *  other year/subject (progress maps are keyed by lesson id). */
import type { LessonDef, Question, UnitDef } from '../../../types'
import type { Rand } from '../../../rng'
import { buildLessonQueue } from '../../../lessonQueue'
import * as Y4 from './generators'

type Gen = (rand: Rand) => Question

function makeLesson(
  id: string,
  title: string,
  objectiveCodes: string[],
  mascotId: LessonDef['intro']['mascotId'],
  introTitle: string,
  introBody: string,
  teach: string[],
  gens: Gen[],
  challenge?: Gen,
): LessonDef {
  return {
    id,
    title,
    objectiveCodes,
    intro: { mascotId, title: introTitle, body: introBody },
    teach,
    generate(n, seed, exclude) {
      return buildLessonQueue(id, seed, n, gens, challenge, exclude)
    },
  }
}

/* ===== UNIT 1 · Working Scientists (4TWSp) ======================= */
const u1Lessons: LessonDef[] = [
  makeLesson('y4s1l1', 'Ask a Science Question', ['4TWSp.01'], 'sonic', 'Ask why!', 'Scientists start with a question the world can answer by looking.', ['A science question can be tested.', 'Ask how or why about the world.', 'Spot the question that is about the world.'], [Y4.gY4AskQ, Y4.gY4ScReport], Y4.gY4AskQ),
  makeLesson('y4s1l2', 'Measure Accurately', ['4TWSp.02'], 'tails', 'Measure it!', 'The right tool and a careful reading make measurements accurate.', ['Use the right tool for the job.', 'Read the scale carefully.', 'Standard units let everyone compare.'], [Y4.gY4Measure, Y4.gY4Equipment], Y4.gY4Measure),
  makeLesson('y4s1l3', 'Record the Data', ['4TWSp.03'], 'amy', 'Show it!', 'Charts, tables, keys and diagrams share what we found.', ['Write or draw what you see.', 'A table keeps numbers tidy.', 'A key names the unknown.'], [Y4.gY4RecordHow, Y4.gY4Equipment], Y4.gY4RecordHow),
  makeLesson('y4s1l4', 'Report and Conclude', ['4TWSp.04'], 'knuckles', 'What did we find?', 'A conclusion reads the evidence honestly and says what it shows.', ['A conclusion reads the evidence.', 'Say what the results show.', 'Spot the evidence that fits.'], [Y4.gY4Evidence, Y4.gY4ScReport], Y4.gY4Evidence),
  makeLesson('y4s1l5', 'Predict and Improve', ['4TWSp.05'], 'shadow', 'Next time!', 'Patterns make good predictions, and improvements make the next test better.', ['Use a pattern to predict what comes next.', 'Good predictions follow the evidence.', 'An improvement fixes the weak part.'], [Y4.gY4Predict, Y4.gY4Improve], Y4.gY4Predict),
]
const u1Boss = makeLesson('y4s1boss', 'Working Scientist Boss', ['4TWSp.01'], 'eggman', 'BOSS TIME!', 'Questions, measures, records, conclusions and predictions - prove you work like a scientist!', ['Ask a testable question.', 'Measure and record carefully.', 'Conclude from the evidence.'], [Y4.gY4AskQ, Y4.gY4Measure, Y4.gY4RecordHow, Y4.gY4Evidence, Y4.gY4Predict, Y4.gY4Improve], Y4.gY4Predict)

/* ===== UNIT 2 · Living Things & Habitats (4TWSc) ================= */
const u2Lessons: LessonDef[] = [
  makeLesson('y4s2l1', 'Ways to Group', ['4TWSc.01'], 'sonic', 'Group time!', 'Living things can be grouped in a variety of useful ways.', ['Living things can be grouped many ways.', 'One group shares one feature.', 'Spot the animal that does not fit.'], [Y4.gY4GroupWays, Y4.gY4GroupOdd], Y4.gY4GroupWays),
  makeLesson('y4s2l2', 'Use a Classification Key', ['4TWSc.02'], 'tails', 'Yes or no!', 'A classification key asks yes or no questions until a name appears.', ['A key asks yes or no questions.', 'Each answer leads to the next step.', 'Follow the key down to a name.'], [Y4.gY4KeyStep, Y4.gY4KeyNext], Y4.gY4KeyStep),
  makeLesson('y4s2l3', 'Backbones and Bugs', ['4TWSc.03'], 'amy', 'Backbone check!', 'Vertebrates have a backbone; snails, slugs and insects do not.', ['Vertebrates have a backbone.', 'Fish, amphibians, reptiles, birds, mammals.', 'Snails and insects are invertebrates.'], [Y4.gY4Vertebrate, Y4.gY4ClassMatch], Y4.gY4Vertebrate),
  makeLesson('y4s2l4', 'Changing Homes', ['4TWSc.04'], 'knuckles', 'Habitat alert!', 'Environments change, and that can pose dangers to living things.', ['Environments can change over time.', 'Change can be a danger for living things.', 'People can help or harm a habitat.'], [Y4.gY4EnvChange, Y4.gY4HumanImpact], Y4.gY4EnvChange),
]
const u2Boss = makeLesson('y4s2boss', 'Habitat Boss', ['4TWSc.01'], 'eggman', 'BOSS TIME!', 'Grouping, keys, backbones and changing homes - the living things challenge!', ['Group living things many ways.', 'Keys lead to a name.', 'Changing homes pose dangers.'], [Y4.gY4GroupWays, Y4.gY4KeyStep, Y4.gY4Vertebrate, Y4.gY4ClassMatch, Y4.gY4EnvChange, Y4.gY4HumanImpact], Y4.gY4EnvChange)

/* ===== UNIT 3 · The Digestive System (4TWSc) ===================== */
const u3Lessons: LessonDef[] = [
  makeLesson('y4s3l1', 'The Digestion Journey', ['4TWSc.05'], 'sonic', 'Journey time!', 'Food travels from the mouth all the way through the gut.', ['Food starts in the mouth.', 'The gullet carries it down.', 'Stomach and intestines finish the job.'], [Y4.gY4DigestOrder, Y4.gY4DigestTF], Y4.gY4DigestOrder),
  makeLesson('y4s3l2', 'What Each Part Does', ['4TWSc.06'], 'tails', 'Job time!', 'Every part of the digestive system has a simple function.', ['Every part has a simple job.', 'Teeth chew and the tongue helps.', 'Nutrients pass into the blood.'], [Y4.gY4DigestPartJob, Y4.gY4DigestFunction], Y4.gY4DigestFunction),
  makeLesson('y4s3l3', 'Digestion True or False', ['4TWSc.07'], 'amy', 'True or false?', 'Check each claim about digestion against what really happens.', ['Digestion breaks food into nutrients.', 'The gut is one long tube.', 'Check each statement for truth.'], [Y4.gY4DigestTF, Y4.gY4DigestFunction], Y4.gY4DigestTF),
  makeLesson('y4s3l4', 'Digestion Review', ['4TWSc.08'], 'knuckles', 'Digest quiz!', 'Order the journey, match the parts, and settle the facts.', ['Order the whole journey.', 'Match each part to its job.', 'True or false checks the details.'], [Y4.gY4DigestOrder, Y4.gY4DigestPartJob, Y4.gY4DigestTF], Y4.gY4DigestFunction),
]
const u3Boss = makeLesson('y4s3boss', 'Digestion Boss', ['4TWSc.05'], 'eggman', 'BOSS TIME!', 'Journey, parts, functions and facts - the digestive system challenge!', ['Food follows one path.', 'Every part has a job.', 'Nutrients feed the body.'], [Y4.gY4DigestOrder, Y4.gY4DigestPartJob, Y4.gY4DigestFunction, Y4.gY4DigestTF], Y4.gY4DigestFunction)

/* ===== UNIT 4 · Teeth (4TWSc) ==================================== */
const u4Lessons: LessonDef[] = [
  makeLesson('y4s4l1', 'Four Types of Teeth', ['4TWSc.09'], 'sonic', 'Smile wide!', 'Humans have four types of teeth, and each type has a job.', ['Humans have four types of teeth.', 'Incisors cut and canines tear.', 'Premolars and molars grind.'], [Y4.gY4TeethType, Y4.gY4TeethJob], Y4.gY4TeethType),
  makeLesson('y4s4l2', 'What Teeth Do', ['4TWSc.10'], 'tails', 'Chomp time!', 'Each tooth type performs its own simple function.', ['Each tooth type has a job.', 'Sharp teeth tear meat apart.', 'Flat teeth crush plants small.'], [Y4.gY4TeethJob, Y4.gY4TeethCompare], Y4.gY4TeethJob),
  makeLesson('y4s4l3', 'Meat Eaters and Plant Eaters', ['4TWSc.11'], 'amy', 'Whose teeth?', 'Carnivore and herbivore teeth are shaped for their diets.', ['Carnivores have sharp teeth.', 'Herbivores have flat grinding teeth.', 'Teeth match the diet.'], [Y4.gY4TeethCompare, Y4.gY4TeethType], Y4.gY4TeethCompare),
  makeLesson('y4s4l4', 'Healthy Teeth', ['4TWSc.12'], 'knuckles', 'Brush up!', 'Brushing, less sugar and the dentist keep teeth healthy.', ['Brush morning and night.', 'Sugar causes tooth decay.', 'The dentist checks your teeth.'], [Y4.gY4TeethCare, Y4.gY4TeethType], Y4.gY4TeethCare),
]
const u4Boss = makeLesson('y4s4boss', 'Teeth Boss', ['4TWSc.09'], 'eggman', 'BOSS TIME!', 'Four types, four jobs, diets and care - the teeth challenge!', ['Name the four tooth types.', 'Each type does a job.', 'Look after them every day.'], [Y4.gY4TeethType, Y4.gY4TeethJob, Y4.gY4TeethCompare, Y4.gY4TeethCare], Y4.gY4TeethJob)

/* ===== UNIT 5 · Food Chains (4TWSc) ============================== */
const u5Lessons: LessonDef[] = [
  makeLesson('y4s5l1', 'Producer, Predator, Prey', ['4TWSc.13'], 'sonic', 'Role call!', 'Every link in a food chain is a producer, predator or prey.', ['Producers make their own food.', 'Predators hunt other animals.', 'Prey gets hunted.'], [Y4.gY4ChainRole, Y4.gY4ChainTF], Y4.gY4ChainRole),
  makeLesson('y4s5l2', 'Build the Chain', ['4TWSc.14'], 'tails', 'Link it up!', 'Arrows show energy passing from food to eater along the chain.', ['Arrows show energy flow.', 'Start with the producer.', 'Read from food to eater.'], [Y4.gY4ChainBuild, Y4.gY4ChainNext], Y4.gY4ChainBuild),
  makeLesson('y4s5l3', 'Read the Chain', ['4TWSc.15'], 'amy', 'Read the arrows!', 'A chain reads who eats whom and where the energy goes.', ['Read who eats whom.', 'The chain passes energy on.', 'One broken link changes all.'], [Y4.gY4ChainRead, Y4.gY4ChainTF], Y4.gY4ChainRead),
  makeLesson('y4s5l4', 'Chain Challenge', ['4TWSc.16'], 'knuckles', 'Chain round!', 'Arrows, roles and readers - put every food chain fact together.', ['Arrows point along the meal.', 'Name each role in the chain.', 'Spot the broken link.'], [Y4.gY4ChainNext, Y4.gY4ChainRole, Y4.gY4ChainRead], Y4.gY4ChainRole),
]
const u5Boss = makeLesson('y4s5boss', 'Food Chain Boss', ['4TWSc.13'], 'eggman', 'BOSS TIME!', 'Producers, predators, prey and arrows - the food chain challenge!', ['Start at the producer.', 'Arrows show energy flow.', 'Every link matters.'], [Y4.gY4ChainRole, Y4.gY4ChainBuild, Y4.gY4ChainNext, Y4.gY4ChainRead, Y4.gY4ChainTF], Y4.gY4ChainBuild)

/* ===== UNIT 6 · States of Matter (4TWSc) ========================= */
const u6Lessons: LessonDef[] = [
  makeLesson('y4s6l1', 'Solid, Liquid or Gas', ['4TWSc.17'], 'sonic', 'State check!', 'All matter is a solid, a liquid or a gas, each with its own behaviour.', ['Matter is solid, liquid or gas.', 'Solids hold their shape.', 'Gases fill their container.'], [Y4.gY4StateGroup, Y4.gY4StateProperty], Y4.gY4StateGroup),
  makeLesson('y4s6l2', 'Heating and Cooling', ['4TWSc.18'], 'tails', 'Hot and cold!', 'Heating and cooling change matter from one state to another.', ['Heat melts and cold freezes.', 'Temperature is read in Celsius.', 'Melting and freezing are changes of state.'], [Y4.gY4StateChange, Y4.gY4StateTemp], Y4.gY4StateChange),
  makeLesson('y4s6l3', 'Evaporation and Condensation', ['4TWSc.19'], 'amy', 'Water in the air!', 'Evaporation and condensation move water between liquid and gas.', ['Evaporation turns liquid to gas.', 'Condensation turns gas to liquid.', 'Warmth speeds evaporation up.'], [Y4.gY4Evaporate, Y4.gY4Condense], Y4.gY4Evaporate),
  makeLesson('y4s6l4', 'The Water Cycle', ['4TWSc.20'], 'knuckles', 'Round it goes!', 'Evaporation, condensation and rain drive the water cycle.', ['Water evaporates and rises.', 'It cools and forms clouds.', 'Rain brings it back down.'], [Y4.gY4WaterCycle, Y4.gY4Condense, Y4.gY4Evaporate], Y4.gY4WaterCycle),
]
const u6Boss = makeLesson('y4s6boss', 'States Boss', ['4TWSc.17'], 'eggman', 'BOSS TIME!', 'States, temperature, evaporation, condensation and the water cycle!', ['Three states of matter.', 'Heat and cold change state.', 'The water cycle never stops.'], [Y4.gY4StateGroup, Y4.gY4StateProperty, Y4.gY4StateChange, Y4.gY4StateTemp, Y4.gY4Evaporate, Y4.gY4Condense, Y4.gY4WaterCycle], Y4.gY4WaterCycle)

/* ===== UNIT 7 · Sound (4TWSc) ==================================== */
const u7Lessons: LessonDef[] = [
  makeLesson('y4s7l1', 'Sounds Start with Vibrations', ['4TWSc.21'], 'sonic', 'Vibrate!', 'Every sound is made by something vibrating.', ['Every sound starts with a vibration.', 'A drum skin wiggles to make sound.', 'No vibration means no sound.'], [Y4.gY4Vibrate, Y4.gY4SoundTF], Y4.gY4Vibrate),
  makeLesson('y4s7l2', 'Sound Travels to Your Ear', ['4TWSc.22'], 'tails', 'On the move!', 'Vibrations travel through a medium and reach your ear.', ['Vibrations travel through a medium.', 'Air, solids and liquids carry sound.', 'Your ear senses the vibrations.'], [Y4.gY4Travel, Y4.gY4SoundTF], Y4.gY4Travel),
  makeLesson('y4s7l3', 'Pitch Patterns', ['4TWSc.23'], 'amy', 'High or low?', 'Pitch follows patterns with the object making the sound.', ['Pitch depends on the vibration.', 'Fast vibrations mean high pitch.', 'Tight, short strings make high notes.'], [Y4.gY4Pitch, Y4.gY4SoundTF], Y4.gY4Pitch),
  makeLesson('y4s7l4', 'Volume and Distance', ['4TWSc.24'], 'knuckles', 'Loud or soft?', 'Volume follows vibration strength, and sound fades with distance.', ['Volume follows vibration strength.', 'Stronger vibrations sound louder.', 'Sound fades with distance.'], [Y4.gY4Volume, Y4.gY4Fainter], Y4.gY4Fainter),
]
const u7Boss = makeLesson('y4s7boss', 'Sound Boss', ['4TWSc.21'], 'eggman', 'BOSS TIME!', 'Vibrations, travel, pitch, volume and distance - the sound challenge!', ['Sounds need vibrations.', 'Pitch and volume follow patterns.', 'Distance makes sound fainter.'], [Y4.gY4Vibrate, Y4.gY4Travel, Y4.gY4Pitch, Y4.gY4Volume, Y4.gY4Fainter, Y4.gY4SoundTF], Y4.gY4Volume)

/* ===== UNIT 8 · Electricity (4TWSc) ============================== */
const u8Lessons: LessonDef[] = [
  makeLesson('y4s8l1', 'Appliances Everywhere', ['4TWSc.25'], 'sonic', 'Power up!', 'Common appliances run on electricity to do work for us.', ['Appliances run on electricity.', 'A torch and a radio need power.', 'Electricity does work for us.'], [Y4.gY4Appliance, Y4.gY4CircuitTF], Y4.gY4Appliance),
  makeLesson('y4s8l2', 'Build a Circuit', ['4TWSc.26'], 'tails', 'Wire it up!', 'Cells, wires and a lamp form a simple series circuit.', ['A circuit needs cells and wires.', 'The lamp lights in a complete loop.', 'Parts connect end to end.'], [Y4.gY4CircuitParts, Y4.gY4CircuitLoop], Y4.gY4CircuitLoop),
  makeLesson('y4s8l3', 'Switches and Complete Loops', ['4TWSc.27'], 'amy', 'Click!', 'A switch opens or closes the circuit so the lamp lights on demand.', ['A switch opens or closes the loop.', 'Open loop, lamp off.', 'Close the loop and it lights.'], [Y4.gY4CircuitTF, Y4.gY4CircuitLoop], Y4.gY4CircuitLoop),
  makeLesson('y4s8l4', 'Conductors and Insulators', ['4TWSc.28'], 'knuckles', 'Flow or stop?', 'Conductors let current flow; insulators block it.', ['Conductors let current flow.', 'Metals are good conductors.', 'Plastic and wood are insulators.'], [Y4.gY4Conductor, Y4.gY4ConductorTF], Y4.gY4Conductor),
]
const u8Boss = makeLesson('y4s8boss', 'Electricity Boss', ['4TWSc.25'], 'eggman', 'BOSS TIME!', 'Appliances, circuits, switches and conductors - the electricity challenge!', ['Complete loops light the lamp.', 'Switches open and close.', 'Metals conduct, plastic does not.'], [Y4.gY4Appliance, Y4.gY4CircuitParts, Y4.gY4CircuitLoop, Y4.gY4CircuitTF, Y4.gY4Conductor, Y4.gY4ConductorTF], Y4.gY4Conductor)

export const SCIENCE_Y4_UNITS: UnitDef[] = [
  { id: 'y4s1', order: 1, title: 'Working Scientists', subtitle: 'DfE Y4 working scientifically · questions · measuring · conclusions · predictions', color: '#f97316', icon: '🧪', lessons: [...u1Lessons, u1Boss], bossLessonIds: [u1Boss.id] },
  { id: 'y4s2', order: 2, title: 'Living Things & Habitats', subtitle: 'DfE Y4 living things · grouping · classification keys · changing environments', color: '#16a34a', icon: '🐾', lessons: [...u2Lessons, u2Boss], bossLessonIds: [u2Boss.id] },
  { id: 'y4s3', order: 3, title: 'The Digestive System', subtitle: 'DfE Y4 animals & humans · mouth to intestine · simple functions', color: '#a855f7', icon: '🍎', lessons: [...u3Lessons, u3Boss], bossLessonIds: [u3Boss.id] },
  { id: 'y4s4', order: 4, title: 'Teeth', subtitle: 'DfE Y4 animals & humans · four tooth types · carnivore & herbivore · care', color: '#ec4899', icon: '🦷', lessons: [...u4Lessons, u4Boss], bossLessonIds: [u4Boss.id] },
  { id: 'y4s5', order: 5, title: 'Food Chains', subtitle: 'DfE Y4 animals & humans · producers · predators · prey', color: '#14b8a6', icon: '🔗', lessons: [...u5Lessons, u5Boss], bossLessonIds: [u5Boss.id] },
  { id: 'y4s6', order: 6, title: 'States of Matter', subtitle: 'DfE Y4 states of matter · heating & cooling · evaporation · condensation · water cycle', color: '#eab308', icon: '🧊', lessons: [...u6Lessons, u6Boss], bossLessonIds: [u6Boss.id] },
  { id: 'y4s7', order: 7, title: 'Sound', subtitle: 'DfE Y4 sound · vibrations · travel to the ear · pitch · volume · distance', color: '#6366f1', icon: '🔊', lessons: [...u7Lessons, u7Boss], bossLessonIds: [u7Boss.id] },
  { id: 'y4s8', order: 8, title: 'Electricity', subtitle: 'DfE Y4 electricity · appliances · series circuits · switches · conductors', color: '#f43f5e', icon: '🔌', lessons: [...u8Lessons, u8Boss], bossLessonIds: [u8Boss.id] },
]

export const SCIENCE_Y4_ALL_LESSONS: Record<string, { unit: UnitDef; lesson: LessonDef }> = {}
for (const u of SCIENCE_Y4_UNITS) for (const l of u.lessons) SCIENCE_Y4_ALL_LESSONS[l.id] = { unit: u, lesson: l }
