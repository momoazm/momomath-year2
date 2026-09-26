import type { BookDef } from '../../types'

/** Public-domain classic retold in original wording for Year 2 readers. */
export const CLS_TORTOISE: BookDef = {
  id: 'cls-tortoise',
  unitId: 'e3',
  title: 'The Tortoise and the Hare',
  pages: [
    { scene: ['🐢', '🐇'], text: 'A slow tortoise and a fast hare lived by the same green hill.', focus: 'slow' },
    { scene: ['🐇', '🗣️'], text: 'The hare laughed at the tortoise. “You walk too slowly!” he teased.' },
    { scene: ['🏁', '🐢'], text: '“Let us have a race,” said the tortoise. The hare could not stop laughing.' },
    { scene: ['🐇', '😴'], text: 'The hare was sure he would win, so he lay down for a nap.', focus: 'nap' },
    { scene: ['🐢', '👟'], text: 'Step by step, the tortoise walked past the sleeping hare and kept going.' },
    { scene: ['🏆', '🐢'], text: 'The tortoise reached the hill first and won the race. Slow and steady can win.', focus: 'steady' },
  ],
  questions: [
    {
      kind: 'mcq',
      prompt: 'Who won the race?',
      choices: ['The hare', 'The tortoise', 'The fox'],
      answerIndex: 1,
      hint: 'He never stopped walking.',
    },
    {
      kind: 'mcq',
      prompt: 'What did the hare do while the tortoise walked?',
      choices: ['He took a nap', 'He ran all the way', 'He ate a carrot'],
      answerIndex: 0,
      hint: 'He was too sure of winning.',
    },
    {
      kind: 'mcq',
      prompt: 'How did the tortoise move along the path?',
      choices: ['He hopped fast', 'He slept too', 'Step by step'],
      answerIndex: 2,
      hint: 'One small foot after another.',
    },
  ],
}
