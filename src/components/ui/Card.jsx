// A flexible bordered surface. Supports semantic elements such as article when needed.
function Card({ children, className = '', tone = 'default', as: Element = 'section', ...props }) {
  const toneClass = tone === 'brand'
    ? 'border-brand-100 bg-brand-50 text-ink'
    : 'border-line bg-panel'

  return (
    <Element
      className={`rounded-lg border ${toneClass} ${className}`}
      {...props}
    >
      {children}
    </Element>
  )
}

export default Card
