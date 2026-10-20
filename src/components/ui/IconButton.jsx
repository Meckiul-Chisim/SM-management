function IconButton({ label, children, className = '', ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-transparent text-muted transition-colors hover:border-line hover:bg-panel-raised hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default IconButton
