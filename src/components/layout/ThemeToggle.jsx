import { Moon, Sun } from 'lucide-react'
import IconButton from '../ui/IconButton.jsx'
import { useTheme } from '../../hooks/useTheme.js'

// Header button that switches between the light and dark theme.
// The label names the action (what will happen), which is what screen readers need.
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="flex items-center rounded-lg border border-line bg-surface p-1" role="group" aria-label="Theme">
      <IconButton
        label="Use light theme"
        aria-pressed={!isDark}
        onClick={() => !isDark || toggleTheme()}
        className={`!size-7 !rounded-md ${!isDark ? '!bg-panel !shadow-sm !text-brand-800' : '!border-transparent !text-faint'}`}
      >
        <Sun size={15} aria-hidden="true" />
      </IconButton>
      <IconButton
        label="Use dark theme"
        aria-pressed={isDark}
        onClick={() => isDark || toggleTheme()}
        className={`!size-7 !rounded-md ${isDark ? '!bg-panel !shadow-sm !text-brand-800' : '!border-transparent !text-faint'}`}
      >
        <Moon size={15} aria-hidden="true" />
      </IconButton>
    </div>
  )
}

export default ThemeToggle
