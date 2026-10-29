import Badge from './Badge.jsx'

// One place that decides how each status looks, so the same status is the same
// colour on every page. Published means "the person marked it as published"; the
// app never publishes anything itself.
const POST_TONES = { Draft: 'neutral', Ready: 'info', Planned: 'default', Published: 'success' }
const INTERACTION_TONES = { Unread: 'info', 'Follow up': 'warning', Done: 'success' }

function StatusBadge({ status, kind = 'post' }) {
  const tones = kind === 'post' ? POST_TONES : INTERACTION_TONES
  return <Badge tone={tones[status] || 'neutral'}>{status}</Badge>
}

export default StatusBadge
