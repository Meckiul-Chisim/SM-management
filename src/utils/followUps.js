// Follow-up logic for the engagement tracker.
//
// A record is "open" until its status is Done. An open record with a follow-up
// date before today is overdue. Dates are compared as local "YYYY-MM-DD" strings,
// which sort correctly and never shift across time zones.

import { todayKey } from './dates.js'

export const isOpen = (item) => item.status !== 'Done'

export function isOverdue(item, today = todayKey()) {
  return isOpen(item) && Boolean(item.followUpDate) && item.followUpDate < today
}

export function isDueToday(item, today = todayKey()) {
  return isOpen(item) && item.followUpDate === today
}

// Overdue first, then due soonest, then open records with no date, then Done.
export function sortFollowUps(items, today = todayKey()) {
  const rank = (item) => {
    if (!isOpen(item)) return 3
    if (isOverdue(item, today)) return 0
    if (item.followUpDate) return 1
    return 2
  }
  return [...items].sort((a, b) => {
    const byRank = rank(a) - rank(b)
    if (byRank !== 0) return byRank
    return (a.followUpDate || '9999').localeCompare(b.followUpDate || '9999')
  })
}

export function countFollowUps(items, today = todayKey()) {
  return {
    open: items.filter(isOpen).length,
    overdue: items.filter((item) => isOverdue(item, today)).length,
    dueToday: items.filter((item) => isDueToday(item, today)).length,
    done: items.filter((item) => !isOpen(item)).length,
  }
}
