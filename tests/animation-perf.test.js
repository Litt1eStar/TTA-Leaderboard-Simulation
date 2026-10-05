import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

// Only transform and opacity animate on the GPU compositor. Anything else repaints or
// re-layerizes every frame, which a venue PC driving a 4K screen can't afford.
const CHEAP = new Set(['transform', 'opacity'])

// Known offenders. Each optimization task removes its entry. Don't add entries
// without a written reason next to them.
const ALLOWED = {
  flash: ['box-shadow'],   // reorder flash: one-shot, 0.9 s, rare. Revisit in phase 4.
}

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
