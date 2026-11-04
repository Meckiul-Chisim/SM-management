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

export function getGoogleClientId() {
  const value = read().googleClientId
  return isValidGoogleClientId(value) ? value : ''
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
