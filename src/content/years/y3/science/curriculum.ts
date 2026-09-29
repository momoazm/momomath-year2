/** PLAN 169e — Year-3 science curriculum, built on the statutory DfE
 *  Year-3 programme of study (see src/content/syllabus/y3/science.ts for
 *  the extracted source): working scientifically, plant parts and functions,
 *  flowers and life cycles, animal nutrition, skeletons and muscles, rocks
 *  and soils, light, and forces and magnets.
 *
 *  Objective codes use the app's mirrored scheme with the Year-3 prefix:
 *  `3TWSc.NN` for programme-of-study content (01-28) and `3TWSp.NN` for
 *  working-scientifically practice skills (01-05) — the same convention as
 *  Year-1 science (`1TWSc`/`1TWSp`, PLAN 169b).
 *
 *  Lesson ids are prefixed `y3s` so they can never collide with Year-3
 *  maths `y3u…`, Year-3 english `y3e…`, Year-2 science `s<N>l<M>` or any
 *  other year/subject (progress maps are keyed by lesson id). */
import type { LessonDef, Question, UnitDef } from '../../../types'
import type { Rand } from '../../../rng'
import { buildLessonQueue } from '../../../lessonQueue'
import * as Y3 from './generators'

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

/* ===== UNIT 1 · Working Scientists (3TWSp) ======================= */
const u1Lessons: LessonDef[] = [
  makeLesson('y3s1l1', 'Ask Relevant Questions', ['3TWSp.01'], 'sonic', 'Ask why!', 'Scientists start by asking a question the world can answer.', ['A real question can be answered by looking.', 'Science questions ask how or why.', 'Spot the question that is about the world.'], [Y3.gY3ScQuestion, Y3.gY3ScSpeak], Y3.gY3ScQuestion),
  makeLesson('y3s1l2', 'Plan a Fair Test', ['3TWSp.02'], 'tails', 'Keep it fair!', 'A fair test changes one thing and keeps the rest the same.', ['Change only one thing.', 'Keep everything else the same.', 'Then the result tells the truth.'], [Y3.gY3FairTest, Y3.gY3ScQuestion], Y3.gY3FairTest),
  makeLesson('y3s1l3', 'Observe and Measure', ['3TWSp.03'], 'amy', 'Measure it!', 'Scientists observe carefully and measure with standard units.', ['Watch in order, step by step.', 'Use a thermometer, ruler or clock.', 'Standard units let everyone compare.'], [Y3.gY3Measure, Y3.gY3FairTest], Y3.gY3Measure),
  makeLesson('y3s1l4', 'Record and Present', ['3TWSp.04'], 'knuckles', 'Show it!', 'Bar charts, tables, keys and labelled diagrams share what we found.', ['Write or draw what you see.', 'A table keeps numbers tidy.', 'A key names the unknown.'], [Y3.gY3Record, Y3.gY3ScEquipment], Y3.gY3Record),
  makeLesson('y3s1l5', 'Conclude and Improve', ['3TWSp.05'], 'shadow', 'What did we learn?', 'A conclusion reads the evidence. An improvement makes the next test better.', ['Read your results honestly.', 'Say what the evidence shows.', 'Plan a better test next time.'], [Y3.gY3Conclusion, Y3.gY3Improve], Y3.gY3Conclusion),
]
const u1Boss = makeLesson('y3s1boss', 'Working Scientist Boss', ['3TWSp.01'], 'eggman', 'BOSS TIME!', 'Questions, fair tests, measures, records and conclusions - prove you work like a scientist!', ['Ask a question the world can answer.', 'Keep the test fair.', 'Conclude from the evidence.'], [Y3.gY3ScQuestion, Y3.gY3FairTest, Y3.gY3Measure, Y3.gY3Record, Y3.gY3Conclusion], Y3.gY3Conclusion)

/* ===== UNIT 2 · Plant Parts & Needs (3TWSc) ======================= */
const u2Lessons: LessonDef[] = [
  makeLesson('y3s2l1', 'Every Part Has a Job', ['3TWSc.01'], 'sonic', 'Job time!', 'Roots, stems, leaves and flowers each do a job for the plant.', ['Roots absorb water and nutrients.', 'The stem carries water up.', 'Leaves catch light for food.'], [Y3.gY3PartFunction, Y3.gY3PlantPartJob], Y3.gY3PartFunction),
  makeLesson('y3s2l2', 'What Plants Need', ['3TWSc.02'], 'tails', 'Grow it!', 'Plants need air, light, water, nutrients and room to grow.', ['Take water and nutrients from soil.', 'Requirements vary from plant to plant.', 'A cactus needs less water than a rose.'], [Y3.gY3PlantNeeds, Y3.gY3PlantTF], Y3.gY3PlantNeeds),
  makeLesson('y3s2l3', 'Water on the Move', ['3TWSc.03'], 'amy', 'Watch the water!', 'A white carnation in coloured water shows water travelling up the stem.', ['Water enters at the roots.', 'It travels up the stem.', 'Coloured water makes the trip visible.'], [Y3.gY3WaterTransport, Y3.gY3PlantTF], Y3.gY3WaterTransport),
  makeLesson('y3s2l4', 'Structure and Function', ['3TWSc.04'], 'knuckles', 'Link them!', 'Match every structure to the function it performs.', ['Name the structure.', 'Say the job it does.', 'Link structure to function.'], [Y3.gY3PlantPartJob, Y3.gY3PartFunction, Y3.gY3PlantNeeds], Y3.gY3PartFunction),
]
const u2Boss = makeLesson('y3s2boss', 'Plant Boss', ['3TWSc.01'], 'eggman', 'BOSS TIME!', 'Parts, jobs, needs and water travel - the plant grand tour!', ['Every part has a job.', 'Plants need five things.', 'Water travels up the stem.'], [Y3.gY3PartFunction, Y3.gY3PlantPartJob, Y3.gY3PlantNeeds, Y3.gY3WaterTransport, Y3.gY3PlantTF], Y3.gY3PlantNeeds)

/* ===== UNIT 3 · Flowers & Life Cycles (3TWSc) ===================== */
const u3Lessons: LessonDef[] = [
  makeLesson('y3s3l1', 'Pollination', ['3TWSc.05'], 'sonic', 'Pollen time!', 'Bees and other insects carry pollen so flowers can make seeds.', ['Pollen moves from male to female part.', 'Bees carry pollen flower to flower.', 'Pollination comes before seeds.'], [Y3.gY3Pollination, Y3.gY3LifeCycleOrder], Y3.gY3Pollination),
  makeLesson('y3s3l2', 'Seed Formation', ['3TWSc.06'], 'tails', 'Make a seed!', 'After pollination, flowers form seeds for the next generation.', ['Seeds form after pollination.', 'A seed holds a tiny baby plant.', 'The seed coat protects it while it waits.'], [Y3.gY3SeedForm, Y3.gY3LifeCycleOrder], Y3.gY3SeedForm),
  makeLesson('y3s3l3', 'Seed Dispersal', ['3TWSc.07'], 'amy', 'Travel far!', 'Seeds travel by wind, water and animals so new plants get space.', ['Wind carries light seeds.', 'Animals carry seeds on fur.', 'Far from the parent means more light and room.'], [Y3.gY3Dispersal, Y3.gY3DispersalMatch], Y3.gY3Dispersal),
  makeLesson('y3s3l4', 'The Flower Cycle', ['3TWSc.08'], 'knuckles', 'Round we go!', 'Bud, flower, pollination, seed - then the cycle starts again.', ['Order the stages.', 'Pollination leads to seeds.', 'Dispersal starts the next plant.'], [Y3.gY3LifeCycleOrder, Y3.gY3Pollination, Y3.gY3SeedForm], Y3.gY3LifeCycleOrder),
]
const u3Boss = makeLesson('y3s3boss', 'Flower Cycle Boss', ['3TWSc.05'], 'eggman', 'BOSS TIME!', 'Pollination, seeds, dispersal and cycles - the flower life challenge!', ['Pollen travels first.', 'Seeds form after pollination.', 'Seeds travel far.'], [Y3.gY3Pollination, Y3.gY3SeedForm, Y3.gY3Dispersal, Y3.gY3LifeCycleOrder, Y3.gY3DispersalMatch], Y3.gY3Dispersal)

/* ===== UNIT 4 · Animal Nutrition (3TWSc) ========================== */
const u4Lessons: LessonDef[] = [
  makeLesson('y3s4l1', 'What Animals Eat', ['3TWSc.09'], 'sonic', 'Diet time!', 'Herbivores, carnivores and omnivores eat different diets.', ['Herbivores eat plants.', 'Carnivores eat meat.', 'Omnivores eat both.'], [Y3.gY3CompareDiet, Y3.gY3FoodGroup], Y3.gY3CompareDiet),
  makeLesson('y3s4l2', 'Food and Growth', ['3TWSc.10'], 'tails', 'Fuel up!', 'Animals cannot make their own food, so nutrition comes from eating.', ['Bread gives energy to move.', 'Fish gives protein to grow.', 'Fruit and vegetables give vitamins.'], [Y3.gY3FoodGroup, Y3.gY3NutritionTF], Y3.gY3FoodGroup),
  makeLesson('y3s4l3', 'Balanced and Healthy', ['3TWSc.11'], 'amy', 'Eat well!', 'The right types and the right amount of food keep us healthy.', ['Choose better breakfasts.', 'Sugar alone feeds nobody well.', 'Amount matters as much as type.'], [Y3.gY3HealthyChoice, Y3.gY3NutritionTF], Y3.gY3HealthyChoice),
  makeLesson('y3s4l4', 'Plan a Healthy Day', ['3TWSc.12'], 'knuckles', 'Plan the menu!', 'Design a day of meals with the right types and amounts.', ['Mix the food groups.', 'Keep the amounts right.', 'Compare two diets fairly.'], [Y3.gY3HealthyChoice, Y3.gY3CompareDiet, Y3.gY3FoodGroup], Y3.gY3HealthyChoice),
]
const u4Boss = makeLesson('y3s4boss', 'Nutrition Boss', ['3TWSc.09'], 'eggman', 'BOSS TIME!', 'Diets, food groups, amounts and balance - the nutrition challenge!', ['Name the diet type.', 'Match food to its job.', 'Balance types and amounts.'], [Y3.gY3CompareDiet, Y3.gY3FoodGroup, Y3.gY3HealthyChoice, Y3.gY3NutritionTF], Y3.gY3CompareDiet)

/* ===== UNIT 5 · Skeletons & Muscles (3TWSc) ======================= */
const u5Lessons: LessonDef[] = [
  makeLesson('y3s5l1', 'Jobs for Bones', ['3TWSc.13'], 'sonic', 'Bone check!', 'Bones give support and protection, and muscles make you move.', ['The skull protects your head.', 'Ribs protect your chest.', 'Muscles pull your bones.'], [Y3.gY3SkeletonPart, Y3.gY3SkeletonJob], Y3.gY3SkeletonPart),
  makeLesson('y3s5l2', 'Muscles Move You', ['3TWSc.14'], 'tails', 'Pull time!', 'Muscles pull bones so bodies bend, stretch and run.', ['Muscles work in pairs.', 'They pull bones to move you.', 'Bends and stretches need muscles.'], [Y3.gY3SkeletonTF, Y3.gY3MovementCompare], Y3.gY3SkeletonTF),
  makeLesson('y3s5l3', 'Animals With and Without', ['3TWSc.15'], 'amy', 'Who has bones?', 'Some animals have hard skeletons. Some have none at all.', ['Snails and worms have no hard bones.', 'Fish swim instead of walking.', 'Every animal still moves its way.'], [Y3.gY3MovementCompare, Y3.gY3SkeletonTF], Y3.gY3MovementCompare),
  makeLesson('y3s5l4', 'What If No Skeleton?', ['3TWSc.16'], 'knuckles', 'No bones?', 'A body without a skeleton would have no support inside.', ['Skeletons support the body.', 'They also protect soft parts.', 'No bones means no shape.'], [Y3.gY3NoSkeleton, Y3.gY3SkeletonPart, Y3.gY3SkeletonJob], Y3.gY3NoSkeleton),
]
const u5Boss = makeLesson('y3s5boss', 'Skeleton Boss', ['3TWSc.13'], 'eggman', 'BOSS TIME!', 'Bones, muscles, movement and skeletons - the body structure challenge!', ['Name the bone and its job.', 'Muscles pull bones.', 'Some animals have no bones.'], [Y3.gY3SkeletonPart, Y3.gY3SkeletonJob, Y3.gY3SkeletonTF, Y3.gY3MovementCompare, Y3.gY3NoSkeleton], Y3.gY3SkeletonPart)

/* ===== UNIT 6 · Rocks & Soils (3TWSc) ============================ */
const u6Lessons: LessonDef[] = [
  makeLesson('y3s6l1', 'Group the Rocks', ['3TWSc.17'], 'sonic', 'Rock groups!', 'Rocks group by appearance and simple physical properties.', ['Check grains, crystals and fossils.', 'Feel for rough or smooth.', 'Then classify the rock.'], [Y3.gY3RockProperty, Y3.gY3RockName], Y3.gY3RockProperty),
  makeLesson('y3s6l2', 'Fossils in Rock', ['3TWSc.18'], 'tails', 'Fossil time!', 'Fossils form when living things get trapped within rock.', ['The creature dies.', 'Layers cover and trap it.', 'Rock keeps the remains.'], [Y3.gY3FossilForm, Y3.gY3FossilTF], Y3.gY3FossilForm),
  makeLesson('y3s6l3', 'How Soil Forms', ['3TWSc.19'], 'amy', 'Soil story!', 'Soil comes from rocks and organic matter, mixed over a long time.', ['Rocks wear into tiny bits.', 'Dead matter mixes in.', 'Soil builds up on top.'], [Y3.gY3SoilForm, Y3.gY3SoilTF], Y3.gY3SoilForm),
  makeLesson('y3s6l4', 'Rock Review', ['3TWSc.20'], 'knuckles', 'Rock quiz!', 'Name the rock, read its properties, and order its fossils.', ['Name granite, chalk, slate, clay.', 'Read the physical properties.', 'Order fossil and soil steps.'], [Y3.gY3RockName, Y3.gY3RockProperty, Y3.gY3FossilForm], Y3.gY3RockName),
]
const u6Boss = makeLesson('y3s6boss', 'Rock Boss', ['3TWSc.17'], 'eggman', 'BOSS TIME!', 'Properties, rock names, fossils and soil - the rocks challenge!', ['Group by properties.', 'Trapped in rock means fossil.', 'Soil starts as rock bits.'], [Y3.gY3RockProperty, Y3.gY3RockName, Y3.gY3FossilForm, Y3.gY3FossilTF, Y3.gY3SoilForm], Y3.gY3RockName)

/* ===== UNIT 7 · Light (3TWSc) ==================================== */
const u7Lessons: LessonDef[] = [
  makeLesson('y3s7l1', 'We Need Light', ['3TWSc.21'], 'sonic', 'Lights on!', 'We need light to see, and dark is the absence of light.', ['Light lets our eyes see.', 'Dark means light is absent.', 'The sun is a light source.'], [Y3.gY3LightNeed, Y3.gY3Reflect], Y3.gY3LightNeed),
  makeLesson('y3s7l2', 'Light Bounces', ['3TWSc.22'], 'tails', 'Reflect it!', 'Light reflects off surfaces so we can see mirrors and shiny things.', ['Light bounces off a mirror.', 'That bounce is reflection.', 'Shiny surfaces reflect the most.'], [Y3.gY3Reflect, Y3.gY3LightNeed], Y3.gY3Reflect),
  makeLesson('y3s7l3', 'Sun Safety', ['3TWSc.23'], 'amy', 'Eyes safe!', 'The sun is dangerous to our eyes, so we protect them in bright light.', ['Never look straight at the sun.', 'Dark glasses protect your eyes.', 'Stay in the shade at midday.'], [Y3.gY3SunSafe, Y3.gY3ShadowTF], Y3.gY3SunSafe),
  makeLesson('y3s7l4', 'Shadows', ['3TWSc.24'], 'knuckles', 'Shadow play!', 'Opaque objects block light and cast shadows that change size.', ['An opaque object blocks light.', 'Move the light, move the shadow.', 'Nearer light means a bigger shadow.'], [Y3.gY3ShadowForm, Y3.gY3ShadowSize, Y3.gY3ShadowTF], Y3.gY3ShadowSize),
]
const u7Boss = makeLesson('y3s7boss', 'Light Boss', ['3TWSc.21'], 'eggman', 'BOSS TIME!', 'Seeing, reflection, sun safety and shadows - the light challenge!', ['Light is needed to see.', 'Reflection bounces light.', 'Shadows need blocked light.'], [Y3.gY3LightNeed, Y3.gY3Reflect, Y3.gY3SunSafe, Y3.gY3ShadowForm, Y3.gY3ShadowSize], Y3.gY3ShadowForm)

/* ===== UNIT 8 · Forces & Magnets (3TWSc) ========================= */
const u8Lessons: LessonDef[] = [
  makeLesson('y3s8l1', 'Push and Pull', ['3TWSc.25'], 'sonic', 'Force time!', 'A force is a push or a pull, and friction slows things on surfaces.', ['Opening a door needs contact.', 'Magnets act at a distance.', 'Friction slows a sliding book.'], [Y3.gY3ForceContact, Y3.gY3SurfaceMove], Y3.gY3ForceContact),
  makeLesson('y3s8l2', 'Magnet Facts', ['3TWSc.26'], 'tails', 'Magnet magic!', 'Magnets attract magnetic materials without touching them.', ['Iron and steel are magnetic.', 'Wood is not magnetic.', 'Magnets act at a distance.'], [Y3.gY3MagnetTF, Y3.gY3MagnetMatch], Y3.gY3MagnetTF),
  makeLesson('y3s8l3', 'Two Poles', ['3TWSc.27'], 'amy', 'Pole power!', 'Every magnet has two poles: like poles repel, opposite poles attract.', ['North and south attract.', 'Two north poles repel.', 'Predict before you test.'], [Y3.gY3PolePredict, Y3.gY3MagnetTF], Y3.gY3PolePredict),
  makeLesson('y3s8l4', 'Magnets Around You', ['3TWSc.28'], 'knuckles', 'Find the magnet!', 'Bar, ring, button and horseshoe magnets do jobs every day.', ['Fridge magnets hold notes.', 'A compass points north.', 'Magnets pick up steel clips.'], [Y3.gY3MagnetUse, Y3.gY3SurfaceMove, Y3.gY3ForceContact], Y3.gY3MagnetUse),
]
const u8Boss = makeLesson('y3s8boss', 'Magnets Boss', ['3TWSc.25'], 'eggman', 'BOSS TIME!', 'Forces, surfaces, poles and magnet uses - the forces challenge!', ['Push or pull makes a force.', 'Like poles repel.', 'Magnets work at a distance.'], [Y3.gY3ForceContact, Y3.gY3MagnetTF, Y3.gY3PolePredict, Y3.gY3MagnetUse, Y3.gY3SurfaceMove], Y3.gY3PolePredict)

export const SCIENCE_Y3_UNITS: UnitDef[] = [
  { id: 'y3s1', order: 1, title: 'Working Scientists', subtitle: 'DfE Y3 working scientifically · questions · fair tests · conclusions', color: '#0ea5e9', icon: '🔬', lessons: [...u1Lessons, u1Boss], bossLessonIds: [u1Boss.id] },
  { id: 'y3s2', order: 2, title: 'Plant Parts & Needs', subtitle: 'DfE Y3 plants · structure and function · requirements · water transport', color: '#22c55e', icon: '🌱', lessons: [...u2Lessons, u2Boss], bossLessonIds: [u2Boss.id] },
  { id: 'y3s3', order: 3, title: 'Flowers & Life Cycles', subtitle: 'DfE Y3 plants · pollination · seed formation · seed dispersal', color: '#d946ef', icon: '🌸', lessons: [...u3Lessons, u3Boss], bossLessonIds: [u3Boss.id] },
  { id: 'y3s4', order: 4, title: 'Animal Nutrition', subtitle: 'DfE Y3 animals · diet types · food groups · right amounts', color: '#f59e0b', icon: '🍎', lessons: [...u4Lessons, u4Boss], bossLessonIds: [u4Boss.id] },
  { id: 'y3s5', order: 5, title: 'Skeletons & Muscles', subtitle: 'DfE Y3 humans · support and protection · movement · no-bone animals', color: '#8b5cf6', icon: '🦴', lessons: [...u5Lessons, u5Boss], bossLessonIds: [u5Boss.id] },
  { id: 'y3s6', order: 6, title: 'Rocks & Soils', subtitle: 'DfE Y3 rocks · grouping by properties · fossils · soil from rocks', color: '#f97316', icon: '🪨', lessons: [...u6Lessons, u6Boss], bossLessonIds: [u6Boss.id] },
  { id: 'y3s7', order: 7, title: 'Light', subtitle: 'DfE Y3 light · seeing · reflection · sun safety · shadows', color: '#06b6d4', icon: '☀️', lessons: [...u7Lessons, u7Boss], bossLessonIds: [u7Boss.id] },
  { id: 'y3s8', order: 8, title: 'Forces & Magnets', subtitle: 'DfE Y3 forces · surfaces · attract and repel · magnetic materials', color: '#ef4444', icon: '🧲', lessons: [...u8Lessons, u8Boss], bossLessonIds: [u8Boss.id] },
]

export const SCIENCE_Y3_ALL_LESSONS: Record<string, { unit: UnitDef; lesson: LessonDef }> = {}
for (const u of SCIENCE_Y3_UNITS) for (const l of u.lessons) SCIENCE_Y3_ALL_LESSONS[l.id] = { unit: u, lesson: l }
