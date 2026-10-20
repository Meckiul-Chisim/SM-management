import { Building2, ChevronDown, Menu, X } from 'lucide-react'
import IconButton from '../ui/IconButton.jsx'

function Header({ onMenuClick, menuExpanded }) {
  return (
    <header className="sticky top-0 z-10 flex h-[73px] items-center justify-between border-b border-line bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <IconButton
          label={menuExpanded ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={onMenuClick}
          aria-expanded={menuExpanded}
          aria-controls="mobile-navigation"
          className="md:hidden"
        >
          {menuExpanded ? <X size={20} /> : <Menu size={20} />}
        </IconButton>
        <span className="flex size-9 items-center justify-center rounded-xl bg-brand-700 text-white md:hidden">
          <Building2 size={19} aria-hidden="true" />
        </span>
        <p className="hidden text-sm font-medium text-muted sm:block">
          Agent workspace
        </p>
      </div>

      <div
        role="group"
        aria-label="Account placeholder"
        className="flex min-h-11 items-center gap-2 rounded-xl px-2 text-left"
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-800">
          A
        </span>
        <span className="hidden sm:block">
          <span className="block text-sm font-semibold leading-5 text-ink">
            Agent account
          </span>
          <span className="block text-xs leading-4 text-muted">Placeholder</span>
        </span>
        <ChevronDown
          size={16}
          className="hidden text-muted sm:block"
          aria-hidden="true"
        />
      </div>
    </header>
  )
}

export default Header
