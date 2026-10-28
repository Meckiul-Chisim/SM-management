import {
  CalendarDays,
  LayoutDashboard,
  MessageSquareText,
  Settings2,
  Sparkles,
  UsersRound,
} from 'lucide-react'

// The product name is used for the sidebar, tab titles and the page metadata.
// "Haven" is the current working name; renaming it is an owner decision.
export const PRODUCT_NAME = 'Haven'

// One list drives the sidebar, the mobile menu, the header title and the page title.
export const navigationItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Brands & accounts', to: '/brands', icon: UsersRound },
  { label: 'Content studio', to: '/content', icon: Sparkles },
  { label: 'Content calendar', to: '/calendar', icon: CalendarDays },
  { label: 'Engagement', to: '/engagement', icon: MessageSquareText },
  { label: 'Settings', to: '/settings', icon: Settings2 },
]
