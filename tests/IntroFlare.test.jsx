import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import IntroFlare from '../src/components/IntroFlare.jsx'

describe('IntroFlare', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders flash and flare overlays when motion is allowed', () => {
    render(<IntroFlare duration={1000} />)
    expect(screen.getByTestId('introflash')).toHaveClass('introflash')
    expect(screen.getByTestId('introflare')).toHaveClass('introflare')
  })

  it('unmounts after duration', () => {
    render(<IntroFlare duration={800} />)
    expect(screen.getByTestId('introflare')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(800)
    })

    expect(screen.queryByTestId('introflare')).toBeNull()
  })

  it('does not render if prefers-reduced-motion is true', () => {
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    render(<IntroFlare />)
    expect(screen.queryByTestId('introflare')).toBeNull()
    expect(screen.queryByTestId('introflash')).toBeNull()
  })
})
