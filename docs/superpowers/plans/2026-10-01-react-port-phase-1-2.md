# TTA Leaderboard — React Port, Phases 1–2 Implementation Plan

> **For any AI agent or developer executing this plan:** read "How to execute this plan" and "Git workflow" below before Task 0. The plan is self-contained: every step has the exact files, code, commands and expected output. You do not need any tool-specific skills or plugins.

**Goal:** Scaffold a React + Vite (JavaScript) project with two build targets and port the static venue view of `reference/leaderboard.html` (V17) so it renders pixel-comparably from sample data.

**Architecture:** Single Vite app with `HashRouter` (`/#/` venue, `/#/admin` console). A university **registry** (code, Thai name, logo, color) is kept separate from **medal counts**; `withRegistry()` merges them and a pure `rank()` orders them. The venue view is a tree of small presentational components styled with plain CSS ported from the prototype. Hosted build = normal Vite output; offline build = one self-contained HTML file (`vite-plugin-singlefile`) so it opens from `file://` on a venue PC / USB stick.

**Tech Stack:** Vite, React 19, react-router v7 (`HashRouter`), `@fontsource/titillium-web` + `@fontsource/noto-sans-thai`, `vite-plugin-singlefile`, Vitest + jsdom + Testing Library. Plain CSS, no Tailwind, no TypeScript.

**Scope:** CLAUDE.md phases 1–2 only, plus `rank.js` (pulled forward from phase 3 because the static view must be sorted). Stop at Task 12 and get the user's confirmation. Phases 3–8 are outlined in the roadmap at the end and will each get their own plan.

---

## How to execute this plan

1. **Read first:** `CLAUDE.md` (project rules and design rules) and `reference/leaderboard.html` (the prototype you are porting). If this plan and `CLAUDE.md` disagree, follow `CLAUDE.md` and record the conflict under "Handoff notes".
2. **Find where to resume:** do the first task whose checkboxes are not all ticked. Earlier tasks are already committed. Check with `git log --oneline`.
3. **Work in order:** do tasks in order and steps in order within each task. Don't skip a "verify it fails" step: it proves the test actually tests something.
4. **Copy code as written:** don't rename functions, props, files or CSS classes. Later tasks and tests depend on these exact names.
5. **When an expected output doesn't match:** stop and find the cause. Don't change a test to make it pass unless the test is clearly wrong; if you change one, record why under "Handoff notes".
6. **Tick as you go:** change `- [ ]` to `- [x]` in this file for each finished step, and include this plan file in that task's commit (add `docs/superpowers/plans/2026-10-01-react-port-phase-1-2.md` to the `git add` line). The next agent resumes from the ticks.
7. **Shell:** commands are POSIX shell. On Windows, run them in **Git Bash**, not PowerShell or cmd. The project path contains spaces, so quote it.
8. **Checkpoint:** Task 12 is a hard stop. Report to the user and wait for their answer. Don't start phase 3.
9. **Scope:** don't add libraries, features or files that aren't in this plan (for example Zustand, Framer Motion, PapaParse or admin features). They belong to later phases.

## Git workflow

- **All work happens on the `dev` branch.** Never commit to `main`, never create other branches, and never merge into `main`. Merging `dev` into `main` is the user's decision.
- Before starting any session, run `git branch --show-current`. If the output is not `dev`, run `git checkout dev`. If `dev` doesn't exist yet, Task 0 creates it.
- **Don't push** (`git push`) unless the user explicitly asks. The remote is `origin` on GitHub.
- **Make one commit per task** (more if a task says so), using the message given in that task. Use Conventional Commit prefixes: `feat:`, `fix:`, `chore:`, `test:`, `docs:`.
- **Stage explicit paths only.** Never use `git add -A` or `git add .`, because the working tree contains unrelated changes (`TTA-Score-Columns.html` is deleted but not committed, and `graft/` is a local cache).
- Run `npm test` before every commit from Task 2 onward. Don't commit with failing tests.
- **Never use** `--no-verify`, `--force`, `git reset --hard` or `git rebase`. If a commit hook fails, fix the cause.
- If you are an AI agent and your tool asks you to append attribution lines (for example `Co-Authored-By:`), follow it.

## Handoff notes

Agents append dated notes here about deviations, surprises or decisions made while executing. Keep each note to one line.

- 2026-10-01: Plan written. `dev` branch created from `main`. Nothing has been executed yet.

---

## Open questions (defaults are used unless the user overrides)

1. **Scoring legend.** The prototype header shows `PTS · Gold ×3 · Silver ×2 · Bronze ×1`. CLAUDE.md says points are hidden. **Default: omit the legend.** It is easy to restore in `Header.jsx`.
2. **`P` key on the venue route.** The venue view has no controls to hide. **Default: `P` toggles `body.present`, which hides the mouse cursor.** In phase 6, the same class will also hide the admin controls.
3. **Full ties.** If points, gold, silver and bronze are all equal, the prototype still gives sequential positions (1, 2), with the alphabetical order of the code deciding. **Default: keep that behavior.**
4. **Repo hygiene.** `TTA-Score-Columns.html` is deleted in the working tree but not committed, and `reference/CLAUDE.md` duplicates the root file. **Default: don't touch either of them.** The `graft/` folder is a local search cache and is already ignored by `.gitignore`. Stage files only by explicit path.

## Environment notes

- The repo lives in OneDrive. `node_modules/` (about 200 MB) will thrash OneDrive sync, so pause syncing while installing or mark the folder "Always keep on this device".
- Paths contain spaces. Always quote them.
- Tested toolchain: Node 26.1, npm 11.8.

## File map (created in this plan)

```
package.json, vite.config.js, index.html, .gitignore
src/
  main.jsx                     HashRouter + font + CSS imports
  App.jsx                      routes
  VenuePage.jsx                composes venue view from SAMPLE
  admin/AdminPage.jsx          placeholder console (real one in phase 6)
  components/
    Header.jsx                 brand logo, title block, LiveBadge, clock
    LiveBadge.jsx              LIVE / Standby pill
    ColumnHead.jsx             Pos | University | Gold Silver Bronze
    Tower.jsx                  list of Rows
    Row.jsx                    one standing (pos block, movement, who, medals)
    LogoChip.jsx               white circular logo chip
    MedalIcon.jsx              MedalIcon + MedalDefs (shared SVG gradients)
  hooks/useKeyboardShortcuts.js  P present / F fullscreen
  lib/
    rank.js                    points(), compareStandings(), rank()
    registry.js                REGISTRY, REGISTRY_BY_CODE, withRegistry()
    sample.js                  SAMPLE counts (from prototype)
  styles/
    tokens.css                 CSS variables, body background, base
    tower.css                  header, column head, rows, responsive
    animations.css             keyframes + prefers-reduced-motion
  assets/
    logo.png                   TTA brand logo
    logos/logo_<CODE>.png      10 university seals
tests/
  setup.js, rank.test.js, registry.test.js, Row.test.jsx, App.test.jsx
```

---

### Task 0: Get onto `dev` and commit the project baseline

**Files:**
- Commit (already exist, untracked): `CLAUDE.md`, `AGENTS.md`, `.gitignore`, `.ignore`, `reference/`, `logos/`, `docs/`

- [x] **Step 1: Switch to `dev`**

```bash
git checkout dev 2>/dev/null || git checkout -b dev
git branch --show-current
```
Expected: `dev`

- [x] **Step 2: Commit the baseline files** (only these paths. Leave the `TTA-Score-Columns.html` deletion unstaged.)

```bash
git add CLAUDE.md AGENTS.md .gitignore .ignore reference logos docs
git status --short
```
Expected: the listed files are staged (`A`), and ` D TTA-Score-Columns.html` is still unstaged.

```bash
git commit -m "docs: add project brief, prototype, logos and implementation plan"
```

---

### Task 1: Scaffold Vite + React, two build modes, routing shell

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `.gitignore`, `src/main.jsx`, `src/App.jsx`, `src/VenuePage.jsx` (temporary stub), `src/admin/AdminPage.jsx`

- [x] **Step 1: Write `package.json`**

```json
{
  "name": "tta-leaderboard",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:offline": "vite build --mode offline",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [x] **Step 2: Install dependencies**

```bash
npm install react react-dom react-router @fontsource/titillium-web @fontsource/noto-sans-thai
npm install -D vite @vitejs/plugin-react vite-plugin-singlefile vitest jsdom @testing-library/react @testing-library/jest-dom
```
Expected: both finish with `added N packages` and no `ERESOLVE` errors. If `vite-plugin-singlefile` complains about a Vite peer-version mismatch, install the Vite major version that it lists as a peer dependency.

- [x] **Step 3: Append to the existing `.gitignore`** (it already ignores `/graft/`. Keep that line.)

```bash
cat >> .gitignore <<'EOF'

node_modules/
dist/
dist-offline/
.compare/
*.local
EOF
```

- [x] **Step 4: Write `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Hosted:  `vite build`                 -> dist/          (normal hashed assets)
// Offline: `vite build --mode offline`  -> dist-offline/  (one self-contained index.html;
//          Chrome refuses to load external module scripts from file://, so everything is inlined)
// base './' + HashRouter means both builds work from any folder or sub-path.
export default defineConfig(({ mode }) => {
  const offline = mode === 'offline'
  return {
    base: './',
    plugins: [react(), offline && viteSingleFile()].filter(Boolean),
    build: { outDir: offline ? 'dist-offline' : 'dist' },
    test: {
      environment: 'jsdom',
      include: ['tests/**/*.test.{js,jsx}'],
      setupFiles: ['tests/setup.js'],
    },
  }
})
```

- [x] **Step 5: Write `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>University Medal Standings</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [x] **Step 6: Write `src/main.jsx`** (CSS files are created in Task 3. Leave those imports commented out until then.)

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
```

- [x] **Step 7: Write `src/App.jsx`**

```jsx
import { Routes, Route } from 'react-router'
import VenuePage from './VenuePage.jsx'
import AdminPage from './admin/AdminPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<VenuePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<VenuePage />} />
    </Routes>
  )
}
```

- [x] **Step 8: Write the stub `src/VenuePage.jsx`** (replaced in Task 9)

```jsx
export default function VenuePage() {
  return <h1>Overall Medal Standings</h1>
}
```

- [x] **Step 9: Write `src/admin/AdminPage.jsx`**

```jsx
import { Link } from 'react-router'

// Placeholder: the real operator console is built in phase 6.
export default function AdminPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Operator console</h1>
      <p>CSV upload, live source and controls arrive in phase 6.</p>
      <Link to="/">Open venue view</Link>
    </main>
  )
}
```

- [x] **Step 10: Verify dev server and both builds**

Run: `npm run dev`. Open `http://localhost:5173/#/` and confirm it shows "Overall Medal Standings". Then open `/#/admin` and confirm it shows "Operator console". Stop the server.

Run: `npm run build`. Expected: `dist/index.html` plus `dist/assets/*.js`.

Run: `npm run build:offline`. Expected: `dist-offline/index.html` is the **only** file, and it contains no `src="./assets` references:
```bash
ls dist-offline && grep -c 'assets/' dist-offline/index.html
```
Expected: `index.html` and `0`.

- [x] **Step 11: Commit**

```bash
git add package.json package-lock.json vite.config.js index.html .gitignore src/main.jsx src/App.jsx src/VenuePage.jsx src/admin/AdminPage.jsx
git commit -m "chore: scaffold Vite + React with hosted and offline builds and hash routes"
```

---

### Task 2: Test harness and pure `rank.js` (TDD)

**Files:**
- Create: `tests/setup.js`, `tests/rank.test.js`, `src/lib/rank.js`

- [x] **Step 1: Write `tests/setup.js`**

```js
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(cleanup)
```

- [x] **Step 2: Write the failing tests in `tests/rank.test.js`**

```js
import { describe, it, expect } from 'vitest'
import { points, rank, WEIGHTS } from '../src/lib/rank.js'

const u = (code, gold, silver, bronze) => ({ code, gold, silver, bronze })

describe('points', () => {
  it('weights gold 3, silver 2, bronze 1', () => {
    expect(WEIGHTS).toEqual({ gold: 3, silver: 2, bronze: 1 })
    expect(points(u('A', 2, 1, 4))).toBe(12)
  })
})

describe('rank', () => {
  it('orders by points, highest first', () => {
    const out = rank([u('LOW', 0, 0, 1), u('HIGH', 1, 0, 0)])
    expect(out.map(r => r.code)).toEqual(['HIGH', 'LOW'])
  })

  it('breaks a points tie by gold', () => {
    // both 3 points
    const out = rank([u('B', 0, 1, 1), u('A', 1, 0, 0)])
    expect(out.map(r => r.code)).toEqual(['A', 'B'])
  })

  it('breaks a points+gold tie by silver', () => {
    // both 5 points, 1 gold
    const out = rank([u('B', 1, 0, 2), u('A', 1, 1, 0)])
    expect(out.map(r => r.code)).toEqual(['A', 'B'])
  })

  it('breaks a full tie alphabetically by code', () => {
    const out = rank([u('RMUTT', 1, 1, 1), u('KMITL', 1, 1, 1)])
    expect(out.map(r => r.code)).toEqual(['KMITL', 'RMUTT'])
  })

  it('assigns 1-based positions', () => {
    const out = rank([u('A', 0, 0, 1), u('B', 5, 0, 0), u('C', 1, 0, 0)])
    expect(out.map(r => [r.code, r.position])).toEqual([['B', 1], ['C', 2], ['A', 3]])
  })

  it('does not mutate the input', () => {
    const input = [u('A', 0, 0, 1), u('B', 5, 0, 0)]
    const copy = structuredClone(input)
    rank(input)
    expect(input).toEqual(copy)
  })

  it('returns [] for no rows', () => {
    expect(rank([])).toEqual([])
  })
})
```

- [x] **Step 3: Run to verify failure**

Run: `npx vitest run tests/rank.test.js`
Expected: FAIL — `Failed to resolve import "../src/lib/rank.js"`.

- [x] **Step 4: Implement `src/lib/rank.js`**

```js
// Hidden weighted points: used only for ordering, never displayed.
export const WEIGHTS = Object.freeze({ gold: 3, silver: 2, bronze: 1 })

export function points(r) {
  return r.gold * WEIGHTS.gold + r.silver * WEIGHTS.silver + r.bronze * WEIGHTS.bronze
}

// Points desc, then gold, silver, bronze desc, then code A→Z.
export function compareStandings(a, b) {
  return (
    points(b) - points(a) ||
    b.gold - a.gold ||
    b.silver - a.silver ||
    b.bronze - a.bronze ||
    String(a.code).localeCompare(String(b.code))
  )
}

export function rank(rows) {
  return rows
    .slice()
    .sort(compareStandings)
    .map((r, i) => ({ ...r, position: i + 1 }))
}
```

- [x] **Step 5: Run to verify pass**

Run: `npx vitest run tests/rank.test.js`
Expected: PASS, 8 tests.

- [x] **Step 6: Commit**

```bash
git add tests/setup.js tests/rank.test.js src/lib/rank.js
git commit -m "feat: add pure ranking with weighted points and tiebreaks"
```

---

### Task 3: Design tokens, fonts, global styles

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/animations.css`, `src/styles/tower.css` (empty for now, filled in Task 9)
- Modify: `src/main.jsx`

- [x] **Step 1: Write `src/styles/tokens.css`** (ported from prototype lines 7–47; only the CI palette is used: #FF5F1C, #FF8D20, #FFC525, #2A9FF7)

```css
:root {
  color-scheme: dark;
  --stage-1: #0a1020;
  --stage-2: #05070f;
  --panel-1: #141d33;
  --panel-2: #0d1526;
  --line: rgba(255, 255, 255, .08);
  --line-strong: rgba(255, 255, 255, .15);
  --ink: #eef3fb;
  --ink-dim: #9aa6c2;
  --ink-faint: #68738f;
  /* CI colors — the only accent colors allowed */
  --blue: #2a9ff7;
  --orange: #ff8d20;
  --orange-deep: #ff5f1c;
  --amber: #ffc525;
  --gold-1: #ffe49a; --gold-2: #ffc525; --gold-3: #dc8e12;
  --silver-1: #eef3fa; --silver-2: #c7d1dd; --silver-3: #7f8da0;
  --bronze-1: #f4b483; --bronze-2: #d07b36; --bronze-3: #8f4e1c;
  --up: #33d17a;
  --down: #ff7a2e;
  --display: 'Titillium Web', system-ui, sans-serif;
  --body: 'Titillium Web', 'Noto Sans Thai', system-ui, sans-serif;
  --chamfer: 14px;
}

* { box-sizing: border-box; }
html, body, #root { height: 100%; }

body {
  margin: 0;
  font-family: var(--body);
  color: var(--ink);
  background:
    radial-gradient(1100px 640px at 82% -10%, rgba(42, 159, 247, .16), transparent 60%),
    radial-gradient(900px 560px at 4% 110%, rgba(255, 95, 28, .13), transparent 60%),
    linear-gradient(165deg, var(--stage-1), var(--stage-2));
  background-attachment: fixed;
}

/* faint telemetry grid */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: .5;
  background: repeating-linear-gradient(0deg, rgba(255, 255, 255, .018) 0 1px, transparent 1px 46px);
}

[hidden] { display: none !important; }

/* P key: present mode (hide cursor on the venue screen) */
body.present { cursor: none; }
```

- [x] **Step 2: Write `src/styles/animations.css`** (keyframes from the prototype; the entrance keyframes are added in phase 4)

```css
@keyframes pip {
  0%   { box-shadow: 0 0 0 0 rgba(255, 197, 37, .55); }
  70%  { box-shadow: 0 0 0 7px rgba(255, 197, 37, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 197, 37, 0); }
}

@keyframes sheen {
  0%   { transform: translateX(-170%) skewX(-16deg); }
  16%  { transform: translateX(340%) skewX(-16deg); }
  100% { transform: translateX(340%) skewX(-16deg); }
}

@keyframes p1pulse {
  0%, 100% { filter: drop-shadow(0 5px 18px rgba(255, 197, 37, .24)); }
  50%      { filter: drop-shadow(0 7px 30px rgba(255, 197, 37, .5)); }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
  }
}
```

- [x] **Step 3: Create an empty `src/styles/tower.css`**

```css
/* Venue timing-tower styles — filled in Task 9 */
```

- [x] **Step 4: Add the font and CSS imports at the top of `src/main.jsx`**

```jsx
import '@fontsource/titillium-web/400.css'
import '@fontsource/titillium-web/600.css'
import '@fontsource/titillium-web/700.css'
import '@fontsource/titillium-web/900.css'
import '@fontsource/noto-sans-thai/400.css'
import '@fontsource/noto-sans-thai/600.css'
import '@fontsource/noto-sans-thai/700.css'
import './styles/tokens.css'
import './styles/animations.css'
import './styles/tower.css'
```
If a weight file is missing, run `ls node_modules/@fontsource/titillium-web` and use the names that exist.

- [x] **Step 5: Verify**

Run: `npm run dev`, then open `/#/`. Expected: a dark navy gradient background with faint horizontal grid lines, and the heading in Titillium Web. In DevTools → Network → Font, `titillium-web-latin-*.woff2` is served from localhost, not fonts.googleapis.com.

- [x] **Step 6: Commit**

```bash
git add src/styles src/main.jsx
git commit -m "feat: add CI design tokens, self-hosted fonts, base keyframes"
```

---

### Task 4: Assets, registry and sample (TDD)

**Files:**
- Create: `src/assets/logo.png`, `src/assets/logos/logo_*.png` (10 files), `src/lib/registry.js`, `src/lib/sample.js`, `tests/registry.test.js`

- [x] **Step 1: Copy assets** (leave the originals in `logos/` until the port is signed off)

```bash
mkdir -p src/assets/logos
cp logos/logo.png src/assets/logo.png
for c in KMUTT KMUTNB KMITL RMUTL RMUTT RUTS RMUTS RMUTI RMUTK RMUTP; do cp "logos/logo_$c.png" src/assets/logos/; done
ls src/assets/logos | wc -l
```
Expected: `10`

- [x] **Step 2: Write the failing tests in `tests/registry.test.js`**

```js
import { describe, it, expect } from 'vitest'
import { REGISTRY, REGISTRY_BY_CODE, withRegistry } from '../src/lib/registry.js'
import { SAMPLE } from '../src/lib/sample.js'

const CODES = ['KMUTT', 'KMUTNB', 'KMITL', 'RMUTL', 'RMUTT', 'RUTS', 'RMUTS', 'RMUTI', 'RMUTK', 'RMUTP']

describe('registry', () => {
  it('contains exactly the 10 network universities', () => {
    expect(REGISTRY.map(u => u.code).sort()).toEqual([...CODES].sort())
  })

  it('gives every university a Thai name, a logo and a hex team color', () => {
    for (const u of REGISTRY) {
      expect(u.thaiName, u.code).toMatch(/[฀-๿]/)
      expect(u.logo, u.code).toBeTruthy()
      expect(u.color, u.code).toMatch(/^#[0-9A-F]{6}$/i)
    }
  })

  it('merges registry info onto count rows', () => {
    const [row] = withRegistry([{ code: 'KMUTT', gold: 1, silver: 2, bronze: 3 }])
    expect(row).toMatchObject({
      code: 'KMUTT', gold: 1, silver: 2, bronze: 3,
      thaiName: REGISTRY_BY_CODE.KMUTT.thaiName, color: '#F57F20',
    })
  })

  it('keeps unknown codes with counts only', () => {
    const [row] = withRegistry([{ code: 'XYZ', gold: 1, silver: 0, bronze: 0 }])
    expect(row).toEqual({ code: 'XYZ', gold: 1, silver: 0, bronze: 0 })
  })
})

describe('sample', () => {
  it('has counts for every registered university and nothing else', () => {
    expect(SAMPLE.rows.map(r => r.code).sort()).toEqual([...CODES].sort())
    for (const r of SAMPLE.rows) expect(Object.keys(r).sort()).toEqual(['bronze', 'code', 'gold', 'silver'])
  })
})
```

- [x] **Step 3: Run to verify failure**

Run: `npx vitest run tests/registry.test.js`
Expected: FAIL — cannot resolve `../src/lib/registry.js`.

- [x] **Step 4: Implement `src/lib/registry.js`** (values from the prototype's `SAMPLE`, lines 357–366)

```js
import KMUTT from '../assets/logos/logo_KMUTT.png'
import KMUTNB from '../assets/logos/logo_KMUTNB.png'
import KMITL from '../assets/logos/logo_KMITL.png'
import RMUTL from '../assets/logos/logo_RMUTL.png'
import RMUTT from '../assets/logos/logo_RMUTT.png'
import RUTS from '../assets/logos/logo_RUTS.png'
import RMUTS from '../assets/logos/logo_RMUTS.png'
import RMUTI from '../assets/logos/logo_RMUTI.png'
import RMUTK from '../assets/logos/logo_RMUTK.png'
import RMUTP from '../assets/logos/logo_RMUTP.png'

// Static identity of each university. CSVs only supply medal counts.
export const REGISTRY = [
  { code: 'KMUTT',  thaiName: 'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี',        logo: KMUTT,  color: '#F57F20' },
  { code: 'KMUTNB', thaiName: 'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ',    logo: KMUTNB, color: '#B0122F' },
  { code: 'KMITL',  thaiName: 'สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง', logo: KMITL,  color: '#16407F' },
  { code: 'RMUTL',  thaiName: 'มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา',             logo: RMUTL,  color: '#7A2FB0' },
  { code: 'RMUTT',  thaiName: 'มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี',            logo: RMUTT,  color: '#1466B5' },
  { code: 'RUTS',   thaiName: 'มหาวิทยาลัยเทคโนโลยีราชมงคลศรีวิชัย',           logo: RUTS,   color: '#C6472B' },
  { code: 'RMUTS',  thaiName: 'มหาวิทยาลัยเทคโนโลยีราชมงคลสุวรรณภูมิ',         logo: RMUTS,  color: '#B8862B' },
  { code: 'RMUTI',  thaiName: 'มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน',              logo: RMUTI,  color: '#1E8E6A' },
  { code: 'RMUTK',  thaiName: 'มหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพ',            logo: RMUTK,  color: '#D4A017' },
  { code: 'RMUTP',  thaiName: 'มหาวิทยาลัยเทคโนโลยีราชมงคลพระนคร',             logo: RMUTP,  color: '#2C7BE5' },
]

export const REGISTRY_BY_CODE = Object.fromEntries(REGISTRY.map(u => [u.code, u]))

// Count rows ({ code, gold, silver, bronze }) -> display rows with name/logo/color.
export function withRegistry(countRows) {
  return countRows.map(c => ({ ...REGISTRY_BY_CODE[c.code], ...c }))
}
```

- [x] **Step 5: Implement `src/lib/sample.js`**

```js
// Demo counts (prototype V17). Identity lives in registry.js.
export const SAMPLE = {
  title: 'Overall Medal Standings',
  rows: [
    { code: 'KMUTT',  gold: 12, silver: 8, bronze: 6 },
    { code: 'RMUTL',  gold: 10, silver: 9, bronze: 7 },
    { code: 'KMUTNB', gold: 9,  silver: 7, bronze: 5 },
    { code: 'RMUTT',  gold: 8,  silver: 6, bronze: 9 },
    { code: 'KMITL',  gold: 7,  silver: 8, bronze: 4 },
    { code: 'RUTS',   gold: 6,  silver: 5, bronze: 8 },
    { code: 'RMUTS',  gold: 5,  silver: 6, bronze: 5 },
    { code: 'RMUTI',  gold: 4,  silver: 5, bronze: 6 },
    { code: 'RMUTK',  gold: 3,  silver: 4, bronze: 7 },
    { code: 'RMUTP',  gold: 2,  silver: 5, bronze: 6 },
  ],
}
```

- [x] **Step 6: Run to verify pass**

Run: `npm test`
Expected: PASS — `rank.test.js` (8) and `registry.test.js` (5).

- [x] **Step 7: Commit**

```bash
git add src/assets src/lib/registry.js src/lib/sample.js tests/registry.test.js
git commit -m "feat: add university registry, logos and sample counts"
```

---

### Task 5: MedalIcon and LogoChip

**Files:**
- Create: `src/components/MedalIcon.jsx`, `src/components/LogoChip.jsx`

- [x] **Step 1: Write `src/components/MedalIcon.jsx`** (SVG from prototype lines 282–287 and 419–423)

```jsx
const STAR =
  'M24 33 L25.76 37.57 L30.66 37.84 L26.85 40.93 L28.11 45.66 L24 43 L19.89 45.66 L21.15 40.93 L17.34 37.84 L22.24 37.57 Z'

// Gradients shared by every medal. Render once per page.
export function MedalDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <radialGradient id="grad-g" cx="38%" cy="30%" r="80%">
          <stop offset="0" stopColor="#fff0c0" /><stop offset=".5" stopColor="#ffc525" /><stop offset="1" stopColor="#c47e0d" />
        </radialGradient>
        <radialGradient id="grad-s" cx="38%" cy="30%" r="80%">
          <stop offset="0" stopColor="#ffffff" /><stop offset=".5" stopColor="#c7d1dd" /><stop offset="1" stopColor="#7d8b9d" />
        </radialGradient>
        <radialGradient id="grad-b" cx="38%" cy="30%" r="80%">
          <stop offset="0" stopColor="#f8c79c" /><stop offset=".5" stopColor="#d07b36" /><stop offset="1" stopColor="#84461a" />
        </radialGradient>
        <linearGradient id="rib" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#48abff" /><stop offset="1" stopColor="#1668c0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/** kind: 'g' | 's' | 'b' */
export default function MedalIcon({ kind }) {
  return (
    <svg className="medal" viewBox="0 0 48 58" aria-hidden="true">
      <g className="ribbon">
        <path d="M14 2 L22 2 L21 30 L12.5 27 Z" />
        <path d="M26 2 L34 2 L35.5 27 L27 30 Z" />
      </g>
      <circle cx="24" cy="40" r="15" fill={`url(#grad-${kind})`} stroke="rgba(0,0,0,.20)" strokeWidth="1" />
      <circle className="rimlt" cx="24" cy="40" r="11.6" />
      <path className="star" d={STAR} />
    </svg>
  )
}
```

- [x] **Step 2: Write `src/components/LogoChip.jsx`**

```jsx
// Full seal on a white circular chip; the image is contained, never cropped.
export default function LogoChip({ src, alt }) {
  return (
    <span className="emblem chip">
      <img src={src} alt={alt} />
    </span>
  )
}
```

- [x] **Step 3: Commit**

```bash
git add src/components/MedalIcon.jsx src/components/LogoChip.jsx
git commit -m "feat: add SVG medal icon and logo chip components"
```

---

### Task 6: Row component (TDD)

**Files:**
- Create: `tests/Row.test.jsx`, `src/components/Row.jsx`

- [x] **Step 1: Write the failing tests in `tests/Row.test.jsx`**

```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Row from '../src/components/Row.jsx'

const base = {
  code: 'KMUTT', thaiName: 'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี',
  logo: '/logo.png', color: '#F57F20', gold: 12, silver: 0, bronze: 6,
}

describe('Row', () => {
  it('shows position, English code as title and Thai name as secondary text', () => {
    render(<Row row={{ ...base, position: 3 }} />)
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('KMUTT')).toHaveClass('code')
    expect(screen.getByText(base.thaiName)).toHaveClass('name')
  })

  it('marks the leader with p1 class and ★ Leader tag', () => {
    const { container } = render(<Row row={{ ...base, position: 1 }} />)
    expect(container.firstChild).toHaveClass('row', 'p1')
    expect(screen.getByText('★ Leader')).toBeInTheDocument()
  })

  it('does not tag non-leaders', () => {
    const { container } = render(<Row row={{ ...base, position: 2 }} />)
    expect(container.firstChild).not.toHaveClass('p1')
    expect(screen.queryByText('★ Leader')).toBeNull()
  })

  it('fades zero medal counts', () => {
    render(<Row row={{ ...base, position: 2 }} />)
    expect(screen.getByLabelText('Silver 0')).toHaveClass('mc', 'zero')
    expect(screen.getByLabelText('Gold 12')).not.toHaveClass('zero')
  })

  it('never renders points', () => {
    const { container } = render(<Row row={{ ...base, position: 2 }} />)
    // 12*3 + 0*2 + 6 = 42
    expect(container.textContent).not.toMatch(/42|PTS/)
  })

  it('shows movement arrows', () => {
    const { rerender } = render(<Row row={{ ...base, position: 2 }} move={2} />)
    expect(screen.getByText('▲').parentElement).toHaveTextContent('▲2')
    rerender(<Row row={{ ...base, position: 2 }} move={-1} />)
    expect(screen.getByText('▼').parentElement).toHaveTextContent('▼1')
    rerender(<Row row={{ ...base, position: 2 }} />)
    expect(screen.getByText('–')).toHaveClass('mv', 'flat')
  })

  it('omits the logo chip when no logo is registered', () => {
    const { container } = render(<Row row={{ ...base, logo: undefined, position: 2 }} />)
    expect(container.querySelector('.chip')).toBeNull()
  })
})
```

- [x] **Step 2: Run to verify failure**

Run: `npx vitest run tests/Row.test.jsx`
Expected: FAIL — cannot resolve `../src/components/Row.jsx`.

- [x] **Step 3: Implement `src/components/Row.jsx`**

```jsx
import LogoChip from './LogoChip.jsx'
import MedalIcon from './MedalIcon.jsx'

function Movement({ delta }) {
  if (delta > 0) return <span className="mv up"><span className="ar">▲</span>{delta}</span>
  if (delta < 0) return <span className="mv down"><span className="ar">▼</span>{-delta}</span>
  return <span className="mv flat">–</span>
}

function MedalCount({ kind, label, count }) {
  return (
    <div className={count > 0 ? 'mc' : 'mc zero'} aria-label={`${label} ${count}`}>
      <MedalIcon kind={kind} />
      <span className="cnt"><span className="x">×</span>{count}</span>
    </div>
  )
}

/**
 * row:  ranked display row { position, code, thaiName?, logo?, color?, gold, silver, bronze }
 * move: places gained since the previous standings (+ up, - down, 0 none)
 */
export default function Row({ row, move = 0 }) {
  const leader = row.position === 1
  const style = { '--i': row.position - 1 }
  if (row.color) style['--uc'] = row.color

  return (
    <div className={leader ? 'row p1' : 'row'} style={style} data-code={row.code}>
      <div className="pos">
        <span className="box"><b>{row.position}</b></span>
        <Movement delta={move} />
      </div>
      <div className="who">
        {row.logo && <LogoChip src={row.logo} alt={row.code} />}
        <div className="txt">
          <span className="codeline">
            <span className="code">{row.code}</span>
            {leader && <span className="p1tag">★ Leader</span>}
          </span>
          {row.thaiName && <span className="name" lang="th">{row.thaiName}</span>}
        </div>
      </div>
      <div className="medals">
        <MedalCount kind="g" label="Gold" count={row.gold} />
        <MedalCount kind="s" label="Silver" count={row.silver} />
        <MedalCount kind="b" label="Bronze" count={row.bronze} />
      </div>
    </div>
  )
}
```

- [x] **Step 4: Run to verify pass**

Run: `npx vitest run tests/Row.test.jsx`
Expected: PASS, 7 tests.

- [x] **Step 5: Commit**

```bash
git add src/components/Row.jsx tests/Row.test.jsx
git commit -m "feat: add standings row with leader tag, movement and faded zero medals"
```

---

### Task 7: Header, LiveBadge, ColumnHead, Tower

**Files:**
- Create: `src/components/Header.jsx`, `src/components/LiveBadge.jsx`, `src/components/ColumnHead.jsx`, `src/components/Tower.jsx`

- [ ] **Step 1: Write `src/components/LiveBadge.jsx`**

```jsx
export default function LiveBadge({ live = false }) {
  return (
    <span className={live ? 'live' : 'live idle'}>
      <span className="dot" />
      {live ? 'Live' : 'Standby'}
    </span>
  )
}
```

- [ ] **Step 2: Write `src/components/Header.jsx`**

```jsx
import { useEffect, useState } from 'react'
import ttaLogo from '../assets/logo.png'
import LiveBadge from './LiveBadge.jsx'

const pad = n => String(n).padStart(2, '0')

function Clock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return <span className="clock">{pad(now.getHours())}:{pad(now.getMinutes())}:{pad(now.getSeconds())}</span>
}

export default function Header({ title, live = false }) {
  return (
    <header className="topbar">
      <div className="brand">
        <img src={ttaLogo} alt="Thailand Teaching Academy Award 2027" />
      </div>
      <div className="title-block">
        <p className="eyebrow">University Medal Standings</p>
        <h1 className="comp-title">{title}</h1>
        <p className="event-sub">
          Thailand Teaching Academy Award · 13<sup>th</sup> · 2027 · Industrial Education Faculties Network
        </p>
      </div>
      <div className="status">
        <div className="statrow">
          <LiveBadge live={live} />
          <Clock />
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Write `src/components/ColumnHead.jsx`**

```jsx
export default function ColumnHead() {
  return (
    <div className="colhead" aria-hidden="true">
      <div>Pos</div>
      <div>University</div>
      <div className="c-medals"><div>Gold</div><div>Silver</div><div>Bronze</div></div>
    </div>
  )
}
```

- [ ] **Step 4: Write `src/components/Tower.jsx`**

```jsx
import Row from './Row.jsx'

/** rows: output of rank(); moves: optional { [code]: delta } */
export default function Tower({ rows, moves = {} }) {
  return (
    <main className="board" aria-live="polite">
      {rows.map(r => <Row key={r.code} row={r} move={moves[r.code] ?? 0} />)}
    </main>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.jsx src/components/LiveBadge.jsx src/components/ColumnHead.jsx src/components/Tower.jsx
git commit -m "feat: add header with live pill and clock, column head and tower"
```

---

### Task 8: Keyboard shortcuts hook

**Files:**
- Create: `src/hooks/useKeyboardShortcuts.js`

- [ ] **Step 1: Write `src/hooks/useKeyboardShortcuts.js`**

```js
import { useEffect } from 'react'

export function toggleFullscreen() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {})
  else document.exitFullscreen?.()
}

// P = present mode (body.present), F = fullscreen. Ignored while typing in a field.
export default function useKeyboardShortcuts() {
  useEffect(() => {
    const onKey = e => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (e.target.closest?.('input, textarea, select, [contenteditable]')) return
      const k = e.key.toLowerCase()
      if (k === 'p') document.body.classList.toggle('present')
      if (k === 'f') toggleFullscreen()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('present')
    }
  }, [])
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useKeyboardShortcuts.js
git commit -m "feat: add P present and F fullscreen shortcuts"
```

---

### Task 9: Venue page and tower CSS port (TDD on routing)

**Files:**
- Create: `tests/App.test.jsx`
- Modify: `src/VenuePage.jsx` (replace stub), `src/styles/tower.css` (fill)

- [ ] **Step 1: Write the failing tests in `tests/App.test.jsx`**

```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../src/App.jsx'

const at = path => render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)

describe('routes', () => {
  it('venue view renders 10 ranked rows with KMUTT leading the sample', () => {
    const { container } = at('/')
    expect(screen.getByRole('heading', { name: 'Overall Medal Standings' })).toBeInTheDocument()
    const rows = container.querySelectorAll('.row')
    expect(rows).toHaveLength(10)
    expect(rows[0]).toHaveClass('p1')
    expect(rows[0].dataset.code).toBe('KMUTT')
    expect(rows[9].dataset.code).toBe('RMUTP')
  })

  it('venue view shows no operator controls', () => {
    at('/')
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('admin route renders the console', () => {
    at('/admin')
    expect(screen.getByRole('heading', { name: 'Operator console' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/App.test.jsx`
Expected: FAIL — the first test fails with `expected [] to have a length of 10` (the stub has no rows).

- [ ] **Step 3: Replace `src/VenuePage.jsx`**

```jsx
import Header from './components/Header.jsx'
import ColumnHead from './components/ColumnHead.jsx'
import Tower from './components/Tower.jsx'
import { MedalDefs } from './components/MedalIcon.jsx'
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts.js'
import { rank } from './lib/rank.js'
import { withRegistry } from './lib/registry.js'
import { SAMPLE } from './lib/sample.js'

// Phase 2: static sample. Phase 3/5 replace this with useLeaderboardData().
const ROWS = rank(withRegistry(SAMPLE.rows))

export default function VenuePage() {
  useKeyboardShortcuts()
  return (
    <div className="venue">
      <MedalDefs />
      <div className="stage">
        <Header title={SAMPLE.title} />
        <ColumnHead />
        <Tower rows={ROWS} />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npm test`
Expected: PASS — all 4 test files (8 + 5 + 7 + 3 = 23 tests).

- [ ] **Step 5: Fill `src/styles/tower.css`** (ported from prototype lines 48–220 and 267–278. Changes: `body` overflow/height moved to `.venue`; the `.pts` / `.gap` / `.scoring` / controls / toast / modal rules are dropped, and the controls, toast and modal rules return in phase 6.)

```css
/* ---------- Stage ---------- */
.venue { height: 100dvh; overflow: hidden; }
.stage {
  position: relative; height: 100%; display: flex; flex-direction: column;
  padding: clamp(12px, 2vh, 26px) clamp(14px, 2.2vw, 40px);
  padding-top: calc(clamp(12px, 2vh, 26px) + env(safe-area-inset-top, 0px));
  padding-bottom: calc(clamp(12px, 2vh, 26px) + env(safe-area-inset-bottom, 0px));
  gap: clamp(8px, 1.4vh, 18px); max-width: 1760px; margin-inline: auto; width: 100%;
}

/* ---------- Header ---------- */
.topbar {
  display: grid; grid-template-columns: auto 1fr auto; align-items: center;
  gap: clamp(14px, 2vw, 32px); padding-bottom: clamp(8px, 1.2vh, 15px);
  border-bottom: 1px solid var(--line); position: relative;
}
.topbar::after {
  content: ""; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px;
  background: linear-gradient(90deg, var(--orange-deep), var(--amber) 40%, var(--blue) 100%); opacity: .85;
}
.brand { display: flex; align-items: center; gap: 14px; min-width: 0; }
.brand img { height: clamp(36px, 5.6vh, 70px); width: auto; display: block; filter: drop-shadow(0 4px 14px rgba(0, 0, 0, .4)); }
.title-block { text-align: center; min-width: 0; }
.eyebrow {
  font-weight: 700; letter-spacing: .34em; text-transform: uppercase;
  font-size: clamp(9px, 1.1vh, 13px); color: var(--blue); margin: 0 0 .3em;
}
.comp-title {
  font-family: var(--display); font-weight: 900; font-style: italic;
  font-size: clamp(20px, 3.5vh, 46px); line-height: 1; margin: 0; letter-spacing: -.01em;
  text-transform: uppercase; color: #fff; text-wrap: balance;
}
.event-sub { font-weight: 600; color: var(--ink-dim); font-size: clamp(10px, 1.3vh, 15px); margin: .45em 0 0; letter-spacing: .03em; }
.status { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; white-space: nowrap; }
.statrow { display: flex; align-items: center; gap: 12px; }
.live {
  display: inline-flex; align-items: center; gap: 8px; padding: 5px 12px;
  border: 1px solid rgba(255, 141, 32, .55); background: rgba(255, 141, 32, .12);
  font-family: var(--display); font-weight: 700; letter-spacing: .2em; text-transform: uppercase;
  font-size: clamp(9px, 1.2vh, 13px); color: var(--amber);
  clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
}
.live .dot {
  width: 8px; height: 8px; border-radius: 50%; background: var(--amber);
  box-shadow: 0 0 0 0 rgba(255, 197, 37, .6); animation: pip 1.8s infinite;
}
.live.idle { border-color: var(--line-strong); background: rgba(255, 255, 255, .04); color: var(--ink-faint); }
.live.idle .dot { background: var(--ink-faint); animation: none; box-shadow: none; }
.clock {
  font-family: var(--display); font-weight: 700; font-variant-numeric: tabular-nums;
  font-size: clamp(12px, 1.6vh, 18px); color: var(--ink); letter-spacing: .04em;
}

/* ---------- Column header ---------- */
:root { --grid: clamp(74px, 8.5vw, 124px) minmax(0, 1fr) clamp(230px, 32vw, 560px); }
.colhead {
  display: grid; grid-template-columns: var(--grid); align-items: center;
  gap: clamp(8px, 1.2vw, 22px); padding: 0 clamp(14px, 1.4vw, 24px) 0 clamp(18px, 1.6vw, 30px);
  font-weight: 700; text-transform: uppercase; letter-spacing: .16em;
  font-size: clamp(8px, 1.02vh, 11.5px); color: var(--ink-faint);
}
.colhead .c-medals { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(4px, .7vw, 14px); text-align: center; }

/* ---------- Tower ---------- */
.board { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: clamp(3px, .5vh, 7px); }
.row {
  flex: 1 1 0; min-height: 0; position: relative; display: grid; grid-template-columns: var(--grid);
  align-items: center; gap: clamp(8px, 1.2vw, 22px); overflow: hidden;
  padding: 0 clamp(14px, 1.4vw, 24px) 0 clamp(18px, 1.6vw, 30px);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .055), transparent 44%),
    linear-gradient(90deg, color-mix(in srgb, var(--uc, #38507a) 30%, transparent), transparent 42%),
    linear-gradient(92deg, var(--panel-1), var(--panel-2));
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - var(--chamfer)), calc(100% - var(--chamfer)) 100%, 0 100%);
  transition: transform .6s cubic-bezier(.22, 1, .36, 1), background .4s, box-shadow .4s;
}
/* team-color bar */
.row::before {
  content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 6px; z-index: 2;
  background: linear-gradient(180deg, color-mix(in srgb, var(--uc, #38507a) 80%, #fff 20%), var(--uc, #38507a));
}
/* sweeping sheen */
.row::after {
  content: ""; position: absolute; top: 0; bottom: 0; left: 0; width: 42%; z-index: 1; pointer-events: none;
  background: linear-gradient(105deg, transparent 0%, rgba(255, 255, 255, .11) 46%, rgba(255, 255, 255, .18) 52%, transparent 100%);
  transform: translateX(-170%) skewX(-16deg); mix-blend-mode: screen;
  animation: sheen 7s ease-in-out infinite; animation-delay: calc(var(--i, 0) * .5s);
}
.row > * { position: relative; z-index: 2; }

/* ----- Leader (P1) ----- */
.row.p1 {
  flex: 1.75 1 0; z-index: 3;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .09), transparent 46%),
    linear-gradient(90deg, color-mix(in srgb, var(--amber) 30%, transparent), transparent 52%),
    linear-gradient(92deg, #22315c, #151f3e);
  box-shadow: inset 0 0 0 1.5px rgba(255, 197, 37, .55), inset 0 3px 0 0 rgba(255, 197, 37, .85);
  filter: drop-shadow(0 6px 20px rgba(255, 197, 37, .28));
}
.row.p1:not(.enter) { animation: p1pulse 3.2s ease-in-out infinite; }
.row.p1::before {
  width: 7px; box-shadow: 0 0 12px 1px color-mix(in srgb, var(--amber) 75%, transparent);
  background: linear-gradient(180deg, #fff2c8, var(--amber));
}
.row.p1 .who .code { font-size: clamp(17px, 3.2vh, 40px); color: #fff; letter-spacing: .02em; }
.row.p1 .who .name { color: #e9d9b0; }
.row.p1 .pos .box b { font-size: clamp(19px, 3.5vh, 44px); }
.row.p1 .mc .cnt { font-size: clamp(15px, 2.6vh, 34px); }
.row.p1 .emblem.chip {
  width: clamp(48px, 7.6vh, 94px); height: clamp(48px, 7.6vh, 94px);
  box-shadow: 0 0 0 2.5px #fff, 0 0 0 4.5px var(--uc, #c3ccdb), 0 6px 16px -6px rgba(0, 0, 0, .75);
}
.p1tag {
  display: inline-flex; align-items: center; gap: 5px; margin-left: 2px; padding: 2px 8px;
  font-family: var(--display); font-weight: 700; font-size: clamp(8px, 1.1vh, 12px); letter-spacing: .16em;
  text-transform: uppercase; color: #241700; background: linear-gradient(160deg, var(--gold-1), var(--gold-2));
  clip-path: polygon(6px 0, 100% 0, 100% 100%, 0 100%, 0 6px);
}

/* ---------- Position ---------- */
.pos { display: flex; align-items: center; gap: clamp(6px, .7vw, 12px); }
.pos .box {
  position: relative; display: grid; place-items: center;
  min-width: clamp(32px, 3.4vw, 54px); height: clamp(28px, 4.2vh, 50px);
  background: rgba(255, 255, 255, .05); border-left: 3px solid var(--uc, #38507a);
  transform: skewX(-13deg);
}
.pos .box b {
  transform: skewX(13deg); font-family: var(--display); font-weight: 900;
  font-variant-numeric: tabular-nums; font-size: clamp(17px, 3vh, 38px); line-height: 1; color: var(--ink);
}
.row.p1 .pos .box { background: linear-gradient(160deg, var(--gold-1), var(--gold-2) 60%, var(--gold-3)); border-left-color: #fff2c8; }
.row.p1 .pos .box b { color: #241700; }
.mv {
  display: flex; align-items: center; gap: 1px; font-family: var(--display); font-weight: 700;
  font-variant-numeric: tabular-nums; font-size: clamp(9px, 1.35vh, 15px); line-height: 1; min-width: 1.4em;
}
.mv .ar { font-size: .82em; }
.mv.up { color: var(--up); }
.mv.down { color: var(--down); }
.mv.flat { color: var(--ink-faint); opacity: .6; }

/* ---------- University ---------- */
.who { min-width: 0; display: flex; align-items: center; gap: clamp(9px, 1vw, 16px); }
.emblem.chip {
  position: relative; flex: none; width: clamp(32px, 4.8vh, 56px); height: clamp(32px, 4.8vh, 56px);
  max-height: 100%; border-radius: 50%; display: grid; place-items: center; overflow: hidden;
  background: radial-gradient(circle at 50% 36%, #fff, #e7ebf2);
  box-shadow: 0 0 0 2px #fff, 0 0 0 3.5px var(--uc, #c3ccdb), 0 5px 13px -6px rgba(0, 0, 0, .7);
}
.emblem.chip img { width: auto; height: auto; max-width: 72%; max-height: 80%; object-fit: contain; }
.who .txt { min-width: 0; display: flex; flex-direction: column; gap: 0; }
.who .codeline { display: flex; align-items: center; gap: clamp(6px, .7vw, 12px); min-width: 0; }
.who .code {
  font-family: var(--display); font-weight: 900; font-size: clamp(15px, 2.7vh, 32px);
  line-height: 1.02; letter-spacing: .01em; text-transform: uppercase; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
}
.who .name {
  font-family: var(--body); font-weight: 600; color: var(--ink-dim);
  font-size: clamp(9px, 1.25vh, 14px); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* ---------- Medals ---------- */
.medals { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(6px, 1vw, 22px); align-items: center; }
.mc { display: flex; align-items: center; justify-content: center; gap: clamp(4px, .6vw, 12px); }
.mc .medal { height: clamp(32px, 5.4vh, 64px); width: auto; flex: none; filter: drop-shadow(0 3px 6px rgba(0, 0, 0, .5)); }
.mc .cnt {
  font-family: var(--display); font-weight: 900; font-variant-numeric: tabular-nums;
  font-size: clamp(16px, 2.9vh, 38px); line-height: 1; color: var(--ink);
}
.mc .cnt .x { font-size: .56em; color: var(--ink-faint); font-weight: 700; margin-right: .03em; }
.mc.zero { opacity: .36; }
.mc.zero .cnt { color: var(--ink-faint); }
.medal .ribbon path { fill: url(#rib); }
.medal .rimlt { fill: none; stroke: rgba(255, 255, 255, .55); stroke-width: 1; }
.medal .star { fill: rgba(0, 0, 0, .32); }

/* ---------- Phone / narrow ---------- */
@media (max-width: 860px) {
  .venue { height: auto; min-height: 100dvh; overflow: visible; }
  .stage { height: auto; min-height: 100%; }
  .topbar { grid-template-columns: 1fr; justify-items: center; text-align: center; gap: 12px; }
  .status { align-items: center; }
  .colhead { display: none; }
  :root { --grid: 60px minmax(0, 1fr); }
  .board { gap: 6px; }
  .row { grid-template-columns: 60px minmax(0, 1fr); grid-auto-rows: auto; padding: 11px 12px 11px 16px; gap: 9px 12px; }
  .medals { grid-column: 1 / -1; order: 5; justify-self: start; grid-template-columns: repeat(3, auto); gap: 20px; }
  .who .name { white-space: normal; }
}
```

- [ ] **Step 6: Visual check in dev**

Run: `npm run dev`, then open `/#/` at 1920×1080. Expected: 10 chamfered rows, with KMUTT as a taller gold-glow leader row showing "★ Leader". Each row has a team-color bar on the left, logos on white circles, and three medal icons with ×counts. A sheen sweeps across the rows in turn, and the LIVE pill shows grey "Standby". Press `F` to toggle fullscreen and `P` to hide the cursor.

- [ ] **Step 7: Commit**

```bash
git add src/VenuePage.jsx src/styles/tower.css tests/App.test.jsx
git commit -m "feat: port static venue timing tower from prototype V17"
```

---

### Task 10: Side-by-side comparison with the prototype

**Files:**
- Create (gitignored): `.compare/leaderboard.html`, `.compare/logo*.png`

- [ ] **Step 1: Make the prototype render with logos**

```bash
mkdir -p .compare && cp reference/leaderboard.html .compare/ && cp logos/*.png .compare/
```

- [ ] **Step 2: Serve both**

Terminal A: `npm run dev` (port 5173). Terminal B: `npx vite .compare --port 5174`.

- [ ] **Step 3: Compare at three viewports**

Use Chrome DevTools device mode (or the Playwright MCP `browser_resize` and `browser_take_screenshot` tools) to open `http://localhost:5174/leaderboard.html` and `http://localhost:5173/#/` at **1920×1080**, **3840×2160** and **390×844**. Save screenshots as `.compare/{proto,react}-{1080p,4k,phone}.png`.

Acceptance checklist (every item must match the prototype):
- [ ] Header: logo left, eyebrow/title/sub centered, LIVE pill + clock right, gradient rule under header.
- [ ] Expected difference: the prototype has the "PTS · Gold ×3…" legend and the React app does not (open question 1).
- [ ] Expected difference: the prototype has a controls footer and the venue view does not. The controls belong on the admin route.
- [ ] Row heights fill the screen, and the leader row is about 1.75× taller.
- [ ] Skewed position blocks, team-color bars, chamfered bottom-right corners.
- [ ] Logos fully visible inside white chips, with nothing clipped.
- [ ] Thai names render in Noto Sans Thai, not as tofu boxes or a fallback serif font.
- [ ] Phone: header stacks, column head hidden, medals wrap under the name.
- [ ] Turn on DevTools → Rendering → "Emulate prefers-reduced-motion: reduce" and confirm the sheen and pulse stop.

If anything differs, fix `tower.css` and repeat. Commit fixes as `fix: match prototype <detail>`.

---

### Task 11: Offline bundle smoke test

- [ ] **Step 1: Build**

Run: `npm run build:offline`

- [ ] **Step 2: Open from disk**

In Windows Explorer, double-click `dist-offline/index.html`. The URL is `file:///…/index.html#/`. Expected: the same view as the dev server, with logos and fonts present. Change the hash to `#/admin` and confirm the console placeholder appears.

- [ ] **Step 3: Confirm zero network**

With DevTools → Network → "Offline" checked, reload. Expected: the page renders fully, and the Network tab shows no failed requests.

- [ ] **Step 4: Check size**

```bash
ls -la dist-offline/index.html
```
Expected: about 3–6 MB, mostly inlined logos and fonts. If it is over 15 MB, check that only the needed `@fontsource` weights are imported.

- [ ] **Step 5: Hosted build check**

Run: `npm run build && npx vite preview`, then open the printed URL at `#/` and `#/admin`. Expected: both routes render.

---

### Task 12: Checkpoint — stop and confirm with the user

- [ ] **Step 1: Run full verification**

```bash
npm test && npm run build && npm run build:offline
```
Expected: 23 tests pass and both builds succeed.

- [ ] **Step 2: Report to the user** with the 1080p, 4K and phone screenshots, the answers needed for the open questions, and the request from CLAUDE.md for **one sample row of the real customer CSV** before phase 3. Do not start phase 3 until the user confirms.

---

## Roadmap: phases 3–8 (one plan per phase after the checkpoint)

These are outlines, not executable tasks. Each phase gets its own detailed plan once the earlier phase is confirmed.

**Phase 3 — Data pipeline.** `lib/csv.js` uses PapaParse and returns `{ title, rows, errors }`, where `rows` is `[{ code, gold, silver, bronze }]`. It matches the code through the registry using the code, an alias, or the Thai name, and handles an optional title line, BOM, Thai text, thousands separators, blank lines, and unknown universities (reported as errors, not dropped silently). `tests/csv.test.js` covers a messy fixture. `hooks/usePrevRanks` computes `{ [code]: delta }` for `Tower`'s `moves` prop. Count-up animation for medal numbers. A Zustand store (`store/leaderboard.js`) holds `{ data, lastGood, live, source, introKey }`. **Blocked on:** the real customer CSV sample row.

**Phase 4 — Animations.** Entrance: `.row.enter` staggered `rowinBig`, the leader `rowinBigP1` slam, and an `IntroFlare` overlay (flare + flash), all driven by `introKey` so the admin can replay them. Reorder uses Framer Motion `layout` on `Row`, or a `useFlip` hook, with the `.moved` flash. All of it respects `prefers-reduced-motion`.

**Phase 5 — Sources.** File upload, and URL polling (`useLivePolling`, 10 s, `cache: 'no-store'`, exponential backoff on error). The last good data is saved in `localStorage` and restored on boot, so a network drop keeps the last standings on screen and switches the LIVE pill to a "Stale" state instead of blanking. A note for the offline bundle: fetching a Google Sheet CSV from `file://` works for "Publish to web" CSV links (CORS is allowed), but this must be verified on the venue PC.

**Phase 6 — Admin and sync.** `AdminPage`, `CsvUpload`, `SourcePanel`, `FormatModal`, `Controls` (LIVE toggle, replay intro, present/fullscreen, open venue view) and `Toast`, plus a data preview table with validation errors. Same-machine sync uses a `BroadcastChannel('tta-leaderboard')` carrying `{ type: 'data' | 'intro' | 'live', payload }`. For separate devices, both the admin and the venue poll the same CSV/Sheet URL. Build a realtime backend only if the customer asks for one.

**Phase 7 — Packaging.** The hosted `dist/` deploys anywhere because of hash routing. The offline bundle is a zip of `dist-offline/index.html`, a `README.txt` in Thai and English (open in Chrome, press F11 or F, admin opens at `#/admin` in a second window), and `sample.csv`. An npm script `package:offline` creates the zip.

**Phase 8 — QA.** Test at 1080p and 4K. At 4K, revisit the prototype's `max-width: 1760px` cap on `.stage`, which may need to scale up. Test with a messy CSV (extra columns, Thai headers, missing values, duplicate rows) and run long-running soak tests for memory leaks from polling and animations.
