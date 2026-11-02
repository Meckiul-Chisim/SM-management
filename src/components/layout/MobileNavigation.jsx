import { NavLink } from 'react-router-dom'
import { navigationItems } from '../../app/navigation.js'

// Slide-down menu for screens below md. The layout closes it with Escape or when a link is chosen.
function MobileNavigation({ open, onNavigate }) {
  return (
    <>
      {open && (
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close navigation menu"
          onClick={onNavigate}
          className="fixed inset-0 top-16 z-20 bg-scrim md:hidden"
        />
      )}
      <nav
        id="mobile-navigation"
        aria-label="Mobile navigation"
        hidden={!open}
        className="fixed inset-x-0 top-16 z-30 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-line bg-canvas px-4 py-3 shadow-xl md:hidden"
      >
        {navigationItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `haven-mobile-nav-link mb-1 flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm transition-colors ${
                isActive ? 'is-active bg-brand-50 font-semibold text-ink' : 'font-medium text-muted hover:bg-surface hover:text-ink'
              }`
            }
          >
            <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
            <span className="flex-1">{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}

export default MobileNavigation
