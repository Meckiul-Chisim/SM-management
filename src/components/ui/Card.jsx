// Shared surface primitive. Keep the DOM element semantic while giving every page
// the same radius, border, and light/dark theme behavior.
function Card({ children, className = '', tone = 'default', as: Element = 'section', glass = true, ...props }) {
  const toneClass = tone === 'brand'
    ? 'border-brand-100 bg-brand-50 text-ink'
    : 'border-line bg-panel'
  const surfaceClass = glass ? 'haven-surface' : 'haven-surface haven-surface--solid'

  return (
    <Element
      className={`rounded-xl border ${toneClass} ${surfaceClass} ${className}`}
      {...props}
    >
      {children}
    </Element>
  )
}

export default Card
