import { Cable, Cloud, Compass, ImagePlus, LineChart, MessageCircle, Send, Sparkles, Users } from 'lucide-react'
import Badge from '../components/ui/Badge.jsx'
import Card from '../components/ui/Card.jsx'
import Notice from '../components/ui/Notice.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'

// An honest list of what this demo does NOT do yet, and what each item would need.
// Nothing here is clickable on purpose: there is no waitlist or fake "enable" button,
// because none of these exist. Update this list as real features are built.
const ITEMS = [
  { icon: Cable, title: 'Connect social accounts', needs: 'A backend and an approved developer app with each platform (OAuth sign-in).' },
  { icon: Send, title: 'Schedule and publish automatically', needs: 'Platform publishing APIs plus a server that runs jobs at the planned time. YouTube upload on demand already works; Instagram, scheduling and the other platforms are not built.' },
  { icon: MessageCircle, title: 'Live comments and messages', needs: 'Connected accounts and platform inbox APIs, plus background syncing.' },
  { icon: LineChart, title: 'Real analytics', needs: 'Connected accounts and platform analytics APIs. Insights today are planning insights only.' },
  { icon: Users, title: 'Teams, roles and approvals', needs: 'User accounts, permissions and a shared database.' },
  { icon: Cloud, title: 'Accounts and cloud sync', needs: 'Authentication and hosted storage, so a workspace follows you across devices.' },
  { icon: Sparkles, title: 'AI-assisted writing', needs: 'A language model API and a server to keep its key private. The draft helper today is template-based.' },
  { icon: ImagePlus, title: 'Media library and uploads', needs: 'Shared file storage. Each post can carry one video or image today, kept in this browser only; there is no media library or cloud storage.' },
]

function Roadmap() {
  useDocumentTitle('Roadmap')

  return (
    <>
      <PageHeader
        title="Roadmap"
        description="What this demo can't do yet, and what each next step would take."
      />

      <Notice tone="info" className="mb-6">
        Everything below is <strong>not available</strong> in this demo. Nothing in the app pretends to do these things. Your workspace stays in this browser.
      </Notice>

      <ul className="stagger grid gap-4 sm:grid-cols-2">
        {ITEMS.map(({ icon: Icon, title, needs }) => (
          <li key={title}>
            <Card as="div" className="flex h-full gap-4 p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-ink">
                <Icon size={18} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-medium text-ink">{title}</h2>
                  <Badge tone="neutral">Not built yet</Badge>
                </div>
                <p className="mt-1.5 text-sm leading-6 text-muted"><span className="font-medium text-ink">Needs:</span> {needs}</p>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      <p className="mt-6 flex items-center gap-2 text-sm text-muted">
        <Compass size={16} aria-hidden="true" />
        Features move off this list only when they genuinely work.
      </p>
    </>
  )
}

export default Roadmap
