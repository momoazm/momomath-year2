import type { BookDef } from '../../types'

/** Unit 13 storybook — Author Studio. */
export const BOOK_E13: BookDef = {
  id: 'bk-e13',
  unitId: 'e13',
  title: 'The Blank Page',
  pages: [
    { scene: ['📄', '💭'], text: 'A blank page waited for a story.' },
    { scene: ['📝', '🗺️'], text: 'First, plan: who, what, where?' },
    { scene: ['🥪', '📖'], text: 'Beginning, middle, end — the story sandwich.', focus: 'beginning' },
    { scene: ['🌈', '👀'], text: 'Describe with your senses: see, hear, feel.' },
    { scene: ['🔍', '✍️'], text: 'Check capitals, spaces, and full stops.' },
    { scene: ['📚', '🎉'], text: 'Plan, write, check — you are an author!', focus: 'author' },
  ],
}
