const variants = {
  primary:
    'bg-brand-700 text-white shadow-sm hover:bg-brand-800 hover:shadow-[0_6px_18px_rgba(129,114,245,0.18)] focus-visible:outline-brand-700',
  secondary:
    'border border-line bg-panel-raised text-ink hover:border-brand-100 hover:bg-brand-50 focus-visible:outline-brand-700',
  ghost:
    'text-muted hover:bg-surface hover:text-ink focus-visible:outline-brand-700',
}

function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
