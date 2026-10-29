import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AmbientBackground from '../ui/AmbientBackground.jsx'
import Header from './Header.jsx'
import MainContent from './MainContent.jsx'
import MobileNavigation from './MobileNavigation.jsx'
import Sidebar from './Sidebar.jsx'

const SIDEBAR_WIDTH = '16.25rem'
const SCENE_FADE = 'linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.18) 75%, rgba(0,0,0,0) 100%)'

function AppLayout() {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false)

  function closeMobileNavigation() {
    setMobileNavigationOpen(false)
  }

  return (
    <div className="haven-app min-h-screen bg-canvas text-ink">
      <a className="haven-skip-link" href="#main-content">Skip to content</a>
      <div
        className="pointer-events-none fixed inset-y-0 right-0 left-0 z-0 overflow-hidden md:left-[16.25rem]"
        style={{ maskImage: SCENE_FADE, WebkitMaskImage: SCENE_FADE }}
        aria-hidden="true"
      >
        <AmbientBackground />
      </div>
      <Sidebar />
      <div className="relative z-[1] min-h-screen min-w-0 md:pl-[16.25rem]">
        <Header
          onMenuClick={() => setMobileNavigationOpen((open) => !open)}
          menuExpanded={mobileNavigationOpen}
        />
        <MobileNavigation
          open={mobileNavigationOpen}
          onNavigate={closeMobileNavigation}
        />
        <MainContent>
          <Outlet />
        </MainContent>
      </div>
    </div>
  )
}

export default AppLayout
