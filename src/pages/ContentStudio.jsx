import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Search, Sparkles } from 'lucide-react'
import DraftHelper from '../components/content/DraftHelper.jsx'
import PostCard from '../components/content/PostCard.jsx'
import PostFormModal from '../components/content/PostFormModal.jsx'
import Button from '../components/ui/Button.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { SelectField } from '../components/ui/Field.jsx'
import Notice from '../components/ui/Notice.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import { PLATFORMS, POST_STATUSES } from '../data/constants.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { useToast } from '../hooks/useToast.js'
import { useWorkspace } from '../hooks/useWorkspace.js'
import { copyText } from '../utils/clipboard.js'
import { isValidDateKey } from '../utils/dates.js'
import { ALL, NO_BRAND, filterPosts, sortPosts } from '../utils/filters.js'

// Filters live in the address (?search=&brand=&platform=&status=) so a filtered view
// can be bookmarked, and links from other pages (dashboard, brands) land on it.
function ContentStudio() {
  useDocumentTitle('Content studio')
  const { data, addPost, updatePost, deletePost } = useWorkspace()
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  // null = closed. { post } edits a post; { initial } starts a new one with some fields filled in.
  const [dialog, setDialog] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [copiedId, setCopiedId] = useState('')

  const filters = {
    search: params.get('search') || '',
    brandId: params.get('brand') || ALL,
    platform: params.get('platform') || ALL,
    status: params.get('status') || ALL,
  }
  const filtersActive = Object.entries(filters).some(([key, value]) => value !== (key === 'search' ? '' : ALL))

  function setFilter(name, value) {
    const next = new URLSearchParams(params)
    if (!value || value === ALL) next.delete(name)
    else next.set(name, value)
    setParams(next, { replace: true })
  }

  // One-off instructions from other pages: ?new=1[&date=YYYY-MM-DD] and ?post=<id>.
  // They open the dialog once and are then removed from the address.
  useEffect(() => {
    const wantsNew = params.get('new') === '1'
    const postId = params.get('post')
    if (!wantsNew && !postId) return
    if (wantsNew) {
      const date = params.get('date')
      setDialog({ initial: isValidDateKey(date) ? { status: 'Planned', scheduledAt: `${date}T09:00` } : {} })
    } else {
      const post = data.posts.find((item) => item.id === postId)
      if (post) setDialog({ post })
      else toast.show('That post no longer exists.', 'info')
    }
    const next = new URLSearchParams(params)
    ;['new', 'date', 'post'].forEach((key) => next.delete(key))
    setParams(next, { replace: true })
  }, [params, setParams, data.posts, toast])

  const posts = useMemo(
    () => sortPosts(filterPosts(data.posts, filters, data.brands)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.posts, data.brands, filters.search, filters.brandId, filters.platform, filters.status],
  )

  function save(values) {
    if (dialog.post) {
      updatePost(dialog.post.id, values)
      toast.show('Post saved.')
    } else {
      addPost(values)
      toast.show('Post created.')
    }
    setDialog(null)
  }

  function changeStatus(post, status) {
    if (status === 'Planned' && !post.scheduledAt) {
      // A plan needs a date, so ask for one instead of saving a half-valid post.
      setDialog({ post: { ...post, status } })
      toast.show('Choose a date and time to plan this post.', 'info')
      return
    }
    updatePost(post.id, { status })
    toast.show(`Marked as ${status}.`)
  }

  function repurpose(post) {
    const next = PLATFORMS[(PLATFORMS.indexOf(post.platform) + 1) % PLATFORMS.length]
    setDialog({
      initial: {
        title: `${post.title} (${next})`,
        caption: post.caption,
        brandId: post.brandId,
        platform: next,
        status: 'Draft',
      },
    })
  }

  async function copy(post) {
    const ok = await copyText(post.caption || post.title)
    if (ok) {
      setCopiedId(post.id)
      window.setTimeout(() => setCopiedId((current) => (current === post.id ? '' : current)), 1800)
    } else {
      toast.show('Copy is not available here. Open the post and copy the text manually.', 'error')
    }
  }

  function confirmDelete() {
    deletePost(deleting.id)
    toast.show(`“${deleting.title}” deleted.`)
    setDeleting(null)
  }

  const newPost = () => setDialog({ initial: {} })

  return (
    <>
      <PageHeader
        title="Content studio"
        description="Write, organise and prepare posts for each brand."
        actions={<Button onClick={newPost}><Plus size={17} aria-hidden="true" /> New post</Button>}
      />

      <DraftHelper brands={data.brands} onUseDraft={(initial) => setDialog({ initial })} />

      <Notice tone="info" className="mb-5">
        Posts are stored in this browser. This app does not publish to social platforms: copy the text and post it yourself, then mark the post as Published.
      </Notice>

      <form role="search" onSubmit={(event) => event.preventDefault()} className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_11rem_10rem_10rem]">
        <label className="relative block sm:col-span-2 lg:col-span-1">
          <span className="sr-only">Search posts</span>
          <Search size={17} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input
            type="search"
            className="field !pl-10"
            value={filters.search}
            onChange={(event) => setFilter('search', event.target.value)}
            placeholder="Search title, text or brand"
          />
        </label>
        <SelectField label="Brand" className="[&>label]:sr-only" value={filters.brandId} onChange={(event) => setFilter('brand', event.target.value)}>
          <option value={ALL}>All brands</option>
          <option value={NO_BRAND}>General workspace</option>
          {data.brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
        </SelectField>
        <SelectField label="Platform" className="[&>label]:sr-only" value={filters.platform} onChange={(event) => setFilter('platform', event.target.value)}>
          <option value={ALL}>All platforms</option>
          {PLATFORMS.map((platform) => <option key={platform} value={platform}>{platform}</option>)}
        </SelectField>
        <SelectField label="Status" className="[&>label]:sr-only" value={filters.status} onChange={(event) => setFilter('status', event.target.value)}>
          <option value={ALL}>All statuses</option>
          {POST_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
        </SelectField>
      </form>

      <div className="mb-4 flex min-h-8 items-center justify-between gap-3 text-sm text-muted" aria-live="polite">
        <p>{posts.length} {posts.length === 1 ? 'post' : 'posts'}{filtersActive ? ` of ${data.posts.length}` : ''}</p>
        {filtersActive && (
          <Button variant="ghost" size="sm" onClick={() => setParams({}, { replace: true })}>Clear filters</Button>
        )}
      </div>

      {posts.length ? (
        <ul className="grid gap-4 lg:grid-cols-2">
          {posts.map((post) => (
            <li key={post.id} className="min-w-0">
              <PostCard
                post={post}
                brand={data.brands.find((item) => item.id === post.brandId)}
                copied={copiedId === post.id}
                onCopy={() => copy(post)}
                onEdit={() => setDialog({ post })}
                onRepurpose={() => repurpose(post)}
                onDelete={() => setDeleting(post)}
                onStatusChange={(status) => changeStatus(post, status)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Sparkles}
          title={data.posts.length ? 'No posts match these filters' : 'Start with your first post'}
          description={data.posts.length
            ? 'Try a different search, or clear the filters.'
            : 'Write some text, choose a brand and platform, then save it as a draft or plan it on the calendar.'}
          action={data.posts.length
            ? <Button variant="secondary" onClick={() => setParams({}, { replace: true })}>Clear filters</Button>
            : <Button onClick={newPost}><Plus size={17} aria-hidden="true" /> Create a post</Button>}
        />
      )}

      {dialog && (
        <PostFormModal
          key={dialog.post?.id || 'new'}
          post={dialog.post && data.posts.some((item) => item.id === dialog.post.id) ? dialog.post : null}
          initial={dialog.post ? undefined : dialog.initial}
          brands={data.brands}
          onSave={save}
          onClose={() => setDialog(null)}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title={`Delete “${deleting.title}”?`}
          description="This removes the post from this browser. It cannot be undone."
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  )
}

export default ContentStudio
