import { useState } from 'react'
import { Check, ChevronDown, Copy, RefreshCw, Sparkles } from 'lucide-react'
import Badge from '../ui/Badge.jsx'
import Button from '../ui/Button.jsx'
import Card from '../ui/Card.jsx'
import { SelectField, TextField } from '../ui/Field.jsx'
import { PLATFORMS } from '../../data/constants.js'
import { GOALS, TONES, VARIANT_COUNT, createPlatformDraft } from '../../utils/contentDrafts.js'
import { copyText } from '../../utils/clipboard.js'
import { useToast } from '../../hooks/useToast.js'

// Template-based starter copy. Collapsed by default so the post list stays the focus.
function DraftHelper({ brands, onUseDraft }) {
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ topic: '', audience: '', goal: 'Engagement', tone: 'Friendly', cta: '', platform: 'Instagram', brandId: '' })
  const [draft, setDraft] = useState(null)
  const [variant, setVariant] = useState(0)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const set = (name) => (event) => setForm((current) => ({ ...current, [name]: event.target.value }))

  function generate(nextVariant) {
    try {
      const brand = brands.find((item) => item.id === form.brandId)
      setDraft(createPlatformDraft({ ...form, brandName: brand?.name || '', variant: nextVariant }))
      setVariant(nextVariant)
      setError('')
    } catch (problem) {
      setDraft(null)
      setError(problem.message)
    }
  }

  async function copy() {
    const ok = await copyText(`${draft.title}\n\n${draft.caption}`)
    if (ok) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } else {
      toast.show('Copy is not available here. Select the text and copy it manually.', 'error')
    }
  }

  return (
    <Card className="mb-6 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="draft-helper-panel"
        className="flex min-h-14 w-full items-center gap-3 px-5 py-3 text-left hover:bg-surface/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-700"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-800"><Sparkles size={17} aria-hidden="true" /></span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2 font-semibold text-ink">
            Starter draft helper <Badge tone="neutral">Templates, not AI</Badge>
          </span>
          <span className="block text-xs text-muted">Turn a topic into editable starter text for one platform.</span>
        </span>
        <ChevronDown size={18} aria-hidden="true" className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div id="draft-helper-panel" className="border-t border-line">
          <form
            onSubmit={(event) => { event.preventDefault(); generate(0) }}
            className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4"
            noValidate
          >
            <TextField className="sm:col-span-2" label="Topic" required value={form.topic} onChange={set('topic')} placeholder="e.g. how we plan a week of content" error={error} />
            <SelectField label="Brand" value={form.brandId} onChange={set('brandId')}>
              <option value="">General workspace</option>
              {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
            </SelectField>
            <SelectField label="Platform" value={form.platform} onChange={set('platform')}>
              {PLATFORMS.map((platform) => <option key={platform} value={platform}>{platform}</option>)}
            </SelectField>
            <TextField label="Audience" value={form.audience} onChange={set('audience')} placeholder="e.g. early-stage founders" />
            <SelectField label="Goal" value={form.goal} onChange={set('goal')}>
              {GOALS.map((goal) => <option key={goal} value={goal}>{goal}</option>)}
            </SelectField>
            <SelectField label="Tone" value={form.tone} onChange={set('tone')}>
              {TONES.map((tone) => <option key={tone} value={tone}>{tone}</option>)}
            </SelectField>
            <TextField label="Call to action (optional)" value={form.cta} onChange={set('cta')} placeholder="e.g. Send us a message" />
            <div className="sm:col-span-2 xl:col-span-4">
              <Button type="submit"><Sparkles size={16} aria-hidden="true" /> Create starter text</Button>
            </div>
          </form>

          {draft && (
            <div className="border-t border-line bg-surface/60 p-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-brand-800">Version {variant + 1} of {VARIANT_COUNT} for {draft.platform}</p>
                  <h3 className="break-words font-semibold text-ink">{draft.title}</h3>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button variant="ghost" size="sm" onClick={() => generate((variant + 1) % VARIANT_COUNT)}><RefreshCw size={15} aria-hidden="true" /> Try another</Button>
                  <Button variant="secondary" size="sm" onClick={copy}>{copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}{copied ? 'Copied' : 'Copy'}</Button>
                  <Button size="sm" onClick={() => onUseDraft({ title: draft.title, caption: draft.caption, platform: form.platform, brandId: form.brandId, status: 'Draft' })}>Edit and save</Button>
                </div>
              </div>
              <pre className="mt-4 whitespace-pre-wrap break-words rounded-lg border border-line bg-panel p-4 font-sans text-sm leading-6 text-ink">{draft.caption}</pre>
              <p className="mt-3 text-xs leading-5 text-muted">{draft.disclosure}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

export default DraftHelper
