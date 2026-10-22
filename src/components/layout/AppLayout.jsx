import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AmbientBackground from '../ui/AmbientBackground.jsx'
import Header from './Header.jsx'
import MainContent from './MainContent.jsx'
import MobileNavigation from './MobileNavigation.jsx'
import Sidebar from './Sidebar.jsx'

// Strong at the top, where the page is mostly empty, and soft further down,
// where lists and forms need to stay easy to read.
const SCENE_FADE = 'linear-gradient(to bottom, #000 0%, #000 25%, rgba(0,0,0,0.22) 60%, rgba(0,0,0,0.1) 100%)'

function AppLayout() {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false)

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {/*
        The ambient scene is fixed behind the whole app (z-0). It sits to the
        right of the sidebar on desktop, and everything else is raised above it.
      */}
      <div
        className="pointer-events-none fixed inset-y-0 right-0 left-0 z-0 overflow-hidden md:left-60"
        style={{ maskImage: SCENE_FADE, WebkitMaskImage: SCENE_FADE }}
        aria-hidden="true"
      >
        <AmbientBackground />
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
          <Outlet />
        </MainContent>
      </div>
    </div>
  )
}

export default AppLayout
