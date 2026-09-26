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
  questions: [
    { kind: 'mcq', prompt: 'What sound does the letter S make?', choices: ['sss', 'meow', 'woof'], answerIndex: 0, hint: 'The kitten said it!' },
    { kind: 'mcq', prompt: 'Who heard the sneaky sound at night?', choices: ['Captain Amy', 'Detective Tails', 'Shadow'], answerIndex: 1, hint: 'He wore a hat and a cape.' },
    { kind: 'mcq', prompt: 'What should you do to find sounds in words?', choices: ['Close your eyes', 'Listen closely', 'Run away'], answerIndex: 1, hint: 'The last page tells you.' },
  ],
}
