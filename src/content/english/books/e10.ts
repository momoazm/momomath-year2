import type { BookDef } from '../../types'

/** Unit 10 storybook — Story Quests. */
export const BOOK_E10: BookDef = {
  id: 'bk-e10',
  unitId: 'e10',
  title: 'The Torn Story',
  pages: [
    { scene: ['💨', '📚'], text: 'The Big Story Boss scattered every page!' },
    { scene: ['🔍', '🧩'], text: 'Tails gathered the clues: who, where, when.' },
    { scene: ['1️⃣', '2️⃣'], text: 'Order them: first, next, then, last.', focus: 'order' },
    { scene: ['🔮', '❓'], text: 'Clues hinted at the ending — guess it!' },
    { scene: ['🪡', '📖'], text: 'The story stitched itself back together!' },
    { scene: ['🎉', '📚'], text: 'Stories have order, heroes, and hidden clues.', focus: 'clues' },
  ],
}
