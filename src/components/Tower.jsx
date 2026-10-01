import Row from './Row.jsx'

/** rows: output of rank(); moves: optional { [code]: delta } */
export default function Tower({ rows, moves = {} }) {
  return (
    <main className="board" aria-live="polite">
      {rows.map(r => <Row key={r.code} row={r} move={moves[r.code] ?? 0} />)}
    </main>
  )
}
