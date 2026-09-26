import type { BookDef } from '../../types'

/** Unit 11 storybook — Fact Finder. */
export const BOOK_E11: BookDef = {
  id: 'bk-e11',
  unitId: 'e11',
  title: 'Truth or Trick?',
  questions: [
    { kind: 'mcq', prompt: '"Earth orbits the Sun" is a...', choices: ['fact', 'trick', 'joke'], answerIndex: 0, hint: 'It is true and checkable.' },
    { kind: 'mcq', prompt: '"Fish climb trees" is a...', choices: ['fact', 'silly trick', 'rhyme'], answerIndex: 1, hint: 'Fish cannot climb!' },
    { kind: 'mcq', prompt: 'How do we know something is a fact?', choices: ['it can be proven', 'it sounds funny', 'it is very long'], answerIndex: 0, hint: 'Shadow wore fact goggles.' },
  ],
  pages: [
    { scene: ['🥷', '📰'], text: 'Shadow opened a page full of facts.' },
    { scene: ['🌍', '✅'], text: '“Earth orbits the Sun” — true and checkable!' },
    { scene: ['🤥', '🐟'], text: '“Fish climb trees” — silly trick!' },
    { scene: ['🧠', '💡'], text: 'Facts can be proven. Tricks cannot.', focus: 'proven' },
    { scene: ['🥽', '🔎'], text: '“Fact goggles on!” Shadow smiled.' },
    { scene: ['📗', '✅'], text: 'Facts are true — find the words that prove it.', focus: 'prove' },
  ],
}
