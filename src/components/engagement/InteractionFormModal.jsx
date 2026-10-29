import { useState } from 'react'
import Button from '../ui/Button.jsx'
import { SelectField, TextField, TextareaField } from '../ui/Field.jsx'
import Modal from '../ui/Modal.jsx'
import { INTERACTION_STATUSES, PLATFORMS } from '../../data/constants.js'
import { hasErrors, validateInteraction } from '../../data/validators.js'

const BLANK = { person: '', platform: 'Instagram', brandId: '', message: '', status: 'Follow up', followUpDate: '', notes: '' }

// Log a new interaction or edit an existing one. Entered by hand: nothing is fetched from a platform.
function InteractionFormModal({ item, brands, onSave, onClose }) {
  const [form, setForm] = useState(() => ({ ...BLANK, ...(item || {}) }))
  const [errors, setErrors] = useState({})
  const set = (name) => (event) => setForm((current) => ({ ...current, [name]: event.target.value }))

  function submit(event) {
    event.preventDefault()
    const result = validateInteraction(form)
    setErrors(result.errors)
    if (!hasErrors(result.errors)) onSave(result.values)
  }

  return (
    <Modal
      title={item ? 'Edit follow-up' : 'Log an interaction'}
      description="Add a message or comment by hand. Nothing is imported from a social platform."
      onClose={onClose}
      wide
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Person or account" required data-autofocus value={form.person} error={errors.person} onChange={set('person')} placeholder="Name or handle" />
          <SelectField label="Platform" value={form.platform} error={errors.platform} onChange={set('platform')}>
            {PLATFORMS.map((platform) => <option key={platform} value={platform}>{platform}</option>)}
          </SelectField>
          <SelectField label="Brand" value={form.brandId} onChange={set('brandId')}>
            <option value="">General workspace</option>
            {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
          </SelectField>
          <SelectField label="Status" value={form.status} error={errors.status} onChange={set('status')}>
            {INTERACTION_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
          </SelectField>
          <TextareaField className="sm:col-span-2" label="Message or comment" required value={form.message} error={errors.message} onChange={set('message')} placeholder="What did they ask or say?" />
          <TextField label="Follow up by" type="date" value={form.followUpDate} error={errors.followUpDate} onChange={set('followUpDate')} />
          <TextField label="Internal note" value={form.notes} error={errors.notes} onChange={set('notes')} placeholder="Optional next step" />
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">{item ? 'Save changes' : 'Save'}</Button>
        </div>
      </form>
    </Modal>
  )
}

export default InteractionFormModal
