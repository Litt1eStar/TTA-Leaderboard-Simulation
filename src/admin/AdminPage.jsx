import { Link } from 'react-router'

function replayIntro() {
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel('tta-leaderboard')
    channel.postMessage({ type: 'intro' })
    channel.close()
  }
}

// Placeholder: the real operator console is built in phase 6.
export default function AdminPage() {
  return (
    <main style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <h1>Operator console</h1>
      <p>CSV upload, live source and controls arrive in phase 6.</p>
      <button
        type="button"
        onClick={replayIntro}
        style={{
          padding: '8px 16px',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontWeight: 700,
          background: 'var(--amber, #ff8d20)',
          color: '#1a1000',
          border: 'none',
          borderRadius: 4,
        }}
      >
        Replay entrance transition
      </button>
      <Link to="/">Open venue view</Link>
    </main>
  )
}
