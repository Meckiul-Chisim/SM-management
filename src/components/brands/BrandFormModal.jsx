import { useState } from 'react'
import Button from '../ui/Button.jsx'
import { TextField } from '../ui/Field.jsx'
import Modal from '../ui/Modal.jsx'
import { PLATFORMS } from '../../data/constants.js'
import { hasErrors, validateBrand } from '../../data/validators.js'
import { DEFAULT_BRAND_COLOUR } from '../../utils/colour.js'

// Create or edit a brand. The form state lives here, so it resets every time the dialog opens.
function BrandFormModal({ brand, brands, onSave, onClose }) {
  const [form, setForm] = useState(() => ({
    name: brand?.name || '',
    industry: brand?.industry || '',
    color: brand?.color || DEFAULT_BRAND_COLOUR,
    accounts: brand ? brand.accounts.map((account) => ({ ...account })) : [{ platform: 'Instagram', handle: '' }],
  }))
  const [errors, setErrors] = useState({})

  function togglePlatform(platform, checked) {
    setForm((current) => ({
      ...current,
      accounts: checked
        ? [...current.accounts, { platform, handle: '' }]
        : current.accounts.filter((account) => account.platform !== platform),
    }))
  }

  function updateHandle(platform, handle) {
    setForm((current) => ({
      ...current,
      accounts: current.accounts.map((account) => (account.platform === platform ? { ...account, handle } : account)),
    }))
  }

  function submit(event) {
    event.preventDefault()
    const result = validateBrand(form, { brands, editingId: brand?.id })
    setErrors(result.errors)
    if (!hasErrors(result.errors)) onSave(result.values)
  }

  return (
    <Modal title={brand ? 'Edit brand' : 'Add a brand'} description="A brand keeps its posts and social profile notes together." onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <TextField
          label="Brand or client name"
          required
          data-autofocus
          value={form.name}
          error={errors.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          placeholder="e.g. Acme Studio"
          autoComplete="off"
        />
        <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
          <TextField
            label="Industry or category"
            value={form.industry}
            error={errors.industry}
            onChange={(event) => setForm({ ...form, industry: event.target.value })}
            placeholder="e.g. Fitness, retail, creator"
          />
          <TextField
            label="Brand colour"
            type="color"
            className="[&_input]:!p-1.5"
            value={form.color}
            onChange={(event) => setForm({ ...form, color: event.target.value })}
          />
        </div>

        <fieldset>
          <legend className="field-label">Social profile references</legend>
          <p className="mb-3 text-xs text-muted">Add handles if useful. This only saves a note, it does not connect an account.</p>
          <div className="space-y-2">
            {PLATFORMS.map((platform) => {
              const account = form.accounts.find((item) => item.platform === platform)
              return (
                <div key={platform} className="rounded-xl border border-line p-3">
                  <label className="flex min-h-8 cursor-pointer items-center gap-2.5 text-sm font-medium text-ink">
                    <input
                      type="checkbox"
                      checked={Boolean(account)}
                      onChange={(event) => togglePlatform(platform, event.target.checked)}
                      className="size-4 accent-brand-700"
                    />
                    {platform}
                  </label>
                  {account && (
                    <div className="mt-2">
                      <input
                        className="field"
                        aria-label={`${platform} handle`}
                        aria-invalid={errors[`handle-${platform}`] ? 'true' : undefined}
                        value={account.handle}
                        onChange={(event) => updateHandle(platform, event.target.value)}
                        placeholder={`Handle or profile name on ${platform}`}
                      />
                      {errors[`handle-${platform}`] && <p className="mt-1.5 text-xs font-medium text-danger">{errors[`handle-${platform}`]}</p>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </fieldset>

        <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">{brand ? 'Save changes' : 'Create brand'}</Button>
        </div>
      </form>
    </Modal>
  )
}

export default BrandFormModal
