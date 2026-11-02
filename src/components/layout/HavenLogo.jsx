function HavenLogo({ className = '' }) {
  return (
    <svg
      className={`haven-logo ${className}`}
      viewBox="0 0 40 40"
      role="img"
      aria-label="Haven"
    >
      <path
        className="haven-logo-frame"
        d="M7 20C7 10.6 12.8 5 20 5s13 5.6 13 15v15H7V20Z"
      />
      <path
        className="haven-logo-window"
        d="M12 23V20c0-6 3.1-9.5 8-9.5S28 14 28 20v15h-4.5v-9H16.5v9H12V23Z"
      />
      <path className="haven-logo-line" d="M16.5 26h7" />
    </svg>
  )
}

export default HavenLogo
