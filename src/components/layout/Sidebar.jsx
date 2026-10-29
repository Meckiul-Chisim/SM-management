import { Plus } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { navigationItems } from '../../app/navigation.js'
import { useWorkspace } from '../../context/WorkspaceContext.jsx'
import Wordmark from './Wordmark.jsx'

function Sidebar() {
  const { data } = useWorkspace()

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[15.5rem] flex-col border-r border-line bg-panel px-3 py-5 md:flex">
      <Link to="/dashboard" className="mb-7 block rounded-lg px-3 py-1" aria-label="Go to dashboard">
        <Wordmark name={data.workspaceName || 'Haven'} />
      </Link>

      <nav aria-label="Main navigation" className="space-y-0.5">
        {navigationItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex min-h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors duration-150 ${
                isActive
                  ? 'border-l-2 border-brand-700 bg-brand-50 font-semibold text-ink'
                  : 'border-l-2 border-transparent font-medium text-muted hover:bg-surface hover:text-ink'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`flex size-6 items-center justify-center rounded-md ${isActive ? 'text-brand-700' : ''}`}>
                  <Icon size={17} strokeWidth={1.75} aria-hidden="true" />
                </span>
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
