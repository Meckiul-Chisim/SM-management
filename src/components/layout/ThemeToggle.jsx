import { Moon, Sun } from 'lucide-react'
import IconButton from '../ui/IconButton.jsx'
import { useTheme } from '../../hooks/useTheme.js'

// Header button that switches between the light and dark theme.
// The label names the action (what will happen), which is what screen readers need.
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <IconButton label={isDark ? 'Switch to light theme' : 'Switch to dark theme'} onClick={toggleTheme}>
      {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </IconButton>
  )
}

export default ThemeToggle
