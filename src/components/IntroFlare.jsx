import { useEffect, useState } from 'react'

/**
 * One-shot cinematic light flare and radial flash overlay on entrance.
 * Automatically respects prefers-reduced-motion and unmounts after duration.
 */
export default function IntroFlare({ duration = 1000, onComplete }) {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (!visible) {
      onComplete?.()
      return
    }
    const timer = setTimeout(() => {
      setVisible(false)
      onComplete?.()
    }, duration)
    return () => clearTimeout(timer)
  }, [visible, duration, onComplete])

  if (!visible) return null

  return (
    <>
      <div className="introflash" aria-hidden="true" data-testid="introflash" />
      <div className="introflare" aria-hidden="true" data-testid="introflare" />
    </>
  )
}
