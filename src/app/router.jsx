import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout.jsx'
import Calendar from '../pages/MarketingCalendar.jsx'
import ContentStudio from '../pages/ContentStudio.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import Engagement from '../pages/Engagement.jsx'
import NotFound from '../pages/NotFound.jsx'
import Brands from '../pages/Brands.jsx'
import Settings from '../pages/Settings.jsx'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'brands', element: <Brands /> },
      { path: 'properties', element: <Navigate to="/brands" replace /> },
      { path: 'content', element: <ContentStudio /> },
      { path: 'calendar', element: <Calendar /> },
      { path: 'engagement', element: <Engagement /> },
      { path: 'inquiries', element: <Navigate to="/engagement" replace /> },
      { path: 'settings', element: <Settings /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])
