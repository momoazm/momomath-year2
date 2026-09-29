/** PLAN 169a — Year-1 english curriculum (the Year-1 rollout's english
 *  pilot). Mirrors the Year-2 and Year-1 maths structure: units, intro
 *  cards, teach lines, generated activity queues and a boss at the end of
 *  every unit.
 *
 *  PROVENANCE (extracted by research agents, 2026-09-29):
 *  1. DfE national curriculum in England: English programmes of study,
 *     Year 1 (statutory, 2014) — word reading (Phases 2-5 phonics, decoding
 *     and comprehension are taught together), comprehension (retelling,
 *     predicting, sequencing, vocabulary discussion), composition (sentence
 *     composition, joining words with and/but/so, punctuation for meaning),
 *     spelling (the Appendix 1 Year-1 rules + common exception words),
 *     vocabulary/grammar/punctuation (capital letters, full stops, question
 *     and exclamation marks, singular/plural, finger spaces).
 *  2. DfE "English appendix 1: spelling" (DFE-00181-2013) — the Year-1
 *     common exception word list and every statutory spelling-rule example
 *     word; see src/content/syllabus/y1/english.ts for the extracted list.
 *  3. DfE "Letters and Sounds" (DFES-00281-2007) — Phases 2-5: CVC
 *     blending, digraphs, adjacent blends, split digraphs and the long
 *     vowel teams the phonics lessons practise.
 *  4. Cambridge Primary English Stage 1 (Learner's Book 1) — unit/text-type
 *     spine only (poems, stories, instructions); CUP publishes no public
 *     word list for Stage 1, so word coverage comes from the DfE lists.
 *
 *  Objective codes use the app's mirrored Stage scheme with the Year-1
 *  prefix (1Rw word reading, 1Ri comprehension, 1Rv vocabulary, 1Ww
 *  composition, 1Wg grammar, 1Wp punctuation, 1Ws spelling, 1SLs spoken
 *  language + sequential numbers) — the same convention as the Year-1 maths
 *  pilot (1Nc…); Year 2 uses the 2-prefix families.
 *
 *  Lesson ids are prefixed `y1e` so they can never collide with the
 *  Year-2 english `e<N>l<M>` ids or the Year-1 maths `y1u<N>…` ids
 *  (progress maps are keyed by lesson id — PLAN 169a tests this). */
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

/* ===== UNIT 1 · First Sounds & Blending (1Rw) ==================== */
const u1Lessons: LessonDef[] = [
  makeLesson('y1e1l1', 'The Alphabet', ['1Rw.01'], 'tails', 'Letter order!', 'The alphabet has a fixed order. Sing it, then tap it.', ['Sing a-b-c-d in your head.', 'Find the next letter.', 'Q comes after P.'], [Y1.gY1AlphabetOrder, Y1.gY1NextLetter], Y1.gY1NextLetter),
  makeLesson('y1e1l2', 'Tap the Word You Hear', ['1Rw.02'], 'sonic', 'Listen first!', 'Say it in your ear, then find the word.', ['Listen to the whole word.', 'Tap each sound in your head.', 'Then choose the word.'], [Y1.gY1HearWord, Y1.gY1FirstSound], Y1.gY1HearWord),
  makeLesson('y1e1l3', 'Word and Picture', ['1Rw.03'], 'amy', 'Match up!', 'Read the word, then find its picture.', ['Read the word slowly.', 'Say it out loud.', 'Tap the picture that fits.'], [Y1.gY1WordPictureMatch, Y1.gY1PictureWord], Y1.gY1WordPictureMatch),
  makeLesson('y1e1l4', 'Real or Made Up?', ['1Rw.04'], 'knuckles', 'Word detective!', 'Some words are real. Some are silly alien words.', ['Sound the word out.', 'Does it make sense?', 'Real words mean something.'], [Y1.gY1RealOrAlien, Y1.gY1FinishWord], Y1.gY1RealOrAlien),
  makeLesson('y1e1l5', 'First Sounds & Letter Pairs', ['1Rw.05'], 'shadow', 'Sound check!', 'First letter, last letter, and the pairs that go together.', ['Check the first letter.', 'Then the last letter.', 'Two letters can make one sound.'], [Y1.gY1FirstSound, Y1.gY1CollectSound, Y1.gY1FinishWord], Y1.gY1CollectSound),
]
const u1Boss = makeLesson('y1e1boss', 'Sounds Boss', ['1Rw.02'], 'eggman', 'BOSS TIME!', 'Letters, sounds and real words - prove you know them!', ['Listen before you tap.', 'Sound every word out.', 'Alien words are not real!'], [Y1.gY1HearWord, Y1.gY1RealOrAlien, Y1.gY1WordPictureMatch, Y1.gY1FinishWord, Y1.gY1AlphabetOrder], Y1.gY1HearWord)

/* ===== UNIT 2 · Digraphs & Long Sounds (1Rw) ===================== */
const u2Lessons: LessonDef[] = [
  makeLesson('y1e2l1', 'Two Letters, One Sound', ['1Rw.06'], 'sonic', 'Team up!', 'Two letters can make ONE sound. Spot the pair.', ['Look at two letters together.', 'Say the sound they make.', 'sh says sh!'], [Y1.gY1DigraphSound, Y1.gY1DigraphMatch], Y1.gY1DigraphSound),
  makeLesson('y1e2l2', 'Hear the Long Sound', ['1Rw.07'], 'tails', 'Long vowel!', 'A silent e makes the vowel say its name.', ['Say the word slowly.', 'The long vowel says its name.', 'cake says cake!'], [Y1.gY1HearLong, Y1.gY1LongVowelWord], Y1.gY1HearLong),
  makeLesson('y1e2l3', 'Which Sound Is Different?', ['1Rw.08'], 'amy', 'Odd one out!', 'Three words share a sound. Find the stranger.', ['Say every word.', 'Listen to the middle sound.', 'One word will be different.'], [Y1.gY1OddSound, Y1.gY1OddSplit], Y1.gY1OddSound),
  makeLesson('y1e2l4', 'Find the Letter Pair', ['1Rw.09'], 'shadow', 'Pair hunt!', 'Tap the letter pair every time you see it.', ['Read the pair at the top.', 'Scan every tile.', 'Tap only the matching pair.'], [Y1.gY1CollectSound, Y1.gY1DigraphSound], Y1.gY1DigraphSound),
]
const u2Boss = makeLesson('y1e2boss', 'Digraph Boss', ['1Rw.06'], 'eggman', 'BOSS TIME!', 'Digraphs, long sounds and odd ones out - go!', ['Two letters, one sound.', 'Silent e makes long sounds.', 'Listen for the odd word.'], [Y1.gY1DigraphSound, Y1.gY1DigraphMatch, Y1.gY1HearLong, Y1.gY1LongVowelWord, Y1.gY1OddSound], Y1.gY1DigraphSound)

/* ===== UNIT 3 · Blends & Word Building (1Rw) ===================== */
const u3Lessons: LessonDef[] = [
  makeLesson('y1e3l1', 'Blend the Word', ['1Rw.10'], 'knuckles', 'Squish sounds!', 'Say each sound, then push them together.', ['Say f - r - o - g.', 'Push the sounds together.', 'frog! Now tap the picture.'], [Y1.gY1BlendWord, Y1.gY1PictureWord], Y1.gY1BlendWord),
  makeLesson('y1e3l2', 'Start Sounds', ['1Rw.11'], 'sonic', 'Start with!', 'Blend at the start of words: st, tr, bl, cl.', ['Look at the first two letters.', 'Say the blend fast.', 'Tap every matching pair.'], [Y1.gY1CollectBlend, Y1.gY1FirstSound], Y1.gY1CollectBlend),
  makeLesson('y1e3l3', 'Middle Sounds', ['1Rw.05'], 'amy', 'Fill the gap!', 'One sound is hiding in the middle of the word.', ['Look at the first and last letter.', 'Try each middle sound.', 'Does the word make sense?'], [Y1.gY1FinishWord, Y1.gY1CollectBlend], Y1.gY1FinishWord),
  makeLesson('y1e3l4', 'Read and Match', ['1Rw.12'], 'tails', 'Speed read!', 'Read the word fast, then match it.', ['Read without sounding out.', 'Say the whole word.', 'Match it to the picture.'], [Y1.gY1WordPictureMatch, Y1.gY1HearWord], Y1.gY1WordPictureMatch),
]
const u3Boss = makeLesson('y1e3boss', 'Blending Boss', ['1Rw.10'], 'eggman', 'BOSS TIME!', 'Blend, fill and match - beat the reading boss!', ['Blend every sound.', 'Check the middle sound.', 'Read the word whole.'], [Y1.gY1BlendWord, Y1.gY1CollectBlend, Y1.gY1FinishWord, Y1.gY1FirstSound, Y1.gY1HearWord], Y1.gY1BlendWord)

/* ===== UNIT 4 · Tricky Words (1Ws, 1Rw, 1Ww) ===================== */
const u4Lessons: LessonDef[] = [
  makeLesson('y1e4l1', 'Spell the Tricky Word', ['1Ws.01'], 'amy', 'Tricky time!', 'These words do not sound the way they look.', ['Say the word first.', 'Tap the tiles in order.', 'said does not say sed.'], [Y1.gY1TrickyTiles, Y1.gY1WhichSpelling], Y1.gY1TrickyTiles),
  makeLesson('y1e4l2', 'Which Spelling Is Right?', ['1Ws.02'], 'shadow', 'Tricky eyes!', 'Only one spelling is right. Find it.', ['Read every choice.', 'Which looks right?', 'Trust your memory.'], [Y1.gY1WhichSpelling, Y1.gY1TrickyTiles], Y1.gY1WhichSpelling),
  makeLesson('y1e4l3', 'Tricky Words and Pictures', ['1Rw.13'], 'sonic', 'Word and pic!', 'Read the tricky word, then tap its picture.', ['Read the word.', 'Picture it in your mind.', 'Tap the match.'], [Y1.gY1TrickyMatch, Y1.gY1WordPictureMatch], Y1.gY1TrickyMatch),
  makeLesson('y1e4l4', 'Tricky Words in a Line', ['1Ww.01'], 'tails', 'Sentence line!', 'Put the words in order to make a sentence.', ['Find the first word.', 'Read it in your head.', 'Does it sound right?'], [Y1.gY1TrickySentence, Y1.gY1BuildSentence], Y1.gY1TrickySentence),
]
const u4Boss = makeLesson('y1e4boss', 'Tricky Words Boss', ['1Ws.01'], 'eggman', 'BOSS TIME!', 'Spell, spot and read the tricky words - all of them!', ['Say it, then spell it.', 'One spelling is right.', 'Read the line after.'], [Y1.gY1TrickyTiles, Y1.gY1WhichSpelling, Y1.gY1TrickyMatch, Y1.gY1TrickySentence, Y1.gY1HearWord], Y1.gY1WhichSpelling)

/* ===== UNIT 5 · Spelling Rules (1Ws) ============================= */
const u5Lessons: LessonDef[] = [
  makeLesson('y1e5l1', 'Double Letters & ck', ['1Ws.03'], 'knuckles', 'Double up!', 'Short vowel, then double the last letter. Or use ck.', ['Listen to the middle sound.', 'Short vowel means double it.', 'k after c or ck goes after.'], [Y1.gY1Doubled, Y1.gY1CKRule], Y1.gY1Doubled),
  makeLesson('y1e5l2', 'nk, tch & Friends', ['1Ws.04'], 'sonic', 'Tricky endings!', 'nk says nk. tch says ch at the end.', ['Say the ending aloud.', 'nk comes after a vowel.', 'tch keeps the t sound.'], [Y1.gY1NKWord, Y1.gY1TchWord], Y1.gY1NKWord),
  makeLesson('y1e5l3', 'Syllable Beats', ['1Ws.05'], 'amy', 'Clap it out!', 'Every beat is one part of the word.', ['Say the word slowly.', 'Clap once per beat.', 'Count the claps.'], [Y1.gY1ClapBeats, Y1.gY1SuffixIng], Y1.gY1ClapBeats),
  makeLesson('y1e5l4', 'Which One Is Right?', ['1Ws.06'], 'shadow', 'Rule check!', 'Use the rule, then pick the right spelling.', ['Sound the word out.', 'Which rule applies?', 'Pick the spelling that fits.'], [Y1.gY1Doubled, Y1.gY1WhichSpelling, Y1.gY1CKRule], Y1.gY1WhichSpelling),
]
const u5Boss = makeLesson('y1e5boss', 'Spelling Boss', ['1Ws.03'], 'eggman', 'BOSS TIME!', 'Doubling, nk, tch and beats - the full rules run!', ['Short vowel? Double it.', 'Clap before you spell.', 'One choice fits the rule.'], [Y1.gY1Doubled, Y1.gY1CKRule, Y1.gY1NKWord, Y1.gY1TchWord, Y1.gY1ClapBeats], Y1.gY1Doubled)

/* ===== UNIT 6 · Word Endings (1Ws, 1Wg) ========================== */
const u6Lessons: LessonDef[] = [
  makeLesson('y1e6l1', 'One and Many', ['1Ws.07'], 'tails', 'Plural power!', 'Add s for more than one. Sometimes es.', ['One cat, two cats.', 'Most words take s.', 'Words ending in s take es.'], [Y1.gY1Plural, Y1.gY1SuffixErEst], Y1.gY1Plural),
  makeLesson('y1e6l2', 'Add -ing and -ed', ['1Ws.08'], 'amy', 'Action endings!', 'ing is happening now. ed already happened.', ['Jump is now.', 'Jumping is happening now.', 'Jumped already happened.'], [Y1.gY1SuffixIng, Y1.gY1Plural], Y1.gY1SuffixIng),
  makeLesson('y1e6l3', 'un- Words', ['1Wg.01'], 'knuckles', 'Flip it!', 'un- means NOT. unhappy means not happy.', ['Find the base word.', 'un- flips the meaning.', 'unhappy means not happy.'], [Y1.gY1UnPrefix, Y1.gY1YEndings], Y1.gY1UnPrefix),
  makeLesson('y1e6l4', 'Compound Words & -y', ['1Ws.09'], 'sonic', 'Squish & end!', 'Two words squish together. Many small words end in y.', ['foot + ball makes football.', 'Squish the two words.', 'Small words often end in y.'], [Y1.gY1Compound, Y1.gY1YEndings, Y1.gY1SuffixIng], Y1.gY1Compound),
]
const u6Boss = makeLesson('y1e6boss', 'Endings Boss', ['1Ws.07'], 'eggman', 'BOSS TIME!', 'Plurals, -ing, -ed, un- and compounds - finish them!', ['More than one? Add s.', 'ing is now, ed is then.', 'un- means not.'], [Y1.gY1Plural, Y1.gY1SuffixIng, Y1.gY1SuffixErEst, Y1.gY1UnPrefix, Y1.gY1Compound], Y1.gY1SuffixIng)

/* ===== UNIT 7 · Sentences & Marks (1Wp, 1Ww, 1Wg) ================= */
const u7Lessons: LessonDef[] = [
  makeLesson('y1e7l1', 'Capital Letters', ['1Wp.01'], 'amy', 'Big start!', 'Every sentence starts with a capital letter.', ['Look at the first letter.', 'Capitals start sentences.', 'Names get capitals too.'], [Y1.gY1CapitalPick, Y1.gY1SentenceTF], Y1.gY1CapitalPick),
  makeLesson('y1e7l2', 'Full Stop, Question, Bang!', ['1Wp.02'], 'sonic', 'End marks!', 'A sentence ends with . ? or ! - pick the right one.', ['Read the sentence aloud.', 'Is it telling or asking?', 'Feeling big? Use !'], [Y1.gY1EndMark, Y1.gY1SentenceTF], Y1.gY1EndMark),
  makeLesson('y1e7l3', 'Build the Sentence', ['1Ww.02'], 'tails', 'Build it!', 'Put the words in order. Start with a capital.', ['Find the capital letter word.', 'Read the line in your head.', 'Finish with a mark.'], [Y1.gY1BuildSentence, Y1.gY1TrickySentence], Y1.gY1BuildSentence),
  makeLesson('y1e7l4', 'Joining Words', ['1Wg.02'], 'knuckles', 'Join up!', 'and, but, so and or join two parts together.', ['Read both parts.', 'and joins the same idea.', 'but shows a turn.'], [Y1.gY1JoinWord, Y1.gY1EndMark], Y1.gY1JoinWord),
]
const u7Boss = makeLesson('y1e7boss', 'Sentence Boss', ['1Wp.01'], 'eggman', 'BOSS TIME!', 'Capitals, marks, joins - write it like a pro!', ['Start big, end with a mark.', 'Read it back in your head.', 'Joining words link ideas.'], [Y1.gY1CapitalPick, Y1.gY1EndMark, Y1.gY1BuildSentence, Y1.gY1JoinWord, Y1.gY1SentenceTF], Y1.gY1EndMark)

/* ===== UNIT 8 · Stories & Meaning (1Ri, 1SLs) ==================== */
const u8Lessons: LessonDef[] = [
  makeLesson('y1e8l1', 'Story Order', ['1Ri.01'], 'sonic', 'Story steps!', 'Every story happens in order. Put it right.', ['Read every event.', 'What happened first?', 'Then next, then last.'], [Y1.gY1StorySequence, Y1.gY1StoryTF], Y1.gY1StorySequence),
  makeLesson('y1e8l2', 'True or False?', ['1Ri.02'], 'tails', 'Story check!', 'Read the story, then judge the sentence.', ['Read the story card.', 'Find the answer inside it.', 'True or false?'], [Y1.gY1StoryTF, Y1.gY1Predict], Y1.gY1StoryTF),
  makeLesson('y1e8l3', 'What Happens Next?', ['1Ri.03'], 'amy', 'Predict!', 'Good readers guess what comes next.', ['Read the start.', 'What makes sense next?', 'Silly answers are wrong.'], [Y1.gY1Predict, Y1.gY1StoryTitle], Y1.gY1Predict),
  makeLesson('y1e8l4', 'Tell the Story', ['1SLs.01'], 'knuckles', 'Speak up!', 'Read the line out loud. Clear voice, steady pace.', ['Take a breath.', 'Read each word.', 'Speak so we can hear.'], [Y1.gY1TellIt, Y1.gY1StorySequence], Y1.gY1TellIt),
]
const u8Boss = makeLesson('y1e8boss', 'Story Boss', ['1Ri.01'], 'eggman', 'BOSS TIME!', 'Order, true-false, predict and tell - story mastery!', ['Events go in order.', 'Answers hide in the text.', 'Guess what comes next.'], [Y1.gY1StorySequence, Y1.gY1StoryTF, Y1.gY1Predict, Y1.gY1StoryTitle, Y1.gY1TellIt], Y1.gY1Predict)

/* ===== UNIT 9 · Word Wizard (1Rv) ================================= */
const u9Lessons: LessonDef[] = [
  makeLesson('y1e9l1', 'Which One Does Not Belong?', ['1Rv.01'], 'shadow', 'Sort it!', 'Three words fit one group. One does not.', ['Name the group.', 'Check every word.', 'One does not fit.'], [Y1.gY1OddCategory, Y1.gY1Opposites], Y1.gY1OddCategory),
  makeLesson('y1e9l2', 'Opposites', ['1Rv.02'], 'tails', 'Flip meaning!', 'An opposite means the exact other side.', ['Say the word.', 'What is the other side?', 'big flips to little.'], [Y1.gY1OppositePick, Y1.gY1Opposites], Y1.gY1OppositePick),
  makeLesson('y1e9l3', 'Young Animals & Meanings', ['1Rv.03'], 'amy', 'Word meanings!', 'A kitten is a young cat. Know your words.', ['Read the question.', 'Think of the young word.', 'Match meaning to word.'], [Y1.gY1YoungAnimal, Y1.gY1OppositePick], Y1.gY1YoungAnimal),
]
const u9Boss = makeLesson('y1e9boss', 'Word Boss', ['1Rv.01'], 'eggman', 'BOSS TIME!', 'Groups, opposites and meanings - word mastery!', ['Name the group first.', 'Opposites flip meaning.', 'Read every choice.'], [Y1.gY1OddCategory, Y1.gY1Opposites, Y1.gY1OppositePick, Y1.gY1YoungAnimal], Y1.gY1OppositePick)

/* ===== UNIT 10 · Poems & Rhymes (1Ri, 1SLs) ====================== */
const u10Lessons: LessonDef[] = [
  makeLesson('y1e10l1', 'Find the Rhyme', ['1Ri.04'], 'sonic', 'Rhyme time!', 'Rhyming words end with the same sound.', ['Say both words.', 'Listen to the end.', 'cat and hat rhyme.'], [Y1.gY1FindRhyme, Y1.gY1RhymeMatch], Y1.gY1FindRhyme),
  makeLesson('y1e10l2', 'Clap the Beats', ['1Ri.05'], 'amy', 'Poem rhythm!', 'Poems have beats. Clap them out.', ['Say the word slowly.', 'Clap each beat.', 'Count the claps.'], [Y1.gY1ClapBeats, Y1.gY1FindRhyme], Y1.gY1ClapBeats),
  makeLesson('y1e10l3', 'Finish the Line', ['1Ri.06'], 'tails', 'Poem recall!', 'You know these lines. Finish the rhyme.', ['Read the line aloud.', 'What word comes next?', 'Does it rhyme too?'], [Y1.gY1PoemLine, Y1.gY1RhymeMatch], Y1.gY1PoemLine),
  makeLesson('y1e10l4', 'Poem in Order & Out Loud', ['1SLs.02'], 'knuckles', 'Perform it!', 'Order the lines, then read them with feeling.', ['Find the first line.', 'Read it like a poem.', 'Clap as you read.'], [Y1.gY1PoemOrder, Y1.gY1PoemSpeak], Y1.gY1PoemSpeak),
]
const u10Boss = makeLesson('y1e10boss', 'Poetry Boss', ['1Ri.04'], 'eggman', 'BOSS TIME!', 'Rhymes, beats, lines - the poetry grand finale!', ['Listen to the end sound.', 'Clap the rhythm.', 'Speak with feeling.'], [Y1.gY1FindRhyme, Y1.gY1RhymeMatch, Y1.gY1PoemLine, Y1.gY1PoemOrder, Y1.gY1PoemSpeak], Y1.gY1PoemLine)

export const ENGLISH_Y1_UNITS: UnitDef[] = [
  { id: 'y1e1', order: 1, title: 'First Sounds & Blending', subtitle: 'DfE Y1 word reading · Letters and Sounds Phases 2-3 · alphabet', color: '#f97316', icon: '🔤', lessons: [...u1Lessons, u1Boss], bossLessonIds: [u1Boss.id] },
  { id: 'y1e2', order: 2, title: 'Digraphs & Long Sounds', subtitle: 'Letters and Sounds Phases 3 & 5 · digraphs · split digraphs', color: '#06b6d4', icon: '🌀', lessons: [...u2Lessons, u2Boss], bossLessonIds: [u2Boss.id] },
  { id: 'y1e3', order: 3, title: 'Blends & Word Building', subtitle: 'Letters and Sounds Phase 4 · adjacent blends · fluency', color: '#8b5cf6', icon: '🧩', lessons: [...u3Lessons, u3Boss], bossLessonIds: [u3Boss.id] },
  { id: 'y1e4', order: 4, title: 'Tricky Words', subtitle: 'DfE Appendix 1 · common exception words · read & spell', color: '#ec4899', icon: '⭐', lessons: [...u4Lessons, u4Boss], bossLessonIds: [u4Boss.id] },
  { id: 'y1e5', order: 5, title: 'Spelling Rules', subtitle: 'DfE Appendix 1 Year 1 · ff ll ss zz ck · nk · tch · syllables', color: '#14b8a6', icon: '✏️', lessons: [...u5Lessons, u5Boss], bossLessonIds: [u5Boss.id] },
  { id: 'y1e6', order: 6, title: 'Word Endings', subtitle: 'DfE Appendix 1 Year 1 · -s -es -ing -ed -er -est · un- · -y', color: '#eab308', icon: '🧱', lessons: [...u6Lessons, u6Boss], bossLessonIds: [u6Boss.id] },
  { id: 'y1e7', order: 7, title: 'Sentences & Marks', subtitle: 'DfE Y1 composition & punctuation · capitals · . ? ! · and/but/so', color: '#6366f1', icon: '💬', lessons: [...u7Lessons, u7Boss], bossLessonIds: [u7Boss.id] },
  { id: 'y1e8', order: 8, title: 'Stories & Meaning', subtitle: 'DfE Y1 comprehension · retell · predict · speak aloud', color: '#f43f5e', icon: '📖', lessons: [...u8Lessons, u8Boss], bossLessonIds: [u8Boss.id] },
  { id: 'y1e9', order: 9, title: 'Word Wizard', subtitle: 'DfE Y1 vocabulary · categories · opposites · word meanings', color: '#84cc16', icon: '🗂️', lessons: [...u9Lessons, u9Boss], bossLessonIds: [u9Boss.id] },
  { id: 'y1e10', order: 10, title: 'Poems & Rhymes', subtitle: 'Cambridge Stage 1 poetry spine · rhyme · rhythm · recital', color: '#a855f7', icon: '🎵', lessons: [...u10Lessons, u10Boss], bossLessonIds: [u10Boss.id] },
]

export const ENGLISH_Y1_ALL_LESSONS: Record<string, { unit: UnitDef; lesson: LessonDef }> = {}
for (const u of ENGLISH_Y1_UNITS) for (const l of u.lessons) ENGLISH_Y1_ALL_LESSONS[l.id] = { unit: u, lesson: l }
