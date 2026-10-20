const tones = {
  default: 'bg-brand-50 text-brand-800',
  inverse: 'bg-white/15 text-white',
}

function Badge({ children, className = '', tone = 'default' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

export default Badge
