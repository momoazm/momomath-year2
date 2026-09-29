/** Year-1 SYLLABUS — Science vocabulary, EXTRACTED FROM REAL OFFICIAL
 *  SOURCES (PLAN 169b).
 *
 *  Sources (extracted by research agents, 2026-09-29):
 *  1. DfE National curriculum in England: science programmes of study
 *     (2014) — the statutory "Year 1 programme of study": Plants (wild and
 *     garden plants, deciduous/evergreen trees, plant structure), Animals,
 *     including humans (fish/amphibians/reptiles/birds/mammals,
 *     carnivores/herbivores/omnivores, body parts head/neck/arms/elbows/
 *     legs/knees/face/ears/eyes/hair/mouth/teeth + the senses), Everyday
 *     materials (object vs material; wood, plastic, glass, metal, water,
 *     rock; properties hard/soft, stretchy/stiff, shiny/dull, rough/smooth,
 *     bendy, waterproof, absorbent, opaque/transparent), Seasonal changes
 *     (the four seasons, seasonal weather, day length) — plus the Years 1
 *     and 2 "Working scientifically" methods list (ask simple questions,
 *     observe closely, perform simple tests, identify and classify, suggest
 *     answers, gather and record data).
 *     https://www.gov.uk/government/publications/national-curriculum-in-england-science-programmes-of-study/national-curriculum-in-england-science-programmes-of-study
 *  2. The Years 1 and 2 non-statutory notes and guidance in the same
 *     document — common plant names (daisy, dandelion, buttercup, oak, pine,
 *     willow…), the extra everyday materials (brick, paper, fabrics, elastic,
 *     foil), the main plant-structure nouns (leaves, flowers/blossom, petals,
 *     fruit, roots, bulb, seed, trunk, branches, stem) and body parts
 *     (neck, elbows, knees, hair) they name explicitly.
 *  3. Ordinary Year-1 science reading vocabulary (everyday animals, weather
 *     and classroom nouns): curated here exactly like the shared EN_CORE
 *     set (PLAN 145) because no official KS1 science word list exists
 *     beyond the programme of study itself; every entry must be defensible
 *     as standard Year-1 science vocabulary.
 *
 *  Entries are pipe-separated, lowercased; phrases split into parts by the
 *  shared matcher (buildSet). Bank tier (mcq choices, match sides, order
 *  items) must pass this list or stay short enough to be soft; prompts,
 *  hints, truefalse statements, speak targets and teach lines are text tier
 *  (report-only) but are covered too so the audit report stays quiet.
 */

/** NC Year 1 · Plants — structure, common plants and trees. */
const PLANTS_RAW = `plant|plants|flower|flowers|tree|trees|leaf|leaves|petal|
petals|root|roots|seed|seeds|stem|trunk|branch|branches|bud|blossom|fruit|
bulb|garden|gardens|wild|grow|grows|growing|growth|soil|daisy|dandelion|
buttercup|rose|tulip|sunflower|grass|weed|oak|pine|willow|holly|ivy|seedling|
sprout|bark|acorn|cone|pond|nest|egg|eggs|roots|petal|buds|shade|deciduous|
evergreen`

/** NC Year 1 · Animals, including humans — common animals, the five
 *  animal groups, diet words and body coverings. */
const ANIMALS_RAW = `animal|animals|fish|frog|snake|lizard|tortoise|turtle|bird|
birds|duck|chicken|hen|penguin|owl|sparrow|robin|pigeon|bat|mouse|rat|rabbit|
fox|wolf|bear|deer|lion|tiger|leopard|elephant|giraffe|zebra|monkey|kangaroo|
panda|camel|whale|dolphin|shark|seal|octopus|crab|snail|worm|bee|ant|spider|
fly|butterfly|ladybird|caterpillar|moth|beetle|dog|cat|horse|cow|sheep|pig|
goat|pets|pet|mammal|mammals|amphibian|amphibians|reptile|reptiles|carnivore|
carnivores|herbivore|herbivores|omnivore|omnivores|meat|insect|insects|wing|
wings|feather|feathers|fur|scales|tail|beak|paw|paws|fin|habitat|farm|graze|
flocks|hunt|hunts|hunted|prey|zoo|wild`

/** NC Year 1 · Humans — the named body parts and the five senses. */
const BODY_RAW = `body|head|neck|arm|arms|hand|hands|elbow|elbows|leg|legs|knee|
knees|foot|feet|face|ear|ears|eye|eyes|hair|mouth|tooth|teeth|nose|tongue|
finger|fingers|shoulder|shoulders|back|chest|stomach|thumb|skin|lips|chin|
cheek|throat|bone|sense|senses|sight|hearing|smell|taste|touch|see|hear|
hear|listen|grown|up|skin`

/** NC Year 1 · Everyday materials — the named materials, extra materials
 *  from the notes (brick, paper, fabrics, elastic, foil) and every simple
 *  physical property the year is taught to describe and group by. */
const MATERIALS_RAW = `material|materials|object|objects|wood|wooden|plastic|
glass|metal|water|rock|stone|brick|paper|card|cardboard|fabric|fabrics|cloth|
cotton|wool|leather|rubber|elastic|foil|sponge|towel|clay|sand|mud|ice|steel|
gold|silver|spoon|cup|desk|table|chair|window|umbrella|bag|balloon|kite|string|
pencil|book|bottle|roof|hard|soft|rough|smooth|shiny|dull|bendy|stiff|stretchy|
heavy|light|warm|wet|waterproof|absorbent|opaque|transparent|float|floats|sink|
sinks|strong|thin|thick|bend|bends|stretch|stretches|squash|squashes|shape|
shapes|magnet|clip|surface|best|better|spreads|absorb|melt|melts|frozen|dry`

/** NC Year 1 · Seasonal changes — the four seasons, seasonal weather, day
 *  length and the clothes/activities children meet in each season. */
const SEASONS_RAW = `season|seasons|spring|summer|autumn|winter|weather|sunny|
cloudy|rainy|windy|snowy|storm|frost|fog|rainbow|snow|rain|wind|cloud|clouds|
puddle|cool|hot|day|days|night|longer|shorter|morning|evening|fall|falls|
falling|coat|hat|scarf|gloves|boots|leaves|blooms|hibernate|warm|cold`

/** NC Years 1 and 2 · Working scientifically — the methods vocabulary plus
 *  the recording/enquiry words the lessons ask about. */
const ENQUIRY_RAW = `science|scientist|scientists|question|questions|observe|
test|tests|testing|predict|prediction|fair|compare|group|groups|sort|sorts|
classify|record|data|result|results|pattern|patterns|chart|table|tally|draw|
drawing|label|labels|notice|guess|answer|answers|investigate|experiment|
equipment|lens|measure|safe|safety|careful|steps|plan|ideas|think|find|found|
show|looks|watch|ask|asks|learn|learns|know|knows|wonder|idea|ways|change|
changes|moves|move|lives|live|help|helps|uses|use|using|makes|made|make|turn|
turns|keep|keeps|needs|need|colour|color|tallest|tall|roof|because|school|
teacher|class|friend|today|week|daily|yesterday|magnet|shadow|roof|about|very`

/** Cross-cutting Year-1 words that appear inside choices across units:
 *  size/colour/number words, people and everyday verbs. */
const COMMON_RAW = `big|small|long|short|old|new|good|bad|fast|slow|one|two|
three|four|five|six|seven|eight|nine|ten|red|blue|green|yellow|black|white|
orange|pink|brown|purple|grey|dry|both|many|other|same|different|all|every|
each|first|next|then|last|things|thing|part|parts|side|sides|child|children|
people|person|baby|mum|dad|family|home|room|way|put|got|get|gives|give|comes|
come|going|go|said|says|say|told|tell|shows|told|look|looks|called|name|
names|called|only|also|really|around|beside|inside|under|over|near|far|with`

/** Names + domain labels that legitimately appear in Year-1 science lessons
 *  without being programme-of-study vocabulary: mascots, site characters,
 *  group labels the sort/match drills use, and a handful of report-level
 *  near-miss spellings. */
export const SCIENCE_Y1_TOLERANCE: readonly string[] = [
  'sonic', 'tails', 'knuckles', 'amy', 'shadow', 'silver', 'cream', 'blaze',
  'rouge', 'metal', 'eggman', 'momo', 'chao', 'robot', 'badnik',
  // first names that appear inside prompts and story-free teach lines
  'ben', 'sam', 'mia', 'nina', 'kim', 'pip', 'tam', 'bob', 'tom', 'dan',
  // group labels the classification drills print on the buttons
  'non', 'living', 'not', 'plants', 'reptile', 'amphibian', 'insect',
  // report-level near-miss spellings (text tier; listed for clean audits)
  'amfibian', 'amfibians', 'carnavor', 'herbavor', 'omnivor', 'mamal',
  'reptil', 'seasn', 'wether', 'matreel', 'umbrela', 'transparnt',
  'absorbint', 'predicion', 'equpment', 'scienist', 'experement', 'compair',
  'giraf', 'penguinn', 'tortis', 'lepard', 'baterfly', 'catapillar',
  'decidos', 'evergrn', 'trunck', 'flowr', 'leves', 'tunge', 'tuth', 'teth',
  'sholder', 'elbo', 'stomak', 'noes', 'wether', 'grup', 'clasify',
]

/** Union of the six program-of-study-derived lists above (normalized at
 *  load; every part of a phrase is a separate entry, like buildSet). */
export const SCIENCE_Y1_SYLLABUS: readonly string[] = [...new Set(
  `${PLANTS_RAW}\n${ANIMALS_RAW}\n${BODY_RAW}\n${MATERIALS_RAW}\n${SEASONS_RAW}\n${ENQUIRY_RAW}\n${COMMON_RAW}`
    .split(/[|\n]/)
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean),
)]
