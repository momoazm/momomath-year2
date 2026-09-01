# MomoMath Year 2 — Adaptive Learning Engine

> **Read this first if context was compacted.** This file is the source of truth for the
> adaptive learning feature. It was written *before* implementation, deliberately, so the
> plan survives context compaction. If you only have this file, re-read the project inspect
> notes at the top of `s164-adaptive-engine-momomath-year2.md` in the Momo brain.

## Problem

MomoMath Year 2 walks a strict linear curriculum: the next lesson unlocks when the previous
one is *completed* (any accuracy). Children who struggle with multiplication get more
multiplication piled on top, while a child who's mastered addition still sees it for review.
There is no per-skill mastery model, no adaptive question selection, no spaced review, and
no mistake analysis. We are adding a real adaptive engine — deterministic, explainable,
testable — on top of the existing app without breaking lessons, chest, leagues, or sync.

## Solution

A small **Bayesian Knowledge Tracing (BKT)** model, one per **Cambridge objective code**,
plus a difficulty model, a recommender, a deterministic mistake classifier, an
explanations layer, and a full attempt log. UI is a thin shell on top.

## Data we use


## Algorithm choice — why BKT (not neural KT)

| Concern | BKT | Deep KT (DKT, SAKT) |
|---|---|---|
| Interpretable to a parent / teacher | yes — 4 parameters per skill | no — black box |
| Trainable with one user | yes — per-skill priors suffice | no — needs thousands of sequences |
| Time-to-first-update | one attempt | one attempt |
| Cost | zero CPU | 1 GPU per inference |
| Fits MBZUAI ML interview | classical probabilistic graphical model | also fine, but more infra |

We pick BKT. It is the *right* amount of ML for one child using a static app, and the math
is interview-grade.

## BKT math (plain English)

For each skill `s`, keep a probability `P(L_t)` that the child has learned `s` after
`t` attempts. Four parameters per skill:

- `P(L0)` = 0.15 — prior mastery (cold start)
- `P(T)`  = 0.12 — probability of learning *per opportunity*
- `P(S)`  = 0.12 — slip — answered wrong despite knowing
- `P(G)`  = 0.20 default, varies by question kind (mcq higher, type-number lower)

On a new attempt with outcome `c ∈ {0,1}`:

1. **Posterior given the outcome:**


## Difficulty model

Three levels per skill, with hysteresis to stop oscillation:

- mastery < 0.50 OR recent-accuracy < 0.60 → **Level 1**
- 0.50 ≤ mastery < 0.80 AND recent-accuracy ≥ 0.60 → **Level 2**
- mastery ≥ 0.80 AND recent-accuracy ≥ 0.80 → **Level 3**

Hysteresis: need **3 consecutive first-attempt corrects** to promote; **2 consecutive
wrongs** to demote. Configurable.

## Recommender

For each candidate skill `s` we compute a score from:

1. **Mastery deficit** — `max(0, 0.85 − P(L_s))` (target 85%)
2. **Prerequisite gate** — skills blocked until all earlier codes in the curriculum flat
   order are ≥ 0.50 mastery (or lesson-completed)
3. **Spaced-review** — interval `I(s)` grows with mastery: `I = 1, 3, 7, 14, 30` days. Skill
   is *due* when `today − lastPracticed ≥ I`.
4. **Recency penalty** — skill seen in last 3 picks is penalised
5. **Repetition** — last pick's skill gets `−0.5`

Top-scored skill is chosen; ties broken by curriculum order. The function returns a
**plain-English reason** so the UI can show "Multiplication — mastery 43%, recently
struggled" without lying.

## Mistake analysis (deterministic, honest)

For `type-number` questions we can reliably detect from the data we have:

- **off-by-one** when |answer − correct| = 1
- **place-value swap** when correct = reverse(answer) in two-digit answers
- **operation error** when correct is a sum/diff/multiple of operands

## Explanations layer (LLM with safe fallback)

The explanations are pure decoration — mastery math never depends on them. The flow:

1. Try a **ranked chain of free models** (mirrors your `ultimate-fallback` plugin's
   structure: try → on failure penalize that provider for a cooldown → try the next).

   ```
   groq/llama-3.3-70b-versatile
   groq/openai/gpt-oss-120b
   google/gemini-flash-latest
   cerebras/gpt-oss-120b
   google/gemini-flash-lite-latest
   openrouter/auto:free
   mistral/mistral-small-latest
   zai/glm-4.7-flash
   groq/llama-3.1-8b-instant
   ```

2. **Cache** every explanation by `(questionId, answerHash)` — a kid making the same
   mistake twice in a row is one API call total.
3. **Per-request timeout** 3s, **per-hour cap** 2000 to stay well under free tiers.
4. **PII firewall** — the route only receives: `prompt`, `studentAnswer`, `correctAnswer`,
   `objectiveCode`, `recentAccuracyPct`, `ageBand` (e.g. "Year 2 / 6–7"). Never names,
   emails, full attempt history, or the child's id.
5. **Template fallback** — if every model fails, we return a deterministic age-appropriate
   sentence. The kid never sees an error.
6. **System prompt** instructs: no praise theatre, one short sentence, no step-by-step
   solution, age-appropriate language, no emojis unless the UI adds them.

The chain + cache makes **1k–3k daily active users** feasible on free tiers.

## Data collection for evaluation

We do *not* log the LLM response — only whether the call succeeded and how long it took.
The LLM is decoration; the real evidence is the attempt log + mastery snapshots.


## UX

- **Kid sees:** the existing intro → questions → feedback flow, unchanged. Wrong-answer
  panel shows a 1-line explanation (template or LLM) and a small "Try a similar one" hint.
  No "AI" label, no sliders, no jargon.
- **PathScreen:** one card above the daily-goal banner — "Recommended for you · Multiplication ·
  43% mastery · recently struggled · ▶ Start". Tapping it starts the recommended lesson.
- **ProfileScreen:** parent/admin "Learning Insights" panel behind a single tap. Per-skill
  table, trend sparklines, JSON export. No AI labels visible to the child.

## Engineering rules

- Mastery, recommender, difficulty, mistake classifier are **pure functions** in
  `src/engine/adaptive/` with no React, no zustand, no `fetch`. They take a state object,
  return a new one, and are unit-tested.
- Store integration is one new zustand slice; the existing `lessonProgress` map stays
  untouched. v3 → v4 migration backfills an empty `adaptive` block.
- LLM is one module: `src/engine/adaptive/explanations.ts` (client) + `api/year2/explain.ts`
  (serverless route). Each can be tested in isolation.
- No changes to `gamification.ts`, `path.ts`, `store.ts` action set, or any screen outside
  `PathScreen`, `LessonScreen`, `ProfileScreen`.

## What we will measure (post-launch)

- **mastery growth** per skill per session
- **questions-to-mastery** (85% threshold) per skill
- **retention** at 7 / 30 days (mastery delta from a one-off review session)
- **accuracy vs difficulty** curve
- **recommendation acceptance** (% of recommended lessons the child actually starts)
- **weak-skill recovery** time (skill with mastery < 0.5 → ≥ 0.8)
- **per-lesson engagement** (started vs finished)
- **LLM hit rate** (template vs LLM), per-provider success, p50 / p95 latency
- **adaptive-length lesson accuracy** (do short lessons hit the same accuracy?)

## Limitations (be honest in the interview)

- BKT assumes the four parameters are stationary. For one child over a few months this is
  fine; for a population you would re-fit them from data.
- No forgetting model — we add a simple spaced-review schedule on top of BKT, but true
  forgetting decay is not modelled.
- Difficulty is per-skill-global, not per-question-item. Real IRT would model per-item
  difficulty and discrimination.
- One-user data only; no cross-user signal.
- Response time is logged but not yet used for adaptation.
- LLM is for warmth of tone, not for any decision. If you wanted the LLM to do tutoring,
  you'd want a much bigger guardrail system.

## How to improve with more students/data

- Re-fit `(P_L0, P_T, P_S, P_G)` per skill from real attempt logs (MLE / EM).
- Replace P(G) per *question item* with an IRT-style 2PL or 3PL model.
- Add a population-level embedding for transfer learning.
- Forget-decay: `P(L_{t+1}) = P(L_t) − decay · (t − lastSeen)`.
- Use the LLM to *generate* follow-up questions that target the specific misconception,
  guarded by a schema check.

## Files (final list)

- `src/engine/adaptive/config.ts` — every tunable threshold
- `src/engine/adaptive/types.ts` — typed shapes
- `src/engine/adaptive/model.ts` — BKT update + getters
- `src/engine/adaptive/difficulty.ts` — hysteresis-promoted Level 1/2/3
- `src/engine/adaptive/recommender.ts` — score skills, return reason
- `src/engine/adaptive/mistakes.ts` — classify, suggest follow-up
- `src/engine/adaptive/explanations.ts` — client-side LLM with cache + fallback
- `src/engine/adaptive/attempts.ts` — log + mastery snapshot history
- `src/engine/adaptive/index.ts` — barrel
- `api/year2/explain.ts` — serverless route (ranked chain, PII firewall, templates)
- `src/engine/store.ts` — new `adaptive` slice + v4 migration
- `src/screens/LessonScreen.tsx` — three small hooks (timing, BKT update, mistake panel)
- `src/screens/PathScreen.tsx` — "Recommended for you" card
- `src/screens/ProfileScreen.tsx` — parent insights panel + export
- `tests/adaptive/*.test.ts` — unit tests for each pure module
- `vercel.json` — minimal Vercel config
- `docs/adaptive-spec.md` — public spec (algorithm, math, limitations, roadmap)
- `docs/adaptive-plan.md` — this file (preserved across compaction)

Saved per attempt (cap 500 most recent, oldest dropped): see "Data we use" above. Mastery
snapshots are saved once per session, per skill, so the parent-facing insights can draw
trend sparklines.

- **distractor lock-in** (mcq) when the student's pick matches a known generator
  distractor pattern (`±1, ±10, ...`)

If none of these match, we say "let's try that one more time" — **no fabricated
misconception**. Follow-up: re-roll the same generator with a fresh seed for a *similar*
question (not the same question).

```
P(L_t | c=1) = P(L_t) · (1 − P(S)) / [ P(L_t)·(1−P(S)) + (1−P(L_t))·P(G) ]
P(L_t | c=0) = P(L_t) · P(S)     / [ P(L_t)·P(S)     + (1−P(L_t))·(1−P(G)) ]
```

2. **Learning transition:**

```
P(L_{t+1}) = P(L_t | c) + (1 − P(L_t | c)) · P(T)
```

That's it. Two equations, four numbers, no GPU. Defaults live in `ADAPTIVE_CONFIG` so you
can tune without code changes.

For every first-attempt on a question we log:

- `studentId` (anonymous local id, no PII)
- `lessonId`, `objectiveCode` (the skill)
- `kind` of question (mcq, type-number, ...)
- `difficulty` 1/2/3
- `answer` the student gave, `correct` bool
- `responseTimeMs`
- `masteryBefore`, `masteryAfter` (BKT `P(L)`)
- `timestamp`, `reason` (why we recommended it)

Mastery updates deterministically after every first attempt. Recent accuracy (last 10),
EWMA trend, last-practiced timestamp, and uncertainty (based on evidence count) are kept
per skill.
