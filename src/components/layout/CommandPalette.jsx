import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CornerDownLeft, FileText, Moon, Plus, Search, Sun, UserPlus, MessageSquarePlus } from 'lucide-react'
import Modal from '../ui/Modal.jsx'
import { navigationItems } from '../../app/navigation.js'
import { useTheme } from '../../hooks/useTheme.js'
import { useWorkspace } from '../../hooks/useWorkspace.js'

// Quick actions: Ctrl/Cmd+K from anywhere. Type to filter, arrow keys to move,
// Enter to run, Escape to close. It is a standard combobox + listbox, so it works
// with a keyboard and with screen readers.
function CommandPalette({ onClose }) {
  const navigate = useNavigate()
  const { data } = useWorkspace()
  const { theme, toggleTheme } = useTheme()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const listId = useId()
  const listRef = useRef(null)

  const items = useMemo(() => {
    const actions = [
      { id: 'new-post', label: 'New post', hint: 'Create', icon: Plus, run: () => navigate('/content?new=1') },
      { id: 'new-brand', label: 'Add a brand', hint: 'Create', icon: UserPlus, run: () => navigate('/brands?new=1') },
      { id: 'new-followup', label: 'Log an interaction', hint: 'Create', icon: MessageSquarePlus, run: () => navigate('/engagement?new=1') },
      { id: 'theme', label: theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme', hint: 'Appearance', icon: theme === 'dark' ? Sun : Moon, run: toggleTheme },
    ]
    const pages = navigationItems.map(({ label, to, icon }) => ({ id: `go-${to}`, label: `Go to ${label}`, hint: 'Page', icon, run: () => navigate(to) }))
    const q = query.trim().toLowerCase()
    const posts = q
      ? data.posts
          .filter((post) => `${post.title} ${post.caption}`.toLowerCase().includes(q))
          .slice(0, 5)
          .map((post) => ({ id: `post-${post.id}`, label: post.title, hint: `Post · ${post.status}`, icon: FileText, run: () => navigate(`/content?post=${post.id}`) }))
      : []
    const base = [...actions, ...pages].filter((item) => !q || item.label.toLowerCase().includes(q))
    return [...base, ...posts]
  }, [query, data.posts, theme, toggleTheme, navigate])

  // Keep the highlighted row valid and in view as the list changes.
  const current = Math.min(active, Math.max(items.length - 1, 0))
  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView?.({ block: 'nearest' })
  }, [current, items])

  function run(item) {
    onClose()
    item.run()
  }

  function onKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive(Math.min(current + 1, items.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive(Math.max(current - 1, 0))
    } else if (event.key === 'Enter' && items[current]) {
      event.preventDefault()
      run(items[current])
    }
  }

  return (
    <Modal title="Quick actions" description="Jump to a page, create something, or find a post." onClose={onClose} dismissOnBackdrop>
      <div className="relative">
        <Search size={17} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
        <input
          data-autofocus
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={items[current] ? `${listId}-${items[current].id}` : undefined}
          aria-label="Search actions, pages and posts"
          className="field !pl-10"
          placeholder="Type to search…"
          value={query}
          onChange={(event) => { setQuery(event.target.value); setActive(0) }}
          onKeyDown={onKeyDown}
          autoComplete="off"
        />
      </div>
      <ul ref={listRef} id={listId} role="listbox" aria-label="Results" className="mt-3 max-h-[50dvh] space-y-0.5 overflow-y-auto">
        {items.map((item, index) => {
          const Icon = item.icon
          const selected = index === current
          return (
            <li
              key={item.id}
              id={`${listId}-${item.id}`}
              role="option"
              aria-selected={selected}
              onMouseMove={() => setActive(index)}
              onClick={() => run(item)}
              className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 text-sm transition-colors ${selected ? 'bg-brand-50 text-ink' : 'text-muted'}`}
            >
              <Icon size={16} aria-hidden="true" className={selected ? 'text-gold-ink' : ''} />
              <span className="min-w-0 flex-1 truncate font-medium">{item.label}</span>
              <span className="text-xs text-faint">{item.hint}</span>
              {selected && <CornerDownLeft size={14} aria-hidden="true" className="text-faint" />}
            </li>
          )
        })}
        {items.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted">Nothing matches “{query}”.</li>}
      </ul>
    </Modal>
  )
}

export default CommandPalette
