import Header from './components/Header.jsx'
import ColumnHead from './components/ColumnHead.jsx'
import Tower from './components/Tower.jsx'
import { MedalDefs } from './components/MedalIcon.jsx'
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts.js'
import { rank } from './lib/rank.js'
import { withRegistry } from './lib/registry.js'
import { SAMPLE } from './lib/sample.js'

// Phase 2: static sample. Phase 3/5 replace this with useLeaderboardData().
const ROWS = rank(withRegistry(SAMPLE.rows))

export default function VenuePage() {
  useKeyboardShortcuts()
  return (
    <div className="venue">
      <MedalDefs />
      <div className="stage">
        <Header title={SAMPLE.title} />
        <ColumnHead />
        <Tower rows={ROWS} />
      </div>
    </div>
  )
}
