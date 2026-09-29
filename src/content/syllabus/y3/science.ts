/** Year-3 SYLLABUS — Science vocabulary, EXTRACTED FROM REAL OFFICIAL
 *  SOURCES (PLAN 169e).
 *
 *  Sources (extracted 2026-09-30; see .firecrawl/nc-science.md for the
 *  verbatim extraction):
 *  1. DfE National curriculum in England: science programmes of study
 *     (2014, updated 6 May 2015) — the statutory "Year 3 programme of
 *     study": Plants (functions of roots/stem/trunk/leaves/flowers; air,
 *     light, water, nutrients from soil and room to grow; water transport
 *     up the stem; pollination, seed formation, seed dispersal), Animals
 *     including humans (right types and amount of nutrition, animals
 *     cannot make their own food; skeletons and muscles for support,
 *     protection and movement), Rocks (grouping by appearance and simple
 *     physical properties; fossils trapped within rock; soils from rocks
 *     and organic matter), Light (need light to see, dark is the absence
 *     of light; reflection from surfaces; sun safety; shadows form when
 *     an opaque object blocks a light source; shadow-size patterns),
 *     Forces and magnets (movement on different surfaces; contact vs
 *     acting at a distance; attract/repel; magnetic materials; 2 poles)
 *     — plus the Lower Key Stage 2 "Working scientifically" methods list
 *     (relevant questions, practical enquiries and fair tests, systematic
 *     observation and accurate measurement with standard units,
 *     thermometers and data loggers, gathering/recording/classifying/
 *     presenting data, labelled diagrams/keys/bar charts/tables, oral and
 *     written reporting, simple conclusions and predictions for new
 *     values, improvements, differences/similarities/changes, straightforward
 *     evidence).
 *     https://www.gov.uk/government/publications/national-curriculum-in-england-science-programmes-of-study/national-curriculum-in-england-science-programmes-of-study
 *  2. The Lower Key Stage 2 non-statutory notes and guidance in the same
 *     document — structure-and-function framing ("every part has a job"),
 *     the white-carnation-in-coloured-water demonstration, fruit structure
 *     and dispersal patterns, main body parts associated with skeleton and
 *     muscles, animals with and without skeletons, food groups and designing
 *     meals, rocks in buildings and gravestones, grains/crystals/fossils,
 *     sedimentary rock, mirror and reflective surfaces, shadow measurement
 *     and light-source distance, bar/ring/button/horseshoe magnets,
 *     everyday magnetic items, and how far things move on different
 *     surfaces.
 *  3. Ordinary Year-3 science reading vocabulary carried over from the
 *     earlier years — SCIENCE_Y1_SYLLABUS (PLAN 169b) and the shared
 *     SCIENCE_SYLLABUS (Year-2, Cambridge Stage 2) are unioned in below,
 *     because Lower Key Stage 2 assumes the Key Stage 1 / Stage 2 base is
 *     secured (revision wording mirrors PLAN 169d's english union).
 *
 *  Entries are pipe-separated, lowercased; phrases split into parts by the
 *  shared matcher (buildSet). Bank tier (mcq choices, match sides, order
 *  items) must pass this list or stay short enough to be soft; prompts,
 *  hints, truefalse statements, speak targets and teach lines are text tier
 *  (report-only) but are covered too so the audit report stays quiet.
 */
import { SCIENCE_SYLLABUS } from '../science'
import { SCIENCE_Y1_SYLLABUS } from '../y1/science'

/** NC Year 3 — Plants: parts and their functions, requirements for life and
 *  growth, water transport, and the flower's role in the life cycle. */
const PLANTS_RAW = `flower|flowers|flowering|root|roots|stem|stems|trunk|
trunks|leaf|leaves|tree|trees|part|parts|function|functions|job|jobs|air|
light|water|nutrient|nutrients|soil|growth|grow|grows|growing|room|food|
making|transport|support|held|nutrition|reproduction|reproduce|pollination|
pollen|nectar|seed|seeds|formation|disperse|dispersal|fruit|fruits|
fertiliser|carnation|coloured|absorb|absorbs|bud|buds|petal|petals|
shade|warmth|temperature|sugar|stored|store|needs|needed|requirement|
requirements|vary|varies|cactus|cacti|fertiliser|fertilisers|male|female|
fertilisation|sprout|sprouts`

/** NC Year 3 — Animals, including humans: nutrition types and amounts,
 *  skeletons and muscles for support, protection and movement. */
const ANIMALS_RAW = `animal|animals|human|humans|nutrition|type|types|amount|
amounts|right|correct|food|foods|eat|eaten|diet|diets|carbohydrate|protein|
fat|fats|vitamin|vitamins|mineral|minerals|sugar|oil|milk|cheese|bread|
cereal|pasta|rice|potato|potatoes|vegetable|vegetables|meat|fish|egg|eggs|
healthy|health|balance|balanced|energy|skeleton|skeletons|bone|bones|
muscle|muscles|support|protect|protection|movement|move|moves|moved|spine|
skull|ribs|rib|joint|joints|shoulder|chest|back|arm|arms|leg|legs|body|
bodies|strong|flexible|without|snail|worm|jellyfish|starfish|slither|
slithers|swim|swims|hunch|hunched|bend|bends|straighten|pulls`

/** NC Year 3 — Rocks: grouping by appearance and physical properties,
 *  fossils trapped within rock, soils from rocks and organic matter. */
const ROCKS_RAW = `rock|rocks|stone|stones|pebble|pebbles|granite|sandstone|
limestone|slate|chalk|clay|flint|soil|soils|organic|matter|fossil|fossils|
sedimentary|igneous|metamorphic|grain|grains|crystal|crystals|gravestone|
gravestones|building|buildings|appearance|properties|hardness|rough|smooth|
shiny|dull|heavy|trap|trapped|traps|remains|died|buried|layer|layers|mud|
sand|sea|press|squeezed|swirl|rubbish|dead|leaves|plants|bits|form|formed`

/** NC Year 3 — Light: seeing, dark as absence of light, reflection, sun
 *  safety, shadows from blocked light, and shadow-size patterns. */
const LIGHT_RAW = `light|lights|dark|darkness|see|seen|seeing|absence|reflect|
reflection|reflected|reflective|surface|surfaces|mirror|mirrors|sun|sunny|
dangerous|danger|protect|protection|eye|eyes|glasses|shadow|shadows|formed|
block|blocked|blocking|blocks|opaque|transparent|source|sources|beam|beams|
bright|brightness|dim|torch|lamp|candle|window|size|bigger|smaller|
distance|near|far|moved|pattern|patterns|glow|shades|hide|hides`

/** NC Year 3 — Forces and magnets: movement on surfaces, contact vs acting
 *  at a distance, attract/repel, magnetic materials, two poles. */
const FORCES_RAW = `force|forces|push|pushes|pushing|pull|pulls|pulling|magnet|
magnets|magnetic|pole|poles|north|south|attract|attracts|attracted|
attraction|repel|repels|repelled|contact|distance|surface|surfaces|slide|
sliding|roll|rolling|moving|further|friction|rough|smooth|ice|iron|steel|
nickel|cobalt|metal|metals|material|materials|bar|ring|button|horseshoe|
strength|strong|weak|clip|clips|paper|rug|carpet|grass|floor|door|swing|
objects|pair|two|wheels|axle|toy|car|trolley|boat|sled|sledge|skate`

/** LKS2 working scientifically — methods, equipment, recording, reporting
 *  and drawing conclusions. */
const ENQUIRY_RAW = `question|questions|relevant|enquiry|enquiries|ask|
asking|answer|answers|investigation|investigations|investigate|practical|
comparative|comparison|fair|test|tests|testing|observe|observation|
observations|systematic|careful|accurate|accurately|measurement|measure|
measured|measuring|standard|unit|units|thermometer|temperature|data|
logger|loggers|equipment|gather|gathering|record|records|recording|
classified|classifying|presenting|drawing|drawings|diagram|diagrams|label|
labelled|labels|key|keys|chart|charts|table|tables|oral|written|
explanation|explanations|display|displays|presentation|presentations|
result|results|conclusion|conclusions|prediction|predictions|predict|
value|values|improvement|improvements|further|identify|identifying|
differences|similarities|evidence|straightforward|secondary|sources|notes|
findings|finding|scientific|science|scientist|scientists|idea|ideas|
process|processes|method|methods|skill|skills|repeat|repeated|repeats|
ruler|magnifier|lens|seconds|minutes|metres|centimetres|litres|grams`

/** Cross-cutting KS2 science language used across every Year-3 block. */
const COMMON_RAW = `change|changes|changed|similar|different|same|group|groups|
grouped|sort|sorted|order|pattern|compare|compared|reason|reasons|
example|examples|everyday|nature|natural|environment|world|alive|
clock|clocks|degree|degrees|sentence|sentences|count|counts|row|rows|
name|names|every|long|short|slow|slows|fast|quick|stop|stops|help|helps|
day|days|hour|hours|big|small|tall|high|low|wet|dry|cold|warm|pass|
passes|through|away|inside|outside|up|down|open|opens|hold|holds|keep|
keeps|make|makes|give|gives|carry|carries|turn|turns|walk|walks|run|runs|
straight|write|writes|guess|close|closer|travel|travels|catch|catches|
fern|dandelion|dandelions|coconut|coconuts|float|floats|fur|stick|sticks|
banana|breakfast|breakfasts|herbivore|herbivores|carnivore|carnivores|
omnivore|omnivores|brain|elbow|elbows|fin|fins|wear|wears|hurt|damage|
bounce|bounces|brighter|compass|fridge|support|spends|uses|everything|
anything|everyone|someone|between|take|takes|stretch|stretches|thing|
things|simple|physical|classify|both|again|safe|solid|shape|coat|week|
weeks|soon|depend|depends|longest|shortest|word|words|line|lines`

/** Names + domain labels that legitimately appear in Year-3 science lessons
 *  without being programme-of-study vocabulary: mascots, site characters,
 *  first names inside sentences, group labels the sort/match drills print,
 *  and the intentional near-miss spellings the drills choose as wrong
 *  answers (PLAN 169e). */
export const SCIENCE_Y3_TOLERANCE: readonly string[] = [
  ...new Set([
    'sonic', 'tails', 'knuckles', 'amy', 'shadow', 'silver', 'cream', 'blaze',
    'rouge', 'metal', 'eggman', 'momo', 'chao', 'robot', 'badnik', 'felix',
    'franzi',
    // first names that appear inside Y3 science prompts and teach lines
    'mia', 'ben', 'sam', 'nina', 'kim', 'pip', 'tam', 'bob', 'tom', 'dan',
    'lucy', 'jack', 'emma', 'leo', 'ruby', 'omar', 'zara', 'hassan',
    // group labels the classification drills print on the buttons
    'non', 'living', 'not', 'magnetic', 'nonmagnetic',
    // intentional near-miss spellings the drills choose as wrong answers
    'seperate', 'recieve', 'grammer', 'fossel', 'fossile', 'sedmentary',
    'samondary', 'abscence', 'abscense', 'reflekt', 'reflexion', 'sheadow',
    'shaddow', 'oppaqe', 'transparant', 'magentic', 'magntic', 'attractted',
    'repells', 'polez', 'sceleton', 'skelaton', 'muscls', 'nutriant',
    'nutriments', 'pollenation', 'pollynation', 'despersal', 'desperse',
    'growith', 'requirment', 'fertiliserz', 'predicion', 'equpment',
    'scienist', 'experement', 'compair', 'mesurement', 'tabel', 'diagramm',
    'thermometor', 'conculsion', 'improvment', 'obervation', 'clasify',
    'grup', 'diference', 'similer', 'wether', 'sunburnt',
  ]),
]

/** Union of the six program-of-study-derived lists above plus the carried
 *  Key Stage 1 / Stage 2 base (normalized at load; every part of a phrase
 *  is a separate entry, like buildSet). */
export const SCIENCE_Y3_SYLLABUS: readonly string[] = [...new Set(
  `${PLANTS_RAW}\n${ANIMALS_RAW}\n${ROCKS_RAW}\n${LIGHT_RAW}\n${FORCES_RAW}\n${ENQUIRY_RAW}\n${COMMON_RAW}`
    .split(/[|\n]/)
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean)
    .concat(SCIENCE_Y1_SYLLABUS, SCIENCE_SYLLABUS),
)]
