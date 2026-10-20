function Card({ children, className = '', tone = 'default', ...props }) {
  const toneClass = tone === 'brand'
    ? 'border-[#29273a] bg-brand-900 text-white shadow-[0_4px_20px_rgba(25,25,35,0.08)]'
    : 'border-line/90 bg-white shadow-[0_2px_12px_rgba(25,25,35,0.035)] transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(25,25,35,0.055)]'

  return (
    <section
      className={`rounded-2xl border ${toneClass} ${className}`}
      {...props}
    >
      {children}
    </section>
  )
}

export default Card
