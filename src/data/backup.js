// Exporting and importing a workspace backup file (JSON).

import { APP_ID, LIMITS, SCHEMA_VERSION } from './constants.js'
import { normalizeWorkspace } from './workspaceSchema.js'
import { toDateKey } from '../utils/dates.js'

// The object that is written to a backup file.
export function buildBackup(data, now = new Date()) {
  return {
    app: APP_ID,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: now.toISOString(),
    ...data,
  }
}

// "haven-backup-2026-10-23.json". The date is the person's local date, so a backup
// made just after midnight (or before 5:30 in India) is not labelled with the wrong day.
export function backupFilename(workspaceName, now = new Date()) {
  const slug = String(workspaceName || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${slug || 'workspace'}-backup-${toDateKey(now)}.json`
}

// Reads the text of a backup file and checks it completely before anything is replaced.
// Returns { ok, data, errors, warnings, summary }.
export function parseBackup(text, { now = new Date() } = {}) {
  const failure = (message) => ({ ok: false, data: null, errors: [message], warnings: [], summary: null })

  if (typeof text !== 'string' || text.trim() === '') return failure('The file is empty.')
  if (text.length > LIMITS.importBytes) return failure('The file is too large to be a workspace backup.')

  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    return failure('This file is not valid JSON. Choose a backup that was exported from this app.')
  }

  // Saved data from earlier versions may lack these markers, but a backup file must be a
  // real export from this app, so a look-alike JSON file is rejected.
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || parsed.app !== APP_ID) {
    return failure('This file is not a backup exported from this app (the app identifier is missing or different).')
  }

  const { data, errors, warnings } = normalizeWorkspace(parsed, { now })
  if (!data || errors.length > 0) {
    return { ok: false, data: null, errors, warnings, summary: null }
  }

  return {
    ok: true,
    data,
    errors: [],
    warnings,
    summary: {
      workspaceName: data.workspaceName,
      brands: data.brands.length,
      posts: data.posts.length,
      interactions: data.interactions.length,
    },
  }
}
