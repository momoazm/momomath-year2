# MomoLearn Year 2 · English Roadmap (Cambridge Primary English 0058, Stage 2)

Extends **MomoMath Year 2** with a second subject. One app, one path screen — a
**Math ⇄ English switch button** swaps the curriculum under the same Duolingo-style
loop: intro card → 10 exercises → chest → XP/league/gems.

Research basis:
- Cambridge Primary English **0058** curriculum framework (2020), Stage 2 objectives (`2Rx` codes) — verified against the official framework + Stage 2 Scheme of Work (9 units / 150 h).
- Duolingo exercise catalogue + pedagogy (~10 exercises per ≈5-min lesson, new words introduced with audio+image before practice, format variety within a lesson, spiral review every 3rd–4th lesson, unit boss/checkpoint).
- **No official Cambridge Progression Tests exist for Stage 2** (they start at Stage 3), so our "Term Challenge" bosses mirror the simplified formats of the Stage 3 sample papers (tick-box MCQ, order-the-events, match-the-heading, find-and-copy).

---

## 1. Subject switch design (integration with current code)

| Concern | Plan |
|---|---|
| Switch UI | Pill toggle in `TopBar`: 🧮 Math \| 📚 English. Persisted via `?subject=english` deep link + zustand persist. |
| Store | `store.ts` gains `subject: 'math' \| 'english'`. Progress keyed `${subject}:${lessonId}` so both subjects keep independent streaks of lesson completion; gems/XP/league are **shared** (one economy, simpler + motivating). |
| Curriculum | New `src/content/english/` sibling of math files; registry `getCurriculum(subject): UnitDef[]`. `LessonDef.generate(n, seed)` contract stays identical. |
| Leaderboard | Blob payload gains additive optional field `subjects: { math?: number; english?: number }` — v1 readers unaffected. |
| Quests | Daily quests span subjects ("Earn 40 XP", "Finish 2 English lessons") to pull kids across the toggle. |
| Mascots | Same Sonic cast; English units lean on Cream/Amy/Tails as "reading crew". |

### New question kinds needed (`types.ts` union additions)

Existing kinds already cover a lot — reuse first:

| Existing kind | Becomes |
|---|---|
| `mcq` | Picture Pick, Fill-the-Gap, True/False story card |
| `match` | Match Pairs (word↔emoji-picture, word↔meaning, rhyme pairs) |
| `order` | Word-Bank sentence builder, retell/sequence-events |
| `tap-count` | Sound Collector ("tap every word with /ai/"), sight-word hunt |

New for English:

| New kind | Mechanic | Needs |
|---|---|---|
| `audio-mcq` | Tap What You Hear: TTS plays word/sentence, 3–4 text options (minimal pairs) | Web Speech API `speechSynthesis`, en-GB, rate ~0.85 + turtle replay button |
| `letter-tiles` | Spell It: shuffled letter tiles build a word (drag/tap-in-order) | none |
| `story` | Story Time node: illustrated passage (emoji scenes) with interleaved questions (true/false, predict-next, point-to-phrase, match finale) | new LessonScreen mode |
| `dictation` | Turtle dictation: audio sentence + word-bank support (no free typing in v1) | TTS |
| `speak` | Read-aloud with forgiving ASR scoring (skip allowed) | Phase D, `webkitSpeechRecognition` |
| VisualSpec `{type:'scene'; emojis:string[]}` | emoji scene illustration for stories/prompts | none |

Deterministic generator pattern (`makeLesson`, `mulberry32(hashString(id) ^ seed)`) is kept unchanged.

---

## 2. Duolingo-format catalogue used below

Kid-friendly name → mechanic → what it trains:

1. **Picture Pick** — word/audio shown, tap matching image card (vocab)
2. **Match Pairs** — grid of cards, pair word↔picture / word↔sound / rhyme pairs (recognition)
3. **Tap What You Hear** — auto audio, choose correct transcription among minimal pairs (`pin`/`pen`) (phonemic discrimination)
4. **Sound Collector** — tap all items containing target sound (initial-sound isolation, ABC-style)
5. **Letter Tiles** — build/spell a word from shuffled letters (encoding)
6. **Fill the Gap** — cloze sentence, 3 word chips (grammar/vocab in context)
7. **Word Bank Builder** — rebuild a sentence from tiles + 1–2 distractors (syntax)
8. **Line Up** — order sentences/events (comprehension structure)
9. **Flashcard Sprint** — rapid sight-word recognition round (fluency)
10. **Story Time** — illustrated story with mid-story questions (comprehension)
11. **Predict Next** — continuation choice at a story gap (inference/prediction)
12. **Point to the Phrase** — tap the word/line that answers (retrieval/highlight-the-answer)
13. **Turtle Dictation** — slow-replay audio + build the sentence (listening→writing)
14. **Read Aloud** — speak the line, forgiving ASR (fluency) *(Phase D)*
15. **Boss Checkpoint** — mixed formats, exam-flavoured items, no hints

Per-lesson mix follows Duolingo's rule: never repeat one format twice in a row;
new material introduced on an intro card with audio+picture before first practice.

---

## 3. The roadmap — 13 units, 61 lessons + 13 bosses = 74 nodes

Parity with math's 69-node path. Objective codes = official 0058 Stage 2.

### Unit E1 · Sound Detectives — phonics: alternative pronunciations (2Rw.01, 2Rw.05)

| # | Lesson | Objectives | Format mix (why) |
|---|---|---|---|
| 1 | Same Letters, Different Sound | 2Rw.01 | **Tap What You Hear** (how/low, hot/cold minimal pairs) + **Match Pairs** word↔picture — sound-first because this topic *is* sound discrimination |
| 2 | Long or Short Vowel Team? | 2Rw.01, 2Ww.01 | **Tap What You Hear** (day/rain/made/great) + **Fill the Gap** chip choice |
| 3 | Alien Word Decoder | 2Rw.05 | **MCQ**: which real word is the alien word? (nonsense-word decoding is fun + pure phonic knowledge) |
| 4 | Sound Collector | 2Rw.05 | **tap-count reuse**: tap every word-card containing /ai/ — reuses existing engine, zero new code |
| 5 | Blend Bandit | 2Rw.05 | **Fill the Gap** in decodable sentences — decoding in context |
| B | Phonics Boss | 2Rw.01/.05 | Mixed checkpoint |

### Unit E2 · Magic e & Syllable Squad (2Rw.02, 2Rw.06)

| # | Lesson | Objectives | Format mix |
|---|---|---|---|
| 1 | Magic e Turns Up the Volume | 2Rw.02 | **Letter Tiles** (cap→cape) + **Picture Pick** — building beats choosing for split digraphs |
| 2 | Syllable Claps | 2Rw.06 | **tap-count reuse**: clap/beat buttons segmented per syllable of multi-syllabic words |
| 3 | Compound Word Factory | 2Rw.06 | **Match Pairs** sun+flower→sunflower — compounds are literally pairs |
| 4 | Chunk It & Read | 2Rw.06, 2Ww.08 | **Fill the Gap** with syllable-scaffolded choices |
| B | Magic e Boss | mixed | mixed |

### Unit E3 · Prefix & Suffix Lab (2Rw.03, 2Ww.06, 2Wg.07)

| # | Lesson | Objectives | Format mix |
|---|---|---|---|
| 1 | un- Undo Machine | 2Rw.03, 2Ww.06 | **Match Pairs** happy↔unhappy + **Picture Pick** — meaning flip is visual |
| 2 | dis- & re- Removers | 2Rw.03 | **Fill the Gap** prefix chips |
| 3 | -er / -est Comparisons | 2Wg.10, 2Ww.06 | **Word Bank Builder** short sentences (big/bigger/biggest) — syntax practice |
| 4 | -ful, -ly, -y Word Glue | 2Ww.06 | **Letter Tiles** suffix swap |
| 5 | Verb Endings -s / -ed / -ing | 2Wg.07, 2Ww.05 | **Match Pairs** today↔yesterday forms; **Fill the Gap** tense chips — ending choice changes meaning, so contrast pairs |
| B | Affix Boss | mixed | mixed |

### Unit E4 · Spelling Stars (2Ww.02–.04, .07–.09)

| # | Lesson | Objectives | Format mix |
|---|---|---|---|
| 1 | Rhyme Families | 2Ww.03 | **Match Pairs** rhymes (whale/snail) + **Letter Tiles** — rhyme predicts spelling pattern |
| 2 | Irregular Plural Zoo | 2Ww.04 | **Picture Pick** mice/sheep/feet — pictures carry irregular meanings |
| 3 | Homophone Twins I | 2Ww.07 | **Fill the Gap** (tail/tale, blew/blue) — context is the only disambiguator, so cloze is the right tool |
| 4 | Homophone Twins II | 2Ww.07 | **Fill the Gap** (stare/stair) + **audio-mcq** hear-the-difference |
| 5 | Exception Word Bootcamp | 2Ww.09 | **Flashcard Sprint** + **Letter Tiles** — rapid-fire common exception words |
| B | Spelling Boss | mixed | mixed incl. one turtle dictation item |

### Unit E5 · Word Explorer (2Rv.01–.05, 2Wv.01–.04)

| # | Lesson | Objectives | Format mix |
|---|---|---|---|
| 1 | New Word Detective | 2Rv.01 | **MCQ** meaning-from-context in a mini paragraph |
| 2 | Alphabet Train | 2Rv.03 | **order reuse**: arrange words A→Z; find-in-glossary MCQ |
| 3 | Amazing Adjectives | 2Rv.04, 2Wv.02 | **Picture Pick** best describing word |
| 4 | Sparkle Openers | 2Rv.05, 2Wv.03 | **Fill the Gap** time openers (Suddenly…, That morning…) |
| 5 | My Word Hoard | 2Rv.02, 2Wv.04/.05 | **Word Bank Builder** using collected interesting words |
| B | Vocabulary Boss | mixed | mixed |

### Unit E6 · Sentence Mechanics (2Wg.01–.04, 2Rg.01/.02/.04)

| # | Lesson | Objectives | Format mix |
|---|---|---|---|
| 1 | Capitals & Full Stops | 2Wg.01 | **MCQ** pick-the-fixed-sentence — error analysis fits MCQ better than typing |
| 2 | Asking or Telling? | 2Wg.04, 2Rg.02 | **Tap What You Hear** ? vs . intonation + **Fill the Gap** end mark |
| 3 | Command Time! | 2Wg.04, 2Rg.04 | **Match Pairs** sentence-type sorting; **Word Bank Builder** instruction lines |
| 4 | Comma Trains | 2Wg.02 | **order reuse** list items + comma placement MCQ |
| 5 | Speech Marks Spotting | 2Wg.03, 2Rg.01 | **Fill the Gap** marks + new-line-per-speaker ordering |
| B | Mechanics Boss | mixed | mixed |

### Unit E7 · Naming & Describing Words (2Rg.05/.06, 2Wg.08–.10)

| # | Lesson | Objectives | Format mix |
|---|---|---|---|
| 1 | Noun Hunt | 2Rg.05 | **Picture Pick** person/place/thing |
| 2 | Grow a Noun Phrase | 2Rg.05, 2Wv.02 | **Word Bank Builder** adjective+noun expansions |
| 3 | Quantifier Pick | 2Wg.08 | **Fill the Gap** some/most/all with picture support |
| 4 | Pronoun Swap | 2Rg.06, 2Wg.09 | **Match Pairs** noun↔pronoun; agreement Fill-the-Gap |
| 5 | Bigger, Biggest! | 2Wg.10 | **Picture Pick** comparative images + Letter-Tiles -er/-est |
| B | Grammar Boss | mixed | mixed |

### Unit E8 · Verb Time Machine (2Wg.07)

| # | Lesson | Objectives | Format mix |
|---|---|---|---|
| 1 | Past or Present? | 2Wg.07 | **Match Pairs** sort -ed forms by time-word cue (yesterday/today) |
| 2 | Adding -ing | 2Wg.07 | **Letter Tiles** root+ending where no change needed |
| 3 | Tense Trainer Mix | 2Wg.07 | **Fill the Gap** mixed tense chips |
| B | Tense Boss | 2Wg.07 | mixed |

### Unit E9 · Super Sentences (2Wg.05/.06, 2Wv.03, 2Rs.01)

| # | Lesson | Objectives | Format mix |
|---|---|---|---|
| 1 | And, But, Or Joiners | 2Wg.05 | **Fill the Gap** conjunction chips — meaning of each joiner differs, cloze shows it |
| 2 | Because, If, When Bridges | 2Wg.06 | **Word Bank Builder** multi-clause sentences (2Rg.03 spotting in texts) |
| 3 | Two Ideas, One Sentence | 2Wg.05/.06 | **Match Pairs** two short sentences ↔ joined version |
| 4 | Sentence Opener Showcase | 2Wv.03 | **order reuse** varied openings; rewrite-choice MCQ |
| B | Sentence Boss | mixed | mixed |

### Unit E10 · Story Quests — fiction comprehension (2Ri.01–.03, .06–.08, .10–.16, 2Ra.*) — **Story Time format unit**

| # | Lesson | Objectives | Format mix |
|---|---|---|---|
| 1 | Story or Fact? | 2Ri.01 | **Match Pairs** text-type sorting |
| 2 | Who & Where? | 2Ri.08 | **Story Time** + character/setting questions (Point to the Phrase) |
| 3 | Retell the Tale | 2Ri.07, 2Rs.01 | **Line Up** events after read-along narration |
| 4 | Guess the Ending | 2Ri.11 | **Predict Next** continuation gaps — the signature prediction exercise |
| 5 | Between the Lines | 2Ri.10, 2Ri.12 | **Story Time** inference MCQs (feelings from actions) |
| 6 | Pattern Detective | 2Ri.16, 2Ri.02 | **Story Time** repetition/rhyme spotting + visual-element questions |
| B | Big Story Boss | 2Ri.13/.15 | full story + mixed question set |

### Unit E11 · Fact Finder — non-fiction (2Ri.04/.05/.09/.14, 2Rs.02/.03)

| # | Lesson | Objectives | Format mix |
|---|---|---|---|
| 1 | Feature Finder | 2Rs.03, 2Rs.02 | **Point to the Phrase** on a rendered info page (subheading, contents, glossary) |
| 2 | Diagram Detective | 2Ri.09 | **MCQ** from labelled diagram/table visuals |
| 3 | Find the Fact | 2Ri.14 | **Story Time (non-fiction)** + retrieval MCQ |
| 4 | What's It For? | 2Ri.05 | **Match Pairs** text type ↔ purpose |
| 5 | Explain It Back | 2SLs.01, 2Ri.15 | **Read Aloud** summary line (Phase D; interim: order main points) |
| B | Fact Boss | mixed | mixed |

### Unit E12 · Poetry Corner (2Ri.02/.16, 2Ra.01, 2Rv.04, 2SLp.01)

| # | Lesson | Objectives | Format mix |
|---|---|---|---|
| 1 | Rhyme Time Match | 2Ri.16 | **Match Pairs** rhyming ends |
| 2 | Beat & Repeat | 2Ri.16 | **Line Up** repeated verse frames |
| 3 | Sound Poems | 2Rv.04 | **Tap What You Hear** sound words + alliteration picks |
| 4 | Perform It! | 2SLp.01 | **Read Aloud** with expression (Phase D; interim: pick-the-expressive-reading audio MCQ) |
| B | Poetry Boss | mixed | mixed |

### Unit E13 · Author Studio — composition (2Ws.01–.03, 2Wc.01–.05, 2Wp.03–.06)

| # | Lesson | Objectives | Format mix |
|---|---|---|---|
| 1 | Plan My Story | 2Wc.02 | **Pick & Order** setting/character cards into a storyboard |
| 2 | Beginning, Middle, End | 2Ws.01 | **Line Up** story skeleton + gap-fill plan |
| 3 | Describe This! | 2Wc.03, 2Wv.02 | **Word Bank Builder** description sentences |
| 4 | Report Builder | 2Ws.02/.03, 2Wc.04/.05 | **Group & Order** facts under subheadings |
| 5 | Check It! | 2Wp.05/.06 | **Error Hunt** tap-the-mistake proofreading + read-aloud finish |
| B | Author Boss | 2Wc.01 | guided mini-composition: plan → build → check |

### Term Challenges (checkpoint nodes, not new units)

After E4/E5 (≈ term 1), E9/E10 (term 2), E13 (end of year): 30-item cumulative
challenge, no hints, exam-flavoured items only (tick-box MCQ, number the events,
match heading, find-and-copy word) — mirrors Stage 3 progression-paper formats,
Gold/Silver/Bronze result like Cambridge reporting.

---

## 4. Official Scheme-of-Work alignment (for school pacing)

Cambridge SoW Stage 2 = 9 units / 150 h. Our units cover every objective at least
once and can be played in-school alongside:

| Cambridge SoW unit | Our parallel units |
|---|---|
| 2.1 Information texts: personal information | E11 + E6 |
| 2.2 Traditional tales from different cultures | E10 + E1–E4 skill track |
| 2.3 Poems with patterns in sounds | E12 + E1 |
| 2.4 Stories with familiar themes | E10 + E7/E8 |
| 2.5 Poems with patterns in structure | E12 + E9 |
| 2.6 Explanations | E11 + E13.4 |
| 2.7 Poems to perform | E12.4 + E8 |
| 2.8 Stories by well-known writers | E10 + E5 |
| 2.9 Information texts: reports | E11 + E13 |

## 5. Build phases

| Phase | Scope | New engine bits |
|---|---|---|
| **A · Switch (wk 1–2)** | subject toggle + curriculum registry; ship E6, E7, E9, E5 (no-audio units) using existing 5 kinds | store.subject, getCurriculum, TopBar toggle |
| **B · Audio (wk 3–5)** | TTS engine; ship E1, E2, E3, E4, E8 | `audio-mcq`, `letter-tiles`, `dictation`, speechSynthesis util w/ turtle mode |
| **C · Stories (wk 6–8)** | ship E10, E11, E12 | `story` kind, scene VisualSpec, Predict-Next/Point-to-Phrase components |
| **D · Speak & polish (wk 9+)** | ship E13 bosses, Term Challenges, Read Aloud ASR, Flashcard Sprint, adaptive tail (last 1–2 exercises swap harder on high accuracy), legendary review nodes | `speak`, MediaRecorder/ASR, Birdbrain-lite difficulty knob |

## 6. Pedagogy rules locked in (from research)

- ≤ 5 min lessons, ~10 exercises, no format twice consecutively.
- New word/grammar → intro card with picture + audio **before** first exercise.
- Spiral: every 3rd–4th lesson revisits prior unit items inside new formats.
- Kid failure model: partial-heart cost, keep-going-until-pass (ABC style), heart refill each lesson.
- Rewards ride existing loop: XP, gems, chest loot, leagues, rival bots — shared across subjects.
