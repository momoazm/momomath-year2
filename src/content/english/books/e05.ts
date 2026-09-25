import type { BookDef } from '../../types'

/** Unit 5 storybook — Word Explorer. */
export const BOOK_E5: BookDef = {
  id: 'bk-e5',
  unitId: 'e5',
  title: 'The Treasure of New Words',
  pages: [
    { scene: ['🗺️', '⛵'], text: 'Captain Amy sailed to Word Island.' },
    { scene: ['📜', '🔎'], text: 'She found a scroll with a strange word: enormous.', focus: 'enormous' },
    { scene: ['🧩', '💡'], text: 'Clues nearby meant: very, very big!' },
    { scene: ['🚪', '🐘'], text: 'The island door was enormous — huge!' },
    { scene: ['💰', '🎉'], text: '“New words are treasure!” she cheered.' },
    { scene: ['🧭', '📗'], text: 'Read around a word to unlock its meaning.', focus: 'unlock' },
  ],
}
