/** Year-4 SYLLABUS — Science vocabulary, EXTRACTED FROM REAL OFFICIAL
 *  SOURCES (PLAN 169h).
 *
 *  Sources (extracted 2026-09-30; the verbatim Year-4 text lives in
 *  .firecrawl/nc-science.md plus the fetched gov.uk programme of study):
 *  1. DfE National curriculum in England: science programmes of study
 *     (2014, updated 6 May 2015) — the statutory "Year 4 programme of
 *     study":
 *     - Living things and their habitats (recognise living things can be
 *       grouped in a variety of ways; explore and use classification keys
 *       to group, identify and name living things in the local and wider
 *       environment; recognise environments can change and that this can
 *       sometimes pose dangers to living things).
 *     - Animals, including humans (simple functions of the basic parts of
 *       the digestive system in humans; different types of teeth and their
 *       simple functions; construct and interpret food chains, identifying
 *       producers, predators and prey).
 *     - States of matter (group solids, liquids or gases; observe change
 *       of state when heated or cooled and measure/research the
 *       temperature in degrees Celsius; the part played by evaporation
 *       and condensation in the water cycle, associating the rate of
 *       evaporation with temperature).
 *     - Sound (sounds made by something vibrating; vibrations travel
 *       through a medium to the ear; patterns between pitch and the
 *       object's features; patterns between volume and strength of
 *       vibration; sounds get fainter as distance from the source
 *       increases).
 *     - Electricity (common appliances that run on electricity; simple
 *       series circuits naming cells, wires, bulbs, switches and buzzers;
 *       a lamp lights only in a complete loop with a battery; a switch
 *       opens and closes a circuit; common conductors and insulators,
 *       metals being good conductors).
 *     https://www.gov.uk/government/publications/national-curriculum-in-england-science-programmes-of-study/national-curriculum-in-england-science-programmes-of-study
 *  2. The Lower Key Stage 2 non-statutory notes and guidance in the same
 *     document — vertebrate groups (fish, amphibians, reptiles, birds,
 *     mammals) and invertebrates (snails, slugs, worms, spiders,
 *     insects), flowering and non-flowering plants (ferns, mosses),
 *     human impact examples (nature reserves, ecologically planned parks,
 *     garden ponds vs population, development, litter, deforestation),
 *     digestive body parts (mouth, tongue, teeth, oesophagus, stomach,
 *     small and large intestine), carnivore/herbivore teeth comparison,
 *     state descriptions (solids hold their shape; liquids form a pool not
 *     a pile; gases escape from an unsealed container), chocolate/butter/
 *     cream melting, puddle evaporation and snowman melting, sound made
 *     through vibration in musical instruments, and pictorial circuits.
 *  3. Ordinary Year-4 science reading vocabulary carried over from the
 *     earlier years — SCIENCE_Y3_SYLLABUS (which itself chains
 *     SCIENCE_Y1_SYLLABUS and the shared Stage-2 SCIENCE_SYLLABUS) —
 *     because Lower Key Stage 2 assumes the base is secured (union
 *     wording mirrors PLAN 169d's english and 169e's science extractions).
 *
 *  Entries are pipe-separated, lowercased; phrases split into parts by the
 *  shared matcher (buildSet). Bank tier (mcq choices, match sides, order
 *  items) must pass this list or stay short enough to be soft; prompts,
 *  hints, truefalse statements, speak targets and teach lines are text tier
 *  (report-only) but are covered too so the audit report stays quiet.
 */
import { SCIENCE_Y3_SYLLABUS } from '../y3/science'

/** NC Year 4 — Living things and their habitats: grouping in a variety of
 *  ways, classification keys, and changing/dangerous environments. */
const LIVING_RAW = `living|things|group|groups|grouped|grouping|variety|ways|
classify|classification|classifying|identify|identified|identifying|key|keys|
guide|guides|environment|environments|local|wider|change|changes|changed|
changing|recognise|recognize|danger|dangers|pose|posed|threat|threats|
vertebrate|vertebrates|fish|amphibian|amphibians|reptile|reptiles|bird|birds|
mammal|mammals|backbone|backbones|spine|invertebrate|invertebrates|snail|
snails|slug|slugs|worm|worms|spider|spiders|insect|insects|leg|legs|
flowering|non-flowering|fern|ferns|moss|mosses|grass|grasses|plant|plants|animal|animals|
cabbage|
name|named|naming|sort|sorted|sorting|sorts|feature|features|body|bodies|
human|impact|positive|negative|nature|reserve|reserves|park|parks|pond|
ponds|garden|gardens|population|development|litter|deforestation|cut|cattle|
protect|protected|protection|destroy|destroyed|damage|damaged|hurt|pollution|
pollute|care|cares|cared|habitat|habitats|river|rivers|woodland|forest|
forests|sea|seas|lake|lakes|field|fields|hill|hills|study|studied|observe|
observed|throughout|season|seasons|weather|wider|wider environment|notice|
noticed|dangerous|rare|common|species|count|counts|record|records|area|areas`

/** NC Year 4 — Animals, including humans: digestive-system parts and
 *  functions, types of teeth and their functions. */
const DIGESTIVE_RAW = `digestion|digestive|system|systems|mouth|tongue|
teeth|tooth|incisor|incisors|canine|canines|premolar|premolars|molar|molars|
oesophagus|gullet|stomach|intestine|intestines|small|large|gut|tube|tubes|
swallow|swallowed|swallowing|chew|chewing|chewed|chews|grind|grinds|
grinding|bite|biting|bites|tear|tears|tearing|ripping|saliva|drink|drinking|
food|foods|eat|eaten|eating|part|parts|function|functions|job|jobs|simple|
help|helps|hold|holds|protect|protection|decay|decayed|decays|plaque|brush|
brushing|dentist|dental|clean|cleans|sugar|sweets|sweet|healthy|health|
bite|sharp|pointed|flat|grinding front|herbivore|herbivores|carnivore|
carnivores|omnivore|omnivores|meat|plants|grass|journey|trip|start|starts|
next|then|order|begin|begins|broken down|nutrients|nourish`

/** NC Year 4 — food chains: producers, predators and prey. */
const CHAIN_RAW = `chain|chains|producer|producers|predator|predators|prey|
grass|leaf|leaves|seed|seeds|eat|eats|eaten|hunted|hunter|energy|transfer|
transferred|flow|flows|passed|sun|sunlight|mouse|mice|rat|rats| rabbit|
rabbits|fox|foxes|snake|snakes|hawk|hawks|owl|owls|eagle|eagles|frog|frogs|
fly|flies|worm|worms|badger|badgers|deer|cow|cows|sheep|lamb|lambs|
tadpole|tadpoles|smaller|bigger|tiny|larger|links|link|chain|arrow|arrows|
points|point|starts|first|reads|reading|follow|follows|following|
caterpillar|caterpillars|thrush|heron|locust`

/** NC Year 4 — States of matter: solids, liquids and gases; change of
 *  state when heated or cooled; evaporation, condensation and the water
 *  cycle. */
const STATES_RAW = `solid|solids|liquid|liquids|gas|gases|state|states|
matter|shape|hold|holds|pool|pile|escape|escapes|escaping|container|
sealed|unsealed|heat|heated|heating|hot|warm|cool|cooled|cooling|cold|
freeze|freezes|freezing|frozen|ice|melt|melts|melting|melted|steam|boil|
boils|boiling|boiled|water|vapour|vapor|temperature|degree|degrees|
celsius|measure|measured|measuring|evaporation|evaporate|evaporates|
evaporated|drying|dry|dries|dried|condensation|condense|condenses|
condensed|cloud|clouds|rain|rains|rainy|puddle|puddles|washing|clothes|
snow|snowman|snowmen|line|days|wet|moisture|air|sunny|warmth|thermometer|
chocolate|butter|cream|oxygen|liquid|absent|become|becomes|became|stay|
stays|stayed|remain|remains|takes|taking|enough|cool air|gas|bubbles|bubble`

/** NC Year 4 — Sound: vibrations, travel to the ear, pitch and volume
 *  patterns, and sounds getting fainter with distance. */
const SOUND_RAW = `sound|sounds|vibrate|vibrates|vibrating|vibration|
vibrations|make|makes|made|object|objects|string|strings|drum|drums|bell|
bells|piano|guitar|flute|xylophone|ruler|desk|paper|elastic|band|bands|
bottle|cap|tissue|envelope|travel|travels|travelling|traveling|travelled|medium|ear|
ears|hear|hearing|heard|pitch|higher|lower|volume|loud|louder|quiet|
quieter|fainter|faint|weak|strength|strong|stronger|distance|farther|
further|away|source|sources|patterns|feature|bigger|smaller|thick|thicker|
thin|thinner|tight|tighter|loose|looser|faster|slower|musical|instrument|
instruments|play|plays|playing|note|notes|tune|squeak|buzz|hum|humming|
shout|shouting|whisper|twang|beat|beats|jingle|ring|rings|scratch|scrape|
blow|blows|hummed|ear drum|ear drums|eardrum|air|shakes|shake|shaking|
shrill|deep|sharper|still|silence|silent|noisy|noise|noises|listen|listens|
listening|hear sounds|produced|producer of sound`

/** NC Year 4 — Electricity: appliances, simple series circuits, complete
 *  loops, switches, conductors and insulators. */
const ELECTRIC_RAW = `electricity|electric|appliance|appliances|circuit|
circuits|series|cell|cells|wire|wires|bulb|bulbs|lamp|lamps|switch|
switches|buzzer|buzzers|battery|batteries|motor|motors|complete|loop|part|
parts|light|lights|lit|bright|brighter|dim|open|opens|opened|close|closes|
closed|conductor|conductors|insulator|insulators|metal|metals|plastic|
wood|flow|flows|current|voltage|safe|safety|danger|dangerous|touch|touches|
connect|connected|connection|connections|power|powers|torch|radio|fridge|
computer|television|kettle|hairdryer|fan|screen|button|plug|plugs|socket|
sockets|charge|charges|works|working|run|runs|running|need|needs|energy|
electron|electrons|terminal|terminals|holder|holders|glass|ceramic|rubber|
paper|dry|broken|break|breaks|complete the circuit|loop of wire|path|paths`

/** Cross-cutting Year-4 science language used across every block (the
 *  shared LKS2 enquiry vocabulary arrives via the Y3 union below). */
const COMMON_RAW = `happen|happens|happened|notice|noticed|become|turns|
turning|turn|stay|stays|stayed|remain|remains|journey|trip|path|passes|
pass|passing|inside|outside|through|along|across|whole|piece|pieces|bit|
bits|broken|useful|uses|used|held|holds|holds its shape|form|forms|formed|
makes sense|called|calls|named after|means|mean|real|really|true|fact|
facts|idea|ideas|way|ways|right|wrong|best|good|better|every|each|only|
very|often|sometimes|always|never|again|another|other|others|same|next|
first|last|end|finally|so|because|since|while|before|after|during|until|
example|examples|for instance|such as|include|includes|also|too|still|
yet|just|almost|enough|plenty|a lot|little|few|many|more|less|most|least|
favourite|brightest|quietest|millilitre|millilitres`

/** Names + domain labels that legitimately appear in Year-4 science lessons
 *  without being programme-of-study vocabulary: mascots, site characters,
 *  first names inside sentences, group labels the sort/match drills print,
 *  and the intentional near-miss spellings the drills choose as wrong
 *  answers (PLAN 169h). The Y3 set is carried over because Year 4 revisits
 *  the same Lower-Key-Stage-2 enquiry practice. */
export const SCIENCE_Y4_TOLERANCE: readonly string[] = [
  ...new Set([
    'sonic', 'tails', 'knuckles', 'amy', 'shadow', 'silver', 'cream', 'blaze',
    'rouge', 'metal', 'eggman', 'momo', 'chao', 'robot', 'badnik', 'felix',
    'franzi',
    // first names that appear inside Y4 science prompts and teach lines
    'mia', 'ben', 'sam', 'nina', 'kim', 'pip', 'tam', 'bob', 'tom', 'dan',
    'lucy', 'jack', 'emma', 'leo', 'ruby', 'omar', 'zara', 'hassan',
    // group labels the classification / chain drills print on the buttons
    'non', 'living', 'not', 'backbones', 'no backbone', 'has bones', 'bones',
    'producer', 'predator', 'prey', 'eats', 'eaten by',
    // intentional near-miss spellings the drills choose as wrong answers
    'classifiction', 'clasification', 'vertebrats', 'vertebrates', 'mamals',
    'amfibian', 'amphibia', 'reptils', 'invertebrats', 'spidas', 'snails and slugs',
    'dijestiv', 'digestiv', 'oesofagus', 'oesophogus', 'stomch', 'intestin',
    'incisors', 'molarz', 'cavitee', 'saliva', 'chewd', 'nutriments',
    'produser', 'preditor', 'pray', 'enargy', 'tadpol',
    'liqwid', 'gass', 'solidz', 'evaporason', 'condensasion', 'celcius',
    'temprature', 'tempratur', 'vapor', 'snowman melts', 'puddle evaporates',
    'vibrashon', 'vibraiting', 'pich', 'voloum', 'xilophone', 'gitar',
    'finter', 'faintest', 'loudest', 'eardrums',
    'circut', 'syrcuit', 'conductar', 'insulater', 'buzer', 'swich', 'batery',
    'wier', 'wireing', 'lamp lit', 'lamps lit', 'cells',
  ]),
]

/** Union of the six program-of-study-derived lists above plus the carried
 *  Key Stage 1 / Stage 2 + Year-3 base (normalized at load; every part of
 *  a phrase is a separate entry, like buildSet). */
export const SCIENCE_Y4_SYLLABUS: readonly string[] = [...new Set(
  `${LIVING_RAW}\n${DIGESTIVE_RAW}\n${CHAIN_RAW}\n${STATES_RAW}\n${SOUND_RAW}\n${ELECTRIC_RAW}\n${COMMON_RAW}`
    .split(/[|\n]/)
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean)
    .concat(SCIENCE_Y3_SYLLABUS),
)]
