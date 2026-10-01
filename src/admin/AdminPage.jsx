import { Link } from 'react-router'

// Placeholder: the real operator console is built in phase 6.
export default function AdminPage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Operator console</h1>
      <p>CSV upload, live source and controls arrive in phase 6.</p>
      <Link to="/">Open venue view</Link>
    </main>
  )
}
