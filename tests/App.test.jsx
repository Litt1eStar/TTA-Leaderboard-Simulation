import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../src/App.jsx'

const at = path => render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)

describe('routes', () => {
  it('venue view renders 10 ranked rows with KMUTT leading the sample', () => {
    const { container } = at('/')
    expect(screen.getByRole('heading', { name: 'Overall Medal Standings' })).toBeInTheDocument()
    const rows = container.querySelectorAll('.row')
    expect(rows).toHaveLength(10)
    expect(rows[0]).toHaveClass('p1')
    expect(rows[0].dataset.code).toBe('KMUTT')
    expect(rows[9].dataset.code).toBe('RMUTP')
  })

  it('venue view shows no operator controls', () => {
    at('/')
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('admin route renders the console', () => {
    at('/admin')
    expect(screen.getByRole('heading', { name: 'Operator console' })).toBeInTheDocument()
  })
})
