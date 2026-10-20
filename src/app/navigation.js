import {
  Building2,
  CalendarDays,
  LayoutDashboard,
  MessageSquareText,
  Settings2,
  Sparkles,
} from 'lucide-react'

export const navigationItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Properties', to: '/properties', icon: Building2 },
  { label: 'Content studio', to: '/content', icon: Sparkles },
  { label: 'Marketing calendar', to: '/calendar', icon: CalendarDays },
  { label: 'Inquiries', to: '/inquiries', icon: MessageSquareText },
  { label: 'Settings', to: '/settings', icon: Settings2 },
]
