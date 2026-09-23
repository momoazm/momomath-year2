/* ============================================================================
 * Collectible Sonic card + chest PACK economy (Asphalt 9-style duplication).
 * EVERY chest holds 1-3 card slots (PACK_SIZE by chest tier). Each slot
 * independently rolls a per-tier CARD_CHANCE that SHRINKS as rarity rises, so
 * the joint odds (chest rarity x card drop) get strictly rarer together.
 * cardStars[id] tracks TOTAL copies received (uncapped); star LEVEL (0-5) is
 * derived via starLevel()/toStar() using STAR_THRESHOLDS [3,6,10,15,21], so
 * each next star costs MORE duplicates than the last. First copy unlocks the
 * card immediately (NEW). See PITFALLS.md / s167 for design history.
 * ========================================================================== */

export type ChestTier = 'common' | 'rare' | 'epic' | 'legendary' | 'exclusive'
export const TIER_ORDER: ChestTier[] = ['common', 'rare', 'epic', 'legendary', 'exclusive']

export interface CardDef {
  /** Card key. The 19 playable mascots reuse their MascotId; roster-only
   *  cards (e.g. movie-*, hyper-*) are plain strings disjoint from MascotId.
   *  Consumers (Library/chest) treat it as an opaque Record key. */
  id: string
  tier: ChestTier
  name: string
  flavor: string
  image: string
  /** 'chest' (default) = drops from lesson chests; 'arcade' = unlock-only,
   *  never in the chest pool (drawCardId/mastered read CARDS, which excludes these). */
  source?: 'chest' | 'arcade'
}


/** The full chest-drop collection (97 cards; roster in PLAN.md §7).
 *  Every `image` below exists on disk under public/ as a real .webp.
 *  Arcade exclusives live in ARCADE_CARDS (PLAN.md §10). */
export const CARDS: CardDef[] = [
  // Common (39)
  { id: 'tails', tier: 'common', name: 'Tails', flavor: 'Two tails are faster than one!', image: 'cards/tails.webp' },
  { id: 'amy', tier: 'common', name: 'Amy', flavor: 'A friend with a big heart!', image: 'cards/amy.webp' },
  { id: 'cream', tier: 'common', name: 'Cream', flavor: 'Sweet as honey and cakes!', image: 'cards/cream.webp' },
  { id: 'charmy', tier: 'common', name: 'Charmy Bee', flavor: 'A tiny bee with a giant heart!', image: 'cards/charmy.webp' },
  { id: 'big', tier: 'common', name: 'Big the Cat', flavor: "Froggy's best buddy!", image: 'cards/big.webp' },
  { id: 'movie-tails', tier: 'common', name: 'Movie Tails', flavor: 'Two tails, double the flight power!', image: 'cards/movie-tails.webp' },
  { id: 'cheese', tier: 'common', name: 'Cheese', flavor: "Cream's tiny chao buddy!", image: 'cards/cheese.webp' },
  { id: 'vanilla', tier: 'common', name: 'Vanilla', flavor: 'The gentlest rabbit mom!', image: 'cards/vanilla.webp' },
  { id: 'froggy', tier: 'common', name: 'Froggy', flavor: 'Always hiding, always loved!', image: 'cards/froggy.webp' },
  { id: 'omochao', tier: 'common', name: 'Omochao', flavor: 'Your helpful chao guide!', image: 'cards/omochao.webp' },
  { id: 'marine', tier: 'common', name: 'Marine Raccoon', flavor: 'Splash into adventure!', image: 'cards/marine.webp' },
  { id: 'sticks', tier: 'common', name: 'Sticks the Badger', flavor: 'Wild, brave, and paranoid!', image: 'cards/sticks.webp' },
  { id: 'tangle', tier: 'common', name: 'Tangle', flavor: 'Tail-swinging into action!', image: 'cards/tangle.webp' },
  { id: 'jewel', tier: 'common', name: 'Jewel', flavor: 'Cool, calm, and crystal-bright!', image: 'cards/jewel.webp' },
  { id: 'trip', tier: 'common', name: 'Trip the Cat', flavor: 'The cat with goggles!', image: 'cards/trip.webp' },
  { id: 'movie-stone', tier: 'common', name: 'Agent Stone', flavor: 'Loyal to the last mustache!', image: 'cards/movie-stone.webp' },
  { id: 'classic-tails', tier: 'common', name: 'Classic Tails', flavor: 'The 1992 sidekick!', image: 'cards/classic-tails.webp' },
  { id: 'classic-knuckles', tier: 'common', name: 'Classic Knuckles', flavor: 'Punch first, guard later!', image: 'cards/classic-knuckles.webp' },
  { id: 'classic-amy', tier: 'common', name: 'Classic Amy', flavor: 'Pigtail-powered hammer!', image: 'cards/classic-amy.webp' },
  { id: 'classic-eggman', tier: 'common', name: 'Classic Eggman', flavor: 'The original mustache!', image: 'cards/classic-eggman.webp' },
  { id: 'boom-sonic', tier: 'common', name: 'Boom Sonic', flavor: 'Bigger attitude, bigger banter!', image: 'cards/boom-sonic.webp' },
  { id: 'boom-tails', tier: 'common', name: 'Boom Tails', flavor: 'DIY gadgets and sarcasm!', image: 'cards/boom-tails.webp' },
  { id: 'boom-knuckles', tier: 'common', name: 'Boom Knuckles', flavor: 'Strong, proud, easily tricked!', image: 'cards/boom-knuckles.webp' },
  { id: 'boom-amy', tier: 'common', name: 'Boom Amy', flavor: 'Nerf-charging hammer time!', image: 'cards/boom-amy.webp' },
  { id: 'boom-eggman', tier: 'common', name: 'Boom Eggman', flavor: 'Trapped in his own sitcom!', image: 'cards/boom-eggman.webp' },
  { id: 'orbot', tier: 'common', name: 'Orbot', flavor: 'The smart red sphere!', image: 'cards/orbot.webp' },
  { id: 'cubot', tier: 'common', name: 'Cubot', flavor: 'The (mostly) working cube!', image: 'cards/cubot.webp' },
  { id: 'egg-robo', tier: 'common', name: 'Egg-Robo', flavor: 'Clockwork helper gone rogue!', image: 'cards/egg-robo.webp' },
  { id: 'motobug', tier: 'common', name: 'Motobug', flavor: 'Vroom vroom — watch out!', image: 'cards/motobug.webp' },
  { id: 'crabmeat', tier: 'common', name: 'Crabmeat', flavor: 'Sideways snapper!', image: 'cards/crabmeat.webp' },
  { id: 'buzz-bomber', tier: 'common', name: 'Buzz Bomber', flavor: 'Sting in a jetpack!', image: 'cards/buzz-bomber.webp' },
  { id: 'chopper', tier: 'common', name: 'Chopper', flavor: 'Jumping fish alert!', image: 'cards/chopper.webp' },
  { id: 'egg-pawn', tier: 'common', name: 'Egg Pawn', flavor: "Eggman's foot soldier!", image: 'cards/egg-pawn.webp' },
  { id: 'zazz', tier: 'common', name: 'Zazz the Zeti', flavor: 'Zeti of pure chaos!', image: 'cards/zazz.webp' },
  { id: 'zomom', tier: 'common', name: 'Zomom the Zeti', flavor: 'Hungry for trouble!', image: 'cards/zomom.webp' },
  { id: 'zor', tier: 'common', name: 'Zor the Zeti', flavor: 'Lazy but lethal!', image: 'cards/zor.webp' },
  { id: 'zeena', tier: 'common', name: 'Zeena the Zeti', flavor: 'Queen of attitude!', image: 'cards/zeena.webp' },
  { id: 'master-zik', tier: 'common', name: 'Master Zik', flavor: 'Old master, new mischief!', image: 'cards/master-zik.webp' },
  { id: 'maria', tier: 'common', name: 'Maria', flavor: 'A gentle friend from the ark!', image: 'cards/maria.webp' },
  // Rare (25)
  { id: 'knuckles', tier: 'rare', name: 'Knuckles', flavor: 'The master of the fist!', image: 'cards/knuckles.webp' },
  { id: 'blaze', tier: 'rare', name: 'Blaze', flavor: 'Faster than the fire!', image: 'cards/blaze.webp' },
  { id: 'rouge', tier: 'rare', name: 'Rouge', flavor: 'A jewel thief with style!', image: 'cards/rouge.webp' },
  { id: 'ray', tier: 'rare', name: 'Ray the Flying Squirrel', flavor: 'Glide through the sky!', image: 'cards/ray.webp' },
  { id: 'vector', tier: 'rare', name: 'Vector the Crocodile', flavor: 'A loud, loveable leader!', image: 'cards/vector.webp' },
  { id: 'classic-sonic', tier: 'rare', name: 'Classic Sonic', flavor: 'The original 1991 hedgehog!', image: 'cards/classic-sonic.webp' },
  { id: 'werehog-sonic', tier: 'rare', name: 'Werehog Sonic', flavor: 'Big fists when the sun goes down!', image: 'cards/werehog-sonic.webp' },
  { id: 'movie-knuckles', tier: 'rare', name: 'Movie Knuckles', flavor: 'Honorable fists, movie punch!', image: 'cards/movie-knuckles.webp' },
  { id: 'wave', tier: 'rare', name: 'Wave the Swallow', flavor: 'Gearhead of the Babylon Rogues!', image: 'cards/wave.webp' },
  { id: 'storm', tier: 'rare', name: 'Storm the Albatross', flavor: "The sky's heavy hitter!", image: 'cards/storm.webp' },
  { id: 'mighty', tier: 'rare', name: 'Mighty the Armadillo', flavor: 'Shell-shocked and sturdy!', image: 'cards/mighty.webp' },
  { id: 'faker', tier: 'rare', name: 'Faker Sonic', flavor: 'A fake blue imposter!', image: 'cards/faker.webp' },
  { id: 'metal-knuckles', tier: 'rare', name: 'Metal Knuckles', flavor: 'Chrome-plated puncher!', image: 'cards/metal-knuckles.webp' },
  { id: 'tails-doll', tier: 'rare', name: 'Tails Doll', flavor: 'Not as cute as he looks!', image: 'cards/tails-doll.webp' },
  { id: 'tikal', tier: 'rare', name: 'Tikal', flavor: "Keeper of the emeralds' peace!", image: 'cards/tikal.webp' },
  { id: 'whisper', tier: 'rare', name: 'Whisper the Wolf', flavor: 'Quiet, precise, deadly!', image: 'cards/whisper.webp' },
  { id: 'surge', tier: 'rare', name: 'Surge the Tenrec', flavor: 'Electric troublemaker!', image: 'cards/surge.webp' },
  { id: 'kit', tier: 'rare', name: 'Kit the Fennec', flavor: 'Loyal to a fault!', image: 'cards/kit.webp' },
  { id: 'sally', tier: 'rare', name: 'Sally Acorn', flavor: 'Team leader with a plan!', image: 'cards/sally.webp' },
  { id: 'movie-amy', tier: 'rare', name: 'Movie Amy', flavor: 'Hammer swing, big entrance!', image: 'cards/movie-amy.webp' },
  { id: 'movie-eggman', tier: 'rare', name: 'Movie Eggman', flavor: 'Showman villain, big goggles!', image: 'cards/movie-eggman.webp' },
  { id: 'gamma', tier: 'rare', name: 'E-102 Gamma', flavor: 'Robot with a heart of gold!', image: 'cards/gamma.webp' },
  { id: 'heavy-king', tier: 'rare', name: 'Heavy King', flavor: 'The Mania kingpin!', image: 'cards/heavy-king.webp' },
  { id: 'heavy-magician', tier: 'rare', name: 'Heavy Magician', flavor: 'Tricks up every sleeve!', image: 'cards/heavy-magician.webp' },
  { id: 'chao', tier: 'rare', name: 'Chao', flavor: 'A tiny friend with a big heart!', image: 'cards/chao.webp' },
  // Epic (18)
  { id: 'shadow', tier: 'epic', name: 'Shadow', flavor: 'The ultimate lifeform!', image: 'cards/shadow.webp' },
  { id: 'silver', tier: 'epic', name: 'Silver', flavor: 'Psychic power of the future!', image: 'cards/silver.webp' },
  { id: 'metal', tier: 'epic', name: 'Metal Sonic', flavor: 'A copy built to win!', image: 'cards/metal.webp' },
  { id: 'espio', tier: 'epic', name: 'Espio the Chameleon', flavor: 'Master of disguise!', image: 'cards/espio.webp' },
  { id: 'omega', tier: 'epic', name: 'Omega', flavor: 'The ultimate E-Series robot!', image: 'cards/omega.webp' },
  { id: 'movie-sonic', tier: 'epic', name: 'Movie Sonic', flavor: 'Gotta go fast on the big screen!', image: 'cards/movie-sonic.webp' },
  { id: 'movie-shadow', tier: 'epic', name: 'Movie Shadow', flavor: 'Shadow hits the silver screen!', image: 'cards/movie-shadow.webp' },
  { id: 'neo-metal', tier: 'epic', name: 'Neo Metal Sonic', flavor: 'Metal evolved — now with attitude!', image: 'cards/neo-metal.webp' },
  { id: 'dark-sonic', tier: 'epic', name: 'Dark Sonic', flavor: 'Anger made him faster!', image: 'cards/dark-sonic.webp' },
  { id: 'mephiles', tier: 'epic', name: 'Mephiles the Dark', flavor: "Shadow's darkest reflection!", image: 'cards/mephiles.webp' },
  { id: 'infinite', tier: 'epic', name: 'Infinite', flavor: 'Fear is his weapon!', image: 'cards/infinite.webp' },
  { id: 'zavok', tier: 'epic', name: 'Zavok the Zeti', flavor: 'Leader of the Deadly Six!', image: 'cards/zavok.webp' },
  { id: 'sage', tier: 'epic', name: 'Sage', flavor: 'The digital daughter of Eggman!', image: 'cards/sage.webp' },
  { id: 'chaos', tier: 'epic', name: 'Chaos', flavor: 'Guardian of the chao, uncontrollable!', image: 'cards/chaos.webp' },
  { id: 'eggman-nega', tier: 'epic', name: 'Eggman Nega', flavor: 'From a future of endless schemes!', image: 'cards/eggman-nega.webp' },
  { id: 'black-doom', tier: 'epic', name: 'Black Doom', flavor: "The black arm's warlord!", image: 'cards/black-doom.webp' },
  { id: 'erazor-djinn', tier: 'epic', name: 'Erazor Djinn', flavor: 'A lamp thief with a grudge!', image: 'cards/erazor-djinn.webp' },
  { id: 'king-arthur', tier: 'epic', name: 'King Arthur', flavor: 'Ruler of the foggy realm!', image: 'cards/king-arthur.webp' },
  // Legendary (10)
  { id: 'sonic', tier: 'legendary', name: 'Sonic', flavor: 'The fastest thing alive!', image: 'cards/sonic.webp' },
  { id: 'jet', tier: 'legendary', name: 'Jet the Hawk', flavor: 'King of the Babylon Rogues!', image: 'cards/jet.webp' },
  { id: 'super-shadow', tier: 'legendary', name: 'Super Shadow', flavor: 'Chaos energy, golden glow!', image: 'cards/super-shadow.webp' },
  { id: 'hyper-sonic', tier: 'legendary', name: 'Hyper Sonic', flavor: 'Super power plus all seven emeralds!', image: 'cards/hyper-sonic.webp' },
  { id: 'hyper-shadow', tier: 'legendary', name: 'Hyper Shadow', flavor: 'Ultimate power, ultimate glow!', image: 'cards/hyper-shadow.webp' },
  { id: 'excalibur-sonic', tier: 'legendary', name: 'Excalibur Sonic', flavor: 'Knight of the golden sword!', image: 'cards/excalibur-sonic.webp' },
  { id: 'super-knuckles', tier: 'legendary', name: 'Super Knuckles', flavor: 'Glowing fists, tunnel vision!', image: 'cards/super-knuckles.webp' },
  { id: 'super-blaze', tier: 'legendary', name: 'Super Blaze', flavor: 'Burning brighter than before!', image: 'cards/super-blaze.webp' },
  { id: 'devil-doom', tier: 'legendary', name: 'Devil Doom', flavor: "The black arm's final form!", image: 'cards/devil-doom.webp' },
  { id: 'time-eater', tier: 'legendary', name: 'Time Eater', flavor: 'Eats history for breakfast!', image: 'cards/time-eater.webp' },
  // Exclusive (5)
  { id: 'eggman', tier: 'exclusive', name: 'Dr. Eggman', flavor: 'The mad scientist of mayhem!', image: 'cards/eggman.webp' },
  { id: 'super', tier: 'exclusive', name: 'Super Sonic', flavor: 'The legendary golden form!', image: 'cards/super-sonic.webp' },
  { id: 'metal-overlord', tier: 'exclusive', name: 'Metal Overlord', flavor: "Metal Sonic's ultimate evolution!", image: 'cards/metal-overlord.webp' },
  { id: 'perfect-chaos', tier: 'exclusive', name: 'Perfect Chaos', flavor: 'A tsunami with a grudge!', image: 'cards/perfect-chaos.webp' },
  { id: 'dark-gaia', tier: 'exclusive', name: 'Dark Gaia', flavor: 'The night itself awakened!', image: 'cards/dark-gaia.webp' },
]

export const CARD_BY_ID: Record<string, CardDef> = Object.fromEntries(CARDS.map((c) => [c.id, c]))

/* -------------------- arcade-exclusive cards -------------------- */
/** Unlock-only Sonic the Fighters trio — NEVER in the chest pool (uniform pick,
 *  locked-pity and novelty math all read CARDS, which excludes these).
 *  Display-only in this tree (no Arcade tab yet — PLAN.md §10); granted once
 *  a future arcade trigger exists. Art: existing free-source webps. */
export const ARCADE_CARDS: CardDef[] = [
  { id: 'fang', tier: 'exclusive', name: 'Fang the Sniper', flavor: 'Finishes 10 arcade rounds!', image: 'cards/fang.webp', source: 'arcade' },
  { id: 'bean', tier: 'exclusive', name: 'Bean the Dynamite', flavor: 'Scores in all 3 subject games!', image: 'cards/bean.webp', source: 'arcade' },
  { id: 'bark', tier: 'exclusive', name: 'Bark the Polar Bear', flavor: 'Crushes 5 bosses in Boss Rush!', image: 'cards/bark.webp', source: 'arcade' },
]

/** Every card incl. arcade exclusives (library/profile display only). */
export const ALL_CARDS: CardDef[] = [...CARDS, ...ARCADE_CARDS]

export const ARCADE_CARD_BY_ID: Record<string, CardDef> = Object.fromEntries(ARCADE_CARDS.map((c) => [c.id, c]))

/** Resolves a card's character render to an absolute URL under the Vite base path. */
export function cardImageUrl(card: CardDef): string {
  return `${import.meta.env.BASE_URL}${card.image}`
}

export const tierIndex = (t: ChestTier) => TIER_ORDER.indexOf(t)



/* -------------------- star curve + dust conversion -------------------- */

/** Total cards needed to reach each star level. Stars are 0=locked, 1-5=unlocked.
 *  Curve is gentle-to-steeper: 3 / 6 / 10 / 15 / 21 (each next needs +3, +4, +5, +6).
 *  Designed for kids: unlocks within a few chests, 5★ is a long-term goal. */
export const STAR_THRESHOLDS: readonly number[] = [3, 6, 10, 15, 21] as const
export const MAX_STAR = STAR_THRESHOLDS.length // 5

/** Gems awarded when a copy of a MAXED (5★) character arrives - the "dust" reward. */
export const DUST_PER_CARD: Record<ChestTier, number> = {
  common: 2,
  rare: 5,
  epic: 10,
  legendary: 20,
  exclusive: 40,
}

/** Star level (0..MAX_STAR) for a given card copy count. */
export function starLevel(count: number): number {
  let s = 0
  for (const t of STAR_THRESHOLDS) if (count >= t) s++
  return Math.min(MAX_STAR, s)
}

/** Alias for starLevel — used by LibraryScreen / ProfileScreen */
export const toStar = starLevel

/** How many more copies are needed to reach the NEXT star. 0 if already maxed. */
export function copiesToNextStar(count: number): number {
  for (const t of STAR_THRESHOLDS) if (count < t) return t - count
  return 0
}

/** True if this character is currently locked (count below STAR_THRESHOLDS[0]). */
export function isCardLocked(count: number): boolean {
  return count < STAR_THRESHOLDS[0]
}

/* -------------------- gem bands per FINAL chest tier -------------------- */

const GEM_RANGE: Record<ChestTier, [number, number]> = {
  common: [3, 6],
  rare: [8, 14],
  epic: [15, 25],
  legendary: [30, 45],
  exclusive: [51, 80],
}

/* -------------------- starting-tier probability tables -------------------- */

export type ChestContext = 'normal' | 'boss' | 'lucky' | 'streak'
export const START_TABLES: Record<ChestContext, [ChestTier, number][]> = {
  // Harder high tiers (user 2026-09-23): rare→exclusive start odds cut so
  // top chests feel special; still non-zero so a normal chest can hit them.
  normal: [
    ['common', 96.5],
    ['rare', 2.5],
    ['epic', 0.7],
    ['legendary', 0.25],
    ['exclusive', 0.05],
  ],
  boss: [
    ['rare', 68],
    ['epic', 22],
    ['legendary', 8],
    ['exclusive', 2],
  ],
  lucky: [
    ['common', 65],
    ['rare', 22],
    ['epic', 9],
    ['legendary', 3.5],
    ['exclusive', 0.5],
  ],
  streak: [
    ['legendary', 80],
    ['exclusive', 20],
  ],
}

/* -------------------- tier->pool: what each chest tier CAN drop -------------------- */

/** For each CHEST tier, the weighted probability of each CARD tier in the pack.
 *  Common chests can still drop Rare cards (12%); Legendary has a small chance
 *  of Common to keep low tiers useful. */
export const CARD_POOL: Record<ChestTier, [ChestTier, number][]> = {
  common: [
    ['common', 88], ['rare', 12],
  ],
  rare: [
    ['common', 30], ['rare', 60], ['epic', 10],
  ],
  epic: [
    ['common', 10], ['rare', 30], ['epic', 55], ['legendary', 5],
  ],
  legendary: [
    ['rare', 15], ['epic', 30], ['legendary', 55],
  ],
  exclusive: [
    ['exclusive', 100],
  ],
}

/* -------------------- pack size (copies per chest) -------------------- */

/** Returns the min..max number of copies a chest of this tier can contain. */
export const PACK_SIZE: Record<ChestTier, [number, number]> = {
  common: [1, 1],
  rare: [1, 2],
  epic: [2, 2],
  legendary: [2, 3],
  exclusive: [3, 3],
}

/* -------------------- pity + per-slot card odds -------------------- */

/** Cardless-pity: this many chests in a row with ZERO card drops forces the
 *  next chest's first slot to drop a card. */
export const PITY_LIMIT = 15

/**
 * Per-slot card-drop chance by FINAL chest tier. Decoupled from the chest
 * roll and strictly decreasing with rarity: rarer chest x rarer card =
 * rarest event (e.g. exclusive chest 0.1% x 10% per slot).
 */
export const CARD_CHANCE: Record<ChestTier, number> = {
  common: 0.35,
  rare: 0.22,
  epic: 0.14,
  legendary: 0.08,
  exclusive: 0.04,
}

/* -------------------- visual metadata + kick-upgrade table -------------------- */

/** Rarity metadata used by both the chest reveal and the profile album. */
export const TIER_META: Record<ChestTier, { label: string; color: string; glow: string; icon: string }> = {
  common: { label: 'Common', color: '#94a3b8', glow: 'rgba(148,163,184,0.35)', icon: '⚪' },
  rare: { label: 'Rare', color: '#3b82f6', glow: 'rgba(59,130,246,0.45)', icon: '🔵' },
  epic: { label: 'Epic', color: '#a855f7', glow: 'rgba(168,85,247,0.5)', icon: '🟣' },
  legendary: { label: 'Legendary', color: '#f59e0b', glow: 'rgba(245,158,11,0.55)', icon: '🟡' },
  exclusive: { label: 'EXCLUSIVE', color: '#c026d3', glow: 'rgba(192,38,211,0.6)', icon: '💠' },
}

/** 4-kick ritual - each kick's chance to upgrade to the NEXT tier (capped at Legendary). */
export const KICKS = 4
export const KICK_UPGRADE: Record<ChestTier, number> = {
  common: 0.15,
  rare: 0.22,
  epic: 0.28,
  legendary: 0,
  exclusive: 0,
}

/* -------------------- internal helpers -------------------- */

function randInt(rand: () => number, min: number, max: number): number {
  return min + Math.floor(rand() * (max - min + 1))
}

function weightedPick<T>(rand: () => number, table: readonly [T, number][]): T {
  const total = table.reduce((s, [, w]) => s + w, 0)
  let r = rand() * total
  for (const item of table) {
    const [v, w] = item
    r -= w
    if (r <= 0) return v
  }
  return table[table.length - 1][0]
}

/** Draw a card id uniformly from one tier, WITH replacement: repeats are
 *  allowed on purpose (they feed the escalating star curve). */
function drawCardId(rand: () => number, cardTier: ChestTier): string | null {
  const pool = CARDS.filter((c) => c.tier === cardTier).map((c) => c.id)
  if (pool.length === 0) return null
  return pool[Math.floor(rand() * pool.length)]
}


/* -------------------- pack: 1-3 cards per chest -------------------- */

/**
 * Individual card inside a chest result.
 * The FIRST copy ever unlocks the card (isNew); later copies climb the
 * escalating star curve (3/6/10/15/21 total copies -> 1-5 stars).
 */
export interface ChestCard {
  cardId: string
  tier: ChestTier
  /** first copy of this character ever received (prev count was 0) */
  isNew: boolean
  /** total copies AFTER this event (includes this card) */
  copiesAfter: number
  /** this card crossed a star threshold (celebrate a STAR UP) */
  leveledUp: boolean
  /** gem bonus paid for this duplicate (0 for NEW cards) */
  starBonus: number
}

/* -------------------- public ChestResult + rollChest -------------------- */

export interface ChestResult {
  startTier: ChestTier
  finalTier: ChestTier
  upgradesAt: number[]
  gems: number
  /** total gem bonus from duplicate star-ups (store adds gems + dust) */
  dust: number
  /** 0-3 card events; repeats feed stars, never vanish */
  cards: ChestCard[]
  /** every card fully maxed (21+ copies): jackpot gems instead of cards */
  jackpot: boolean
}

/** Roll a full chest for one lesson.
 *  - `ctx`     : 'normal' | 'boss' | 'lucky' | 'streak'
 *  - `counts`  : the player's per-character copy counts
 *  - `pity`    : consecutive chests with ZERO card drops
 */
export function rollChest(
  rand: () => number,
  ctx: ChestContext,
  counts: Readonly<Record<string, number>>,
  pity: number,
): ChestResult {
  // 1) starting chest tier
  const startTier = rollStartTier(rand, ctx)
  let tier = startTier
  const upgradesAt: number[] = []
  for (let k = 0; k < KICKS; k++) {
    const next = upgradeStep(tier)
    if (next !== tier && rand() < KICK_UPGRADE[tier]) {
      tier = next
      upgradesAt.push(k)
    }
  }

  // 2) gem band from the FINAL tier
  const [gMin, gMax] = GEM_RANGE[tier]
  const gems = randInt(rand, gMin, gMax)

  // 3) endgame: every character maxed (21+ copies) -> gem jackpot instead.
  const maxedCopies = STAR_THRESHOLDS[STAR_THRESHOLDS.length - 1]
  const mastered = CARDS.every((c) => (counts[c.id] ?? 0) >= maxedCopies)
  if (mastered) {
    const jackpotBase = randInt(rand, GEM_RANGE.exclusive[0], GEM_RANGE.exclusive[1])
    return {
      startTier,
      finalTier: tier,
      upgradesAt,
      gems: jackpotBase + COLLECTION_JACKPOT,
      dust: 0,
      cards: [],
      jackpot: true,
    }
  }

  // 4) 1-3 card slots (PACK_SIZE by final tier). Each slot independently
  //    rolls the per-tier CARD_CHANCE, so rarer chest x rarer card is the
  //    rarest event. Repeats (even inside one chest) climb the star curve.
  const [sMin, sMax] = PACK_SIZE[tier]
  const slots = randInt(rand, sMin, sMax)
  const forced = pity >= PITY_LIMIT
  const cards: ChestCard[] = []
  let dust = 0
  // Local counts INCLUDE cards dropped earlier in this same chest, so a
  // repeat inside one pack STARs UP instead of vanishing (Sonic x2 counts!).
  const local: Record<string, number> = { ...counts }

  for (let s = 0; s < slots; s++) {
    const drops = (forced && s === 0) || rand() < CARD_CHANCE[tier]
    if (!drops) continue
    const id = drawCardId(rand, tier)
    if (!id) continue
    const prev = local[id] ?? 0
    const copiesAfter = prev + 1
    local[id] = copiesAfter
    if (prev === 0) {
      cards.push({ cardId: id, tier, isNew: true, copiesAfter, leveledUp: false, starBonus: 0 })
    } else {
      const before = starLevel(prev)
      const after = starLevel(copiesAfter)
      const bonus = DUST_PER_CARD[tier] * Math.max(1, after)
      dust += bonus
      cards.push({ cardId: id, tier, isNew: false, copiesAfter, leveledUp: after > before, starBonus: bonus })
    }
  }

  return {
    startTier,
    finalTier: tier,
    upgradesAt,
    gems,
    dust,
    cards,
    jackpot: false,
  }
}

export function rollStartTier(rand: () => number, ctx: ChestContext): ChestTier {
  return weightedPick(rand, START_TABLES[ctx])
}

/** Next tier in the upgrade chain; Exclusive is never entered/left via upgrade. */
export function upgradeStep(t: ChestTier): ChestTier {
  if (t === 'common') return 'rare'
  if (t === 'rare') return 'epic'
  if (t === 'epic') return 'legendary'
  return t
}


// Jackpot constant (tests reference it).
export const COLLECTION_JACKPOT = 300

/* -------------------- WS2: pure ChestResult -> reveal mappings -------------------- */

/** Headline copy variant, by plan priority:
 *  jackpot -> pity (0 cards) -> any NEW -> any STAR UP -> duplicates. */
export type ChestCopyVariant = 'jackpot' | 'pity' | 'new' | 'starUp' | 'duplicates'

export function chestCopyVariant(chest: ChestResult): ChestCopyVariant {
  if (chest.jackpot) return 'jackpot'
  if (chest.cards.length === 0) return 'pity'
  if (chest.cards.some((c) => c.isNew)) return 'new'
  if (chest.cards.some((c) => c.leveledUp)) return 'starUp'
  return 'duplicates'
}

/** Grid tiles to render: exactly one per card event (0 -> no grid). */
export function chestTileCount(chest: ChestResult): number {
  return chest.cards.length
}

/** Tier after each of the KICKS kicks: [startTier, ...upgradesAt chain].
 *  Index k = the tier shown once k kicks are done; the last entry always
 *  equals finalTier, so the live chest/rays/glow color tracks the roll. */
export function kickTierSequence(chest: Pick<ChestResult, 'startTier' | 'upgradesAt'>): ChestTier[] {
  const seq: ChestTier[] = [chest.startTier]
  let tier = chest.startTier
  for (let k = 0; k < KICKS; k++) {
    if (chest.upgradesAt.includes(k)) tier = upgradeStep(tier)
    seq.push(tier)
  }
  return seq
}

/** What grantChest actually persists for this chest, given cardStars AFTER
 *  the +1 copies were banked: x2 when every card in the pack was already at
 *  5*, else x1. The reveal totals MUST equal this (invariant D). */
export function chestPayout(
  chest: ChestResult,
  cardStarsAfter: Readonly<Record<string, number>>,
): { gems: number; dust: number } {
  const maxed = STAR_THRESHOLDS[STAR_THRESHOLDS.length - 1]
  const allMaxed =
    chest.cards.length > 0 &&
    chest.cards.every((c) => (cardStarsAfter[c.cardId] ?? 0) >= maxed)
  const mult = allMaxed ? 2 : 1
  return { gems: (chest.gems ?? 0) * mult, dust: (chest.dust ?? 0) * mult }
}
