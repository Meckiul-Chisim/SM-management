import EmptyState from '../components/ui/EmptyState.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'

function MarketingCalendar() {
  return (
    <>
      <PageHeader
        title="Marketing calendar"
        description="A future place to plan and review your marketing schedule."
      />
      <EmptyState
        title="Your calendar is waiting"
        description="Marketing schedule planning will be implemented in a future phase."
      />
    </>
  )
}

export default MarketingCalendar
