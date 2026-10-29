import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCheck, MessageSquareText, Pencil, Plus, RotateCcw, Search, Trash2 } from 'lucide-react'
import InteractionFormModal from '../components/engagement/InteractionFormModal.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { SelectField } from '../components/ui/Field.jsx'
import Notice from '../components/ui/Notice.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { useToast } from '../hooks/useToast.js'
import { useWorkspace } from '../hooks/useWorkspace.js'
import { DEFAULT_BRAND_COLOUR } from '../utils/colour.js'
import { formatDay, fromDateKey, toDateKey } from '../utils/dates.js'
import { ALL, NO_BRAND, filterInteractions } from '../utils/filters.js'
import { countFollowUps, isOpen, isOverdue, sortFollowUps } from '../utils/followUps.js'

const VIEWS = ['Open', 'Overdue', 'Unread', 'Follow up', 'Done', 'All']

// Whole days between two "YYYY-MM-DD" keys, counted on local calendar days.
function daysBetween(fromKey, toKey) {
  const from = fromDateKey(fromKey)
  const to = fromDateKey(toKey)
  return Math.round((to - from) / 86400000)
}

function Engagement() {
  useDocumentTitle('Engagement')
  const { data, addInteraction, updateInteraction, deleteInteraction } = useWorkspace()
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const [dialog, setDialog] = useState(null) // null | 'new' | an item being edited
  const [deleting, setDeleting] = useState(null)
  const today = toDateKey(new Date())

  const view = VIEWS.includes(params.get('view')) ? params.get('view') : 'Open'
  const brandId = params.get('brand') || ALL
  const search = params.get('search') || ''

  function setParam(name, value, fallback) {
    const next = new URLSearchParams(params)
    if (!value || value === fallback) next.delete(name)
    else next.set(name, value)
    setParams(next, { replace: true })
  }

  // ?item=<id> (from the dashboard) opens that follow-up for editing, once.
  useEffect(() => {
    const id = params.get('item')
    if (!id) return
    const item = data.interactions.find((entry) => entry.id === id)
    if (item) setDialog(item)
    const next = new URLSearchParams(params)
    next.delete('item')
    setParams(next, { replace: true })
  }, [params, setParams, data.interactions])

  const counts = useMemo(() => countFollowUps(data.interactions, today), [data.interactions, today])

  const items = useMemo(() => {
    const byView = data.interactions.filter((item) => {
      if (view === 'Open') return isOpen(item)
      if (view === 'Overdue') return isOverdue(item, today)
      if (view === 'All') return true
      return item.status === view
    })
    return sortFollowUps(filterInteractions(byView, { search, brandId }), today)
  }, [data.interactions, view, search, brandId, today])

  function save(values) {
    if (dialog === 'new') {
      addInteraction(values)
      toast.show('Interaction saved.')
    } else {
      updateInteraction(dialog.id, values)
      toast.show('Follow-up updated.')
    }
    setDialog(null)
  }

  function confirmDelete() {
    deleteInteraction(deleting.id)
    toast.show(`Follow-up for ${deleting.person} deleted.`)
    setDeleting(null)
  }

  const chipLabel = (name) => {
    if (name === 'Open') return `Open (${counts.open})`
    if (name === 'Overdue') return `Overdue (${counts.overdue})`
    if (name === 'Done') return `Done (${counts.done})`
    return name
  }

  return (
    <div className="haven-route haven-route--engagement">
      <PageHeader
        title="Engagement"
        description="Keep comments, messages and follow-ups from slipping through the cracks."
        actions={<Button onClick={() => setDialog('new')}><Plus size={17} aria-hidden="true" /> Log interaction</Button>}
      />

      <Notice tone="info" className="mb-5">
        A manual follow-up list, not a live inbox. You enter the messages yourself; nothing is imported from social platforms.
      </Notice>

      {counts.overdue > 0 && view !== 'Overdue' && (
        <Notice tone="warning" className="mb-5">
          {counts.overdue} {counts.overdue === 1 ? 'follow-up is' : 'follow-ups are'} overdue.{' '}
          <button type="button" onClick={() => setParam('view', 'Overdue', 'Open')} className="font-semibold underline underline-offset-2">Show overdue</button>
        </Notice>
      )}

      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Show follow-ups">
        {VIEWS.map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={view === name}
            onClick={() => setParam('view', name, 'Open')}
            className={`min-h-11 rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 sm:min-h-9 ${
              view === name
                ? 'bg-brand-700 text-on-brand'
                : name === 'Overdue' && counts.overdue > 0
                  ? 'border border-danger text-danger hover:bg-danger-bg'
                  : 'border border-line bg-panel text-muted hover:bg-surface hover:text-ink'
            }`}
          >
            {chipLabel(name)}
          </button>
        ))}
      </div>

      <form role="search" onSubmit={(event) => event.preventDefault()} className="mb-5 grid gap-3 sm:grid-cols-[1fr_12rem]">
        <label className="relative block">
          <span className="sr-only">Search follow-ups</span>
          <Search size={17} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input type="search" className="field !pl-10" value={search} onChange={(event) => setParam('search', event.target.value, '')} placeholder="Search person, message or note" />
        </label>
        <SelectField label="Brand" className="[&>label]:sr-only" value={brandId} onChange={(event) => setParam('brand', event.target.value, ALL)}>
          <option value={ALL}>All brands</option>
          <option value={NO_BRAND}>General workspace</option>
          {data.brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
        </SelectField>
      </form>

      {items.length ? (
        <ul className="space-y-3">
          {items.map((item) => {
            const brand = data.brands.find((entry) => entry.id === item.brandId)
            const overdue = isOverdue(item, today)
            const late = overdue ? daysBetween(item.followUpDate, today) : 0
            return (
              <li key={item.id}>
                <Card
                  as="article"
                  className={`spine p-4 sm:p-5 ${overdue ? '!border-danger' : ''}`}
                  style={{ '--spine-colour': brand?.color || DEFAULT_BRAND_COLOUR }}
                  aria-labelledby={`item-${item.id}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 id={`item-${item.id}`} className="font-semibold text-ink">{item.person}</h2>
                        <Badge tone="neutral">{item.platform}</Badge>
                        <StatusBadge status={item.status} kind="interaction" />
                        {overdue && <Badge tone="danger">Overdue by {late} {late === 1 ? 'day' : 'days'}</Badge>}
                        {item.isSample && <Badge tone="neutral">Sample</Badge>}
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink">{item.message}</p>
                      <p className="mt-2 text-xs text-muted">
                        {brand?.name || 'General workspace'}
                        {item.followUpDate && (
                          <span className={overdue ? 'font-semibold text-danger' : undefined}> · Follow up by {formatDay(item.followUpDate)}{item.followUpDate === today ? ' (today)' : ''}</span>
                        )}
                      </p>
                      {item.notes && <p className="mt-3 rounded-lg bg-surface px-3 py-2 text-xs leading-5 text-muted">{item.notes}</p>}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-1 border-t border-line pt-3">
                    {isOpen(item) ? (
                      <Button variant="secondary" size="sm" onClick={() => { updateInteraction(item.id, { status: 'Done' }); toast.show(`Marked ${item.person} as done.`) }}>
                        <CheckCheck size={15} aria-hidden="true" /> Mark done
                      </Button>
                    ) : (
                      <Button variant="secondary" size="sm" onClick={() => { updateInteraction(item.id, { status: 'Follow up' }); toast.show(`Reopened ${item.person}.`) }}>
                        <RotateCcw size={15} aria-hidden="true" /> Reopen
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setDialog(item)}><Pencil size={15} aria-hidden="true" /> Edit</Button>
                    <button
                      type="button"
                      aria-label={`Delete follow-up for ${item.person}`}
                      title="Delete"
                      onClick={() => setDeleting(item)}
                      className="ml-auto flex size-11 items-center justify-center rounded-lg text-muted hover:bg-danger-bg hover:text-danger sm:size-9"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                </Card>
              </li>
            )
          })}
        </ul>
      ) : (
        <EmptyState
          icon={MessageSquareText}
          title={data.interactions.length ? 'Nothing in this view' : 'Keep your next follow-up visible'}
          description={data.interactions.length
            ? 'Choose another view, or change the search.'
            : 'Log a message or comment that needs a reply, set a follow-up date and add a note for the next step.'}
          action={data.interactions.length
            ? <Button variant="secondary" onClick={() => setParams({}, { replace: true })}>Show open follow-ups</Button>
            : <Button onClick={() => setDialog('new')}><Plus size={17} aria-hidden="true" /> Log interaction</Button>}
        />
      )}

      {dialog && (
        <InteractionFormModal
          key={dialog === 'new' ? 'new' : dialog.id}
          item={dialog === 'new' ? null : dialog}
          brands={data.brands}
          onSave={save}
          onClose={() => setDialog(null)}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title={`Delete the follow-up for ${deleting.person}?`}
          description="This removes it from this browser. It cannot be undone."
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  )
}

export default Engagement
