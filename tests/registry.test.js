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
