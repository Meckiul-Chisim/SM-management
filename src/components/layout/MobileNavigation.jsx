import { NavLink } from 'react-router-dom'
import { navigationItems } from '../../app/navigation.js'

function MobileNavigation({ open, onNavigate }) {
  return (
    <nav
      id="mobile-navigation"
      aria-label="Mobile navigation"
      hidden={!open}
      className="fixed inset-x-0 top-[73px] z-20 border-b border-line bg-white px-4 py-3 shadow-lg md:hidden"
    >
      {navigationItems.map(({ label, to, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium ${
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
  )
}

export default MobileNavigation
