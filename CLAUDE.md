# TTA Leaderboard: migrate to React + Vite (JavaScript)

## Project
Venue big-screen **university medal table** for the 13th Thailand Teaching Academy Award (2027, hosted by KMUTT, Industrial Education Faculties Network). A working single-file prototype is in `reference/leaderboard.html` (Version 17). Port it to a React + Vite + **JavaScript** project (no TypeScript).

## Git workflow
Work only on the `dev` branch. Never commit to `main`, create other branches, merge, or push unless the user asks. Make one commit per plan task, stage explicit paths only, and run `npm test` before committing. The active plan is listed in `AGENTS.md`.

## Deployment
Both: (a) hosted static site, and (b) offline bundle (`base: './'`, hash routing) that runs from a venue PC or USB stick.

## Routes
- `/#/` venue display (no controls visible)
- `/#/admin` operator console: CSV upload, source URL, LIVE toggle, replay intro, present/fullscreen, data preview with validation errors, button to open the venue view.
- Admin to screen sync: build `BroadcastChannel` (same machine) and shared CSV/Google-Sheet URL polling (different devices) first. A realtime backend only if the customer asks for remote control.

## Data model
Registry (code, Thai name, logo, team color) is separate from medal counts, so a CSV only supplies counts.
Columns: `University, ThaiName, Gold, Silver, Bronze` with an optional title line. Real customer layout is still to be confirmed; ask for one sample row.

Universities (3 King Mongkut's + 7 Rajamangala): KMUTT, KMUTNB, KMITL, RMUTL, RMUTT, RUTS, RMUTS, RMUTI, RMUTK, RMUTP. Team colors are in the prototype's `SAMPLE`.

## Ranking
Hidden weighted points: Gold 3, Silver 2, Bronze 1. Tiebreak gold, silver, bronze, name. Points are NOT displayed (no PTS or GAP columns). Put this in a pure `rank.js` with Vitest tests.

## Design rules (keep exactly)
- CI colors: #FF5F1C, #FF8D20, #FFC525, #2A9FF7 only (no F1 red).
- F1 timing-tower look: Titillium Web (+ Noto Sans Thai), skewed position blocks, team-color bar, chamfered rows (clip-path), ▲▼ rank movement, LIVE pill.
- Title = English short name; secondary text = full Thai name.
- Logos on white circular chips, full seals, no clipping.
- Medals as SVG icon x count (zero counts faded).
- Per-row team-color gradient (color-mix) plus sheen animation.
- #1 row dominant: taller, glow, "★ Leader" tag, bigger logo chip.
- Massive cinematic entrance (staggered rows, leader slam, flare/flash overlays); respect `prefers-reduced-motion`.
- Keyboard: `P` present mode, `F` fullscreen.
- Responsive from phone to 4K using `clamp()`.

## Planned structure
```
src/ main.jsx, App.jsx
  components/ Header ColumnHead Tower Row LogoChip MedalIcon LiveBadge IntroFlare Toast
  admin/ AdminPage CsvUpload SourcePanel FormatModal Controls
  lib/ csv.js (PapaParse) rank.js sample.js
  hooks/ useLeaderboardData useLivePolling useFlip usePrevRanks
  store/ (Zustand)
  styles/ tokens.css tower.css animations.css
  assets/logos/
tests/ rank.test.js csv.test.js
```
Use Framer Motion `layout` (or a `useFlip` hook) for reorder animation. Plain CSS, no Tailwind.

## Phases
1. Scaffold Vite+React, tokens, assets, routing, two build configs.
2. Port static view; compare to the prototype.
3. CSV parser, ranking, movement, count-up, tests.
4. Animations: entrance, leader, sheen, reorder.
5. Data sources: upload, URL polling, offline fallback to last good data.
6. Admin screen and sync.
7. Packaging: hosted build and zipped offline bundle with README.
8. QA at 1080p and 4K; test with a messy CSV.

Start with phases 1-2 and confirm before going further.
