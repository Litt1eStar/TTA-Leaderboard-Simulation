const STAR =
  'M24 33 L25.76 37.57 L30.66 37.84 L26.85 40.93 L28.11 45.66 L24 43 L19.89 45.66 L21.15 40.93 L17.34 37.84 L22.24 37.57 Z'

// Gradients shared by every medal. Render once per page.
export function MedalDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <radialGradient id="grad-g" cx="38%" cy="30%" r="80%">
          <stop offset="0" stopColor="#fff0c0" /><stop offset=".5" stopColor="#ffc525" /><stop offset="1" stopColor="#c47e0d" />
        </radialGradient>
        <radialGradient id="grad-s" cx="38%" cy="30%" r="80%">
          <stop offset="0" stopColor="#ffffff" /><stop offset=".5" stopColor="#c7d1dd" /><stop offset="1" stopColor="#7d8b9d" />
        </radialGradient>
        <radialGradient id="grad-b" cx="38%" cy="30%" r="80%">
          <stop offset="0" stopColor="#f8c79c" /><stop offset=".5" stopColor="#d07b36" /><stop offset="1" stopColor="#84461a" />
        </radialGradient>
        <linearGradient id="rib" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#48abff" /><stop offset="1" stopColor="#1668c0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/** kind: 'g' | 's' | 'b' */
export default function MedalIcon({ kind }) {
  return (
    <svg className="medal" viewBox="0 0 48 58" aria-hidden="true">
      <g className="ribbon">
        <path d="M14 2 L22 2 L21 30 L12.5 27 Z" />
        <path d="M26 2 L34 2 L35.5 27 L27 30 Z" />
      </g>
      <circle cx="24" cy="40" r="15" fill={`url(#grad-${kind})`} stroke="rgba(0,0,0,.20)" strokeWidth="1" />
      <circle className="rimlt" cx="24" cy="40" r="11.6" />
      <path className="star" d={STAR} />
    </svg>
  )
}
