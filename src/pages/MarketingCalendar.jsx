import { useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import ButtonLink from '../components/ui/ButtonLink.jsx'
import Card from '../components/ui/Card.jsx'
import Notice from '../components/ui/Notice.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { useWorkspace } from '../hooks/useWorkspace.js'
import { getMonthGrid, getWeekdayLabels, getWeekStart, groupPostsByDate, shiftMonth } from '../utils/calendar.js'
import { DEFAULT_BRAND_COLOUR } from '../utils/colour.js'
import { formatTime, fromDateKey, isPast, toDateKey } from '../utils/dates.js'

const monthKey = ({ year, month }) => `${year}-${String(month + 1).padStart(2, '0')}`

function MarketingCalendar() {
  useDocumentTitle('Content calendar')
  const { data } = useWorkspace()
  const weekStart = useMemo(() => getWeekStart(), [])
  const today = toDateKey(new Date())

  const [view, setView] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [selected, setSelected] = useState(today)

  const grid = useMemo(() => getMonthGrid(view.year, view.month, weekStart), [view, weekStart])
  const weekdays = useMemo(() => getWeekdayLabels(weekStart), [weekStart])
  const postsByDate = useMemo(() => groupPostsByDate(data.posts), [data.posts])
  const brandColour = (id) => data.brands.find((brand) => brand.id === id)?.color || DEFAULT_BRAND_COLOUR
  const brandName = (id) => data.brands.find((brand) => brand.id === id)?.name || 'General workspace'

  const monthTitle = new Date(view.year, view.month, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const monthPosts = data.posts
    .filter((post) => post.scheduledAt.slice(0, 7) === monthKey(view))
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
  const dayPosts = postsByDate[selected] || []

  function goToMonth(next) {
    setView(next)
    // Keep the selection inside the visible month: today if it is there, otherwise the 1st.
    const todayIsVisible = monthKey(next) === today.slice(0, 7)
    setSelected(todayIsVisible ? today : `${monthKey(next)}-01`)
  }

  const selectedLabel = fromDateKey(selected)?.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <>
      <PageHeader
        title="Content calendar"
        description="See what you have planned and keep your posting rhythm visible."
        actions={<ButtonLink to={`/content?new=1&date=${selected}`}><Plus size={17} aria-hidden="true" /> Plan a post</ButtonLink>}
      />

      <Notice tone="info" className="mb-5">
        The calendar shows plans saved in this app. A platform has not accepted or scheduled these posts: copy the text and post it yourself.
      </Notice>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
          <div>
            <h2 className="font-semibold text-ink" aria-live="polite">{monthTitle}</h2>
            <p className="text-xs text-muted">{monthPosts.length} {monthPosts.length === 1 ? 'post' : 'posts'} with a date this month</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" aria-label="Previous month" onClick={() => goToMonth(shiftMonth(view, -1))}><ChevronLeft size={17} aria-hidden="true" /></Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { const now = new Date(); setView({ year: now.getFullYear(), month: now.getMonth() }); setSelected(today) }}
            >
              Today
            </Button>
            <Button variant="secondary" size="sm" aria-label="Next month" onClick={() => goToMonth(shiftMonth(view, 1))}><ChevronRight size={17} aria-hidden="true" /></Button>
          </div>
        </div>

        <table className="w-full table-fixed border-collapse">
          <caption className="sr-only">Posts planned in {monthTitle}. Choose a day to see its posts.</caption>
          <thead>
            <tr className="border-b border-line bg-surface/70">
              {weekdays.map((day) => <th key={day} scope="col" className="px-1 py-2 text-center text-xs font-medium text-muted">{day}</th>)}
            </tr>
          </thead>
          <tbody>
            {grid.map((week) => (
              <tr key={week[0].key}>
                {week.map((cell) => {
                  const posts = postsByDate[cell.key] || []
                  const isSelected = cell.key === selected
                  const isToday = cell.key === today
                  const label = `${fromDateKey(cell.key).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}${posts.length ? `, ${posts.length} ${posts.length === 1 ? 'post' : 'posts'}` : ''}`
                  return (
                    <td key={cell.key} className={`border-b border-r border-line p-0 align-top last:border-r-0 ${cell.inMonth ? 'bg-panel' : 'bg-surface/60'}`}>
                      <button
                        type="button"
                        aria-label={label}
                        aria-pressed={isSelected}
                        aria-current={isToday ? 'date' : undefined}
                        onClick={() => { setSelected(cell.key); if (!cell.inMonth) { const date = fromDateKey(cell.key); setView({ year: date.getFullYear(), month: date.getMonth() }) } }}
                        className={`flex h-16 w-full flex-col items-center gap-1 p-1.5 text-left hover:bg-brand-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-700 sm:h-28 sm:items-stretch sm:p-2 ${isSelected ? 'bg-brand-50' : ''}`}
                      >
                        <span
                          className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs ${isToday ? 'bg-brand-700 font-semibold text-on-brand' : cell.inMonth ? 'text-ink' : 'text-muted'} ${isSelected && !isToday ? 'ring-1 ring-brand-700' : ''}`}
                        >
                          {cell.day}
                        </span>
                        {/* Small screens: coloured dots. Larger screens: the post titles. */}
                        <span className="flex gap-0.5 sm:hidden" aria-hidden="true">
                          {posts.slice(0, 3).map((post) => <span key={post.id} className="size-1.5 rounded-full" style={{ backgroundColor: brandColour(post.brandId) }} />)}
                        </span>
                        <span className="hidden min-w-0 flex-col gap-1 sm:flex" aria-hidden="true">
                          {posts.slice(0, 2).map((post) => (
                            <span
                              key={post.id}
                              className={`spine block truncate rounded-r-md px-1.5 py-0.5 text-xs leading-4 ${post.status === 'Published' ? 'bg-success-bg text-success' : 'bg-surface text-ink'}`}
                              style={{ '--spine-colour': brandColour(post.brandId) }}
                            >
                              {post.title}
                            </span>
                          ))}
                          {posts.length > 2 && <span className="px-1 text-xs text-muted">+{posts.length - 2} more</span>}
                        </span>
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <section aria-labelledby="day-heading" className="mt-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 id="day-heading" className="text-base font-semibold text-ink">{selectedLabel}</h2>
          <Link to={`/content?new=1&date=${selected}`} className="text-sm font-semibold text-brand-800 underline-offset-4 hover:underline">Plan a post for this day</Link>
        </div>
        {dayPosts.length ? (
          <ul className="space-y-2">
            {dayPosts.map((post) => (
              <li key={post.id}>
                <Link
                  to={`/content?post=${post.id}`}
                  className="spine flex items-center gap-3 rounded-r-xl border border-l-0 border-line bg-panel p-4 transition-colors hover:bg-surface"
                  style={{ '--spine-colour': brandColour(post.brandId) }}
                >
                  <span className="w-16 shrink-0 text-sm font-semibold text-ink">{formatTime(post.scheduledAt)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{post.title}</span>
                    <span className="block truncate text-xs text-muted">{brandName(post.brandId)} · {post.platform}</span>
                  </span>
                  {post.status === 'Planned' && isPast(post.scheduledAt) && <Badge tone="warning">Date passed</Badge>}
                  <StatusBadge status={post.status} />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Card className="flex flex-col items-center px-6 py-8 text-center" glass={false}>
            <CalendarDays size={22} className="text-muted" aria-hidden="true" />
            <p className="mt-2 text-sm font-semibold text-ink">Nothing planned for this day</p>
            <p className="mt-1 text-sm text-muted">Give a post a planned date and it appears here.</p>
          </Card>
        )}
      </section>
    </>
  )
}

export default MarketingCalendar
