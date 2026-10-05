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
