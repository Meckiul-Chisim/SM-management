// Theme helpers.
//
// The active theme is the data-theme attribute on <html> ("light" or "dark").
// The colour tokens in styles/index.css react to it, so no component needs to
// know which theme is active.
//
// The same rules also run once in index.html, before the page paints, so there
// is no flash of the wrong theme. Keep that script and this file in sync.

export const THEME_STORAGE_KEY = 'haven-theme'

// Browser UI colour on phones (the address bar), per theme.
const THEME_COLOURS = { light: '#f6f7f3', dark: '#0f1613' }

// The theme the person chose, or null if they have not chosen one yet.
export function getStoredTheme() {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

export function storeTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Storage can be blocked (private mode). The choice then lasts for this visit only.
  }
}

export function systemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Applies a theme. With `animate`, colours fade for a moment instead of jumping
// (skipped when the person prefers reduced motion).
export function applyTheme(theme, { animate = false } = {}) {
  const root = document.documentElement

  if (animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('theme-transition')
    window.setTimeout(() => root.classList.remove('theme-transition'), 300)
  }

  root.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOURS[theme])
}
