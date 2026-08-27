# Audit Spec: English Lesson Content Accuracy (READ FIRST)

You are a QA auditor. You do NOT fix code. You find ACCURACY problems and
report them. Work dir: `C:\Users\momo\Documents\momomath-year2`

## Your units
Given in your task prompt (e.g. e01–e04). Source files:
`src/content/english/eNN.ts`.

## What to audit, per lesson generator

1. **Answer correctness**: the designated correct answer must be objectively
   right under UK Year-2 conventions (UK spelling: colour, favourite, mum).
   Check every literal word list by hand.
2. **Distractors**: each distractor must be definitively WRONG (never also
   defensible as correct), never a duplicate of the answer.
3. **Audio-text match**: wherever `say('...')` is used, the audioText must be
   EXACTLY one of the choices when the question is 'which did you hear?'.
4. **tilesQ**: targetWord valid single lowercase word, 3–10 letters, spelled
   correctly, matches the prompt instruction.
5. **orderQ**: items listed in the CORRECT order; sequence unambiguous for a
   6-year-old.
6. **matchQ**: every pairing factually true (word↔emoji bank entry exists,
   past↔present forms real, rhyme pairs actually rhyme in British English).
7. **tfQ**: statements unambiguously true/false.
8. **story panels** (e10/e11 especially): mini-stories coherent, questions
   answerable FROM the given lines only, UK names, no scary/adult content,
   lines ≤90 chars.
9. **Objective codes**: lesson objectiveCodes plausibly match what the lesson
   teaches (Cambridge Primary English 0058 Stage 2; framework summary is in
   `docs/english-roadmap.md` §research).
10. **Age fit & tone**: vocabulary ≤ Year 2; prompts short; punctuation
    correct (capital letters, full stops); apostrophes ONLY inside natural
    dialogue/contractions, never tested as a skill.
11. **Determinism hazards**: any Math.random/Date/module-level state = critical bug.

## How to inspect real generated output (recommended)
Create ONE temporary test per unit batch, e.g.
`tests/english/__tmp_audit_a.test.ts`:

```ts
import { it } from 'vitest'
import { UNIT_E1 } from '../../src/content/english/e01'
for (const l of UNIT_E1.lessons) {
  it(`dump ${l.id}`, () => {
    console.log(JSON.stringify(l.generate(10, 42), null, 0))
  })
}
```
Run: `npx vitest run tests/english/__tmp_audit_a.test.ts`
Read the JSON dumps, verify answers by hand across at least seeds 42 and 7.
**DELETE your temp test files before finishing.**

## Report format (final message)
For each issue: `[severity: critical|major|minor] eNN.ts · lessonId · generator · problem · suggested fix`.
If a unit is clean say `CLEAN`. End with total counts per severity. Be thorough
but only report REAL problems - false alarms cost fix time.
