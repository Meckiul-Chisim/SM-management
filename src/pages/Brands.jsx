import { useState } from 'react'
import { Pencil, Plus, Trash2, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import BrandFormModal from '../components/brands/BrandFormModal.jsx'
import DeleteBrandDialog from '../components/brands/DeleteBrandDialog.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Notice from '../components/ui/Notice.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import { countBrandRecords } from '../data/workspaceReducer.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { useToast } from '../hooks/useToast.js'
import { useWorkspace } from '../hooks/useWorkspace.js'
import { DEFAULT_BRAND_COLOUR, readableTextColour } from '../utils/colour.js'

function Brands() {
  useDocumentTitle('Brands & accounts')
  const { data, addBrand, updateBrand, deleteBrand } = useWorkspace()
  const toast = useToast()
  // null = closed, 'new' = creating, a brand = editing it.
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  function save(values) {
    if (editing === 'new') {
      addBrand(values)
      toast.show(`${values.name} added.`)
    } else {
      updateBrand(editing.id, values)
      toast.show(`${values.name} updated.`)
    }
    setEditing(null)
  }

  function confirmDelete({ removeRecords }) {
    const counts = countBrandRecords(data, deleting.id)
    deleteBrand(deleting.id, { removeRecords })
    const moved = counts.posts + counts.interactions
    toast.show(
      removeRecords || moved === 0
        ? `${deleting.name} deleted.`
        : `${deleting.name} deleted. Its ${moved === 1 ? 'record was' : 'records were'} moved to General workspace.`,
    )
    setDeleting(null)
  }

  return (
    <div className="haven-route haven-route--brands">
      <PageHeader
        title="Brands & accounts"
        description="Keep brand identities and social profile references organised in one place."
        actions={<Button onClick={() => setEditing('new')}><Plus size={17} aria-hidden="true" /> Add brand</Button>}
      />

      <Notice tone="info" className="mb-5">
        Social handles are saved as notes only. Connecting accounts, checking access and publishing through social platforms are not part of this app.
      </Notice>

      {data.brands.length ? (
        <ul className="grid gap-4 lg:grid-cols-2">
          {data.brands.map((brand) => {
            const counts = countBrandRecords(data, brand.id)
            return (
              <li key={brand.id}>
                <Card as="article" className="h-full overflow-hidden" aria-labelledby={`brand-${brand.id}`}>
                  <div className="flex items-start gap-4 p-5">
                    <span
                      className="flex size-11 shrink-0 items-center justify-center rounded-lg font-display text-lg font-semibold"
                      style={{ backgroundColor: brand.color || DEFAULT_BRAND_COLOUR, color: readableTextColour(brand.color) }}
                      aria-hidden="true"
                    >
                      {brand.name.trim().slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 id={`brand-${brand.id}`} className="truncate text-base font-semibold text-ink">{brand.name}</h2>
                        {brand.isSample && <Badge tone="neutral">Sample</Badge>}
                      </div>
                      <p className="mt-0.5 text-xs text-muted">{brand.industry || 'No category'}</p>
                      <p className="mt-2 text-xs text-muted">
                        <Link to={`/content?brand=${brand.id}`} className="font-semibold text-brand-800 underline-offset-2 hover:underline">
                          {counts.posts} {counts.posts === 1 ? 'post' : 'posts'}
                        </Link>
                        {' · '}
                        <Link to={`/engagement?brand=${brand.id}`} className="font-semibold text-brand-800 underline-offset-2 hover:underline">
                          {counts.interactions} {counts.interactions === 1 ? 'follow-up' : 'follow-ups'}
                        </Link>
                      </p>
                    </div>
                    <div className="-mr-2 flex shrink-0">
                      <button
                        type="button"
                        aria-label={`Edit ${brand.name}`}
                        title="Edit"
                        onClick={() => setEditing(brand)}
                        className="flex size-11 items-center justify-center rounded-lg text-muted hover:bg-surface hover:text-ink sm:size-10"
                      >
                        <Pencil size={16} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${brand.name}`}
                        title="Delete"
                        onClick={() => setDeleting(brand)}
                        className="flex size-11 items-center justify-center rounded-lg text-muted hover:bg-danger-bg hover:text-danger sm:size-10"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <div className="border-t border-line bg-surface/60 p-4">
                    {brand.accounts.length ? (
                      <ul className="space-y-2">
                        {brand.accounts.map((account) => (
                          <li key={account.platform} className="flex items-center gap-3 rounded-lg bg-panel px-3 py-2.5">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-ink">{account.platform}</p>
                              <p className="truncate text-xs text-muted">{account.handle || 'No handle added'}</p>
                            </div>
                            <Badge tone="neutral">Note only</Badge>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="px-1 py-2 text-sm text-muted">No social profile references yet. Edit this brand to add some.</p>
                    )}
                  </div>
                </Card>
              </li>
            )
          })}
        </ul>
      ) : (
        <EmptyState
          icon={UsersRound}
          title="No brands yet"
          description="Create a brand to organise its content and keep profile references together. Posts can also be created without one."
          action={<Button onClick={() => setEditing('new')}><Plus size={17} aria-hidden="true" /> Add your first brand</Button>}
        />
      )}

      {editing && (
        <BrandFormModal
          brand={editing === 'new' ? null : editing}
          brands={data.brands}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}
      {deleting && (
        <DeleteBrandDialog
          brand={deleting}
          counts={countBrandRecords(data, deleting.id)}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  )
}

export default Brands
