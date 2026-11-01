import { ChevronLeft, ChevronRight, Pencil } from 'lucide-react'
import Card from '../ui/Card.jsx'
import Badge from '../ui/Badge.jsx'
import { POST_STATUSES } from '../../data/constants.js'
import { DEFAULT_BRAND_COLOUR } from '../../utils/colour.js'
import { formatDateTime } from '../../utils/dates.js'

// A compact post for the pipeline board. Posts move between columns with the arrow
// buttons (no drag and drop, so it works the same with a keyboard or a touch screen).
function BoardCard({ post, brand, onEdit, onStatusChange }) {
  const index = POST_STATUSES.indexOf(post.status)
  const previous = POST_STATUSES[index - 1]
  const next = POST_STATUSES[index + 1]
  const arrow = 'flex size-11 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink disabled:opacity-30 sm:size-9'

  return (
    <Card
      as="article"
      aria-labelledby={`board-title-${post.id}`}
      className="spine lift p-4"
      style={{ '--spine-colour': brand?.color || DEFAULT_BRAND_COLOUR }}
    >
      <h3 id={`board-title-${post.id}`} className="break-words font-sans text-sm font-semibold leading-snug tracking-normal text-ink">{post.title}</h3>
      <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted">
        <span className="truncate">{brand?.name || 'General workspace'}</span>
        <span aria-hidden="true">·</span>
        <span>{post.platform}</span>
        {post.isSample && <Badge tone="neutral">Sample</Badge>}
      </p>
      {post.caption && <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">{post.caption}</p>}
      {post.scheduledAt && <p className="mt-2 text-xs font-medium text-gold-ink">{formatDateTime(post.scheduledAt)}</p>}
      <div className="mt-3 flex items-center justify-between border-t border-line pt-2">
        <button type="button" className={arrow} disabled={!previous} onClick={() => onStatusChange(previous)} aria-label={previous ? `Move ${post.title} back to ${previous}` : 'Already first stage'}>
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        <button type="button" className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-muted hover:bg-surface hover:text-ink sm:min-h-9" onClick={onEdit}>
          <Pencil size={14} aria-hidden="true" /> Edit
        </button>
        <button type="button" className={arrow} disabled={!next} onClick={() => onStatusChange(next)} aria-label={next ? `Move ${post.title} forward to ${next}` : 'Already last stage'}>
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </Card>
  )
}

export default BoardCard
