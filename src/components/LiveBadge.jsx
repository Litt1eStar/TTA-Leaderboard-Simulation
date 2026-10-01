export default function LiveBadge({ live = false }) {
  return (
    <span className={live ? 'live' : 'live idle'}>
      <span className="dot" />
      {live ? 'Live' : 'Standby'}
    </span>
  )
}
