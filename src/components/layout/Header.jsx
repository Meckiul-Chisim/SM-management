import { Command, Menu, Search, X } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import IconButton from '../ui/IconButton.jsx'
import { useWorkspace } from '../../context/WorkspaceContext.jsx'

const pageNames = {
  '/dashboard': 'Overview',
  '/brands': 'Brands & accounts',
  '/properties': 'Brands & accounts',
  '/content': 'Content studio',
  '/calendar': 'Content calendar',
  '/engagement': 'Engagement',
  '/inquiries': 'Engagement',
  '/settings': 'Settings',
}

function Header({ onMenuClick, menuExpanded }) {
  const { data } = useWorkspace()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const initials = (data.workspaceName || 'H').trim().slice(0, 1).toUpperCase()

  function submitSearch(event) {
    event.preventDefault()
    if (!query.trim()) return
    navigate(`/content?search=${encodeURIComponent(query.trim())}`)
    setSearchOpen(false)
    setQuery('')
  }

  return (
    <header className="sticky top-0 z-10 flex h-[73px] items-center justify-between border-b border-line/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <IconButton
          label={menuExpanded ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={onMenuClick}
          aria-expanded={menuExpanded}
          aria-controls="mobile-navigation"
          className="md:hidden"
        >
          {menuExpanded ? <X size={20} /> : <Menu size={20} />}
        </IconButton>
        <div className="hidden items-center gap-2 text-sm sm:flex">
          <span className="text-muted/60">Workspace</span>
          <span className="text-faint">/</span>
          <span className="font-semibold text-ink">{pageNames[location.pathname] || 'Workspace'}</span>
        </div>
        <span className="text-sm font-semibold text-ink sm:hidden">{pageNames[location.pathname] || 'Workspace'}</span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {searchOpen ? (
          <form onSubmit={submitSearch} className="flex items-center gap-2">
            <input
              autoFocus
              className="field !min-h-10 w-36 !py-2 text-sm sm:w-56"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Escape') { setSearchOpen(false); setQuery('') } }}
              placeholder="Search your content"
              aria-label="Search content"
            />
            <IconButton label="Close search" onClick={() => { setSearchOpen(false); setQuery('') }}><X size={18} /></IconButton>
          </form>
        ) : (
          <IconButton label="Search content" onClick={() => setSearchOpen(true)} className="hidden sm:inline-flex">
            <Search size={18} />
          </IconButton>
        )}
        <IconButton label="Open content search" onClick={() => { setSearchOpen(true); if (window.innerWidth < 640) setQuery('') }} className="sm:hidden">
          <Search size={18} />
        </IconButton>
        <div className="mx-1 hidden h-7 w-px bg-line sm:block" />
        <span className="hidden items-center gap-2 rounded-lg border border-line bg-surface/70 px-2.5 py-1.5 text-xs font-medium text-muted md:inline-flex">
          <Command size={13} /> Local mode
        </span>
        <button type="button" onClick={() => navigate('/settings')} aria-label="Workspace settings" className="flex size-10 items-center justify-center rounded-full border border-brand-100 bg-brand-50 text-sm font-bold text-brand-800 transition hover:border-brand-100 hover:bg-brand-100">
          {initials}
        </button>
      </div>
    </header>
  )
}

export default Header
