import { describe, expect, it } from 'vitest'
import { buildBackup, backupFilename, parseBackup } from './backup.js'
import { RECOVERY_KEY, STORAGE_KEY } from './constants.js'
import { createSampleWorkspace } from './sampleData.js'
import { loadWorkspace, saveWorkspace } from './storage.js'
import { validateBrand, validatePost, validateInteraction } from './validators.js'
import { countBrandRecords, workspaceReducer } from './workspaceReducer.js'
import { normalizeWorkspace } from './workspaceSchema.js'

const NOW = new Date(2026, 9, 23, 12, 0)

function memoryStorage(initial = {}) {
  const map = new Map(Object.entries(initial))
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    map,
  }
}

describe('persistence', () => {
  it('loads sample data on first visit', () => {
    const { data, notice } = loadWorkspace(memoryStorage(), NOW)
    expect(notice).toBeNull()
    expect(data.brands.every((brand) => brand.isSample)).toBe(true)
  })

  it('saves and reloads the same workspace', () => {
    const storage = memoryStorage()
    const data = createSampleWorkspace(NOW)
    expect(saveWorkspace(data, storage).ok).toBe(true)
    expect(loadWorkspace(storage, NOW).data.posts).toHaveLength(data.posts.length)
  })

  it('keeps a recovery copy when saved data is corrupt', () => {
    const storage = memoryStorage({ [STORAGE_KEY]: '{not json' })
    const { data, notice } = loadWorkspace(storage, NOW)
    expect(data.brands.length).toBeGreaterThan(0)
    expect(notice.tone).toBe('warning')
    expect(storage.map.get(RECOVERY_KEY)).toBe('{not json')
  })

  it('reports when storage is unavailable or full', () => {
    expect(loadWorkspace(null, NOW).notice).not.toBeNull()
    const full = { setItem: () => { throw new Error('quota') } }
    expect(saveWorkspace(createSampleWorkspace(NOW), full).ok).toBe(false)
  })
})

describe('brands', () => {
  it('validates and rejects duplicate names', () => {
    const brands = createSampleWorkspace(NOW).brands
    expect(validateBrand({ name: '  ' }).errors.name).toBeTruthy()
    expect(validateBrand({ name: 'northstar studio' }, { brands }).errors.name).toMatch(/already exists/)
    expect(validateBrand({ name: 'Fresh Co', accounts: [{ platform: 'Instagram', handle: ' @fresh ' }] }).values.accounts[0])
      .toEqual({ platform: 'Instagram', handle: '@fresh', connected: false })
  })

  it('deletes a brand but keeps its posts as General by default', () => {
    const data = createSampleWorkspace(NOW)
    const counts = countBrandRecords(data, 'brand-northstar')
    expect(counts.posts).toBe(2)
    const next = workspaceReducer(data, { type: 'brand/delete', id: 'brand-northstar' })
    expect(next.brands.find((brand) => brand.id === 'brand-northstar')).toBeUndefined()
    expect(next.posts).toHaveLength(data.posts.length)
    expect(next.posts.find((post) => post.id === 'post-welcome').brandId).toBe('')
  })

  it('can delete a brand together with its records', () => {
    const data = createSampleWorkspace(NOW)
    const next = workspaceReducer(data, { type: 'brand/delete', id: 'brand-northstar', removeRecords: true })
    expect(next.posts.some((post) => post.brandId === 'brand-northstar')).toBe(false)
    expect(next.posts).toHaveLength(data.posts.length - 2)
  })

  it('removes only sample records', () => {
    let data = createSampleWorkspace(NOW)
    data = workspaceReducer(data, { type: 'post/add', post: { id: 'mine', title: 'Mine', caption: '', brandId: 'brand-sunday', platform: 'Instagram', status: 'Draft', scheduledAt: '' } })
    const next = workspaceReducer(data, { type: 'workspace/removeSample' })
    expect(next.brands).toHaveLength(0)
    expect(next.posts.map((post) => post.id)).toEqual(['mine'])
    expect(next.posts[0].brandId).toBe('')
  })
})

describe('posts', () => {
  it('requires a date for planned posts and rejects impossible dates', () => {
    const base = { title: 'Hi', caption: '', platform: 'Instagram', status: 'Planned' }
    expect(validatePost({ ...base, scheduledAt: '' }).errors.scheduledAt).toBeTruthy()
    expect(validatePost({ ...base, scheduledAt: '2026-02-30T10:00' }).errors.scheduledAt).toBeTruthy()
    expect(validatePost({ ...base, scheduledAt: '2028-02-29T10:00' }).errors).toEqual({})
  })

  it('updates a post and stamps updatedAt', () => {
    const data = createSampleWorkspace(NOW)
    const next = workspaceReducer(data, { type: 'post/update', id: 'post-welcome', changes: { status: 'Ready' }, updatedAt: 'later' })
    const post = next.posts.find((item) => item.id === 'post-welcome')
    expect(post.status).toBe('Ready')
    expect(post.updatedAt).toBe('later')
  })
})

describe('follow-ups', () => {
  it('requires person and message', () => {
    const { errors } = validateInteraction({ person: '', message: '', platform: 'Instagram', status: 'Unread' })
    expect(Object.keys(errors).sort()).toEqual(['message', 'person'])
  })
})

describe('export and import', () => {
  it('round-trips a backup', () => {
    const data = createSampleWorkspace(NOW)
    const result = parseBackup(JSON.stringify(buildBackup(data, NOW)), { now: NOW })
    expect(result.ok).toBe(true)
    expect(result.summary.posts).toBe(data.posts.length)
  })

  it('names backups with the local date', () => {
    expect(backupFilename('My Studio!', new Date(2026, 0, 2, 0, 10))).toBe('my-studio-backup-2026-01-02.json')
    expect(backupFilename('', NOW)).toBe('workspace-backup-2026-10-23.json')
  })

  it.each([
    ['empty file', ''],
    ['not JSON', 'hello'],
    ['array', '[]'],
    ['wrong app', JSON.stringify({ app: 'other', schemaVersion: 1, brands: [], posts: [], interactions: [] })],
    ['newer schema', JSON.stringify({ app: 'haven-social-workspace', schemaVersion: 99, brands: [], posts: [], interactions: [] })],
    ['missing arrays', JSON.stringify({ app: 'haven-social-workspace', schemaVersion: 1, brands: [] })],
  ])('rejects %s', (_label, text) => {
    const result = parseBackup(text, { now: NOW })
    expect(result.ok).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('rejects a backup containing a bad record without replacing anything', () => {
    const backup = buildBackup(createSampleWorkspace(NOW), NOW)
    backup.posts[0].platform = 'MySpace'
    expect(parseBackup(JSON.stringify(backup), { now: NOW }).ok).toBe(false)
  })

  it('repairs minor problems and reports them as warnings', () => {
    const backup = buildBackup(createSampleWorkspace(NOW), NOW)
    backup.posts[0].scheduledAt = '2026-13-45T10:00'
    const result = parseBackup(JSON.stringify(backup), { now: NOW })
    expect(result.ok).toBe(true)
    expect(result.warnings.length).toBeGreaterThan(0)
    expect(result.data.posts[0].scheduledAt).toBe('')
  })

  it('never imports connected social accounts', () => {
    const backup = buildBackup(createSampleWorkspace(NOW), NOW)
    backup.brands[0].accounts[0].connected = true
    const result = parseBackup(JSON.stringify(backup), { now: NOW })
    expect(result.data.brands[0].accounts.every((account) => account.connected === false)).toBe(true)
  })
})

describe('normalizeWorkspace', () => {
  it('rejects non-objects', () => {
    expect(normalizeWorkspace(null).data).toBeNull()
  })
})
