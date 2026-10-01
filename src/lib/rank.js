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
