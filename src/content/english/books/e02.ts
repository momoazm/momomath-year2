import type { BookDef } from '../../types'

/** Unit 2 storybook — Magic e & Syllable Squad. */
export const BOOK_E2: BookDef = {
  id: 'bk-e2',
  unitId: 'e2',
  title: 'Magic e Waves Her Wand',
  pages: [
    { scene: ['🎩', '✨'], text: 'Magic e lived quietly at the end of words.' },
    { scene: ['🪄', '📏'], text: 'She waved her wand: cap became cape, pin became pine!' },
    { scene: ['📣', '🔠'], text: 'The vowels shouted their names: A, I, O!' },
    { scene: ['🤫', '💨'], text: 'Magic e never makes a sound of her own.' },
    { scene: ['😄', '🎵'], text: '“Vowels, say your name!” she laughed.' },
    { scene: ['📖', '✨'], text: 'Magic e at the end makes long vowel sounds.', focus: 'magic' },
  ],
  questions: [
    { kind: 'mcq', prompt: 'Magic e turns "cap" into…', choices: ['cup', 'cape', 'cop'], answerIndex: 1, hint: 'It is something you wear!' },
    { kind: 'mcq', prompt: 'Where does Magic e live?', choices: ['At the end of words', 'At the start of words', 'Inside numbers'], answerIndex: 0, hint: 'She waits quietly at the back.' },
    { kind: 'mcq', prompt: 'Does Magic e make a sound of her own?', choices: ['Yes, a loud shout', 'No sound at all', 'Only on Tuesdays'], answerIndex: 1, hint: 'She is the quiet helper.' },
  ],
}
