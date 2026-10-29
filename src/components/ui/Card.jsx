// A flat, bordered surface. No shadow and no hover effect: structure comes from
// spacing and hairlines, so cards only exist where content truly needs a container.
function Card({ children, className = '', tone = 'default', ...props }) {
  const toneClass = tone === 'brand'
    ? 'border-brand-100 bg-brand-50 text-ink'
    : 'border-line bg-panel'

  return (
    <section
      className={`rounded-lg border ${toneClass} ${className}`}
      {...props}
    >
      {children}
    </section>
  )
}

export default Card
