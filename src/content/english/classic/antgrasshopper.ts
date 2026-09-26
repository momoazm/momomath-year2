import type { BookDef } from '../../types'

/** Public-domain classic retold in original wording for Year 2 readers. */
export const CLS_ANTGRASS: BookDef = {
  id: 'cls-antgrass',
  unitId: 'e5',
  title: 'The Ant and the Grasshopper',
  pages: [
    { scene: ['🐜', '☀️'], text: 'All summer long, an ant carried grain to her nest, piece by piece.', focus: 'grain' },
    { scene: ['🦗', '🎵'], text: 'Nearby, a grasshopper sat in the sun and sang all day long.' },
    { scene: ['🍂', '❄️'], text: 'Then winter came, and white snow covered the ground.', focus: 'winter' },
    { scene: ['🦗', '🥶'], text: 'The grasshopper was hungry and cold. He had no food at all.' },
    { scene: ['🐜', '🍞'], text: 'He went to the ant and asked for just one crumb of bread.' },
    { scene: ['🤝', '🐜', '🦗'], text: 'The grasshopper promised to work hard next summer, just like the ant.', focus: 'work' },
  ],
  questions: [
    {
      kind: 'mcq',
      prompt: 'What did the ant do all summer?',
      choices: ['She sang all day', 'She gathered food', 'She slept in the sun'],
      answerIndex: 1,
      hint: 'She carried grain into her nest.',
    },
    {
      kind: 'mcq',
      prompt: 'When did the grasshopper feel hungry?',
      choices: ['In spring', 'In summer', 'In winter'],
      answerIndex: 2,
      hint: 'The snow had covered the ground by then.',
    },
    {
      kind: 'mcq',
      prompt: 'What did the grasshopper ask the ant for?',
      choices: ['A crumb of bread', 'A new song', 'A race'],
      answerIndex: 0,
      hint: 'He wanted something to eat.',
    },
  ],
}
