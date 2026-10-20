import EmptyState from '../components/ui/EmptyState.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'

function Settings() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="A future home for workspace preferences and account settings."
      />
      <EmptyState
        title="Settings are not available yet"
        description="Workspace and account settings will be implemented in a future phase."
      />
    </>
  )
}

export default Settings
