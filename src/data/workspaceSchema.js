// The shape of a workspace, and the checks that keep bad data out.
//
// normalizeWorkspace() is used in two places:
//   - when reading saved data from the browser, and
//   - when importing a backup file.
// It returns clean data plus two lists:
//   errors    records that could not be used (they are left out).
//   warnings  small repairs that were made (for example a brand reference that no
//             longer exists was cleared).
// The caller decides what to do. An import is rejected if there are any errors.

import {
  APP_ID,
  DEFAULT_WORKSPACE_NAME,
  INTERACTION_STATUSES,
  LEGACY_SAMPLE_IDS,
  LIMITS,
  PLATFORMS,
  POST_STATUSES,
  SCHEMA_VERSION,
} from './constants.js'
import { DEFAULT_BRAND_COLOUR } from '../utils/colour.js'
import { isValidDateKey, isValidDateTimeValue } from '../utils/dates.js'

const HEX_COLOUR = /^#[0-9a-f]{6}$/i
const LEGACY_SAMPLE_ID_SET = new Set(LEGACY_SAMPLE_IDS)

const isPlainObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value)
const text = (value) => (typeof value === 'string' ? value.trim() : '')
const isIsoDate = (value) => typeof value === 'string' && !Number.isNaN(Date.parse(value))

export function createEmptyWorkspace() {
  return { workspaceName: DEFAULT_WORKSPACE_NAME, brands: [], posts: [], interactions: [] }
}

// Reads a record's id and makes sure it is usable and not already taken.
function readId(input, label, seenIds, context) {
  const id = text(input.id)
  if (!id || id.length > LIMITS.id) {
    context.errors.push(`${label}: it has no valid id.`)
    return null
  }
  if (seenIds.has(id)) {
    context.errors.push(`${label}: its id is used by another record.`)
    return null
  }
  seenIds.add(id)
  return id
}

function normalizeBrand(input, index, seenIds, context) {
  const label = `Brand ${index + 1}`
  if (!isPlainObject(input)) {
    context.errors.push(`${label} is not a valid record.`)
    return null
  }

  const name = text(input.name)
  if (!name) {
    context.errors.push(`${label}: the name is missing.`)
    return null
  }
  if (name.length > LIMITS.brandName) {
    context.errors.push(`${label} ("${name.slice(0, 30)}…"): the name is too long.`)
    return null
  }
  const id = readId(input, `${label} ("${name}")`, seenIds, context)
  if (!id) return null

  const industry = text(input.industry)
  if (industry.length > LIMITS.industry) {
    context.errors.push(`${label} ("${name}"): the industry is too long.`)
    return null
  }

  // Profiles are references only, so "connected" is always false.
  const accounts = []
  const seenPlatforms = new Set()
  for (const account of Array.isArray(input.accounts) ? input.accounts : []) {
    if (!isPlainObject(account) || !PLATFORMS.includes(account.platform)) {
      context.warnings.push(`${label} ("${name}"): a profile on an unsupported platform was skipped.`)
      continue
    }
    if (seenPlatforms.has(account.platform)) {
      context.warnings.push(`${label} ("${name}"): a duplicate ${account.platform} profile was skipped.`)
      continue
    }
    seenPlatforms.add(account.platform)
    accounts.push({
      platform: account.platform,
      handle: text(account.handle).slice(0, LIMITS.handle),
      connected: false,
    })
  }

  return {
    id,
    name,
    industry,
    color: HEX_COLOUR.test(text(input.color)) ? text(input.color).toLowerCase() : DEFAULT_BRAND_COLOUR,
    accounts,
    createdAt: isIsoDate(input.createdAt) ? input.createdAt : context.nowIso,
    isSample: input.isSample === true || LEGACY_SAMPLE_ID_SET.has(id),
  }
}

// A reference to a brand that does not exist is cleared (the record stays in "General workspace").
function readBrandId(input, label, brandIds, context) {
  const brandId = text(input.brandId)
  if (!brandId) return ''
  if (brandIds.has(brandId)) return brandId
  context.warnings.push(`${label}: its brand no longer exists, so it was moved to General workspace.`)
  return ''
}

function normalizePost(input, index, seenIds, brandIds, context) {
  const title = isPlainObject(input) ? text(input.title) : ''
  const label = `Post ${index + 1}${title ? ` ("${title.slice(0, 40)}")` : ''}`
  if (!isPlainObject(input)) {
    context.errors.push(`${label} is not a valid record.`)
    return null
  }

  const caption = text(input.caption)
  if (!title && !caption) {
    context.errors.push(`${label}: it has no title and no text.`)
    return null
  }
  if (title.length > LIMITS.postTitle || caption.length > LIMITS.caption) {
    context.errors.push(`${label}: the text is too long.`)
    return null
  }
  if (!PLATFORMS.includes(input.platform)) {
    context.errors.push(`${label}: the platform "${String(input.platform)}" is not supported.`)
    return null
  }
  if (!POST_STATUSES.includes(input.status)) {
    context.errors.push(`${label}: the status "${String(input.status)}" is not recognised.`)
    return null
  }
  const id = readId(input, label, seenIds, context)
  if (!id) return null

  let scheduledAt = typeof input.scheduledAt === 'string' ? input.scheduledAt.trim() : ''
  if (scheduledAt && !isValidDateTimeValue(scheduledAt)) {
    context.warnings.push(`${label}: its planned date was not valid and was removed.`)
    scheduledAt = ''
  }
  let status = input.status
  if (status === 'Planned' && !scheduledAt) {
    context.warnings.push(`${label}: it was planned without a date, so it was changed to Draft.`)
    status = 'Draft'
  }

  return {
    id,
    title,
    caption,
    brandId: readBrandId(input, label, brandIds, context),
    platform: input.platform,
    status,
    scheduledAt,
    createdAt: isIsoDate(input.createdAt) ? input.createdAt : context.nowIso,
    updatedAt: isIsoDate(input.updatedAt) ? input.updatedAt : context.nowIso,
    isSample: input.isSample === true || LEGACY_SAMPLE_ID_SET.has(id),
  }
}

function normalizeInteraction(input, index, seenIds, brandIds, context) {
  const person = isPlainObject(input) ? text(input.person) : ''
  const label = `Follow-up ${index + 1}${person ? ` (${person.slice(0, 40)})` : ''}`
  if (!isPlainObject(input)) {
    context.errors.push(`${label} is not a valid record.`)
    return null
  }

  const message = text(input.message)
  if (!person || !message) {
    context.errors.push(`${label}: the person or the message is missing.`)
    return null
  }
  const notes = text(input.notes)
  if (person.length > LIMITS.person || message.length > LIMITS.message || notes.length > LIMITS.notes) {
    context.errors.push(`${label}: the text is too long.`)
    return null
  }
  if (!PLATFORMS.includes(input.platform)) {
    context.errors.push(`${label}: the platform "${String(input.platform)}" is not supported.`)
    return null
  }
  if (!INTERACTION_STATUSES.includes(input.status)) {
    context.errors.push(`${label}: the status "${String(input.status)}" is not recognised.`)
    return null
  }
  const id = readId(input, label, seenIds, context)
  if (!id) return null

  let followUpDate = typeof input.followUpDate === 'string' ? input.followUpDate.trim() : ''
  if (followUpDate && !isValidDateKey(followUpDate)) {
    context.warnings.push(`${label}: its follow-up date was not valid and was removed.`)
    followUpDate = ''
  }

  return {
    id,
    person,
    platform: input.platform,
    brandId: readBrandId(input, label, brandIds, context),
    message,
    status: input.status,
    followUpDate,
    notes,
    createdAt: isIsoDate(input.createdAt) ? input.createdAt : context.nowIso,
    isSample: input.isSample === true || LEGACY_SAMPLE_ID_SET.has(id),
  }
}

// Checks and cleans a workspace (from storage or from a backup file).
// Returns { data, errors, warnings }. `data` is null when the whole thing is unusable.
export function normalizeWorkspace(raw, { now = new Date() } = {}) {
  const unusable = (message) => ({ data: null, errors: [message], warnings: [] })

  if (!isPlainObject(raw)) return unusable('This is not a workspace backup. Expected a JSON object.')
  if (raw.app !== undefined && raw.app !== APP_ID) return unusable('This file was not created by this app.')
  if (raw.schemaVersion !== undefined) {
    if (!Number.isInteger(raw.schemaVersion) || raw.schemaVersion < 1) {
      return unusable('The backup has an invalid version number.')
    }
    if (raw.schemaVersion > SCHEMA_VERSION) {
      return unusable('This backup was made by a newer version of the app and cannot be opened here.')
    }
  }
  for (const key of ['brands', 'posts', 'interactions']) {
    if (!Array.isArray(raw[key])) return unusable(`The backup is missing its "${key}" list.`)
    if (raw[key].length > LIMITS[key]) return unusable(`The backup has too many ${key} (the limit is ${LIMITS[key]}).`)
  }

  const context = { errors: [], warnings: [], nowIso: now.toISOString() }

  let workspaceName = text(raw.workspaceName)
  if (!workspaceName) {
    workspaceName = DEFAULT_WORKSPACE_NAME
  } else if (workspaceName.length > LIMITS.workspaceName) {
    workspaceName = workspaceName.slice(0, LIMITS.workspaceName)
    context.warnings.push('The workspace name was shortened.')
  }

  const brandIds = new Set()
  const brands = raw.brands
    .map((item, index) => normalizeBrand(item, index, brandIds, context))
    .filter(Boolean)

  const validBrandIds = new Set(brands.map((brand) => brand.id))
  const postIds = new Set()
  const posts = raw.posts
    .map((item, index) => normalizePost(item, index, postIds, validBrandIds, context))
    .filter(Boolean)

  const interactionIds = new Set()
  const interactions = raw.interactions
    .map((item, index) => normalizeInteraction(item, index, interactionIds, validBrandIds, context))
    .filter(Boolean)

  return {
    data: { workspaceName, brands, posts, interactions },
    errors: context.errors,
    warnings: context.warnings,
  }
}
