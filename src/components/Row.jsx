import LogoChip from './LogoChip.jsx'
import MedalIcon from './MedalIcon.jsx'
import { useCountUp } from '../hooks/useCountUp.js'

function Movement({ delta }) {
  if (delta > 0) return <span className="mv up"><span className="ar">▲</span>{delta}</span>
  if (delta < 0) return <span className="mv down"><span className="ar">▼</span>{-delta}</span>
  return <span className="mv flat">–</span>
}

function MedalCount({ kind, label, count, entering = false, delay = 0 }) {
  const displayCount = useCountUp(count, {
    duration: 550,
    delay,
    enabled: entering,
  })

  return (
    <div className={count > 0 ? 'mc' : 'mc zero'} aria-label={`${label} ${count}`}>
      <MedalIcon kind={kind} />
      <span className="cnt"><span className="x">×</span>{displayCount}</span>
    </div>
  )
}

/**
 * row:  ranked display row { position, code, thaiName?, logo?, color?, gold, silver, bronze }
 * move: places gained since the previous standings (+ up, - down, 0 none)
 */
export default function Row({ row, move = 0, entering = false }) {
  const leader = row.position === 1
  const style = { '--i': row.position - 1 }
  if (row.color) style['--uc'] = row.color

  const countDelay = leader ? 1150 : (row.position - 1) * 85 + 180

  const className = [
    'row',
    leader && 'p1',
    entering && 'enter',
  ].filter(Boolean).join(' ')

  return (
    <div className={className} style={style} data-code={row.code}>
      {leader && entering && <span className="p1-shockwave" aria-hidden="true" />}
      <div className="pos">
        <span className="box"><b>{row.position}</b></span>
        <Movement delta={move} />
      </div>
      <div className="who">
        {row.logo && <LogoChip src={row.logo} alt={row.code} />}
        <div className="txt">
          <span className="codeline">
            <span className="code">{row.code}</span>
            {leader && <span className="p1tag">★ Leader</span>}
          </span>
          {row.thaiName && <span className="name" lang="th">{row.thaiName}</span>}
        </div>
      </div>
      <div className="medals">
        <MedalCount kind="g" label="Gold" count={row.gold} entering={entering} delay={countDelay} />
        <MedalCount kind="s" label="Silver" count={row.silver} entering={entering} delay={countDelay} />
        <MedalCount kind="b" label="Bronze" count={row.bronze} entering={entering} delay={countDelay} />
      </div>
    </div>
  )
}
