import { useEffect, useState } from 'react'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import Notice from '../ui/Notice.jsx'
import VideoBackground from '../ui/VideoBackground.jsx'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { useAmbientEnabled } from '../../utils/ambientPreference.js'
import CommandPalette from './CommandPalette.jsx'
import Header from './Header.jsx'
import MainContent from './MainContent.jsx'
import MobileNavigation from './MobileNavigation.jsx'
import Sidebar from './Sidebar.jsx'

function AppLayout() {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const { notice, dismissNotice, saveFailed } = useWorkspace()
  const ambientEnabled = useAmbientEnabled()

  // Ctrl/Cmd+K opens quick actions from anywhere.
  useEffect(() => {
    function onKeyDown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  // Escape closes the mobile menu and puts focus back on the button that opened it.
  useEffect(() => {
    if (!mobileNavigationOpen) return undefined
    function onKeyDown(event) {
      if (event.key !== 'Escape') return
      setMobileNavigationOpen(false)
      document.getElementById('menu-button')?.focus()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [mobileNavigationOpen])

  return (
    <div className="haven-app min-h-screen bg-canvas text-ink">
      <a className="haven-skip-link" href="#main-content">Skip to content</a>
      {/*
        The background video is fixed behind the whole app (z-0). The sidebar and
        header are frosted glass above it, so it shows through softly.
      */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        {ambientEnabled && <VideoBackground />}
        {/* A soft veil keeps text comfortable to read over moving light. */}
        <div className="absolute inset-0 bg-gradient-to-b from-canvas/10 via-canvas/40 to-canvas/70" />
      </div>
      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
      <Sidebar />
      <div className="relative z-1 min-h-screen min-w-0 pt-[4.1rem] sm:pt-18 md:pl-65">
        <Header
          onQuickActions={() => setPaletteOpen(true)}
          onMenuClick={() => setMobileNavigationOpen((open) => !open)}
          menuExpanded={mobileNavigationOpen}
        />
        <MobileNavigation
          open={mobileNavigationOpen}
          onNavigate={() => setMobileNavigationOpen(false)}
        />
        <MainContent>
          {notice && (
            <Notice tone={notice.tone} onDismiss={dismissNotice} className="mb-6">
              {notice.message}
            </Notice>
          )}
          {saveFailed && !notice && (
            <Notice tone="warning" className="mb-6">
              Your latest changes could not be saved in this browser (storage is blocked or full). Export a backup from Settings to keep your work.
            </Notice>
          )}
          <Outlet />
        </MainContent>
      </div>
      <ScrollRestoration />
    </div>
  )
}

export default AppLayout
