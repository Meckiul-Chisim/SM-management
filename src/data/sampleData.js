// Demonstration data shown on first visit.
//
// Every record carries isSample: true so the app can label it clearly and offer
// "Remove sample data" without touching anything the person created. The brands,
// people and messages are invented.

import { addDays, toDateKey, toDateTimeValue } from '../utils/dates.js'
import { DEFAULT_WORKSPACE_NAME } from './constants.js'

// A date-time `days` from now at the given hour, in local time.
function at(now, days, hour) {
  const date = addDays(now, days)
  date.setHours(hour, 0, 0, 0)
  return toDateTimeValue(date)
}

export function createSampleWorkspace(now = new Date()) {
  const stamp = now.toISOString()

  return {
    workspaceName: DEFAULT_WORKSPACE_NAME,
    brands: [
      {
        id: 'brand-northstar',
        name: 'Northstar Studio',
        industry: 'Creative services',
        color: '#32645f',
        accounts: [
          { platform: 'Instagram', handle: '@northstarstudio', connected: false },
          { platform: 'LinkedIn', handle: 'Northstar Studio', connected: false },
        ],
        createdAt: stamp,
        isSample: true,
      },
      {
        id: 'brand-sunday',
        name: 'Sunday Supply',
        industry: 'Lifestyle retail',
        color: '#a46f45',
        accounts: [
          { platform: 'Instagram', handle: '@sundaysupply', connected: false },
          { platform: 'Pinterest', handle: '@sundaysupply', connected: false },
        ],
        createdAt: stamp,
        isSample: true,
      },
    ],
    posts: [
      {
        id: 'post-welcome',
        title: 'A little introduction',
        caption: 'Good work starts with a clear idea. Here is a little look at what we are building, why it matters, and what is coming next.',
        brandId: 'brand-northstar',
        platform: 'Instagram',
        status: 'Draft',
        scheduledAt: '',
        createdAt: stamp,
        updatedAt: stamp,
        isSample: true,
      },
      {
        id: 'post-behind-scenes',
        title: 'Behind the scenes',
        caption: 'A small look at the people, details, and decisions behind the finished work. What part of the process would you like to see next?',
        brandId: 'brand-northstar',
        platform: 'LinkedIn',
        status: 'Planned',
        scheduledAt: at(now, 2, 10),
        createdAt: stamp,
        updatedAt: stamp,
        isSample: true,
      },
      {
        id: 'post-weekend',
        title: 'Weekend edit',
        caption: 'A few details we keep coming back to: thoughtful design, useful ideas, and making the everyday a little better.',
        brandId: 'brand-sunday',
        platform: 'Instagram',
        status: 'Ready',
        scheduledAt: '',
        createdAt: stamp,
        updatedAt: stamp,
        isSample: true,
      },
      {
        id: 'post-launch',
        title: 'Autumn collection preview',
        caption: 'The autumn collection is nearly here. Save this post to be the first to see it.',
        brandId: 'brand-sunday',
        platform: 'Pinterest',
        status: 'Published',
        scheduledAt: at(now, -3, 14),
        createdAt: stamp,
        updatedAt: stamp,
        isSample: true,
      },
    ],
    interactions: [
      {
        id: 'interaction-demo',
        person: 'Mina Patel',
        platform: 'Instagram',
        brandId: 'brand-sunday',
        message: 'Do you have this in another colour?',
        status: 'Follow up',
        followUpDate: toDateKey(addDays(now, 1)),
        notes: 'Sample record. Replace it with your own follow-up.',
        createdAt: stamp,
        isSample: true,
      },
      {
        id: 'interaction-overdue',
        person: 'Jordan Lee',
        platform: 'LinkedIn',
        brandId: 'brand-northstar',
        message: 'Could you share your pricing for a three-month content plan?',
        status: 'Unread',
        followUpDate: toDateKey(addDays(now, -1)),
        notes: '',
        createdAt: stamp,
        isSample: true,
      },
      {
        id: 'interaction-done',
        person: 'Priya Nair',
        platform: 'Pinterest',
        brandId: 'brand-sunday',
        message: 'Thanks for the quick reply about shipping.',
        status: 'Done',
        followUpDate: '',
        notes: '',
        createdAt: stamp,
        isSample: true,
      },
    ],
  }
}
