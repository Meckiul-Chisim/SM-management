const variants = {
  primary:
    'bg-brand-700 text-on-brand hover:bg-brand-800 focus-visible:outline-brand-700',
  secondary:
    'border border-line bg-panel text-ink hover:border-brand-100 hover:bg-surface focus-visible:outline-brand-700',
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
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
