export default function Footer({ entering = false }) {
  return (
    <footer className={entering ? 'footer enter' : 'footer'}>
      <div className="footer-left">
        <span className="footer-badge">TTA 2027</span>
        <span className="footer-note">13th Thailand Teaching Academy Award · Hosted by KMUTT</span>
        <span className="footer-divider">•</span>
        <span className="footer-note">Industrial Education Faculties Network</span>
      </div>
      <div className="footer-right">
        <span className="footer-shortcut"><kbd>P</kbd> Present Mode</span>
        <span className="footer-shortcut"><kbd>F</kbd> Fullscreen</span>
      </div>
    </footer>
  )
}
