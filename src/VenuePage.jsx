import { useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import ColumnHead from './components/ColumnHead.jsx'
import Tower from './components/Tower.jsx'
import Footer from './components/Footer.jsx'
import IntroFlare from './components/IntroFlare.jsx'
import { MedalDefs } from './components/MedalIcon.jsx'
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts.js'
import { rank } from './lib/rank.js'
import { withRegistry } from './lib/registry.js'
import { SAMPLE } from './lib/sample.js'

// Phase 2: static sample. Phase 3/5 replace this with useLeaderboardData().
const ROWS = rank(withRegistry(SAMPLE.rows))

export default function VenuePage() {
  useKeyboardShortcuts()
  const [entering, setEntering] = useState(true)
  const [introKey, setIntroKey] = useState(0)

  useEffect(() => {
    setEntering(true)
    const timer = setTimeout(() => {
      setEntering(false)
    }, 2100)
    return () => clearTimeout(timer)
  }, [introKey])

  useEffect(() => {
    const handleReplay = () => setIntroKey(k => k + 1)
    window.addEventListener('tta:replay-intro', handleReplay)

    let channel
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel('tta-leaderboard')
      channel.onmessage = e => {
        if (e.data?.type === 'intro') {
          handleReplay()
        }
      }
    }

    return () => {
      window.removeEventListener('tta:replay-intro', handleReplay)
      channel?.close()
    }
  }, [])

  return (
    <div className="venue">
      <MedalDefs />
      {entering && <IntroFlare key={introKey} />}
      <div className="stage">
        <Header title={SAMPLE.title} />
        <ColumnHead />
        <Tower key={introKey} rows={ROWS} entering={entering} />
        <Footer />
      </div>
    </div>
  )
}
