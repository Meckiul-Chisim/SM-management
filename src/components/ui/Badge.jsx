const tones = {
  default: 'border border-brand-100 bg-brand-50 text-brand-800',
  inverse: 'border border-white/10 bg-white/10 text-white',
}

function Badge({ children, className = '', tone = 'default' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-[0.01em] ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

export default Badge
