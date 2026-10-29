import { Plus, Sparkles } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { navigationItems } from '../../app/navigation.js'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import Wordmark from './Wordmark.jsx'

function Sidebar() {
  const { data } = useWorkspace()
  return (
    <aside className="haven-sidebar fixed inset-y-0 left-0 z-30 hidden w-[16.25rem] flex-col md:flex">
      <Link to="/dashboard" className="haven-brand mb-8 block" aria-label="Go to dashboard">
        <Wordmark name={data.workspaceName || 'Haven'} />
        <span className="haven-brand-caption">SOCIAL WORKSPACE</span>
      </Link>

      <div className="haven-nav-label">WORKSPACE</div>
      <nav aria-label="Main navigation" className="haven-nav space-y-1">
        {navigationItems.map(({ label, to, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) =>
            `haven-nav-link ${isActive ? 'is-active' : ''}`
          }>
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
          <span className="haven-tip-icon"><Sparkles size={16} /></span>
          <p className="font-semibold text-sm">A little more focus.</p>
          <p className="mt-1 text-xs leading-5 text-muted">Keep your content, calendar and follow-ups in one calm workspace.</p>
          <Link to="/calendar" className="haven-tip-link">View your plan <span aria-hidden="true">→</span></Link>
        </div>
        <Link to="/content" className="haven-create-button"><Plus size={17} aria-hidden="true" /> Create a post</Link>
        <div className="haven-local-note"><span className="haven-status-dot" /> Your work is saved in this browser</div>
      </div>
    </aside>
  )
}
export default Sidebar
