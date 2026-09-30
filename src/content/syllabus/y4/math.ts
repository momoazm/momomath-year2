/** Year-4 SYLLABUS — maths vocabulary for the Year-4 maths rollout
 *  (PLAN 169f).
 *
 *  Sources (extracted 2026-09-30):
 *  1. "Mathematical vocabulary" — National Numeracy Strategy / Framework
 *     for Teaching Mathematics, year-group vocabulary checklists
 *     (Reception-Y6), DfES 0313/2000, Standards and Effectiveness Unit,
 *     Open Government Licence.
 *     https://dera.ioe.ac.uk/id/eprint/5248/2/nns_mathvocab031300.pdf
 *     The Year-4 checklist is the CUMULATIVE Reception-Year-4 list (the
 *     book prints each year as everything before plus the words new that
 *     year), taken from the "YEAR 4" pages (PDF pp. 24-27): numbers &
 *     number system, calculations, measures, shape/space, solving problems
 *     and the instruction vocabulary. Extracted from the DERA text layer
 *     (nns_text.txt) block between the PAGE 24 (YEAR 4) and PAGE 28 (YEAR
 *     5) markers, then curated: page furniture, strand headers and
 *     extraction artifacts dropped; merged cells split ("days of the week
 *     monday" -> "days of the week", "digital analogue clock watch" ->
 *     "digital|analogue", the range row "one ten one hundred one thousand
 *     more less" -> the new "one thousand more/less" entries).
 *  2. DfE National curriculum in England: mathematics programmes of study,
 *     key stages 1 and 2 (2014) — the statutory Year-4 programme of study
 *     (count in multiples of 6, 7, 9, 25 and 1,000; 1,000 more or less;
 *     four-digit place value, rounding to 10/100/1,000, Roman numerals to
 *     100 and negative numbers; columnar addition and subtraction to 4
 *     digits with estimating and inverse checks; tables to 12x12, factor
 *     pairs, commutativity, short multiplication and short division, the
 *     distributive law and correspondence problems; families of equivalent
 *     fractions, hundredths, decimal equivalents, dividing by 10 and 100,
 *     rounding and comparing decimals; converting units, the perimeter of
 *     rectilinear figures, area by counting squares, money and 24-hour
 *     time; classifying triangles (isosceles, equilateral, scalene) and
 *     quadrilaterals (parallelogram, rhombus, trapezium), acute/obtuse
 *     angles, lines of symmetry, coordinates and translations; discrete
 *     and continuous data with bar charts and time graphs). The addendum
 *     below also lists the Roman numerals the year reads to C.
 *     https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study/national-curriculum-in-england-mathematics-programmes-of-study
 *  3. Union with MATH_Y3_SYLLABUS (PLAN 169c): the printed Year-3 list
 *     carries the curated Reception-Year-3 NNS block and the DfE Y3
 *     addendum, so earlier-year vocabulary (months of the year, days of
 *     the week, "third ... tenth ... twentieth", denominator, hundredths,
 *     numeral I to XII, ...) stays accepted for Year 4 too.
 *
 *  Entries are pipe-separated, lowercased; phrases split into parts by the
 *  shared matcher (buildSet). Bank tier (mcq choices, match sides, order
 *  items) must pass this list or stay short enough to be soft; prompts,
 *  hints and truefalse statements are text tier (report-only) but are
 *  covered too so the audit report stays quiet. Hyphenated compounds are
 *  avoided in bank tier (the matcher keeps them as single tokens).
 */

import { MATH_Y3_SYLLABUS } from '../y3/math'

const NNS_Y4 = `2d|3d|abacus|about|about the same as|above|above below zero|across|add|addition|after|afternoon|
all|along|altogether|always|am|amount|analogue|angle|angle measurer|another way|answer|
anti-clockwise|apart|approximate|approximately|area|around|arrange|array|arrive|arrow|as many as|
ascend|autumn|away from|axes|axis|back|backwards|balance|balances|bar chart|base|before|behind|
below|bend|beside|best way|between|bigger|bigger than|biggest|birthday|block graph|blocks|bottom|
bought|breadth|build|buy|calculate|calculation|calculations|calendar|capacity|carroll diagram|
carry on|centimetre cm|centre|century|change|change over|chart|cheap|cheaper|check|choose|circle|
circular|classify|clock|clockwise|close|close to|closed|coin|collect|colour|column|compare|
compass point|compasses|complete|concave|cone|consecutive|construct|container|contains|continue|
convex|coordinates|copy|corner|correct|cost|costs less|costs more|count|counters|covers|cross|
cube|cubes|cuboid|curved|cylinder|cylindrical|data|date|date of birth|day|days of the week|dear|
decide|decimal|decimal fraction|decimal place|decimal point|decrease|deep|degree|depart|depth|
descend|describe|describe the pattern|describe the rule|diagonal|diagram|diameter|dice|die|
difference between|different|different way|digit|digital|direction|discuss|
distance apart between|distance to from|divide|divided by|divided into|divisible by|division|
dominoes|double|down|draw|draw a line between|each|earliest|early|east|edge|eighth|empty|end|
enough|equal groups of|equal parts|equal to|equals|equation|equilateral triangle|estimate|even|
evening|every|every other|exact|exactly|exchange|explain|explain how you got your answer|
explain your method|face|factor|far|fast|faster|fastest|february|fewer than|fewest|fifth|fill in|
find|find all|find different|finish|flat|fold|for every|fortnight|forwards|fraction|
frequency table|from|front|full|further|furthest|geo-strips|give an example of|gram g|graph|
greater than|greatest|greatest value|grid|group|group in pairs|groups of|guess|guess how many|
half|half full|half past|half turn|half-kilogram|half-litre|half-way between|halve|handling data|
hands|heavier lighter|heaviest lightest|height|hemi-sphere|heptagon|hexagon|hexagonal|high|
higher|higher and so on|highest and so on|holds|holiday|hollow|horizontal|hour|
how did you work it out|how long ago how long will it be to|how long will it take to|how many|
how many are left left over|how many more to make|how many times|how much how many|how often|
hundred square|hundred thousand|hundreds|hundreds boundary|imagine|imperial unit|in|
in a different order|in every|in front|in order|increase|inside|integer|interpret|inverse|
investigate|irregular|is a greater smaller angle than|is the same as|isosceles triangle|join in|
join up|jotting|journey|just over|just under|justify|kilogram kg|kilometre km|label|larger|
larger than|largest|last|last but one|late|latest|layer|leap year|least|least common|
least popular|least value|leave|left|length|less least expensive|less than|line|line of symmetry|
line symmetry|list|listen|litre l|long|longer|longest|look at|lots of|low|lower|make|
make a statement|map|mass|match|measure|measurement|measures|measuring cylinder|measuring scale|
mental calculation|method|metre m|metre stick|metric unit|middle|midnight|mile|millennium|
millilitre ml|millimetre mm|million|minus|minute|mirror line|money|month|months of the year|more|
more most expensive|more than|morning|most|most common|most popular|movement|multiple of|
multiplication|multiplied by|multiply|name|narrow|near|near double|nearest|nearly|negative|net|
never|new|newer|newest|next|next to|night|noon|north|north-east|north-west|not|not enough|note|
now|number|number bonds|number cards|number facts|number grid|number line|number pairs|
number sentence|number square|number track|numeral|oblong|octagon|octagonal|odd|often|old|older|
oldest|on|once|one|one each|one thousand less|one thousand more|one whole|ones|open|operation|
opposite|order|origin|outside|over|o’clock|pair|part|pattern|pay|peg board|pegs|pence|penny|
pentagon|pentagonal|perimeter|pick out|pictogram|pin board|pint|place|place value|plan|plot|plus|
pm|point|point to|pointed|polygon|polyhedron|position|positive|pound|predict|present|price|prism|
product|property|proportion|put|puzzle|pyramid|quadrilateral|quarter|quarter past|quarter to|
quarter turn|question|questionnaire|quick|quicker|quickest|quickly|quotient|radius|read|
rearrange|recite|record|rectangle|rectangular|reflect|reflection|regular|relationship|remainder|
remember|repeat|repeated addition|repeating pattern|represent|represents|right|right angle|
right-angled|ring|rods|roll|rotate|roughly|round|round to the nearest hundred|
round to the nearest ten|round up or down|route|row|rule|ruler|same|same way|say|scales|score|
seasons|second|sell|semi-circle|separate|sequence|set|set square|shade|shallow|shape|
shape and space|share|share equally|short|shorter|shortest|show how you|show me|
show your working|side|sideways|sign|sixth|size|sketch|slide|slow|slower|slowest|slowly|small|
smaller|smaller than|smallest|sold|solid|solve|sometimes|soon|sort|south|south-east|south-west|
spend|spent|sphere|spherical|split|square|square centimetre cm 2|standard unit|stands for|
start at|start from|start with|straight|straight line|stretch|subtract|subtraction|sum|summer|
surface|survey|symbol|symmetrical|table|take away|takes less time|takes longer|talk about|tall|
taller|tallest|tally|tally chart|tape measure|tell me|ten thousand|tens|tens boundary|tenth|
tetrahedron|the same number as|thick|thin|think|third|thousands|three each|three times ten times|
three-dimensional|threes tens|through|tick|time|timer|times|times as big|timetable|title|to|
today|tomorrow|too few|too little|too many|too much|top|total|towards|trace|translation|triangle|
triangular|tuesday|twentieth|twice|two|two each|two-dimensional|under|underneath|unit|units|up|
use|usually|value|venn diagram|vertex|vertical|vertices|vote|watch|week|weekend|weigh|weighs|
what could we try next|whole turn|wide|wide and so on|width|winter|work out|worth|write|
write in figures|wrong|year|yesterday|`

/** Documented addendum — DfE NC 2014 Y4 (see header source 2): the words
 *  the statutory programme and its notes name directly, the measurement and
 *  statistics vocabulary the year adds, and the Roman numerals beyond XII
 *  (I to C) the year is taught to read. */
const NC_Y4_ADDENDUM = `round to the nearest thousand|one thousand more|one thousand less|common factor|common multiple|numerator|tenths|degrees|convert|conversion|discrete|continuous|time graph|earlier|later|scalene|parallelogram|rhombus|trapezium|coordinate|quadrant|rectilinear|columnar|commutativity|commutative|correspondence|estimation|distributive|scaling|symmetric|xiii|xiv|xv|xvi|xvii|xviii|xix|xx|xxiv|xxx|xl|l|lx|lxx|lxxx|xc|xcv|c`

/** Year-4 maths syllabus: curated NNS Year-4 cumulative list + the DfE Y4
 *  addendum + the curated Year-3 carry-over (see header). */
export const MATH_Y4_SYLLABUS: readonly string[] = [...new Set(
  `${NNS_Y4}\n${NC_Y4_ADDENDUM}\n${MATH_Y3_SYLLABUS.join('|')}`.split(/[|\n]/)
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean),
)]


/** Proper nouns / mascots / story words that legitimately appear in maths
 *  prompts but are not curriculum vocabulary (mirrors the Year-3 tolerance). */
export const MATH_Y4_TOLERANCE: readonly string[] = [
  'sonic', 'tails', 'knuckles', 'amy', 'shadow', 'silver', 'cream', 'blaze',
  'rouge', 'metal', 'eggman', 'momo', 'chao', 'robot', 'badnik',
  'giraffe', 'paperclip',
]
