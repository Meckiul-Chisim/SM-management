// Month grid and date grouping for the content calendar.
//
// Everything is built from local year/month/day numbers, never from UTC, so a
// post planned for the 1st of a month always appears on the 1st.

import { dateKeyOf, toDateKey } from './dates.js'

// 0 = Sunday ... 6 = Saturday. Uses the browser's locale when it reports one, else Monday.
export function getWeekStart(locale) {
  try {
    const info = new Intl.Locale(locale || navigator.language).weekInfo
      || new Intl.Locale(locale || navigator.language).getWeekInfo?.()
    if (info?.firstDay) return info.firstDay % 7 // Intl uses 7 for Sunday
  } catch {
    // Older browsers: fall through to the default.
  }
  return 1
}

export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

// Moves a { year, month } pair by whole months, rolling over the year correctly.
export function shiftMonth({ year, month }, delta) {
  const date = new Date(year, month + delta, 1)
  return { year: date.getFullYear(), month: date.getMonth() }
}

// Rows of 7 days covering the month, including the days of neighbouring months
// needed to fill the first and last week. Each cell: { key, day, inMonth }.
export function getMonthGrid(year, month, weekStart = 1) {
  const first = new Date(year, month, 1)
  const offset = (first.getDay() - weekStart + 7) % 7
  const total = Math.ceil((offset + daysInMonth(year, month)) / 7) * 7

  const cells = []
  for (let index = 0; index < total; index += 1) {
    const date = new Date(year, month, 1 - offset + index)
    cells.push({ key: toDateKey(date), day: date.getDate(), inMonth: date.getMonth() === month })
  }

  const weeks = []
  for (let index = 0; index < cells.length; index += 7) weeks.push(cells.slice(index, index + 7))
  return weeks
}

// Names of the seven weekdays in grid order, e.g. ["Mon", ..., "Sun"].
export function getWeekdayLabels(weekStart = 1, locale, format = 'short') {
  // 2023-01-01 was a Sunday.
  return Array.from({ length: 7 }, (_, index) =>
    new Date(2023, 0, 1 + ((weekStart + index) % 7)).toLocaleDateString(locale, { weekday: format }),
  )
}

// { "2026-10-23": [post, ...] } for every post that has a planned date, earliest first.
export function groupPostsByDate(posts) {
  const groups = {}
  for (const post of posts) {
    if (!post.scheduledAt) continue
    const key = dateKeyOf(post.scheduledAt)
    ;(groups[key] ||= []).push(post)
  }
  for (const key of Object.keys(groups)) {
    groups[key].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
  }
  return groups
}
