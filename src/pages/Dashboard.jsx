import { useMemo } from 'react'
import { CalendarDays, ClipboardPenLine, FileCheck2, Plus, Send } from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from '../components/ui/Badge.jsx'
import ButtonLink from '../components/ui/ButtonLink.jsx'
import Card from '../components/ui/Card.jsx'
import Notice from '../components/ui/Notice.jsx'
import CountUp from '../components/ui/CountUp.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { countSampleRecords } from '../data/workspaceReducer.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { useWorkspace } from '../hooks/useWorkspace.js'
import { DEFAULT_BRAND_COLOUR } from '../utils/colour.js'
import { addDays, dateKeyOf, formatDay, formatTime, toDateKey } from '../utils/dates.js'
import { countFollowUps, isOverdue, isOpen, sortFollowUps } from '../utils/followUps.js'
import { groupPostsByDate } from '../utils/calendar.js'

// "Good morning", "Good afternoon" or "Good evening" from the person's own clock.
function greeting(date) {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function Dashboard() {
  useDocumentTitle('Dashboard')
  const { data } = useWorkspace()
  const now = new Date()
  const today = toDateKey(now)

  // The next seven days, starting today.
  const week = useMemo(() => {
    const start = new Date()
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(start, index)
      return { date, key: toDateKey(date) }
    })
  }, [])

  const postsByDay = useMemo(() => groupPostsByDate(data.posts), [data.posts])
  const brandFor = (id) => data.brands.find((brand) => brand.id === id)
  const colourFor = (id) => brandFor(id)?.color || DEFAULT_BRAND_COLOUR

  const counts = useMemo(() => {
    const weekKeys = new Set(week.map((day) => day.key))
    return {
      plannedThisWeek: data.posts.filter((post) => post.status === 'Planned' && weekKeys.has(dateKeyOf(post.scheduledAt))).length,
      drafts: data.posts.filter((post) => post.status === 'Draft').length,
      ready: data.posts.filter((post) => post.status === 'Ready').length,
      published: data.posts.filter((post) => post.status === 'Published').length,
    }
  }, [data.posts, week])

  const followUpCounts = countFollowUps(data.interactions, today)
  const followUps = sortFollowUps(data.interactions.filter(isOpen), today)
  const drafts = data.posts
    .filter((post) => post.status === 'Draft' || post.status === 'Ready')
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
  const sampleCount = countSampleRecords(data)
  const todayPlanned = (postsByDay[today] || []).filter((post) => post.status === 'Planned').length

  const tiles = [
    { label: 'Planned this week', value: counts.plannedThisWeek, to: '/calendar', icon: CalendarDays },
    { label: 'Drafts', value: counts.drafts, to: '/content?status=Draft', icon: ClipboardPenLine },
    { label: 'Ready for review', value: counts.ready, to: '/content?status=Ready', icon: FileCheck2 },
    { label: 'Marked published', value: counts.published, to: '/content?status=Published', icon: Send },
  ]

  return (
    <>
      <PageHeader
        eyebrow={`${greeting(now)} · ${data.workspaceName}`}
        title="Dashboard"
        description="A plan of your own content. Nothing here is published automatically."
        actions={<ButtonLink to="/content?new=1"><Plus size={16} aria-hidden="true" /> New post</ButtonLink>}
      />

      <div className="stagger">
      {sampleCount > 0 && (
        <Notice tone="info" className="mb-4">
          This workspace includes sample data so you can explore. Remove it any time in <Link to="/settings" className="font-semibold underline underline-offset-2">Settings</Link>.
        </Notice>
      )}
      {followUpCounts.overdue > 0 && (
        <Notice tone="warning" className="mb-4">
          {followUpCounts.overdue} {followUpCounts.overdue === 1 ? 'follow-up is' : 'follow-ups are'} overdue.{' '}
          <Link to="/engagement" className="font-semibold underline underline-offset-2">Review them</Link>
        </Notice>
      )}

      <Card as="div" className="mb-6 flex flex-wrap items-center gap-x-8 gap-y-2 px-5 py-4">
        <p className="eyebrow">Today</p>
        {todayPlanned === 0 && followUpCounts.dueToday === 0 && followUpCounts.overdue === 0 ? (
          <p className="text-sm text-muted">A clear day. Nothing is planned or due.</p>
        ) : (
          <>
            <Link to="/calendar" className="text-sm text-ink hover:underline"><strong className="font-semibold">{todayPlanned}</strong> {todayPlanned === 1 ? 'post' : 'posts'} planned</Link>
            <Link to="/engagement" className="text-sm text-ink hover:underline"><strong className="font-semibold">{followUpCounts.dueToday}</strong> {followUpCounts.dueToday === 1 ? 'follow-up' : 'follow-ups'} due</Link>
            {followUpCounts.overdue > 0 && (
              <Link to="/engagement" className="text-sm font-semibold text-danger hover:underline">{followUpCounts.overdue} overdue</Link>
            )}
          </>
        )}
      </Card>

      {/* One joined strip of four counts. Each one links to the matching list. */}
      <ul className="haven-metrics mb-6 grid grid-cols-2 lg:grid-cols-4">
        {tiles.map(({ label, value, to, icon: Icon }) => (
          <li key={label} className="contents">
            <Link to={to} className="lift flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl">
                <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
              </span>
              <span>
                <CountUp value={value} className="block font-display text-2xl font-medium leading-none tracking-tight text-ink" />
                <span className="mt-1.5 block text-xs font-medium text-muted">{label}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <section aria-labelledby="week-heading" className="mb-10">
        <h2 id="week-heading" className="mb-3 text-lg font-semibold text-ink">
          Next 7 days <span className="ml-1 font-sans text-sm font-medium text-muted">{formatDay(week[0].key)} to {formatDay(week[6].key)}</span>
        </h2>
        <Card className="haven-week-card divide-y divide-line overflow-hidden lg:grid lg:grid-cols-7 lg:divide-x lg:divide-y-0">
          {week.map(({ date, key }, index) => {
            const posts = postsByDay[key] || []
            return (
              <div key={key} className="min-w-0 p-4 lg:min-h-44">
                <div className="mb-3 flex items-baseline gap-2 lg:block">
                  <p className={`text-xs font-medium ${index === 0 ? 'text-brand-800' : 'text-muted'}`}>
                    {index === 0 ? 'Today' : date.toLocaleDateString(undefined, { weekday: 'short' })}
                  </p>
                  <p className="font-display text-2xl font-semibold leading-none tracking-tight text-ink lg:mt-1">
                    {date.getDate()}
                    <span className="ml-1.5 text-xs font-medium text-muted lg:hidden">{date.toLocaleDateString(undefined, { month: 'short' })}</span>
                  </p>
                </div>
                {posts.length ? (
                  <ul className="space-y-2">
                    {posts.map((post) => (
                      <li key={post.id}>
                        <Link
                          to={`/content?post=${post.id}`}
                          className="spine block rounded-r-md bg-surface px-2.5 py-2 transition-colors hover:bg-brand-50"
                          style={{ '--spine-colour': colourFor(post.brandId) }}
                        >
                          <span className="block text-sm font-medium leading-snug text-ink">{post.title}</span>
                          <span className="mt-0.5 block text-xs text-muted">{formatTime(post.scheduledAt)} on {post.platform}</span>
                          {post.status === 'Published' && <Badge tone="success" className="mt-1.5">Published</Badge>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted">Nothing planned</p>
                )}
              </div>
            )
          })}
        </Card>
      </section>

      <div className="haven-secondary-grid grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-8">
        <section aria-labelledby="drafts-heading">
          <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-line pb-3">
            <h2 id="drafts-heading" className="text-lg font-semibold text-ink">
              Drafts and ready <span className="ml-1 font-sans text-sm font-medium text-muted">{drafts.length}</span>
            </h2>
            <Link to="/content" className="text-sm font-semibold text-brand-800 underline-offset-4 hover:underline">Content studio</Link>
          </div>
          {drafts.length ? (
            <ul className="divide-y divide-line">
              {drafts.slice(0, 5).map((post) => (
                <li key={post.id}>
                  <Link
                    to={`/content?post=${post.id}`}
                    className="spine my-2 flex items-center gap-3 rounded-r-md py-2 pl-3 pr-2 transition-colors hover:bg-surface"
                    style={{ '--spine-colour': colourFor(post.brandId) }}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{post.title}</span>
                      <span className="block truncate text-xs text-muted">{brandFor(post.brandId)?.name || 'General workspace'}, {post.platform}</span>
                    </span>
                    <StatusBadge status={post.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-4 text-sm text-muted">No drafts right now. Start one in the content studio.</p>
          )}
        </section>

        <section aria-labelledby="followups-heading">
          <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-line pb-3">
            <h2 id="followups-heading" className="text-lg font-semibold text-ink">
              Follow-ups <span className="ml-1 font-sans text-sm font-medium text-muted">{followUps.length}</span>
            </h2>
            <Link to="/engagement" className="text-sm font-semibold text-brand-800 underline-offset-4 hover:underline">Engagement</Link>
          </div>
          {followUps.length ? (
            <ul className="divide-y divide-line">
              {followUps.slice(0, 5).map((item) => {
                const overdue = isOverdue(item, today)
                return (
                  <li key={item.id}>
                    <Link
                      to={`/engagement?item=${item.id}`}
                      className="spine my-2 flex items-center gap-3 rounded-r-md py-2 pl-3 pr-2 transition-colors hover:bg-surface"
                      style={{ '--spine-colour': colourFor(item.brandId) }}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">{item.person}</span>
                        <span className="block truncate text-xs text-muted">{item.message}</span>
                      </span>
                      <span className={`shrink-0 text-xs font-semibold ${overdue ? 'text-danger' : 'text-muted'}`}>
                        {item.followUpDate ? `${overdue ? 'Overdue, ' : 'By '}${formatDay(item.followUpDate)}` : 'No date'}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="py-4 text-sm text-muted">Nothing waiting for a reply.</p>
          )}
        </section>
      </div>
      </div>
    </>
  )
}

export default Dashboard
