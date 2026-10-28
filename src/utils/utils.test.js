import { describe, expect, it } from 'vitest'
import { getMonthGrid, groupPostsByDate, shiftMonth, daysInMonth, getWeekdayLabels } from './calendar.js'
import { addDays, isValidDateKey, toDateKey, fromDateKey } from './dates.js'
import { filterPosts, sortPosts } from './filters.js'
import { countFollowUps, isOverdue, sortFollowUps } from './followUps.js'

describe('dates', () => {
  it('never shifts a date across time zones', () => {
    expect(toDateKey(fromDateKey('2026-03-01'))).toBe('2026-03-01')
    expect(toDateKey(new Date(2026, 0, 1, 0, 5))).toBe('2026-01-01')
  })
  it('validates real calendar days only', () => {
    expect(isValidDateKey('2028-02-29')).toBe(true)
    expect(isValidDateKey('2027-02-29')).toBe(false)
    expect(isValidDateKey('2026-04-31')).toBe(false)
  })
  it('adds days across month ends', () => {
    expect(toDateKey(addDays(new Date(2026, 0, 31), 1))).toBe('2026-02-01')
  })
})

describe('calendar', () => {
  it('knows February in leap and common years', () => {
    expect(daysInMonth(2028, 1)).toBe(29)
    expect(daysInMonth(2027, 1)).toBe(28)
  })
  it('rolls months over year boundaries', () => {
    expect(shiftMonth({ year: 2026, month: 11 }, 1)).toEqual({ year: 2027, month: 0 })
    expect(shiftMonth({ year: 2026, month: 0 }, -1)).toEqual({ year: 2025, month: 11 })
  })
  it('builds whole weeks with the right first day', () => {
    // 1 Feb 2026 is a Sunday: a Monday-first grid starts 26 Jan and needs 5 rows.
    const grid = getMonthGrid(2026, 1, 1)
    expect(grid).toHaveLength(5)
    expect(grid[0][0].key).toBe('2026-01-26')
    expect(grid[0][6]).toMatchObject({ key: '2026-02-01', inMonth: true })
    expect(grid.flat().filter((cell) => cell.inMonth)).toHaveLength(28)
    // Sunday-first: 1 Feb is the first cell and 4 rows are enough.
    expect(getMonthGrid(2026, 1, 0)).toHaveLength(4)
    expect(getMonthGrid(2026, 1, 0)[0][0].key).toBe('2026-02-01')
    expect(getWeekdayLabels(1, 'en-US')[0]).toBe('Mon')
  })
  it('groups posts on the day they were planned', () => {
    const groups = groupPostsByDate([
      { id: 'a', scheduledAt: '2026-03-01T23:30' },
      { id: 'b', scheduledAt: '2026-03-01T08:00' },
      { id: 'c', scheduledAt: '' },
    ])
    expect(groups['2026-03-01'].map((post) => post.id)).toEqual(['b', 'a'])
    expect(Object.keys(groups)).toHaveLength(1)
  })
})

describe('post filters', () => {
  const brands = [{ id: 'b1', name: 'Northstar' }]
  const posts = [
    { id: 1, title: 'Launch', caption: 'big news', brandId: 'b1', platform: 'Instagram', status: 'Draft', scheduledAt: '', updatedAt: '1' },
    { id: 2, title: 'Tips', caption: 'ten tips', brandId: '', platform: 'LinkedIn', status: 'Planned', scheduledAt: '2026-10-25T09:00', updatedAt: '2' },
  ]
  it('searches title, text and brand name', () => {
    expect(filterPosts(posts, { search: 'BIG' }, brands)).toHaveLength(1)
    expect(filterPosts(posts, { search: 'northstar' }, brands)).toHaveLength(1)
  })
  it('combines filters, including General workspace', () => {
    expect(filterPosts(posts, { brandId: 'none' }, brands).map((p) => p.id)).toEqual([2])
    expect(filterPosts(posts, { platform: 'LinkedIn', status: 'Draft' }, brands)).toHaveLength(0)
  })
  it('lists planned posts first', () => {
    expect(sortPosts(posts)[0].id).toBe(2)
  })
})

describe('follow-ups', () => {
  const today = '2026-10-23'
  const items = [
    { id: 'done', status: 'Done', followUpDate: '2026-10-01' },
    { id: 'later', status: 'Follow up', followUpDate: '2026-10-30' },
    { id: 'late', status: 'Unread', followUpDate: '2026-10-22' },
    { id: 'nodate', status: 'Unread', followUpDate: '' },
    { id: 'now', status: 'Follow up', followUpDate: today },
  ]
  it('flags only open, past-due records as overdue', () => {
    expect(isOverdue(items[0], today)).toBe(false)
    expect(isOverdue(items[2], today)).toBe(true)
    expect(isOverdue(items[4], today)).toBe(false)
  })
  it('sorts overdue first and done last', () => {
    expect(sortFollowUps(items, today).map((item) => item.id)).toEqual(['late', 'now', 'later', 'nodate', 'done'])
  })
  it('counts', () => {
    expect(countFollowUps(items, today)).toEqual({ open: 4, overdue: 1, dueToday: 1, done: 1 })
  })
})
