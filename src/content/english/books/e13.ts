import type { BookDef } from '../../types'

/** Unit 13 storybook — Author Studio. */
export const BOOK_E13: BookDef = {
  id: 'bk-e13',
  unitId: 'e13',
  title: 'The Blank Page',
  questions: [
    { kind: 'mcq', prompt: 'What do you ask first when planning?', choices: ['who, what, where', 'edit, publish, rest', 'read, rest, repeat'], answerIndex: 0, hint: 'The first page says it.' },
    { kind: 'mcq', prompt: 'The story sandwich has...', choices: ['top and bottom only', 'beginning, middle, end', 'commas and stops'], answerIndex: 1, hint: 'Like a real sandwich!' },
    { kind: 'mcq', prompt: 'Before you finish, check capitals, spaces, and...', choices: ['pictures', 'full stops', 'rhymes'], answerIndex: 1, hint: 'They end every sentence.' },
  ],
  pages: [
    { scene: ['📄', '💭'], text: 'A blank page waited for a story.' },
    { scene: ['📝', '🗺️'], text: 'First, plan: who, what, where?' },
    { scene: ['🥪', '📖'], text: 'Beginning, middle, end — the story sandwich.', focus: 'beginning' },
    { scene: ['🌈', '👀'], text: 'Describe with your senses: see, hear, feel.' },
    { scene: ['🔍', '✍️'], text: 'Check capitals, spaces, and full stops.' },
    { scene: ['📚', '🎉'], text: 'Plan, write, check — you are an author!', focus: 'author' },
  ],
}
