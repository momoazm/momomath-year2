import type { BookDef } from '../../types'

/** Unit 12 storybook — Poetry Corner. */
export const BOOK_E12: BookDef = {
  id: 'bk-e12',
  unitId: 'e12',
  title: 'The Broken Poem',
  questions: [
    { kind: 'mcq', prompt: 'Which two words rhyme?', choices: ['cat and dog', 'cat and hat', 'hat and dog'], answerIndex: 1, hint: 'They end with the same sound.' },
    { kind: 'mcq', prompt: 'When you clap the beat, you feel the poem\'s...', choices: ['beat', 'title', 'cover'], answerIndex: 0, hint: 'Boom, clap, boom!' },
    { kind: 'mcq', prompt: 'What makes poems shine?', choices: ['long words', 'rhyme, beat, and feeling', 'full stops'], answerIndex: 1, hint: 'All three together!' },
  ],
  pages: [
    { scene: ['📜', '😢'], text: 'A poem lost its rhyme and its beat.' },
    { scene: ['🐱', '🎩'], text: 'cat and hat rhyme — pair them up!', focus: 'rhyme' },
    { scene: ['🥁', '👏'], text: 'Clap the beat: boom, clap, boom!' },
    { scene: ['🔥', '🎭'], text: 'Blaze performed it loud, then soft.' },
    { scene: ['✨', '🎶'], text: 'The poem sparkled once again!' },
    { scene: ['📖', '🎵'], text: 'Rhyme, beat, and feeling make poems shine.', focus: 'feeling' },
  ],
}
