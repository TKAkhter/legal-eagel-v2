import { featureFlags } from '@/lib/feature-flags'
import { httpClient } from '@/lib/api-client/http-client'
import { notificationsMock } from './mock-notifications'
import type { AppNotification } from './types'

function simulateLatency() {
  return new Promise((r) => setTimeout(r, 150 + Math.random() * 150))
}

export const notificationsApi = {
  async list(): Promise<AppNotification[]> {
    if (featureFlags.useMockData) {
      await simulateLatency()
      return [...notificationsMock].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    }
    const { data } = await httpClient.get<AppNotification[]>('/notifications')
    return data
  },

  async markRead(id: string): Promise<void> {
    if (featureFlags.useMockData) {
      await simulateLatency()
      const n = notificationsMock.find((x) => x.id === id)
      if (n) n.isRead = true
      return
    }
    await httpClient.patch(`/notifications/${id}`, { isRead: true })
  },

  async markAllRead(): Promise<void> {
    if (featureFlags.useMockData) {
      await simulateLatency()
      notificationsMock.forEach((n) => (n.isRead = true))
      return
    }
    await httpClient.post('/notifications/mark-all-read')
  },
}
