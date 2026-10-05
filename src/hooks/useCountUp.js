import { useEffect, useState } from 'react'

/**
 * Animated number count-up hook (0 -> target) with cubic ease-out.
 * Automatically respects prefers-reduced-motion and zero counts.
 */
export function useCountUp(target, { duration = 550, delay = 0, enabled = true } = {}) {
  const isReduced = typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const [displayValue, setDisplayValue] = useState(() => (enabled && !isReduced && target > 0 ? 0 : target))

  useEffect(() => {
    if (!enabled || isReduced || target <= 0) {
      setDisplayValue(target)
      return
    }

    setDisplayValue(0)
    let rafId
    const timer = setTimeout(() => {
      const startTime = performance.now()

      const step = now => {
        const elapsed = now - startTime
        const progress = Math.min(1, elapsed / duration)
        // Cubic ease-out: 1 - (1 - progress)^3
        const easeOut = 1 - Math.pow(1 - progress, 3)
        setDisplayValue(Math.round(target * easeOut))

        if (progress < 1) {
          rafId = requestAnimationFrame(step)
        }
      }

      rafId = requestAnimationFrame(step)
    }, delay)

    return () => {
      clearTimeout(timer)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [target, duration, delay, enabled, isReduced])

  return displayValue
}
