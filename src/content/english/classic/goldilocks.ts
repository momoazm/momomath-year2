import type { BookDef } from '../../types'

/** Public-domain classic retold in original wording for Year 2 readers. */
export const CLS_GOLDILOCKS: BookDef = {
  id: 'cls-goldilocks',
  unitId: 'e6',
  title: 'Goldilocks and the Three Bears',
  pages: [
    { scene: ['👧', '🌲'], text: 'Goldilocks wandered into the woods and found a little house.', focus: 'house' },
    { scene: ['🚪', '🥣'], text: 'She knocked, but nobody answered. Inside were three bowls of porridge.', focus: 'porridge' },
    { scene: ['🥣', '😮‍💨'], text: 'The big bowl was too hot and the middle bowl was too cold. The small bowl was just right.' },
    { scene: ['🪑', '💥'], text: 'She tried three chairs. The big chair broke with a loud crack!' },
    { scene: ['🛏️', '😴'], text: 'Next she climbed into a little bed and fell fast asleep.', focus: 'bed' },
    { scene: ['🐻', '🐻', '🏃'], text: 'The three bears came home and woke her up. Goldilocks ran all the way home.' },
  ],
  questions: [
    {
      kind: 'mcq',
      prompt: 'What was in the three bowls?',
      choices: ['Porridge', 'Apples', 'Soup'],
      answerIndex: 0,
      hint: 'It is a warm breakfast food.',
    },
    {
      kind: 'mcq',
      prompt: 'Which chair broke?',
      choices: ['The small chair', 'The big chair', 'The middle chair'],
      answerIndex: 1,
      hint: 'It was the largest of the three.',
    },
    {
      kind: 'mcq',
      prompt: 'What did Goldilocks do at the end?',
      choices: ['She ate more porridge', 'She went to sleep again', 'She ran home'],
      answerIndex: 2,
      hint: 'The bears found her in the bedroom.',
    },
  ],
}
