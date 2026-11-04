import { useState } from 'react'
import { Paperclip, X } from 'lucide-react'
import Button from '../ui/Button.jsx'
import { SelectField, TextField, TextareaField } from '../ui/Field.jsx'
import Modal from '../ui/Modal.jsx'
import { PLATFORMS, PLATFORM_CAPTION_GUIDE, POST_STATUSES, POST_STATUS_HELP } from '../../data/constants.js'
import { hasErrors, validatePost } from '../../data/validators.js'
import { deleteMediaFile, saveMediaFile } from '../../services/mediaStore.js'
import { createId } from '../../utils/id.js'

const formatSize = (bytes) => (bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`)

const BLANK = { title: '', caption: '', brandId: '', platform: 'Instagram', status: 'Draft', scheduledAt: '' }

// Create or edit a post. `initial` pre-fills a new post (from the draft helper,
// a repurposed post, or a calendar day). Form state resets each time it opens.
function PostFormModal({ post, initial, brands, onSave, onClose }) {
  const [form, setForm] = useState(() => ({ ...BLANK, ...(initial || {}), ...(post || {}) }))
  const [errors, setErrors] = useState({})
  const [fileError, setFileError] = useState('')
  const originalMediaId = post?.media?.id || ''

  const set = (name) => (event) => setForm((current) => ({ ...current, [name]: event.target.value }))
  const guide = PLATFORM_CAPTION_GUIDE[form.platform]
  const overGuide = guide && form.caption.length > guide

  // The chosen file is stored in this browser straight away. If the form is
  // cancelled, a file that was never saved with the post is removed again.
  async function chooseFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!/^(video|image)\//.test(file.type)) {
      setFileError('Choose a video or an image file.')
      return
    }
    try {
      const id = createId()
      await saveMediaFile(id, file)
      if (form.media && form.media.id !== originalMediaId) deleteMediaFile(form.media.id).catch(() => {})
      setFileError('')
      setForm((current) => ({ ...current, media: { id, name: file.name, type: file.type, size: file.size } }))
    } catch (error) {
      setFileError(error.message || 'This file could not be saved in the browser.')
    }
  }

  function removeFile() {
    if (form.media && form.media.id !== originalMediaId) deleteMediaFile(form.media.id).catch(() => {})
    setForm((current) => ({ ...current, media: null }))
  }

  function close() {
    if (form.media && form.media.id !== originalMediaId) deleteMediaFile(form.media.id).catch(() => {})
    onClose()
  }

  function submit(event) {
    event.preventDefault()
    const result = validatePost(form)
    setErrors(result.errors)
    if (hasErrors(result.errors)) return
    // A replaced or removed attachment no longer needs its stored file.
    if (originalMediaId && form.media?.id !== originalMediaId) deleteMediaFile(originalMediaId).catch(() => {})
    onSave(result.values)
  }

  return (
    <Modal
      title={post ? 'Edit post' : 'New post'}
      description="Posts and attached files are saved in this browser. Nothing is sent anywhere until you choose to upload."
      onClose={close}
      wide
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <TextField
          label="Internal title"
          data-autofocus
          value={form.title}
          error={errors.title}
          onChange={set('title')}
          placeholder="e.g. Behind the scenes, launch teaser"
        />
        <TextareaField
          label="Post text"
          value={form.caption}
          error={errors.caption}
          onChange={set('caption')}
          placeholder="Write the text you want to post…"
          hint={
            <span className={overGuide ? 'font-semibold text-warning' : undefined}>
              {form.caption.length} characters{guide ? ` · ${form.platform} usually allows about ${guide.toLocaleString()}` : ''}
            </span>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField label="Brand" value={form.brandId} onChange={set('brandId')}>
            <option value="">General workspace</option>
            {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
          </SelectField>
          <SelectField label="Platform" value={form.platform} error={errors.platform} onChange={set('platform')}>
            {PLATFORMS.map((platform) => <option key={platform} value={platform}>{platform}</option>)}
          </SelectField>
          <SelectField label="Status" value={form.status} error={errors.status} onChange={set('status')} hint={POST_STATUS_HELP[form.status]}>
            {POST_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
          </SelectField>
          <TextField
            label="Planned date and time"
            type="datetime-local"
            value={form.scheduledAt}
            error={errors.scheduledAt}
            onChange={set('scheduledAt')}
            required={form.status === 'Planned'}
            hint="Shown on the calendar. It is a plan only; nothing is posted for you."
          />
        </div>
        <div>
          <span className="field-label">Video or image (optional)</span>
          {form.media ? (
            <div className="flex items-center gap-3 rounded-lg border border-line px-3 py-2 text-sm">
              <Paperclip size={16} aria-hidden="true" className="shrink-0 text-muted" />
              <span className="min-w-0 flex-1 truncate">{form.media.name} <span className="text-muted">· {formatSize(form.media.size)}</span></span>
              <button type="button" onClick={removeFile} aria-label="Remove attached file" className="flex size-9 items-center justify-center rounded-md text-muted hover:text-danger"><X size={16} aria-hidden="true" /></button>
            </div>
          ) : (
            <input type="file" accept="video/*,image/*" onChange={chooseFile} className="field" aria-label="Attach a video or image" />
          )}
          {fileError
            ? <p className="mt-1.5 text-xs font-medium text-danger">{fileError}</p>
            : <p className="field-help">Saved in this browser only. A video is needed to upload to YouTube.</p>}
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={close}>Cancel</Button>
          <Button type="submit">{post ? 'Save changes' : 'Save post'}</Button>
        </div>
      </form>
    </Modal>
  )
}

export default PostFormModal
