import type { BookDef } from '../../types'

/** Unit 11 storybook — Fact Finder. */
export const BOOK_E11: BookDef = {
  id: 'bk-e11',
  unitId: 'e11',
  title: 'Truth or Trick?',
  pages: [
    { scene: ['🥷', '📰'], text: 'Shadow opened a page full of facts.' },
    { scene: ['🌍', '✅'], text: '“Earth orbits the Sun” — true and checkable!' },
    { scene: ['🤥', '🐟'], text: '“Fish climb trees” — silly trick!' },
    { scene: ['🧠', '💡'], text: 'Facts can be proven. Tricks cannot.', focus: 'proven' },
    { scene: ['🥽', '🔎'], text: '“Fact goggles on!” Shadow smiled.' },
    { scene: ['📗', '✅'], text: 'Facts are true — find the words that prove it.', focus: 'prove' },
  ],
}
