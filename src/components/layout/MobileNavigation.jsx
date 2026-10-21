import { NavLink } from 'react-router-dom'
import { navigationItems } from '../../app/navigation.js'

function MobileNavigation({ open, onNavigate }) {
  return (
    <>
      {open && <button type="button" aria-label="Close navigation overlay" onClick={onNavigate} className="fixed inset-0 top-16 z-20 bg-ink/30 md:hidden" />}
      <nav
        id="mobile-navigation"
        aria-label="Mobile navigation"
        hidden={!open}
        className="fixed inset-x-0 top-16 z-30 border-b border-line bg-canvas px-4 py-3 shadow-xl md:hidden"
      >
        {navigationItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `mb-0.5 flex min-h-12 items-center gap-3 rounded-lg px-3 text-sm transition-colors ${
                isActive
                  ? 'bg-brand-50 font-semibold text-ink'
                  : 'font-medium text-muted hover:bg-surface hover:text-ink'
              }`
            }
          >
            <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}

export default MobileNavigation
