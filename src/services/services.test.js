import { describe, expect, it, vi } from 'vitest'
import { getGoogleClientId, isValidGoogleClientId, setGoogleClientId } from './connections.js'
import { buildMetadata, checkVideoFile, explainFailure, sendFile, startUpload, uploadVideo } from './youtube.js'
import { normalizeWorkspace } from '../data/workspaceSchema.js'

const video = (overrides = {}) => new File(['x'.repeat(10)], 'clip.mp4', { type: 'video/mp4', ...overrides })

describe('YouTube metadata and checks', () => {
  it('cleans the title, trims long text and defaults to private', () => {
    const meta = buildMetadata({ title: `  <b>${'a'.repeat(120)}  `, caption: 'Hello <world>', privacy: 'nonsense' })
    expect(meta.snippet.title).toHaveLength(100)
    expect(meta.snippet.title).not.toMatch(/[<>]/)
    expect(meta.snippet.description).toBe('Hello world')
    expect(meta.status.privacyStatus).toBe('private')
    expect(meta.status.selfDeclaredMadeForKids).toBe(false)
  })

  it('only marks made-for-kids when the person said yes', () => {
    expect(buildMetadata({ title: 't', madeForKids: true }).status.selfDeclaredMadeForKids).toBe(true)
    expect(buildMetadata({ title: 't', madeForKids: 'yes' }).status.selfDeclaredMadeForKids).toBe(false)
  })

  it('rejects missing, non-video and empty files', () => {
    expect(checkVideoFile(null)).toMatch(/Attach a video/)
    expect(checkVideoFile(new File(['x'], 'a.png', { type: 'image/png' }))).toMatch(/needs a video/)
    expect(checkVideoFile(new File([], 'a.mp4', { type: 'video/mp4' }))).toMatch(/empty/)
    expect(checkVideoFile(video())).toBe('')
  })

  it('explains common failures in plain language', () => {
    expect(explainFailure(401)).toMatch(/sign-in expired/)
    expect(explainFailure(403, { error: { errors: [{ reason: 'quotaExceeded' }] } })).toMatch(/limit/)
    expect(explainFailure(403)).toMatch(/test user/)
    expect(explainFailure(503)).toMatch(/temporary/)
  })
})

describe('YouTube upload flow (mocked network)', () => {
  const ok = (location) => ({ ok: true, status: 200, headers: new Headers(location ? { Location: location } : {}) })

  it('starts a resumable upload with the right request', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(ok('https://upload.example/session'))
    const url = await startUpload({ accessToken: 'tok', file: video(), metadata: { snippet: {} }, fetchImpl })
    expect(url).toBe('https://upload.example/session')
    const [endpoint, init] = fetchImpl.mock.calls[0]
    expect(endpoint).toContain('uploadType=resumable')
    expect(init.method).toBe('POST')
    expect(init.headers.Authorization).toBe('Bearer tok')
    expect(init.headers['X-Upload-Content-Length']).toBe('10')
  })

  it('fails clearly when Google refuses or returns no address', async () => {
    const refused = vi.fn().mockResolvedValue({ ok: false, status: 403, json: async () => ({}) })
    await expect(startUpload({ accessToken: 't', file: video(), metadata: {}, fetchImpl: refused })).rejects.toThrow(/test user/)
    const noLocation = vi.fn().mockResolvedValue(ok(''))
    await expect(startUpload({ accessToken: 't', file: video(), metadata: {}, fetchImpl: noLocation })).rejects.toThrow(/upload address/)
  })

  // A tiny stand-in for XMLHttpRequest.
  function fakeXhr({ status = 200, response = { id: 'abc123XYZ_-' }, fail = false } = {}) {
    return class {
      constructor() { this.upload = {}; this.headers = {} }
      open() {}
      setRequestHeader(k, v) { this.headers[k] = v }
      abort() { this.onabort?.() }
      send() {
        queueMicrotask(() => {
          this.upload.onprogress?.({ lengthComputable: true, loaded: 5, total: 10 })
          if (fail) { this.onerror?.(); return }
          this.status = status
          this.responseText = JSON.stringify(response)
          this.onload?.()
        })
      }
    }
  }

  it('sends the file, reports progress and returns the video id', async () => {
    const onProgress = vi.fn()
    const result = await sendFile({ uploadUrl: 'u', file: video(), onProgress, XHR: fakeXhr() })
    expect(result.videoId).toBe('abc123XYZ_-')
    expect(onProgress).toHaveBeenCalledWith(0.5)
  })

  it('reports network and server failures', async () => {
    await expect(sendFile({ uploadUrl: 'u', file: video(), XHR: fakeXhr({ fail: true }) })).rejects.toThrow(/connection dropped/)
    await expect(sendFile({ uploadUrl: 'u', file: video(), XHR: fakeXhr({ status: 500, response: {} }) })).rejects.toThrow(/temporary/)
  })

  it('can be cancelled', async () => {
    const controller = new AbortController()
    controller.abort()
    await expect(sendFile({ uploadUrl: 'u', file: video(), signal: controller.signal, XHR: fakeXhr() })).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('runs the whole upload and builds the watch link', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(ok('https://upload.example/s'))
    const result = await uploadVideo({ accessToken: 't', file: video(), metadata: {}, fetchImpl, XHR: fakeXhr() })
    expect(result).toEqual({ videoId: 'abc123XYZ_-', url: 'https://www.youtube.com/watch?v=abc123XYZ_-' })
  })

  it('does not call the network for an invalid file', async () => {
    const fetchImpl = vi.fn()
    await expect(uploadVideo({ accessToken: 't', file: new File(['x'], 'a.png', { type: 'image/png' }), metadata: {}, fetchImpl })).rejects.toThrow(/video/)
    expect(fetchImpl).not.toHaveBeenCalled()
  })
})

describe('Google client ID setting', () => {
  it('accepts real-looking IDs only and saves them locally', () => {
    expect(isValidGoogleClientId('123456-abc_def.apps.googleusercontent.com')).toBe(true)
    expect(isValidGoogleClientId('GOCSPX-secret')).toBe(false)
    window.localStorage.clear()
    expect(setGoogleClientId('nonsense')).toBe(false)
    expect(setGoogleClientId('123456-abc.apps.googleusercontent.com')).toBe(true)
    expect(getGoogleClientId()).toBe('123456-abc.apps.googleusercontent.com')
    expect(setGoogleClientId('')).toBe(true)
    expect(getGoogleClientId()).toBe('')
  })
})

describe('post attachments in saved data', () => {
  const post = { id: 'p1', title: 'Clip', caption: 'x', platform: 'YouTube', status: 'Draft', scheduledAt: '' }

  it('keeps a valid attachment and YouTube result, and rebuilds the link itself', () => {
    const { data, errors } = normalizeWorkspace({
      workspaceName: 'W', brands: [], interactions: [],
      posts: [{ ...post, media: { id: 'm1', name: 'clip.mp4', type: 'video/mp4', size: 10 }, youtube: { videoId: 'abc123XYZ_-', url: 'https://evil.example', privacy: 'public', uploadedAt: '2026-11-04T10:00:00.000Z' } }],
    })
    expect(errors).toEqual([])
    expect(data.posts[0].media.name).toBe('clip.mp4')
    expect(data.posts[0].youtube.url).toBe('https://www.youtube.com/watch?v=abc123XYZ_-')
  })

  it('drops malformed attachments and ids without rejecting the post', () => {
    const { data, errors } = normalizeWorkspace({
      workspaceName: 'W', brands: [], interactions: [],
      posts: [{ ...post, media: { id: '', name: 'x' }, youtube: { videoId: '../bad' } }],
    })
    expect(errors).toEqual([])
    expect(data.posts[0].media).toBeUndefined()
    expect(data.posts[0].youtube).toBeUndefined()
  })
})
