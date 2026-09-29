/** Year-3 SYLLABUS — English spelling/vocabulary, EXTRACTED FROM REAL
 *  OFFICIAL SOURCES (PLAN 169d).
 *
 *  Sources (extracted by research agents, 2026-09-29):
 *  1. DfE "English appendix 1: spelling" (DFE-00181-2013) — the statutory
 *     "Word list – years 3 and 4" (~100 words) and every example word
 *     printed under "Spelling – work for years 3 and 4": final-consonant
 *     doubling in stressed syllables, /ɪ/ spelt y, /ʌ/ spelt ou, the
 *     dis-/mis-/in-/il-/im-/ir-/re-/sub-/inter-/super-/anti-/auto-
 *     prefixes, -ation, -ly (incl. the y→i and -ic/-ally exceptions),
 *     -sure/-ture, -sion, -ous, the -tion/-sion/-ssion/-cian family,
 *     ch /k/ and /ʃ/, -gue/-que, sc /s/, ei/eigh/ey, the plural
 *     possessive apostrophe forms and the statutory homophone list.
 *     https://assets.publishing.service.gov.uk/media/5a7ccc06ed915d63cc65ce61/English_Appendix_1_-_Spelling.pdf
 *  2. DfE national curriculum in England: English programmes of study
 *     (2014), "Years 3 and 4 programme of study" — word reading (roots,
 *     prefixes, suffixes; further exception words), comprehension
 *     (retrieve, infer, predict, summarise, word meaning in context,
 *     discussion, dictionary), transcription (homophones, possessive
 *     apostrophe with regular and irregular plurals, dictionary checking),
 *     composition (paragraphs around a theme, headings/sub-headings,
 *     evaluate/edit/proofread, read aloud with intonation), vocabulary,
 *     grammar and punctuation (conjunctions when/if/because/although,
 *     present perfect vs past, pronouns for clarity, adverbs and
 *     prepositions for time and cause, fronted adverbials + commas,
 *     direct speech, Appendix 2 terminology).
 *     https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study/national-curriculum-in-england-english-programmes-of-study
 *  3. DfE "English appendix 2: vocabulary, grammar and punctuation" — the
 *     terminology for pupils the year-3 lessons name (adverb, adjective,
 *     verb, noun, pronoun, conjunction, preposition, clause, tense,
 *     singular/plural, possessive, apostrophe, comma, inverted commas).
 *  4. Revision: Appendix 1 opens "Spelling – work for years 3 and 4" with
 *     "Revision of work from years 1 and 2", so the Y3 matcher also accepts
 *     the Y1 (PLAN 169a) and Y2 (PLAN 143) extractions — every word a
 *     Year-3 lesson revisits from earlier years is statutory revision.
 *  5. Ordinary reading-scheme vocabulary the story/sentence drills use
 *     (READING_RAW): no official KS2 reading word list exists to extract
 *     these from, so they are curated here exactly like the Y1 PICTURE_RAW
 *     set (PLAN 169a) — every entry must be defensible as standard Year-3
 *     reading vocabulary.
 *
 *  Entries are pipe-separated, lowercased; phrases split into parts by the
 *  shared matcher (buildSet).
 */
import { ENGLISH_SYLLABUS } from '../english'
import { ENGLISH_Y1_SYLLABUS } from '../y1/english'

/** DfE Appendix 1 — statutory "Word list: years 3 and 4" (parenthetical
 *  forms expanded: accident(ally) → accident + actually, busy/business,
 *  forward(s), occasion(ally), though/although, woman/women, possess(ion),
 *  eight/eighth, actual(ly)). */
const WORD_LIST_RAW = `accident|actually|early|knowledge|purpose|actual|earth|learn|
quarter|address|eight|eighth|length|question|answer|enough|library|recent|
appear|exercise|material|regular|arrive|experience|medicine|reign|believe|
experiment|mention|remember|bicycle|extreme|minute|sentence|breath|famous|
natural|separate|breathe|favourite|naughty|special|build|february|notice|
straight|busy|business|forward|forwards|occasion|occasionally|strange|
calendar|fruit|often|strength|caught|grammar|opposite|suppose|centre|group|
ordinary|surprise|century|guard|particular|therefore|certain|guide|peculiar|
though|although|thought|circle|heard|perhaps|through|complete|heart|popular|
consider|height|position|various|continue|history|possess|possession|weight|
decide|imagine|possible|woman|women|describe|increase|potatoes|different|
important|pressure|difficult|interest|probably|disappear|island|promise`

/** DfE Appendix 1 — example words printed under "Spelling: work for years
 *  3 and 4" (all eight statutory sections + their guidance examples) and
 *  the statutory homophone list on the -tion-family pages. */
const SPELLING_RAW = `forgetting|forgotten|beginning|beginner|prefer|preferred|
gardening|gardener|limiting|limited|limitation|myth|gym|egypt|pyramid|mystery|
young|touch|double|trouble|country|disappoint|disagree|disobey|misbehave|
mislead|misspell|inactive|incorrect|illegal|illegible|immature|immortal|
impossible|impatient|imperfect|irregular|irrelevant|irresponsible|redo|
refresh|return|reappear|redecorate|subdivide|subheading|submarine|submerge|
interact|intercity|international|interrelated|supermarket|superman|superstar|
antiseptic|antisocial|autobiography|autograph|information|adoration|sensation|
preparation|admiration|sadly|completely|usually|finally|comically|happily|
angrily|gently|simply|humbly|nobly|basically|frantically|dramatically|truly|
wholly|duly|measure|treasure|pleasure|enclosure|creature|furniture|picture|
nature|adventure|division|invasion|confusion|decision|collision|television|
poisonous|dangerous|mountainous|famous|various|tremendous|enormous|jealous|
humorous|glamorous|vigorous|courageous|outrageous|serious|obvious|curious|
hideous|spontaneous|courteous|invention|injection|action|hesitation|
completion|expression|discussion|confession|permission|admission|expansion|
extension|comprehension|tension|musician|electrician|magician|politician|
mathematician|scheme|chorus|chemist|echo|character|chef|chalet|machine|
brochure|league|tongue|antique|unique|science|scene|discipline|fascinate|
crescent|vein|weigh|neighbour|obey|accept|except|affect|effect|ball|bawl|
berry|bury|brake|break|fair|fare|grate|great|groan|grown|here|hear|heel|
heal|knot|not|mail|male|main|mane|meat|meet|medal|meddle|missed|mist|peace|
piece|plain|plane|rain|rein|seen|weather|whether|whose|girls|boys|babies|
men|mice|children`

/** DfE PoS years 3 and 4 + Appendix 2 — the grammar, punctuation,
 *  comprehension and composition vocabulary the drills name in their
 *  choices and match sides (prompts/hints are text tier and not audited). */
const TERMS_RAW = `adverb|adverbs|adjective|adjectives|verb|verbs|noun|nouns|
pronoun|pronouns|conjunction|conjunctions|preposition|prepositions|clause|
clauses|phrase|phrases|tense|tenses|singular|plural|possessive|apostrophe|
apostrophes|comma|commas|speech|inverted|standard|adverbial|fronted|perfect|
present|past|paragraph|paragraphs|heading|headings|subheadings|draft|drafting|
edit|editing|proofread|evaluate|summary|summarise|main|idea|ideas|infer|
evidence|predict|prediction|theme|themes|dictionary|dictionaries|
alphabetical|index|contents|retrieve|fiction|plays|script|audience|purpose|
perform|performance|intonation|tone|volume|discuss|justify|checking|sense|
imagination|title|author|characters|setting|plot|dialogue|rhyme|rhythm|poem`
// `main`/`idea` etc. sit above the year-2 hard threshold only as groups; each
// is ordinary Y3 classroom vocabulary from the PoS statements above.

/** Curated Year-3 reading vocabulary: the shared PICTURE_BANK nouns the
 *  emoji drills tap, plus the concrete verbs, adjectives, time words,
 *  feelings and place words the story/sentence/homophone items use. No
 *  official KS2 reading list exists, so this follows the Y1 PICTURE_RAW
 *  convention (PLAN 169a): curated, and every entry defensible as standard
 *  Year-3 reading vocabulary. */
const READING_RAW = `cat|dog|sun|moon|star|tree|flower|fish|bird|frog|duck|
horse|cow|pig|sheep|mouse|rabbit|bear|lion|monkey|elephant|snake|bee|
butterfly|snail|ant|spider|apple|banana|strawberry|grape|carrot|bread|cheese|
cake|milk|juice|water|ball|kite|book|pencil|chair|bed|door|window|car|bus|
train|boat|plane|rocket|bike|hat|shoe|sock|coat|crown|key|clock|lamp|phone|
rain|snow|cloud|wind|storm|rainbow|fire|leaf|mushroom|stone|shell|egg|nest|
worm|fox|owl|wolf|goat|cherry|peach|corn|tomato|potato|onion|sweet|hand|
foot|eye|ear|nose|mouth|house|school|shop|castle|bridge|road|mountain|island|
beach|garden|pond|hill|wall|field|path|river|forest|lake|wood|cave|village|
town|library|hospital|tent|map|rope|torch|seed|root|stem|petal|nest|den|
ran|jumped|walked|played|smiled|laughed|helped|wanted|liked|watched|picked|
hid|sat|saw|got|had|went|came|made|gave|found|told|felt|met|ate|lost|won|
began|kept|slept|shone|fell|carried|closed|opened|opened|counted|collected|
noticed|listened|studied|finished|started|returned|called|asked|replied|
shouted|whispered|answered|said|good|bad|sad|happy|angry|worried|excited|
proud|scared|nervous|pleased|lonely|confused|tired|hungry|fast|slow|big|
little|red|blue|green|yellow|black|white|hot|cold|warm|wet|dry|old|new|
young|tall|short|tiny|huge|ancient|brave|silent|bright|dark|kind|quick|
quiet|loud|carefully|suddenly|finally|first|next|then|last|before|after|
until|during|while|although|morning|afternoon|evening|night|today|week|
month|year|january|february|march|april|may|june|july|august|september|
october|november|december|monday|tuesday|wednesday|thursday|friday|saturday|
sunday|eaten|seen|gone|written|taken|bought|brought|taught|sold|held|wore`
// february/month names repeat the word list where sentences need them again.

/** Second curated pass (PLAN 169d): the prefix roots the match/build drills
 *  pair with their prefixed forms, the -ation/-ly/-ous bases, the meaning
 *  words the prefix/definition mcqs use as choices, and the extra reading
 *  words the sentence/dialogue items use. All ordinary Year-3 vocabulary. */
const EXTRA_RAW = `between|above|against|self|spell|agree|behave|national|divide|
merge|market|social|patient|legal|mature|city|act|man|graph|inform|prepare|
adore|admire|sense|invent|express|hesitate|confess|admit|poison|courage|
outrage|glamour|humor|vigour|gentle|simple|humble|final|usual|comic|place|
need|light|inside|film|dirty|clean|built|wrong|girl|boy|lunch|mum|home|
story|play|stories|title|chapter|cover|page|pages|read|write|wrote|factory|
vegetable|equal|part|tool|food|heavy|small|strong|common|never|reason|glass|
air|body|take|get|stay|odd|two|ten|place|happen|gather`


/** Names + domain words that legitimately appear in Year-3 English lessons
 *  without being DfE list vocabulary: mascots, site characters, first names
 *  inside sentences and stories, and the intentional near-miss spellings
 *  the spell-the-right-one drills choose to be wrong (PLAN 169d). */
export const ENGLISH_Y3_TOLERANCE: readonly string[] = [
  ...new Set([
    'sonic', 'tails', 'knuckles', 'amy', 'shadow', 'silver', 'cream', 'blaze',
    'rouge', 'metal', 'eggman', 'momo', 'chao', 'robot', 'badnik', 'felix',
    'franzi',
    // first names that appear inside Y3 sentences, stories and dialogue
    'mia', 'ben', 'sam', 'nina', 'kim', 'pip', 'tam', 'bob', 'tom', 'dan',
    'lucy', 'jack', 'emma', 'leo', 'ruby', 'omar', 'zara', 'hassan',
    // intentional near-miss spellings the drills choose as wrong answers
    'seperate', 'saparate', 'libary', 'librray', 'libaryy', 'libraryy', 'grammer',
    'grammor', 'calender', 'ocassion', 'occassion', 'recieve', 'beleive',
    'medecine', 'medicin', 'surprize', 'potatos', 'hieght', 'wierd',
    'freind', 'thier', 'goverment', 'knowlege', 'excercise', 'tommorrow',
    'separte', 'adress', 'aparent', 'begining', 'comited', 'dependant',
    'enviroment', 'goverence', 'maintainance', 'nessessary', 'publically',
    'occurrance', 'persistant', 'posession', 'relevent', 'succesful',
    'tommorow', 'untill', 'wether', 'wheter', 'adress', 'adition',
    // prefix/suffix wrong forms the in-/il-/im-/ir- and -ous drills pick
    'inpossible', 'inmature', 'inlegal', 'inregular', 'impatiently',
    'irpfect', 'inattentive', 'imposible', 'dangrous', 'poisenous',
    'famouse', 'obviouse', 'curiousity', 'mountanous', 'poisonus',
    'disapoint', 'mispeled', 'reappearr', 'submarin', 'interational',
    'supermarcket', 'antibioticx', 'automaticly', 'informashun',
    'preparasion', 'admirationn', 'usualy', 'finaly', 'comicaly',
    'measurment', 'creatur', 'picter', 'natur', 'furnitur', 'divison',
    'invasian', 'confuson', 'decison', 'invention', 'expresson',
    'permision', 'admission', 'magican', 'politicin', 'mathematican',
    'musision', 'electrisian', 'chemest', 'choirus', 'sceme', 'ecko',
    'charactor', 'chalett', 'broshure', 'leauge', 'tonge', 'antiqu',
    'scientse', 'sciene', 'disciplin', 'fasinate', 'crezent', 'veign',
    'wigh', 'neigbour', 'obeys', 'acheive', 'achievment', 'beleived',
    'calender', 'grammer', 'harass', 'humourous', 'millenium',
    'miniture', 'noticable', 'paralel', 'posession', 'prefered',
    'priviledge', 'pronounciation', 'questionaire', 'readible',
    'rythm', 'seperate', 'sieze', 'supercede', 'tendancy', 'threshhold',
    'tomorrow', 'twelth', 'unfortunatly', 'whereever', 'wich', 'writting',
    // homophone wrong picks (real words, wrong in the sentence's context —
    // listed so the report stays clean; the drill is the teaching)
    'bawl', 'bury', 'brake', 'fare', 'grate', 'groan', 'heel', 'knot',
    'male', 'mane', 'meet', 'meddle', 'mist', 'piece', 'plane', 'rein',
    'whether', 'plain', 'mail',
    'reign', 'neat', 'knock', 'fear', 'medel', 'meddal', 'wheather',
    // near-miss spellings surfaced by the PLAN 169d hard-flag audit sweep
    'illigal', 'illegable', 'begginning', 'immatuer', 'imature', 'imortal',
    'inmortal', 'immortel', 'vigorus', 'vigourous', 'glamoros', 'dangeorus',
    'couragous', 'courrageous', 'outragueous', 'outragous', 'beginnig',
    'limmiting', 'ocasion', 'callender', 'calandar', 'inresponsible',
    'irresponsble', 'irresponsable', 'illigible', 'inlegible', 'illegabal',
    'impatiant', 'impashent', 'impacient', 'incorect', 'incorrekt',
    'incoreckt', 'irreguler', 'irrgular', 'imperfekt', 'inperfect',
    'imprefect', 'irrelavent', 'inrelevant', 'irrelevent', 'mounteinous',
    'humoros', 'forgeting', 'forgetten', 'gardenning', 'surrprise',
    'surprizee', 'beleave', 'meddicine', 'inactiv', 'inactiff', 'inactve',
    'impossibel', 'planeley', 'beginer', 'diferrent', 'diferent',
    'februrary', 'febrruary', 'potatoe', 'pottatoes', 'carefull',
    'completly', 'compleatly', 'limitted', 'forgeten', 'improtant',
    'importent', 'importannt', 'gardenner',
  ]),
]

/** Union of the DfE Y3-derived lists + the statutory revision base (Y1 Y2
 *  extractions) + the curated READING_RAW set (normalized at load). */
export const ENGLISH_Y3_SYLLABUS: readonly string[] = [...new Set(
  `${WORD_LIST_RAW}\n${SPELLING_RAW}\n${TERMS_RAW}\n${READING_RAW}\n${EXTRA_RAW}`
    .split(/[|\n]/)
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean)
    .concat(ENGLISH_Y1_SYLLABUS, ENGLISH_SYLLABUS),
)]
