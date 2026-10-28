// Saving and loading the workspace in the browser (localStorage).
//
// Things that can go wrong, and what happens:
//   storage blocked or full      the app keeps working for this visit and warns that
//                                changes are not being saved.
//   saved data is not valid JSON a copy is kept under RECOVERY_KEY, then sample data loads.
//   some saved records are bad   those records are left out; a copy of the original is
//                                kept under RECOVERY_KEY first.
// Saved data is never overwritten before a recovery copy has been attempted.

import { RECOVERY_KEY, SCHEMA_VERSION, STORAGE_KEY } from './constants.js'
import { createSampleWorkspace } from './sampleData.js'
import { normalizeWorkspace } from './workspaceSchema.js'

// Accessing localStorage can throw (private mode, blocked cookies), so it is wrapped.
export function getBrowserStorage() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function keepRecoveryCopy(storage, raw) {
  try {
    storage.setItem(RECOVERY_KEY, raw)
    return true
  } catch {
    return false
  }
}

const UNAVAILABLE_NOTICE = {
  tone: 'warning',
  message: 'This browser is blocking storage, so changes will not be saved. Export a backup from Settings to keep your work.',
}

// Returns { data, notice }. `notice` is null, or { tone, message } to show the person.
export function loadWorkspace(storage = getBrowserStorage(), now = new Date()) {
  if (!storage) return { data: createSampleWorkspace(now), notice: UNAVAILABLE_NOTICE }

  let raw
  try {
    raw = storage.getItem(STORAGE_KEY)
  } catch {
    return { data: createSampleWorkspace(now), notice: UNAVAILABLE_NOTICE }
  }

  // First visit: start with the sample workspace.
  if (raw === null) return { data: createSampleWorkspace(now), notice: null }

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    const kept = keepRecoveryCopy(storage, raw)
    return {
      data: createSampleWorkspace(now),
      notice: {
        tone: 'warning',
        message: `Your saved workspace could not be read, so sample data was loaded.${kept ? ' A copy of the unreadable data was kept in this browser.' : ''}`,
      },
    }
  }

  const { data, errors } = normalizeWorkspace(parsed, { now })

  if (!data) {
    const kept = keepRecoveryCopy(storage, raw)
    return {
      data: createSampleWorkspace(now),
      notice: {
        tone: 'warning',
        message: `Your saved workspace is not in a format this version understands, so sample data was loaded.${kept ? ' A copy of the original was kept in this browser.' : ''}`,
      },
    }
  }

  if (errors.length > 0) {
    const kept = keepRecoveryCopy(storage, raw)
    return {
      data,
      notice: {
        tone: 'warning',
        message: `${errors.length} saved ${errors.length === 1 ? 'record' : 'records'} could not be read and ${errors.length === 1 ? 'was' : 'were'} left out.${kept ? ' A copy of the original was kept in this browser.' : ''}`,
      },
    }
  }

  return { data, notice: null }
}

// Returns { ok: true } or { ok: false }.
export function saveWorkspace(data, storage = getBrowserStorage()) {
  if (!storage) return { ok: false }
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: SCHEMA_VERSION, ...data }))
    return { ok: true }
  } catch {
    return { ok: false }
  }
}
