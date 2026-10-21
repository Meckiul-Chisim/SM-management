const tones = {
  default: 'bg-brand-50 text-brand-800',
  neutral: 'bg-surface text-muted',
  info: 'bg-info-bg text-info',
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
}

function Badge({ children, className = '', tone = 'default' }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${tones[tone] || tones.default} ${className}`}
    >
      {children}
    </span>
  )
}

export default Badge
