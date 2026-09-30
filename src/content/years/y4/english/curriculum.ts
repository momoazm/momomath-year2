/** PLAN 169g — Year-4 english curriculum (the DfE shared "years 3 and 4"
 *  English statute, seen from its Year-4 side). Mirrors the Y1/Y3 english
 *  structure: units, intro cards, teach lines, generated activity queues and
 *  a boss at the end of every unit.
 *
 *  PROVENANCE:
 *  1. DfE national curriculum in England: English programmes of study,
 *     key stages 1 and 2 (2014) — "Years 3 and 4 programme of study" — the
 *     statements the Year-3 rollout (PLAN 169d) did NOT drill: dictionary
 *     use (first two/three letters, checking meaning), non-fiction
 *     retrieval (contents pages, indexes, headings/sub-headings, text
 *     types), summarising main ideas drawn from more than one paragraph,
 *     asking questions to improve understanding, themes and conventions in
 *     fairy stories/myths/legends, forms of poetry (free verse, narrative
 *     poetry) + performance with intonation/tone/volume, adverbs and
 *     prepositions of time and cause, commas after fronted adverbials,
 *     standard vs non-standard English, planning/evaluating/editing,
 *     settings-characters-plot narratives, dictated sentences from memory.
 *     https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study/national-curriculum-in-england-english-programmes-of-study
 *  2. DfE "English appendix 1: spelling" — the shared statutory "Word list:
 *     years 3 and 4" and "Spelling – work for years 3 and 4" (revisited in
 *     units 1 and 10: dictionary checking, dictated spelling, confusing
 *     pairs); see src/content/syllabus/y4/english.ts for the extraction.
 *  3. App mirrored scheme (the same families Year 1–3 use) with the
 *     Year-4 prefix: 4Rw word reading, 4Ri comprehension, 4Rv vocabulary,
 *     4Ww composition, 4Wg grammar, 4Wp punctuation, 4Ws spelling, 4SLs
 *     spoken language — sequential numbers after each.
 *
 *  Lesson ids are prefixed `y4e` so they can never collide with the
 *  Year-4 maths `y4u*`, Year-3 `y3e*`, Year-1 `y1e*` or Year-2 `u<N>l<M>`
 *  ids (progress maps are keyed by lesson id — PLAN 169g tests this). */
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

/* ===== UNIT 1 · Dictionary Detectives (4Rv, 4Rw, 4Ws) ================= */
const u1Lessons: LessonDef[] = [
  makeLesson('y4e1l1', 'First in the Dictionary', ['4Rv.01'], 'sonic', 'A to Z!', 'Every word has its own place. Find it first.', ['Line up the first letters.', 'Then check the second.', 'The earliest letter wins.'], [Y4.gY4DictFirst, Y4.gY4DictOrder], Y4.gY4DictFirst),
  makeLesson('y4e1l2', 'What Does It Mean?', ['4Rv.01'], 'tails', 'Meaning hunt!', 'A dictionary tells you what a word really means.', ['Read the definition.', 'Picture the word.', 'Pick the match.'], [Y4.gY4DictMeaning, Y4.gY4DictOrder], Y4.gY4DictMeaning),
  makeLesson('y4e1l3', 'Check the Spelling', ['4Ws.14'], 'amy', 'Spelling check!', 'Stuck? Look up the first three letters.', ['Say the word.', 'Check the first letters.', 'Pick the real spelling.'], [Y4.gY4DictSpell, Y4.gY4DictMeaning], Y4.gY4DictSpell),
  makeLesson('y4e1l4', 'Sort It Out', ['4Rw.05'], 'knuckles', 'Sort time!', 'Read the words, sort them, then define them.', ['Sort by first letters.', 'Then by the next letter.', 'Check the meaning too.'], [Y4.gY4DictOrder, Y4.gY4DictSpell, Y4.gY4DictFirst], Y4.gY4DictOrder),
]
const u1Boss = makeLesson('y4e1boss', 'Dictionary Boss', ['4Rv.01'], 'eggman', 'BOSS TIME!', 'Order, spell and define - beat the dictionary boss!', ['Find the first letters.', 'Trust the definition.', 'Check every spelling.'], [Y4.gY4DictFirst, Y4.gY4DictOrder, Y4.gY4DictMeaning, Y4.gY4DictSpell], Y4.gY4DictSpell)

/* ===== UNIT 2 · Non-fiction Explorers (4Ri, 4Rv) ====================== */
const u2Lessons: LessonDef[] = [
  makeLesson('y4e2l1', 'Read the Card', ['4Ri.05'], 'shadow', 'Retrieve!', 'Non-fiction cards hide the facts. Find them.', ['Read the card.', 'Scan for the sentence.', 'True or false?'], [Y4.gY4NFCard, Y4.gY4WhereFind], Y4.gY4NFCard),
  makeLesson('y4e2l2', 'Contents or Index?', ['4Ri.05'], 'sonic', 'Navigate!', 'Contents at the front. Index at the back.', ['What are you looking for?', 'Contents shows chapters.', 'Index shows topics.'], [Y4.gY4WhereFind, Y4.gY4NFHeading], Y4.gY4WhereFind),
  makeLesson('y4e2l3', 'What Type of Text?', ['4Rv.02'], 'tails', 'Text types!', 'Letters, diaries, instructions - each has a job.', ['Read the opening.', 'Notice the shape.', 'Name the text type.'], [Y4.gY4TextType, Y4.gY4NFHeading], Y4.gY4TextType),
  makeLesson('y4e2l4', 'Pick a Heading', ['4Ri.05'], 'amy', 'Heading hunt!', 'A good heading tells the whole topic.', ['Read the text.', 'Find the topic words.', 'Match the heading.'], [Y4.gY4NFHeading, Y4.gY4TextType, Y4.gY4WhereFind], Y4.gY4NFHeading),
]
const u2Boss = makeLesson('y4e2boss', 'Non-fiction Boss', ['4Ri.05'], 'eggman', 'BOSS TIME!', 'Cards, contents, index, headings - the non-fiction gauntlet!', ['Find the fact first.', 'Use the right part of the book.', 'Name every text type.'], [Y4.gY4NFCard, Y4.gY4WhereFind, Y4.gY4TextType, Y4.gY4NFHeading], Y4.gY4WhereFind)

/* ===== UNIT 3 · Main Ideas & Summaries (4Ri) ========================== */
const u3Lessons: LessonDef[] = [
  makeLesson('y4e3l1', 'Find the Summary', ['4Ri.06'], 'knuckles', 'Big picture!', 'A summary carries the main idea in a few words.', ['Read every sentence.', 'Keep what matters.', 'Drop the small details.'], [Y4.gY4Summary, Y4.gY4AskQuestion], Y4.gY4Summary),
  makeLesson('y4e3l2', 'Ask a Good Question', ['4Ri.07'], 'shadow', 'Curious!', 'Good readers ask questions to understand more.', ['What do I want to know?', 'Does the text answer it?', 'Pick the useful question.'], [Y4.gY4AskQuestion, Y4.gY4Summary], Y4.gY4AskQuestion),
  makeLesson('y4e3l3', 'How Writers Help', ['4Ri.06'], 'sonic', 'Writer tricks!', 'Headings, captions and lists help you read.', ['Look at the page shape.', 'What is that feature called?', 'How does it help?'], [Y4.gY4WriterTrick, Y4.gY4Summary], Y4.gY4WriterTrick),
  makeLesson('y4e3l4', 'Summarise It', ['4Ri.06'], 'tails', 'Two into one!', 'Two paragraphs, one main idea.', ['Skim both paragraphs.', 'Find the shared idea.', 'Say it in one line.'], [Y4.gY4Summary, Y4.gY4WriterTrick, Y4.gY4AskQuestion], Y4.gY4Summary),
]
const u3Boss = makeLesson('y4e3boss', 'Summary Boss', ['4Ri.06'], 'eggman', 'BOSS TIME!', 'Summaries, questions and writer features - go!', ['Main idea first.', 'Ask what is missing.', 'Spot the feature.'], [Y4.gY4Summary, Y4.gY4AskQuestion, Y4.gY4WriterTrick], Y4.gY4Summary)

/* ===== UNIT 4 · Themes, Myths & Legends (4Ri, 4Rv) ==================== */
const u4Lessons: LessonDef[] = [
  makeLesson('y4e4l1', 'Spot the Theme', ['4Ri.03'], 'amy', 'Big message!', 'Every tale carries a message about life.', ['Read what characters do.', 'What lesson is shown?', 'Name the theme.'], [Y4.gY4Theme, Y4.gY4ThemeMatch], Y4.gY4Theme),
  makeLesson('y4e4l2', 'Theme Match-Up', ['4Ri.03'], 'knuckles', 'Pair up!', 'Match each tale to the feeling it teaches.', ['Read the tale.', 'Think of the lesson.', 'Match the theme.'], [Y4.gY4ThemeMatch, Y4.gY4Theme], Y4.gY4ThemeMatch),
  makeLesson('y4e4l3', 'Myth, Legend or Fable?', ['4Ri.03'], 'shadow', 'Name that tale!', 'Gods make myths. Heroes make legends. Animals teach fables.', ['Who is in the tale?', 'What does it teach?', 'Pick the tale type.'], [Y4.gY4StoryType, Y4.gY4LegendOrder], Y4.gY4StoryType),
  makeLesson('y4e4l4', 'Tell the Legend', ['4Rv.04'], 'sonic', 'Story chain!', 'Legends follow a chain of events.', ['Read every event.', 'What happened first?', 'Build the chain.'], [Y4.gY4LegendOrder, Y4.gY4StoryType, Y4.gY4Theme], Y4.gY4LegendOrder),
]
const u4Boss = makeLesson('y4e4boss', 'Legend Boss', ['4Ri.03'], 'eggman', 'BOSS TIME!', 'Themes, tale types and legend chains - the lot!', ['Find the message.', 'Name the tale type.', 'Order the events.'], [Y4.gY4Theme, Y4.gY4ThemeMatch, Y4.gY4StoryType, Y4.gY4LegendOrder], Y4.gY4StoryType)

/* ===== UNIT 5 · Poetry & Performance (4Ri, 4SLs, 4Rv) ================= */
const u5Lessons: LessonDef[] = [
  makeLesson('y4e5l1', 'Which Poem Is It?', ['4Ri.08'], 'tails', 'Poem forms!', 'Free verse, rhyming poems, narrative poems.', ['Listen for rhyme.', 'Does it tell a story?', 'Name the form.'], [Y4.gY4PoemForm, Y4.gY4Rhyme], Y4.gY4PoemForm),
  makeLesson('y4e5l2', 'Rhyme Time', ['4Ri.08'], 'amy', 'Sounds alike!', 'Rhyming words share the ending sound.', ['Say both words.', 'Listen to the ending.', 'Pick the match.'], [Y4.gY4Rhyme, Y4.gY4PoemOrder], Y4.gY4Rhyme),
  makeLesson('y4e5l3', 'Similes & Lines', ['4Rv.05'], 'knuckles', 'Like or as!', 'A simile compares using like or as.', ['Find like or as.', 'What is compared?', 'Spot the simile.'], [Y4.gY4Simile, Y4.gY4PoemForm], Y4.gY4Simile),
  makeLesson('y4e5l4', 'Perform It', ['4SLs.02'], 'shadow', 'On stage!', 'Read poems aloud with tone, volume and action.', ['Practise the line.', 'Change your voice.', 'Perform it to the end.'], [Y4.gY4Perform, Y4.gY4PoemOrder, Y4.gY4Simile], Y4.gY4Perform),
]
const u5Boss = makeLesson('y4e5boss', 'Poetry Boss', ['4Ri.08'], 'eggman', 'BOSS TIME!', 'Forms, rhyme, similes and performance - perform to win!', ['Name the form.', 'Hear the rhyme.', 'Find like or as.'], [Y4.gY4PoemForm, Y4.gY4Rhyme, Y4.gY4Simile, Y4.gY4PoemOrder], Y4.gY4Simile)

/* ===== UNIT 6 · Time & Cause (4Wg, 4Wp) =============================== */
const u6Lessons: LessonDef[] = [
  makeLesson('y4e6l1', 'When Did It Happen?', ['4Wg.09'], 'sonic', 'Time words!', 'during, before, after - words that tell WHEN.', ['Read the sentence.', 'Ask when it happens.', 'Pick the time word.'], [Y4.gY4WhenPrep, Y4.gY4AdverbSort], Y4.gY4WhenPrep),
  makeLesson('y4e6l2', 'Why Did It Happen?', ['4Wg.10'], 'tails', 'Reasons!', 'because and since give a REASON.', ['Read both parts.', 'Which part explains why?', 'Pick the reason word.'], [Y4.gY4WhyCause, Y4.gY4WhenPrep], Y4.gY4WhyCause),
  makeLesson('y4e6l3', 'Adverbs of Time', ['4Wg.09'], 'amy', 'When and how!', 'soon tells when. slowly tells how.', ['What job does the word do?', 'When or how?', 'Sort the adverb.'], [Y4.gY4AdverbSort, Y4.gY4WhyCause], Y4.gY4AdverbSort),
  makeLesson('y4e6l4', 'Comma After the Front', ['4Wp.04'], 'knuckles', 'Comma spot!', 'Start with a fronted adverbial, then a comma.', ['Read the start.', 'Comma comes next.', 'Then the rest.'], [Y4.gY4CommaRight, Y4.gY4WhenPrep, Y4.gY4AdverbSort], Y4.gY4CommaRight),
]
const u6Boss = makeLesson('y4e6boss', 'Time & Cause Boss', ['4Wg.10'], 'eggman', 'BOSS TIME!', 'Time words, reason words, adverbs and commas - go!', ['When does it happen?', 'Why does it happen?', 'Comma after the front.'], [Y4.gY4WhenPrep, Y4.gY4WhyCause, Y4.gY4AdverbSort, Y4.gY4CommaRight], Y4.gY4CommaRight)

/* ===== UNIT 7 · Standard English (4Wg) ================================ */
const u7Lessons: LessonDef[] = [
  makeLesson('y4e7l1', 'Which Is Standard?', ['4Wg.11'], 'shadow', 'Proper English!', 'Standard English is the same spoken and written.', ['Read both sentences.', 'Which sounds correct in writing?', 'Pick the standard one.'], [Y4.gY4Standard, Y4.gY4TenseKeep], Y4.gY4Standard),
  makeLesson('y4e7l2', 'Keep the Tense', ['4Wg.12'], 'sonic', 'Same time!', 'A paragraph stays in one tense.', ['Read all the verbs.', 'Past or present?', 'Keep them the same.'], [Y4.gY4TenseKeep, Y4.gY4Standard], Y4.gY4TenseKeep),
  makeLesson('y4e7l3', 'Link with Pronouns', ['4Wg.12'], 'tails', 'Swap the name!', 'he, she, it, they link sentences without repeating names.', ['Read both sentences.', 'Who is it about?', 'Swap in the pronoun.'], [Y4.gY4LinkPronoun, Y4.gY4Standard], Y4.gY4LinkPronoun),
  makeLesson('y4e7l4', 'Say It Properly', ['4Wg.11'], 'amy', 'Say it right!', 'Say it the standard way, then write it that way.', ['Say the sentence.', 'Does it sound standard?', 'Write it the same way.'], [Y4.gY4Standard, Y4.gY4LinkPronoun, Y4.gY4TenseKeep], Y4.gY4Standard),
]
const u7Boss = makeLesson('y4e7boss', 'Standard Boss', ['4Wg.11'], 'eggman', 'BOSS TIME!', 'Standard forms, tense and pronouns - full check!', ['Which form is standard?', 'Keep the tense.', 'Link with pronouns.'], [Y4.gY4Standard, Y4.gY4TenseKeep, Y4.gY4LinkPronoun], Y4.gY4Standard)

/* ===== UNIT 8 · Plan, Draft & Improve (4Ww, 4Ws) ====================== */
const u8Lessons: LessonDef[] = [
  makeLesson('y4e8l1', 'Plan It First', ['4Ww.05'], 'knuckles', 'Plan mode!', 'Writers plan before they draft.', ['Look at similar writing.', 'List your ideas.', 'Choose the best one.'], [Y4.gY4PlanOrder, Y4.gY4Improve], Y4.gY4PlanOrder),
  makeLesson('y4e8l2', 'Choose the Best', ['4Ww.06'], 'shadow', 'Best version!', 'Good writers pick the clearest sentence.', ['Read every option.', 'Which order makes sense?', 'Pick the best.'], [Y4.gY4Improve, Y4.gY4EditTf], Y4.gY4Improve),
  makeLesson('y4e8l3', 'Edit & Check', ['4Ww.06'], 'sonic', 'Edit time!', 'Read it back and fix what sounds wrong.', ['Read slowly.', 'Check each verb.', 'Tick or fix it.'], [Y4.gY4EditTf, Y4.gY4ProofPick], Y4.gY4EditTf),
  makeLesson('y4e8l4', 'Proofread the Page', ['4Ws.15'], 'tails', 'Eagle eye!', 'Hunt spelling mistakes before anyone else sees them.', ['Read each sentence.', 'Check every word.', 'Find the wrong spelling.'], [Y4.gY4ProofPick, Y4.gY4EditTf, Y4.gY4PlanOrder], Y4.gY4ProofPick),
]
const u8Boss = makeLesson('y4e8boss', 'Editing Boss', ['4Ww.06'], 'eggman', 'BOSS TIME!', 'Plan, improve, edit, proofread - the writing circuit!', ['Plan first.', 'Pick the clearest sentence.', 'Check every spelling.'], [Y4.gY4PlanOrder, Y4.gY4Improve, Y4.gY4EditTf, Y4.gY4ProofPick], Y4.gY4Improve)

/* ===== UNIT 9 · Settings, Characters & Plot (4Ww) ===================== */
const u9Lessons: LessonDef[] = [
  makeLesson('y4e9l1', 'Describe the Setting', ['4Ww.07'], 'amy', 'Where is it?', 'Settings carry a mood. Words paint it.', ['Picture the place.', 'How does it feel?', 'Match the word.'], [Y4.gY4SettingMatch, Y4.gY4Trait], Y4.gY4SettingMatch),
  makeLesson('y4e9l2', 'Who Are They?', ['4Ww.07'], 'knuckles', 'Character!', 'What a character does shows who they are.', ['Read the action.', 'What trait shows?', 'Name the character trait.'], [Y4.gY4Trait, Y4.gY4SettingMatch], Y4.gY4Trait),
  makeLesson('y4e9l3', 'Order the Plot', ['4Ww.08'], 'shadow', 'Plot chain!', 'Stories follow a beginning, middle and end.', ['Read every event.', 'What comes first?', 'Build the plot.'], [Y4.gY4PlotOrder, Y4.gY4Dialogue], Y4.gY4PlotOrder),
  makeLesson('y4e9l4', 'Dialogue on the Page', ['4Ww.08'], 'sonic', 'Talking time!', 'Speech marks show who is talking.', ['Look for speech marks.', 'Who is speaking?', 'Spot the line.'], [Y4.gY4Dialogue, Y4.gY4PlotOrder, Y4.gY4Trait], Y4.gY4Dialogue),
]
const u9Boss = makeLesson('y4e9boss', 'Story Boss', ['4Ww.07'], 'eggman', 'BOSS TIME!', 'Settings, traits, plot and dialogue - the story master!', ['Set the scene.', 'Show the character.', 'Order the plot.'], [Y4.gY4SettingMatch, Y4.gY4Trait, Y4.gY4PlotOrder, Y4.gY4Dialogue], Y4.gY4PlotOrder)

/* ===== UNIT 10 · Dictation & Confusing Words (4Ws, 4Wp) =============== */
const u10Lessons: LessonDef[] = [
  makeLesson('y4e10l1', 'Write What You Hear', ['4Ws.16'], 'tails', 'Dictation!', 'Hear it, hold it in your head, write it down.', ['Say it in your head.', 'Tap the tiles in order.', 'Check the middle letters.'], [Y4.gY4DictTiles, Y4.gY4DictSentence], Y4.gY4DictTiles),
  makeLesson('y4e10l2', 'Which Sentence Matches?', ['4Ws.16'], 'amy', 'Listen close!', 'One letter changes everything.', ['Picture what you heard.', 'Read every option.', 'Pick the exact match.'], [Y4.gY4DictSentence, Y4.gY4Confusing], Y4.gY4DictSentence),
  makeLesson('y4e10l3', 'Confusing Pairs', ['4Ws.17'], 'knuckles', 'Tricky pairs!', 'borrow/lend, accept/except - know which fits.', ['Read the sentence.', 'What does it mean?', 'Pick the right word.'], [Y4.gY4Confusing, Y4.gY4DictTiles], Y4.gY4Confusing),
  makeLesson('y4e10l4', 'Whose Is It?', ['4Wp.05'], 'shadow', 'Apostrophe job!', "children's, men's - irregular plurals keep 's.", ['Find the owner.', 'Is it one or many?', 'Place the apostrophe.'], [Y4.gY4Possess, Y4.gY4Confusing], Y4.gY4Possess),
]
const u10Boss = makeLesson('y4e10boss', 'Dictation Boss', ['4Ws.16'], 'eggman', 'BOSS TIME!', 'Dictation, confusing words and possessives - the finale!', ['Hear it, write it.', 'Choose the word that fits.', 'Apostrophe after the owner.'], [Y4.gY4DictTiles, Y4.gY4DictSentence, Y4.gY4Confusing, Y4.gY4Possess], Y4.gY4Confusing)

export const ENGLISH_Y4_UNITS: UnitDef[] = [
  { id: 'y4e1', order: 1, title: 'Dictionary Detectives', subtitle: 'DfE Y4 PoS \u2014 dictionary skills, alphabetical order, checking spelling & meaning', color: '#f97316', icon: '\u{1F50D}', lessons: [...u1Lessons, u1Boss], bossLessonIds: [u1Boss.id] },
  { id: 'y4e2', order: 2, title: 'Non-fiction Explorers', subtitle: 'DfE Y4 PoS \u2014 contents, index, headings and retrieval from non-fiction', color: '#1cb0f6', icon: '\u{1F4F0}', lessons: [...u2Lessons, u2Boss], bossLessonIds: [u2Boss.id] },
  { id: 'y4e3', order: 3, title: 'Main Ideas & Summaries', subtitle: 'DfE Y4 PoS \u2014 summarise across paragraphs, ask questions, writer effects', color: '#a855f7', icon: '\u{1F9FE}', lessons: [...u3Lessons, u3Boss], bossLessonIds: [u3Boss.id] },
  { id: 'y4e4', order: 4, title: 'Themes, Myths & Legends', subtitle: 'DfE Y4 PoS \u2014 themes and conventions, myths, legends, retelling', color: '#ec4899', icon: '\u{1F409}', lessons: [...u4Lessons, u4Boss], bossLessonIds: [u4Boss.id] },
  { id: 'y4e5', order: 5, title: 'Poetry & Performance', subtitle: 'DfE Y4 PoS \u2014 free verse, narrative poetry, rhyme, similes, reading aloud', color: '#14b8a6', icon: '\u{1F3AD}', lessons: [...u5Lessons, u5Boss], bossLessonIds: [u5Boss.id] },
  { id: 'y4e6', order: 6, title: 'Time & Cause', subtitle: 'DfE Y4 PoS \u2014 adverbs and prepositions of time and cause, comma after fronted adverbial', color: '#eab308', icon: '\u{23F0}', lessons: [...u6Lessons, u6Boss], bossLessonIds: [u6Boss.id] },
  { id: 'y4e7', order: 7, title: 'Standard English', subtitle: 'DfE Y4 PoS \u2014 standard vs non-standard, consistent verbs and pronouns', color: '#6366f1', icon: '\u{1F5E3}\uFE0F', lessons: [...u7Lessons, u7Boss], bossLessonIds: [u7Boss.id] },
  { id: 'y4e8', order: 8, title: 'Plan, Draft & Improve', subtitle: 'DfE Y4 PoS \u2014 plan, evaluate, edit and proofread for spelling', color: '#22c55e', icon: '\u{1F4DD}', lessons: [...u8Lessons, u8Boss], bossLessonIds: [u8Boss.id] },
  { id: 'y4e9', order: 9, title: 'Settings, Characters & Plot', subtitle: 'DfE Y4 PoS \u2014 settings, characters, plot, dialogue, paragraphs around a theme', color: '#f43f5e', icon: '\u{1F3AC}', lessons: [...u9Lessons, u9Boss], bossLessonIds: [u9Boss.id] },
  { id: 'y4e10', order: 10, title: 'Dictation & Confusing Words', subtitle: 'DfE Y4 PoS \u2014 dictated sentences, often-misspelt words, confusing pairs', color: '#8b5cf6', icon: '\u{270D}\uFE0F', lessons: [...u10Lessons, u10Boss], bossLessonIds: [u10Boss.id] },
]

export const ENGLISH_Y4_ALL_LESSONS: Record<string, { unit: UnitDef; lesson: LessonDef }> = {}
for (const u of ENGLISH_Y4_UNITS) for (const l of u.lessons) ENGLISH_Y4_ALL_LESSONS[l.id] = { unit: u, lesson: l }
