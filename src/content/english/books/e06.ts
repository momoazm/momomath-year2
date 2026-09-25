import type { BookDef } from '../../types'

/** Unit 6 storybook — Sentence Mechanics. */
export const BOOK_E6: BookDef = {
  id: 'bk-e6',
  unitId: 'e6',
  title: 'The Comma Train',
  pages: [
    { scene: ['🚂', '🎫'], text: 'All aboard the comma train!' },
    { scene: ['🥛', '🥚'], text: 'First car: milk, eggs, and bread.' },
    { scene: ['⏸️', '🎵'], text: 'Take a tiny pause at every comma.', focus: 'pause' },
    { scene: ['❓', '💬'], text: 'The question car asked: “All ready?”' },
    { scene: ['🛑', '🏁'], text: 'The full stop station ended the ride.' },
    { scene: ['📗', '⏸️'], text: 'Capitals start, commas pause, full stops finish!' },
  ],
}
