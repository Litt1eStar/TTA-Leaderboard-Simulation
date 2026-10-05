export default function ColumnHead({ entering = false }) {
  return (
    <div className={entering ? 'colhead enter' : 'colhead'} aria-hidden="true">
      <div>Pos</div>
      <div>University</div>
      <div className="c-medals"><div>Gold</div><div>Silver</div><div>Bronze</div></div>
    </div>
  )
}
