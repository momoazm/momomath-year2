# PLAN — Subject roadmaps, per-subject arcade, Fang/Bean/Bark exclusives, pixel boss

**Status legend:** `[ ]` pending · `[x]` done · `[~]` in progress
**Research constraints (never violate):**
- Cloudsave accepts any sane `cardStars` key → new card ids sync with zero server changes. Counters stay local (server whitelists fields).
- `CARDS` pinned at 19 (`cardStars.test.ts:54`); chest odds/pity/novelty read `CARDS` → arcade cards go in SEPARATE `ARCADE_CARDS`, chest pool untouched.
- `arcadeBests` counts ANY `arcadeScores` key (incl. legacy) → Bean unlock counts only current 3 game ids.
- Library is one flat grid + tier tabs → exclusives need a genuinely separate section.

## Phase 1 — Roadmaps appear for all 3 subjects (small)
- [x] 1. Live-verify subject switching (TopBar pills 🧮📚🔬) renders units/lessons for maths/english/science at 360px — registry has all 3 (`registry.ts:11-15`). (Verified via registry + verify-gamification subject-switch check.)
- [x] 2. Delete stale "Science is coming soon!" empty state (`PathScreen.tsx:79-92`) — science has 6 real units.
- [x] 3. Fix anything the live check surfaces (likely polish only).

## Phase 2 — Arcade: one game per subject, drop 2 (medium)
- [x] 4. `ARCADE_GAMES` = Boss Rush (🧮) / Word Rescue (📚, 60s/3 lives, bank `src/content/arcadeWords.ts` ~40 entries) / Lab Blitz (🔬, 60s/3 lives, bank `src/content/arcadeScience.ts` ~40 entries). math-run + number-blaster removed from list (ids stay valid in persisted scores); `ArcadeGameDef.id` is `string`.
- [x] 5. Refactor `ArcadeGame.tsx`: per-game question source; Number Blaster fuse + Math Run −5s branches deleted. Quests/XP/gems/`addArcadeCorrect` plumbing unchanged.
- [x] 6. ArcadeScreen: subtitle "One game per subject · earn ⚡ XP and set high scores", subject badge (🧮/📚/🔬) per game card.

## Phase 3 — Exclusive cards: Fang, Bean & Bark (medium)
- [x] 7. `cards.ts`: `ARCADE_CARDS` (tier exclusive, `source: 'arcade'`, NOT merged into `CARDS`).
  - 🦊 Fang the Fox — finish 10 arcade rounds (lifetime)
  - 💣 Bean the Dynamite — set a score in all 3 subject games (current ARCADE_GAMES ids only)
  - 🐻 Bark the Polar Bear — defeat 5 bosses total in Boss Rush
- [x] 8. Art: author `public/cards/{fang,bean,bark}.svg` (240×320, gradient bg, outlined char, like `jet.svg`); `MascotId` union extended with `'fang'|'bean'|'bark'` (type-only, `MASCOTS` untouched — fix `tests/mascots.test.ts` Record<MascotId,…> to exclude card-only ids).
- [x] 9. Store: persist **v9→v10** backfill `arcadeRounds: 0`, `arcadeBossesDown: 0` (local-only); `grantArcadeCard(id)` grants 3 copies (=1★) once (dedupe if owned); `checkArcadeCards()` called from `ArcadeGame.finish()` — on grant: `sfx.streak` + celebration overlay on round-over ("🕹️ Exclusive unlocked: …"). cardStars syncs via existing cloudsave. (ArcadeGame currently calls `st.recordArcadeRound(...)` — implement it.)
- [x] 10. Library — separate "🕹️ Arcade Exclusives" panel under header (above tier tabs): own heading + `x/3 collected`, 3-card grid. Locked cards show unlock condition + LIVE progress ("Rounds 4/10", "Bosses 3/5", "Games 1/3"); unlocked open modal with obtain text "Unlocked in the Retro Arcade". Tier tabs filter main grid only. Locked click → toast with condition (not "Win from a chest").
- [x] 11. Knobs: ProfileScreen unique-cards stat (`ProfileScreen.tsx:134`) = owned/22 across both arrays.

## Phase 4 — Pixelated boss with hit/defeat animation (medium)
- [x] 12. `src/components/arcade/PixelBoss.tsx`: inline SVG pixel sprite (rect grid, crispEdges, 16×16), 3 frames idle/hurt/defeated, hue-shift variant per boss.
- [x] 13. Animations (framer-motion): idle bob; on hit shake+red flash+hurt frame ~300ms; boss lost → defeated frame → fall+fade ~600ms → next boss spawns hue-shifted. HP-hearts bar kept, sprite above question card.

## Phase 5 — Tests, verify script, ship
- [x] 14. `npx tsc --noEmit; npx vitest run` all green. New tests: `rollChest` NEVER returns arcade ids (uniform + pity paths), `grantArcadeCard` dedupe + 3-copy grant, `checkArcadeCards` thresholds; 19-card art contract untouched.
- [x] 15. Update `scripts/verify-gamification.mjs`: new game list, Boss Rush play-through (replaces Math Run), exclusive-card grant check, library arcade section visible with 3 cards + progress text, subject-switch roadmap check (english/science unit headers render), keep dust + mobile-viewport checks. Persist seed → v10. (Rewritten; 42/42 checks pass against local preview.)
- [x] 16. Commit → `node scripts/deploy.mjs` → `verify-live.mjs` + updated `verify-gamification.mjs` → report. (Commit 0455fc8; deploy VERIFIED in sync; live verify-live 12/12, verify-gamification 42/42.)

**Unlock mapping:** Fang = 10 rounds · Bean = all 3 subject games · Bark = 5 bosses.

## Phase 6 — WS5: 2D retro side-scroller "Pixel Run" (medium)
- [x] 17. `ARCADE_GAMES` += `pixel-run` (🏃, subject math, "Jump the spikes and clear math gates to the finish"); extract `makeMathQuestion` → `src/content/arcadeMath.ts` (Boss Rush reuses it); shared `finishArcadeRound` payout helper in `src/engine/arcadeRound.ts` (used by ArcadeGame + PixelRun).
- [x] 18. `src/components/arcade/PixelRun.tsx`: auto-run left→right, tap/Space jump, spike obstacles (−1 life + i-frames), coin arcs, math question gates every 800px (pause + MCQ; correct = +20 score/+30 coins, wrong = −1 life), finish flag at 6400px (+100), 60s/3 lives, pure `computeRunScore`/`gateX` helpers exported for tests; pixel SVG runner/spike/coin sprites (no assets). `ArcadeScreen` routes `pixel-run` → PixelRun; subtitle → "Retro games · earn ⚡ XP and set high scores".
- [x] 19. Bean unlock counts DISTINCT SUBJECTS among current `ARCADE_GAMES` (still goal 3 — Pixel Run shares the maths badge; label/flavor "all 3 subject games" unchanged); `verify-gamification.mjs` → 4 games + new subtitle.
- [x] 20. Tests `tests/pixelRun.test.ts` (registration, gate layout, score math, gate question shape, Bean subject-count); `npx tsc --noEmit` + `npx vitest run` (32 files / 1017 tests) + `node scripts/precommit.mjs` green; local `npm run dev` smoke 9/9 (4-game list, ready screen, stage render, jump, live score, spike hit, gate overlay, zero page errors) — no deploy.

---

## Routes / navigation map (App.tsx state machine — no router)

| From | Trigger | To | Notes |
|---|---|---|---|
| App load, no `user` or pull not settled or `!onboarded` | gate condition | **WelcomeGate** (fixed overlay) | `?gate=2\|3` forces picker steps for QA |
| WelcomeGate step 1 | Google sign-in (**credential passed**) | sync wait → step 2/3 if new, roadmap if old | guest path **deleted**; GIS fail → error + Retry only |
| WelcomeGate step 2→3 | name → character → `finish()` | roadmap (`tab='path'`) | new user only; prefills Google first name |
| Roadmap, **lesson node** tap | `onStartLesson(id)` | **BattleScreen** (kind=`lesson`) | badnik cycle art, HP = `qCount×10`, 7-hit, `REFILL_BATCH=5` |
| Roadmap, **boss node** tap (`id` ends `boss`) | `onStartLesson(id)` | **BattleScreen** (kind=`boss`) | Eggman/Metal art, ~150 HP / 11 hits, boss intro anim |
| BattleScreen win | HP→0 | shared **chest reveal/kick** → `completeLesson` → back to roadmap | same rewards as old LessonScreen |
| BattleScreen loss / ✕ | retry (`key` remount) / exit | BattleScreen again / roadmap | |
| `?library` or `showLibrary` | direct | **LessonScreen** (plain quiz) | review-only, unchanged |
| BottomNav | tab tap | `path` / `arcade` / `profile` | Arcade routes unchanged (Boss Rush → `ArcadeGame`) |
| TopBar AuthBadge ✕ | sign out | **WelcomeGate** returns | |
| Assets | runtime | `BASE_URL + 'images/...'` | GH Pages `/momomath-year2/` safe |
| Sync | GET/PUT | `https://momolearn-ai.vercel.app/api/year2/cloudsave` | Google-sub keyed, no server changes |
| Deploy | `node scripts/deploy.mjs` | `momoazm.github.io/momomath-year2` | gates: tsc / vitest / `npm run verify` |

## Phase 7 — Mandatory Google sign-in + cross-device progress (medium)
- [x] 22. `WelcomeGate.tsx`: pass **credential** to `signIn(u, credential)` (bug at line 69 — gate sign-ins never sync today); delete guest path entirely (both "Continue without signing in" buttons, `continueAsGuest`, `setGuestName` in `finish()`, `guestName` in `hasSession`); GIS missing/failed → error + Retry only, no guest fallback. (Done.)
- [x] 23. Gate close redesign: close ONLY when `user && sync settled && onboarded` (today any session closes it, so Google users skip name/character and new devices never load the save). Flow: sign in → "Loading your progress…" → remote save exists = **old user** → apply name/mascot/progress → roadmap, no picker; no remote = **new user** → step 2 name (Google first name prefilled) + step 3 character → `finish()` pushes save. QA seeds (user, no credential) and `expired`/`error` settle on local `onboarded`. Extract pure `resolveGatePhase()` → `tests/gatePhase.test.ts`; keep `?gate=2|3`. (Done: `src/engine/gatePhase.ts`, `remoteSeen` on `useSyncStatus`, 8 tests.)
- [x] 24. `cloudsave.ts` identity-merge fix: `snapshotFromPlayer` stamps `updatedAt=Date.now()` so fresh-device local defaults always win "newest" → account name/mascot/onboarded get clobbered and pushed back. When remote exists: `name/mascot/subject/dailyGoal/soundOn` follow **remote**; `onboarded = local || remote`; counters stay max/union. Unit tests: fresh-device pull keeps remote identity + unions progress. (Done: `tests/cloudsaveMerge.test.ts`, 4 tests.)
- [x] 25. Migrate seed scripts from `guestName` → seeded user (no credential → gate settles locally): `verify-live.mjs`, `verify-gamification.mjs`, `snap.mjs`, `visual-shots.mjs`, `big-shot.mjs`, `probe-legacy.mjs`; sign-out check clears `user`; `probe-legacy` asserts legacy player state opens under a seeded user. (Done.)
- [x] 26. Gates: `npx tsc --noEmit` + `npx vitest run` + `npm run verify`. **Zero touch `ProfileScreen.tsx`** (dirty from another session; guest branch becomes dead code). (Green: tsc clean, vitest 34 files / 1034 tests, precommit OK; ProfileScreen untouched.)

## Phase 8 — Roadmap battle system — port from sonic-world (large)
- [x] 27. Port `battle.ts` → `src/engine/battle.ts`: kinds `lesson|boss`, no zones/elements; boss ~150 HP / 11 hits vs lesson `qCount×10` HP / 7 hits; `REFILL_BATCH=5`; buddy passives keyed by `player.mascot` (fallback `none`). (Done: `createBattle`/`answerBattle`/`battleAccuracy`; boss HP 150 / hit 11, lesson qCount×10 / hit 7; `BUDDY_PASSIVES` by mascot id.)
- [x] 28. Copy `public/images/enemies/*` + `public/images/players/sonic.webp`, `enemyArt.ts`, `ATTRIBUTION.md` — **BASE_URL-safe paths** (GH Pages `/momomath-year2/`); boss nodes → Eggman/Metal art, lesson nodes → badnik cycle; emoji fallback kept. (Done: 33 enemy webps + sonic.webp + manifests; `enemyArt.ts` uses `import.meta.env.BASE_URL`.)
- [x] 29. Port `QuestionView.tsx` (incl. visual / `gradeSpeak`). (Done: `src/components/QuestionView.tsx` + `src/engine/speakGrade.ts` + `src/engine/questionText.ts`.)
- [x] 30. Port `BattleScreen.tsx`: §18 Pokémon animations (bob/lunge/shake/faint), boss-only intro, no adaptive engine → wrong answer shows `q.hint`, DEV hook `window.__mbBattle`. (Done: `src/screens/BattleScreen.tsx`.)
- [x] 31. Extract LessonScreen chest reveal/kick ritual → shared component used by battle win + LessonScreen. (Done: `src/components/ui/ChestReveal.tsx`; LessonScreen done-phase now delegates.)
- [x] 32. App routing (see Routes map above): `PathScreen` node tap → `BattleScreen` for **all lesson nodes** (boss ids = tougher opponent + intro); `LessonScreen` only for `?library` review; win → `completeLesson` + chest; retry via key remount. (Done: `App.tsx` activeBattle state with epoch key remount; `?lesson=<id>` still opens plain LessonScreen for review; `?library` stays LibraryScreen.)
- [x] 33. Port `tests/battle.test.ts` (adapt unit ids). (Done: 11 tests, u1l1/u1boss.)
- [x] 34. Gates: `npx tsc --noEmit` + `npx vitest run` + `npm run verify`; **no store version bump** (no new persisted fields — battle rides `lessonProgress`), `CARDS` untouched at 19, no server changes. (Green: tsc clean, vitest **35 files / 1045 tests**, precommit OK; store version still v10, CARDS still 19.)

## Phase 9 — Verify + ship
- [x] 35. Update `verify-live.mjs` + `verify-gamification.mjs`: battle flow (node tap → fight → refill → win → chest) **and** Phase 7 auth seeds / new-vs-returning gate checks. (Done: evaluate destructuring, className tap-select, HP-split guard, singleCard regex, Attack poll + 💡 poll, Library content-wait.)
- [x] 36. Local smoke on `:3200`: lesson battle, tougher boss battle, refill, hint-on-wrong, chest, new-user picker, returning-user straight-to-roadmap, sign-out → gate, zero console errors. (Green on :3200 — verify-live **23/23**, verify-gamification **49/49**; tsc 0, vitest 35 files / 1045 tests, precommit OK.)
- [x] 37. Commit **only own hunks** (shared `PLAN.md` via `git apply --cached` hunk — never stage `PixelRun.tsx` / `ProfileScreen.tsx` / `pixelRun.test.ts`) → `node scripts/deploy.mjs` → live `verify-live` + `verify-gamification` → report. (Done: commit `5a1a3ba` 58 files, no forbidden; deploy VERIFIED `assets/index-CfT-NkwN.js`; live **verify-live 23/23**, **verify-gamification 49/49**.)

## Phase 10 — Port 4 optional subject extras: Deutsch / العربية / الدين / دراسات

Source: `origin/chat/year2-signin-20260918` (selective checkout ONLY — never merge that branch: adaptive engine, session auth, LM tracker, hyper cards are OUT of scope).
Opt-in DLC model: extras hidden until Profile → "Extra adventures" Add, or `?subject=<extra>` deep link. Core math/english/science loop untouched.

**Constraints (never violate):**
- `CARDS` pinned at 19; `ARCADE_CARDS` separate; Bean/goal-3/subjects-3 semantics untouched.
- `subjectsPlayed` prefix detection stays core-3 only (`e`/`s`/`u`) — extras deliberately do NOT count toward "Triple Threat" (matches branch).
- New store flags (`*Enabled`) are local-only (cloudsave field whitelist) — but `subject` DOES sync → step 46 auto-enables the flag when a remote subject is an extra.
- Store persist version bumps v10→v11 with `migrate` backfill; `verify-gamification.mjs` assert updated in lockstep.
- Isolation: worktree `C:\Users\momo\momomath-year2-extras`, branch `chat/extra-subjects-20260923` — main checkout's dirty files (`ProfileScreen.tsx`, `PixelRun.tsx`, `pixelRun.test.ts`, `PLAN.md`) belong to another session and are never touched.

- [x] 38. Isolate: `git worktree add -b chat/extra-subjects-20260923 ..\momomath-year2-extras main` (off `cf46cfd`) + `npm install` in the worktree.
- [x] 39. Selective copy from branch: `src/content/{german,arabic,religion,social}/` (40 files ≈ 5,974 lines), `docs/{german,arabic,religion,social}-roadmap.md`, `tests/{german,arabic,religion,social}/` + 4 `*Registry.test.ts`. EXCLUDE `tests/__arabic_tmp.test.ts` and everything non-extras. (Verified: 71→106 test files, content dirs present, no adaptive/auth/LM leakage.)
- [x] 40. `src/content/types.ts`: widen `Subject` union (+doc comment). `src/content/registry.ts`: 4 imports, 4 `CURRICULA` entries, boot-safe `?? CURRICULA.math` fallback in `getCurriculum` (port of branch crash-fix 343c8e8).
- [x] 41. `src/components/ui/TopBar.tsx`: `SUBJECTS` → `CORE_SUBJECTS` + 4 conditional `*_EXTRA` entries (branch icons/labels/colors: 🇩🇪 🇪🇬 🇿 🗺️), flags via `usePlayer`, `title` attr on pill buttons. Keep main's responsive Pill classes. (Verified: smoke E1 sees 4 extra pills, F1–F3 core switch green.)
- [x] 42. `src/screens/PathScreen.tsx`: extend `subjectLabel` ternary with the 4 branch labels. (Verified: smoke C1/D2/E2 footers show "Deutsch (extra)" / "العربية (extra)" / "الدين (extra)".)
- [x] 43. `src/engine/store.ts` **v10→v11**: `PlayerState` += 4 flags + 4 setters; `ExtraKey`/`ExtraSubject` + `initialSubjectFromUrl()` + `initialExtraEnabled()`; `setSubject` URL whitelist includes extras + auto-enables flag; disable-while-viewing falls back to Maths; `migrate` `version < 11` backfills flags (on if subject/URL is that extra) + validates `subject` ∈ 7 values else Maths. (Verified: smoke A1/A2 v7→v11 backfill, D1 deep-link regression, E3 disable-while-viewing → Maths.)
- [x] 44. `src/screens/ProfileScreen.tsx`: 4 × "Extra adventures · optional" cards (icon, blurb, ➕ Add / ▶ Play / Remove) inserted above the Google account section. (Verified: smoke B1/B2 4 Add buttons + 4 headers, E3 scoped Remove.)
- [x] 45. `src/engine/tts.ts`: port `ttsLangFor`/`speakFor`/`speakSlowFor` (german→de-DE; arabic/religion/social→ar-EG) **and wire call sites** — `QuestionView.tsx:357`, `LessonScreen.tsx:225/569/576`, `BattleScreen.tsx:72` switch to subject-aware speak (branch shipped these unwired; do not copy dead code). (Verified: `tests/ttsLang.test.ts` 3 assertions green.)
- [x] 46. `src/engine/cloudsave.ts`: when an applied remote `subject` is one of the 4 extras, auto-enable the matching flag so device B (flag false) still renders the pill + units. (Implemented in `store.ts:846` `applySyncedSnapshot` — `subject` is the synced field; `*Enabled` flags stay local-only.)
- [x] 47. `scripts/verify-gamification.mjs:118`: `persist migrated to v10` → `v11` (seed stays v7 so the full migrate chain runs). (Verified: live **50/50**.)
- [x] 48. Gates: `npx tsc --noEmit` + `npx vitest run` (expect +35 test files: 4 registry + 32 unit wrappers + 4 harness) + `node scripts/precommit.mjs`. Verify untouched: `CARDS`=19, arcade/Bean, subjects-3. (Verified: **tsc 0**, **vitest 72 files / 1513 tests**, **precommit OK**, `cardStars` 6/6 + arcade/Bean 18/18 + `subjects-3` present, diff shows zero changes to `cardStars.test.ts`/`cards.ts`/`arcade/`.)
- [x] 49. Local smoke on offset port **:3201** (parallel-chats port map): enable each extra in Profile → pill appears → units + boss render → battle plays → TTS uses right locale → Remove falls back to Maths; core subject-switch check still green. (Verified: `scripts/pw-extras-subjects.mjs` **26/26**, zero page errors, screenshots `x-01`…`x-07`.)
- [ ] 50. Present step-by-step diff vs this checklist → **get explicit user approval** for (a) commit on the worktree branch, (b) merge to `main`, (c) `node scripts/deploy.mjs` — three separate approvals; main checkout must be clean of foreign dirt before any deploy.
