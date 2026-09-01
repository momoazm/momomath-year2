# MomoMath Year 2 — Adaptive Learning Engine (Spec)

> Public specification for the adaptive learning engine that ships in this app.
> Source of truth for the *intent*. The source code in `src/engine/adaptive/`
> is the source of truth for the *implementation* — when the two diverge, fix
> the spec.

## What problem does this solve?

Before the engine, MomoMath walked a **strict linear curriculum**: the next lesson
unlocks when the previous one is *completed* (any accuracy). Children who
struggled with multiplication got more multiplication piled on top, while a
child who had mastered addition still saw it for review on every replay.
There was no per-skill mastery model, no adaptive question selection, no
spaced review, and no mistake analysis.

The engine replaces this with a **probabilistic, per-skill mastery model** that
continuously updates after every first attempt, recommends the next best
lesson, and gently nudges the difficulty up or down based on what the child
has actually demonstrated — never on what they have *seen*.

## What data does the engine use?

For every first attempt on a question, the engine logs (locally only — never
sent to a server except the optional LLM call described below):

- anonymous `studentId` (local browser id, no PII)
- `lessonId`, `objectiveCode` (the Cambridge skill being practised)
- `kind` of question (mcq, type-number, match, ...)

## How is mastery estimated?

We use **Bayesian Knowledge Tracing (BKT)** with four parameters per skill:

| Parameter | Default | Meaning |
|---|---|---|
| `P(L0)` | 0.15 | prior probability the child knows the skill before any attempt |
| `P(T)`  | 0.12 | probability of learning from a single attempt |
| `P(S)`  | 0.12 | slip — answered wrong despite knowing |
| `P(G)`  | per kind (see below) | guess — answered right despite not knowing |

`P(G)` defaults: `mcq 0.25`, `truefalse 0.5`, `match 0.1`, `order 0.05`,
`tap-count 0.1`, `letter-tiles 0.05`, `type-number 0.02`, `speak 0.15`.
These are in `src/engine/adaptive/config.ts` and are tunable.

After every first attempt, the engine runs two equations:

1. **Posterior given the outcome** (Bayes' rule):

   ```
   P(L | correct) = P(L)·(1−P(S)) / [P(L)·(1−P(S)) + (1−P(L))·P(G)]
   P(L | wrong)   = P(L)·P(S)     / [P(L)·P(S)     + (1−P(L))·(1−P(G))]
   ```

2. **Learning transition**:

   ```
   P(L′) = P(L | outcome) + (1 − P(L | outcome)) · P(T)
   ```

That's the entire update step. Two equations, four numbers, no GPU. The
output `P(L)` is bounded in `[0, 1]` and is *interpretable*: a parent or
teacher can read it.

## How is the next question selected?

The recommender is a transparent, weighted score per candidate skill. For
each skill we compute:

1. **mastery deficit** — `max(0, 0.85 − P(L_s))` (we aim for 85%)
2. **prerequisite gate** — a never-attempted skill is gated by earlier skills
   in the curriculum being ≥ 0.50 mastery
3. **spaced-review bonus** — a +0.3 bonus when a skill's mastery is high and
   its review interval (1, 3, 7, 14, 30 days by mastery band) has elapsed

## How is difficulty adapted?

A 3-level system (Level 1 = easy, Level 2 = medium, Level 3 = harder) with
**hysteresis** to stop oscillation:

- promote one level after 3 consecutive first-attempt corrects
- demote one level after 2 consecutive first-attempt wrongs
- reset streaks when the level changes

Generators in `src/content/generators.ts` are generator-level difficulty
agnostic for now — the difficulty field on a question is captured in the
attempt log even if most numeric generators don't yet vary their range by it.
This is intentional: the data is being collected *now* so we can later
re-introduce per-difficulty generator parameters from real numbers.

## How are mistakes analysed?

Deterministic classification only where the data supports it:

- **off-by-one** when `|answer − correct| = 1`
- **place-value swap** when the answer is the two-digit reverse of the
  correct number
- **distractor lock-in** when the answer is `±1, ±2, ±5, ±10, ±100` off
- **order error / tap-extra** for the matching question kinds

If none of these match, we say "let's try that one more time" — **we never
fabricate a misconception**. A follow-up *similar* question is then re-rolled
from the same generator with a fresh seed.

## How do AI explanations work?

Mistake explanations are the only place an LLM is involved. The flow is
intentionally defensive:

1. The screen calls `fetchExplanation({prompt, studentAnswer, correctAnswer,
   objectiveCode, recentAccuracyPct, ageBand})`.
2. The client hashes the request to a cache key. If we have an answer, we
   return it. **A child making the same mistake twice in a row is one API
   call total.**
3. Otherwise we POST to `/api/year2/explain`. The route is a ranked chain
   (Groq → Gemini → Cerebras → OpenRouter → Mistral → Zhipu → Groq-small,
   ordered for warm-up speed and instruction-following for short
   kid-friendly sentences). The first provider that returns 2xx + non-empty
   text within 3 s wins. On any failure the route tries the next provider.

## UX for the child

The kid sees the same lesson flow they always saw — intro → questions →
feedback → next. The only difference is one extra sentence after a wrong
answer ("So close! You were just one away — try counting once more."), and
a small "Recommended for you" card on the path screen that says
"Practice Multiplication — estimated mastery 43%". **No AI labels, no
sliders, no jargon.** The chrome, mascots, and gamification are unchanged.

## How do you measure whether it's actually helping?

A list of metrics we should start collecting from real users:

- **mastery growth** per skill per session (from the mastery snapshots)
- **questions-to-mastery** (P(L) reaches 0.85) per skill
- **retention at 7 and 30 days** (mastery delta from a one-off review
  session after a gap)
- **accuracy vs difficulty** curve (does Level 3 hit the same accuracy as
  Level 1 for a given skill?)
- **recommendation acceptance rate** (% of "Recommended for you" taps that
  actually open the lesson)
- **weak-skill recovery time** (skill with mastery < 0.5 → ≥ 0.8)
- **per-lesson engagement** (started vs completed)
- **LLM hit rate** (template vs LLM, per-provider success, p50 / p95
  latency)
- **adaptive-length lesson accuracy** (do short lessons hit the same
  accuracy as full lessons?)

## Limitations — be honest in the interview

- BKT assumes the four parameters are stationary. For one child over a few
  months this is fine; for a population you would re-fit them from data
  (MLE / EM).
- No forgetting model — we add a simple spaced-review schedule on top of
  BKT, but true forgetting decay is not modelled.
- Difficulty is per-skill-global, not per-question-item. Real IRT would
  model per-item difficulty and discrimination.
- One-user data only; no cross-user signal yet.
- Response time is logged but not yet used for adaptation.
- LLM is for warmth of tone, not for any decision. If you wanted the LLM
  to do tutoring, you'd want a much bigger guardrail system.

## How would you improve this with more students/data?

- Re-fit `(P_L0, P_T, P_S, P_G)` per skill from real attempt logs (MLE / EM).
- Replace P(G) per *question item* with an IRT-style 2PL or 3PL model.
- Add a population-level embedding for transfer learning ("kids like you
  also struggled with X").
- Forget-decay: `P(L_{t+1}) = P(L_t) − decay · (t − lastSeen)`.
- Use the LLM to *generate* follow-up questions that target the specific
  misconception, guarded by a schema check.
- A/B test the recommender's weights via online bandit.

## File map

| File | What it does |
|---|---|
| `src/engine/adaptive/config.ts` | every tunable threshold |
| `src/engine/adaptive/types.ts` | typed shapes |
| `src/engine/adaptive/model.ts` | BKT update + getters |
| `src/engine/adaptive/difficulty.ts` | hysteresis-promoted Level 1/2/3 |
| `src/engine/adaptive/recommender.ts` | score skills, return reason |
| `src/engine/adaptive/mistakes.ts` | classify, suggest follow-up |
| `src/engine/adaptive/explanations.ts` | client-side LLM with cache + fallback |
| `src/engine/adaptive/attempts.ts` | log + mastery snapshot history |
| `src/engine/adaptive/catalog.ts` | build the curriculum catalog |
| `src/engine/adaptive/useAdaptiveLesson.ts` | React hook that wires the engine into the lesson loop |
| `src/engine/adaptive/index.ts` | barrel |
| `api/year2/explain.ts` | serverless route (ranked chain, PII firewall, templates) |
| `src/engine/store.ts` | new `adaptive` slice + v4 migration |
| `src/screens/LessonScreen.tsx` | three small hooks (timing, BKT update, explanation) |
| `src/screens/PathScreen.tsx` | "Recommended for you" card |
| `src/screens/ProfileScreen.tsx` | parent insights panel + JSON export |
| `tests/adaptive/*.test.ts` | unit tests for each pure module |
| `vercel.json` | minimal Vercel config |
| `docs/adaptive-plan.md` | internal plan (preserved across compaction) |

4. The system prompt is one line: *one short sentence (max 18 words), no
   step-by-step solution, no emojis, no praise theatre, age-appropriate
   tone.* The model **never sees the child's name, history, or any other
   PII**.
5. If every provider fails (network down, free tier exhausted, etc.) the
   route returns a deterministic template explanation. The kid never sees
   an error.

The LLM is **decoration**. Mastery math, recommender math, difficulty math,
and the mistake classifier never depend on it. The BKT model is the
"intelligence"; the LLM is the warmth.

4. **recency penalty** — a penalty of 0.5 on the last pick, 0.15·(N−i+1)/N on
   earlier picks in the recent window
5. **repetition** — capped to avoid serving the same skill back-to-back when
   any other candidate is close in score

The top-scored skill is chosen; ties break by curriculum order. The function
returns a `reasonCode` (`mastery-deficit`, `spaced-review-due`,
`curriculum-default`, `cold-start`, `in-lesson`) and a plain-English
`reasonText` so the UI can show "Multiplication — mastery 43%, recently
struggled" without lying.

The recommender is **deterministic and explainable** — every decision can be
replayed from the attempt log.

- `difficulty` 1/2/3 (set by the engine, not the generator)
- the student's `answer`, whether it was `correct`
- `responseTimeMs` (timed from question show to first check)
- `masteryBefore`, `masteryAfter` (BKT P(L))
- `timestamp`, `reason` for the recommendation

Plus per-skill `masteryHistory` (capped 200 points per skill) for the parent
dashboard's trend sparklines.

The LLM-explanation layer (see below) only ever receives: `prompt`,
`studentAnswer`, `correctAnswer`, `objectiveCode`, `recentAccuracyPct`,
`ageBand`. **No names, emails, attempt history, or any other PII.**
