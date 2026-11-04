import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import Button from '../ui/Button.jsx'
import { SelectField } from '../ui/Field.jsx'
import Modal from '../ui/Modal.jsx'
import Notice from '../ui/Notice.jsx'
import { getGoogleClientId } from '../../services/connections.js'
import { getMediaFile } from '../../services/mediaStore.js'
import { PRIVACY_OPTIONS, buildMetadata, checkVideoFile, requestAccessToken, uploadVideo } from '../../services/youtube.js'

// Confirms and runs a real upload of the post's video to the person's own YouTube channel.
// Nothing starts until the person ticks the confirmation and presses Upload.
function YouTubeUploadModal({ post, onUploaded, onClose }) {
  const [privacy, setPrivacy] = useState('private')
  const [madeForKids, setMadeForKids] = useState('') // '' until chosen: YouTube requires an answer
  const [confirmed, setConfirmed] = useState(false)
  const [phase, setPhase] = useState('idle') // idle | signin | uploading | done
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const controller = useRef(null)
  const clientId = getGoogleClientId()
  const busy = phase === 'signin' || phase === 'uploading'

  // Closing the dialog during an upload cancels it.
  useEffect(() => () => controller.current?.abort(), [])

  async function start() {
    setError('')
    if (!madeForKids) { setError('Answer the “made for kids” question. YouTube requires it.'); return }
    try {
      const file = await getMediaFile(post.media.id)
      const problem = checkVideoFile(file)
      if (problem) { setError(problem); return }

      controller.current = new AbortController()
      setPhase('signin')
      const accessToken = await requestAccessToken(clientId)
      setPhase('uploading')
      setProgress(0)
      const uploaded = await uploadVideo({
        accessToken,
        file,
        metadata: buildMetadata({ title: post.title, caption: post.caption, privacy, madeForKids: madeForKids === 'yes' }),
        onProgress: setProgress,
        signal: controller.current.signal,
      })
      setResult(uploaded)
      setPhase('done')
      onUploaded({ videoId: uploaded.videoId, privacy })
    } catch (caught) {
      setPhase('idle')
      setError(caught?.name === 'AbortError' ? 'Upload cancelled.' : caught?.message || 'The upload failed.')
    }
  }

  function cancel() {
    if (busy) controller.current?.abort()
    else onClose()
  }

  return (
    <Modal title="Upload to YouTube" description={`“${post.title}” will be uploaded to your own YouTube channel.`} onClose={cancel}>
      {phase === 'done' ? (
        <div className="space-y-4">
          <Notice tone="success">Uploaded. The post is now marked as Published.</Notice>
          <a href={result.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-brand-700 underline">
            Watch on YouTube <ExternalLink size={15} aria-hidden="true" />
          </a>
          {privacy === 'private' && <p className="text-sm text-muted">It is private. Open YouTube Studio to change who can watch it.</p>}
          <div className="flex justify-end"><Button onClick={onClose}>Done</Button></div>
        </div>
      ) : !clientId ? (
        <div className="space-y-4">
          <Notice tone="warning">YouTube is not connected yet. Add your Google client ID in <Link to="/settings" className="font-semibold underline">Settings</Link> first. The setup guide explains how to get one.</Notice>
          <div className="flex justify-end"><Button variant="secondary" onClick={onClose}>Close</Button></div>
        </div>
      ) : (
        <form onSubmit={(event) => { event.preventDefault(); start() }} className="space-y-4" noValidate>
          <dl className="grid gap-1 rounded-lg border border-line p-3 text-sm">
            <div className="flex gap-2"><dt className="text-muted">Video</dt><dd className="min-w-0 truncate">{post.media.name}</dd></div>
            <div className="flex gap-2"><dt className="text-muted">Title</dt><dd className="min-w-0 truncate">{post.title}</dd></div>
          </dl>
          <SelectField label="Who can watch" value={privacy} onChange={(event) => setPrivacy(event.target.value)} disabled={busy}>
            {PRIVACY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </SelectField>
          <fieldset disabled={busy}>
            <legend className="field-label">Is this video made for kids?</legend>
            {[['no', 'No'], ['yes', 'Yes']].map(([value, label]) => (
              <label key={value} className="mr-5 inline-flex min-h-11 items-center gap-2 text-sm">
                <input type="radio" name="made-for-kids" value={value} checked={madeForKids === value} onChange={() => setMadeForKids(value)} /> {label}
              </label>
            ))}
          </fieldset>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} disabled={busy} />
            <span>I understand this uploads the video to my YouTube channel using my Google account.</span>
          </label>
          {phase === 'uploading' && (
            <div role="status" aria-live="polite">
              <div className="h-2 overflow-hidden rounded-full bg-surface"><div className="h-full bg-brand-700 transition-[width]" style={{ width: `${Math.round(progress * 100)}%` }} /></div>
              <p className="mt-1.5 text-xs text-muted">Uploading… {Math.round(progress * 100)}%. Keep this page open.</p>
            </div>
          )}
          {phase === 'signin' && <p role="status" className="text-sm text-muted">Waiting for Google sign-in…</p>}
          {error && <Notice tone="danger">{error}</Notice>}
          <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={cancel}>{busy ? 'Cancel upload' : 'Close'}</Button>
            <Button type="submit" disabled={!confirmed || busy}>Upload to YouTube</Button>
          </div>
        </form>
      )}
    </Modal>
  )
}

export default YouTubeUploadModal
