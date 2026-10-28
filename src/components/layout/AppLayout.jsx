import { useEffect, useState } from 'react'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import Notice from '../ui/Notice.jsx'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import AmbientBackground from '../ui/AmbientBackground.jsx'
import Header from './Header.jsx'
import MainContent from './MainContent.jsx'
import MobileNavigation from './MobileNavigation.jsx'
import Sidebar from './Sidebar.jsx'
import { useAmbientEnabled } from '../../utils/ambientPreference.js'

// Strong at the top, where the page is mostly empty, and soft further down,
// where lists and forms need to stay easy to read.
const SCENE_FADE = 'linear-gradient(to bottom, #000 0%, #000 25%, rgba(0,0,0,0.22) 60%, rgba(0,0,0,0.1) 100%)'

function AppLayout() {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false)
  const { notice, dismissNotice, saveFailed } = useWorkspace()
  const ambientEnabled = useAmbientEnabled()

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
    <div className="min-h-screen bg-canvas text-ink">
      <a
        href="#main"
        className="sr-only z-[70] rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-on-brand focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Skip to main content
      </a>
      {/*
        The ambient scene is fixed behind the whole app (z-0). It sits to the
        right of the sidebar on desktop, and everything else is raised above it.
      */}
      <div
        className="pointer-events-none fixed inset-y-0 right-0 left-0 z-0 overflow-hidden md:left-60"
        style={{ maskImage: SCENE_FADE, WebkitMaskImage: SCENE_FADE }}
        aria-hidden="true"
      >
        {ambientEnabled && <AmbientBackground />}
      </div>
      <Sidebar />
      <div className="relative z-[1] min-h-screen min-w-0 md:pl-60">
        <Header
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
