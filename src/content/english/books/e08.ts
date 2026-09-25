import type { BookDef } from '../../types'

/** Unit 8 storybook — Verb Time Machine. */
export const BOOK_E8: BookDef = {
  id: 'bk-e8',
  unitId: 'e8',
  title: 'The Time-Traveling Verbs',
  pages: [
    { scene: ['🛠️', '⏰'], text: 'Cream built a time machine for verbs.' },
    { scene: ['🎮', '➡️'], text: 'Present: I play the game now.' },
    { scene: ['⏪', '🎞️'], text: 'Past: I played the game yesterday.' },
    { scene: ['⏳', '➕'], text: '-ing means happening right now: I am playing!', focus: 'playing' },
    { scene: ['🔩', '🎉'], text: 'The machine hummed: verbs can travel in time!' },
    { scene: ['📖', '⏰'], text: 'Present is now, past is before — pick the tense!', focus: 'tense' },
  ],
}
