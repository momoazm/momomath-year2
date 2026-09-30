/** Year-4 SYLLABUS — English spelling/vocabulary, EXTRACTED FROM REAL
 *  OFFICIAL SOURCES (PLAN 169g).
 *
 *  PROVENANCE — why this file unions the Year-3 extraction instead of
 *  repeating it: DfE publishes NO separate Year-4 English programme of
 *  study. Key stage 2 English is one combined "Years 3 and 4 programme of
 *  study" (NC paragraph heading), and DfE "English appendix 1: spelling"
 *  likewise prints ONE "Spelling – work for years 3 and 4" section and ONE
 *  "Word list – years 3 and 4". Year 4 is the SECOND year of that two-year
 *  statutory block, so its lessons are examined against the exact lists the
 *  Year-3 rollout (PLAN 169d) extracted from those sources — every
 *  Year-4 lesson revisits the shared statute from new angles (dictionary
 *  skills, non-fiction retrieval, summarising, themes and legends, poetry
 *  forms, time/cause adverbs, standard English, planning and editing,
 *  narrative craft, dictation), plus the vocabulary those drills name.
 *
 *  Sources (extracted by research agents, 2026-09-29):
 *  1. DfE "English appendix 1: spelling" (DFE-00181-2013) — the statutory
 *     "Word list: years 3 and 4" and every example word under "Spelling –
 *     work for years 3 and 4". Full extraction + URLs live in
 *     src/content/syllabus/y3/english.ts (the shared statute).
 *     https://assets.publishing.service.gov.uk/media/5a7ccc06ed915d63cc65ce61/English_Appendix_1_-_Spelling.pdf
 *  2. DfE national curriculum in England: English programmes of study
 *     (2014), "Years 3 and 4 programme of study" — the statements the
 *     Year-3 rollout did NOT turn into lessons and that drive this file's
 *     extras: comprehension (check spelling with the first two or three
 *     letters in a dictionary; contents pages and indexes; retrieve and
 *     record from non-fiction; identify themes and conventions in fairy
 *     stories, myths and legends; recognise forms of poetry — free verse,
 *     narrative poetry; prepare poems and play scripts to read aloud and
 *     perform with intonation, tone, volume and action; summarise main
 *     ideas drawn from more than one paragraph; ask questions to improve
 *     understanding), composition (plan by discussing similar writing and
 *     recording ideas; narratives with settings, characters and plot;
 *     headings and sub-headings in non-narrative writing; evaluate and
 *     edit — assess effectiveness, suggest improvements, propose changes
 *     to grammar and vocabulary for consistency), vocabulary grammar and
 *     punctuation (adverbs and prepositions to express time and cause;
 *     commas after fronted adverbials; standard English differences),
 *     transcription (write from memory simple dictated sentences).
 *     https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study/national-curriculum-in-england-english-programmes-of-study
 *  3. Revision: the shared statute's own guidance keeps years 3 and 4
 *     together, so the Y4 matcher accepts the whole Y1 + Y2 + Y3 union
 *     (ENGLISH_Y3_SYLLABUS already chains both earlier extractions).
 *  4. Y4_EXTRAS_RAW below: the NEW vocabulary the Year-4-only drills name
 *     in choices/match sides/order items (dictionary entries, non-fiction
 *     text-type words, poetry forms, theme and legend words, editing
 *     vocabulary) — curated, and every entry defensible as standard Year-4
 *     reading vocabulary. Prompts/hints/teach lines are text tier.
 *
 *  Entries are pipe-separated, lowercased; phrases split into parts by the
 *  shared matcher (buildSet).
 */
import { ENGLISH_Y3_SYLLABUS, ENGLISH_Y3_TOLERANCE } from '../y3/english'

/** Curated Year-4 additions: what the shared-statute statements above add
 *  beyond the Year-3 extraction (PLAN 169g). */
const Y4_EXTRAS_RAW = `alphabet|entry|entries|definition|definitions|
contents|glossary|chapter|report|reports|letter|letters|diary|instructions|
label|labels|diagram|caption|topic|facts|text|texts|
verse|narrative|poems|stanza|simile|metaphor|fable|rhyming|
fairy|tale|tales|legend|legends|hero|villain|magic|magical|wish|dragons|
friendship|greedy|honest|kindness|
meanwhile|afterwards|since|formal|informal|
example|examples|similar|punctuation|improve|notes|
cheerful|peaceful|gloomy|spooky|noisy|careless|teacher|teachers|
practise|practice|practised|dictation|memory|
limerick|teammate|teammates|measure|measured|cancel|cancelled|labelled|
include|opening|village|villager|villagers|patter|pattered`

/** Names + domain words that legitimately appear in Year-4 English lessons
 *  without being DfE list vocabulary: mascots, site characters, first names
 *  inside sentences and stories, and the intentional near-miss spellings
 *  the drills choose to be wrong (PLAN 169g). The Y3 near-miss set is
 *  carried over because Year 4 revisits the same shared-statute words. */
export const ENGLISH_Y4_TOLERANCE: readonly string[] = [
  ...new Set([
    ...ENGLISH_Y3_TOLERANCE,
    // first names that appear inside Y4 sentences, stories and dialogue
    'lena', 'omar', 'zara', 'hassan', 'ruby', 'pip', 'ben', 'mia', 'sam',
    'nina', 'kim', 'tom', 'dan', 'lucy', 'jack', 'emma', 'leo', 'tails',
    // Y4 dictionary/dictation drills — intentional near-miss spellings
    'adres', 'adress', 'addres', 'sentre', 'cetre', 'iland', 'aisland',
    'islland', 'anwser', 'anser', 'asnwer', 'lenght', 'lenth', 'langth',
    'remeber', 'rememeber', 'rembmer', 'buisness', 'busness', 'bussiness',
    'konwledge', 'knowladge', 'exersise', 'exercize', 'excercise',
    'possable', 'posible', 'posssible', 'gide', 'guiide',
    // proof-pick misspellings (choices are full sentences)
    'gardan', 'gardne', 'gardern', 'pround', 'classe', 'gane', 'classs',
    'babby', 'bayby', 'babie', 'baiked', 'caek', 'bick', 'hillss', 'brang',
    // confusing-word drill wrong picks (real words, wrong in context)
    'accepte', 'excpet', 'afect', 'affecte', 'borow', 'brrow', 'wicth',
  ]),
]

/** Union of the Y3-derived shared-statute lists (which chain the Y1 and Y2
 *  extractions) + the Y4-lesson additions (normalized at load). */
export const ENGLISH_Y4_SYLLABUS: readonly string[] = [...new Set(
  Y4_EXTRAS_RAW
    .split(/[|\n]/)
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean)
    .concat(ENGLISH_Y3_SYLLABUS),
)]
