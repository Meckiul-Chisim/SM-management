import { useSyncExternalStore } from 'react'

// Whether the animated background is switched on. Saved in this browser only.
// A custom event keeps the Settings toggle and the layout in step on the same page.
const KEY = 'haven-ambient'
const EVENT = 'haven-ambient-change'

function read() {
  try {
    return window.localStorage.getItem(KEY) !== 'off'
  } catch {
    return true
  }
}

function subscribe(callback) {
  window.addEventListener(EVENT, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}

export function setAmbientEnabled(enabled) {
  try {
    window.localStorage.setItem(KEY, enabled ? 'on' : 'off')
  } catch {
    // Storage blocked: the choice lasts until the page reloads.
  }
  window.dispatchEvent(new Event(EVENT))
}

export function useAmbientEnabled() {
  return useSyncExternalStore(subscribe, read, () => true)
}
