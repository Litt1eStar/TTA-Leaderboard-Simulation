import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCountUp } from '../src/hooks/useCountUp.js'

describe('useCountUp', () => {
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

  it('immediately returns target if target is 0 or enabled is false', () => {
    const { result: r0 } = renderHook(() => useCountUp(0))
    expect(r0.current).toBe(0)

    const { result: rDisabled } = renderHook(() => useCountUp(10, { enabled: false }))
    expect(rDisabled.current).toBe(10)
  })

  it('immediately returns target if prefers-reduced-motion is true', () => {
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

    const { result } = renderHook(() => useCountUp(15, { enabled: true }))
    expect(result.current).toBe(15)
  })

  it('starts from 0 and rolls up to target after delay and duration', () => {
    // Mock performance.now and requestAnimationFrame
    let now = 1000
    vi.spyOn(performance, 'now').mockImplementation(() => now)
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
      return setTimeout(() => cb(performance.now()), 16)
    })

    const { result } = renderHook(() => useCountUp(12, { duration: 500, delay: 200, enabled: true }))
    expect(result.current).toBe(0)

    // Advance past delay
    act(() => {
      vi.advanceTimersByTime(200)
    })

    // Advance halfway through duration
    act(() => {
      now += 250
      vi.advanceTimersByTime(250)
    })
    expect(result.current).toBeGreaterThan(0)
    expect(result.current).toBeLessThanOrEqual(12)

    // Advance to end
    act(() => {
      now += 300
      vi.advanceTimersByTime(300)
    })
    expect(result.current).toBe(12)
  })
})
