import type { BookDef } from '../../types'

/** Unit 6 storybook — Sentence Mechanics. */
export const BOOK_E6: BookDef = {
  id: 'bk-e6',
  unitId: 'e6',
  title: 'The Comma Train',
  questions: [
    { kind: 'mcq', prompt: 'What do commas do in a list?', choices: ['make a tiny pause', 'end the sentence', 'shout the words'], answerIndex: 0, hint: 'Take a tiny pause.' },
    { kind: 'mcq', prompt: 'What ended the ride?', choices: ['the full stop station', 'the comma bridge', 'the question car'], answerIndex: 0, hint: 'It finishes the sentence.' },
    { kind: 'mcq', prompt: 'Which one is NOT a job of a comma?', choices: ['separate items in a list', 'end a sentence', 'make a tiny pause'], answerIndex: 1, hint: 'Full stops do that job.' },
  ],
  pages: [
    { scene: ['🚂', '🎫'], text: 'All aboard the comma train!' },
    { scene: ['🥛', '🥚'], text: 'First car: milk, eggs, and bread.' },
    { scene: ['⏸️', '🎵'], text: 'Take a tiny pause at every comma.', focus: 'pause' },
    { scene: ['❓', '💬'], text: 'The question car asked: “All ready?”' },
    { scene: ['🛑', '🏁'], text: 'The full stop station ended the ride.' },
    { scene: ['📗', '⏸️'], text: 'Capitals start, commas pause, full stops finish!' },
  ],
}
