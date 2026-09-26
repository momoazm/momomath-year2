import type { BookDef } from '../../types'

/** Public-domain classic retold in original wording for Year 2 readers. */
export const CLS_BILLYGOATS: BookDef = {
  id: 'cls-billygoats',
  unitId: 'e4',
  title: 'The Three Billy Goats Gruff',
  pages: [
    { scene: ['🐐', '🐐', '🐐'], text: 'Three billy goats Gruff wanted to cross a bridge to a green hill.', focus: 'bridge' },
    { scene: ['🐐', '🌿'], text: 'The little goat went first. His small hooves went trip, trap, trip, trap.' },
    { scene: ['🧌', '🌉'], text: 'A hungry troll lived under the bridge and growled at him.', focus: 'troll' },
    { scene: ['🐐', '🌉'], text: 'The middle goat trotted over. The troll roared, “Who is tapping on my bridge?”' },
    { scene: ['🐐', '💪', '🌉'], text: 'Then the biggest goat came. His heavy hooves shook the whole bridge.' },
    { scene: ['💥', '🐐', '🌱'], text: 'The big goat bumped the troll into the brook, and all three goats ate the grass.' },
  ],
  questions: [
    {
      kind: 'mcq',
      prompt: 'Where did the troll live?',
      choices: ['In a tree', 'On the hill', 'Under the bridge'],
      answerIndex: 2,
      hint: 'He liked to surprise anyone who crossed.',
    },
    {
      kind: 'mcq',
      prompt: 'What did the goats want to reach?',
      choices: ['A green hill', 'A farm yard', 'A pond'],
      answerIndex: 0,
      hint: 'It had soft, tasty grass.',
    },
    {
      kind: 'mcq',
      prompt: 'How did the biggest goat stop the troll?',
      choices: ['He sang a song', 'He bumped him off the bridge', 'He ran away'],
      answerIndex: 1,
      hint: 'He used his strong head and horns.',
    },
  ],
}
