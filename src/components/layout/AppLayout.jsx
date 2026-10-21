import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header.jsx'
import MainContent from './MainContent.jsx'
import MobileNavigation from './MobileNavigation.jsx'
import Sidebar from './Sidebar.jsx'

function AppLayout() {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false)

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Sidebar />
      <div className="min-h-screen min-w-0 md:pl-60">
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
