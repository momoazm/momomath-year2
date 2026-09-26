import type { BookDef } from '../../types'

/** Unit 10 storybook — Story Quests. */
export const BOOK_E10: BookDef = {
  id: 'bk-e10',
  unitId: 'e10',
  title: 'The Torn Story',
  questions: [
    { kind: 'mcq', prompt: 'What clues did Tails gather?', choices: ['who, where, when', 'cat, dog, bird', 'red, blue, green'], answerIndex: 0, hint: 'Story detectives look for these.' },
    { kind: 'mcq', prompt: 'What is the right order of a story?', choices: ['first, next, then, last', 'last, first, next, then', 'next, last, first, then'], answerIndex: 0, hint: 'Start at the start!' },
    { kind: 'mcq', prompt: 'Stories have order, heroes, and...', choices: ['hidden commas', 'hidden clues', 'hidden numbers'], answerIndex: 1, hint: 'Detectives find them!' },
  ],
  pages: [
    { scene: ['💨', '📚'], text: 'The Big Story Boss scattered every page!' },
    { scene: ['🔍', '🧩'], text: 'Tails gathered the clues: who, where, when.' },
    { scene: ['1️⃣', '2️⃣'], text: 'Order them: first, next, then, last.', focus: 'order' },
    { scene: ['🔮', '❓'], text: 'Clues hinted at the ending — guess it!' },
    { scene: ['🪡', '📖'], text: 'The story stitched itself back together!' },
    { scene: ['🎉', '📚'], text: 'Stories have order, heroes, and hidden clues.', focus: 'clues' },
  ],
}
