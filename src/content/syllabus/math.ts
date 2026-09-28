/** Year-2 SYLLABUS — maths vocabulary, EXTRACTED FROM A REAL PUBLISHED BOOK
 *  (PLAN 143).
 *
 *  Source: "Mathematical vocabulary" — National Numeracy Strategy / Framework
 *  for Teaching Mathematics, year-group vocabulary checklists (Reception-Y6),
 *  DfES 0313/2000, Standards and Effectiveness Unit, Open Government Licence.
 *  https://dera.ioe.ac.uk/id/eprint/5248/2/nns_mathvocab031300.pdf
 *  The Year-2 checklist is cumulative (Reception + Year 1 + Year 2), so the
 *  full KS1 set below is the right Year-2 allow-list. Verified against the
 *  source PDF 2026-09-27.
 *  (The current DfE 2014 maths programme of study publishes NO vocabulary
 *  appendix — its Appendix 1 is written-methods — hence this official
 *  DfES vocabulary book, which the KS1 curriculum inherits.)
 */

const RAW = `number|zero|one|two|three|four|five|six|seven|eight|nine|ten|twenty|thirty|
forty|fifty|sixty|seventy|eighty|ninety|one hundred|one thousand|none|how many|
count|count up to|count on|count back|count in ones|count in twos|count in threes|
count in fours|count in fives|count in tens|more|less|many|few|tally|odd|even|
every other|how many times|multiple of|sequence|continue|predict|pattern|pair|
rule|units|ones|tens|hundreds|digit|one-digit number|two-digit number|
three-digit number|place|place value|stands for|represents|exchange|
the same number as|as many as|equal to|greater|larger|bigger|fewer|smaller|
greatest|most|biggest|largest|least|fewest|smallest|one more|ten more|one less|
ten less|compare|order|size|first|second|third|tenth|twentieth|twenty-first|
twenty-second|last|last but one|before|after|next|between|half-way between|
above|below|guess|estimate|nearly|roughly|close to|about the same as|just over|
just under|exact|exactly|too many|too few|enough|not enough|round|nearest|
round to the nearest ten|part|equal parts|fraction|one whole|one half|
two halves|one quarter|two quarters|three quarters|four quarters|add|addition|
plus|make|sum|total|altogether|score|double|near double|how many more to make|
how many more is|how much more is|subtract|subtraction|take away|minus|leave|
left|left over|how many fewer is|how much less is|difference between|half|halve|
equals|is the same as|sign|tens boundary|lots of|groups of|times|multiply|
multiplied by|once|twice|three times|ten times|times as|repeated addition|array|
row|column|share|share equally|one each|two each|three each|group in pairs|
equal groups of|divide|divided by|divided into|puzzle|calculate|calculation|
mental calculation|jotting|answer|right|correct|wrong|what could we try next|
how did you work it out|number sentence|operation|symbol|missing number|
number facts|number pairs|number bonds|number line|number track|number square|
hundred square|number cards|number grid|abacus|counters|cubes|blocks|rods|die|
dice|dominoes|pegs|peg board|geo-strips|same|different|same way|different way|
best way|another way|in order|in a different order|not|all|every|each|
money|coin|penny|pence|pound|price|cost|buy|bought|sell|sold|spend|spent|pay|
change|dear|cheap|cheaper|how much|measuring scale|length|width|height|depth|
long|short|tall|high|low|wide|narrow|deep|shallow|thick|thin|longer|shorter|
taller|higher|longest|shortest|tallest|highest|far|further|furthest|near|close|
metre|centimetre|ruler|metre stick|tape measure|weigh|weighs|balances|heavy|
light|heavier|lighter|heaviest|lightest|kilogram|half-kilogram|gram|balance|
scales|weight|capacity|full|half full|empty|holds|contains|litre|half-litre|
millilitre|container|time|days of the week|monday|tuesday|wednesday|thursday|
friday|saturday|sunday|months of the year|january|february|march|april|may|june|
july|august|september|october|november|december|seasons|spring|summer|autumn|
winter|day|week|fortnight|month|year|weekend|birthday|holiday|morning|
afternoon|evening|night|midnight|bedtime|dinnertime|playtime|today|yesterday|
tomorrow|now|soon|early|late|quick|quicker|quickest|quickly|fast|faster|
fastest|slow|slower|slowest|slowly|old|older|oldest|new|newer|newest|
takes longer|takes less time|how long ago|how long will it take|hour|minute|
second|o'clock|half past|quarter to|quarter past|clock|watch|hands|
digital clock|analogue clock|timer|how often|always|never|often|sometimes|
usually|shape|flat|curved|straight|hollow|solid|corner|point|pointed|face|side|
edge|end|sort|make|build|draw|surface|cube|cuboid|pyramid|sphere|cone|cylinder|
circle|circular|triangle|triangular|square|rectangle|rectangular|star|pentagon|
hexagon|octagon|symmetrical|line of symmetry|fold|mirror line|reflection|
repeating pattern|position|over|underneath|top|bottom|outside|inside|around|
in front|behind|front|back|beside|next to|opposite|apart|middle|centre|
direction|journey|route|left|right|up|down|lower|forwards|backwards|sideways|
across|along|through|to|from|towards|away from|clockwise|anti-clockwise|
movement|slide|roll|whole turn|half turn|quarter turn|right angle|straight line|
stretch|bend|vote|graph|block graph|pictogram|represent|group|set|list|table|
label|title|most popular|most common|least popular|least common|numerator|
denominator|multiplication|division|multiply sign|minus sign|plus sign|
equals sign|greater than|less than|angle|square number|doubling|halving|
number bond|number sentence|estimating|rounded|weight|weighing|metres|
litres|millilitres|kilograms|grams`

/** Everything above, normalized once at module load. */
const TEENS = ['eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen']
const TENS = ['twenty', 'thirty', 'forty', 'fifty']
const ONES = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
/** PLAN 145 — compound cardinal number words (the NNS checklist above has the
 *  tens + ordinals but not the hyphenated compounds the counting/sequencing
 *  units drill as choices: twenty-five, thirty-nine, ...). */
const NUMBER_WORDS = [...TEENS, ...TENS, ...TENS.flatMap((t) => ONES.map((o) => `${t}-${o}`))]

export const MATH_SYLLABUS: readonly string[] = [...RAW.split('|')
  .map((w) => w.trim().toLowerCase())
  .filter(Boolean), ...NUMBER_WORDS]

/** Proper nouns / mascots / story words that legitimately appear in maths
 *  prompts but are not curriculum vocabulary. */
export const MATH_TOLERANCE: readonly string[] = [
  'sonic', 'tails', 'knuckles', 'amy', 'shadow', 'silver', 'cream', 'blaze',
  'rouge', 'metal', 'eggman', 'momo', 'chao', 'robot', 'badnik',
  // pictogram / data-handling picture icons (u12 pictograms) (PLAN 145)
  'giraffe', 'paperclip',
]
