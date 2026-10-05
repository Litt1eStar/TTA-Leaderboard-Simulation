// Zip the offline build for the venue PC: one folder with TTA-Leaderboard.html + README.txt.
// Usage: npm run package:offline  (runs the offline build first)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { zipSync, strToU8 } from 'fflate'

const { version } = JSON.parse(readFileSync('package.json', 'utf8'))
const commit = process.env.GITHUB_SHA?.slice(0, 7) ?? gitShortSha()
const date = new Date().toLocaleDateString('sv-SE') // local YYYY-MM-DD

// CRLF + UTF-8 BOM so Thai text shows correctly in every version of Windows Notepad.
const readme = readFileSync('scripts/offline-README.txt', 'utf8')
  .replaceAll('{version}', version)
  .replaceAll('{commit}', commit)
  .replaceAll('{date}', date)
  .replace(/\r?\n/g, '\r\n')

const name = `tta-leaderboard-offline-v${version}-${commit}`
const zip = zipSync(
  {
    [name]: {
      'TTA-Leaderboard.html': readFileSync('dist-offline/index.html'),
      'README.txt': strToU8('﻿' + readme),
    },
  },
  { level: 9 },
)

mkdirSync('release', { recursive: true })
writeFileSync(`release/${name}.zip`, zip)
console.log(`release/${name}.zip  ${Math.round(zip.length / 1024)} KB`)

function gitShortSha() {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    return 'nogit'
  }
}
