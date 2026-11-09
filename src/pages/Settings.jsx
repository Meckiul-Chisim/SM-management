import { useState } from 'react'
import BackupSection from '../components/settings/BackupSection.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import { TextField } from '../components/ui/Field.jsx'
import Notice from '../components/ui/Notice.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import { validateWorkspaceName } from '../data/validators.js'
import { countSampleRecords } from '../data/workspaceReducer.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { useToast } from '../hooks/useToast.js'
import { useWorkspace } from '../hooks/useWorkspace.js'
import { setAmbientEnabled, useAmbientEnabled } from '../utils/ambientPreference.js'
import { getBuildGoogleClientId, getSavedGoogleClientId, isValidGoogleClientId, setGoogleClientId } from '../services/connections.js'

const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`

// Remounted (via key) when the workspace name changes elsewhere, e.g. after an import.
function WorkspaceNameForm({ name, onSave }) {
  const [value, setValue] = useState(name)
  const [error, setError] = useState('')

  function submit(event) {
    event.preventDefault()
    const result = validateWorkspaceName(value)
    setError(result.error)
    if (!result.error) {
      onSave(result.value)
      setValue(result.value)
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <TextField label="Workspace name" value={value} error={error} onChange={(event) => setValue(event.target.value)} hint="Shown in the sidebar and the browser tab." />
      <Button type="submit" className="mt-4">Save name</Button>
    </form>
  )
}

// Where the Google client ID for YouTube uploads is entered. It is a public value (not a
// secret) and is saved in this browser only. Nothing is uploaded from this form.
function YouTubeConnection() {
  const toast = useToast()
  const fromBuild = getBuildGoogleClientId()
  const [value, setValue] = useState(() => getSavedGoogleClientId())
  const [saved, setSaved] = useState(() => getSavedGoogleClientId())
  const [error, setError] = useState('')

  function submit(event) {
    event.preventDefault()
    if (value.trim() && !isValidGoogleClientId(value)) {
      setError('This does not look like a Google client ID. It ends with .apps.googleusercontent.com')
      return
    }
    setError('')
    if (setGoogleClientId(value)) {
      setSaved(value.trim())
      toast.show(value.trim() ? 'YouTube connection saved.' : 'YouTube connection removed.')
    } else {
      setError('This browser could not save it.')
    }
  }

  return (
    <Card className="p-5 sm:p-6 xl:col-span-2">
      <h2 className="font-semibold text-ink">YouTube uploads</h2>
      <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
        Upload a post’s video to your own channel. You create a Google client ID once (the setup guide in <code>docs/youtube-upload-setup.md</code> has the steps). You sign in with Google each time you upload; no password or token is ever saved.
      </p>
      <form onSubmit={submit} noValidate className="mt-4 max-w-2xl">
        <TextField
          label="Google client ID"
          value={value}
          error={error}
          onChange={(event) => setValue(event.target.value)}
          placeholder="1234567890-abc123.apps.googleusercontent.com"
          hint={saved ? 'Connected (saved in this browser). Open a YouTube post in Content studio and choose Upload to YouTube.' : fromBuild ? 'Connected through the VITE_GOOGLE_CLIENT_ID setting of this build. Enter an ID here only to override it.' : 'Not connected yet. You can also set VITE_GOOGLE_CLIENT_ID in a .env file.'}
          autoComplete="off"
          spellCheck="false"
        />
        <Button type="submit" className="mt-4">{saved && !value.trim() ? 'Remove connection' : 'Save connection'}</Button>
      </form>
      <p className="mt-4 max-w-3xl text-xs leading-5 text-muted">
        Good to know: until Google verifies your project, videos uploaded this way may be locked as private, and only accounts listed as test users can sign in. Uploaded videos can be made public in YouTube Studio.
      </p>
    </Card>
  )
}

function Settings() {
  useDocumentTitle('Settings')
  const { data, renameWorkspace, removeSampleData, resetToSample, clearWorkspace } = useWorkspace()
  const toast = useToast()
  const ambient = useAmbientEnabled()
  const [confirm, setConfirm] = useState(null) // 'sample' | 'reset' | 'clear'
  const sampleCount = countSampleRecords(data)

  const actions = {
    sample: {
      title: 'Remove sample data?',
      description: `This deletes the ${plural(sampleCount, 'sample record')}. Anything you created yourself is kept.`,
      label: 'Remove sample data',
      run: () => { removeSampleData(); toast.show('Sample data removed.') },
    },
    reset: {
      title: 'Reset to sample data?',
      description: 'Everything you have added in this browser will be replaced by the sample workspace. Export a backup first if you may need it.',
      label: 'Reset workspace',
      run: () => { resetToSample(); toast.show('Workspace reset to sample data.') },
    },
    clear: {
      title: 'Delete all workspace data?',
      description: 'All brands, posts and follow-ups in this browser will be deleted. The workspace name is kept. Export a backup first if you may need it.',
      label: 'Delete everything',
      run: () => { clearWorkspace(); toast.show('Workspace cleared.') },
    },
  }

  return (
    <div className="haven-route haven-route--settings">
      <PageHeader title="Settings" description="Name your workspace, back up your data and manage sample content." />

      <Notice tone="warning" className="mb-6">
        <strong>Local-only demo.</strong> Your data is saved in this browser only. There is no sign-in, cloud sync or team sharing. The only optional connection is YouTube uploads, which you set up below; every other platform is copy-and-post.
      </Notice>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <h2 className="mb-4 font-semibold text-ink">Workspace</h2>
          <WorkspaceNameForm key={data.workspaceName} name={data.workspaceName} onSave={(name) => { renameWorkspace(name); toast.show('Workspace name saved.') }} />
          <p className="mt-4 text-xs text-muted">
            {plural(data.brands.length, 'brand')} · {plural(data.posts.length, 'post')} · {plural(data.interactions.length, 'follow-up')}
          </p>
        </Card>

        <BackupSection />

        <YouTubeConnection />

        <Card className="p-5 sm:p-6">
          <h2 className="font-semibold text-ink">Appearance</h2>
          <label className="mt-3 flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={ambient}
              onChange={(event) => setAmbientEnabled(event.target.checked)}
              className="mt-1 size-4 accent-brand-700"
            />
            <span>
              <span className="block text-sm font-medium text-ink">Animated background</span>
              <span className="block text-sm leading-6 text-muted">The slow scene behind each page. Turn it off to save battery. It is already still if your device asks for reduced motion.</span>
            </span>
          </label>
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="font-semibold text-ink">Sample data</h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            {sampleCount > 0
              ? `This workspace contains ${plural(sampleCount, 'sample record')} (marked “Sample”), invented for demonstration.`
              : 'There is no sample data in this workspace.'}
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" disabled={sampleCount === 0} onClick={() => setConfirm('sample')}>Remove sample data</Button>
            <Button variant="secondary" onClick={() => setConfirm('reset')}>Reset to sample data</Button>
          </div>
        </Card>

        <Card className="border-danger p-5 sm:p-6 xl:col-span-2" glass={false}>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold text-danger">Delete all data</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">Removes every brand, post and follow-up from this browser. This cannot be undone.</p>
            </div>
            <Button variant="danger" onClick={() => setConfirm('clear')}>Delete all data</Button>
          </div>
        </Card>
      </div>

      <p className="mt-6 max-w-3xl text-xs leading-5 text-muted">
        Privacy: nothing you enter is sent to a server of ours. If you upload to YouTube, the video, title and text go directly from your browser to Google. Attached files stay in this browser and are not included in backups. Anyone using this browser profile may be able to read it. Do not store sensitive customer information in this demo.
      </p>

      {confirm && (
        <ConfirmDialog
          title={actions[confirm].title}
          description={actions[confirm].description}
          confirmLabel={actions[confirm].label}
          onConfirm={() => { actions[confirm].run(); setConfirm(null) }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}

export default Settings
