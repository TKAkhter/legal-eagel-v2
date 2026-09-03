import type { AppNotification } from './types'

export const notificationsMock: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'New lead assigned',
    body: 'Sara Khan was assigned to you as a new lead.',
    type: 'info',
    isRead: false,
    createdAt: new Date(Date.now() - 20 * 60_000).toISOString(),
    link: '/leads',
  },
  {
    id: 'notif-2',
    title: 'Invoice overdue',
    body: 'Invoice INV-2041 is now 5 days overdue.',
    type: 'warning',
    isRead: false,
    createdAt: new Date(Date.now() - 3 * 3_600_000).toISOString(),
    link: '/billings',
  },
  {
    id: 'notif-3',
    title: 'Matter status updated',
    body: 'Trademark Filing #1004 moved to In Progress.',
    type: 'success',
    isRead: false,
    createdAt: new Date(Date.now() - 26 * 3_600_000).toISOString(),
    link: '/matters',
  },
  {
    id: 'notif-4',
    title: 'Sync failed',
    body: 'The nightly OneDrive sync failed for one file.',
    type: 'error',
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
    link: '/files',
  },
]
