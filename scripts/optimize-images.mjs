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
