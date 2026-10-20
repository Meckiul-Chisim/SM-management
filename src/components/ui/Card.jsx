function Card({ children, className = '', tone = 'default', ...props }) {
  const toneClass = tone === 'brand' ? 'bg-brand-900 text-white' : 'bg-white'

  return (
    <section
      className={`rounded-2xl border border-line ${toneClass} ${className}`}
      {...props}
    >
      {children}
    </section>
  )
}

export default Card
