function Card({ children, className = '', tone = 'default', ...props }) {
  const toneClass = tone === 'brand'
    ? 'border-brand-100/30 bg-brand-900 text-white shadow-[0_8px_32px_rgba(0,0,0,0.16)]'
    : 'border-line bg-panel shadow-[0_4px_20px_rgba(0,0,0,0.12)] transition-colors duration-200 hover:border-[#49475f]'

  return (
    <section
      className={`rounded-2xl border ${toneClass} ${className}`}
      {...props}
    />
  )
}

export default Card
