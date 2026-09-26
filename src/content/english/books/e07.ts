import type { BookDef } from '../../types'

/** Unit 7 storybook — Naming & Describing Words. */
export const BOOK_E7: BookDef = {
  id: 'bk-e7',
  unitId: 'e7',
  title: 'The Noun Grows',
  questions: [
    { kind: 'mcq', prompt: 'Which is a noun phrase from the story?', choices: ['he flew', 'the little red dragon', 'shining'], answerIndex: 1, hint: 'It grew bigger and brighter.' },
    { kind: 'mcq', prompt: 'Which pronoun swapped in for the noun?', choices: ['HE', 'the', 'red'], answerIndex: 0, hint: 'It is a capital-letter word.' },
    { kind: 'mcq', prompt: 'What grows your nouns?', choices: ['commas and full stops', 'articles and describing words', 'numbers'], answerIndex: 1, hint: 'little, red - describing words!' },
  ],
  pages: [
    { scene: ['🐸', '🐉'], text: 'Felix found a small noun: dragon.' },
    { scene: ['🔴', '✨'], text: 'He added words: the little red dragon!' },
    { scene: ['📈', '💪'], text: 'The noun phrase grew bigger and brighter!' },
    { scene: ['🏷️', '🛫'], text: 'A pronoun swapped in: HE flew away!' },
    { scene: ['💬', '🌟'], text: '“Big descriptions make stories shine!”' },
    { scene: ['🏷️', '📗'], text: 'Articles and describing words grow your nouns.', focus: 'describing' },
  ],
}
