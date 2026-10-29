import { useRef, useState } from 'react'
import { Download, Upload } from 'lucide-react'
import Button from '../ui/Button.jsx'
import Card from '../ui/Card.jsx'
import ConfirmDialog from '../ui/ConfirmDialog.jsx'
import Notice from '../ui/Notice.jsx'
import { backupFilename, buildBackup, parseBackup } from '../../data/backup.js'
import { LIMITS } from '../../data/constants.js'
import { useToast } from '../../hooks/useToast.js'
import { useWorkspace } from '../../hooks/useWorkspace.js'

const SHOWN = 5
const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`

// Export is a plain download. Import is two steps: the file is read and fully
// checked first, the person sees what it contains, and only then is the current
// workspace replaced. A bad file never changes anything.
function BackupSection() {
  const { data, replaceWorkspace } = useWorkspace()
  const toast = useToast()
  const inputRef = useRef(null)
  const [result, setResult] = useState(null) // { fileName, ...parseBackup() } | { fileName, readError }
  const [confirming, setConfirming] = useState(false)

  function exportBackup() {
    const file = new Blob([JSON.stringify(buildBackup(data), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = backupFilename(data.workspaceName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    toast.show(`Backup downloaded as ${link.download}.`)
  }

  function chooseFile(event) {
    const file = event.target.files?.[0]
    event.target.value = '' // lets the same file be chosen again later
    if (!file) return
    if (file.size > LIMITS.importBytes) {
      setResult({ fileName: file.name, ok: false, errors: ['The file is too large to be a workspace backup.'], warnings: [] })
      return
    }
    const reader = new FileReader()
    reader.onload = () => setResult({ fileName: file.name, ...parseBackup(String(reader.result)) })
    reader.onerror = () => setResult({ fileName: file.name, ok: false, errors: ['The file could not be read.'], warnings: [] })
    reader.readAsText(file)
  }

  function applyImport() {
    replaceWorkspace(result.data)
    toast.show(`Backup restored: ${plural(result.summary.brands, 'brand')}, ${plural(result.summary.posts, 'post')}, ${plural(result.summary.interactions, 'follow-up')}.`)
    setConfirming(false)
    setResult(null)
  }

  const list = (items) => (
    <ul className="mt-1 list-disc space-y-0.5 pl-5">
      {items.slice(0, SHOWN).map((item, index) => <li key={index}>{item}</li>)}
      {items.length > SHOWN && <li>and {items.length - SHOWN} more</li>}
    </ul>
  )

  return (
    <Card className="p-5 sm:p-6">
      <h2 className="font-semibold text-ink">Backup and restore</h2>
      <p className="mt-1 text-sm leading-6 text-muted">
        Your workspace lives only in this browser. Export a file to keep a copy or move it to another browser.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Button onClick={exportBackup}><Download size={16} aria-hidden="true" /> Export backup</Button>
        <Button variant="secondary" onClick={() => inputRef.current?.click()}><Upload size={16} aria-hidden="true" /> Import backup…</Button>
        <input ref={inputRef} type="file" accept="application/json,.json" onChange={chooseFile} className="sr-only" tabIndex={-1} aria-label="Choose a backup file" />
      </div>

      {result && !result.ok && (
        <Notice tone="danger" className="mt-4" onDismiss={() => setResult(null)}>
          <p className="font-semibold">“{result.fileName}” was not imported. Your workspace has not changed.</p>
          {list(result.errors)}
        </Notice>
      )}

      {result?.ok && (
        <div className="mt-4 rounded-xl border border-line bg-surface/60 p-4">
          <p className="text-sm font-semibold text-ink">Ready to import “{result.fileName}”</p>
          <p className="mt-1 text-sm text-muted">
            Workspace “{result.summary.workspaceName}”: {plural(result.summary.brands, 'brand')}, {plural(result.summary.posts, 'post')}, {plural(result.summary.interactions, 'follow-up')}.
          </p>
          {result.warnings.length > 0 && (
            <Notice tone="warning" className="mt-3">
              <p className="font-semibold">{plural(result.warnings.length, 'adjustment')} will be made:</p>
              {list(result.warnings)}
            </Notice>
          )}
          <p className="mt-3 text-sm text-muted">Importing replaces everything currently in this workspace.</p>
          <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row">
            <Button variant="secondary" onClick={() => setResult(null)}>Cancel</Button>
            <Button onClick={() => setConfirming(true)}>Replace my workspace</Button>
          </div>
        </div>
      )}

      {confirming && (
        <ConfirmDialog
          title="Replace your workspace?"
          description="Everything currently in this browser will be replaced by the backup. Export a backup first if you may need it."
          confirmLabel="Replace workspace"
          tone="primary"
          onConfirm={applyImport}
          onCancel={() => setConfirming(false)}
        />
      )}
    </Card>
  )
}

export default BackupSection
