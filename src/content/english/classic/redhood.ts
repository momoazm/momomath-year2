import type { BookDef } from '../../types'

/** Public-domain classic retold in original wording for Year 2 readers. */
export const CLS_REDHOOD: BookDef = {
  id: 'cls-redhood',
  unitId: 'e2',
  title: 'Little Red Riding Hood',
  pages: [
    { scene: ['🧺', '👧'], text: 'Red Riding Hood packed a basket and set off to visit her grandmother.', focus: 'basket' },
    { scene: ['🐺', '🌳'], text: 'A wolf met her on the path and asked where she was going.', focus: 'wolf' },
    { scene: ['🌷', '🏡'], text: 'She stopped to pick flowers, while the wolf ran to the cottage door.' },
    { scene: ['🛏️', '🐺'], text: 'The wolf hopped into grandmother’s bed and called out in a tiny voice.', focus: 'voice' },
    { scene: ['👀', '😮'], text: '“What big eyes you have!” said Red Riding Hood. The wolf sprang up.' },
    { scene: ['🪓', '🏃', '🌳'], text: 'A woodcutter chased the wolf away, and Red Riding Hood hurried home.' },
  ],
  questions: [
    {
      kind: 'mcq',
      prompt: 'Where was Red Riding Hood going?',
      choices: ['To grandmother’s house', 'To market', 'To school'],
      answerIndex: 0,
      hint: 'She carried a basket of food for one person.',
    },
    {
      kind: 'mcq',
      prompt: 'Who did she meet on the path?',
      choices: ['A fox', 'A bear', 'A wolf'],
      answerIndex: 2,
      hint: 'This animal wanted to visit the cottage too.',
    },
    {
      kind: 'mcq',
      prompt: 'Who chased the wolf away?',
      choices: ['The grandmother', 'A woodcutter', 'Red Riding Hood'],
      answerIndex: 1,
      hint: 'He worked with trees and an axe.',
    },
  ],
}
