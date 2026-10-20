import { useMemo, useState } from 'react'
import { Check, Copy, FileText, Pencil, Plus, Search, Sparkles, Trash2 } from 'lucide-react'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import Modal from '../components/ui/Modal.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import { PLATFORMS, useWorkspace } from '../context/WorkspaceContext.jsx'

const statuses = ['Draft', 'Ready', 'Planned', 'Published']
const blankForm = {
  title: '',
  caption: '',
  brandId: '',
  platform: 'Instagram',
  status: 'Draft',
  scheduledAt: '',
}

function statusClass(status) {
  if (status === 'Published') return 'bg-emerald-50 text-emerald-700'
  if (status === 'Planned') return 'bg-sky-50 text-sky-700'
  if (status === 'Ready') return 'bg-amber-50 text-amber-700'
  return 'bg-brand-50 text-brand-800'
}

function ContentStudio() {
  const { data, addPost, updatePost, deletePost } = useWorkspace()
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(blankForm)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState('')

  const filteredPosts = useMemo(() => data.posts
    .filter((post) => {
      const query = search.trim().toLowerCase()
      const matchesSearch = !query || `${post.title} ${post.caption} ${post.platform}`.toLowerCase().includes(query)
      return matchesSearch && (filter === 'All' || post.status === filter)
    })
    .sort((a, b) => (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || '')),
  [data.posts, search, filter])

  function openCreate() {
    setEditingId(null)
    setForm({ ...blankForm, brandId: data.brands[0]?.id || '' })
    setError('')
    setIsOpen(true)
  }

  function openEdit(post) {
    setEditingId(post.id)
    setForm({
      title: post.title || '',
      caption: post.caption || '',
      brandId: post.brandId || '',
      platform: post.platform || 'Instagram',
      status: post.status || 'Draft',
      scheduledAt: post.scheduledAt || '',
    })
    setError('')
    setIsOpen(true)
  }

  function submit(event) {
    event.preventDefault()
    if (!form.title.trim() && !form.caption.trim()) {
      setError('Add a title or some post copy before saving.')
      return
    }
    if (form.status === 'Planned' && !form.scheduledAt) {
      setError('Choose a date and time for a planned post.')
      return
    }
    const payload = { ...form, title: form.title.trim() || 'Untitled post', caption: form.caption.trim() }
    if (editingId) updatePost(editingId, payload)
    else addPost(payload)
    setIsOpen(false)
  }

  async function copyCaption(post) {
    try {
      await navigator.clipboard.writeText(post.caption || post.title || '')
      setCopiedId(post.id)
      window.setTimeout(() => setCopiedId(''), 1800)
    } catch {
      setCopiedId('')
      window.alert('Clipboard access is unavailable. Select and copy the post text manually.')
    }
  }

  function removePost(post) {
    if (window.confirm(`Delete “${post.title || 'Untitled post'}”?`)) deletePost(post.id)
  }

  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <PageHeader title="Content studio" description="Write, organise, and prepare platform-specific content for each brand." />
        <Button onClick={openCreate} className="mb-7 self-start sm:self-auto"><Plus size={17} /> New post</Button>
      </div>

      <div className="mb-5 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm leading-5 text-sky-900">
        This studio stores drafts and in-app plans. It does not publish directly to social accounts yet. Use Copy to move text into your chosen platform.
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <label className="relative min-w-0 flex-1">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input className="field pl-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search posts and captions" aria-label="Search posts" />
        </label>
        <select className="field sm:w-48" value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter by status">
          {['All', ...statuses].map((status) => <option key={status} value={status}>{status === 'All' ? 'All statuses' : status}</option>)}
        </select>
      </div>

      {filteredPosts.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredPosts.map((post) => {
            const brand = data.brands.find((item) => item.id === post.brandId)
            return (
              <Card key={post.id} className="flex min-w-0 flex-col p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-800"><FileText size={19} /></span>
                  <div className="min-w-0 flex-1">
                    <h2 className="break-words font-semibold text-ink">{post.title || 'Untitled post'}</h2>
                    <p className="mt-1 truncate text-xs text-muted">{brand?.name || 'General workspace'} · {post.platform}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(post.status)}`}>{post.status}</span>
                </div>
                <p className="mt-4 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-muted">{post.caption || 'No caption added yet.'}</p>
                <div className="mt-auto pt-5">
                  {post.scheduledAt && (
                    <p className="mb-4 text-xs text-muted">Planned for {new Date(post.scheduledAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
                    <Button variant="secondary" className="min-h-9 px-3" onClick={() => copyCaption(post)}>
                      {copiedId === post.id ? <Check size={15} /> : <Copy size={15} />}
                      {copiedId === post.id ? 'Copied' : 'Copy text'}
                    </Button>
                    <Button variant="ghost" className="min-h-9 px-3" onClick={() => openEdit(post)}><Pencil size={15} /> Edit</Button>
                    <button type="button" aria-label={`Delete ${post.title}`} onClick={() => removePost(post)} className="ml-auto flex size-9 items-center justify-center rounded-lg text-muted hover:bg-rose-50 hover:text-rose-700"><Trash2 size={16} /></button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
          <Sparkles size={25} className="text-brand-700" />
          <h2 className="mt-4 text-base font-semibold text-ink">{data.posts.length ? 'No posts match those filters' : 'Start with your first post'}</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted">{data.posts.length ? 'Try a different search or status.' : 'Write a caption, choose the brand and platform, then save it as a draft or plan it for the calendar.'}</p>
          {!data.posts.length && <Button className="mt-5" onClick={openCreate}><Plus size={17} /> Create a post</Button>}
        </Card>
      )}

      {isOpen && (
        <Modal title={editingId ? 'Edit post' : 'Create a post'} description="Save a draft or add a planned date. Posting to platforms is not connected yet." onClose={() => setIsOpen(false)} wide>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="field-label" htmlFor="post-title">Internal title</label>
              <input id="post-title" className="field" autoFocus value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. Behind the scenes, launch teaser" />
            </div>
            <div>
              <label className="field-label" htmlFor="post-caption">Post copy / caption</label>
              <textarea id="post-caption" className="field" value={form.caption} onChange={(event) => setForm({ ...form, caption: event.target.value })} placeholder="Write the text you want to publish…" />
              <p className="field-help">{form.caption.length} characters · You can copy this into the social platform later.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="post-brand">Brand</label>
                <select id="post-brand" className="field" value={form.brandId} onChange={(event) => setForm({ ...form, brandId: event.target.value })}>
                  <option value="">General workspace</option>
                  {data.brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label" htmlFor="post-platform">Platform</label>
                <select id="post-platform" className="field" value={form.platform} onChange={(event) => setForm({ ...form, platform: event.target.value })}>
                  {PLATFORMS.map((platform) => <option key={platform} value={platform}>{platform}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label" htmlFor="post-status">Workflow status</label>
                <select id="post-status" className="field" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label" htmlFor="post-schedule">Planned date & time</label>
                <input id="post-schedule" type="datetime-local" className="field" value={form.scheduledAt} onChange={(event) => setForm({ ...form, scheduledAt: event.target.value })} />
                <p className="field-help">Required for the Planned status. This is an in-app plan only.</p>
              </div>
            </div>
            {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
            <div className="flex justify-end gap-2 border-t border-line pt-4">
              <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">{editingId ? 'Save changes' : 'Save post'}</Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}

export default ContentStudio
