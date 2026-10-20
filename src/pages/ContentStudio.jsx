import EmptyState from '../components/ui/EmptyState.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'

function ContentStudio() {
  return (
    <>
      <PageHeader
        title="Content studio"
        description="A future workspace for preparing and organizing marketing content."
      />
      <EmptyState
        title="Your content workspace is not set up yet"
        description="Your content creation workspace will be implemented in a future phase."
      />
    </>
  )
}

export default ContentStudio
