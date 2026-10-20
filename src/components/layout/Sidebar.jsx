import { Building2 } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { navigationItems } from '../../app/navigation.js'

function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-white px-4 py-6 md:flex">
      <Link to="/dashboard" className="mb-10 flex items-center gap-3 px-2">
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand-700 text-white">
          <Building2 size={21} aria-hidden="true" />
        </span>
        <span>
          <span className="block text-base font-bold tracking-tight text-ink">
            Haven
          </span>
          <span className="block text-xs text-muted">Real estate workspace</span>
        </span>
      </Link>

      <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-faint">
        Workspace
      </p>
      <nav aria-label="Main navigation" className="space-y-1">
        {navigationItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${
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

      <div className="mt-auto rounded-2xl bg-surface p-4">
        <p className="text-sm font-semibold text-ink">A clear space to grow</p>
        <p className="mt-1 text-xs leading-5 text-muted">
          Your workspace foundation is ready for future phases.
        </p>
      </div>
    </aside>
  )
}

export default Sidebar
