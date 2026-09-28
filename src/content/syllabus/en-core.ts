/** PLAN 145 — shared Year-2 CORE reading vocabulary for ALL English-medium
 *  subjects (math / english / science).
 *
 *  Provenance (honest): these are ordinary Y1/Y2 reading-scheme words plus the
 *  classroom grammar / report / materials terms the units deliberately teach.
 *  They are NOT in the DfE Year-2 spelling appendix (english.ts — that is a
 *  spelling list, not a reading-vocabulary list) and no official KS1 word list
 *  exists to extract them from, so they are curated here from the units'
 *  own vocabulary: every entry must be defensible as standard year-2 reading
 *  vocabulary. The audit's hard-tier still catches genuinely advanced words
 *  (volatile, sedimentary, irreversible...) — anything above this level stays
 *  flagged until fixed in content or justified into a subject syllabus with a
 *  real source. Added PLAN 145.
 */

const CORE_RAW = `

statement|exclamation|subheading|picture|begin|beginning|outside|yesterday|
disagree|disobey|dislike|
excite|excited|entertain|important|sunflower|dinosaur|cupcake|toothbrush|
treehouse|butterfly|butterflies|enormous|brilliant|volcano|volcanoes|forever|
seaside|surface|aeroplane|aeroplanes|visit|visited|playtime|tower|towered|
chocolate|astronaut|astronauts|imagine|frogspawn|tadpole|tadpoles|together|
footprint|footprints|glitter|glittering|pancake|pancakes|follow|followed|
discover|discovered|surprise|mixture|umbrella|playground|breakfast|caterpillar|
chrysalis|microphone|invite|invited|blowhole|pirate|pirates|scratch|scratches|
banana|bananas|sunshine|backwards|colour|coloured|colourful|colourless|
sprinkle|sprinkled|thousand|complete|completely|sandcastle|afternoon|evening|
daytime|firefighter|bookcase|delight|delighted|neighbour|sunrise|faraway|
countdown|cover|covered|appear|appeared|delicious|arrive|arrived|grandpa|
package|battery|batteries|skeleton|dissolve|dissolves|search|searching|silence|
foxglove|hammer|hammered|grateful|frighten|frightened|describe|direction|
bedtime|machine|machines|absolutely|amazing|engine|engines|seashore|orange|
oranges|notice|noticed|suggest|suggested|overnight|polish|polished|thunderous|
remember|remembered|finish|finished|staircase|keyhole|cardboard|eruption|
detective|elephant|toothpaste|scorching|

mistake|impossible|lunchtime|upside-down|disappear|disappears|regular|random|
certain|giraffe|paperclip|seventeen|eighteen|nineteen|

different|natural|man-made|non-living|chemicals|manufactured|appliance|
hairdryer|riverbed|stretch|stretches|lightweight|bendable|irreversible|
reversible|predators|horizon|engineer|instruction|instructions|computer|
exist|existing|become|becomes|workspace|vegetables|dangerous|television|
savannah|grown-up|plugged-in|unbroken|bright|brightest|saturday|sunday|
monday|tuesday|wednesday|thursday|friday
`

/** Normalized once at module load. */
export const EN_CORE: readonly string[] = Array.from(
  new Set(
    CORE_RAW.split('|')
      .map((w) => w.trim().toLowerCase())
      .filter(Boolean),
  ),
)
