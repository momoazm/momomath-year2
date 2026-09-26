import type { BookDef } from '../../types'

/** Unit 9 storybook — Super Sentences. */
export const BOOK_E9: BookDef = {
  id: 'bk-e9',
  unitId: 'e9',
  title: 'The Join Bridge',
  questions: [
    { kind: 'mcq', prompt: 'Which joiner adds a reason?', choices: ['but', 'or', 'because'], answerIndex: 2, hint: 'I slept ___ I was tired.' },
    { kind: 'mcq', prompt: 'Which word joined "I ran" and "I was tired"?', choices: ['because', 'but', 'or'], answerIndex: 1, hint: 'It joins two opposite ideas.' },
    { kind: 'mcq', prompt: 'What do and, but, or, because do?', choices: ['join ideas together', 'end sentences', 'make commas'], answerIndex: 0, hint: 'They are bridge builders.' },
  ],
  pages: [
    { scene: ['🌉', '🧩'], text: 'Two small ideas stood apart on the riverbank.' },
    { scene: ['🤝', '✨'], text: '“I ran” met “I was tired” — they joined with but.' },
    { scene: ['🌉', '🎉'], text: 'The bridge sparkled into one big sentence!' },
    { scene: ['🌧️', '☂️'], text: 'because adds reasons: I slept because I was tired.' },
    { scene: ['💬', '🌟'], text: '“Joiners make sentences super!”' },
    { scene: ['🌉', '📖'], text: 'and, but, or, because join your ideas together.', focus: 'join' },
  ],
}
