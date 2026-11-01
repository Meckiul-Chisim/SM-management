// Planning insights, worked out only from the person's own workspace.
// These are NOT social platform analytics: nothing here knows how a post performed.

import { POST_STATUSES } from '../data/constants.js'
import { addDays, dateKeyOf, toDateKey } from './dates.js'

// { Draft: 2, Ready: 1, Planned: 3, Published: 0 }, always with every status present.
export function countByStatus(posts) {
  const counts = Object.fromEntries(POST_STATUSES.map((status) => [status, 0]))
  for (const post of posts) if (post.status in counts) counts[post.status] += 1
  return counts
}

// Sorted list of { label, count } by count (highest first), for platforms or brands.
// `labelFor` turns a post into the group name; empty names are grouped as `fallback`.
export function countBy(posts, labelFor, fallback = 'General workspace') {
  const counts = new Map()
  for (const post of posts) {
    const label = labelFor(post) || fallback
    counts.set(label, (counts.get(label) || 0) + 1)
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

// One entry per day for the next `days` days: { key, date, count } where count is
// the number of Planned posts that day.
export function upcomingLoad(posts, now = new Date(), days = 28) {
  const planned = new Map()
  for (const post of posts) {
    if (post.status !== 'Planned' || !post.scheduledAt) continue
    const key = dateKeyOf(post.scheduledAt)
    planned.set(key, (planned.get(key) || 0) + 1)
  }
  return Array.from({ length: days }, (_, index) => {
    const date = addDays(now, index)
    const key = toDateKey(date)
    return { key, date, count: planned.get(key) || 0 }
  })
}

// Longest run of days with nothing planned inside the window.
export function longestGap(load) {
  let best = 0
  let run = 0
  for (const day of load) {
    run = day.count === 0 ? run + 1 : 0
    best = Math.max(best, run)
  }
  return best
}

// Planned posts whose date has already passed and that are not yet marked Published.
export function overduePlans(posts, now = new Date()) {
  const nowValue = `${toDateKey(now)}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  return posts.filter((post) => post.status === 'Planned' && post.scheduledAt && post.scheduledAt < nowValue)
}
