import type { BookDef } from '../../types'

/** Unit 4 storybook — Spelling Stars. */
export const BOOK_E4: BookDef = {
  id: 'bk-e4',
  unitId: 'e4',
  title: 'The Homophone Twins',
  questions: [
    { kind: 'mcq', prompt: 'Which word points to a place?', choices: ['their', 'there', 'they are'], answerIndex: 1, hint: 'Look over ___!' },
    { kind: 'mcq', prompt: '"Their red ball" tells us...', choices: ['who owns it', 'where the ball is', 'when it broke'], answerIndex: 0, hint: 'It belongs to someone.' },
    { kind: 'mcq', prompt: 'there and their sound...', choices: ['exactly the same', 'totally different', 'like a song'], answerIndex: 0, hint: 'They are homophones.' },
  ],
  pages: [
    { scene: ['👯', '🗣️'], text: 'there and their sound exactly the same.' },
    { scene: ['🗺️', '➡️'], text: 'there points to a place: look over there!' },
    { scene: ['👑', '🔴'], text: 'their shows who owns it: their red ball.' },
    { scene: ['😁', '✍️'], text: 'The twins grinned: “Choose us right!”' },
    { scene: ['🌟', '✅'], text: 'You picked correctly — the stars sparkled!' },
    { scene: ['🏅', '📖'], text: 'Same sound, different spelling — read for meaning!', focus: 'meaning' },
  ],
}
