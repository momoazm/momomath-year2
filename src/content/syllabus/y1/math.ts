/** Year-1 SYLLABUS — maths vocabulary for the Year-1 maths pilot (PLAN 167).
 *
 *  Source: "Mathematical vocabulary" — National Numeracy Strategy / Framework
 *  for Teaching Mathematics, year-group vocabulary checklists (Reception-Y6),
 *  DfES 0313/2000, Standards and Effectiveness Unit, Open Government Licence.
 *  https://dera.ioe.ac.uk/id/eprint/5248/2/nns_mathvocab031300.pdf
 *  The Year-1 checklist is the CUMULATIVE Reception + Year-1 list (the book
 *  prints each year as everything before plus the words new that year), taken
 *  from the "YEAR 1" checklist pages (PDF pp. 12-15): numbers & calculations,
 *  solving problems/data/measures, time/shape/space/patterns/position, plus
 *  the instruction and general vocabulary the Y1 teacher prompts use.
 *  Extracted from the DERA text layer 2026-09-29.
 *
 *  Printed range shorthands are expanded to their concrete entries, e.g.
 *  "one ... twenty" -> one|two|...|twenty, "count in ones | twos ... tens"
 *  -> count in ones|count in twos|...|count in tens, "third ... tenth" ->
 *  third|fourth|...|tenth. Entries the book prints as questions keep only
 *  their lexical part ("how many more is ... than ...?" -> "how many more
 *  is"); the matcher is token-based, so the "..." furniture adds nothing.
 *
 *  ADDENDUM (with provenance) — the 2000 NNS Y1 list predates the 2014
 *  national curriculum, which makes halves AND quarters statutory at Y1
 *  ("recognise, find and name a quarter as one of four equal parts...",
 *  gov.uk maths programmes of study, Year 1) and names arrays in the Y1
 *  multiplication statement ("...calculating the answer using concrete
 *  objects, pictorial representations and arrays"). These words are absent
 *  from the NNS Y1 column (they print red at Year 2) but are required by
 *  Cambridge Primary Stage 1 (Fractions, unit 12 "Halves"; number patterns)
 *  and the DfE programme of study, so they are allow-listed here:
 *  quarter(s), equal, parts, array, minute, second (Y1 measurement: "time
 *  (hours, minutes, seconds)"), name and solve (Y1 statements: "recognise,
 *  find and name a half...", "solve one-step problems that involve addition
 *  and subtraction").
 */

const NNS_Y1 = `number|zero|one|two|three|four|five|six|seven|eight|nine|ten|
eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|
twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|one hundred|none|
how many|count|count to|count up to|count on|count back|count in ones|
count in twos|count in threes|count in fours|count in fives|count in tens|
count out|more|less|many|few|odd|even|every other|
how many times|pattern|pair|repeating pattern|continue|carry on|repeat|
what comes next|difference between|half|halve|equals|sign|is the same as|
units|ones|tens|exchange|digit|teens number|the same number as|as many as|
equal to|greater|larger|bigger|fewer|smaller|greatest|most|biggest|largest|
least|fewest|smallest|one more|two more|three more|four more|five more|
six more|seven more|eight more|nine more|ten more|one less|two less|
three less|four less|five less|six less|seven less|eight less|nine less|
ten less|ten more|ten less|compare|order|size|first|second|third|fourth|
fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|thirteenth|
fourteenth|fifteenth|sixteenth|seventeenth|eighteenth|nineteenth|twentieth|
last|last but one|before|after|next|between|half-way between|above|below|
guess how many|estimate|nearly|roughly|close to|about the same as|
just over|just under|too many|too few|enough|not enough|sort|vote|group|
set|list|table|puzzle|same|different|answer|right|wrong|
what could we try next|how did you work it out|share out|left|left over|
number sentence|operation|missing number|number facts|number line|
number track|number square|number cards|start from|start with|start at|
double|near double|add|more|plus|make|sum|total|altogether|score|
subtract|take away|minus|leave|how many are left|how many are left over|
how many more to make|how many more is|how much more is|how many fewer is|
how much less is|measure|money|coin|guess|penny|pence|pound|price|
too much|too little|cost|buy|sell|spend|spent|pay|change|dear|cheap|
cheaper|costs more|costs less|costs the same as|length|width|height|depth|
long|short|tall|high|low|wide|narrow|deep|shallow|thick|thin|longer|
shorter|taller|higher|longest|shortest|tallest|highest|far|near|close|
metre|ruler|metre stick|weigh|weighs|balances|heavy|light|heavier|lighter|
heaviest|lightest|balance|scales|weight|full|half full|empty|holds|
container|time|hour|minute|second|o'clock|half past|clock|watch|hands|
how long ago|how long will it take|days of the week|monday|tuesday|
wednesday|thursday|friday|saturday|sunday|seasons|spring|summer|autumn|
winter|day|week|month|year|weekend|birthday|holiday|morning|afternoon|
evening|night|midnight|bedtime|dinnertime|playtime|today|yesterday|
tomorrow|now|soon|early|late|quick|quicker|quickest|quickly|fast|faster|
fastest|slow|slower|slowest|slowly|old|older|oldest|new|newer|newest|
takes longer|takes less time|position|over|under|underneath|top|bottom|
side|on|in|outside|inside|around|in front|behind|front|back|beside|
next to|opposite|apart|middle|centre|edge|how often|always|never|often|
sometimes|usually|corner|once|twice|direction|journey|shape|flat|curved|
straight|hollow|solid|point|pointed|face|end|movement|slide|build|
draw|roll|turn|whole turn|half turn|stretch|bend|cube|cuboid|pyramid|
sphere|cone|cylinder|circle|triangle|square|rectangle|star|symmetrical|
up|down|forwards|backwards|sideways|across|round|along|through|to|from|
towards|away from|find|choose|collect|use|describe|pick out|talk about|
explain|read|write|record|trace|copy|complete|finish|fill in|shade|
colour|tick|cross|draw a line between|join up|ring|arrow|work out|
listen|join in|check|say|think|imagine|remember|look at|point to|
show me|put|place|abacus|fit|counters|cubes|blocks|rods|arrange|die|
dice|rearrange|dominoes|change over|pegs|peg board|split|separate|
same way|different way|best way|another way|in order|in a different order|
not|all|every|each|match`

/** Documented addendum — DfE NC 2014 Y1 + Cambridge Stage 1 (see header). */
const NC_Y1_ADDENDUM = `quarter|quarters|equal|parts|array|minute|second|name|solve`

export const MATH_Y1_SYLLABUS: readonly string[] = [...new Set(
  `${NNS_Y1}\n${NC_Y1_ADDENDUM}`.split(/[|\n]/)
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean),
)]

/** Proper nouns / mascots / story words that legitimately appear in maths
 *  prompts but are not curriculum vocabulary (mirrors the Year-2 tolerance). */
export const MATH_Y1_TOLERANCE: readonly string[] = [
  'sonic', 'tails', 'knuckles', 'amy', 'shadow', 'silver', 'cream', 'blaze',
  'rouge', 'metal', 'eggman', 'momo', 'chao', 'robot', 'badnik',
  'giraffe', 'paperclip',
]
