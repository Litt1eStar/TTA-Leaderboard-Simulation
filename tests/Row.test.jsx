import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Row from '../src/components/Row.jsx'

const base = {
  code: 'KMUTT', thaiName: 'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี',
  logo: '/logo.png', color: '#F57F20', gold: 12, silver: 0, bronze: 6,
}

describe('Row', () => {
  it('shows position, English code as title and Thai name as secondary text', () => {
    render(<Row row={{ ...base, position: 3 }} />)
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('KMUTT')).toHaveClass('code')
    expect(screen.getByText(base.thaiName)).toHaveClass('name')
  })

  it('marks the leader with p1 class and ★ Leader tag', () => {
    const { container } = render(<Row row={{ ...base, position: 1 }} />)
    expect(container.firstChild).toHaveClass('row', 'p1')
    expect(screen.getByText('★ Leader')).toBeInTheDocument()
  })

  it('does not tag non-leaders', () => {
    const { container } = render(<Row row={{ ...base, position: 2 }} />)
    expect(container.firstChild).not.toHaveClass('p1')
    expect(screen.queryByText('★ Leader')).toBeNull()
  })

  it('fades zero medal counts', () => {
    render(<Row row={{ ...base, position: 2 }} />)
    expect(screen.getByLabelText('Silver 0')).toHaveClass('mc', 'zero')
    expect(screen.getByLabelText('Gold 12')).not.toHaveClass('zero')
  })

  it('never renders points', () => {
    const { container } = render(<Row row={{ ...base, position: 2 }} />)
    // 12*3 + 0*2 + 6 = 42
    expect(container.textContent).not.toMatch(/42|PTS/)
  })

  it('shows movement arrows', () => {
    const { rerender } = render(<Row row={{ ...base, position: 2 }} move={2} />)
    expect(screen.getByText('▲').parentElement).toHaveTextContent('▲2')
    rerender(<Row row={{ ...base, position: 2 }} move={-1} />)
    expect(screen.getByText('▼').parentElement).toHaveTextContent('▼1')
    rerender(<Row row={{ ...base, position: 2 }} />)
    expect(screen.getByText('–')).toHaveClass('mv', 'flat')
  })

  it('omits the logo chip when no logo is registered', () => {
    const { container } = render(<Row row={{ ...base, logo: undefined, position: 2 }} />)
    expect(container.querySelector('.chip')).toBeNull()
  })

  it('adds enter class when entering is true', () => {
    const { container, rerender } = render(<Row row={{ ...base, position: 1 }} entering />)
    expect(container.firstChild).toHaveClass('row', 'p1', 'enter')
    rerender(<Row row={{ ...base, position: 1 }} entering={false} />)
    expect(container.firstChild).not.toHaveClass('enter')
  })

  it('gives only the leader a glow layer', () => {
    const { container, rerender } = render(<Row row={{ ...base, position: 1 }} />)
    expect(container.querySelector('.p1glow')).toBeInTheDocument()
    rerender(<Row row={{ ...base, position: 2 }} />)
    expect(container.querySelector('.p1glow')).toBeNull()
  })
})
