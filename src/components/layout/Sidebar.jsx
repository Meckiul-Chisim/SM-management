import { Layers3, Plus } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { navigationItems } from '../../app/navigation.js'
import { useWorkspace } from '../../context/WorkspaceContext.jsx'

function Sidebar() {
  const { data } = useWorkspace()

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-canvas px-4 py-5 text-white md:flex">
      <Link to="/dashboard" className="mb-9 flex items-center gap-3 px-2">
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand-700 text-white shadow-sm">
          <Layers3 size={21} aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-base font-bold tracking-tight text-white">{data.workspaceName || 'Haven'}</span>
          <span className="block text-xs text-white/50">Social media studio</span>
        </span>
      </Link>

      <div className="mb-3 flex items-center justify-between px-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Workspace</p>
        <span className="size-1.5 rounded-full bg-brand-800" aria-hidden="true" />
      </div>
      <nav aria-label="Main navigation" className="space-y-1">
        {navigationItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'text-white/60 hover:bg-white/[0.06] hover:text-white'
              }`
            }
          >
            <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
            <span className="flex-1">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto">
        <Link to="/content" className="mb-3 flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm font-semibold text-white/75 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white">
          <Plus size={16} /> Create new post
        </Link>
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-4">
          <div className="mb-3 flex size-8 items-center justify-center rounded-xl bg-brand-700/20 text-brand-800">
            <Layers3 size={16} aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold text-white">Your content, in one place</p>
          <p className="mt-1 text-xs leading-5 text-white/45">
            Organise brands, plan posts, and keep follow-ups moving.
          </p>
        </div>
        <p className="mt-4 px-2 text-[10px] leading-4 text-white/30">LOCAL WORKSPACE · V1</p>
      </div>
    </aside>
  )
}

export default Sidebar
