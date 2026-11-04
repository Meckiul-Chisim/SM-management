import { Check, Copy, CopyPlus, ExternalLink, Layers, Paperclip, Pencil, Trash2, Upload } from 'lucide-react'
import Button from '../ui/Button.jsx'
import Card from '../ui/Card.jsx'
import Badge from '../ui/Badge.jsx'
import { POST_STATUSES } from '../../data/constants.js'
import { DEFAULT_BRAND_COLOUR } from '../../utils/colour.js'
import { formatDateTime } from '../../utils/dates.js'

// One post. The status can be changed right here; moving to Planned without a date
// opens the editor so a date can be chosen (a plan always needs a date).
function PostCard({ post, brand, copied, highlighted, onCopy, onEdit, onRepurpose, onDuplicate, onDelete, onStatusChange, onUpload }) {
  const canUploadToYouTube = post.platform === 'YouTube' && post.media?.type?.startsWith('video/') && !post.youtube
  return (
    <Card
      as="article"
      id={`post-${post.id}`}
      aria-labelledby={`post-title-${post.id}`}
      className={`spine lift flex min-w-0 flex-col p-5 ${highlighted ? 'ring-2 ring-brand-700' : ''}`}
      style={{ '--spine-colour': brand?.color || DEFAULT_BRAND_COLOUR }}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h2 id={`post-title-${post.id}`} className="break-words font-sans text-base font-semibold tracking-normal text-ink">{post.title}</h2>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted">
            <span className="truncate">{brand?.name || 'General workspace'}</span>
            <span aria-hidden="true">·</span>
            <span>{post.platform}</span>
            {post.isSample && <Badge tone="neutral">Sample</Badge>}
          </p>
        </div>
        <label className="shrink-0">
          <span className="sr-only">Status of {post.title}</span>
          <select
            value={post.status}
            onChange={(event) => onStatusChange(event.target.value)}
            className="rounded-md border border-line bg-surface px-2 py-1.5 text-xs font-medium text-ink hover:border-brand-100 focus-visible:outline-2 focus-visible:outline-brand-700"
          >
            {POST_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
      </div>

      <p className="mt-4 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-muted">{post.caption || 'No text yet.'}</p>

      {post.media && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
          <Paperclip size={13} aria-hidden="true" className="shrink-0" />
          <span className="truncate">{post.media.name}</span>
        </p>
      )}

      <div className="mt-auto pt-5">
        {post.scheduledAt && (
          <p className="mb-3 text-xs text-muted">
            {post.status === 'Published' ? 'Posted' : 'Planned for'} {formatDateTime(post.scheduledAt)}
            {post.status === 'Planned' && ' · plan only, not scheduled on the platform'}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-1 border-t border-line pt-3">
          <Button variant="ghost" size="sm" onClick={onCopy}>
            {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
            {copied ? 'Copied' : 'Copy text'}
          </Button>
          {canUploadToYouTube && (
            <Button variant="ghost" size="sm" onClick={onUpload}><Upload size={15} aria-hidden="true" /> Upload to YouTube</Button>
          )}
          {post.youtube && (
            <a href={post.youtube.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-brand-700 hover:underline sm:min-h-9">
              <ExternalLink size={15} aria-hidden="true" /> Watch on YouTube
            </a>
          )}
          <Button variant="ghost" size="sm" onClick={onEdit}><Pencil size={15} aria-hidden="true" /> Edit</Button>
          <Button variant="ghost" size="sm" onClick={onRepurpose}><Layers size={15} aria-hidden="true" /> Repurpose</Button>
          <Button variant="ghost" size="sm" onClick={onDuplicate}><CopyPlus size={15} aria-hidden="true" /> Duplicate</Button>
          <button
            type="button"
            aria-label={`Delete ${post.title}`}
            title="Delete"
            onClick={onDelete}
            className="ml-auto flex size-11 items-center justify-center rounded-lg text-muted hover:bg-danger-bg hover:text-danger sm:size-9"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </Card>
  )
}

export default PostCard
