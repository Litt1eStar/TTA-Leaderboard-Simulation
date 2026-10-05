# TTA Leaderboard — Performance Optimization Plan

> **For any AI agent or developer executing this plan:** read "How to execute this plan" and "Git workflow" below before Task 0. The plan is self-contained: every step has the exact files, code, commands and expected output. You do not need any tool-specific skills or plugins.

**Goal:** Make the venue view cheap to run all day on a modest venue PC driving a 4K screen, and shrink the offline bundle, without changing the approved look.

**Architecture:** Three independent fixes plus guard rails:
1. **Assets:** resize and convert logos to WebP, and ship only the 7 woff2 font files actually used.
2. **Always-running animations:** keyframes may animate only `transform` and `opacity`, which the GPU compositor handles without repainting.
3. **Entrance:** remove the `filter: blur()` from the row entrance.
4. **Guard rails:** a size-budget script, a 4K render-cost trace script, and a Vitest rule that blocks expensive keyframes from coming back.

**Tech Stack:** existing Vite + React + Vitest. New dev dependencies: `sharp` (one-off image conversion) and `playwright-core` (drives the locally installed Chrome; no browser download).

**Scope:** only the optimizations listed here. Don't touch phase 3+ features. Task 9 is a hard stop for user review.

---

## Why: measured baseline (2026-10-05, `dev` @ `5374fb0`)

| What | Measured | Problem |
|---|---|---|
| Offline bundle `dist-offline/index.html` | **2,715 KB** | 1,987 KB is base64 PNG logos and 448 KB is fonts |
| Logos | 340 px PNGs, 97–220 KB each, 1,490 KB total | Shown at ≤ 110 CSS px. Resizing to 256 px and converting to WebP q90 gives **379 KB (−75%)** (trial-converted) |
| Fonts | 34 files shipped, 17 of them legacy `.woff` | Only 7 woff2 files are needed (about 74 KB) |
| Leader pulse (`p1pulse`, animates `filter: drop-shadow`) | **826 Layerize passes, 345 ms main thread per 5 s** at 4K. Without it: 77 passes, ~0 ms | The row's `clip-path` cuts the shadow off: turning the filter fully on vs off changes **1.4% of pixels**. Expensive and barely visible |
| Entrance (`rowinBig`, animates `filter: blur`) | 4K, 2.5 s: **104 frames, 700 ms raster**. Without blur: **227 frames, 25 ms raster** | The intro stutters. On a weaker venue PC it will be worse |
| Intro flare (animates `left`) | One-shot full-screen layout every frame | Use `transform` instead |
| LIVE dot (`pip`, animates `box-shadow`) | Repaints every frame while LIVE | Use `transform` + `opacity` instead |
| Hosted JS | 269 KB (85 KB gzip) | Fine, so deferred (see the end of this plan) |
| `/favicon.ico` | 404 on every load | Console noise |

The baseline was measured in headless Chromium on the dev PC. Absolute numbers differ on the venue PC, but the ratios are what matter. Task 1 re-measures the baseline with the project's own script, so before/after comparisons use the same tool.

---

## How to execute this plan

1. **Read first:** `CLAUDE.md` (the design rules are binding: the look must not change except where this plan says so) and `AGENTS.md`.
2. **Find where to resume:** do the first task whose checkboxes are not all ticked. Check with `git log --oneline`.
3. **Work in order:** do tasks in order and steps in order within each task. Don't skip "verify it fails" steps.
4. **Copy code as written:** don't rename files, functions, classes or keyframes. Tests depend on the names.
5. **When an expected output doesn't match:** stop and find the cause. Don't loosen a budget or test to make it pass; if you must, record why under "Handoff notes".
6. **Tick as you go:** change `- [ ]` to `- [x]` for each finished step, and add this plan file (`docs/superpowers/plans/2026-10-05-performance-optimization.md`) to that task's `git add` line.
7. **Shell:** commands are POSIX shell. On Windows, run them in **Git Bash**. The path contains spaces, so quote it.
8. **Scope:** don't add libraries or refactors that aren't listed here.

## Git workflow

- **All work happens on the `dev` branch.** Never commit to `main`, never create other branches, and never merge.
- Before starting, run `git branch --show-current`. If the output is not `dev`, run `git checkout dev`.
- **Don't push** unless the user explicitly asks.
- **Make one commit per task**, using the message given. Use Conventional Commit prefixes.
- **Stage explicit paths only.** Never use `git add -A` or `git add .`. `TTA-Score-Columns.html` is deleted in the working tree and must stay unstaged.
- **Run `npm test` before every commit.** It must pass.
- **Never use** `--no-verify`, `--force`, `git reset --hard` or `git rebase`.
- If your tool asks you to append attribution lines (for example `Co-Authored-By:`), follow it.

## Handoff notes

Agents append dated one-line notes here about deviations, surprises and decisions.

- 2026-10-05: Plan written from the measurements in the "Why" table. Nothing has been executed yet.
- 2026-10-05 baseline (Google Chrome headless, dev PC): steady {fps 136, slowFrames 1, layerizeMs 314, paintMs 1, rasterMs 1}; entrance {fps 70, slowFrames 39, layerizeMs 70, paintMs 18, rasterMs 199}. Size: offline 2717 KB, JS gzip 82 KB, images 1491 KB, 34 font files.
- 2026-10-05 Task 2: WebP q90 for all 11 logos, no artifacts at 4K (side-by-side crop checked); images 1491 -> 380 KB, offline 2717 -> 1235 KB.
- 2026-10-05 Task 3: verified in offline build via Chrome: titles Titillium Web, Thai names Noto Sans Thai 600/700 (700 file reports family 'Noto Sans Thai' without 'Bold', which is expected). All 4 size budgets PASS, offline 880 KB.
- 2026-10-05 Task 5: steady layerizeMs 314 -> 2 (-99%), slowFrames 1 -> 0. Glow alpha .38 kept (soft gold inner edge, checked in 4K crop).
- 2026-10-05 Task 6: entrance rasterMs 199 -> 9-11 (-95%), slowFrames 39 -> 5-7, fps 70 -> ~100. fps/slowFrames vary a lot run to run on a busy dev PC (one run fell to 64 fps steady with only 2 ms of render work); trust layerizeMs/rasterMs for comparisons. Entrance frames checked: flare sweep, stagger, leader slam all intact.
- 2026-10-05 Task 7: LIVE ripple frames checked at 0/400/900/1300 ms (ring scales out and fades). Allowlist now only 'flash'.

---

## File map

```
scripts/
  check-size.mjs          NEW   size budgets for both builds (npm run size)
  perf-trace.mjs          NEW   4K render-cost trace in headless Chrome (npm run perf)
  optimize-images.mjs     NEW   logos/*.png -> src/assets/**/*.webp (npm run images)
src/
  assets/logo.webp, assets/logos/logo_<CODE>.webp   NEW (replace the .png files)
  assets/fonts/*.woff2 + OFL-*.txt                   NEW (7 vendored font files + licenses)
  styles/fonts.css        NEW   @font-face for the 7 files
  styles/animations.css   MOD   p1glow, rowinBig(P1) without blur, flare via transform, pip via transform
  styles/tower.css        MOD   leader glow element, LIVE dot ring
  components/Row.jsx      MOD   <span class="p1glow"> on the leader
  components/Header.jsx   MOD   logo.webp import
  lib/registry.js         MOD   .webp imports
  main.jsx                MOD   fonts.css instead of @fontsource imports
index.html                MOD   empty favicon
package.json              MOD   scripts; +sharp +playwright-core; -@fontsource/*
tests/
  animation-perf.test.js  NEW   keyframes may animate only transform/opacity
  Row.test.jsx            MOD   leader glow element
```

---

### Task 0: Preflight

- [x] **Step 1: Confirm branch and a green baseline**

```bash
git checkout dev && git branch --show-current && npm test
```
Expected: `dev`, then `Test Files 5 passed`, `Tests 27 passed`.

---

### Task 1: Measurement scripts and recorded baseline

**Files:**
- Create: `scripts/check-size.mjs`, `scripts/perf-trace.mjs`
- Modify: `package.json` (scripts, devDependency)

- [x] **Step 1: Install the trace driver** (it uses your installed Google Chrome and downloads no browser)

```bash
npm install -D playwright-core
```

- [x] **Step 2: Write `scripts/check-size.mjs`**

```js
// Size budgets for both builds. Run after `npm run build && npm run build:offline`.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { join } from 'node:path'

const KB = 1024
const BUDGETS = {
  offlineHtml: 1000 * KB, // dist-offline/index.html with everything inlined
  hostedJsGzip: 90 * KB,  // all dist/assets/*.js, gzipped
  hostedImages: 450 * KB, // all images in dist/assets, raw bytes
  fontFiles: 8,           // number of font files shipped
}

const dir = 'dist/assets'
const assets = readdirSync(dir).map(f => ({ f, size: statSync(join(dir, f)).size }))
const total = list => list.reduce((t, a) => t + a.size, 0)

const actual = {
  offlineHtml: statSync('dist-offline/index.html').size,
  hostedJsGzip: assets
    .filter(a => a.f.endsWith('.js'))
    .reduce((t, a) => t + gzipSync(readFileSync(join(dir, a.f))).length, 0),
  hostedImages: total(assets.filter(a => /\.(png|jpe?g|webp|avif|svg)$/.test(a.f))),
  fontFiles: assets.filter(a => /\.(woff2?|ttf|otf)$/.test(a.f)).length,
}

let failed = false
for (const [key, limit] of Object.entries(BUDGETS)) {
  const value = actual[key]
  const ok = value <= limit
  if (!ok) failed = true
  const fmt = n => (key === 'fontFiles' ? String(n) : `${Math.round(n / KB)} KB`)
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${key.padEnd(13)} ${fmt(value).padStart(8)}  (budget ${fmt(limit)})`)
}
process.exit(failed ? 1 : 0)
```

- [x] **Step 3: Write `scripts/perf-trace.mjs`**

```js
// Render-cost trace of the venue view at 4K in headless Chrome.
// Usage: npm run build && npm run perf -- <label>
// Prints steady-state and entrance costs; saves a screenshot to .compare/perf-<label>.png.
// Set PERF_CHANNEL=chromium to use a Playwright-installed Chromium instead of Google Chrome.
import { mkdirSync } from 'node:fs'
import { preview } from 'vite'
import { chromium } from 'playwright-core'

const label = process.argv[2] ?? 'latest'
const server = await preview({ preview: { port: 4173, strictPort: true }, logLevel: 'silent' })
const url = server.resolvedUrls.local[0] + '#/'
const browser = await chromium.launch({ channel: process.env.PERF_CHANNEL ?? 'chrome' })
const page = await browser.newPage({ viewport: { width: 3840, height: 2160 } })
const cdp = await page.context().newCDPSession(page)

async function trace(ms, kickoff = async () => {}) {
  const events = []
  const onData = e => events.push(...e.value)
  cdp.on('Tracing.dataCollected', onData)
  const done = new Promise(resolve => cdp.once('Tracing.tracingComplete', resolve))
  await cdp.send('Tracing.start', {
    categories: 'devtools.timeline,disabled-by-default-devtools.timeline',
    transferMode: 'ReportEvents',
  })
  await kickoff()
  const frames = await page.evaluate(ms => new Promise(resolve => {
    const ts = []
    const t0 = performance.now()
    const tick = t => {
      ts.push(t)
      if (t - t0 < ms) return requestAnimationFrame(tick)
      const gaps = ts.slice(1).map((x, i) => x - ts[i])
      resolve({ fps: Math.round(ts.length / (ms / 1000)), slowFrames: gaps.filter(g => g > 20).length })
    }
    requestAnimationFrame(tick)
  }), ms)
  await cdp.send('Tracing.end')
  await done
  cdp.off('Tracing.dataCollected', onData)
  const totalMs = name => Math.round(
    events.filter(e => e.name === name && e.ph === 'X').reduce((t, e) => t + (e.dur ?? 0), 0) / 1000,
  )
  return { ...frames, layerizeMs: totalMs('Layerize'), paintMs: totalMs('Paint'), rasterMs: totalMs('RasterTask') }
}

await page.goto(url)
await page.waitForTimeout(3500) // let the first entrance finish
const steady = await trace(5000)
mkdirSync('.compare', { recursive: true })
await page.screenshot({ path: `.compare/perf-${label}.png` })
const entrance = await trace(2500, () =>
  page.evaluate(() => window.dispatchEvent(new CustomEvent('tta:replay-intro'))),
)

console.log(`\nVenue view @ 3840x2160 — ${label}`)
console.table({ 'steady (5 s)': steady, 'entrance (2.5 s)': entrance })
await browser.close()
server.httpServer.close()
process.exit(0)
```

- [x] **Step 4: Add the scripts to `package.json`** (inside `"scripts"`, after `"test:watch"`)

```json
    "size": "node scripts/check-size.mjs",
    "perf": "node scripts/perf-trace.mjs",
    "images": "node scripts/optimize-images.mjs"
```
(`images` is used in Task 2.)

- [x] **Step 5: Run the size check. It must fail.**

```bash
npm run build && npm run build:offline && npm run size
```
Expected (sizes may vary by a few KB), exiting with code 1:
```
FAIL  offlineHtml     2717 KB  (budget 1000 KB)
PASS  hostedJsGzip      83 KB  (budget 90 KB)
FAIL  hostedImages    1491 KB  (budget 450 KB)
FAIL  fontFiles           34  (budget 8)
```

- [x] **Step 6: Record the render-cost baseline**

```bash
npm run perf -- before
```
Expected: a table with `steady (5 s)` and `entrance (2.5 s)` rows. The steady `layerizeMs` should be in the hundreds and the entrance `rasterMs` should be several hundred (see the "Why" table). If Chrome isn't found, run `npx playwright-core install chromium` and use `PERF_CHANNEL=chromium npm run perf -- before`.

**Append both rows to "Handoff notes"** as `2026-MM-DD baseline: steady {…} entrance {…}`. Later tasks are compared against them. `.compare/perf-before.png` is now saved (gitignored).

- [x] **Step 7: Commit**

```bash
git add scripts/check-size.mjs scripts/perf-trace.mjs package.json package-lock.json docs/superpowers/plans/2026-10-05-performance-optimization.md
git commit -m "chore: add size budget and 4K render-cost trace scripts"
```

---

### Task 2: Logos to resized WebP, favicon 404

**Files:**
- Create: `scripts/optimize-images.mjs`, `src/assets/logo.webp`, `src/assets/logos/logo_<CODE>.webp` (10 files)
- Delete: `src/assets/logo.png`, `src/assets/logos/*.png`
- Modify: `src/lib/registry.js:1-10`, `src/components/Header.jsx:2`, `index.html`, `package.json`

The originals in the top-level `logos/` folder remain the source of truth. Don't edit or delete them.

- [x] **Step 1: Install sharp**

```bash
npm install -D sharp
```

- [x] **Step 2: Write `scripts/optimize-images.mjs`**

```js
// Shrink the source logos (logos/*.png) into web-ready WebP under src/assets.
// Re-run only when a source logo changes: `npm run images`.
import { mkdirSync } from 'node:fs'
import sharp from 'sharp'

const CODES = ['KMUTT', 'KMUTNB', 'KMITL', 'RMUTL', 'RMUTT', 'RUTS', 'RMUTS', 'RMUTI', 'RMUTK', 'RMUTP']

// Logo chips render at most 110 CSS px (leader row); 256 px covers a 2x display.
// The header logo renders at most 70 CSS px tall; 160 px covers a 2x display.
const jobs = [
  { from: 'logos/logo.png', to: 'src/assets/logo.webp', height: 160 },
  ...CODES.map(c => ({ from: `logos/logo_${c}.png`, to: `src/assets/logos/logo_${c}.webp`, height: 256 })),
]

mkdirSync('src/assets/logos', { recursive: true })
for (const job of jobs) {
  const info = await sharp(job.from)
    .resize({ height: job.height, withoutEnlargement: true })
    .webp({ quality: 90, alphaQuality: 100, effort: 6 })
    .toFile(job.to)
  console.log(`${job.to}  ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`)
}
```

- [x] **Step 3: Generate the WebP files**

```bash
npm run images
```
Expected: 11 lines. The KMITL/KMUTNB/KMUTT seals are about 60–70 KB at 256x256, the Rajamangala seals about 20–27 KB, and `logo.webp` about 27 KB. The total is roughly 380 KB.

- [x] **Step 4: Point the imports at the WebP files**

In `src/lib/registry.js`, change the extension of all ten imports from `.png` to `.webp`, for example:
```js
import KMUTT from '../assets/logos/logo_KMUTT.webp'
```
In `src/components/Header.jsx`, change line 2 to:
```js
import ttaLogo from '../assets/logo.webp'
```

- [x] **Step 5: Remove the old PNG copies from `src/assets`**

```bash
git rm src/assets/logo.png src/assets/logos/*.png
```

- [x] **Step 6: Stop the favicon 404.** In `index.html`, add this line inside `<head>` after the viewport meta:

```html
    <link rel="icon" href="data:," />
```

- [x] **Step 7: Run tests and the size check**

```bash
npm test && npm run build && npm run build:offline && npm run size
```
Expected: all tests pass. `hostedImages` is now **PASS** at about 380 KB. `offlineHtml` drops to about 1,230 KB (still FAIL until Task 3), and `fontFiles` still fails.

- [x] **Step 8: Visual check at 4K**

```bash
npm run perf -- after-images
```
Open `.compare/perf-before.png` and `.compare/perf-after-images.png` side by side at 100% zoom. Expected: every seal is sharp, with no blockiness, colour banding or dark halo around the transparent edges, and the leader chip (KMUTT) is crisp. If one seal shows artifacts, set `quality: 95` for that job only, re-run `npm run images`, and note it in the Handoff notes.

- [x] **Step 9: Commit**

```bash
git add scripts/optimize-images.mjs src/assets/logo.webp src/assets/logos src/lib/registry.js src/components/Header.jsx index.html package.json package-lock.json docs/superpowers/plans/2026-10-05-performance-optimization.md
git commit -m "perf: serve logos as 256px WebP (-75% image bytes) and silence favicon 404"
```

---

### Task 3: Ship only the 7 font files in use

Used weights: Titillium Web 400/600/700/900 (latin). Noto Sans Thai is only used for Thai names at 600/700; 400 is kept for the phase 6 admin table. The `latin-ext` subsets and all legacy `.woff` files are dropped. Every browser in use supports woff2.

**Files:**
- Create: `src/assets/fonts/` (7 `.woff2` files + 2 license files), `src/styles/fonts.css`
- Modify: `src/main.jsx:1-7`, `package.json` (remove `@fontsource/*`)

- [x] **Step 1: Vendor the files** (before uninstalling the packages)

```bash
mkdir -p src/assets/fonts
for w in 400 600 700 900; do cp node_modules/@fontsource/titillium-web/files/titillium-web-latin-$w-normal.woff2 src/assets/fonts/; done
for w in 400 600 700; do cp node_modules/@fontsource/noto-sans-thai/files/noto-sans-thai-thai-$w-normal.woff2 src/assets/fonts/; done
cp node_modules/@fontsource/titillium-web/LICENSE src/assets/fonts/OFL-TitilliumWeb.txt
cp node_modules/@fontsource/noto-sans-thai/LICENSE src/assets/fonts/OFL-NotoSansThai.txt
ls src/assets/fonts | wc -l
```
Expected: `9`

- [x] **Step 2: Write `src/styles/fonts.css`**

```css
/* Self-hosted fonts: woff2 only, and only the weights and scripts the UI uses.
   Titillium Web = latin UI text; Noto Sans Thai = Thai university names. Licenses: OFL-*.txt */
@font-face {
  font-family: 'Titillium Web'; font-style: normal; font-weight: 400; font-display: swap;
  src: url(../assets/fonts/titillium-web-latin-400-normal.woff2) format('woff2');
}
@font-face {
  font-family: 'Titillium Web'; font-style: normal; font-weight: 600; font-display: swap;
  src: url(../assets/fonts/titillium-web-latin-600-normal.woff2) format('woff2');
}
@font-face {
  font-family: 'Titillium Web'; font-style: normal; font-weight: 700; font-display: swap;
  src: url(../assets/fonts/titillium-web-latin-700-normal.woff2) format('woff2');
}
@font-face {
  font-family: 'Titillium Web'; font-style: normal; font-weight: 900; font-display: swap;
  src: url(../assets/fonts/titillium-web-latin-900-normal.woff2) format('woff2');
}
@font-face {
  font-family: 'Noto Sans Thai'; font-style: normal; font-weight: 400; font-display: swap;
  src: url(../assets/fonts/noto-sans-thai-thai-400-normal.woff2) format('woff2');
  unicode-range: U+02D7, U+0303, U+0331, U+0E01-0E5B, U+200C-200D, U+25CC;
}
@font-face {
  font-family: 'Noto Sans Thai'; font-style: normal; font-weight: 600; font-display: swap;
  src: url(../assets/fonts/noto-sans-thai-thai-600-normal.woff2) format('woff2');
  unicode-range: U+02D7, U+0303, U+0331, U+0E01-0E5B, U+200C-200D, U+25CC;
}
@font-face {
  font-family: 'Noto Sans Thai'; font-style: normal; font-weight: 700; font-display: swap;
  src: url(../assets/fonts/noto-sans-thai-thai-700-normal.woff2) format('woff2');
  unicode-range: U+02D7, U+0303, U+0331, U+0E01-0E5B, U+200C-200D, U+25CC;
}
```

- [x] **Step 3: Replace the font imports in `src/main.jsx`.** Delete the seven `@fontsource/...` import lines (lines 1–7) and put this line first:

```jsx
import './styles/fonts.css'
```

- [x] **Step 4: Uninstall the font packages**

```bash
npm uninstall @fontsource/titillium-web @fontsource/noto-sans-thai
grep -rn "@fontsource" src index.html || echo "no references left"
```
Expected: `no references left`

- [x] **Step 5: Tests and size check, which should now pass completely**

```bash
npm test && npm run build && npm run build:offline && npm run size
```
Expected: all four lines **PASS**. `offlineHtml` is about 900 KB (down from 2,717 KB), and `fontFiles` is `7`.

- [x] **Step 6: Visual check of fonts**

Run `npm run dev` and open `/#/`. In DevTools, select a Thai name (`.who .name`), then go to Computed → scroll to the bottom → **Rendered Fonts**. Expected: `Noto Sans Thai`. Select the title and expect `Titillium Web`. Also open `dist-offline/index.html` from Explorer and confirm the fonts look identical with DevTools → Network → "Offline".

- [x] **Step 7: Commit**

```bash
git add src/assets/fonts src/styles/fonts.css src/main.jsx package.json package-lock.json docs/superpowers/plans/2026-10-05-performance-optimization.md
git commit -m "perf: self-host only the 7 woff2 font files in use (-34 to 7 files)"
```

---

### Task 4: Guard rail — keyframes may animate only transform and opacity

The test uses a ratchet: the known offenders start on an allowlist, and Tasks 5–7 each remove their entry. A stale entry, meaning one that no longer violates, also fails the test, so the list can only shrink.

**Files:**
- Create: `tests/animation-perf.test.js`

- [x] **Step 1: Write the test with an empty allowlist**

```js
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

// Only transform and opacity animate on the GPU compositor. Anything else repaints or
// re-layerizes every frame, which a venue PC driving a 4K screen can't afford.
const CHEAP = new Set(['transform', 'opacity'])

// Known offenders. Each optimization task removes its entry. Don't add entries
// without a written reason next to them.
const ALLOWED = {}

function keyframes() {
  const dir = 'src/styles'
  const css = readdirSync(dir)
    .filter(f => f.endsWith('.css'))
    .map(f => readFileSync(join(dir, f), 'utf8'))
    .join('\n')
  const found = {}
  // Blocks are formatted with the closing brace at column 0.
  for (const m of css.matchAll(/@keyframes\s+([\w-]+)\s*\{([\s\S]*?)\n\}/g)) {
    found[m[1]] = [...new Set([...m[2].matchAll(/([a-z-]+)\s*:/g)].map(p => p[1]))]
  }
  return found
}

describe('animation performance rules', () => {
  const kf = keyframes()

  it('parses the stylesheet keyframes', () => {
    expect(Object.keys(kf)).toEqual(expect.arrayContaining(['sheen', 'rowinBig', 'flare']))
  })

  it('keyframes animate only transform and opacity', () => {
    const bad = Object.entries(kf).flatMap(([name, props]) =>
      props.filter(p => !CHEAP.has(p) && !(ALLOWED[name] ?? []).includes(p)).map(p => `${name}: ${p}`),
    )
    expect(bad).toEqual([])
  })

  it('has no stale allowlist entries', () => {
    const stale = Object.entries(ALLOWED).flatMap(([name, props]) =>
      props.filter(p => !(kf[name] ?? []).includes(p)).map(p => `${name}: ${p}`),
    )
    expect(stale).toEqual([])
  })
})
```

- [x] **Step 2: Run it to see the offenders**

Run: `npx vitest run tests/animation-perf.test.js`
Expected: FAIL in "keyframes animate only transform and opacity" with exactly:
```
pip: box-shadow, p1pulse: filter, rowinBig: filter, rowinBigP1: filter, flare: left, flash: box-shadow
```
If the list differs, someone has changed the CSS since this plan was written. Record the difference in the Handoff notes and allowlist what you actually see.

- [x] **Step 3: Allowlist the current offenders.** Replace `const ALLOWED = {}` with:

```js
const ALLOWED = {
  pip: ['box-shadow'],     // LIVE dot: Task 7
  p1pulse: ['filter'],     // leader pulse: Task 5
  rowinBig: ['filter'],    // entrance blur: Task 6
  rowinBigP1: ['filter'],  // leader entrance blur: Task 6
  flare: ['left'],         // intro flare: Task 6
  flash: ['box-shadow'],   // reorder flash: one-shot, 0.9 s, rare. Revisit in phase 4.
}
```

- [x] **Step 4: Run the full suite**

Run: `npm test`
Expected: PASS, 6 files, 30 tests.

- [x] **Step 5: Commit**

```bash
git add tests/animation-perf.test.js docs/superpowers/plans/2026-10-05-performance-optimization.md
git commit -m "test: forbid non-compositor keyframes, ratcheting known offenders"
```

---

### Task 5: Leader glow via opacity instead of a `filter` pulse

The old pulse animated `filter: drop-shadow` on the whole leader row, and `clip-path` cut most of it off. The replacement is an inner gold glow layer whose **opacity** pulses. It stays inside the chamfered shape, so it is actually visible, and it runs on the compositor.

> **Visible change:** the leader's pulse becomes clearly visible as an inner glow, where before it was a faint outer glow. Task 9 asks the user to approve it.

**Files:**
- Modify: `tests/Row.test.jsx`, `src/components/Row.jsx`, `src/styles/tower.css`, `src/styles/animations.css`, `tests/animation-perf.test.js`

- [x] **Step 1: Add failing tests to `tests/Row.test.jsx`** (inside the `describe('Row', …)` block)

```jsx
  it('gives only the leader a glow layer', () => {
    const { container, rerender } = render(<Row row={{ ...base, position: 1 }} />)
    expect(container.querySelector('.p1glow')).toBeInTheDocument()
    rerender(<Row row={{ ...base, position: 2 }} />)
    expect(container.querySelector('.p1glow')).toBeNull()
  })
```

- [x] **Step 2: Run to verify failure**

Run: `npx vitest run tests/Row.test.jsx`
Expected: FAIL in "gives only the leader a glow layer" (received `null`).

- [x] **Step 3: Render the glow layer in `src/components/Row.jsx`.** Make it the first child of the row `<div>`, immediately before `<div className="pos">`:

```jsx
      {leader && <span className="p1glow" aria-hidden="true" />}
```

- [x] **Step 4: Update `src/styles/tower.css`**

In the `.row.p1 { … }` rule, delete this line:
```css
  filter: drop-shadow(0 6px 20px rgba(255, 197, 37, .28));
```
Replace the line `.row.p1:not(.enter) { animation: p1pulse 3.2s ease-in-out infinite; }` with:
```css
/* Leader glow: inner gold glow whose opacity pulses (compositor-only). */
.row > .p1glow {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
  box-shadow: inset 0 0 26px 2px rgba(255, 197, 37, .38);
  opacity: .45;
}
.row.p1:not(.enter) > .p1glow { animation: p1glow 3.2s ease-in-out infinite; will-change: opacity; }
```
`.row > .p1glow` must beat the existing `.row > * { position: relative; z-index: 2; }` rule. It does on specificity, so keep the selector exactly as written.

- [x] **Step 5: Replace the `p1pulse` keyframes in `src/styles/animations.css`** with:

```css
@keyframes p1glow {
  0%, 100% { opacity: .45; }
  50%      { opacity: 1; }
}
```

- [x] **Step 6: Remove the `p1pulse` line from `ALLOWED`** in `tests/animation-perf.test.js`.

- [x] **Step 7: Run tests**

Run: `npm test`
Expected: PASS, 31 tests. If "has no stale allowlist entries" fails on `p1pulse`, you skipped Step 6.

- [x] **Step 8: Measure**

```bash
npm run build && npm run perf -- after-glow
```
Expected: the steady `layerizeMs` drops by at least 80% compared with the baseline in the Handoff notes. Open `.compare/perf-after-glow.png` and check that the leader row shows a soft gold inner glow. If it looks too strong, lower the `.38` alpha in `.row > .p1glow` (don't go below `.25`) and note it.

- [x] **Step 9: Commit**

```bash
git add src/components/Row.jsx src/styles/tower.css src/styles/animations.css tests/Row.test.jsx tests/animation-perf.test.js docs/superpowers/plans/2026-10-05-performance-optimization.md
git commit -m "perf: pulse the leader glow with opacity instead of animating filter"
```

---

### Task 6: Entrance without blur; flare via transform

Removing `filter: blur()` from the two row-entrance keyframes cut the 4K entrance raster cost from 700 ms to 25 ms and doubled the frame count in the baseline measurement. The slide, scale, skew, stagger and leader slam all stay. The flare sweep moves from animating `left`, which triggers layout every frame, to `transform`, and looks the same.

**Files:**
- Modify: `src/styles/animations.css`, `tests/animation-perf.test.js`

- [x] **Step 1: Replace `@keyframes rowinBig` and `@keyframes rowinBigP1`** in `src/styles/animations.css` with:

```css
@keyframes rowinBig {
  0%   { opacity: 0; transform: translateX(-150px) scale(.82) skewX(6deg); }
  55%  { opacity: 1; }
  100% { opacity: 1; transform: none; }
}

@keyframes rowinBigP1 {
  0%   { opacity: 0; transform: scale(.55) translateY(-40px); }
  45%  { opacity: 1; }
  62%  { transform: scale(1.08); }
  80%  { transform: scale(.985); }
  100% { opacity: 1; transform: none; }
}
```

- [x] **Step 2: Promote entering rows to their own layers only while they animate.** In the `.row.enter { … }` rule, add:

```css
  will-change: transform, opacity;
```
The `enter` class is removed after the intro, so the layers are released afterwards.

- [x] **Step 3: Move the flare to `transform`.** In the `.introflare::before { … }` rule, change `left: -50%;` to `left: 0;` and change `transform: skewX(-18deg);` to `transform: translateX(-131%) skewX(-18deg);`. Then replace `@keyframes flare` with:

```css
/* translateX % is relative to the 42%-wide streak: -131% ≈ left -55vw, 321% ≈ left 135vw */
@keyframes flare {
  0%   { transform: translateX(-131%) skewX(-18deg); opacity: 0; }
  18%  { opacity: 1; }
  100% { transform: translateX(321%) skewX(-18deg); opacity: 0; }
}
```

- [x] **Step 4: Remove `rowinBig`, `rowinBigP1` and `flare` from `ALLOWED`** in `tests/animation-perf.test.js`.

- [x] **Step 5: Run tests**

Run: `npm test`
Expected: PASS, 31 tests. The `IntroFlare` tests are unaffected because the class names are unchanged.

- [x] **Step 6: Measure and eyeball**

```bash
npm run build && npm run perf -- after-entrance
```
Expected: the entrance `rasterMs` drops by at least 80% compared with the baseline and its `fps` roughly doubles. Then run `npm run dev`, open `/#/` at full screen, and press **R** a few times. The rows should still fly in staggered from the left, the leader should slam in last, and the flare should sweep left to right across the whole screen.

- [x] **Step 7: Commit**

```bash
git add src/styles/animations.css tests/animation-perf.test.js docs/superpowers/plans/2026-10-05-performance-optimization.md
git commit -m "perf: drop blur from row entrance and sweep the flare with transform"
```

---

### Task 7: LIVE dot ripple via transform

**Files:**
- Modify: `src/styles/tower.css` (`.live .dot` rules), `src/styles/animations.css` (`pip`), `tests/animation-perf.test.js`

- [x] **Step 1: Replace the three `.live` dot rules in `src/styles/tower.css`.** These are the `.live .dot { … }` rule and the two `.live.idle …` rules. Replace them with:

```css
.live .dot { position: relative; width: 8px; height: 8px; border-radius: 50%; background: var(--amber); }
/* ripple ring: scales out and fades (compositor-only) */
.live .dot::after {
  content: ""; position: absolute; inset: 0; border-radius: 50%;
  background: rgba(255, 197, 37, .55); animation: pip 1.8s infinite;
}
.live.idle { border-color: var(--line-strong); background: rgba(255, 255, 255, .04); color: var(--ink-faint); }
.live.idle .dot { background: var(--ink-faint); }
.live.idle .dot::after { display: none; }
```

- [x] **Step 2: Replace `@keyframes pip`** in `src/styles/animations.css`. The old 7 px box-shadow ring around an 8 px dot is equivalent to scale 2.75.

```css
@keyframes pip {
  0%   { transform: scale(1); opacity: 1; }
  70%  { transform: scale(2.75); opacity: 0; }
  100% { transform: scale(2.75); opacity: 0; }
}
```

- [x] **Step 3: Remove `pip` from `ALLOWED`.** Only `flash` should remain.

- [x] **Step 4: Run tests**

Run: `npm test`
Expected: PASS, 31 tests.

- [x] **Step 5: Eyeball the live state.** The app is always in Standby until phase 5, so check it by hand. Run `npm run dev` and open `/#/`. In DevTools Elements, select the `span.live` and delete the `idle` class. Expected: an amber dot with a ring that ripples outward and fades about every 1.8 s, as in the prototype.

- [x] **Step 6: Commit**

```bash
git add src/styles/tower.css src/styles/animations.css tests/animation-perf.test.js docs/superpowers/plans/2026-10-05-performance-optimization.md
git commit -m "perf: animate the LIVE ripple with transform instead of box-shadow"
```

---

### Task 8: Final verification

- [ ] **Step 1: Full check**

```bash
npm test && npm run build && npm run build:offline && npm run size && npm run perf -- after
```
Expected: 31 tests pass, all four size budgets show PASS, and the trace prints.

- [ ] **Step 2: Record the results.** Append one line to "Handoff notes" with the "after" rows, and fill in this table here:

| Metric | Before | After | Target |
|---|---|---|---|
| Offline bundle | | | ≤ 1,000 KB |
| Images (hosted) | | | ≤ 450 KB |
| Font files | | | ≤ 8 |
| Steady `layerizeMs` / 5 s | | | ≥ 80% lower |
| Entrance `rasterMs` / 2.5 s | | | ≥ 80% lower |
| Entrance `fps` | | | higher |

- [ ] **Step 3: Offline smoke test.** Double-click `dist-offline/index.html` and turn on DevTools → Network → "Offline". Reload. Expected: logos, Thai text and fonts all render, and the console shows no 404 errors.

- [ ] **Step 4: Commit the recorded results**

```bash
git add docs/superpowers/plans/2026-10-05-performance-optimization.md
git commit -m "docs: record performance optimization results"
```

---

### Task 9: Checkpoint — venue PC check and user approval (hard stop)

These numbers came from a fast dev PC in headless Chrome. The real test is the venue hardware.

- [ ] **Step 1: Report to the user** with:
  - the table from Task 8;
  - `.compare/perf-before.png` next to `.compare/perf-after.png`;
  - the one visible design change for approval: the **leader glow** (Task 5), which is now an inner pulse that is clearly visible, where before it was a mostly-clipped outer glow;
  - the entrance, which no longer blurs.

- [ ] **Step 2: Ask the user to run this on the venue PC (or one like it):**
  1. Copy `dist-offline/index.html` over, open it in Chrome on the 4K screen, and press **F**.
  2. Open DevTools → ⋮ → More tools → **Rendering** and tick **Frame Rendering Stats**.
  3. Press **R** three times to replay the intro. Expected: no visible stutter, and the FPS meter stays near the screen's refresh rate.
  4. **Soak test:** leave it running for 30 minutes with DevTools → **Performance monitor** open. Expected: *JS heap size* and *DOM Nodes* stay flat (±10%), and *CPU usage* stays low when idle.

- [ ] **Step 3: Wait for the user's answer.** Don't start other work until they approve the glow and report back on the venue PC.

---

## Deliberately not done (with reasons)

| Idea | Why it's skipped | Revisit when |
|---|---|---|
| Drop `mix-blend-mode: screen` from the row sheen | Measured: no meaningful difference (77 → 65 layerize passes, 0 → 1 ms) | Never, unless the venue PC trace says otherwise |
| Replace `react-router` with a tiny hash router | JS is 85 KB gzip and loads from disk or LAN. The saving (~20 KB gzip) is not felt | Only if hosted load time becomes a complaint |
| Lazy-load the admin route | The admin route is a 10-line placeholder today | Phase 6, when admin brings in PapaParse etc. (in the hosted build only, since the offline single file inlines everything anyway) |
| `React.memo` on `Row` | 10 static rows, with no re-renders apart from the clock (which is isolated) | Phase 3/5, when polling re-renders the tower every 10 s. Measure first |
| `background-attachment: fixed` on `body` | Only costs anything while scrolling, and the venue view doesn't scroll | Phase 6 (the admin page scrolls) |
| Reorder `flash` keyframe (`box-shadow`) | One-shot, 0.9 s, only on rank changes. It is on the allowlist with a note | Phase 4, when reorder animation is built |
