import { useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import { useWorkspace } from '../context/WorkspaceContext.jsx'

const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const pad = (value) => String(value).padStart(2, '0')
const keyForDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

function MarketingCalendar() {
  const { data } = useWorkspace()
  const [month, setMonth] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })
  const monthLabel = month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1)
    const start = new Date(first)
    start.setDate(first.getDate() - first.getDay())
    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(start)
      day.setDate(start.getDate() + index)
      return day
    })
  }, [month])

  const postsByDate = useMemo(() => {
    const map = new Map()
    for (const post of data.posts) {
      if (!post.scheduledAt) continue
      const dateKey = post.scheduledAt.slice(0, 10)
      map.set(dateKey, [...(map.get(dateKey) || []), post])
    }
    return map
  }, [data.posts])

  const currentMonthPosts = data.posts
    .filter((post) => post.scheduledAt && post.scheduledAt.slice(0, 7) === `${month.getFullYear()}-${pad(month.getMonth() + 1)}`)
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))

  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <PageHeader title="Content calendar" description="See what is planned and keep your posting rhythm visible." />
        <Link to="/content" className="mb-7 inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800 sm:self-auto">
          <Plus size={17} /> Plan a post
        </Link>
      </div>

      <div className="mb-5 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm leading-5 text-sky-900">
        The calendar displays dates saved in your workspace. It does not mean a platform has accepted or scheduled the post.
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-4 sm:px-5">
          <div>
            <h2 className="font-semibold text-ink">{monthLabel}</h2>
            <p className="mt-1 text-xs text-muted">{currentMonthPosts.length} planned item{currentMonthPosts.length === 1 ? '' : 's'} this month</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" className="min-h-9 px-3" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month"><ChevronLeft size={17} /></Button>
            <Button variant="secondary" className="min-h-9 px-3" onClick={() => { const today = new Date(); setMonth(new Date(today.getFullYear(), today.getMonth(), 1)) }}>Today</Button>
            <Button variant="secondary" className="min-h-9 px-3" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month"><ChevronRight size={17} /></Button>
          </div>
        </div>
        <div className="grid grid-cols-7 border-b border-line bg-surface/70">
          {weekdayNames.map((day) => <div key={day} className="px-1 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-muted sm:px-2 sm:text-xs">{day}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = keyForDate(day)
            const inMonth = day.getMonth() === month.getMonth()
            const isToday = key === keyForDate(new Date())
            const dayPosts = postsByDate.get(key) || []
            return (
              <div key={key} className={`min-h-24 border-b border-r border-line p-1.5 sm:min-h-32 sm:p-2 ${inMonth ? 'bg-white' : 'bg-surface/60'}`}>
                <div className="mb-1 flex justify-center sm:justify-start">
                  <span className={`flex size-6 items-center justify-center rounded-full text-xs ${isToday ? 'bg-brand-700 font-bold text-white' : inMonth ? 'text-ink' : 'text-faint'}`}>{day.getDate()}</span>
                </div>
                <div className="space-y-1">
                  {dayPosts.slice(0, 2).map((post) => (
                    <Link key={post.id} to="/content" title={post.title} className={`block truncate rounded-md px-1.5 py-1 text-[10px] leading-4 sm:text-xs ${post.status === 'Published' ? 'bg-emerald-50 text-emerald-800' : 'bg-brand-50 text-brand-800'}`}>
                      {post.title || post.platform}
                    </Link>
                  ))}
                  {dayPosts.length > 2 && <p className="px-1 text-[10px] text-muted">+{dayPosts.length - 2} more</p>}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <div className="mb-3 mt-7 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink">Planned this month</h2>
        <Badge>{currentMonthPosts.length} posts</Badge>
      </div>
      {currentMonthPosts.length ? (
        <div className="space-y-3">
          {currentMonthPosts.map((post) => {
            const brand = data.brands.find((item) => item.id === post.brandId)
            return (
              <Card key={post.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
                <div className="flex items-center gap-3 sm:w-48">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-800"><CalendarDays size={18} /></span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{new Date(post.scheduledAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                    <p className="text-xs text-muted">{new Date(post.scheduledAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{post.title || 'Untitled post'}</p>
                  <p className="mt-1 truncate text-xs text-muted">{brand?.name || 'General workspace'} · {post.platform}</p>
                </div>
                <Badge>{post.status}</Badge>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="flex flex-col items-center px-6 py-8 text-center">
          <Clock3 size={23} className="text-faint" />
          <p className="mt-3 text-sm font-semibold text-ink">No posts planned for this month</p>
          <p className="mt-1 text-sm text-muted">Create a post and give it a planned date to add it to this calendar.</p>
        </Card>
      )}
    </>
  )
}

export default MarketingCalendar
