# MomoMath Year 2 · Science (Cambridge Primary Science 0097, Stage 2)

Core subject — sits beside Maths / English in the TopBar (🔬), no opt-in flag.
One app, one path screen: same Duolingo-style loop (intro card → 10 exercises →
chest → XP/league/gems) under `getCurriculum('science')`.

Research basis:
- Cambridge Primary Science **0097** curriculum framework, Stage 2 objective
  codes (`2TWS` / `2SIC` thinking & context, `2Bp`/`2Bs`/`2Be` biology,
  `2Cm`/`2Cp`/`2Cc` chemistry, `2Pf`/`2Ps`/`2Pe` physics,
  `2ESp`/`2ESs` Earth & space).
- Every lesson carries the official Stage 2 codes so path badges and any
  scheme-of-work export stay honest (asserted by `tests/scienceRegistry.test.ts`
  + the five-strand check in `tests/shop.test.ts`).

---

## 1. Curriculum honesty

- Science is a **core** Cambridge primary subject (unlike the optional
  German / Arabic / Religion / Social extras) — it ships enabled for everyone.
- Scope is Stage 2 only: no Stage 3+ content, no fabricated codes.
- Formats reuse the shared engine only
  (`mcq / match / order / truefalse / speak` + emoji visuals) — no new
  question kinds.
- Kid-facing label: "Science"; source of truth for codes is this doc +
  `src/content/science/s01.ts`–`s06.ts`.

## 2. Roadmap — 6 units, 32 lessons + 6 bosses = 38 nodes

| Unit | Theme | Strand codes | Lessons |
|---|---|---|---|
| S1 Being a Scientist | safety, good questions, predictions, sorting, models & diagrams, life cycles | 2TWS + 2SIC | Safe Scientists · Good Science Questions · Make a Prediction · Sort It Out · Models & Diagrams + Boss |
| S2 Humans & Health | healthy habits, illness signs, growing up, body coverings, teeth | 2Bp + 2Bs | Stay Healthy · Signs of Illness · Growing Up · Body Coverings · Teeth Power + Boss |
| S3 Living Things & Habitats | habitats, local environments, needs of living things, plants, adaptations, life cycles | 2Be | What is a Habitat? · Hot, Cold, Wet, Dry · What Living Things Need · Plants Need · Match the Animal + Boss |
| S4 Materials | natural vs manufactured, properties, choosing materials, testing, reversible changes | 2Cm + 2Cp + 2Cc | Natural or Made? · Material Properties · Choosing the Right Material · Test It! · Reversible or Not? + Boss |
| S5 Forces, Light & Electricity | push/pull, shape change, light sources, light & dark, electricity safety, circuits, magnets | 2Pf + 2Ps + 2Pe | Pushes & Pulls · Squash, Twist, Bend · Light Sources · Light & Dark · Electricity Safety · Build a Simple Circuit · Magnets + Boss |
| S6 Rocks & Our Planet | rock types, extraction, caring for Earth, Sun path, seasons | 2ESp + 2ESs | Three Rock Types · Where Rocks Come From · Care for Our Planet · The Sun in the Sky · Seasons of the Year + Boss |

Format reuse only (`mcq/match/order/truefalse/speak`). Boss ids are
`${unitId}boss` and always the last node of the unit.

## 3. Integration (core-by-design)

| Concern | How |
|---|---|
| Type | `types.ts Subject` includes `'science'`; core code never assumes only 2 subjects |
| Content | `src/content/science/` (`helpers` + `s01`…`s06` + `index`) mirrors `english/`; `registry.ts` `CURRICULA.science` entry |
| Switch | TopBar 🔬 pill always visible (no `scienceEnabled` flag) |
| Audio | en-GB TTS via existing `tts.ts`; `speak` uses forgiving ASR self-check |
| Path | `PathScreen` shows the science zigzag; `buildCatalog('science')` feeds the adaptive recommender from objective codes automatically |
| Economy | Shared XP/gems/league/chest; `lessonProgress` keys are `s*` so no collisions with math/english |
| Sync | `lessonProgress` (incl. `s*` ids) syncs via the existing cloudsave union |
| Boss styling | `PathScreen` / `LessonScreen` use `id.endsWith('boss')` — science bosses get the 👑 treatment unchanged |

## 4. Verify

```bash
cd C:/Users/momo/Documents/momomath-year2
npx vitest run tests/scienceRegistry.test.ts
npx vitest run tests/noDuplicateQuestions.test.ts
npx tsc --noEmit -p tsconfig.json
```

Optional fuller gate:

```bash
npx vitest run tests/scienceRegistry.test.ts tests/noDuplicateQuestions.test.ts tests/shop.test.ts
```

Tests: `tests/scienceRegistry.test.ts` (6 units in order, unique ids,
registry wiring, boss shape, Cambridge codes, generate determinism),
`tests/shop.test.ts` §science (≥30 lessons, all five strand families),
`tests/noDuplicateQuestions.test.ts` (every science lesson, 4 seeds).
