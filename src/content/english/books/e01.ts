import type { BookDef } from '../../types'

/** Unit 1 storybook — Sound Detectives (phonics). */
export const BOOK_E1: BookDef = {
  id: 'bk-e1',
  unitId: 'e1',
  title: 'The Sneaky Sound',
  pages: [
    { scene: ['🎩', '🌙'], text: 'Detective Tails heard a sneaky sound at night.', focus: 'sneaky' },
    { scene: ['👂', '💭'], text: '“Come out!” he whispered. The sound giggled back.' },
    { scene: ['🐱', '📢'], text: 'A kitten said “sss” instead of “meow”!' },
    { scene: ['🧩', '✅'], text: 'Tails matched it: the letter S says “sss”.' },
    { scene: ['🎉', '🔎'], text: '“Case solved!” he cheered. The sound was found!' },
    { scene: ['🏅', '🔍'], text: 'Sneaky sounds hide inside words — listen closely!', focus: 'listen' },
  ],
}
