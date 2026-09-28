/** Year-2 SYLLABUS — Science vocabulary, EXTRACTED FROM REAL PUBLISHED
 *  CURRICULA (PLAN 143).
 *
 *  Source 1: "National curriculum in England: science programmes of study —
 *  key stages 1 and 2" (years 1 and 2, including Working scientifically),
 *  UK Department for Education / gov.uk. Every term below appears in the
 *  statutory statements or their notes/guidance.
 *  https://www.gov.uk/government/publications/national-curriculum-in-england-science-programmes-of-study/national-curriculum-in-england-science-programmes-of-study
 *
 *  Source 2: Cambridge Primary Science — Stage 2 column of the public
 *  progression table (Cambridge Assessment International Education) plus the
 *  published Stage-2 unit titles (Hodder 2nd ed.).
 *  https://www.cambridgeinternational.org/Images/599345-cambridge-primary-brochure.pdf
 *  Extracted 2026-09-27, verified against the sources.
 */

const NC_RAW = `living things and their habitats|everyday materials|seasonal changes|
uses of everyday materials|animals, including humans|food chain|leaf litter|
day length|life processes|secondary sources|hand lenses|egg timers|
microhabitats|never been alive|plants|wild|garden|deciduous|evergreen|trees|
flowering|structure|leaves|flowers|blossom|petals|fruit|roots|bulb|seed|trunk|
branches|stem|buds|growth|grow|germination|reproduction|mature|temperature|
healthy|animals|fish|amphibians|reptiles|birds|mammals|carnivores|herbivores|
omnivores|pets|humans|human|offspring|adult|living|dead|alive|habitats|
habitat|food|chain|source|sources|characteristics|processes|environment|
seashore|woodland|ocean|rainforest|log|litter|stones|bushes|path|flame|grass|
cow|shelter|survival|body|head|neck|arms|elbows|legs|knees|face|ears|eyes|hair|
mouth|teeth|senses|sense|textures|sounds|smells|materials|material|object|
objects|wood|plastic|glass|metal|rock|brick|paper|fabrics|elastic|foil|
cardboard|hard|soft|stretchy|stiff|shiny|dull|rough|smooth|bendy|waterproof|
absorbent|opaque|transparent|properties|solid|squashing|bending|twisting|
stretching|weather|seasons|sun|day|length|tables|charts|light|air|exercise|
hygiene|nutrition|egg|chick|chicken|caterpillar|pupa|butterfly|spawn|tadpole|
frog|lamb|sheep|baby|toddler|child|teenager|questions|observing|observations|
equipment|tests|identifying|classifying|grouping|data|recording|record|
measurements|measurement|patterns|changes|things|pushes|pulls|forces|apart|
group|compare|fair|test|testing|sample|survey|species|micro-organism|mould|
bacteria|lifecycle|life cycle|seedling|shoot|soil|rocky|mineral|transparent|
translucent|absorb|water-tight|strong|flexible|recycle|reusable|rubbish|
waste|energy|electric|circuit|battery|lamp|switch|wire|sound|loud|quiet|
pitch|vibration|health|healthy|diet|germs|clean|cleaning|dirt|hygienic|
exercise|pulses|pulse|blood|skeleton|skull|ribcage|spine|muscles|joints|
taste|touch|sight|hearing|smell|nostrils|tongue|skin|brain|nervous`

const CAMBRIDGE_RAW = `prediction|enquiry|outcomes|identify|types|human|teeth|functions|care|
property|characteristic|material|materials|explore|construction|series|circuits|
cells|wires|lamps|healthy eating|forces and energy|light and shadow|electricity|
planets|solar system|earth|moon|sun|space|rocks|soil|states of matter|solids|
liquids|gases|changes of state|dissolve|dissolving|solution|separate|filtering|
evaporation|condensation|air pressure|weathering|erosion|interdependent|web`

export const SCIENCE_SYLLABUS: readonly string[] = [
  ...NC_RAW.split('|').map((w) => w.trim().toLowerCase()).filter(Boolean),
  ...CAMBRIDGE_RAW.split('|').map((w) => w.trim().toLowerCase()).filter(Boolean),
]

export const SCIENCE_TOLERANCE: readonly string[] = [
  'sonic', 'tails', 'knuckles', 'amy', 'shadow', 'silver', 'cream', 'blaze',
  'rouge', 'metal', 'eggman', 'momo', 'daisy', 'pepper', 'nature',
]
