/** Year-3 SYLLABUS — maths vocabulary for the Year-3 maths rollout
 *  (PLAN 169c).
 *
 *  Sources (extracted 2026-09-29):
 *  1. "Mathematical vocabulary" — National Numeracy Strategy / Framework
 *     for Teaching Mathematics, year-group vocabulary checklists
 *     (Reception-Y6), DfES 0313/2000, Standards and Effectiveness Unit,
 *     Open Government Licence.
 *     https://dera.ioe.ac.uk/id/eprint/5248/2/nns_mathvocab031300.pdf
 *     The Year-3 checklist is the CUMULATIVE Reception-Year-3 list (the
 *     book prints each year as everything before plus the words new that
 *     year), taken from the "YEAR 3" pages (PDF pp. 20-23): numbers &
 *     number system, calculations, measures, shape/space, solving problems
 *     and the instruction vocabulary. Extracted from the DERA text layer
 *     (nns_text.txt) block between the PAGE 20 (YEAR 3) and PAGE 24 (YEAR
 *     4) markers, then curated: page furniture, strand headers and
 *     extraction artifacts dropped; merged cells split; range lines like
 *     "months of the year: january, february..." kept as their lexical
 *     part with the concrete months in the addendum below.
 *  2. DfE National curriculum in England: mathematics programmes of study,
 *     key stages 1 and 2 (2014) — the statutory Year-3 programme of study
 *     (numbers to 1,000, columnar methods, 3/4/8 tables, tenths and
 *     equivalent fractions, m/cm/mm - kg/g - l/ml measures, perimeter,
 *     analogue time with Roman numerals and 12/24-hour clocks, leap year,
 *     right angles and parallel/perpendicular lines, bar charts and
 *     pictograms).
 *     https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study/national-curriculum-in-england-mathematics-programmes-of-study
 *  3. Union with MATH_Y1_SYLLABUS (same NNS book): the printed range rows
 *     ("zero, one, two, three ... to twenty and beyond", the days of the
 *     week, "third ... tenth ... twentieth") extract as furniture in the
 *     Year-3 block, and the Year-1 curated list restores exactly those
 *     concrete entries (plus the documented Year-1 addendum: quarter(s),
 *     equal, parts, array, minute, second, name, solve — all carried into
 *     Year 3).
 *
 *  Entries are pipe-separated, lowercased; phrases split into parts by the
 *  shared matcher (buildSet). Bank tier (mcq choices, match sides, order
 *  items) must pass this list or stay short enough to be soft; prompts,
 *  hints and truefalse statements are text tier (report-only) but are
 *  covered too so the audit report stays quiet. Hyphenated compounds are
 *  avoided in bank tier (the matcher keeps them as single tokens).
 */

import { MATH_Y1_SYLLABUS } from '../y1/math'

const NNS_Y3 = `abacus|about|about the same as|above|across|add|addition|after|afternoon|all|along|altogether|
|always|am|amount|angle|another way|answer|anti-clockwise|apart|approximate|approximately|around|
|arrange|array|arrow|as many as|ascend|autumn|away from|axes|axis|back|backwards|balance|
|balances|bar chart|bedtime|before|behind|below|bend|beside|best way|between|bigger|biggest|
|birthday|block graph|blocks|bottom|bought|build|buy|calculate|calculation|calculations|calendar|
|capacity|carroll diagram|carry on|centimetre cm|centre|century|change|change over|chart|cheap|
|cheaper|check|choose|circle|circular|clock|clockwise|close|close to|coin|collect|colour|column|
|compare|compass point|complete|cone|container|contains|continue|copy|corner|correct|cost|
|costs less|costs more|count|count back from|count in ones|count in tens|count on from|
|count up to|counters|cross|cube|cubes|cuboid|curved|cylinder|date|day|days of the week|dear|
|decide|deep|depth|descend|describe|describe the pattern|describe the rule|diagonal|diagram|dice|
|die|difference between|different|different way|digit|dinnertime|direction|discuss|
|distance apart between|distance to from|divide|divided by|divided into|division|dominoes|double|
|down|draw|draw a line between|each|earliest|early|east|edge|empty|end|enough|equal groups of|
|equal parts|equal to|equals|equation|estimate|even|evening|every|every other|exact|exactly|
|exchange|explain|explain how you got your answer|explain your method|face|far|fast|faster|
|fastest|february|few|fewer|fewest|fill in|find|find all|find different|finish|first|fit|fives|
|flat|fold|fortnight|forwards|fours|fraction|frequency table|from|front|full|further|furthest|
|give an example of|gram g|graph|greater|greatest|greatest value|grid|group|group in pairs|
|groups of|guess|guess how many|half|half full|half past|half turn|half-kilogram|half-litre|
|half-way between|halve|handling data|hands|heavier lighter|heaviest lightest|heavy light|height|
|hemisphere|hexagon|hexagonal|high|higher|higher and so on|highest and so on|holds|holiday|
|hollow|horizontal|hour|how did you work it out|how long ago how long will it be to|
|how long will it take to|how many|how many are left left over|how many fewer is than|
|how many more is than|how many more to make|how many times|how much how many|how much less is|
|how much more is|how often|hundred square|hundreds|hundreds boundary|imagine|in|
|in a different order|in front|in order|inside|interpret|investigate|
|is a greater smaller angle than|is the same as|join in|join up|jotting|journey|just over|
|just under|kilogram kg|kilometre km|label|larger|largest|last|last but one|late|latest|layer|
|least|least common|least popular|least value|leave|left|left over|length|less|
|less least expensive|line of symmetry|list|listen|litre l|long|longer|longest|look at|lots of|
|low|lower|make|many|map|match|measure|measures|measuring scale|mental calculation|method|
|metre m|metre stick|middle|midnight|mile|millilitre ml|minus|minute|mirror line|missing number|
|money|month|months of the year|more|more most expensive|morning|most|most common|most popular|
|movement|multiple of|multiplication|multiplied by|multiply|name|narrow|near|near double|nearest|
|nearly|never|new|newer|newest|next|next to|night|none|north|not|not enough|note|now|number|
|number bonds|number cards|number facts|number grid|number line|number pairs|number sentence|
|number square|number track|o'clock|octagon|octagonal|odd|often|old|older|oldest|on|once|one|
|one each|one half|one hundred|one hundred less|one hundred more|one less|one more|one quarter|
|one tenth|one third|one thousand|one whole|ones|operation|opposite|order|outside|over|pair|part|
|pattern|pay|peg board|pegs|pence|penny|pentagon|pentagonal|pick out|pictogram|place|place value|
|plan|playtime|plus|pm|point|point to|pointed|position|pound|predict|present|price|prism|product|
|put|puzzle|pyramid|quadrilateral|quarter past|quarter to|quarter turn|question|quick|quicker|
|quickest|quickly|read|rearrange|recite|record|rectangle|rectangular|reflection|relationship|
|remainder|remember|repeat|repeated addition|repeating pattern|represent|represents|right|
|right angle|right-angled|ring|rods|roll|roughly|round|round to the nearest ten|round up or down|
|route|row|rule|ruler|same|same way|say|scales|score|seasons|second|sell|semicircle|separate|
|sequence|set|shade|shallow|shape|shape and space|share|share equally|short|shorter|shortest|
|show how you|show me|show your working|side|sideways|sign|size|sketch|slide|slow|slower|slowest|
|slowly|smaller|smallest|sold|solid|solve|sometimes|soon|sort|south|spend|spent|sphere|split|
|square|stands for|star|start at|start from|start with|straight|straight line|stretch|subtract|
|subtraction|sum|summer|surface|symbol|symmetrical|table|take away|takes less time|takes longer|
|talk about|tall|taller|tallest|tally|tape measure|teens number|tell me|ten|ten less|ten more|
|tens|tens boundary|the same number as|thick|thin|think|three each|three times ten times|threes|
|threes tens|through|tick|time|timer|times|times as big|title|to|today|tomorrow|too few|
|too little|too many|too much|top|total|towards|trace|triangle|triangular|tuesday|twenty-first|
|twenty-second|twice|two|two each|two halves|two hundred|two thirds|twos|under|underneath|units|
|up|use|usually|value|venn diagram|vertex|vertical|vertices|vote|watch|week|weekend|weigh|weighs|
|weight|west|what comes next|what could we try next|whole turn|wide|wide and so on|width|winter|
|work out|worth|write|write in figures|wrong|year|yesterday|zero`

/** Documented addendum — DfE NC 2014 Y3 (see header source 2): the words
 *  the statutory programme of study and its notes name directly, the range
 *  words the NNS Year-3 block prints as ranges (months) and the Roman
 *  numerals the year is taught to read on clock faces. */
const NC_Y3_ADDENDUM = `perimeter|roman numeral|numeral|numerals|equivalent|
denominator|parallel|perpendicular|acute|obtuse|analogue|digital|volume|mass|
millimetre|mm|partition|inverse|scale|leap year|noon|unit|written|properties|
property|january|february|march|april|may|june|july|august|september|october|
november|december|hundredths|i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii`

/** Year-3 maths syllabus: curated NNS Year-3 cumulative list + the DfE Y3
 *  addendum + the curated Year-1 carry-over (range expansions, see header). */
export const MATH_Y3_SYLLABUS: readonly string[] = [...new Set(
  `${NNS_Y3}\n${NC_Y3_ADDENDUM}\n${MATH_Y1_SYLLABUS.join('|')}`.split(/[|\n]/)
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean),
)]

/** Proper nouns / mascots / story words that legitimately appear in maths
 *  prompts but are not curriculum vocabulary (mirrors the Year-1 tolerance). */
export const MATH_Y3_TOLERANCE: readonly string[] = [
  'sonic', 'tails', 'knuckles', 'amy', 'shadow', 'silver', 'cream', 'blaze',
  'rouge', 'metal', 'eggman', 'momo', 'chao', 'robot', 'badnik',
  'giraffe', 'paperclip',
]
