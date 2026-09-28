/** Year-2 SYLLABUS — English spelling/vocabulary, EXTRACTED FROM A REAL
 *  PUBLISHED BOOK (PLAN 143).
 *
 *  Source: "English appendix 1: spelling" (English programmes of study, key
 *  stages 1 and 2, DFE-00181-2013), UK Department for Education — the official
 *  Year-2 word list: Common exception words + every example word printed for
 *  the Year-2 statutory spelling patterns (pages 7-10).
 *  https://assets.publishing.service.gov.uk/media/5a7ccc06ed915d63cc65ce61/English_Appendix_1_-_Spelling.pdf
 *  Extracted 2026-09-27, verified against the source PDF.
 *  (Cambridge Primary English Stage 2 publishes no public word list — its
 *  curriculum framework objectives are the topic spine only.)
 */

const EXCEPTION_RAW = `door|floor|poor|because|find|kind|mind|behind|child|children|wild|climb|
most|only|both|old|cold|gold|hold|told|every|body|everybody|even|great|break|
steak|pretty|beautiful|after|fast|last|past|father|class|grass|pass|plant|path|
bath|hour|move|prove|improve|sure|sugar|eye|could|should|would|who|whole|any|
many|clothes|busy|people|water|again|half|money|parents|christmas`

const SPELLING_RAW = `badge|edge|bridge|dodge|fudge|age|huge|change|charge|bulge|village|gem|
giant|magic|giraffe|energy|jacket|jar|jog|join|adjust|race|ice|cell|city|fancy|
knock|know|knee|gnat|gnaw|write|written|wrote|wrong|wrap|table|apple|bottle|
little|middle|camel|tunnel|squirrel|travel|towel|tinsel|metal|pedal|capital|
hospital|animal|pencil|fossil|nostril|cry|fly|dry|try|reply|flies|tries|
replies|copies|babies|carries|copied|copier|happier|happiest|cried|replied|
copying|crying|replying|hiking|hiked|hiker|nicer|nicest|shiny|patting|patted|
humming|hummed|dropping|dropped|sadder|saddest|fatter|fattest|runner|runny|all|
ball|call|walk|talk|always|other|mother|brother|nothing|monday|key|donkey|
monkey|chimney|valley|want|watch|wander|quantity|squash|word|work|worm|world|
worth|war|warm|towards|television|treasure|usual|enjoyment|sadness|careful|
playful|hopeless|plainness|badly|merriment|happiness|plentiful|penniless|
happily|cant|didnt|hasnt|couldnt|its|ill|station|fiction|motion|national|
section|there|their|theyre|here|hear|quite|quiet|see|sea|bare|bear|one|won|
sun|son|to|too|two|be|bee|blue|blew|night|knight|being|skiing|taxiing|mixing|
mixed|boxer|sixes|argument|cannot|dontkeys|donkeys|monkeys|mr|mrs|sir|dear|
madam|away|ask|broad|grass|hold|once|put|push|full|pull|eye|eyes|buy|by|story|
day|today|said|says|says|friend|friends|help|helped|jump|jumped|shop|shopping|`

/** Union of the two DfE Year-2 lists above (normalized at load). */
export const ENGLISH_SYLLABUS: readonly string[] = [
  ...EXCEPTION_RAW.split('|').map((w) => w.trim().toLowerCase()).filter(Boolean),
  ...SPELLING_RAW.split('|').map((w) => w.trim().toLowerCase()).filter(Boolean),
]

/** Names + domain words that legitimately appear in English lessons without
 *  being part of the DfE spelling lists: mascots, the six REAL BOOKS the
 *  comprehension units read (classic folk/golden tales — the tales are the
 *  source books), and site characters. */
export const ENGLISH_TOLERANCE: readonly string[] = [
  'sonic', 'tails', 'knuckles', 'amy', 'shadow', 'silver', 'cream', 'blaze',
  'rouge', 'metal', 'eggman', 'momo', 'felix', 'franzi',
  // the six real books read in class (classic tales / graded readers)
  'billy', 'goats', 'gruff', 'goldilocks', 'bears', 'pigs', 'wolf', 'red',
  'riding', 'hood', 'tortoise', 'hare', 'ant', 'grasshopper', 'beanstalk',
  // decodable phonics words (Cambridge Primary English Stage 2 phonics)
  'sat', 'pin', 'cat', 'dog', 'hop', 'big', 'sit', 'log', 'tap', 'fin', 'rag',
  'mud', 'bug', 'web', 'hen', 'jet', 'kit', 'lip', 'mop', 'nut', 'peg', 'rug',
  'tip', 'van', 'yak', 'zip', 'bag', 'bed', 'cup', 'dig', 'fox', 'got', 'hug',
  'ink', 'jam', 'leg', 'map', 'net', 'owl', 'pen', 'rug', 'sun', 'top', 'win',
  // first names that appear inside sentences / error-hunt items (PLAN 145)
  'ben', 'sam', 'mia', 'nina',
  // INTENTIONAL fake words + deliberate misspellings: the prefix-suffix
  // lessons' 'wrong' distractor arrays and the spelling-discrimination mcqs
  // (e03 DIS_RE_FILLS / ENDING_FILLS, e04 plurals + because-spelling) — these
  // are chosen to BE wrong; never teach them as real words. (PLAN 145)
  'misagree', 'reagree', 'unagree', 'outagree', 'disagreesy', 'disagreey',
  'distell', 'untell', 'mistell', 'pretelly', 'outtell', 'relike', 'unliking',
  'mislikey', 'prelike', 'outlike', 'disheat', 'unheat', 'misheat', 'outheat',
  'reheatty', 'reobey', 'unobey', 'misobey', 'preobey', 'outobey', 'disdo',
  'misdo', 'undisdo', 'disdoing', 'redoesy', 'playen', 'playingful',
  'playerly', 'helperly', 'watchly', 'walksy', 'walken', 'personses',
  'personsies', 'mouseling', 'mouselets', 'hariness', 'bacause', 'beacuse',
  'becuase', 'becouse', 'aganist',
]
