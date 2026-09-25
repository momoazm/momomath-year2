import type { BookDef } from '../../types'

/** Unit 4 storybook — Spelling Stars. */
export const BOOK_E4: BookDef = {
  id: 'bk-e4',
  unitId: 'e4',
  title: 'The Homophone Twins',
  pages: [
    { scene: ['👯', '🗣️'], text: 'there and their sound exactly the same.' },
    { scene: ['🗺️', '➡️'], text: 'there points to a place: look over there!' },
    { scene: ['👑', '🔴'], text: 'their shows who owns it: their red ball.' },
    { scene: ['😁', '✍️'], text: 'The twins grinned: “Choose us right!”' },
    { scene: ['🌟', '✅'], text: 'You picked correctly — the stars sparkled!' },
    { scene: ['🏅', '📖'], text: 'Same sound, different spelling — read for meaning!', focus: 'meaning' },
  ],
}
