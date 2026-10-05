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
