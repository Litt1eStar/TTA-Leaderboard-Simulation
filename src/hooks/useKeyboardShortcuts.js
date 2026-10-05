import { useEffect } from 'react'

export function toggleFullscreen() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {})
  else document.exitFullscreen?.()
}

// P = present mode (body.present), F = fullscreen. Ignored while typing in a field.
export default function useKeyboardShortcuts() {
  useEffect(() => {
    const onKey = e => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (e.target.closest?.('input, textarea, select, [contenteditable]')) return
      const k = e.key.toLowerCase()
      if (k === 'p') document.body.classList.toggle('present')
      if (k === 'f') toggleFullscreen()
      if (k === 'r') window.dispatchEvent(new CustomEvent('tta:replay-intro'))
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('present')
    }
  }, [])
}
