import type { BookDef } from '../../types'

/** Unit 3 storybook — Prefix & Suffix Lab. */
export const BOOK_E3: BookDef = {
  id: 'bk-e3',
  unitId: 'e3',
  title: 'The un- Machine',
  questions: [
    { kind: 'mcq', prompt: 'What does the prefix un- mean?', choices: ['not or back', 'very fast', 'very big'], answerIndex: 0, hint: 'un-locked = not locked.' },
    { kind: 'mcq', prompt: 'The machine un-locked the door. Is it open now?', choices: ['No, it is closed', 'Yes, it is open', 'It disappeared'], answerIndex: 1, hint: 'un- means back to open.' },
    { kind: 'mcq', prompt: 'What does re- mean?', choices: ['never', 'again', 'tiny'], answerIndex: 1, hint: 're-build the tower = build it again.' },
  ],
  pages: [
    { scene: ['🔬', '🧪'], text: 'In the word lab, un- means “not” or “back”.' },
    { scene: ['🔓', '🚪'], text: 'The machine un-locked the door — now it is open!' },
    { scene: ['🔁', '🧱'], text: 're- means again: re-build the tower!' },
    { scene: ['🚫', '😊'], text: 'dis- says no: dis-like became like!' },
    { scene: ['🎉', '⚗️'], text: 'The lab cheered: words can change and grow!' },
    { scene: ['📗', '🔬'], text: 'Prefixes and suffixes change what words mean.', focus: 'prefixes' },
  ],
}
