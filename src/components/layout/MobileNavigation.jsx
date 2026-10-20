import { NavLink } from 'react-router-dom'
import { navigationItems } from '../../app/navigation.js'

function MobileNavigation({ open, onNavigate }) {
  return (
    <>
      {open && <button type="button" aria-label="Close navigation overlay" onClick={onNavigate} className="fixed inset-0 top-[73px] z-20 bg-ink/25 md:hidden" />}
      <nav
        id="mobile-navigation"
        aria-label="Mobile navigation"
        hidden={!open}
        className="fixed inset-x-0 top-[73px] z-30 border-b border-line bg-panel px-4 py-3 shadow-2xl md:hidden"
      >
        {navigationItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `mb-1 flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-800'
                  : 'text-muted hover:bg-surface hover:text-ink'
              }`
            }
          >
            <Icon size={18} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}

export default MobileNavigation
