/** Year-1 SYLLABUS — English spelling/vocabulary, EXTRACTED FROM REAL
 *  OFFICIAL SOURCES (PLAN 169a).
 *
 *  Sources (extracted by research agents, 2026-09-29):
 *  1. DfE "English appendix 1: spelling" (DFE-00181-2013), "Common exception
 *     words — work for year 1" + every example word printed for the Year-1
 *     statutory spelling rules.
 *     https://assets.publishing.service.gov.uk/media/5a7ccc06ed915d63cc65ce61/English_Appendix_1_-_Spelling.pdf
 *  2. DfE national curriculum in England: English programmes of study (2014),
 *     Year-1 statements (word reading, comprehension, composition, spelling,
 *     vocabulary/grammar/punctuation) + Appendix 2 Year-1 "Terminology for
 *     pupils" (letter, capital letter, word, singular, plural, sentence,
 *     punctuation, full stop, question mark, exclamation mark).
 *     https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study/national-curriculum-in-england-english-programmes-of-study
 *  3. DfE "Letters and Sounds" (DFES-00281-2007) Phase 2-5 grapheme word
 *     banks (pp. 69, 100-102, 126, 151) — the decodable words the phonics
 *     lessons read, tap and spell.
 *     https://assets.publishing.service.gov.uk/media/5a7aa7b6e5274a34770e630c/Letters_and_Sounds_-_DFES-00281-2007.pdf
 *  4. Cambridge Primary English Stage 1 (Learner's Book 1) — unit/text-type
 *     spine only; CUP publishes no public word list for Stage 1, so word
 *     coverage comes from the DfE lists above.
 *  5. Ordinary Year-1 reading-scheme words + the picture-bank nouns the
 *     lessons match to emoji: no official KS1 reading word list exists to
 *     extract these from, so they are curated here exactly like the shared
 *     EN_CORE set (PLAN 145) — folded into PHONICS_RAW / PICTURE_RAW and
 *     every entry must be defensible as standard Year-1 reading vocabulary.
 *
 *  Entries are pipe-separated, lowercased; phrases split into parts by the
 *  shared matcher (buildSet).
 */

/** DfE Appendix 1 — common exception words, Year 1 (45 incl. "I"). */
const CEW_RAW = `the|a|do|to|today|of|said|says|are|were|was|is|his|has|i|you|your|
they|be|he|me|she|we|no|go|so|by|my|here|there|where|love|come|some|one|
once|ask|friend|school|put|push|pull|full|house|our`

/** DfE Appendix 1 — "Spelling: work for year 1" example words (statutory
 *  rules ff/ll/ss/zz/ck, n-before-k, syllables, -tch, final -e after /v/,
 *  -s/-es, -ing/-ed/-er, -er/-est, -y endings, ph/wh, k before e/i/y,
 *  prefix un-, compound words) + the statutory days of the week. The
 *  sunny/baby/fly/cry… entries extend the printed -y examples (same rule,
 *  ordinary Year-1 -y vocabulary); my/come are repeated from the CEW line
 *  where the printed compound examples need them. */
const SPELLING_RAW = `off|well|miss|buzz|back|bank|think|honk|sunk|pocket|rabbit|carrot|
thunder|sunset|catch|fetch|kitchen|notch|hutch|which|much|such|have|
live|give|cats|dogs|spends|rocks|thanks|catches|hunting|hunted|hunter|
buzzing|buzzed|buzzer|jumping|jumped|jumper|grand|grander|grandest|fresh|
fresher|freshest|quick|quicker|quickest|very|happy|funny|party|family|
dolphin|alphabet|phonics|elephant|when|wheel|while|kent|sketch|kit|skin|
frisky|unhappy|undo|unload|unfair|unlock|football|playground|farmyard|
bedroom|blackberry|sunny|baby|chatty|runny|slimy|dotty|fly|cry|try|sky|
dry|shy|day|say|play|monday|tuesday|wednesday|thursday|friday|saturday|
sunday`

/** DfE Letters and Sounds Phase 2-5 word banks — the decodable words the
 *  phonics lessons read, tap and spell (union of the per-phase banks). */
const PHONICS_RAW = `sat|pin|tap|map|dog|sock|run|mug|bell|rabbit|kick|sunset|carrot|
rocket|jam|zip|quiz|chop|ship|thin|this|sing|ring|rain|night|boat|look|
farm|coin|hear|fair|corn|burn|cow|book|hammer|van|wet|mix|box|six|yes|
buzz|quick|went|milk|hand|belt|stop|frog|train|star|stand|crisp|string|
lunch|sandwich|shelter|day|boy|out|pie|sea|girl|blue|saw|when|photo|
came|like|bone|home|rule|find|mind|head|bread|cold|gold|all|her|into|
will|see|that|for|this|now|then|down|them|look|with|too|get|big|him|
not|got|up|mum|dad|but|and|an|as|at|if|in|is|it|off|on|had|back|him|
cat|hen|pig|fox|cup|log|hat|mat|bed|net|pen|pot|sit|win|red|leg|jet|
kit|lip|mop|nut|peg|tip|yak|dig|got|hug|jig|rag|mud|bug|web|tub|cub|
hen|man|pan|tan|fan|ran|can|dan|den|ten|men|pen|fin|pin|tin|bin|win`

/** Year-1 pupil terminology + phonics/comprehension vocabulary (DfE Y1
 *  statements and Appendix 2 Year-1 row). */
const TERMS_RAW = `letter|letters|capital|word|words|sentence|sentences|punctuation|stop|
question|mark|exclamation|singular|plural|space|spaces|finger|sound|sounds|
blend|blending|digraph|digraphs|grapheme|phoneme|rhyme|rhymes|rhyming|poem|
poems|poetry|story|stories|title|beginning|middle|end|character|predict|
predicting|sequence|sequencing|retell|retelling|instructions|recount|
alphabet|vowel|consonant|tricky|spell|spelling|read|reading|write|writing|
talk|talked|listen|listening|mean|means|meaning|name|names|pick|picked|
choose|chose|think|thought|first|last|next|after|before|called|follow|
following|line|lines|write|writes|full|mark|short|long`

/** Picture-bank nouns the lessons match to emoji — the full shared
 *  PICTURE_BANK vocabulary the Y1 content may use + the concrete/verb,
 *  number and young-animal words that appear inside Y1 sentences, poems
 *  and story cards. */
const PICTURE_RAW = `cat|dog|sun|moon|star|tree|flower|fish|bird|frog|duck|horse|cow|pig|
sheep|mouse|rabbit|bear|lion|monkey|elephant|snake|bee|butterfly|snail|ant|
spider|apple|banana|strawberry|grape|carrot|bread|cheese|cake|milk|juice|
water|ball|kite|book|pencil|chair|bed|door|window|car|bus|train|boat|plane|
rocket|bike|hat|shoe|sock|coat|crown|key|clock|lamp|phone|rain|snow|cloud|
wind|storm|rainbow|fire|leaf|mushroom|stone|shell|egg|nest|worm|fox|owl|
wolf|goat|cherry|peach|corn|tomato|potato|onion|sweet|hand|foot|eye|ear|
nose|mouth|house|school|shop|castle|bridge|road|mountain|island|beach|
garden|pond|den|straw|hen|crab|fence|gate|slide|swing|big|little|red|old|
new|good|bad|sad|hot|cold|wet|dry|fast|slow|up|down|in|out|over|under|
near|far|ran|jumped|walked|played|smiled|laughed|helped|wanted|liked|
watched|picked|hid|sat|saw|got|had|went|came|made|gave|found|told|felt|
met|ate|lost|won|began|kept|slept|children|people|morning|friend|friends|
hill|wall|puppy|kitten|chick|lamb|two|three|four|five|six|seven|eight|
nine|ten|eleven|twelve|twenty|wool|green|blue|pink|great|other|fun|swim|eat|turn`

/** Names + domain words that legitimately appear in Year-1 English lessons
 *  without being DfE list vocabulary: mascots, site characters, first names
 *  inside sentences, the grapheme labels the phonics drills ask by name
 *  ("sh", "igh", …), and the intentional near-miss spellings the
 *  spell-the-right-one drills choose to be wrong (short words gate nothing,
 *  but they are listed so reports stay clean). */
export const ENGLISH_Y1_TOLERANCE: readonly string[] = [
  'sonic', 'tails', 'knuckles', 'amy', 'shadow', 'silver', 'cream', 'blaze',
  'rouge', 'metal', 'eggman', 'momo', 'chao', 'robot', 'badnik',
  // first names that appear inside Y1 sentences and story cards
  'ben', 'sam', 'mia', 'nina', 'kim', 'pip', 'tam', 'bob', 'tom', 'dan',
  // grapheme labels the phonics lessons name ("Which letters make /sh/?")
  'sh', 'ch', 'th', 'ng', 'ck', 'ff', 'll', 'ss', 'zz', 'qu', 'ai', 'ee',
  'igh', 'oa', 'oo', 'ar', 'or', 'ur', 'ow', 'oi', 'ear', 'air', 'ure',
  'er', 'ay', 'ou', 'ie', 'ea', 'oy', 'ir', 'ue', 'aw', 'wh', 'ph', 'ew',
  'oe', 'au', 'ey', 'a-e', 'i-e', 'o-e', 'u-e', 'e-e',
  // intentional near-miss spellings the drills choose as wrong answers
  'sed', 'sayd', 'saed', 'frend', 'frind', 'frendz', 'thee', 'thay',
  'theye', 'skol', 'shool', 'scool', 'hous', 'howse', 'hows', 'luv', 'lov',
  'lave', 'ones', 'wuns', 'wunce', 'esk', 'askd', 'aks', 'wer', 'wher',
  'whare', 'cum', 'com', 'cume', 'sum', 'som', 'buz', 'wel', 'mis', 'bak',
  'banck', 'thik', 'cach', 'cates', 'doges', 'jumpin', 'jumpeng', 'jummping',
  'jumpd', 'quickr', 'quickker', 'footbal', 'footbll', 'fooball', 'playgrund',
  'farmyrd', 'bedrom', 'blakbry', 'unhapy', 'plaied', 'playd', 'playeed',
  'walkd', 'walkeed', 'helpd', 'helpet',
]

/** Union of the five DfE-derived lists above (normalized at load). */
export const ENGLISH_Y1_SYLLABUS: readonly string[] = [...new Set(
  `${CEW_RAW}\n${SPELLING_RAW}\n${PHONICS_RAW}\n${TERMS_RAW}\n${PICTURE_RAW}`
    .split(/[|\n]/)
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean),
)]
