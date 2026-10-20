import EmptyState from '../components/ui/EmptyState.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'

function Inquiries() {
  return (
    <>
      <PageHeader
        title="Inquiries"
        description="A future workspace for keeping track of customer inquiries."
      />
      <EmptyState
        title="No inquiries to show"
        description="Customer inquiry management will be implemented in a future phase."
      />
    </>
  )
}

export default Inquiries
