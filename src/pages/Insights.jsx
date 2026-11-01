import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3 } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import CountUp from '../components/ui/CountUp.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Notice from '../components/ui/Notice.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import { POST_STATUSES } from '../data/constants.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { useWorkspace } from '../hooks/useWorkspace.js'
import { countBy, countByStatus, longestGap, overduePlans, upcomingLoad } from '../utils/insights.js'

// Bar colours come from theme tokens, so they follow light and dark.
const STATUS_COLOURS = {
  Draft: 'var(--color-faint)',
  Ready: 'var(--color-info)',
  Planned: 'var(--color-brand-700)',
  Published: 'var(--color-gold)',
}

// A horizontal bar list. The number sits in text next to each bar, so the chart
// never relies on colour or length alone.
function BarList({ rows, colour = 'var(--color-brand-700)' }) {
  const max = Math.max(1, ...rows.map((row) => row.count))
  if (!rows.length) return <p className="text-sm text-muted">Nothing to show yet.</p>
  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.label} className="grid grid-cols-[7.5rem_1fr_2rem] items-center gap-3 text-sm">
          <span className="truncate text-ink">{row.label}</span>
          <span className="h-2 overflow-hidden rounded-full bg-surface" aria-hidden="true">
            <span
              className="block h-full origin-left rounded-full"
              style={{ width: `${(row.count / max) * 100}%`, background: colour, animation: 'grow 900ms var(--ease-luxe) both' }}
            />
          </span>
          <span className="text-right font-medium tabular-nums text-muted">{row.count}</span>
        </li>
      ))}
    </ul>
  )
}

// Planning insights worked out from the person's own plans. They are not social
// analytics: the app has no access to how any post performed.
function Insights() {
  useDocumentTitle('Insights')
  const { data } = useWorkspace()
  const now = new Date()

  const stats = useMemo(() => {
    const brandName = (post) => data.brands.find((brand) => brand.id === post.brandId)?.name
    const load = upcomingLoad(data.posts, new Date(), 28)
    return {
      status: countByStatus(data.posts),
      platforms: countBy(data.posts, (post) => post.platform),
      brands: countBy(data.posts, brandName),
      load,
      planned28: load.reduce((sum, day) => sum + day.count, 0),
      gap: longestGap(load),
      late: overduePlans(data.posts, new Date()),
    }
  }, [data.posts, data.brands])

  const total = data.posts.length
  const maxLoad = Math.max(1, ...stats.load.map((day) => day.count))

  return (
    <>
      <PageHeader
        title="Insights"
        description="How your plan is shaping up, worked out from your own posts."
      />

      <Notice tone="info" className="mb-6">
        These insights come from your plans in this app. They are not social platform analytics: nothing here shows reach, likes or clicks.
      </Notice>

      {total === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="Nothing to analyse yet"
          description="Create a few posts and your pipeline, platform mix and posting rhythm will appear here."
          action={<Link to="/content?new=1" className="text-sm font-semibold text-brand-800 underline underline-offset-4">Create a post</Link>}
        />
      ) : (
        <div className="stagger space-y-6">
          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <li><Card as="div" className="p-4"><CountUp value={total} className="font-display text-3xl leading-none text-ink" /><p className="mt-2 text-xs font-medium text-muted">Posts in your workspace</p></Card></li>
            <li><Card as="div" className="p-4"><CountUp value={stats.planned28} className="font-display text-3xl leading-none text-ink" /><p className="mt-2 text-xs font-medium text-muted">Planned in the next 28 days</p></Card></li>
            <li><Card as="div" className="p-4"><CountUp value={stats.gap} className="font-display text-3xl leading-none text-ink" /><p className="mt-2 text-xs font-medium text-muted">Longest quiet stretch (days)</p></Card></li>
            <li><Card as="div" className="p-4"><CountUp value={stats.late.length} className="font-display text-3xl leading-none text-ink" /><p className="mt-2 text-xs font-medium text-muted">Plans past their date, not marked published</p></Card></li>
          </ul>

          <Card className="p-5 sm:p-6">
            <h2 className="text-lg font-medium text-ink">Content pipeline</h2>
            <p className="mt-1 text-sm text-muted">Where every post sits today.</p>
            <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-surface" role="img" aria-label={`Pipeline: ${POST_STATUSES.map((s) => `${stats.status[s]} ${s}`).join(', ')}`}>
              {POST_STATUSES.map((status) => (
                stats.status[status] > 0 && (
                  <span key={status} style={{ width: `${(stats.status[status] / total) * 100}%`, background: STATUS_COLOURS[status] }} />
                )
              ))}
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
              {POST_STATUSES.map((status) => (
                <li key={status} className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full" style={{ background: STATUS_COLOURS[status] }} aria-hidden="true" />
                  <Link to={`/content?status=${status}`} className="text-ink hover:underline">{status}</Link>
                  <span className="ml-auto font-medium tabular-nums text-muted">{stats.status[status]}</span>
                </li>
              ))}
            </ul>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-5 sm:p-6">
              <h2 className="text-lg font-medium text-ink">By platform</h2>
              <div className="mt-4"><BarList rows={stats.platforms} /></div>
            </Card>
            <Card className="p-5 sm:p-6">
              <h2 className="text-lg font-medium text-ink">By brand</h2>
              <div className="mt-4"><BarList rows={stats.brands} colour="var(--color-gold)" /></div>
            </Card>
          </div>

          <Card className="p-5 sm:p-6">
            <h2 className="text-lg font-medium text-ink">Next 28 days</h2>
            <p className="mt-1 text-sm text-muted">
              {stats.planned28 === 0
                ? 'Nothing is planned yet. Plan a post to see your rhythm here.'
                : `${stats.planned28} planned ${stats.planned28 === 1 ? 'post' : 'posts'}. Longest stretch with nothing planned: ${stats.gap} ${stats.gap === 1 ? 'day' : 'days'}.`}
            </p>
            <ol className="mt-4 grid grid-cols-7 gap-1.5 sm:gap-2">
              {stats.load.map((day) => (
                <li key={day.key}>
                  <Link
                    to={`/content?new=1&date=${day.key}`}
                    className="flex aspect-square flex-col items-center justify-center rounded-lg border border-line text-xs transition-colors hover:border-gold"
                    style={{ background: day.count ? `color-mix(in srgb, var(--color-brand-700) ${25 + (day.count / maxLoad) * 55}%, transparent)` : 'transparent' }}
                    aria-label={`${day.date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}: ${day.count} planned. Plan a post.`}
                  >
                    <span className="font-medium text-ink">{day.date.getDate()}</span>
                    {day.count > 0 && <span className="text-[0.65rem] font-semibold text-ink">{day.count}</span>}
                  </Link>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-muted">Select a day to plan a post for it. Today is {now.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}.</p>
          </Card>
        </div>
      )}
    </>
  )
}

export default Insights
