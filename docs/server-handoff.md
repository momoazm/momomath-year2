# Phase 31 server handoff — momolearn-ai changes (PLAN 171, 2026-09-30)

Report only. The server repo (`momoazm/momolearn-ai` → local
`C:\Users\momo\Documents\Default Project`) is **read-only from momomath-year2
sessions** — nothing below has been applied. Execute it in a momolearn-ai
session of its own.

Phase 31 (PLAN 145-171) already ships everything on the client side: multi-year
state (`yearLevel`, `extrasUnlocked`, per-year `paths` buckets), the year
picker, the Profile year chip, and the `Farousy` code gate. The two changes
below are the server-side follow-ups.

## 1. Cloudsave whitelist += `yearLevel` / `extrasUnlocked` / `paths` (required)

**Client already sends them.** `src/engine/cloudsave.ts` includes all three in
the wire `CloudSave` (`yearLevel?: YearLevel`, `extrasUnlocked?: boolean`,
`paths?: Partial<Record<YearLevel, YearPath>>`; PUT body built in
`snapshotFromPlayer`). The client merge (`mergeCloudSave`, PLAN 165) is
implemented and marked "local-only until the server whitelist lands".

**Server drops them today.** `lib/year2/cloudsave.js`:

- `sanitizeSave(raw)` returns a *fixed* object (the whitelist, ~L61-141). Any
  field not listed there is discarded — so `yearLevel`, `extrasUnlocked` and
  `paths` are stripped on `PUT /api/year2/cloudsave` (L458) **and** on every
  Blob re-read (`loadSave` re-sanitizes stored JSON, L402).
- `mergeSaves(a, b)` (L351-388) never sees the three fields, so a merge cannot
  preserve them either.

**Impact without the change:** sync never errors, but a second device silently
falls back to Year 2 with the trio (German/Arabic/Religion) locked and all
non-active year buckets missing from the restored save.

**Exact edits:**

1. `sanitizeSave` return adds:
   - `yearLevel: int(raw.yearLevel, 1, 4, 2)` (existing `int` helper).
   - `extrasUnlocked: raw.extrasUnlocked === true` (same style as `bool`).
   - `paths: sanitizePaths(raw.paths)` — new local helper:
     - accept only keys `'1'..'4'` (cap 4 buckets);
     - per bucket: `subject` validated against the existing `SUBJECTS` set
       (fallback `'math'`), `lessonProgress` reusing the existing top-level
       `lessonProgress` block rules (same key regex, ≤1000 entries, crown /
       bestAccuracy / completions caps), `arcadeScores` like `shopInventory`
       (key `/^[\w:-]{1,48}$/`, ≤200 entries, int 0..9999), `sprintBest`
       `int(..., 0, 1_000_000)`.
2. `mergeSaves` adds — **mirror the client's `mergeCloudSave` (PLAN 165) as the
   source of truth**:
   - `yearLevel: newest.yearLevel ?? 2` (identity follows the newest writer,
     like `subject`/`name`);
   - `extrasUnlocked: a.extrasUnlocked === true || b.extrasUnlocked === true`
     (sticky-OR: an unlock anywhere unlocks everywhere);
   - `paths:` per-year independent union via a small `mergePaths` helper —
     each bucket merged with the existing helpers (`maxMapLessons` for
     `lessonProgress`, newest bucket's `subject`, `maxInventory` for
     `arcadeScores`, `Math.max` for `sprintBest`); a bucket present on only one
     side is taken as-is.
3. Watch `MAX_BODY_BYTES = 512_000` (L455): worst case `paths` adds 4 buckets
   of ≤1000 lessons each. Real roadmaps are far smaller; if saves grow, raise
   the cap or lower the per-bucket lesson cap rather than truncating silently.

Back-compat: stored saves without the three fields sanitize to the defaults
(`2` / `false` / `{}`-ish) — old blobs need no migration.

## 2. Leaderboard proper `year` field (optional, supersedes the id namespace)

**Today:** `lib/year2/leaderboard.js` `sanitizeEntry` (L51-65) whitelists
`{id, name, xp, league, mascot, week}` — no year dimension. The client works
around this (PLAN 164, `src/engine/leaderboard.ts`): Year 2 keeps the legacy
unprefixed id, any other year writes `y{N}:<rawId>` (`yearScopedId`), and the
board filters/strips with `entryYear` / `entriesForYear`. This works today; the
change below is cleanup, not a fix.

**Optional change:**

1. `sanitizeEntry` returns `year: int(raw.year, 1, 4, 2)` — old rows (no field)
   default to 2, which matches reality (the live board is Year 2).
2. Identity: once clients stop encoding the year in `id`, `unionById` (L31)
   must key on `` `${year}:${id}` `` instead of `id`, otherwise two rows for the
   same player on different years collapse (newest `updatedAt` wins and the
   other year's entry vanishes).
3. Client follow-up (later momomath-year2 step, not part of 171): send
   `year` + plain id, filter on `entry.year === activeYear`, keep
   `stripYearPrefix` only for legacy unprefixed rows.

Recommended minimal option if full supersession is not wanted yet: keep the id
namespace exactly as-is (it already gives one row per player per year) and just
whitelist a redundant `year` for display/filter robustness.

## Not in scope

- `session.js` / `friends.js`: unchanged (origins already include
  `momoazm.github.io`; no new endpoint, no new CORS rule).
- No route registration changes — `registerYear2CloudSaveRoutes` /
  `registerYear2LeaderboardRoutes` are already wired via `api/index.js`.

## Verification for the momolearn-ai session

- PUT a save containing `yearLevel: 3`, `extrasUnlocked: true`, a 2-bucket
  `paths` → GET must return all three intact (today they come back stripped).
- PUT from "device A" (bucket 1 progress) and "device B" (bucket 3 progress) →
  stored save unions both buckets; `extrasUnlocked` sticky-OR; active year
  follows the newer writer.
- If change 2 is applied: PUT entry with `year: 1` → GET includes `year: 1`;
  legacy entries still read as year 2; `npm run health` in that repo.
