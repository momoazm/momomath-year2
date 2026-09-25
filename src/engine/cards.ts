/* ============================================================================
 * Collectible Sonic card + chest PACK economy (Asphalt 9-style duplication).
 * EVERY chest = a card pack of 1-3 copies of ONE character + scaled gem band
 * (pack size from PACK_SIZE by final chest tier; card picked uniform-random
 * from all 97 chest cards, locked-pity forces a still-locked character on
 * drought). Arcade exclusives (fang/bean/bark) never enter the chest pool.
 * cardStars[id] tracks TOTAL copies received (uncapped); star LEVEL (0-5) is
 * derived via starLevel()/toStar() using STAR_THRESHOLDS [3,6,10,15,21].
 * See PITFALLS.md / s167 for design history.
 * ========================================================================== */

export type ChestTier = 'common' | 'rare' | 'epic' | 'legendary' | 'exclusive'
export const TIER_ORDER: ChestTier[] = ['common', 'rare', 'epic', 'legendary', 'exclusive']

export interface CardDef {
  /** Card key. Playable mascots reuse their MascotId string; roster-only
   *  cards (movie-*, hyper-*, boom-*, …) are plain strings disjoint from
   *  MascotId. Consumers treat it as an opaque Record key. */
  id: string
  tier: ChestTier
  name: string
  flavor: string
  image: string
  /** 'chest' (default) = drops from lesson chests; 'arcade' = unlock-only, never in the chest pool */
  source?: 'chest' | 'arcade'
}


/** The full chest-drop collection (97 cards; roster in docs PLAN.md §7).
 *  Every `image` below exists on disk under public/ as a real .webp. */
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
 *  Granted once at 3 copies (1★) via store.grantArcadeCard when a
 *  checkArcadeCards() condition is met. Progress is local-only; the granted
 *  cardStars entry syncs through cloudsave (server accepts any sane key). */
export const ARCADE_CARDS: CardDef[] = [
  { id: 'fang', tier: 'exclusive', name: 'Fang the Sniper', flavor: 'Finishes 10 arcade rounds!', image: 'cards/fang.webp', source: 'arcade' },
  { id: 'bean', tier: 'exclusive', name: 'Bean the Dynamite', flavor: 'Scores in all 3 subject games!', image: 'cards/bean.webp', source: 'arcade' },
  { id: 'bark', tier: 'exclusive', name: 'Bark the Polar Bear', flavor: 'Crushes 5 bosses in Boss Rush!', image: 'cards/bark.webp', source: 'arcade' },
]

/** Every card incl. arcade exclusives (library/profile display only). */
export const ALL_CARDS: CardDef[] = [...CARDS, ...ARCADE_CARDS]

export const ARCADE_CARD_BY_ID: Record<string, CardDef> = Object.fromEntries(ARCADE_CARDS.map((c) => [c.id, c]))

/** Unlock progress target for each arcade card. `unit` is the short progress
 *  prefix shown on the locked library card ("Rounds 4/10"). */
export const ARCADE_CARD_GOALS: Record<string, { label: string; unit: string; goal: number; progress: (s: { arcadeRounds: number; arcadeBossesDown: number; arcadeGamesPlayed: number }) => number }> = {
  fang: { label: 'Finish {n} arcade rounds', unit: 'Rounds', goal: 10, progress: (s) => s.arcadeRounds },
  bark: { label: 'Defeat {n} bosses in Boss Rush', unit: 'Bosses', goal: 5, progress: (s) => s.arcadeBossesDown },
  bean: { label: 'Score in all {n} subject games', unit: 'Games', goal: 3, progress: (s) => s.arcadeGamesPlayed },
}

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
  normal: [
    ['common', 95],
    ['rare', 3.5],
    ['epic', 1],
    ['legendary', 0.4],
    ['exclusive', 0.1],
  ],
  boss: [
    ['rare', 62],
    ['epic', 26],
    ['legendary', 10],
    ['exclusive', 2],
  ],
  lucky: [
    ['common', 55],
    ['rare', 27],
    ['epic', 12],
    ['legendary', 5],
    ['exclusive', 1],
  ],
  streak: [
    ['legendary', 75],
    ['exclusive', 25],
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

/* -------------------- pity + novelty curve -------------------- */

/** Locked-pity: this many chests in a row without a still-locked character drop
 *  forces the next pack to include a still-locked character (if any remain). */
export const LOCKED_PITY = 12

/**
 * Chance a chest contains a NEW (never-seen, 0-copy) character.
 * Starts at 100% and falls as the collection fills: (total - owned) / total
 * (e.g. 2 of 97 owned -> ~98%). Hits 0% only when everything is seen.
 *
 * This gates WHETHER one slot is novel — rarity odds (START_TABLES, kick
 * upgrades, gem bands) are untouched, and at most ONE card per chest is new.
 */
export function noveltyChance(ownedDistinct: number, total: number = CARDS.length): number {
  if (total <= 0) return 0
  const remaining = Math.max(0, total - Math.max(0, ownedDistinct))
  return remaining / total
}

/* -------------------- visual metadata + kick-upgrade table -------------------- */

/** Rarity metadata used by both the chest reveal and the profile album. */
export const TIER_META: Record<ChestTier, { label: string; color: string; glow: string; icon: string }> = {
  common: { label: 'Common', color: '#94a3b8', glow: 'rgba(148,163,184,0.35)', icon: '⚪' },
  rare: { label: 'Rare', color: '#3b82f6', glow: 'rgba(59,130,246,0.45)', icon: '🔵' },
  epic: { label: 'Epic', color: '#a855f7', glow: 'rgba(168,85,247,0.5)', icon: '🟣' },
  legendary: { label: 'Legendary', color: '#f59e0b', glow: 'rgba(245,158,11,0.55)', icon: '🟡' },
  exclusive: { label: 'EXCLUSIVE', color: '#e0b3ff', glow: 'rgba(255,215,140,0.65)', icon: '💠' },
}

/** 4-kick ritual - each kick's chance to upgrade to the NEXT tier (capped at Legendary). */
export const KICKS = 4
export const KICK_UPGRADE: Record<ChestTier, number> = {
  common: 0.22,
  rare: 0.30,
  epic: 0.40,
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

/** A character is considered "owned" (unlocked) once it has at least STAR_THRESHOLDS[0] copies. */
function isOwned(counts: Readonly<Record<string, number>>, id: string): boolean {
  return (counts[id] ?? 0) >= STAR_THRESHOLDS[0]
}

/** Return ids of all still-LOCKED characters (count < 3). */
function lockedIds(counts: Readonly<Record<string, number>>): string[] {
  return CARDS.map((c) => c.id).filter((id) => !isOwned(counts, id))
}

/** Pick a card id from the given pool, preferring still-LOCKED characters when
 *  `forceLocked` is true. Falls back to any character of the right tier if the
 *  pool is exhausted. Returns null if NO card of that tier exists. */
function pickCardForTier(
  rand: () => number,
  counts: Readonly<Record<string, number>>,
  cardTier: ChestTier,
  forceLocked: boolean,
): string | null {
  const allOfTier = CARDS.filter((c) => c.tier === cardTier).map((c) => c.id)
  if (allOfTier.length === 0) return null
  // 1) if forcing-locked, prefer a still-locked character of THIS tier
  if (forceLocked) {
    const lockedInTier = allOfTier.filter((id) => !isOwned(counts, id))
    if (lockedInTier.length > 0) {
      return lockedInTier[Math.floor(rand() * lockedInTier.length)]
    }
    // 2) any still-locked character (any tier) - drop the tier filter so the
    //    pity guarantee always unlocks someone new if anyone remains
    const anyLocked = lockedIds(counts)
    if (anyLocked.length > 0) return anyLocked[Math.floor(rand() * anyLocked.length)]
  }
  // 3) normal pick - any character of the requested tier (locked or not)
  return allOfTier[Math.floor(rand() * allOfTier.length)]
}


/* -------------------- pack: multiple cards per chest -------------------- */

/**
 * Individual card inside a chest result.
 * Every chest gives ONE character (1-3 copies of the same id).
 */
export interface ChestCard {
  cardId: string
  tier: ChestTier
  /** first copy of this character ever received (prev count was 0) */
  isNew: boolean
  /** how many copies of this character the pack contained (1-3) */
  copies: number
}

/* -------------------- public ChestResult + rollChest (single-card pack) -------------------- */

export interface ChestResult {
  startTier: ChestTier
  finalTier: ChestTier
  upgradesAt: number[]
  gems: number
  dust: number
  /** the single character contained in this chest pack (all copies same id) */
  cardId: string
  /** how many copies of cardId this pack contained (1-3) */
  copies: number
  /** isNew = the player has not unlocked cardId yet (first-ever drop) */
  isNew: boolean
  /** true if the pack was forced to a still-LOCKED character (pity) */
  pity: boolean
  /** the single card in this chest pack (kept as an array for UI compat) */
  cards: ChestCard[]
}

/** Roll a full chest for one lesson.
 *  - `ctx`     : 'normal' | 'boss' | 'lucky' | 'streak'
 *  - `counts`  : the player's per-character copy counts
 *  - `pity`    : consecutive chests without a still-locked drop
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

  // 3) pack size (copies) for this final tier — the OLD mechanism: 1-3
  //    copies of ONE character (PACK_SIZE table; rarity tables untouched).
  const [cMin, cMax] = PACK_SIZE[tier]
  const copies = cMin === cMax ? cMin : randInt(rand, cMin, cMax)

  // 4) pick ONE character: uniform-random from all 97 chest cards, except
  //    locked-pity forces a still-locked (0-copy) character on drought.
  const forceLocked = pity >= LOCKED_PITY
  let cardId: string | null = null
  let didPity = false
  if (forceLocked) {
    const locked = CARDS.filter((c) => (counts[c.id] ?? 0) === 0)
    if (locked.length > 0) {
      cardId = locked[Math.floor(rand() * locked.length)].id
      didPity = true
    }
  }
  if (cardId === null) {
    cardId = CARDS[Math.floor(rand() * CARDS.length)].id
  }
  const def = CARD_BY_ID[cardId]
  const isNew = (counts[cardId] ?? 0) === 0

  return {
    startTier,
    finalTier: tier,
    upgradesAt,
    gems,
    dust: 0,
    cardId,
    copies,
    isNew,
    pity: didPity,
    cards: [{ cardId, tier: def.tier, isNew, copies }],
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


// Legacy compatibility exports (tests reference these constants)
export const CARD_CHANCE = 0.1
export const PITY_LIMIT = 15
export const COLLECTION_JACKPOT = 300
