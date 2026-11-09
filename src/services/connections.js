// Settings for connecting to other services, kept in this browser only.
//
// Only PUBLIC values are saved here (an OAuth client ID is meant to be public).
// Access tokens are never saved: they live in memory while an upload runs.

const KEY = 'haven-connections-v1'

// Google client IDs look like 1234567890-abc123.apps.googleusercontent.com
const GOOGLE_CLIENT_ID = /^[0-9]+-[a-z0-9_]+\.apps\.googleusercontent\.com$/i

export const isValidGoogleClientId = (value) => GOOGLE_CLIENT_ID.test(String(value || '').trim())

function read() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || '{}')
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

// A client ID can also come from the build: VITE_GOOGLE_CLIENT_ID in a .env file (or in the
// hosting project's environment variables). Vite copies VITE_ values into the page, so only
// ever put PUBLIC values there. A value saved in Settings wins over the build value.
export function getBuildGoogleClientId() {
  const value = import.meta.env?.VITE_GOOGLE_CLIENT_ID
  return isValidGoogleClientId(value) ? String(value).trim() : ''
}

export function getGoogleClientId() {
  const saved = read().googleClientId
  return isValidGoogleClientId(saved) ? saved : getBuildGoogleClientId()
}

// The ID saved in this browser through Settings (without the build value).
export function getSavedGoogleClientId() {
  const saved = read().googleClientId
  return isValidGoogleClientId(saved) ? saved : ''
}

// Returns true if the value was saved. An empty value removes the saved ID.
export function setGoogleClientId(value) {
  const trimmed = String(value || '').trim()
  if (trimmed && !isValidGoogleClientId(trimmed)) return false
  try {
    const next = { ...read(), googleClientId: trimmed }
    window.localStorage.setItem(KEY, JSON.stringify(next))
    return true
  } catch {
    return false
  }
}
