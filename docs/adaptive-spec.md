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
   (Groq → Cerebras → Gemini → Zen → OpenRouter → Mistral → GitHub Models,
   free-first and fast-first, paid OpenAI only as a last resort when its key
   exists). Every provider speaks OpenAI-compatible `/chat/completions`, so
   there is one call path. The first provider that returns 2xx + non-empty
   text within 3 s wins (overall deadline 9 s); 429/5xx/timeout/network
   puts that label on a 60 s cooldown and the route tries the next provider.
   A grown-up BYOK key (`x-ai-provider` + `x-ai-key` headers, stored only in
   the browser) jumps the queue. Server keys come from env; any subset works
   — providers without a key are skipped.

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
| `api/year2/review.ts` | grown-ups-only review route (strict-JSON coach, same chain shape) |
| `src/engine/adaptive/byok.ts` | optional parent key store (localStorage only, forwarded as headers) |
| `src/engine/adaptive/review.ts` | review client (cache + offline template, throws on 400/401) |
| `src/components/ui/GrownUpsReview.tsx` | Profile key form + review card (parent-facing only) |
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

## Repeat tracker + wrong-question retry (2026-09-09)

Two parent/child-facing upgrades on top of the log above:

**Per-lesson repeat highlights** (`src/engine/adaptive/lessons.ts` —
`lessonsToRepeat`). Rolls the attempt log up per `lessonId`: overall
accuracy, difficulty-3 ("hardest") accuracy, mean BKT mastery of the
lesson's codes, and spaced-review due count. A lesson is flagged when the
hardest questions sit under 60% (min 2 tries), overall accuracy is under
70% (min 3 tries), mastery is under 50%, or a skill is due. Worst first.
Rendered in Profile as "Lessons to repeat" with a Practice button per
lesson, plus a red "Hard" column and due bell in the insights table.

**Wrong-question retry.** Wrong first attempts now store `prompt`,
`correctAnswer`, and a full question snapshot `q` (`snapshotQuestion`;
correct attempts stay lightweight). Sources:

- Lesson done screen: "Fix my mistakes (N)" replays the session's misses.
- Profile: "Tricky questions" lists the 5 most recent misses with per-row
  Retry plus "Practice all (N)".

Retry runs inside `LessonScreen` (`retryItems` prop / internal retry
state): per-question origin (`lessonId` + `objectiveCode`) travels with
each item so BKT keeps updating the right skill. Scoring is XP-only
(`store.recordPractice` — 1 XP per fix, streak + dailies move, no
lessonProgress/crown/chest changes), so retrying can never farm rewards.

**Difficulty honesty fix.** The lesson loop used to log every attempt as
`difficulty: 1`. It now logs the skill's live BKT difficulty at check
time, which is what makes hardest-question stats meaningful. Old log
entries (all difficulty 1, no snapshots) degrade gracefully: hardest
shows a dash, prompt-only rows offer no exact retry.

## Tracker round 2 — 7 upgrades (2026-09-09)

1. **BKT write-back fix.** `recordAdaptiveAttempt` used to append the log
   but discard the updated skill snapshot, freezing mastery at the prior.
   The store now persists the updated skill + recency on every attempt.
2. **Mistake kinds stored.** `classifyMistake` results land on the log
   entry (`mistakeKind`); `lessonsToRepeat` surfaces the dominant pattern
   (`Often answers landing one away…`) and the table keeps working.
3. **Snapshot cap.** Only the newest 50 wrong attempts keep their full
   question snapshot (`capSnapshots`); older misses keep prompt/answer
   stats. Bounds localStorage and cloud payloads.
4. **Path coach nudge.** "Recommended for you" card is back, rewritten:
   pure `useMemo`, telemetry only on tap — no render-phase writes, so the
   old maximum-update-depth crash cannot recur. Hidden when the pick is
   locked or is already the START node.
5. **Mastery sparklines.** Insights table renders the per-skill curve
   (last 20 snapshots, green up / red down) from `masteryHistory`.
6. **Adaptive cloud sync.** `CloudSave.adaptive` carries skills + log +
   trimmed curves; `mergeAdaptive` keeps more-evidence per skill and
   interleaves logs by time; old `adaptive: null` saves pass through.
7. **Confidence + rush flags.** Mastery under 5 tries shows a grey "new"
   pill instead of a verdict; answers faster than half the skill's pace
   (2.5s floor) are flagged `rushed` and surfaced as "slow down" reasons.
