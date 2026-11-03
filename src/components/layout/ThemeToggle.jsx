import { Moon, Sun } from 'lucide-react'
import IconButton from '../ui/IconButton.jsx'
import { useTheme } from '../../hooks/useTheme.js'

// One header button that flips between light and dark.
// It shows the icon of the theme you would switch TO (moon in light mode, sun in dark),
// and its label names that action, which is what screen readers need.
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const Icon = isDark ? Sun : Moon

  return (
    <IconButton
      label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={toggleTheme}
      className="haven-theme-toggle"
    >
      <Icon size={18} aria-hidden="true" />
    </IconButton>
  )
}

export default ThemeToggle
