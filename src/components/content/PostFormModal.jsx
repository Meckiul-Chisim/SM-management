import { useState } from 'react'
import Button from '../ui/Button.jsx'
import { SelectField, TextField, TextareaField } from '../ui/Field.jsx'
import Modal from '../ui/Modal.jsx'
import { PLATFORMS, PLATFORM_CAPTION_GUIDE, POST_STATUSES, POST_STATUS_HELP } from '../../data/constants.js'
import { hasErrors, validatePost } from '../../data/validators.js'

const BLANK = { title: '', caption: '', brandId: '', platform: 'Instagram', status: 'Draft', scheduledAt: '' }

// Create or edit a post. `initial` pre-fills a new post (from the draft helper,
// a repurposed post, or a calendar day). Form state resets each time it opens.
function PostFormModal({ post, initial, brands, onSave, onClose }) {
  const [form, setForm] = useState(() => ({ ...BLANK, ...(initial || {}), ...(post || {}) }))
  const [errors, setErrors] = useState({})

  const set = (name) => (event) => setForm((current) => ({ ...current, [name]: event.target.value }))
  const guide = PLATFORM_CAPTION_GUIDE[form.platform]
  const overGuide = guide && form.caption.length > guide

  function submit(event) {
    event.preventDefault()
    const result = validatePost(form)
    setErrors(result.errors)
    if (!hasErrors(result.errors)) onSave(result.values)
  }

  return (
    <Modal
      title={post ? 'Edit post' : 'New post'}
      description="Posts are saved in this browser. They are not sent to any social platform."
      onClose={onClose}
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
        <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">{post ? 'Save changes' : 'Save post'}</Button>
        </div>
      </form>
    </Modal>
  )
}

export default PostFormModal
