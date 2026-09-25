import type { BookDef } from '../../types'

/** Unit 3 storybook — Prefix & Suffix Lab. */
export const BOOK_E3: BookDef = {
  id: 'bk-e3',
  unitId: 'e3',
  title: 'The un- Machine',
  pages: [
    { scene: ['🔬', '🧪'], text: 'In the word lab, un- means “not” or “back”.' },
    { scene: ['🔓', '🚪'], text: 'The machine un-locked the door — now it is open!' },
    { scene: ['🔁', '🧱'], text: 're- means again: re-build the tower!' },
    { scene: ['🚫', '😊'], text: 'dis- says no: dis-like became like!' },
    { scene: ['🎉', '⚗️'], text: 'The lab cheered: words can change and grow!' },
    { scene: ['📗', '🔬'], text: 'Prefixes and suffixes change what words mean.', focus: 'prefixes' },
  ],
}
