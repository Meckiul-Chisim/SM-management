import { useCallback, useEffect, useState } from 'react'
import { applyTheme, getStoredTheme, storeTheme, systemTheme } from '../utils/theme.js'

// Current theme plus a function to switch it.
//
// Until the person clicks the toggle for the first time, the app follows the
// system setting (including when it changes while the app is open). After that,
// their choice is saved and always wins.
export function useTheme() {
  const [theme, setTheme] = useState(() =>
    document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
  )

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')

    function handleSystemChange() {
      if (getStoredTheme()) return // an explicit choice always wins
      const next = systemTheme()
      applyTheme(next)
      setTheme(next)
    }

    query.addEventListener('change', handleSystemChange)
    return () => query.removeEventListener('change', handleSystemChange)
  }, [])

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark'
    storeTheme(next)
    applyTheme(next, { animate: true })
    setTheme(next)
  }, [theme])

  return { theme, toggleTheme }
}
