import type { BookDef } from '../../types'

/** Unit 5 storybook — Word Explorer. */
export const BOOK_E5: BookDef = {
  id: 'bk-e5',
  unitId: 'e5',
  title: 'The Treasure of New Words',
  questions: [
    { kind: 'mcq', prompt: 'What did "enormous" mean in the story?', choices: ['very, very big', 'very, very small', 'very, very slow'], answerIndex: 0, hint: 'The clues said "very, very...".' },
    { kind: 'mcq', prompt: 'How did Captain Amy unlock the meaning?', choices: ['She closed the book', 'She read around the word', 'She sailed home'], answerIndex: 1, hint: 'Clues nearby helped her.' },
    { kind: 'mcq', prompt: 'Where did Captain Amy sail?', choices: ['Moon Mountain', 'Word Island', 'Comma City'], answerIndex: 1, hint: 'The treasure was new words.' },
  ],
  pages: [
    { scene: ['🗺️', '⛵'], text: 'Captain Amy sailed to Word Island.' },
    { scene: ['📜', '🔎'], text: 'She found a scroll with a strange word: enormous.', focus: 'enormous' },
    { scene: ['🧩', '💡'], text: 'Clues nearby meant: very, very big!' },
    { scene: ['🚪', '🐘'], text: 'The island door was enormous — huge!' },
    { scene: ['💰', '🎉'], text: '“New words are treasure!” she cheered.' },
    { scene: ['🧭', '📗'], text: 'Read around a word to unlock its meaning.', focus: 'unlock' },
  ],
}
