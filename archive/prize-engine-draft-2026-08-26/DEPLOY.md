# Deployment notes — momomath-year2 (parked)

## Target (confirmed by Momo)
**https://momoazm.github.io/momomath-year2/** — GitHub Pages project site.
(Note: "githun.io" typo in chat = github.io.)

## Environment facts already verified (2026-08-26)
- `gh` CLI authenticated as **momoazm** (scopes include `repo`) ✔
- Current repo remote: `github.com/momoazm/momolearn-ai` (Vercel-linked, unrelated — do not touch)
- Engine code lives here: `Documents\Default Project\momomath-year2\`
  (⚠ also an older stray folder `C:\Users\momo\Documents\momomath-year2` — check which is canonical before pushing)
- No UI/build setup yet — engine only (`src/engine/*.ts`, verified by `scripts/verify-chests.mjs`, 37/37 green)

## Route to finish later
1. Decide canonical folder; init git there if needed.
2. Add minimal static UI (index.html) that imports the chest engine; bundle TS with esbuild:
   `npx --yes esbuild src/main.ts --bundle --format=esm --outfile=dist/app.js`
3. Set base path `/momomath-year2/` for all asset/module URLs (Pages serves project subpath).
4. Push to `momoazm/momomath-year2`; enable Pages (main branch, root or `/docs`).
5. Verify live URL + run prize-system checks one last time before sharing.
