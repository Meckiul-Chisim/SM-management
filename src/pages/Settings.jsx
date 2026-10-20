import { useState } from 'react'
import { Download, HardDrive, RotateCcw, Upload, WifiOff } from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import { useWorkspace } from '../context/WorkspaceContext.jsx'

function Settings() {
  const { data, setWorkspaceName, replaceData, resetWorkspace } = useWorkspace()
  const [name, setName] = useState(data.workspaceName || 'Haven')
  const [saved, setSaved] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  function saveName(event) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Workspace name cannot be empty.')
      return
    }
    setWorkspaceName(trimmed)
    setName(trimmed)
    setSaved(true)
    setError('')
    window.setTimeout(() => setSaved(false), 1800)
  }

  function exportData() {
    const file = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = `haven-workspace-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    setNotice('Workspace backup downloaded.')
    setError('')
  }

  function importData(event) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        if (!Array.isArray(parsed.brands) || !Array.isArray(parsed.posts) || !Array.isArray(parsed.interactions)) {
          throw new Error('The file is not a recognised workspace backup.')
        }
        replaceData(parsed)
        setName(parsed.workspaceName || 'Haven')
        setNotice('Workspace backup restored in this browser.')
        setError('')
      } catch (importError) {
        setError(importError.message || 'Could not import this backup.')
        setNotice('')
      } finally {
        event.target.value = ''
      }
    }
    reader.onerror = () => {
      setError('The selected file could not be read.')
      event.target.value = ''
    }
    reader.readAsText(file)
  }

  function reset() {
    if (!window.confirm('Reset the workspace to the sample data? This replaces your current browser data. Export a backup first if needed.')) return
    resetWorkspace()
    setName('Haven')
    setNotice('Workspace reset to sample data.')
    setError('')
  }

  return (
    <>
      <PageHeader title="Settings" description="Personalise this workspace and keep a backup of the records stored in your browser." />

      <div className="mb-5 notice notice-warning">
        <WifiOff size={17} className="mr-2 inline" />
        <strong>Local prototype:</strong> records are stored in this browser only. There is no sign-in, shared team sync, or live social account connection yet.
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-800"><HardDrive size={19} /></span>
            <div>
              <h2 className="font-semibold text-ink">Workspace profile</h2>
              <p className="mt-1 text-xs text-muted">A name shown in the app navigation.</p>
            </div>
          </div>
          <form onSubmit={saveName}>
            <label className="field-label" htmlFor="workspace-name">Workspace name</label>
            <input id="workspace-name" className="field" value={name} onChange={(event) => setName(event.target.value)} maxLength={60} />
            {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
            <div className="mt-4 flex items-center gap-3">
              <Button type="submit">Save workspace name</Button>
              {saved && <span className="text-sm font-medium text-success">Saved</span>}
            </div>
          </form>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-800"><Download size={19} /></span>
            <div>
              <h2 className="font-semibold text-ink">Backup & restore</h2>
              <p className="mt-1 text-xs text-muted">Keep a portable copy of your local workspace data.</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={exportData}><Download size={16} /> Export JSON</Button>
            <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-line bg-panel-raised px-4 py-2 text-sm font-semibold text-ink transition hover:bg-surface">
              <Upload size={16} /> Import backup
              <input type="file" accept="application/json,.json" onChange={importData} className="sr-only" />
            </label>
          </div>
          <p className="mt-4 text-xs leading-5 text-muted">Importing replaces the current workspace records. Only import a backup you trust.</p>
          {notice && <p role="status" className="mt-3 notice notice-success">{notice}</p>}
          {error && <p role="alert" className="mt-3 notice notice-danger">{error}</p>}
        </Card>

        <Card className="p-5 xl:col-span-2 sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold text-ink">Reset sample workspace</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">Restore the illustrative example brands, posts, and follow-ups. This will replace your current local workspace data.</p>
            </div>
            <Button variant="secondary" onClick={reset}><RotateCcw size={16} /> Reset workspace</Button>
          </div>
        </Card>
      </div>

      <p className="mt-6 text-xs leading-5 text-muted">
        Privacy note: the app does not send this prototype data to a backend. Anyone using the same browser profile may be able to access it. Do not store sensitive customer information until secure authentication and server-side access controls are implemented.
      </p>
    </>
  )
}

export default Settings
