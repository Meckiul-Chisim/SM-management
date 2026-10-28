// Date helpers.
//
// The app stores dates exactly as the person typed them, in their own local time:
//   date      "2026-10-23"
//   date+time "2026-10-23T10:00"
// There is no time zone attached, so a planned post never shifts to another day.
// That is why these helpers build dates from their parts instead of calling
// toISOString(), which converts to UTC and can change the day.

const pad = (value) => String(value).padStart(2, '0')

// "2026-10-23" for a Date, in local time.
export function toDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// "2026-10-23T10:00" for a Date, in local time (the format <input type="datetime-local"> uses).
export function toDateTimeValue(date) {
  return `${toDateKey(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// A Date at local midnight for a "YYYY-MM-DD" key. Returns null if the key is invalid.
export function fromDateKey(key) {
  if (!isValidDateKey(key)) return null
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// A Date for a "YYYY-MM-DDTHH:mm" value, in local time. Returns null if invalid.
export function fromDateTimeValue(value) {
  if (!isValidDateTimeValue(value)) return null
  const [datePart, timePart] = value.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute] = timePart.split(':').map(Number)
  return new Date(year, month - 1, day, hour, minute)
}

// True only for real calendar dates ("2026-02-30" and "0099-01-01" are not).
export function isValidDateKey(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

export function isValidDateTimeValue(value) {
  if (typeof value !== 'string') return false
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/.exec(value)
  if (!match) return false
  return isValidDateKey(match[1]) && Number(match[2]) < 24 && Number(match[3]) < 60
}

// The date part of a date-time value ("2026-10-23T10:00" -> "2026-10-23").
export function dateKeyOf(value) {
  return typeof value === 'string' ? value.slice(0, 10) : ''
}

// A new Date n days later, keeping the local clock time (safe across daylight saving changes).
export function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days, date.getHours(), date.getMinutes())
}

export function todayKey(now = new Date()) {
  return toDateKey(now)
}

// True if a planned date-time has already passed.
export function isPast(value, now = new Date()) {
  const date = fromDateTimeValue(value)
  return date !== null && date.getTime() < now.getTime()
}

export function formatDay(key, locale, options = { month: 'short', day: 'numeric' }) {
  const date = fromDateKey(key)
  return date ? date.toLocaleDateString(locale, options) : ''
}

export function formatDateTime(value, locale) {
  const date = fromDateTimeValue(value)
  return date ? date.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' }) : ''
}

export function formatTime(value, locale) {
  const date = fromDateTimeValue(value)
  return date ? date.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' }) : ''
}
