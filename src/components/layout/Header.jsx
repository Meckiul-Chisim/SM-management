import { Menu, Search, X } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import IconButton from '../ui/IconButton.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import { useWorkspace } from '../../hooks/useWorkspace.js'

const pageNames = {
  '/dashboard': 'Dashboard',
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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const initial = (data.workspaceName || 'H').trim().slice(0, 1).toUpperCase()

  function submitSearch(event) {
    event.preventDefault()
    if (!query.trim()) return
    navigate(`/content?search=${encodeURIComponent(query.trim())}`)
    setMobileSearchOpen(false)
    setQuery('')
  }

  function closeSearch() {
    setMobileSearchOpen(false)
    setQuery('')
  }

  const searchField = (
    <label className="relative block w-full">
      <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
      <input
        autoFocus={mobileSearchOpen}
        className="field !min-h-10 !bg-surface !py-2 !pl-9 text-sm"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => { if (event.key === 'Escape') closeSearch() }}
        placeholder="Search posts"
        aria-label="Search posts"
      />
    </label>
  )

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-line bg-panel/95 px-4 backdrop-blur sm:px-7 lg:px-9">
      <IconButton
        label={menuExpanded ? 'Close navigation menu' : 'Open navigation menu'}
        onClick={onMenuClick}
        aria-expanded={menuExpanded}
        aria-controls="mobile-navigation"
        className="md:hidden"
      >
        {menuExpanded ? <X size={20} /> : <Menu size={20} />}
      </IconButton>

      {mobileSearchOpen ? (
        <form onSubmit={submitSearch} className="flex flex-1 items-center gap-2 sm:hidden">
          {searchField}
          <IconButton label="Close search" onClick={closeSearch}><X size={18} /></IconButton>
        </form>
      ) : (
        <span className="font-display text-base font-semibold tracking-tight text-ink sm:hidden">
          {pageNames[location.pathname] || 'Haven'}
        </span>
      )}

      <form onSubmit={submitSearch} className="hidden w-full max-w-sm sm:block">
        {searchField}
      </form>

      <div className="ml-auto flex items-center gap-2">
        {!mobileSearchOpen && (
          <IconButton label="Search posts" onClick={() => setMobileSearchOpen(true)} className="sm:hidden">
            <Search size={18} />
          </IconButton>
        )}
        <ThemeToggle />
        <button
          type="button"
          onClick={() => navigate('/settings')}
          aria-label="Workspace settings"
          className="flex size-9 items-center justify-center rounded-full bg-brand-50 font-display text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-100"
        >
          {initial}
        </button>
      </div>
    </header>
  )
}

export default Header
