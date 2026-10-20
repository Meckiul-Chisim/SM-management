import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout.jsx'
import Calendar from '../pages/MarketingCalendar.jsx'
import ContentStudio from '../pages/ContentStudio.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import Inquiries from '../pages/Inquiries.jsx'
import NotFound from '../pages/NotFound.jsx'
import Properties from '../pages/Properties.jsx'
import Settings from '../pages/Settings.jsx'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'properties', element: <Properties /> },
      { path: 'content', element: <ContentStudio /> },
      { path: 'calendar', element: <Calendar /> },
      { path: 'inquiries', element: <Inquiries /> },
      { path: 'settings', element: <Settings /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])
