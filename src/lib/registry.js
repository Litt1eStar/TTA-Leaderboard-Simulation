import KMUTT from '../assets/logos/logo_KMUTT.webp'
import KMUTNB from '../assets/logos/logo_KMUTNB.webp'
import KMITL from '../assets/logos/logo_KMITL.webp'
import RMUTL from '../assets/logos/logo_RMUTL.webp'
import RMUTT from '../assets/logos/logo_RMUTT.webp'
import RUTS from '../assets/logos/logo_RUTS.webp'
import RMUTS from '../assets/logos/logo_RMUTS.webp'
import RMUTI from '../assets/logos/logo_RMUTI.webp'
import RMUTK from '../assets/logos/logo_RMUTK.webp'
import RMUTP from '../assets/logos/logo_RMUTP.webp'

// Static identity of each university. CSVs only supply medal counts.
export const REGISTRY = [
  { code: 'KMUTT',  thaiName: 'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี',        logo: KMUTT,  color: '#F57F20' },
  { code: 'KMUTNB', thaiName: 'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ',    logo: KMUTNB, color: '#B0122F' },
  { code: 'KMITL',  thaiName: 'สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง', logo: KMITL,  color: '#16407F' },
  { code: 'RMUTL',  thaiName: 'มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา',             logo: RMUTL,  color: '#7A2FB0' },
  { code: 'RMUTT',  thaiName: 'มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี',            logo: RMUTT,  color: '#1466B5' },
  { code: 'RUTS',   thaiName: 'มหาวิทยาลัยเทคโนโลยีราชมงคลศรีวิชัย',           logo: RUTS,   color: '#C6472B' },
  { code: 'RMUTS',  thaiName: 'มหาวิทยาลัยเทคโนโลยีราชมงคลสุวรรณภูมิ',         logo: RMUTS,  color: '#B8862B' },
  { code: 'RMUTI',  thaiName: 'มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน',              logo: RMUTI,  color: '#1E8E6A' },
  { code: 'RMUTK',  thaiName: 'มหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพ',            logo: RMUTK,  color: '#D4A017' },
  { code: 'RMUTP',  thaiName: 'มหาวิทยาลัยเทคโนโลยีราชมงคลพระนคร',             logo: RMUTP,  color: '#2C7BE5' },
]

export const REGISTRY_BY_CODE = Object.fromEntries(REGISTRY.map(u => [u.code, u]))

// Count rows ({ code, gold, silver, bronze }) -> display rows with name/logo/color.
export function withRegistry(countRows) {
  return countRows.map(c => ({ ...REGISTRY_BY_CODE[c.code], ...c }))
}
