// Checks for the values typed into forms.
//
// Each function returns:
//   errors   { fieldName: "message" } (empty when everything is fine)
//   values   the cleaned values to save (trimmed, with defaults applied)
// Forms show each message next to its field, and the same checks run in tests.

import {
  FORM_LIMITS,
  INTERACTION_STATUSES,
  PLATFORMS,
  POST_STATUSES,
} from './constants.js'
import { DEFAULT_BRAND_COLOUR } from '../utils/colour.js'
import { isValidDateKey, isValidDateTimeValue } from '../utils/dates.js'

const HEX_COLOUR = /^#[0-9a-f]{6}$/i
const clean = (value) => (typeof value === 'string' ? value.trim() : '')

export function validateBrand(input, { brands = [], editingId = null } = {}) {
  const errors = {}
  const name = clean(input.name)
  const industry = clean(input.industry)

  if (!name) {
    errors.name = 'Enter a brand or client name.'
  } else if (name.length > FORM_LIMITS.brandName) {
    errors.name = `Keep the name under ${FORM_LIMITS.brandName} characters.`
  } else if (brands.some((brand) => brand.id !== editingId && brand.name.toLowerCase() === name.toLowerCase())) {
    errors.name = 'A brand with this name already exists.'
  }
  if (industry.length > FORM_LIMITS.industry) {
    errors.industry = `Keep this under ${FORM_LIMITS.industry} characters.`
  }

  const accounts = []
  for (const account of input.accounts || []) {
    if (!PLATFORMS.includes(account.platform)) continue
    const handle = clean(account.handle)
    if (handle.length > FORM_LIMITS.handle) {
      errors[`handle-${account.platform}`] = `Keep the handle under ${FORM_LIMITS.handle} characters.`
    }
    accounts.push({ platform: account.platform, handle, connected: false })
  }

  return {
    errors,
    values: {
      name,
      industry,
      color: HEX_COLOUR.test(clean(input.color)) ? clean(input.color).toLowerCase() : DEFAULT_BRAND_COLOUR,
      accounts,
    },
  }
}

export function validatePost(input) {
  const errors = {}
  const title = clean(input.title)
  const caption = clean(input.caption)
  const scheduledAt = clean(input.scheduledAt)

  if (!title && !caption) errors.title = 'Add a title or some post text.'
  if (title.length > FORM_LIMITS.postTitle) errors.title = `Keep the title under ${FORM_LIMITS.postTitle} characters.`
  if (caption.length > FORM_LIMITS.caption) errors.caption = `Keep the text under ${FORM_LIMITS.caption} characters.`
  if (!PLATFORMS.includes(input.platform)) errors.platform = 'Choose a platform.'
  if (!POST_STATUSES.includes(input.status)) errors.status = 'Choose a status.'

  if (scheduledAt && !isValidDateTimeValue(scheduledAt)) {
    errors.scheduledAt = 'Enter a valid date and time.'
  } else if (input.status === 'Planned' && !scheduledAt) {
    errors.scheduledAt = 'Choose a date and time for a planned post.'
  }

  return {
    errors,
    values: {
      title: title || (caption ? 'Untitled post' : ''),
      caption,
      brandId: clean(input.brandId),
      platform: input.platform,
      status: input.status,
      scheduledAt,
    },
  }
}

export function validateInteraction(input) {
  const errors = {}
  const person = clean(input.person)
  const message = clean(input.message)
  const notes = clean(input.notes)
  const followUpDate = clean(input.followUpDate)

  if (!person) errors.person = 'Enter the person or account name.'
  else if (person.length > FORM_LIMITS.person) errors.person = `Keep this under ${FORM_LIMITS.person} characters.`
  if (!message) errors.message = 'Enter the message or comment.'
  else if (message.length > FORM_LIMITS.message) errors.message = `Keep this under ${FORM_LIMITS.message} characters.`
  if (notes.length > FORM_LIMITS.notes) errors.notes = `Keep this under ${FORM_LIMITS.notes} characters.`
  if (!PLATFORMS.includes(input.platform)) errors.platform = 'Choose a platform.'
  if (!INTERACTION_STATUSES.includes(input.status)) errors.status = 'Choose a status.'
  if (followUpDate && !isValidDateKey(followUpDate)) errors.followUpDate = 'Enter a valid date.'

  return {
    errors,
    values: {
      person,
      platform: input.platform,
      brandId: clean(input.brandId),
      message,
      status: input.status,
      followUpDate,
      notes,
    },
  }
}

export function validateWorkspaceName(value) {
  const name = clean(value)
  if (!name) return { error: 'Workspace name cannot be empty.', value: '' }
  if (name.length > FORM_LIMITS.workspaceName) {
    return { error: `Keep the name under ${FORM_LIMITS.workspaceName} characters.`, value: name }
  }
  return { error: '', value: name }
}

export const hasErrors = (errors) => Object.keys(errors).length > 0
