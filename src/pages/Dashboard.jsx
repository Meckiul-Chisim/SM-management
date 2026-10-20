import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Layers3,
  Plus,
  Sparkles,
  UsersRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from '../components/ui/Badge.jsx'
import Card from '../components/ui/Card.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import { useWorkspace } from '../context/WorkspaceContext.jsx'

function formatDate(value) {
  if (!value) return 'No date set'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'No date set'
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date)
}

function statusTone(status) {
  if (status === 'Published') return 'bg-emerald-50 text-emerald-700'
  if (status === 'Planned') return 'bg-sky-50 text-sky-700'
  if (status === 'Ready') return 'bg-amber-50 text-amber-700'
  if (status === 'Follow up') return 'bg-amber-50 text-amber-700'
  return 'bg-brand-50 text-brand-800'
}

function Dashboard() {
  const { data } = useWorkspace()
  const drafts = data.posts.filter((post) => post.status === 'Draft').length
  const planned = data.posts.filter((post) => post.status === 'Planned').length
  const followUps = data.interactions.filter((item) => item.status !== 'Done').length
  const upcoming = data.posts
    .filter((post) => post.status === 'Planned' && post.scheduledAt)
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
    .slice(0, 4)

  const metrics = [
    { label: 'Brands', value: data.brands.length, detail: 'Workspaces you manage', icon: Layers3 },
    { label: 'Drafts', value: drafts, detail: 'Still being worked on', icon: Sparkles },
    { label: 'Planned posts', value: planned, detail: 'In your content calendar', icon: CalendarClock },
    { label: 'Open follow-ups', value: followUps, detail: 'Engagement to revisit', icon: UsersRound },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Workspace overview"
        title={`Welcome back to ${data.workspaceName || 'your workspace'}`}
        description="A calmer way to organise the content your brands publish."
      />

      <Card tone="brand" className="mb-6 overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <Badge tone="inverse">Your workspace</Badge>
            <h2 className="mt-5 text-xl font-semibold tracking-tight sm:text-2xl">
              From idea to planned post, without the loose ends.
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/75">
              Keep brand details, drafts, content dates, and manual follow-ups together. Start small and build a consistent workflow.
            </p>
          </div>
          <Link to="/content" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-brand-900 transition hover:bg-brand-50">
            <Plus size={17} /> Create a post
          </Link>
        </div>
      </Card>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, detail, icon: Icon }) => (
          <Card key={label} className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-800">
                <Icon size={19} aria-hidden="true" />
              </span>
              <span className="text-3xl font-semibold tracking-tight text-ink">{value}</span>
            </div>
            <p className="mt-4 text-sm font-semibold text-ink">{label}</p>
            <p className="mt-1 text-xs text-muted">{detail}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div>
              <h2 className="font-semibold text-ink">Upcoming content</h2>
              <p className="mt-1 text-xs text-muted">Your next planned posts</p>
            </div>
            <Link to="/calendar" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-800 hover:underline">
              View calendar <ArrowRight size={15} />
            </Link>
          </div>
          {upcoming.length ? (
            <div className="divide-y divide-line">
              {upcoming.map((post) => {
                const brand = data.brands.find((item) => item.id === post.brandId)
                return (
                  <div key={post.id} className="flex items-center gap-3 px-5 py-4">
                    <div className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl bg-surface text-center">
                      <span className="text-[10px] font-bold uppercase text-muted">{formatDate(post.scheduledAt).split(' ')[0]}</span>
                      <span className="text-sm font-semibold text-ink">{formatDate(post.scheduledAt).split(' ').slice(1).join(' ')}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{post.title || 'Untitled post'}</p>
                      <p className="mt-1 truncate text-xs text-muted">{brand?.name || 'General'} · {post.platform}</p>
                    </div>
                    <Badge>{post.status}</Badge>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="px-5 py-10 text-center">
              <CalendarClock className="mx-auto text-faint" size={24} />
              <p className="mt-3 text-sm font-semibold text-ink">Nothing planned yet</p>
              <p className="mt-1 text-sm text-muted">Schedule a draft to see it here.</p>
            </div>
          )}
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="font-semibold text-ink">Quick actions</h2>
          <p className="mt-1 text-sm text-muted">Go straight to your next task.</p>
          <div className="mt-5 space-y-3">
            <Link to="/content" className="flex items-center gap-3 rounded-xl border border-line p-3 transition hover:border-brand-100 hover:bg-brand-50">
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-800"><Sparkles size={18} /></span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-ink">Write content</span><span className="block text-xs text-muted">Create a caption or post draft</span></span>
              <ArrowRight size={16} className="text-muted" />
            </Link>
            <Link to="/brands" className="flex items-center gap-3 rounded-xl border border-line p-3 transition hover:border-brand-100 hover:bg-brand-50">
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-800"><Layers3 size={18} /></span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-ink">Manage brands</span><span className="block text-xs text-muted">Organise your brand profiles</span></span>
              <ArrowRight size={16} className="text-muted" />
            </Link>
            <Link to="/engagement" className="flex items-center gap-3 rounded-xl border border-line p-3 transition hover:border-brand-100 hover:bg-brand-50">
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-800"><UsersRound size={18} /></span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-ink">Log a follow-up</span><span className="block text-xs text-muted">Keep important conversations visible</span></span>
              <ArrowRight size={16} className="text-muted" />
            </Link>
          </div>
          <div className="mt-5 rounded-xl bg-surface p-3 text-xs leading-5 text-muted">
            <CheckCircle2 size={15} className="mr-1 inline text-brand-700" />
            Changes save in this browser automatically. Social publishing and account sync are not connected yet.
          </div>
        </Card>
      </div>
    </>
  )
}

export default Dashboard
