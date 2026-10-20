import {
  CalendarDays,
  LayoutDashboard,
  MessageSquareText,
  Settings2,
  Sparkles,
  UsersRound,
} from 'lucide-react'

export const navigationItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Brands & accounts', to: '/brands', icon: UsersRound },
  { label: 'Content studio', to: '/content', icon: Sparkles },
  { label: 'Content calendar', to: '/calendar', icon: CalendarDays },
  { label: 'Engagement', to: '/engagement', icon: MessageSquareText },
  { label: 'Settings', to: '/settings', icon: Settings2 },
]
