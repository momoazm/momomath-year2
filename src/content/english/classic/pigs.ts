import type { BookDef } from '../../types'

/** Public-domain classic retold in original wording for Year 2 readers. */
export const CLS_PIGS: BookDef = {
  id: 'cls-pigs',
  unitId: 'e1',
  title: 'The Three Little Pigs',
  pages: [
    { scene: ['🐷', '🐷', '🐷'], text: 'Three little pigs set off to build homes of their own.', focus: 'build' },
    { scene: ['🌾', '🏠'], text: 'The first pig built a house of straw. It was done by lunchtime.', focus: 'straw' },
    { scene: ['🪵', '🏠'], text: 'The second pig built a house of sticks. It took only a morning.' },
    { scene: ['🧱', '💪'], text: 'The third pig worked all day and built a house of bricks.', focus: 'bricks' },
    { scene: ['🐺', '💨'], text: 'A big wolf came and blew the straw and the stick houses down.' },
    { scene: ['🧱', '🛡️', '🐷'], text: 'The wolf could not blow down the bricks. At last the pigs were safe.' },
  ],
  questions: [
    {
      kind: 'mcq',
      prompt: 'What was the first little house made of?',
      choices: ['Bricks', 'Sticks', 'Straw'],
      answerIndex: 2,
      hint: 'It was so light the wind carried it away.',
    },
    {
      kind: 'mcq',
      prompt: 'Which house could the wolf NOT blow down?',
      choices: ['The straw house', 'The brick house', 'The stick house'],
      answerIndex: 1,
      hint: 'Bricks are strong and heavy.',
    },
    {
      kind: 'mcq',
      prompt: 'How many little pigs are in the story?',
      choices: ['Three', 'Two', 'Four'],
      answerIndex: 0,
      hint: 'Count them on the very first page.',
    },
  ],
}
