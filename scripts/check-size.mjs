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
