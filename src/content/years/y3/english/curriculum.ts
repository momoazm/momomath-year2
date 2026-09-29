/** PLAN 169d — Year-3 english curriculum (DfE national curriculum England,
 *  years 3 and 4 programme of study). Mirrors the Y1/Y2/Y3-maths structure:
 *  units, intro cards, teach lines, generated activity queues and a boss
 *  at the end of every unit.
 *
 *  PROVENANCE:
 *  1. DfE national curriculum in England: English programmes of study,
 *     key stages 1 and 2 (2014) — "Years 3 and 4 programme of study":
 *     word reading (prefixes, morphology, reading new words), comprehension
 *     (retrieve, infer feelings/predictions, main idea, word meaning in
 *     context, summarising), composition (paragraph/narrative order,
 *     narrative and non-narrative, joining clauses, describing settings,
 *     speech punctuation, proofreading), vocabulary grammar and punctuation
 *     (conjunctions, fronted adverbials, present perfect, pronouns,
 *     possessive apostrophes, standard English).
 *     https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study/
 *  2. DfE "English appendix 1: spelling" (DFE-00181-2013) — "Spelling – work
 *     for years 3 and 4" (prefixes dis/mis/in/il/im/ir/re/sub/inter/super/
 *     anti/auto; -ation, -ly, -ous; -tion/-sion/-ssion/-cian; ch, gue/que,
 *     sc, ei/eigh/ey, ou, y→i, consonant doubling; homophones and confusing
 *     words) plus the statutory "Word list – years 3 and 4"; see
 *     src/content/syllabus/y3/english.ts for the extracted lists.
 *  3. App mirrored scheme (the same families Year 1 and Year 2 use) with
 *     the Year-3 prefix: 3Rw word reading, 3Ri comprehension, 3Rv
 *     vocabulary, 3Ww composition, 3Wg grammar, 3Wp punctuation, 3Ws
 *     spelling, 3SLs spoken language — sequential numbers after each.
 *
 *  Lesson ids are prefixed `y3e` so they can never collide with the
 *  Year-3 maths `y3u*`, Year-1 `y1e*`/`y1u*` or Year-2 `u<N>l<M>` ids
 *  (progress maps are keyed by lesson id — PLAN 169d tests this). */
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

/* ===== UNIT 1 · Prefixes: dis-, mis-, in-/il-/im-/ir- (3Ws, 3Wg, 3Rw) == */
const u1Lessons: LessonDef[] = [
  makeLesson('y3e1l1', 'Not or Wrongly', ['3Ws.01'], 'sonic', 'Prefix power!', 'dis- and mis- flip a word. disagree is NOT agree.', ['dis- means not.', 'mis- means wrongly.', 'Find the root word.'], [Y3.gY3DisMis, Y3.gY3PrefixMatch], Y3.gY3DisMis),
  makeLesson('y3e1l2', 'What Does It Mean?', ['3Wg.01'], 'tails', 'Meaning hunt!', 'Every prefix carries its own meaning. Read it first.', ['re- means again or back.', 'in- means not.', 'Say the prefix out loud.'], [Y3.gY3PrefixMeaning, Y3.gY3DisMis], Y3.gY3PrefixMeaning),
  makeLesson('y3e1l3', 'in-, il-, im-, ir-', ['3Ws.02'], 'amy', 'Spelling switch!', 'in- changes shape before l, m and r.', ['before l: illegal.', 'before m: impossible.', 'before r: irregular.'], [Y3.gY3InPrefixSpell, Y3.gY3PrefixMeaning], Y3.gY3InPrefixSpell),
  makeLesson('y3e1l4', 'Prefix Match-Up', ['3Rw.01'], 'knuckles', 'Read with prefixes!', 'Spotting the prefix helps you read new words.', ['Find the root word.', 'Add the prefix.', 'Then read the whole word.'], [Y3.gY3PrefixMatch, Y3.gY3InPrefixSpell, Y3.gY3DisMis], Y3.gY3DisMis),
]
const u1Boss = makeLesson('y3e1boss', 'Prefix Boss', ['3Ws.01'], 'eggman', 'BOSS TIME!', 'Meanings, spellings and roots - beat the prefix boss!', ['Say what the prefix means.', 'Pick the spelling that fits.', 'Root + prefix = new word.'], [Y3.gY3DisMis, Y3.gY3PrefixMeaning, Y3.gY3InPrefixSpell, Y3.gY3PrefixMatch, Y3.gY3PrefixBuild], Y3.gY3PrefixMeaning)

/* ===== UNIT 2 · Prefixes: re-, sub-, inter-, super- (3Ws, 3Rw, 3Wg) ==== */
const u2Lessons: LessonDef[] = [
  makeLesson('y3e2l1', 're- and sub-', ['3Ws.03'], 'shadow', 'Again, or under!', 're- means again. sub- means under.', ['re- + turn = return.', 'sub + marine = submarine.', 'Read the two parts.'], [Y3.gY3ReSub, Y3.gY3PrefixBuild], Y3.gY3ReSub),
  makeLesson('y3e2l2', 'inter- and super-', ['3Rw.02'], 'sonic', 'Between and above!', 'inter- means between. super- means above.', ['inter + city = intercity.', 'super + market = supermarket.', 'Say it, then split it.'], [Y3.gY3InterSuper, Y3.gY3PrefixBuild], Y3.gY3PrefixBuild),
  makeLesson('y3e2l3', 'Meanings All Around', ['3Wg.02'], 'tails', 'Meaning master!', 'anti-, auto- and friends carry meanings too.', ['anti- means against.', 'auto- means self.', 'Match meaning to prefix.'], [Y3.gY3PrefixMeaning, Y3.gY3ReSub], Y3.gY3PrefixMeaning),
  makeLesson('y3e2l4', 'Build the Word', ['3Ws.04'], 'amy', 'Word building!', 'Squish a prefix and a root into one new word.', ['Read the two parts.', 'Join them together.', 'Check the spelling.'], [Y3.gY3PrefixBuild, Y3.gY3InterSuper, Y3.gY3ReSub], Y3.gY3PrefixBuild),
]
const u2Boss = makeLesson('y3e2boss', 'Building Prefix Boss', ['3Ws.03'], 'eggman', 'BOSS TIME!', 're, sub, inter, super - build your way to victory!', ['Name the meaning first.', 'Build the word in your head.', 'Spelling counts!'], [Y3.gY3ReSub, Y3.gY3InterSuper, Y3.gY3PrefixBuild, Y3.gY3PrefixMeaning, Y3.gY3PrefixMatch], Y3.gY3PrefixBuild)

/* ===== UNIT 3 · Suffixes: -ation, -ly, -ous (3Ws, 3Wg) ================= */
const u3Lessons: LessonDef[] = [
  makeLesson('y3e3l1', 'Verbs Become Nouns', ['3Ws.05'], 'knuckles', 'Noun switch!', 'Add -ation and a verb turns into a noun.', ['prepare becomes preparation.', 'invent becomes invention.', 'Say the new word aloud.'], [Y3.gY3Ation, Y3.gY3AtionMatch], Y3.gY3Ation),
  makeLesson('y3e3l2', 'Add -ly, Make an Adverb', ['3Wg.03'], 'shadow', 'How it happens!', 'An adverb tells you HOW. Many end in -ly.', ['sad becomes sadly.', 'happy becomes happily.', 'y changes to i sometimes.'], [Y3.gY3LyAdverb, Y3.gY3LyMatch], Y3.gY3LyAdverb),
  makeLesson('y3e3l3', 'Adjectives with -ous', ['3Ws.06'], 'sonic', 'Full of!', '-ous means full of. danger becomes dangerous.', ['poison becomes poisonous.', 'mind the spelling.', 'It is an adjective.'], [Y3.gY3OusAdj, Y3.gY3Ation], Y3.gY3OusAdj),
  makeLesson('y3e3l4', 'Suffix Mix-Up', ['3Ws.05'], 'tails', 'Mix it up!', 'Nouns, adverbs, adjectives - know which ending fits.', ['What job does the word do?', '-ation makes a noun.', '-ly makes an adverb.'], [Y3.gY3LyMatch, Y3.gY3OusAdj, Y3.gY3AtionMatch], Y3.gY3Ation),
]
const u3Boss = makeLesson('y3e3boss', 'Suffix Boss', ['3Ws.06'], 'eggman', 'BOSS TIME!', '-ation, -ly and -ous - the endings gauntlet!', ['Noun, adverb or adjective?', 'Check the y-to-i rule.', 'Double-check every spelling.'], [Y3.gY3Ation, Y3.gY3LyAdverb, Y3.gY3OusAdj, Y3.gY3AtionMatch, Y3.gY3LyMatch], Y3.gY3OusAdj)

/* ===== UNIT 4 · The -tion family (3Ws) ================================= */
const u4Lessons: LessonDef[] = [
  makeLesson('y3e4l1', 'The -tion Family', ['3Ws.07'], 'amy', 'Same sound!', 'tion, sion, ssion and cian all make shun.', ['Listen for the shun sound.', 'Watch the ending.', 'One ending fits each word.'], [Y3.gY3TIONChoice, Y3.gY3SIONWords], Y3.gY3TIONChoice),
  makeLesson('y3e4l2', 'Words Ending -sion', ['3Ws.08'], 'knuckles', 'sion time!', 'Some words take -sion, not -tion.', ['division, invasion, decision.', 'Say the word first.', 'Pick the ending.'], [Y3.gY3SIONWords, Y3.gY3CIAN], Y3.gY3SIONWords),
  makeLesson('y3e4l3', 'Jobs End in -cian', ['3Ws.09'], 'shadow', 'Job names!', 'Words for jobs ending in shun are spelt -cian.', ['musician, electrician.', 'It names a person.', 'cian, not sion.'], [Y3.gY3CIAN, Y3.gY3SureTure], Y3.gY3SureTure),
  makeLesson('y3e4l4', '-ture and -sure', ['3Ws.09'], 'sonic', 'Soft endings!', 'picture ends -ture. measure ends -sure.', ['Say the ch sound.', 'It can be -ture or -sure.', 'Spot the ending.'], [Y3.gY3SureTure, Y3.gY3CollectEnding], Y3.gY3SureTure),
]
const u4Boss = makeLesson('y3e4boss', 'Ending Boss', ['3Ws.07'], 'eggman', 'BOSS TIME!', 'tion, sion, ssion, cian, ture, sure - every ending!', ['Say the word.', 'Listen to the ending.', 'Tap the right tiles.'], [Y3.gY3TIONChoice, Y3.gY3SIONWords, Y3.gY3CIAN, Y3.gY3SureTure, Y3.gY3CollectEnding], Y3.gY3TIONChoice)

/* ===== UNIT 5 · Tricky spellings (3Ws, 3Rw) ============================ */
const u5Lessons: LessonDef[] = [
  makeLesson('y3e5l1', 'ch Says /k/ or /sh/', ['3Ws.10'], 'tails', 'Tricky ch!', 'ch can say ch, k or sh. Know your words.', ['chemist says k.', 'chef says sh.', 'Say it, then spell it.'], [Y3.gY3CHWord, Y3.gY3GueQue], Y3.gY3CHWord),
  makeLesson('y3e5l2', 'sc and ei Spellings', ['3Rw.03'], 'amy', 'Detective!', 'sc can say s. ei, eigh and ey spell ay.', ['science starts with sc.', 'vein has ei.', 'Read the word whole.'], [Y3.gY3SC, Y3.gY3EISpelling], Y3.gY3SC),
  makeLesson('y3e5l3', 'ou and y in the Middle', ['3Ws.11'], 'knuckles', 'Middle sounds!', 'ou says u in young. y says i in myth.', ['young, touch, double.', 'myth, gym, pyramid.', 'Not at the end here.'], [Y3.gY3OuY, Y3.gY3MythY], Y3.gY3OuY),
  makeLesson('y3e5l4', 'Double the Last Letter', ['3Ws.10'], 'shadow', 'Double trouble!', 'Short vowel? Double the last letter before -ing.', ['forget becomes forgetting.', 'begin becomes beginning.', 'Check every ending.'], [Y3.gY3DoubleCons, Y3.gY3CHWord, Y3.gY3EISpelling], Y3.gY3DoubleCons),
]
const u5Boss = makeLesson('y3e5boss', 'Spelling Detective Boss', ['3Ws.11'], 'eggman', 'BOSS TIME!', 'ch, gue, que, sc, ei, ou, y, doubles - full sweep!', ['Sound the word out.', 'Which rule applies?', 'Trust your memory.'], [Y3.gY3CHWord, Y3.gY3GueQue, Y3.gY3SC, Y3.gY3EISpelling, Y3.gY3DoubleCons], Y3.gY3DoubleCons)

/* ===== UNIT 6 · Word list: years 3 and 4 (3Ws, 3Rw, 3Rv) =============== */
const u6Lessons: LessonDef[] = [
  makeLesson('y3e6l1', 'Spell the List Word', ['3Ws.12'], 'sonic', 'List time!', 'These words are on the statutory list. Know them cold.', ['Say the word.', 'Tap the tiles in order.', 'Watch the tricky part.'], [Y3.gY3WLTiles, Y3.gY3WLAlphabet], Y3.gY3WLTiles),
  makeLesson('y3e6l2', 'Alphabet Order', ['3Ws.12'], 'tails', 'A to Z!', 'Spell it right, then sort it by first letters.', ['Compare the first letters.', 'Then the second.', 'Line them up.'], [Y3.gY3WLSpelling, Y3.gY3WLAlphabet], Y3.gY3WLSpelling),
  makeLesson('y3e6l3', 'What Does It Mean?', ['3Rv.01'], 'amy', 'Word meaning!', 'A word list is useless if you do not know the meaning.', ['Read the word.', 'Picture it.', 'Pick the meaning that fits.'], [Y3.gY3WLMeaning, Y3.gY3WLMatch], Y3.gY3WLMeaning),
  makeLesson('y3e6l4', 'Sort & Spell', ['3Rw.04'], 'knuckles', 'Read & sort!', 'Read the list words, sort them, spell them.', ['Read each word.', 'Sort by letters.', 'Then check the spelling.'], [Y3.gY3WLAlphabet, Y3.gY3WLTiles, Y3.gY3WLSpelling], Y3.gY3WLSpelling),
]
const u6Boss = makeLesson('y3e6boss', 'Word List Boss', ['3Ws.12'], 'eggman', 'BOSS TIME!', 'The whole years 3-4 list - spell, sort and define!', ['Say it before you spell it.', 'Letters in order.', 'Meaning first.'], [Y3.gY3WLTiles, Y3.gY3WLSpelling, Y3.gY3WLAlphabet, Y3.gY3WLMeaning, Y3.gY3WLMatch], Y3.gY3WLSpelling)

/* ===== UNIT 7 · Homophones & apostrophes (3Ws, 3Wg, 3Wp) =============== */
const u7Lessons: LessonDef[] = [
  makeLesson('y3e7l1', 'Which Word Fits?', ['3Ws.13'], 'shadow', 'Sound-alikes!', 'Homophones sound the same but mean different.', ['Say both words.', 'Which fits the sentence?', 'Read the whole sentence.'], [Y3.gY3Homophone, Y3.gY3HomophoneMatch], Y3.gY3Homophone),
  makeLesson('y3e7l2', 'Homophone Pairs', ['3Ws.13'], 'sonic', 'Pair up!', 'here/hear, meat/meet - pair them by meaning.', ['Cover one side.', 'Think of the meaning.', 'Match the pair.'], [Y3.gY3HomophoneMatch, Y3.gY3Homophone], Y3.gY3HomophoneMatch),
  makeLesson('y3e7l3', 'Whose Is It?', ['3Wg.04', '3Wp.02'], 'tails', 'Apostrophe job!', 'An apostrophe shows who owns something.', ['the girls coats = the coats of the girls.', "girls' takes the apostrophe after s.", 'One girl owns it: girl\'s.'], [Y3.gY3ApostropheChoice, Y3.gY3PluralPossess], Y3.gY3ApostropheChoice),
  makeLesson('y3e7l4', 'Plurals & Possessives', ['3Wg.04'], 'amy', 'One or many?', 'Plural means more than one. Possessive means whose.', ['boys = many boys.', "boys' = the boys' things.", 'Check the apostrophe spot.'], [Y3.gY3PluralPossess, Y3.gY3ApostropheChoice, Y3.gY3Homophone], Y3.gY3ApostropheChoice),
]
const u7Boss = makeLesson('y3e7boss', 'Homophone Boss', ['3Ws.13', '3Wg.04'], 'eggman', 'BOSS TIME!', 'Homophones, plurals and apostrophes - the lot!', ['Which word sounds right?', 'Does it mean right?', 'Apostrophe after s.'], [Y3.gY3Homophone, Y3.gY3HomophoneMatch, Y3.gY3ApostropheChoice, Y3.gY3PluralPossess, Y3.gY3PresentPerfect], Y3.gY3ApostropheChoice)

/* ===== UNIT 8 · Grammar: clauses & adverbials (3Wg) ==================== */
const u8Lessons: LessonDef[] = [
  makeLesson('y3e8l1', 'Joining Words', ['3Wg.05'], 'knuckles', 'Join it!', 'because, if, although, while - joiners of clauses.', ['Read both parts.', 'Which joiner fits?', 'Because gives a reason.'], [Y3.gY3Conjunction, Y3.gY3Fronted], Y3.gY3Conjunction),
  makeLesson('y3e8l2', 'Fronted Adverbials', ['3Wg.06'], 'shadow', 'Front it!', 'Start with when or where, then a comma.', ['After lunch, we played.', 'Front first, comma next.', 'Read it aloud.'], [Y3.gY3Fronted, Y3.gY3PresentPerfect], Y3.gY3Fronted),
  makeLesson('y3e8l3', 'Have and Has', ['3Wg.07'], 'sonic', 'Already done!', 'Present perfect: have/has + the third form.', ['I have eaten.', 'She has written.', 'Never have ate.'], [Y3.gY3PresentPerfect, Y3.gY3Pronoun], Y3.gY3PresentPerfect),
  makeLesson('y3e8l4', 'Replace with Pronouns', ['3Wg.08'], 'tails', 'Swap it!', 'he, she, it, they can replace a name.', ['Mia ran. She jumped.', 'Two names? Use they.', 'Do not repeat the name.'], [Y3.gY3Pronoun, Y3.gY3Conjunction, Y3.gY3Fronted], Y3.gY3Conjunction),
]
const u8Boss = makeLesson('y3e8boss', 'Grammar Boss', ['3Wg.05'], 'eggman', 'BOSS TIME!', 'Joiners, adverbials, perfect tenses, pronouns - go!', ['Read the whole sentence.', 'Which grammar rule?', 'Say it back in your head.'], [Y3.gY3Conjunction, Y3.gY3Fronted, Y3.gY3PresentPerfect, Y3.gY3Pronoun], Y3.gY3Fronted)

/* ===== UNIT 9 · Reading comprehension (3Ri) ============================= */
const u9Lessons: LessonDef[] = [
  makeLesson('y3e9l1', 'Find It in the Text', ['3Ri.01'], 'amy', 'Retrieve!', 'The answer is written in the card. Find it.', ['Read the card.', 'Scan for the sentence.', 'True or false?'], [Y3.gY3Retrieve, Y3.gY3InferFeelings], Y3.gY3Retrieve),
  makeLesson('y3e9l2', 'How Do They Feel?', ['3Ri.02'], 'knuckles', 'Feelings!', 'Good readers feel what the character feels.', ['Read what happened.', 'What would you feel?', 'Pick the feeling.'], [Y3.gY3InferFeelings, Y3.gY3PredictR], Y3.gY3InferFeelings),
  makeLesson('y3e9l3', 'Main Idea & Word Meaning', ['3Ri.03'], 'shadow', 'Big picture!', 'One idea holds the paragraph together. New words unlock it.', ['Skim the paragraph.', 'What is it mostly about?', 'Use the sentence around the word.'], [Y3.gY3MainIdea, Y3.gY3WordContext], Y3.gY3MainIdea),
  makeLesson('y3e9l4', 'Read Between the Lines', ['3Ri.04'], 'sonic', 'Predict!', 'Clues today tell what happens next.', ['What happened first?', 'What must come next?', 'Read the sentence out loud too.'], [Y3.gY3WordContext, Y3.gY3SpeakLine, Y3.gY3PredictR], Y3.gY3WordContext),
]
const u9Boss = makeLesson('y3e9boss', 'Reading Boss', ['3Ri.01'], 'eggman', 'BOSS TIME!', 'Retrieve, infer, predict, main idea - reading mastery!', ['Answers hide in the text.', 'Feelings show in clues.', 'Guess what comes next.'], [Y3.gY3Retrieve, Y3.gY3InferFeelings, Y3.gY3PredictR, Y3.gY3MainIdea, Y3.gY3SpeakLine], Y3.gY3Retrieve)

/* ===== UNIT 10 · Composition & performance (3Ww, 3Wp, 3SLs) ============ */
const u10Lessons: LessonDef[] = [
  makeLesson('y3e10l1', 'Order the Paragraph', ['3Ww.01'], 'tails', 'Paragraph plan!', 'Sentences have an order. First, then, finally.', ['Which sentence starts it?', 'What comes next?', 'Read the whole paragraph.'], [Y3.gY3ParaOrder, Y3.gY3NarrativeOrder], Y3.gY3ParaOrder),
  makeLesson('y3e10l2', 'Story Order', ['3Ww.02'], 'amy', 'Story chain!', 'Events link one after another.', ['Read every event.', 'What happened first?', 'Build the chain.'], [Y3.gY3NarrativeOrder, Y3.gY3SpeechMarks], Y3.gY3NarrativeOrder),
  makeLesson('y3e10l3', 'Speech Marks', ['3Ww.03', '3Wp.01'], 'knuckles', 'Talking time!', 'Speech marks wrap around the exact words.', ['Open and close the quote.', 'Comma inside, said outside.', 'Capitals too.'], [Y3.gY3SpeechMarks, Y3.gY3EditProof], Y3.gY3SpeechMarks),
  makeLesson('y3e10l4', 'Read It Out Loud', ['3SLs.01'], 'shadow', 'Perform!', 'Proofread first, then read with feeling.', ['Spot the wrong verb.', 'Fix it in your head.', 'Clap the rhythm as you read.'], [Y3.gY3EditProof, Y3.gY3PoemPerform, Y3.gY3ParaOrder], Y3.gY3EditProof),
]
const u10Boss = makeLesson('y3e10boss', 'Composition Boss', ['3Ww.04', '3SLs.01'], 'eggman', 'BOSS TIME!', 'Order, speech, proofreading, poetry - the finale!', ['Plan the order.', 'Wrap the speech.', 'Read it like you mean it.'], [Y3.gY3ParaOrder, Y3.gY3NarrativeOrder, Y3.gY3SpeechMarks, Y3.gY3EditProof, Y3.gY3PoemPerform], Y3.gY3SpeechMarks)

export const ENGLISH_Y3_UNITS: UnitDef[] = [
  { id: 'y3e1', order: 1, title: 'Prefixes: dis-, mis-, in-', subtitle: 'DfE Appendix 1 Y3/4 \u2014 dis/mis/in/il/im/ir \u2014 meaning & spelling', color: '#f97316', icon: '\u{1F524}', lessons: [...u1Lessons, u1Boss], bossLessonIds: [u1Boss.id] },
  { id: 'y3e2', order: 2, title: 'Prefixes: re-, sub-, inter-, super-', subtitle: 'DfE Appendix 1 Y3/4 \u2014 re/sub/inter/super/anti/auto \u2014 building words', color: '#1cb0f6', icon: '\u{1F9F1}', lessons: [...u2Lessons, u2Boss], bossLessonIds: [u2Boss.id] },
  { id: 'y3e3', order: 3, title: 'Suffixes: -ation, -ly, -ous', subtitle: 'DfE Appendix 1 Y3/4 \u2014 -ation nouns, -ly adverbs, -ous adjectives', color: '#a855f7', icon: '\u{1F4CE}', lessons: [...u3Lessons, u3Boss], bossLessonIds: [u3Boss.id] },
  { id: 'y3e4', order: 4, title: 'The -tion Family', subtitle: 'DfE Appendix 1 Y3/4 \u2014 -tion, -sion, -ssion, -cian, -ture, -sure', color: '#ec4899', icon: '\u{1F39B}', lessons: [...u4Lessons, u4Boss], bossLessonIds: [u4Boss.id] },
  { id: 'y3e5', order: 5, title: 'Tricky Spellings', subtitle: 'DfE Appendix 1 Y3/4 \u2014 ch, gue/que, sc, ei/ey, ou, y\u2192i, doubling', color: '#14b8a6', icon: '\u{1F50D}', lessons: [...u5Lessons, u5Boss], bossLessonIds: [u5Boss.id] },
  { id: 'y3e6', order: 6, title: 'Word List: Years 3 & 4', subtitle: 'DfE statutory word list \u2014 spell, sort & define', color: '#eab308', icon: '\u{1F4DA}', lessons: [...u6Lessons, u6Boss], bossLessonIds: [u6Boss.id] },
  { id: 'y3e7', order: 7, title: 'Homophones & Apostrophes', subtitle: 'DfE Y3 PoS spelling \u2014 homophones, plurals & possessive apostrophes', color: '#ef4444', icon: '\u{1F4AC}', lessons: [...u7Lessons, u7Boss], bossLessonIds: [u7Boss.id] },
  { id: 'y3e8', order: 8, title: 'Grammar: Clauses & Adverbials', subtitle: 'DfE Y3 PoS \u2014 conjunctions, fronted adverbials, present perfect, pronouns', color: '#6366f1', icon: '\u{1F4D0}', lessons: [...u8Lessons, u8Boss], bossLessonIds: [u8Boss.id] },
  { id: 'y3e9', order: 9, title: 'Reading Comprehension', subtitle: 'DfE Y3 PoS reading \u2014 retrieve, infer, predict, main idea, word meaning', color: '#22c55e', icon: '\u{1F4D6}', lessons: [...u9Lessons, u9Boss], bossLessonIds: [u9Boss.id] },
  { id: 'y3e10', order: 10, title: 'Composition & Performance', subtitle: 'DfE Y3 PoS \u2014 paragraph/narrative order, speech marks, proofreading, recital', color: '#f43f5e', icon: '\u{1F3A4}', lessons: [...u10Lessons, u10Boss], bossLessonIds: [u10Boss.id] },
]

export const ENGLISH_Y3_ALL_LESSONS: Record<string, { unit: UnitDef; lesson: LessonDef }> = {}
for (const u of ENGLISH_Y3_UNITS) for (const l of u.lessons) ENGLISH_Y3_ALL_LESSONS[l.id] = { unit: u, lesson: l }
