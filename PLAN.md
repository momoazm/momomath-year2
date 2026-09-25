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
- [x] 21. Gameplay polish (follow-up): player sprite = Sonic `<Mascot>` (happy/excited/cheer; `aria-label="Runner"` kept); jump retuned (GRAVITY 0.55→0.6, JUMP_V 9.6→10.2, apex ≈87 > coin top 52) + generous coin hitbox so a well-timed jump sweeps the whole arc (spacing 24, heights 8/34/52/34/8); sequential `planFeatures(rand, fromX, untilX)` spawner — one cursor for spikes + coin arcs, `GATE_CLEAR=80` gate zones, `COIN_GAP_AFTER=130` arc→next-feature gap (coins can never lead into obstacles); gate outcomes: correct = +50 pts (GATE_SCORE 20→50) + 30 coins + 4s cyan shield (spikes pass through), wrong = −1 life + `WRONG_PENALTY=30` (score floors at 0, brief i-frames) with live HUD markers (🛡️/❌n); `computeRunScore(…, wrongs)`; ProfileScreen `/3 games` → `ARCADE_GAMES.length`. Verify: tsc clean; vitest **32 files / 1022 tests** (13 pixelRun tests incl. planFeatures invariants); precommit OK; local smoke **13/13** (Sonic, jump ≥5px, gate overlay + HUD penalty, exclusives on Library); deployed `index-CxsAI_FX.js`; live `verify-gamification` **42/42**.

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
- [x] 50. Present step-by-step diff vs this checklist → **get explicit user approval** for (a) commit on the worktree branch, (b) merge to `main`, (c) `node scripts/deploy.mjs` — three separate approvals; main checkout must be clean of foreign dirt before any deploy. (Approved: (a) done — `0b1d38c` 98 files + `486ac24` harness fix; (c) first deploy from WORKTREE verified live 50/50+23/23+26/26 but was missing `.env.local` (gitignored — worktrees don't receive it) so `VITE_GOOGLE_CLIENT_ID` tree-shook Google sign-in out — fixed by copying `.env.local` into the worktree and redeploying (markers `gsu=true german=true`, gh-pages `66add6d`); user card condition verified: CARDS=19/ARCADE=3/ALL=22, zero diff in `engine/cards.ts`/Library/art/card-tests, no card file in any commit, all deleted lines reviewed (none card-related), live library `/22` + Fang art + chest-pool green. (b) DONE — user confirmed no other session; parked Pixel Run polish (step 21) verified (tsc 0, 23/23) and committed as `ddbc1d8`; `git merge` auto-merged the 2 formerly-overlapping files (`PLAN.md`, `ProfileScreen.tsx`) with zero conflicts → `13fc1d1`; post-merge gates **tsc 0, vitest 72/1518, precommit OK**; worktree FF'd to `13fc1d1`; final redeploy ships extras + pixel polish together.)

## Phase 11 — Locked-card gray art preview

Locked cards show real art in grayscale under the existing ❓/🔒 badge. Nothing removed (arcade page, exclusives section, toasts, goals, progress stay). 22 cards total (19 chest + 3 arcade).

- [x] 51. `LibraryScreen.tsx` `CardGrid` locked branch: absolute grayscale art (`opacity-40 grayscale`) behind the ❓ overlay; badge content in `relative z-10` wrapper. Real face stays `opacity-0` when locked. (Implemented: sibling `<img>` + `z-10` badge wrapper.)
- [x] 52. `LibraryScreen.tsx` `ArcadeExclusives` locked branch: same gray art behind 🔒 / Exclusive / goal / progress (section + toast path untouched). (Implemented: sibling `<img>` + `z-10` badge wrapper.)
- [x] 53. Gates: `npx tsc --noEmit` + `npx vitest run` + `node scripts/precommit.mjs`; local smoke — locked chest = gray art + ❓, locked arcade = gray art + 🔒 + goal, unlock full color, arcade page intact. (Verified: **tsc 0**, **vitest 72 files / 1518 tests**, **precommit OK**, `scripts/pw-gray-cards.mjs` **13/13** × 8 runs — 21 gray locked imgs, `grayscale(1)` opacity 0.4, z-10 badge, toast + arcade page green, zero page errors.)
- [x] 54. Commit only `LibraryScreen.tsx` + this PLAN hunk (worktree is clean of foreign dirt) → optional deploy only if user wants it. (Staged exactly those 2 files; smoke helper `scripts/pw-gray-cards.mjs` left untracked.)

## Phase 12 — 100-card roster + retire SVG art (user request 2026-09-24)

Source of truth: `C:\Users\momo\Documents\momomath-year2` already shipped 100 cards (97 chest + 3 arcade) with real `.webp` art (0 SVGs) — commits `15e5589` / `5764464`, PLAN §7 band 39/25/18/10/5. **READ-ONLY** from that checkout (never write; it has foreign staged dirt). Home keeps Phase 11 gray preview + single-card-pack economy (LOCKED_PITY, uniform pick) — do NOT port the multi-slot `CARD_CHANCE` economy.

- [x] 55. Copy all 100 `.webp` files from docs `public/cards/` → home `public/cards/`; delete the 10 AI/hand-drawn SVGs (`charmy,ray,vector,espio,omega,jet,super,fang,bean,bark.svg`). (Done: 100 webp, 0 svg on disk.)
- [x] 56. `cards.ts`: `CardDef.id` `MascotId` → `string` (roster-only ids like `movie-*` are plain strings); port docs 97-row `CARDS` + `ARCADE_CARDS` (all `.webp`; `super` → `cards/super-sonic.webp`; Fang name = "Fang the Sniper"); keep home `rollChest` / `PACK_SIZE` / `LOCKED_PITY` / novelty — only roster + art change. (Done: 97+3=100, zero `.svg` refs in `cards.ts`.)
- [x] 57. Consumers: drop `MascotId` import from cards if unused; Library header already `ALL_CARDS.length` → `/100`; Profile unique-cards already `ALL_CARDS.length`; star-distribution → `ALL_CARDS` if still `CARDS`; Phase 11 gray `<img>` paths auto-follow `card.image`. (Done: Profile star buckets use `ALL_CARDS`; card `#NN` uses `ALL_CARDS.findIndex`; verify scripts `/100` + "Fang the Sniper".)
- [x] 58. Tests: port docs `cardStars` art contract (100-entry map, all `.webp`, `ALL_CARDS`/`CARDS`/`ARCADE_CARDS` = 100/97/3); fix `chestCards`/`arcadeCards` hard-coded 19→roster size + webp; add PLAN band assert 39/25/18/10/5; home single-pack economy tests stay (1 card per chest). (Done: band + exists-on-disk tests added; new-card probability test retuned for 97-card pool; `@types/node` added for `existsSync`.)
- [x] 59. Gates: `npx tsc --noEmit` + `npx vitest run` + `node scripts/precommit.mjs`; smoke `?library` — header `/100`, locked gray art (Phase 11) uses `.webp`, zero `.svg` refs in `cards.ts`/`public/cards`. (**tsc 0**, **vitest 72 files / 1522 tests**, **precommit OK**, `scripts/pw-gray-cards.mjs` **13/13** — overall `1 / 100 collected`, gray=99, sample src `cards/fang.webp`, zero page errors.)
- [x] 60. Deploy after explicit user approval ("deploy" 2026-09-24): `node scripts/deploy.mjs` → `assets/index-wox-MKYW.js` live + in-sync + markers + stale-cache 200; live verifies **verify-live 23/23** (first run hit a transient 503 resource error — re-run clean), **verify-gamification 50/50** (library `4 / 100 collected`, Fang "Fang the Sniper" art renders), **pw-gray-cards 13/13**. (Commit later approved: `c882ddf` 111 files + `4237260` AGENTS rule, both pushed.)

## Phase 13 — Battle listening replay + German Year-2 level fix (user report 2026-09-24)

Two reports: (1) "listening lessons: no sound and no button to hear the word" — probe (`scripts/_tts_probe.mjs`) proved normal play = BattleScreen→`QuestionView`, which auto-speaks `audioText` ONCE (`BattleScreen.tsx:69-74`) and renders NO 🔊/🐢 buttons (`audioButtons: []`); the `AudioBar` exists only in `LessonScreen` (`?lesson=`/`?library` review). Autoplay can also be blocked (no-gesture contexts) → no sound AND no button.
(2) German questions beyond Year-2/pre-A1 — user approved **"fix flagged hard spots"**: G10 dative preps + ordinals + trivia T/F + 4-line letter; G5 meta-grammar T/F (+ gender-theory hint); G6 mein/meine rule hint. Age-right vocab compounds stay (with audio).

- [x] 61. Extract `AudioBar` → `src/components/AudioBar.tsx` (🔊 Listen + 🐢 slow, `ttsAvailable()` guard); render it in `QuestionView` for ANY question with `audioText` (mcq/match/order) so battle gets replay buttons (tap = user gesture → works where autoplay is blocked); LessonScreen imports the shared component (delete its local copy).
- [x] 62. G10 rewrites (`g10.ts`): `gWhereMatch` → preposition ↔ meaning pairs (`auf/on top`, `in/inside`, `unter/under`, `neben/next to`) — zero case-marked strings; `gBuildWhereDe/En` → room "Das ist der/die/das X." builds (taught vocab, no dative); `gOrdinalPicture` → birthday candle-count MCQ (zwei/drei/vier/fünf, taught in G4, speaks the German number); `FEST_TF` → taught-content statements only (drop Nikolaus/Sunday-shops/country-code); `LETTER_SETS` → 3 short lines; update l2/l3/l4/boss intros.
- [x] 63. G5/G6 (`g05.ts`, `g06.ts`): `ZOO_TF` meta-grammar items → taught-content ("Hund"=cat? false; "Ente"=duck? true); `gArticleMatch` hint → chunk-learning wording (no gender analysis); `gDasIst` hint → "mein/meine both mean my" (no paradigm).
- [x] 64. Regression test `tests/german/year2Level.test.ts`: units G5/G6/G10 across seeds — no question may contain `auf dem |in dem |unter dem |am Himmel|Nikolaus|country code|masculine|neuter`, no `erste|zweite|dritte|vierte` ordinal words.
- [x] 65. Gates: `npx tsc --noEmit` + `npx vitest run` + `node scripts/precommit.mjs`; local probe — battle listening question now shows 🔊/🐢, click logs `speak`, LessonScreen AudioBar still green; zero page errors.
- [ ] 66. Commit (own files only) → deploy → live verify — both only on explicit user approval, commit BEFORE deploy per AGENTS.md standing rule.

**Phase 13 verification (2026-09-25):** tsc=0; vitest 73 files / 1525 tests (incl. new year2Level 3/3); precommit OK; `rg` sweep = zero flagged German patterns left; probes: battle `audioButtons: ["🔊 Listen","🐢"]` + autoplay speak "wind"; `?lesson=` seeded probe: intro renders → "Let's go!" → 🔊 present → click logs 2 speak events. Step 66 awaits user go-ahead.

## Phase 14 — Friendly Sonic-character lesson explanations (medium) (user request 2026-09-25)

User: "a friendly explanation before each lesson using sonic characters to teach the lesson". Research: every lesson already has `intro { mascotId, title, body }` (`types.ts:131,167`, 19 renderable mascots) but `BattleScreen` NEVER shows it (only boss card at `BattleScreen.tsx:335-348`); `LessonScreen` intro phase exists only on the `?lesson=` review path.

- [ ] 67. `BattleScreen` pre-question **guide phase**: before question 1, show the lesson's `intro` (big mascot + title + friendly body + objectives row + CTA "Let's go! 🚀" — tap doubles as the audio-unlock gesture). Boss lessons: guide phase first, then the existing boss warning card (boss card untouched). Show on first attempt (epoch 0), skip on loss-retries (no nagging).
- [ ] 68. Real "teach" content: optional `teach?: string[]` (2–3 lines, each ≤12 words, friendly kid voice) on `LessonDef` — author for ALL 74 English nodes; 🔊 button speaks each line via `speakFor` (pre-readers must not need to read). Fallback when `teach` absent = render `intro.body` (all other subjects keep working with zero content edits).
- [ ] 69. Character polish: use `intro.mascotId` variety (19 mascots already assigned per lesson), expression happy→excited across lines; verify both paths (normal + boss) at 360px via local probe.

## Phase 15 — Unit books: 📖 5–10-page readers, Duolingo-Stories style (large) (user request 2026-09-25)

- [ ] 70. Model (additive in `types.ts`): `BookPage { scene: string[]; text: string; focus?: string }`, `BookDef { id, unitId, title, pages: BookPage[] }` with 5–10 pages each. Content: `src/content/english/books/e01..e13.ts` — one book per English unit (13 total), story reuses each unit's own vocabulary + recurring Sonic cast (Tails, Cream, Amy…), simple kid sentences, last page = friendly recap line.
- [ ] 71. `src/screens/BookScreen.tsx` + `?book=<id>` param in `App.tsx` (pattern like `?lesson=`): page-by-page reader — big text + emoji scene, 🔊 read-along speak per page + tap-word speak on `focus` words, page dots + ← → buttons + swipe, then "The End 🎉" finale.
- [ ] 72. Rewards/state: store `version` 11→12 + migrate backfill `booksRead: Record<string, boolean>`; first full read → +20 gems + `sfx.streak` + celebration; completed book = ✅ on node. Add `booksRead` to `cloudsave.ts` whitelist (`CloudSave` + `snapshotFromPlayer`) AND to the momolearn-ai server whitelist if required — check `lib/year2/cloudsave` first, deploy API before client (commit-first rule).
- [ ] 73. Roadmap: `PathScreen` renders an additive **📖 book node** as first node under each unit header that has a book (start: English's 13 units). Unlock = unit's first lesson unlocked; tap → BookScreen; completed → gold 📖 + "📖 read" badge on unit header. Zigzag layout + 🔒 styling reuse existing node logic — lesson nodes, `isLessonUnlocked`, and boss inference untouched (book node is synthetic, NOT added to `UnitDef.lessons`).
- [ ] 74. Discovery polish: subtle ✨ pulse on unread books (active-node pulse pattern from `PathScreen.tsx:56-59`); unit header shows `📖 x/1` read state.

## Phase 16 — Duolingo-for-kids roadmap additions, each subject (medium) (user request 2026-09-25)

- [ ] 75. **Locked-node friendly popup**: tapping a 🔒 node opens a small encouraging card — "Finish {previous lesson} first — you've got this! 💪" (current behavior: silent/disabled). Additive overlay only.
- [ ] 76. **Unit trophy celebration**: enhance the existing "Unit mastered!" block (`PathScreen.tsx:169-174`) into a celebration ladder — banner + 🏆 + cheering mascot bounce + gems bonus (+30, once per unit, new `unitsCelebrated` field → store v13 or fold into v12 migrate). Existing 🏅 badge logic stays.
- [ ] 77. **🔁 Practice node**: synthetic node after each unit's boss, unlocked when unit is done; opens `BattleScreen` re-serving the unit's weakest lesson (lowest `bestAccuracy`, tie→first) with a fresh seed — "Practice makes perfect! 🔁". Derived from `lessonProgress`, no new persistence; id `<unitId>practice`, kept OUT of `UnitDef.lessons` (boss/harness invariants untouched).
- [ ] 78. Explicit node typing helper in `PathScreen`: `kindFor(node) → 'lesson'|'boss'|'book'|'practice'` (keeps id-suffix fallback as-is; icons per kind 👑⭐📖🔁).
- Backlog (NOT scheduled — only if user asks later): 🎧 dedicated listening nodes, tap-word glossary, personalized daily practice hub.

## Phase 17 — Friends + referral codes to compete (large, two repos) (user request 2026-09-25)

- [ ] 79. Recon in `C:\Users\momo\momomath-year2` → momolearn-ai backend (`lib/year2/leaderboard.js`, `cloudsave`): confirm Vercel Blob key layout, payload shape, auth/rate limits. Design: friends compete on **weekly XP** already tracked by the leaderboard → zero new score plumbing; friends list = id+name only.
- [ ] 80. Server (momolearn-ai repo, `lib/year2/friends.js` + route wiring in `lib/year2/` routes):
  - `POST /api/year2/friends/code` { playerId, name } → stable 6-char referral code (base32 hash of player id; regenerable to invalidate old codes; no PII stored).
  - `POST /api/year2/friends/join` { playerId, name, code } → validate (≠ own code, code exists, ≤20 friends, once-only edge) → store friendship edge; returns `{ ok, friendName, firstJoin }`.
  - `GET /api/year2/friends/list?playerId=` → friend ids+names; client pulls weekly XP from existing leaderboard GET.
  - Abuse: per-id rate cap, size limits, no secrets in client.
- [ ] 81. Server tests + ship: extend momolearn-ai verify script for the 3 endpoints; commit → Vercel deploy (hook + poll READY per global AGENTS) → verify on prod aliases. Commit-first rule applies.
- [ ] 82. Client `src/screens/FriendsScreen.tsx` (Profile section entry to avoid bottom-nav re-layout): big **invite-code card** (🔊 read code aloud + copy button), join-by-code form with friendly toasts ("That code doesn't match — check the letters!"), friends list with weekly XP, rank medals (#1 👑), "vs you" highlighted row, empty state explaining how to invite ("Send your code to a friend!").
- [ ] 83. Referral reward (achievable cross-device): first successful join → server returns `firstJoin` → joiner gets +30 gems + new achievement `made-a-friend` (store v12/v13 backfill); copy promises ONLY the joiner's bonus (no un-deliverable referrer gems). Regenerating your code revokes old edges for NEW joins (existing friendships persist — no deletion).
- [ ] 84. Privacy: screen states "Friends see only your display name and weekly XP"; nothing else synced (auth email never leaves `cloudsave`).

## Phase 18 — Gates, verify, ship (roll-up)

- [ ] 85. New tests: book harness (each book 5–10 pages, non-empty text/scene, unique ids, unitId matches an English unit), store migrate (v11→v12/v13 backfills), path book/practice unlock rules, `teach` fallback, friends client with mocked fetch; extend `scripts/verify-gamification.mjs` (book read-through end-to-end + friends card visible).
- [ ] 86. Full gates green (`tsc` / `vitest` / `precommit`) → commit (own files only) → `node scripts/deploy.mjs` → live verify — commit BEFORE deploy, both on explicit user approval.
- [ ] 87. Phase 13 step 66 + all Phase 14–17 client deploys folded into the same approval windows; momolearn-ai server deploys tracked separately in that repo's PLAN/AGENTS.

**Ordering note:** 14 → 15 → 16 are client-only and ship in one window; 17 needs the momolearn-ai server deploy first (81) before client work goes live (82–83).
