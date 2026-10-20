import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Check, Copy, FileText, Pencil, Plus, Search, Sparkles, Trash2 } from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import Modal from '../components/ui/Modal.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import { PLATFORMS, useWorkspace } from '../context/WorkspaceContext.jsx'
import { createPlatformDraft } from '../utils/contentDrafts.js'

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
  if (status === 'Published') return 'bg-success-bg text-success'
  if (status === 'Planned') return 'bg-info-bg text-info'
  if (status === 'Ready') return 'bg-warning-bg text-warning'
  return 'bg-brand-50 text-brand-800'
}

function ContentStudio() {
  const { data, addPost, updatePost, deletePost } = useWorkspace()
  const [searchParams] = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(blankForm)
  const [search, setSearch] = useState(() => searchParams.get('search') || '')
  const [filter, setFilter] = useState('All')
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState('')
  const [ideaForm, setIdeaForm] = useState({
    topic: '',
    audience: '',
    goal: 'Engagement',
    tone: 'Friendly',
    cta: '',
    platform: 'Instagram',
    brandId: '',
  })
  const [generated, setGenerated] = useState(null)
  const [ideaError, setIdeaError] = useState('')

  useEffect(() => {
    setSearch(searchParams.get('search') || '')
  }, [searchParams])

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

  function generateStarter(event) {
    event.preventDefault()
    try {
      const brand = data.brands.find((item) => item.id === ideaForm.brandId)
      setGenerated(createPlatformDraft({
        ...ideaForm,
        brandName: brand?.name || '',
      }))
      setIdeaError('')
    } catch (generateError) {
      setGenerated(null)
      setIdeaError(generateError.message || 'Add a topic to generate a starter draft.')
    }
  }

  async function copyGenerated() {
    if (!generated) return
    try {
      await navigator.clipboard.writeText(`${generated.title}\n\n${generated.caption}`)
      setCopiedId('generated')
      window.setTimeout(() => setCopiedId(''), 1800)
    } catch {
      window.alert('Clipboard access is unavailable. Select and copy the generated text manually.')
    }
  }

  function useGenerated() {
    if (!generated) return
    setEditingId(null)
    setForm({
      ...blankForm,
      title: generated.title,
      caption: generated.caption,
      brandId: ideaForm.brandId,
      platform: ideaForm.platform,
      status: 'Draft',
    })
    setError('')
    setIsOpen(true)
  }

  function startRepurpose(post) {
    const currentIndex = PLATFORMS.indexOf(post.platform)
    const nextPlatform = PLATFORMS[(currentIndex + 1 + PLATFORMS.length) % PLATFORMS.length] || 'Instagram'
    setEditingId(null)
    setForm({
      ...blankForm,
      title: `${post.title || 'Untitled post'} — ${nextPlatform} version`,
      caption: post.caption || '',
      brandId: post.brandId || '',
      platform: nextPlatform,
      status: 'Draft',
    })
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

      <Card className="mb-5 overflow-hidden">
        <div className="flex items-start gap-3 border-b border-line bg-surface px-5 py-4 sm:px-6">
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-brand-100 bg-panel-raised text-brand-800"><Sparkles size={19} /></span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold tracking-tight text-ink">Idea-to-draft helper</h2>
              <span className="rounded-full border border-brand-100 bg-panel-raised px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-800">No API needed</span>
            </div>
            <p className="mt-1 text-sm leading-5 text-muted">Turn a topic into a platform-shaped starting point using built-in templates. Edit the result before saving or publishing.</p>
          </div>
        </div>
        <form onSubmit={generateStarter} className="p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="sm:col-span-2 xl:col-span-2">
              <label className="field-label" htmlFor="idea-topic">What do you want to post about? *</label>
              <input id="idea-topic" className="field" value={ideaForm.topic} onChange={(event) => setIdeaForm({ ...ideaForm, topic: event.target.value })} placeholder="e.g. how we plan a week of content" />
            </div>
            <div>
              <label className="field-label" htmlFor="idea-brand">Brand</label>
              <select id="idea-brand" className="field" value={ideaForm.brandId} onChange={(event) => setIdeaForm({ ...ideaForm, brandId: event.target.value })}>
                <option value="">General workspace</option>
                {data.brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="idea-platform">Target platform</label>
              <select id="idea-platform" className="field" value={ideaForm.platform} onChange={(event) => setIdeaForm({ ...ideaForm, platform: event.target.value })}>
                {PLATFORMS.map((platform) => <option key={platform} value={platform}>{platform}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="idea-audience">Audience</label>
              <input id="idea-audience" className="field" value={ideaForm.audience} onChange={(event) => setIdeaForm({ ...ideaForm, audience: event.target.value })} placeholder="e.g. early-stage founders" />
            </div>
            <div>
              <label className="field-label" htmlFor="idea-goal">Post goal</label>
              <select id="idea-goal" className="field" value={ideaForm.goal} onChange={(event) => setIdeaForm({ ...ideaForm, goal: event.target.value })}>
                {['Awareness', 'Engagement', 'Traffic', 'Leads', 'Sales'].map((goal) => <option key={goal} value={goal}>{goal}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="idea-tone">Writing tone</label>
              <select id="idea-tone" className="field" value={ideaForm.tone} onChange={(event) => setIdeaForm({ ...ideaForm, tone: event.target.value })}>
                {['Friendly', 'Professional', 'Direct', 'Bold', 'Educational'].map((tone) => <option key={tone} value={tone}>{tone}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 xl:col-span-4">
              <label className="field-label" htmlFor="idea-cta">Call to action (optional)</label>
              <input id="idea-cta" className="field" value={ideaForm.cta} onChange={(event) => setIdeaForm({ ...ideaForm, cta: event.target.value })} placeholder="e.g. Send us a message to get started" />
            </div>
          </div>
          {ideaError && <p role="alert" className="mt-3 text-sm text-danger">{ideaError}</p>}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-xl text-xs leading-5 text-muted">Template-based helper, not AI. It makes no external API calls and does not invent performance statistics.</p>
            <Button type="submit"><Sparkles size={16} /> Generate starter draft</Button>
          </div>
        </form>
        {generated && (
          <div className="border-t border-line bg-surface/60 p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div className="min-w-0">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-800">Starter preview · {generated.platform}</p>
                <h3 className="break-words font-semibold text-ink">{generated.title}</h3>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button variant="secondary" className="min-h-9 px-3" onClick={copyGenerated}>{copiedId === 'generated' ? <Check size={15} /> : <Copy size={15} />}{copiedId === 'generated' ? 'Copied' : 'Copy preview'}</Button>
                <Button className="min-h-9 px-3" onClick={useGenerated}>Edit & save <Plus size={15} /></Button>
              </div>
            </div>
            <pre className="mt-4 whitespace-pre-wrap break-words rounded-xl border border-line bg-panel-raised p-4 font-sans text-sm leading-6 text-ink">{generated.caption}</pre>
            <p className="mt-3 text-xs leading-5 text-muted">{generated.disclosure}</p>
          </div>
        )}
      </Card>

      <div className="mb-5 notice notice-info">
        Drafts and in-app plans are stored locally. Publishing to social accounts is not connected yet. Use Copy to move text into your chosen platform.
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
                    <Button variant="ghost" className="min-h-9 px-3" onClick={() => startRepurpose(post)}><Sparkles size={15} /> Repurpose</Button>
                    <button type="button" aria-label={`Delete ${post.title}`} onClick={() => removePost(post)} className="ml-auto flex size-9 items-center justify-center rounded-lg text-muted hover:bg-danger-bg hover:text-danger"><Trash2 size={16} /></button>
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
            {error && <p role="alert" className="text-sm text-danger">{error}</p>}
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
