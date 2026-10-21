import { useState } from 'react'
import { Instagram, Linkedin, MoreHorizontal, Plus, Trash2, UsersRound } from 'lucide-react'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import Modal from '../components/ui/Modal.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import { PLATFORMS, useWorkspace } from '../context/WorkspaceContext.jsx'
import { DEFAULT_BRAND_COLOUR, readableTextColour } from '../utils/colour.js'

const platformIcon = { Instagram, LinkedIn: Linkedin }
const emptyForm = { name: '', industry: '', color: DEFAULT_BRAND_COLOUR, accounts: [] }

function Brands() {
  const { data, addBrand, updateBrand, deleteBrand } = useWorkspace()
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  function openCreate() {
    setEditingId(null)
    setForm({ ...emptyForm, accounts: [{ platform: 'Instagram', handle: '' }] })
    setError('')
    setIsOpen(true)
  }

  function openEdit(brand) {
    setEditingId(brand.id)
    setForm({
      name: brand.name,
      industry: brand.industry || '',
      color: brand.color || DEFAULT_BRAND_COLOUR,
      accounts: (brand.accounts || []).map((account) => ({ ...account })),
    })
    setError('')
    setIsOpen(true)
  }

  function togglePlatform(platform, checked) {
    setForm((current) => ({
      ...current,
      accounts: checked
        ? [...current.accounts, { platform, handle: '', connected: false }]
        : current.accounts.filter((account) => account.platform !== platform),
    }))
  }

  function updateHandle(platform, handle) {
    setForm((current) => ({
      ...current,
      accounts: current.accounts.map((account) => account.platform === platform ? { ...account, handle } : account),
    }))
  }

  function submit(event) {
    event.preventDefault()
    if (!form.name.trim()) {
      setError('Enter a brand or client name to continue.')
      return
    }
    const payload = {
      ...form,
      name: form.name.trim(),
      industry: form.industry.trim(),
      accounts: form.accounts.map((account) => ({ ...account, handle: account.handle.trim(), connected: false })),
    }
    if (editingId) updateBrand(editingId, payload)
    else addBrand(payload)
    setIsOpen(false)
  }

  function removeBrand(brand) {
    if (window.confirm(`Delete ${brand.name} and its linked posts and follow-ups from this browser?`)) deleteBrand(brand.id)
  }

  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <PageHeader title="Brands & accounts" description="Keep brand identities and social profile references organised in one place." />
        <Button onClick={openCreate} className="mb-7 self-start sm:self-auto"><Plus size={17} /> Add brand</Button>
      </div>

      <div className="mb-5 notice notice-info">
        Social handles are saved as workspace notes only. Connecting accounts, verifying access, and publishing through social platforms are not enabled in this prototype.
      </div>

      {data.brands.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.brands.map((brand) => (
            <Card key={brand.id} className="overflow-hidden">
              <div className="flex items-start gap-4 p-5 sm:p-6">
                <span
                  className="flex size-11 shrink-0 items-center justify-center rounded-lg font-display text-lg font-semibold"
                  style={{ backgroundColor: brand.color || DEFAULT_BRAND_COLOUR, color: readableTextColour(brand.color) }}
                  aria-hidden="true"
                >
                  {brand.name.trim().slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-base font-semibold text-ink">{brand.name}</h2>
                    <Badge>{brand.industry || 'General'}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted">{(brand.accounts || []).length} profile reference{(brand.accounts || []).length === 1 ? '' : 's'}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" className="min-h-9 px-3" onClick={() => openEdit(brand)}><MoreHorizontal size={17} /> Edit</Button>
                  <button type="button" aria-label={`Delete ${brand.name}`} onClick={() => removeBrand(brand)} className="flex size-9 items-center justify-center rounded-lg text-muted hover:bg-danger-bg hover:text-danger"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="border-t border-line bg-surface/60 p-5 sm:p-6">
                {(brand.accounts || []).length ? (
                  <div className="space-y-2">
                    {brand.accounts.map((account) => {
                      const Icon = platformIcon[account.platform]
                      return (
                        <div key={account.platform} className="flex items-center gap-3 rounded-lg bg-panel px-3 py-3">
                          <span className="flex size-9 items-center justify-center rounded-lg border border-line text-muted">
                            {Icon ? <Icon size={17} /> : <span className="text-[10px] font-bold">{account.platform.slice(0, 2).toUpperCase()}</span>}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-ink">{account.platform}</p>
                            <p className="truncate text-xs text-muted">{account.handle || 'No handle added'}</p>
                          </div>
                          <Badge tone="neutral">Not connected</Badge>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="rounded-lg bg-panel px-3 py-4 text-sm text-muted">No social profile references yet. Edit this brand to add some.</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
          <UsersRound size={25} className="text-brand-700" />
          <h2 className="mt-4 text-base font-semibold text-ink">No brands yet</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted">Create a brand to organise its content and keep profile references together.</p>
          <Button className="mt-5" onClick={openCreate}><Plus size={17} /> Add your first brand</Button>
        </Card>
      )}

      {isOpen && (
        <Modal title={editingId ? 'Edit brand' : 'Add a brand'} description="A brand keeps its posts and social profile notes together." onClose={() => setIsOpen(false)} wide>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="field-label" htmlFor="brand-name">Brand or client name *</label>
              <input id="brand-name" className="field" autoFocus value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Acme Studio" />
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
              <div>
                <label className="field-label" htmlFor="brand-industry">Industry or category</label>
                <input id="brand-industry" className="field" value={form.industry} onChange={(event) => setForm({ ...form, industry: event.target.value })} placeholder="e.g. Fitness, retail, creator" />
              </div>
              <div>
                <label className="field-label" htmlFor="brand-color">Brand colour</label>
                <input id="brand-color" type="color" className="field !p-1.5" value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} />
              </div>
            </div>
            <div>
              <p className="field-label">Social profile references</p>
              <p className="mb-3 text-xs text-muted">Choose platforms and add handles if useful. This does not connect an account.</p>
              <div className="space-y-2">
                {PLATFORMS.map((platform) => {
                  const selected = form.accounts.some((account) => account.platform === platform)
                  return (
                    <div key={platform} className="rounded-xl border border-line p-3">
                      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
                        <input type="checkbox" checked={selected} onChange={(event) => togglePlatform(platform, event.target.checked)} className="accent-brand-700" />
                        {platform}
                      </label>
                      {selected && (
                        <input className="field mt-2" aria-label={`${platform} handle`} value={form.accounts.find((account) => account.platform === platform)?.handle || ''} onChange={(event) => updateHandle(platform, event.target.value)} placeholder={`Handle or profile name on ${platform}`} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            {error && <p role="alert" className="text-sm text-danger">{error}</p>}
            <div className="flex justify-end gap-2 border-t border-line pt-4">
              <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">{editingId ? 'Save changes' : 'Create brand'}</Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}

export default Brands
