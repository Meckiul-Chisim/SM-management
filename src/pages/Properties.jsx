import EmptyState from '../components/ui/EmptyState.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'

function Properties() {
  return (
    <>
      <PageHeader
        title="Properties"
        description="A future home for the property information your team works with."
      />
      <EmptyState
        title="No properties yet"
        description="Property management will be implemented in a future phase."
      />
    </>
  )
}

export default Properties
