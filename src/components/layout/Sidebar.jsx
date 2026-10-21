import { Plus } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { navigationItems } from '../../app/navigation.js'
import { useWorkspace } from '../../context/WorkspaceContext.jsx'
import Wordmark from './Wordmark.jsx'

function Sidebar() {
  const { data } = useWorkspace()

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-canvas px-4 py-6 md:flex">
      <Link to="/dashboard" className="mb-8 block rounded-lg px-2 py-1" aria-label="Go to dashboard">
        <Wordmark name={data.workspaceName || 'Haven'} />
      </Link>

      <nav aria-label="Main navigation" className="space-y-0.5">
        {navigationItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors duration-150 ${
                isActive
                  ? 'bg-brand-50 font-semibold text-ink'
                  : 'font-medium text-muted hover:bg-surface hover:text-ink'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={17} strokeWidth={1.75} aria-hidden="true" className={isActive ? 'text-brand-700' : ''} />
                <span className="flex-1">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto">
        <Link
          to="/content"
          className="flex min-h-10 items-center justify-center gap-2 rounded-lg bg-brand-700 px-3 text-sm font-semibold text-on-brand transition-colors hover:bg-brand-800"
        >
          <Plus size={16} aria-hidden="true" /> New post
        </Link>
        <p className="mt-4 px-1 text-xs leading-5 text-faint">Saved in this browser</p>
      </div>
    </aside>
  )
}

export default Sidebar
