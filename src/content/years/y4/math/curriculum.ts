/** PLAN 169f — Year-4 maths curriculum (DfE national curriculum Year 4).
 *  Mirrors the Year-1/2/3 structure: units, intro cards, teach lines,
 *  generated activity queues and a boss at the end of every unit.
 *
 *  PROVENANCE:
 *  1. DfE national curriculum in England: mathematics programmes of study,
 *     key stages 1 and 2 (2014) — statutory Year-4 programme of study:
 *     count in multiples of 6, 7, 9, 25 and 1,000 with 1,000 more/less;
 *     four-digit place value, comparing, ordering and rounding to 10, 100
 *     and 1,000; Roman numerals to 100 and negative numbers in context;
 *     mental and columnar addition/subtraction to 4 digits with estimating
 *     and inverse checks; recall the multiplication tables to 12 × 12 with
 *     factor pairs, commutativity, ×0/×1/÷1 and three-number products;
 *     short multiplication and short division with 2-digit divisors, the
 *     distributive law, scaling and correspondence; families of equivalent
 *     fractions, hundredths, adding/subtracting same-denominator
 *     fractions (including beyond one whole) and fractions of quantities;
 *     decimal equivalents of tenths/hundredths and 1/4, 1/2, 3/4, dividing
 *     by 10 and 100, comparing and rounding decimals, money to 2 dp; money
 *     problems in £ and p; converting time units, the 24-hour clock,
 *     durations and timetables; km/m/cm/mm, kg/g, l/ml, perimeter of
 *     rectilinear figures and area by counting squares; classifying
 *     triangles (isosceles, equilateral, scalene) and quadrilaterals
 *     (square, rectangle, rhombus, trapezium, parallelogram),
 *     acute/obtuse/right angles, ordering angles, lines of symmetry;
 *     first-quadrant coordinates, translations and completing rectangles;
 *     statistics with discrete/continuous data, bar charts, time graphs,
 *     pictograms and tables.
 *     https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study/
 *  2. NNS "Mathematical vocabulary" DfES 0313/2000 Year-4 checklist — every
 *     learner-facing bank word stays inside src/content/syllabus/y4/math.ts.
 *
 *  Objective codes follow the app's mirrored scheme with the Year-4 prefix
 *  (4Nc, 4Np, 4Ni, 4Nf, 4Nm, 4Gt, 4Gg, 4Gp, 4Ss + sequential numbers) —
 *  the same families Years 1-3 use, so codes stay stable across years.
 *  Lesson ids are prefixed `y4` so they can never collide with the Year-3
 *  `y3u*`, Year-1 `y1u*` or Year-2 `u<N>l<M>` ids (progress maps are keyed
 *  by lesson id — PLAN 168/169c tests enforce this). */
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

/* ===== UNIT 1 · Counting in Multiples (4Nc) ======================= */
const u1Lessons: LessonDef[] = [
  makeLesson('y4u1l1', 'Counting in 6s and 7s', ['4Nc.01'], 'sonic', 'Skip counting!', 'Hop along the number line in jumps of 6 and 7.', ['Find the step: 6 or 7.', 'Add it on every time.', 'Check the last jump!'], [Y4.gY4CountIn], Y4.gY4CountIn),
  makeLesson('y4u1l2', 'Counting in 9s and 25s', ['4Nc.02'], 'tails', 'Big jumps!', 'Bigger steps make big numbers climb fast.', ['Count on in 9s or 25s.', 'The gap never changes.', 'Nine times table: 9, 18, 27…'], [Y4.gY4CountIn9x25], Y4.gY4CountIn9x25),
  makeLesson('y4u1l3', '1,000 More and Less', ['4Nc.03'], 'amy', 'Thousand shuffle!', 'Adding 1,000 only changes ONE part of the number.', ['Only the thousands digit changes.', '1,000 more goes up.', '1,000 less comes down.'], [Y4.gY4MoreLess1000], Y4.gY4MoreLess1000),
  makeLesson('y4u1l4', 'Pattern Rules', ['4Nc.04'], 'knuckles', 'Rule spotter!', 'Every pattern follows a rule. Find the step!', ['Compare each pair of numbers.', 'The gap IS the rule.', 'Fill the gap with the same step.'], [Y4.gY4CountInRule, Y4.gY4SequenceMissing], Y4.gY4SequenceMissing),
]
const u1Boss = makeLesson('y4u1boss', 'Counting Boss', ['4Nc.01'], 'eggman', 'BOSS TIME!', 'Count in multiples, nudge thousands, crack rules — go!', ['Work out the step first.', 'Watch the thousands digit.', 'Bosses hide gaps in patterns!'], [Y4.gY4CountIn, Y4.gY4CountIn9x25, Y4.gY4MoreLess1000, Y4.gY4CountInRule, Y4.gY4SequenceMissing], Y4.gY4CountInRule)

/* ===== UNIT 2 · Place Value to 10,000 (4Np) ======================= */
const u2Lessons: LessonDef[] = [
  makeLesson('y4u2l1', 'Four-Digit Place Value', ['4Np.01'], 'tails', 'Digit detective!', 'Thousands, hundreds, tens and ones — every digit has a job.', ['Find the digit first.', 'Ask which place it sits in.', 'Its value is digit × place.'], [Y4.gY4PlaceValue], Y4.gY4PlaceValue),
  makeLesson('y4u2l2', 'Compare & Order', ['4Np.02'], 'sonic', 'Number showdown!', 'Compare from the thousands digit down.', ['Line the numbers up.', 'Compare thousands first.', 'Then hundreds, tens and ones.'], [Y4.gY4ComparePV, Y4.gY4OrderNums], Y4.gY4OrderNums),
  makeLesson('y4u2l3', 'Rounding to 10, 100 & 1,000', ['4Np.03'], 'shadow', 'Round it!', 'Rounding finds the nearest multiple of 10, 100 or 1,000.', ['Find the target place.', 'Look at the digit after it.', '5 or more rounds up.'], [Y4.gY4Round], Y4.gY4Round),
  makeLesson('y4u2l4', 'Roman Numerals & Negative Numbers', ['4Np.04'], 'amy', 'Old numbers, cold numbers!', 'Roman numerals to 100 — and temperatures below zero.', ['X is 10, L is 50, C is 100.', 'Build biggest to smallest.', 'Below zero means counting down past 0.'], [Y4.gY4Roman100, Y4.gY4Negatives], Y4.gY4Roman100),
]
const u2Boss = makeLesson('y4u2boss', 'Place Value Boss', ['4Np.01'], 'eggman', 'BOSS TIME!', 'Worth, order, round, Roman and below zero — beat them all!', ['Check each digit position.', 'Round by looking ahead.', 'Roman goes biggest first.'], [Y4.gY4PlaceValue, Y4.gY4ComparePV, Y4.gY4OrderNums, Y4.gY4Round, Y4.gY4Roman100, Y4.gY4Negatives], Y4.gY4Round)

/* ===== UNIT 3 · Mental Add & Subtract (4Ni) ======================= */
const u3Lessons: LessonDef[] = [
  makeLesson('y4u3l1', 'Add & Take Away 10, 100, 1,000', ['4Ni.01'], 'sonic', 'Quick fingers!', 'Mental hops only change one part of the number.', ['Spot the step: 10, 100 or 1,000.', 'Change only that part.', 'Watch for crossing a ten.'], [Y4.gY4MentalStep], Y4.gY4MentalStep),
  makeLesson('y4u3l2', 'Missing Numbers', ['4Ni.02'], 'knuckles', 'Fill the gap!', 'A box hides one part of the calculation. Catch it.', ['Find the whole or the part.', 'Add or take away to match.', 'Check by going back.'], [Y4.gY4MissingFact], Y4.gY4MissingFact),
  makeLesson('y4u3l3', 'Estimating', ['4Ni.03'], 'amy', 'Rough guess first!', 'Estimate by rounding both numbers to 100.', ['Round each number to 100.', 'Add or take away the round numbers.', 'A close answer still helps.'], [Y4.gY4Estimate], Y4.gY4Estimate),
  makeLesson('y4u3l4', 'Two-Step Mental Stories', ['4Ni.04'], 'tails', 'Two moves!', 'Some stories need an add AND a take away.', ['Read the whole story.', 'Do the first move.', 'Then the second move.'], [Y4.gY4TwoStep], Y4.gY4TwoStep),
]
const u3Boss = makeLesson('y4u3boss', 'Mental Maths Boss', ['4Ni.01'], 'eggman', 'BOSS TIME!', 'Hops, gaps, estimates and two-step stories — no written method!', ['Change one digit at a time.', 'Part and part make the whole.', 'Stories hide the moves.'], [Y4.gY4MentalStep, Y4.gY4MissingFact, Y4.gY4Estimate, Y4.gY4TwoStep], Y4.gY4MissingFact)

/* ===== UNIT 4 · Column Addition & Subtraction (4Ni) ============== */
const u4Lessons: LessonDef[] = [
  makeLesson('y4u4l1', 'Column Addition', ['4Ni.05'], 'knuckles', 'Line it up!', 'Neat columns make four-digit addition easy.', ['Line up ones under ones.', 'Add the ones first.', 'Then tens, hundreds, thousands.'], [Y4.gY4ColumnAdd], Y4.gY4ColumnAdd),
  makeLesson('y4u4l2', 'Column Subtraction', ['4Ni.06'], 'shadow', 'Take it away!', 'Column subtraction, digit by digit.', ['Line up the columns.', 'Subtract the ones first.', 'Exchange when you need to.'], [Y4.gY4ColumnSub], Y4.gY4ColumnSub),
  makeLesson('y4u4l3', 'Checking with the Inverse', ['4Ni.07'], 'amy', 'Prove it!', 'Addition is checked with subtraction — the inverse.', ['Start from the total.', 'Take one part away.', 'The other part pops out.'], [Y4.gY4Inverse], Y4.gY4Inverse),
  makeLesson('y4u4l4', 'Two-Step Written Stories', ['4Ni.08'], 'sonic', 'Story solver!', 'Written stories can need two moves in order.', ['Read the whole story.', 'Circle both numbers.', 'Do the moves in order.'], [Y4.gY4TwoStepWord], Y4.gY4TwoStepWord),
]
const u4Boss = makeLesson('y4u4boss', 'Column Methods Boss', ['4Ni.05'], 'eggman', 'BOSS TIME!', 'Column add, column take away, inverse checks and stories!', ['Keep the columns neat.', 'Exchange carefully.', 'Inverse sums catch mistakes.'], [Y4.gY4ColumnAdd, Y4.gY4ColumnSub, Y4.gY4Inverse, Y4.gY4TwoStepWord], Y4.gY4ColumnSub)

/* ===== UNIT 5 · Times Tables to 12 × 12 (4Ni) ==================== */
const u5Lessons: LessonDef[] = [
  makeLesson('y4u5l1', 'Table Facts', ['4Ni.09'], 'tails', 'Speed round!', 'The times tables to 12 × 12 — fast as you can.', ['Count in the table.', 'Twelve times: 12, 24, 36…', 'Say it until it sticks.'], [Y4.gY4Table], Y4.gY4Table),
  makeLesson('y4u5l2', 'Division Facts', ['4Ni.10'], 'knuckles', 'Undo the times!', 'Division is a times table read backwards.', ['Find the total first.', 'Ask: how many groups?', 'Think 7 × ? = 63.'], [Y4.gY4DivFact], Y4.gY4DivFact),
  makeLesson('y4u5l3', 'Missing Table Numbers', ['4Ni.11'], 'shadow', 'Hidden factor!', 'Something is hiding in the table fact. Find it.', ['Read the answer.', 'Divide it back.', 'The missing number pops out.'], [Y4.gY4TableMissing], Y4.gY4TableMissing),
  makeLesson('y4u5l4', 'Factor Pairs', ['4Ni.12'], 'amy', 'Factor friends!', 'Factor pairs multiply to make the same number.', ['Start with 1 and the number.', 'Work inwards.', 'Both must multiply exactly.'], [Y4.gY4FactorPairs], Y4.gY4FactorPairs),
  makeLesson('y4u5l5', 'Commutativity & Mental Tricks', ['4Ni.13'], 'sonic', 'Swap & trick!', 'Swapping never changes a product — and some facts are quick.', ['4 × 7 is 7 × 4.', 'Multiply two, then the third.', 'Times 0 makes 0.'], [Y4.gY4Commutative, Y4.gY4MentalMultDiv], Y4.gY4MentalMultDiv),
]
const u5Boss = makeLesson('y4u5boss', 'Times Tables Boss', ['4Ni.09'], 'eggman', 'BOSS TIME!', 'Tables, division, gaps, factor pairs and swaps — prove them!', ['Know your tables to 12.', 'Division runs backwards.', 'Swapping never changes it.'], [Y4.gY4Table, Y4.gY4DivFact, Y4.gY4TableMissing, Y4.gY4FactorPairs, Y4.gY4Commutative, Y4.gY4MentalMultDiv], Y4.gY4Table)

/* ===== UNIT 6 · Multiply & Divide (4Ni) =========================== */
const u6Lessons: LessonDef[] = [
  makeLesson('y4u6l1', 'Short Multiplication', ['4Ni.14'], 'sonic', 'Stack it up!', 'Multiply two or three digits by one digit.', ['Write the big number on top.', 'Multiply the ones first.', 'Then tens, then hundreds.'], [Y4.gY4ShortMult], Y4.gY4ShortMult),
  makeLesson('y4u6l2', 'Short Division', ['4Ni.15'], 'tails', 'Share it out!', 'Short division with a two-digit divisor.', ['Ask how many times it fits.', 'Write the digit on top.', 'Check: divisor × answer.'], [Y4.gY4ShortDiv], Y4.gY4ShortDiv),
  makeLesson('y4u6l3', 'The Distributive Law', ['4Ni.16'], 'knuckles', 'Split the multiply!', 'Break 34 × 6 into 30 × 6 and 4 × 6.', ['Split off the tens.', 'Multiply each part.', 'Add the two products.'], [Y4.gY4Distributive], Y4.gY4Distributive),
  makeLesson('y4u6l4', 'Scaling & Groups', ['4Ni.17'], 'amy', 'Scaling up!', 'Times as many means multiply — groups tell the story.', ['Spot the factor.', 'Groups × in each = total.', 'Scaling is a hidden multiply.'], [Y4.gY4ScalingCorresp], Y4.gY4ScalingCorresp),
]
const u6Boss = makeLesson('y4u6boss', 'Multiply & Divide Boss', ['4Ni.14'], 'eggman', 'BOSS TIME!', 'Short methods, splitting and group stories — finish strong!', ['Neat columns win.', 'Split big multiplications.', 'Groups × each = total.'], [Y4.gY4ShortMult, Y4.gY4ShortDiv, Y4.gY4Distributive, Y4.gY4ScalingCorresp], Y4.gY4ShortDiv)

/* ===== UNIT 7 · Fractions (4Nf) =================================== */
const u7Lessons: LessonDef[] = [
  makeLesson('y4u7l1', 'Equivalent Fractions', ['4Nf.01'], 'amy', 'Same amount!', 'Different fractions can show the SAME amount.', ['Count the shaded parts.', 'Count all the parts.', 'Multiply top and bottom by the same number.'], [Y4.gY4Equivalent], Y4.gY4Equivalent),
  makeLesson('y4u7l2', 'Hundredths', ['4Nf.02'], 'tails', 'Hundred squares!', 'One whole is 100 hundredths.', ['100 hundredths make 1 whole.', 'Two digits after the point.', 'Tenths first, hundredths second.'], [Y4.gY4Hundredths], Y4.gY4Hundredths),
  makeLesson('y4u7l3', 'Adding & Subtracting Fractions', ['4Nf.03'], 'shadow', 'Match the bottoms!', 'Add and take away fractions when the bottoms match.', ['The bottom stays the same.', 'Add or take the tops.', 'The answer can go over one whole.'], [Y4.gY4AddSubFrac], Y4.gY4AddSubFrac),
  makeLesson('y4u7l4', 'Fractions of Quantities', ['4Nf.04'], 'knuckles', 'Share the pile!', 'Find a fraction of a whole number.', ['Divide by the bottom.', 'Multiply by the top.', 'The answers here are whole numbers.'], [Y4.gY4FractionOf], Y4.gY4FractionOf),
]
const u7Boss = makeLesson('y4u7boss', 'Fractions Boss', ['4Nf.01'], 'eggman', 'BOSS TIME!', 'Equivalents, hundredths, sums and shares — slice through them!', ['Bottom number first.', '100 hundredths in a whole.', 'Divide, then multiply.'], [Y4.gY4Equivalent, Y4.gY4Hundredths, Y4.gY4AddSubFrac, Y4.gY4FractionOf], Y4.gY4Equivalent)

/* ===== UNIT 8 · Decimals (4Nf) ==================================== */
const u8Lessons: LessonDef[] = [
  makeLesson('y4u8l1', 'Decimal Equivalents', ['4Nf.05'], 'tails', 'Same value!', 'Fractions and decimals can show the same amount.', ['Read the fraction.', 'Tenths are one digit after the point.', 'Find the matching decimal.'], [Y4.gY4DecEquiv], Y4.gY4DecEquiv),
  makeLesson('y4u8l2', 'Dividing by 10 and 100', ['4Nf.06'], 'knuckles', 'Shift it!', 'Dividing by 10 or 100 moves every digit one or two places.', ['Each digit moves one place right.', 'Divide by 10: one place.', 'Divide by 100: two places.'], [Y4.gY4Div10100], Y4.gY4Div10100),
  makeLesson('y4u8l3', 'Comparing & Rounding Decimals', ['4Nf.07'], 'sonic', 'Line the points!', 'Compare and round decimals carefully.', ['Line up the decimal points.', 'Compare digit by digit.', '5 or more rounds up.'], [Y4.gY4CompareDec, Y4.gY4RoundDec], Y4.gY4RoundDec),
  makeLesson('y4u8l4', 'Decimal Problems', ['4Nf.08'], 'amy', 'Money maths!', 'Two decimal places count pounds and pence.', ['Two digits after the point.', 'The second digit is pence.', 'Add the pence first.'], [Y4.gY4DecProblems], Y4.gY4DecProblems),
]
const u8Boss = makeLesson('y4u8boss', 'Decimals Boss', ['4Nf.05'], 'eggman', 'BOSS TIME!', 'Equivalents, shifts, rounds and money — master the point!', ['Tenths then hundredths.', 'Digits shift when you divide.', 'Compare from the left.'], [Y4.gY4DecEquiv, Y4.gY4Div10100, Y4.gY4CompareDec, Y4.gY4RoundDec, Y4.gY4DecProblems], Y4.gY4DecEquiv)

/* ===== UNIT 9 · Money (4Nm) ======================================= */
const u9Lessons: LessonDef[] = [
  makeLesson('y4u9l1', 'Adding Money', ['4Nm.01'], 'sonic', 'Add the pile!', 'Add money in pence first.', ['Change everything to pence.', 'Add the pence.', '100 pence makes £1.'], [Y4.gY4MoneyAdd], Y4.gY4MoneyAdd),
  makeLesson('y4u9l2', 'Comparing Money', ['4Nm.02'], 'tails', 'Which costs more?', 'Compare pounds first, then pence.', ['Compare the pounds.', 'Then compare the pence.', 'For the gap, subtract in pence.'], [Y4.gY4MoneyCompare], Y4.gY4MoneyCompare),
  makeLesson('y4u9l3', 'Giving Change', ['4Nm.03'], 'amy', 'Change, please!', 'Change is what you get BACK — paid take away cost.', ['Start with the paid amount.', 'Take away the price.', 'Count the answer in pence.'], [Y4.gY4MoneyChange], Y4.gY4MoneyChange),
  makeLesson('y4u9l4', 'Money Stories', ['4Nm.04'], 'knuckles', 'Shop detective!', 'Stories can need two money moves.', ['Find the starting money.', 'Add what comes in.', 'Take away what goes out.'], [Y4.gY4MoneyStory], Y4.gY4MoneyStory),
]
const u9Boss = makeLesson('y4u9boss', 'Money Boss', ['4Nm.01'], 'eggman', 'BOSS TIME!', 'Add, compare, give change and follow stories — spend wisely!', ['Everything in pence first.', 'Change means subtract.', '100 pence is a pound.'], [Y4.gY4MoneyAdd, Y4.gY4MoneyCompare, Y4.gY4MoneyChange, Y4.gY4MoneyStory], Y4.gY4MoneyChange)

/* ===== UNIT 10 · Time (4Gt) ======================================= */
const u10Lessons: LessonDef[] = [
  makeLesson('y4u10l1', 'Converting Time Units', ['4Gt.01'], 'tails', 'Unit swapper!', 'Hours, minutes, seconds, months and days all connect.', ['60 seconds in a minute.', '60 minutes in an hour.', '12 months, then 7 days a week.'], [Y4.gY4TimeConvert], Y4.gY4TimeConvert),
  makeLesson('y4u10l2', 'The 24-Hour Clock', ['4Gt.02'], 'shadow', 'Two clock systems!', 'Afternoon times run from 13:00 to 24:00.', ['Morning stays the same.', 'Add 12 for pm times.', 'Write 09:00 with the zero.'], [Y4.gY4Time24], Y4.gY4Time24),
  makeLesson('y4u10l3', 'How Long?', ['4Gt.03'], 'knuckles', 'Time detective!', 'Count on from the start time to the end time.', ['Write the start time.', 'Count on to the end time.', 'The difference is the length.'], [Y4.gY4Duration], Y4.gY4Duration),
  makeLesson('y4u10l4', 'Timetables', ['4Gt.04'], 'amy', 'Timetable star!', 'Departures repeat in a pattern.', ['Find the first departure.', 'Add the gap each time.', 'Count the first one too.'], [Y4.gY4Timetable], Y4.gY4Timetable),
]
const u10Boss = makeLesson('y4u10boss', 'Time Boss', ['4Gt.01'], 'eggman', 'BOSS TIME!', 'Conversions, 24 hours, durations and timetables — beat time itself!', ['60 and 12 are the keys.', 'Add 12 for pm.', 'Gap between departures never changes.'], [Y4.gY4TimeConvert, Y4.gY4Time24, Y4.gY4Duration, Y4.gY4Timetable], Y4.gY4Time24)

/* ===== UNIT 11 · Measures: Length, Mass, Area (4Gg) ============== */
const u11Lessons: LessonDef[] = [
  makeLesson('y4u11l1', 'Converting Length', ['4Gg.01'], 'sonic', 'Bigger, smaller!', 'km to m to cm to mm — multiply going down.', ['1 km = 1,000 m.', '1 m = 100 cm.', '1 cm = 10 mm.'], [Y4.gY4ConvertLength], Y4.gY4ConvertLength),
  makeLesson('y4u11l2', 'Mass & Capacity', ['4Gg.02'], 'tails', 'Weigh & pour!', 'Kilograms to grams, litres to millilitres.', ['1 kg = 1,000 g.', '1 l = 1,000 ml.', 'Big to small multiplies.'], [Y4.gY4ConvertMass], Y4.gY4ConvertMass),
  makeLesson('y4u11l3', 'Perimeter', ['4Gg.03'], 'amy', 'Walk the edge!', 'Perimeter is the distance all the way around a shape.', ['Add every side once.', 'A corner cut keeps the perimeter.', 'Write the total in cm.'], [Y4.gY4Perimeter4], Y4.gY4Perimeter4),
  makeLesson('y4u11l4', 'Area', ['4Gg.04'], 'knuckles', 'Count the squares!', 'Area is the space INSIDE a shape.', ['Rows × columns for a rectangle.', 'Take away any cut-out.', 'Count in small squares.'], [Y4.gY4Area], Y4.gY4Area),
]
const u11Boss = makeLesson('y4u11boss', 'Measure Boss', ['4Gg.01'], 'eggman', 'BOSS TIME!', 'Length, mass, capacity, perimeter and area — measure everything!', ['Know the conversion facts.', 'Add all the edges for perimeter.', 'Count squares inside.'], [Y4.gY4ConvertLength, Y4.gY4ConvertMass, Y4.gY4Perimeter4, Y4.gY4Area], Y4.gY4Perimeter4)

/* ===== UNIT 12 · Shapes, Angles & Symmetry (4Gg) ================= */
const u12Lessons: LessonDef[] = [
  makeLesson('y4u12l1', 'Triangles', ['4Gg.05'], 'knuckles', 'Triangle named!', 'Triangles are named by comparing their three sides.', ['3 equal sides: equilateral.', '2 equal sides: isosceles.', 'No equal sides: scalene.'], [Y4.gY4Triangles], Y4.gY4Triangles),
  makeLesson('y4u12l2', 'Quadrilaterals', ['4Gg.06'], 'sonic', 'Quad squad!', 'Four-sided shapes are sorted by their properties.', ['Count the sides.', 'Check the parallel pairs.', 'Right angles matter too.'], [Y4.gY4Quads], Y4.gY4Quads),
  makeLesson('y4u12l3', 'Angles', ['4Gg.07'], 'amy', 'Angle hunter!', 'Compare every angle with a right angle.', ['Smaller than 90° is acute.', 'Bigger than 90° is obtuse.', 'Exactly 90° is right.'], [Y4.gY4Angles, Y4.gY4AngleType], Y4.gY4Angles),
  makeLesson('y4u12l4', 'Lines of Symmetry', ['4Gg.08'], 'shadow', 'Fold to find it!', 'A line of symmetry folds a shape into matching halves.', ['Picture the fold.', 'Both halves must match.', 'Count every fold that works.'], [Y4.gY4Symmetry4], Y4.gY4Symmetry4),
]
const u12Boss = makeLesson('y4u12boss', 'Shape Boss', ['4Gg.05'], 'eggman', 'BOSS TIME!', 'Triangles, quadrilaterals, angles and symmetry — conquer them all!', ['Compare all the sides.', 'Compare with 90°.', 'Fold shapes to test symmetry.'], [Y4.gY4Triangles, Y4.gY4Quads, Y4.gY4Angles, Y4.gY4AngleType, Y4.gY4Symmetry4], Y4.gY4AngleType)

/* ===== UNIT 13 · Position & Direction (4Gp) ====================== */
const u13Lessons: LessonDef[] = [
  makeLesson('y4u13l1', 'Coordinates', ['4Gp.01'], 'tails', 'Across, then up!', 'Coordinates are written as (across, up).', ['First number = across.', 'Second number = up.', 'Start from the corner.'], [Y4.gY4Coordinates], Y4.gY4Coordinates),
  makeLesson('y4u13l2', 'Translations', ['4Gp.02'], 'sonic', 'Slide it!', 'A translation slides a shape without turning it.', ['Only across and up change.', 'No turning, no flipping.', 'Change both numbers.'], [Y4.gY4Translation], Y4.gY4Translation),
  makeLesson('y4u13l3', 'Completing Shapes', ['4Gp.03'], 'amy', 'Missing corner!', 'Opposite corners of a rectangle share their numbers.', ['Read the three corners.', 'Match the shared numbers.', 'The fourth corner completes it.'], [Y4.gY4CompleteShape], Y4.gY4CompleteShape),
  makeLesson('y4u13l4', 'Describing Moves', ['4Gp.04'], 'knuckles', 'Say the move!', 'Describe a move with direction and distance.', ['Count the squares across.', 'Count the squares up.', 'Name the direction.'], [Y4.gY4DescribeMove], Y4.gY4DescribeMove),
]
const u13Boss = makeLesson('y4u13boss', 'Position Boss', ['4Gp.01'], 'eggman', 'BOSS TIME!', 'Coordinates, slides, corners and moves — navigate the grid!', ['Across first, then up.', 'Slides never turn shapes.', 'Check both numbers.'], [Y4.gY4Coordinates, Y4.gY4Translation, Y4.gY4CompleteShape, Y4.gY4DescribeMove], Y4.gY4Coordinates)

/* ===== UNIT 14 · Statistics (4Ss) ================================= */
const u14Lessons: LessonDef[] = [
  makeLesson('y4u14l1', 'Discrete & Continuous Data', ['4Ss.01'], 'shadow', 'Countable or smooth?', 'Discrete data counts; continuous data measures.', ['Can you count it in whole values?', 'Counting data is discrete.', 'Measured data is continuous.'], [Y4.gY4DataKind], Y4.gY4DataKind),
  makeLesson('y4u14l2', 'Bar Charts', ['4Ss.02'], 'sonic', 'Bar inspector!', 'Read bar heights, compare them and find totals.', ['Find each bar number.', 'Compare with take away.', 'Add for the total.'], [Y4.gY4BarChart4], Y4.gY4BarChart4),
  makeLesson('y4u14l3', 'Time Graphs & Pictograms', ['4Ss.03'], 'tails', 'Pictures & lines!', 'Time graphs show change; pictograms show counts.', ['One picture = the key value.', 'Time graphs show change over time.', 'Read before you calculate.'], [Y4.gY4TimeGraph4, Y4.gY4Pictogram4], Y4.gY4Pictogram4),
  makeLesson('y4u14l4', 'Data Tables', ['4Ss.04'], 'amy', 'Table cracker!', 'Tables hold the same data in neat rows.', ['Read one row at a time.', 'Find the two rows you need.', 'Add or take away.'], [Y4.gY4TableRead4], Y4.gY4TableRead4),
]
const u14Boss = makeLesson('y4u14boss', 'Data Boss', ['4Ss.01'], 'eggman', 'BOSS TIME!', 'Data types, bar charts, graphs, pictograms and tables — read it all!', ['Find what one symbol is worth.', 'Compare before you subtract.', 'Rows hold the answers.'], [Y4.gY4DataKind, Y4.gY4BarChart4, Y4.gY4TimeGraph4, Y4.gY4Pictogram4, Y4.gY4TableRead4], Y4.gY4BarChart4)

export const Y4_UNITS: UnitDef[] = [
  { id: 'y4u1', order: 1, title: 'Counting in Multiples', subtitle: 'DfE NC Y4 · multiples of 6, 7, 9, 25 & 1,000 · 1,000 more/less', color: '#58cc02', icon: '🔢', lessons: [...u1Lessons, u1Boss], bossLessonIds: [u1Boss.id] },
  { id: 'y4u2', order: 2, title: 'Place Value to 10,000', subtitle: 'DfE NC Y4 · four-digit value · round to 10/100/1,000 · Roman to 100', color: '#1cb0f6', icon: '🔤', lessons: [...u2Lessons, u2Boss], bossLessonIds: [u2Boss.id] },
  { id: 'y4u3', order: 3, title: 'Mental Add & Subtract', subtitle: 'DfE NC Y4 · ±10/100/1,000 · missing numbers · estimating', color: '#ff9600', icon: '➕', lessons: [...u3Lessons, u3Boss], bossLessonIds: [u3Boss.id] },
  { id: 'y4u4', order: 4, title: 'Column Addition & Subtraction', subtitle: 'DfE NC Y4 · formal methods · inverse checks · two-step', color: '#00cd9c', icon: '➖', lessons: [...u4Lessons, u4Boss], bossLessonIds: [u4Boss.id] },
  { id: 'y4u5', order: 5, title: 'Times Tables to 12 × 12', subtitle: 'DfE NC Y4 · tables to 12 × 12 · factor pairs · commutativity', color: '#ce82ff', icon: '✖️', lessons: [...u5Lessons, u5Boss], bossLessonIds: [u5Boss.id] },
  { id: 'y4u6', order: 6, title: 'Multiply & Divide', subtitle: 'DfE NC Y4 · short methods · distributive law · scaling', color: '#0ea5e9', icon: '✖️', lessons: [...u6Lessons, u6Boss], bossLessonIds: [u6Boss.id] },
  { id: 'y4u7', order: 7, title: 'Fractions', subtitle: 'DfE NC Y4 · equivalents · hundredths · same denominators · shares', color: '#fb7185', icon: '🍕', lessons: [...u7Lessons, u7Boss], bossLessonIds: [u7Boss.id] },
  { id: 'y4u8', order: 8, title: 'Decimals', subtitle: 'DfE NC Y4 · decimal equivalents · ÷10/100 · compare & round', color: '#4a90e2', icon: '💯', lessons: [...u8Lessons, u8Boss], bossLessonIds: [u8Boss.id] },
  { id: 'y4u9', order: 9, title: 'Money', subtitle: 'DfE NC Y4 · £ and p · compare · giving change · stories', color: '#22d3ee', icon: '💰', lessons: [...u9Lessons, u9Boss], bossLessonIds: [u9Boss.id] },
  { id: 'y4u10', order: 10, title: 'Time', subtitle: 'DfE NC Y4 · unit conversions · 24-hour · durations · timetables', color: '#a3e635', icon: '⏰', lessons: [...u10Lessons, u10Boss], bossLessonIds: [u10Boss.id] },
  { id: 'y4u11', order: 11, title: 'Measures: Length, Mass & Area', subtitle: 'DfE NC Y4 · km/m/cm/mm · kg/g · l/ml · perimeter & area', color: '#eab308', icon: '📏', lessons: [...u11Lessons, u11Boss], bossLessonIds: [u11Boss.id] },
  { id: 'y4u12', order: 12, title: 'Shapes, Angles & Symmetry', subtitle: 'DfE NC Y4 · triangles & quadrilaterals · angles · symmetry', color: '#fb923c', icon: '🔷', lessons: [...u12Lessons, u12Boss], bossLessonIds: [u12Boss.id] },
  { id: 'y4u13', order: 13, title: 'Position & Direction', subtitle: 'DfE NC Y4 · first-quadrant coordinates · translations', color: '#e879f9', icon: '🧭', lessons: [...u13Lessons, u13Boss], bossLessonIds: [u13Boss.id] },
  { id: 'y4u14', order: 14, title: 'Statistics', subtitle: 'DfE NC Y4 · discrete & continuous · bar charts · graphs · tables', color: '#4ade80', icon: '📊', lessons: [...u14Lessons, u14Boss], bossLessonIds: [u14Boss.id] },
]

export const Y4_ALL_LESSONS: Record<string, { unit: UnitDef; lesson: LessonDef }> = {}
for (const u of Y4_UNITS) for (const l of u.lessons) Y4_ALL_LESSONS[l.id] = { unit: u, lesson: l }
