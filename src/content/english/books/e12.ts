import type { BookDef } from '../../types'

/** Unit 12 storybook — Poetry Corner. */
export const BOOK_E12: BookDef = {
  id: 'bk-e12',
  unitId: 'e12',
  title: 'The Broken Poem',
  pages: [
    { scene: ['📜', '😢'], text: 'A poem lost its rhyme and its beat.' },
    { scene: ['🐱', '🎩'], text: 'cat and hat rhyme — pair them up!', focus: 'rhyme' },
    { scene: ['🥁', '👏'], text: 'Clap the beat: boom, clap, boom!' },
    { scene: ['🔥', '🎭'], text: 'Blaze performed it loud, then soft.' },
    { scene: ['✨', '🎶'], text: 'The poem sparkled once again!' },
    { scene: ['📖', '🎵'], text: 'Rhyme, beat, and feeling make poems shine.', focus: 'feeling' },
  ],
}
