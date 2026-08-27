# Agent Spec: Building English Units (READ FULLY BEFORE CODING)

You are a content-engineer building Cambridge Year-2 English lessons for a
gamified kids' app (React + TS + vitest, Duolingo-style). You WRITE CODE.
Work dir: `C:\Users\momo\Documents\momomath-year2`

## Read these first, in order
1. `src/content/types.ts` — Question union (mcq / match / order / tap-count /
   letter-tiles / truefalse / speak), StoryPanel, WithAudio (`audioText?`),
   VisualSpec, LessonDef, UnitDef, MascotId.
2. `src/content/english/helpers.ts` — YOUR toolkit:
   - `mcqE(rand, prompt, answer, distractors[], extra?)` → shuffled 3-choice MCQ
   - `mcqFixed(prompt, choices[], answerIndex, extra?)`
   - `matchQ(rand, prompt, pairs[{left,right}], extra?)`
   - `orderQ(prompt, itemsInCorrectOrder[], extra?)`
   - `tilesQ(prompt, lowercaseWord, hint?)` → letter-tiles
   - `tfQ(prompt, statement, answerBool, extra?)`
   - `speakQ(prompt, targetText, {story?, hint?})`
   - `say(text)` → `{audioText}` spread into mcq/order/match extra
   - `story(title, sceneEmojis[], lines[])` → StoryPanel
   - `pickOthers(rand, pool, exclude, n)` → n distinct ≠ exclude
   - `makeLesson(id, title, objectiveCodes, mascotId, introTitle, introBody, gens[], challengeGen?)`
     — handles determinism; last question = challenge gen
   - `unitDef(id, order, title, subtitle, color, icon, lessons)`
   - `PICTURE_BANK` (word→emoji), `Q_PER_LESSON` (=10)
3. `tests/english/harness.ts` — checks your unit must pass.
4. `docs/english-roadmap.md` — your units' sections (format mix rationale).
5. Style reference: intro-card tone in `src/content/curriculum.ts`.

## Your exclusive files (touch NOTHING else)
- `src/content/english/eNN.ts` exporting `export const UNIT_ENN: UnitDef`
- `tests/english/eNN.test.ts` containing exactly:
  ```ts
  import { describeUnit } from './harness'
  import { UNIT_ENN } from '../../src/content/english/eNN'
  describeUnit(UNIT_ENN)
  ```

## Hard rules (violations fail integration)
1. **Determinism**: use ONLY the `rand` param inside generator functions.
   NEVER Math.random(), Date.now(), or module-level mutable state.
2. Each lesson: 2–4 distinct generator functions passed to makeLesson so
   questions vary; boss lesson mixes gens from across the unit.
3. Unit assembly: regular lessons then trailing boss with id `${unitId}boss`;
   wrap everything in `unitDef(...)`.
4. **Accuracy contract** (the most important rules):
   - Answers must be OBJECTIVELY correct by UK Year-2 conventions. UK spelling
     only (colour, favourite, mum).
   - Distractors plausible but DEFINITIVELY wrong; never duplicates of each
     other or the answer. Pass ≥5 distractor candidates when randomising so
     mcqE can pick 3 unique ones.
   - matchQ: 3–6 pairs, all left values unique, all right values unique.
   - orderQ: items distinct, correct order given, 2–6 items.
   - tilesQ: single lowercase words, 3–10 letters, no spaces/apostrophes/hyphens.
   - tfQ statements unambiguous for a 6-year-old.
   - speakQ lines ≤120 chars, natural kid sentences.
   - audioText = exactly what should be heard (single word or short sentence).
   - story panels: short title, emoji scene array, narration lines ≤90 chars;
     each generator returns its OWN self-contained mini-story (2–4 lines) +
     question about THAT passage — no cross-question state.
5. Vocabulary/grammar strictly Cambridge Stage 2 (UK Year 2). Short prompts —
   they render huge on screen.
6. Mascots: cream, amy, tails, sonic, knuckles, blaze for lessons; eggman ONLY
   for bosses.
7. Intro cards: fun imperative title + ONE sentence explaining the skill,
   e.g. 'Magic e!' / 'The sneaky e at the end makes the vowel say its name!'.
8. Picture-pick MCQs: visual `{ type: 'emoji-group', emojis: [PICTURE_BANK.x] }`.
9. tap-count reuse for word hunts: cells are WORD strings; correctness is exact
   string equality with targetEmoji, so choose cells where only exact matches
   of the target word count.

## Verify before finishing
```
npx vitest run tests/english/eNN.test.ts
```
must pass. Do NOT run `npx tsc -b` (other agents' files may be mid-write);
vitest transform catches syntax errors. Type carefully against helpers.ts.

## Return in your final message
- lessons built per unit (ids + titles)
- generator function names
- confirmation your test file passes

---

# ASSIGNMENTS (per agent)

Each agent owns ONE numbered assignment below. Files per unit `eNN`:
`src/content/english/eNN.ts` (export `UNIT_ENN`) + `tests/english/eNN.test.ts`
(exact template above). Lesson ids `eNNl1..`, boss `eNNboss`.

## A1 · e01 Sound Detectives
unitDef('e1', 1, 'Sound Detectives', 'Cambridge 2Rw.01/.05 - alternative sounds & decoding', '#58cc02', '🔍')
- e1l1 'Same Letters, Different Sound' [2Rw.01] tails - gHearTheWord: mcq + say() audioText minimal pairs (how/low, hot/cold, read/live, wind/wind); prompt 'Tap the word you hear'. gTrickyGraphemeMatch: matchQ word->PICTURE_BANK emoji.
- e1l2 'Long or Short Vowel Team?' [2Rw.01,2Ww.01] cream - gPickVowelTeamWord picture-pick mcq (day/rain/made/great families). gRhymeOrNot tfQ ('cat / hat' true, 'blue / cake' false).
- e1l3 'Alien Word Decoder' [2Rw.05] shadow - gRealOrAlien mcq 'Which one is a REAL word?' exactly one real word among nonsense. gAlienHear mcq+say() heard nonsense word among similar spellings.
- e1l4 'Sound Collector' [2Rw.05] knuckles - gCollectTheSound tap-count WORD cells exact-match target (target 'rain': rain,tail,pain,sun,dog,boat); vary phonemes (/ai/,/ee/,/oa/,/sh/,/igh/ spelled i-e etc). gOddSoundOut mcq.
- e1l5 'Blend Bandit' [2Rw.05] sonic - gDecodeSentence orderQ decodable sentence; gFinishTheWord cloze mcq chips.
- e1boss 'Phonics Boss' eggman mix.

## A2 · e02 Magic e & Syllable Squad
unitDef('e2', 2, 'Magic e & Syllable Squad', 'Cambridge 2Rw.02/.06 - split digraphs & syllables', '#1cb0f6', '🪄')
- e2l1 'Magic e Turns Up the Volume' [2Rw.02] cream - gMagicETiles tilesQ ('cap becomes ___' target cape; hop/hope kit/kite plan/plane tap/tape tub/tube man/mane rid/ride win/wine); gMagicEPicture picture-pick mcq (kite,cake,bone,rose,nine,five).
- e2l2 'Syllable Claps' [2Rw.06] knuckles - gHowManyClaps mcq 'How many claps in rabbit?' choices 1/2/3; gSyllableMatch matchQ word <-> syllable split ('rab·bit').
- e2l3 'Compound Word Factory' [2Rw.06] amy - gCompoundMatch matchQ halves (sun+flower, rain+bow, star+fish, foot+ball, tree+house, cup+cake, snow+man, tooth+brush, book+shop, lunch+box); gCompoundPicture picture-pick mcq (snowman, starfish, football, rainbow, treehouse).
- e2l4 'Chunk It & Read' [2Rw.06,2Ww.08] tails - gSyllableSentence orderQ short sentence using multisyllabic words; gChunkCloze mcq cloze with syllable hints.
- e2boss 'Magic e Boss' eggman mix.

## B1 · e03 Prefix & Suffix Lab
unitDef('e3', 3, 'Prefix & Suffix Lab', 'Cambridge 2Rw.03/2Ww.06/2Wg.07/2Wg.10 - affixes', '#ce82ff', '🧪')
- e3l1 'un- Undo Machine' [2Rw.03,2Ww.06] amy - gUnMatch matchQ happy<->unhappy kind (happy/sad? use pairs like lock-unlock, do-undo, tie-untie, zip-unzip, pack-unpack, kind-unkind, safe-unsafe); gUnMeaning mcq 'What does unlock mean?'.
- e3l2 'dis- & re- Removers' [2Rw.03] blaze - gDisReTiles tilesQ target words disagree,replay,disobey,redo,dislike,retell(6 letters ok); gDisReFill mcqFill gap with prefix choice.
- e3l3 '-er / -est Showdown' [2Wg.10,2Ww.06] knuckles - gComparativePick mcq picture-pick tallest/shortest/bigger/smallest/faster/slower; gErEstOrder orderQ small,bigger,biggest style chains (3 items).
- e3l4 '-ful -ly -y Word Glue' [2Ww.06] tails - gSuffixTiles tilesQ (helpful, slowly, sunny, playful, quickly, rainy, careful, funny); gSuffixMeaning mcq 'Handful means...'.
- e3l5 'Verb Endings -s -ed -ing' [2Wg.07,2Ww.05] shadow - gTensePairMatch matchQ today-form<->yesterday-form (walk/walked, jump/jumped, play/played, help/helped, look/looked, want/wanted); gEndingFill mcq cloze 'Yesterday I ___ to school.' (walked).
- e3boss 'Affix Boss' eggman mix.

## B2 · e04 Spelling Stars
unitDef('e4', 4, 'Spelling Stars', 'Cambridge 2Ww - patterns, plurals, homophones, exception words', '#ff9600', '🌟')
- e4l1 'Rhyme Families' [2Ww.03] amy - gRhymeMatch matchQ rhymes (whale/snail, cake/lake, night/light, play/day, boat/goat, moon/spoon); gRhymeFamilyTiles tilesQ spell word completing rhyme set given prompt hint.
- e4l2 'Irregular Plural Zoo' [2Ww.04] knuckles - gPluralPicture picture-pick mcq visual emoji-group two mice -> answer mice (mouse/mice, foot/feet, tooth/teeth, sheep/sheep, fish/fish, man/men, child/children); gPluralFix mcq 'One child, two ___'.
- e4l3 'Homophone Twins I' [2Ww.07] shadow - gHomophoneFill mcq cloze sentence choosing tail/tale blew/blue see/sea be/bee flour/flower; gHomophoneHear mcq + say() which spelling did you hear in the sentence.
- e4l4 'Homophone Twins II' [2Ww.07] blaze - same formats new pairs stare/stair here/hear hair/hare bare/bear pair/pear wear/where; add gWhichSpelling orderQ? keep two gens.
- e4l5 'Exception Word Bootcamp' [2Ww.09] cream - gExceptionSprint tilesQ common exception words (said, says, were, one, two, who, was, they, there, people, friend, school, because, again); gExceptionFill mcq cloze missing exception word.
- e4boss 'Spelling Boss' eggman mix incl one dictation-style order with audioText sentence.

## C1 · e05 Word Explorer
unitDef('e5', 5, 'Word Explorer', 'Cambridge 2Rv/2Wv - vocabulary, alphabet order, adjectives', '#00cd9c', '🧭')
- e5l1 'New Word Detective' [2Rv.01] tails - gMeaningFromContext mcq: 2-sentence mini context in prompt, choose meaning of bolded-by-quotes word (age-appropriate words: giant, peckish, fetch, mended, cross(as angry), delighted).
- e5l2 'Alphabet Train' [2Rv.03] amy - gAlphaOrder orderQ arrange 3-4 words A-Z by first letter; gGlossaryFind mcq 'Which word comes first in the dictionary?'.
- e5l3 'Amazing Adjectives' [2Rv.04,2Wv.02] cream - gAdjectivePick picture-pick mcq best describing word for emoji scene; gAdjectiveMatch matchQ adjective<->opposite (big/small, hot/cold, happy/sad, fast/slow, tall/short, loud/quiet).
- e5l4 'Sparkle Openers' [2Rv.05,2Wv.03] blaze - gTimeOpenerFill mcq cloze '___ the doorbell rang.' (Suddenly, First, Later, Next); gOpenerOrder orderQ sequence opener-led sentences into story order.
- e5l5 'My Word Hoard' [2Rv.02,2Wv.04,.05] sonic - gInterestingWord mcq pick the most interesting/strongest verb or adjective for the blank; gHoardBuilder orderQ build sparkle sentence from tiles incl 1 distractor? NOTE order has no distractors - instead use mcqE 'Which sentence is the most exciting?'.
- e5boss 'Vocabulary Boss' eggman mix.

## C2 · e06 Sentence Mechanics
unitDef('e6', 6, 'Sentence Mechanics', 'Cambridge 2Wg.01-.04 / 2Rg - punctuation & sentence types', '#0ea5e9', '✏️')
- e6l1 'Capitals & Full Stops' [2Wg.01] knuckles - gFixTheSentence mcq 'Choose the correct sentence.' options differ by capital/full stop only; gSpotTheError tfQ statement shows sentence, true/false is it punctuated correctly? Keep statements unambiguous.
- e6l2 'Asking or Telling?' [2Wg.04,2Rg.02] tails - gQuestionOrStatement mcq classify sentence (choices 'a question','a statement'); gEndMarkFill mcq choose ? or . ; gHearTheQuestion mcq+say() hear rising intonation sentence -> is it a question?
- e6l3 'Command Time!' [2Wg.04,2Rg.04] amy - gCommandSort matchQ sentence<->type (command/statement/question) 4-5 pairs; gBossyVerb mcq pick the bossy verb that starts an instruction.
- e6l4 'Comma Trains' [2Wg.02] blaze - gCommaList mcq choose correctly punctuated list sentence; gListOrder orderQ arrange list items then note final item order (items are plain items).
- e6l5 'Speech Marks Spotting' [2Wg.03,2Rg.01] shadow - gSpeechMarks mcq choose correctly written dialogue line; gNewSpeakerLine mcq 'Where does the new speaker go?' concept via correct example choice.
- e6boss 'Mechanics Boss' eggman mix.

## D1 · e07 Naming & Describing Words
unitDef('e7', 7, 'Naming & Describing Words', 'Cambridge 2Rg.05/.06 / 2Wg.08-.10 - nouns, pronouns, quantifiers', '#fb7185', '🏷️')
- e7l1 'Noun Hunt' [2Rg.05] cream - gNounPicture picture-pick person/place/thing classification via emoji; gNounOrNot mcq 'Which word is a noun?'.
- e7l2 'Grow a Noun Phrase' [2Rg.05,2Wv.02] tails - gPhraseBuild orderQ arrange adjective+noun expansions ('the fluffy cat' -> the/fluffy/cat); gBestAdjective mcq choose adjective that fits the noun scene.
- e7l3 'Quantifier Pick' [2Wg.08] amy - gQuantifierFill mcq cloze some/most/all with clear-count contexts described in prompt; gQuantifierTrue tfQ 'All means every single one.' true/false checks.
- e7l4 'Pronoun Swap' [2Rg.06,2Wg.09] blaze - gPronounMatch matchQ noun<->pronoun (Mum->she, Dad->he, the dog->it, Anna and I->we, the children->they); gPronounFill mcq cloze pronoun agreeing.
- e7l5 'Bigger, Biggest!' [2Wg.10] knuckles - gComparePicture picture-pick comparative/superlative by scene; gErEstTiles tilesQ bigger,tallest,smallest,faster,longer.
- e7boss 'Grammar Boss' eggman mix.

## D2 · e08 Verb Time Machine
unitDef('e8', 8, 'Verb Time Machine', 'Cambridge 2Wg.07 - past & present verb forms', '#a78bfa', '⏳')
- e8l1 'Past or Present?' [2Wg.07] shadow - gTenseSortMatch matchQ yesterday-word<->today-word pairs (played/play, jumps/jump? keep direction consistent left past right present); gTimeWordFill mcq cloze 'Yesterday she ___ in the garden.' (played).
- e8l2 'Adding -ing' [2Wg.07] tails - gIngTiles tilesQ (playing, jumping, reading, singing, walking, helping); gIngFill mcq cloze 'I am ___ a book.' (reading).
- e8l3 'Tense Trainer Mix' [2Wg.07] amy - gMixedTense mcq choose correct form for time phrase; gTenseHear mcq+say() hear sentence pick written form.
- e8boss 'Tense Boss' eggman mix.

## E1 · e09 Super Sentences
unitDef('e9', 9, 'Super Sentences', 'Cambridge 2Wg.05/.06 / 2Wv.03 - conjunctions & multi-clause sentences', '#f59e0b', '🌉')
- e9l1 'And, But, Or Joiners' [2Wg.05] sonic - gJoinerFill mcq cloze choose and/but/or by meaning contrast; gJoinMatch matchQ two-short-sentences <-> joined version (left 'It was cold.' right 'It was cold but sunny.')? uniqueness ok.
- e9l2 'Because, If, When Bridges' [2Wg.06,2Rg.03] tails - gBecauseFill mcq cloze because/if/when; gBridgeBuild orderQ arrange two-clause sentence.
- e9l3 'Two Ideas, One Sentence' [2Wg.05,.06] amy - gJoinedPick mcq 'Which joins these best?' ; gClauseOrder orderQ clauses into sensible sentence.
- e9l4 'Sentence Opener Showcase' [2Wv.03] cream - gOpenerVariety mcq 'Which opener fits?' (One morning, Suddenly, After that, At last); gStoryFlow orderQ opener-led events order.
- e9boss 'Sentence Boss' eggman mix.

## E2 · e13 Author Studio
unitDef('e13', 13, 'Author Studio', 'Cambridge 2Ws/2Wc/2Wp - planning, structure, checking', '#f97316', '✍️')
- e13l1 'Plan My Story' [2Wc.02] amy - gPlanOrder orderQ plan cards (pick setting, characters, problem, ending) arrange planning steps; gSettingPick picture-pick story setting.
- e13l2 'Beginning, Middle, End' [2Ws.01] tails - gBMEOrder orderQ three story parts; gBMEFill mcq which part is this event from.
- e13l3 'Describe This!' [2Wc.03,2Wv.02] cream - gDescribeBuild orderQ descriptive sentence arrangement; gDescribePick mcq best describing sentence for scene.
- e13l4 'Report Builder' [2Ws.02,.03, 2Wc.04,.05] knuckles - gFactGroup mcq which fact belongs under subheading; gReportOrder orderQ report sections (title, intro fact, detail, ending).
- e13l5 'Check It!' [2Wp.05,.06] shadow - gErrorHunt mcq find correctly checked version; gProofreadHear speakQ read your sentence aloud to check it makes sense (targetText = simple sentence).
- e13boss 'Author Boss' eggman guided mix (plan->build->check gens).

## F1 · e10 Story Quests  (STORY UNIT - special rules)
unitDef('e10', 10, 'Story Quests', 'Cambridge 2Ri fiction comprehension - stories', '#6366f1', '🏰')
EVERY generator returns questions carrying a self-contained story panel:
story('The Kite Day',[🪁,👦],['Ben ran up the hill.','Up went the kite!']) style - title, 2-4 emoji scene, 2-4 short lines, then question about THAT passage. Vary plots: pets, parks, birthdays, lost toys, grandparents, weather, school trips. UK names (Ben, Mia, Sam, Alfie, Poppy, Zoe).
- e10l1 'Story or Fact?' [2Ri.01] cream - tfQ 'Is this a story?' with fiction vs non-fiction panels; plus matchQ sorting genres.
- e10l2 'Who & Where?' [2Ri.08] amy - panel + mcq 'Who is the main character?' / 'Where are they?'.
- e10l3 'Retell the Tale' [2Ri.07,2Rs.01] tails - panel 3 lines + orderQ arrange events (paraphrased, NOT verbatim lines).
- e10l4 'Guess the Ending' [2Ri.11] blaze - panel ending-gap + mcq 'What happens next?' one sensible continuation among wrong-but-related.
- e10l5 'Between the Lines' [2Ri.10,2Ri.12] shadow - panel showing feelings via actions + inference mcq 'How does Mia feel? How do you know?' simplified choices.
- e10l6 'Pattern Detective' [2Ri.16,2Ri.02] sonic - panels with repeated phrase/rhyme; mcq 'Which words repeat?' or spot-the-rhyme.
- e10boss 'Big Story Boss' eggman - longer panels (4-5 lines) mixing all question styles.

## G1 · e11 Fact Finder
unitDef('e11', 11, 'Fact Finder', 'Cambridge 2Ri/2Rs non-fiction - features & retrieval', '#14b8a6', '🔎')
Non-fiction panels: story('All About Bees',[🐝,🌻],['Bees live in a hive.','They make honey.']).
- e11l1 'Feature Finder' [2Rs.02,.03] tails - mcq identify feature (subheading/contents page/glossary/label) from described page; matchQ feature<->job.
- e11l2 'Diagram Detective' [2Ri.09] knuckles - panel + mcq about labelled-diagram facts described in lines; tfQ check-a-fact.
- e11l3 'Find the Fact' [2Ri.14] amy - panel + retrieval mcq 'What do bees make?'; second gen locate-word style mcq.
- e11l4 "What's It For?" [2Ri.05] blaze - matchQ text type<->purpose (story->to entertain, recipe->to instruct, report->to inform); mcq purpose picks.
- e11l5 'Explain It Back' [2SLs.01,2Ri.15] sonic - panel + orderQ main points; speakQ retell one fact aloud (targetText short fact).
- e11boss 'Fact Boss' eggman mix.

## G2 · e12 Poetry Corner
unitDef('e12', 12, 'Poetry Corner', 'Cambridge 2Ri.16/2Ra/2SLp - rhyme, rhythm, performance', '#ec4899', '🎵')
- e12l1 'Rhyme Time Match' [2Ri.16] cream - gRhymePairs matchQ rhyming ends (cat/hat, bee/tree, star/car, cake/snake, moon/spoon, light/kite); gOddRhymeOut mcq which word does not rhyme.
- e12l2 'Beat & Repeat' [2Ri.16] amy - gRepeatLines orderQ verse lines with repeating frame; gFindRepeat mcq which phrase repeats.
- e12l3 'Sound Poems' [2Rv.04] tails - gOnomatopoeiaHear mcq+say() sound word heard (buzz, splash, pop, crash, moo, hiss); gAlliterationPick mcq pick the alliterative phrase.
- e12l4 'Perform It!' [2SLp.01,2SLp.02] blaze - speakQ perform a couplet line (with speech-marks awareness prompt variant); gExpressionPick mcq 'How should you read this line?' excited/quiet/slow choices tied to text.
- e12boss 'Poetry Boss' eggman mix.
