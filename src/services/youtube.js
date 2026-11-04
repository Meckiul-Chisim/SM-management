// Uploading a video to YouTube straight from the browser. No server is involved.
//
// How it works (three steps):
//   1. Sign in with Google (Google Identity Services) and get a short-lived access
//      token for the "youtube.upload" permission. The token stays in memory.
//   2. Start a "resumable upload": send the title, description and privacy and
//      receive an upload address.
//   3. Send the video file to that address and report progress.
//
// This code cannot be tried against the real YouTube here, so the parts that talk
// to Google are kept small and the logic around them is covered by unit tests.

export const YOUTUBE_SCOPE = 'https://www.googleapis.com/auth/youtube.upload'
const GIS_SRC = 'https://accounts.google.com/gsi/client'
const UPLOAD_URL = 'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status'

// YouTube's own limits.
export const YOUTUBE_LIMITS = { title: 100, description: 5000, maxBytes: 256 * 1024 * 1024 * 1024 }
export const PRIVACY_OPTIONS = [
  { value: 'private', label: 'Private (only you can watch)' },
  { value: 'unlisted', label: 'Unlisted (anyone with the link)' },
  { value: 'public', label: 'Public' },
]

// The title and description sent to YouTube. YouTube rejects "<" and ">" in titles.
export function buildMetadata({ title, caption, privacy = 'private', madeForKids }) {
  const cleanTitle = String(title || '').replace(/[<>]/g, '').trim().slice(0, YOUTUBE_LIMITS.title)
  return {
    snippet: {
      title: cleanTitle || 'Untitled video',
      description: String(caption || '').replace(/[<>]/g, '').slice(0, YOUTUBE_LIMITS.description),
    },
    status: {
      privacyStatus: ['private', 'unlisted', 'public'].includes(privacy) ? privacy : 'private',
      // YouTube requires this answer; the person chooses it, it is never guessed.
      selfDeclaredMadeForKids: madeForKids === true,
    },
  }
}

// Returns an error message if this file cannot be uploaded, otherwise ''.
export function checkVideoFile(file) {
  if (!file) return 'Attach a video file to this post first.'
  if (!String(file.type || '').startsWith('video/')) return 'YouTube needs a video file. Attach a video to this post.'
  if (file.size > YOUTUBE_LIMITS.maxBytes) return 'This video is larger than YouTube allows.'
  if (file.size === 0) return 'This video file is empty.'
  return ''
}

// Turns an HTTP status from Google into a plain-language message.
export function explainFailure(status, body) {
  const reason = body?.error?.errors?.[0]?.reason || body?.error?.status || ''
  if (status === 401) return 'Google sign-in expired. Try the upload again.'
  if (reason === 'quotaExceeded' || reason === 'RESOURCE_EXHAUSTED') return 'The daily YouTube upload limit for this Google project is used up. Try again tomorrow.'
  if (reason === 'uploadLimitExceeded') return 'This YouTube channel has reached its upload limit. Try again later.'
  if (reason === 'youtubeSignupRequired') return 'This Google account has no YouTube channel yet. Create one on youtube.com first.'
  if (status === 403) return 'Google refused the upload. Check that the YouTube Data API is enabled and that your Google account is added as a test user (see the setup guide).'
  if (status === 400) return 'YouTube rejected the video details. Check the title and description.'
  if (status >= 500) return 'YouTube had a temporary problem. Try again in a few minutes.'
  return `The upload failed (error ${status || 'network'}).`
}

function loadGoogleScript() {
  if (window.google?.accounts?.oauth2) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GIS_SRC}"]`)
    const script = existing || document.createElement('script')
    script.addEventListener('load', () => resolve(), { once: true })
    script.addEventListener('error', () => reject(new Error('Could not load Google sign-in. Check your connection or ad blocker.')), { once: true })
    if (!existing) {
      script.src = GIS_SRC
      script.async = true
      document.head.appendChild(script)
    }
  })
}

// Opens the Google sign-in popup and resolves with an access token (kept in memory only).
export async function requestAccessToken(clientId) {
  await loadGoogleScript()
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: YOUTUBE_SCOPE,
      callback: (response) => {
        if (response?.access_token) resolve(response.access_token)
        else reject(new Error(response?.error === 'access_denied' ? 'Sign-in was cancelled.' : 'Google sign-in did not complete.'))
      },
      error_callback: (error) => reject(new Error(error?.type === 'popup_closed' ? 'Sign-in was cancelled.' : 'Google sign-in did not complete.')),
    })
    client.requestAccessToken({ prompt: '' })
  })
}

// Step 2: asks YouTube for an upload address.
export async function startUpload({ accessToken, file, metadata, fetchImpl = fetch, signal }) {
  const response = await fetchImpl(UPLOAD_URL, {
    method: 'POST',
    signal,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Length': String(file.size),
      'X-Upload-Content-Type': file.type || 'video/*',
    },
    body: JSON.stringify(metadata),
  })
  if (!response.ok) {
    let body = null
    try { body = await response.json() } catch { /* no details available */ }
    throw new Error(explainFailure(response.status, body))
  }
  const location = response.headers.get('Location')
  if (!location) throw new Error('YouTube did not return an upload address. Try again.')
  return location
}

// Step 3: sends the file. XMLHttpRequest is used because fetch cannot report upload progress.
export function sendFile({ uploadUrl, file, onProgress, signal, XHR = XMLHttpRequest }) {
  return new Promise((resolve, reject) => {
    const xhr = new XHR()
    xhr.open('PUT', uploadUrl)
    xhr.setRequestHeader('Content-Type', file.type || 'video/*')
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) onProgress(event.loaded / event.total)
    }
    xhr.onload = () => {
      let body = null
      try { body = JSON.parse(xhr.responseText) } catch { /* not JSON */ }
      if (xhr.status >= 200 && xhr.status < 300 && body?.id) resolve({ videoId: body.id })
      else reject(new Error(explainFailure(xhr.status, body)))
    }
    xhr.onerror = () => reject(new Error('The connection dropped during the upload. Try again.'))
    xhr.onabort = () => reject(new DOMException('Upload cancelled', 'AbortError'))
    if (signal) {
      if (signal.aborted) { xhr.abort(); return }
      signal.addEventListener('abort', () => xhr.abort(), { once: true })
    }
    xhr.send(file)
  })
}

// The whole upload. Resolves with { videoId, url }. Rejects with an Error whose
// message is safe to show; an AbortError means the person cancelled.
export async function uploadVideo({ accessToken, file, metadata, onProgress, signal, fetchImpl, XHR }) {
  const problem = checkVideoFile(file)
  if (problem) throw new Error(problem)
  const uploadUrl = await startUpload({ accessToken, file, metadata, fetchImpl, signal })
  const { videoId } = await sendFile({ uploadUrl, file, onProgress, signal, XHR })
  return { videoId, url: `https://www.youtube.com/watch?v=${videoId}` }
}
