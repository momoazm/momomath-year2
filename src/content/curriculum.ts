import type { LessonDef, Question, UnitDef } from './types'
import { hashString, mulberry32, type Rand } from './rng'
import * as G from './generators'

type Gen = (rand: Rand) => Question

function makeLesson(
  id: string,
  title: string,
  objectiveCodes: string[],
  mascotId: LessonDef['intro']['mascotId'],
  introTitle: string,
  introBody: string,
  gens: Gen[],
  challenge?: Gen,
): LessonDef {
  return {
    id,
    title,
    objectiveCodes,
    intro: { mascotId, title: introTitle, body: introBody },
    generate(n, seed) {
      const rand = mulberry32(hashString(id) ^ (seed * 2654435761))
      const out: Question[] = []
      for (let i = 0; i < n - 1; i++) out.push(gens[i % gens.length](rand))
      const finalGen = challenge ?? gens[(n - 1) % gens.length]
      out.push(finalGen(rand))
      return out
    },
  }
}

const Q_PER_LESSON = 10

/* ===== UNIT 1 Â· Counting & sequences (2Nc) ========================= */
const u1Lessons: LessonDef[] = [
  makeLesson('u1l1', 'Count Everything', ['2Nc.01'], 'sonic', "Let's count!", 'Tap each picture and say the number out loud. One tap = one number!', [G.gCountObjects, G.gEstimateCount], G.gCountObjects),
  makeLesson('u1l2', 'One More, One Less', ['2Nc.04'], 'sonic', 'Step up, step back!', 'Count on and back in ones from ANY number!', [G.gOneMoreLess, G.gSkipSequence], G.gOneMoreLess),
  makeLesson('u1l3', 'Skip Counting', ['2Nc.04'], 'tails', 'Hopping stones!', 'Count on and back in 2s, 5s and 10s - starting anywhere!', [G.gSkipSequence]),
  makeLesson('u1l4', 'Odd or Even', ['2Nc.05'], 'knuckles', 'Two teams!', 'Even numbers share into 2 equal teams. Odd ones leave one out!', [G.gOddEven, G.gCompare], G.gOddEven),
  makeLesson('u1l5', 'What Comes Next?', ['2Nc.06'], 'amy', 'Sequence sleuth!', 'Spot the rule and extend the number sequence!', [G.gSkipSequence, G.gPatternNext], G.gSkipSequence),
  makeLesson('u1l6', 'Estimate It!', ['2Nc.03'], 'shadow', 'Quick guess!', 'About how many? Group into fives and tens to estimate!', [G.gEstimateCount, G.gCountObjects], G.gEstimateCount),
]
const u1Boss = makeLesson('u1boss', 'Counting Boss', ['2Nc.01'], 'eggman', 'BOSS TIME!', 'Prove you can count, estimate and sequence anything!', [G.gCountObjects, G.gOneMoreLess, G.gSkipSequence, G.gOddEven], G.gSkipSequence)

/* ===== UNIT 2 Â· Place value, ordering & rounding (2Np) ============= */
const u2Lessons: LessonDef[] = [
  makeLesson('u2l1', 'Tens & Ones', ['2Np.01', '2Np.02'], 'sonic', 'Place value power!', 'A number like 34 is tens and ones. Zero holds a place too!', [G.gTensOnes, G.gCompare], G.gTensOnes),
  makeLesson('u2l2', 'Ten More, Ten Less', ['2Np.02'], 'knuckles', 'Jump by tens!', 'Only the tens digit changes - watch it move!', [G.gTenMoreLess, G.gTensOnes], G.gTenMoreLess),
  makeLesson('u2l3', 'Crocodile Compare', ['2Np.03'], 'tails', 'Who wins?', 'The hungry crocodile mouth always opens toward the BIGGER number!', [G.gCompare, G.gOrderNumbers], G.gCompare),
  makeLesson('u2l4', 'Line Them Up', ['2Np.03'], 'tails', 'Order up!', 'Order 2-digit numbers smallest first - or biggest first!', [G.gOrderNumbers]),
  makeLesson('u2l5', 'Ordinal Numbers', ['2Np.04'], 'amy', 'Race positions!', 'First, second, third - who finished where?', [G.gOrdinals, G.gOrderNumbers], G.gOrdinals),
  makeLesson('u2l6', 'Round to the Nearest 10', ['2Np.05'], 'shadow', 'Round the corner!', '45 rounds UP to 50! Ones digit 5 or more means round up!', [G.gRoundTen, G.gCompare], G.gRoundTen),
]
const u2Boss = makeLesson('u2boss', 'Place Value Boss', ['2Np.01'], 'eggman', 'BOSS TIME!', 'Compose, compare, order and round like a champion!', [G.gTensOnes, G.gTenMoreLess, G.gCompare, G.gOrderNumbers, G.gOrdinals, G.gRoundTen], G.gRoundTen)

/* ===== UNIT 3 Â· Number names & complements (2Ni.01-.03) ============ */
const u3Lessons: LessonDef[] = [
  makeLesson('u3l1', 'Number Names', ['2Ni.01'], 'amy', 'Word wizard!', 'Read and write number names - forty-two, ninety!', [G.gNumWords, G.gMatchNumWords], G.gMatchNumWords),
  makeLesson('u3l2', 'Complements of 10', ['2Ni.03'], 'sonic', 'Perfect pairs!', '7 + ? = 10. Pairs that snap together to make ten!', [G.gBonds10]),
  makeLesson('u3l3', 'Complements of 20', ['2Ni.03'], 'knuckles', 'Bonds to 20!', '13 + ? = 20. The ones must make ten!', [G.gBondsTo20]),
  makeLesson('u3l4', 'Complements to 100', ['2Ni.03'], 'tails', 'All the way to 100!', '43 + ? = 100. Ones make ten, tens make ninety!', [G.gTensBond100], G.gTensBond100),
  makeLesson('u3l5', 'Inverse Detective', ['2Ni.02'], 'shadow', 'Flip it!', 'Addition and subtraction undo each other. Use one to solve the other!', [G.gMissingPart, G.gMissingAddend], G.gMissingPart),
]
const u3Boss = makeLesson('u3boss', 'Complements Boss', ['2Ni.03'], 'eggman', 'BOSS TIME!', 'Names, bonds and inverses - complete the set!', [G.gNumWords, G.gBonds10, G.gBondsTo20, G.gTensBond100, G.gMissingPart], G.gTensBond100)

/* ===== UNIT 4 Â· Addition & subtraction (2Ni.04) ==================== */
const u4Lessons: LessonDef[] = [
  makeLesson('u4l1', 'Plus Ones', ['2Ni.04'], 'sonic', 'Gentle climb!', 'Add ones onto a 2-digit number - no crossing tens yet!', [G.gAddTwoDigitPlus1]),
  makeLesson('u4l2', 'Two-Digit Pairs', ['2Ni.04'], 'tails', 'Double digits!', 'Add two 2-digit numbers - tens with tens, ones with ones!', [G.gAddTwoDigitPairs]),
  makeLesson('u4l3', 'Two-Digit Takeaway', ['2Ni.04'], 'knuckles', 'Power subtraction!', 'Subtract the tens first, then the ones!', [G.gSubTwoDigit]),
  makeLesson('u4l4', 'Within 20 Mix', ['2Ni.04'], 'amy', 'Quick fire!', 'Add and subtract within 20 as fast as you can!', [G.gAddWithin20, G.gSubWithin20]),
  makeLesson('u4l5', 'Story Sums', ['2Ni.04'], 'tails', 'Maths stories!', 'Real problems hide maths inside. Find the clue words!', [G.gAddWordProblem]),
  makeLesson('u4l6', 'Difference Stories', ['2Ni.04'], 'shadow', 'How many more?', '"How many more?" asks for the DIFFERENCE.', [G.gDifferenceProblem]),
  makeLesson('u4l7', 'Which is More?', ['2Ni.02'], 'shadow', 'Sum showdown!', 'Which side wins WITHOUT working everything out?', [G.gCompareSums], G.gCompareSums),
]
const u4Boss = makeLesson('u4boss', 'Calculation Boss', ['2Ni.04'], 'eggman', 'BOSS TIME!', 'Estimate, add and subtract every kind of number!', [G.gAddTwoDigitPairs, G.gSubTwoDigit, G.gAddWordProblem, G.gDifferenceProblem], G.gSubTwoDigit)

/* ===== UNIT 5 Â· Multiplication (2Ni.05, 2Ni.07) ==================== */
const u5Lessons: LessonDef[] = [
  makeLesson('u5l1', 'Repeated Addition', ['2Ni.05'], 'amy', 'Add, add, add!', '3 + 3 + 3 is just 3 Ã— 3 in disguise!', [G.gRepeatedAddition], G.gRepeatedAddition),
  makeLesson('u5l2', 'Arrays', ['2Ni.05'], 'shadow', 'Rows of fun!', 'Rows Ã— columns = total. Multiplication you can SEE!', [G.gArrayVisual]),
  makeLesson('u5l3', 'Times Tables', ['2Ni.07'], 'tails', 'Fast adding!', 'Know your 1, 2, 5 and 10 times tables by heart!', [G.gTimesTable, G.gTimesTableExtended], G.gTimesTable),
  makeLesson('u5l4', 'Table Challenge', ['2Ni.07'], 'knuckles', 'Table tamer!', 'Mixed tables up to 10 groups - how fast are you?', [G.gTimesTableExtended], G.gTimesTableExtended),
]
const u5Boss = makeLesson('u5boss', 'Multiplication Boss', ['2Ni.07'], 'eggman', 'BOSS TIME!', 'The multiplication mega-mix. Ready, set, GO!', [G.gRepeatedAddition, G.gArrayVisual, G.gTimesTable, G.gTimesTableExtended], G.gTimesTableExtended)

/* ===== UNIT 6 Â· Division (2Ni.06) ================================== */
const u6Lessons: LessonDef[] = [
  makeLesson('u6l1', 'Sharing Fairly', ['2Ni.06'], 'amy', 'Fair shares!', 'Dividing means sharing equally between friends.', [G.gSharing]),
  makeLesson('u6l2', 'Grouping', ['2Ni.06'], 'knuckles', 'Make teams!', 'How many groups of 5 fit inside 20?', [G.gGroupingDivision], G.gGroupingDivision),
  makeLesson('u6l3', 'Inverse Genius', ['2Ni.02'], 'shadow', 'Work backwards!', 'If 5 Ã— 7 = 35, then 35 Ã· 5 = 7. Flip your tables!', [G.gInverseTimes], G.gInverseTimes),
  makeLesson('u6l4', 'Divide Like a Pro', ['2Ni.06'], 'sonic', 'Share and group!', 'Sharing AND grouping together - division mastery!', [G.gSharing, G.gGroupingDivision, G.gInverseTimes], G.gInverseTimes),
]
const u6Boss = makeLesson('u6boss', 'Division Boss', ['2Ni.06'], 'eggman', 'BOSS TIME!', 'Divide everything - share it out!', [G.gSharing, G.gGroupingDivision, G.gInverseTimes], G.gInverseTimes)

/* ===== UNIT 7 Â· Fractions (2Nf) ==================================== */
const u7Lessons: LessonDef[] = [
  makeLesson('u7l1', 'Equal Parts', ['2Nf.01'], 'amy', 'Pizza party!', 'Cut a whole into EQUAL parts - halves, quarters, thirds!', [G.gShadedFractionName]),
  makeLesson('u7l2', 'Half & Quarter as Division', ['2Nf.03'], 'amy', 'Split in two!', 'Half means sharing into 2 equal groups. A quarter means 4!', [G.gHalfOfNumber, G.gQuarterOfNumber], G.gHalfOfNumber),
  makeLesson('u7l3', 'Fractions of Sets', ['2Nf.02', '2Nf.04'], 'knuckles', 'Share the stars!', 'Fractions work on sets of things too!', [G.gFractionOfSet]),
  makeLesson('u7l4', 'Fraction Twins', ['2Nf.05'], 'tails', 'Same amount, new name!', 'Two quarters equals one half! Meet equivalent fractions!', [G.gEquivFractions], G.gEquivFractions),
  makeLesson('u7l5', 'Combining Fractions', ['2Nf.06'], 'shadow', 'Fraction builder!', 'Wholes, halves and quarters combine to make new fractions!', [G.gCombineFractions], G.gCombineFractions),
]
const u7Boss = makeLesson('u7boss', 'Fraction Boss', ['2Nf.05'], 'eggman', 'BOSS TIME!', 'The fraction finale - slice through it!', [G.gShadedFractionName, G.gHalfOfNumber, G.gQuarterOfNumber, G.gEquivFractions, G.gCombineFractions], G.gCombineFractions)

/* ===== UNIT 8 Â· Money (2Nm) ======================================== */
const u8Lessons: LessonDef[] = [
  makeLesson('u8l1', 'Coin Values & Totals', ['2Nm.01'], 'amy', 'Coin counting!', 'Recognise coins and add them up. Start with the biggest!', [G.gCoinsTotal]),
  makeLesson('u8l2', 'Compare Combinations', ['2Nm.02'], 'tails', 'Which pile wins?', 'Is 50p more than 20p + 20p + 5p? Add up to find out!', [G.gMoneyCompare], G.gMoneyCompare),
  makeLesson('u8l3', 'Giving Change', ['2Nm.02'], 'sonic', 'Shop keeper!', 'Change from 20p, 50p or even Â£1!', [G.gChangeFrom], G.gCoinsTotal),
]
const u8Boss = makeLesson('u8boss', 'Money Boss', ['2Nm.02'], 'eggman', 'BOSS TIME!', 'Count it, compare it, change it!', [G.gCoinsTotal, G.gMoneyCompare, G.gChangeFrom], G.gChangeFrom)

/* ===== UNIT 9 Â· Time (2Gt) ========================================= */
const u9Lessons: LessonDef[] = [
  makeLesson('u9l1', 'Units of Time', ['2Gt.01'], 'knuckles', 'Seconds or hours?', '60 minutes in an hour, 24 hours in a day - order them all!', [G.gTimeUnitsFacts, G.gDurationUnits]),
  makeLesson('u9l2', 'Clocks to Five Minutes', ['2Gt.02'], 'tails', 'Minute hand pro!', "O'clock, quarter past, half past, twenty-five to... read ANY clock!", [G.gClockRead, G.gTimeFiveMin], G.gTimeFiveMin),
  makeLesson('u9l3', 'Calendars', ['2Gt.03'], 'knuckles', 'Calendar kid!', 'Seven days a week, twelve months a year - in order!', [G.gDayOrder, G.gMonthsBetween], G.gMonthsBetween),
  makeLesson('u9l4', 'Time Champion', ['2Gt.02'], 'shadow', 'Beat the clock!', 'Every time skill mixed into one race!', [G.gClockRead, G.gTimeFiveMin, G.gDayOrder], G.gTimeFiveMin),
]
const u9Boss = makeLesson('u9boss', 'Time Boss', ['2Gt.02'], 'eggman', 'BOSS TIME!', 'Outread Father Time himself!', [G.gTimeUnitsFacts, G.gDurationUnits, G.gClockRead, G.gTimeFiveMin, G.gMonthsBetween], G.gTimeFiveMin)

/* ===== UNIT 10 Â· Shapes (2Gg.01-.05, .08, .02) ===================== */
const u10Lessons: LessonDef[] = [
  makeLesson('u10l1', '2D Shape Detective', ['2Gg.01'], 'shadow', 'Shape squad!', 'Sides, vertices and regular polygons - count the clues!', [G.gShapeFacts]),
  makeLesson('u10l2', '3D Shapes', ['2Gg.05'], 'shadow', 'Solid shapes!', 'Faces, edges and vertices - balls, boxes and cans!', [G.gShapeFacts], G.gShapeFacts),
  makeLesson('u10l3', 'Circles & Everyday Shapes', ['2Gg.02', '2Gg.08'], 'tails', 'Shapes everywhere!', 'Every point of a circle sits the same distance from its centre!', [G.gShapeFacts], G.gShapeFacts),
]
const u10Boss = makeLesson('u10boss', 'Shape Boss', ['2Gg.01'], 'eggman', 'BOSS TIME!', 'Flat and solid shapes - name them all!', [G.gShapeFacts], G.gShapeFacts)

/* ===== UNIT 11 Â· Symmetry, turns & position (2Gg.09-.11, 2Gp) ====== */
const u11Lessons: LessonDef[] = [
  makeLesson('u11l1', 'Mirror Lines', ['2Gg.09'], 'amy', 'Perfect reflection!', 'Fold it in your mind - do both halves match exactly?', [G.gSymmetry], G.gSymmetry),
  makeLesson('u11l2', 'Race Turns', ['2Gg.11'], 'tails', 'Quarter turns!', 'Whole, half and quarter turns - clockwise and anticlockwise!', [G.gTurnsDirections]),
  makeLesson('u11l3', 'Spinning Shapes', ['2Gg.10'], 'knuckles', 'Spin counter!', 'How many times does a square look identical in one full turn?', [G.gRotationalTurns], G.gRotationalTurns),
  makeLesson('u11l4', 'Mirrors & Movement', ['2Gp.01', '2Gp.02'], 'sonic', 'Left becomes right!', 'Describe movement AND predict mirror reflections!', [G.gMirrorReflections, G.gPositionWords], G.gPositionWords),
]
const u11Boss = makeLesson('u11boss', 'Position Boss', ['2Gg.09'], 'eggman', 'BOSS TIME!', 'Turn, reflect, spin and move - conquer space itself!', [G.gSymmetry, G.gTurnsDirections, G.gRotationalTurns, G.gPositionWords], G.gSymmetry)

/* ===== UNIT 12 Â· Length, mass & capacity (2Gg.03/.06/.07/.12) ===== */
const u12Lessons: LessonDef[] = [
  makeLesson('u12l1', 'Longer & Heavier', ['2Gg.03', '2Gg.06'], 'knuckles', 'Size showdown!', 'Comparing lengths and masses - which is more?', [G.gMeasureFacts]),
  makeLesson('u12l2', 'Choose the Unit', ['2Gg.07', '2Gg.12'], 'knuckles', 'Right tool!', 'cm measures length. g weighs things. ml fills cups!', [G.gMeasureFacts]),
  makeLesson('u12l3', 'Hot & Cold', ['2Gg.12'], 'tails', 'Thermometer time!', 'A scale is a number line - read between the marks!', [G.gTemperature], G.gTemperature),
  makeLesson('u12l4', 'Measure Stories', ['2Gg.03', '2Gg.06'], 'amy', 'Measuring tales!', 'Word problems about rulers, ribbons and jugs!', [G.gMeasureWordProblem]),
]
const u12Boss = makeLesson('u12boss', 'Measure Boss', ['2Gg.03'], 'eggman', 'BOSS TIME!', 'The measure marathon!', [G.gMeasureFacts, G.gTemperature, G.gMeasureWordProblem], G.gMeasureWordProblem)

/* ===== UNIT 13 Â· Statistics & probability (2Ss, 2Sp) =============== */
const u13Lessons: LessonDef[] = [
  makeLesson('u13l1', 'Tally Charts', ['2Ss.02'], 'shadow', 'Count with marks!', 'Four lines then a cross - every bundle is FIVE!', [G.gTallyRead, G.gPictogram], G.gTallyRead),
  makeLesson('u13l2', 'Pictograms & Block Graphs', ['2Ss.02'], 'shadow', 'Picture data!', 'Each picture stands for a number of things!', [G.gPictogram, G.gChartCompare], G.gPictogram),
  makeLesson('u13l3', 'Describe the Data', ['2Ss.03'], 'tails', 'Read & compare!', 'Charts tell stories. Compare the columns to win!', [G.gChartCompare, G.gSortingDiagrams], G.gChartCompare),
  makeLesson('u13l4', 'Venn & Carroll Sorting', ['2Ss.02'], 'amy', 'Circle sorter!', 'Sort by TWO rules at once - even AND less than 50!', [G.gSortingDiagrams], G.gSortingDiagrams),
  makeLesson('u13l5', 'Random or Regular?', ['2Sp.01', '2Sp.02'], 'sonic', 'Chance experiments!', 'Some things are certain, some impossible - most are random!', [G.gChanceLanguage], G.gChanceLanguage),
]
const u13Boss = makeLesson('u13boss', 'Data Boss', ['2Ss.03'], 'eggman', 'BOSS TIME!', 'Every chart. Every puzzle. GO!', [G.gTallyRead, G.gPictogram, G.gChartCompare, G.gSortingDiagrams, G.gChanceLanguage], G.gSortingDiagrams)

export const UNITS: UnitDef[] = [
  { id: 'u1', order: 1, title: 'Counting & Sequences', subtitle: 'Cambridge 2Nc Â· estimate Â· odd/even', color: '#58cc02', icon: 'ðŸ”¢', lessons: [...u1Lessons, u1Boss], bossLessonIds: [u1Boss.id] },
  { id: 'u2', order: 2, title: 'Place Value & Rounding', subtitle: 'Cambridge 2Np Â· ordinals Â· rounding', color: '#1cb0f6', icon: 'ðŸ§®', lessons: [...u2Lessons, u2Boss], bossLessonIds: [u2Boss.id] },
  { id: 'u3', order: 3, title: 'Number Names & Complements', subtitle: 'Cambridge 2Ni.01-.03 Â· bonds to 100', color: '#ce82ff', icon: 'ðŸ”¤', lessons: [...u3Lessons, u3Boss], bossLessonIds: [u3Boss.id] },
  { id: 'u4', order: 4, title: 'Addition & Subtraction', subtitle: 'Cambridge 2Ni.04 Â· within 100', color: '#ff9600', icon: 'âž•', lessons: [...u4Lessons, u4Boss], bossLessonIds: [u4Boss.id] },
  { id: 'u5', order: 5, title: 'Multiplication', subtitle: 'Cambridge 2Ni.05/.07 Â· tables 1-2-5-10', color: '#00cd9c', icon: 'âœ–ï¸', lessons: [...u5Lessons, u5Boss], bossLessonIds: [u5Boss.id] },
  { id: 'u6', order: 6, title: 'Division', subtitle: 'Cambridge 2Ni.06 Â· sharing & grouping', color: '#0ea5e9', icon: 'âš“', lessons: [...u6Lessons, u6Boss], bossLessonIds: [u6Boss.id] },
  { id: 'u7', order: 7, title: 'Fractions', subtitle: 'Cambridge 2Nf Â· equivalence Â· operators', color: '#fb7185', icon: 'ðŸ•', lessons: [...u7Lessons, u7Boss], bossLessonIds: [u7Boss.id] },
  { id: 'u8', order: 8, title: 'Money', subtitle: 'Cambridge 2Nm Â· combinations & change', color: '#eab308', icon: 'ðŸ’°', lessons: [...u8Lessons, u8Boss], bossLessonIds: [u8Boss.id] },
  { id: 'u9', order: 9, title: 'Time', subtitle: 'Cambridge 2Gt Â· five minutes Â· calendars', color: '#4a90e2', icon: 'â°', lessons: [...u9Lessons, u9Boss], bossLessonIds: [u9Boss.id] },
  { id: 'u10', order: 10, title: 'Shapes', subtitle: 'Cambridge 2Gg.01-.05 Â· 2D & 3D', color: '#22d3ee', icon: 'ðŸ”·', lessons: [...u10Lessons, u10Boss], bossLessonIds: [u10Boss.id] },
  { id: 'u11', order: 11, title: 'Symmetry, Turns & Position', subtitle: 'Cambridge 2Gg.09-.11 Â· 2Gp', color: '#a3e635', icon: 'ðŸ§­', lessons: [...u11Lessons, u11Boss], bossLessonIds: [u11Boss.id] },
  { id: 'u12', order: 12, title: 'Length, Mass & Capacity', subtitle: 'Cambridge 2Gg measures Â· temperature', color: '#ffc800', icon: 'ðŸ“', lessons: [...u12Lessons, u12Boss], bossLessonIds: [u12Boss.id] },
  { id: 'u13', order: 13, title: 'Statistics & Probability', subtitle: 'Cambridge 2Ss Â· 2Sp Â· chance', color: '#f97316', icon: 'ðŸ“Š', lessons: [...u13Lessons, u13Boss], bossLessonIds: [u13Boss.id] },
]

export const ALL_LESSONS: Record<string, { unit: UnitDef; lesson: LessonDef }> = {}
for (const u of UNITS) for (const l of u.lessons) ALL_LESSONS[l.id] = { unit: u, lesson: l }

export const QUESTIONS_PER_LESSON = Q_PER_LESSON

