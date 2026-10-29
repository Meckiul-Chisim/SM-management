import { useState } from 'react'
import ConfirmDialog from '../ui/ConfirmDialog.jsx'

// Says exactly what deleting a brand will do before it happens. By default the
// brand's posts and follow-ups are kept and move to "General workspace".
function DeleteBrandDialog({ brand, counts, onConfirm, onCancel }) {
  const [removeRecords, setRemoveRecords] = useState(false)
  const hasRecords = counts.posts + counts.interactions > 0
  const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`

  return (
    <ConfirmDialog
      title={`Delete ${brand.name}?`}
      description="This removes the brand from this browser. It cannot be undone."
      confirmLabel={removeRecords ? 'Delete brand and records' : 'Delete brand'}
      onConfirm={() => onConfirm({ removeRecords })}
      onCancel={onCancel}
    >
      {hasRecords ? (
        <>
          <p>
            This brand has {plural(counts.posts, 'post')} and {plural(counts.interactions, 'follow-up')}.
            {removeRecords ? ' They will be deleted with it.' : ' They will be kept and moved to General workspace.'}
          </p>
          <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-ink">
            <input
              type="checkbox"
              checked={removeRecords}
              onChange={(event) => setRemoveRecords(event.target.checked)}
              className="mt-1 size-4 accent-brand-700"
            />
            <span>Also delete its {plural(counts.posts, 'post')} and {plural(counts.interactions, 'follow-up')}</span>
          </label>
        </>
      ) : (
        <p>This brand has no posts or follow-ups.</p>
      )}
    </ConfirmDialog>
  )
}

export default DeleteBrandDialog
