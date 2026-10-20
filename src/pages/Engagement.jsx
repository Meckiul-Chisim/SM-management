import { useState } from 'react'
import { CheckCheck, MessageSquareText, Plus, Trash2, UserRound } from 'lucide-react'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import Modal from '../components/ui/Modal.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import { PLATFORMS, useWorkspace } from '../context/WorkspaceContext.jsx'

const blankForm = {
  person: '',
  platform: 'Instagram',
  brandId: '',
  message: '',
  status: 'Follow up',
  followUpDate: '',
  notes: '',
}

function Engagement() {
  const { data, addInteraction, updateInteraction, deleteInteraction } = useWorkspace()
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState(blankForm)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('Open')

  const visibleItems = data.interactions.filter((item) => filter === 'All' || (filter === 'Open' ? item.status !== 'Done' : item.status === filter))

  function openCreate() {
    setForm({ ...blankForm, brandId: data.brands[0]?.id || '' })
    setError('')
    setIsOpen(true)
  }

  function submit(event) {
    event.preventDefault()
    if (!form.person.trim() || !form.message.trim()) {
      setError('Add a person or account name and a message to continue.')
      return
    }
    addInteraction({
      ...form,
      person: form.person.trim(),
      message: form.message.trim(),
      notes: form.notes.trim(),
    })
    setIsOpen(false)
  }

  function deleteItem(item) {
    if (window.confirm(`Delete the follow-up for ${item.person}?`)) deleteInteraction(item.id)
  }

  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <PageHeader title="Engagement" description="Keep important comments, messages, and follow-ups from slipping through the cracks." />
        <Button onClick={openCreate} className="mb-7 self-start sm:self-auto"><Plus size={17} /> Log interaction</Button>
      </div>

      <div className="mb-5 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm leading-5 text-sky-900">
        This is a manual follow-up tracker, not a live social inbox. Messages and notes are entered by you; platform messages are not imported.
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {['Open', 'Follow up', 'Unread', 'Done', 'All'].map((status) => (
          <button key={status} type="button" onClick={() => setFilter(status)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filter === status ? 'bg-brand-700 text-white' : 'border border-line bg-white text-muted hover:bg-surface'}`}>
            {status}
          </button>
        ))}
      </div>

      {visibleItems.length ? (
        <div className="space-y-3">
          {visibleItems.map((item) => {
            const brand = data.brands.find((entry) => entry.id === item.brandId)
            return (
              <Card key={item.id} className="p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-800"><UserRound size={18} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-ink">{item.person}</h2>
                      <Badge>{item.platform}</Badge>
                      <Badge className={item.status === 'Done' ? 'bg-emerald-50 text-emerald-700' : item.status === 'Unread' ? 'bg-sky-50 text-sky-700' : ''}>{item.status}</Badge>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink">{item.message}</p>
                    <p className="mt-2 text-xs text-muted">{brand?.name || 'General workspace'}{item.followUpDate ? ` · Follow up by ${new Date(`${item.followUpDate}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : ''}</p>
                    {item.notes && <p className="mt-3 rounded-lg bg-surface px-3 py-2 text-xs leading-5 text-muted">{item.notes}</p>}
                  </div>
                  <button type="button" aria-label={`Delete follow-up for ${item.person}`} onClick={() => deleteItem(item)} className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-rose-50 hover:text-rose-700"><Trash2 size={16} /></button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                  {item.status !== 'Done' ? (
                    <Button variant="secondary" className="min-h-9 px-3" onClick={() => updateInteraction(item.id, { status: 'Done' })}><CheckCheck size={15} /> Mark done</Button>
                  ) : (
                    <Button variant="secondary" className="min-h-9 px-3" onClick={() => updateInteraction(item.id, { status: 'Follow up' })}>Reopen follow-up</Button>
                  )}
                  {item.status !== 'Unread' && item.status !== 'Done' && (
                    <Button variant="ghost" className="min-h-9 px-3" onClick={() => updateInteraction(item.id, { status: 'Unread' })}>Mark unread</Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
          <MessageSquareText size={25} className="text-brand-700" />
          <h2 className="mt-4 text-base font-semibold text-ink">{data.interactions.length ? 'Nothing in this view' : 'Keep your next follow-up visible'}</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted">{data.interactions.length ? 'Choose another filter or add a new interaction.' : 'Log a message or comment that needs a response, choose its status, and keep a note for the next step.'}</p>
          {!data.interactions.length && <Button className="mt-5" onClick={openCreate}><Plus size={17} /> Log interaction</Button>}
        </Card>
      )}

      {isOpen && (
        <Modal title="Log an interaction" description="Add a message, comment, or follow-up manually." onClose={() => setIsOpen(false)} wide>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="interaction-person">Person or account *</label>
                <input id="interaction-person" className="field" autoFocus value={form.person} onChange={(event) => setForm({ ...form, person: event.target.value })} placeholder="Name or social handle" />
              </div>
              <div>
                <label className="field-label" htmlFor="interaction-platform">Platform</label>
                <select id="interaction-platform" className="field" value={form.platform} onChange={(event) => setForm({ ...form, platform: event.target.value })}>
                  {PLATFORMS.map((platform) => <option key={platform} value={platform}>{platform}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label" htmlFor="interaction-brand">Brand</label>
                <select id="interaction-brand" className="field" value={form.brandId} onChange={(event) => setForm({ ...form, brandId: event.target.value })}>
                  <option value="">General workspace</option>
                  {data.brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label" htmlFor="interaction-status">Status</label>
                <select id="interaction-status" className="field" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                  {['Unread', 'Follow up', 'Done'].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="interaction-message">Message or comment *</label>
                <textarea id="interaction-message" className="field" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="What did the person ask or say?" />
              </div>
              <div>
                <label className="field-label" htmlFor="interaction-date">Follow-up date</label>
                <input id="interaction-date" type="date" className="field" value={form.followUpDate} onChange={(event) => setForm({ ...form, followUpDate: event.target.value })} />
              </div>
              <div>
                <label className="field-label" htmlFor="interaction-notes">Internal note</label>
                <input id="interaction-notes" className="field" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Optional next step" />
              </div>
            </div>
            {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
            <div className="flex justify-end gap-2 border-t border-line pt-4">
              <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">Save interaction</Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}

export default Engagement
