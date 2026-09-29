/** PLAN 169b — Year-1 science curriculum, built on the statutory DfE
 *  Year-1 programme of study (see src/content/syllabus/y1/science.ts for
 *  the extracted source): plants, animals including humans, everyday
 *  materials, seasonal changes and the Years 1-2 "Working scientifically"
 *  methods.
 *
 *  Objective codes use the app's mirrored scheme with the Year-1 prefix:
 *  `1TWSc.NN` for programme-of-study content (01-34, mirrored from the
 *  Year-2 2TWSc.NN families) and `1TWSp.NN` for working-scientifically
 *  practice skills (01-05) — the same convention as 169a's `1Rw`/`1Ww`
 *  and 167's `1Nc`.
 *
 *  Lesson ids are prefixed `y1s` so they can never collide with Year-2
 *  science `s<N>l<M>` ids, Year-1 english `y1e…` or Year-1 maths `y1u…`
 *  (progress maps are keyed by lesson id). */
import type { LessonDef, Question, UnitDef } from '../../../types'
import type { Rand } from '../../../rng'
import { buildLessonQueue } from '../../../lessonQueue'
import * as Y1 from './generators'

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

/* ===== UNIT 1 · Working Scientists (1TWSp) ======================== */
const u1Lessons: LessonDef[] = [
  makeLesson('y1s1l1', 'Ask a Science Question', ['1TWSp.01'], 'sonic', 'Ask why!', 'Scientists start by asking a real question.', ['A question starts with what, how or why.', 'Science questions can be answered by looking.', 'Pick the real science question.'], [Y1.gY1ScQuestion, Y1.gY1ScSpeakQuestion], Y1.gY1ScQuestion),
  makeLesson('y1s1l2', 'Make a Prediction', ['1TWSp.02'], 'tails', 'Guess first!', 'Before we test, we say what we think will happen.', ['Look at what is set up.', 'Say what you think will happen.', 'That guess is your prediction.'], [Y1.gY1ScPredict, Y1.gY1ScQuestion], Y1.gY1ScPredict),
  makeLesson('y1s1l3', 'Living or Not?', ['1TWSc.01'], 'amy', 'Sort it!', 'Living things grow. Things like rocks do not.', ['Does it grow and need food?', 'Sort living and not living.', 'Plants are living too.'], [Y1.gY1ScSortLiving, Y1.gY1ScSortGroups], Y1.gY1ScSortLiving),
  makeLesson('y1s1l4', 'Try a Simple Test', ['1TWSp.03'], 'knuckles', 'Test time!', 'A fair test keeps everything the same except one thing.', ['Change only one thing.', 'Keep the rest the same.', 'Watch what happens.'], [Y1.gY1ScTest, Y1.gY1ScLivingTF], Y1.gY1ScTest),
  makeLesson('y1s1l5', 'Record What We Saw', ['1TWSp.04'], 'shadow', 'Write it down!', 'Scientists draw, label and tally what they see.', ['Draw what you saw.', 'Add a label.', 'Count and tally if you can.'], [Y1.gY1ScRecord, Y1.gY1ScTest], Y1.gY1ScRecord),
]
const u1Boss = makeLesson('y1s1boss', 'Working Scientist Boss', ['1TWSp.01'], 'eggman', 'BOSS TIME!', 'Questions, predictions, tests and records - prove you work like a scientist!', ['Ask a real question.', 'Predict before you test.', 'Record what you saw.'], [Y1.gY1ScQuestion, Y1.gY1ScPredict, Y1.gY1ScSortLiving, Y1.gY1ScTest, Y1.gY1ScRecord], Y1.gY1ScQuestion)

/* ===== UNIT 2 · Plants & Trees (1TWSc) ============================ */
const u2Lessons: LessonDef[] = [
  makeLesson('y1s2l1', 'Wild and Garden Plants', ['1TWSc.02'], 'sonic', 'Plant hunt!', 'Some plants grow wild. People plant others in gardens.', ['Wild plants grow on their own.', 'Garden plants are planted by people.', 'Dandelions grow wild.'], [Y1.gY1WildGarden, Y1.gY1PlantPart], Y1.gY1WildGarden),
  makeLesson('y1s2l2', 'Parts of a Plant', ['1TWSc.03'], 'tails', 'Name the part!', 'Roots, stem, leaves and flowers all do a job.', ['Roots hold the plant.', 'The stem stands up.', 'Flowers make seeds.'], [Y1.gY1PlantPart, Y1.gY1GrowOrder], Y1.gY1PlantPart),
  makeLesson('y1s2l3', 'What Plants Need', ['1TWSc.04'], 'amy', 'Grow it!', 'Plants need water, light and soil to grow well.', ['Water goes into the roots.', 'Leaves drink up light.', 'Seeds need water to sprout.'], [Y1.gY1GrowOrder, Y1.gY1PlantNeeds], Y1.gY1PlantNeeds),
  makeLesson('y1s2l4', 'Parts of a Tree', ['1TWSc.05'], 'knuckles', 'Big plant!', 'A tree has a trunk, branches, leaves and roots.', ['The trunk is strong.', 'Branches hold the leaves.', 'Seeds grow into new trees.'], [Y1.gY1TreePart, Y1.gY1TreeOdd], Y1.gY1TreePart),
  makeLesson('y1s2l5', 'Deciduous and Evergreen', ['1TWSc.06'], 'shadow', 'Leaf check!', 'Some trees lose their leaves. Some keep them all year.', ['Deciduous trees drop leaves in autumn.', 'Evergreen trees keep their leaves.', 'Oak loses its leaves.'], [Y1.gY1DeciduousTF, Y1.gY1TreeOdd], Y1.gY1DeciduousTF),
]
const u2Boss = makeLesson('y1s2boss', 'Plant Boss', ['1TWSc.03'], 'eggman', 'BOSS TIME!', 'Wild plants, parts, needs, trees and leaf types - the plant grand tour!', ['Name every part.', 'Seeds grow into plants.', 'Evergreen means keep leaves.'], [Y1.gY1PlantPart, Y1.gY1WildGarden, Y1.gY1GrowOrder, Y1.gY1TreePart, Y1.gY1DeciduousTF], Y1.gY1PlantPart)

/* ===== UNIT 3 · Animals Big & Small (1TWSc) ======================= */
const u3Lessons: LessonDef[] = [
  makeLesson('y1s3l1', 'Meet the Animals', ['1TWSc.07'], 'sonic', 'Animal race!', 'Name the animal, then think about where it lives.', ['Look at the animal.', 'Say its name.', 'Think about its home.'], [Y1.gY1NameAnimal, Y1.gY1PetWild], Y1.gY1NameAnimal),
  makeLesson('y1s3l2', 'Five Animal Groups', ['1TWSc.08'], 'tails', 'Group up!', 'Mammals, birds, fish, amphibians and reptiles.', ['Mammals have fur.', 'Birds have feathers.', 'Fish live in water.'], [Y1.gY1ClassMatch, Y1.gY1ClassOdd], Y1.gY1ClassMatch),
  makeLesson('y1s3l3', 'Odd One in the Group', ['1TWSc.09'], 'amy', 'Spot it!', 'Three animals belong. One does not fit.', ['Name the group.', 'Check every animal.', 'One is different.'], [Y1.gY1ClassOdd, Y1.gY1Cover], Y1.gY1ClassOdd),
  makeLesson('y1s3l4', 'Where Animals Live', ['1TWSc.10'], 'knuckles', 'Habitat!', 'Where an animal lives is its habitat.', ['Ponds are homes for frogs.', 'Birds build nests.', 'Ants live in the ground.'], [Y1.gY1Habitat, Y1.gY1NameAnimal], Y1.gY1Habitat),
  makeLesson('y1s3l5', 'Fur, Feathers and Scales', ['1TWSc.11'], 'shadow', 'Cover up!', 'Animals are covered in fur, feathers or scales.', ['Birds have feathers.', 'Fish have scales.', 'Mammals have fur.'], [Y1.gY1Cover, Y1.gY1ClassMatch], Y1.gY1Cover),
]
const u3Boss = makeLesson('y1s3boss', 'Animal Group Boss', ['1TWSc.08'], 'eggman', 'BOSS TIME!', 'Names, groups, habitats and coverings - the animal kingdom challenge!', ['Name it first.', 'Which of the five groups?', 'Fur, feathers or scales?'], [Y1.gY1NameAnimal, Y1.gY1ClassMatch, Y1.gY1ClassOdd, Y1.gY1Habitat, Y1.gY1Cover], Y1.gY1ClassMatch)

/* ===== UNIT 4 · Bodies & Senses (1TWSc) =========================== */
const u4Lessons: LessonDef[] = [
  makeLesson('y1s4l1', 'Our Body Parts', ['1TWSc.12'], 'sonic', 'Body scan!', 'Head, arms, legs, hands and feet - know your body.', ['Start at your head.', 'Arms bend at the elbow.', 'Legs bend at the knee.'], [Y1.gY1BodyPart, Y1.gY1TapBody], Y1.gY1BodyPart),
  makeLesson('y1s4l2', 'Five Senses', ['1TWSc.13'], 'tails', 'Sense time!', 'Sight, hearing, smell, taste and touch.', ['We see with our eyes.', 'We hear with our ears.', 'We smell with our nose.'], [Y1.gY1SenseUse, Y1.gY1SenseMatch], Y1.gY1SenseUse),
  makeLesson('y1s4l3', 'Sense Organ Match', ['1TWSc.14'], 'amy', 'Match it!', 'Match every sense to the body part you use.', ['Find the sense.', 'Find its body part.', 'Match them up.'], [Y1.gY1SenseMatch, Y1.gY1SenseSpeak], Y1.gY1SenseMatch),
  makeLesson('y1s4l4', 'Growing Up', ['1TWSc.15'], 'knuckles', 'Grow big!', 'We grow from baby to child to grown-up.', ['Everyone starts as a baby.', 'Then child, then grown-up.', 'Put them in order.'], [Y1.gY1HumanGrow, Y1.gY1BodyOdd, Y1.gY1BodyPart], Y1.gY1HumanGrow),
  makeLesson('y1s4l5', 'True or False: Bodies', ['1TWSc.16'], 'shadow', 'Fact check!', 'Read each sentence. Is it true or false?', ['Read it slowly.', 'Think about your own body.', 'True or false?'], [Y1.gY1BodyTF, Y1.gY1SenseUse], Y1.gY1BodyTF),
]
const u4Boss = makeLesson('y1s4boss', 'Body Boss', ['1TWSc.13'], 'eggman', 'BOSS TIME!', 'Parts, senses, organs and odd ones out - know your body inside out!', ['Name the part.', 'Which sense uses it?', 'True or false?'], [Y1.gY1BodyPart, Y1.gY1SenseUse, Y1.gY1SenseMatch, Y1.gY1TapBody, Y1.gY1BodyOdd], Y1.gY1SenseUse)

/* ===== UNIT 5 · What Animals Eat (1TWSc) ========================== */
const u5Lessons: LessonDef[] = [
  makeLesson('y1s5l1', 'Meat Eaters and Plant Eaters', ['1TWSc.17'], 'sonic', 'Diet time!', 'Carnivores eat meat. Herbivores eat plants. Omnivores eat both.', ['Meat eater = carnivore.', 'Plant eater = herbivore.', 'Both = omnivore.'], [Y1.gY1DietName, Y1.gY1DietFood], Y1.gY1DietName),
  makeLesson('y1s5l2', 'Match the Diet', ['1TWSc.18'], 'tails', 'Sort diets!', 'Match each animal to what it eats.', ['Think of its food.', 'Meat, plants or both?', 'Match it up.'], [Y1.gY1DietMatch, Y1.gY1DietOdd], Y1.gY1DietMatch),
  makeLesson('y1s5l3', 'What They Eat', ['1TWSc.19'], 'amy', 'Food check!', 'Cows eat grass. Lions eat meat. Know the menu.', ['Picture the animal.', 'What food does it pick?', 'Choose the right food.'], [Y1.gY1DietFood, Y1.gY1DietOdd], Y1.gY1DietFood),
  makeLesson('y1s5l4', 'Diet Sentences', ['1TWSc.20'], 'knuckles', 'Speak up!', 'Say the diet sentence out loud, nice and clear.', ['Take a breath.', 'Say the whole sentence.', 'Speak so we can hear.'], [Y1.gY1DietSpeak, Y1.gY1DietName], Y1.gY1DietSpeak),
]
const u5Boss = makeLesson('y1s5boss', 'Diet Boss', ['1TWSc.17'], 'eggman', 'BOSS TIME!', 'Carnivore, herbivore, omnivore - the eating challenge!', ['Meat, plants or both?', 'Match animal to food.', 'Say the sentence.'], [Y1.gY1DietName, Y1.gY1DietMatch, Y1.gY1DietFood, Y1.gY1DietOdd, Y1.gY1DietSpeak], Y1.gY1DietName)

/* ===== UNIT 6 · Everyday Materials (1TWSc) ======================== */
const u6Lessons: LessonDef[] = [
  makeLesson('y1s6l1', 'Objects and Materials', ['1TWSc.21'], 'sonic', 'What is it made of?', 'An object is the thing. A material is what it is made from.', ['A chair is an object.', 'Wood is a material.', 'Ask: what is it made of?'], [Y1.gY1ObjectMaterial, Y1.gY1NameMaterial], Y1.gY1ObjectMaterial),
  makeLesson('y1s6l2', 'Name That Material', ['1TWSc.22'], 'tails', 'Material names!', 'Wood, glass, metal, paper, brick, cloth, plastic, water.', ['Look at the object.', 'Which material?', 'Say its name.'], [Y1.gY1NameMaterial, Y1.gY1TapMaterial], Y1.gY1NameMaterial),
  makeLesson('y1s6l3', 'Describe the Property', ['1TWSc.23'], 'amy', 'Feel it!', 'Hard, soft, rough, smooth, shiny, stretchy, waterproof.', ['Touch it in your mind.', 'Which word fits?', 'Properties describe materials.'], [Y1.gY1Property, Y1.gY1PropMatch], Y1.gY1Property),
  makeLesson('y1s6l4', 'Group the Materials', ['1TWSc.24'], 'knuckles', 'Group up!', 'Sort materials: from plants, from the ground, liquid.', ['What is it?', 'Where does it come from?', 'Put it in a group.'], [Y1.gY1GroupMat, Y1.gY1Property], Y1.gY1GroupMat),
  makeLesson('y1s6l5', 'Match Things to Properties', ['1TWSc.25'], 'shadow', 'Property match!', 'Glass is transparent. Sponge is absorbent. Match them.', ['Think about the thing.', 'Which property does it have?', 'Match it up.'], [Y1.gY1PropMatch, Y1.gY1TapMaterial], Y1.gY1PropMatch),
]
const u6Boss = makeLesson('y1s6boss', 'Materials Boss', ['1TWSc.21'], 'eggman', 'BOSS TIME!', 'Objects, materials, properties and groups - the materials challenge!', ['What is it made of?', 'Which property fits?', 'Group it by source.'], [Y1.gY1ObjectMaterial, Y1.gY1NameMaterial, Y1.gY1Property, Y1.gY1PropMatch, Y1.gY1TapMaterial], Y1.gY1NameMaterial)

/* ===== UNIT 7 · Materials at Work (1TWSc) ========================= */
const u7Lessons: LessonDef[] = [
  makeLesson('y1s7l1', 'Choose the Best Material', ['1TWSc.26'], 'sonic', 'Best pick!', 'Windows need glass. Spoons need metal. Pick the best one.', ['What will it be used for?', 'Which material works best?', 'Pick one.'], [Y1.gY1ChooseMaterial, Y1.gY1UseMatch], Y1.gY1ChooseMaterial),
  makeLesson('y1s7l2', 'Fair Simple Tests', ['1TWSc.27'], 'tails', 'Test it!', 'Find a fair way to test a material.', ['What are we testing?', 'Keep it fair.', 'Choose the right test.'], [Y1.gY1BestTest, Y1.gY1BendStretch], Y1.gY1BestTest),
  makeLesson('y1s7l3', 'Bendy or Stiff', ['1TWSc.28'], 'amy', 'Bend it!', 'Some materials bend and stretch. Some are stiff.', ['Rubber bends.', 'Rocks are stiff.', 'Pull gently to test stretch.'], [Y1.gY1BendStretch, Y1.gY1ChooseMaterial], Y1.gY1BendStretch),
  makeLesson('y1s7l4', 'Materials Around Us', ['1TWSc.29'], 'knuckles', 'Look around!', 'Materials are everywhere: doors, mirrors, taps, walls.', ['Look at the room.', 'What is it made of?', 'Match thing to material.'], [Y1.gY1AroundYou, Y1.gY1UseMatch], Y1.gY1AroundYou),
]
const u7Boss = makeLesson('y1s7boss', 'Materials at Work Boss', ['1TWSc.26'], 'eggman', 'BOSS TIME!', 'Choose, test, bend and match - materials do real jobs!', ['Pick the best material.', 'Test it fairly.', 'Bendy or stiff?'], [Y1.gY1ChooseMaterial, Y1.gY1UseMatch, Y1.gY1BestTest, Y1.gY1BendStretch, Y1.gY1AroundYou], Y1.gY1ChooseMaterial)

/* ===== UNIT 8 · Seasons & Weather (1TWSc) ========================= */
const u8Lessons: LessonDef[] = [
  makeLesson('y1s8l1', 'The Four Seasons', ['1TWSc.30'], 'sonic', 'Season cycle!', 'Spring, summer, autumn, winter - they repeat every year.', ['The year has four seasons.', 'They always come in order.', 'Start where the prompt says.'], [Y1.gY1SeasonOrder, Y1.gY1SeasonWeather], Y1.gY1SeasonOrder),
  makeLesson('y1s8l2', 'Signs of the Seasons', ['1TWSc.31'], 'tails', 'Season signs!', 'Leaves fall in autumn. Flowers bloom in spring.', ['Read the sign.', 'Which season fits?', 'Match them up.'], [Y1.gY1SeasonMatch, Y1.gY1DayLength], Y1.gY1SeasonMatch),
  makeLesson('y1s8l3', 'Season Weather', ['1TWSc.32'], 'amy', 'Weather words!', 'Sunny, rainy, windy, snowy, foggy - name the weather.', ['Look at the sky.', 'Which weather word?', 'Say it out loud.'], [Y1.gY1SeasonWeather, Y1.gY1WeatherName], Y1.gY1WeatherName),
  makeLesson('y1s8l4', 'Dress for the Season', ['1TWSc.33'], 'knuckles', 'Wrap up!', 'Coats and gloves for winter. Shorts for summer.', ['Which season is it?', 'What clothes fit?', 'Pick the right ones.'], [Y1.gY1SeasonClothes, Y1.gY1WeatherOdd], Y1.gY1SeasonClothes),
  makeLesson('y1s8l5', 'Longer Days, Shorter Nights', ['1TWSc.34'], 'shadow', 'Day length!', 'Days get long in summer and short in winter.', ['Summer days are long.', 'Winter nights are long.', 'Days grow longer after winter.'], [Y1.gY1DayLength, Y1.gY1WeatherName], Y1.gY1DayLength),
]
const u8Boss = makeLesson('y1s8boss', 'Seasons Boss', ['1TWSc.30'], 'eggman', 'BOSS TIME!', 'Seasons, weather, clothes and day length - the year grand finale!', ['Order the four seasons.', 'Name the weather.', 'Days change with the year.'], [Y1.gY1SeasonOrder, Y1.gY1SeasonMatch, Y1.gY1SeasonWeather, Y1.gY1SeasonClothes, Y1.gY1DayLength], Y1.gY1SeasonWeather)

export const SCIENCE_Y1_UNITS: UnitDef[] = [
  { id: 'y1s1', order: 1, title: 'Working Scientists', subtitle: 'DfE Y1 working scientifically · ask · predict · test · record', color: '#0ea5e9', icon: '🔬', lessons: [...u1Lessons, u1Boss], bossLessonIds: [u1Boss.id] },
  { id: 'y1s2', order: 2, title: 'Plants & Trees', subtitle: 'DfE Y1 plants · wild & garden · structure · deciduous & evergreen', color: '#22c55e', icon: '🌱', lessons: [...u2Lessons, u2Boss], bossLessonIds: [u2Boss.id] },
  { id: 'y1s3', order: 3, title: 'Animals Big & Small', subtitle: 'DfE Y1 animals · five groups · diets · habitats · coverings', color: '#f59e0b', icon: '🐾', lessons: [...u3Lessons, u3Boss], bossLessonIds: [u3Boss.id] },
  { id: 'y1s4', order: 4, title: 'Bodies & Senses', subtitle: 'DfE Y1 humans · body parts · five senses · growing up', color: '#ec4899', icon: '🧍', lessons: [...u4Lessons, u4Boss], bossLessonIds: [u4Boss.id] },
  { id: 'y1s5', order: 5, title: 'What Animals Eat', subtitle: 'DfE Y1 animals · carnivores · herbivores · omnivores', color: '#ef4444', icon: '🍽️', lessons: [...u5Lessons, u5Boss], bossLessonIds: [u5Boss.id] },
  { id: 'y1s6', order: 6, title: 'Everyday Materials', subtitle: 'DfE Y1 everyday materials · object vs material · properties', color: '#8b5cf6', icon: '🧱', lessons: [...u6Lessons, u6Boss], bossLessonIds: [u6Boss.id] },
  { id: 'y1s7', order: 7, title: 'Materials at Work', subtitle: 'DfE Y1 materials · choose the best · simple fair tests · bending', color: '#14b8a6', icon: '🔧', lessons: [...u7Lessons, u7Boss], bossLessonIds: [u7Boss.id] },
  { id: 'y1s8', order: 8, title: 'Seasons & Weather', subtitle: 'DfE Y1 seasonal changes · four seasons · weather · day length', color: '#6366f1', icon: '🍂', lessons: [...u8Lessons, u8Boss], bossLessonIds: [u8Boss.id] },
]

export const SCIENCE_Y1_ALL_LESSONS: Record<string, { unit: UnitDef; lesson: LessonDef }> = {}
for (const u of SCIENCE_Y1_UNITS) for (const l of u.lessons) SCIENCE_Y1_ALL_LESSONS[l.id] = { unit: u, lesson: l }
