/** PLAN 169c — Year-3 maths curriculum (DfE national curriculum Year 3).
 *  Mirrors the Year-1/Year-2 structure: units, intro cards, teach lines,
 *  generated activity queues and a boss at the end of every unit.
 *
 *  PROVENANCE:
 *  1. DfE national curriculum in England: mathematics programmes of study,
 *     key stages 1 and 2 (2014) — statutory Year-3 programme of study:
 *     count in multiples of 4, 8, 50 and 100; 10 or 100 more/less;
 *     place value and ordering to 1,000; mental and columnar add/sub with
 *     estimating and inverse checks; recall the 3, 4 and 8 times tables;
 *     short multiplication and division, scaling and correspondence;
 *     tenths, fractions of sets, equivalent fractions and same-denominator
 *     addition/subtraction; £ and p with change; m/cm/mm, kg/g, l/ml,
 *     perimeter; analogue time, Roman numerals I-XII, 12/24-hour clocks,
 *     seconds/minutes/hours, days in months and leap years; 2-D and 3-D
 *     properties, right/acute/obtuse angles, horizontal/vertical,
 *     perpendicular/parallel lines, half/three-quarter/full turns;
 *     pictograms, bar charts, tables and scales marked in 2s, 5s and 10s.
 *     https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study/
 *  2. NNS "Mathematical vocabulary" DfES 0313/2000 Year-3 checklist — every
 *     learner-facing word stays inside src/content/syllabus/y3/math.ts.
 *
 *  Objective codes follow the app's mirrored scheme with the Year-3 prefix
 *  (3Nc, 3Np, 3Ni, 3Nf, 3Nm, 3Gt, 3Gg, 3Gp, 3Ss + sequential numbers) —
 *  the same families Year 1 and Year 2 use, so codes stay stable across
 *  years. Lesson ids are prefixed `y3` so they can never collide with the
 *  Year-1 `y1u*` or Year-2 `u<N>l<M>` ids (progress maps are keyed by
 *  lesson id — PLAN 168/169c tests enforce this). */
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

/* ===== UNIT 1 · Counting in Multiples (3Nc) ======================= */
const u1Lessons: LessonDef[] = [
  makeLesson('y3u1l1', 'Counting in 4s and 8s', ['3Nc.01'], 'sonic', 'Skip counting!', 'Hop along the number line in jumps of 4 and 8.', ['Find the gap between the numbers.', 'Keep adding the same step.', '4, 8, 12 — keep going!'], [Y3.gY3CountIn], Y3.gY3CountIn),
  makeLesson('y3u1l2', 'Counting in 50s and 100s', ['3Nc.02'], 'tails', 'Big jumps!', 'Big steps make big numbers climb fast.', ['Look at the first part of each number.', '50, 100, 150 — the tens grow.', '100, 200, 300 — the hundreds grow.'], [Y3.gY3CountInLarge], Y3.gY3CountInLarge),
  makeLesson('y3u1l3', 'Ten and One Hundred More or Less', ['3Nc.03'], 'amy', 'Nudge the digits!', 'Adding 10 or 100 only changes ONE part of the number.', ['Find the tens or hundreds digit.', 'Nudge just that digit.', 'The other digits stay put.'], [Y3.gY3MoreLess], Y3.gY3MoreLess),
  makeLesson('y3u1l4', 'Pattern Rules', ['3Nc.04'], 'knuckles', 'Rule spotter!', 'Every pattern follows a rule. Find the step!', ['Compare each pair of numbers.', 'The gap IS the rule.', 'Fill the gap with the same step.'], [Y3.gY3CountInRule, Y3.gY3SequenceMissing], Y3.gY3SequenceMissing),
]
const u1Boss = makeLesson('y3u1boss', 'Counting Boss', ['3Nc.01'], 'eggman', 'BOSS TIME!', 'Count in multiples, nudge digits, crack rules — go!', ['Work out the step first.', 'Check tens and hundreds.', 'Bosses hide gaps in patterns!'], [Y3.gY3CountIn, Y3.gY3CountInLarge, Y3.gY3MoreLess, Y3.gY3CountInRule, Y3.gY3SequenceMissing], Y3.gY3CountInRule)

/* ===== UNIT 2 · Place Value to 1,000 (3Np) ======================== */
const u2Lessons: LessonDef[] = [
  makeLesson('y3u2l1', 'What Is That Digit Worth?', ['3Np.01'], 'tails', 'Digit detective!', 'Every digit in a number has its own value.', ['Find the digit first.', 'Ask: hundreds, tens or ones?', 'A 4 in the hundreds is 400.'], [Y3.gY3PlaceValue], Y3.gY3PlaceValue),
  makeLesson('y3u2l2', 'Partitioning', ['3Np.02'], 'amy', 'Split it up!', 'Break a number into hundreds, tens and ones.', ['Split off the hundreds.', 'Then the tens.', 'Whatever is left is the ones.'], [Y3.gY3Partition], Y3.gY3Partition),
  makeLesson('y3u2l3', 'Compare & Order', ['3Np.03'], 'sonic', 'Number showdown!', 'Compare hundreds first, then tens, then ones.', ['Line the numbers up.', 'Compare the hundreds digit.', 'Bigger hundreds wins.'], [Y3.gY3ComparePV, Y3.gY3OrderNums], Y3.gY3OrderNums),
  makeLesson('y3u2l4', 'Number Words', ['3Np.04'], 'shadow', 'Word wizard!', '432 is four hundred and thirty two — read them all.', ['Read the hundreds word.', 'Then the tens, then the ones.', 'Say it out loud in parts.'], [Y3.gY3NumWords, Y3.gY3MatchNumWords], Y3.gY3MatchNumWords),
]
const u2Boss = makeLesson('y3u2boss', 'Place Value Boss', ['3Np.01'], 'eggman', 'BOSS TIME!', 'Worth, split, order and words — beat them all!', ['Check each digit position.', 'Partition before you answer.', 'Compare hundreds first.'], [Y3.gY3PlaceValue, Y3.gY3Partition, Y3.gY3ComparePV, Y3.gY3OrderNums, Y3.gY3NumWords], Y3.gY3ComparePV)

/* ===== UNIT 3 · Mental Add & Subtract (3Ni) ======================= */
const u3Lessons: LessonDef[] = [
  makeLesson('y3u3l1', 'Add and Take Away 1, 10, 100', ['3Ni.01'], 'sonic', 'Quick fingers!', 'Mental hops only change one part of the number.', ['Spot the step: 1, 10 or 100.', 'Change only that digit.', 'Watch out for crossing a ten.'], [Y3.gY3MentalStep], Y3.gY3MentalStep),
  makeLesson('y3u3l2', 'Missing Numbers', ['3Ni.02'], 'knuckles', 'Fill the gap!', 'A box hides one part of the calculation. Catch it.', ['Find the total or the part.', 'Add or take away to match.', 'Check by going back.'], [Y3.gY3MissingFact], Y3.gY3MissingFact),
  makeLesson('y3u3l3', 'Bonds to 1,000', ['3Ni.03'], 'amy', 'Partner up!', 'Two parts that snap together to make 1,000.', ['Look at the hundreds.', 'They must make 10 hundreds.', 'Then check the tens and ones.'], [Y3.gY3Bonds1000], Y3.gY3Bonds1000),
  makeLesson('y3u3l4', 'Addition Stories', ['3Ni.04'], 'tails', 'Story detective!', 'Real stories hide a sum inside. Find the clue words.', ['Find ALTOGETHER or MORE.', 'Circle the two numbers.', 'Add them up.'], [Y3.gY3AddStory], Y3.gY3AddStory),
]
const u3Boss = makeLesson('y3u3boss', 'Mental Maths Boss', ['3Ni.01'], 'eggman', 'BOSS TIME!', 'Hops, gaps, bonds and stories — no written method!', ['Change one digit at a time.', 'Part and part make the whole.', 'Stories hide the sum.'], [Y3.gY3MentalStep, Y3.gY3MissingFact, Y3.gY3Bonds1000, Y3.gY3AddStory], Y3.gY3MissingFact)

/* ===== UNIT 4 · Column Addition & Subtraction (3Ni) ============== */
const u4Lessons: LessonDef[] = [
  makeLesson('y3u4l1', 'Column Addition', ['3Ni.05'], 'knuckles', 'Line it up!', 'Write the digits in neat columns, then add.', ['Line up ones under ones.', 'Add the ones first.', 'Then tens, then hundreds.'], [Y3.gY3ColumnAdd], Y3.gY3ColumnAdd),
  makeLesson('y3u4l2', 'Column Subtraction', ['3Ni.06'], 'shadow', 'Take it away!', 'Column subtraction, digit by digit.', ['Line up the columns.', 'Subtract the ones first.', 'Exchange if you need to.'], [Y3.gY3ColumnSub], Y3.gY3ColumnSub),
  makeLesson('y3u4l3', 'Estimate & Check', ['3Ni.07'], 'amy', 'Rough guess first!', 'Estimate by rounding — then check with the inverse.', ['Round to 10 or 100.', 'Add the round numbers.', 'Undo the sum with a take away.'], [Y3.gY3Estimate, Y3.gY3Inverse], Y3.gY3Inverse),
  makeLesson('y3u4l4', 'Two-Step Stories', ['3Ni.08'], 'sonic', 'Two moves!', 'Some stories need an add AND a take away.', ['Read the whole story.', 'Do the first move.', 'Then the second move.'], [Y3.gY3TwoStep], Y3.gY3TwoStep),
]
const u4Boss = makeLesson('y3u4boss', 'Column Methods Boss', ['3Ni.05'], 'eggman', 'BOSS TIME!', 'Column add, column take away, estimate and check!', ['Keep the columns neat.', 'Estimate before you start.', 'Inverse sums catch mistakes.'], [Y3.gY3ColumnAdd, Y3.gY3ColumnSub, Y3.gY3Estimate, Y3.gY3Inverse, Y3.gY3TwoStep], Y3.gY3ColumnSub)

/* ===== UNIT 5 · Times Tables 3, 4 & 8 (3Ni) ====================== */
const u5Lessons: LessonDef[] = [
  makeLesson('y3u5l1', 'Table Facts', ['3Ni.09'], 'tails', 'Speed round!', 'The 3, 4 and 8 times tables — fast as you can.', ['Count in the table.', '3, 6, 9, 12…', 'Say it until it sticks.'], [Y3.gY3Table], Y3.gY3Table),
  makeLesson('y3u5l2', 'Division Facts', ['3Ni.10'], 'knuckles', 'Undo the times!', 'Division is a times table read backwards.', ['Find the total first.', 'Ask: how many groups?', 'Think 8 × ? = 24.'], [Y3.gY3DivFact], Y3.gY3DivFact),
  makeLesson('y3u5l3', 'Turn It Around', ['3Ni.11'], 'amy', 'Same sum, swapped!', '4 × 3 is the same as 3 × 4 — turn it around.', ['Swap the numbers.', 'The answer stays.', 'Groups make the same array.'], [Y3.gY3Commutative, Y3.gY3ArrayFact], Y3.gY3ArrayFact),
  makeLesson('y3u5l4', 'Missing Table Numbers', ['3Ni.12'], 'shadow', 'Hidden factor!', 'Something is hiding in the table fact. Find it.', ['Read the answer.', 'Divide it back.', 'The missing number pops out.'], [Y3.gY3TableMissing], Y3.gY3TableMissing),
]
const u5Boss = makeLesson('y3u5boss', 'Times Tables Boss', ['3Ni.09'], 'eggman', 'BOSS TIME!', 'Tables, division, swaps and gaps — prove them!', ['Know your 3s, 4s and 8s.', 'Division runs backwards.', 'Swapping never changes it.'], [Y3.gY3Table, Y3.gY3DivFact, Y3.gY3Commutative, Y3.gY3ArrayFact, Y3.gY3TableMissing], Y3.gY3Table)

/* ===== UNIT 6 · Multiply & Divide (3Ni) =========================== */
const u6Lessons: LessonDef[] = [
  makeLesson('y3u6l1', 'Short Multiplication', ['3Ni.13'], 'sonic', 'Stack it up!', 'Multiply a big number by a single digit.', ['Write the big number on top.', 'Multiply the ones.', 'Then the tens, then hundreds.'], [Y3.gY3ShortMult], Y3.gY3ShortMult),
  makeLesson('y3u6l2', 'Short Division', ['3Ni.14'], 'tails', 'Share it out!', 'Divide by a single digit, one place at a time.', ['How many 4s in the first digit?', 'Carry the remainder.', 'Move to the next digit.'], [Y3.gY3ShortDiv], Y3.gY3ShortDiv),
  makeLesson('y3u6l3', 'Times as Big', ['3Ni.15'], 'amy', 'Scaling up!', 'Times as big means multiply — 10 times as many is ×10.', ['Spot the factor.', 'Multiply the number.', 'Ten times means add a zero.'], [Y3.gY3Scaling], Y3.gY3Scaling),
  makeLesson('y3u6l4', 'Group Stories', ['3Ni.16'], 'knuckles', 'Groups everywhere!', 'Each group has the same amount — multiply them.', ['Find how many groups.', 'Find how many in each.', 'Multiply the two.'], [Y3.gY3Correspondence], Y3.gY3Correspondence),
]
const u6Boss = makeLesson('y3u6boss', 'Multiply & Divide Boss', ['3Ni.13'], 'eggman', 'BOSS TIME!', 'Short methods, scaling and group stories — finish strong!', ['Neat columns win.', 'Scaling is a hidden multiply.', 'Groups × each = total.'], [Y3.gY3ShortMult, Y3.gY3ShortDiv, Y3.gY3Scaling, Y3.gY3Correspondence], Y3.gY3ShortMult)

/* ===== UNIT 7 · Fractions (3Nf) =================================== */
const u7Lessons: LessonDef[] = [
  makeLesson('y3u7l1', 'Tenths', ['3Nf.01'], 'tails', 'Ten slices!', 'Ten equal parts — one tenth, two tenths, three tenths…', ['Count ALL the parts first.', 'Then count the shaded ones.', 'One part out of ten is 1/10.'], [Y3.gY3Tenths], Y3.gY3Tenths),
  makeLesson('y3u7l2', 'Fractions of a Set', ['3Nf.02'], 'knuckles', 'Share the pile!', 'Find 1/4 or 3/10 of a group of things.', ['Share into equal groups.', 'Count how many groups.', 'Take the number of parts.'], [Y3.gY3FractionOf], Y3.gY3FractionOf),
  makeLesson('y3u7l3', 'Equivalent Fractions', ['3Nf.03'], 'amy', 'Same amount!', 'Different fractions can shade the SAME amount.', ['Count the shaded parts.', 'Count all the parts.', 'Same shade, same value.'], [Y3.gY3Equivalent], Y3.gY3Equivalent),
  makeLesson('y3u7l4', 'Same Denominator', ['3Nf.04'], 'shadow', 'Match the bottoms!', 'Add and take away fractions when the bottoms match.', ['The bottom number stays.', 'Add or take the tops.', 'Bigger top means more shaded.'], [Y3.gY3AddFrac, Y3.gY3SubFrac, Y3.gY3CompareFrac], Y3.gY3CompareFrac),
]
const u7Boss = makeLesson('y3u7boss', 'Fractions Boss', ['3Nf.01'], 'eggman', 'BOSS TIME!', 'Tenths, sets, equivalents and sums — slice through them!', ['Bottom number first.', 'Share into equal groups.', 'Same bottoms add easy.'], [Y3.gY3Tenths, Y3.gY3FractionOf, Y3.gY3Equivalent, Y3.gY3AddFrac, Y3.gY3SubFrac, Y3.gY3CompareFrac], Y3.gY3Equivalent)

/* ===== UNIT 8 · Money (3Nm) ======================================= */
const u8Lessons: LessonDef[] = [
  makeLesson('y3u8l1', 'Adding Prices', ['3Nm.01'], 'sonic', 'Add the pile!', 'Two prices in pence — add them up.', ['Keep everything in pence.', 'Add the pence first.', '100p makes £1.'], [Y3.gY3MoneyAdd], Y3.gY3MoneyAdd),
  makeLesson('y3u8l2', 'Giving Change', ['3Nm.02'], 'amy', 'Change, please!', 'Change is what you get BACK — take the price away.', ['Start with the money paid.', 'Take away the price.', 'The answer is your change.'], [Y3.gY3MoneyChange], Y3.gY3MoneyChange),
  makeLesson('y3u8l3', 'Coins in a Pound', ['3Nm.03'], 'tails', 'Coin counting!', 'How many coins make a whole pound?', ['There are 100 pence in £1.', 'Count up in the coin value.', 'Stop at 100.'], [Y3.gY3MoneyCoins], Y3.gY3MoneyCoins),
  makeLesson('y3u8l4', 'Money Stories', ['3Nm.04'], 'knuckles', 'Shop detective!', 'How many? How much change? Read carefully.', ['Find the price and the paid.', 'Spot the operation.', 'Watch the units: p or £.'], [Y3.gY3MoneyStory], Y3.gY3MoneyStory),
]
const u8Boss = makeLesson('y3u8boss', 'Money Boss', ['3Nm.01'], 'eggman', 'BOSS TIME!', 'Add prices, give change, count coins — spend wisely!', ['Everything in pence first.', 'Change means subtract.', '100 pence is a pound.'], [Y3.gY3MoneyAdd, Y3.gY3MoneyChange, Y3.gY3MoneyCoins, Y3.gY3MoneyStory], Y3.gY3MoneyChange)

/* ===== UNIT 9 · Time (3Gt) ======================================== */
const u9Lessons: LessonDef[] = [
  makeLesson('y3u9l1', 'Minutes on the Clock', ['3Gt.01'], 'tails', 'Minute hunter!', 'Read the hour first, then count every little minute.', ['Hour hand first.', 'Each small mark is 1 minute.', 'Count from the big number.'], [Y3.gY3ClockMinutes], Y3.gY3ClockMinutes),
  makeLesson('y3u9l2', 'Roman Hours & 24 Hours', ['3Gt.02'], 'shadow', 'Two clock systems!', 'I to XII for the old clocks — 0 to 24 for timetables.', ['V is 5, X is 10.', '13 to 24 means afternoon.', 'Add 12 for pm times.'], [Y3.gY3RomanClock, Y3.gY3Time24], Y3.gY3Time24),
  makeLesson('y3u9l3', 'How Long?', ['3Gt.03'], 'knuckles', 'Time detective!', 'Minutes in an hour, seconds in a minute — and am or pm.', ['60 seconds make a minute.', '60 minutes make an hour.', 'Small clock numbers are am.'], [Y3.gY3Duration, Y3.gY3AmPm], Y3.gY3Duration),
  makeLesson('y3u9l4', 'The Calendar', ['3Gt.04'], 'amy', 'Month master!', 'Days in each month — and the leap year surprise.', ['Thirty days has September…', 'February is the short one.', 'Leap years give it 29.'], [Y3.gY3DaysMonths], Y3.gY3DaysMonths),
]
const u9Boss = makeLesson('y3u9boss', 'Time Boss', ['3Gt.01'], 'eggman', 'BOSS TIME!', 'Minutes, Roman hours, 24 hours and the calendar — beat time itself!', ['Read the hour hand first.', 'V is 5, X is 10.', 'Leap years add a day.'], [Y3.gY3ClockMinutes, Y3.gY3RomanClock, Y3.gY3Time24, Y3.gY3Duration, Y3.gY3AmPm, Y3.gY3DaysMonths], Y3.gY3ClockMinutes)

/* ===== UNIT 10 · Shapes, Angles & Lines (3Gg, 3Gp) =============== */
const u10Lessons: LessonDef[] = [
  makeLesson('y3u10l1', '2-D and 3-D Shapes', ['3Gg.01'], 'knuckles', 'Shape squad!', 'Flat shapes have sides — solids have faces.', ['Count sides on flat shapes.', 'Count faces on solids.', 'Balls are spheres — no faces.'], [Y3.gY3Shape3D, Y3.gY3Shape2D], Y3.gY3Shape2D),
  makeLesson('y3u10l2', 'Right Angles & Turns', ['3Gg.02', '3Gp.01'], 'sonic', 'Quarter turn!', 'A right angle is a perfect quarter turn.', ['The corner of a square is 90°.', 'Four right angles make a full turn.', 'Picture the turn in your head.'], [Y3.gY3RightAngle, Y3.gY3Turns3], Y3.gY3RightAngle),
  makeLesson('y3u10l3', 'Acute & Obtuse', ['3Gg.03'], 'amy', 'Angle hunter!', 'Smaller than a right angle is acute — bigger is obtuse.', ['Compare with a right angle.', 'Sharper = acute.', 'Wider = obtuse.'], [Y3.gY3AngleType], Y3.gY3AngleType),
  makeLesson('y3u10l4', 'Lines & Symmetry', ['3Gg.04'], 'shadow', 'Line up!', 'Parallel never meet — perpendicular make right angles.', ['Trace each line in your mind.', 'Never meet = parallel.', 'Right angle = perpendicular.'], [Y3.gY3Lines, Y3.gY3Symmetry], Y3.gY3Symmetry),
]
const u10Boss = makeLesson('y3u10boss', 'Shape Boss', ['3Gg.01'], 'eggman', 'BOSS TIME!', 'Solids, angles, turns, lines and symmetry — conquer them all!', ['Count faces and sides.', 'Compare every angle with 90°.', 'Fold shapes to test symmetry.'], [Y3.gY3Shape3D, Y3.gY3Shape2D, Y3.gY3RightAngle, Y3.gY3AngleType, Y3.gY3Lines, Y3.gY3Symmetry, Y3.gY3Turns3], Y3.gY3AngleType)

/* ===== UNIT 11 · Measures & Perimeter (3Gg) ====================== */
const u11Lessons: LessonDef[] = [
  makeLesson('y3u11l1', 'Choosing Units', ['3Gg.05'], 'tails', 'Right tool!', 'Length, mass and capacity each have their own unit family.', ['Metres and centimetres measure length.', 'Grams and kilograms weigh.', 'Millilitres and litres hold.'], [Y3.gY3MeasureChoice], Y3.gY3MeasureChoice),
  makeLesson('y3u11l2', 'Converting Units', ['3Gg.06'], 'amy', 'Swap the unit!', 'Bigger unit to smaller means multiply.', ['1 m = 100 cm.', '1 kg = 1,000 g.', 'Small to big means divide.'], [Y3.gY3Convert], Y3.gY3Convert),
  makeLesson('y3u11l3', 'Perimeter', ['3Gg.07'], 'sonic', 'Walk the edge!', 'Perimeter is the distance all the way around a shape.', ['Start at one corner.', 'Add every side once.', 'Write the total in cm.'], [Y3.gY3Perimeter], Y3.gY3Perimeter),
  makeLesson('y3u11l4', 'Measure Stories', ['3Gg.08'], 'knuckles', 'Measure detective!', 'Compare measures, then solve length and mass stories.', ['Change to the same unit.', 'More or less?', 'Cut off means subtract.'], [Y3.gY3MeasureCompare, Y3.gY3MeasureWord], Y3.gY3MeasureWord),
]
const u11Boss = makeLesson('y3u11boss', 'Measure Boss', ['3Gg.05'], 'eggman', 'BOSS TIME!', 'Units, conversions, perimeter and stories — measure everything!', ['Pick the unit that fits.', '100 cm in a metre.', 'Add all four sides for perimeter.'], [Y3.gY3MeasureChoice, Y3.gY3Convert, Y3.gY3Perimeter, Y3.gY3MeasureCompare, Y3.gY3MeasureWord], Y3.gY3Convert)

/* ===== UNIT 12 · Statistics (3Ss) ================================= */
const u12Lessons: LessonDef[] = [
  makeLesson('y3u12l1', 'Pictograms', ['3Ss.01'], 'shadow', 'Picture charts!', 'Each picture stands for a group of things.', ['Find what ONE picture is worth.', 'Count the pictures.', 'Multiply to get the total.'], [Y3.gY3Pictogram], Y3.gY3Pictogram),
  makeLesson('y3u12l2', 'Bar Charts', ['3Ss.02'], 'sonic', 'Bar inspector!', 'Read bar heights, compare them and find totals.', ['Find each bar number.', 'Compare with take away.', 'Add for the total.'], [Y3.gY3BarChart], Y3.gY3BarChart),
  makeLesson('y3u12l3', 'Data Tables', ['3Ss.03'], 'amy', 'Table cracker!', 'Tables hold the same data in neat rows.', ['Read one row at a time.', 'Find the two rows you need.', 'Add or find the difference.'], [Y3.gY3TableRead], Y3.gY3TableRead),
  makeLesson('y3u12l4', 'Scales & Marks', ['3Ss.04'], 'tails', 'Scale spotter!', 'Scales marked in 2s, 5s and 10s — count along them.', ['Find the step.', 'Add it each time.', 'The step never changes.'], [Y3.gY3Scale], Y3.gY3Scale),
]
const u12Boss = makeLesson('y3u12boss', 'Data Boss', ['3Ss.01'], 'eggman', 'BOSS TIME!', 'Pictograms, bar charts, tables and scales — read the data!', ['Find the value of one symbol.', 'Compare before you subtract.', 'Spots the step on a scale.'], [Y3.gY3Pictogram, Y3.gY3BarChart, Y3.gY3TableRead, Y3.gY3Scale], Y3.gY3BarChart)

export const Y3_UNITS: UnitDef[] = [
  { id: 'y3u1', order: 1, title: 'Counting in Multiples', subtitle: 'DfE NC Y3 · multiples of 4, 8, 50 & 100 · 10/100 more or less', color: '#58cc02', icon: '🔢', lessons: [...u1Lessons, u1Boss], bossLessonIds: [u1Boss.id] },
  { id: 'y3u2', order: 2, title: 'Place Value to 1,000', subtitle: 'DfE NC Y3 · digit value · partition · compare & order', color: '#1cb0f6', icon: '🔤', lessons: [...u2Lessons, u2Boss], bossLessonIds: [u2Boss.id] },
  { id: 'y3u3', order: 3, title: 'Mental Add & Subtract', subtitle: 'DfE NC Y3 · ±1/10/100 · missing numbers · bonds to 1,000', color: '#ff9600', icon: '➕', lessons: [...u3Lessons, u3Boss], bossLessonIds: [u3Boss.id] },
  { id: 'y3u4', order: 4, title: 'Column Addition & Subtraction', subtitle: 'DfE NC Y3 · formal methods · estimate · inverse checks', color: '#00cd9c', icon: '➖', lessons: [...u4Lessons, u4Boss], bossLessonIds: [u4Boss.id] },
  { id: 'y3u5', order: 5, title: 'Times Tables 3, 4 & 8', subtitle: 'DfE NC Y3 · recall 3, 4 & 8 tables · commutativity', color: '#ce82ff', icon: '✖️', lessons: [...u5Lessons, u5Boss], bossLessonIds: [u5Boss.id] },
  { id: 'y3u6', order: 6, title: 'Multiply & Divide', subtitle: 'DfE NC Y3 · short methods · scaling · correspondence', color: '#0ea5e9', icon: '✖️', lessons: [...u6Lessons, u6Boss], bossLessonIds: [u6Boss.id] },
  { id: 'y3u7', order: 7, title: 'Fractions', subtitle: 'DfE NC Y3 · tenths · sets · equivalents · same denominators', color: '#fb7185', icon: '🍕', lessons: [...u7Lessons, u7Boss], bossLessonIds: [u7Boss.id] },
  { id: 'y3u8', order: 8, title: 'Money', subtitle: 'DfE NC Y3 · £ and p · adding prices · giving change', color: '#4a90e2', icon: '💰', lessons: [...u8Lessons, u8Boss], bossLessonIds: [u8Boss.id] },
  { id: 'y3u9', order: 9, title: 'Time', subtitle: 'DfE NC Y3 · minutes · Roman numerals · 12/24-hour · calendar', color: '#22d3ee', icon: '⏰', lessons: [...u9Lessons, u9Boss], bossLessonIds: [u9Boss.id] },
  { id: 'y3u10', order: 10, title: 'Shapes, Angles & Lines', subtitle: 'DfE NC Y3 · 2-D & 3-D · right/acute/obtuse · parallel lines', color: '#a3e635', icon: '🔷', lessons: [...u10Lessons, u10Boss], bossLessonIds: [u10Boss.id] },
  { id: 'y3u11', order: 11, title: 'Measures & Perimeter', subtitle: 'DfE NC Y3 · m/cm/mm · kg/g · l/ml · perimeter', color: '#eab308', icon: '📏', lessons: [...u11Lessons, u11Boss], bossLessonIds: [u11Boss.id] },
  { id: 'y3u12', order: 12, title: 'Statistics', subtitle: 'DfE NC Y3 · pictograms · bar charts · tables · scales', color: '#fb923c', icon: '📊', lessons: [...u12Lessons, u12Boss], bossLessonIds: [u12Boss.id] },
]

export const Y3_ALL_LESSONS: Record<string, { unit: UnitDef; lesson: LessonDef }> = {}
for (const u of Y3_UNITS) for (const l of u.lessons) Y3_ALL_LESSONS[l.id] = { unit: u, lesson: l }
