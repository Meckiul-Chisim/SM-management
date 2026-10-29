// Shared constants: allowed values for records, storage keys and size limits.
// Keeping them in one place means forms, validation and imports always agree.

export const PLATFORMS = ['Instagram', 'Facebook', 'TikTok', 'YouTube', 'LinkedIn', 'X', 'Pinterest']

export const POST_STATUSES = ['Draft', 'Ready', 'Planned', 'Published']
export const INTERACTION_STATUSES = ['Unread', 'Follow up', 'Done']

// Plain-language meaning of each post status. Shown next to the status field so
// nobody mistakes an in-app plan for a post that is scheduled on a platform.
export const POST_STATUS_HELP = {
  Draft: 'Still being written.',
  Ready: 'Written and waiting to be planned or posted.',
  Planned: 'Has a planned date in this app. Nothing is scheduled on the platform.',
  Published: 'You posted it on the platform yourself and marked it here.',
}

export const DEFAULT_WORKSPACE_NAME = 'Haven'

// Identifies backup files made by this app, and the layout of the saved data.
export const APP_ID = 'haven-social-workspace'
export const SCHEMA_VERSION = 1

export const STORAGE_KEY = 'haven-social-workspace-v1'
// If saved data cannot be read, a copy is kept here before anything is overwritten.
export const RECOVERY_KEY = `${STORAGE_KEY}:recovered`

// The limits are generous so existing content is never rejected. The forms use
// tighter limits for new text (see FORM_LIMITS).
export const LIMITS = {
  id: 100,
  workspaceName: 60,
  brandName: 80,
  industry: 80,
  handle: 100,
  postTitle: 200,
  caption: 20000,
  person: 100,
  message: 10000,
  notes: 5000,
  brands: 200,
  posts: 5000,
  interactions: 5000,
  importBytes: 5 * 1024 * 1024,
}

// What the forms allow people to type.
export const FORM_LIMITS = {
  workspaceName: 60,
  brandName: 80,
  industry: 80,
  handle: 100,
  postTitle: 120,
  caption: 5000,
  person: 100,
  message: 2000,
  notes: 1000,
  topic: 140,
  audience: 100,
  cta: 140,
}

// Typical caption limits, shown as a guide while writing. Platforms change these
// from time to time, so they are never enforced.
export const PLATFORM_CAPTION_GUIDE = {
  Instagram: 2200,
  LinkedIn: 3000,
  X: 280,
  TikTok: 2200,
  Pinterest: 500,
  YouTube: 5000,
}

// Ids of the sample records that earlier versions saved without a sample flag.
export const LEGACY_SAMPLE_IDS = [
  'brand-northstar',
  'brand-sunday',
  'post-welcome',
  'post-behind-scenes',
  'post-weekend',
  'interaction-demo',
]
