import {
  ArrowUpRight,
  CalendarDays,
  MessageSquareText,
  Sparkles,
} from 'lucide-react'
import Badge from '../components/ui/Badge.jsx'
import Card from '../components/ui/Card.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'

const nextAreas = [
  {
    icon: Sparkles,
    title: 'Create marketing content',
    description: 'A future workspace for preparing property marketing materials.',
  },
  {
    icon: CalendarDays,
    title: 'Plan your schedule',
    description: 'A future view for organizing upcoming marketing activity.',
  },
  {
    icon: MessageSquareText,
    title: 'Stay on top of inquiries',
    description: 'A future workspace for managing customer conversations.',
  },
]

function Dashboard() {
  return (
    <>
      <PageHeader
        eyebrow="Workspace overview"
        title="Welcome to Haven"
        description="Your real estate workspace foundation is in place. The tools below are placeholders for future development."
      />

      <Card tone="brand" className="mb-6 overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <Badge tone="inverse">Foundation phase</Badge>
            <h2 className="mt-5 text-xl font-semibold tracking-tight sm:text-2xl">
              One workspace, ready to take shape.
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/75">
              Properties, content, schedules, and inquiries will come in future
              phases. Nothing here represents saved business data.
            </p>
          </div>
          <ArrowUpRight
            className="hidden shrink-0 text-white/70 sm:block"
            size={26}
            aria-hidden="true"
          />
        </div>
      </Card>

      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-ink">
          Future workspace areas
        </h2>
        <span className="text-xs font-medium text-muted">Placeholders only</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {nextAreas.map(({ icon: Icon, title, description }) => (
          <Card key={title} className="p-5 sm:p-6">
            <span className="flex size-10 items-center justify-center rounded-xl bg-surface text-brand-800">
              <Icon size={19} aria-hidden="true" />
            </span>
            <h3 className="mt-5 text-sm font-semibold text-ink">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
          </Card>
        ))}
      </div>
    </>
  )
}

export default Dashboard
