// Shared by Button (a <button>) and ButtonLink (a router link) so both look identical.
const variants = {
  primary: 'bg-brand-700 text-on-brand hover:bg-brand-800',
  secondary: 'border border-line bg-panel text-ink hover:border-brand-100 hover:bg-surface',
  ghost: 'text-muted hover:bg-surface hover:text-ink',
  danger: 'bg-danger text-panel hover:opacity-90',
}

// Touch targets are 44px tall on small screens and 40px (36px for sm) from the sm breakpoint up.
const sizes = {
  md: 'min-h-11 px-4 py-2 sm:min-h-10',
  sm: 'min-h-11 px-3 py-1.5 sm:min-h-9',
}

export function buttonClasses(variant = 'primary', size = 'md', className = '') {
  return `inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 disabled:pointer-events-none disabled:opacity-50 ${sizes[size]} ${variants[variant]} ${className}`
}
