/** Word Rescue arcade bank — year-2 UK spellings.
 *  Each entry: an emoji clue + the correct word + 3 plausible misspellings
 *  (same sound, wrong digraph/split-vowel/etc). Rounds pick entries at random. */
export interface WordRescueEntry {
  emoji: string
  answer: string
  wrong: [string, string, string]
}

export const WORD_RESCUE_BANK: WordRescueEntry[] = [
  { emoji: '🌱', answer: 'ship', wrong: ['sheep', 'shop', 'skip'] },
  { emoji: '🚁', answer: 'chick', wrong: ['check', 'shick', 'chuck'] },
  { emoji: '☀️', answer: 'shine', wrong: ['shin', 'sine', 'shinee'] },
  { emoji: '🐸', answer: 'frog', wrong: ['frogg', 'phrog', 'frag'] },
  { emoji: '🌙', answer: 'night', wrong: ['nite', 'knigt', 'nithe'] },
  { emoji: '🔒', answer: 'lock', wrong: ['loch', 'luck', 'locke'] },
  { emoji: '🌧️', answer: 'rain', wrong: ['rayn', 'rane', 'rein'] },
  { emoji: '🐝', answer: 'bee', wrong: ['be', 'bie', 'bay'] },
  { emoji: '🚗', answer: 'road', wrong: ['rode', 'roud', 'rowd'] },
  { emoji: '🌊', answer: 'wave', wrong: ['wavy', 'waive', 'wove'] },
  { emoji: '🎂', answer: 'cake', wrong: ['kake', 'cak', 'cakee'] },
  { emoji: '🐝', answer: 'field', wrong: ['feeld', 'feild', 'filled'] },
  { emoji: '💧', answer: 'drip', wrong: ['drup', 'driip', 'drap'] },
  { emoji: '🧦', answer: 'sock', wrong: ['sok', 'socke', 'sack'] },
  { emoji: '🐟', answer: 'fish', wrong: ['fishe', 'phish', 'fush'] },
  { emoji: '🌙', answer: 'moon', wrong: ['mone', 'moone', 'morn'] },
  { emoji: '🌳', answer: 'tree', wrong: ['tre', 'three', 'trie'] },
  { emoji: '🐑', answer: 'sheep', wrong: ['sheap', 'ship', 'shiep'] },
  { emoji: '📖', answer: 'book', wrong: ['booke', 'buk', 'beak'] },
  { emoji: '🍎', answer: 'apple', wrong: ['aple', 'appel', 'applee'] },
  { emoji: '🌙', answer: 'light', wrong: ['lite', 'lithe', 'like'] },
  { emoji: '🐔', answer: 'chick', wrong: ['chck', 'shick', 'cheek'] },
  { emoji: '💡', answer: 'lamp', wrong: ['lampе', 'lomp', 'limp'] },
  { emoji: '🚪', answer: 'door', wrong: ['dore', 'dour', 'doar'] },
  { emoji: '🚂', answer: 'train', wrong: ['trane', 'tryne', 'trail'] },
  { emoji: '⚽', answer: 'ball', wrong: ['bale', 'boll', 'bell'] },
  { emoji: '🎈', answer: 'balloon', wrong: ['baloon', 'baloone', 'baloun'] },
  { emoji: '🚀', answer: 'rocket', wrong: ['rockit', 'rokett', 'rockect'] },
  { emoji: '🍓', answer: 'strawberry', wrong: ['strawberee', 'strawbary', 'strawberryy'] },
  { emoji: '🌧️', answer: 'weather', wrong: ['wether', 'weathur', 'weathe'] },
  { emoji: '🐑', answer: 'wool', wrong: ['wall', 'woll', 'woole'] },
  { emoji: '🐣', answer: 'hatch', wrong: ['hach', 'hatsh', 'etch'] },
  { emoji: '🪺', answer: 'nest', wrong: ['nist', 'nast', 'net'] },
  { emoji: '🌈', answer: 'rainbow', wrong: ['rainbo', 'raynbow', 'rainbou'] },
  { emoji: '❄️', answer: 'snow', wrong: ['sno', 'snowe', 'snew'] },
  { emoji: '🍂', answer: 'leaf', wrong: ['leef', 'lefe', 'life'] },
  { emoji: '🌸', answer: 'bloom', wrong: ['blome', 'bluom', 'bloem'] },
  { emoji: '🔥', answer: 'fire', wrong: ['fyre', 'firee', 'far'] },
  { emoji: '💧', answer: 'water', wrong: ['watter', 'woter', 'watr'] },
  { emoji: '⭐', answer: 'twinkle', wrong: ['twinkl', 'twincl', 'twinkal'] },
]

/** Pick a random entry plus a shuffled 4-option list. */
export function rollWordQuestion(rand: () => number = Math.random) {
  const e = WORD_RESCUE_BANK[Math.floor(rand() * WORD_RESCUE_BANK.length)]
  const options = [e.answer, ...e.wrong].sort(() => rand() - 0.5)
  return { emoji: e.emoji, text: `${e.emoji}  Which is spelled right?`, answer: e.answer, options }
}
