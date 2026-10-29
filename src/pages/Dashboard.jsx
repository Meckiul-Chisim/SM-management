import { useMemo } from 'react'
import { CalendarDays, ClipboardPenLine, Inbox, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '../components/ui/Card.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import { useWorkspace } from '../context/WorkspaceContext.jsx'
import { DEFAULT_BRAND_COLOUR } from '../utils/colour.js'

const pad = (value) => String(value).padStart(2, '0')
const keyForDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
const shortDate = (date) => date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

function Dashboard() {
  const { data } = useWorkspace()

  // The next seven days, starting today.
  const week = useMemo(() => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start)
      date.setDate(start.getDate() + index)
      return { date, key: keyForDate(date) }
    })
  }, [])

  const postsByDay = useMemo(() => {
    const map = new Map()
    for (const post of data.posts) {
      if (!post.scheduledAt) continue
      const key = post.scheduledAt.slice(0, 10)
      map.set(key, [...(map.get(key) || []), post])
    }
    for (const posts of map.values()) posts.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
    return map
  }, [data.posts])

  const brandFor = (id) => data.brands.find((brand) => brand.id === id)
  const colourFor = (id) => brandFor(id)?.color || DEFAULT_BRAND_COLOUR

  const drafts = data.posts
    .filter((post) => post.status === 'Draft' || post.status === 'Ready')
    .sort((a, b) => (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || ''))

  const todayKey = week[0].key
  const followUps = data.interactions
    .filter((item) => item.status !== 'Done')
    .sort((a, b) => (a.followUpDate || '9999').localeCompare(b.followUpDate || '9999'))

  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <PageHeader
          title="Next 7 days"
          description={`Posts planned from ${shortDate(week[0].date)} to ${shortDate(week[6].date)}.`}
        />
        <Link
          to="/content"
          className="mb-8 inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-on-brand transition-colors hover:bg-brand-800 sm:self-auto"
        >
          <Plus size={16} aria-hidden="true" /> New post
        </Link>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
        {[
          { label: 'Scheduled', value: data.posts.filter((post) => post.scheduledAt).length, icon: CalendarDays },
          { label: 'Drafts & ready', value: drafts.length, icon: ClipboardPenLine },
          { label: 'Follow-ups open', value: followUps.length, icon: Inbox },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center gap-3 bg-panel px-4 py-3.5">
            <span className="flex size-9 items-center justify-center rounded-md bg-surface text-brand-700">
              <Icon size={17} strokeWidth={1.75} aria-hidden="true" />
            </span>
            <span>
              <strong className="block font-display text-xl leading-none text-ink">{value}</strong>
              <span className="block mt-1 text-xs font-medium text-muted">{label}</span>
            </span>
          </div>
        ))}
      </div>

      <Card className="divide-y divide-line overflow-hidden lg:grid lg:grid-cols-7 lg:divide-x lg:divide-y-0">
        {week.map(({ date, key }, index) => {
          const posts = postsByDay.get(key) || []
          const isToday = index === 0
          return (
            <div key={key} className="min-w-0 p-4 lg:min-h-48">
              <div className="mb-3 flex items-baseline gap-2 lg:block">
                <p className={`text-xs font-medium ${isToday ? 'text-brand-800' : 'text-muted'}`}>
                  {isToday ? 'Today' : date.toLocaleDateString(undefined, { weekday: 'short' })}
                </p>
                <p className="font-display text-2xl font-semibold leading-none tracking-tight text-ink lg:mt-1">
                  {date.getDate()}
                  <span className="ml-1.5 text-xs font-medium text-faint lg:hidden">
                    {date.toLocaleDateString(undefined, { month: 'short' })}
                  </span>
                </p>
              </div>

              {posts.length ? (
                <ul className="space-y-2">
                  {posts.map((post) => (
                    <li key={post.id}>
                      <Link
                        to={`/content?search=${encodeURIComponent(post.title || post.platform)}`}
                        className="spine block rounded-r-md bg-surface px-2.5 py-2 transition-colors hover:bg-brand-50"
                        style={{ '--spine-colour': colourFor(post.brandId) }}
                      >
                        <span className="block text-sm font-medium leading-snug text-ink">{post.title || 'Untitled post'}</span>
                        <span className="mt-0.5 block text-xs text-muted">
                          {new Date(post.scheduledAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })} on {post.platform}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-faint">Free</p>
              )}
            </div>
          )
        })}
      </Card>

      <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <section aria-labelledby="drafts-heading">
          <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-line pb-3">
            <h2 id="drafts-heading" className="text-lg font-semibold text-ink">
              Drafts <span className="ml-1 font-sans text-sm font-medium text-muted">{drafts.length}</span>
            </h2>
            <Link to="/content" className="text-sm font-semibold text-brand-800 underline-offset-4 hover:underline">Open content studio</Link>
          </div>
          {drafts.length ? (
            <ul className="divide-y divide-line">
              {drafts.slice(0, 5).map((post) => (
                <li key={post.id}>
                  <Link
                    to={`/content?search=${encodeURIComponent(post.title || post.platform)}`}
                    className="spine my-2 flex items-center gap-3 rounded-r-md py-2 pl-3 pr-2 transition-colors hover:bg-surface"
                    style={{ '--spine-colour': colourFor(post.brandId) }}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{post.title || 'Untitled post'}</span>
                      <span className="block truncate text-xs text-muted">{brandFor(post.brandId)?.name || 'General workspace'}, {post.platform}</span>
                    </span>
                    <span className="text-xs font-medium text-muted">{post.status}</span>
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
            <Link to="/engagement" className="text-sm font-semibold text-brand-800 underline-offset-4 hover:underline">Open engagement</Link>
          </div>
          {followUps.length ? (
            <ul className="divide-y divide-line">
              {followUps.slice(0, 5).map((item) => {
                const overdue = item.followUpDate && item.followUpDate < todayKey
                return (
                  <li key={item.id}>
                    <Link
                      to="/engagement"
                      className="spine my-2 flex items-center gap-3 rounded-r-md py-2 pl-3 pr-2 transition-colors hover:bg-surface"
                      style={{ '--spine-colour': colourFor(item.brandId) }}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">{item.person}</span>
                        <span className="block truncate text-xs text-muted">{item.message}</span>
                      </span>
                      <span className={`text-xs font-medium ${overdue ? 'text-danger' : 'text-muted'}`}>
                        {item.followUpDate
                          ? `${overdue ? 'Overdue, ' : 'By '}${shortDate(new Date(`${item.followUpDate}T12:00:00`))}`
                          : 'No date'}
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
    </>
  )
}

export default Dashboard
