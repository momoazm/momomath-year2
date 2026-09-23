/* Official enemy/boss art (copied from sonic-world — see ATTRIBUTION.md).
 * Files live in public/images/enemies/ and public/images/players/.
 * Paths are BASE_URL-safe for GH Pages (/momomath-year2/). */

const BASE = 'images/enemies/'

export const ENEMY_ART: Record<string, string> = {
  'Metal Sonic': 'metal-sonic.webp',
  'Egg Pawn Captain': 'egg-pawn-captain.webp',
  'Tails Doll': 'tails-doll.webp',
  'Buzz Bomber Armada': 'buzz-bomber-armada.webp',
  'Frozen Egg Robot': 'frozen-egg-robot.webp',
  'Mecha Sonic': 'mecha-sonic.webp',
  'Shadow Bot': 'shadow-bot.webp',
  'Dr. Eggman': 'dr-eggman.webp',
  Motobug: 'motobug.webp',
  'Buzz Bomber': 'buzz-bomber.webp',
  Chopper: 'chopper.webp',
  'Egg Pawn': 'egg-pawn.webp',
  Driptooter: 'driptooter.webp',
  Grabber: 'grabber.webp',
  Spiker: 'spiker.webp',
  Yadrin: 'yadrin.webp',
  'Bomber Hawk': 'bomber-hawk.webp',
  Buzzer: 'buzzer.webp',
  Mantis: 'mantis.webp',
  'Pengu-Bot': 'pengu-bot.webp',
  Grounder: 'grounder.webp',
  Scratch: 'scratch.webp',
  Coconuts: 'coconuts.webp',
  Aquis: 'aquis.webp',
  "Jet Prop'n": 'jet-propn.webp',
  Krako: 'krako.webp',
  'Swat-Bot': 'swat-bot.webp',
  'Pata-Bata': 'pata-bata.webp',
  Butterdroid: 'butterdroid.webp',
  'Egg Robo': 'egg-robo.webp',
  'Silver Sonic': 'silver-sonic.webp',
  'Death Egg Robot': 'death-egg-robot.webp',
}

/** URL for a display name. Returns null when no art exists — callers fall back to emoji. */
export function enemyArt(name: string): string | null {
  const direct = ENEMY_ART[name]
  if (direct) return `${import.meta.env.BASE_URL}${BASE}${direct}`
  if (name.endsWith(' Mini')) {
    const base = ENEMY_ART[name.slice(0, -5)]
    if (base) return `${import.meta.env.BASE_URL}${BASE}${base}`
  }
  return null
}

const PLAYER_FILES: Record<string, string> = {
  sonic: 'sonic.webp',
}

export function playerArt(id: string): string | null {
  const f = PLAYER_FILES[id]
  return f ? `${import.meta.env.BASE_URL}images/players/${f}` : null
}
