/** PLAN 167 — Year-1 maths curriculum (Cambridge Primary Mathematics Stage 1
 *  pilot). Mirrors the Year-2 structure: units, intro cards, teach lines,
 *  generated activity queues and a boss at the end of every unit.
 *
 *  PROVENANCE (extracted by research agents, 2026-09-29):
 *  1. Cambridge Primary Mathematics Stage 1 — Learner's Book 1 contents
 *     (official CUP executive preview PDF): 16 units + 6 projects, sections
 *     1.1-16.2 (Numbers to 10 → Working with numbers to 10 → Geometry →
 *     Fractions → Measures → Position → Time → Statistics → Numbers to 20 →
 *     Working with numbers to 20 → Geometry (2) → Halves → Measures (2) →
 *     Position, direction and patterns → Time (2) → Statistics (2)).
 *     Stage 1 = ages 5-6 = England Year 1.
 *  2. DfE national curriculum in England: mathematics programmes of study,
 *     Year 1 (statutory, 2014) — https://www.gov.uk/government/publications/
 *     national-curriculum-in-england-mathematics-programmes-of-study/
 *     Counting/reading to 100 but number bonds, addition and subtraction
 *     WITHIN 20; one more/one less; count in 2s, 5s and 10s; halves and
 *     quarters as equal parts; measure language + coin values; o'clock and
 *     half past; recognise/name common 2-D and 3-D shapes; whole, half,
 *     quarter and three-quarter turns. No statistics at Year 1 (the app's
 *     one sorting lesson follows Cambridge Stage 1 unit 8, which does teach
 *     sets and Venn diagrams).
 *  3. NNS "Mathematical vocabulary" DfES 0313/2000 Year-1 checklist — every
 *     learner-facing word stays inside src/content/syllabus/y1/math.ts.
 *
 *  Objective codes use the app's mirrored Stage scheme (1Nc, 1Np, 1Ni, 1Nf,
 *  1Nm, 1Gt, 1Gg, 1Gp, 1Ss + sequential numbers). Only §1.1 (1Nc.01-.03,
 *  1Np.01) and §1.5 (1Nc.05) correlations are printed in the public
 *  Teacher's Resource preview; the rest follow the same scheme by topic so
 *  codes stay stable across years (Year 2 uses the 2-prefix).
 *
 *  Lesson ids are prefixed `y1` so they can never collide with the Year-2
 *  `u<N>l<M>` ids (progress maps are keyed by lesson id — PLAN 168 tests
 *  this). */
import type { LessonDef, Question, UnitDef } from '../../../types'
import type { Rand } from '../../../rng'
import { buildLessonQueue } from '../../../lessonQueue'
import * as G from '../../../generators'
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

/* ===== UNIT 1 · Counting to 20 (1Nc) ============================== */
const u1Lessons: LessonDef[] = [
  makeLesson('y1u1l1', 'Count Them All', ['1Nc.01'], 'sonic', 'Let us count!', 'Tap each picture and say the number. One tap = one number!', ['Point at each one as you count.', 'Say a number for every tap.', 'Counting tells us HOW MANY.'], [Y1.gY1CountObjects], Y1.gY1CountObjects),
  makeLesson('y1u1l2', 'Count On, Count Back', ['1Nc.02'], 'tails', 'Keep going!', 'Numbers climb up - and march back down.', ['Start at the number you see.', 'Count on by one.', 'Counting back means subtracting one.'], [Y1.gY1CountSequence], Y1.gY1CountSequence),
  makeLesson('y1u1l3', 'One More, One Less', ['1Nc.05'], 'amy', 'Step up, step back!', 'One more is the next number. One less is the one before.', ['Count on for one MORE.', 'Count back for one LESS.', 'Use your fingers to check.'], [Y1.gY1OneMoreLess], Y1.gY1OneMoreLess),
  makeLesson('y1u1l4', 'Count in 2s, 5s and 10s', ['1Nc.06'], 'knuckles', 'Jumping numbers!', 'Hop along the number line in bigger jumps.', ['2, 4, 6, 8 - skip the odds.', '5, 10, 15, 20 - fives!', '10, 20 - tens are quick.'], [Y1.gY1CountInSteps], Y1.gY1CountInSteps),
  makeLesson('y1u1l5', 'Odd or Even', ['1Nc.07'], 'shadow', 'Team up!', 'Even numbers pair up with nobody left over.', ['Make pairs in your mind.', 'One left over means ODD.', 'Two left over is still ODD.'], [Y1.gY1OddEven], Y1.gY1OddEven),
  makeLesson('y1u1l6', 'Estimate It!', ['1Nc.04'], 'amy', 'Quick guess!', 'About how many? Do not count one by one.', ['Group them into fives.', 'Guess first, then count.', 'Close counts as right!'], [G.gEstimateCount, Y1.gY1CountObjects], G.gEstimateCount),
]
const u1Boss = makeLesson('y1u1boss', 'Counting Boss', ['1Nc.01'], 'eggman', 'BOSS TIME!', 'Count, compare and spot patterns - prove it!', ['Take your time on each one.', 'Count twice if you doubt.', 'Bosses love tricky counting!'], [Y1.gY1CountObjects, Y1.gY1CountSequence, Y1.gY1OneMoreLess, Y1.gY1CountInSteps, Y1.gY1OddEven], Y1.gY1CountSequence)

/* ===== UNIT 2 · Number Words, Comparing & Sorting (1Np, 1Ss) ====== */
const u2Lessons: LessonDef[] = [
  makeLesson('y1u2l1', 'Number Words', ['1Np.01'], 'amy', 'Word wizard!', 'Every number has a word name - read them all!', ['Read the word slowly.', 'Count your way up.', 'Fif-teen means 15.'], [Y1.gY1NumWords, Y1.gY1MatchNumWords], Y1.gY1MatchNumWords),
  makeLesson('y1u2l2', 'More, Fewer, Equal', ['1Np.02'], 'sonic', 'Showdown!', 'More means bigger. Fewer means smaller. Equal means the same.', ['Count both sides.', 'Compare the totals.', 'Equal means the SAME.'], [Y1.gY1Compare], Y1.gY1Compare),
  makeLesson('y1u2l3', 'Line Them Up', ['1Np.03'], 'tails', 'Order up!', 'Put the numbers in a line - smallest or biggest first.', ['Find the smallest number.', 'Or start with the biggest.', 'Count as you go.'], [Y1.gY1Order], Y1.gY1Order),
  makeLesson('y1u2l4', 'Missing Numbers', ['1Np.04'], 'knuckles', 'Fill the gap!', 'Something is hiding on the number line. Find it.', ['Look at the numbers around it.', 'Count on by one.', 'The missing one fits the path.'], [Y1.gY1MissingLine], Y1.gY1MissingLine),
  makeLesson('y1u2l5', 'Sorting Sets', ['1Ss.01'], 'shadow', 'Sorter squad!', 'Two rules at once - odd or even, then compare with 10.', ['Check rule one first.', 'Then check rule two.', 'Both rules must be true.'], [Y1.gY1SortVenn], Y1.gY1SortVenn),
]
const u2Boss = makeLesson('y1u2boss', 'Words & Order Boss', ['1Np.01'], 'eggman', 'BOSS TIME!', 'Words, order, sorting - beat the whole set!', ['Read every word twice.', 'Order before you answer.', 'Two rules mean two checks.'], [Y1.gY1NumWords, Y1.gY1Compare, Y1.gY1Order, Y1.gY1MissingLine, Y1.gY1SortVenn], Y1.gY1Order)

/* ===== UNIT 3 · Friends of 10 & Doubles (1Ni) ===================== */
const u3Lessons: LessonDef[] = [
  makeLesson('y1u3l1', 'Friends of 10', ['1Ni.01'], 'sonic', 'Perfect pairs!', 'Two numbers that snap together to make 10.', ['Hold up ten fingers.', '7 needs 3 more.', 'Count on to ten.'], [G.gBonds10], G.gBonds10),
  makeLesson('y1u3l2', 'Make 10, Make 20', ['1Ni.01'], 'tails', 'Partner up!', 'Match each number with the one it needs.', ['Count on to the target.', 'The pair makes the total.', 'Check by adding back.'], [Y1.gY1BondMatch], Y1.gY1BondMatch),
  makeLesson('y1u3l3', 'Doubles', ['1Ni.02'], 'knuckles', 'Twice as nice!', 'Double means the SAME number twice.', ['Two equal groups.', 'Double 5 is 10.', 'Share to halve it back.'], [Y1.gY1Doubles], Y1.gY1Doubles),
  makeLesson('y1u3l4', 'Near Doubles', ['1Ni.03'], 'amy', 'Almost twins!', 'Use a double you know, then adjust by one.', ['Double the smaller number.', 'Then add one more.', 'Quick as a flash!'], [Y1.gY1NearDouble], Y1.gY1NearDouble),
]
const u3Boss = makeLesson('y1u3boss', 'Bonds & Doubles Boss', ['1Ni.01'], 'eggman', 'BOSS TIME!', 'Pairs, doubles and near doubles - go!', ['Make ten first.', 'Doubles are fastest.', 'Adjust by one for near doubles.'], [G.gBonds10, Y1.gY1BondMatch, Y1.gY1Doubles, Y1.gY1NearDouble], Y1.gY1Doubles)

/* ===== UNIT 4 · Adding to 20 (1Ni) ================================ */
const u4Lessons: LessonDef[] = [
  makeLesson('y1u4l1', 'Add It On', ['1Ni.04'], 'sonic', 'Gentle climb!', 'Count on from the bigger number to add.', ['Start at the bigger number.', 'Count on with your fingers.', 'The answer is the TOTAL.'], [G.gAddWithin20], G.gAddWithin20),
  makeLesson('y1u4l2', 'What Is Missing?', ['1Ni.05'], 'amy', 'Hidden part!', 'A box hides one part. Find it.', ['Look at the known part.', 'Count on to the total.', 'Part and part make the total.'], [Y1.gY1MissingAddend], Y1.gY1MissingAddend),
  makeLesson('y1u4l3', 'Story Sums', ['1Ni.06'], 'tails', 'Maths stories!', 'Real problems hide maths inside. Find the clue words.', ['Look for ALTOGETHER.', 'Circle the two numbers.', 'Draw it, then add.'], [Y1.gY1AddWord], Y1.gY1AddWord),
  makeLesson('y1u4l4', 'Which Is More?', ['1Ni.07'], 'shadow', 'Sum showdown!', 'Guess which side is bigger - then check by counting.', ['Estimate first.', 'Count on each side.', 'Bigger total wins.'], [Y1.gY1CompareSums], Y1.gY1CompareSums),
]
const u4Boss = makeLesson('y1u4boss', 'Adding Boss', ['1Ni.04'], 'eggman', 'BOSS TIME!', 'Add every kind of number to 20!', ['Read each word twice.', 'Count on from parts.', 'Stories hide the sum.'], [G.gAddWithin20, Y1.gY1MissingAddend, Y1.gY1AddWord, Y1.gY1CompareSums], Y1.gY1MissingAddend)

/* ===== UNIT 5 · Subtracting to 20 (1Ni) =========================== */
const u5Lessons: LessonDef[] = [
  makeLesson('y1u5l1', 'Take Away', ['1Ni.08'], 'knuckles', 'Power take away!', 'Take away means subtract - count back.', ['Count back on fingers.', 'Start at the top number.', 'The answer is what is LEFT.'], [G.gSubWithin20], G.gSubWithin20),
  makeLesson('y1u5l2', 'Missing Take Aways', ['1Ni.09'], 'sonic', 'Fill the blank!', 'A number is hiding in the sum. Catch it.', ['Count up from the answer.', 'Or add the two parts.', 'Check by adding back.'], [Y1.gY1MissingSub], Y1.gY1MissingSub),
  makeLesson('y1u5l3', 'How Many More?', ['1Ni.10'], 'amy', 'Difference dash!', 'How many more asks for the DIFFERENCE.', ['Line both amounts up.', 'Count the extra ones.', 'Subtract to find it.'], [Y1.gY1Difference], Y1.gY1Difference),
  makeLesson('y1u5l4', 'Take Away Stories', ['1Ni.11'], 'tails', 'Story detective!', 'Words like LEFT and BROKE mean subtract.', ['Find the clue words.', 'Circle the numbers.', 'Draw the picture first.'], [Y1.gY1SubWord], Y1.gY1SubWord),
]
const u5Boss = makeLesson('y1u5boss', 'Subtracting Boss', ['1Ni.08'], 'eggman', 'BOSS TIME!', 'Take away, find differences, crack stories!', ['Read the clue words.', 'Count back slowly.', 'Difference means subtract.'], [G.gSubWithin20, Y1.gY1MissingSub, Y1.gY1Difference, Y1.gY1SubWord], Y1.gY1Difference)

/* ===== UNIT 6 · Sharing & Patterns (1Ni, 1Nc) ===================== */
const u6Lessons: LessonDef[] = [
  makeLesson('y1u6l1', 'Equal Groups', ['1Ni.12'], 'amy', 'Add, add, add!', 'Equal groups add the SAME number each time.', ['Spot the equal groups.', 'Add the same number.', 'Count the total.'], [Y1.gY1RepeatedAddition], Y1.gY1RepeatedAddition),
  makeLesson('y1u6l2', 'Share Fairly', ['1Ni.13'], 'knuckles', 'Fair shares!', 'Sharing means everyone gets the SAME.', ['Deal one to each.', 'Keep dealing until gone.', 'Everyone has equal.'], [Y1.gY1Sharing], Y1.gY1Sharing),
  makeLesson('y1u6l3', 'What Comes Next?', ['1Nc.08'], 'tails', 'Pattern spotter!', 'Spot the step, then say the next number.', ['Find how it grows.', 'Add the same step.', 'Say the next number.'], [Y1.gY1NumberPattern], Y1.gY1NumberPattern),
  makeLesson('y1u6l4', 'Spot the Pattern', ['1Nc.09'], 'sonic', 'Repeat after me!', 'Shape patterns repeat again and again.', ['Find the part that repeats.', 'Say it in a rhythm.', 'The next one starts again.'], [G.gPatternNext], G.gPatternNext),
]
const u6Boss = makeLesson('y1u6boss', 'Sharing & Patterns Boss', ['1Ni.12'], 'eggman', 'BOSS TIME!', 'Groups, sharing and patterns - finish strong!', ['Equal groups add alike.', 'Share one at a time.', 'Patterns always repeat.'], [Y1.gY1RepeatedAddition, Y1.gY1Sharing, Y1.gY1NumberPattern, G.gPatternNext], Y1.gY1Sharing)

/* ===== UNIT 7 · Halves & Quarters (1Nf) =========================== */
const u7Lessons: LessonDef[] = [
  makeLesson('y1u7l1', 'Equal Parts', ['1Nf.01'], 'amy', 'Pizza party!', 'Halves need 2 equal parts. Quarters need 4.', ['Check every part is equal.', 'Same size, same shape.', 'Parts must match in size.'], [Y1.gY1EqualParts], Y1.gY1EqualParts),
  makeLesson('y1u7l2', 'Shaded Halves', ['1Nf.02'], 'sonic', 'Half time!', 'One half is ONE of two equal parts.', ['Count the parts.', 'Count the shaded ones.', 'Say: one half.'], [Y1.gY1HalfShape], Y1.gY1HalfShape),
  makeLesson('y1u7l3', 'Shaded Quarters', ['1Nf.03'], 'tails', 'Four slices!', 'A quarter is ONE of four equal parts.', ['Count all four parts.', 'Count the shaded part.', 'Four quarters make one.'], [Y1.gY1QuarterShape], Y1.gY1QuarterShape),
  makeLesson('y1u7l4', 'Half of a Number', ['1Nf.04'], 'knuckles', 'Split in two!', 'Halving shares a number into TWO equal groups.', ['Share into two groups.', 'Count one group.', 'Half of 10 is 5.'], [Y1.gY1HalfNumber], Y1.gY1HalfNumber),
  makeLesson('y1u7l5', 'Quarter of a Number', ['1Nf.05'], 'shadow', 'Four equal groups!', 'A quarter shares into FOUR equal groups.', ['Count in fours: 4, 8, 12.', 'One group is the answer.', 'Check all four match.'], [Y1.gY1QuarterNumber], Y1.gY1QuarterNumber),
]
const u7Boss = makeLesson('y1u7boss', 'Halves & Quarters Boss', ['1Nf.01'], 'eggman', 'BOSS TIME!', 'Slice through every fraction question!', ['Equal parts first.', 'Halves are two parts.', 'Quarters are four parts.'], [Y1.gY1EqualParts, Y1.gY1HalfShape, Y1.gY1QuarterShape, Y1.gY1HalfNumber, Y1.gY1QuarterNumber], Y1.gY1HalfNumber)

/* ===== UNIT 8 · Longer, Heavier, Fuller (1Gg) ====================== */
const u8Lessons: LessonDef[] = [
  makeLesson('y1u8l1', 'Longer & Shorter', ['1Gg.01'], 'knuckles', 'Size showdown!', 'Compare lengths by lining the ends up.', ['Line up one end.', 'See which sticks out.', 'Longer means more length.'], [Y1.gY1LongerShorter], Y1.gY1LongerShorter),
  makeLesson('y1u8l2', 'Heavier & Lighter', ['1Gg.02'], 'amy', 'Balance time!', 'Put both things on the scales to compare.', ['The lower side is heavier.', 'The higher side is lighter.', 'Guess first, then weigh.'], [Y1.gY1HeavierLighter], Y1.gY1HeavierLighter),
  makeLesson('y1u8l3', 'Full or Empty?', ['1Gg.03'], 'tails', 'Pour it up!', 'Full, half full or empty - watch the water line.', ['Look where the water stops.', 'Halfway means half full.', 'Nothing inside means empty.'], [Y1.gY1FullEmpty], Y1.gY1FullEmpty),
  makeLesson('y1u8l4', 'Tools for the Job', ['1Gg.04'], 'shadow', 'Right tool!', 'Every job needs the right tool.', ['A ruler measures length.', 'Scales tell how heavy.', 'Line ends up to compare.'], [Y1.gY1MeasureTools], Y1.gY1MeasureTools),
]
const u8Boss = makeLesson('y1u8boss', 'Measure Boss', ['1Gg.01'], 'eggman', 'BOSS TIME!', 'Longer, heavier, fuller - measure it all!', ['Picture each tool first.', 'Compare before you answer.', 'Half full is halfway up.'], [Y1.gY1LongerShorter, Y1.gY1HeavierLighter, Y1.gY1FullEmpty, Y1.gY1MeasureTools], Y1.gY1FullEmpty)

/* ===== UNIT 9 · Money (1Nm) ======================================= */
const u9Lessons: LessonDef[] = [
  makeLesson('y1u9l1', 'Coin Values', ['1Nm.01'], 'sonic', 'Coin counting!', 'Know what every coin is worth.', ['Read the number in p.', 'Bigger number, more worth.', '10p beats 5p.'], [Y1.gY1CoinValue], Y1.gY1CoinValue),
  makeLesson('y1u9l2', 'Counting Money', ['1Nm.02'], 'amy', 'Add the pile!', 'Count the coins, biggest first.', ['Start with the biggest coin.', 'Count on in fives.', 'Write the total in p.'], [Y1.gY1CoinTotal], Y1.gY1CoinTotal),
  makeLesson('y1u9l3', 'Same Value', ['1Nm.03'], 'tails', 'Trade up!', 'Different coins can be worth the same.', ['Count each pile.', 'Compare the totals.', 'Two 5p coins make 10p.'], [Y1.gY1CoinSame], Y1.gY1CoinSame),
]
const u9Boss = makeLesson('y1u9boss', 'Money Boss', ['1Nm.01'], 'eggman', 'BOSS TIME!', 'Name it, count it, match it!', ['Biggest coin first.', 'Count on in order.', 'Same value, different coins.'], [Y1.gY1CoinValue, Y1.gY1CoinTotal, Y1.gY1CoinSame], Y1.gY1CoinTotal)

/* ===== UNIT 10 · Time (1Gt) ======================================= */
const u10Lessons: LessonDef[] = [
  makeLesson('y1u10l1', "O'Clock", ['1Gt.01'], 'tails', 'Top of the hour!', "When the minute hand points UP, it is o'clock.", ['The short hand shows the hour.', "Minute hand up = o'clock.", 'Say the hour out loud.'], [Y1.gY1Clock], Y1.gY1Clock),
  makeLesson('y1u10l2', 'Half Past', ['1Gt.02'], 'knuckles', 'Down the bottom!', 'When the minute hand points DOWN, it is half past.', ['Minute hand down = 30 past.', 'Half past 3 is 30 after 3.', 'The hour hand moves too.'], [Y1.gY1Clock], Y1.gY1Clock),
  makeLesson('y1u10l3', 'Days & Seasons', ['1Gt.03'], 'amy', 'Week wizard!', 'Seven days make a week. Four seasons make a year.', ['Sing the days in order.', 'Then sing the seasons.', 'After Sunday comes Monday.'], [G.gDayOrder, Y1.gY1Seasons], Y1.gY1Seasons),
  makeLesson('y1u10l4', 'Before & After', ['1Gt.04'], 'sonic', 'Hop through days!', 'Yesterday is before today. Tomorrow is after.', ['Yesterday comes first.', 'Tomorrow comes next.', 'Picture the week in a line.'], [Y1.gY1DayWhen], Y1.gY1DayWhen),
]
const u10Boss = makeLesson('y1u10boss', 'Time Boss', ['1Gt.01'], 'eggman', 'BOSS TIME!', 'O clock, half past, days - master time!', ['Check the minute hand.', 'Half past means 30.', 'Sing the days if stuck.'], [Y1.gY1Clock, G.gDayOrder, Y1.gY1Seasons, Y1.gY1DayWhen], Y1.gY1Clock)

/* ===== UNIT 11 · Shapes, Position & Turns (1Gg, 1Gp) ============= */
const u11Lessons: LessonDef[] = [
  makeLesson('y1u11l1', '2-D Shapes', ['1Gg.05'], 'shadow', 'Shape squad!', 'Flat shapes: circles, triangles, squares, rectangles.', ['Count the sides.', 'Count the corners.', 'Round means a circle.'], [Y1.gY1Shape2D], Y1.gY1Shape2D),
  makeLesson('y1u11l2', '3-D Shapes', ['1Gg.06'], 'knuckles', 'Solid shapes!', 'Cubes, cuboids, spheres, cones and cylinders.', ['Boxes are cuboids.', 'Balls are spheres.', 'Roll it in your mind.'], [Y1.gY1Shape3D], Y1.gY1Shape3D),
  makeLesson('y1u11l3', 'Position Words', ['1Gp.01'], 'tails', 'Where is it?', 'Position words tell WHERE things sit.', ['Between means in the middle.', 'Behind means at the back.', 'Next to means beside.'], [G.gPositionWords], G.gPositionWords),
  makeLesson('y1u11l4', 'Whole, Half & Quarter Turns', ['1Gp.02'], 'amy', 'Turn around!', 'Whole, half, quarter and three quarter turns.', ['A whole turn goes all round.', 'A half turn faces back.', 'A quarter is one corner.'], [Y1.gY1Turns], Y1.gY1Turns),
  makeLesson('y1u11l5', 'Repeating Patterns', ['1Gp.03'], 'sonic', 'Repeat after me!', 'Patterns repeat again and again.', ['Find the starting part.', 'Say it in a rhythm.', 'Predict the next shape.'], [G.gPatternNext], G.gPatternNext),
]
const u11Boss = makeLesson('y1u11boss', 'Shape Boss', ['1Gg.05'], 'eggman', 'BOSS TIME!', 'Flat, solid, turning, moving - conquer shapes!', ['Name it, then answer.', 'Turn it in your mind.', 'Patterns always repeat.'], [Y1.gY1Shape2D, Y1.gY1Shape3D, Y1.gY1Turns, G.gPatternNext], Y1.gY1Shape2D)

export const Y1_UNITS: UnitDef[] = [
  { id: 'y1u1', order: 1, title: 'Counting to 20', subtitle: 'Cambridge Stage 1 units 1 & 9 · count on/back · odd/even', color: '#58cc02', icon: '🔢', lessons: [...u1Lessons, u1Boss], bossLessonIds: [u1Boss.id] },
  { id: 'y1u2', order: 2, title: 'Words, Order & Sorting', subtitle: 'Cambridge Stage 1 units 2 & 8 · order · sorting sets', color: '#1cb0f6', icon: '🔤', lessons: [...u2Lessons, u2Boss], bossLessonIds: [u2Boss.id] },
  { id: 'y1u3', order: 3, title: 'Friends of 10 & Doubles', subtitle: 'Cambridge Stage 1 unit 2 · pairs · doubles to 20', color: '#ce82ff', icon: '🤝', lessons: [...u3Lessons, u3Boss], bossLessonIds: [u3Boss.id] },
  { id: 'y1u4', order: 4, title: 'Adding to 20', subtitle: 'NC Y1 adding · missing parts · story sums', color: '#ff9600', icon: '➕', lessons: [...u4Lessons, u4Boss], bossLessonIds: [u4Boss.id] },
  { id: 'y1u5', order: 5, title: 'Subtracting to 20', subtitle: 'NC Y1 taking away · how many more · story sums', color: '#00cd9c', icon: '➖', lessons: [...u5Lessons, u5Boss], bossLessonIds: [u5Boss.id] },
  { id: 'y1u6', order: 6, title: 'Sharing & Patterns', subtitle: 'Cambridge Stage 1 unit 9.3 · equal groups · patterns', color: '#0ea5e9', icon: '🍪', lessons: [...u6Lessons, u6Boss], bossLessonIds: [u6Boss.id] },
  { id: 'y1u7', order: 7, title: 'Halves & Quarters', subtitle: 'Cambridge Stage 1 unit 12 · NC Y1 equal parts', color: '#fb7185', icon: '🍕', lessons: [...u7Lessons, u7Boss], bossLessonIds: [u7Boss.id] },
  { id: 'y1u8', order: 8, title: 'Longer, Heavier, Fuller', subtitle: 'Cambridge Stage 1 units 5 & 13 · compare & describe', color: '#eab308', icon: '📏', lessons: [...u8Lessons, u8Boss], bossLessonIds: [u8Boss.id] },
  { id: 'y1u9', order: 9, title: 'Money', subtitle: 'Cambridge Stage 1 unit 10.4 · coin values to 20p', color: '#4a90e2', icon: '💰', lessons: [...u9Lessons, u9Boss], bossLessonIds: [u9Boss.id] },
  { id: 'y1u10', order: 10, title: 'Time', subtitle: "Cambridge Stage 1 units 7 & 15 · o'clock & half past", color: '#22d3ee', icon: '⏰', lessons: [...u10Lessons, u10Boss], bossLessonIds: [u10Boss.id] },
  { id: 'y1u11', order: 11, title: 'Shapes, Position & Turns', subtitle: 'Cambridge Stage 1 units 3, 6, 11 & 14 · 2-D & 3-D', color: '#a3e635', icon: '🔷', lessons: [...u11Lessons, u11Boss], bossLessonIds: [u11Boss.id] },
]

export const Y1_ALL_LESSONS: Record<string, { unit: UnitDef; lesson: LessonDef }> = {}
for (const u of Y1_UNITS) for (const l of u.lessons) Y1_ALL_LESSONS[l.id] = { unit: u, lesson: l }
