import { useEffect, useState } from 'react'
import ttaLogo from '../assets/logo.webp'
import LiveBadge from './LiveBadge.jsx'

const pad = n => String(n).padStart(2, '0')

function Clock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return <span className="clock">{pad(now.getHours())}:{pad(now.getMinutes())}:{pad(now.getSeconds())}</span>
}

export default function Header({ title, live = false }) {
  return (
    <header className="topbar">
      <div className="brand">
        <img src={ttaLogo} alt="Thailand Teaching Academy Award 2027" />
      </div>
      <div className="title-block">
        <p className="eyebrow">University Medal Standings</p>
        <h1 className="comp-title">{title}</h1>
        <p className="event-sub">
          Thailand Teaching Academy Award · 13<sup>th</sup> · 2027 · Industrial Education Faculties Network
        </p>
      </div>
      <div className="status">
        <div className="statrow">
          <LiveBadge live={live} />
          <Clock />
        </div>
      </div>
    </header>
  )
}
