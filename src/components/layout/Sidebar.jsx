import { Plus, Sparkles } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { navigationItems, PRODUCT_NAME } from '../../app/navigation.js'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import Wordmark from './Wordmark.jsx'

function Sidebar() {
  const { data } = useWorkspace()
  return (
    <aside className="haven-sidebar fixed inset-y-0 left-0 z-30 hidden w-65 flex-col md:flex">
      <Link to="/dashboard" className="haven-brand mb-8 block" aria-label="Go to dashboard">
        <Wordmark name={data.workspaceName || PRODUCT_NAME} />
        <span className="haven-brand-caption">SOCIAL WORKSPACE</span>
      </Link>

      <div className="haven-nav-label">WORKSPACE</div>
      <nav aria-label="Main navigation" className="haven-nav flex min-h-0 flex-col space-y-1 overflow-y-auto">
        {navigationItems.map(({ label, to, icon: Icon, secondary }, index) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `haven-nav-link ${isActive ? 'is-active' : ''} ${secondary && !navigationItems[index - 1]?.secondary ? '!mt-4' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <span className="haven-nav-icon"><Icon size={18} strokeWidth={1.8} aria-hidden="true" /></span>
                <span className="flex-1">{label}</span>
                {isActive && <span className="haven-active-dot" aria-hidden="true" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="haven-sidebar-bottom">
        <div className="haven-tip">
          <span className="haven-tip-icon"><Sparkles size={16} aria-hidden="true" /></span>
          <p className="font-semibold text-sm">A little more focus.</p>
          <p className="mt-1 text-xs leading-5 text-muted">Keep your content, calendar and follow-ups in one calm workspace.</p>
          <Link to="/calendar" className="haven-tip-link">View your plan <span aria-hidden="true">→</span></Link>
        </div>
        <Link to="/content?new=1" className="haven-create-button"><Plus size={17} aria-hidden="true" /> Create a post</Link>
        <div className="haven-local-note"><span className="haven-status-dot" aria-hidden="true" /> Your work is saved in this browser</div>
      </div>
    </aside>
  )
}
export default Sidebar
